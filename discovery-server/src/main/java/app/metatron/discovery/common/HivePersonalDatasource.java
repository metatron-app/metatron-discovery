package app.metatron.discovery.common;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;

public class HivePersonalDatasource implements Serializable {
  private String datasourceName;
  private String hdfsConfPath;
  private String adminName;
  private String adminPassword;
  private String personalDatabasePrefix;

  public HivePersonalDatasource() {
  }

  public HivePersonalDatasource(String datasourceName, String hdfsConfPath, String adminName, String adminPassword, String personalDatabasePrefix) {
    this.datasourceName = datasourceName;
    this.hdfsConfPath = hdfsConfPath;
    this.adminName = adminName;
    this.adminPassword = adminPassword;
    this.personalDatabasePrefix = personalDatabasePrefix;
  }

  public String getDatasourceName() {
    return datasourceName;
  }

  public void setDatasourceName(String datasourceName) {
    this.datasourceName = datasourceName;
  }

  public String getHdfsConfPath() {
    return hdfsConfPath;
  }

  public void setHdfsConfPath(String hdfsConfPath) {
    this.hdfsConfPath = hdfsConfPath;
  }

  public String getAdminName() {
    return adminName;
  }

  public void setAdminName(String adminName) {
    this.adminName = adminName;
  }

  public String getAdminPassword() {
    return adminPassword;
  }

  public void setAdminPassword(String adminPassword) {
    this.adminPassword = adminPassword;
  }

  public String getPersonalDatabasePrefix() {
    return personalDatabasePrefix;
  }

  public void setPersonalDatabasePrefix(String personalDatabasePrefix) {
    this.personalDatabasePrefix = personalDatabasePrefix;
  }

  public boolean isValidate() {
    return StringUtils.isNotEmpty(this.hdfsConfPath)
      && StringUtils.isNotEmpty(this.adminName)
      && StringUtils.isNotEmpty(this.adminPassword)
      && StringUtils.isNotEmpty(this.personalDatabasePrefix);
  }
}
