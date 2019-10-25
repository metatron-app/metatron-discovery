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

package app.metatron.discovery.domain.dataconnection.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Postgresql Jdbc Connector.
 * setFetchSize() is not working in autoCommit mode with PostgresSQL JDBC driver.
 * so set default value of autoCommit mode to false.
 * https://jdbc.postgresql.org/documentation/83/query.html#query-with-cursor
 */
@Component
public class PostgresqlJdbcConnector extends CachedUserJdbcConnector {

  private static final Logger LOGGER = LoggerFactory.getLogger(PostgresqlJdbcConnector.class);

  @Override
  public Connection getConnection(String connectionUrl, Properties properties, String driverClassName) {
    Connection connection = super.getConnection(connectionUrl, properties, driverClassName);
    try{
      connection.setAutoCommit(false);
    } catch (SQLException e){
      LOGGER.error(e.getMessage(), e);
    }
    return connection;
  }
}
