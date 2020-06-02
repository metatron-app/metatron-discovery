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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.domain.user.UserPasswordProperties;
import app.metatron.discovery.domain.user.UserService;

/**
 * Created by kyungtaak on 2017. 1. 25..
 */
public class CustomDaoAuthenticationProvider extends DaoAuthenticationProvider {

  @Autowired
  private HttpServletRequest request;

  @Autowired
  private UserService userService;

  @Autowired
  UserPasswordProperties userPasswordProperties;

  protected void additionalAuthenticationChecks(UserDetails userDetails,
                                                UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {

    try {
      super.additionalAuthenticationChecks(userDetails, authentication);
    } catch (BadCredentialsException e) {
      if (userPasswordProperties.getLockCount() != null) {
        Integer failCnt = userService.addFailCount(request.getParameter("username"));
        if (failCnt != null && userPasswordProperties.getLockCount() != null) {
          String message;
          if (failCnt == userPasswordProperties.getLockCount()) {
            message = messages.getMessage(
                "AccountStatusUserDetailsChecker.passwordLocked", new Integer[]{userPasswordProperties.getLockCount()},
                "User password is incorrect "+ userPasswordProperties.getLockCount() +" times in a row.");
          } else {
            message = messages.getMessage("AccountStatusUserDetailsChecker.passwordNotMatched"
                , new Integer[]{failCnt, userPasswordProperties.getLockCount()}
                , e.getMessage());
          }
          throw new BadCredentialsException(message);
        }
      }
      throw new BadCredentialsException(e.getMessage());
    }

  }
}
