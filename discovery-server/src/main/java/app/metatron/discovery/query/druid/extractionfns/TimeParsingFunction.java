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

import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.ExtractionFunction;

@JsonTypeName("time")
public class TimeParsingFunction implements ExtractionFunction {

  @NotNull
  String timeFormat;

  String timeLocale;

  String timeZone;

  @NotNull
  String resultFormat;

  String resultLocale;

  String resultZone;

  public TimeParsingFunction(String timeFormat, String resultFormat) {
    this.timeFormat = timeFormat;
    this.resultFormat = resultFormat;
  }

  public TimeParsingFunction(String timeFormat, String resultFormat, String resultLocale, String resultZone) {
    this(timeFormat, null, null, resultFormat, resultLocale, resultZone);
  }

  public TimeParsingFunction(String timeFormat, String timeLocale, String timeZone,
                             String resultFormat, String resultLocale, String resultZone) {
    this.timeFormat = timeFormat;
    this.timeLocale = timeLocale;
    this.timeZone = timeZone;
    this.resultFormat = resultFormat;
    this.resultLocale = resultLocale;
    this.resultZone = resultZone;
  }

  public String getTimeLocale() {
    return timeLocale;
  }

  public void setTimeLocale(String timeLocale) {
    this.timeLocale = timeLocale;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public void setTimeZone(String timeZone) {
    this.timeZone = timeZone;
  }

  public String getResultLocale() {
    return resultLocale;
  }

  public void setResultLocale(String resultLocale) {
    this.resultLocale = resultLocale;
  }

  public String getResultZone() {
    return resultZone;
  }

  public void setResultZone(String resultZone) {
    this.resultZone = resultZone;
  }

  public String getTimeFormat() {
    return timeFormat;
  }

  public void setTimeFormat(String timeFormat) {
    this.timeFormat = timeFormat;
  }

  public String getResultFormat() {
    return resultFormat;
  }

  public void setResultFormat(String resultFormat) {
    this.resultFormat = resultFormat;
  }


}
