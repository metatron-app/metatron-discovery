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

import app.metatron.discovery.common.oauth.CustomBearerTokenExtractor;
import app.metatron.discovery.common.oauth.token.cache.CachedToken;
import app.metatron.discovery.common.oauth.token.cache.TokenCacheRepository;
import app.metatron.discovery.util.HttpUtils;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.authentication.TokenExtractor;
import org.springframework.security.oauth2.provider.token.TokenStore;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Date;

/**
 *
 */
public class RefreshTokenRetentionFilter implements Filter {

  private static Logger LOGGER = LoggerFactory.getLogger(RefreshTokenRetentionFilter.class);

  private TokenCacheRepository tokenCacheRepository;

  private TokenExtractor tokenExtractor = new CustomBearerTokenExtractor();

  private TokenStore tokenStore;

  public void setTokenCacheRepository(TokenCacheRepository tokenCacheRepository) {
    this.tokenCacheRepository = tokenCacheRepository;
  }

  public void setTokenStore(TokenStore tokenStore) { this.tokenStore = tokenStore; }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    try {
      final HttpServletRequest httpServletRequest = (HttpServletRequest) request;
      Authentication authentication = tokenExtractor.extract(httpServletRequest);
      if (authentication != null) {
        String accessToken = getAccessToken(authentication);
        OAuth2Authentication oAuth2Authentication = tokenStore.readAuthentication(accessToken);
        String clientId = oAuth2Authentication.getOAuth2Request().getClientId();
        if (tokenCacheRepository.isTimeoutClientDetails(clientId)) {
          String username = oAuth2Authentication.getName();
          String userHost = HttpUtils.getClientIp(httpServletRequest);
          CachedToken cachedToken = tokenCacheRepository.getCachedToken(username, clientId, userHost);
          if (cachedToken != null) {
            Date newRefreshTokenExpiration = DateTime.now().plusSeconds(tokenCacheRepository.getRefreshTokenValiditySeconds(clientId)).toDate();
            LOGGER.debug("Token ({}) expiration retention to {} from {}", username + "|" + clientId + "|" + userHost,
                         newRefreshTokenExpiration, cachedToken.getExpiration());
            tokenCacheRepository.putRefreshCachedToken(username, clientId, userHost, newRefreshTokenExpiration);
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

  private String getAccessToken(Authentication authentication) {
    String accessToken = authentication.getPrincipal().toString();
    if (accessToken.indexOf("|") > -1) {
      accessToken = accessToken.split("\\|")[0];
    }
    return accessToken;
  }
}
