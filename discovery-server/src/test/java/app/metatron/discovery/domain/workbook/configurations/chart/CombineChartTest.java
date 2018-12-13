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

import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Combine Chart Specification Test
 */
public class CombineChartTest extends ChartTest {

  @Test
  public void de_serialize() throws IOException {

    ChartLegend legend = new ChartLegend();

    ChartAxis xAxis = new ChartAxis(true, "test", true, null, null, null);
    ChartAxis yAxis = new ChartAxis(true, null, true, null, null, null);
    ChartAxis secondaryAxis = new ChartAxis(false, null, true, null, null, null);

    CombineChart chart = new CombineChart(colorByMeasureForSection(), valueNumberFormat(), legend, null, fontLargerSize(), combineDataLabel(), null,
                                              500,
                                              CombineChart.BarMarkType.STACKED.name(), CombineChart.LineMarkType.AREA.name(),
                                              xAxis, yAxis, secondaryAxis);

    String combineChartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);
    System.out.println(combineChartStr);

    Chart deSerialized = GlobalObjectMapper.readValue(combineChartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
