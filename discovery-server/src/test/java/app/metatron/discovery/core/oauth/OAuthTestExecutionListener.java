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

package app.metatron.discovery.core.oauth;

import com.google.common.collect.Sets;

import org.apache.commons.beanutils.BeanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.support.AbstractTestExecutionListener;

import java.lang.reflect.InvocationTargetException;
import java.util.Collection;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.annotation.Nonnull;

import static java.util.Arrays.asList;

/**
 * Created by kyungtaak on 2016. 5. 8..
 */
public class OAuthTestExecutionListener extends AbstractTestExecutionListener {

  private static Logger LOGGER = LoggerFactory.getLogger(OAuthTestExecutionListener.class);

  public static final String OAUTH_TOKEN_VALUE = "token";
  private final OAuth2AccessToken accessToken;
  private final OAuth2Request clientAuthentication;

  public OAuthTestExecutionListener() {
    accessToken = new DefaultOAuth2AccessToken(OAUTH_TOKEN_VALUE);
    // TODO no magic constants! These should probably come from the OAuthResourceServer Configuration!
    clientAuthentication = new OAuth2Request(new HashMap<>(), "polaris-client", null, true, Sets.newHashSet("read", "write"), Sets.newHashSet("polaris"), null, null, null);
  }

  @Override
  public void beforeTestMethod(TestContext testContext) throws Exception {
    OAuthRequest annotation = AnnotationUtils.getAnnotation(testContext.getTestMethod(), OAuthRequest.class);

    if (annotation == null) {
      annotation = AnnotationUtils.getAnnotation(testContext.getTestClass(), OAuthRequest.class);
    }

    if(annotation == null) {
      LOGGER.warn("No OAuthToken annotation for {} in class {}, did you forget it?", testContext.getTestMethod().getName(), testContext.getTestClass().getName());
    } else {
      insertOauthTokenIntoStore(testContext, annotation);
    }
  }

  private void insertOauthTokenIntoStore(TestContext testContext, @Nonnull OAuthRequest token) throws InvocationTargetException, IllegalAccessException {
    TokenStore tokenStore = testContext.getApplicationContext().getBean(TokenStore.class);
    OAuth2Authentication authentication = new OAuth2Authentication(clientAuthentication, getAuthenticationFromAnnotation(token));
    tokenStore.storeAccessToken(accessToken, authentication);

    JwtAccessTokenConverter jwtAccessTokenConverter = testContext.getApplicationContext().getBean("accessTokenConverter", JwtAccessTokenConverter.class);
    OAuth2AccessToken jwtToken = jwtAccessTokenConverter.enhance(accessToken, authentication);

    BeanUtils.setProperty(testContext.getTestInstance(), "oauth_token", jwtToken.getValue());
  }

  private Authentication getAuthenticationFromAnnotation(OAuthRequest token) {
    return new Authentication() {
      @Override
      public Collection<? extends GrantedAuthority> getAuthorities() {
        return asList(token.value())
                .stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
      }

      @Override
      public Object getCredentials() {
        return null;
      }

      @Override
      public Object getDetails() {
        return null;
      }

      @Override
      public Object getPrincipal() {
        return new User(getName(), "", getAuthorities());
      }

      @Override
      public boolean isAuthenticated() {
        return true;
      }

      @Override
      public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {

      }

      @Override
      public String getName() {
        return token.username();
      }
    };
  }

  @Override
  public void afterTestMethod(TestContext testContext) throws Exception {
    TokenStore tokenStore = testContext.getApplicationContext().getBean(TokenStore.class);
    tokenStore.removeAccessToken(accessToken);
  }

}
