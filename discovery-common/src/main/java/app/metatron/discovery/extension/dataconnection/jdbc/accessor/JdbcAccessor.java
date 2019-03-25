
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

package app.metatron.discovery.extension.dataconnection.jdbc.accessor;

import org.pf4j.ExtensionPoint;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
public interface JdbcAccessor extends ExtensionPoint {
  Map<String, Object> checkConnection();
  Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber);
  void useDatabase(String catalog, String database);
  Map<String, Object> getTables(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber);
  Map<String, Object> getTableNames(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber);
  List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern);
  Map<String, Object> showTableDescription(String catalog, String schema, String tableName);

  List<Map<String, Object>> executeQueryForList(Connection connection, String sql) throws SQLException;
  <T> List<T> executeQueryForList(Connection connection, String sql, JdbcRowMapper<T> rowMapper) throws SQLException;
  Map<String, Object> executeQueryForMap(Connection connection, String sql) throws SQLException;
  <T> T executeQueryForObject(Connection connection, String sql, Class<T> requiredType) throws SQLException;
  boolean execute(Connection connection, String sql) throws SQLException;
  int executeUpdate(Connection connection, String sql) throws SQLException;

  void setConnector(JdbcConnector jdbcConnector);
  void setConnectionInfo(JdbcConnectInformation connectInformation);
  void setDialect(JdbcDialect jdbcDialect);
  JdbcDialect getDialect();
  void setConnection(Connection connection);

  Connection getConnection();
  Connection getConnection(boolean includeDatabase);
  Connection getConnection(String database, boolean includeDatabase);
}
