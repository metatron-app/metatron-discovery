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

package app.metatron.discovery.query.druid.granularities;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Granularity;

@JsonTypeName("period")
public class PeriodGranularity implements Granularity {
  String period;
  String timeZone;

  public PeriodGranularity(){
    super();
  }

  public PeriodGranularity(String period, String timeZone){
    this();
    this.period = period;
    this.timeZone = timeZone;
  }

  public String getPeriod() {
    return period;
  }

  public void setPeriod(String period) {
    this.period = period;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public void setTimeZone(String timeZone) {
    this.timeZone = timeZone;
  }
}
