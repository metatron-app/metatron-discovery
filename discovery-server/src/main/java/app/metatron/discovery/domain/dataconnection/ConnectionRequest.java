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

package app.metatron.discovery.domain.dataconnection;

import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.idcube.IdCubeProperties;
import app.metatron.discovery.domain.idcube.security.AES;
import app.metatron.discovery.util.ApplicationContextProvider;
import org.apache.commons.lang3.StringUtils;

/**
 * Created by kyungtaak on 2016. 6. 20..
 */
public class ConnectionRequest {

  @NotNull
  DataConnection connection;

  String database;

  String table;

  JdbcIngestionInfo.DataType type;

  String query;

  List<Map<String, Object>> partitions;

  public DataConnection getConnection() {
    IdCubeProperties idCubeProperties = ApplicationContextProvider.getApplicationContext().getBean(IdCubeProperties.class);
    if(idCubeProperties != null) {
      if (StringUtils.isNotEmpty(idCubeProperties.getSecurity().getCipherSecretKey())) {
        String decryptPassword = AES.decrypt(connection.getPassword(), idCubeProperties.getSecurity().getCipherSecretKey());
        if (decryptPassword != null) {
          connection.setPassword(decryptPassword);
        }
      }
    }
    return connection;
  }

  public void setConnection(DataConnection connection) {
    this.connection = connection;
  }

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public String getTable() {
    return table;
  }

  public void setTable(String table) {
    this.table = table;
  }

  public JdbcIngestionInfo.DataType getType() {
    return type;
  }

  public void setType(JdbcIngestionInfo.DataType type) {
    this.type = type;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public List<Map<String, Object>> getPartitions() {
    return partitions;
  }

  public void setPartitions(List<Map<String, Object>> partitions) {
    this.partitions = partitions;
  }
}
