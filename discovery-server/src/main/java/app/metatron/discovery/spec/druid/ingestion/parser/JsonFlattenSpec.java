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

import org.apache.commons.lang3.BooleanUtils;

import java.util.List;

/**
 * Druid : JsonFlattenSpec
 */
public class JsonFlattenSpec {

  /**
   * If true, interpret all fields with singular values (not a map or list) and flat lists (lists of singular values) at the root level as columns.
   */
  Boolean useFieldDiscovery;

  /**
   * Specifies the fields of interest and how they are accessed
   */
  List<JsonFlattenField> fields;

  public JsonFlattenSpec() {
  }

  public JsonFlattenSpec(List<JsonFlattenField> fields) {
    this.useFieldDiscovery = true;
    this.fields = fields;
  }

  public JsonFlattenSpec(Boolean useFieldDiscovery, List<JsonFlattenField> fields) {
    this.useFieldDiscovery = BooleanUtils.isTrue(useFieldDiscovery);
    this.fields = fields;
  }

  public boolean isUseFieldDiscovery() {
    return useFieldDiscovery;
  }

  public List<JsonFlattenField> getFields() {
    return fields;
  }
}

