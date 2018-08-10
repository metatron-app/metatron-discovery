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
 * Line Chart 스타일 정의
 */
@JsonTypeName("line")
public class LineChart extends Chart {

  /**
   * 선형/면적형  여부
   */
  MarkType mark;

  /**
   * 라인/포인트 여부
   */
  LineStyle lineStyle;

  /**
   * 라인 곡선 스타일
   */
  LineCurveStyle curveStyle;


  /**
   * 기본형, 누적형
   */
  LineMode lineMode;

  /**
   * 선 굵기
   */
  LineThickness lineThickness;

  /**
   * X 축 설정
   */
  ChartAxis xAxis;

  /**
   * Y 축 설정
   */
  ChartAxis yAxis;

  public LineChart() {
    // Empty Constructor
  }

  @JsonCreator
  public LineChart(@JsonProperty("color") ChartColor color,
                   @JsonProperty("valueFormat") FieldFormat valueFormat,
                   @JsonProperty("legend") ChartLegend legend,
                   @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                   @JsonProperty("fontSize") String fontSize,
                   @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                   @JsonProperty("toolTip") ChartToolTip toolTip,
                   @JsonProperty("mark") String mark,
                   @JsonProperty("lineStyle") String lineStyle,
                   @JsonProperty("curveStyle") String curveStyle,
                   @JsonProperty("lineMode") String lineMode,
                   @JsonProperty("lineThickness") String lineThickness,
                   @JsonProperty("xAxis") ChartAxis xAxis,
                   @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip);
    this.mark = EnumUtils.getUpperCaseEnum(MarkType.class, mark, MarkType.LINE);
    this.lineStyle = EnumUtils.getUpperCaseEnum(LineStyle.class, lineStyle, LineStyle.POINT_LINE);
    this.curveStyle = EnumUtils.getUpperCaseEnum(LineCurveStyle.class, curveStyle, LineCurveStyle.STRAIGHT);
    this.lineMode = EnumUtils.getUpperCaseEnum(LineMode.class, lineMode, LineMode.NORMAL);
    this.lineThickness = EnumUtils.getUpperCaseEnum(LineThickness.class, lineThickness, LineThickness.MEDIUM);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public MarkType getMark() {
    return mark;
  }

  public LineStyle getLineStyle() {
    return lineStyle;
  }

  public LineCurveStyle getCurveStyle() {
    return curveStyle;
  }

  public LineMode getLineMode() {
    return lineMode;
  }

  public LineThickness getLineThickness() {
    return lineThickness;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "LineChart{" +
        "mark=" + mark +
        ", lineStyle=" + lineStyle +
        ", curveStyle=" + curveStyle +
        ", lineMode=" + lineMode +
        ", xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }

  public enum MarkType {
    LINE,       // 라인 표시
    AREA        // 면적 표시
  }

  public enum LineStyle {
    POINT_LINE,   // 포인트 라인 혼합
    POINT,        // 포인트만 표시
    LINE          // 라인만 표시
  }

  public enum LineCurveStyle {
    STRAIGHT,             // Straight line
    SMOOTH                // Bezier curves
  }

  public enum LineMode {
    NORMAL,             // 기본
    CUMULATIVE          // 누계
  }

  public enum LineThickness {
    MEDIUM,                // 중간
    THIN,                  // 얇게
    THICK                  // 두껍게
  }
}
