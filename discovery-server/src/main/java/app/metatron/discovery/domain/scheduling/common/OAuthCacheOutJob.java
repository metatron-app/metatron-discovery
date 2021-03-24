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

import org.apache.commons.lang.StringUtils;
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

import app.metatron.discovery.common.oauth.token.cache.CachedToken;
import app.metatron.discovery.common.oauth.token.cache.TokenCacheRepository;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class OAuthCacheOutJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(OAuthCacheOutJob.class);

  @Autowired
  CacheManager cacheManager;

  @Autowired
  TokenCacheRepository tokenCacheRepository;

  public OAuthCacheOutJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking expired oauth token.");
    SpringCache tokenCache = (SpringCache) cacheManager.getCache("token-cache");
    tokenCache.getNativeCache().forEach((key, cachedToken) -> {
      if (cachedToken instanceof CachedToken) {
        Date expiration = ((CachedToken) cachedToken).getExpiration();
        if(expiration != null && expiration.getTime() < System.currentTimeMillis()){
          LOGGER.debug("Token expired : {}", key);
          tokenCacheRepository.removeCachedToken(key.toString());
        } else {
          String accessToken = ((CachedToken) cachedToken).getAccessToken();
          String refreshToken = ((CachedToken) cachedToken).getRefreshToken();
          if (StringUtils.isBlank(accessToken) && StringUtils.isBlank(refreshToken)) {
            LOGGER.debug("Token expired : {}", key);
            tokenCacheRepository.removeCachedToken(key.toString());
          }
        }
      } else {
        LOGGER.debug("Token is NullValue : {}", key);
        tokenCacheRepository.removeCachedToken(key.toString());
      }
    });
    LOGGER.info("## End batch job for checking expired oauth token.");
  }

}
