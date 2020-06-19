package app.metatron.discovery.common.oauth.token.cache;

import java.io.Serializable;

/**
 *
 */
public class CachedWhitelistToken implements Serializable {
  public String token;
  public String username;
  public String clientId;
  public String userHost;

  public CachedWhitelistToken(String token, String username, String clientId, String userHost) {
    this.token = token;
    this.username = username;
    this.clientId = clientId;
    this.userHost = userHost;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
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

  public String getUserHost() {
    return userHost;
  }

  public void setUserHost(String userHost) {
    this.userHost = userHost;
  }
}
