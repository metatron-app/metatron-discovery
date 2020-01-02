/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import java.util.List;

public class EngineMonitoringQueryRequest {

  List<String> result;
  List<String> service;
  List<String> type;

  String startedTimeFrom;
  String startedTimeTo;

  String key;
  String sort;
  Integer limit;

  public EngineMonitoringQueryRequest() {
  }

  public List<String> getResult() {
    return result;
  }

  public void setResult(List<String> result) {
    this.result = result;
  }

  public List<String> getService() {
    return service;
  }

  public void setService(List<String> service) {
    this.service = service;
  }

  public List<String> getType() {
    return type;
  }

  public void setType(List<String> type) {
    this.type = type;
  }

  public String getStartedTimeFrom() {
    return startedTimeFrom;
  }

  public void setStartedTimeFrom(String startedTimeFrom) {
    this.startedTimeFrom = startedTimeFrom;
  }

  public String getStartedTimeTo() {
    return startedTimeTo;
  }

  public void setStartedTimeTo(String startedTimeTo) {
    this.startedTimeTo = startedTimeTo;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public String getSort() {
    return sort;
  }

  public void setSort(String sort) {
    this.sort = sort;
  }

  public Integer getLimit() { return limit; }

  public void setLimit(Integer limit) { this.limit = limit; }
}
