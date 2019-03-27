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
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.query.druid.queries;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.Map;

import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.SpatialOperations;

@JsonTypeName("choropleth")
public class ChoroplethMapQuery extends Query {

  /*

   */
  GroupByQuery query;

  String pointColumn;

  SelectStreamQuery boundary;

  String boundaryColumn;

  Map<String, String> boundaryJoin;

  SpatialOperations operation;

  Map<String, Object> context;

  public ChoroplethMapQuery() {
  }

  public ChoroplethMapQuery(GroupByQuery query,
                            String pointColumn,
                            SelectStreamQuery boundary,
                            String boundaryColumn,
                            Map<String, String> boundaryJoin,
                            Map<String, Object> context) {
    this.query = query;
    this.pointColumn = pointColumn;
    this.boundary = boundary;
    this.boundaryColumn = boundaryColumn;
    this.boundaryJoin = boundaryJoin;
    this.context = context;
  }

  public Query getQuery() {
    return query;
  }

  public String getPointColumn() {
    return pointColumn;
  }

  public SelectStreamQuery getBoundary() {
    return boundary;
  }

  public String getBoundaryColumn() {
    return boundaryColumn;
  }

  public Map<String, String> getBoundaryJoin() {
    return boundaryJoin;
  }

  public SpatialOperations getOperation() {
    return operation;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public static ChoroplethMapQueryBuilder builder() {
    return new ChoroplethMapQueryBuilder();
  }
}
