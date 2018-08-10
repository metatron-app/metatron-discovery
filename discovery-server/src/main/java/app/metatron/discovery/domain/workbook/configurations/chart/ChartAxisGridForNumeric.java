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

public class ChartAxisGridForNumeric implements ChartAxisGrid {

  /**
   * 축범위 자동 설정 여부
   */
  Boolean autoScaled;

  /**
   * 축 표시 최소값
   */
  Number min;

  /**
   * 축 표시 최대값
   */
  Number max;

  /**
   * 축 눈금 단위
   */
  Integer unit;

  public ChartAxisGridForNumeric() {
    // empty
  }

  @JsonCreator
  public ChartAxisGridForNumeric(@JsonProperty("autoScaled") Boolean autoScaled,
                                 @JsonProperty("min") Number min,
                                 @JsonProperty("max") Number max,
                                 @JsonProperty("unit") Integer unit) {
    this.autoScaled = autoScaled;
    this.min = min;
    this.max = max;
    this.unit = unit;
  }

  public Boolean getAutoScaled() {
    return autoScaled;
  }

  public void setAutoScaled(Boolean autoScaled) {
    this.autoScaled = autoScaled;
  }

  public Number getMin() {
    return min;
  }

  public Number getMax() {
    return max;
  }

  public Integer getUnit() {
    return unit;
  }

  @Override
  public String toString() {
    return "ChartAxisGridForNumeric{" +
        "autoScaled=" + autoScaled +
        ", min=" + min +
        ", max=" + max +
        ", unit=" + unit +
        '}';
  }
}
