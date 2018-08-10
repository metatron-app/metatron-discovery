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

package app.metatron.discovery.query.druid.lookup.namespace;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

/**
 *
 */
@JsonTypeName("jdbc")
public class JDBCExtractionNamespace implements ExtractionNamespace {

  private ConnectorConfig connectorConfig;
  private String table;
  private List<String> keyColumns;
  private String valueColumn;
  private String tsColumn;
  private String pollPeriod = "PT1H";

  public JDBCExtractionNamespace() {
  }

  public JDBCExtractionNamespace(ConnectorConfig connectorConfig, String table, List<String> keyColumns, String valueColumn) {
    this.connectorConfig = connectorConfig;
    this.table = table;
    this.keyColumns = keyColumns;
    this.valueColumn = valueColumn;
  }

  public JDBCExtractionNamespace(ConnectorConfig connectorConfig, String table, List<String> keyColumns, String valueColumn, String pollPeriod) {
    this.connectorConfig = connectorConfig;
    this.table = table;
    this.keyColumns = keyColumns;
    this.valueColumn = valueColumn;
    this.pollPeriod = pollPeriod;
  }

  public ConnectorConfig getConnectorConfig() {
    return connectorConfig;
  }

  public void setConnectorConfig(ConnectorConfig connectorConfig) {
    this.connectorConfig = connectorConfig;
  }

  public String getTable() {
    return table;
  }

  public void setTable(String table) {
    this.table = table;
  }

  public List<String> getKeyColumns() {
    return keyColumns;
  }

  public void setKeyColumns(List<String> keyColumns) {
    this.keyColumns = keyColumns;
  }

  public String getValueColumn() {
    return valueColumn;
  }

  public void setValueColumn(String valueColumn) {
    this.valueColumn = valueColumn;
  }

  public String getTsColumn() {
    return tsColumn;
  }

  public void setTsColumn(String tsColumn) {
    this.tsColumn = tsColumn;
  }

  public String getPollPeriod() {
    return pollPeriod;
  }

  public void setPollPeriod(String pollPeriod) {
    this.pollPeriod = pollPeriod;
  }

  public static class ConnectorConfig {
    String connectURI;
    String user;
    String password;

    public ConnectorConfig() {
    }

    public ConnectorConfig(String connectURI, String user, String password) {
      this.connectURI = connectURI;
      this.user = user;
      this.password = password;
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

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }
}
