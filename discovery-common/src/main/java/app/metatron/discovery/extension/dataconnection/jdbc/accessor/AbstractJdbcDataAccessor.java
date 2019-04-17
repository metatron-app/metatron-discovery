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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.NumberUtils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

import static java.util.stream.Collectors.toList;

/**
 *
 */
public abstract class AbstractJdbcDataAccessor implements JdbcAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(AbstractJdbcDataAccessor.class);

  protected JdbcConnectInformation connectionInfo;
  protected JdbcConnector connector;
  protected JdbcDialect dialect;
  protected Connection connection;

  public AbstractJdbcDataAccessor(){

  }

  public JdbcConnectInformation getConnectionInfo() {
    return connectionInfo;
  }

  @Override
  public void setConnectionInfo(JdbcConnectInformation connectionInfo) {
    this.connectionInfo = connectionInfo;
  }

  public JdbcConnector getConnector() {
    return connector;
  }

  @Override
  public void setConnector(JdbcConnector connector) {
    this.connector = connector;
  }

  public JdbcDialect getDialect() {
    return dialect;
  }

  @Override
  public void setDialect(JdbcDialect dialect) {
    this.dialect = dialect;
  }

  @Override
  public Connection getConnection() {
    return this.getConnection(connectionInfo.getDatabase(), true);
  }

  @Override
  public Connection getConnection(boolean includeDatabase){
    return this.getConnection(connectionInfo.getDatabase(), includeDatabase);
  }

  @Override
  public Connection getConnection(String database, boolean includeDatabase) {
    try{
      if(connection == null || connection.isClosed()){
        connection = connector.getConnection(connectionInfo, dialect, database, includeDatabase);
      }
    } catch (SQLException e){

    }
    return connection;
  }

  @Override
  public void setConnection(Connection connection) {
    this.connection = connection;
  }

  public List<String> getExcludeSchemas(){
    List<String> excludeSchemaList = null;
    if(connectionInfo.getPropertiesMap() != null
        && connectionInfo.getPropertiesMap().containsKey(JdbcDialect.METATRON_EXCLUDE_DATABASES_PROPERTY)){
      String excludeDatabases = StringUtils.replaceAll(
          connectionInfo.getPropertiesMap().get(JdbcDialect.METATRON_EXCLUDE_DATABASES_PROPERTY), " ", "");
      excludeSchemaList = Arrays.asList(StringUtils.split(excludeDatabases, ","));
    }

    String[] defaultExcludeSchemas = dialect.getDefaultExcludeSchemas(connectionInfo);
    if(defaultExcludeSchemas != null && defaultExcludeSchemas.length > 0) {
      if(excludeSchemaList == null){
        excludeSchemaList = new ArrayList<>();
      }

      excludeSchemaList.addAll(Arrays.asList(defaultExcludeSchemas));
    }

    return excludeSchemaList;
  }

  public List<String> getExcludeTables(){
    List<String> excludeTableList = null;
    if(connectionInfo.getPropertiesMap() != null
        && connectionInfo.getPropertiesMap().containsKey(JdbcDialect.METATRON_EXCLUDE_TABLES_PROPERTY)){
      String excludeTables = StringUtils.replaceAll(
          connectionInfo.getPropertiesMap().get(JdbcDialect.METATRON_EXCLUDE_TABLES_PROPERTY), " ", "");
      return Arrays.asList(StringUtils.split(excludeTables, ","));
    }

    String[] defaultExcludeTables = dialect.getDefaultExcludeTables(connectionInfo);
    if(defaultExcludeTables != null && defaultExcludeTables.length > 0) {
      if(excludeTableList == null){
        excludeTableList = new ArrayList<>();
      }

      excludeTableList.addAll(Arrays.asList(defaultExcludeTables));
    }

    return excludeTableList;
  }

  protected Map<String, Integer> createPageInfoMap(int size, int totalElements, int page) {
    Map<String, Integer> pageInfoMap = new HashMap<>();
    pageInfoMap.put("size", size);
    pageInfoMap.put("totalElements", totalElements);
    pageInfoMap.put("totalPages", (int) Math.ceil((double) totalElements / (double) size));
    pageInfoMap.put("number", page);
    return pageInfoMap;
  }

  @Override
  public Map<String, Object> checkConnection() {
    Map<String, Object> resultMap = Maps.newHashMap();
    resultMap.put("connected", true);

    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    try {
      conn = this.getConnection();
      stmt = conn.createStatement();
      stmt.execute(dialect.getTestQuery(connectionInfo));
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
  public void useDatabase(String catalog, String database) {
    String useQuery = dialect.getUseDatabaseQuery(connectionInfo, database);
    if(StringUtils.isNotEmpty(useQuery)){
      try{
        execute(this.getConnection(), useQuery);
      } catch (Exception e){
        LOGGER.error("Fail to Use database : {}", e.getMessage());
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                              "Fail to Use database : " + e.getMessage());
      }
    }
  }

  @Override
  public Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber) {
    List<String> dataBaseNames = Lists.newArrayList();
    Map<String, Object> databaseMap = Maps.newHashMap();
    Connection conn = null;
    ResultSet rs = null;
    try {
      conn = this.getConnection();
      rs = conn.getMetaData().getSchemas();

      // 1. TABLE_SCHEM String => schema name
      // 2. TABLE_CATALOG String => catalog name (may be null)
      while (rs.next()) {
        dataBaseNames.add(rs.getString(1));
      }

    } catch (Exception e) {
      LOGGER.error("Fail to get list of schema : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of schema : " + e.getMessage());
    } finally {
      connector.closeConnection(conn, null, rs);
    }

    List<String> excludeDatabases = getExcludeSchemas();
    if (excludeDatabases != null) {
      dataBaseNames = dataBaseNames.stream()
                             .filter(databaseName -> excludeDatabases.indexOf(databaseName) < 0)
                             .collect(toList());
    }

    databaseMap.put("databases", dataBaseNames);
    databaseMap.put("page", createPageInfoMap(dataBaseNames.size(), dataBaseNames.size(), 0));
    return databaseMap;
  }

  @Override
  public Map<String, Object> getTables(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber) {
    String tableNamePatternForQuery = null;
    if (!StringUtils.isEmpty(tableNamePattern)) {
      tableNamePatternForQuery = "%" + tableNamePattern + "%";
    }

    List<Map<String, String>> tableInfos = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;
    try {
      conn = this.getConnection();
      resultSet = conn.getMetaData().getTables(catalog, schemaPattern, tableNamePatternForQuery, dialect.getResultSetTableType(connectionInfo));

      while (resultSet.next()) {
        Map<String, String> tableInfo = Maps.newHashMap();
        // 1. TABLE_CAT String => table catalog (may be null)
        // 2. TABLE_SCHEM String => table schema (may be null)
        // 3. TABLE_NAME String => table name
        // 4. TABLE_TYPE String => table type. Typical types are "TABLE", "VIEW", "SYSTEM TABLE", "GLOBAL TEMPORARY", "LOCAL TEMPORARY", "ALIAS", "SYNONYM".
        // 5. REMARKS String => explanatory comment on the table
        // 6. TYPE_CAT String => the types catalog (may be null)
        // 7. TYPE_SCHEM String => the types schema (may be null)
        // 8. TYPE_NAME String => type name (may be null)
        // 9. SELF_REFERENCING_COL_NAME String => name of the designated "identifier" column of a typed table (may be null)
        // 10. REF_GENERATION String => specifies how values in SELF_REFERENCING_COL_NAME are created. Values are "SYSTEM", "USER", "DERIVED". (may be null)
        LOGGER.debug("SCHEMA: {} - NAME: {} - TYPE: {}", resultSet.getString(2), resultSet.getString(3), resultSet.getString(4));

        String tableType = resultSet.getString(4);
        if (!("TABLE".equals(tableType) || "VIEW".equals(tableType))) {
          continue;
        }

        tableInfo.put("name", resultSet.getString(3));
        tableInfo.put("type", resultSet.getString(4));
        tableInfo.put("comment", resultSet.getString(5));

        tableInfos.add(tableInfo);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of table : " + e.getMessage());
    } finally {
      connector.closeConnection(conn, null, resultSet);
    }

    Map<String, Object> tableMap = new LinkedHashMap<>();

    List<String> excludeTables = getExcludeTables();
    if (excludeTables != null) {
      tableInfos = tableInfos.stream()
                             .filter(tableInfoMap -> excludeTables.indexOf(tableInfoMap.get("name")) < 0)
                             .collect(toList());
    }

    int tableCount = tableInfos.size();
    tableMap.put("tables", tableInfos);
    tableMap.put("page", createPageInfoMap(tableCount, tableCount, 0));
    return tableMap;
  }

  @Override
  public Map<String, Object> getTableNames(String catalog, String schemaPattern, String tableNamePattern, Integer pageSize, Integer pageNumber) {
    String tableNamePatternForQuery = null;
    if (!StringUtils.isEmpty(tableNamePattern)) {
      tableNamePatternForQuery = "%" + tableNamePattern + "%";
    }

    List<String> tableNames = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;
    try {
      conn = this.getConnection();
      resultSet = conn.getMetaData().getTables(catalog, schemaPattern, tableNamePatternForQuery, dialect.getResultSetTableType(connectionInfo));

      while (resultSet.next()) {
        Map<String, String> tableInfo = Maps.newHashMap();
        // 1. TABLE_CAT String => table catalog (may be null)
        // 2. TABLE_SCHEM String => table schema (may be null)
        // 3. TABLE_NAME String => table name
        // 4. TABLE_TYPE String => table type. Typical types are "TABLE", "VIEW", "SYSTEM TABLE", "GLOBAL TEMPORARY", "LOCAL TEMPORARY", "ALIAS", "SYNONYM".
        // 5. REMARKS String => explanatory comment on the table
        // 6. TYPE_CAT String => the types catalog (may be null)
        // 7. TYPE_SCHEM String => the types schema (may be null)
        // 8. TYPE_NAME String => type name (may be null)
        // 9. SELF_REFERENCING_COL_NAME String => name of the designated "identifier" column of a typed table (may be null)
        // 10. REF_GENERATION String => specifies how values in SELF_REFERENCING_COL_NAME are created. Values are "SYSTEM", "USER", "DERIVED". (may be null)
        LOGGER.debug("SCHEMA: {} - NAME: {} - TYPE: {}", resultSet.getString(2), resultSet.getString(3), resultSet.getString(4));

        String tableType = resultSet.getString(4);
        if (!("TABLE".equals(tableType) || "VIEW".equals(tableType))) {
          continue;
        }

        tableNames.add(resultSet.getString(3));
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table names : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of table names : " + e.getMessage());
    } finally {
      connector.closeConnection(conn, null, resultSet);
    }

    Map<String, Object> tableMap = new LinkedHashMap<>();

    List<String> excludeTables = getExcludeTables();
    List<String> filteredTableNames = tableNames;
    if (excludeTables != null) {
      filteredTableNames = tableNames.stream()
                                     .filter(tableName -> excludeTables.indexOf(tableName) < 0)
                                     .collect(toList());
    }
    int tableCount = filteredTableNames.size();
    tableMap.put("tables", filteredTableNames);
    tableMap.put("page", createPageInfoMap(tableCount, tableCount, 0));
    return tableMap;
  }

  @Override
  public List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern) {
    List<Map<String, Object>> columns = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;

    try {
      conn = this.getConnection();
      String columnName = null;
      if (StringUtils.isNotEmpty(columnNamePattern)) {
        columnName = "%" + columnNamePattern + "%";
      }
      resultSet = conn.getMetaData().getColumns(catalog, schemaPattern, tableNamePattern, columnName);

      //      1.TABLE_CAT String => table catalog (may be null)
      //      2.TABLE_SCHEM String => table schema (may be null)
      //      3.TABLE_NAME String => table name
      //      4.COLUMN_NAME String => column name
      //      5.DATA_TYPE int => SQL type from java.sql.Types
      //      6.TYPE_NAME String => Data source dependent type name, for a UDT the type name is fully qualified
      //      7.COLUMN_SIZE int => column size.
      //      8.BUFFER_LENGTH is not used.
      //      9.DECIMAL_DIGITS int => the number of fractional digits. Null is returned for data types where DECIMAL_DIGITS is not applicable.
      //      10.NUM_PREC_RADIX int => Radix (typically either 10 or 2)
      //      11.NULLABLE int => is NULL allowed.
      //        columnNoNulls - might not allow NULL values
      //        columnNullable - definitely allows NULL values
      //        columnNullableUnknown - nullability unknown
      //      12.REMARKS String => comment describing column (may be null)
      //      13.COLUMN_DEF String => default value for the column, which should be interpreted as a string when the value is enclosed in single quotes (may be null)
      //      14.SQL_DATA_TYPE int => unused
      //      15.SQL_DATETIME_SUB int => unused
      //      16.CHAR_OCTET_LENGTH int => for char types the maximum number of bytes in the column
      //      17.ORDINAL_POSITION int => index of column in table (starting at 1)
      //      18.IS_NULLABLE String => ISO rules are used to determine the nullability for a column.
      //        YES --- if the column can include NULLs
      //        NO --- if the column cannot include NULLs
      //        empty string --- if the nullability for the column is unknown
      //      19.SCOPE_CATALOG String => catalog of table that is the scope of a reference attribute (null if DATA_TYPE isn't REF)
      //      20.SCOPE_SCHEMA String => schema of table that is the scope of a reference attribute (null if the DATA_TYPE isn't REF)
      //      21.SCOPE_TABLE String => table name that this the scope of a reference attribute (null if the DATA_TYPE isn't REF)
      //      22.SOURCE_DATA_TYPE short => source type of a distinct type or user-generated Ref type, SQL type from java.sql.Types (null if DATA_TYPE isn't DISTINCT or user-generated REF)
      //      23.IS_AUTOINCREMENT String => Indicates whether this column is auto incremented
      //        YES --- if the column is auto incremented
      //        NO --- if the column is not auto incremented
      //        empty string --- if it cannot be determined whether the column is auto incremented
      //      24.IS_GENERATEDCOLUMN String => Indicates whether this is a generated column
      //        YES --- if this a generated column
      //        NO --- if this not a generated column
      //        empty string --- if it cannot be determined whether this is a generated column
      while (resultSet.next()) {
        Map<String, Object> rowMap = Maps.newHashMap();
        rowMap.put("columnName", resultSet.getString(4));
        rowMap.put("columnType", resultSet.getString(6));
        rowMap.put("columnComment", resultSet.getString(12));

        int columnSize = resultSet.getInt(7);
        if(columnSize > 0){
          rowMap.put("columnSize", columnSize);
        }
        columns.add(rowMap);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of columns : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of columns : " + e.getMessage());
    } finally {
      connector.closeConnection(conn, null, resultSet);
    }

    return columns;
  }

  @Override
  public Map<String, Object> showTableDescription(String catalog, String schema, String tableName) {
    try {
      String tableDescQuery = dialect.getTableDescQuery(connectionInfo, catalog, schema, tableName);
      if(StringUtils.isNotEmpty(tableDescQuery)){
        return executeQueryForMap(this.getConnection(), tableDescQuery);
      }
      return null;
    } catch (Exception e) {
      LOGGER.error("Fail to get desc of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get desc of table : " + e.getMessage());
    }
  }

  public List<Map<String, Object>> executeQueryForList(Connection connection, String sql) throws SQLException {
    return executeQueryForList(connection, sql, (resultSet, rowNum) -> {
      Map<String, Object> rowMap = new LinkedHashMap<>();
      ResultSetMetaData rsmd = resultSet.getMetaData();
      int columnCount = rsmd.getColumnCount();
      for (int i = 1; i <= columnCount; i++) {
        String columnName = rsmd.getColumnLabel(i);
        Object columnObj = dialect.resultObjectConverter().apply(resultSet.getObject(i));
        rowMap.put(columnName, columnObj);
      }
      return rowMap;
    });
  }

  public <T> List<T> executeQueryForList(Connection connection, String sql, JdbcRowMapper<T> rowMapper) throws SQLException {
    List<T> resultList = new ArrayList<>();
    Statement stmt = null;
    ResultSet rs = null;
    try {
      stmt = connection.createStatement();

      if(stmt.execute(sql)){
        rs = stmt.getResultSet();
        ResultSetMetaData rsmd = rs.getMetaData();
        int columnCount = rsmd.getColumnCount();
        int rowNum = 0;
        while (rs.next()){
          if(rowMapper == null){
            Map<String, Object> rowMap = new LinkedHashMap<>();
            for (int i = 1; i <= columnCount; i++) {
              String columnName = rsmd.getColumnLabel(i);
              Object columnObj = dialect.resultObjectConverter().apply(rs.getObject(i));
              rowMap.put(columnName, columnObj);
            }
            resultList.add((T) rowMap);
          } else {
            resultList.add(rowMapper.mapRow(rs, rowNum++));
          }
        }
      }
      return resultList;
    } catch (Exception e) {
      throw e;
    } finally {
      connector.closeConnection(connection, stmt, rs);
    }
  }

  public Map<String, Object> executeQueryForMap(Connection connection, String sql) throws SQLException{
    try {
      List<Map<String, Object>> resultList = executeQueryForList(connection, sql);

      if(resultList.size() > 1){
        LOGGER.error("Execute Query For map result greater than 1");
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                              "Execute Query For map result greater than 1");
      } else {
        return resultList.get(0);
      }
    } catch (Exception e) {
      throw e;
    }
  }

  public <T> T executeQueryForObject(Connection connection, String sql, Class<T> requiredType) throws SQLException{
    try {
      List<T> resultList = executeQueryForList(connection, sql, (resultSet, rowNum) -> {
        ResultSetMetaData rsmd = resultSet.getMetaData();
        int columnCount = rsmd.getColumnCount();

        if(columnCount != 1){
          throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                                "Execute Query For Object column is greater than 1");
        }

        Object columnObj = resultSet.getObject(1);
        if (columnObj != null && requiredType != null && !requiredType.isInstance(columnObj)) {
          try {
            return (T) convertValueToRequiredType(columnObj, requiredType);
          } catch (Exception e){
            throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                                  "Execute Query For Object type is miss matched." + rsmd.getColumnTypeName(1));
          }
        }
        return (T) columnObj;
      });

      if(resultList.size() > 1){
        LOGGER.error("Execute Query For map result greater than 1");
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                              "Execute Query For map result greater than 1");
      } else {
        return resultList.get(0);
      }
    } catch (Exception e) {
      throw e;
    }
  }

  public boolean execute(Connection connection, String sql) throws SQLException{
    Statement stmt = null;
    ResultSet rs = null;
    try {
      stmt = connection.createStatement();
      return stmt.execute(sql);
    } catch (Exception e) {
      throw e;
    } finally {
      connector.closeConnection(connection, stmt, rs);
    }
  }

  public int executeUpdate(Connection connection, String sql) throws SQLException{
    Statement stmt = null;
    ResultSet rs = null;
    try {
      stmt = connection.createStatement();
      return stmt.executeUpdate(sql);
    } catch (Exception e) {
      throw e;
    } finally {
      connector.closeConnection(connection, stmt, rs);
    }
  }

  protected Object convertValueToRequiredType(Object value, Class<?> requiredType) {
    if (String.class == requiredType) {
      return value.toString();
    }
    else if (Number.class.isAssignableFrom(requiredType)) {
      if (value instanceof Number) {
        // Convert original Number to target Number class.
        return NumberUtils.convertNumberToTargetClass(((Number) value), (Class<Number>) requiredType);
      }
      else {
        // Convert stringified value to target Number class.
        return NumberUtils.parseNumber(value.toString(),(Class<Number>) requiredType);
      }
    }
    else {
      throw new IllegalArgumentException(
          "Value [" + value + "] is of type [" + value.getClass().getName() +
              "] and cannot be converted to required type [" + requiredType.getName() + "]");
    }
  }
}
