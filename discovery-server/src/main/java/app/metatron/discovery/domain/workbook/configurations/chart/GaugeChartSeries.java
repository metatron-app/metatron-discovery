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

import app.metatron.discovery.common.entity.SearchParamValidator;

/**
 * Gauge Chart 시리즈 표현 방식 정의
 */
public class GaugeChartSeries implements ChartSeries {

  /**
   *  그래프 표현 방향(가로/세로)
   */
  Align align;

  public GaugeChartSeries() {
    // Empty Constructor
  }

  @JsonCreator
  public GaugeChartSeries(@JsonProperty("align") String align) {
    this.align = SearchParamValidator.enumUpperValue(Align.class, align, "align");
  }

  public Align getAlign() {
    return align;
  }

  public void setAlign(Align align) {
    this.align = align;
  }

  public enum Align {
    HORIZONTAL,   // 가로 막대
    VERTICAL      // 세로 막대
  }

  @Override
  public String toString() {
    return "GaugeChartSeries{" +
        "align=" + align +
        '}';
  }
}
