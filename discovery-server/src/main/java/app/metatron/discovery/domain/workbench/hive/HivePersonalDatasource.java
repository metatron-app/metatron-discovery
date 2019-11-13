package app.metatron.discovery.domain.workbench.hive;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.Map;

public class HivePersonalDatasource implements Serializable {
  private String hdfsConfPath;
  private String adminName;
  private String adminPassword;
  private String personalDatabasePrefix;

  public HivePersonalDatasource(Map<String, String> properties) {
    this.hdfsConfPath = properties.getOrDefault("hdfs-conf-path", "");
    this.adminName = properties.getOrDefault("admin-name", "");
    this.adminPassword = properties.getOrDefault("admin-password", "");
    this.personalDatabasePrefix = properties.getOrDefault("personal-database-prefix", "");
  }

  public HivePersonalDatasource(String hdfsConfPath, String adminName, String adminPassword, String personalDatabasePrefix) {
    this.hdfsConfPath = hdfsConfPath;
    this.adminName = adminName;
    this.adminPassword = adminPassword;
    this.personalDatabasePrefix = personalDatabasePrefix;
  }

  public String getHdfsConfPath() {
    return hdfsConfPath;
  }

  public String getAdminName() {
    return adminName;
  }

  public String getAdminPassword() {
    return adminPassword;
  }

  public String getPersonalDatabasePrefix() {
    return personalDatabasePrefix;
  }

  public boolean isValidate() {
    return StringUtils.isNotEmpty(this.hdfsConfPath)
      && StringUtils.isNotEmpty(this.adminName)
      && StringUtils.isNotEmpty(this.adminPassword)
      && StringUtils.isNotEmpty(this.personalDatabasePrefix);
  }
}
