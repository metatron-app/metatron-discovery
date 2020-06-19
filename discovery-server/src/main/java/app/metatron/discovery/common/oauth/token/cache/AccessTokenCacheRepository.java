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
}
