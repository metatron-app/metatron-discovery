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

import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import com.google.common.collect.Maps;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResponseErrorHandler;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static app.metatron.discovery.domain.engine.EngineProperties.*;

/**
 * Created by kyungtaak on 2016. 8. 22..
 */
@Component
public class DruidEngineRepository extends AbstractEngineRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(DruidEngineRepository.class);

  private static final String HEALTH_CHECK = "/status/health";
  private static final String PROPERTIES_CHECK = "/status/properties";

  @Value("${polaris.engine.timeout.query:1200000}")
  Integer timeout;

  public DruidEngineRepository() {
  }

  @PostConstruct
  public void setUp() {
    setUpRestTemplate(timeout, new QueryResponseErrorHandler());
  }

  public Optional<List> meta(Map<String, Object> paramMap) {
    return call(GET_DATASOURCE_LIST, paramMap, List.class);
  }

  public <T> Optional<T> load(String spec, Map<String, Object> paramMap, Class<T> clazz) {
    return call(BULK_LOAD, paramMap, spec, clazz);
  }

  public <T> Optional<T> ingestion(String spec, Class<T> clazz) {
    return call(INGESTION_DATASOUCE, Maps.newHashMap(), spec, clazz);
  }

  public <T> Optional<T> supervisorIngestion(String spec, Class<T> clazz) {
    return call(SUPERVISOR_INGESTION, Maps.newHashMap(), spec, clazz);
  }

  public <T> Optional<T> query(String spec, Class<T> clazz) {
    return call(SEARCH_QUERY, Maps.newHashMap(), spec, clazz);
  }

  public <T> Optional<T> sql(String spec, Class<T> clazz) {
    return call(SQL_QUERY, Maps.newHashMap(), spec, clazz);
  }

  public <T> Optional<T> health(String url, Class<T> clazz) {
    return callByUrl(url + HEALTH_CHECK, HttpMethod.GET, Maps.newHashMap(), null, clazz);
  }

  public <T> Optional<T> properties(String url, Class<T> clazz) {
    return callByUrl(url + PROPERTIES_CHECK, HttpMethod.GET, Maps.newHashMap(), null, clazz);
  }

  public Optional<List> getHistoricalNodes() {
    Map paramMap = Maps.newHashMap();
    paramMap.put("simple", null);
    return call(GET_HISTORICAL_NODE, paramMap, List.class);
  }

  public Optional<List> getMiddleManagerNodes(){
    return call(GET_MIDDLEMGMT_NODE, Maps.newHashMap(), List.class);
  }

  public <T> Optional<T> getConfigs(Map<String, Object> paramMap, Class<T> clazz){
    return call(GET_CONFIGS, paramMap, clazz);
  }

  public Optional<List> getDatasourceListIncludeDisabled(){
    Map paramMap = Maps.newHashMap();
    paramMap.put("includeDisabled", null);
    return call(GET_DATASOURCE_META, paramMap, List.class);
  }

  public Optional<Map> getDatasourceLoadStatus(){
    return call(GET_DATASOURCE_LOAD_STATUS, Maps.newHashMap(), Map.class);
  }

  public Optional<Map> getDatasourceRules(){
    return call(GET_DATASOURCE_RULES, Maps.newHashMap(), Map.class);
  }

  public Optional<Map> getDatasourceStatus(String datasourceId){
    Map paramMap = Maps.newHashMap();
    paramMap.put("datasourceId", datasourceId);
    return call(GET_DATASOURCE_STATUS, paramMap, Map.class);
  }

  public Optional<List> getDatasourceRule(String datasourceId){
    Map paramMap = Maps.newHashMap();
    paramMap.put("datasourceId", datasourceId);
    return call(GET_DATASOURCE_RULE, paramMap, List.class);
  }

  public void setDatasourceRule(String datasourceId, List retention){
    Map paramMap = Maps.newHashMap();
    paramMap.put("datasourceId", datasourceId);
    call(SET_DATASOURCE_RULE, paramMap, retention, String.class);
  }

  public Optional<Map> getDatasourceIntervals(String datasourceId){
    Map paramMap = Maps.newHashMap();
    paramMap.put("simple", null);
    paramMap.put("datasourceId", datasourceId);
    return call(GET_DATASOURCE_INTERVAL_LIST, paramMap, Map.class);
  }

  public Optional<Map> getDatasourceIntervalStatus(String datasourceId, String interval){
    Map paramMap = Maps.newHashMap();
    paramMap.put("full", null);
    paramMap.put("datasourceId", datasourceId);
    paramMap.put("interval", interval);
    return call(GET_DATASOURCE_INTERVALS_STATUS, paramMap, Map.class);
  }

  public Optional<List> getRunningIds() {
    return call(GET_RUNNING_IDS, Maps.newHashMap(),List.class);
  }

  public Optional<List> sql(String sql) {
    Map paramMap = Maps.newHashMap();
    paramMap.put("query", sql);
    return call(SQL, Maps.newHashMap(), paramMap, List.class);
  }

  public Optional<List> getPendingTasks() {
    return call(GET_PENDING_TASKS, Maps.newHashMap(), List.class);
  }

  public Optional<List> getRunningTasks() {
    return call(GET_RUNNING_TASKS, Maps.newHashMap(), List.class);
  }

  public Optional<List> getWaitingTasks() {
    return call(GET_WAITING_TASKS, Maps.newHashMap(), List.class);
  }

  public Optional<List> getCompleteTasks() {
    return call(GET_COMPLETE_TASKS, Maps.newHashMap(), List.class);
  }

  public Optional<List> getSupervisorList() {
    Map paramMap = Maps.newHashMap();
    paramMap.put("full", null);
    return call(GET_SUPERVISOR_LIST, paramMap, List.class);
  }

  private class QueryResponseErrorHandler implements ResponseErrorHandler {

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
      if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.NO_CONTENT) {
        return false;
      }

      return true;
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
      throw new QueryTimeExcetpion(String.valueOf(IOUtils.readLines(response.getBody())));
    }
  }
}
