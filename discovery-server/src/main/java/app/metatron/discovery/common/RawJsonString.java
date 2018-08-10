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

package app.metatron.discovery.common;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * JSON String을 REST API 로 전달하기 위한 Wrapper Class`
 * Created by kyungtaak on 2016. 2. 25..
 */
public class RawJsonString {
  private final String value;

  public RawJsonString(String value) {
    this.value = value;
  }

  @JsonValue
  @JsonRawValue
  public String value() {
    return value;
  }
}
