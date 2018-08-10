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

package app.metatron.discovery.util;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by kyungtaak on 2016. 9. 1..
 */
public class TimeUtils {

  public static final Pattern PATTERN_DURATION_FORMAT = Pattern.compile("^([+-]?)P([0-9]+)([WHMSD]{1})$");

  public static DateTime getDateTimeByDuration(DateTime dateTime, String durationExpr) {

    if(StringUtils.isEmpty(durationExpr)) {
      return dateTime;
    }

    Matcher m = PATTERN_DURATION_FORMAT.matcher(durationExpr.trim());
    if(!m.find()) {
      return dateTime;
    }

    boolean isMinus = "-".equals(m.group(1));
    int time = Integer.valueOf(m.group(2));

    if(time == 0) {
      return dateTime;
    }

    switch (m.group(3)) {
      case "W":
        dateTime = isMinus ? dateTime.minusWeeks(time) : dateTime.plusWeeks(time);
        break;
      case "H":
        dateTime = isMinus ? dateTime.minusHours(time) : dateTime.plusHours(time);
        break;
      case "M":
        dateTime = isMinus ? dateTime.minusMinutes(time) : dateTime.plusMinutes(time);
        break;
      case "S":
        dateTime = isMinus ? dateTime.minusSeconds(time) : dateTime.plusSeconds(time);
        break;
      case "D":
        dateTime = isMinus ? dateTime.minusDays(time) : dateTime.plusDays(time);
        break;
    }

    return dateTime;
  }

  public static DateTime getMinTime() {
    return new DateTime(0L)
        .withZone(DateTimeZone.UTC);
  }

  public static DateTime getMaxTime() {
    return new DateTime()
        .withZone(DateTimeZone.UTC)
        .withDate(2037, 12, 31)
        .withTime(0, 0, 0, 0);
  }

  public static String millisecondToString(Long ms, TimeUnits unit){

    Long targetMs = ms;
    if(targetMs == null){
      targetMs = 0L;
    }

    TimeUnits toUnit;
    if(unit != null){
      toUnit = unit;
    } else if(targetMs > TimeUnits.MINUTE.getMils()){
      toUnit = TimeUnits.MINUTE;
    } else if(targetMs > TimeUnits.SECOND.getMils()){
      toUnit = TimeUnits.SECOND;
    } else {
      toUnit = TimeUnits.MILLISECOND;
    }

    String unitStr = "";
    switch (toUnit){
      case MILLISECOND:
        unitStr = "ms";
        break;
      case SECOND:
        unitStr = "sec";
        break;
      case MINUTE:
        unitStr = "min";
        break;
      case HOUR:
        unitStr = "h";
        break;
      case DAY:
        unitStr = "d";
        break;
      case WEEK:
        unitStr = "w";
        break;
      case MONTH:
        unitStr = "M";
        break;
      case QUARTER:
        unitStr = "Q";
        break;
      case YEAR:
        unitStr = "Y";
        break;
    }

    return Math.round(targetMs / toUnit.getMils()) + " " + unitStr;

  }

}
