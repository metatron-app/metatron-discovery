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
@DiscriminatorValue("HAWQ")
@JsonTypeName("HAWQ")
public class HawqConnection extends JdbcDataConnection {

  private static final String HAWQ_URL_PREFIX = "jdbc:pivotal:greenplum:/";
  private static final String HAWQ_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};

  public HawqConnection() {
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getDriverClass() {
    return "com.pivotal.jdbc.GreenplumDriver";
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
    return "SELECT datname FROM pg_database WHERE datistemplate = false";
  }

  @Override
  public String getShowSchemaQuery() {
    return "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('err', 'information_schema') AND schema_name NOT LIKE 'pg_%' AND schema_name NOT LIKE 'gp_%';";
  }

  @Override
  public String getShowTableQuery(String schema) {
    return "SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = '" + schema + "' ORDER BY table_name";
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    return null;
  }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    return null;
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    return null;
  }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) { return null; }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) { return null; }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return null;
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
    builder.append(HAWQ_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    builder.append(";");

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append("DatabaseName=");
      builder.append(super.getDatabase());
      builder.append(";");
    }

    return builder.toString();
  }

}
