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

import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextImpl;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import app.metatron.discovery.domain.user.User;

public class SessionStatusListener implements HttpSessionListener {

  @Override
  public void sessionCreated(HttpSessionEvent httpSessionEvent) {
  }

  @Override
  public void sessionDestroyed(HttpSessionEvent httpSessionEvent) {

    HttpSession session = httpSessionEvent.getSession();
    Object context;
    try {
      context = session.getAttribute("SPRING_SECURITY_CONTEXT");
    } catch (Exception e) {
      // TODO: ExpiringSessionHttpSession 내 session 이 또있다 그게 null 체크할 방법이 없다. 버그인듯. 커스텀 Adapter로 작성할것
      return;
    }

    if (context == null) {
      return;
    }

    SecurityContextImpl springSecurityContext = (SecurityContextImpl) context;
    String sessionType = StringUtils.defaultString((String) session.getAttribute("sessionType"));
    if (springSecurityContext != null && !"logout".equals(sessionType)) {
      Authentication authentication = springSecurityContext.getAuthentication();
      User user = (User) authentication.getPrincipal();
      String name = user.getId();
      System.out.println("session expired id=>" + name);
      try {
//        queryEditorService.getUserConnClose(name);
//        queryEditorService.removeUserConnList(name);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
