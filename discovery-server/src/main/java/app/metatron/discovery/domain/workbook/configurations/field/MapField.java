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
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

/**
 * Created by kyungtaak on 2016. 6. 28..
 */
public class MapField extends UserDefinedField {

  /**
   * Value 필드의 대표 이름
   */
  String valueFieldName;

  /**
   * Key 가 되는 필드명(Field 내 Array 타입만 지정 가능)
   */
  @NotBlank
  String keyField;

  /**
   * Value 가 되는 필드명(Field 내 Array 타입만 지정 가능)
   */
  @NotNull
  @Size(min = 1)
  List<String> valueFields;

  public MapField() {
  }

  @JsonCreator
  public MapField(
      @JsonProperty("name") String name,
      @JsonProperty("valueFieldName") String valueFieldName,
      @JsonProperty("keyField") String keyField,
      @JsonProperty("valueFields") List<String> valueFields) {

    super.name = name;
    Preconditions.checkArgument(StringUtils.isNotEmpty(super.name));

    Preconditions.checkArgument(StringUtils.isNotEmpty(keyField), "'keyField' required");
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(valueFields) && valueFields.size() > 1, "'valueFields' must be at least 1.");

    this.valueFieldName = valueFieldName;
    this.keyField = keyField;
    this.valueFields = valueFields;
  }

  public MapField(String name, String keyField, String... valueFields) {
    this(name, null, keyField, Lists.newArrayList(valueFields));
  }

  @Override
  public FieldFormat getFormat() {
    throw new NotImplementedException("Not support method");
  }

  public String getValueFieldName() {
    if(StringUtils.isEmpty(valueFieldName)) {
      return getName() + "_value";
    }
    return valueFieldName;
  }

  public String getKeyField() {
    return keyField;
  }

  public List<String> getValueFields() {
    return valueFields;
  }
}
