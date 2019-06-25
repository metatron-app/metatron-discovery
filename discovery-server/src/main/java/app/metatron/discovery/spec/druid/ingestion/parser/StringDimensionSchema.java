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

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class StringDimensionSchema extends DimensionSchema {

  public static List<DimensionSchema> ofNames(String... dimensions) {
    List<DimensionSchema> schemas = Lists.newArrayList();
    for (String dimension : dimensions) {
      schemas.add(new StringDimensionSchema(dimension, null));
    }
    return schemas;
  }

  @JsonCreator
  public StringDimensionSchema(@JsonProperty("name") String name,
                               @JsonProperty("multiValueHandling") MultiValueHandling multiValueHandling) {
    super(name, multiValueHandling);
  }

  public StringDimensionSchema(String name) {
    this(name, null);
  }

}
