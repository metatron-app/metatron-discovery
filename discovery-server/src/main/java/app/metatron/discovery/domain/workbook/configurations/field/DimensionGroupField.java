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

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

/**
 * 차원값들의 그룹 필드 (Custom Field)
 *
 */
@JsonTypeName("group")
public class DimensionGroupField extends CustomField {

  /**
   * 그룹내 필드 정보, 차원값(Dimension)만 포함 가능
   */
  @NotNull
  @Size(min = 1)
  List<DimensionField> fields;

  public DimensionGroupField() {
    // Empty Constructor
  }

  @JsonCreator
  public DimensionGroupField(
      @JsonProperty("name") String name,
      @JsonProperty("fields")List<DimensionField> fields) {

    Preconditions.checkArgument(StringUtils.isNotEmpty(name));
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(fields));

    super.name = name;
    this.fields = fields;
  }

  @Override
  public FieldFormat getFormat() {
    throw new NotImplementedException("Not support method");
  }

  public List<DimensionField> getFields() {
    return fields;
  }

  public void setFields(List<DimensionField> fields) {
    this.fields = fields;
  }

}
