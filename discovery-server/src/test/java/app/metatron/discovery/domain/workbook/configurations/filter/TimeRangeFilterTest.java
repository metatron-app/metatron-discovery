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

import org.junit.Before;
import org.junit.Test;

import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;

public class TimeRangeFilterTest {

  Field dataSourceField;

  @Before
  public void setUp() {
    dataSourceField = new Field();
    dataSourceField.setFormat(GlobalObjectMapper.writeValueAsString(new CustomDateTimeFormat("yyyy-MM-dd")));
  }

  @Test
  public void parseDayWithTimezoneBackward() {
    List<String> intervals = Lists.newArrayList();
    intervals.add("EARLIEST_DATETIME/2018-05-18");
    intervals.add("2018-05-19/2018-05-20");
    intervals.add("2018-05-20/P2D");
    intervals.add("2018-05-25/LATEST_DATETIME");

    TimeRangeFilter filter = new TimeRangeFilter("field", "ref", "DAY", intervals, "Asia/Seoul", "ko");

    System.out.println(filter.getEngineIntervals(Field.ofFakeTimestamp()));
  }

  @Test
  public void parseDayWithTimezone() {
    List<String> intervals = Lists.newArrayList();
    intervals.add("EARLIEST_DATETIME/2018-05-18");
    intervals.add("2018-05-19/2018-05-20");
    intervals.add("2018-05-20/P2D");
    intervals.add("2018-05-25/LATEST_DATETIME");

    TimeRangeFilter filter = new TimeRangeFilter("field", "ref", "DAY", intervals, "Asia/Seoul", "ko");

    System.out.println(filter.getEngineIntervals(dataSourceField));
  }

  @Test
  public void parseHourTimeWithTimezoneBackward() {
    List<String> intervals = Lists.newArrayList();
    intervals.add("EARLIEST_DATETIME/2018-05-18 08");
    intervals.add("2018-05-19 19/2018-05-20 20");
    intervals.add("2018-05-20 22/P2D");
    intervals.add("2018-05-25 09/LATEST_DATETIME");

    TimeRangeFilter filter = new TimeRangeFilter("field", "ref", "HOUR", intervals, "Asia/Seoul", "ko");

    System.out.println(filter.getEngineIntervals(Field.ofFakeTimestamp()));
  }

  @Test
  public void parseHourTimeWithTimezone() {
    List<String> intervals = Lists.newArrayList();
    intervals.add("EARLIEST_DATETIME/2018-05-18 08");
    intervals.add("2018-05-19 19/2018-05-20 20");
    intervals.add("2018-05-20 22/P2D");
    intervals.add("2018-05-25 09/LATEST_DATETIME");

    TimeRangeFilter filter = new TimeRangeFilter("field", "ref", "HOUR", intervals, "Asia/Seoul", "ko");

    System.out.println(filter.getEngineIntervals(dataSourceField));
  }
}
