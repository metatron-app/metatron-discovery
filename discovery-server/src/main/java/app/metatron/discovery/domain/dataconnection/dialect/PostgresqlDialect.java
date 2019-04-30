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
import org.postgresql.jdbc.PgArray;
import org.postgresql.util.PGobject;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
@Order(2)
@Component
public class PostgresqlDialect implements JdbcDialect {

  private static final String POSTGRESQL_URL_PREFIX = "jdbc:postgresql:/";
  private static final String[] EXCLUDE_SCHEMAS = null;
  private static final String[] EXCLUDE_TABLES = null;

  @Override
  public String getName() {
    return "PostgreSQL";
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
    return "POSTGRESQL";
  }

  @Override
  public InputSpec getInputSpec() {
    return (new InputSpec())
        .setAuthenticationType(InputMandatory.MANDATORY)
        .setUsername(InputMandatory.MANDATORY)
        .setPassword(InputMandatory.MANDATORY)
        .setCatalog(InputMandatory.NONE)
        .setSid(InputMandatory.NONE)
        .setDatabase(InputMandatory.MANDATORY);
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
    return "org.postgresql.Driver";
  }

  @Override
  public String getConnectorClass(JdbcConnectInformation connectInfo) {
    return null;
  }

  @Override
  public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
    return "app.metatron.discovery.domain.dataconnection.accessor.PostgresqlDataAccessor";
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
    builder.append(POSTGRESQL_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(connectionInfo.getHostname());

    // Set Port
    if(connectionInfo.getPort() != null) {
      builder.append(":").append(connectionInfo.getPort());
    }

    builder.append("/");

    // Set DataBase
    if(StringUtils.isNotEmpty(connectionInfo.getDatabase())) {
      builder.append(connectionInfo.getDatabase());
    }

    return builder.toString();
  }

  /**
   * DataBase, Schema query
   */
  @Override
  public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
    return "SET SCHEMA '" + database + "'";
  }

  @Override
  public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String schemaNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT SCHEMA_NAME ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE SCHEMA_NAME NOT IN ('pg_catalog', 'information_schema') ");

    if(excludeSchemas != null){
      builder.append(" AND SCHEMA_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
      builder.append(" ) ");
    }

    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND SCHEMA_NAME LIKE '%" + schemaNamePattern.toLowerCase() + "%' ");
    }
    builder.append(" ORDER BY SCHEMA_NAME ");
    if(pageSize != null && pageNumber != null){
      builder.append(" LIMIT " + pageSize + " OFFSET " + (pageNumber * pageSize));
    }
    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String schemaNamePattern, List<String> excludeSchemas) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(SCHEMA_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE SCHEMA_NAME NOT IN ('pg_catalog', 'information_schema') ");

    if(excludeSchemas != null){
      builder.append(" AND SCHEMA_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeSchemas, "','") + "'");
      builder.append(" ) ");
    }

    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND SCHEMA_NAME LIKE '%" + schemaNamePattern.toLowerCase() + "%' ");
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
    builder.append(" SELECT TABLE_NAME as name, TABLE_TYPE as type, obj_description((TABLE_SCHEMA||'.'||TABLE_NAME)::regclass, 'pg_class') as comment ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_TYPE = 'BASE TABLE' ");
    builder.append(" AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }

    if(excludeTables != null){
      builder.append(" AND TABLE_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeTables, "','") + "'");
      builder.append(" ) ");
    }

    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern.toLowerCase() + "%' ");
    }
    builder.append(" ORDER BY TABLE_NAME ");
    if(pageSize != null && pageNumber != null){
      builder.append(" LIMIT " + pageSize + " OFFSET " + (pageNumber * pageSize));
    }
    return builder.toString();
  }

  @Override
  public String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT TABLE_NAME ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_TYPE = 'BASE TABLE' ");
    builder.append(" AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }
    builder.append(" ORDER BY TABLE_NAME ");
    return builder.toString();
  }

  @Override
  public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(TABLE_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_TYPE = 'BASE TABLE' ");
    builder.append(" AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }

    if(excludeTables != null){
      builder.append(" AND TABLE_NAME NOT IN ( ");
      builder.append("'" + StringUtils.join(excludeTables, "','") + "'");
      builder.append(" ) ");
    }

    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern.toLowerCase() + "%' ");
    }
    return builder.toString();
  }

  @Override
  public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    if(StringUtils.isEmpty(schema)) {
      schema = "public";
    }

    return "SELECT *, pg_size_pretty(total_bytes) AS total\n" +
        "    , pg_size_pretty(index_bytes) AS INDEX\n" +
        "    , pg_size_pretty(toast_bytes) AS toast\n" +
        "    , pg_size_pretty(table_bytes) AS TABLE\n" +
        "FROM (\n" +
        "  SELECT *, total_bytes-index_bytes-COALESCE(toast_bytes,0) AS table_bytes\n" +
        "  FROM (\n" +
        "    SELECT c.oid,nspname AS table_schema, relname AS TABLE_NAME\n" +
        "            , c.reltuples AS row_estimate\n" +
        "            , pg_total_relation_size(c.oid) AS total_bytes\n" +
        "            , pg_indexes_size(c.oid) AS index_bytes\n" +
        "            , pg_total_relation_size(reltoastrelid) AS toast_bytes\n" +
        "    FROM pg_class c\n" +
        "      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace\n" +
        "    WHERE relkind = 'r'\n" +
        "      AND nspname = '" + schema + "'\n" +
        "      AND relname = '" + table + "'\n" +
        "  ) a\n" +
        ") b;";
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
    if(StringUtils.isEmpty(schema)) {
      schema = "public";
    }

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT ");
    builder.append("   cols.column_name, ");
    builder.append("   cols.udt_name, ");
    builder.append("   ( ");
    builder.append("     SELECT ");
    builder.append("       pg_catalog.col_description(c.oid, cols.ordinal_position::int) ");
    builder.append("     FROM ");
    builder.append("       pg_catalog.pg_class c ");
    builder.append("     WHERE ");
    builder.append("       c.oid = (SELECT ('\"' || cols.table_name || '\"')::regclass::oid) ");
    builder.append("     AND c.relname = cols.table_name ");
    builder.append("    ) AS column_comment ");
    builder.append(" FROM ");
    builder.append("   information_schema.columns cols ");
    builder.append(" WHERE ");
    builder.append("   cols.table_schema  = '" + schema.toLowerCase() + "' ");
    builder.append(" AND cols.table_name   = '" + table.toLowerCase() + "' ");

    if(StringUtils.isNotEmpty(columnNamePattern)){
      builder.append(" AND cols.column_name LIKE '%" + columnNamePattern.toLowerCase() + "%' ");
    }
    if(pageSize != null && pageNumber != null){
      builder.append(" LIMIT " + pageSize + " OFFSET " + (pageNumber * pageSize));
    }
    return builder.toString();
  }

  @Override
  public String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern) {
    if(StringUtils.isEmpty(schema)) {
      schema = "public";
    }

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(COLUMN_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.COLUMNS ");
    builder.append(" WHERE TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    builder.append(" AND TABLE_NAME = '" + table.toLowerCase() + "' ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }
    if(StringUtils.isNotEmpty(columnNamePattern)){
      builder.append(" AND COLUMN_NAME LIKE '%" + columnNamePattern.toLowerCase() + "%' ");
    }
    return builder.toString();
  }


  /**
   * Format
   */
  @Override
  public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
    return "YYYY-MM-DD HH24:MI:SS";
  }

  @Override
  public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("TO_DATE(").append(timeStr).append(", ");

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
  public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    if(StringUtils.isEmpty(schema)) {
      return table;
    }
    return schema + "." + table;
  }

  @Override
  public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
    return fieldName;
  }

  @Override
  public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
    return "extract(epoch from to_date(" + timeStr + ", 'YYYY-MM-DD HH24:MI:SS'))";
  }

  /**
   * Query
   */
  @Override
  public FunctionWithException<Object, Object, SQLException> resultObjectConverter() {
    return originalObj -> {
      if(originalObj instanceof Timestamp){
        return originalObj.toString();
      } else if (originalObj instanceof PgArray || originalObj instanceof PGobject) {
        return originalObj.toString();
      } else {
        return originalObj;
      }
    };
  }
}
