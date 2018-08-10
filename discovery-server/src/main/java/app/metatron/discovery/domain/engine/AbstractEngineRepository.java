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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Created by kyungtaak on 2017. 4. 16..
 */
public abstract class AbstractEngineRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(AbstractEngineRepository.class);

  @Autowired
  protected EngineProperties engineProperties;

  protected RestTemplate restTemplate;

  protected void setUpRestTemplate(int timeout, ResponseErrorHandler responseErrorHandler) {
    restTemplate = new RestTemplate(defaultConverters());
    restTemplate.setRequestFactory(defaultHttpFactory(timeout));
    restTemplate.setErrorHandler(responseErrorHandler);
  }

  protected List<HttpMessageConverter<?>> defaultConverters() {
    StringHttpMessageConverter stringHttpMessageConverter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
    stringHttpMessageConverter.setWriteAcceptCharset(false);

    return Lists.newArrayList(
        stringHttpMessageConverter,
        new MappingJackson2HttpMessageConverter(GlobalObjectMapper.getDefaultMapper()));
  }

  protected HttpComponentsClientHttpRequestFactory defaultHttpFactory(int timeout) {
    HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
    factory.setConnectTimeout(timeout);
    factory.setReadTimeout(timeout);

    return factory;
  }

  protected void call(String type, Map<String, Object> urlParam) {
    call(type, urlParam, String.class);
  }

  protected <T> Optional<T> call(String type, Map<String, Object> urlParam, Class<T> clazz) {
    return call(type, urlParam, null, clazz);
  }

  protected <T> Optional<T> call(String type, Map<String, Object> urlParam, Object body, Class<T> clazz) {

    EngineProperties.EngineApi engineApi = engineProperties.getApiInfoByType(type);
    if(engineApi == null) {
      throw new IllegalArgumentException("'type' parameter missing.");
    }

    // HTTP  호출
    String url = engineApi.getTargetUrl();
    HttpMethod method = engineApi.getMethod();

    HttpEntity<Object> entity = null;
    UriComponents targetUrl = makeUri(url, urlParam);
    if(method == HttpMethod.GET) {
      HttpHeaders headers = new HttpHeaders();
      headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
    } else {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      entity = new HttpEntity<>(body, headers);
    }

    return call(targetUrl.toUriString(), method, entity, clazz);
  }

  private <T> Optional<T> call(String url, HttpMethod method, HttpEntity<?> entity, Class<T> clazz) {

    LOGGER.debug("Request to engine : {}, {} > {}", method, url, entity == null ? "{}" : entity.getBody());

    ResponseEntity<T> result;
    try {
      result = restTemplate.exchange(url, method, entity, clazz);
    } catch (ResourceAccessException e) {
      LOGGER.error("Fail to access Engine : {}", e.getMessage());
      throw new EngineException("Fail to access Engine : " + e.getMessage(), e);
    } catch (Exception e) {
      LOGGER.error("Fail to process response : {}", e.getMessage());
      throw new EngineException("Fail to process response : " + e.getMessage(), e);
    }

    return Optional.ofNullable(result.getBody());
  }

  private UriComponents makeUri(String url, Map<String, Object> urlParam) {

    // URI 에 Path Parameter가 존재할 경우 체크
    List<String> pathParamKeys = PolarisUtils.findPathParams(url);
    Map<String, String> pathParam = getPathParamMap(pathParamKeys, urlParam);

    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);

    for(String key : urlParam.keySet()) {
      builder.queryParam(key, urlParam.get(key));
    }

    return builder.buildAndExpand(pathParam);
  }

  private Map<String, String> getPathParamMap(List<String> pathParamKeys, Map<String, Object> param) {
    Map<String, String> pathParam = Maps.newHashMap();

    for(String key : pathParamKeys) {
      if(param.containsKey(key)) {
        pathParam.put(key, String.valueOf(param.get(key)));
        param.remove(key);
      }
    }

    return pathParam;
  }
}
