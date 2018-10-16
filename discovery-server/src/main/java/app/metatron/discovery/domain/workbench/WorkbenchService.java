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

package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;
import app.metatron.discovery.util.AuthUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkbenchService {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkbenchService.class);

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  CachedUserService cachedUserService;

  public WorkbenchDataSource createSingleDataSource(String dataConnectionId, String webSocketId, String username, String password) {
    WorkbenchDataSource dataSource = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
    if(dataSource == null){
      DataConnection dataConnection;
      JdbcDataConnection jdbcDataConnection;

      dataConnection = dataConnectionRepository.findOne(dataConnectionId);
      if(dataConnection == null){
        throw new ResourceNotFoundException("DataConnection(" + dataConnectionId + ")");
      }

      if(dataConnection instanceof JdbcDataConnection){
        jdbcDataConnection = (JdbcDataConnection) dataConnection;
      } else {
        throw new ResourceNotFoundException("JdbcDataConnection");
      }

      dataSource = createSingleDataSource(jdbcDataConnection, webSocketId, username, password);
    }
    return dataSource;
  }

  public WorkbenchDataSource createSingleDataSource(JdbcDataConnection jdbcDataConnection, String webSocketId) {
    WorkbenchDataSource dataSource = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
    if(dataSource == null){
      dataSource = createSingleDataSource(jdbcDataConnection, webSocketId, jdbcDataConnection.getUsername(), jdbcDataConnection.getPassword());
    }
    return dataSource;
  }

  public WorkbenchDataSource createSingleDataSource(JdbcDataConnection jdbcDataConnection, String webSocketId, String username, String password) {
    WorkbenchDataSource dataSource = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
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

      dataSource = WorkbenchDataSourceUtils.createDataSourceInfo(jdbcDataConnection, webSocketId, connectionUsername,
              connectionPassword, true);
    }
    return dataSource;
  }
}
