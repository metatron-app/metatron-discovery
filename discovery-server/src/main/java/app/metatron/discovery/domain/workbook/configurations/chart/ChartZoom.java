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
 * Chart Zoom 설정
 *
 */
public class ChartZoom implements Serializable {

  /**
   *
   */
  Double start;

  /**
   *
   */
  Double end;

  /**
   *
   */
  Double startValue;

  /**
   *
   */
  Double endValue;

  /**
   *
   */
  Integer count;

  /**
   *
   */
  Orient orient;

  public ChartZoom() {
    // empty
  }

  @JsonCreator
  public ChartZoom(@JsonProperty("orient") String orient,
                   @JsonProperty("start") Double start,
                   @JsonProperty("end") Double end,
                   @JsonProperty("startValue") Double startValue,
                   @JsonProperty("endValue") Double endValue,
                   @JsonProperty("count") Integer count) {

    this.orient = EnumUtils.getUpperCaseEnum(Orient.class, orient, Orient.HORIZONTAL);
    this.start = start;
    this.end = end;
    this.startValue = startValue;
    this.endValue = endValue;
    this.count = count;

  }

  public Double getStart() {
    return start;
  }

  public Double getEnd() {
    return end;
  }

  public Double getStartValue() {
    return startValue;
  }

  public Double getEndValue() {
    return endValue;
  }

  public Integer getCount() {
    return count;
  }

  public Orient getOrient() {
    return orient;
  }

  @Override
  public String toString() {
    return "ChartZoom{" +
        "start=" + start +
        ", end=" + end +
        ", startValue=" + startValue +
        ", endValue=" + endValue +
        ", count=" + count +
        ", orient=" + orient +
        '}';
  }

  public enum Orient {
    HORIZONTAL,
    VERTICAL
  }
}
