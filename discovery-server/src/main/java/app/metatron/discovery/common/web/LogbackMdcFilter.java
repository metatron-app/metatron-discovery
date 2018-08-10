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

import org.slf4j.MDC;

import java.io.IOException;
import java.security.Principal;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * Created by kyungtaak on 2016. 7. 13..
 */
public class LogbackMdcFilter implements Filter {

  private final String CLIENT_USERNAME = "username";
  private final String CLIENT_IP = "ip";

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    HttpServletRequest req = (HttpServletRequest) request;
    Principal principal = req.getUserPrincipal();

    MDC.put(CLIENT_IP, getClientIP(req));

    if (principal != null) {
      String username = principal.getName();
      MDC.put(CLIENT_USERNAME, username);
    } else {
      MDC.put(CLIENT_USERNAME, "UNKNOWN");
    }


    try {
      chain.doFilter(request, response);
    } finally {
      MDC.clear();
    }

  }

  private String getClientIP(HttpServletRequest req) {

    String ip = req.getHeader("X-FORWARDED-FOR");
    if (ip == null) {
      ip = req.getRemoteAddr();
    }

    return ip;
  }

  @Override
  public void destroy() {
  }
}
