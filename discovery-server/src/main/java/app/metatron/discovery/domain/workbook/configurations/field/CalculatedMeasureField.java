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

package app.metatron.discovery.domain.workbook.configurations.field;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.NONE;

/**
 * 계산된 필드 (Custom Field)
 */
@JsonTypeName("calculated")
public class CalculatedMeasureField extends CustomField {

  /**
   * 계산식
   */
  @NotNull
  String expr;

  /**
   * 가상 필드명, 없는 경우 필드명 과 AggregationType 값과 조합하여 구성 ex. SUM(fieldName)
   */
  String alias;

  /**
   * 집계여부
   */
  boolean isAggregated;

  /**
   * 집합 함수 타입
   * page 선반에 저장할때 필요
   */
  MeasureField.AggregationType aggregationType;

  public CalculatedMeasureField() {
    // Empty Constructor
  }

  @JsonCreator
  public CalculatedMeasureField(
      @JsonProperty("name") String name,
      @JsonProperty("alias") String alias,
      @JsonProperty("expr") String expr,
      @JsonProperty("isAggregated") Boolean isAggregated,
      @JsonProperty("aggregationType") String aggregationType) {


    Preconditions.checkArgument(StringUtils.isNotEmpty(name));
    super.name = name;
    super.alias = alias;
    this.expr = expr;
    this.isAggregated = isAggregated == null ? false : isAggregated;

    if(StringUtils.isNotEmpty(aggregationType)) {
      this.aggregationType = MeasureField.AggregationType.valueOf(aggregationType.toUpperCase());
    }
  }

  public CalculatedMeasureField(String name, String expr) {
    this(name, expr, null);
  }

  public CalculatedMeasureField(String name, String expr, MeasureField.AggregationType aggregationType) {
    this(name, null, expr, null, aggregationType.name());
  }

  @Override
  public FieldFormat getFormat() {
    throw new NotImplementedException("Not support method");
  }

  @Override
  public String getExpr() {
    return expr;
  }

  public void setExpr(String expr) {
    this.expr = expr;
  }

  public boolean isAggregated() {
    return isAggregated;
  }

  public void setAggregated(boolean aggregated) {
    isAggregated = aggregated;
  }

  public MeasureField.AggregationType getAggregationType() {
    return aggregationType;
  }

  public void setAggregationType(MeasureField.AggregationType aggregationType) {
    this.aggregationType = aggregationType;
  }

  @Override
  public String getAlias() {
    if (StringUtils.isEmpty(alias)) {
      if(aggregationType == null || aggregationType == NONE || aggregationType == MeasureField.AggregationType.COMPLEX) {
        alias = getColunm();
      } else {
        alias = aggregationType.name() + "(" + getColunm() + ")";
      }
    }

    return alias;
  }

}
