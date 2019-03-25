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

import org.springframework.jdbc.datasource.ConnectionProxy;
import org.springframework.jdbc.support.JdbcUtils;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.workbench.QueryStatus;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

public class WorkbenchDataSource {

  private String connectionId;
  private JdbcConnectInformation connectionInfo;
  private String queryEditorId;
  private String webSocketId;
  private List<String> queryList;
  private QueryStatus queryStatus = QueryStatus.IDLE;
  private String applicationId;
  private Statement currentStatement;
  private Long queryHistoryId;
  private String auditId;

  private String username;
  private String password;

  // proxy connection
  private Connection primaryConnection;
  private Connection secondaryConnection;

  // original connection
  private Connection originalPrimaryConnection;
  private Connection originalSecondaryConnection;

  private JdbcConnector jdbcConnector;

  /**
   * Instantiates a new Single connection data source info.
   *
   * @param connectionId               the connection id
   * @param webSocketId                the web socket id
   */
  public WorkbenchDataSource(String connectionId, String webSocketId, JdbcConnectInformation connectionInfo, JdbcConnector jdbcConnector){
    this.connectionId = connectionId;
    this.webSocketId = webSocketId;
    this.connectionInfo = connectionInfo;
    this.jdbcConnector = jdbcConnector;
  }

  /**
   * Gets connection id.
   *
   * @return the connection id
   */
  public String getConnectionId() {
    return connectionId;
  }

  /**
   * Sets connection id.
   *
   * @param connectionId the connection id
   */
  public void setConnectionId(String connectionId) {
    this.connectionId = connectionId;
  }

  /**
   * Gets web socket id.
   *
   * @return the web socket id
   */
  public String getWebSocketId() {
    return webSocketId;
  }

  /**
   * Sets web socket id.
   *
   * @param webSocketId the web socket id
   */
  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getQueryEditorId() {
    return queryEditorId;
  }

  public void setQueryEditorId(String queryEditorId) {
    this.queryEditorId = queryEditorId;
  }

  public QueryStatus getQueryStatus() {
    return queryStatus;
  }

  public void setQueryStatus(QueryStatus queryStatus) {
    this.queryStatus = queryStatus;
  }

  public String getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(String applicationId) {
    this.applicationId = applicationId;
  }

  public Statement getCurrentStatement() {
    return currentStatement;
  }

  public void setCurrentStatement(Statement currentStatement) {
    this.currentStatement = currentStatement;
  }

  public List<String> getQueryList() {
    return queryList;
  }

  public void setQueryList(List<String> queryList) {
    this.queryList = queryList;
  }

  public Connection getPrimaryConnection() {
    if(primaryConnection == null){
      primaryConnection = createConnection();
    }
    return primaryConnection;
  }

  public Connection getSecondaryConnection() {
    if(secondaryConnection == null){
      secondaryConnection = createSecondaryConnection();
    }
    return secondaryConnection;
  }

  public Long getQueryHistoryId() {
    return queryHistoryId;
  }

  public void setQueryHistoryId(Long queryHistoryId) {
    this.queryHistoryId = queryHistoryId;
  }

  public String getAuditId() {
    return auditId;
  }

  public void setAuditId(String auditId) {
    this.auditId = auditId;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  private Connection createConnection(){
    JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(connectionInfo);
    originalPrimaryConnection = jdbcConnector.getConnection(connectionInfo, jdbcDialect, connectionInfo.getDatabase(), true, username, password);
    return getCloseSuppressingConnectionProxy(originalPrimaryConnection);
  }

  private Connection createSecondaryConnection(){
    JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(connectionInfo);

    Map<String, String> propMap = connectionInfo.getPropertiesMap();
    String hiveAdminUserName = propMap.get(HiveDialect.PROPERTY_KEY_ADMIN_NAME);
    String hiveAdminUserPassword = propMap.get(HiveDialect.PROPERTY_KEY_ADMIN_PASSWORD);

    originalSecondaryConnection = jdbcConnector.getConnection(connectionInfo, jdbcDialect, connectionInfo.getDatabase(), true, hiveAdminUserName, hiveAdminUserPassword);
    return getCloseSuppressingConnectionProxy(originalSecondaryConnection);
  }

  /**
   * Destroy.
   */
  public void destroy(){
    //Statement Close
    JdbcUtils.closeStatement(this.getCurrentStatement());
    JdbcUtils.closeConnection(this.originalPrimaryConnection);
    JdbcUtils.closeConnection(this.originalSecondaryConnection);
    this.primaryConnection = null;
    this.secondaryConnection = null;
    this.originalPrimaryConnection = null;
    this.originalSecondaryConnection = null;
  }

  protected Connection getCloseSuppressingConnectionProxy(Connection target) {
    return (Connection) Proxy.newProxyInstance(
        ConnectionProxy.class.getClassLoader(),
        new Class<?>[] {ConnectionProxy.class},
        new CloseSuppressingInvocationHandler(target));
  }

  /**
   * Invocation handler that suppresses close calls on JDBC Connections.
   */
  private static class CloseSuppressingInvocationHandler implements InvocationHandler {

    private final Connection target;

    public CloseSuppressingInvocationHandler(Connection target) {
      this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      // Invocation on ConnectionProxy interface coming in...

      if (method.getName().equals("equals")) {
        // Only consider equal when proxies are identical.
        return (proxy == args[0]);
      }
      else if (method.getName().equals("hashCode")) {
        // Use hashCode of Connection proxy.
        return System.identityHashCode(proxy);
      }
      else if (method.getName().equals("unwrap")) {
        if (((Class<?>) args[0]).isInstance(proxy)) {
          return proxy;
        }
      }
      else if (method.getName().equals("isWrapperFor")) {
        if (((Class<?>) args[0]).isInstance(proxy)) {
          return true;
        }
      }
      else if (method.getName().equals("close")) {
        // Handle close method: don't pass the call on.
        return null;
      }
      else if (method.getName().equals("isClosed")) {
        return false;
      }
      else if (method.getName().equals("getTargetConnection")) {
        // Handle getTargetConnection method: return underlying Connection.
        return this.target;
      }

      // Invoke method on target Connection.
      try {
        return method.invoke(this.target, args);
      }
      catch (InvocationTargetException ex) {
        throw ex.getTargetException();
      }
    }
  }

  public String toString(){
    return "WorkbenchDataSource{" +
            "connectionId = '" + connectionId + "'\n" +
            ", queryEditorId = '" + queryEditorId + "'\n" +
            ", webSocketId = '" + webSocketId + "'\n" +
            ", queryStatus = '" + queryStatus == null ? "" : queryStatus.toString() + "'\n" +
            ", applicationId = '" + applicationId + "'\n"
            + "}";
  }

}
