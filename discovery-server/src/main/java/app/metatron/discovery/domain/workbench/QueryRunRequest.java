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

public class QueryRunRequest {

  String query;
  String webSocketId;
  String database;
  int numRows;
  int runIndex = -1;
  int retryQueryResultOrder = -1;

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public int getNumRows() {
    return numRows;
  }

  public void setNumRows(int numRows) {
    this.numRows = numRows;
  }

  public int getRunIndex() {
    return runIndex;
  }

  public int getRetryQueryResultOrder() {
    return retryQueryResultOrder;
  }

  public void setRetryQueryResultOrder(int retryQueryResultOrder) {
    this.retryQueryResultOrder = retryQueryResultOrder;
  }

  public void setRunIndex(int runIndex) {
    this.runIndex = runIndex;
  }

  public boolean isFirstRunInQueryEditor() {
    if(this.getRunIndex() == 0 && this.getRetryQueryResultOrder() == -1) {
      return true;
    } else {
      return false;
    }
  }

  public boolean isRetryRun() {
    if(this.getRunIndex() == 0 && this.getRetryQueryResultOrder() > -1) {
      return true;
    } else {
      return false;
    }
  }

  @Override
  public String toString() {
    return "QueryRunRequest{" +
        "query='" + query + '\'' +
        ", webSocketId='" + webSocketId + '\'' +
        ", database='" + database + '\'' +
        ", numRows=" + numRows +
        ", runIndex=" + runIndex +
        ", retryQueryResultOrder=" + retryQueryResultOrder +
        '}';
  }
}
