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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;

/**
 * Druid: JsonParseSpec
 */
public class JsonParseSpec extends TimeAndDimsParseSpec implements ParseSpec {

  /**
   * allows nested JSON fields to be flattened during ingestion time
   */
  JsonFlattenSpec flattenSpec;

  public JsonParseSpec() {
  }

  public JsonParseSpec(DimensionsSpec dimensionSpec, TimestampSpec timestampSpec) {
    super(dimensionSpec, timestampSpec);
  }

  public void setFlattenSpec(List<JsonFileFormat.JsonFlatten> flattenRules) {

    if (CollectionUtils.isEmpty(flattenRules)) {
      return;
    }

    List<JsonFlattenField> fields = Lists.newArrayList();

    for (JsonFileFormat.JsonFlatten flattenRule : flattenRules) {
      fields.add(new JsonFlattenField.PathFlattenField(flattenRule.getName(), flattenRule.getExpr()));
    }

    flattenSpec = new JsonFlattenSpec(fields);
  }

  public JsonParseSpec(String timestamp, String format, String... dimensions) {
    super(new DimensionsSpec(Lists.newArrayList(dimensions)), new TimestampSpec(timestamp, format));
  }

  public DimensionsSpec getDimensionsSpec() {
    return dimensionsSpec;
  }

  public void setDimensionsSpec(DimensionsSpec dimensionSpec) {
    this.dimensionsSpec = dimensionSpec;
  }

  public TimestampSpec getTimestampSpec() {
    return timestampSpec;
  }

  public void setTimestampSpec(TimestampSpec timestampSpec) {
    this.timestampSpec = timestampSpec;
  }

  public JsonFlattenSpec getFlattenSpec() {
    return flattenSpec;
  }

  public void setFlattenSpec(JsonFlattenSpec flattenSpec) {
    this.flattenSpec = flattenSpec;
  }
}
