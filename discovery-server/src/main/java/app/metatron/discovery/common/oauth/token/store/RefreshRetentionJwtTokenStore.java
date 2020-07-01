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
import org.springframework.security.oauth2.common.ExpiringOAuth2RefreshToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;

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

    String grantType = authentication.getOAuth2Request().getGrantType();
    LOGGER.debug("Store accessToken Token (GrantType-{})", grantType);

    String userHost;
    try {
      userHost = HttpUtils.getClientIp(httpServletRequest);
    } catch (IllegalStateException ise) {
      userHost = getRemoteAddress();
    }

    tokenCacheRepository.putAccessCachedToken(authentication.getName(), authentication.getOAuth2Request().getClientId(), token.getValue(), userHost);
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

    String grantType = authentication.getOAuth2Request().getGrantType();
    LOGGER.debug("Store Refresh Token (GrantType-{})", grantType);
    tokenCacheRepository.putRefreshCachedToken(authentication.getName(), authentication.getOAuth2Request().getClientId(), refreshToken.getValue());
  }

  @Override
  public OAuth2AccessToken readAccessToken(String tokenValue) {
    OAuth2AccessToken accessToken = super.readAccessToken(tokenValue);
    OAuth2Authentication authentication = readAuthentication(tokenValue);
    return accessToken;
  }

  @Override
  public OAuth2RefreshToken readRefreshToken(String tokenValue) {
    OAuth2RefreshToken refreshToken = super.readRefreshToken(tokenValue);
    OAuth2Authentication authentication = readAuthentication(tokenValue);
    String cacheKey = getCacheKey(authentication);
    CachedToken cachedToken = tokenCacheRepository.getCachedToken(cacheKey);
    if (cachedToken != null && cachedToken.getExpiration() != null) {
      RefreshRetentionToken refreshRetentionToken = new RefreshRetentionToken(refreshToken);
      refreshRetentionToken.setExpiration(cachedToken.getExpiration());
      return refreshRetentionToken;
    }
    return refreshToken;
  }

  @Override
  public void removeAccessToken(OAuth2AccessToken token) {
    super.removeAccessToken(token);

    LOGGER.debug("Remove Access Token");
    OAuth2Authentication authentication = readAuthentication(token.getValue());
    String username = authentication.getName();
    String clientId = authentication.getOAuth2Request().getClientId();
    tokenCacheRepository.removeAccessCachedToken(username,clientId);
  }

  @Override
  public void removeRefreshToken(OAuth2RefreshToken token) {
    super.removeRefreshToken(token);

    LOGGER.debug("Remove Refresh Token");
    OAuth2Authentication authentication = readAuthentication(token.getValue());
    String username = authentication.getName();
    String clientId = authentication.getOAuth2Request().getClientId();
    tokenCacheRepository.removeRefreshCachedToken(username,clientId);
  }

  @Override
  public void removeAccessTokenUsingRefreshToken(OAuth2RefreshToken refreshToken) {
    super.removeAccessTokenUsingRefreshToken(refreshToken);

    LOGGER.debug("Remove Access Token using Refresh Token");
    OAuth2Authentication authentication = readAuthentication(refreshToken.getValue());
    String username = authentication.getName();
    String clientId = authentication.getOAuth2Request().getClientId();
    tokenCacheRepository.removeAccessCachedToken(username,clientId);
  }

  @Override
  public OAuth2AccessToken getAccessToken(OAuth2Authentication authentication) {
    String cacheKey = getCacheKey(authentication);
    CachedToken cachedToken = tokenCacheRepository.getCachedToken(cacheKey);
    if (cachedToken != null && cachedToken.getAccessToken() != null) {
      return readAccessToken(cachedToken.getAccessToken());
    } else {
      return null;
    }
  }

  public class RefreshRetentionToken implements ExpiringOAuth2RefreshToken{
    OAuth2RefreshToken nativeToken;
    Date expiration;

    public RefreshRetentionToken(OAuth2RefreshToken oAuth2RefreshToken) {
      this.nativeToken = oAuth2RefreshToken;
    }

    public void setExpiration(Date expiration) {
      this.expiration = expiration;
    }

    @Override
    public String getValue() {
      if(nativeToken != null)
        return nativeToken.getValue();
      return null;
    }

    @Override
    public Date getExpiration() {
      if(expiration != null)
        return expiration;

      if(nativeToken != null && nativeToken instanceof ExpiringOAuth2RefreshToken)
        return ((ExpiringOAuth2RefreshToken) nativeToken).getExpiration();

      return null;
    }
  }

  private String getCacheKey(OAuth2Authentication authentication) {
    return authentication.getName() + "|" + authentication.getOAuth2Request().getClientId();
  }
}
