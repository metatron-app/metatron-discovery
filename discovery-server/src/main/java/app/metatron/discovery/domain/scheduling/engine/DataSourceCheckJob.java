/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.scheduling.engine;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.query.druid.meta.AnalysisType;

import static app.metatron.discovery.domain.datasource.DataSource.Status.DISABLED;
import static app.metatron.discovery.domain.datasource.DataSource.Status.ENABLED;
import static app.metatron.discovery.domain.datasource.DataSource.Status.FAILED;
import static app.metatron.discovery.domain.datasource.DataSource.Status.PREPARING;


/**
 * Created by kyungtaak on 2016. 6. 20..
 */
@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
@DisallowConcurrentExecution
public class DataSourceCheckJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceCheckJob.class);

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  EngineQueryService queryService;

  @Autowired
  DruidEngineMetaRepository metaRepository;

  @Autowired
  DruidEngineRepository engineRepository;

  public DataSourceCheckJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking datasource.");

    int pageNum = 0;
    int size = 100;

    PageRequest pageRequest = null;
    Page<DataSource> page = null;
    do {
      pageRequest = new PageRequest(pageNum, size);
      page = dataSourceRepository.findByDataSourceForCheck(pageRequest);

      for (DataSource ds : page) {
        // Skip partitioned data sources.
        if(StringUtils.isNotEmpty(ds.getPartitionKeys())) {
          continue;
        }

        if(ds.getStatus() == FAILED && BooleanUtils.isNotTrue(ds.getFailOnEngine())) {
          continue;
        }

        LOGGER.debug("Start to check '{}' datasource.", ds.getName());
        try {
          setSizeAndStatus(ds);
        } catch (ResourceAccessException e) {
          LOGGER.warn("Engine connection refused.");
          throw new DataSourceCheckException("Fail to check status of engine, Http status code : " + e.getMessage());
        }
        LOGGER.debug("End to check '{}' datasource.", ds.getName());
      }

      pageNum++;

    } while (page.hasNext());

    LOGGER.info("## End batch job for checking datasource.");
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void setSizeAndStatus(DataSource dataSource) {

    SegmentMetaDataResponse segmentMetaData = null;
    try {
      segmentMetaData = queryService.segmentMetadata(dataSource.getEngineName(),
                                   AnalysisType.CARDINALITY, AnalysisType.SERIALIZED_SIZE,
                                   AnalysisType.INTERVAL, AnalysisType.INGESTED_NUMROW,
                                   AnalysisType.LAST_ACCESS_TIME, AnalysisType.ROLLUP);
    } catch (Exception e) {
      LOGGER.warn("Fail to check datasource({}) : {}", dataSource.getEngineName(), e.getMessage());
      if(dataSource.getStatus() != PREPARING) {
        LOGGER.debug("Mark datasource({}) status : {} -> {}", dataSource.getEngineName(), dataSource.getStatus(), DISABLED);
        dataSource.setStatus(DISABLED);
        dataSourceRepository.save(dataSource);
      }
      return;
    }

    if(dataSource.getStatus() != ENABLED) {
      LOGGER.debug("Mark datasource({}) status : {} -> {}", dataSource.getEngineName(), dataSource.getStatus(), ENABLED);
      dataSource.setStatus(ENABLED);
    }

    List<String> matchingFields = filterMatchingFields(segmentMetaData.getColumns());
    boolean matched = dataSource.isFieldMatchedByNames(matchingFields);
    dataSource.setFieldsMatched(matched);

    DataSourceSummary summary = dataSource.getSummary();
    if(summary == null) {
      summary = new DataSourceSummary();
      dataSource.setSummary(summary);
    }
    summary.updateSummary(segmentMetaData);

    if (BooleanUtils.isTrue(dataSource.getIncludeGeo())) {
      List<Field> geoFields = dataSource.getGeoFields();

      Map<String, Object> result = queryService.geoBoundary(dataSource.getEngineName(), geoFields);
      summary.updateGeoCorner(result);
    }

    dataSourceRepository.save(dataSource);
  }

  private List<String> filterMatchingFields(Map<String, SegmentMetaDataResponse.ColumnInfo> columns) {

    return columns.entrySet().stream()
        .filter(entry -> ((entry.getKey().equals("__time") || entry.getKey().equals("count")) == false))
        .map(entry -> entry.getKey())
        .collect(Collectors.toList());
  }

  private class EngineResponseErrorHandler implements ResponseErrorHandler {

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
      if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.NO_CONTENT) {
        return false;
      }

      return true;
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
      throw new DataSourceCheckException("Fail to check status of engine, Http status code : " + response.getStatusText());
    }
  }
}
