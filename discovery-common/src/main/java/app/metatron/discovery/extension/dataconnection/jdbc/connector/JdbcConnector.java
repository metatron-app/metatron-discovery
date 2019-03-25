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

public interface JdbcConnector {

  Driver getDriver(String connectionUrl, String driverClassName) throws SQLException;

  Connection getConnection(JdbcConnectInformation connection, JdbcDialect jdbcDialect, String database, boolean includeDatabase);
  Connection getConnection(JdbcConnectInformation connection, JdbcDialect jdbcDialect, String database, boolean includeDatabase, String username, String password);
  Connection getConnection(String connectionUrl, Properties properties, String driverClassName) throws SQLException;

  void closeConnection(Connection connection, Statement stmt, ResultSet rs);
}
