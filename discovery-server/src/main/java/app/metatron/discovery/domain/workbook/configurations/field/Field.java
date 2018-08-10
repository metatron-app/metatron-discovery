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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = DimensionField.class, name = "dimension"),
        @JsonSubTypes.Type(value = DimensionGroupField.class, name = "group"),
        @JsonSubTypes.Type(value = MeasureField.class, name = "measure"),
        @JsonSubTypes.Type(value = TimestampField.class, name = "timestamp"),
        @JsonSubTypes.Type(value = MapField.class, name = "user_map"),
        @JsonSubTypes.Type(value = ExpressionField.class, name = "user_expr"),
        @JsonSubTypes.Type(value = ParameterField.class, name = "user_param")
})
public abstract class Field implements Serializable {

  public static final String FIELD_NAMESPACE_SEP = ".";

  /**
   * 필드 명
   */
  String name;

  /**
   * Output Name
   */
  String alias;

  /**
   * UserDefined Field 을 참조할 경우, 또는 Right Side 데이터 소스 일경우 데이터 소스명
   */
  String ref;

  Map<String, String> valuePair;

  public Field() {
  }

  public Field(String name, String alias, String ref) {

    Preconditions.checkArgument(StringUtils.isNotEmpty(name), "Required field name.");

    this.name = name;
    this.alias = alias;
    this.ref = ref;
  }

  public abstract FieldFormat getFormat();

  @JsonIgnore
  public String getColunm() {
    StringBuilder builder = new StringBuilder();
    if(StringUtils.isNotEmpty(getRef())) {
      builder.append(getRef()).append(FIELD_NAMESPACE_SEP);
    }
    builder.append(getName());

    return builder.toString();
  }

  public String getAlias() {
    if(StringUtils.isEmpty(alias)) {
      return getColunm();
    }
    return alias;
  }

  public void setAlias(String alias) {
    this.alias = alias;
  }

  public String getName() {
    return name;
  }

  public String getRef() {
    return ref;
  }

  public void setRef(String ref) {
    this.ref = ref;
  }

  public Map<String, String> getValuePair() {
    return valuePair;
  }

  public void setValuePair(Map<String, String> valuePair) {
    this.valuePair = valuePair;
  }
}
