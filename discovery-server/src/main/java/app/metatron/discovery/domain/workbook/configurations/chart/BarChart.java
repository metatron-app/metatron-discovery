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

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Bar Chart 스타일 정의
 */
@JsonTypeName("bar")
public class BarChart extends Chart {

  /**
   * 차트 유형 : 그래프 내 시리즈 표현 방식(병렬/중첩)
   */
  MarkType mark;

  /**
   * 차트 유형 : 그래프 표현 방향(가로/세로)
   */
  Align align;

  /**
   * X 축 설정
   */
  ChartAxis xAxis;

  /**
   * Y 축 설정
   */
  ChartAxis yAxis;

  public BarChart() {
    // Empty Constructor
  }

  @JsonCreator
  public BarChart(@JsonProperty("color") ChartColor color,
                  @JsonProperty("valueFormat") FieldFormat valueFormat,
                  @JsonProperty("legend") ChartLegend legend,
                  @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                  @JsonProperty("fontSize") String fontSize,
                  @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                  @JsonProperty("toolTip") ChartToolTip toolTip,
                  @JsonProperty("limit") Integer limit,
                  @JsonProperty("mark") String mark,
                  @JsonProperty("align") String align,
                  @JsonProperty("xAxis") ChartAxis xAxis,
                  @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.mark = EnumUtils.getUpperCaseEnum(MarkType.class, mark, MarkType.MULTIPLE);
    this.align = EnumUtils.getUpperCaseEnum(Align.class, align, Align.HORIZONTAL);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public MarkType getMark() {
    return mark;
  }

  public Align getAlign() {
    return align;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "BarChart{" +
        "mark=" + mark +
        ", align=" + align +
        ", xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }

  public enum MarkType {
    MULTIPLE, // 병렬
    STACKED   // 중첩
  }

  public enum Align {
    HORIZONTAL,   // 가로 막대
    VERTICAL      // 세로 막대
  }
}
