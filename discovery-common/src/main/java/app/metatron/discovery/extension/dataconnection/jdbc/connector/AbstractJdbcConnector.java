
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

package app.metatron.discovery.extension.dataconnection.jdbc.connector;


import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 * The type Abstract jdbc connector.
 */
public abstract class AbstractJdbcConnector implements JdbcConnector{
  private static final Logger LOGGER = LoggerFactory.getLogger(AbstractJdbcConnector.class);

  @Override
  public Driver getDriver(String connectionUrl, String driverClassName) throws SQLException {
    return DriverManager.getDriver(connectionUrl);
  }

  @Override
  public Connection getConnection(JdbcConnectInformation connectionInfo, JdbcDialect dialect, String database, boolean includeDatabase){
    return getConnection(connectionInfo, dialect, database, includeDatabase, getUsername(connectionInfo, dialect), getPassword(connectionInfo, dialect));
  }

  @Override
  public Connection getConnection(JdbcConnectInformation connectionInfo, JdbcDialect dialect, String database, boolean includeDatabase, String username, String password){
    Properties properties = getProperties(connectionInfo, dialect);
    if(properties == null){
      properties = new Properties();
    }
    if(StringUtils.isNotEmpty(username)){
      properties.setProperty("user", username);
    }
    if(StringUtils.isNotEmpty(password)){
      properties.setProperty("password", password);
    }

    String connectionUrl = getConnectionUrl(connectionInfo, dialect, database, includeDatabase);

    return getConnection(connectionUrl, properties, dialect.getDriverClass(connectionInfo));
  }

  @Override
  public Connection getConnection(String connectionUrl, Properties properties, String driverClassName) {
    try{
      Driver driver = getDriver(connectionUrl, driverClassName);
      return driver.connect(connectionUrl, properties);
    } catch (SQLException e){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.DATASOURCE_CONNECTION_ERROR,
                                            e.getMessage());
    }
  }

  /**
   * Get connection url string.
   *
   * @param connectionInfo  the connection info
   * @param dialect         the dialect
   * @param database        the database
   * @param includeDatabase the include database
   * @return the string
   */
  protected String getConnectionUrl(JdbcConnectInformation connectionInfo, JdbcDialect dialect, String database, boolean includeDatabase){
    return dialect.makeConnectUrl(connectionInfo, database, includeDatabase);
  }

  /**
   * Get username string.
   *
   * @param connectionInfo the connection info
   * @param dialect        the dialect
   * @return the string
   */
  protected String getUsername(JdbcConnectInformation connectionInfo, JdbcDialect dialect){
    return connectionInfo.getUsername();
  }

  /**
   * Get password string.
   *
   * @param connectionInfo the connection info
   * @param dialect        the dialect
   * @return the string
   */
  protected String getPassword(JdbcConnectInformation connectionInfo, JdbcDialect dialect){
    return connectionInfo.getPassword();
  }

  /**
   * Get properties properties.
   *
   * @param connectionInfo the connection info
   * @param dialect        the dialect
   * @return the properties
   */
  protected Properties getProperties(JdbcConnectInformation connectionInfo, JdbcDialect dialect){
    Properties properties = new Properties();
    String userName = getUsername(connectionInfo, dialect);
    String password = getPassword(connectionInfo, dialect);
    if(StringUtils.isNotEmpty(userName)){
      properties.setProperty("user", userName);
    }
    if(StringUtils.isNotEmpty(password)){
      properties.setProperty("password", password);
    }

    //add native properties
    if (connectionInfo.getPropertiesMap() != null) {
      for (String propertyKey : connectionInfo.getPropertiesMap().keySet()) {
        if (StringUtils.startsWith(propertyKey, JdbcDialect.JDBC_PROPERTY_PREFIX)) {
          String nativePropertyKey = StringUtils.replaceFirst(propertyKey, JdbcDialect.JDBC_PROPERTY_PREFIX, "");
          properties.setProperty(nativePropertyKey, connectionInfo.getPropertiesMap().get(propertyKey));
        }
      }
    }
    return properties;
  }

  public void closeConnection(Connection connection, Statement stmt, ResultSet rs){
    if (rs != null) {
      try {
        rs.close();
      }
      catch (SQLException ex) {
        LOGGER.trace("Could not close JDBC ResultSet", ex);
      }
      catch (Throwable ex) {
        // We don't trust the JDBC driver: It might throw RuntimeException or Error.
        LOGGER.trace("Unexpected exception on closing JDBC ResultSet", ex);
      }
    }

    if (stmt != null) {
      try {
        stmt.close();
      }
      catch (SQLException ex) {
        LOGGER.trace("Could not close JDBC Statement", ex);
      }
      catch (Throwable ex) {
        // We don't trust the JDBC driver: It might throw RuntimeException or Error.
        LOGGER.trace("Unexpected exception on closing JDBC Statement", ex);
      }
    }

    if (connection != null) {
      try {
        connection.close();
      }
      catch (SQLException ex) {
        LOGGER.debug("Could not close JDBC Connection", ex);
      }
      catch (Throwable ex) {
        // We don't trust the JDBC driver: It might throw RuntimeException or Error.
        LOGGER.debug("Unexpected exception on closing JDBC Connection", ex);
      }
    }
  }
}
