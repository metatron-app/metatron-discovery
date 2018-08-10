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

public class ChartAxisLabelForCategory implements ChartAxisLabel {

  /**
   * 레이블 회전 각도 (0~360)
   */
  Integer rotation;

  /**
   * 레이블 최대 길이 지정
   */
  Integer maxLength;

  /**
   * 몇개마다 표시할지 지정
   */
  Integer showEvery;

  public ChartAxisLabelForCategory() {
  }

  @JsonCreator
  public ChartAxisLabelForCategory(@JsonProperty("rotation") Integer rotation,
                                   @JsonProperty("maxLength") Integer maxLength,
                                   @JsonProperty("showEvery") Integer showEvery) {
    if(rotation != null) {
      if(rotation >=0 && rotation <= 360) {
        this.rotation = rotation;
      } else {
        throw new IllegalArgumentException("Only 0 to 360 can be required.");
      }
    } else {
      this.rotation = 0;
    }
    this.maxLength = maxLength;
    this.showEvery = showEvery;
  }

  public Integer getRotation() {
    return rotation;
  }

  public Integer getMaxLength() {
    return maxLength;
  }

  public Integer getShowEvery() {
    return showEvery;
  }

  @Override
  public String toString() {
    return "ChartAxisLabelForCategory{" +
        "rotation=" + rotation +
        ", maxLength=" + maxLength +
        ", showEvery=" + showEvery +
        '}';
  }
}
