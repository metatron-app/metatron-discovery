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

@JsonTypeName("duration")
public class DurationGranularity extends AbstractGranularity implements Granularity {

  String duration;

  String origin;

  public DurationGranularity() {
    super();
  }

  @JsonCreator
  public DurationGranularity(@JsonProperty("duration") String duration,
          @JsonProperty("origin") String origin) {
    this.duration = duration;
    this.origin = origin;
  }

  public String getDuration() {
    return duration;
  }

  public String getOrigin() {
    return origin;
  }
}
