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

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Interval;
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

import static app.metatron.discovery.domain.datasource.DataSource.Status.*;


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
  DruidEngineMetaRepository metaRepository;

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
        // 파티션된 데이터 소스인 경우 PASS.
        if(StringUtils.isNotEmpty(ds.getPartitionKeys())) {
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

    Map<String, Object> result;
    try {
      result = metaRepository.getSegmentMetaData(dataSource.getEngineName(),"SERIALIZED_SIZE",
                                                 "INTERVAL",
                                                 "INGESTED_NUMROW",
                                                 "LAST_ACCESS_TIME");
    } catch (Exception e) {
      LOGGER.warn("Fail to check datasource({}) : {}", dataSource.getEngineName(), e.getMessage());
      if(dataSource.getStatus() != PREPARING) {
        LOGGER.debug("Mark datasource({}) status : {} -> {}", dataSource.getEngineName(), dataSource.getStatus(), DISABLED);
        dataSource.setStatus(DISABLED);
        dataSourceRepository.save(dataSource);
      }
      return;
    }

    if(result.isEmpty()) {
      LOGGER.warn("Datasource({}) not found yet.", dataSource.getEngineName());
      if(dataSource.getStatus() != PREPARING) {
        LOGGER.debug("Mark datasource({}) status : {} -> {}", dataSource.getEngineName(), dataSource.getStatus(), DISABLED);
        dataSource.setStatus(DISABLED);
        dataSourceRepository.save(dataSource);
      }
      return;
    }

    LOGGER.debug("Mark datasource({}) status : {} -> {}", dataSource.getEngineName(), dataSource.getStatus(), ENABLED);
    dataSource.setStatus(ENABLED);

    List<String> matchingFields = filterMatchingFields(result);
    boolean matched = dataSource.isFieldMatchedByNames(matchingFields);
    dataSource.setFieldsMatched(matched);

    DataSourceSummary summary = dataSource.getSummary();
    if(summary == null) {
      summary = new DataSourceSummary();
      dataSource.setSummary(summary);
    }

    if(result.containsKey("serializedSize")) {
      summary.setSize(
          result.get("serializedSize") == null ? 0L : ((Number) result.get("serializedSize")).longValue()
      );
    }

    if(result.containsKey("numRows")) {
      summary.setCount(
          result.get("numRows") == null ? 0L : ((Number) result.get("numRows")).longValue()
      );
    }

    if(result.containsKey("lastAccessTime")) {
      long lastAccessMils = result.get("lastAccessTime") == null ? 0L : ((Number) result.get("lastAccessTime")).longValue();
      summary.setLastAccessTime(new DateTime(lastAccessMils));
    }

    try {
      Interval interval = Interval.parse((String) ((List) result.get("intervals")).get(0));
      summary.setIngestionMinTime(interval.getStart());
      summary.setIngestionMaxTime(interval.getEnd());
    } catch (Exception e) {
      LOGGER.warn("Fail to check interval : {}", e.getMessage());
    }

    dataSourceRepository.save(dataSource);
  }

  private List<String> filterMatchingFields(Map<String, Object> result) {
    final Map<String, Object> columns = (Map<String, Object>)result.get("columns");

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
