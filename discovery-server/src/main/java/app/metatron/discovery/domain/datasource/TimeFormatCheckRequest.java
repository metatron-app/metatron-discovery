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

package app.metatron.discovery.domain.datasource;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 7. 22..
 */
public class TimeFormatCheckRequest {

  String format;
  List<String> samples;

  public TimeFormatCheckRequest() {
  }

  public TimeFormatCheckRequest(String format, List<String> samples) {
    this.format = format;
    this.samples = samples;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public List<String> getSamples() {
    return samples;
  }

  public void setSamples(List<String> samples) {
    this.samples = samples;
  }
}
