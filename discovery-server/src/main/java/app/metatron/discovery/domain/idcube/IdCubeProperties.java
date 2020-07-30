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

  private Imsi imsi = new Imsi();

  public static class Imsi {
    private SmsServer smsServer = new SmsServer();
    private CipherServer cipherServer = new CipherServer();

    public static class SmsServer {
      private String apiUrl;
      private String apiKey;
      private String senderCellPhoneNo;
      private String senderName;

      public String getApiUrl() {
        return apiUrl;
      }

      public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
      }

      public String getApiKey() {
        return apiKey;
      }

      public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
      }

      public String getSenderCellPhoneNo() {
        return senderCellPhoneNo;
      }

      public void setSenderCellPhoneNo(String senderCellPhoneNo) {
        this.senderCellPhoneNo = senderCellPhoneNo;
      }

      public String getSenderName() {
        return senderName;
      }

      public void setSenderName(String senderName) {
        this.senderName = senderName;
      }
    }

    public static class CipherServer {
      private String apiUrl;
      private String apiKey;

      public String getApiUrl() {
        return apiUrl;
      }

      public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
      }

      public String getApiKey() {
        return apiKey;
      }

      public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
      }
    }

    public SmsServer getSmsServer() {
      return smsServer;
    }

    public void setSmsServer(SmsServer smsServer) {
      this.smsServer = smsServer;
    }

    public CipherServer getCipherServer() {
      return cipherServer;
    }

    public void setCipherServer(CipherServer cipherServer) {
      this.cipherServer = cipherServer;
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

  public Imsi getImsi() {
    return imsi;
  }

  public void setImsi(Imsi imsi) {
    this.imsi = imsi;
  }
}