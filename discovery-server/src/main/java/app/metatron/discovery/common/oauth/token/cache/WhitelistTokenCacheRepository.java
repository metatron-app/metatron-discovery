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

/**
 *
 */
@Repository
@CacheConfig(cacheNames = "token-whitelist-cache")
public class WhitelistTokenCacheRepository {

  private static Logger LOGGER = LoggerFactory.getLogger(WhitelistTokenCacheRepository.class);

  @Autowired
  CacheManager cacheManager;

  @Cacheable(key = "#username + '|' + #clientId")
  public CachedWhitelistToken getCachedWhitelistToken(String username, String clientId){
    String key = username + "|" + clientId;
    return cacheManager.getCache("token-whitelist-cache").get(key, CachedWhitelistToken.class);
  }

  @CachePut(key = "#username + '|' + #clientId")
  public CachedWhitelistToken putWhitelistToken(String tokenKey, String username, String clientId, String userHost){
    LOGGER.debug("store White list Token : {}|{}, {}", username, clientId, userHost);
    CachedWhitelistToken accessToken = new CachedWhitelistToken(tokenKey, username, clientId, userHost);
    return accessToken;
  }

  @CacheEvict(key = "#username + '|' + #clientId")
  public void removeWhitelistToken(String username, String clientId){
    LOGGER.debug("remove White list Token : {}|{}", username, clientId);
    cacheManager.getCache("token-whitelist-cache").evict(username + "|" + clientId);
  }

  public class CachedWhitelistToken implements Serializable {
    public String token;
    public String username;
    public String clientId;
    public String userHost;

    public CachedWhitelistToken(String token, String username, String clientId, String userHost) {
      this.token = token;
      this.username = username;
      this.clientId = clientId;
      this.userHost = userHost;
    }

    public String getToken() {
      return token;
    }

    public void setToken(String token) {
      this.token = token;
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

    public String getUserHost() {
      return userHost;
    }

    public void setUserHost(String userHost) {
      this.userHost = userHost;
    }
  }
}
