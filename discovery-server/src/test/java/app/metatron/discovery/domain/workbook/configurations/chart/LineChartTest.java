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

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2016. 4. 18..
 */
public class LineChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void serialize() throws JsonProcessingException {

    // 범례
    //
    ChartLegend legend = new ChartLegend();

    ChartAxis xAxis = new ChartAxis(true, "test", true, null, null, null);
    ChartAxis yAxis = new ChartAxis(true, null, true, null, null, null);

    LineChart chart = new LineChart(colorByMeasureForGradient(), null, legend, null, fontLargerSize(), null, null,
                                    LineChart.MarkType.LINE.name(),
                                    LineChart.LineStyle.POINT_LINE.name(),
                                    LineChart.LineCurveStyle.SMOOTH.name(),
                                    LineChart.LineMode.CUMULATIVE.name(),
                                    LineChart.LineThickness.THIN.name(),
                                    xAxis, yAxis);

    System.out.println(GlobalObjectMapper.writeValueAsString(chart));

  }

  @Test
  public void deserialize() throws IOException {

    String chartSpec = "{\n" +
        "  \"type\": \"waterfall\",\n" +
        "  \"color\": {\n" +
        "    \"type\": \"measure\",\n" +
        "    \"ranges\": [\n" +
        "      {\n" +
        "        \"gt\": 0,\n" +
        "        \"lte\": 20,\n" +
        "        \"color\": \"#FFFFFF\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"gt\": 21.0,\n" +
        "        \"lte\": 203.12,\n" +
        "        \"color\": \"#FFFFFD\"\n" +
        "      }\n" +
        "    ]\n" +
        "  },\n" +
        "  \"legend\": {},\n" +
        "  \"xAxis\": {\n" +
        "    \"showName\": true,\n" +
        "    \"customName\": \"test\",\n" +
        "    \"showLabel\": true\n" +
        "  },\n" +
        "  \"yAxis\": {\n" +
        "    \"showName\": true,\n" +
        "    \"showLabel\": true\n" +
        "  }\n" +
        "}";

    Chart chart = GlobalObjectMapper.readValue(chartSpec, Chart.class);

    System.out.println("ToString Result - \n" + ToStringBuilder.reflectionToString(chart, ToStringStyle.MULTI_LINE_STYLE));
  }

}
