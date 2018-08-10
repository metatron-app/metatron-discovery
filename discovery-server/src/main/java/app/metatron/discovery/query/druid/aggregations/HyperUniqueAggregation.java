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

package app.metatron.discovery.query.druid.aggregations;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Aggregation;

@JsonTypeName("hyperUnique")
public class HyperUniqueAggregation implements Aggregation {

  String name;

  String fieldName;

  /**
   * isInputHyperUnique can be set to true to index pre-computed HLL (Base64 encoded output from druid-hll is expected).
   * The isInputHyperUnique field only affects ingestion-time behavior, and is ignored at query time.
   */
  Boolean isInputHyperUnique;

  public HyperUniqueAggregation(String name, String fieldName) {
    this.name = name;
    this.fieldName = fieldName;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getFieldName() {
    return fieldName;
  }

  public void setFieldName(String fieldName) {
    this.fieldName = fieldName;
  }
}
