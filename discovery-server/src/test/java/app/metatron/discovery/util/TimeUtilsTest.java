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

import org.joda.time.DateTime;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Created by kyungtaak on 2016. 9. 1..
 */
public class TimeUtilsTest {
  @Test
  public void getDateTimeFromDuration() throws Exception {

    DateTime curDateTime = DateTime.now();

    String expr1 = "P1D";
    assertEquals(curDateTime.plusDays(1), TimeUtils.getDateTimeByDuration(curDateTime, expr1));
    String expr2 = "+P1D";
    assertEquals(curDateTime.plusDays(1), TimeUtils.getDateTimeByDuration(curDateTime, expr2));
    String expr3 = "-P1D";
    assertEquals(curDateTime.minusDays(1), TimeUtils.getDateTimeByDuration(curDateTime, expr3));
    String expr4 = "P1W";
    assertEquals(curDateTime.plusWeeks(1), TimeUtils.getDateTimeByDuration(curDateTime, expr4));
    String expr5 = "P1S";
    assertEquals(curDateTime.plusSeconds(1), TimeUtils.getDateTimeByDuration(curDateTime, expr5));
    String expr6 = "P1H";
    assertEquals(curDateTime.plusHours(1), TimeUtils.getDateTimeByDuration(curDateTime, expr6));
    String expr7 = "P1M";
    assertEquals(curDateTime.plusMinutes(1), TimeUtils.getDateTimeByDuration(curDateTime, expr7));

    // abnormal case

    String expr8 = "P0M";
    assertEquals(curDateTime, TimeUtils.getDateTimeByDuration(curDateTime, expr8));
    String expr9 = null;
    assertEquals(curDateTime, TimeUtils.getDateTimeByDuration(curDateTime, expr9));
    String expr10 = "";
    assertEquals(curDateTime, TimeUtils.getDateTimeByDuration(curDateTime, expr10));

  }

  @Test
  public void getMillisecondString() throws Exception {

    long ms1 = 645;
    long ms2 = 1645;
    long ms3 = 123645;
    long ms4 = 3434645;

    System.out.println("ms1 = " + TimeUtils.millisecondToString(ms1, null));
    System.out.println("ms2 = " + TimeUtils.millisecondToString(ms2, null));
    System.out.println("ms3 = " + TimeUtils.millisecondToString(ms3, null));
    System.out.println("ms4 = " + TimeUtils.millisecondToString(ms4, null));
  }

}
