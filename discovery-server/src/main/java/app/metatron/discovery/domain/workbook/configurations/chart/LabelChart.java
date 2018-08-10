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

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 *
 */
@JsonTypeName("label")
public class LabelChart extends Chart {

  /**
   * Label Chart 표현 레이아웃 (가로 방향/세로 방향)
   */
  LayoutType layout;

  /**
   * Label 차트 표현 스타일
   */
  ChartStyle chartStyle;

  /**
   * 지표 제목 표시 여부, 기본값 true
   */
  Boolean showLabel;

  /**
   * 양수 음수 색상표시
   */
  PositiveNegativeColor positiveNegativeColor;

  /**
   * 시리즈별 그래픽 아이콘 지정
   */
  List<Icon> icons;

  /**
   * 시리즈별 설명 추가
   */
  List<Annotation> annotations;

  /**
   * 보조 지표
   */
  List<SecondaryIndicator> secondaryIndicators;

  public LabelChart() {
    // Empty Constructor
  }



  @JsonCreator
  public LabelChart(@JsonProperty("valueFormat") FieldFormat valueFormat,
                    @JsonProperty("fontSize") String fontSize,
                    @JsonProperty("layout") String layout,
                    @JsonProperty("chartStyle") String chartStyle,
                    @JsonProperty("showLabel") Boolean showLabel,
                    @JsonProperty("positiveNegativeColor") PositiveNegativeColor positiveNegativeColor,
                    @JsonProperty("icons") List<Icon> icons,
                    @JsonProperty("annotation") List<Annotation> annotations,
                    @JsonProperty("secondaryIndicators") List<SecondaryIndicator> secondaryIndicators) {
    super(null, valueFormat, null, null, fontSize, null, null);
    this.layout = EnumUtils.getUpperCaseEnum(LayoutType.class, layout, LayoutType.HORIZONTAL);
    this.chartStyle = EnumUtils.getUpperCaseEnum(ChartStyle.class, chartStyle, ChartStyle.LINE);
    this.showLabel = showLabel;
    this.positiveNegativeColor = positiveNegativeColor;
    this.icons = icons;
    this.annotations = annotations;
    this.secondaryIndicators = secondaryIndicators;
  }

  public LayoutType getLayout() {
    return layout;
  }

  public ChartStyle getChartStyle() {
    return chartStyle;
  }

  public Boolean getShowLabel() {
    return showLabel;
  }

  public PositiveNegativeColor getPositiveNegativeColor() {
    return positiveNegativeColor;
  }

  public List<Icon> getIcons() {
    return icons;
  }

  public List<Annotation> getAnnotations() {
    return annotations;
  }

  public List<SecondaryIndicator> getSecondaryIndicators() {
    return secondaryIndicators;
  }

  @Override
  public String toString() {
    return "LabelChart{" +
        "layout=" + layout +
        ", chartStyle=" + chartStyle +
        ", showLabel=" + showLabel +
        ", positiveNegativeColor=" + positiveNegativeColor +
        ", icons='" + icons + '\'' +
        ", annotations=" + annotations +
        ", secondaryIndicators=" + secondaryIndicators +
        "} " + super.toString();
  }

  /**
   * 양수/음수 색상 지정
   */
  public static class PositiveNegativeColor implements Serializable {

    /**
     * 양수 색상
     */
    String positiveColor;

    /**
     * 음수 색상
     */
    String negativeColor;

    @JsonCreator
    public PositiveNegativeColor(@JsonProperty("positiveColor") String positiveColor,
                                 @JsonProperty("negativeColor") String negativeColor) {
      this.positiveColor = positiveColor;
      this.negativeColor = negativeColor;
    }

    public String getPositiveColor() {
      return positiveColor;
    }

    public String getNegativeColor() {
      return negativeColor;
    }

    @Override
    public String toString() {
      return "PositiveNegativeColor{" +
          "positiveColor='" + positiveColor + '\'' +
          ", negativeColor='" + negativeColor + '\'' +
          '}';
    }
  }

  /**
   * 설명 지정
   */
  public static class Annotation implements Serializable {
    /**
     * 대상 시리즈 명, Null 이면 전체
     */
    String seriesName;

    /**
     * 추가할 설명
     */
    String description;

    @JsonCreator
    public Annotation(@JsonProperty("seriesName") String seriesName,
                      @JsonProperty("description") String description) {
      this.seriesName = seriesName;
      this.description = description;
    }

    public String getSeriesName() {
      return seriesName;
    }

    public String getDescription() {
      return description;
    }

    @Override
    public String toString() {
      return "Annotation{" +
          "seriesName='" + seriesName + '\'' +
          ", description='" + description + '\'' +
          '}';
    }
  }

  /**
   *  Icon
   */
  public static class Icon implements Serializable {

    /**
     * 대상 시리즈 명, Null 이면 전체
     */
    String seriesName;

    /**
     * 아이콘 타입 코드
     */
    String iconType;

    @JsonCreator
    public Icon(@JsonProperty("seriesName") String seriesName,
                      @JsonProperty("iconType") String iconType) {
      this.seriesName = seriesName;
      this.iconType = iconType;
    }

    public String getSeriesName() {
      return seriesName;
    }

    public String getIconType() {
      return iconType;
    }

    @Override
    public String toString() {
      return "Icon{" +
          "seriesName='" + seriesName + '\'' +
          ", iconType='" + iconType + '\'' +
          '}';
    }
  }

  /**
   * 보조 지표
   */
  public static class SecondaryIndicator implements Serializable {

    /**
     * 대상 시리즈 명, Null 이면 전체
     */
    String seriesName;

    /**
     * 지표 유형 (비교기간 대비/목표치 대비)
     */
    IndicatorType indicatorType;

    /**
     * 비교 기간 대비 선택시, 비교 기간
     */
    RangeUnit rangeUnit;

    /**
     * 목표치 대비 선택시, 목표치
     */
    Number targetValue;

    /**
     * 표시 형식
     */
    SecondaryMarkType mark;

    /**
     * 강조 여부
     */
    Boolean emphasized;

    @JsonCreator
    public SecondaryIndicator(@JsonProperty("seriesName") String seriesName,
                              @JsonProperty("indicatorType") String indicatorType,
                              @JsonProperty("rangeUnit") String rangeUnit,
                              @JsonProperty("targetValue") Number targetValue,
                              @JsonProperty("mark") String mark,
                              @JsonProperty("emphasized") Boolean emphasized) {
      this.seriesName = seriesName;
      this.indicatorType = EnumUtils.getUpperCaseEnum(IndicatorType.class, indicatorType, IndicatorType.PERIOD);
      this.rangeUnit = EnumUtils.getUpperCaseEnum(RangeUnit.class, rangeUnit);
      this.targetValue = targetValue;
      this.mark = EnumUtils.getUpperCaseEnum(SecondaryMarkType.class, mark, SecondaryMarkType.INCREMENTAL);
      this.emphasized = emphasized;
    }

    public String getSeriesName() {
      return seriesName;
    }

    public IndicatorType getIndicatorType() {
      return indicatorType;
    }

    public RangeUnit getRangeUnit() {
      return rangeUnit;
    }

    public Number getTargetValue() {
      return targetValue;
    }

    public SecondaryMarkType getMark() {
      return mark;
    }

    public Boolean getEmphasized() {
      return emphasized;
    }

    @Override
    public String toString() {
      return "SecondaryDisplay{" +
          "seriesName='" + seriesName + '\'' +
          ", indicatorType=" + indicatorType +
          ", rangeUnit=" + rangeUnit +
          ", targetValue=" + targetValue +
          ", mark=" + mark +
          ", emphasized=" + emphasized +
          '}';
    }
  }

  public enum LayoutType {
    HORIZONTAL,   // 가로로 표시
    VERTICAL,     // 세로로 표시
  }

  public enum ChartStyle {
    LINE, SOLID
  }

  public enum SecondaryMarkType {
    PERCENTAGE,  // 퍼센티지
    INCREMENTAL  // 증감분
  }

  public enum IndicatorType {
    PERIOD,     // 비교기간 대비
    TARGET      // 목표치 대비
  }

  public enum RangeUnit {
    HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
  }

}
