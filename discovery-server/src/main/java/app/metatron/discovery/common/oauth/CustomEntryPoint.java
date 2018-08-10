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

package app.metatron.discovery.common.oauth;

import com.google.common.collect.Lists;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.provider.error.DefaultOAuth2ExceptionRenderer;
import org.springframework.security.oauth2.provider.error.OAuth2AuthenticationEntryPoint;

import javax.annotation.PostConstruct;

public class CustomEntryPoint extends OAuth2AuthenticationEntryPoint {

  @Autowired
  public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter;

  @Autowired
  private CustomWebResponseExceptionTranslator exceptionTranslator;

  public CustomEntryPoint() {
  }

  @PostConstruct
  public void init() {
    // JSON Type 의 결과값 전달을 위해 Converter 설정
    DefaultOAuth2ExceptionRenderer renderer = new DefaultOAuth2ExceptionRenderer();
    renderer.setMessageConverters(Lists.newArrayList(mappingJackson2HttpMessageConverter));
    setExceptionRenderer(renderer);
    setExceptionTranslator(exceptionTranslator);
  }

}
