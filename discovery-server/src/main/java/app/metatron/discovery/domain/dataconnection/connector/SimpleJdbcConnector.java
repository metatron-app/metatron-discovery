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

import org.pf4j.PluginManager;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import app.metatron.discovery.extension.dataconnection.jdbc.connector.AbstractJdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 *
 */
@Component
public class SimpleJdbcConnector extends AbstractJdbcConnector {

  private static final Logger LOGGER = LoggerFactory.getLogger(SimpleJdbcConnector.class);

  @Autowired
  PluginManager pluginManager;

  @Override
  public Driver getDriver(String connectionUrl, String driverClassName) throws SQLException {
    LOGGER.debug("get suitable driver for {}", connectionUrl);
    Driver driver = null;
    try{
      driver = super.getDriver(connectionUrl, driverClassName);
    } catch (SQLException e){
      LOGGER.debug("no suitable driver in caller's class loader.");
    }

    if(driver == null){
      LOGGER.debug("check suitable driver in plugin class loader.");
      //check plugin driver
      for(PluginWrapper pluginWrapper : pluginManager.getPlugins()){
        try{
          LOGGER.debug("check suitable driver for '{}' in plugin '{}'", driverClassName, pluginWrapper.getPluginId());
          ClassLoader pluginClsLoader = pluginManager.getPluginClassLoader(pluginWrapper.getPluginId());
          Class driverCls = pluginClsLoader.loadClass(driverClassName);
          driver = (Driver) driverCls.newInstance();
          break;
        } catch (Exception e){
          //find next plugin
        }
      }
    }

    if(driver == null){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.NO_SUITABLE_DRIVER,
                                            "no suitable driver for " + connectionUrl);
    }

    return driver;
  }

  @Override
  public void closeConnection(Connection connection, Statement stmt, ResultSet rs) {
    JdbcUtils.closeResultSet(rs);
    JdbcUtils.closeStatement(stmt);
    JdbcUtils.closeConnection(connection);
  }
}
