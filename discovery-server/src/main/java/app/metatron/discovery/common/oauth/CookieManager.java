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
import org.springframework.web.util.WebUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CookieManager {
  public final static String ACCESS_TOKEN = "LOGIN_TOKEN";
  public final static String TOKEN_TYPE = "LOGIN_TOKEN_TYPE";
  public final static String REFRESH_TOKEN = "REFRESH_LOGIN_TOKEN";
  public final static String LOGIN_ID = "LOGIN_USER_ID";
  public final static String PERMISSIONS = "PERMISSION";
  public final static String CURRENT_WORKSPACE = "CURRENT_WORKSPACE";
  public final static String MY_WORKSPACE = "MY_WORKSPACE";
  public final static String COOKIE_OPTION = "%s=%s; Max-age=%d; Path=/; %s";
  public final static String COOKIE_OPTION_DOMAIN = "%s=%s; Max-age=%d; Path=/; %s; Domain=%s";
  public final static String COOKIE_OPTION_SAME_SITE = "SameSite=None; Secure";

  public final static int DEFAULT_EXPIRY = 60*60*24;

  public static void addCookie(String key, String value,HttpServletResponse response) {
    addCookie(key, value, DEFAULT_EXPIRY, false, response);
  }

  public static void addCookie(String key, String value, int expiry, HttpServletResponse response) {
    addCookie(key, value, expiry, false, response);
  }

  public static void addCookie(String key, String value, String domain, HttpServletResponse response, boolean setHeader) {
    String cookieOption;

    if(StringUtils.isNotEmpty(domain)) {
      cookieOption = String.format(COOKIE_OPTION_DOMAIN, key, value, DEFAULT_EXPIRY, COOKIE_OPTION_SAME_SITE, domain);
    }else {
      cookieOption = String.format(COOKIE_OPTION, key, value, DEFAULT_EXPIRY, COOKIE_OPTION_SAME_SITE);
    }

    if (setHeader) {
      response.setHeader("Set-Cookie", cookieOption);
    } else {
      response.addHeader("Set-Cookie", cookieOption);
    }
  }

  public static void addCookie(String key, String value, int expiry, boolean isHttpOnly, HttpServletResponse response) {
    Cookie cookie = new Cookie(key, value);
    cookie.setPath("/");
    cookie.setMaxAge(expiry);
    cookie.setHttpOnly(isHttpOnly);
    response.addCookie(cookie);
  }

  public static void removeCookie(String key, HttpServletResponse response) {
    Cookie cookie = new Cookie(key, null);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
  }

  public static Cookie getAccessToken( HttpServletRequest request){
    return WebUtils.getCookie(request, ACCESS_TOKEN);
  }

  public static Cookie getRefreshToken( HttpServletRequest request){
    return WebUtils.getCookie(request, REFRESH_TOKEN);
  }

  public static void removeAllToken(HttpServletResponse response){
    removeCookie(ACCESS_TOKEN, response);
    removeCookie(TOKEN_TYPE, response);
    removeCookie(REFRESH_TOKEN, response);
    removeCookie(LOGIN_ID, response);
    removeCookie(PERMISSIONS, response);
    removeCookie(CURRENT_WORKSPACE, response);
    removeCookie(MY_WORKSPACE, response);
  }

}
