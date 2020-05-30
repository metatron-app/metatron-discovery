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

package app.metatron.discovery.domain.workbook.configurations.format;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.engine.EngineQueryProperties;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.util.EnumUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.Locale;

public abstract class TimeFieldFormat {

  public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

  public static final String DISABLE_TIMEZONE = "DISABLE_ZONE";

  String timeZone;

  String locale;

  /**
   * Timestamp 타입 필터링시, Candidate 호출시 결과 형태 정의
   */
  FilteringType filteringType;

  public TimeFieldFormat() {
  }

  public TimeFieldFormat(String timeZone, String locale, String filteringType) {

    if (DISABLE_TIMEZONE.equalsIgnoreCase(timeZone)) {
      this.timeZone = timeZone;
    } else {
      try {
        this.timeZone = timeZone == null ? EngineQueryProperties.getDefaultTimezone() : DateTimeZone.forID(timeZone).toString();
      } catch (Exception e) {
        throw new BadRequestException("Invalid timezone ID : " + e.getMessage());
      }
    }

    try {
      this.locale = locale == null ? EngineQueryProperties.getDefaultLocale() : new Locale(locale).getLanguage();
    } catch (Exception e) {
      throw new BadRequestException("Invalid local value : " + e.getMessage());
    }

    this.filteringType = EnumUtils.getUpperCaseEnum(FilteringType.class, filteringType);
  }

  public void setUTC() {
    timeZone = "UTC";
    locale = "en";
  }

  public String selectTimezone() {
    if (DISABLE_TIMEZONE.equalsIgnoreCase(timeZone)) {
      return "UTC";
    } else {
      return timeZone;
    }
  }

  public String getTimeZone() {
    return timeZone;
  }

  public String getLocale() {
    return locale;
  }

  public FilteringType getFilteringType() {
    return filteringType;
  }

  public abstract String getFormat();

  @JsonIgnore
  public abstract String getSortFormat();

  @JsonIgnore
  public abstract boolean enableSortField();

  @JsonIgnore
  public abstract String getSortComparator();

  public enum TimeUnit {
    SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR, NONE;

    public DateTime maxDateTime(DateTime dateTime) {
      switch (this) {
        case YEAR:
          return dateTime.dayOfYear().withMaximumValue()
                         .secondOfDay().withMaximumValue();
        case QUARTER:
          // TODO:
        case MONTH:
          return dateTime.dayOfMonth().withMaximumValue()
                         .secondOfDay().withMaximumValue();
        case DAY:
          return dateTime.secondOfDay().withMaximumValue();
        case HOUR:
          return dateTime.minuteOfHour().withMaximumValue()
                         .secondOfMinute().withMaximumValue();
        case MINUTE:
        case SECOND:
          return dateTime.secondOfMinute().withMaximumValue();

      }

      return dateTime;
    }

    public String peridFormat(Integer value) {
      StringBuilder builder = new StringBuilder("P");
      switch (this) {
        case SECOND:
          builder.append("T").append(value).append("S");
          break;
        case MINUTE:
          builder.append("T").append(value).append("M");
          break;
        case HOUR:
          builder.append("T").append(value).append("H");
          break;
        case DAY:
          builder.append(value).append("D");
          break;
        case WEEK:
          builder.append(value).append("W");
          break;
        case MONTH:
          builder.append(value).append("M");
          break;
        case QUARTER:
          builder.append(value).append("M");
          break;
        case YEAR:
          builder.append(value).append("Y");
          break;
        default:
          builder.append(value).append("Y");
          break;
      }

      return builder.toString();
    }

    public String parsedDateTime(DateTime dateTime, String format, String locale) {

      DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern(format)
                                                          .withLocale(locale == null ? Locale.ENGLISH : new Locale(locale));

      return dateTime.toString(dateTimeFormatter);
    }

    public String format() {
      switch (this) {
        case SECOND:
          return "MMM d, yyyy HH:mm:ss";
        case MINUTE:
          return "MMM d, yyyy HH:mm";
        case HOUR:
          return "MMM d, yyyy HH";
        case DAY:
          return "MMM d, yyyy";
        case WEEK:
          return "'Week' w, xxxx"; // for joda weekOfweekYear
        case MONTH:
          return "MMM yyyy";
        case QUARTER:
          return "qqq yyyy";
        case YEAR:
          return "yyyy";
        default:
          return "yyyy-MM-dd HH:mm:ss";
      }
    }

    public String sortFormat() {
      switch (this) {
        case SECOND:
          return "yyyy-MM-dd HH:mm:ss";
        case MINUTE:
          return "yyyy-MM-dd HH:mm";
        case HOUR:
          return "yyyy-MM-dd HH";
        case DAY:
          return "yyyy-MM-dd";
        case WEEK:
          return "xxxx-ww";  // for joda weekOfweekYear
        case MONTH:
          return "yyyy-MM";
        case QUARTER:
          return "yyyy-q";
        case YEAR:
          return "yyyy";
        default:
          return "yyyy-MM-dd HH:mm:ss";
      }
    }

    public String discontFormat(ByTimeUnit type) {
      switch (this) {
        case SECOND:
          return "HH:mm:ss";
        case MINUTE:
          return "HH:mm";
        case HOUR:
          return "HH:00";
        case DAY:
          if (type == ByTimeUnit.MONTH) {
            return "d";
          } else if (type == ByTimeUnit.YEAR) {
            return "D";
          } else {
            return "EEE";     // Week 가 기본임
          }
        case WEEK:
          if (type == ByTimeUnit.MONTH) {
            return "'Week' W";
          } else {
            return "'Week' w"; // YEAR 가 기본값임
          }
        case MONTH:
          if (type == ByTimeUnit.QUARTER) {
            return "qqq";
          } else {
            return "MMM";      // YEAR 가 기본값임
          }
        case QUARTER:
          return "qqq";
        case YEAR:
          return "yyyy";
        default:
          return "yyyy-MM-dd";
      }
    }

    public DateTime atStartDateTime(DateTime dateTime) {
      switch (this) {
        case YEAR:
          return dateTime.withTimeAtStartOfDay().withMonthOfYear(1);
        case MONTH:
          return dateTime.withTimeAtStartOfDay().withDayOfMonth(1);
        case WEEK:
          return dateTime.withTimeAtStartOfDay().withDayOfWeek(1);
        case DAY:
          return dateTime.withTimeAtStartOfDay();
      }

      return dateTime;
    }

    public DateTime atEndDateTime(DateTime dateTime) {
      switch (this) {
        case YEAR:
          return atStartDateTime(dateTime.plusYears(1)).minusMillis(1);
        case MONTH:
          return atStartDateTime(dateTime.plusMonths(1)).minusMillis(1);
        case WEEK:
          return atStartDateTime(dateTime.plusWeeks(1)).minusMillis(1);
        case DAY:
          return atStartDateTime(dateTime.plusDays(1)).minusMillis(1);
      }

      return dateTime;
    }

    public DateTime resetDateTimeByUnit(DateTime dateTime) {

      switch (this) {
        case YEAR:
          return dateTime.withMonthOfYear(1).withDayOfMonth(1).withTime(0, 0, 0, 0);
        case MONTH:
          return dateTime.withDayOfMonth(1).withTime(0, 0, 0, 0);
        case WEEK:
          return dateTime.withDayOfWeek(1).withTime(0, 0, 0, 0);
        case DAY:
          return dateTime.withTime(0, 0, 0, 0);
        case HOUR:
          return dateTime.withMinuteOfHour(0).withSecondOfMinute(0).withMillisOfSecond(0);
        case MINUTE:
          return dateTime.withSecondOfMinute(0).withMillisOfSecond(0);
        case SECOND:
          return dateTime.withMillisOfSecond(0);
      }

      return dateTime;

    }

    public DateTime maxDateTimeByUnit(DateTime dateTime) {

      switch (this) {
        case YEAR:
          return dateTime.withMonthOfYear(12).withDayOfMonth(31).withTime(23, 59, 59, 999);
        case MONTH:
          return dateTime.dayOfMonth().withMaximumValue().millisOfDay().withMaximumValue();
        case WEEK:
          return dateTime.dayOfWeek().withMaximumValue().millisOfDay().withMaximumValue();
        case DAY:
          return dateTime.millisOfDay().withMaximumValue();
        case HOUR:
          return dateTime.withMinuteOfHour(59).withSecondOfMinute(59).withMillisOfSecond(999);
        case MINUTE:
          return dateTime.withSecondOfMinute(59).withMillisOfSecond(999);
        case SECOND:
          return dateTime.withMillisOfSecond(999);
      }

      return dateTime;

    }

    public SimpleGranularity getGranularity() {
      switch (this) {
        case SECOND:
          return new SimpleGranularity("second");
        case MINUTE:
          return new SimpleGranularity("minute");
        case HOUR:
          return new SimpleGranularity("hour");
        case DAY:
          return new SimpleGranularity("day");
        case WEEK:
          return new SimpleGranularity("week");
        case MONTH:
          return new SimpleGranularity("month");
        case QUARTER:
          return new SimpleGranularity("quarter");
        case YEAR:
          return new SimpleGranularity("year");
        default:
          return new SimpleGranularity("all");
      }
    }
  }

  public enum ByTimeUnit {
    MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
  }

  public enum FilteringType {
    LIST, RANGE
  }
}
