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

import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.oauth2.provider.expression.OAuth2MethodSecurityExpressionHandler;

import app.metatron.discovery.common.oauth.BasePermissionEvaluator;

/**
 * Pre/PostAuthorize Annotation 지원용도 설정
 *
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, proxyTargetClass = true)
public class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {

  @Autowired
  private ApplicationContext applicationContext;

  /**
   * This is needed so {@link org.springframework.security.access.prepost.PreAuthorize} and so on know the role hierarchy.
   */
  @Override
  protected MethodSecurityExpressionHandler createExpressionHandler() {
    OAuth2MethodSecurityExpressionHandler handler = new OAuth2MethodSecurityExpressionHandler();
    handler.setApplicationContext(applicationContext);
//    handler.setRoleHierarchy(roleHierarchy());
    handler.setPermissionEvaluator(permissionEvaluator());

    return handler;
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public BasePermissionEvaluator permissionEvaluator() {
    return new BasePermissionEvaluator();
  }

//  @Bean
//  public RoleHierarchy roleHierarchy() {
//    RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
//    roleHierarchy.setHierarchy("ROLE_SYSTEM_ADMIN > ROLE_SYSTEM_SUPERVISOR " +
//            "ROLE_SYSTEM_SUPERVISOR > ROLE_SYSTEM_USER " +
//            "ROLE_SYSTEM_USER > ROLE_ANONYMOUS " +
//            "ROLE_WORKSPACE_ADMIN > ROLE_WORKSPACE_EDITOR " +
//            "ROLE_WORKSPACE_EDITOR > ROLE_WORKSPACE_VIEWER");
//    return roleHierarchy;
//  }
//  @Bean
//  public RoleVoter roleVoter() {
//    return new RoleHierarchyVoter(roleHierarchy());
//  }
}
