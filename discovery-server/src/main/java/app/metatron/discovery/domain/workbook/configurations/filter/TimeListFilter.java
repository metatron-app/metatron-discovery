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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.funtions.DateTimeMillisFunc;
import app.metatron.discovery.query.druid.funtions.InFunc;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;

import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

@JsonTypeName("time_list")
public class TimeListFilter extends TimeFilter {

  /**
   * 선택 값(목록) 정보
   */
  List<String> valueList;

  /**
   * 보기 설정된 아이템 항목  (Optional, for UI)
   */
  List<String> candidateValues;

  public TimeListFilter() {
  }

  @JsonCreator
  public TimeListFilter(@JsonProperty(value = "field", required = true) String field,
                        @JsonProperty("ref") String ref,
                        @JsonProperty("timeUnit") String timeUnit,
                        @JsonProperty("byTimeUnit") String byTimeUnit,
                        @JsonProperty("discontinuous") Boolean discontinuous,
                        @JsonProperty("timeZone") String timeZone,
                        @JsonProperty("locale") String locale,
                        @JsonProperty("valueList") List<String> valueList,
                        @JsonProperty("candidateValues") List<String> candidateValues) {
    super(field, ref, timeUnit, byTimeUnit, discontinuous, timeZone, locale);

    this.valueList = valueList;
    this.candidateValues = candidateValues;
  }

  @Override
  public boolean compare(Filter filter) {
    if (!(filter instanceof TimeRangeFilter)) {
      return false;
    }

    TimeListFilter compareFilter = (TimeListFilter) filter;

    if (StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if (StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    if (CollectionUtils.isEqualCollection(valueList, compareFilter.getValueList())) {
      return true;
    }

    return false;
  }

  @Override
  public List<String> getEngineIntervals(Field datasourceField) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getExpression(String columnName, Field datasourceField) {
    if (CollectionUtils.isEmpty(valueList)) {
      return null;
    }

    String field = null;
    if (datasourceField.getRole() == TIMESTAMP) {
      field = "__time";
    } else {
      TimeFieldFormat fieldFormat = (TimeFieldFormat) datasourceField.getFormatObject();

      DateTimeMillisFunc millisFunc = new DateTimeMillisFunc(columnName,
                                                             fieldFormat.getFormat(),
                                                             fieldFormat.selectTimezone(),
                                                             fieldFormat.getLocale());
      field = millisFunc.toExpression();
    }

    TimeFormatFunc timeFormatFunc = new TimeFormatFunc(field,
                                                       getTimeFormat(),
                                                       timeZone,
                                                       locale);

    InFunc inFunc = new InFunc(timeFormatFunc.toExpression(), valueList);

    return inFunc.toExpression();
  }

  @JsonIgnore
  public String getTimeFormat() {
    return BooleanUtils.isTrue(discontinuous) ? timeUnit.discontFormat(byTimeUnit) : timeUnit.format();
  }

  public List<String> getValueList() {
    return valueList;
  }

  public List<String> getCandidateValues() {
    return candidateValues;
  }

  @Override
  public String toString() {
    return "TimeListFilter{" +
        "valueList=" + valueList +
        ", candidateValues=" + candidateValues +
        "} " + super.toString();
  }
}
