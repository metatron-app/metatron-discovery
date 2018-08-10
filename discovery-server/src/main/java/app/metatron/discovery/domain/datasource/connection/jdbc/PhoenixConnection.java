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

@Entity
@DiscriminatorValue("PHOENIX")
@JsonTypeName("PHOENIX")
public class PhoenixConnection extends JdbcDataConnection {

  private static final String PHOENIX_URL_PREFIX = "jdbc:phoenix:thin:url=http://";
  private static final String PHOENIX_DEFAULT_OPTIONS = "serialization=PROTOBUF";
  private static final String PHOEINX_DEFAULT_SCHEMA = " ";
  private static final String[] DESCRIBE_PROP = {};

  public PhoenixConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
//    return "org.apache.phoenix.jdbc.PhoenixDriver";
    return "org.apache.phoenix.queryserver.client.Driver";
  }

  @Override
  public String getTestQuery() {
    return "SELECT 1";
  }

  @Override
  public String getUseDatabaseQuery(String database) {
    return "USE " + database;
  }

  @Override
  public String getShowDataBaseQuery() {
    return "SELECT DISTINCT table_schem FROM system.catalog WHERE table_type='u'";
  }

  @Override
  public String getShowSchemaQuery() {
    return "SELECT DISTINCT table_schem FROM system.catalog WHERE table_type='u'";
  }

  @Override
  public String getShowTableQuery(String schema) {
    if(StringUtils.isEmpty(schema)) {
      return "SELECT DISTINCT table_name FROM system.catalog WHERE table_type='u'";
    } else {
      return "SELECT DISTINCT table_name FROM system.catalog WHERE table_type='u' AND table_schem='" + schema + "'";
    }
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) { return null; }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT DISTINCT SCHEME_NAME ");
    builder.append(" FROM ( ");
    builder.append("   SELECT CASE WHEN TABLE_SCHEM IS NULL THEN '" + PHOEINX_DEFAULT_SCHEMA + "' ELSE TABLE_SCHEM END AS SCHEME_NAME, TABLE_SCHEM ");
    builder.append("   FROM SYSTEM.\"CATALOG\" \"SYSTEM.TABLE\" ");
    builder.append("   WHERE TABLE_TYPE = 'u' ");
    builder.append("   AND COLUMN_NAME IS NULL AND TENANT_ID IS NULL ");
    builder.append("   ORDER BY TABLE_SCHEM ");
    builder.append(" ) ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" WHERE SCHEME_NAME LIKE '%" + schemaNamePattern.toUpperCase() + "%'");
    }
    if(pageable != null){
      builder.append(" LIMIT " + pageable.getPageSize() + " OFFSET " + (pageable.getPageNumber() * pageable.getPageSize()));
    }
    return builder.toString();

    //SELECT DISTINCT CASE WHEN TABLE_SCHEM IS NULL THEN ' ' ELSE TABLE_SCHEM END AS SCHEME_NAME, TABLE_SCHEM  FROM SYSTEM."CATALOG" "SYSTEM.TABLE"  WHERE TABLE_TYPE = 'u'  AND COLUMN_NAME IS NULL AND TENANT_ID IS NULL  AND SCHEME_NAME LIKE '% %'
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT TABLE_NAME name, SCHEME_NAME schemaname, REMARKS comment, TABLE_TYPE type");
    builder.append(" FROM ( ");
    builder.append("   SELECT TABLE_NAME, CASE WHEN TABLE_SCHEM IS NULL THEN '" + PHOEINX_DEFAULT_SCHEMA + "' ELSE TABLE_SCHEM END AS SCHEME_NAME, REMARKS, TABLE_TYPE ");
    builder.append("   FROM SYSTEM.\"CATALOG\" \"SYSTEM.TABLE\" ");
    builder.append("   WHERE COLUMN_NAME IS NULL ");
    builder.append("     AND COLUMN_FAMILY IS NULL ");
    builder.append("     AND TABLE_NAME != ' ' ");
    builder.append("     AND TABLE_TYPE IN ('u','v') ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("     AND TABLE_NAME LIKE '%" + tableNamePattern.toUpperCase() + "%' ");
    }
    builder.append(" ) ");

    if(StringUtils.isNotEmpty(schema)){
      builder.append(" WHERE SCHEME_NAME LIKE '" + schema.toUpperCase() + "' ");
    }

    builder.append(" ORDER BY TABLE_NAME ");
    if(pageable != null){
      int size = pageable.getPageSize();
      int offset = pageable.getPageNumber() * pageable.getPageSize();
      builder.append(" LIMIT " + size + " OFFSET " + offset);
    }
    return builder.toString();
    //SELECT TABLE_NAME, CASE WHEN TABLE_SCHEM IS NULL THEN 'NO_SCHEME' ELSE TABLE_SCHEM END AS TABLE_SCHEM FROM SYSTEM."CATALOG" "SYSTEM.TABLE" WHERE TABLE_TYPE IN ('u','v');
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(DISTINCT SCHEME_NAME) ");
    builder.append(" FROM ( ");
    builder.append("   SELECT CASE WHEN TABLE_SCHEM IS NULL THEN '" + PHOEINX_DEFAULT_SCHEMA + "' ELSE TABLE_SCHEM END AS SCHEME_NAME, TABLE_SCHEM ");
    builder.append("   FROM SYSTEM.\"CATALOG\" \"SYSTEM.TABLE\" ");
    builder.append("   WHERE TABLE_TYPE = 'u' ");
    builder.append("   AND COLUMN_NAME IS NULL AND TENANT_ID IS NULL ");
    builder.append(" ) ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" WHERE SCHEME_NAME LIKE '%" + schemaNamePattern.toUpperCase() + "%'");
    }
    return builder.toString();
  }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(TABLE_NAME) ");
    builder.append(" FROM ( ");
    builder.append("   SELECT TABLE_NAME, CASE WHEN TABLE_SCHEM IS NULL THEN '" + PHOEINX_DEFAULT_SCHEMA + "' ELSE TABLE_SCHEM END AS SCHEME_NAME ");
    builder.append("   FROM SYSTEM.\"CATALOG\" \"SYSTEM.TABLE\" ");
    builder.append("   WHERE COLUMN_NAME IS NULL ");
    builder.append("     AND COLUMN_FAMILY IS NULL ");
    builder.append("     AND TABLE_NAME != ' ' ");
    builder.append("     AND TABLE_TYPE IN ('u','v') ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("     AND TABLE_NAME LIKE '%" + tableNamePattern.toUpperCase() + "%' ");
    }
    builder.append(" ) ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" WHERE SCHEME_NAME LIKE '" + schema.toUpperCase() + "' ");
    }
    return builder.toString();
  }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return "SELECT COUNT(*) AS NUM_ROWS FROM " + getTableName(schema, table);
  }

  @Override
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COLUMN_NAME, '' ");
    builder.append(" FROM SYSTEM.CATALOG ");
    builder.append(" WHERE 1=1 ");
    if(StringUtils.isNotEmpty(schema) || !schema.equals(PHOEINX_DEFAULT_SCHEMA)){
      builder.append(" AND TABLE_SCHEM = '" + schema.toUpperCase() + "' ");
    }
    builder.append(" AND TABLE_NAME = '" + table.toUpperCase() + "' ");
    builder.append(" AND COLUMN_NAME IS NOT NULL ");
    return builder.toString();
  }

  @Override
  public String getColumnCountQuery(String schema, String table, String columnNamePattern) {
    return null;
  }

  @Override
  public String getDefaultTimeFormat() {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("TO_DATE(").append(timeStr).append(", ");

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
    return "DATE_FORMAT(current_timestamp,'" + getDefaultTimeFormat() + "') AS TIMESTAMP1";
  }

  @Override
  public String getTableName(String schema, String table) {

    if(StringUtils.isEmpty(schema)
            || schema.equals(PHOEINX_DEFAULT_SCHEMA)
            || (StringUtils.isNotEmpty(database) && database.equals(schema))) {
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
    builder.append(PHOENIX_URL_PREFIX);

    // Set HostName
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append(":/").append(super.getDatabase());
    }

    if(StringUtils.isNotEmpty(super.getOptions())) {
      builder.append(";").append(super.getOptions());
    } else {
      builder.append(";").append(PHOENIX_DEFAULT_OPTIONS);
    }

    return builder.toString();
  }

}
