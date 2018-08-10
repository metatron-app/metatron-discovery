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

import java.util.List;

import app.metatron.discovery.query.druid.Aggregation;

@JsonTypeName("javascript")
public class JavaScriptAggregation implements Aggregation{
  String name;
  List<String> fieldNames;
  String fnAggregate;
  String fnCombine;
  String fnReset;

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

  public String getFnAggregate() {
    return fnAggregate;
  }

  public void setFnAggregate(String fnAggregate) {
    this.fnAggregate = fnAggregate;
  }

  public String getFnCombine() {
    return fnCombine;
  }

  public void setFnCombine(String fnCombine) {
    this.fnCombine = fnCombine;
  }

  public String getFnReset() {
    return fnReset;
  }

  public void setFnReset(String fnReset) {
    this.fnReset = fnReset;
  }
}
