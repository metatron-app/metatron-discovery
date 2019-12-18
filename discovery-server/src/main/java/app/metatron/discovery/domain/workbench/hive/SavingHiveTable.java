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

package app.metatron.discovery.domain.workbench.hive;

public class SavingHiveTable {
  private String tableName;
  private String webSocketId;
  private String loginUserId;
  private DataTable dataTable;
  private String hdfsDataFilePath;

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getLoginUserId() {
    return loginUserId;
  }

  public void setLoginUserId(String loginUserId) {
    this.loginUserId = loginUserId;
  }

  public DataTable getDataTable() {
    return dataTable;
  }

  public void setDataTable(DataTable dataTable) {
    this.dataTable = dataTable;
  }

  public String getHdfsDataFilePath() {
    return hdfsDataFilePath;
  }

  public void setHdfsDataFilePath(String hdfsDataFilePath) {
    this.hdfsDataFilePath = hdfsDataFilePath;
  }
}
