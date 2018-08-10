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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2016. 4. 18..
 */
public class LabelChartTest extends ChartTest {

  ObjectMapper objectMapper;

  @Before
  public void setUp() {
    objectMapper = new ObjectMapper();
    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
  }

  @Test
  public void de_serialize() throws JsonProcessingException {

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

    String labelChartStr = objectMapper.writeValueAsString(chart);

    System.out.println(labelChartStr);

    Chart deSerialized = GlobalObjectMapper.readValue(labelChartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
