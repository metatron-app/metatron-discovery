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

package app.metatron.discovery.domain.datasource.data.alias;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class MapAlias implements Alias {

  Map<String, Map<String, String>> values;

  @JsonCreator
  public MapAlias(@JsonProperty("values") Map<String, Map<String, String>> values) {
    this.values = values;
  }

  public Map<String, Map<String, String>> getValues() {
    return values;
  }

  @Override
  public String toString() {
    return "MapAlias{" +
        "values=" + values +
        '}';
  }
}
