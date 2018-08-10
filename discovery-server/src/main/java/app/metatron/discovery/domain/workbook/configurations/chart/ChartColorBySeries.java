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

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * 시리즈별 색상 지정
 */
public class ChartColorBySeries implements ChartColor {

  /**
   * Chart color set
   */
  String schema;

  /**
   * 사용자 정의 Series 별 색상 지정, mapping 이 존재하는 경우 사용자 정의 색상 처리로 간주함 <br/> - Key : Series 명 <br/> - Value
   * : Color code <br/>
   */
  Map<String, String> mapping;

  public ChartColorBySeries() {
  }

  @JsonCreator
  public ChartColorBySeries(@JsonProperty("schema") String schema,
                            @JsonProperty("mapping") Map<String, String> mapping) {

    Preconditions.checkArgument(!(schema == null && mapping == null), "schema or mapping required.");

    this.schema = schema;
    this.mapping = mapping;
  }

  public String getSchema() {
    return schema;
  }

  public Map<String, String> getMapping() {
    return mapping;
  }

  @Override
  public String toString() {
    return "ChartColorBySeries{" +
        "schema='" + schema + '\'' +
        ", mapping=" + mapping +
        '}';
  }
}
