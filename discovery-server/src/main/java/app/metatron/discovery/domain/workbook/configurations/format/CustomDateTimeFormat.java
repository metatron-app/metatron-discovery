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

package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

public class CustomDateTimeFormat extends TimeFieldFormat implements FieldFormat {

  String format;

  @JsonCreator
  public CustomDateTimeFormat(
      @JsonProperty("format") String format,
      @JsonProperty("timeZone") String timeZone,
      @JsonProperty("locale") String locale,
      @JsonProperty("filteringType") String filteringType) {
    super(timeZone, locale, filteringType);
    this.format = StringUtils.isEmpty(format) ? TimeFieldFormat.DEFAULT_DATETIME_FORMAT : format;
  }

  public CustomDateTimeFormat(String format) {
    this(format, null, null, null);
  }

  @Override
  public String getFormat() {
    return this.format;
  }

  @Override
  public boolean enableSortField() {
    return false;
  }

  @Override
  public String getSortFormat() {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getSortComparator() {
    return null;
  }
}
