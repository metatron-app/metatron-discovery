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

/**
 * The interface Jdbc dialect.
 */
public interface JdbcDialect extends ExtensionPoint {

  /**
   * The constant URL_SEP.
   */
  String URL_SEP = "/";
  /**
   * The constant CURRENT_DATE_FORMAT.
   */
  String CURRENT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
  /**
   * The constant DEFAULT_FORMAT.
   */
  String DEFAULT_FORMAT = "DEFAULT_FORMAT";
  /**
   * The constant JDBC_PROPERTY_PREFIX.
   */
  String JDBC_PROPERTY_PREFIX = "native.";
  /**
   * The constant METATRON_PROPERTY_PREFIX.
   */
  String METATRON_PROPERTY_PREFIX = "metatron.";
  /**
   * The constant METATRON_EXCLUDE_DATABASES_PROPERTY.
   */
  String METATRON_EXCLUDE_DATABASES_PROPERTY = "metatron.exclude.databases";
  /**
   * The constant METATRON_EXCLUDE_TABLES_PROPERTY.
   */
  String METATRON_EXCLUDE_TABLES_PROPERTY = "metatron.exclude.tables";
  /**
   * The constant RESULTSET_TABLE_TYPES.
   */
  String[] RESULTSET_TABLE_TYPES = new String[]{"TABLE", "VIEW"};

  /**
   * The enum Scope.
   */
  enum Scope {
    /**
     * Embedded scope.
     */
    EMBEDDED,
    /**
     * Extension scope.
     */
    EXTENSION
  }

  /**
   * The enum Input mandatory.
   */
  enum InputMandatory {
    /**
     * None input mandatory.
     */
    NONE,
    /**
     * Optional input mandatory.
     */
    OPTIONAL,
    /**
     * Mandatory input mandatory.
     */
    MANDATORY
  }

  /**
   * The type Input spec.
   */
  class InputSpec {
    /**
     * Instantiates a new Input spec.
     */
    public InputSpec(){

    }

    /**
     * The Implementor.
     */
    final InputMandatory implementor = InputMandatory.MANDATORY;
    /**
     * The Authentication type.
     */
    InputMandatory authenticationType;
    /**
     * The Url.
     */
    InputMandatory url;
    /**
     * The Options.
     */
    InputMandatory options;
    /**
     * The Hostname.
     */
    InputMandatory hostname;
    /**
     * The Port.
     */
    InputMandatory port;
    /**
     * The Database.
     */
    InputMandatory database;
    /**
     * The Sid.
     */
    InputMandatory sid;
    /**
     * The Catalog.
     */
    InputMandatory catalog;
    /**
     * The Properties.
     */
    InputMandatory properties;
    /**
     * The Username.
     */
    InputMandatory username;
    /**
     * The Password.
     */
    InputMandatory password;

    /**
     * Gets authentication type.
     *
     * @return the authentication type
     */
    public InputMandatory getAuthenticationType() {
      return authenticationType;
    }

    /**
     * Gets implementor.
     *
     * @return the implementor
     */
    public InputMandatory getImplementor() {
      return implementor;
    }

    /**
     * Gets url.
     *
     * @return the url
     */
    public InputMandatory getUrl() {
      return url;
    }

    /**
     * Gets options.
     *
     * @return the options
     */
    public InputMandatory getOptions() {
      return options;
    }

    /**
     * Gets hostname.
     *
     * @return the hostname
     */
    public InputMandatory getHostname() {
      return hostname;
    }

    /**
     * Gets port.
     *
     * @return the port
     */
    public InputMandatory getPort() {
      return port;
    }

    /**
     * Gets database.
     *
     * @return the database
     */
    public InputMandatory getDatabase() {
      return database;
    }

    /**
     * Gets sid.
     *
     * @return the sid
     */
    public InputMandatory getSid() {
      return sid;
    }

    /**
     * Gets catalog.
     *
     * @return the catalog
     */
    public InputMandatory getCatalog() {
      return catalog;
    }

    /**
     * Gets properties.
     *
     * @return the properties
     */
    public InputMandatory getProperties() {
      return properties;
    }

    /**
     * Gets username.
     *
     * @return the username
     */
    public InputMandatory getUsername() {
      return username;
    }

    /**
     * Gets password.
     *
     * @return the password
     */
    public InputMandatory getPassword() {
      return password;
    }

    /**
     * Set authentication type input spec.
     *
     * @param authenticationType the authentication type
     * @return the input spec
     */
    public InputSpec setAuthenticationType(InputMandatory authenticationType){
      this.authenticationType = authenticationType;
      return this;
    }

    /**
     * Sets url.
     *
     * @param url the url
     * @return the url
     */
    public InputSpec setUrl(InputMandatory url) {
      this.url = url;
      return this;
    }

    /**
     * Sets options.
     *
     * @param options the options
     * @return the options
     */
    public InputSpec setOptions(InputMandatory options) {
      this.options = options;
      return this;
    }

    /**
     * Sets hostname.
     *
     * @param hostname the hostname
     * @return the hostname
     */
    public InputSpec setHostname(InputMandatory hostname) {
      this.hostname = hostname;
      return this;
    }

    /**
     * Sets port.
     *
     * @param port the port
     * @return the port
     */
    public InputSpec setPort(InputMandatory port) {
      this.port = port;
      return this;
    }

    /**
     * Sets database.
     *
     * @param database the database
     * @return the database
     */
    public InputSpec setDatabase(InputMandatory database) {
      this.database = database;
      return this;
    }

    /**
     * Sets sid.
     *
     * @param sid the sid
     * @return the sid
     */
    public InputSpec setSid(InputMandatory sid) {
      this.sid = sid;
      return this;
    }

    /**
     * Sets catalog.
     *
     * @param catalog the catalog
     * @return the catalog
     */
    public InputSpec setCatalog(InputMandatory catalog) {
      this.catalog = catalog;
      return this;
    }

    /**
     * Sets properties.
     *
     * @param properties the properties
     * @return the properties
     */
    public InputSpec setProperties(InputMandatory properties) {
      this.properties = properties;
      return this;
    }

    /**
     * Sets username.
     *
     * @param username the username
     * @return the username
     */
    public InputSpec setUsername(InputMandatory username) {
      this.username = username;
      return this;
    }

    /**
     * Sets password.
     *
     * @param password the password
     * @return the password
     */
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
   * connection's display name
   *
   * @return the name
   */
  String getName();

  /**
   * connection's scope.
   * EMBED : Built-in connection
   * EXTENSION : Extended Connection
   *
   * @return the scope
   */
  Scope getScope();

  /**
   * Connection's icon
   * default icon (gray scale)
   *
   * @return the icon resource 1
   */
  String getIconResource1();

  /**
   * Connection's icon
   * using in workbench's schema browser (color)
   * @return the icon resource 2
   */
  String getIconResource2();

  /**
   * Connection's icon
   * using in workspace's workbench icon
   * @return the icon resource 3
   */
  String getIconResource3();

  /**
   * Connection's icon
   * not yet using
   * @return the icon resource 4
   */
  String getIconResource4();

  /**
   * Connection implementor.
   *
   * @return the implementor
   */
  String getImplementor();

  /**
   * Spec for Connection Mandatory Information
   *
   * @return the input spec
   */
  InputSpec getInputSpec();

  /**
   * Retrieves whether the dialect thinks that it can be used for to the given implementor
   *
   * @param implementor the implementor
   * @return the boolean
   */
  boolean isSupportImplementor(String implementor);

  /**
   * Gets driver class.
   *
   * @param connectInfo the connect info
   * @return the driver class
   */
  String getDriverClass(JdbcConnectInformation connectInfo);

  /**
   * Gets connector class.
   *
   * @param connectInfo the connect info
   * @return the connector class
   */
  String getConnectorClass(JdbcConnectInformation connectInfo);

  /**
   * Gets data accessor class.
   *
   * @param connectInfo the connect info
   * @return the data accessor class
   */
  String getDataAccessorClass(JdbcConnectInformation connectInfo);

  /**
   * Gets connect url.
   *
   * @param connectInfo the connect info
   * @return the connect url
   */
  String getConnectUrl(JdbcConnectInformation connectInfo);

  /**
   * Make connect url string.
   *
   * @param connectInfo     the connect info
   * @param database        the database
   * @param includeDatabase the include database
   * @return the string
   */
  String makeConnectUrl(JdbcConnectInformation connectInfo, String database, boolean includeDatabase);

  /**
   * test Query for check connection
   *
   * @param connectInfo the connect info
   * @return test query
   */
  String getTestQuery(JdbcConnectInformation connectInfo);


  /**
   * get DataBase List query
   *
   * @param connectInfo         the connect info
   * @param catalog             the catalog
   * @param databaseNamePattern the database name pattern
   * @param excludeSchemas      the exclude schemas
   * @param pageSize            the page size
   * @param pageNumber          the page number
   * @return the data base query
   */
  String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber);

  /**
   * Gets data base count query.
   *
   * @param connectInfo         the connect info
   * @param catalog             the catalog
   * @param databaseNamePattern the database name pattern
   * @param excludeSchemas      the exclude schemas
   * @return the data base count query
   */
  String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas);

  /**
   * Gets use database query.
   *
   * @param connectInfo the connect info
   * @param database    the database
   * @return the use database query
   */
  String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database);

  /**
   * Get default exclude schemas string [ ].
   *
   * @param connectInfo the connect info
   * @return the string [ ]
   */
  String[] getDefaultExcludeSchemas(JdbcConnectInformation connectInfo);


  /**
   * Gets Table name list Query
   *
   * @param connectInfo the connect info
   * @param catalog     the catalog
   * @param schema      the schema
   * @return the table name query
   */
  String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema);

  /**
   * Gets table list query.
   *
   * @param connectInfo      the connect info
   * @param catalog          the catalog
   * @param schema           the schema
   * @param tableNamePattern the table name pattern
   * @param excludeTables    the exclude tables
   * @param pageSize         the page size
   * @param pageNumber       the page number
   * @return the table query
   */
  String getTableQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables, Integer pageSize, Integer pageNumber);

  /**
   * Gets table count query.
   *
   * @param connectInfo      the connect info
   * @param catalog          the catalog
   * @param schema           the schema
   * @param tableNamePattern the table name pattern
   * @param excludeTables    the exclude tables
   * @return the table count query
   */
  String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables);

  /**
   * Gets table desc query.
   *
   * @param connectInfo the connect info
   * @param catalog     the catalog
   * @param schema      the schema
   * @param table       the table
   * @return the table desc query
   */
  String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table);

  /**
   * Get default exclude tables string [ ].
   *
   * @param connectInfo the connect info
   * @return the string [ ]
   */
  String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo);

  /**
   * Get result set table type string [ ].
   *
   * @param connectInfo the connect info
   * @return the string [ ]
   */
  String[] getResultSetTableType(JdbcConnectInformation connectInfo);

  /**
   * Gets column list Query
   *
   * @param connectInfo       the connect info
   * @param catalog           the catalog
   * @param schema            the schema
   * @param table             the table
   * @param columnNamePattern the column name pattern
   * @param pageSize          the page size
   * @param pageNumber        the page number
   * @return the column query
   */
  String getColumnQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern, Integer pageSize, Integer pageNumber);

  /**
   * Gets column count query.
   *
   * @param connectInfo       the connect info
   * @param catalog           the catalog
   * @param schema            the schema
   * @param table             the table
   * @param columnNamePattern the column name pattern
   * @return the column count query
   */
  String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern);

  /**
   * Result object converter function with exception.
   *
   * @return the function with exception
   * @throws SQLException the sql exception
   */
  FunctionWithException<Object, Object, SQLException> resultObjectConverter() throws SQLException;

  /**
   * Returns a table name containing schema and catalog
   *
   * @param connectInfo the connect info
   * @param catalog     the catalog
   * @param schema      the schema
   * @param table       the table
   * @return the table name
   */
  String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table);

  /**
   * Gets quoted field name.
   *
   * @param connectInfo the connect info
   * @param fieldName   the field name
   * @return the quoted field name
   */
  String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName);

  /**
   * Gets default time format.
   *
   * @param connectInfo the connect info
   * @return the default time format
   */
  String getDefaultTimeFormat(JdbcConnectInformation connectInfo);

  /**
   * Gets char to date stmt.
   *
   * @param connectInfo the connect info
   * @param timeStr     the time str
   * @param timeFormat  the time format
   * @return the char to date stmt
   */
  String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat);

  /**
   * Gets char to unix time stmt.
   *
   * @param connectInfo the connect info
   * @param timeStr     the time str
   * @return the char to unix time stmt
   */
  String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr);
}
