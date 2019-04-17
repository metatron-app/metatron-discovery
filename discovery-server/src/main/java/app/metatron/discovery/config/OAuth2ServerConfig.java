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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.SecurityExpressionHandler;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.authentication.OAuth2AuthenticationManager;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.security.oauth2.provider.code.AuthorizationCodeServices;
import org.springframework.security.oauth2.provider.code.JdbcAuthorizationCodeServices;
import org.springframework.security.oauth2.provider.expression.OAuth2WebSecurityExpressionHandler;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.FilterInvocation;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import app.metatron.discovery.common.oauth.CustomAccessDeniedHandler;
import app.metatron.discovery.common.oauth.CustomEntryPoint;
import app.metatron.discovery.common.oauth.CustomJdbcClientDetailsServiceBuilder;
import app.metatron.discovery.common.oauth.CustomWebResponseExceptionTranslator;
import app.metatron.discovery.common.oauth.OauthProperties;
import app.metatron.discovery.common.saml.SAMLTokenConverter;
import app.metatron.discovery.common.web.OauthFilter;

/**
 * Created by kyungtaak on 2016. 5. 2..
 */
@Configuration()
public class OAuth2ServerConfig {

  private static Logger LOGGER = LoggerFactory.getLogger(OAuth2ServerConfig.class);

  private static final String POLARIS_RESOURCE_ID = "polaris";

  @Configuration
  @EnableResourceServer
  protected static class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

    @Autowired
    public OauthProperties oauthProperties;

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
      resources
        .resourceId(POLARIS_RESOURCE_ID)
        .expressionHandler(webExpressionHandler())
        .authenticationEntryPoint(customAuthEntryPoint())
        .stateless(true);
    }

    @Bean(autowire = Autowire.BY_NAME)
    public AuthenticationEntryPoint customAuthEntryPoint(){
      return new CustomEntryPoint();
    }

    /**
     * Access 권한 제어하는 표현 방식 구성시 RoleHierarchy 지정 가능하도록 수정
     *
     * @return
     */
    private SecurityExpressionHandler<FilterInvocation> webExpressionHandler() {
      OAuth2WebSecurityExpressionHandler defaultWebSecurityExpressionHandler = new OAuth2WebSecurityExpressionHandler();
      return defaultWebSecurityExpressionHandler;
    }

    @Bean
    public CustomAccessDeniedHandler customAccessDeniedHandler() {
      return new CustomAccessDeniedHandler();
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
      // @formatter:off
			http.cors()  // if Spring MVC is on classpath and no CorsConfigurationSource is provided,  Spring Security will use CORS configuration provided to Spring MVC
        .and()
        .csrf()
          .disable()
        .headers()
          .frameOptions().disable()
        .and()
				  .sessionManagement()
          .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
          .exceptionHandling().accessDeniedHandler(customAccessDeniedHandler())
        .and()
				  .requestMatchers()
          .antMatchers(
                      "/ws/**",
                      "/stomp/**",
                      "/api/**",
                      "/api/workspaces/**",
                      "/api/workbooks/**",
                      "/api/pages/**",
                      "/api/datasources/**",
                      "/api/preparation*/**",
                      "/api/datapreparation/**",
                      "/api/connections/**",
                      "/api/admin/**",
                      "/api/users/**",
                      "/api/roles/**",
                      "/api/groups/**",
                      "/api/commoncodes/**",
                      "/api/metis/**",
                      "/api/binaries/**",
                      "/api/images/**",
                      "/api/jobs/**",
                      "/api/connectors/**",
                      "/api/notebooks/**",
                      "/api/nbmodels/**",
                      "/api/workbenchs/**",
                      "/api/books/**",
                      "/api/reports/**",
                      "/api/folders/**",
                      "/api/dashboards/**",
                      "/api/widgets/**",
                      "/api/comments/**",
                      "/api/posts/**",
                      "/api/books/**",
                      "/api/folders/**",
                      "/api/configurations/**",
                      "/api/datasets/**",
                      "/api/dataflows/**",
                      "/api/sqlbuilders/**",
                      "/api/functions/**",
                      "/api/datastories/**",
                      "/api/auth/**",
                      "/oauth/users/**",
                      "/oauth/clients/**",
                      "/me");

			for (OauthProperties.Matcher matcher : oauthProperties.getPermitAll()) {
        http.authorizeRequests().antMatchers(matcher.getMethod(), matcher.getApi()).permitAll();
			}

			http.authorizeRequests()

          // 사용자 등록 관련 허용
          .antMatchers(HttpMethod.GET, "/api/images/load/**").permitAll()
          .antMatchers(HttpMethod.POST, "/api/users/password").permitAll()
          .antMatchers(HttpMethod.POST, "/api/users").permitAll()
          .antMatchers(HttpMethod.PATCH, "/api/users/**").permitAll()
          .antMatchers(HttpMethod.GET, "/api/users/*/duplicated").permitAll()
          .antMatchers(HttpMethod.POST, "/api/users/*/signup/request").permitAll()

          .antMatchers(HttpMethod.POST, "/api/sso").permitAll()

          //SSO SAML
          .antMatchers(HttpMethod.POST, "/saml/*").permitAll()
          .antMatchers(HttpMethod.GET, "/saml/*").permitAll()

          .antMatchers(HttpMethod.GET, "/api/saml/*").permitAll()
          .antMatchers(HttpMethod.POST, "/api/saml/*").permitAll()

          //Audit 관련 Post,Patch 허용
          .antMatchers(HttpMethod.POST, "/api/audits").permitAll()
          .antMatchers(HttpMethod.POST, "/api/audits/**").permitAll()
          .antMatchers(HttpMethod.PATCH, "/api/audits/**").permitAll()
          .antMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()

          // Token 관련 처리 허용
          .antMatchers("/oauth/token").permitAll()
          // 인증 관련 처리
          .antMatchers("/oauth/authorize").permitAll()
          //별도 로그인 처리
          .antMatchers("/api/oauth/client/login").permitAll()

          //.antMatchers("/oauth/check_token").permitAll()

          // Websokect 관련 Auth 처리
          .antMatchers("/ws/**", "/stomp/**").permitAll()

          .antMatchers(HttpMethod.GET, "/api/**")
            .access("#oauth2.hasScope('read') or isAuthenticated()")
          .antMatchers(HttpMethod.POST, "/api/**")
            .access("#oauth2.hasScope('write') or isAuthenticated()")
          .antMatchers(HttpMethod.PATCH, "/api/**")
            .access("#oauth2.hasScope('write') or isAuthenticated()")
          .antMatchers(HttpMethod.PUT, "/api/**")
            .access("#oauth2.hasScope('write') or isAuthenticated()")
          .antMatchers(HttpMethod.DELETE, "/api/**")
            .access("#oauth2.hasScope('write') or isAuthenticated()")
					.regexMatchers(HttpMethod.DELETE, "/oauth/users/([^/].*?)/tokens/.*")
						.access("#oauth2.clientHasRole('CLIENT') and (hasAuthority('USER') or #oauth2.isClient()) and #oauth2.hasScope('write')")
					.regexMatchers(HttpMethod.GET, "/oauth/clients/([^/].*?)/users/.*")
						.access("#oauth2.clientHasRole('CLIENT') and (hasAuthority('USER') or #oauth2.isClient()) and #oauth2.hasScope('read')")
					.regexMatchers(HttpMethod.GET, "/oauth/clients/.*")
						.access("#oauth2.clientHasRole('CLIENT') and #oauth2.isClient() and #oauth2.hasScope('read')");
          // @formatter:on

    }

  }

  @Configuration
  @EnableAuthorizationServer
  protected static class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {

    @Autowired
    public OauthProperties oauthProperties;

    @Autowired
    private AuthenticationManager authenticationManager;

    //@Autowired
    //private AuthorizationEndpoint authorizationEndpoint;

    private DataSource dataSource;

    public AuthorizationServerConfiguration(@Qualifier("dataSource") DataSource dataSource) {
      this.dataSource = dataSource;
    }

    @PostConstruct
    public void init() {
      //authorizationEndpoint.setUserApprovalPage("forward:/auth/confirm_page");
      //authorizationEndpoint.setErrorPage("forward:/auth/error");
    }

    @Bean
    public JwtTokenStore tokenStore() {
      return new JwtTokenStore(accessTokenConverter());
    }

    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
      JwtAccessTokenConverter converter = new SAMLTokenConverter();
      converter.setSigningKey("metatron-polaris");
      return converter;
    }

    @Bean
    @Primary
    public DefaultTokenServices tokenServices() {
      DefaultTokenServices defaultTokenServices = new DefaultTokenServices();
      defaultTokenServices.setTokenStore(tokenStore());
      defaultTokenServices.setTokenEnhancer(accessTokenConverter());
      defaultTokenServices.setSupportRefreshToken(true);
      return defaultTokenServices;
    }

    @Bean
    public AuthorizationCodeServices authorizationServerTokenServices() {
      return new JdbcAuthorizationCodeServices(dataSource);
    }

    @Bean
    public JdbcClientDetailsService jdbcClientDetailsService() {
      return new JdbcClientDetailsService(dataSource);
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {

      CustomJdbcClientDetailsServiceBuilder builder =  new CustomJdbcClientDetailsServiceBuilder();

      // @formatter:off
			builder
          .jdbcClientDetailsService(jdbcClientDetailsService())
            .withClient("polaris_client")
              .authorizedGrantTypes("authorization_code", "implicit", "password", "refresh_token", "client_credentials")
              .authorities("ROLE_CLIENT")
              .scopes("read", "write")
              .secret("polaris")
          .and()
            .withClient("polaris_trusted").secret("secret")
              .authorities("ROLE_TRUSTED_CLIENT")
              .authorizedGrantTypes("client_credentials", "implicit", "password", "authorization_code", "refresh_token")
              .scopes("read", "write", "trust");
			// @formatter:on

      clients.setBuilder(builder);
    }

    @Bean
    public FilterRegistrationBean oauthFilterRegistrationBean() {
      OAuth2AuthenticationManager oAuth2AuthenticationManager = new OAuth2AuthenticationManager();
      oAuth2AuthenticationManager.setTokenServices(tokenServices());
      oAuth2AuthenticationManager.setClientDetailsService(jdbcClientDetailsService());

      FilterRegistrationBean registrationBean = new FilterRegistrationBean();
      OauthFilter oauthFilter = new OauthFilter(oAuth2AuthenticationManager);
      //OauthFilter oauthFilter = new OauthFilter(authenticationManager);
      registrationBean.setFilter(oauthFilter);
      registrationBean.setOrder(-5);
      return registrationBean;
    }

    @Bean
    public CustomWebResponseExceptionTranslator exceptionTranslator() {
      return new CustomWebResponseExceptionTranslator();
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
      // @formatter:off
      endpoints
        .tokenStore(tokenStore())
//        .pathMapping("/oauth/token", "/api/oauth/token")
//        .pathMapping("/oauth/authorize", "/api/oauth/authorize")
        .authenticationManager(authenticationManager)
//        .accessTokenConverter(accessTokenConverter())
        .exceptionTranslator(exceptionTranslator())
        .tokenServices(tokenServices())
        .authorizationCodeServices(authorizationServerTokenServices()) // /oauth/authorize code(oauth_code) jdbc 사용(default inmemory)

//        .accessTokenConverter(tokenEnhancer())
        .approvalStoreDisabled();
//        .allowedTokenEndpointRequestMethods(HttpMethod.GET, HttpMethod.POST); // to allow get for password grant
      // @formatter:on
    }

    @Override
    public void configure(AuthorizationServerSecurityConfigurer oauthServer) throws Exception {

      // @formatter:off
      oauthServer
        .allowFormAuthenticationForClients()                               // to let users do password grant with username/password on get
        .tokenKeyAccess("isAnonymous() || hasRole('ROLE_TRUSTED_CLIENT')") // permitAll()
      //.checkTokenAccess("hasRole('TRUSTED_CLIENT')");                    // isAuthenticated()
        .checkTokenAccess("isAuthenticated()");
      // @formatter:on
    }

  }

}
