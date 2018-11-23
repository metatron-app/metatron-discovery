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

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineThickness;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * WaterFall Chart 스타일 정의
 */
@JsonTypeName("waterfall")
public class WaterFallChart extends Chart {

  /**
   * Size of Waterfall bar
   */
  Integer barSize;

  /**
   * Color of bar
   */
  BarColor barColor;

  /**
   * Guide line between bars
   */
  GuideLine guideLine;

  /**
   * X Axis
   */
  ChartAxis xAxis;

  /**
   * Y Axis
   */
  ChartAxis yAxis;

  public WaterFallChart() {
    // Empty Constructor
  }

  @JsonCreator
  public WaterFallChart(@JsonProperty("color") ChartColor color,
                        @JsonProperty("valueFormat") FieldFormat valueFormat,
                        @JsonProperty("legend") ChartLegend legend,
                        @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                        @JsonProperty("fontSize") String fontSize,
                        @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                        @JsonProperty("toolTip") ChartToolTip toolTip,
                        @JsonProperty("limit") Integer limit,
                        @JsonProperty("barSize") Integer barSize,
                        @JsonProperty("barColor") BarColor barColor,
                        @JsonProperty("guideLine") GuideLine guideLine,
                        @JsonProperty("xAxis") ChartAxis xAxis,
                        @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.barSize = barSize;
    this.barColor = barColor;
    this.guideLine = guideLine;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public Integer getBarSize() {
    return barSize;
  }

  public BarColor getBarColor() {
    return barColor;
  }

  public GuideLine getGuideLine() {
    return guideLine;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "WaterFallChart{" +
        "barSize=" + barSize +
        ", barColor=" + barColor +
        ", guideLine=" + guideLine +
        ", xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }

  public static class BarColor implements Serializable {
    /**
     * color of negative bar
     */
    String negative;

    /**
     * color of positive bar
     */
    String positive;

    @JsonCreator
    public BarColor(@JsonProperty("negative") String negative,
                    @JsonProperty("positive") String positive) {
      this.negative = negative;
      this.positive = positive;
    }

    public String getNegative() {
      return negative;
    }

    public String getPositive() {
      return positive;
    }

    @Override
    public String toString() {
      return "BarColor{" +
          "negative='" + negative + '\'' +
          ", positive='" + positive + '\'' +
          '}';
    }
  }

  public static class GuideLine implements Serializable {

    /**
     * color of line
     */
    String color;

    /**
     * thickness of line
     */
    LineThickness thickness;

    @JsonCreator
    public GuideLine(@JsonProperty("color") String color,
                     @JsonProperty("thickness") String thickness) {
      this.color = color;
      this.thickness = EnumUtils.getUpperCaseEnum(LineThickness.class, thickness, LineThickness.NORMAL);
    }

    public String getColor() {
      return color;
    }

    public LineThickness getThickness() {
      return thickness;
    }

    @Override
    public String toString() {
      return "GuideLine{" +
          "color='" + color + '\'' +
          ", thickness=" + thickness +
          '}';
    }
  }

}
