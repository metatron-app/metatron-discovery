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

import java.util.List;
import java.util.Map;

/**
 * 차원값 기준 색상 지정, 컬러셋 또는 색상 코드 목록이 반드시 존재해야함
 */
public class ChartColorByDimension implements ChartColor {

  /**
   * 대상 필드 명(Alias), 필드명이 없을 경우 모든 필드가 동일한 색상정의 적용.
   */
  String targetField;

  /**
   * Chart color set
   */
  String schema;

  /**
   * 사용자 정의 색상 코드 목록, 사용자 섹상 코드가 정의되어 있을 경우 schema 는 무시됨
   */
  List<String> codes;

  /**
   * 항목 별 컬러 쌍 (Gauge Chart 에서 활용)
   */
  Map<String, String> mapping;

  public ChartColorByDimension() {
    // Empty Constructor
  }

  @JsonCreator
  public ChartColorByDimension(@JsonProperty("schema") String schema,
                               @JsonProperty("targetField") String targetField,
                               @JsonProperty("codes") List<String> codes,
                               @JsonProperty("colorPairs") Map<String, String> mapping) {

    Preconditions.checkArgument(!(schema == null && codes == null), "schema or codes required.");

    this.targetField = targetField;
    this.schema = schema;
    this.codes = codes;
    this.mapping = mapping;
  }

  public String getSchema() {
    return schema;
  }

  public List<String> getCodes() {
    return codes;
  }

  public String getTargetField() {
    return targetField;
  }

  public Map<String, String> getMapping() {
    return mapping;
  }

  @Override
  public String toString() {
    return "ChartColorByDimension{" +
        "targetField='" + targetField + '\'' +
        ", schema='" + schema + '\'' +
        ", codes=" + codes +
        ", mapping=" + mapping +
        '}';
  }
}
