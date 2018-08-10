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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.util.EnumUtils;

/**
 * 측정값(+집계)에 대한 부등식 TOP/BOTTOM 수행 (for candidate)
 */
@JsonTypeName("measure_position")
public class MeasurePositionFilter extends AdvancedFilter {

  /**
   *  집계 타입
   */
  @NotNull
  MeasureField.AggregationType aggregation;

  /**
   *  조건
   */
  @NotNull
  PositionType position;

  /**
   *  조건 값, aggreationType(field) conditionType value
   *  ex. SUM(param) > 10
   */
  @NotNull
  Number value;

  public MeasurePositionFilter() {
  }

  @JsonCreator
  public MeasurePositionFilter(@JsonProperty("field") String field,
                               @JsonProperty("ref") String ref,
                               @JsonProperty("aggregation") String aggregation,
                               @JsonProperty("position") String position,
                               @JsonProperty("value") Integer value) {
    super(field, ref);
    this.aggregation = EnumUtils.getCaseEnum(MeasureField.AggregationType.class,
                                                 aggregation, MeasureField.AggregationType.SUM);

    this.position = EnumUtils.getCaseEnum(PositionType.class, position, PositionType.TOP);
    this.value = value;
  }

  public MeasurePositionFilter(String field, String aggregation, String position, Integer value) {
    this(field, null, aggregation, position, value);
  }

  /**
   * GroupBy 쿼리 전환을 위한 MeasureField 객체 생성
   * @return
   */
  public MeasureField toMeasureField() {
    return new MeasureField(field, ref, aggregation);
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }

  public MeasureField.AggregationType getAggregation() {
    return aggregation;
  }

  public void setAggregation(MeasureField.AggregationType aggregation) {
    this.aggregation = aggregation;
  }

  public PositionType getPosition() {
    return position;
  }

  public void setPosition(PositionType position) {
    this.position = position;
  }

  public Number getValue() {
    return value;
  }

  public void setValue(Number value) {
    this.value = value;
  }

  /**
   * 조건(=, >, <, >=, <=) 및 제한(상위,하위) 형태 포함
   */
  public enum PositionType {
    TOP, BOTTOM
  }
}
