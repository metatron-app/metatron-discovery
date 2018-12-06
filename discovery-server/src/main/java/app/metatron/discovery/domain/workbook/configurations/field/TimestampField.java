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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;

/**
 *
 */
@JsonTypeName("timestamp")
public class TimestampField extends Field {

  FieldFormat format;

  public TimestampField() {
  }

  @JsonCreator
  public TimestampField(
      @JsonProperty("name") String name,
      @JsonProperty("alias") String alias,
      @JsonProperty("ref") String ref,
      @JsonProperty("format") FieldFormat format) {

    super(name, alias, ref);
    if (format != null) {
      if (format instanceof TimeFieldFormat) {
        this.format = format;
      } else {
        throw new BadRequestException("Required time format");
      }
    }
  }

  public TimestampField(String name) {
    this(name, null);
  }

  public TimestampField(String name, String ref) {
    this(name, null, ref, new CustomDateTimeFormat(TimeFieldFormat.DEFAULT_DATETIME_FORMAT));
  }

  public TimestampField(String name, String ref, FieldFormat format) {
    this(name, null, ref, format);
  }

  public void emptyFormat() {
    this.format = null;
  }

  @Override
  public FieldFormat getFormat() {
    return format;
  }

  @JsonIgnore
  public String getPredefinedColumn(boolean useQueryDatasource) {

    if (!useQueryDatasource) {
      return "__time";
    }

    StringBuilder builder = new StringBuilder();
    if (StringUtils.isNotEmpty(ref)) {
      builder.append(ref).append(FIELD_NAMESPACE_SEP);
    }
    builder.append("timestamp");

    return builder.toString();
  }
}
