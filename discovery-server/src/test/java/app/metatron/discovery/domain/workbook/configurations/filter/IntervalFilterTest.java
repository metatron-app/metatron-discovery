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

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2017. 4. 14..
 */
public class IntervalFilterTest {

  @Before
  public void setUp() {
    System.setProperty("user.timezone", "UTC");
  }

  @Test
  public void getIntervals() throws Exception {

    IntervalFilter intervalFilter = new IntervalFilter("field",
        null,
        null,
        "2017-04-16T12:30:00",
        "2017-04-17T12:30:00",
        null,
        null,
        null,
        null,
        null,
        null,
        null);

    System.out.println(intervalFilter.getLiveIntervals());

  }

  @Test
  public void multiRanges() throws Exception {

    IntervalFilter intervalFilter = new IntervalFilter("fieldName",
        Lists.newArrayList(
            "2017-04-16T12:30:00/2017-04-17T12:30:00",
            "2017-05-16T12:30:00/2017-05-17T12:30:00"
        ));

    System.out.println(intervalFilter.getEngineIntervals());
  }

  @Test
  public void multiRangesWithCurrent() throws Exception {

    System.out.println(DateTime.now(DateTimeZone.forID("Asia/Seoul")));

    IntervalFilter intervalFilter = new IntervalFilter("fieldName",
        Lists.newArrayList(
            "2017-04-16T12:30:00/2017-04-17T12:30:00",
            "2017-05-16T12:30:00/CURRENT_DATETIME"
        ), "Asia/Seoul");

    System.out.println(intervalFilter.getEngineIntervals());

    System.out.println(intervalFilter.getLiveIntervals());

    System.out.println(GlobalObjectMapper.writeValueAsString(intervalFilter));

  }

  @Test
  public void multiRangesWithInterval() throws Exception {

    IntervalFilter intervalFilter = new IntervalFilter("fieldName",
        Lists.newArrayList(
            "2017-04-16T12:30:00/2017-04-17T12:30:00",
            "2017-05-16T12:30:00/P1D"
        ));

    System.out.println(intervalFilter.getEngineIntervals());

  }

  @Test
  public void utcFakeNow() {

    System.out.println(DateTime.now(DateTimeZone.forID("Asia/Seoul")));

    IntervalFilter intervalFilter = new IntervalFilter("field", 1, "DAYS", "Asia/Seoul");
    System.out.println(intervalFilter.getEngineIntervals());

  }

}
