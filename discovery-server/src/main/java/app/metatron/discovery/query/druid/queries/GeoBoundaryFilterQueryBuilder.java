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

import com.google.common.collect.Maps;

import java.util.Map;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.SpatialOperations;

public class GeoBoundaryFilterQueryBuilder {

  Query query;

  String pointColumn;

  String shapeColumn;

  SelectStreamQuery boundary;

  String boundaryColumn;

  SpatialOperations operation;

  Map<String, Object> context;

  public GeoBoundaryFilterQueryBuilder() {
  }

  public GeoBoundaryFilterQueryBuilder query(Query query) {
    this.query = query;
    return this;
  }

  public GeoBoundaryFilterQueryBuilder boundary(SelectStreamQuery query, String boundaryColumn) {
    this.boundary = query;
    this.boundaryColumn = boundaryColumn;
    return this;
  }

  public GeoBoundaryFilterQueryBuilder boundary(SpatialOperations operation) {
    this.operation = operation;
    return this;
  }

  public GeoBoundaryFilterQueryBuilder context(String key, Object value) {
    if (context == null) {
      context = Maps.newLinkedHashMap();
    }

    context.put(key, value);

    return this;
  }

  public GeoBoundaryFilterQueryBuilder geometry(Field geometry) {
    if (geometry.getLogicalType() == LogicalType.GEO_POINT) {
      this.pointColumn = geometry.getName() + ".coord";
    } else {
      this.shapeColumn = geometry.getName();
    }

    return this;
  }

  public GeoBoundaryFilterQueryBuilder point(String pointColumn) {
    this.pointColumn = pointColumn + ".coord";
    return this;
  }

  public GeoBoundaryFilterQueryBuilder shape(String shapeColumn) {
    this.shapeColumn = shapeColumn;
    return this;
  }

  public GeoBoundaryFilterQuery build() {

    GeoBoundaryFilterQuery geoBoundaryQuery = new GeoBoundaryFilterQuery(
        query,
        pointColumn,
        shapeColumn,
        boundary,
        boundaryColumn,
        operation,
        context
    );

    return geoBoundaryQuery;
  }


}
