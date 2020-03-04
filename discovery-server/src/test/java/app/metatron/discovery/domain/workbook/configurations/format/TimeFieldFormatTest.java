/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.format;

import org.joda.time.DateTime;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class TimeFieldFormatTest {

  @Test
  public void resetDateTimeByUnit() {

    DateTime currentTime = DateTime.now();

    //    System.out.println(TimeFieldFormat.TimeUnit.YEAR.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.MONTH.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.WEEK.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.DAY.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.HOUR.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.MINUTE.resetDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.SECOND.resetDateTimeByUnit(currentTime));

    assertEquals(1, TimeFieldFormat.TimeUnit.YEAR.resetDateTimeByUnit(currentTime).getMonthOfYear());
    assertEquals(1, TimeFieldFormat.TimeUnit.MONTH.resetDateTimeByUnit(currentTime).getDayOfMonth());
    assertEquals(1, TimeFieldFormat.TimeUnit.WEEK.resetDateTimeByUnit(currentTime).getDayOfWeek());
    assertEquals(0, TimeFieldFormat.TimeUnit.DAY.resetDateTimeByUnit(currentTime).getHourOfDay());
    assertEquals(0, TimeFieldFormat.TimeUnit.HOUR.resetDateTimeByUnit(currentTime).getMinuteOfHour());
    assertEquals(0, TimeFieldFormat.TimeUnit.MINUTE.resetDateTimeByUnit(currentTime).getSecondOfMinute());
    assertEquals(0, TimeFieldFormat.TimeUnit.SECOND.resetDateTimeByUnit(currentTime).getMillisOfSecond());

  }

  @Test
  public void maxDateTimeByUnit() {

    DateTime currentTime = DateTime.now();

    //    System.out.println(TimeFieldFormat.TimeUnit.YEAR.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.MONTH.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.WEEK.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.DAY.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.HOUR.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.MINUTE.maxDateTimeByUnit(currentTime));
    //    System.out.println(TimeFieldFormat.TimeUnit.SECOND.maxDateTimeByUnit(currentTime));

    assertEquals(12, TimeFieldFormat.TimeUnit.YEAR.maxDateTimeByUnit(currentTime).getMonthOfYear());
    assertEquals(currentTime.dayOfMonth().withMaximumValue().getDayOfMonth(),
            TimeFieldFormat.TimeUnit.MONTH.maxDateTimeByUnit(currentTime).getDayOfMonth());
    assertEquals(currentTime.dayOfWeek().withMaximumValue().getDayOfWeek(),
            TimeFieldFormat.TimeUnit.WEEK.maxDateTimeByUnit(currentTime).getDayOfWeek());
    assertEquals(23, TimeFieldFormat.TimeUnit.DAY.maxDateTimeByUnit(currentTime).getHourOfDay());
    assertEquals(59, TimeFieldFormat.TimeUnit.HOUR.maxDateTimeByUnit(currentTime).getMinuteOfHour());
    assertEquals(59, TimeFieldFormat.TimeUnit.MINUTE.maxDateTimeByUnit(currentTime).getSecondOfMinute());
    assertEquals(999, TimeFieldFormat.TimeUnit.SECOND.maxDateTimeByUnit(currentTime).getMillisOfSecond());

  }

}