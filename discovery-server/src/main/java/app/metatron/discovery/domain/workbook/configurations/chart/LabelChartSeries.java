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

import java.io.Serializable;

import app.metatron.discovery.util.EnumUtils;

/**
 * Created by kyungtaak on 2016. 6. 2..
 */
public class LabelChartSeries implements Serializable {

  /**
   * 시리즈 이름
   */
  String name;

  /**
   * 측정값 별 라벨 표시 옵션
   */
  Boolean showLabel;

  /**
   * ICON 설정 (별도 UI 상 ICON Alias 명 따름, null 인 경우 숨기기) <br/>
   * 별도 지정없이 UI 상에서 지정된 상수값을 활용
   */
  String iconType;

  /**
   * 측정값 별 Icon 표시 옵션
   */
  Boolean showIcon;

  /**
   * 지표 텍스트 추가
   */
  TextOption textOption;

  /**
   * 보조 지표
   */
  SecondaryDisplay secondary;

  /**
   * 시리즈 스타일
   */
  Style style;

  public LabelChartSeries() {
    // Empty Constructor
  }

  @JsonCreator
  public LabelChartSeries(
      @JsonProperty("name") String name,
      @JsonProperty("showLabel") Boolean showLabel,
      @JsonProperty("iconType") String iconType,
      @JsonProperty("showIcon") Boolean showIcon,
      @JsonProperty("textOption") TextOption textOption,
      @JsonProperty("secondary") SecondaryDisplay secondary,
      @JsonProperty("style") String style
      ) {
    this.name = name;
    this.showLabel = showLabel;
    this.iconType = iconType;
    this.showIcon = showIcon;
    this.textOption = textOption;
    this.secondary = secondary;
    this.style = EnumUtils.getUpperCaseEnum(Style.class, style, Style.LINE);
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Boolean getShowLabel() {
    return showLabel;
  }

  public void setShowLabel(Boolean showLabel) {
    this.showLabel = showLabel;
  }

  public String getIconType() {
    return iconType;
  }

  public void setIconType(String iconType) {
    this.iconType = iconType;
  }

  public Boolean getShowIcon() {
    return showIcon;
  }

  public void setShowIcon(Boolean showIcon) {
    this.showIcon = showIcon;
  }

  public LabelChartSeries(Boolean showIcon) {
    this.showIcon = showIcon;
  }

  public TextOption getTextOption() {
    return textOption;
  }

  public void setTextOption(TextOption textOption) {
    this.textOption = textOption;
  }

  public Style getStyle() {
    return style;
  }

  public void setStyle(Style style) {
    this.style = style;
  }

  @Override
  public String toString() {
    return "LabelChartSeries{" +
        "name='" + name + '\'' +
        ", showLabel=" + showLabel +
        ", iconType='" + iconType + '\'' +
        ", textOption=" + textOption +
        ", style=" + style +
        '}';
  }

  public static class SecondaryDisplay implements Serializable {

    SecondaryDisplayType type;

    Period period;

    Number value;

    SecondaryMarkType mark;

    Boolean emphasized;

    @JsonCreator
    public SecondaryDisplay (
        @JsonProperty("type") String type,
        @JsonProperty("period") String period,
        @JsonProperty("value") Number value,
        @JsonProperty("mark") String mark,
        @JsonProperty("emphasized") Boolean emphasized) {
      this.type = EnumUtils.getUpperCaseEnum(SecondaryDisplayType.class, type, SecondaryDisplayType.NONE);
      this.period = EnumUtils.getUpperCaseEnum(Period.class, period);
      this.value = value;
      this.mark = EnumUtils.getUpperCaseEnum(SecondaryMarkType.class, mark, SecondaryMarkType.INCREMENTAL);
      this.emphasized = emphasized;
    }

    public SecondaryDisplayType getType() {
      return type;
    }

    public void setType(SecondaryDisplayType type) {
      this.type = type;
    }

    public Period getPeriod() {
      return period;
    }

    public void setPeriod(Period period) {
      this.period = period;
    }

    public Number getValue() {
      return value;
    }

    public void setValue(Number value) {
      this.value = value;
    }

    public SecondaryMarkType getMark() {
      return mark;
    }

    public void setMark(SecondaryMarkType mark) {
      this.mark = mark;
    }

    public Boolean getEmphasized() {
      return emphasized;
    }

    public void setEmphasized(Boolean emphasized) {
      this.emphasized = emphasized;
    }

    @Override
    public String toString() {
      return "SecondaryDisplay{" +
          "type=" + type +
          ", period=" + period +
          ", value=" + value +
          ", mark=" + mark +
          ", emphasized=" + emphasized +
          '}';
    }
  }

  public static class TextOption implements Serializable {

    TextLocation location;

    String text;

    @JsonCreator
    public TextOption(
        @JsonProperty("location") String location,
        @JsonProperty("text") String text) {
      this.text = text;
      this.location = EnumUtils.getUpperCaseEnum(TextLocation.class, location, TextLocation.HIDDEN);
    }

    public TextOption() {
    }

    public TextLocation getLocation() {
      return location;
    }

    public void setLocation(TextLocation location) {
      this.location = location;
    }

    public String getText() {
      return text;
    }

    public void setText(String text) {
      this.text = text;
    }

    @Override
    public String toString() {
      return "TextOption{" +
          "location=" + location +
          ", text='" + text + '\'' +
          '}';
    }
  }

  public enum SecondaryMarkType {
    PERCENTAGE,  // 퍼센티지
    INCREMENTAL  // 증감분
  }

  public enum TextLocation {
    HIDDEN,     // 숨김
    BEFORE,     // 앞에 표시
    AFTER       // 뒤에 표시
  }

  public enum Style {
    LINE,
    SOLID,
  }

  public enum SecondaryDisplayType {
    NONE,
    PERIOD,
    STANDARD
  }

  public enum Period {
    HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
  }

  public enum AdditionalChartAlign {
    HORIZONTAL,   // 가로
    VERTICAL      // 세로
  }
}
