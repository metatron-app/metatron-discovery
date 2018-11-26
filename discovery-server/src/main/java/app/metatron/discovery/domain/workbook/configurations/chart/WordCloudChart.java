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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

/**
 * Wordcloud Chart 스타일 정의
 */
@JsonTypeName("wordcloud")
public class WordCloudChart extends Chart {

  public WordCloudChart() {
    // Empty Constructor
  }

  @JsonCreator
  public WordCloudChart(@JsonProperty("color") ChartColor color,
                        @JsonProperty("limit") Integer limit) {
    super.color = color;
    super.limit = limit;
  }

}
