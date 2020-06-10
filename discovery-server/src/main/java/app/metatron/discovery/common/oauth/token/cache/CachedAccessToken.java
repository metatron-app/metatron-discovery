package app.metatron.discovery.common.oauth.token.cache;

import java.io.Serializable;
import java.util.Date;

/**
 *
 */
public class CachedAccessToken implements Serializable {
  public String token;
  public String refreshToken;
  public String username;
  public String clientId;
  public String clientIp;
  public Date expiration;

  public CachedAccessToken(String token, String refreshToken, String username, Date expiration, String clientId, String clientIp) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.username = username;
    this.expiration = expiration;
    this.clientId = clientId;
    this.clientIp = clientIp;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getClientIp() {
    return clientIp;
  }

  public void setClientIp(String clientIp) {
    this.clientIp = clientIp;
  }

  public Date getExpiration() {
    return expiration;
  }

  public void setExpiration(Date expiration) {
    this.expiration = expiration;
  }
}
