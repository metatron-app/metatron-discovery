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

package app.metatron.discovery.query.druid;


import app.metatron.discovery.query.druid.granularities.DurationGranularity;
import app.metatron.discovery.query.druid.granularities.PeriodGranularity;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.beans.Transient;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type",
        defaultImpl = SimpleGranularity.class)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SimpleGranularity.class, name = "simple"),
        @JsonSubTypes.Type(value = DurationGranularity.class, name = "duration"),
        @JsonSubTypes.Type(value = PeriodGranularity.class, name = "period")
})
public interface Granularity {

  @Transient
  String getAlias();

  void setAlias(String alias);

}
