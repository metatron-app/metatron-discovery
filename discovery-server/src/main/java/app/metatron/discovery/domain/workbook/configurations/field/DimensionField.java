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

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

@JsonTypeName("dimension")
public class DimensionField extends Field {

  FieldFormat format;

  public DimensionField() {
  }

  @JsonCreator
  public DimensionField(
      @JsonProperty("name") String name,
      @JsonProperty("alias") String alias,
      @JsonProperty("ref") String ref,
      @JsonProperty("format") FieldFormat format) {

    super(name, alias, ref);
    this.format = format;
  }

  public DimensionField(String name) {
    this(name, null , null);
  }

  public DimensionField(String name, String ref) {
    this(name, ref , null);
  }

  public DimensionField(String name, String ref, FieldFormat format) {
    this(name, null , ref,  format);
  }

  public void emptyFormat() {
    this.format = null;
  }

  @Override
  public FieldFormat getFormat() {
    return format;
  }

  public void setFormat(FieldFormat format) {
    this.format = format;
  }
}
