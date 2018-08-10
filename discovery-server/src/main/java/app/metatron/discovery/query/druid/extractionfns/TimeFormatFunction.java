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

package app.metatron.discovery.query.druid.extractionfns;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.ExtractionFunction;

@JsonTypeName("timeFormat")
public class TimeFormatFunction implements ExtractionFunction {
  String format;

  @JsonInclude(JsonInclude.Include.NON_EMPTY)
  String timeZone;

  @JsonInclude(JsonInclude.Include.NON_EMPTY)
  String locale;

  public TimeFormatFunction() {
  }

  public TimeFormatFunction(String format, String timeZone, String locale) {
    this.format = format;
    this.timeZone = timeZone == null ? "UTC" : timeZone;
    this.locale = locale == null ? "en" : locale;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
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
