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

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

public class ChartAxisLabelForValue implements ChartAxisLabel {

  /**
   * 차트내 기본 Value Format 사용, Default true
   */
  Boolean useDefault;

  /**
   * Value Format 지정, useDefault false 일 경우 지정 필요
   */
  FieldFormat format;

  public ChartAxisLabelForValue() {
  }

  @JsonCreator
  public ChartAxisLabelForValue(@JsonProperty("useDefault") Boolean useDefault,
                                @JsonProperty("format") FieldFormat format) {
    this.useDefault = useDefault == null ? true : false;

    if(useDefault == false && format == null) {
      throw new IllegalArgumentException("if useDefault true, format property required.");
    } else {
      this.format = format;
    }
  }

  public Boolean getUseDefault() {
    return useDefault;
  }

  public FieldFormat getFormat() {
    return format;
  }

  @Override
  public String toString() {
    return "ChartAxisLabelForValue{" +
        "useDefault=" + useDefault +
        ", format=" + format +
        '}';
  }
}
