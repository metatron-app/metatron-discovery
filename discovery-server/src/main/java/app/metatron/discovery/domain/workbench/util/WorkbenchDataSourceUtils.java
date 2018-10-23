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

package app.metatron.discovery.domain.workbench.util;

import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.security.UserGroupInformation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnectionException;

/**
 * The type Work bench data source utils.
 */
@Component
public class WorkbenchDataSourceUtils {

  private static Map<String, WorkbenchDataSource> pooledDataSourceList = new HashMap<>();

  private static final Logger LOGGER = LoggerFactory.getLogger(WorkbenchDataSourceUtils.class);

  public static String keyTabPath;

  @Value("${polaris.engine.ingestion.hive.keytab:}")
  private void setKeyTabTath(String keyTabPath){
    WorkbenchDataSourceUtils.keyTabPath = keyTabPath;
  }

  public static WorkbenchDataSource findDataSourceInfo(String webSocketId){
    WorkbenchDataSource dataSourceInfo = pooledDataSourceList.get(webSocketId);
    if(dataSourceInfo != null){
      LOGGER.debug("Created datasourceInfo Existed : {} ", webSocketId);
      return dataSourceInfo;
    } else {
      LOGGER.debug("Created datasourceInfo Not Existed : {} ", webSocketId);
      return null;
    }
  }

  /**
   * Destroy data source.
   *
   * @param webSocketId the web socket id
   * @throws JdbcDataConnectionException the jdbc data connection exception
   */
  public static void destroyDataSource(String webSocketId) throws JdbcDataConnectionException{
    Assert.isTrue(!webSocketId.isEmpty(), "webSocketId Required.");

    WorkbenchDataSource dataSourceInfo = pooledDataSourceList.get(webSocketId);
    if(dataSourceInfo != null){
      pooledDataSourceList.remove(webSocketId);
      LOGGER.debug("datasource Destroy : {} - {}", dataSourceInfo.getConnectionId(), webSocketId);
      dataSourceInfo.destroy();
      dataSourceInfo = null;
    }
  }

  /**
   * Create data source info single connection data source info.
   *
   * @param connection    the connection
   * @param webSocketId   the web socket id
   * @param includeDatabase the include database
   * @return the single connection data source info
   * @throws JdbcDataConnectionException the jdbc data connection exception
   */
  public static WorkbenchDataSource createDataSourceInfo(
          JdbcDataConnection connection, String webSocketId, String username, String password, boolean includeDatabase)
          throws JdbcDataConnectionException{
    String connUrl = connection.makeConnectUrl(includeDatabase);
    SingleConnectionDataSource ds;

    if(connection instanceof HiveConnection && ((HiveConnection) connection).isKerberos()){
      try{
        Configuration conf = new Configuration();
        conf.set("hadoop.security.authentication", "Kerberos");
        UserGroupInformation.setConfiguration(conf);
        String kerberosUser = StringUtils.isNotEmpty(username)
                ? username
                : ((HiveConnection) connection).getKerberosPrincipal();
        LOGGER.debug("kerberosUser : {}", kerberosUser);
        LOGGER.debug("keyTabPath : {}", keyTabPath);

        UserGroupInformation.loginUserFromKeytab(kerberosUser, keyTabPath);
      } catch(IOException e){
        e.printStackTrace();
      }
    }

    ds = new SingleConnectionDataSource(connUrl, username, password, true);
    WorkbenchDataSource dataSourceInfo = new WorkbenchDataSource(connection.getId(), webSocketId, ds);
    if(connection instanceof HiveConnection && ((HiveConnection) connection).isSupportSecondaryConnection()) {
      HiveConnection hiveConnection = (HiveConnection)connection;
      dataSourceInfo.setSecondarySingleConnectionDataSource(
          new SingleConnectionDataSource(connUrl, hiveConnection.getSecondaryUsername(), hiveConnection.getSecondaryPassword(), true)
      );
    }

    pooledDataSourceList.put(webSocketId, dataSourceInfo);
    LOGGER.debug("Created datasource : {}", connUrl);
    return dataSourceInfo;
  }

  public static WorkbenchDataSource createDataSourceInfo(
          JdbcDataConnection connection, String webSocketId, boolean includeDatabase)
          throws JdbcDataConnectionException{
    return createDataSourceInfo(connection, webSocketId, connection.getUsername(), connection.getPassword(), includeDatabase);
  }

  public static Map<String, WorkbenchDataSource> getCurrentConnection(){
    return pooledDataSourceList;
  }
}
