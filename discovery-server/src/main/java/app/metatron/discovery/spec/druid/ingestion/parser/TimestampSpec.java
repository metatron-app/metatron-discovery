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

package app.metatron.discovery.spec.druid.ingestion.parser;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import javax.validation.constraints.NotNull;

/**
 *
 */
public class TimestampSpec {

  String type;

  @NotNull
  String column;

  String format;

  DateTime missingValue;

  DateTime invalidValue;

  boolean replaceWrongColumn;

  String timeZone;

  String locale;

  public TimestampSpec() {
  }

  public TimestampSpec(String column) {
    this(column, null);
  }

  public TimestampSpec(String column, String format) {
    this(null, column, format);
  }

  public TimestampSpec(String type, String column, String format) {
    this.type = type;
    this.column = column;

    if (StringUtils.isEmpty(format)) {
      this.format = "auto";
    } else {
      this.format = format;
    }
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getColumn() {
    return column;
  }

  public void setColumn(String column) {
    this.column = column;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public DateTime getMissingValue() {
    return missingValue;
  }

  public void setMissingValue(DateTime missingValue) {
    this.missingValue = missingValue;
  }

  public DateTime getInvalidValue() {
    return invalidValue;
  }

  public void setInvalidValue(DateTime invalidValue) {
    this.invalidValue = invalidValue;
  }

  public boolean isReplaceWrongColumn() {
    return replaceWrongColumn;
  }

  public void setReplaceWrongColumn(boolean replaceWrongColumn) {
    this.replaceWrongColumn = replaceWrongColumn;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public void setTimeZone(String timeZone) {
    this.timeZone = timeZone;
  }

  public String getLocale() {
    return locale;
  }

  public void setLocale(String locale) {
    this.locale = locale;
  }
}
