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

package app.metatron.discovery.domain.dataconnection.dialect;

import org.apache.commons.lang3.StringUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
@Order(1)
@Component
public class MySQLDialect implements JdbcDialect {

  public static final String MYSQL_URL_PREFIX = "jdbc:mysql:/";
  private static final String[] EXCLUDE_SCHEMAS = null;
  private static final String[] EXCLUDE_TABLES = null;

  @Override
  public String getName() {
    return "MySQL";
  }

  @Override
  public Scope getScope() {
    return Scope.EMBEDDED;
  }

  @Override
  public String getIconResource1() {
    return null;
  }

  @Override
  public String getIconResource2() {
    return null;
  }

  @Override
  public String getIconResource3() {
    return null;
  }

  @Override
  public String getIconResource4() {
    return null;
  }

  @Override
  public String getImplementor() {
    return "MYSQL";
  }

  @Override
  public InputSpec getInputSpec() {
    return (new InputSpec())
        .setAuthenticationType(InputMandatory.MANDATORY)
        .setUsername(InputMandatory.MANDATORY)
        .setPassword(InputMandatory.MANDATORY)
        .setCatalog(InputMandatory.NONE)
        .setSid(InputMandatory.NONE)
        .setDatabase(InputMandatory.NONE);
  }

  /**
   * Connection
   */
  @Override
  public boolean isSupportImplementor(String implementor) {
    return implementor.toUpperCase().equals(this.getImplementor().toUpperCase());
  }

  @Override
  public String getDriverClass(JdbcConnectInformation connectInfo) {
    return "com.mysql.jdbc.Driver";
  }

  @Override
  public String getConnectorClass(JdbcConnectInformation connectInfo) {
    return null;
  }

  @Override
  public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
    return "app.metatron.discovery.domain.dataconnection.accessor.MySQLDataAccessor";
  }

  @Override
  public String getTestQuery(JdbcConnectInformation connectInfo) {
    return "SELECT 1";
  }

  @Override
  public String getConnectUrl(JdbcConnectInformation connectInfo) {
    return makeConnectUrl(connectInfo, connectInfo.getDatabase(), true);
  }

  @Override
  public String makeConnectUrl(JdbcConnectInformation connectionInfo, String database, boolean includeDatabase) {
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())) {
      return connectionInfo.getUrl();
    }

    StringBuilder builder = new StringBuilder();
    builder.append(MYSQL_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(connectionInfo.getHostname());

    // Set Port
    if(connectionInfo.getPort() != null) {
      builder.append(":").append(connectionInfo.getPort());
    }

    builder.append(URL_SEP);

    // Set DataBase
    if(StringUtils.isNotEmpty(database) && includeDatabase) {
      builder.append(database);
    }

    Map<String, String> propMap = connectionInfo.getPropertiesMap();
    if(propMap != null){
      String propStr = "";
      for(String key : propMap.keySet()){
        if(!StringUtils.startsWith(key, JDBC_PROPERTY_PREFIX)){
          if(StringUtils.isEmpty(propStr)){
            propStr += "?";
          } else {
            propStr += "&";
          }
          propStr += key + "=" + propMap.get(key);
        }
      }
      builder.append(propStr);
    }

    return builder.toString();
  }

  /**
   * DataBase, Schema query
   */
  @Override
  public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
    return "USE " + database;
  }

  @Override
  public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
    StringBuilder builder = new StringBuilder();

    builder.append("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE 1=1 ");

    if(excludeSchemas != null){
      builder.append(" AND SCHEMA_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
      builder.append(" ) ");
    }

    if(StringUtils.isNotEmpty(databaseNamePattern)){
      builder.append("AND SCHEMA_NAME LIKE '%" + databaseNamePattern + "%' ");
    }

    if(pageSize != null && pageNumber != null){
      builder.append("LIMIT " + (pageNumber * pageSize) + ", " + pageSize);
    }

    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(SCHEMA_NAME) AS COUNT ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE 1=1 ");

    if(excludeSchemas != null){
      builder.append(" AND SCHEMA_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
      builder.append(" ) ");
    }

    if(!StringUtils.isEmpty(databaseNamePattern)){
      builder.append(" AND SCHEMA_NAME LIKE '%" + databaseNamePattern + "%'");
    }

    return builder.toString();
  }

  @Override
  public String[] getDefaultExcludeSchemas(JdbcConnectInformation connectInfo) {
    return EXCLUDE_SCHEMAS;
  }

  /**
   * Table
   */
  @Override
  public String getTableQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables, Integer pageSize, Integer pageNumber) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT TABLE_NAME name, TABLE_TYPE type, TABLE_COMMENT comment ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE 1 = 1 ");

    if(excludeTables != null){
      builder.append(" AND TABLE_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeTables, "','") + "'");
      builder.append(" ) ");
    }

    if (StringUtils.isNotEmpty(tableNamePattern)) {
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern + "%' ");
    }
    if (StringUtils.isNotEmpty(schema)) {
      builder.append(" AND TABLE_SCHEMA='" + schema + "' ");
    }
    builder.append(" ORDER BY TABLE_NAME ");
    if(pageSize != null && pageNumber != null){
      builder.append(" LIMIT " + (pageNumber * pageSize) + ", " + pageSize);
    }
    return builder.toString();
  }

  @Override
  public String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema) {
    if(StringUtils.isEmpty(schema)) {
      return "SHOW TABLES";
    } else {
      return "SHOW TABLES IN " + schema;
    }
  }

  @Override
  public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(TABLE_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE 1 = 1 ");

    if(excludeTables != null){
      builder.append(" AND TABLE_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeTables, "','") + "'");
      builder.append(" ) ");
    }

    if (StringUtils.isNotEmpty(tableNamePattern)) {
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern + "%' ");
    }
    if (StringUtils.isNotEmpty(schema)) {
      builder.append(" AND TABLE_SCHEMA='" + schema + "' ");
    }
    return builder.toString();
  }

  @Override
  public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    if(StringUtils.isEmpty(schema)){
      schema = connectInfo.getDatabase();
    }
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT * ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_SCHEMA = '" + schema + "' ");
    builder.append(" AND TABLE_NAME = '" + table + "' ");
    return builder.toString();
  }

  @Override
  public String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo) {
    return EXCLUDE_TABLES;
  }

  @Override
  public String[] getResultSetTableType(JdbcConnectInformation connectInfo) {
    return RESULTSET_TABLE_TYPES;
  }

  /**
   * Column
   */
  @Override
  public String getColumnQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern, Integer pageSize, Integer pageNumber) {
    return "DESC " + getTableName(connectInfo, catalog, schema, table);
  }

  @Override
  public String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern) {
    return null;
  }

  /**
   * Format
   */
  @Override
  public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    if(StringUtils.isEmpty(schema) || schema.equals(connectInfo.getDatabase())) {
      return "`" + table + "`";
    }
    return schema + ".`" + table + "`";
  }

  @Override
  public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
    return Arrays.stream(fieldName.split("\\."))
                 .map(spliced -> "`" + spliced + "`")
                 .collect(Collectors.joining("."));
  }

  @Override
  public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
    return "%Y-%m-%d %T";
  }

  @Override
  public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("CAST(").append(timeStr).append(" AS DATETIME) ");
    return builder.toString();
  }

  @Override
  public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
    return "UNIX_TIMESTAMP(CAST(" + timeStr + " AS DATE))";
  }

  /**
   * Query
   */
  @Override
  public FunctionWithException<Object, Object, SQLException> resultObjectConverter() {
    return originalObj -> {
      if(originalObj instanceof Timestamp){
        return originalObj.toString();
      } else {
        return originalObj;
      }
    };
  }
}
