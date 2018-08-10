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

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.HAlign;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.VAlign;
import app.metatron.discovery.util.EnumUtils;

public class ChartDataLabel implements Serializable {

  /**
   * 표시 레이블 선택
   */
  List<ChartLabelDisplayType> displayTypes;

  /**
   * 표시 위치, combine 차트의 경우 막대 부분
   */
  Position pos;

  /**
   * 표시 위치, , combine 차트의 경우 라인 부분
   */
  Position secondaryPos;

  /**
   * 회전 가능 여부
   */
  Boolean enableRotation;

  /**
   * 차트 시리즈 바깥쪽에 표시
   */
  Boolean showOutside;

  /**
   * 가로 정렬, 히트맵 차트에서 사용
   */
  HAlign hAlign;

  /**
   * 세로 정렬, 히트맵 차트에서 사용
   */
  VAlign vAlign;

  /**
   * 텍스트 색상
   */
  String textColor;

  /**
   * 텍스트 배경 색상
   */
  String textBackgroundColor;

  /**
   * 텍스트 아웃라인 색상
   */
  String textOutlineColor;

  /**
   * 텍스트 정렬
   */
  TextAlign textAlign;

  /**
   * 기본 ValueFormat 사용 여부
   */
  Boolean useDefaultFormat;

  public ChartDataLabel() {
  }

  @JsonCreator
  public ChartDataLabel(@JsonProperty("displayTypes") List<String> displayTypes,
                        @JsonProperty("pos") String pos,
                        @JsonProperty("secondaryPos") String secondaryPos,
                        @JsonProperty("enableRotation") Boolean enableRotation,
                        @JsonProperty("showOutside") Boolean showOutside,
                        @JsonProperty("hAlign") String hAlign,
                        @JsonProperty("vAlign") String vAlign,
                        @JsonProperty("textColor") String textColor,
                        @JsonProperty("textBackgroundColor") String textBackgroundColor,
                        @JsonProperty("textOutlineColor") String textOutlineColor,
                        @JsonProperty("textAlign") String textAlign,
                        @JsonProperty("useDefaultFormat") Boolean useDefaultFormat) {

    if (displayTypes != null) {
      this.displayTypes = Lists.newArrayList();
      for (String displayType : displayTypes) {
        ChartLabelDisplayType type = EnumUtils.getUpperCaseEnum(ChartLabelDisplayType.class, displayType);
        if (type != null) {
          this.displayTypes.add(type);
        }
      }
    }
    this.pos = EnumUtils.getUpperCaseEnum(Position.class, pos);
    this.secondaryPos = EnumUtils.getUpperCaseEnum(Position.class, secondaryPos);
    this.enableRotation = enableRotation;
    this.showOutside = showOutside;
    this.hAlign = EnumUtils.getUpperCaseEnum(HAlign.class, hAlign);
    this.vAlign = EnumUtils.getUpperCaseEnum(VAlign.class, vAlign);
    this.textColor = textColor;
    this.textBackgroundColor = textBackgroundColor;
    this.textOutlineColor = textOutlineColor;
    this.textAlign = EnumUtils.getUpperCaseEnum(TextAlign.class, textAlign);
    this.useDefaultFormat = useDefaultFormat;
  }

  public List<ChartLabelDisplayType> getDisplayTypes() {
    return displayTypes;
  }

  public Position getPos() {
    return pos;
  }

  public Position getSecondaryPos() {
    return secondaryPos;
  }

  public Boolean getEnableRotation() {
    return enableRotation;
  }

  public Boolean getShowOutside() {
    return showOutside;
  }

  public HAlign gethAlign() {
    return hAlign;
  }

  public VAlign getvAlign() {
    return vAlign;
  }

  public String getTextColor() {
    return textColor;
  }

  public String getTextBackgroundColor() {
    return textBackgroundColor;
  }

  public String getTextOutlineColor() {
    return textOutlineColor;
  }

  public TextAlign getTextAlign() {
    return textAlign;
  }

  public Boolean getUseDefaultFormat() {
    return useDefaultFormat;
  }

  @Override
  public String toString() {
    return "ChartDataLabel{" +
        "displayTypes=" + displayTypes +
        ", pos=" + pos +
        ", enableRotation=" + enableRotation +
        ", textColor='" + textColor + '\'' +
        ", textBackgroundColor='" + textBackgroundColor + '\'' +
        ", textOutlineColor='" + textOutlineColor + '\'' +
        ", textAlign=" + textAlign +
        ", useDefaultFormat=" + useDefaultFormat +
        '}';
  }

  public enum Position {
    TOP, OUTSIDE_TOP, OUTSIDE_BOTTOM, INSIDE_TOP, INSIDE_BOTTOM, BOTTOM, CENTER,   // 세로형인 경우
    RIGHT, LEFT, OUTSIDE_RIGHT, OUTSIDE_LEFT, INSIDE_RIGHT, INSIDE_LEFT,           // 가로형인 경우
  }

  public enum TextAlign {
    DEFAULT, LEFT, CENTER, RIGHT
  }
}
