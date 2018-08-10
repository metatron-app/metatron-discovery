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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Pageable;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * 제약 사항 : DATABASE 설정이 없을시, 사용자명으로 접속 (Database 설정을 필수로 넣어야할 듯)
 */
@Entity
@DiscriminatorValue("POSTGRESQL")
@JsonTypeName("POSTGRESQL")
public class PostgresqlConnection extends JdbcDataConnection {

  private static final String POSTGRESQL_URL_PREFIX = "jdbc:postgresql:/";
  private static final String POSTGRESQL_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};

  public PostgresqlConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "org.postgresql.Driver";
  }

  @Override
  public String getTestQuery() {
    return "SELECT 1";
  }

  @Override
  public String getUseDatabaseQuery(String database) {
    return "SET SCHEMA '" + database + "'";
  }

  @Override
  public String getShowDataBaseQuery() {
    return "SELECT datname FROM pg_database;";
  }

  @Override
  public String getShowTableQuery(String schema) {
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
  public String getShowSchemaQuery() {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT SCHEMA_NAME ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE SCHEMA_NAME NOT IN ('pg_catalog', 'information_schema') ");
    builder.append(" ORDER BY SCHEMA_NAME ");
    return builder.toString();
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) { return null; }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT SCHEMA_NAME ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE SCHEMA_NAME NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND SCHEMA_NAME LIKE '%" + schemaNamePattern.toLowerCase() + "%' ");
    }
    builder.append(" ORDER BY SCHEMA_NAME ");
    if(pageable != null){
      builder.append(" LIMIT " + pageable.getPageSize() + " OFFSET " + (pageable.getPageNumber() * pageable.getPageSize()));
    }
    return builder.toString();
  }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(SCHEMA_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.SCHEMATA ");
    builder.append(" WHERE SCHEMA_NAME NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND SCHEMA_NAME LIKE '%" + schemaNamePattern.toLowerCase() + "%' ");
    }
    return builder.toString();
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT TABLE_NAME as name, TABLE_TYPE as type, obj_description(TABLE_NAME::regclass, 'pg_class') as comment ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_TYPE = 'BASE TABLE' ");
    builder.append(" AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern.toLowerCase() + "%' ");
    }
    builder.append(" ORDER BY TABLE_NAME ");
    if(pageable != null){
      builder.append(" LIMIT " + pageable.getPageSize() + " OFFSET " + (pageable.getPageNumber() * pageable.getPageSize()));
    }
    return builder.toString();
  }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(TABLE_NAME) ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_TYPE = 'BASE TABLE' ");
    builder.append(" AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema') ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND TABLE_SCHEMA = '" + schema.toLowerCase() + "' ");
    }
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND TABLE_NAME LIKE '%" + tableNamePattern.toLowerCase() + "%' ");
    }
    return builder.toString();
  }

  @Override
  public String getTableDescQuery(String schema, String table) {
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
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
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
    if(pageable != null){
      builder.append(" LIMIT " + pageable.getPageSize() + " OFFSET " + (pageable.getPageNumber() * pageable.getPageSize()));
    }
    return builder.toString();
  }

  @Override
  public String getColumnCountQuery(String schema, String table, String columnNamePattern) {
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

  @Override
  public String getDefaultTimeFormat() {
    return "YYYY-MM-DD HH24:MI:SS";
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("TO_DATE('").append(timeStr).append("', ");

    builder.append("'");
    if(DEFAULT_FORMAT.equals(timeFormat)) {
      builder.append(getDefaultTimeFormat());
    } else {
      builder.append(timeFormat).append("'");
    }
    builder.append("'");
    builder.append(") ");

    return builder.toString();
  }

  @Override
  public String getCurrentTimeStamp() {
    return "TO_CHAR(NOW(), '" + getDefaultTimeFormat() + "') AS TIMESTAMP";
  }

  @Override
  public String getTableName(String schema, String table) {
    if(StringUtils.isEmpty(schema)) {
      return table;
    }
    return schema + "." + table;
  }

  @Override
  public String getQuotatedFieldName(String fieldName) {
    return fieldName;
  }

  @Override
  public String getConnectUrl() {
    return makeConnectUrl(true);
  }

  @Override
  public String makeConnectUrl(boolean includeDatabase) {
    if(StringUtils.isNotEmpty(super.url)) {
      return super.url;
    }

    StringBuilder builder = new StringBuilder();
    builder.append(POSTGRESQL_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    builder.append("/");

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase())) {
      builder.append(super.getDatabase());
    }

    return builder.toString();
  }

}
