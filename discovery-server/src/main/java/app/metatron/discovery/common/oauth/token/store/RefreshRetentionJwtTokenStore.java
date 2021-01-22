/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.common.oauth.token.store;

import app.metatron.discovery.common.oauth.token.cache.*;
import app.metatron.discovery.util.HttpUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.common.DefaultExpiringOAuth2RefreshToken;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import javax.servlet.http.HttpServletRequest;

/**
 *
 */
public class RefreshRetentionJwtTokenStore extends JwtTokenStore {

  private static Logger LOGGER = LoggerFactory.getLogger(RefreshRetentionJwtTokenStore.class);

  @Autowired
  TokenCacheRepository tokenCacheRepository;

  @Autowired
  HttpServletRequest httpServletRequest;

  @Autowired
  JwtAccessTokenConverter jwtTokenEnhancer;

  /**
   * Create a JwtTokenStore with this token enhancer (should be shared with the DefaultTokenServices if used).
   */
  public RefreshRetentionJwtTokenStore(JwtAccessTokenConverter jwtTokenEnhancer) {
    super(jwtTokenEnhancer);
  }

  @Override
  public void storeAccessToken(OAuth2AccessToken token, OAuth2Authentication authentication) {
    super.storeAccessToken(token, authentication);

    String clientId = authentication.getOAuth2Request().getClientId();
    if (tokenCacheRepository.isStoreCache(clientId)) {
      String grantType = authentication.getOAuth2Request().getGrantType();
      LOGGER.debug("Store Access Token (GrantType-{})", grantType);

      if (tokenCacheRepository.isCheckIp(clientId)) {
        tokenCacheRepository.removeCachedTokenByUsernameAndClientId(authentication.getName(), clientId);
      }

      tokenCacheRepository.putAccessCachedToken(authentication.getName(), clientId, token.getValue(), getUserHost());
      if (token.getRefreshToken() != null) {
        storeRefreshToken(token.getRefreshToken(), authentication);
      }
    }
  }

  private String getUserHost() {
    String userHost;
    try {
      userHost = HttpUtils.getClientIp(httpServletRequest);
    } catch (IllegalStateException ise) {
      userHost = getRemoteAddress();
    }
    return userHost;
  }

  /**
   * (for test code)
   * If the IllegalStateException error occurs, get the ip address as an alternative
   *
   * @return
   */
  private String getRemoteAddress() {

    RequestAttributes attribs = RequestContextHolder.getRequestAttributes();
    if (attribs instanceof NativeWebRequest) {
      HttpServletRequest request = (HttpServletRequest) ((NativeWebRequest) attribs).getNativeRequest();
      return request.getRemoteAddr();
    }

    return "127.0.0.1";
  }

  @Override
  public void storeRefreshToken(OAuth2RefreshToken refreshToken, OAuth2Authentication authentication) {
    super.storeRefreshToken(refreshToken, authentication);

    String clientId = authentication.getOAuth2Request().getClientId();
    if (tokenCacheRepository.isStoreCache(clientId)) {
      String grantType = authentication.getOAuth2Request().getGrantType();
      LOGGER.debug("Store Refresh Token (GrantType-{})", grantType);
      tokenCacheRepository.putRefreshCachedToken(authentication.getName(), clientId, getUserHost(), refreshToken.getValue());
    }
  }

  @Override
  public OAuth2AccessToken readAccessToken(String tokenValue) {
    OAuth2Authentication authentication = readAuthentication(tokenValue);
    String clientId = authentication.getOAuth2Request().getClientId();
    if (tokenCacheRepository.isStoreCache(clientId)) {
      CachedToken cachedToken = tokenCacheRepository.getCachedToken(authentication.getName(), authentication.getOAuth2Request().getClientId(), getUserHost());

      OAuth2AccessToken accessToken = super.readAccessToken(tokenValue);
      if (accessToken != null && cachedToken != null
          && accessToken instanceof DefaultOAuth2AccessToken && accessToken.getRefreshToken() == null
          && cachedToken.getRefreshToken() != null && cachedToken.getExpiration() != null) {
        DefaultOAuth2AccessToken defaultOAuth2AccessToken = (DefaultOAuth2AccessToken) accessToken;
        defaultOAuth2AccessToken.setRefreshToken(new DefaultExpiringOAuth2RefreshToken(cachedToken.getRefreshToken(), cachedToken.getExpiration()));
        return defaultOAuth2AccessToken;
      }
      return accessToken;
    } else {
      return super.readAccessToken(tokenValue);
    }
  }

  @Override
  public OAuth2RefreshToken readRefreshToken(String tokenValue) {
    OAuth2RefreshToken refreshToken = super.readRefreshToken(tokenValue);
    OAuth2Authentication authentication = readAuthentication(tokenValue);
    String clientId = authentication.getOAuth2Request().getClientId();
    if (tokenCacheRepository.isStoreCache(clientId)) {
      CachedToken cachedToken = tokenCacheRepository.getCachedToken(authentication.getName(), authentication.getOAuth2Request().getClientId(), getUserHost());
      if (cachedToken != null && cachedToken.getExpiration() != null) {
        return new DefaultExpiringOAuth2RefreshToken(tokenValue, cachedToken.getExpiration());
      }
    }
    return refreshToken;
  }

  @Override
  public void removeAccessToken(OAuth2AccessToken token) {
    super.removeAccessToken(token);

    OAuth2Authentication authentication = readAuthentication(token.getValue());
    String clientId = authentication.getOAuth2Request().getClientId();

    if (tokenCacheRepository.isStoreCache(clientId)) {
      LOGGER.debug("Remove Access Token");
      String username = authentication.getName();
      tokenCacheRepository.removeAccessCachedToken(username, clientId, getUserHost());
    }
  }

  @Override
  public void removeRefreshToken(OAuth2RefreshToken token) {
    super.removeRefreshToken(token);

    OAuth2Authentication authentication = readAuthentication(token.getValue());
    String clientId = authentication.getOAuth2Request().getClientId();

    if (tokenCacheRepository.isStoreCache(clientId)) {
      LOGGER.debug("Remove Refresh Token");
      String username = authentication.getName();
      tokenCacheRepository.removeRefreshCachedToken(username, clientId, getUserHost());
    }
  }

  @Override
  public void removeAccessTokenUsingRefreshToken(OAuth2RefreshToken refreshToken) {
    super.removeAccessTokenUsingRefreshToken(refreshToken);

    OAuth2Authentication authentication = readAuthentication(refreshToken.getValue());
    String clientId = authentication.getOAuth2Request().getClientId();

    if (tokenCacheRepository.isStoreCache(clientId)) {
      LOGGER.debug("Remove Access Token using Refresh Token");
      String username = authentication.getName();
      tokenCacheRepository.removeAccessCachedToken(username, clientId, getUserHost());
    }
  }

  @Override
  public OAuth2AccessToken getAccessToken(OAuth2Authentication authentication) {
    String clientId = authentication.getOAuth2Request().getClientId();

    if (tokenCacheRepository.isStoreCache(clientId)) {
      CachedToken cachedToken = tokenCacheRepository.getCachedToken(authentication.getName(), authentication.getOAuth2Request().getClientId(), getUserHost());
      if (cachedToken != null && cachedToken.getAccessToken() != null) {
        return readAccessToken(cachedToken.getAccessToken());
      } else {
        return null;
      }
    } else {
      return super.getAccessToken(authentication);
    }
  }

}
