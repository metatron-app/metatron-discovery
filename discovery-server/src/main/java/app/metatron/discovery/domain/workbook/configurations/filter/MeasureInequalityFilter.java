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
 * 측정값(+집계)에 대한 부등식 필터링 수행 (for candidate)
 */
@JsonTypeName("measure_inequality")
public class MeasureInequalityFilter extends AdvancedFilter {

  /**
   *  집계 타입
   */
  @NotNull
  MeasureField.AggregationType aggregation;

  /**
   *  부등식 타입
   */
  @NotNull
  InequalityType inequality;

  /**
   *  조건 값, aggreationType(field) conditionType value
   *  ex. SUM(param) > 10
   */
  @NotNull
  Number value;

  public MeasureInequalityFilter() {
  }

  @JsonCreator
  public MeasureInequalityFilter(@JsonProperty("field") String field,
                                @JsonProperty("ref") String ref,
                                @JsonProperty("aggregation") String aggregation,
                                @JsonProperty("condition") String inequality,
                                @JsonProperty("value") Number value) {
    super(field, ref);
    this.aggregation = EnumUtils.getCaseEnum(MeasureField.AggregationType.class,
                                                 aggregation, MeasureField.AggregationType.SUM);
    this.inequality = EnumUtils.getCaseEnum(InequalityType.class,
                                                inequality, InequalityType.GREATER_THAN);
    this.value = value;
  }

  public MeasureInequalityFilter(String field, String aggregation, String inequality, Number value) {
    this(field, null, aggregation, inequality, value);
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

  public InequalityType getInequality() {
    return inequality;
  }

  public void setInequality(InequalityType inequality) {
    this.inequality = inequality;
  }

  public Number getValue() {
    return value;
  }

  public void setValue(Number value) {
    this.value = value;
  }

  /**
   * 부등식 (=, >, <, >=, <=) 형태
   */
  public enum InequalityType {
    EQUAL_TO, GREATER_THAN, LESS_THAN, EQUAL_GREATER_THAN, EQUAL_LESS_THAN
  }
}
