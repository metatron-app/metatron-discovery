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
@CacheConfig(cacheNames = "refresh-token-cache")
public class RefreshTokenCacheRepository {

  private static Logger LOGGER = LoggerFactory.getLogger(RefreshTokenCacheRepository.class);

  @Autowired
  CacheManager cacheManager;

  @Cacheable(key = "#tokenKey")
  public CachedRefreshToken getCachedRefreshToken(String tokenKey){
    return cacheManager.getCache("refresh-token-cache").get(tokenKey, CachedRefreshToken.class);
  }

  @CachePut(key = "#tokenKey")
  public CachedRefreshToken putRefreshToken(String tokenKey, Date expiration){
    LOGGER.debug("store refresh Token : {}", JwtTokenUtil.getTokenForDebug(tokenKey));
    CachedRefreshToken refreshToken = new CachedRefreshToken(expiration);
    return refreshToken;
  }

  @CacheEvict
  public void removeRefreshToken(String tokenKey){
    LOGGER.debug("remove refresh Token : {}", JwtTokenUtil.getTokenForDebug(tokenKey));
    cacheManager.getCache("refresh-token-cache").evict(tokenKey);
  }
}
