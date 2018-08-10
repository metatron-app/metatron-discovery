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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

@JsonTypeName("timestamp")
public class TimestampFilter extends Filter {

  List<String> selectedTimestamps;

  FieldFormat timeFormat;

  public TimestampFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public TimestampFilter(@JsonProperty(value = "field", required = true) String field,
                         @JsonProperty("ref") String ref,
                         @JsonProperty("selectedTimestamps") List<String> selectedTimestamps,
                         @JsonProperty("timeFormat") FieldFormat timeFormat) {
    super(field, ref);
    this.selectedTimestamps = selectedTimestamps;
    this.timeFormat = timeFormat;
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }

  public List<String> getSelectedTimestamps() {
    return selectedTimestamps;
  }

  public void setSelectedTimestamps(List<String> selectedTimestamps) {
    this.selectedTimestamps = selectedTimestamps;
  }

  public FieldFormat getTimeFormat() {
    return timeFormat;
  }

  public void setTimeFormat(FieldFormat timeFormat) {
    this.timeFormat = timeFormat;
  }
}
