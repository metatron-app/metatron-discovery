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

import com.google.common.collect.Lists;

import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Label(KPI) chart spec.
 */
public class LabelChartTest extends ChartTest {

  @Test
  public void de_serialize() throws IOException {

    LabelChart.PositiveNegativeColor positiveNegativeColor =
        new LabelChart.PositiveNegativeColor("#P_COLOR", "#N_COLOR");

    LabelChart.Icon icon =
        new LabelChart.Icon("SUM(col1)", "ICON_CODE");

    LabelChart.Annotation annotation =
        new LabelChart.Annotation("SUM(col1)", "2050년 까지 통계 지표");

    LabelChart.SecondaryIndicator secondaryIndicator =
        new LabelChart.SecondaryIndicator("SUM(col1)", "PERIOD", "MONTH", null,
                                          "INCREMENTAL", true);


    LabelChart chart = new LabelChart(valueNumberFormat(), "SMALL",
                                      "horizontal", "LINE", true,
                                      positiveNegativeColor, Lists.newArrayList(icon),
                                      Lists.newArrayList(annotation), Lists.newArrayList(secondaryIndicator));

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.getDefaultMapper().readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
