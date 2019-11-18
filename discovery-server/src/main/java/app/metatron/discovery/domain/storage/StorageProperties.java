/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.storage;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;

@Component
@ConfigurationProperties(prefix = "polaris.storage")
@ConditionalOnProperty("polaris.storage.stagedb.hostname")
public class StorageProperties {

  public enum StorageType{
    STAGEDB,
    S3
  }

  StageDBConnection stagedb;
  S3Connection s3;

  public StorageProperties() {
  }

  @PostConstruct
  public void init() {
    // For the Backwards compatibility.
    if(stagedb.getMetastore() == null) {
      stagedb.setMetastore(new MetaStoreProperties(stagedb.getMetastoreUri(),
                                                   stagedb.getMetastoreHost(),
                                                   stagedb.getMetastorePort(),
                                                   stagedb.getMetastoreSchema(),
                                                   stagedb.getMetastoreUserName(),
                                                   stagedb.getMetastorePassword()));
    }

    if(stagedb.getMetastoreUri() == null) {
      stagedb.setMetastoreUri(stagedb.getMetastore().getUri());
    }
  }

  public StageDBConnection getStagedb() {
    return stagedb;
  }

  public void setStagedb(StageDBConnection stagedb) {
    this.stagedb = stagedb;
  }

  public static class StageDBConnection implements Serializable {
    String hostname;
    Integer port;
    String username;
    String password;
    String url;
    String metastoreUri;
    boolean strictMode;
    String metastoreHost;
    String metastorePort;
    String metastoreSchema;
    String metastoreUserName;
    String metastorePassword;

    MetaStoreProperties metastore;

    public String getHostname() {
      return hostname;
    }

    public void setHostname(String hostname) {
      this.hostname = hostname;
    }

    public Integer getPort() {
      return port;
    }

    public void setPort(Integer port) {
      this.port = port;
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

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }

    public String getMetastoreUri() {
      return metastoreUri;
    }

    public void setMetastoreUri(String metastoreUri) {
      this.metastoreUri = metastoreUri;
    }

    public boolean isStrictMode() {
      return strictMode;
    }

    public void setStrictMode(boolean strictMode) {
      this.strictMode = strictMode;
    }

    public String getMetastoreHost() {
      return metastoreHost;
    }

    public void setMetastoreHost(String metastoreHost) {
      this.metastoreHost = metastoreHost;
    }

    public String getMetastorePort() {
      return metastorePort;
    }

    public void setMetastorePort(String metastorePort) {
      this.metastorePort = metastorePort;
    }

    public String getMetastoreSchema() {
      return metastoreSchema;
    }

    public void setMetastoreSchema(String metastoreSchema) {
      this.metastoreSchema = metastoreSchema;
    }

    public String getMetastoreUserName() {
      return metastoreUserName;
    }

    public void setMetastoreUserName(String metastoreUserName) {
      this.metastoreUserName = metastoreUserName;
    }

    public String getMetastorePassword() {
      return metastorePassword;
    }

    public void setMetastorePassword(String metastorePassword) {
      this.metastorePassword = metastorePassword;
    }

    public DataConnection getJdbcDataConnection(){
      DataConnection stageJdbcConnection = new DataConnection("STAGE");
      stageJdbcConnection.setUrl(this.getUrl());
      stageJdbcConnection.setHostname(this.getHostname());
      stageJdbcConnection.setPort(this.getPort());
      stageJdbcConnection.setUsername(this.getUsername());
      stageJdbcConnection.setPassword(this.getPassword());

      String host = null;
      String port = null;
      String schema = null;
      String username = null;
      String password = null;
      String jdbcUrl = this.getMetastore().includeJdbc() ? this.getMetastore().getJdbc().getUrl() : null;
      if(StringUtils.isNotEmpty(jdbcUrl) && jdbcUrl.length() > 5) {
        URI uri = URI.create(jdbcUrl.substring(5));
        host = uri.getHost();
        port = String.valueOf(uri.getPort());
        schema = uri.getPath() != null && uri.getPath().length() > 1 ? uri.getPath().substring(1) : null;
        username = this.getMetastore().getJdbc().getUsername();
        password = this.getMetastore().getJdbc().getPassword();
      }

      Map<String, String> propMap = new HashMap<>();
      propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_HOST, host);
      propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PORT, port);
      propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_SCHEMA, schema);
      propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_USERNAME, username);
      propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PASSWORD, password);
      stageJdbcConnection.setProperties(GlobalObjectMapper.writeValueAsString(propMap));
      return stageJdbcConnection;
    }

    public MetaStoreProperties getMetastore() {
      return metastore;
    }

    public void setMetastore(MetaStoreProperties metastore) {
      this.metastore = metastore;
    }

  }

  public S3Connection getS3() {
    return s3;
  }

  public void setS3(S3Connection s3) {
    this.s3 = s3;
  }

  public static class S3Connection implements Serializable {
    String bucket;
    String region;

    public String getBucket() {
      return bucket;
    }

    public void setBucket(String bucket) {
      this.bucket = bucket;
    }

    public String getRegion() {
      return region;
    }

    public void setRegion(String region) {
      this.region = region;
    }
  }
}
