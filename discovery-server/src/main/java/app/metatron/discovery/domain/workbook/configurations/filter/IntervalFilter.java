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


import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Interval;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.util.EnumUtils;

@JsonTypeName("interval")
public class IntervalFilter extends Filter {

  private static final String CURRENT_TIME = "CURRENT_DATETIME";

  private static final DateTimeFormatter DATETIMEFORMATTER_WITHOUTZONE = ISODateTimeFormat.dateHourMinuteSecond();

  /**
   * 기간을 설정하는 방식 정의 (범위, 최근)
   */
  SelectorType selector = SelectorType.RANGE;

  /**
   * 다중 시간 범위를 설정시, selector 가 'RANGE' 인 경우 해당
   */
  List<String> intervals;

  /**
   * From, selector 가 'RANGE' 인 경우 해당
   */
  String startDate;

  /**
   * To, selector 가 'RANGE' 인 경우 해당
   */
  String endDate;

  /**
   * 반복 Rule 설정, selector 가 'RANGE' 인 경우 해당
   */
  String rrule;

  /**
   * selector 가 'RELATIVE' 인 경우 해당
   */
  Integer relValue;

  /**
   * selector 가 'RELATIVE' 인 경우 해당
   */
  TimeUnit timeUnit;

  /**
   * 시간 범위 설정시 사용한 시간 포맷
   */
  String format;

  @JsonIgnore
  DateTimeZone dateTimeZone;

  @JsonIgnore
  Locale locale;

  public IntervalFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public IntervalFilter(@JsonProperty(value = "field", required = true) String field,
                        @JsonProperty("ref") String ref,
                        @JsonProperty("selector") String selector,
                        @JsonProperty("startDate") String startDate,
                        @JsonProperty("endDate") String endDate,
                        @JsonProperty("intervals") List<String> intervals,
                        @JsonProperty("timezone") String timezone,
                        @JsonProperty("locale") String locale,
                        @JsonProperty("format") String format,
                        @JsonProperty("rrule") String rrule,
                        @JsonProperty("relValue") Integer relValue,
                        @JsonProperty("timeUnit") String timeUnit) {
    super(field, ref);

    this.selector = EnumUtils.getUpperCaseEnum(SelectorType.class, selector, SelectorType.RANGE);
    this.dateTimeZone = DateTimeZone.forID(StringUtils.isEmpty(timezone) ? "UTC" : timezone);
    this.locale = Locale.forLanguageTag(StringUtils.isEmpty(locale) ? "en" : locale);

    switch (this.selector) {
      case RANGE:
        DateTimeFormatter formatter;
        if(StringUtils.isNotEmpty(format)) {
          formatter = DateTimeFormat.forPattern(format)
                                    .withZone(this.dateTimeZone)
                                    .withLocale(this.locale);
          this.format = format;
        } else {
          formatter = ISODateTimeFormat.dateTimeParser()
                                       .withZone(this.dateTimeZone)
                                       .withLocale(this.locale);
        }

        if(CollectionUtils.isNotEmpty(intervals)) {
          validateIntervals(intervals);
        } else {

          // Validation for startdate
          DateTime validStartDt;
          try {
            if (StringUtils.isEmpty(startDate)) {
              startDate = getMinTime().toString();
            }
            validStartDt = DateTime.parse(replaceCurrentTime(startDate), formatter);
          } catch (Exception e) {
            throw new IllegalArgumentException("Invalid 'startDate' property : " + e.getMessage());
          }
          this.startDate = startDate;

          // Validation for endDate
          DateTime validEndDt;
          try {
            if (StringUtils.isEmpty(endDate)) {
              endDate = getMaxTime().toString();
            }
            validEndDt = DateTime.parse(replaceCurrentTime(endDate), formatter);
          } catch (Exception e) {
            throw new IllegalArgumentException("Invalid 'endDate' property : " + e.getMessage());
          }

          if(validStartDt.isAfter(validEndDt)) {
            throw new IllegalArgumentException("'startDate' must be less than 'endDate'.");
          }
          this.endDate = validEndDt.plusSeconds(1).toString();

          this.rrule = rrule;
        }
        break;
      case RELATIVE:
        if(StringUtils.isEmpty(timeUnit)) {
          this.timeUnit = TimeUnit.HOURS;
        } else {
          this.timeUnit = TimeUnit.valueOf(timeUnit.toUpperCase());
        }

        if(relValue < 1) {
          throw new IllegalArgumentException("Invalid 'relValue' property, must be at least 1");
        }
        this.relValue = relValue;
        break;
      default:
        break;
    }
  }

  @Override
  public boolean compare(Filter filter) {
    if(!(filter instanceof IntervalFilter)) {
      return false;
    }

    IntervalFilter compareFilter = (IntervalFilter) filter;

    if(StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if(StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    List<String> originalIntervals = this.getEngineIntervals();
    List<String> compareIntervals = compareFilter.getEngineIntervals();

    if(CollectionUtils.isEqualCollection(originalIntervals, compareIntervals)) {
      return true;
    }

    return false;
  }

  public IntervalFilter(String field, Integer relValue, String timeUnit) {
    this(field, relValue, timeUnit, null);
  }

  public IntervalFilter(String field, Integer relValue, String timeUnit, String timezone) {
    this(field, null, "RELATIVE", null,null, null, timezone, null, null, null, relValue, timeUnit);
  }

  public IntervalFilter(String field, String startDate, String endDate) {
    this(field, startDate, endDate, null);
  }

  public IntervalFilter(String field, String startDate, String endDate, String format) {
    this(field, null, "RANGE", startDate, endDate, null, null, null, format, null, null, null);
  }

  public IntervalFilter(String field, List<String> intervals) {
    this(field, intervals, null);
  }

  public IntervalFilter(String field, List<String> intervals, String timezone) {
    this(field, null, "RANGE", null, null, intervals, timezone, null, null, null, null, null);
  }

  public void validateIntervals(List<String> intervals) {

    this.intervals = Lists.newArrayList();

    for (String interval : intervals) {

      if(StringUtils.isEmpty(interval)) {
        throw new IllegalArgumentException("Invalid interval format : " + interval);
      }

      Interval plusEndInterval;
      try {
        Interval parsedInterval = Interval.parse(replaceCurrentTime(interval));
        plusEndInterval = parsedInterval.withEnd(parsedInterval.getEnd().plusSeconds(1));
      } catch (Exception e) {
        throw new IllegalArgumentException("Invalid interval format : " + interval);
      }

      this.intervals.add(plusEndInterval.toString());
    }
  }

  private String replaceCurrentTime(String interval) {

    Preconditions.checkNotNull(interval);

    if(interval.indexOf(CURRENT_TIME) > -1) {
      return interval.replace(CURRENT_TIME, utcFakeNow().toString());
    }

    return interval;
  }

  /**
   * Engine 쿼리 활용
   *
   * @return
   */
  @JsonIgnore
  public List<String> getEngineIntervals() {

    switch (selector) {
      case ALL:
        return AbstractQueryBuilder.DEFAULT_INTERVALS;
      case RELATIVE:
        return Lists.newArrayList(
            new Interval(getRelativeStartDate(), utcFakeNow()).toString());
      case RANGE:
        if(CollectionUtils.isNotEmpty(intervals)) {
          return intervals.stream()
                          .map(interval -> Interval.parse(replaceCurrentTime(interval)).toString())
                          .collect(Collectors.toList());
        } else {
          return Lists.newArrayList(replaceCurrentTime(startDate) + "/" + replaceCurrentTime(endDate));
        }
      default:
          break;
    }

    return AbstractQueryBuilder.DEFAULT_INTERVALS;
  }

  /**
   * Live Query 에서 사용하는 Interval
   *
   * @return
   */
  @JsonIgnore
  public List<String> getLiveIntervals() {

    List<String> intervals = getEngineIntervals();

    if(CollectionUtils.isEmpty(intervals)) {
      throw new QueryTimeExcetpion("Fail to get intervals. see IntervalFilter");
    }

    return Lists.newArrayList(intervals.get(0).split("/"));
  }

  @JsonIgnore
  public DateTime getRelativeStartDate() {

    DateTime startDate = utcFakeNow();

    switch (timeUnit) {
      case SECONDS:
        startDate = startDate.minusSeconds(relValue);
        break;
      case MINUTES:
        startDate = startDate.minusMinutes(relValue);
        break;
      case HOURS:
        startDate = startDate.minusHours(relValue);
        break;
      case DAYS:
        startDate = startDate.minusDays(relValue);
        break;
      case WEEKS:
        startDate = startDate.minusWeeks(relValue);
        break;
      case MONTHS:
        startDate = startDate.minusMonths(relValue);
        break;
      case QUARTERS:
        startDate = startDate.minusMonths(3 * relValue);
        break;
      case YEARS:
        startDate = startDate.minusYears(relValue);
        break;
    }

    return startDate;
  }

  /**
   *
   * @return
   */
  public DateTime utcFakeNow() {
    return DateTime.parse(
        DateTime.now(dateTimeZone).toString(DATETIMEFORMATTER_WITHOUTZONE),
        DATETIMEFORMATTER_WITHOUTZONE);
  }

  @JsonIgnore
  public DateTime getMinTime() {
    return new DateTime(0L)
        .withZone(DateTimeZone.UTC);
  }

  @JsonIgnore
  public DateTime getMaxTime() {
    return new DateTime()
        .withZone(DateTimeZone.UTC)
        .withDate(2037, 12, 31)
        .withTime(0, 0, 0, 0);
  }

  public SelectorType getSelector() {
    return selector;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public String getStartDate() {
    return startDate;
  }

  public String getEndDate() {
    return endDate;
  }

  public String getRrule() {
    return rrule;
  }

  public Integer getRelValue() {
    return relValue;
  }

  public TimeUnit getTimeUnit() {
    return timeUnit;
  }

  // Inner Class

  /**
   * 설정 타입 (기간설정 - RANGE, 최근 기간 설정 - RELATIVE)
   */
  public enum SelectorType {
    ALL, RANGE, RELATIVE
  }

  /**
   * 기준 시간 설정시 시간 단위
   */
  public enum TimeUnit {
    YEARS, QUARTERS, MONTHS, WEEKS, DAYS, HOURS, MINUTES, SECONDS
  }

}
