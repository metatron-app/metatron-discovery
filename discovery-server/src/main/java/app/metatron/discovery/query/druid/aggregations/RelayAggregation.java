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

@JsonTypeName("relay")
public class RelayAggregation implements Aggregation {

  String name;

  String typeName;

  String columnName;

  String relayType;

  public RelayAggregation() {
  }

  public RelayAggregation(String name, String typeName) {
    this.name = name;
    this.typeName = typeName;
  }

  public RelayAggregation(String name, String columnName, String typeName) {
    this.name = name;
    this.typeName = typeName;
    this.columnName = columnName;
  }

  public RelayAggregation(String name, String columnName, String typeName, String relayType) {
    this.name = name;
    this.columnName = columnName;
    this.typeName = typeName;
    this.relayType = relayType;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getTypeName() {
    return typeName;
  }

  public void setTypeName(String typeName) {
    this.typeName = typeName;
  }

  public String getColumnName() {
    return columnName;
  }

  public String getRelayType() {
    return relayType;
  }

  public enum Relaytype {
    FIRST, LAST;
  }
}
