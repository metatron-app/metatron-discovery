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
import javax.persistence.Transient;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Entity
@DiscriminatorValue("HIVE")
@JsonTypeName("HIVE")
public class HiveConnection extends HiveMetastoreConnection {

  private static final String HIVE_URL_PREFIX = "jdbc:hive2:/";
  private static final String HIVE_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};
  private static final String KERBEROS_PRINCIPAL_PATTERN = "principal=(.+)@(.[^;,\\n\\r\\t]+)";

  @Column(name = "dc_secondary_username")
  String secondaryUsername;

  @Column(name = "dc_secondary_password")
  String secondaryPassword;

  @Column(name = "dc_hdfs_conf_path")
  String hdfsConfigurationPath;

  @Column(name = "dc_personal_database_prefix")
  String personalDatabasePrefix;

  public HiveConnection() {
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
    if(StringUtils.isEmpty(schema)){
      return "SHOW TABLES";
    } else {
      return "SHOW TABLES IN " + schema;
    }
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) {
    if(StringUtils.isEmpty(databaseNamePattern)){
      return "SHOW DATABASES";
    } else {
      return "SHOW DATABASES LIKE '*" + databaseNamePattern + "*'";
    }
  }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    if (StringUtils.isEmpty(schemaNamePattern)) {
      return "SHOW SCHEMAS";
    } else {
      return "SHOW SCHEMAS LIKE '*" + schemaNamePattern + "*'";
    }
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();

    if(StringUtils.isNotEmpty(schema)){
      builder.append("USE " + schema + ";");
    }

    builder.append("SHOW TABLES");

    if(StringUtils.isNotEmpty(tableNamePattern)) {
      builder.append(" LIKE '*" + tableNamePattern + "*'");
    }
    return builder.toString();
  }

  @Override
  public String getDataBaseCountQuery(String databaseName) {
    return null;
  }

  @Override
  public String getSchemaCountQuery(String schemaName) {
    return null;
  }

  @Override
  public String getTableCountQuery(String schema, String tableName) { return null; }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return "DESCRIBE FORMATTED " + getTableName(schema, table);
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

  public String getSecondaryUsername() {
    return secondaryUsername;
  }

  public void setSecondaryUsername(String secondaryUsername) {
    this.secondaryUsername = secondaryUsername;
  }

  public String getSecondaryPassword() {
    return secondaryPassword;
  }

  public void setSecondaryPassword(String secondaryPassword) {
    this.secondaryPassword = secondaryPassword;
  }

  public String getHdfsConfigurationPath() {
    return hdfsConfigurationPath;
  }

  public void setHdfsConfigurationPath(String hdfsConfigurationPath) {
    this.hdfsConfigurationPath = hdfsConfigurationPath;
  }

  public String getPersonalDatabasePrefix() {
    return personalDatabasePrefix;
  }

  public void setPersonalDatabasePrefix(String personalDatabasePrefix) {
    this.personalDatabasePrefix = personalDatabasePrefix;
  }

  @Transient
  public boolean isKerberos(){
    if(StringUtils.isNotEmpty(this.url)){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(this.url);
      if(m.find() && m.groupCount() > 1){
        return true;
      }
    }
    return false;
  }

  @Transient
  public String getKerberosUser(){
    if(StringUtils.isNotEmpty(this.url)){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(this.url);
      if(m.find() && m.groupCount() > 1){
        return m.group(1);
      }
    }
    return null;
  }

  @Transient
  public String getKerberosRealm(){
    if(StringUtils.isNotEmpty(this.url)){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(this.url);
      if(m.find() && m.groupCount() > 1){
        return m.group(2);
      }
    }
    return null;
  }

  @Transient
  public String getKerberosPrincipal(){
    if(StringUtils.isNotEmpty(this.url)){
      Pattern p = Pattern.compile("principal=(.+)@(.[^;,\\n\\r\\t]+)");
      Matcher m = p.matcher(this.url);
      if(m.find() && m.groupCount() > 1){
        return m.group(1) + "@" + m.group(2);
      }
    }
    return null;
  }

  @Override
  public String getTableNameColumn() {
    return "tab_name";
  }

  public boolean isSupportSecondaryConnection() {
    if(StringUtils.isNotEmpty(this.getSecondaryUsername()) && StringUtils.isNotEmpty(this.getSecondaryPassword())) {
      return true;
    } else {
      return false;
    }
  }

  public boolean isSupportSaveAsHive() {
    if(isSupportSecondaryConnection() &&
        StringUtils.isNotEmpty(this.getHdfsConfigurationPath()) && StringUtils.isNotEmpty(this.getPersonalDatabasePrefix())) {
      return true;
    } else {
      return false;
    }
  }
}
