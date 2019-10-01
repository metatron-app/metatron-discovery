package app.metatron.discovery.domain.dataprep.util;

public class DbInfo {
  public String implementor;
  public String connectUri;
  public String username;
  public String password;

  public DbInfo(String implementor, String connectUri, String username, String password) {
    this.implementor = implementor;
    this.connectUri = connectUri;
    this.username = username;
    this.password = password;
  }
}
