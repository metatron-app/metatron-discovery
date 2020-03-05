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

package app.metatron.discovery.domain.workbook.configurations.filter;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import org.junit.Before;
import org.junit.Test;

public class TimeRelativeFilterTest {

  Field dataSourceField;

  @Before
  public void setUp() {
    dataSourceField = new Field();
    dataSourceField.setFormat(GlobalObjectMapper.writeValueAsString(new CustomDateTimeFormat("yyyy-MM-dd")));
  }

  @Test
  public void getEngineIntervalsWithBackward() {

    TimeRelativeFilter timeRelativeFilter = new TimeRelativeFilter("test field",
                                                                   "ref",
                                                                   "HOUR",
                                                                   null,
                                                                   "previous",
                                                                   5,
                                                                   "Asia/Seoul",
                                                                   "ko"
                                                                   );

    System.out.println(timeRelativeFilter.getEngineIntervals(Field.ofFakeTimestamp()));
  }

  @Test
  public void getEngineIntervals() {

    TimeRelativeFilter timeRelativeFilter = new TimeRelativeFilter("test field",
            "ref",
            "DAY",
            null,
            "current",
            5,
            "Asia/Seoul",
            "ko"
    );

    System.out.println(timeRelativeFilter.getEngineIntervals(dataSourceField));
  }
}