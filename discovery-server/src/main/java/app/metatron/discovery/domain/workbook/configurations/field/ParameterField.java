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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.NotImplementedException;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

/**
 * Parameter Field
 */
@JsonTypeName("parameter")
public class ParameterField extends UserDefinedField {

  /**
   * Default value
   */
  Object defaultValue;

  /**
   * List of selectable values, If valueType is Range, only 2 values ​​can be specified.
   */
  List<Object> values;

  /**
   * The type from which to select a value
   */
  ValueType valueType;

  public ParameterField() {
  }

  @JsonCreator
  public ParameterField(
      @JsonProperty("name") String name,
      @JsonProperty("dataSource") String dataSource,
      @JsonProperty("defaultValue") Object defaultValue,
      @JsonProperty("values") List<Object> values,
      @JsonProperty("valueType") String valueType) {

    this.name = name;
    this.dataSource = dataSource;

    this.defaultValue = defaultValue;

    this.valueType = EnumUtils.getCaseEnum(ValueType.class, valueType, ValueType.RANGE);

    // RANGE 타입일 경우는 최대 최소값 입력만 허용되기 때문에 values 값은 2개 여야함 (추가 Validation 고려)
    // SELECTOR 타입은 빈값이 아닌경우만 허용
    if (this.valueType == ValueType.RANGE) {

      if (CollectionUtils.isEmpty(values) || values.size() != 2) {
        throw new IllegalArgumentException("Invalid values.");
      }

      Object min = values.get(0);
      Object max = values.get(1);
      if (!(defaultValue instanceof Number && min instanceof Number && max instanceof Number)) {
        throw new IllegalArgumentException("Invalid values. Required number.");
      }

    } else if (this.valueType == ValueType.SELECTOR) {
      if ((CollectionUtils.isNotEmpty(values))) {
        throw new IllegalArgumentException("Invalid values.");
      }
    }
    this.values = values;
  }

  @Override
  public FieldFormat getFormat() {
    throw new NotImplementedException("Not support method");
  }

  public Object getDefaultValue() {
    return defaultValue;
  }

  public void setDefaultValue(Object defaultValue) {
    this.defaultValue = defaultValue;
  }

  public List<Object> getValues() {
    return values;
  }

  public void setValues(List<Object> values) {
    this.values = values;
  }

  public ValueType getValueType() {
    return valueType;
  }

  public void setValueType(ValueType valueType) {
    this.valueType = valueType;
  }

  @Override
  public String toString() {
    return "ParameterField{" +
        "defaultValue=" + defaultValue +
        ", values=" + values +
        ", valueType=" + valueType +
        ", name='" + name + '\'' +
        "} ";
  }

  public enum ValueType {
    RANGE, SELECTOR
  }
}
