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

package app.metatron.discovery.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

import java.text.SimpleDateFormat;
import java.util.Date;

import app.metatron.discovery.common.exception.ErrorResponse;
import app.metatron.discovery.domain.revision.MetatronRevisionDto;

public class StatLogger {
  private static Logger LOGGER = LoggerFactory.getLogger(StatLogger.class);

  public static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";

  private static final String DELIMITER = ";";

  public static void revision(MetatronRevisionDto metatronRevisionDto) {
    if (LOGGER.isInfoEnabled()) {
      StringBuffer stringBuffer = new StringBuffer(metatronRevisionDto.getRevisionDate());
      stringBuffer.append(DELIMITER).append(metatronRevisionDto.getRevisionType())
                  .append(DELIMITER).append(metatronRevisionDto.getTargetId())
                  .append(DELIMITER).append(metatronRevisionDto.getTargetType())
                  .append(DELIMITER).append(GlobalObjectMapper.writeValueAsString(metatronRevisionDto.getAdditionalInformation()));
      LOGGER.info(stringBuffer.toString());
    }
  }

  public static void login(String userName, String clientId, String userHost, String userAgent) {
    if (LOGGER.isInfoEnabled()) {
      StringBuffer stringBuffer = print("LOGIN", userName, clientId, userHost, userAgent);
      LOGGER.info(stringBuffer.toString());
    }
  }

  public static void loginFail(ErrorResponse errorResponse, String userName, String clientId, String userHost, String userAgent) {
    if (LOGGER.isInfoEnabled()) {
      StringBuffer stringBuffer = print("LOGIN_FAIL", userName, clientId, userHost, userAgent);
      stringBuffer.append(DELIMITER).append(GlobalObjectMapper.writeValueAsString(errorResponse));
      LOGGER.info(stringBuffer.toString());
    }
  }

  public static void logout(OAuth2Authentication oAuth2Authentication, String userHost, String userAgent) {
    if (LOGGER.isInfoEnabled()) {
      StringBuffer stringBuffer = print("LOGOUT", oAuth2Authentication.getPrincipal().toString(),
                                        oAuth2Authentication.getOAuth2Request().getClientId(), userHost, userAgent);
      LOGGER.info(stringBuffer.toString());
    }
  }

  private static StringBuffer print(String mode, String userName, String clientId, String userHost, String userAgent) {
    StringBuffer stringBuffer = new StringBuffer(new SimpleDateFormat(DATE_FORMAT).format(new Date()));
    stringBuffer.append(DELIMITER).append(mode)
                .append(DELIMITER).append(userName)
                .append(DELIMITER).append(clientId)
                .append(DELIMITER).append(userHost)
                .append(DELIMITER).append(userAgent);
    return stringBuffer;
  }


}
