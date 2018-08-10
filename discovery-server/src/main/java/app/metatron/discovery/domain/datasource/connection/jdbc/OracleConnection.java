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

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@Entity
@DiscriminatorValue("ORACLE")
@JsonTypeName("ORACLE")
public class OracleConnection extends JdbcDataConnection {

  private static final String ORCLE_URL_PREFIX = "jdbc:oracle:thin:@/";
  private static final String ORCLE_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};

  @NotNull
  @Column(name = "dc_sid")
  String sid;

  public OracleConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  public String getSid() {
    return sid;
  }

  public void setSid(String sid) {
    this.sid = sid;
  }

  @Override
  public String getDriverClass() {
    return "oracle.jdbc.OracleDriver";
  }

  @Override
  public String getTestQuery() {
    return "SELECT 1 FROM DUAL";
  }

  @Override
  public String getUseDatabaseQuery(String database) {
    return "ALTER SESSION SET CURRENT_SCHEMA = " + database;
  }

  @Override
  public String getShowDataBaseQuery() {
    return null;
  }

  @Override
  public String getShowSchemaQuery() {
    return "SELECT username FROM dba_users WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') AND account_status='OPEN'";
  }

  @Override
  public String getShowTableQuery(String schema) {
    return "SELECT tname FROM tab WHERE tabtype='TABLE'";
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    return null;
  }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT username ");
      builder.append(" FROM (");
      builder.append("   SELECT username, ROW_NUMBER() OVER(ORDER BY username ASC) AS NUM ");
      builder.append("   FROM dba_users ");
      builder.append("   WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') ");
      builder.append("     AND account_status='OPEN' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append("   AND LOWER(username) LIKE LOWER('%" + schemaNamePattern + "%')");
      }
      builder.append("   ORDER BY username ");
      builder.append(" ) ");
      builder.append(" WHERE NUM BETWEEN " + fromIndex + " AND " + toIndex);
    } else {
      builder.append(" SELECT username ");
      builder.append(" FROM dba_users ");
      builder.append(" WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') ");
      builder.append("   AND account_status='OPEN' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append("  AND LOWER(username) LIKE LOWER('%" + schemaNamePattern + "%')");
      }
      builder.append(" ORDER BY username )");
    }

    return builder.toString();
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();
    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT OBJECT_NAME name, OBJECT_TYPE type ");
      builder.append(" FROM (");
      builder.append("   SELECT DISTINCT OBJECT_NAME, OBJECT_TYPE, ROW_NUMBER() OVER(ORDER BY OBJECT_NAME ASC) AS NUM ");
      builder.append("   FROM ALL_OBJECTS ");
      builder.append("   WHERE OBJECT_TYPE='TABLE' ");
      builder.append("   AND OWNER='" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("    AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
      }
      builder.append("   ORDER BY OBJECT_NAME ");
      builder.append(" ) ");
      builder.append(" WHERE NUM BETWEEN " + fromIndex + " AND " + toIndex);
    } else {
      builder.append(" SELECT DISTINCT OBJECT_NAME name, OBJECT_TYPE type ");
      builder.append(" FROM ALL_OBJECTS ");
      builder.append(" WHERE OBJECT_TYPE='TABLE' ");
      builder.append(" AND OWNER='" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("  AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
      }
      builder.append(" ORDER BY OBJECT_NAME ");
    }

    return builder.toString();
  }

  @Override
  public String getTableDescQuery(String schema, String table) {

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT S.OWNER, S.SEGMENT_NAME, S.BYTES / 1024 KB, S.BYTES/1024/1024 MB, T.NUM_ROWS ");
    builder.append(" FROM DBA_SEGMENTS S ");
    builder.append("   INNER JOIN ALL_TABLES T ON S.SEGMENT_NAME = T.TABLE_NAME ");
    builder.append(" WHERE 1=1 ");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" AND S.OWNER = UPPER('" + schema + "') ");
    }
    if(StringUtils.isNotEmpty(table)){
      builder.append(" AND S.SEGMENT_NAME = UPPER('" + table + "') ");
    }
    return builder.toString();
  }

  @Override
  public String getTableName(String schema, String table) {
    if(StringUtils.isEmpty(schema) || schema.equals(sid)) {
      return table;
    }
    return schema + "." + table;
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append("SELECT COUNT(username) AS COUNT FROM dba_users WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') AND account_status='OPEN'");

    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND LOWER(username) LIKE LOWER('%" + schemaNamePattern + "%')");
    }

    return builder.toString(); }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(DISTINCT OBJECT_NAME) ");
    builder.append(" FROM ALL_OBJECTS ");
    builder.append(" WHERE OBJECT_TYPE='TABLE' ");
    builder.append(" AND OWNER='" + schema + "' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("  AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
    }
    return builder.toString();
  }

  @Override
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
    return "SELECT cname, coltype FROM col WHERE tname='" + table + "'";
  }

  @Override
  public String getColumnCountQuery(String schema, String table, String columnNamePattern) {
    return null;
  }

  @Override
  public String getQuotatedFieldName(String fieldName) {
    return "\"" + fieldName + "\"";
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
    return "TO_CHAR(SYSDATE, '" + getDefaultTimeFormat() + "') AS TIMESTAMP";
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
    builder.append(ORCLE_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    builder.append(URL_SEP);

    // Set Sid
    builder.append(getSid());

    return builder.toString();
  }
}
