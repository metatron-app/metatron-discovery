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

package app.metatron.discovery.extension.dataconnection.jdbc.dialect;


import org.pf4j.ExtensionPoint;

import java.sql.SQLException;
import java.util.List;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;

public interface JdbcDialect extends ExtensionPoint {

  String URL_SEP = "/";
  String CURRENT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
  String DEFAULT_FORMAT = "DEFAULT_FORMAT";
  String JDBC_PROPERTY_PREFIX = "native.";
  String METATRON_PROPERTY_PREFIX = "metatron.";
  String METATRON_EXCLUDE_DATABASES_PROPERTY = "metatron.exclude.databases";
  String METATRON_EXCLUDE_TABLES_PROPERTY = "metatron.exclude.tables";
  String[] RESULTSET_TABLE_TYPES = new String[]{"TABLE", "VIEW"};

  enum Scope {
    EMBEDDED, EXTENSION
  }

  enum InputMandatory {
    NONE, OPTIONAL, MANDATORY
  }

  class InputSpec {
    public InputSpec(){

    }

    final InputMandatory implementor = InputMandatory.MANDATORY;
    InputMandatory authenticationType;
    InputMandatory url;
    InputMandatory options;
    InputMandatory hostname;
    InputMandatory port;
    InputMandatory database;
    InputMandatory sid;
    InputMandatory catalog;
    InputMandatory properties;
    InputMandatory username;
    InputMandatory password;

    public InputMandatory getAuthenticationType() {
      return authenticationType;
    }

    public InputMandatory getImplementor() {
      return implementor;
    }

    public InputMandatory getUrl() {
      return url;
    }

    public InputMandatory getOptions() {
      return options;
    }

    public InputMandatory getHostname() {
      return hostname;
    }

    public InputMandatory getPort() {
      return port;
    }

    public InputMandatory getDatabase() {
      return database;
    }

    public InputMandatory getSid() {
      return sid;
    }

    public InputMandatory getCatalog() {
      return catalog;
    }

    public InputMandatory getProperties() {
      return properties;
    }

    public InputMandatory getUsername() {
      return username;
    }

    public InputMandatory getPassword() {
      return password;
    }

    public InputSpec setAuthenticationType(InputMandatory authenticationType){
      this.authenticationType = authenticationType;
      return this;
    }

    public InputSpec setUrl(InputMandatory url) {
      this.url = url;
      return this;
    }

    public InputSpec setOptions(InputMandatory options) {
      this.options = options;
      return this;
    }

    public InputSpec setHostname(InputMandatory hostname) {
      this.hostname = hostname;
      return this;
    }

    public InputSpec setPort(InputMandatory port) {
      this.port = port;
      return this;
    }

    public InputSpec setDatabase(InputMandatory database) {
      this.database = database;
      return this;
    }

    public InputSpec setSid(InputMandatory sid) {
      this.sid = sid;
      return this;
    }

    public InputSpec setCatalog(InputMandatory catalog) {
      this.catalog = catalog;
      return this;
    }

    public InputSpec setProperties(InputMandatory properties) {
      this.properties = properties;
      return this;
    }

    public InputSpec setUsername(InputMandatory username) {
      this.username = username;
      return this;
    }

    public InputSpec setPassword(InputMandatory password) {
      this.password = password;
      return this;
    }

    @Override
    public String toString() {
      return "InputMandatorySpec{" +
          "implementor=" + implementor +
          ", authenticationType=" + authenticationType +
          ", url=" + url +
          ", options=" + options +
          ", hostname=" + hostname +
          ", port=" + port +
          ", database=" + database +
          ", sid=" + sid +
          ", catalog=" + catalog +
          ", properties=" + properties +
          ", username=" + username +
          ", password=" + password +
          '}';
    }
  }

  /**
   * extension info
   */
//  ConnectionExtensionInformation getExtensionInfo();
  String getName();
  Scope getScope();
  String getIconResource1();
  String getIconResource2();
  String getIconResource3();
  String getIconResource4();
  String getImplementor();
  InputSpec getInputSpec();

  /**
   * Connection
   */
  boolean isSupportImplementor(String implementor);
  String getDriverClass(JdbcConnectInformation connectInfo);
  String getConnectorClass(JdbcConnectInformation connectInfo);
  String getDataAccessorClass(JdbcConnectInformation connectInfo);
  String getConnectUrl(JdbcConnectInformation connectInfo);
  String makeConnectUrl(JdbcConnectInformation connectInfo, String database, boolean includeDatabase);
  /**
   * [참고] DB 별 TEST Query : http://stackoverflow.com/a/3670000
   * @return
   */
  String getTestQuery(JdbcConnectInformation connectInfo);


  /**
   * DataBase, Schema query
   */
  String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber);
  String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas);
  String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database);
  String[] getDefaultExcludeSchemas(JdbcConnectInformation connectInfo);


  /**
   * Table Query
   */
  String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema);
  String getTableQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables, Integer pageSize, Integer pageNumber);
  String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables);
  String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table);
  String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo);
  String[] getResultSetTableType(JdbcConnectInformation connectInfo);

  /**
   * Column Query
   */
  String getColumnQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern, Integer pageSize, Integer pageNumber);
  String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern);
  FunctionWithException<Object, Object, SQLException> resultObjectConverter() throws SQLException;

  /**
   * Format
   */
  String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table);
  String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName);
  String getDefaultTimeFormat(JdbcConnectInformation connectInfo);
  String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat);
  String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr);
}
