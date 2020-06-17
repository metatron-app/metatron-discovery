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

package app.metatron.discovery.common.oauth;

import app.metatron.discovery.common.StatLogger;
import app.metatron.discovery.common.exception.ErrorResponse;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.util.HttpUtils;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.security.oauth2.provider.error.DefaultWebResponseExceptionTranslator;

import java.io.UnsupportedEncodingException;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.security.oauth2.common.exceptions.OAuth2Exception.INVALID_GRANT;
import static org.springframework.security.oauth2.common.exceptions.OAuth2Exception.INVALID_TOKEN;

public class CustomWebResponseExceptionTranslator extends DefaultWebResponseExceptionTranslator {
  private static Logger LOGGER = LoggerFactory.getLogger(StatLogger.class);

  @Autowired
  private HttpServletRequest request;

  @Override
  public ResponseEntity<OAuth2Exception> translate(Exception e) throws Exception {

    ResponseEntity<OAuth2Exception> responseEntity = super.translate(e);

    HttpHeaders headers = new HttpHeaders();
    headers.setAll(responseEntity.getHeaders().toSingleValueMap());

    ErrorResponse errorResponse;
    OAuth2Exception oAuth2Exception = responseEntity.getBody();
    switch (oAuth2Exception.getOAuth2ErrorCode()) {
      case INVALID_TOKEN:
        errorResponse = new ErrorResponse(GlobalErrorCodes.INVALID_TOKEN_CODE,
                                          oAuth2Exception.getOAuth2ErrorCode(),
                                          oAuth2Exception.getMessage());
        break;
      case INVALID_GRANT:
        errorResponse = new ErrorResponse(GlobalErrorCodes.INVALID_USERNAME_PASSWORD_CODE,
                                          oAuth2Exception.getOAuth2ErrorCode(),
                                          oAuth2Exception.getMessage());
        break;
      default:
        errorResponse = new ErrorResponse(GlobalErrorCodes.AUTH_ERROR_CODE,
                                          oAuth2Exception.getOAuth2ErrorCode(),
                                          oAuth2Exception.getMessage());
    }

    try {
      String authHeader = request.getHeader("Authorization");
      if (StringUtils.isNotEmpty(authHeader) && !authHeader.startsWith("Bearer")) {
        String userName = request.getParameter("username");
        String clientId = BasicTokenExtractor.extractClientId(authHeader);
        String userHost = HttpUtils.getClientIp(request);
        String userAgent = request.getHeader("user-agent");
        if ("password".equals(request.getParameter("grant_type"))) {
          StatLogger.loginFail(errorResponse, userName, clientId, userHost, userAgent);
        }
      }
    } catch (UnsupportedEncodingException ex) {
      LOGGER.debug("authHeader : {}", request.getHeader("Authorization"));
      LOGGER.debug("userName : {}", request.getParameter("username"));
      LOGGER.debug("userHost : {}", HttpUtils.getClientIp(request));
      LOGGER.debug("userAgent : {}", request.getHeader("user-agent"));
      LOGGER.error(ex.getMessage());
    } catch (IllegalStateException ex) {
      LOGGER.error(ex.getMessage());
    } catch (Exception ex) {
      LOGGER.error(ex.getMessage(), ex);
    }

    return new ResponseEntity<>(new CustomOAuth2Exception(errorResponse, oAuth2Exception), headers, responseEntity.getStatusCode());
  }
}
