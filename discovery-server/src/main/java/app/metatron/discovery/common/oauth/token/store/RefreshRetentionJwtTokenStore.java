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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.common.ExpiringOAuth2RefreshToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.common.oauth.token.cache.AccessTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.RefreshTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.WhitelistTokenCacheRepository;
import app.metatron.discovery.util.HttpUtils;

/**
 *
 */
public class RefreshRetentionJwtTokenStore extends JwtTokenStore {

  private static Logger LOGGER = LoggerFactory.getLogger(RefreshRetentionJwtTokenStore.class);

  @Autowired
  RefreshTokenCacheRepository refreshTokenCacheRepository;

  @Autowired
  AccessTokenCacheRepository accessTokenCacheRepository;

  @Autowired
  WhitelistTokenCacheRepository whitelistTokenCacheRepository;

  @Autowired
  HttpServletRequest httpServletRequest;

  /**
   * Create a JwtTokenStore with this token enhancer (should be shared with the DefaultTokenServices if used).
   */
  public RefreshRetentionJwtTokenStore(JwtAccessTokenConverter jwtTokenEnhancer) {
    super(jwtTokenEnhancer);
  }

  @Override
  public void storeAccessToken(OAuth2AccessToken token, OAuth2Authentication authentication) {
    super.storeAccessToken(token, authentication);
    OAuth2Request oAuth2Request = authentication.getOAuth2Request();
    String userHost = HttpUtils.getClientIp(httpServletRequest);

    //store access token
    accessTokenCacheRepository.putAccessToken(token.getValue(), token.getRefreshToken().getValue(),
                                              authentication.getName(), token.getExpiration(),
                                              oAuth2Request.getClientId(), userHost);

    //store access token to whitelist
    whitelistTokenCacheRepository.putWhitelistToken(token.getValue(), authentication.getName(),
                                                    oAuth2Request.getClientId(), userHost);

    //store refresh token
    OAuth2RefreshToken oAuth2RefreshToken = token.getRefreshToken();
    if(oAuth2RefreshToken != null && oAuth2RefreshToken instanceof ExpiringOAuth2RefreshToken){
      ExpiringOAuth2RefreshToken expiringOAuth2RefreshToken = (ExpiringOAuth2RefreshToken) oAuth2RefreshToken;
      refreshTokenCacheRepository.putRefreshToken(expiringOAuth2RefreshToken.getValue(), expiringOAuth2RefreshToken.getExpiration());
    }
  }

//  @Override
//  public void storeRefreshToken(OAuth2RefreshToken refreshToken, OAuth2Authentication authentication) {
//    String tokenForDebug = StringUtils.truncate(refreshToken.getValue(), 10) + "..." + StringUtils.truncate(refreshToken.getValue(), refreshToken.getValue().length() - 10, 10);
//    LOGGER.debug("storeRefreshToken : {}", tokenForDebug);
//    super.storeRefreshToken(refreshToken, authentication);
//    if(refreshToken instanceof ExpiringOAuth2RefreshToken){
//      refreshTokenCacheRepository.putRefreshToken(refreshToken.getValue(), ((ExpiringOAuth2RefreshToken) refreshToken).getExpiration());
//    }
//  }

  @Override
  public OAuth2RefreshToken readRefreshToken(String tokenValue) {
    OAuth2RefreshToken refreshToken = super.readRefreshToken(tokenValue);
    if(refreshToken instanceof ExpiringOAuth2RefreshToken){
      RefreshTokenCacheRepository.CachedRefreshToken cachedRefreshToken
          = refreshTokenCacheRepository.getCachedRefreshToken(refreshToken.getValue());
      if(cachedRefreshToken != null){
        LOGGER.debug("refresh token expiration replaced by cache : {}", cachedRefreshToken.getExpiration());
        RefreshRetentionToken refreshRetentionToken = new RefreshRetentionToken(refreshToken);
        refreshRetentionToken.setExpiration(cachedRefreshToken.getExpiration());
        return refreshRetentionToken;
      }
    }
    return refreshToken;
  }

  @Override
  public void removeAccessToken(OAuth2AccessToken token) {
    super.removeAccessToken(token);

    //remove whitelist token
    AccessTokenCacheRepository.CachedAccessToken cachedAccessToken = accessTokenCacheRepository.getCachedAccessToken(token.getValue());
    if(cachedAccessToken != null){
      whitelistTokenCacheRepository.removeWhitelistToken(cachedAccessToken.getUsername(), cachedAccessToken.getClientId());
    }
    accessTokenCacheRepository.removeAccessToken(token.getValue());
  }

  @Override
  public void removeRefreshToken(OAuth2RefreshToken token) {
    super.removeRefreshToken(token);
    refreshTokenCacheRepository.removeRefreshToken(token.getValue());
  }

  @Override
  public void removeAccessTokenUsingRefreshToken(OAuth2RefreshToken refreshToken) {
    super.removeAccessTokenUsingRefreshToken(refreshToken);
    refreshTokenCacheRepository.removeRefreshToken(refreshToken.getValue());
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
}
