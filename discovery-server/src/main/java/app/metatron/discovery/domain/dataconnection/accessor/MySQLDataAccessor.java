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

package app.metatron.discovery.domain.dataconnection.accessor;

import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

@Extension
public class MySQLDataAccessor extends AbstractJdbcDataAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(MySQLDataAccessor.class);

  @Override
  public Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber) {

    Map<String, Object> databaseMap = new LinkedHashMap<>();

    int size = pageSize == null ? 20 : pageSize;
    int page = pageNumber == null ? 0 : pageNumber;

    String databaseCountQuery = getDialect().getDataBaseCountQuery(connectionInfo, catalog, schemaPattern, getExcludeSchemas());
    String databaseListQuery = getDialect().getDataBaseQuery(connectionInfo, catalog, schemaPattern, getExcludeSchemas(), size, page);

    LOGGER.debug("Execute Database Count query : {}", databaseCountQuery);
    LOGGER.debug("Execute Database List query : {}", databaseListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseCount = this.executeQueryForObject(this.getConnection(), databaseCountQuery, Integer.class);
      databaseNames = this.executeQueryForList(this.getConnection(), databaseListQuery, (resultSet, i) -> resultSet.getString(1));
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(size, databaseCount, page));
    return databaseMap;
  }

  @Override
  public Map<String, Object> getTables(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber) {

    int size = pageSize == null ? 20 : pageSize;
    int page = pageNumber == null ? 0 : pageNumber;

    String tableCountQuery = dialect.getTableCountQuery(connectionInfo, catalog, schemaPattern, tableNamePattern, getExcludeTables());
    String tableListQuery = dialect.getTableQuery(connectionInfo, catalog, schemaPattern, tableNamePattern, getExcludeTables(), size, page);

    LOGGER.debug("Execute Table Count query : {}", tableCountQuery);
    LOGGER.debug("Execute Table List query : {}", tableListQuery);

    int tableCount = 0;
    List<Map<String, Object>> tableNames = null;
    try {
      tableCount = this.executeQueryForObject(this.getConnection(), tableCountQuery, Integer.class);
      tableNames = this.executeQueryForList(this.getConnection(), tableListQuery);
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    Map<String, Object> databaseMap = new LinkedHashMap<>();
    databaseMap.put("tables", tableNames);
    databaseMap.put("page", createPageInfoMap(size, tableCount, page));
    return databaseMap;
  }

  @Override
  public List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern) {
    //use schema as catalog
    return super.getColumns(schemaPattern, schemaPattern, tableNamePattern, columnNamePattern);
  }
}
