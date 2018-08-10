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

package app.metatron.discovery.config;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;

import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspacePagedResourcesAssembler;

/**
 * Custom Configuration
 * - https://github.com/spring-projects/spring-boot/issues/6529
 */
@Configuration
public class CustomRepositoryRestMvcConfiguration extends RepositoryRestMvcConfiguration {

  /**
   * Spring Data Rest 에서 사용하는 ObjectMapper 정의 (타 Framework 충돌방지를 위하여 @Primary 사용)
   *
   * Spring Data Rest 관리 외적 부분에서 json+hal 타입의 정보 처리시,
   * HypermediaSupportBeanDefinitionRegistrar 에서 TypeConstrainedMappingJackson2HttpMessageConverter 추가하게 되는데
   * 이때 _halObjectMapper 라는 이름으로 ObjectMapper 를 로드하게 되어 동일한 ObjectMapper 영향권을 위해 name 처리 추가
   *
   * @return
   */
  @Override
  @Bean(name = {"objectMapper", "_halObjectMapper"})
  @Primary
  public ObjectMapper objectMapper() {
    return super.objectMapper();
  }

  @Bean
  public WorkspacePagedResourcesAssembler<Workspace> workspacePagedResourcesAssembler() {
    return new WorkspacePagedResourcesAssembler<>(super.pageableResolver(), null);
  }

}
