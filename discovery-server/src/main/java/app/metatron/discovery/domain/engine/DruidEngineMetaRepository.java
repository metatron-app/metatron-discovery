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

package app.metatron.discovery.domain.engine;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResponseErrorHandler;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.engine.model.IngestionStatusResponse;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.queries.SegmentMetaDataQuery;

import static app.metatron.discovery.domain.engine.EngineProperties.*;

/**
 * Created by kyungtaak on 2016. 11. 20..
 */
@Component
public class DruidEngineMetaRepository extends AbstractEngineRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(DruidEngineRepository.class);

  @Value("${polaris.engine.timeout.meta:15000}")
  Integer timeout;

  public DruidEngineMetaRepository() {
  }

  @PostConstruct
  public void setUp() {
    setUpRestTemplate(timeout, new MetaResponseErrorHandler());
  }

  public void progressLoad(String queryId) {

    Map<String, Object> params = Maps.newHashMap();
    params.put("queryId", queryId);

    call(GET_PROGRESS, params);
  }

  public void deleteLoadDataSource(String datasourceName) {

    Map<String, Object> params = Maps.newHashMap();
    params.put("datasourceName", datasourceName);

    call(DELETE_LOAD_DATASOURCE, params);
  }

  public List<String> findLoadDataSources() {
    return call(GET_LOAD_DATASOURCE_LIST, Maps.newHashMap(), List.class)
        .orElse(Lists.newArrayList());
  }

  public String findLoadDataSourceInfo(String datasourceName) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("datasourceName", datasourceName);

    return call(GET_LOAD_DATASOURCE, params, String.class)
        .orElse("");
  }

  public void cancelQuery(String queryId) {

    Map<String, Object> params = Maps.newHashMap();
    params.put("queryId", queryId);

    call(CANCEL_QUERY, params);
  }

  public void disableDataSource(String dataSourceId) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("datasourceId", dataSourceId);

    call(DISABLE_DATASOURCE, params);
  }

  public void purgeDataSource(String dataSourceId) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("datasourceId", dataSourceId);

    call(PURGE_DATASOURCE, params);
  }

  public Map<String, Object> getSegmentMetaData(String dataSourceName, String... analyzeTypes) {

    Query query = SegmentMetaDataQuery.builder(new DefaultDataSource(dataSourceName))
                                      .types(analyzeTypes)
                                      .merge(true)
                                      .build();

    LOGGER.debug(GlobalObjectMapper.writeValueAsString(query));

    List results = call(SEARCH_QUERY, Maps.newHashMap(), query, List.class)
        .orElse(Lists.newArrayList());

    Map<String, Object> resultMap = Maps.newHashMap();
    if (results.size() > 0) {
      resultMap = (Map<String, Object>) results.get(0);
    }

    return resultMap;

  }

  public List<String> getAllDataSourceNames() {

    return call(GET_DATASOURCE_LIST, Maps.newHashMap(), List.class)
        .orElse(Lists.newArrayList());

  }

  public Optional<IngestionStatusResponse> getIngestionStatus(String taskId) {
    Map<String, Object> param = Maps.newHashMap();
    param.put("taskId", taskId);

    return call(GET_INGESTION_STATUS, param, IngestionStatusResponse.class);

  }

  public Optional<String> getIngestionTaskLog(String taskId, Integer offset) {
    Map<String, Object> param = Maps.newHashMap();
    param.put("taskId", taskId);

    if (offset != null) {
      param.put("offset", offset);
    }

    return call(GET_INGESTION_LOG, param, String.class);
  }

  public Optional<Map> getSupervisorIngestionStatus(String taskId) {
    Map<String, Object> param = Maps.newHashMap();
    param.put("taskId", taskId);

    return call(GET_SUPERVISOR_STATUS, param, Map.class);

  }

  public void shutDownSupervisorIngestionTask(String taskId) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("taskId", taskId);

    call(SHUTDOWN_SUPERVISOR, params);
  }

  public void resetSupervisorIngestionTask(String taskId) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("taskId", taskId);

    call(RESET_SUPERVISOR, params);
  }

  public void shutDownIngestionTask(String taskId) {
    Map<String, Object> params = Maps.newHashMap();
    params.put("taskId", taskId);

    call(SHUTDOWN_INGESTION, params);
  }

  public Optional<String> dedicatedWorker() {
    Optional<List> result = call(GET_WORKER_STATUS, Maps.newHashMap(), List.class);

    if (!result.isPresent()) {
      return Optional.empty();
    }

    // Worker 별 적재 가능 량 체크
    Map<String, Integer> capacityOfWorker = Maps.newHashMap();
    for (Object o : result.get()) {
      Map<String, Object> workerStatus = (Map<String, Object>) o;
      if (!workerStatus.containsKey("worker") && !workerStatus.containsKey("currCapacityUsed")) {
        continue;
      }

      Map<String, Object> worker = (Map<String, Object>) workerStatus.get("worker");
      if (!worker.containsKey("host") && !worker.containsKey("capacity")) {
        continue;
      }

      String hostname = String.valueOf(worker.get("host"));
      int capacity = (int) worker.get("capacity");
      int currCapacityUsed = (int) workerStatus.get("currCapacityUsed");

      capacityOfWorker.put(hostname, capacity - currCapacityUsed);
    }

    if (capacityOfWorker.isEmpty()) {
      return Optional.empty();
    }

    // 많은 순으로 정렬
    LinkedHashMap<String, Integer> resultMap = Maps.newLinkedHashMap();
    capacityOfWorker.entrySet().stream()
                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .forEachOrdered(x -> resultMap.put(x.getKey(), x.getValue()));

    LOGGER.debug("Druid Workers : {}", resultMap);

    // 첫번째 Woker Host 전달
    return Optional.ofNullable(resultMap.keySet().iterator().next());
  }


  private class MetaResponseErrorHandler implements ResponseErrorHandler {

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
      if (response.getStatusCode() == HttpStatus.OK
          || response.getStatusCode() == HttpStatus.NO_CONTENT
          || response.getStatusCode() == HttpStatus.ACCEPTED) {
        return false;
      }

      return true;
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
      throw new EngineException(String.valueOf(IOUtils.readLines(response.getBody())));
    }
  }

}
