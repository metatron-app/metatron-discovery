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

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Aggregation;

@JsonTypeName("approxHistogram")
public class ApproxHistogramAggregation implements Aggregation {

  @NotNull
  String name;

  @NotNull
  String fieldName;

  Integer resolution;

  Integer numBuckets;

  Float lowerLimit;

  Float upperLimit;


  public ApproxHistogramAggregation(@NotNull String name, @NotNull String fieldName) {
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

  public Integer getResolution() {
    return resolution;
  }

  public void setResolution(Integer resolution) {
    this.resolution = resolution;
  }

  public Integer getNumBuckets() {
    return numBuckets;
  }

  public void setNumBuckets(Integer numBuckets) {
    this.numBuckets = numBuckets;
  }

  public Float getLowerLimit() {
    return lowerLimit;
  }

  public void setLowerLimit(Float lowerLimit) {
    this.lowerLimit = lowerLimit;
  }

  public Float getUpperLimit() {
    return upperLimit;
  }

  public void setUpperLimit(Float upperLimit) {
    this.upperLimit = upperLimit;
  }

  @Override
  public String toString() {
    return "ApproxHistogramAggregation{" +
            "name='" + name + '\'' +
            ", fieldName='" + fieldName + '\'' +
            '}';
  }

}
