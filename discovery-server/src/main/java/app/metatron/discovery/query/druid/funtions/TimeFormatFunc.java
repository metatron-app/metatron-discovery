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

package app.metatron.discovery.query.druid.funtions;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.util.PolarisUtils;

/**
 * Timestamp 타입 변환용 Function,
 */
public class TimeFormatFunc {

  private static final String FUNC_NAME = "time_format";

  String field;

  String format;

  String timezone;

  String locale;

  String outFormat;

  String outTimezone;

  String outLocale;

  public TimeFormatFunc() {
    // Empty Constructor
  }

  @JsonCreator
  public TimeFormatFunc(
      @JsonProperty("field") String field,
      @JsonProperty("format") String format,
      @JsonProperty("timezone") String timezone,
      @JsonProperty("locale") String locale,
      @JsonProperty("outFormat") String outFormat,
      @JsonProperty("outTimezone") String outTimezone,
      @JsonProperty("outLocale") String outLocale) {

    Preconditions.checkArgument(StringUtils.isNotEmpty(field), "field property required.");

    this.field = field;
    this.format = format;
    this.timezone = StringUtils.isEmpty(timezone) ? "UTC" : timezone;
    this.locale = StringUtils.isEmpty(locale) ? "en" : locale;
    this.outFormat = StringUtils.isEmpty(outFormat) ? "yyyy-MM-dd HH:mm:ss" : outFormat;
    this.outTimezone = StringUtils.isEmpty(outTimezone) ? "UTC" : outTimezone;
    this.outLocale = StringUtils.isEmpty(outLocale) ? "en" : outLocale;
  }

  public TimeFormatFunc(String field, String outFormat, String outTimezone, String outLocale) {
    this(field, null, null, null, outFormat, outTimezone, outLocale);
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(");
    sb.append(field);
    if(StringUtils.isNotEmpty(format)) {
      sb.append(",").append("'").append(PolarisUtils.escapeTimeFormatChars(format)).append("'");
      sb.append(",").append("'").append(timezone).append("'");
      sb.append(",").append("'").append(locale).append("'");
    }
    sb.append(",").append("out.format=").append("'").append(PolarisUtils.escapeTimeFormatChars(outFormat)).append("'");
    sb.append(",").append("out.timezone=").append("'").append(outTimezone).append("'");
    sb.append(",").append("out.locale=").append("'").append(outLocale).append("'");
    sb.append(")");
    return sb.toString();
  }
}
