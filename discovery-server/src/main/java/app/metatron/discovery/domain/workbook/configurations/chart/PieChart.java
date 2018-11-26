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
 * Pie Chart Spec.
 */
@JsonTypeName("pie")
public class PieChart extends Chart {

  /**
   * Type of pic shape
   */
  MarkType markType;

  /**
   * Chart layout for splited display
   */
  SplitLayout splitLayout;

  /**
   * Count of maximum categories
   */
  Integer maxCategory;

  public PieChart() {
    // Empty Constructor
  }

  @JsonCreator
  public PieChart(@JsonProperty("color") ChartColor color,
                  @JsonProperty("valueFormat") FieldFormat valueFormat,
                  @JsonProperty("legend") ChartLegend legend,
                  @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                  @JsonProperty("fontSize") String fontSize,
                  @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                  @JsonProperty("toolTip") ChartToolTip toolTip,
                  @JsonProperty("limit") Integer limit,
                  @JsonProperty("markType") String markType,
                  @JsonProperty("layout") String splitLayout,
                  @JsonProperty("maxCategory") Integer maxCategory) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.markType = EnumUtils.getUpperCaseEnum(MarkType.class, markType, MarkType.SECTOR);
    this.splitLayout = EnumUtils.getUpperCaseEnum(SplitLayout.class, splitLayout, SplitLayout.VERTICAL);
    this.maxCategory = maxCategory;
  }

  public MarkType getMarkType() {
    return markType;
  }

  public SplitLayout getSplitLayout() {
    return splitLayout;
  }

  public Integer getMaxCategory() {
    return maxCategory;
  }

  @Override
  public String toString() {
    return "PieChart{" +
        "markType=" + markType +
        ", splitLayout=" + splitLayout +
        ", maxCategory=" + maxCategory +
        "} " + super.toString();
  }

  public enum MarkType {
    SECTOR,   // Circular sector
    DONUT     // Donut
  }

  public enum SplitLayout {
    VERTICAL,
    HORIZONTAL
  }

}
