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
import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.SpringSecurityMessageSource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsChecker;

import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserPasswordProperties;

/**
 * Created by kyungtaak on 2017. 2. 19..
 */
public class CustomUserStatusChecker implements UserDetailsChecker {

  private MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor();

  @Autowired
  UserPasswordProperties userPasswordProperties;

  @Override
  public void check(UserDetails toCheck) {

    User user = (User) toCheck;

    if (!user.isAccountNonLocked()) {
      throw new LockedException(messages.getMessage(
          "AccountStatusUserDetailsChecker.locked", "User account is locked"));
    }

    if (userPasswordProperties.getLockCount() != null && user.getFailCnt() != null
        && user.getFailCnt() >= userPasswordProperties.getLockCount()) {
      throw new LockedException(messages.getMessage(
          "AccountStatusUserDetailsChecker.passwordLocked", new Integer[]{userPasswordProperties.getLockCount()},
          "User password is incorrect "+ userPasswordProperties.getLockCount() +" times in a row."));
    }

    // Move to CustomUserStatusPostChecker
    /*if (!user.isAccountNonExpired()) {
      throw new AccountExpiredException(
          messages.getMessage("AccountStatusUserDetailsChecker.expired",
              "User account has expired"));
    }*/

    if (!user.isCredentialsNonExpired()) {
      throw new CredentialsExpiredException(messages.getMessage(
          "AccountStatusUserDetailsChecker.credentialsExpired",
          "User credentials have expired"));
    }

    // Check Custom Status
    User.Status status = user.getStatus();

    switch (status) {
      case REQUESTED:
        throw new RequestStatusException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.userRequested",
            "Your username is being approved by system administrator. Pleases wait a minute"));
      case LOCKED:
      case REJECTED:
      case DELETED:
        throw new InactivatedStatusException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.userInactivated",
            "Username is not available. Please contact your system administrator separately."));
    }
  }

  public void setMessageSource(MessageSource messageSource) {
    this.messages = new MessageSourceAccessor(messageSource);
  }
}
