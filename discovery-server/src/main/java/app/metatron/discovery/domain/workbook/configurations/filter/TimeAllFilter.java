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

import org.apache.commons.lang3.StringUtils;

import java.util.List;

import app.metatron.discovery.domain.datasource.Field;

@JsonTypeName("time_all")
public class TimeAllFilter extends TimeFilter {

  public TimeAllFilter() {
  }

  @JsonCreator
  public TimeAllFilter(@JsonProperty(value = "field", required = true) String field,
                       @JsonProperty("ref") String ref) {
    super(field, ref, null, null, null, null, null);
  }

  @Override
  public boolean compare(Filter filter) {
    if (!(filter instanceof TimeRangeFilter || filter instanceof TimeSingleFilter)) {
      return false;
    }

    TimeAllFilter compareFilter = (TimeAllFilter) filter;

    if (StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if (StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    return true;
  }

  @Override
  public List<String> getEngineIntervals(Field datasourceField) {
    return TimeFilter.DEFAULT_INTERVAL;
  }

  @Override
  public String getExpression(String columnName, Field datasourceField) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String toString() {
    return "TimeAllFilter{} " + super.toString();
  }
}
