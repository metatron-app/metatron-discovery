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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class WordCloudChartTest {

  ObjectMapper objectMapper;

  @Before
  public void setUp() {
    objectMapper = new ObjectMapper();
    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
  }

  @Test
  public void serialize() throws JsonProcessingException {

    // 색상
    ChartColor color = new ChartColorByDimension("12colors", "field1", null, null);

    WordCloudChart chart = new WordCloudChart(color);

    System.out.println(objectMapper.writeValueAsString(chart));
  }

  @Test
  public void deserialize() throws IOException {

    String chartSpec = "{\n" +
            "  \"type\" : \"wordcloud\",\n" +
            "  \"color\" : {\n" +
            "    \"type\" : \"dimension\",\n" +
            "    \"schema\" : \"12colors\",\n" +
            "    \"auto\" : true\n" +
            "  },\n" +
            "}";

    Chart chart = objectMapper.readValue(chartSpec, Chart.class);

    System.out.println("ToString Result - \n" + ToStringBuilder.reflectionToString(chart, ToStringStyle.MULTI_LINE_STYLE));
  }

}
