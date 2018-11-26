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
 * Scatter Chart 스타일 정의
 */
@JsonTypeName("scatter")
public class ScatterChart extends Chart {

  /**
   *
   */
  PointShape pointShape;

  /**
   *
   */
  PointSize pointSize;

  /**
   *
   */
  Integer pointTransparency;

  /**
   * X 축 설정
   */
  ChartAxis xAxis;

  /**
   * Y 축 설정
   */
  ChartAxis yAxis;

  public ScatterChart() {
    // Empty Constructor
  }

  @JsonCreator
  public ScatterChart(@JsonProperty("color") ChartColor color,
                      @JsonProperty("valueFormat") FieldFormat valueFormat,
                      @JsonProperty("legend") ChartLegend legend,
                      @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                      @JsonProperty("fontSize") String fontSize,
                      @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                      @JsonProperty("toolTip") ChartToolTip toolTip,
                      @JsonProperty("limit") Integer limit,
                      @JsonProperty("pointShape") String pointShape,
                      @JsonProperty("pointSize") String pointSize,
                      @JsonProperty("pointTransparency") Integer pointTransparency,
                      @JsonProperty("xAxis") ChartAxis xAxis,
                      @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.pointShape = EnumUtils.getUpperCaseEnum(PointShape.class, pointShape, PointShape.CIRCLE);
    this.pointSize = EnumUtils.getUpperCaseEnum(PointSize.class, pointSize, PointSize.NORMAL);
    this.pointTransparency = pointTransparency;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public PointShape getPointShape() {
    return pointShape;
  }

  public PointSize getPointSize() {
    return pointSize;
  }

  public Integer getPointTransparency() {
    return pointTransparency;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "ScatterChart{" +
        "pointShape=" + pointShape +
        ", pointSize=" + pointSize +
        ", pointTransparency=" + pointTransparency +
        ", xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }

  public enum PointSize {
    NORMAL,          // 보통
    SMALL,           // 작게
    LARGE,           // 크게
    XLARGE           // 매우 크게
  }

  public enum PointShape {
    CIRCLE,       // 원
    RECT,         // 사각형(네모)
    TRIANGLE,     // 삼각형(세모)
    DIAMOND,      // 마름모(다이아몬드)
    PIN,          // 십자
    ARROW         // 액스
  }
}
