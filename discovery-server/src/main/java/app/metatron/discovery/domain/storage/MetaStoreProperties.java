package app.metatron.discovery.domain.storage;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;

import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.dataconnection.dialect.MySQLDialect;

public class MetaStoreProperties implements Serializable {

  String uri;
  JdbcProperties jdbc;

  public MetaStoreProperties() {
  }

  public MetaStoreProperties(String uri, String jdbcUrl, String jdbcUsername, String jdbcPassword) {
    this.uri = uri;
    this.jdbc = new JdbcProperties(jdbcUrl, jdbcUsername, jdbcPassword);
  }

  public MetaStoreProperties(String uri, String jdbcHost, String jdbcPort, String jdbcSchema, String jdbcUsername, String jdbcPassword) {
    this.uri = uri;
    this.jdbc = new JdbcProperties(jdbcHost, jdbcPort, jdbcSchema, jdbcUsername, jdbcPassword);
  }

  public String getUri() {
    return uri;
  }

  public void setUri(String uri) {
    this.uri = uri;
  }

  public JdbcProperties getJdbc() {
    return jdbc;
  }

  public void setJdbc(JdbcProperties jdbc) {
    this.jdbc = jdbc;
  }

  public boolean includeJdbc(){
    if(jdbc == null){
      return false;
    }

    if(StringUtils.isEmpty(jdbc.getUrl())) return false;
    if(StringUtils.isEmpty(jdbc.getUsername())) return false;
    if(StringUtils.isEmpty(jdbc.getPassword())) return false;
    return true;
  }

  public static class JdbcProperties implements Serializable {
    String url;
    String username;
    String password;

    public JdbcProperties() {
    }

    public JdbcProperties(String url, String username, String password) {
      this.url = url;
      this.username = username;
      this.password = password;
    }

    public JdbcProperties(String host, String port, String schema, String username, String password) {
      StringBuilder builder = new StringBuilder();
      builder.append(MySQLDialect.MYSQL_URL_PREFIX);
      builder.append(HiveDialect.URL_SEP);

      if(StringUtils.isNotEmpty(host)){
        builder.append(host);
      }
      if(StringUtils.isNotEmpty(port)){
        builder.append(":").append(port);
      }
      if(StringUtils.isNotEmpty(schema)){
        builder.append(HiveDialect.URL_SEP).append(schema);
      }
      this.url = builder.toString();
      this.username = username;
      this.password = password;
    }

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }

    @Override
    public String toString() {
      return "MetaStoreProperties{" +
          ", url='" + url + '\'' +
          ", username='" + username + '\'' +
          ", password=" + password +
          '}';
    }
  }

  @Override
  public String toString() {
    return "MetaStoreProperties{" +
        ", uri='" + uri + '\'' +
        ", jdbc=" + getJdbc() +
        '}';
  }
}
