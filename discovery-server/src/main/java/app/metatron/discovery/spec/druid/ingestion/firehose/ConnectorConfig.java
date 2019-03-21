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

package app.metatron.discovery.spec.druid.ingestion.firehose;


import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class ConnectorConfig {
  Boolean createTables;
  String connectURI;
  String user;
  Password password;

  public ConnectorConfig() {
  }

  public ConnectorConfig(DataConnection dataConnection) {
    this.createTables = true;
    this.connectURI = DataConnectionHelper.getConnectionUrl(dataConnection);
    this.user = dataConnection.getUsername();
    this.password = new Password(dataConnection.getPassword());
  }

  public ConnectorConfig(String connectURI, String user, String password) {

    // TODO: 이게 맞나 확인해볼것
    this.createTables = true;
    this.connectURI = connectURI;
    this.user = user;
    this.password = new Password(password);
  }

  public ConnectorConfig(Boolean createTables, String connectURI, String user, String password) {
    this.createTables = createTables;
    this.connectURI = connectURI;
    this.user = user;
    this.password = new Password(password);
  }

  public Boolean getCreateTables() {
    return createTables;
  }

  public void setCreateTables(Boolean createTables) {
    this.createTables = createTables;
  }

  public String getConnectURI() {
    return connectURI;
  }

  public void setConnectURI(String connectURI) {
    this.connectURI = connectURI;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public Password getPassword() {
    return password;
  }

  public void setPassword(Password password) {
    this.password = password;
  }

  public class Password {
    String type;
    String password;

    public Password(String password) {
      this.type = "default";
      this.password = password;
    }

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }
}
