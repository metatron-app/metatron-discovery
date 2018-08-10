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

@JsonTypeName("longMax")
public class LongMaxAggregation implements Aggregation {
  @NotNull
  String name;

  String fieldName;

  String fieldExpression;

  public LongMaxAggregation(@NotNull String name, @NotNull String fieldName) {
    this.name = name;
    this.fieldName = fieldName;
  }

  public LongMaxAggregation(@NotNull String name, String fieldName, String fieldExpression) {
    this.name = name;
    this.fieldName = fieldName;
    this.fieldExpression = fieldExpression;
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

  public String getFieldExpression() {
    return fieldExpression;
  }

  public void setFieldExpression(String fieldExpression) {
    this.fieldExpression = fieldExpression;
  }

  @Override
  public String toString() {
    return "LongMaxAggregation{" +
            "name='" + name + '\'' +
            ", fieldName='" + fieldName + '\'' +
            ", fieldExpression='" + fieldExpression + '\'' +
            '}';
  }
}
