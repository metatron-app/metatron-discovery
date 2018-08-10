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

@JsonTypeName("sketch")
public class SketchAggregation implements Aggregation {

  public static final String SKETCH_OP_QUANTILE = "QUANTILE";

  String name;

  String fieldName;

  Integer sketchParam = 1024;

  String sketchOp;

  public SketchAggregation() {
  }

  public SketchAggregation(String name, String fieldName, String sketchOp) {
    this.name = name;
    this.fieldName = fieldName;
    this.sketchOp = sketchOp;
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

  public Integer getSketchParam() {
    return sketchParam;
  }

  public void setSketchParam(Integer sketchParam) {
    this.sketchParam = sketchParam;
  }

  public String getSketchOp() {
    return sketchOp;
  }

  public void setSketchOp(String sketchOp) {
    this.sketchOp = sketchOp;
  }

  @Override
  public String getName() {
    return name;
  }
}
