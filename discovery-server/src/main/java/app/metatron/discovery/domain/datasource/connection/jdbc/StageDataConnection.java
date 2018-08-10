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

/**
 * Created by kyungtaak on 2017. 3. 15..
 */
@Entity
@DiscriminatorValue("STAGE")
@JsonTypeName("STAGE")
public class StageDataConnection extends JdbcDataConnection {

  private static final String HIVE_URL_PREFIX = "jdbc:hive2:/";
  private static final String HIVE_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};

  @Column(name = "dc_metastore")
  String metastoreUrl;

  public StageDataConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "org.apache.hive.jdbc.HiveDriver";
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
      return "USE " + schema + "; SHOW TABLES;";
    }
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) { return null; }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) { return null; }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) { return null; }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) { return null; }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) { return null; }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return "DESC " + getTableName(schema, table);
  }

  @Override
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
    return null;
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
  public String getDefaultTimeFormat() {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("unix_timestamp('").append(timeStr).append("', ");

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

    if(StringUtils.isEmpty(schema) || schema.equals(database)) {
      return table;
    }
    return schema + "." + table;
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
    builder.append(HIVE_URL_PREFIX);

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
    } else {
      builder.append("default");
    }

    return builder.toString();
  }

  public String getMetastoreUrl() {
    return metastoreUrl;
  }

  public void setMetastoreUrl(String metastoreUrl) {
    this.metastoreUrl = metastoreUrl;
  }
}
