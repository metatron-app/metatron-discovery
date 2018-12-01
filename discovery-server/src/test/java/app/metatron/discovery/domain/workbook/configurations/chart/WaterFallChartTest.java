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

import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Water fall chart spec. Test
 */
public class WaterFallChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws IOException {

    ChartLegend legend = new ChartLegend();

    ChartAxis xAxis = new ChartAxis(true, "test", true, null, null, null);
    ChartAxis yAxis = new ChartAxis(true, null, true, null, null, null);

    WaterFallChart chart = new WaterFallChart(colorByMeasureForSection(), null, legend, null, fontLargerSize(), null, null,
                                              500,
                                              70,
                                              new WaterFallChart.BarColor("#COLOR1", "#COLOR2"),
                                              new WaterFallChart.GuideLine("#COLOR", "THIN"),
                                              xAxis, yAxis);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.getDefaultMapper().readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());


  }

}
