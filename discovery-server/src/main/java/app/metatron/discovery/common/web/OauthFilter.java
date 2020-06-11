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

package app.metatron.discovery.common.web;

import app.metatron.discovery.common.oauth.CookieManager;
import app.metatron.discovery.config.ApiResourceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by kyungtaak on 2016. 11. 20..
 */
public class OauthFilter implements Filter {

  private static Logger LOGGER = LoggerFactory.getLogger(OauthFilter.class);

  private AuthenticationManager authenticationManager;

  public final String OAUTH_URL = "/api/oauth/client/login";

  public OauthFilter(AuthenticationManager authenticationManager) {
    this.authenticationManager = authenticationManager;
  }

  @Override
  public void init(FilterConfig filterConfig) {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse res = (HttpServletResponse) response;

    String requestUrl = req.getRequestURL().toString();
    LOGGER.info("[CHK] requestURL : {}", requestUrl);
    LOGGER.info("[CHK] requestURL : {}", req.getRequestURI());
    if (requestUrl.endsWith("/oauth/authorize")) {
      Cookie loginToken = CookieManager.getAccessToken(req);
      if (loginToken != null) {
        LOGGER.debug("loginToken.getValue() : {}", loginToken.getValue());
        try {
          Authentication authentication = authenticationManager
                  .authenticate(new PreAuthenticatedAuthenticationToken(loginToken.getValue(), ""));
          SecurityContextHolder.getContext().setAuthentication(authentication);
          LOGGER.info("authentication is {}", authentication);
        } catch (OAuth2Exception e) {
          LOGGER.error(e.getSummary());
          // req.getRequestDispatcher(OAUTH_URL).forward(request, response);
          String queryStr = req.getQueryString();
          LOGGER.info("[CHK] QueryString :: {}", queryStr);
          res.sendRedirect(ApiResourceConfig.APP_UI_ROUTE_PREFIX + "user/login/oauth?" + queryStr);
          return;
        }
      } else {
        // req.getRequestDispatcher(OAUTH_URL).forward(request, response);
        String queryStr = req.getQueryString();
        LOGGER.info("[CHK] QueryString :: {}", queryStr);
        res.sendRedirect(ApiResourceConfig.APP_UI_ROUTE_PREFIX + "user/login/oauth?" + queryStr);
        return;
      }
    }

    chain.doFilter(request, response);
  }

  @Override
  public void destroy() {

  }

}
