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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.FontSize;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Chart 스타일 정의 (색상, 크기는 공통 정의)
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = BarChart.class, name = "bar"),
    @JsonSubTypes.Type(value = GridChart.class, name = "grid"),
    @JsonSubTypes.Type(value = LineChart.class, name = "line"),
    @JsonSubTypes.Type(value = ScatterChart.class, name = "scatter"),
    @JsonSubTypes.Type(value = HeatMapChart.class, name = "heatmap"),
    @JsonSubTypes.Type(value = PieChart.class, name = "pie"),
    @JsonSubTypes.Type(value = LabelChart.class, name = "label"),
    @JsonSubTypes.Type(value = MapChart.class, name = "map"),
    @JsonSubTypes.Type(value = BoxplotChart.class, name = "boxplot"),
    @JsonSubTypes.Type(value = WaterFallChart.class, name = "waterfall"),
    @JsonSubTypes.Type(value = WordCloudChart.class, name = "wordcloud"),
    @JsonSubTypes.Type(value = TreeMapChart.class, name = "treemap"),
    @JsonSubTypes.Type(value = CombineChart.class, name = "combine"),
    @JsonSubTypes.Type(value = RadarChart.class, name = "radar"),
    @JsonSubTypes.Type(value = NetworkChart.class, name = "network"),
    @JsonSubTypes.Type(value = SankeyChart.class, name = "sankey"),
    @JsonSubTypes.Type(value = GaugeChart.class, name = "gauge")
})
public abstract class Chart implements Serializable {

  /**
   * 색상
   */
  ChartColor color;

  /**
   * 기본 데이터 포맷
   */
  FieldFormat valueFormat;

  /**
   *  범례 제목&레이블 / X,Y축 제목&레이블 / 데이터 레이블 / 차트 분리시의 표시 레이블 적용
   */
  FontSize fontSize;

  /**
   * 축 범위 정보
   */
  ChartLegend legend;

  /**
   * 스크롤 위치
   */
  List<ChartZoom> chartZooms;

  /**
   * 데이터 레이블 설정
   */
  ChartDataLabel dataLabel;

  /**
   * 툴팁 설정
   */
  ChartToolTip toolTip;

  /**
   * Limitation value of category
   */
  Integer limit;

  public Chart() {
  }

  public Chart(ChartColor color,
               FieldFormat valueFormat,
               ChartLegend legend,
               List<ChartZoom> chartZooms,
               String fontSize,
               ChartDataLabel dataLabel,
               ChartToolTip toolTip) {
    this(color, valueFormat, legend, chartZooms, fontSize, dataLabel, toolTip, null);
  }

  public Chart(ChartColor color,
               FieldFormat valueFormat,
               ChartLegend legend,
               List<ChartZoom> chartZooms,
               String fontSize,
               ChartDataLabel dataLabel,
               ChartToolTip toolTip,
               Integer limit) {
    this.color = color;
    this.valueFormat = valueFormat;
    this.legend = legend;
    this.chartZooms = chartZooms;
    this.fontSize = EnumUtils.getUpperCaseEnum(FontSize.class, fontSize, FontSize.NORMAL);
    this.dataLabel = dataLabel;
    this.toolTip = toolTip;
    this.limit = limit;
  }

  public ChartColor getColor() {
    return color;
  }

  public ChartLegend getLegend() {
    return legend;
  }

  public List<ChartZoom> getChartZooms() {
    return chartZooms;
  }

  public FieldFormat getValueFormat() {
    return valueFormat;
  }

  public FontSize getFontSize() {
    return fontSize;
  }

  public ChartDataLabel getDataLabel() {
    return dataLabel;
  }

  public ChartToolTip getToolTip() {
    return toolTip;
  }

  public Integer getLimit() {
    return limit;
  }

  @Override
  public String toString() {
    return "Chart{" +
        "color=" + color +
        ", valueFormat=" + valueFormat +
        ", fontSize=" + fontSize +
        ", legend=" + legend +
        ", chartZooms=" + chartZooms +
        ", dataLabel=" + dataLabel +
        ", toolTip=" + toolTip +
        '}';
  }
}
