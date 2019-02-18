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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.funtions.DateTimeMillisFunc;

import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

@JsonTypeName("time_range")
public class TimeRangeFilter extends TimeFilter {

  private static final String LATEST_DATETIME = "LATEST_DATETIME";

  private static final String EARLIEST_DATETIME = "EARLIEST_DATETIME";

  /**
   * String format interval (startdate/enddate)
   */
  List<String> intervals;

  public TimeRangeFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public TimeRangeFilter(@JsonProperty(value = "field", required = true) String field,
                         @JsonProperty("ref") String ref,
                         @JsonProperty("timeUnit") String timeUnit,
                         @JsonProperty("intervals") List<String> intervals,
                         @JsonProperty("timeZone") String timeZone,
                         @JsonProperty("locale") String locale) {
    super(field, ref, timeUnit, null, null, timeZone, locale);

    this.intervals = intervals;
  }

  @Override
  public boolean compare(Filter filter) {
    if (!(filter instanceof TimeRangeFilter)) {
      return false;
    }

    TimeRangeFilter compareFilter = (TimeRangeFilter) filter;

    if (StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if (StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    // for backward compatibility of timezone
    Field fakeField = Field.ofFakeTimestamp();

    List<String> originalIntervals = this.getEngineIntervals(fakeField);
    List<String> compareIntervals = compareFilter.getEngineIntervals(fakeField);

    if (CollectionUtils.isEqualCollection(originalIntervals, compareIntervals)) {
      return true;
    }

    return false;
  }

  public void validateIntervals(List<String> intervals) {
    // TODO
  }

  /**
   * Engine 쿼리 활용
   */
  @Override
  public List<String> getEngineIntervals(Field datasourceField) {

    if (CollectionUtils.isEmpty(intervals)) {
      return AbstractQueryBuilder.DEFAULT_INTERVALS;
    }

    return intervals.stream()
                    .map(interval -> {
                      List<DateTime> parsedDateTimes = parseDateTimes(interval, datasourceField.backwardTime());
                      return parsedDateTimes.get(0) + "/" + parsedDateTimes.get(1);
                    })
                    .collect(Collectors.toList());
  }

  @Override
  public String getExpression(String columnName, Field datasourceField) {

    if (CollectionUtils.isEmpty(intervals)) {
      return null;
    }

    StringJoiner joiner = new StringJoiner(" || ");
    for (String intervalText : intervals) {
      List<DateTime> parsedDateTimes = parseDateTimes(intervalText, datasourceField.backwardTime());

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

      joiner.add(field + " >= " + parsedDateTimes.get(0).getMillis() + " && "
                     + field + " <= " + parsedDateTimes.get(1).getMillis());
    }

    return joiner.toString();
  }

  /**
   * Parses an interval specified as 'datetime/datetime', 'datetime/period', 'period/datetime', or
   * 'period/datetime/period'.
   *
   * @param text the interval to parse
   * @return the parsed interval string
   */
  public List<DateTime> parseDateTimes(String text, boolean backward) {

    final String[] parts = text.split("/");

    DateTimeFormatter formatter = DateTimeFormat.forPattern(timeUnit.sortFormat())
                                                .withZone(DateTimeZone.forID(timeZone))
                                                .withLocale(Locale.forLanguageTag(locale));

    List<DateTime> resultDateTimes;
    if (parts.length == 3) {
      Period periodMinus = Period.parse(parts[0]);
      Period periodPlus = Period.parse(parts[2]);
      DateTime dateTime = DateTime.parse(parts[1], formatter);
      resultDateTimes = Lists.newArrayList(dateTime.minus(periodMinus), timeUnit.maxDateTime(dateTime.plus(periodPlus)));
    } else if (parts.length != 2) {
      throw new DateTimeParseException("Text cannot be parsed to a Interval", text, 0);
    } else if (parts[0].startsWith(EARLIEST_DATETIME)) {
      DateTime dateTime = DateTime.parse(parts[1], formatter);
      resultDateTimes = Lists.newArrayList(MIN_DATETIME, timeUnit.maxDateTime(dateTime));
    } else if (parts[0].startsWith("P")) {
      Period periodMinus = Period.parse(parts[0]);
      DateTime dateTime = DateTime.parse(parts[1], formatter);
      resultDateTimes = Lists.newArrayList(dateTime.minus(periodMinus), timeUnit.maxDateTime(dateTime));
    } else if (parts[1].startsWith(LATEST_DATETIME)) {
      DateTime dateTime = DateTime.parse(parts[0], formatter);
      resultDateTimes = Lists.newArrayList(dateTime, MAX_DATETIME);
    } else if (parts[1].startsWith("P")) {
      DateTime dateTime = DateTime.parse(parts[0], formatter);
      Period periodPlus = Period.parse(parts[1]);
      resultDateTimes = Lists.newArrayList(dateTime, timeUnit.maxDateTime(dateTime.plus(periodPlus)));
    } else {
      resultDateTimes = Lists.newArrayList(DateTime.parse(parts[0], formatter), timeUnit.maxDateTime(DateTime.parse(parts[1], formatter)));
    }

    if (backward) {
      resultDateTimes = resultDateTimes.stream()
                                       .map(dateTime -> utcFakeDateTime(dateTime))
                                       .collect(Collectors.toList());
    }

    return resultDateTimes;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  @Override
  public String toString() {
    return "TimeRangeFilter{" +
        "intervals=" + intervals +
        "} " + super.toString();
  }
}
