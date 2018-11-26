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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Combine Chart 스타일 정의
 */
@JsonTypeName("combine")
public class CombineChart extends Chart {

  /**
   * Bar Chart 표시 방식
   */
  BarMarkType barMarkType;

  /**
   * Line Chart 표시 방식
   */
  LineMarkType lineMarkType;

  /**
   * X 축 설정
   */
  ChartAxis xAxis;

  /**
   * Y 축 설정
   */
  ChartAxis yAxis;


  public CombineChart() {
    // Empty Constructor
  }

  public CombineChart(@JsonProperty("color") ChartColor color,
                      @JsonProperty("valueFormat") FieldFormat valueFormat,
                      @JsonProperty("legend") ChartLegend legend,
                      @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                      @JsonProperty("fontSize") String fontSize,
                      @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                      @JsonProperty("toolTip") ChartToolTip toolTip,
                      @JsonProperty("limit") Integer limit,
                      @JsonProperty("barMarkType") String barMarkType,
                      @JsonProperty("lineMarkType") String lineMarkType,
                      @JsonProperty("xAxis") ChartAxis xAxis,
                      @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.barMarkType = EnumUtils.getUpperCaseEnum(BarMarkType.class, barMarkType, BarMarkType.MULTIPLE);
    this.lineMarkType = EnumUtils.getUpperCaseEnum(LineMarkType.class, lineMarkType,LineMarkType.LINE);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public BarMarkType getBarMarkType() {
    return barMarkType;
  }

  public LineMarkType getLineMarkType() {
    return lineMarkType;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "CombineChart{" +
        "barMarkType=" + barMarkType +
        ", lineMarkType=" + lineMarkType +
        "} " + super.toString();
  }

  public enum BarMarkType {
    MULTIPLE, // 병렬
    STACKED   // 중첩
  }

  public enum LineMarkType {
    LINE,       // 라인 표시
    AREA        // 면적 표시
  }
}
