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
package app.metatron.discovery.common.oauth.token.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.io.Serializable;
import java.util.Date;

import app.metatron.discovery.common.oauth.token.JwtTokenUtil;

/**
 *
 */
@Repository
@CacheConfig(cacheNames = "access-token-cache")
public class AccessTokenCacheRepository {

  private static Logger LOGGER = LoggerFactory.getLogger(AccessTokenCacheRepository.class);
  public static String REFRESH_TO_ACCESS = "REFRESH_TO_ACCESS:";

  @Autowired
  CacheManager cacheManager;

  @Cacheable(key = "#tokenKey")
  public CachedAccessToken getCachedAccessToken(String tokenKey){
    return cacheManager.getCache("access-token-cache").get(tokenKey, CachedAccessToken.class);
  }

  @CachePut(key = "#tokenKey")
  public CachedAccessToken putAccessToken(String tokenKey, String refreshToken, String username, Date expiration,
                                          String clientId, String clientIp){
    LOGGER.debug("store Access Token : {}", JwtTokenUtil.getTokenForDebug(tokenKey));
    CachedAccessToken accessToken = new CachedAccessToken(tokenKey, refreshToken, username, expiration, clientId, clientIp);
    return accessToken;
  }

  @CachePut(key = "T(app.metatron.discovery.common.oauth.token.cache.AccessTokenCacheRepository).REFRESH_TO_ACCESS + #refreshToken")
  public CachedAccessToken putAccessTokenByRefreshToken(String tokenKey, String refreshToken, String username, Date expiration,
                                          String clientId, String clientIp){
    LOGGER.debug("store Access Token By Refresh Token : {}", JwtTokenUtil.getTokenForDebug(tokenKey));
    CachedAccessToken accessToken = new CachedAccessToken(tokenKey, refreshToken, username, expiration, clientId, clientIp);
    return accessToken;
  }

  @CacheEvict
  public void removeAccessToken(String tokenKey){
    LOGGER.debug("remove Access Token : {}", JwtTokenUtil.getTokenForDebug(tokenKey));
    cacheManager.getCache("access-token-cache").evict(tokenKey);
  }

  public CachedAccessToken getCachedAccessTokenByRefreshToken(String refreshTokenKey){
    return this.getCachedAccessToken(REFRESH_TO_ACCESS + refreshTokenKey);
  }

  public void removeAccessTokenByRefreshToken(String refreshTokenKey){
    this.removeAccessToken(REFRESH_TO_ACCESS + refreshTokenKey);
  }

  public class CachedAccessToken implements Serializable {
    public String token;
    public String refreshToken;
    public String username;
    public String clientId;
    public String clientIp;
    public Date expiration;

    public CachedAccessToken(String token, String refreshToken, String username, Date expiration, String clientId, String clientIp) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.username = username;
      this.expiration = expiration;
      this.clientId = clientId;
      this.clientIp = clientIp;
    }

    public String getToken() {
      return token;
    }

    public void setToken(String token) {
      this.token = token;
    }

    public String getRefreshToken() {
      return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
      this.refreshToken = refreshToken;
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getClientId() {
      return clientId;
    }

    public void setClientId(String clientId) {
      this.clientId = clientId;
    }

    public String getClientIp() {
      return clientIp;
    }

    public void setClientIp(String clientIp) {
      this.clientIp = clientIp;
    }

    public Date getExpiration() {
      return expiration;
    }

    public void setExpiration(Date expiration) {
      this.expiration = expiration;
    }
  }
}
