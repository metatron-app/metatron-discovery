package app.metatron.discovery.domain.dataprep.util;

import java.util.Map;

public class DbInfo {
  public String implementor;
  public String connectUri;
  public String username;
  public String password;

  public DbInfo() {
  }

  public DbInfo(Map<String, Object> dsInfo) {
    implementor = (String) dsInfo.get("implementor");
    connectUri = (String) dsInfo.get("connectUri");
    username = (String) dsInfo.get("username");
    password = (String) dsInfo.get("password");
  }
}
