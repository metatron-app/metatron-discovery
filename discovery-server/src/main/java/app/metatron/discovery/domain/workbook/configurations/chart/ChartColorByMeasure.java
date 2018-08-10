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

import java.util.List;

import app.metatron.discovery.util.EnumUtils;

/**
 * 측정값 색상 지정
 */
public class ChartColorByMeasure implements ChartColor {

  /**
   * 순차/대비 모드 일경우, Chart color set
   */
  String schema;

  /**
   * 사용자 색상 설정 모드 지정
   */
  CustomMode customMode;

  /**
   * customMode 값이 "SECTION", "GRADIENT" 일 경우, 사용자 지정 범위 지정
   */
  List<ChartColorRange> ranges;

  public ChartColorByMeasure() {
    // Empty Constructor
  }

  @JsonCreator
  public ChartColorByMeasure(@JsonProperty("schema") String schema,
                             @JsonProperty("customMode") String customMode,
                             @JsonProperty("ranges") List<ChartColorRange> ranges) {
    this.schema = schema;
    this.customMode = EnumUtils.getUpperCaseEnum(CustomMode.class, customMode, CustomMode.NONE);
    this.ranges = ranges;
  }

  public ChartColorByMeasure(String schema) {
    this(schema, null, null);
  }

  public String getSchema() {
    return schema;
  }

  public CustomMode getCustomMode() {
    return customMode;
  }

  public List<ChartColorRange> getRanges() {
    return ranges;
  }

  @Override
  public String toString() {
    return "ChartColorByMeasure{" +
        "schema='" + schema + '\'' +
        ", customMode=" + customMode +
        ", ranges=" + ranges +
        '}';
  }

  public enum CustomMode {
    NONE, SECTION, GRADIENT
  }
}
