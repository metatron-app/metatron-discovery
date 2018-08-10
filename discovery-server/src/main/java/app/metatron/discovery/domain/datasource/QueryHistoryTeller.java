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

package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.domain.datasource.data.forward.ResultForward;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
public class QueryHistoryTeller {

  private static final ThreadLocal<DataSourceQueryHistory> historyThreadLocal =
      new ThreadLocal<DataSourceQueryHistory>() {
        protected DataSourceQueryHistory initialValue() {
          return new DataSourceQueryHistory();
        }
      };

  public static DataSourceQueryHistory getHistory() {
    return historyThreadLocal.get();
  }

  public static void remove() {
    historyThreadLocal.remove();
  }

  public static void setQueryType(DataSourceQueryHistory.QueryType type) {
    historyThreadLocal.get().setQueryType(type);
  }

  public static void setEngineQuery(String engineQuery) {
    historyThreadLocal.get().setEngineQuery(engineQuery);
  }

  public static void setEngineQueryId(String engineQueryId) {
    historyThreadLocal.get().setEngineQueryId(engineQueryId);
  }

  public static void setEngineQueryType(DataSourceQueryHistory.EngineQueryType type) {
    historyThreadLocal.get().setEngineQueryType(type);
  }

  public static void setForwardType(ResultForward.ForwardType forwardType) {
    historyThreadLocal.get().setForwardType(forwardType);
  }

  public static void setSucceed() {
    historyThreadLocal.get().setSucceed(true);
  }

  public static void setFail(String message) {
    historyThreadLocal.get().setSucceed(false);
    historyThreadLocal.get().setMessage(message);
  }

  public static void setMessage(String message) {
    historyThreadLocal.get().setMessage(message);
  }

  public static void setResultCount(Long resultCount) {
    historyThreadLocal.get().setResultCount(resultCount);
  }

  public static void setResultCountAndSize(Long count, Long size) {
    DataSourceQueryHistory history = historyThreadLocal.get();
    history.setResultCount(count);
    history.setResultSize(size);
  }

  public static void setElapsedTime(Long elapsedTime) {
    historyThreadLocal.get().setElapsedTime(elapsedTime);
  }

  public static void setEngineElapsedTime(Long engineElapsedTime) {
    historyThreadLocal.get().setEngineElapsedTime(engineElapsedTime);
  }

}
