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

import com.google.common.collect.Maps;

import org.infinispan.spring.provider.SpringEmbeddedCacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.oauth2.common.ExpiringOAuth2RefreshToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 *
 */
@Repository
@CacheConfig(cacheNames = "token-cache")
public class TokenCacheRepository {

  private static Logger LOGGER = LoggerFactory.getLogger(TokenCacheRepository.class);

  private final String cacheName = "token-cache";

  @Autowired
  JdbcClientDetailsService jdbcClientDetailsService;

  @Autowired
  CacheManager cacheManager;

  @Autowired
  TokenStore tokenStore;

  private Map<String, ClientDetails> clientDetailsMap;

  @PostConstruct
  public void init() {
    clientDetailsMap = Maps.newHashMap();
    List<ClientDetails> clientDetailsList = jdbcClientDetailsService.listClientDetails();
    for(ClientDetails clientDetail : clientDetailsList) {
      clientDetailsMap.put(clientDetail.getClientId(), clientDetail);
    }
    LOGGER.info("ClientDetailsMap init : {}", GlobalObjectMapper.writeValueAsString(clientDetailsMap));
  }

  public boolean isStoreCache(String clientId) {
    ClientDetails clientDetails = clientDetailsMap.get(clientId);
    if (clientDetails != null
        && clientDetails.getAdditionalInformation() != null
        && clientDetails.getAdditionalInformation().get("storeCache") != null
        && Boolean.parseBoolean(clientDetails.getAdditionalInformation().get("storeCache").toString())) {
      return true;
    } else {
      return isTimeoutClientDetails(clientId) || isCheckIp(clientId);
    }
  }

  public boolean isTimeoutClientDetails(String clientId) {
    ClientDetails clientDetails = clientDetailsMap.get(clientId);
    if (clientDetails != null
        && clientDetails.getAccessTokenValiditySeconds() != null
        && clientDetails.getRefreshTokenValiditySeconds() != null
        && clientDetails.getAccessTokenValiditySeconds().equals(clientDetails.getRefreshTokenValiditySeconds())) {
      return true;
    }
    return false;
  }

  public boolean isCheckIp(String clientId) {
    ClientDetails clientDetails = clientDetailsMap.get(clientId);
    if (clientDetails != null
        && clientDetails.getAdditionalInformation() != null
        && clientDetails.getAdditionalInformation().get("checkIp") != null
        && Boolean.parseBoolean(clientDetails.getAdditionalInformation().get("checkIp").toString())) {
      return true;
    }
    return false;
  }

  public int getRefreshTokenValiditySeconds(String clientId) {
    return clientDetailsMap.get(clientId).getRefreshTokenValiditySeconds();
  }

  @Cacheable(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken getCachedToken(String username, String clientId, String userIp) {
    try {
      CachedToken cachedToken =
          cacheManager.getCache(cacheName).get(getCacheKey(username, clientId, userIp), CachedToken.class);
      return cachedToken;
    } catch (Exception e) {
      return null;
    }
  }

  @CachePut(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken putAccessCachedToken(String username, String clientId, String accessToken, String userIp) {
    LOGGER.debug("store Token : {}|{}|{}", username, clientId, userIp);
    CachedToken cachedToken = getCachedToken(username, clientId, userIp);
    if (cachedToken != null) {
      cachedToken.setUserIp(userIp);
      cachedToken.setAccessToken(accessToken);
    } else {
      cachedToken = new CachedToken(username, clientId, userIp, accessToken);
    }
    return cachedToken;
  }

  @CachePut(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken putRefreshCachedToken(String username, String clientId, String userIp, String refreshToken) {
    OAuth2RefreshToken oAuth2RefreshToken = tokenStore.readRefreshToken(refreshToken);
    if (oAuth2RefreshToken instanceof ExpiringOAuth2RefreshToken) {
      CachedToken cachedToken = getCachedToken(username, clientId, userIp);
      if (cachedToken != null) {
        cachedToken.setRefreshToken(refreshToken);
        cachedToken.setExpiration(((ExpiringOAuth2RefreshToken) oAuth2RefreshToken).getExpiration());
      }
      return cachedToken;
    } else {
      throw new InvalidTokenException("refreshToken does not have expiration");
    }
  }

  @CachePut(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken putRefreshCachedToken(String username, String clientId, String userIp, Date expiration) {
    CachedToken cachedToken = getCachedToken(username, clientId, userIp);
    if (cachedToken != null) {
      cachedToken.setExpiration(expiration);
    }
    return cachedToken;
  }

  @CachePut(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken removeAccessCachedToken(String username, String clientId, String userIp) {
    LOGGER.debug("remove Token(AccessToken) : {}|{}|{}", username, clientId, userIp);
    CachedToken cachedToken = getCachedToken(username, clientId, userIp);
    if (cachedToken != null) {
      cachedToken.setAccessToken(null);
    }
    return cachedToken;
  }

  @CachePut(key = "#username + '|' + #clientId + '|' + #userIp")
  public CachedToken removeRefreshCachedToken(String username, String clientId, String userIp) {
    LOGGER.debug("remove Token(RefreshToken) : {}|{}|{}", username, clientId, userIp);
    CachedToken cachedToken = getCachedToken(username, clientId, userIp);
    if (cachedToken != null) {
      cachedToken.setRefreshToken(null);
      cachedToken.setExpiration(null);
    }
    return cachedToken;
  }

  @CacheEvict
  public void removeCachedToken(String tokenKey){
    LOGGER.debug("remove Token : {}", tokenKey);
    cacheManager.getCache(cacheName).evict(tokenKey);
  }

  public Map<String, CachedToken> getCachedTokenMap(String username, String clientId) {
    Map<String, CachedToken> entries = Maps.newHashMap();
    ((SpringEmbeddedCacheManager) cacheManager).getCache(cacheName).getNativeCache().forEach(
        (o, o2) -> {
          String key = String.valueOf(o);
          if (key.startsWith(username + "|" + clientId + "|")) {
            if (o2 instanceof CachedToken) {
              entries.put(key, (CachedToken) o2);
            }
          }
        }
    );
    return entries;
  }

  public void removeCachedTokenByUsernameAndClientId(String username, String clientId) {
    Map<String, CachedToken> cachedTokenMap = getCachedTokenMap(username, clientId);
    cachedTokenMap.keySet().forEach(s -> {
      removeCachedToken(s);
    });
  }

  public String getCacheKey(String username, String clientId, String userIp) {
    return username + "|" + clientId + "|" + userIp;
  }

}
