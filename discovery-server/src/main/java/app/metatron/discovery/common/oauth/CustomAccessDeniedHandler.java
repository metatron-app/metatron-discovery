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

import app.metatron.discovery.common.exception.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.util.AuthUtils;

public class CustomAccessDeniedHandler implements AccessDeniedHandler {

  private static Logger LOGGER = LoggerFactory.getLogger(CustomAccessDeniedHandler.class);

  @Override
  public void handle(HttpServletRequest request,
                     HttpServletResponse response,
                     AccessDeniedException accessDeniedException) throws IOException, ServletException {

    String message = String.format("User(%s) attempted to access the protected URI: %s", AuthUtils.getAuthUserName(), request.getRequestURI());

    LOGGER.warn(message);

    if("text/html".equals(request.getContentType())) {
      //response.sendRedirect(request.getContextPath() + "/accessDenied");
      response.getWriter().println("TBD");
    } else {
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      ErrorResponse errorResponse = new ErrorResponse(GlobalErrorCodes.ACCESS_DENIED_CODE,
                                                      "Access denied.",
                                                      message);
      response.getWriter().print(GlobalObjectMapper.writeValueAsString(errorResponse));
    }
  }
}
