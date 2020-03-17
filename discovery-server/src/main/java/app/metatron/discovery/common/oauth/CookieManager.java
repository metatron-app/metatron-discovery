package app.metatron.discovery.common.oauth;

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
  public final static int DEFAULT_EXPIRY = 60*60*24;

  public static void addCookie(String key, String value,HttpServletResponse response) {
    addCookie(key, value, DEFAULT_EXPIRY, false, response);
  }

  public static void addCookie(String key, String value, int expiry, HttpServletResponse response) {
    addCookie(key, value, expiry, false, response);
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

  public static void removeAllToken(HttpServletResponse response){
    removeCookie(ACCESS_TOKEN, response);
    removeCookie(TOKEN_TYPE, response);
    removeCookie(REFRESH_TOKEN, response);
    removeCookie(LOGIN_ID, response);
    removeCookie(PERMISSIONS, response);
  }

}
