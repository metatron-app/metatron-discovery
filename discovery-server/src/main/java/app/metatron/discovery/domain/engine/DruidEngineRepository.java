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
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.annotation.PostConstruct;

import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;

import static app.metatron.discovery.domain.engine.EngineProperties.BULK_LOAD;
import static app.metatron.discovery.domain.engine.EngineProperties.GET_DATASOURCE_LIST;
import static app.metatron.discovery.domain.engine.EngineProperties.INGESTION_DATASOUCE;
import static app.metatron.discovery.domain.engine.EngineProperties.SEARCH_QUERY;
import static app.metatron.discovery.domain.engine.EngineProperties.SUPERVISOR_INGESTION;

/**
 * Created by kyungtaak on 2016. 8. 22..
 */
@Component
public class DruidEngineRepository extends AbstractEngineRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(DruidEngineRepository.class);

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

//  public <T> Optional<T> query(String queryStr, Class<T> clazz) {
//
//    // Request 정보 작성
//    HttpHeaders headers = new HttpHeaders();
//    headers.setContentType(MediaType.APPLICATION_JSON);
//    HttpEntity<String> entity = new HttpEntity<>(queryStr, headers);
//
//    // HTTP  호출
//    ResponseEntity<T> result;
//    try {
//      result = restTemplate.exchange(queryUrl, HttpMethod.POST, entity, clazz);
//    } catch (ResourceAccessException e) {
//      LOGGER.error("Fail to access Engine : {}", e.getMessage());
//      throw new EngineException(e.getMessage());
//    }
//
//    return Optional.ofNullable(result.getBody());
//
//  }

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
