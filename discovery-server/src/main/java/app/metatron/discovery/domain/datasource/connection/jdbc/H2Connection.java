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
@DiscriminatorValue("H2")
@JsonTypeName("H2")
public class H2Connection extends JdbcDataConnection {
  private static final String H2_URL_PREFIX = "jdbc:h2:file:";
  private static final String H2_DEFAULT_OPTIONS = "AUTO_SERVER=TRUE";
  private static final String[] DESCRIBE_PROP = {};

  String path;

  String options;

  public H2Connection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "org.h2.Driver";
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
    return "SHOW SCHEMA";
  }

  @Override
  public String getShowTableQuery(String schema) {
    return "SHOW TABLES";
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    return "SHOW DATABASES";
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    return "SHOW SCHEMA";
  }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) { return null; }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    return "SHOW TABLES";
  }

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
  public String getTableName(String schema, String table) {
    return "`" + table + "`";
  }

  @Override
  public String getQuotatedFieldName(String fieldName) {
    return fieldName;
  }

  @Override
  public String getDefaultTimeFormat() {
    return null;
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    return null;
  }

  @Override
  public String getCurrentTimeStamp() {
    return "DATE_FORMAT(NOW(),'%Y-%d-%m %T') AS TIMESTAMP";
  }

  @Override
  public String getConnectUrl() {
    return makeConnectUrl(true);
  }

  @Override
  public String makeConnectUrl(boolean includeDatabase) {

    StringBuilder builder = new StringBuilder();
    builder.append(H2_URL_PREFIX);
//    builder.append(super.getHostname());
//    if(super.getPort() != null) {
//      builder.append(":").append(super.getPort());
//    }
    if(StringUtils.isNotEmpty(this.getPath())) {
      //builder.append(URL_SEP);
      builder.append(this.getPath());
    }

    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append(URL_SEP);
      builder.append(super.getDatabase());
    }

    builder.append(";");

    if(StringUtils.isNotEmpty(this.getOptions())) {
      builder.append(this.getOptions());
    } else {
      builder.append(H2_DEFAULT_OPTIONS);
    }

    return builder.toString();
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getOptions() {
    return options;
  }

  public void setOptions(String options) {
    this.options = options;
  }
}
