package app.metatron.discovery.common.oauth.token.cache;

import java.io.Serializable;
import java.util.Date;

/**
 *
 */
public class CachedRefreshToken implements Serializable {
  public String token;
  public Date expiration;

  public CachedRefreshToken(Date expiration) {
    this.expiration = expiration;
  }

  public CachedRefreshToken(String token, Date expiration) {
    this.token = token;
    this.expiration = expiration;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public Date getExpiration() {
    return expiration;
  }

  public void setExpiration(Date expiration) {
    this.expiration = expiration;
  }
}
