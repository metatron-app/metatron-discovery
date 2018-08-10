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

/**
 * 차트 축 설정
 */
public class ChartAxis implements Serializable {

  /**
   * 축명 보이기 여부 (default true)
   */
  Boolean showName;

  /**
   * 사용자 정의 축 라벨
   */
  String customName;

  /**
   * 축 레이블 보이기 여부 (default true)
   */
  Boolean showLabel;

  /**
   * 축 레이블 설정
   */
  ChartAxisLabel label;

  /**
   * 축 배경 표시, null 일경우 of (default color : #cdcdcd, transparency : 30)
   */
  ChartAxisBackground background;

  /**
   * 축 눈금 관련 옵션
   */
  ChartAxisGrid grid;

  public ChartAxis() {
  }

  @JsonCreator
  public ChartAxis(@JsonProperty("showName") Boolean showName,
                   @JsonProperty("customName") String customName,
                   @JsonProperty("showLabel") Boolean showLabel,
                   @JsonProperty("label") ChartAxisLabel label,
                   @JsonProperty("background") ChartAxisBackground background,
                   @JsonProperty("grid") ChartAxisGrid grid) {
    this.showName = showName == null ? true : showName;
    this.showLabel = showLabel == null ? true : showLabel;
    this.customName = customName;
    this.label = label;
    this.background = background;
    this.grid = grid;
  }

  public Boolean getShowName() {
    return showName;
  }

  public String getCustomName() {
    return customName;
  }

  public Boolean getShowLabel() {
    return showLabel;
  }

  public ChartAxisLabel getLabel() {
    return label;
  }

  public ChartAxisBackground getBackground() {
    return background;
  }

  public ChartAxisGrid getGrid() {
    return grid;
  }

  @Override
  public String toString() {
    return "ChartAxis{" +
        "showName=" + showName +
        ", customName='" + customName + '\'' +
        ", showLabel=" + showLabel +
        ", label=" + label +
        ", background=" + background +
        ", grid=" + grid +
        '}';
  }

  public static class ChartAxisBackground implements Serializable {

    /**
     * Background color
     */
    String color;

    /**
     * Background transparency
     */
    Integer transparency;

    @JsonCreator
    public ChartAxisBackground(@JsonProperty("color") String color,
                               @JsonProperty("transparency") Integer transparency) {
      this.color = color;
      this.transparency = transparency;
    }

    public String getColor() {
      return color;
    }

    public Integer getTransparency() {
      return transparency;
    }
  }
}
