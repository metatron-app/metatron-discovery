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

import com.google.common.collect.Maps;

import org.joda.time.DateTime;

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * 테스트용 QueryHistory 모델 Builder
 */
public class QueryHistoryBuilder {

  private Map<String, Object> queryHistory = Maps.newHashMap();

  private boolean toJson = false;

  public QueryHistoryBuilder query(String query) {
    queryHistory.put("query", query);
    return this;
  }

  public QueryHistoryBuilder queryRunTime(DateTime queryRunTime) {
    queryHistory.put("queryRunTime", queryRunTime);
    return this;
  }

  public QueryHistoryBuilder queryFinishTime(DateTime queryFinishTime){
    queryHistory.put("queryFinishTime", queryFinishTime);
    return this;
  }

  public QueryHistoryBuilder queryTimeTaken(long queryTimeTaken){
    queryHistory.put("queryTimeTaken", queryTimeTaken);
    return this;
  }

  public QueryHistoryBuilder queryStatus(QueryResult.QueryResultStatus queryStatus){
    queryHistory.put("queryStatus", queryStatus);
    return this;
  }

  public QueryHistoryBuilder rtRowCount(long rtRowCount){
    queryHistory.put("rtRowCount", rtRowCount);
    return this;
  }

  public QueryHistoryBuilder rtSize(long rtSize){
    queryHistory.put("rtSize", rtSize);
    return this;
  }

  public QueryHistoryBuilder queryEditor(String queryEditorId) {
    queryHistory.put("queryEditor", "/api/queryeditors/" + queryEditorId);
    return this;
  }

  public QueryHistoryBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {

    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(this.queryHistory);
    } else {
      return queryHistory;
    }
  }

}
