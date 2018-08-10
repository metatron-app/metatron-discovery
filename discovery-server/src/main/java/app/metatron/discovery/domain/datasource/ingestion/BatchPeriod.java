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

package app.metatron.discovery.domain.datasource.ingestion;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections.CollectionUtils;
import org.quartz.CronExpression;

import java.io.Serializable;
import java.text.ParseException;
import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Created by kyungtaak on 2016. 8. 12..
 */
public class BatchPeriod implements Serializable {

  Frequency frequency;

  Object value;

  Integer intValue;

  List<Days> weekDays;

  String time;

  String expr;

  @JsonCreator
  public BatchPeriod(@JsonProperty("frequency") String frequency,
                     @JsonProperty("value") Object value,
                     @JsonProperty("time") String time,
                     @JsonProperty("weekDays") List<String> weekDays) {

    this.frequency = SearchParamValidator.enumUpperValue(Frequency.class, frequency, "frequency");
    this.value = value;

    switch (this.frequency) {
      case MINUTELY:
      case HOURLY:
        try {
          this.intValue = Integer.valueOf(value + "");
        } catch (NumberFormatException e) {
          throw new IllegalArgumentException("Required number format value, if " + this.frequency);
        }
        break;
      case DAILY:
      case WEEKLY:
        this.time = time;
        if(!PolarisUtils.match(PolarisUtils.PATTERN_TIMES_FORMAT, this.time)) {
          throw new IllegalArgumentException("Required 'HH:mm' format value, if " + this.frequency);
        }

        if (CollectionUtils.isEmpty(weekDays)) {
          this.weekDays = Lists.newArrayList(Days.MON);
        } else {
          this.weekDays = weekDays.stream()
                                  .map(s -> EnumUtils.getUpperCaseEnum(Days.class, s))
                                  .filter(days -> days != null)
                                  .distinct()
                                  .collect(Collectors.toList());
        }
        break;
      case EXPR:
        this.expr = (String) value;
        try {
          CronExpression.validateExpression(this.expr);
        } catch (ParseException e) {
          throw new IllegalArgumentException("Invalid cron expression : " + e.getMessage());
        }
        break;
    }

  }

  public BatchPeriod(Frequency frequency) {
    this.frequency = frequency;
  }

  public BatchPeriod(Frequency frequency, Integer count) {
    this.frequency = frequency;
    this.value = count;
  }

  @JsonIgnore
  public String getCronExpr() {

    StringBuilder builder = new StringBuilder();
    switch (frequency) {
      case MINUTELY:
        builder.append("0 0/").append(getValueWithNull()).append(" * 1/1 * ? *");
        break;
      case HOURLY:
        builder.append("0 0 0/").append(getValueWithNull()).append(" 1/1 * ? *");
        break;
      case DAILY:
        builder.append("0 ");
        if (time == null) {
          builder.append("0 0 ");
        } else {
          builder.append(getTimeExpr(time)).append(" ");
        }
        builder.append("1/").append(getValueWithNull()).append(" * ? *");
        break;
      case WEEKLY:
        builder.append("0 ");
        if (time == null) {
          builder.append("0 0 ");
        } else {
          builder.append(getTimeExpr(time)).append(" ");
        }

        if (CollectionUtils.isEmpty(weekDays)) {
          weekDays = Lists.newArrayList(Days.MON);
        }

        builder.append("? * ")
                .append(String.join(",", weekDays.stream()
                        .map(day -> day.name())
                        .collect(Collectors.toList())))
                .append(" *");
        break;
      case EXPR:
        builder.append(expr);
        break;
    }

    return builder.toString();
  }

  @JsonIgnore
  public String getTimeExpr(String time) {
    List<Integer> hourMinute = PolarisUtils.findHourMinute(time);
    return hourMinute.get(1) + " " + hourMinute.get(0);
    // cron 분먼저
    //    return hourMinute.get(0) + " " + hourMinute.get(1);
  }

  @JsonIgnore
  public int getValueWithNull() {
    return intValue == null ? 1 : intValue;
  }

  public Frequency getFrequency() {
    return frequency;
  }

  public Object getValue() {
    return value;
  }

  public List<Days> getWeekDays() {
    return weekDays;
  }

  public String getTime() {
    return time;
  }

  public enum Frequency {
    MINUTELY, HOURLY, DAILY, WEEKLY, MONTHLY, EXPR
  }

  public enum Days {
    SUN, MON, TUE, WED, THU, FRI, SAT
  }
}

