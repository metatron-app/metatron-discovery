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

/**
 * Line chart spec. Test
 */
public class LineChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws JsonProcessingException {

    // 범례
    //
    ChartLegend legend = new ChartLegend();

    ChartAxis xAxis = new ChartAxis(true, "test", true, null, null, null);
    ChartAxis yAxis = new ChartAxis(true, null, true, null, null, null);

    LineChart chart = new LineChart(colorByMeasureForGradient(), null, legend, null, fontLargerSize(), null, null,
                                    500,
                                    LineChart.MarkType.LINE.name(),
                                    LineChart.LineStyle.POINT_LINE.name(),
                                    LineChart.LineCurveStyle.SMOOTH.name(),
                                    LineChart.LineMode.CUMULATIVE.name(),
                                    LineChart.LineThickness.THIN.name(),
                                    xAxis, yAxis);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
