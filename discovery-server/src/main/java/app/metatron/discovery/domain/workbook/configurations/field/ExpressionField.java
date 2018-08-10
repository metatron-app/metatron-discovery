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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Created by kyungtaak on 2016. 6. 28..
 */
public class ExpressionField extends UserDefinedField {

  /**
   * Expression
   */
  @NotNull
  String expr;

  /**
   * Dimension or Measure
   */
  Field.FieldRole role;


  /**
   * Expression 결과 Data Type
   */
  DataType dataType;

  /**
   * Expression이 이미 집계가 된 것인지 여부 확인
   */
  boolean aggregated;

  public ExpressionField() {
    // Empty Constructor
  }

  @JsonCreator
  public ExpressionField(
      @JsonProperty("name") String name,
      @JsonProperty("expr") String expr,
      @JsonProperty("role") String role,
      @JsonProperty("dataType") String dataType,
      @JsonProperty("aggregated") boolean aggregated) {

    // Name, Expr 표현식은 필수 값임
    Preconditions.checkArgument(StringUtils.isNotEmpty(name));
    Preconditions.checkArgument(StringUtils.isNotEmpty(expr));

    super.name = name;
    this.expr = expr;
    this.role = EnumUtils.getUpperCaseEnum(Field.FieldRole.class, role, Field.FieldRole.DIMENSION);
    this.dataType = EnumUtils.getUpperCaseEnum(DataType.class, dataType);
    this.aggregated = aggregated;
  }

  public ExpressionField(String name, String expr) {
    this(name, expr, null);
  }

  public ExpressionField(String name, String expr, String role) {
    this(name, expr, role, null, false);
  }

  @JsonIgnore
  @Override
  public FieldFormat getFormat() {
    throw new NotImplementedException("Not support method");
  }

  public String getExpr() {
    return expr;
  }

  public void setExpr(String expr) {
    this.expr = expr;
  }

  public Field.FieldRole getRole() {
    return role;
  }

  public void setRole(Field.FieldRole role) {
    this.role = role;
  }

  public DataType getDataType() {
    return dataType;
  }

  public void setDataType(DataType dataType) {
    this.dataType = dataType;
  }

  public boolean isAggregated() {
    return aggregated;
  }

  public void setAggregated(boolean aggregated) {
    this.aggregated = aggregated;
  }

}
