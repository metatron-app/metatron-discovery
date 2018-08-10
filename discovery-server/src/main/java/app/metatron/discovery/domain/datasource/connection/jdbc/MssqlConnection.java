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
 * Created by kyungtaak on 2016. 6. 16..
 */
@Entity
@DiscriminatorValue("MSSQL")
@JsonTypeName("MSSQL")
public class MssqlConnection extends JdbcDataConnection {

  private static final String MSSQL_URL_PREFIX = "jdbc:sqlserver:/";
  private static final String MSSQL_DEFAULT_OPTIONS = "";
  private static final String MSSQL_TIMEOUT_OPTION = "loginTimeout=";
  private static final String[] DESCRIBE_PROP = {};

  public MssqlConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "com.microsoft.sqlserver.jdbc.SQLServerDriver";
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
    return "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb');";
  }

  @Override
  public String getShowSchemaQuery() {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT DISTINCT s.NAME ");
    builder.append(" FROM SYS.ALL_OBJECTS ao ");
    builder.append(" INNER JOIN SYS.SCHEMAS s ");
    builder.append("   ON s.schema_id = ao.schema_id ");
    builder.append(" WHERE ao.type = 'u' ");
    return builder.toString();
  }

  @Override
  public String getShowTableQuery(String schema) {

    if(StringUtils.isEmpty(schema)) {
      schema = "dbo";
    }

    return "SELECT table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema = '" + schema + "' ORDER BY table_name;";
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();

    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT A.name ");
      builder.append(" FROM (");
      builder.append("   SELECT name, ROW_NUMBER() OVER(ORDER BY name ASC) AS NUM ");
      builder.append("   FROM sys.databases ");
      builder.append("   WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ");
      if(StringUtils.isNotEmpty(databaseNamePattern)){
        builder.append("   AND name LIKE '%" + databaseNamePattern + "%' ");
      }
      builder.append(" ) A ");
      builder.append(" WHERE A.NUM BETWEEN " + fromIndex + " AND " + toIndex);
    } else {
      builder.append(" SELECT name ");
      builder.append(" FROM sys.databases ");
      builder.append(" WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ");
      if(StringUtils.isNotEmpty(databaseNamePattern)){
        builder.append(" AND name LIKE '%" + databaseNamePattern + "%' ");
      }
      builder.append(" ORDER BY name ");
    }
    builder.append(";");
    return builder.toString();
  }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT A.name ");
      builder.append(" FROM (");
      builder.append("   SELECT s.name, ROW_NUMBER() OVER(ORDER BY s.name ASC) AS NUM ");
      builder.append("   FROM SYS.ALL_OBJECTS ao ");
      builder.append("   INNER JOIN SYS.SCHEMAS s ");
      builder.append("     ON s.schema_id = ao.schema_id ");
      builder.append("   WHERE ao.type = 'u' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append("   AND s.name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append("   GROUP BY s.name ");
      builder.append(" ) A ");
      builder.append(" WHERE A.NUM BETWEEN " + fromIndex + " AND " + toIndex);
    } else {
      builder.append(" SELECT DISTINCT s.name ");
      builder.append(" FROM SYS.ALL_OBJECTS ao ");
      builder.append(" INNER JOIN SYS.SCHEMAS s ");
      builder.append("   ON s.schema_id = ao.schema_id ");
      builder.append(" WHERE ao.type = 'u' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append(" AND s.name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append(" ORDER BY s.name ");
    }
    builder.append(";");
    return builder.toString();
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {

    StringBuilder builder = new StringBuilder();
    if(StringUtils.isEmpty(schema)) {
      schema = "dbo";
    }

    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT A.table_name name, A.table_type type ");
      builder.append("   FROM (");
      builder.append("   SELECT table_name, table_type, ROW_NUMBER() OVER(ORDER BY table_name ASC) AS NUM ");
      builder.append("   FROM information_schema.tables ");
      builder.append("   WHERE table_type='BASE TABLE' ");
      builder.append("     AND table_schema = '" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("     AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ) A ");
      builder.append(" WHERE A.NUM BETWEEN " + fromIndex + " AND " + toIndex);
    } else {
      builder.append(" SELECT table_name name, table_type type ");
      builder.append(" FROM information_schema.tables ");
      builder.append(" WHERE table_type='BASE TABLE' ");
      builder.append("   AND table_schema = '" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ORDER BY table_name ");
    }
    builder.append(";");
    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(name) ");
    builder.append(" FROM sys.databases ");
    builder.append(" WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ");
    if(StringUtils.isNotEmpty(databaseNamePattern)){
      builder.append(" AND name LIKE '%" + databaseNamePattern + "%' ");
    }
    builder.append(";");
    return builder.toString();
  }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(DISTINCT s.name) ");
    builder.append(" FROM SYS.ALL_OBJECTS ao ");
    builder.append(" INNER JOIN SYS.SCHEMAS s ");
    builder.append("   ON s.schema_id = ao.schema_id ");
    builder.append(" WHERE ao.type = 'u' ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND s.name LIKE '%" + schemaNamePattern + "%' ");
    }
    builder.append(";");
    return builder.toString();
  }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
    if(StringUtils.isEmpty(schema)) {
      schema = "dbo";
    }

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(table_name) ");
    builder.append(" FROM information_schema.tables ");
    builder.append(" WHERE table_type='BASE TABLE' ");
    builder.append("   AND table_schema = '" + schema + "' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
    }
    return builder.toString();
  }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return "SELECT \n" +
            "    t.name AS TableName,\n" +
            "    s.name AS SchemaName,\n" +
            "    t.create_date as CreateDate,\n " +
            "    t.modify_date as ModifyDate,\n" +
            "    p.rows AS RowCounts,\n" +
            "    SUM(a.total_pages) * 8 AS TotalSpaceKB, \n" +
            "    CAST(ROUND(((SUM(a.total_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS TotalSpaceMB,\n" +
            "    SUM(a.used_pages) * 8 AS UsedSpaceKB, \n" +
            "    CAST(ROUND(((SUM(a.used_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS UsedSpaceMB, \n" +
            "    (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS UnusedSpaceKB,\n" +
            "    CAST(ROUND(((SUM(a.total_pages) - SUM(a.used_pages)) * 8) / 1024.00, 2) AS NUMERIC(36, 2)) AS UnusedSpaceMB\n" +
            "FROM \n" +
            "    sys.tables t\n" +
            "INNER JOIN      \n" +
            "    sys.indexes i ON t.OBJECT_ID = i.object_id\n" +
            "INNER JOIN \n" +
            "    sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id\n" +
            "INNER JOIN \n" +
            "    sys.allocation_units a ON p.partition_id = a.container_id\n" +
            "LEFT OUTER JOIN \n" +
            "    sys.schemas s ON t.schema_id = s.schema_id\n" +
            "WHERE \n" +
            "    t.NAME NOT LIKE 'dt%' \n" +
            "    AND t.NAME LIKE '" + table + "' \n" +
            "    AND s.NAME LIKE '" + schema + "' \n" +
            "    AND t.is_ms_shipped = 0\n" +
            "    AND i.OBJECT_ID > 255 \n" +
            "GROUP BY \n" +
            "    t.Name, s.Name, t.create_date, t.modify_date, p.Rows\n" +
            "ORDER BY \n" +
            "    t.Name";
  }

  @Override
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
    return "DESC " + getTableName(schema, table);
  }

  @Override
  public String getColumnCountQuery(String schema, String table, String columnNamePattern) {
    return null;
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
    builder.append(MSSQL_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append(";");
      builder.append("database=");
      builder.append(super.getDatabase());
    }

    if(this.getConnectTimeout() != null) {
      builder.append(";");
      builder.append(MSSQL_TIMEOUT_OPTION);
      builder.append(this.getConnectTimeout());
    }

    return builder.toString();
  }

}
