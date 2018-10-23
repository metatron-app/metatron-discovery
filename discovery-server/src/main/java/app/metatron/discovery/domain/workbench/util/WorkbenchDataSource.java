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

import app.metatron.discovery.domain.workbench.QueryStatus;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.support.JdbcUtils;

import java.sql.Statement;
import java.util.List;

public class WorkbenchDataSource {

  private String connectionId;
  private String queryEditorId;
  private String webSocketId;
  private List<String> queryList;
  private SingleConnectionDataSource primarySingleConnectionDataSource;
  private SingleConnectionDataSource secondarySingleConnectionDataSource;
  private QueryStatus queryStatus = QueryStatus.IDLE;
  private String applicationId;
  private Statement currentStatement;

  /**
   * Instantiates a new Single connection data source info.
   *
   * @param connectionId               the connection id
   * @param webSocketId                the web socket id
   * @param singleConnectionDataSource the single connection data source
   */
  public WorkbenchDataSource(String connectionId, String webSocketId, SingleConnectionDataSource singleConnectionDataSource){
    this.connectionId = connectionId;
    this.webSocketId = webSocketId;
    this.primarySingleConnectionDataSource = singleConnectionDataSource;
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

  /**
   * Gets single connection data source.
   *
   * @return the single connection data source
   */
  public SingleConnectionDataSource getSingleConnectionDataSource() {
    return primarySingleConnectionDataSource;
  }

  /**
   * Sets single connection data source.
   *
   * @param singleConnectionDataSource the single connection data source
   */
  public void setSingleConnectionDataSource(SingleConnectionDataSource singleConnectionDataSource) {
    this.primarySingleConnectionDataSource = singleConnectionDataSource;
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

  public SingleConnectionDataSource getSecondarySingleConnectionDataSource() {
    return secondarySingleConnectionDataSource;
  }

  public void setSecondarySingleConnectionDataSource(SingleConnectionDataSource secondarySingleConnectionDataSource) {
    this.secondarySingleConnectionDataSource = secondarySingleConnectionDataSource;
  }

  /**
   * Destroy.
   */
  public void destroy(){
    //Statement Close
    JdbcUtils.closeStatement(this.getCurrentStatement());
    this.primarySingleConnectionDataSource.destroy();
    this.primarySingleConnectionDataSource = null;

    if(this.secondarySingleConnectionDataSource != null) {
      this.secondarySingleConnectionDataSource.destroy();
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
