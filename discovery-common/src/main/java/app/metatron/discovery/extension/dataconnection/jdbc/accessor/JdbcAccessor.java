
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
 * The interface Jdbc accessor.
 */
public interface JdbcAccessor extends ExtensionPoint {
  /**
   * Check connection map.
   *
   * @return the map
   */
  Map<String, Object> checkConnection();

  /**
   * Gets databases.
   *
   * @param catalog       the catalog
   * @param schemaPattern the schema pattern
   * @param pageSize      the page size
   * @param pageNumber    the page number
   * @return the databases
   */
  Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber);

  /**
   * Use database.
   *
   * @param catalog  the catalog
   * @param database the database
   */
  void useDatabase(String catalog, String database);

  /**
   * Gets tables.
   *
   * @param catalog          the catalog
   * @param schemaPattern    the schema pattern
   * @param tableNamePattern the table name pattern
   * @param pageSize         the page size
   * @param pageNumber       the page number
   * @return the tables
   */
  Map<String, Object> getTables(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber);

  /**
   * Gets table names.
   *
   * @param catalog          the catalog
   * @param schemaPattern    the schema pattern
   * @param tableNamePattern the table name pattern
   * @param pageSize         the page size
   * @param pageNumber       the page number
   * @return the table names
   */
  Map<String, Object> getTableNames(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber);

  /**
   * Gets columns.
   *
   * @param catalog           the catalog
   * @param schemaPattern     the schema pattern
   * @param tableNamePattern  the table name pattern
   * @param columnNamePattern the column name pattern
   * @return the columns
   */
  List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern);

  /**
   * Show table description map.
   *
   * @param catalog   the catalog
   * @param schema    the schema
   * @param tableName the table name
   * @return the map
   */
  Map<String, Object> showTableDescription(String catalog, String schema, String tableName);

  /**
   * Execute query for list list.
   *
   * @param connection the connection
   * @param sql        the sql
   * @return the list
   * @throws SQLException the sql exception
   */
  List<Map<String, Object>> executeQueryForList(Connection connection, String sql) throws SQLException;

  /**
   * Execute query for list list.
   *
   * @param <T>        the type parameter
   * @param connection the connection
   * @param sql        the sql
   * @param rowMapper  the row mapper
   * @return the list
   * @throws SQLException the sql exception
   */
  <T> List<T> executeQueryForList(Connection connection, String sql, JdbcRowMapper<T> rowMapper) throws SQLException;

  /**
   * Execute query for map map.
   *
   * @param connection the connection
   * @param sql        the sql
   * @return the map
   * @throws SQLException the sql exception
   */
  Map<String, Object> executeQueryForMap(Connection connection, String sql) throws SQLException;

  /**
   * Execute query for object t.
   *
   * @param <T>          the type parameter
   * @param connection   the connection
   * @param sql          the sql
   * @param requiredType the required type
   * @return the t
   * @throws SQLException the sql exception
   */
  <T> T executeQueryForObject(Connection connection, String sql, Class<T> requiredType) throws SQLException;

  /**
   * Execute boolean.
   *
   * @param connection the connection
   * @param sql        the sql
   * @return the boolean
   * @throws SQLException the sql exception
   */
  boolean execute(Connection connection, String sql) throws SQLException;

  /**
   * Execute update int.
   *
   * @param connection the connection
   * @param sql        the sql
   * @return the int
   * @throws SQLException the sql exception
   */
  int executeUpdate(Connection connection, String sql) throws SQLException;

  /**
   * Sets connector.
   *
   * @param jdbcConnector the jdbc connector
   */
  void setConnector(JdbcConnector jdbcConnector);

  /**
   * Sets connection info.
   *
   * @param connectInformation the connect information
   */
  void setConnectionInfo(JdbcConnectInformation connectInformation);

  /**
   * Sets dialect.
   *
   * @param jdbcDialect the jdbc dialect
   */
  void setDialect(JdbcDialect jdbcDialect);

  /**
   * Gets dialect.
   *
   * @return the dialect
   */
  JdbcDialect getDialect();

  /**
   * Sets connection.
   *
   * @param connection the connection
   */
  void setConnection(Connection connection);

  /**
   * Gets connection.
   *
   * @return the connection
   */
  Connection getConnection();

  /**
   * Gets connection.
   *
   * @param includeDatabase the include database
   * @return the connection
   */
  Connection getConnection(boolean includeDatabase);

  /**
   * Gets connection.
   *
   * @param database        the database
   * @param includeDatabase the include database
   * @return the connection
   */
  Connection getConnection(String database, boolean includeDatabase);
}
