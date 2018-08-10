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

package app.metatron.discovery.config.security;

import com.google.common.collect.ImmutableList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.SecurityExpressionHandler;
import org.springframework.security.access.expression.SecurityExpressionOperations;
import org.springframework.security.config.BeanIds;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler;
import org.springframework.security.web.access.expression.WebSecurityExpressionRoot;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import app.metatron.discovery.common.oauth.BasePermissionEvaluator;
import app.metatron.discovery.common.oauth.CustomDaoAuthenticationProvider;
import app.metatron.discovery.common.oauth.CustomUserStatusChecker;


/**
 * Created by kyungtaak on 2016. 5. 2..
 */
public class WebSecurityDefaultConfiguration extends WebSecurityConfigurerAdapter {

  @Autowired
  @Qualifier(value = BeanIds.USER_DETAILS_SERVICE)
  UserDetailsService userDetailsService;

  @Autowired
  BasePermissionEvaluator basePermissionEvaluator;

  @Autowired
  MessageSource messageSource;

  @Value("${polaris.password-encoder:}")
  private String passwordEncoderType;

  @Override
  public void configure(WebSecurity web) throws Exception {
    // @formatter:off
    web
      .expressionHandler(
          new DefaultWebSecurityExpressionHandler() {
            @Override
            protected SecurityExpressionOperations createSecurityExpressionRoot(Authentication authentication, FilterInvocation fi) {
              WebSecurityExpressionRoot root = (WebSecurityExpressionRoot) super.createSecurityExpressionRoot(authentication, fi);
              root.setPermissionEvaluator(basePermissionEvaluator);
              root.setDefaultRolePrefix(""); //remove the prefix ROLE_
              setDefaultRolePrefix("");
              return root;
            }
          })
      .ignoring()
        .antMatchers(HttpMethod.OPTIONS)
        .antMatchers("/"
                    , "/favicon.ico"
                    , "/app/v2/**"
                    , "/console/**"
                    , "/api/browser/**"
                    , "/admin/**");
    // @formatter:on
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    switch(passwordEncoderType){
      case "bcrypt":
        return new BCryptPasswordEncoder();
      default:
        return NoOpPasswordEncoder.getInstance();
    }
  }

  @Override
  @Autowired // <-- This is crucial otherwise Spring Boot creates its own
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
  }

  private SecurityExpressionHandler<FilterInvocation> webExpressionHandler() {
    DefaultWebSecurityExpressionHandler defaultWebSecurityExpressionHandler = new DefaultWebSecurityExpressionHandler();
    defaultWebSecurityExpressionHandler.setPermissionEvaluator(basePermissionEvaluator);
    defaultWebSecurityExpressionHandler.setDefaultRolePrefix("");
    return defaultWebSecurityExpressionHandler;
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {

    // @formatter:off
    http.cors() // if Spring MVC is on classpath and no CorsConfigurationSource is provided,  Spring Security will use CORS configuration provided to Spring MVC
      .and()
      .authenticationProvider(customAuthProvider())
      .csrf()
        .ignoringAntMatchers("/stomp/**")
        .requireCsrfProtectionMatcher(new AntPathRequestMatcher("/oauth/authorize"))
        .disable()
      .headers()
        .frameOptions().disable()
      .and()
        .authorizeRequests()
        .expressionHandler(webExpressionHandler())
        .antMatchers("/oauth/token").permitAll()
        .anyRequest().authenticated()
      .and()
        .exceptionHandling()
        // TODO: 예외 처리 방식은 추후 정리
        .accessDeniedPage("/station.login.jsp?authorization_error=true");
    // @formatter:on

    http.headers().frameOptions().disable();
    http.authorizeRequests().anyRequest().permitAll();

  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    final CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(ImmutableList.of("*"));
    configuration.setAllowedMethods(ImmutableList.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setAllowedHeaders(ImmutableList.of("*"));
    configuration.setExposedHeaders(ImmutableList.of("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers", "Access-Control-Max-Age",
                                                     "Access-Control-Request-Headers", "Access-Control-Request-Method"));
    final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public CustomDaoAuthenticationProvider customAuthProvider() {
    CustomDaoAuthenticationProvider provider = new CustomDaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setMessageSource(messageSource);
    provider.setPreAuthenticationChecks(customUserStatusChecker());
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
  }

  @Bean
  public CustomUserStatusChecker customUserStatusChecker() {
    CustomUserStatusChecker provider = new CustomUserStatusChecker();
    provider.setMessageSource(messageSource);
    return provider;
  }
}

