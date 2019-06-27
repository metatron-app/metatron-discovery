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

import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
@Order(3)
@Component
public class HiveDialect implements JdbcDialect {

  private static final String HIVE_URL_PREFIX = "jdbc:hive2:/";
  private static final String[] EXCLUDE_SCHEMAS = null;
  private static final String[] EXCLUDE_TABLES = null;

  private static final String KERBEROS_PRINCIPAL_PATTERN = "principal=(.+)@(.[^;,\\n\\r\\t]+)";

  public static final String PROPERTY_KEY_ADMIN_NAME = METATRON_PROPERTY_PREFIX + "hive.admin.name";
  public static final String PROPERTY_KEY_ADMIN_PASSWORD = METATRON_PROPERTY_PREFIX + "hive.admin.password";
  public static final String PROPERTY_KEY_PERSONAL_DATABASE_PREFIX = METATRON_PROPERTY_PREFIX + "personal.database.prefix";
  public static final String PROPERTY_KEY_HDFS_CONF_PATH = METATRON_PROPERTY_PREFIX + "hdfs.conf.path";

  public static final String PROPERTY_KEY_METASTORE_HOST = METATRON_PROPERTY_PREFIX + "metastore.host";
  public static final String PROPERTY_KEY_METASTORE_PORT = METATRON_PROPERTY_PREFIX + "metastore.port";
  public static final String PROPERTY_KEY_METASTORE_SCHEMA = METATRON_PROPERTY_PREFIX + "metastore.schema";
  public static final String PROPERTY_KEY_METASTORE_USERNAME = METATRON_PROPERTY_PREFIX + "metastore.username";
  public static final String PROPERTY_KEY_METASTORE_PASSWORD = METATRON_PROPERTY_PREFIX + "metastore.password";

  @Value("${polaris.engine.ingestion.hive.keytab:}")
  String keyTabPath;

  public String getKeyTabPath() {
    return keyTabPath;
  }

  public void setKeyTabPath(String keyTabPath) {
    this.keyTabPath = keyTabPath;
  }

  @Override
  public String getName() {
    return "Hive";
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
    return "HIVE";
  }

  @Override
  public InputSpec getInputSpec() {
    return (new InputSpec())
        .setAuthenticationType(InputMandatory.MANDATORY)
        .setUsername(InputMandatory.MANDATORY)
        .setPassword(InputMandatory.MANDATORY)
        .setCatalog(InputMandatory.NONE)
        .setSid(InputMandatory.NONE)
        .setDatabase(InputMandatory.NONE);
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
    return "org.apache.hive.jdbc.HiveDriver";
  }

  public String getMetastoreDriverClass(JdbcConnectInformation connectInfo) {
    return "com.mysql.jdbc.Driver";
  }

  @Override
  public String getConnectorClass(JdbcConnectInformation connectInfo) {
    return "app.metatron.discovery.domain.dataconnection.connector.KerberosJdbcConnector";
  }

  @Override
  public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
    if(HiveDialect.includeMetastoreInfo(connectInfo)){
      return "app.metatron.discovery.domain.dataconnection.accessor.HiveDataAccessorUsingMetastore";
    }
    return "app.metatron.discovery.domain.dataconnection.accessor.HiveDataAccessor";
  }

  @Override
  public String getTestQuery(JdbcConnectInformation connectInfo) {
    return "SELECT 1";
  }

  @Override
  public String getConnectUrl(JdbcConnectInformation connectInfo) {
    return makeConnectUrl(connectInfo, connectInfo.getDatabase(), true);
  }

  @Override
  public String makeConnectUrl(JdbcConnectInformation connectionInfo, String database, boolean includeDatabase) {
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())) {
      return connectionInfo.getUrl();
    }

    StringBuilder builder = new StringBuilder();
    builder.append(HIVE_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(connectionInfo.getHostname());

    // Set Port
    if(connectionInfo.getPort() != null) {
      builder.append(":").append(connectionInfo.getPort());
    }

    builder.append(URL_SEP);

    // Set DataBase
    if(StringUtils.isNotEmpty(database) && includeDatabase) {
      builder.append(database);
    } else {
      builder.append("default");
    }

    return builder.toString();
  }

  public String makeMetastoreConnectUrl(JdbcConnectInformation connectionInfo){
    StringBuilder builder = new StringBuilder();
    builder.append(MySQLDialect.MYSQL_URL_PREFIX);
    builder.append(URL_SEP);

    Map<String, String> propMap = connectionInfo.getPropertiesMap();
    String metastoreHost = propMap.get(PROPERTY_KEY_METASTORE_HOST);
    String metastorePort = propMap.get(PROPERTY_KEY_METASTORE_PORT);
    String metastoreSchema = propMap.get(PROPERTY_KEY_METASTORE_SCHEMA);
    String metastoreUsername = propMap.get(PROPERTY_KEY_METASTORE_USERNAME);
    String metastorePassword = propMap.get(PROPERTY_KEY_METASTORE_PASSWORD);

    if(StringUtils.isNotEmpty(metastoreHost)){
      builder.append(metastoreHost);
    }
    if(StringUtils.isNotEmpty(metastorePort)){
      builder.append(":").append(metastorePort);
    }
    if(StringUtils.isNotEmpty(metastoreSchema)){
      builder.append(URL_SEP).append(metastoreSchema);
    }
    return builder.toString();
  }

  /**
   * DataBase, Schema query
   */
  @Override
  public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
    return "USE " + database;
  }

  @Override
  public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
    if(StringUtils.isEmpty(databaseNamePattern)){
      return "SHOW DATABASES";
    } else {
      return "SHOW DATABASES LIKE '*" + databaseNamePattern + "*'";
    }
  }

  @Override
  public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseName, List<String> excludeSchemas) {
    return null;
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
    builder.append("SHOW TABLES");
    if(StringUtils.isNotEmpty(schema)){
      builder.append(" IN " + schema);
    }
    if(StringUtils.isNotEmpty(tableNamePattern)) {
      builder.append(" LIKE '*" + tableNamePattern + "*'");
    }
    return builder.toString();
  }

  @Override
  public String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema) {
    if(StringUtils.isEmpty(schema)){
      return "SHOW TABLES";
    } else {
      return "SHOW TABLES IN " + schema;
    }
  }

  @Override
  public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableName, List<String> excludeTables) { return null; }

  @Override
  public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    return "DESCRIBE FORMATTED " + getTableName(connectInfo, catalog, schema, table);
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
    return "DESC " + getTableName(connectInfo, catalog, schema, table);
  }

  @Override
  public String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern) {
    return null;
  }

  /**
   * Format
   */
  @Override
  public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
    if(StringUtils.isEmpty(schema) || schema.equals(connectInfo.getDatabase())) {
      return table;
    }
    return schema + "." + table;
  }

  @Override
  public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
    return Arrays.stream(fieldName.split("\\."))
          .map(spliced -> "`" + spliced + "`")
          .collect(Collectors.joining("."));
  }

  @Override
  public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("from_unixtime(unix_timestamp(" + timeStr + ", ");
    builder.append("'");
    if(DEFAULT_FORMAT.equals(timeFormat)) {
      builder.append(getDefaultTimeFormat(connectInfo));
    } else {
      builder.append(timeFormat);
    }
    builder.append("'");
    builder.append(")) ");

    return builder.toString();
  }

  @Override
  public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
    return "unix_timestamp(" + timeStr +", '" + getDefaultTimeFormat(connectInfo) + "')";
  }

  /**
   * ETC
   */
  public String getKerberosPrincipal(String url) {
    if(StringUtils.isNotEmpty(url)){
      Pattern p = Pattern.compile("principal=(.+)@(.[^;,\\n\\r\\t]+)");
      Matcher m = p.matcher(url);
      if(m.find() && m.groupCount() > 1){
        return m.group(1) + "@" + m.group(2);
      }
    }
    return null;
  }

  public boolean acceptKerberosAuth(String url){
    if(StringUtils.isNotEmpty(url)){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(url);
      if(m.find() && m.groupCount() > 1){
        return true;
      }
    }
    return false;
  }

  public String getKerberosUser(JdbcConnectInformation connectionInfo){
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(connectionInfo.getUrl());
      if(m.find() && m.groupCount() > 1){
        return m.group(1);
      }
    }
    return null;
  }

  public String getKerberosRealm(JdbcConnectInformation connectionInfo){
    if(StringUtils.isNotEmpty(connectionInfo.getUrl())){
      Pattern p = Pattern.compile(KERBEROS_PRINCIPAL_PATTERN);
      Matcher m = p.matcher(connectionInfo.getUrl());
      if(m.find() && m.groupCount() > 1){
        return m.group(2);
      }
    }
    return null;
  }

  public static boolean isSupportSaveAsHiveTable(JdbcConnectInformation connectionInfo) {
    Map<String, String> connectionProperties = connectionInfo.getPropertiesMap();

    if(MapUtils.isEmpty(connectionProperties)) {
      return false;
    } else {
      if(StringUtils.isNotEmpty(connectionProperties.get(PROPERTY_KEY_ADMIN_NAME)) &&
          StringUtils.isNotEmpty(connectionProperties.get(PROPERTY_KEY_ADMIN_PASSWORD)) &&
          StringUtils.isNotEmpty(connectionProperties.get(PROPERTY_KEY_PERSONAL_DATABASE_PREFIX)) &&
          StringUtils.isNotEmpty(connectionProperties.get(PROPERTY_KEY_HDFS_CONF_PATH))) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Query
   */
  @Override
  public FunctionWithException<Object, Object, SQLException> resultObjectConverter() {
    return originalObj -> {
      if(originalObj instanceof Timestamp){
        return originalObj.toString();
      } else {
        return originalObj;
      }
    };
  }

  public static boolean includeMetastoreInfo(JdbcConnectInformation connectionInfo){
    Map<String, String> propMap = connectionInfo.getPropertiesMap();
    if(propMap == null){
      return false;
    }

    String metastoreHost = propMap.get(PROPERTY_KEY_METASTORE_HOST);
    String metastorePort = propMap.get(PROPERTY_KEY_METASTORE_PORT);
    String metastoreSchema = propMap.get(PROPERTY_KEY_METASTORE_SCHEMA);
    String metastoreUsername = propMap.get(PROPERTY_KEY_METASTORE_USERNAME);
    String metastorePassword = propMap.get(PROPERTY_KEY_METASTORE_PASSWORD);

    if(StringUtils.isEmpty(metastoreHost)) return false;
    if(StringUtils.isEmpty(metastorePort)) return false;
    if(StringUtils.isEmpty(metastoreSchema)) return false;
    if(StringUtils.isEmpty(metastoreUsername)) return false;
    if(StringUtils.isEmpty(metastorePassword)) return false;
    return true;
  }
}
