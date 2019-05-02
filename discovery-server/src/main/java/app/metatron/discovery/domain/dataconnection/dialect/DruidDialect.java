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
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
@Order(5)
@Component
public class DruidDialect implements JdbcDialect {

  public static final String DRUID_URL_PREFIX = "jdbc:avatica:remote:url=http://";
  public static final String DRUID_URL_PATH = "/druid/v2/sql/avatica/";
  private static final String[] EXCLUDE_SCHEMAS = null;
  private static final String[] EXCLUDE_TABLES = null;

  @Override
  public String getName() {
    return "Druid";
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
    return "DRUID";
  }

  @Override
  public InputSpec getInputSpec() {
    return (new InputSpec())
        .setAuthenticationType(InputMandatory.NONE)
        .setCatalog(InputMandatory.NONE)
        .setSid(InputMandatory.NONE)
        .setDatabase(InputMandatory.NONE)
        .setUsername(InputMandatory.NONE)
        .setPassword(InputMandatory.NONE);
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
    return null;
  }

  @Override
  public String getConnectorClass(JdbcConnectInformation connectInfo) {
    return null;
  }

  @Override
  public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
    return "app.metatron.discovery.domain.dataconnection.accessor.DruidDataAccessor";
  }

  @Override
  public String getTestQuery(JdbcConnectInformation connectInfo) {
    return "SELECT 1";
  }

  @Override
  public String getConnectUrl(JdbcConnectInformation connectionInfo) {
    return makeConnectUrl(connectionInfo, connectionInfo.getDatabase(),  true);
  }

  @Override
  public String makeConnectUrl(JdbcConnectInformation connectionInfo, String database, boolean includeDatabase) {
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())) {
      return connectionInfo.getUrl();
    }

    StringBuilder builder = new StringBuilder();
    builder.append(DRUID_URL_PREFIX);

    builder.append(connectionInfo.getHostname());

    // Set Port
    if(connectionInfo.getPort() != null) {
      builder.append(":").append(connectionInfo.getPort());
    }

    builder.append(DRUID_URL_PATH);

    return builder.toString();
  }

  /**
   * DataBase, Schema query
   */
  @Override
  public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
    return null;
  }

  @Override
  public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
    // return druid schema only
    return "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME = 'druid'";
  }

  @Override
  public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas) {
    if(StringUtils.isEmpty(databaseNamePattern)){
      return "SELECT COUNT(SCHEMA_NAME) AS COUNT " +
          "FROM INFORMATION_SCHEMA.SCHEMATA";
    } else {
      return "SELECT COUNT(SCHEMA_NAME) AS COUNT " +
          "FROM INFORMATION_SCHEMA.SCHEMATA " +
          "WHERE SCHEMA_NAME LIKE '%" + databaseNamePattern + "%'";
    }
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
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT TABLE_NAME name, TABLE_TYPE type, TABLE_COMMENT comment ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE 1 = 1 ");
    if (StringUtils.isNotEmpty(schema)) {
      builder.append(" AND TABLE_SCHEMA='" + schema + "' ");
    }
    builder.append(" ORDER BY TABLE_NAME ");
    return builder.toString();
  }

  @Override
  public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(TABLE_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE 1 = 1 ");
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
    return "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + getTableName(connectInfo, catalog, schema, table) + "'";
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
      return "\"" + table + "\"";
    }
    return schema + ".\"" + table + "\"";
  }

  @Override
  public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
    return Arrays.stream(fieldName.split("\\."))
                 .map(spliced -> "\"" + spliced + "\"")
                 .collect(Collectors.joining("."));
  }

  @Override
  public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("TIME_PARSE(");
    builder.append(timeStr);
    builder.append(", '");

    if(DEFAULT_FORMAT.equals(timeFormat)) {
      builder.append(getDefaultTimeFormat(connectInfo));
    } else {
      builder.append(timeFormat);
    }
    builder.append("') ");

    return builder.toString();
  }

  @Override
  public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
    return "TIMESTAMP_TO_MILLIS(TIME_PARSE(" + timeStr + ")) / 1000";
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
