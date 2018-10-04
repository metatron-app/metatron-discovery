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

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;

import java.util.List;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.util.EnumUtils;

public abstract class TimeFilter extends Filter {

  private static final DateTimeFormatter DATETIMEFORMATTER_WITHOUTZONE = ISODateTimeFormat.dateHourMinuteSecond();
  private static final DateTimeFormatter DATETIMEFORMATTER_WITHUTCZONE = ISODateTimeFormat.dateHourMinuteSecond().withZoneUTC();

  public static final List<String> filterOptionTypes = Lists.newArrayList("RELATIVE", "RANGE");

  Boolean discontinuous;

  TimeFieldFormat.TimeUnit timeUnit;

  TimeFieldFormat.ByTimeUnit byTimeUnit;

  public TimeFilter() {
    // Empty Constructor
  }

  public TimeFilter(String field, String ref, String timeUnit, String byTimeUnit, Boolean discontinuous) {
    super(field, ref);
    this.discontinuous = discontinuous;
    this.timeUnit = EnumUtils.getUpperCaseEnum(TimeFieldFormat.TimeUnit.class, timeUnit, TimeFieldFormat.TimeUnit.NONE);
    this.byTimeUnit = EnumUtils.getUpperCaseEnum(TimeFieldFormat.ByTimeUnit.class, byTimeUnit);
  }

  @JsonIgnore
  public abstract List<String> getEngineIntervals();

  @JsonIgnore
  public abstract String getExpression(String columnName, Field datasourceField);

  /**
   *
   * @return
   */
  public DateTime utcFakeNow(DateTimeZone timeZone) {
    return DateTime.parse(
        DateTime.now(timeZone).toString(DATETIMEFORMATTER_WITHOUTZONE),
        DATETIMEFORMATTER_WITHUTCZONE);
  }

  protected DateTime maxDateTime(DateTime dateTime) {

    return null;
  }

  public TimeFieldFormat.TimeUnit getTimeUnit() {
    return timeUnit;
  }

  public TimeFieldFormat.ByTimeUnit getByTimeUnit() {
    return byTimeUnit;
  }

  public Boolean getDiscontinuous() {
    return discontinuous;
  }

  @Override
  public String toString() {
    return "TimeFilter{" +
        "timeUnit=" + timeUnit +
        ", byTimeUnit=" + byTimeUnit +
        "} " + super.toString();
  }
}
