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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import org.apache.commons.lang3.StringUtils;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class HiveMetastoreConnection extends JdbcDataConnection {

  @Column(name = "dc_metastore_host")
  String metastoreHost;

  @Column(name = "dc_metastore_port")
  String metastorePort;

  @Column(name = "dc_metastore_schema")
  String metastoreSchema;

  @Column(name = "dc_metastore_username")
  String metastoreUserName;

  @Column(name = "dc_metastore_password")
  String metastorePassword;

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

  public String getMetastoreDriverName() {
    return "com.mysql.jdbc.Driver";
  }

  public String getMetastoreURL(){
    StringBuilder builder = new StringBuilder();
    builder.append(MySQLConnection.MYSQL_URL_PREFIX);
    builder.append(URL_SEP);
    if(StringUtils.isNotEmpty(this.getMetastoreHost())){
      builder.append(this.getMetastoreHost());
    }
    if(StringUtils.isNotEmpty(this.getMetastorePort())){
      builder.append(":").append(this.getMetastorePort());
    }
    if(StringUtils.isNotEmpty(this.getMetastoreSchema())){
      builder.append(URL_SEP).append(this.getMetastoreSchema());
    }
    return builder.toString();
  }

  public boolean includeMetastoreInfo(){
    if(StringUtils.isEmpty(this.getMetastoreHost())) return false;
    if(StringUtils.isEmpty(this.getMetastorePort())) return false;
    if(StringUtils.isEmpty(this.getMetastoreSchema())) return false;
    if(StringUtils.isEmpty(this.getMetastoreUserName())) return false;
    if(StringUtils.isEmpty(this.getMetastorePassword())) return false;
    return true;
  }
}
