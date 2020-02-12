package app.metatron.discovery.domain.idcube;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "id-cube")
public class IdCubeProperties {
  private Security security = new Security();
  public static class Security {
    private String cipherSecretKey;

    public String getCipherSecretKey() {
      return cipherSecretKey;
    }

    public void setCipherSecretKey(String cipherSecretKey) {
      this.cipherSecretKey = cipherSecretKey;
    }
  }

  private Auth auth = new Auth();
  public static class Auth {
    private String loginDelegationUrl;
    private int sessionTimeoutSeconds = 0;

    public String getLoginDelegationUrl() {
      return loginDelegationUrl;
    }

    public void setLoginDelegationUrl(String loginDelegationUrl) {
      this.loginDelegationUrl = loginDelegationUrl;
    }

    public int getSessionTimeoutSeconds() {
      return sessionTimeoutSeconds;
    }

    public void setSessionTimeoutSeconds(int sessionTimeoutSeconds) {
      this.sessionTimeoutSeconds = sessionTimeoutSeconds;
    }
  }

  public Security getSecurity() {
    return security;
  }

  public void setSecurity(Security security) {
    this.security = security;
  }

  public Auth getAuth() {
    return auth;
  }

  public void setAuth(Auth auth) {
    this.auth = auth;
  }
}