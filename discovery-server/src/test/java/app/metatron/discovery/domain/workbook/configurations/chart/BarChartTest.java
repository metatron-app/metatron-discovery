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

import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.format.PercentFormat;

/**
 * Bar Chart Spec. Test
 */
public class BarChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws JsonProcessingException {

    // X/Y 축
    ChartAxisLabel xAxisLabel = new ChartAxisLabelForCategory(0, 10, 0);
    ChartAxisGrid xAxisGrid = new ChartAxisGridForNumeric(true, null, null, null);
    ChartAxisLabel yAxisLabel = new ChartAxisLabelForValue(false, new PercentFormat(3, false));
    ChartAxisGrid yAxisGrid = new ChartAxisGridForText(0);

    ChartAxis.ChartAxisBackground xAxisBackground = new ChartAxis.ChartAxisBackground("color1", 50);

    ChartAxis xAxis = new ChartAxis(true, "test", true, xAxisLabel, xAxisBackground, xAxisGrid);
    ChartAxis yAxis = new ChartAxis(true, null, true, yAxisLabel, null, yAxisGrid);


    BarChart chart = new BarChart(colorByMeasureForGradient(), valueNumberFormat(), null, null, fontLargerSize(), dataLabel(), toolTip(),
                                  500,
                                  BarChart.MarkType.MULTIPLE.name(), BarChart.Align.HORIZONTAL.name(),
                                  xAxis, yAxis);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
