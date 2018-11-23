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

/**
 * Gauge Chart 스타일 정의
 */
@JsonTypeName("gauge")
public class GaugeChart extends Chart {

  ChartAxis xAxis;

  ChartAxis yAxis;

  public GaugeChart() {
    // Empty Constructor
  }

  @JsonCreator
  public GaugeChart(@JsonProperty("color") ChartColor color,
                    @JsonProperty("valueFormat") FieldFormat valueFormat,
                    @JsonProperty("legend") ChartLegend legend,
                    @JsonProperty("chartZooms") List<ChartZoom> chartZooms,
                    @JsonProperty("fontSize") String fontSize,
                    @JsonProperty("dataLabel") ChartDataLabel dataLabel,
                    @JsonProperty("toolTip") ChartToolTip toolTip,
                    @JsonProperty("limit") Integer limit,
                    @JsonProperty("xAxis") ChartAxis xAxis,
                    @JsonProperty("yAxis") ChartAxis yAxis) {
    super(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, limit);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }

  public ChartAxis getxAxis() {
    return xAxis;
  }

  public ChartAxis getyAxis() {
    return yAxis;
  }

  @Override
  public String toString() {
    return "GaugeChart{" +
        "xAxis=" + xAxis +
        ", yAxis=" + yAxis +
        "} " + super.toString();
  }
}
