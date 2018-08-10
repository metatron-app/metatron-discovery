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

package app.metatron.discovery.util;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.user.User;

/**
 * Authentication 관련 Utility Class
 *
 */
public class AuthUtils {

  public static Authentication getAuthentication() {
    return SecurityContextHolder.getContext().getAuthentication();
  }

  /**
   * Get permissions of user
   *
   * @return permission list
   */
  public static List<String> getPermissions() {

    return getAuthentication()
                      .getAuthorities().stream()
                      .filter(auth -> auth.getAuthority().startsWith("PERM_"))
                      .map(auth -> auth.getAuthority())
                      .collect(Collectors.toList());
  }

  public static String getAuthUserName() {
    Authentication auth = getAuthentication();
    if (auth == null) {
      return "unknown";
    }

    return auth.getName();
  }

  public static void refreshAuth(User user) {
    Authentication authentication = new UsernamePasswordAuthenticationToken(user, user.getPassword(), user.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
}
