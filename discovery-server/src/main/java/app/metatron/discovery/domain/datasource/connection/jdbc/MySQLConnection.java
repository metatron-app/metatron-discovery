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
@DiscriminatorValue("MYSQL")
@JsonTypeName("MYSQL")
public class MySQLConnection extends JdbcDataConnection {

  public static final String MYSQL_URL_PREFIX = "jdbc:mysql:/";
  private static final String MYSQL_DEFAULT_OPTIONS = "";
  private static final String MYSQL_CONNECT_TIMEOUT_OPTION = "connectTimeout=";
  private static final String MYSQL_SOCKET_TIMEOUT_OPTION = "socketTimeout=";
  private static final String[] DESCRIBE_PROP = {
          "TABLE_CATALOG",  //def
          "TABLE_SCHEMA",   //sample
          "TABLE_NAME",     //sales
          "TABLE_TYPE",     //BASE TABLE
          "ENGINE",         //InnoDB
          "VERSION",        //10
          "ROW_FORMAT",     //Dynamic
          "TABLE_ROWS",     //9532
          "AVG_ROW_LENGTH", //386
          "DATA_LENGTH",    //3686400
          "MAX_DATA_LENGTH", //0
          "INDEX_LENGTH",   //0
          "DATA_FREE",      //4194304
          "AUTO_INCREMENT", //null
          "CREATE_TIME",    //2017-07-23 14:02:10.0
          "UPDATE_TIME",    //null
          "CHECK_TIME",     //null
          "TABLE_COLLATION", //utf8_general_ci
          "CHECKSUM",       //null
          "CREATE_OPTIONS", //
          "TABLE_COMMENT",  //
  };


  public MySQLConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "com.mysql.jdbc.Driver";
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
    return "SHOW DATABASES";
  }

  @Override
  public String getShowSchemaQuery() {
    return "SHOW SCHEMAS";
  }

  @Override
  public String getShowTableQuery(String schema) {
    if(StringUtils.isEmpty(schema)) {
      return "SHOW TABLES";
    } else {
      return "SHOW TABLES IN " + schema;
    }
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();

    builder.append("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA ");

    if(StringUtils.isNotEmpty(databaseNamePattern)){
      builder.append("WHERE SCHEMA_NAME LIKE '%" + databaseNamePattern + "%' ");
    }

    if(pageable != null){
      builder.append("LIMIT " + (pageable.getPageNumber() * pageable.getPageSize()) + ", " + pageable.getPageSize());
    }

    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) {
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
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    return "SHOW SCHEMAS";
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
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
    if(pageable != null){
      builder.append(" LIMIT " + (pageable.getPageNumber() * pageable.getPageSize()) + ", " + pageable.getPageSize());
    }
    return builder.toString();
  }

  @Override
  public String getSchemaCountQuery(String schemaName) { return null; }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
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
  public String getTableDescQuery(String schema, String table) {
    if(StringUtils.isEmpty(schema)){
      schema = getDatabase();
    }
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT * ");
    builder.append(" FROM INFORMATION_SCHEMA.TABLES ");
    builder.append(" WHERE TABLE_SCHEMA = '" + schema + "' ");
    builder.append(" AND TABLE_NAME = '" + table + "' ");
    return builder.toString();
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
  public String getQuotatedFieldName(String fieldName) {
    return "`" + fieldName + "`";
  }

  @Override
  public String getTableName(String schema, String table) {
    if(StringUtils.isEmpty(schema) || schema.equals(database)) {
      return "`" + table + "`";
    }
    return schema + ".`" + table + "`";
  }

  @Override
  public String getDefaultTimeFormat() {
    return "%Y-%m-%d %T";
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("STR_TO_DATE('").append(timeStr).append("', ");

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
    return "DATE_FORMAT(NOW(),'" + getDefaultTimeFormat() + "') AS TIMESTAMP";
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
    builder.append(MYSQL_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    builder.append(URL_SEP);

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append(super.getDatabase());
    }

    if(StringUtils.isNotEmpty(MYSQL_DEFAULT_OPTIONS)) {
      builder.append("?");
      builder.append(MYSQL_DEFAULT_OPTIONS);
    }

    if(this.getConnectTimeout() != null) {
      if(StringUtils.isNotEmpty(MYSQL_DEFAULT_OPTIONS)){
        builder.append("&");
      } else {
        builder.append("?");
      }
      builder.append(MYSQL_CONNECT_TIMEOUT_OPTION + (this.getConnectTimeout() * 1000));
      builder.append("&");
      builder.append(MYSQL_SOCKET_TIMEOUT_OPTION + (this.getConnectTimeout() * 1000));
    }

    return builder.toString();
  }
}
