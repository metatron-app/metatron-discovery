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

package app.metatron.discovery.domain.notebook.connector;

import com.google.common.collect.Lists;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Optional;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.engine.EngineException;
import app.metatron.discovery.domain.notebook.NotebookErrorCodes;
import app.metatron.discovery.domain.notebook.NotebookException;

/**
 * Created by kyungtaak on 2016. 8. 22..
 */
@Component
public class HttpRepository implements HttpRepositoryAction {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpRepository.class);

    RestTemplate restTemplate;

    public HttpRepository() {
    }

    /**
     * RestTemplate (long)
     */
    @PostConstruct
    public void setUp() {
        restTemplate = new RestTemplate(getHttpMessageConverters());
        restTemplate.setRequestFactory(getHttpComponentsClientHttpRequestFactory());
        restTemplate.setErrorHandler(new HttpResponseErrorHandler());
    }

    /**
     * RestTemplate (transient)
     */
    private RestTemplate getRestTemplate() {
        RestTemplate restTemplate = new RestTemplate(getHttpMessageConverters());
        restTemplate.setRequestFactory(getHttpComponentsClientHttpRequestFactory());
        restTemplate.setErrorHandler(new HttpResponseErrorHandler());

        return restTemplate;
    }

    /**
     * REST call
     *
     * @param url
     * @param method
     * @param entity
     * @param clazz
     * @param isTransient
     * @param <T>
     * @return
     */
    @Override
    public <T> Optional<T> call(String url, HttpMethod method, HttpEntity<?> entity, Class<T> clazz, boolean isTransient) {

        ResponseEntity<T> result;
        try {
            if(isTransient) {
                result = this.getRestTemplate().exchange(url, method, entity, clazz);
            } else {
                result = restTemplate.exchange(url, method, entity, clazz);
            }
        } catch (ResourceAccessException e) {
            LOGGER.error("Fail to access Engine : {}", e.getMessage());
            throw new EngineException(e.getMessage());
        }

        return Optional.ofNullable(result.getBody());
    }

    @Override
    public <T> Optional<T> call(String url, HttpMethod method, HttpEntity<?> entity, Class<T> clazz) {
        return this.call(url, method, entity, clazz, false);
    }

    /**
     * get HttpMessageConverter
     *
     * @return
     */
    private List<HttpMessageConverter<?>> getHttpMessageConverters() {
        StringHttpMessageConverter stringHttpMessageConverter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
        stringHttpMessageConverter.setWriteAcceptCharset(false);

        return Lists.newArrayList(
                stringHttpMessageConverter,
                new MappingJackson2HttpMessageConverter(GlobalObjectMapper.getDefaultMapper())
        );
    }

    /**
     * get HttpComponentsClientHttpRequestFactory
     *
     * @return
     */
    private HttpComponentsClientHttpRequestFactory getHttpComponentsClientHttpRequestFactory() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(1 * 60 * 1000);
        factory.setReadTimeout(1 * 60 * 1000);

        return factory;
    }

    /**
     * REST call error handler
     */
    private class HttpResponseErrorHandler implements ResponseErrorHandler {

        @Override
        public boolean hasError(ClientHttpResponse response) throws IOException {
            if (response.getStatusCode() == HttpStatus.OK
                    || response.getStatusCode() == HttpStatus.CREATED
                    || response.getStatusCode() == HttpStatus.NO_CONTENT) {
                return false;
            }
            return true;
        }

        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
            LOGGER.error(IOUtils.readLines(response.getBody()).toString());
            throw new NotebookException(NotebookErrorCodes.CONNECTION_ERROR_CODE, "Fail to call : notebook server connection");
        }
    }
}
