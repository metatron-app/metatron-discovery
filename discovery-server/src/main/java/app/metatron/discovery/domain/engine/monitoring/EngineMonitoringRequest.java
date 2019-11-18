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

import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.query.druid.Granularity;

public class EngineMonitoringRequest extends SearchQueryRequest {

  String fromDate;
  String toDate;
  EngineMonitoringTarget monitoringTarget;
  Granularity granularity;

  public EngineMonitoringRequest() {
  }

  public String getFromDate() {
    return fromDate;
  }

  public void setFromDate(String fromDate) {
    this.fromDate = fromDate;
  }

  public String getToDate() {
    return toDate;
  }

  public void setToDate(String toDate) {
    this.toDate = toDate;
  }

  public Granularity getGranularity() {
    return granularity;
  }

  public void setGranularity(Granularity granularity) {
    this.granularity = granularity;
  }

  public EngineMonitoringTarget getMonitoringTarget() {
    return monitoringTarget;
  }

  public void setMonitoringTarget(EngineMonitoringTarget monitoringTarget) {
    this.monitoringTarget = monitoringTarget;
  }
}
