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

import java.sql.Connection;
import java.sql.Driver;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 * The interface Jdbc connector.
 */
public interface JdbcConnector {

  /**
   * Gets driver.
   *
   * @param connectionUrl   the connection url
   * @param driverClassName the driver class name
   * @return the driver
   * @throws SQLException the sql exception
   */
  Driver getDriver(String connectionUrl, String driverClassName) throws SQLException;

  /**
   * Gets connection.
   *
   * @param connection      the connection
   * @param jdbcDialect     the jdbc dialect
   * @param database        the database
   * @param includeDatabase the include database
   * @return the connection
   */
  Connection getConnection(JdbcConnectInformation connection, JdbcDialect jdbcDialect, String database, boolean includeDatabase);

  /**
   * Gets connection.
   *
   * @param connection      the connection
   * @param jdbcDialect     the jdbc dialect
   * @param database        the database
   * @param includeDatabase the include database
   * @param username        the username
   * @param password        the password
   * @return the connection
   */
  Connection getConnection(JdbcConnectInformation connection, JdbcDialect jdbcDialect, String database, boolean includeDatabase, String username, String password);

  /**
   * Gets connection.
   *
   * @param connectionUrl   the connection url
   * @param properties      the properties
   * @param driverClassName the driver class name
   * @return the connection
   * @throws SQLException the sql exception
   */
  Connection getConnection(String connectionUrl, Properties properties, String driverClassName) throws SQLException;

  /**
   * Close connection.
   *
   * @param connection the connection
   * @param stmt       the stmt
   * @param rs         the rs
   */
  void closeConnection(Connection connection, Statement stmt, ResultSet rs);
}
