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

package app.metatron.discovery.domain.datasource.ingestion.file;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.io.Serializable;
import java.util.List;

/**
 * Json File Format
 */
@JsonTypeName("json")
public class JsonFileFormat implements FileFormat {

  /**
   * allows nested JSON fields to be flattened during ingestion time, only supporting JsonPath notation
   */
  List<JsonFlatten> flattenRules;

  public JsonFileFormat() {
  }

  @JsonCreator
  public JsonFileFormat(@JsonProperty("flattenRules") List<JsonFlatten> flattenRules) {
    this.flattenRules = flattenRules;
  }

  @Override
  public String getInputFormat() {
    return null;
  }

  public List<JsonFlatten> getFlattenRules() {
    return flattenRules;
  }

  @Override
  public String toString() {
    return "JsonFileFormat{" +
        "flattenRules=" + flattenRules +
        '}';
  }

  /**
   * Specify rule of json flatten
   */
  public static class JsonFlatten implements Serializable {
    /**
     * name for field name
     */
    String name;

    /**
     * JsonPath expression
     */
    String expr;

    public JsonFlatten() {
      // Empty Constructor
    }

    @JsonCreator
    public JsonFlatten(@JsonProperty("name") String name,
                   @JsonProperty("expr") String expr) {
      this.name = name;
      this.expr = expr;
    }

    public String getName() {
      return name;
    }

    public String getExpr() {
      return expr;
    }

    @Override
    public String toString() {
      return "JsonFlatten{" +
          "name='" + name + '\'' +
          ", expr='" + expr + '\'' +
          '}';
    }
  }
}
