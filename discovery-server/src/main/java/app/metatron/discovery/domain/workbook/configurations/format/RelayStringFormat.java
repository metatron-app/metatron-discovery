/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 */
public class RelayStringFormat implements FieldFormat {

  /**
   * if true, enable compression with lz4
   */
  Boolean enableCompression;

  /**
   * if true, can searchable from lucene index
   */
  Boolean isSearchable;

  public RelayStringFormat() {
  }

  @JsonCreator
  public RelayStringFormat(@JsonProperty("enableCompression") Boolean enableCompression,
          @JsonProperty("isSearchable") Boolean isSearchable) {
    this.enableCompression = enableCompression;
    this.isSearchable = isSearchable;
  }

  public Boolean getEnableCompression() {
    return enableCompression;
  }

  public Boolean getSearchable() {
    return isSearchable;
  }

}
