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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.query.druid.aggregations;


import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Aggregation;

@JsonTypeName("thetaSketch")
public class DistinctSketchAggregation implements Aggregation {

  @NotNull
  String name;

  @NotNull
  String fieldName;

  Long size;

  Boolean shouldFinalize;

  public DistinctSketchAggregation() {
  }

  public DistinctSketchAggregation(String name, String fieldName, Long size, Boolean shouldFinalize) {
    this.name = name;
    this.fieldName = fieldName;
    this.size = size;
    this.shouldFinalize = shouldFinalize;
  }

  @Override
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

  public Long getSize() {
    return size;
  }

  public void setSize(Long size) {
    this.size = size;
  }

  public Boolean getShouldFinalize() {
    return shouldFinalize;
  }

  public void setShouldFinalize(Boolean shouldFinalize) {
    this.shouldFinalize = shouldFinalize;
  }

  @Override
  public String toString() {
    return "GenericSumAggregation{" +
            "name='" + name + '\'' +
            ", fieldName='" + fieldName + '\'' +
            ", size='" + size + '\'' +
            ", shouldFinalize='" + shouldFinalize + '\'' +
            '}';
  }
}