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

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.FontSize;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.HAlign;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.VAlign;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Grid 스타일 정의
 */
@JsonTypeName("grid")
public class GridChart extends Chart {

  /**
   * 표현 데이터 타입
   */
  DataType dataType;

  /**
   * 'PIVOT' 모드일때, 측정값 표현 방식
   */
  MeasureLayout measureLayout;

  /**
   * 헤더 스타일
   */
  ValueStyle headerStyle;

  /**
   * 본문 스타일
   */
  ValueStyle contentStyle;

  /**
   * 연산행 설정
   *
   */
  TotalValueStyle totalValueStyle;

  /**
   * Grid 설명 추가
   */
  Annotation annotation;

  public GridChart() {
    // Empty Constructor
  }

  @JsonCreator
  public GridChart(@JsonProperty("color") ChartColor color,
                   @JsonProperty("valueFormat") FieldFormat valueFormat,
                   @JsonProperty("limit") Integer limit,
                   @JsonProperty("dataType") String dataType,
                   @JsonProperty("measureLayout") String measureLayout,
                   @JsonProperty("headerStyle") ValueStyle headerStyle,
                   @JsonProperty("contentStyle") ValueStyle contentStyle,
                   @JsonProperty("totalValueStyle") TotalValueStyle totalValueStyle,
                   @JsonProperty("annotation") Annotation annotation) {
    super(color, valueFormat, null, null, null, null, null, limit);
    this.dataType = EnumUtils.getUpperCaseEnum(DataType.class, dataType, DataType.PIVOT);
    this.measureLayout = EnumUtils.getUpperCaseEnum(MeasureLayout.class, measureLayout, MeasureLayout.HORIZONTAL);
    this.headerStyle = headerStyle;
    this.contentStyle = contentStyle;
    this.totalValueStyle = totalValueStyle;
    this.annotation = annotation;
  }

  public DataType getDataType() {
    return dataType;
  }

  public MeasureLayout getMeasureLayout() {
    return measureLayout;
  }

  public ValueStyle getHeaderStyle() {
    return headerStyle;
  }

  public ValueStyle getContentStyle() {
    return contentStyle;
  }

  public TotalValueStyle getTotalValueStyle() {
    return totalValueStyle;
  }

  public Annotation getAnnotation() {
    return annotation;
  }

  @Override
  public String toString() {
    return "GridChart{" +
        "dataType=" + dataType +
        ", measureLayout=" + measureLayout +
        ", headerStyle=" + headerStyle +
        ", contentStyle=" + contentStyle +
        ", annotation=" + annotation +
        ", color=" + color +
        "} ";
  }

  /**
   * Grid 라벨(설명 추가)
   */
  public static class Annotation implements Serializable {

    /**
     *
     */
    String label;

    /**
     *
     */
    AnnotationPosition pos;

    public Annotation() {
    }

    @JsonCreator
    public Annotation(@JsonProperty("label") String label,
                      @JsonProperty("pos") String pos) {
      this.label = label;
      this.pos = EnumUtils.getUpperCaseEnum(AnnotationPosition.class, pos, AnnotationPosition.TOP_LEFT);
    }

    public String getLabel() {
      return label;
    }

    public AnnotationPosition getPos() {
      return pos;
    }

    @Override
    public String toString() {
      return "Label{" +
          "label='" + label + '\'' +
          ", pos=" + pos +
          '}';
    }
  }

  public static class ValueStyle implements Serializable {

    Boolean showHeader;

    HAlign hAlign;

    VAlign vAlign;

    FontSize fontSize;

    String fontColor;

    List<FontStyle> fontStyles;

    String backgroudColor;

    public ValueStyle() {
    }

    @JsonCreator
    public ValueStyle(@JsonProperty("showHeader") Boolean showHeader,
                      @JsonProperty("hAlign") String hAlign,
                      @JsonProperty("vAlign") String vAlign,
                      @JsonProperty("fontSize") String fontSize,
                      @JsonProperty("fontColor") String fontColor,
                      @JsonProperty("fontStyles") List<String> fontStyles,
                      @JsonProperty("backgroudColor") String backgroudColor) {
      this.showHeader = showHeader;
      this.hAlign = EnumUtils.getUpperCaseEnum(HAlign.class, hAlign, HAlign.LEFT);
      this.vAlign = EnumUtils.getUpperCaseEnum(VAlign.class, vAlign, VAlign.CENTER);
      this.fontSize = EnumUtils.getUpperCaseEnum(FontSize.class, fontSize, FontSize.NORMAL);
      this.fontColor = fontColor;
      if (fontStyles != null) {
        this.fontStyles = Lists.newArrayList();
        for (String fontStyle : fontStyles) {
          FontStyle style = EnumUtils.getUpperCaseEnum(FontStyle.class, fontStyle);
          if (style != null) {
            this.fontStyles.add(style);
          }
        }
      }
      this.backgroudColor = backgroudColor;
    }

    public Boolean getShowHeader() {
      return showHeader;
    }

    public HAlign gethAlign() {
      return hAlign;
    }

    public VAlign getvAlign() {
      return vAlign;
    }

    public FontSize getFontSize() {
      return fontSize;
    }

    public String getFontColor() {
      return fontColor;
    }

    public List<FontStyle> getFontStyles() {
      return fontStyles;
    }

    public String getBackgroudColor() {
      return backgroudColor;
    }

    @Override
    public String toString() {
      return "ValueStyle{" +
          "showHeader=" + showHeader +
          ", hAlign=" + hAlign +
          ", vAlign=" + vAlign +
          ", fontSize=" + fontSize +
          ", fontColor='" + fontColor + '\'' +
          ", fontStyles=" + fontStyles +
          ", backgroudColor='" + backgroudColor + '\'' +
          '}';
    }
  }

  /**
   * 연산행 설정
   */
  public static class TotalValueStyle extends ValueStyle implements Serializable {

    /**
     * 연산행 Label
     */
    String label;

    /**
     * 연산행 집계 타입
     */
    AggregationType aggregationType;

    public TotalValueStyle() {
    }

    @JsonCreator
    public TotalValueStyle(@JsonProperty("label") String label,
                                @JsonProperty("aggregationType") String aggregationType,
                                @JsonProperty("hAlign") String hAlign,
                                @JsonProperty("vAlign") String vAlign,
                                @JsonProperty("fontSize") String fontSize,
                                @JsonProperty("fontColor") String fontColor,
                                @JsonProperty("fontStyles") List<String> fontStyles,
                                @JsonProperty("backgroudColor") String backgroudColor) {
      super(null, hAlign, vAlign, fontSize, fontColor, fontStyles, backgroudColor);
      this.label = label;
      this.aggregationType = EnumUtils.getUpperCaseEnum(AggregationType.class, aggregationType, AggregationType.SUM);
    }

    public String getLabel() {
      return label;
    }

    public AggregationType getAggregationType() {
      return aggregationType;
    }

    @Override
    public String toString() {
      return "ExpressionValueStyle{" +
          "label='" + label + '\'' +
          ", aggregationType=" + aggregationType +
          "} " + super.toString();
    }
  }

  public enum FontStyle {
    BOLD,             // 굵게
    ITALIC,           // 기울임
    UNDER_LINE,       // 언더라인 표시
  }

  public enum DataType {
    PIVOT,  // 피봇보기
    MASTER  // 원본데이터보기
  }

  public enum MeasureLayout {
    VERTICAL,  // 세로형
    HORIZONTAL  // 가로형
  }

  public enum AnnotationPosition {
    TOP_RIGHT,
    TOP_LEFT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT
  }

  public enum AggregationType {
    SUM,
    AVG,
    MIN,
    MAX
  }

}
