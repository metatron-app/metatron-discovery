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

import app.metatron.discovery.query.druid.Granularity;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("period")
public class PeriodGranularity extends AbstractGranularity implements Granularity {

  String period;

  String timeZone;

  String origin;

  public PeriodGranularity() {
    super();
  }

  @JsonCreator
  public PeriodGranularity(@JsonProperty("period") String period,
          @JsonProperty("timeZone") String timeZone,
          @JsonProperty("origin") String origin) {
    this();
    this.period = period;
    this.timeZone = timeZone;
    this.origin = origin;
  }

  public String getPeriod() {
    return period;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public String getOrigin() {
    return origin;
  }
}
