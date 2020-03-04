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

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.funtions.DateTimeMillisFunc;
import app.metatron.discovery.util.EnumUtils;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;

import java.util.List;

import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

@JsonTypeName("time_relative")
public class TimeRelativeFilter extends TimeFilter {

  TimeFieldFormat.TimeUnit relTimeUnit;

  Tense tense;

  Integer value;

  public TimeRelativeFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public TimeRelativeFilter(@JsonProperty(value = "field", required = true) String field,
                            @JsonProperty("ref") String ref,
                            @JsonProperty("timeUnit") String timeUnit,
                            @JsonProperty("relTimeUnit") String relTimeUnit,
                            @JsonProperty("tense") String tense,
                            @JsonProperty("value") Integer value,
                            @JsonProperty("timeZone") String timeZone,
                            @JsonProperty("locale") String locale) {
    super(field, ref, timeUnit, null, null, timeZone, locale);

    this.relTimeUnit = EnumUtils.getUpperCaseEnum(TimeFieldFormat.TimeUnit.class, relTimeUnit);
    this.tense = EnumUtils.getUpperCaseEnum(Tense.class, tense, Tense.CURRENT);
    this.value = (value == null || value < 1) ? 1 : value;
  }

  @Override
  public boolean compare(Filter filter) {

    if (!(filter instanceof TimeRelativeFilter)) {
      return false;
    }

    TimeRelativeFilter compareFilter = (TimeRelativeFilter) filter;

    if (StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if (StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    if (tense == compareFilter.getTense()
        && value == compareFilter.getValue()
        && timeUnit == compareFilter.getTimeUnit()
        && relTimeUnit == compareFilter.getTimeUnit()) {
      return true;
    }

    return false;
  }

  /**
   * Engine 쿼리 활용
   */
  @Override
  public List<String> getEngineIntervals(Field datasourceField) {

    List<DateTime> rangeDateTimes = rangeDateTimes(datasourceField.backwardTime());

    return Lists.newArrayList(rangeDateTimes.get(0).toString() + "/" + rangeDateTimes.get(1).toString());
  }

  public String getExpression(String columnName, Field datasourceField) {

    List<DateTime> rangeDateTimes = rangeDateTimes(datasourceField.backwardTime());

    String field;
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

    return field + " >= " + rangeDateTimes.get(0).getMillis() + " && "
        + field + " <= " + rangeDateTimes.get(1).getMillis();
  }

  private List<DateTime> rangeDateTimes(boolean backward) {

    DateTime currentTime = backward ?
            utcFakeNow(DateTimeZone.forID(timeZone)) : DateTime.now(DateTimeZone.forID(timeZone));

    TimeFieldFormat.TimeUnit standardTimeUnit = realTimeUnit();

    DateTime startTime;
    DateTime endTime;

    switch (tense) {
      case NEXT:
        startTime = standardTimeUnit.resetDateTimeByUnit(currentTime);
        endTime = startTime.plus(Period.parse(standardTimeUnit.peridFormat(this.value)));
        break;
      case PREVIOUS:
        DateTime previousTime = currentTime.minus(Period.parse(standardTimeUnit.peridFormat(this.value)));
        startTime = standardTimeUnit.resetDateTimeByUnit(previousTime);
        endTime = standardTimeUnit.maxDateTimeByUnit(currentTime);
        break;
      default:
        startTime = standardTimeUnit.resetDateTimeByUnit(currentTime);
        endTime = standardTimeUnit.maxDateTimeByUnit(currentTime);
    }

    return Lists.newArrayList(startTime, endTime);
  }

  private TimeFieldFormat.TimeUnit realTimeUnit() {
    if (relTimeUnit == null && timeUnit == null) {
      return TimeFieldFormat.TimeUnit.SECOND;
    }

    if (relTimeUnit == null) {
      return timeUnit;
    }

    return relTimeUnit;
  }

  public Tense getTense() {
    return tense;
  }

  public Integer getValue() {
    return value;
  }

  public TimeFieldFormat.TimeUnit getRelTimeUnit() {
    return relTimeUnit;
  }

  @Override
  public String toString() {
    return "TimeRelativeFilter{" +
        "tense=" + tense +
        ", value=" + value +
        "} " + super.toString();
  }

  public enum Tense {
    PREVIOUS, CURRENT, NEXT
  }
}
