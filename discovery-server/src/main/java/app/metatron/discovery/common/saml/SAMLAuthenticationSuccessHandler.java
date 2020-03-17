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

package app.metatron.discovery.common.saml;

import org.opensaml.ws.message.encoder.MessageEncodingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.providers.ExpiringUsernameAuthenticationToken;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.oauth.CookieManager;
import app.metatron.discovery.util.AuthUtils;

public class SAMLAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(SAMLAuthenticationSuccessHandler.class);
  
  @Autowired
  JwtAccessTokenConverter jwtAccessTokenConverter;

  @Autowired
  DefaultTokenServices defaultTokenServices;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws ServletException, IOException {
    LOGGER.debug("authentication = {}", authentication);

    String userName = null;
    try{
      SAMLAuthenticationInfo samlAuthenticationInfo = new SAMLAuthenticationInfo(authentication);
      LOGGER.debug(samlAuthenticationInfo.toString());
      userName = samlAuthenticationInfo.getGeneral().getName();
    }catch (MessageEncodingException e){

    }

    //1. UsernamePasswordAuthenticationToken -> OAuth2Authentication
    ExpiringUsernameAuthenticationToken token = (ExpiringUsernameAuthenticationToken) authentication;

    HashMap<String, String> authorizationParameters = new HashMap<String, String>();
    authorizationParameters.put("scope", "read");
    authorizationParameters.put("username", "user");
    authorizationParameters.put("client_id", "client_id");
    authorizationParameters.put("grant", "password");

    Set<String> responseType = new HashSet<String>();
    responseType.add("password");

    Set<String> scopes = new HashSet<String>();
    scopes.add("read");
    scopes.add("write");

    OAuth2Request authorizationRequest = new OAuth2Request(
            authorizationParameters, "polaris_client",
            token.getAuthorities(), true, scopes, null, "",
            responseType, null);

    OAuth2Authentication oAuth2Authentication = new OAuth2Authentication(authorizationRequest, token);
    oAuth2Authentication.setAuthenticated(true);

    //2. Create OAuth2 Token (converted JWT Token via JWTTokenEnhancer)
    OAuth2AccessToken oAuth2AccessToken = defaultTokenServices.createAccessToken(oAuth2Authentication);
    LOGGER.debug("oAuth2AccessToken = " + oAuth2AccessToken);

    SecurityContext context = SecurityContextHolder.getContext();
    Authentication auth = context.getAuthentication();
    List<String> permissions = AuthUtils.getPermissions();
    LOGGER.debug("permissions = " + permissions);

    //3. Write Cookie
    getResponse(oAuth2AccessToken, response, userName, permissions);

    super.onAuthenticationSuccess(request, response, authentication);
  }

  private void getResponse(OAuth2AccessToken accessToken, HttpServletResponse response, String userName, List<String> permissions) {
    CookieManager.addCookie(CookieManager.ACCESS_TOKEN, accessToken.getValue(), response);
    CookieManager.addCookie(CookieManager.TOKEN_TYPE, accessToken.getTokenType(), response);
    CookieManager.addCookie(CookieManager.REFRESH_TOKEN, accessToken.getRefreshToken().getValue(), response);
    CookieManager.addCookie(CookieManager.LOGIN_ID, userName, response);
    CookieManager.addCookie(CookieManager.PERMISSIONS, String.join( "==", permissions ), response);

    response.setHeader("P3P","CP=\"IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT\"");


  }
}
