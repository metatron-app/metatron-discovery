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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Aggregation;

@JsonTypeName("cardinality")
public class CardinalityAggregation implements Aggregation {
  @NotNull
  String name;

  @NotNull
  List<String> fieldNames;

  String predicate;

  @JsonProperty(defaultValue = "false")
  @JsonInclude(JsonInclude.Include.NON_NULL)
  boolean byRow;

  public CardinalityAggregation() {
  }

  public CardinalityAggregation(@NotNull String name, @NotNull List<String> fieldNames, boolean byRow) {
    this.name = name;
    this.fieldNames = fieldNames;
    this.byRow = byRow;
  }

  public CardinalityAggregation(String name, List<String> fieldNames, String predicate, boolean byRow) {
    this.name = name;
    this.fieldNames = fieldNames;
    this.predicate = predicate;
    this.byRow = byRow;
  }


  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getFieldNames() {
    return fieldNames;
  }

  public void setFieldNames(List<String> fieldNames) {
    this.fieldNames = fieldNames;
  }

  public String getPredicate() {
    return predicate;
  }

  public void setPredicate(String predicate) {
    this.predicate = predicate;
  }

  public boolean isByRow() {
    return byRow;
  }

  public void setByRow(boolean byRow) {
    this.byRow = byRow;
  }
}
