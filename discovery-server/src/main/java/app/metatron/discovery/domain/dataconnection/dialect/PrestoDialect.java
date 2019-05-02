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

import com.facebook.presto.jdbc.PrestoArray;

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
@Order(4)
@Component
public class PrestoDialect implements JdbcDialect {

  private static final String PRESTO_URL_PREFIX = "jdbc:presto:/";
  private static final String PRESTO_DEFAULT_OPTIONS = "";
  private static final String[] EXCLUDE_SCHEMAS = null;
  private static final String[] EXCLUDE_TABLES = {"__internal_partitions__"};
  private static final String[] RESULTSET_TABLE_TYPES_PRESTO = new String[]{"TABLE"};

  @Override
  public String getName() {
    return "Presto";
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
    return "PRESTO";
  }

  @Override
  public InputSpec getInputSpec() {
    return (new InputSpec())
        .setAuthenticationType(InputMandatory.MANDATORY)
        .setUsername(InputMandatory.MANDATORY)
        .setPassword(InputMandatory.MANDATORY)
        .setCatalog(InputMandatory.MANDATORY)
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
    return "com.facebook.presto.jdbc.PrestoDriver";
  }

  @Override
  public String getConnectorClass(JdbcConnectInformation connectInfo) {
    return null;
  }

  @Override
  public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
    return "app.metatron.discovery.domain.dataconnection.accessor.PrestoDataAccessor";
  }

  @Override
  public String getTestQuery(JdbcConnectInformation connectInfo) {
    return "SELECT 1";
  }

  @Override
  public String getConnectUrl(JdbcConnectInformation connectionInfo) {
    return makeConnectUrl(connectionInfo, connectionInfo.getDatabase(), true);
  }

  @Override
  public String makeConnectUrl(JdbcConnectInformation connectionInfo, String database, boolean includeDatabase) {
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())) {
      return connectionInfo.getUrl();
    }

    StringBuilder builder = new StringBuilder();
    builder.append(PRESTO_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(connectionInfo.getHostname());

    // Set Port
    if(connectionInfo.getPort() != null) {
      builder.append(":").append(connectionInfo.getPort());
    }

    builder.append(URL_SEP);
    if(StringUtils.isNotEmpty(connectionInfo.getCatalog())) {
      builder.append(connectionInfo.getCatalog());
      builder.append(URL_SEP);
    }

    // Set DataBase
    if(StringUtils.isNotEmpty(database) && includeDatabase) {
      builder.append(database);
    }

    if(StringUtils.isNotEmpty(PRESTO_DEFAULT_OPTIONS)) {
      builder.append("?");
      builder.append(PRESTO_DEFAULT_OPTIONS);
    }

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
  public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String schemaNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
    StringBuilder builder = new StringBuilder();

    if(pageSize != null && pageNumber != null){
      int fromIndex = (pageNumber * pageSize) + 1;
      int toIndex = (pageNumber + 1) * pageSize;

      builder.append(" SELECT schema_name ");
      builder.append(" FROM ( ");
      builder.append("   SELECT schema_name, ROW_NUMBER() OVER (PARTITION BY CURRENT_DATE ORDER BY schema_name) ROWNUM ");
      builder.append("   FROM information_schema.schemata ");
      builder.append("   WHERE 1=1 ");
      if(StringUtils.isNotEmpty(catalog)){
        builder.append("     AND catalog_name = '" + catalog + "' ");
      }

      if(excludeSchemas != null){
        builder.append(" AND schema_name NOT IN ( ");
        builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
        builder.append(" ) ");
      }

      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append("   AND schema_name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append(" ) a ");
      builder.append(" WHERE a.ROWNUM BETWEEN " + fromIndex + " AND " + toIndex );
    } else {

      builder.append(" SELECT schema_name ");
      builder.append(" FROM information_schema.schemata ");
      builder.append(" WHERE 1=1 ");
      if(StringUtils.isNotEmpty(catalog)){
        builder.append("   AND catalog_name = '" + catalog + "' ");
      }

      if(excludeSchemas != null){
        builder.append(" AND schema_name NOT IN ( ");
        builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
        builder.append(" ) ");
      }

      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append(" AND schema_name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append(" ORDER BY schema_name ");
    }

    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String schemaNamePattern, List<String> excludeSchemas) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(schema_name) ");
    builder.append(" FROM information_schema.schemata ");
    builder.append(" WHERE 1=1 ");
    if(StringUtils.isNotEmpty(catalog)){
      builder.append(" AND catalog_name = '" + catalog + "' ");
    }
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND schema_name LIKE '%" + schemaNamePattern + "%' ");
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
  public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    return "SELECT COUNT(*) AS NUM_ROWS FROM " + getTableName(connectInfo, catalog, schema, table);
  }
  @Override
  public String getTableQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables, Integer pageSize, Integer pageNumber) {
    StringBuilder builder = new StringBuilder();

    if(pageSize != null && pageNumber != null){
      int fromIndex = (pageNumber * pageSize) + 1;
      int toIndex = (pageNumber + 1) * pageSize;

      builder.append(" SELECT table_name name, table_type type ");
      builder.append(" FROM ( ");
      builder.append("   SELECT table_name, table_type, ROW_NUMBER() OVER (PARTITION BY CURRENT_DATE ORDER BY table_name) ROWNUM ");
      builder.append("   FROM information_schema.tables ");
      builder.append("   WHERE 1=1 ");
      if(StringUtils.isNotEmpty(catalog)){
        builder.append("     AND table_catalog = '" + catalog + "' ");
      }
      builder.append("     AND table_schema LIKE '%" + schema + "%' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ) a ");
      builder.append(" WHERE a.ROWNUM BETWEEN " + fromIndex + " AND " + toIndex );
    } else {

      builder.append(" SELECT table_name name, table_type type ");
      builder.append(" FROM information_schema.tables ");
      builder.append(" WHERE 1=1 ");
      if(StringUtils.isNotEmpty(catalog)){
        builder.append("  AND table_catalog = '" + catalog + "' ");
      }
      builder.append("   AND table_schema LIKE '%" + schema + "%' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append(" AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ORDER BY table_name ");
    }

    return builder.toString();
  }

  @Override
  public String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema) {
    return "SHOW TABLES FROM " + catalog + "." + schema;
  }

  @Override
  public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(table_name) ");
    builder.append(" FROM information_schema.tables ");
    builder.append(" WHERE 1=1 ");
    if(StringUtils.isNotEmpty(catalog)){
      builder.append("   AND table_catalog = '" + catalog + "' ");
    }
    builder.append("   AND table_schema LIKE '%" + schema + "%' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND table_name LIKE '%" + tableNamePattern + "%' ");
    }

    return builder.toString();
  }

  @Override
  public String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo) {
    return EXCLUDE_TABLES;
  }

  @Override
  public String[] getResultSetTableType(JdbcConnectInformation connectInfo) {
    return RESULTSET_TABLE_TYPES_PRESTO;
  }

  /**
   * Column
   */
  @Override
  public String getColumnQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern, Integer pageSize, Integer pageNumber) {
    return "SHOW COLUMNS FROM " + getTableName(connectInfo, catalog, schema, table);
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
    if(StringUtils.isEmpty(schema)) {
      return table;
    }

    if(StringUtils.isEmpty(catalog)){
      return schema + "." + table;
    }

    return catalog + "." + schema + "." + table;
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

    builder.append("parse_datetime(").append(timeStr).append(", ");
    builder.append("'");
    if(DEFAULT_FORMAT.equals(timeFormat)) {
      builder.append(getDefaultTimeFormat(connectInfo));
    } else {
      builder.append(timeFormat);
    }
    builder.append("'");
    builder.append(") ");

    return builder.toString();
  }

  @Override
  public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
    return "to_unixtime(cast(" + timeStr + " as timestamp))";
  }

  /**
   * Query
   */
  @Override
  public FunctionWithException<Object, Object, SQLException> resultObjectConverter() {
    return originalObj -> {
      if(originalObj instanceof Timestamp){
        return originalObj.toString();
      } else if (originalObj instanceof PrestoArray) {
        return ((PrestoArray) originalObj).getArray();
      } else {
        return originalObj;
      }
    };
  }
}
