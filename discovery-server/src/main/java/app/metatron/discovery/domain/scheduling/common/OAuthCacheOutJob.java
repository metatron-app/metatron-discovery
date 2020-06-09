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

package app.metatron.discovery.domain.scheduling.common;

import org.infinispan.spring.provider.SpringCache;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

import app.metatron.discovery.common.oauth.token.cache.AccessTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.RefreshTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.WhitelistTokenCacheRepository;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class OAuthCacheOutJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(OAuthCacheOutJob.class);

  @Autowired
  CacheManager cacheManager;

  @Autowired
  AccessTokenCacheRepository accessTokenCacheRepository;

  @Autowired
  RefreshTokenCacheRepository refreshTokenCacheRepository;

  @Autowired
  WhitelistTokenCacheRepository whitelistTokenCacheRepository;

  public OAuthCacheOutJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking expired oauth access token.");
    SpringCache accessTokenCache = (SpringCache) cacheManager.getCache("access-token-cache");
    accessTokenCache.getNativeCache().forEach((key, cachedAccessToken) -> {
      Date expiration = ((AccessTokenCacheRepository.CachedAccessToken) cachedAccessToken).getExpiration();
      if(expiration.getTime() < System.currentTimeMillis()){
        LOGGER.debug("Access Token expired : {}", key);
        accessTokenCacheRepository.removeAccessToken(key.toString());
      }
    });
    LOGGER.info("## End batch job for checking expired oauth refresh token.");

    LOGGER.info("## Start batch job for checking expired oauth refresh token.");
    SpringCache refreshTokenCache = (SpringCache) cacheManager.getCache("refresh-token-cache");
    refreshTokenCache.getNativeCache().forEach((key, cachedRefreshToken) -> {
      Date expiration = ((RefreshTokenCacheRepository.CachedRefreshToken) cachedRefreshToken).getExpiration();
      if(expiration.getTime() < System.currentTimeMillis()){
        LOGGER.debug("Refresh Token expired : {}", key);
        refreshTokenCacheRepository.removeRefreshToken(key.toString());
      }
    });
    LOGGER.info("## End batch job for checking expired oauth refresh token.");
  }
}
