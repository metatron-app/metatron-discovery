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

import com.google.common.collect.Lists;

import java.util.List;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class JdbcFirehose implements Firehose {

  ConnectorConfig connectorConfig;

  String table;

  List<String> columns;

  public JdbcFirehose() {
  }

  public JdbcFirehose(JdbcIngestionInfo ingestion, DataConnection dataConnection, String... columns) {
    this.table = ingestion.getQuery();
    this.connectorConfig = new ConnectorConfig(dataConnection);
    this.columns = Lists.newArrayList(columns);
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

  public void setTableWithQuery(JdbcIngestionInfo.DataType type, String table) {
    if(type == JdbcIngestionInfo.DataType.QUERY) {
      this.table = "( " + table + " ) AS DUMMAYTABLE";
    } else {
      this.table = table;
    }
  }

  public List<String> getColumns() {
    return columns;
  }

  public void setColumns(List<String> columns) {
    this.columns = columns;
  }
}
