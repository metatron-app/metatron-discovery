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

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.Granularity;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.apache.commons.lang3.StringUtils;

/**
 *
 */
@JsonTypeName("timestamp")
public class TimestampField extends Field {

  Granularity granularity;

  FieldFormat format;

  public TimestampField() {
  }

  @JsonCreator
  public TimestampField(
          @JsonProperty("name") String name,
          @JsonProperty("alias") String alias,
          @JsonProperty("ref") String ref,
          @JsonProperty("granularity") Granularity granularity,
          @JsonProperty("format") FieldFormat format) {

    super(name, alias, ref);

    this.granularity = granularity;

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
    this(name, null, ref, null, new CustomDateTimeFormat(TimeFieldFormat.DEFAULT_DATETIME_FORMAT));
  }

  public TimestampField(String name, String ref, FieldFormat format) {
    this(name, null, ref, null, format);
  }

  public void emptyFormat() {
    this.format = null;
  }

  @Override
  public FieldFormat getFormat() {
    return format;
  }

  public Granularity getGranularity() {
    return granularity;
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
    builder.append("__time");

    return builder.toString();
  }
}
