/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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

package app.metatron.discovery.domain.datasource;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSourceTemporary.ID_PREFIX;

/**
 * Created by kyungtaak on 2017. 5. 12..
 */
@Component
@Transactional
public class DataSourceService {

  private static Logger LOGGER = LoggerFactory.getLogger(DataSourceService.class);

  @Autowired
  EngineQueryService queryService;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engin 내 데이터 소스 지정
   */
  public DataSource importEngineDataSource(String engineName, DataSource reqDataSource) {

    SegmentMetaDataResponse segmentMetaData = queryService.segmentMetadata(engineName);

    DataSource dataSource = new DataSource();
    dataSource.setName(StringUtils.isEmpty(reqDataSource.getName()) ? engineName : reqDataSource.getName());
    dataSource.setDescription(reqDataSource.getDescription());
    dataSource.setEngineName(engineName);
    dataSource.setSrcType(DataSource.SourceType.IMPORT);
    dataSource.setConnType(DataSource.ConnectionType.ENGINE);
    dataSource.setDsType(DataSource.DataSourceType.MASTER);
    dataSource.setSegGranularity(reqDataSource.getSegGranularity() == null ? DataSource.GranularityType.DAY : reqDataSource.getSegGranularity());
    dataSource.setGranularity(reqDataSource.getGranularity() == null ? DataSource.GranularityType.NONE : reqDataSource.getGranularity());
    dataSource.setStatus(DataSource.Status.ENABLED);
    dataSource.setFields(segmentMetaData.getConvertedField(reqDataSource.getFields()));

    return dataSourceRepository.saveAndFlush(dataSource);
  }

  public void setDataSourceStatus(String datasourceId, DataSource.Status status, DataSourceSummary summary, Boolean failOnEngine) {
    DataSource dataSource = dataSourceRepository.findOne(datasourceId);
    dataSource.setStatus(status);
    dataSource.setFailOnEngine(failOnEngine);
    dataSource.setSummary(summary);
  }

  @Transactional(readOnly = true)
  public List<DataSourceTemporary> getMatchedTemporaries(String dataSourceId, List<Filter> filters) {

    List<DataSourceTemporary> matchedTempories = Lists.newArrayList();
    List<DataSourceTemporary> temporaries = temporaryRepository.findByDataSourceIdOrderByModifiedTimeDesc(dataSourceId);

    for (DataSourceTemporary temporary : temporaries) {
      List<Filter> originalFilters = temporary.getFilterList();
      // Filter 설정을 비교대상 모두 하지 않은 경우, matched
      if (CollectionUtils.isEmpty(originalFilters) == CollectionUtils.isEmpty(filters)) {
        matchedTempories.add(temporary);
        continue;
      }

      // Filter 설정이 둘중 한쪽이 없는 경우, pass
      if (!(CollectionUtils.isNotEmpty(originalFilters) == CollectionUtils.isNotEmpty(filters))) {
        continue;
      }

      // Filter 개수가 다른 경우, pass
      if (!(originalFilters.size() == filters.size())) {
        continue;
      }

      boolean compareResult = true;
      for (int i = 0; originalFilters.size() > 0; i++) {
        Filter originalFilter = originalFilters.get(i);
        Filter reqFilter = filters.get(i);

        if (!originalFilter.compare(reqFilter)) {
          compareResult = false;
          break;
        }
      }

      if (compareResult) {
        matchedTempories.add(temporary);
      }

    }

    return matchedTempories;
  }

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engin 내 데이터 소스 지정
   */
  @Transactional(readOnly = true)
  public List<String> findImportAvailableEngineDataSource() {

    List<String> engineDataSourceNames = engineMetaRepository.getAllDataSourceNames();
    List<String> mappedEngineNames = dataSourceRepository.findEngineNameByAll();

    for (String mappedEngineName : mappedEngineNames) {
      engineDataSourceNames.remove(mappedEngineName);
    }

    return engineDataSourceNames;
  }

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engine 내 데이터 소스 지정
   */
  @Transactional(readOnly = true)
  public String convertName(String name) {

    String tempName = PolarisUtils.convertDataSourceName(name);

    StringBuilder newName = new StringBuilder();
    newName.append(tempName);

    List<DataSource> dataSources = dataSourceRepository.findByEngineNameStartingWith(tempName);
    if (CollectionUtils.isNotEmpty(dataSources)) {
      newName.append("_").append(dataSources.size());
    }

    return newName.toString();
  }

  /**
   * 데이터 소스 상세 조회 (임시 데이터 소스도 함께 조회 가능)
   */
  @Transactional(readOnly = true)
  public DataSource findDataSourceIncludeTemporary(String dataSourceId, Boolean includeUnloadedField) {

    DataSource dataSource;
    if (dataSourceId.indexOf(ID_PREFIX) == 0) {
      LOGGER.debug("Find temporary datasource : {}" + dataSourceId);

      DataSourceTemporary temporary = temporaryRepository.findOne(dataSourceId);
      if (temporary == null) {
        throw new ResourceNotFoundException(dataSourceId);
      }

      dataSource = dataSourceRepository.findOne(temporary.getDataSourceId());
      if (dataSource == null) {
        throw new DataSourceTemporaryException(DataSourceErrorCodes.VOLATILITY_NOT_FOUND_CODE,
                                               "Not found related datasource :" + temporary.getDataSourceId());
      }

      dataSource.setEngineName(temporary.getName());
      dataSource.setTemporary(temporary);

    } else {
      dataSource = dataSourceRepository.findOne(dataSourceId);
      if (dataSource == null) {
        throw new ResourceNotFoundException(dataSourceId);
      }
    }

    if (BooleanUtils.isNotTrue(includeUnloadedField)) {
      dataSource.excludeUnloadedField();
    }

    return dataSource;
  }

  /**
   * 데이터 소스 다건 상세 조회 (임시 데이터 소스도 함께 조회 가능)
   */
  @Transactional(readOnly = true)
  public List<DataSource> findMultipleDataSourceIncludeTemporary(List<String> dataSourceIds, Boolean includeUnloadedField) {

    List<String> temporaryIds = dataSourceIds.stream()
                                             .filter(s -> s.indexOf(ID_PREFIX) == 0)
                                             .collect(Collectors.toList());
    List<String> multipleIds = dataSourceIds.stream()
                                            .filter(s -> s.indexOf(ID_PREFIX) != 0)
                                            .collect(Collectors.toList());

    List<DataSource> dataSources = dataSourceRepository.findByDataSourceMultipleIds(multipleIds);

    for (String temporaryId : temporaryIds) {
      dataSources.add(findDataSourceIncludeTemporary(temporaryId, includeUnloadedField));
    }

    return dataSources;
  }


}
