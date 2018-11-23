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

package app.metatron.discovery.domain.workbook.configurations.chart;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Pie chart spec. Test
 */
public class PieChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws JsonProcessingException {

    PieChart chart = new PieChart(colorByMeasureForSection(), null, new ChartLegend(), null, fontLargerSize(), null, null,
                                  500,
                                  PieChart.MarkType.SECTOR.name(),
                                  PieChart.SplitLayout.HORIZONTAL.name(), 10);


    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    PieChart deSerialized = (PieChart) GlobalObjectMapper.readValue(chartStr, Chart.class);

    Assert.assertEquals(chart.getMarkType(), deSerialized.getMarkType());
    Assert.assertEquals(chart.getSplitLayout(), deSerialized.getSplitLayout());
    Assert.assertEquals(chart.getMaxCategory(), deSerialized.getMaxCategory());

    System.out.println("Result : " + deSerialized.toString());

  }

}
