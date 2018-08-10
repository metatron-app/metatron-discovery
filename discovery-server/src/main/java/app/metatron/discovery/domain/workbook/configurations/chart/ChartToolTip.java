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

import app.metatron.discovery.util.EnumUtils;

public class ChartToolTip implements Serializable {

  /**
   * 표시 레이블 선택
   */
  List<ChartLabelDisplayType> displayTypes;

  /**
   * 툴팁내 표시할 컬럼 데이터
   */
  List<String> displayColumns;

  /**
   * 기본 ValueFormat 사용 여부
   */
  Boolean useDefaultFormat;

  public ChartToolTip() {
  }

  @JsonCreator
  public ChartToolTip(@JsonProperty("displayTypes") List<String> displayTypes,
                      @JsonProperty("displayColumns") List<String> displayColumns,
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

    this.displayColumns = displayColumns;
    this.useDefaultFormat = useDefaultFormat;
  }

  public List<ChartLabelDisplayType> getDisplayTypes() {
    return displayTypes;
  }

  public Boolean getUseDefaultFormat() {
    return useDefaultFormat;
  }

  @Override
  public String toString() {
    return "ChartToolTip{" +
        "displayTypes=" + displayTypes +
        ", useDefaultFormat=" + useDefaultFormat +
        '}';
  }
}
