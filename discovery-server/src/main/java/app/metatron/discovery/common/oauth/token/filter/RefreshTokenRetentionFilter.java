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
package app.metatron.discovery.common.oauth.token.filter;

import app.metatron.discovery.common.oauth.OauthProperties;
import app.metatron.discovery.common.oauth.token.JwtTokenUtil;
import app.metatron.discovery.common.oauth.token.cache.AccessTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.CachedAccessToken;
import app.metatron.discovery.common.oauth.token.cache.CachedRefreshToken;
import app.metatron.discovery.common.oauth.token.cache.RefreshTokenCacheRepository;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.authentication.BearerTokenExtractor;
import org.springframework.security.oauth2.provider.authentication.TokenExtractor;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Date;

/**
 *
 */
public class RefreshTokenRetentionFilter implements Filter {

  private static Logger LOGGER = LoggerFactory.getLogger(RefreshTokenRetentionFilter.class);

  private AccessTokenCacheRepository accessTokenCacheRepository;

  private RefreshTokenCacheRepository refreshTokenCacheRepository;

  private OauthProperties oauthProperties;

  private TokenExtractor tokenExtractor = new BearerTokenExtractor();

  public void setAccessTokenCacheRepository(AccessTokenCacheRepository accessTokenCacheRepository) {
    this.accessTokenCacheRepository = accessTokenCacheRepository;
  }

  public void setRefreshTokenCacheRepository(RefreshTokenCacheRepository refreshTokenCacheRepository) {
    this.refreshTokenCacheRepository = refreshTokenCacheRepository;
  }

  public void setOauthProperties(OauthProperties oauthProperties) {
    this.oauthProperties = oauthProperties;
  }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    try {
      if (oauthProperties.getTimeout() > -1) {
        final HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        Authentication authentication = tokenExtractor.extract(httpServletRequest);
        if (authentication != null) {
          String accessToken = authentication.getPrincipal().toString();
          CachedAccessToken cachedAccessToken
                  = accessTokenCacheRepository.getCachedAccessToken(authentication.getPrincipal().toString());

          LOGGER.debug("Access token for cached token {}", JwtTokenUtil.getTokenForDebug(accessToken));

          if (cachedAccessToken != null) {
            String refreshTokenKey = cachedAccessToken.getRefreshToken();
            CachedRefreshToken cachedRefreshToken
                    = refreshTokenCacheRepository.getCachedRefreshToken(refreshTokenKey);

            LOGGER.debug("Refresh token in cached token {}", JwtTokenUtil.getTokenForDebug(refreshTokenKey));

            Date newRefreshTokenExpiration = DateTime.now().plusSeconds(oauthProperties.getTimeout()).toDate();

            LOGGER.debug("Refresh token ({}) expiration retention to {} from {}",
                    JwtTokenUtil.getTokenForDebug(refreshTokenKey),
                    newRefreshTokenExpiration, cachedRefreshToken.getExpiration());
            // update refresh token expiration in cache
            refreshTokenCacheRepository.putRefreshToken(refreshTokenKey, newRefreshTokenExpiration);
          }
        }
      }
    } catch (Exception e) {
      LOGGER.error("Fail to Refresh token retention range : {}", e.getMessage());
    }
    chain.doFilter(request, response);
  }

  @Override
  public void destroy() {

  }
}
