package app.metatron.discovery.domain.idcube.hive_personal_database;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;

import java.util.Map;

public class DataAggregateDataConnection implements JdbcConnectInformation {
  private AuthenticationType authenticationType;
  private String implementor;
  private String url;
  private String options;
  private String hostname;
  private Integer port;
  private String database;
  private String sid;
  private String catalog;
  private String properties;
  private String username;
  private String password;
  private String adminUsername;
  private String adminUserPassword;

  public DataAggregateDataConnection(DataConnection dataConnection, String adminUsername, String adminUserPassword) {
    authenticationType = dataConnection.getAuthenticationType();
    implementor = dataConnection.getImplementor();
    url = dataConnection.getUrl();
    options = dataConnection.getOptions();
    hostname = dataConnection.getHostname();
    port = dataConnection.getPort();
    database = dataConnection.getDatabase();
    sid = dataConnection.getSid();
    catalog = dataConnection.getCatalog();
    properties = dataConnection.getProperties();
    username = dataConnection.getUsername();
    password = dataConnection.getPassword();
    this.adminUsername = adminUsername;
    this.adminUserPassword = adminUserPassword;
  }

  @Override
  public AuthenticationType getAuthenticationType() {
    return this.authenticationType;
  }

  @Override
  public String getImplementor() {
    return this.implementor;
  }

  @Override
  public String getUrl() {
    return this.url;
  }

  @Override
  public String getOptions() {
    return this.options;
  }

  @Override
  public String getHostname() {
    return this.hostname;
  }

  @Override
  public Integer getPort() {
    return this.port;
  }

  @Override
  public String getDatabase() {
    return this.database;
  }

  @Override
  public String getSid() {
    return this.sid;
  }

  @Override
  public String getCatalog() {
    return this.catalog;
  }

  @Override
  public String getProperties() {
    return this.properties;
  }

  @Override
  public String getUsername() {
    return this.username;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public Map<String, String> getPropertiesMap() {
    return GlobalObjectMapper.readValue(this.properties, Map.class);
  }

  public String getAdminUsername() {
    return adminUsername;
  }

  public String getAdminUserPassword() {
    return adminUserPassword;
  }
}
