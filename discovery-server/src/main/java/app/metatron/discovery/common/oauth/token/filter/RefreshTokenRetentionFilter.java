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

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.authentication.BearerTokenExtractor;
import org.springframework.security.oauth2.provider.authentication.TokenExtractor;

import java.io.IOException;
import java.util.Date;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.common.oauth.OauthProperties;
import app.metatron.discovery.common.oauth.token.JwtTokenUtil;
import app.metatron.discovery.common.oauth.token.cache.AccessTokenCacheRepository;
import app.metatron.discovery.common.oauth.token.cache.RefreshTokenCacheRepository;

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
    try{
      String requestURI = ((HttpServletRequest) request).getRequestURI();
      if(requestURI.startsWith("/api")){
        final HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        Authentication authentication = tokenExtractor.extract(httpServletRequest);
        if(authentication != null){
          String accessToken = authentication.getPrincipal().toString();
          AccessTokenCacheRepository.CachedAccessToken cachedAccessToken
              = accessTokenCacheRepository.getCachedAccessToken(authentication.getPrincipal().toString());

          LOGGER.debug("Access token for cached token {}", JwtTokenUtil.getTokenForDebug(accessToken));

          if(cachedAccessToken != null){
            String refreshTokenKey = cachedAccessToken.getRefreshToken();
            RefreshTokenCacheRepository.CachedRefreshToken cachedRefreshToken
                = refreshTokenCacheRepository.getCachedRefreshToken(refreshTokenKey);

            LOGGER.debug("Refresh token in cached token {}", JwtTokenUtil.getTokenForDebug(refreshTokenKey));

            Date newRefreshTokenExpiration = DateTime.now().plusSeconds(oauthProperties.getTimeout()).toDate();

            LOGGER.debug("Refresh token ({}) expiration retention to {} from {}", JwtTokenUtil.getTokenForDebug(refreshTokenKey),
                         newRefreshTokenExpiration, cachedRefreshToken.getExpiration());
            // update refresh token expiration in cache
            refreshTokenCacheRepository.putRefreshToken(refreshTokenKey, newRefreshTokenExpiration);
          }
        }
      }
    } catch (Exception e){
      e.printStackTrace();
    }
    chain.doFilter(request, response);
  }

  @Override
  public void destroy() {

  }
}
