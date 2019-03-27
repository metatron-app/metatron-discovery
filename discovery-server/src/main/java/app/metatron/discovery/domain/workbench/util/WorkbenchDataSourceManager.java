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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.HashMap;
import java.util.Map;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;
import app.metatron.discovery.util.AuthUtils;

/**
 * The type Work bench data source utils.
 */
@Component
public class WorkbenchDataSourceManager {

  private static final Logger LOGGER = LoggerFactory.getLogger(WorkbenchDataSourceManager.class);

  private Map<String, WorkbenchDataSource> pooledDataSourceList = new HashMap<>();

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  CachedUserService cachedUserService;

  public WorkbenchDataSource findDataSourceInfo(String webSocketId){
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
  public void destroyDataSource(String webSocketId) throws JdbcDataConnectionException {
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
   * @param dataConnection    the connection
   * @param webSocketId   the web socket id
   * @return the single connection data source info
   * @throws JdbcDataConnectionException the jdbc data connection exception
   */
  private WorkbenchDataSource createDataSourceInfo(DataConnection dataConnection,
                                                  String webSocketId,
                                                  String username,
                                                  String password) throws JdbcDataConnectionException{
    JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(dataConnection);
    JdbcConnector jdbcConnector = DataConnectionHelper.lookupJdbcConnector(dataConnection, jdbcDialect);

    WorkbenchDataSource dataSourceInfo = new WorkbenchDataSource(dataConnection.getId(), webSocketId, dataConnection, jdbcConnector);
    dataSourceInfo.setUsername(username);
    dataSourceInfo.setPassword(password);

    pooledDataSourceList.put(webSocketId, dataSourceInfo);
    return dataSourceInfo;
  }

  public WorkbenchDataSource createDataSourceInfo(DataConnection connection,
                                                  String webSocketId) throws JdbcDataConnectionException{
    return createDataSourceInfo(connection, webSocketId, connection.getUsername(), connection.getPassword());
  }

  public Map<String, WorkbenchDataSource> getCurrentConnections(){
    return pooledDataSourceList;
  }

  public WorkbenchDataSource getWorkbenchDataSource(String dataConnectionId, String webSocketId, String username, String password) {
    WorkbenchDataSource dataSource = this.findDataSourceInfo(webSocketId);
    if(dataSource == null){
      DataConnection dataConnection = dataConnectionRepository.findOne(dataConnectionId);
      if(dataConnection == null){
        throw new ResourceNotFoundException("DataConnection(" + dataConnectionId + ")");
      }

      dataSource = this.getWorkbenchDataSource(dataConnection, webSocketId, username, password);
    }
    return dataSource;
  }

  public WorkbenchDataSource getWorkbenchDataSource(DataConnection jdbcDataConnection, String webSocketId, String username, String password){
    WorkbenchDataSource dataSource = this.findDataSourceInfo(webSocketId);
    if(dataSource == null){
      String connectionUsername;
      String connectionPassword;

      DataConnection.AuthenticationType authenticationType = jdbcDataConnection.getAuthenticationType();
      if(authenticationType == null){
        authenticationType = DataConnection.AuthenticationType.MANUAL;
      }

      switch (authenticationType){
        case USERINFO:
          connectionUsername = AuthUtils.getAuthUserName();
          User user = cachedUserService.findUser(connectionUsername);
          if(user == null){
            throw new ResourceNotFoundException("User(" + connectionUsername + ")");
          }
          connectionPassword = cachedUserService.findUser(connectionUsername).getPassword();
          break;
        case MANUAL:
          connectionUsername = jdbcDataConnection.getUsername();
          connectionPassword = jdbcDataConnection.getPassword();
          break;
        default:
          if(StringUtils.isEmpty(username)){
            throw new BadRequestException("Empty username");
          }
          if(StringUtils.isEmpty(password)){
            throw new BadRequestException("Empty password");
          }
          connectionUsername = username;
          connectionPassword = password;
          break;
      }

      dataSource = this.createDataSourceInfo(jdbcDataConnection, webSocketId, connectionUsername, connectionPassword);
    }
    return dataSource;
  }
}
