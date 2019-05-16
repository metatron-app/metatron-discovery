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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

import static java.util.stream.Collectors.toList;

@Extension
public class PrestoDataAccessor extends AbstractJdbcDataAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(PrestoDataAccessor.class);
  private static final String TABLE_NAME_COLUMN = "Table";
  private static final String SHOW_CATALOGS = "SHOW CATALOGS";

  @Override
  public Map<String, Object> checkConnection() {
    Map<String, Object> resultMap = Maps.newHashMap();
    //resultMap.put("connected", true);
    boolean connected = false;

    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    try {
      conn = this.getConnection();
      stmt = conn.createStatement();
      stmt.execute(dialect.getTestQuery(connectionInfo));

      // Perform additional catalog validation checks
      String connectionCatalog = conn.getCatalog();
      if(StringUtils.isNotEmpty(connectionCatalog)) {
        List<String> catalogs = this.executeQueryForList(this.getConnection(), SHOW_CATALOGS, (resultSet, i) -> resultSet.getString(1));
        for(String catalog : catalogs){
          LOGGER.debug("check catalog : {}", catalog);
          if(connectionCatalog.equals(catalog)){
            connected = true;
            break;
          }
        }
      } else {
        connected = false;
        resultMap.put("message", "Please set a catalog name.");
      }

      resultMap.put("connected", connected);
    } catch (Exception e) {
      LOGGER.warn("Fail to check query : {}", e.getMessage());
      resultMap.put("connected", false);
      resultMap.put("message", e.getMessage());
      return resultMap;
    } finally {
      connector.closeConnection(conn, stmt, rs);
    }
    return resultMap;
  }

  @Override
  public Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();

    int size = pageSize == null ? 20 : pageSize;
    int page = pageNumber == null ? 0 : pageNumber;

    String schemaCountQuery = dialect.getDataBaseCountQuery(connectionInfo, catalog, schemaPattern, getExcludeSchemas());
    String schemaListQuery = dialect.getDataBaseQuery(connectionInfo, catalog, schemaPattern, getExcludeSchemas(), size, page);

    LOGGER.debug("Execute Schema Count query : {}", schemaCountQuery);
    LOGGER.debug("Execute Schema List query : {}", schemaListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseCount = this.executeQueryForObject(this.getConnection(), schemaCountQuery, Integer.class);
      databaseNames = this.executeQueryForList(this.getConnection(), schemaListQuery, (resultSet, i) -> resultSet.getString(1));
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
  public void useDatabase(String catalog, String database) {
    LOGGER.debug("Presto does not support USE statements.");
  }

  @Override
  public Map<String, Object> getTables(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber) {

    String tableListQuery = dialect.getTableQuery(connectionInfo, catalog, schemaPattern, tableNamePattern, getExcludeTables(), pageSize, pageNumber);

    LOGGER.debug("Execute Table List query : {}", tableListQuery);

    List<Map<String, Object>> tableNames = null;
    try {
      tableNames = this.executeQueryForList(this.getConnection(), tableListQuery);
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    //exclude table
    List<String> excludeTables = getExcludeTables();
    if (excludeTables != null) {
      tableNames = tableNames.stream()
                             .filter(tableInfoMap -> excludeTables.indexOf(tableInfoMap.get("name").toString()) < 0)
                             .collect(toList());
    }

    Map<String, Object> databaseMap = new LinkedHashMap<>();
    databaseMap.put("tables", tableNames);
    databaseMap.put("page", createPageInfoMap(tableNames.size(), tableNames.size(), 0));

    return databaseMap;
  }

  @Override
  public List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern) {

    String columnListQuery = dialect.getColumnQuery(connectionInfo, catalog, schemaPattern, tableNamePattern, columnNamePattern, null, null);

    LOGGER.debug("Execute Column List query : {}", columnListQuery);

    List<Map<String, Object>> columns = Lists.newArrayList();
    try {
      columns = this.executeQueryForList(this.getConnection(), columnListQuery).stream()
                            .map(columnMap -> {
                              LinkedHashMap<String, Object> newColumnMap = new LinkedHashMap<>();
                              newColumnMap.put("columnName", columnMap.get("Column"));
                              newColumnMap.put("columnType", columnMap.get("Type"));
                              newColumnMap.put("columnComment", columnMap.get("Comment"));
                              return newColumnMap;
                            }).collect(toList());
    } catch (Exception e) {
      LOGGER.error("Fail to get list of Columns : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of Columns : " + e.getMessage());
    }
    return columns;
  }
}
