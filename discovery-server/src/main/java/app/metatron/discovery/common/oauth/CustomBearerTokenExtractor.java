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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.authentication.BearerTokenExtractor;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.util.HttpUtils;

@Component
public class CustomBearerTokenExtractor extends BearerTokenExtractor {

  private static Logger LOGGER = LoggerFactory.getLogger(CustomBearerTokenExtractor.class);

  @Override
  public Authentication extract(HttpServletRequest httpServletRequest) {
    Authentication result = super.extract(httpServletRequest);
    String userHost = HttpUtils.getClientIp(httpServletRequest);
    String userAgent = httpServletRequest.getHeader("user-agent");
    if (result != null) {
      result = new PreAuthenticatedAuthenticationToken(
          result.getPrincipal() + "|" + userHost, "");
    }
    return result;
  }
}
