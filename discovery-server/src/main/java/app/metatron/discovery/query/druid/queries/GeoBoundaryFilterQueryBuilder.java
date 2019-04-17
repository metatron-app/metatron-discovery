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

import org.apache.commons.lang3.StringUtils;

import java.util.Map;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialOperation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.SpatialOperations;

public class GeoBoundaryFilterQueryBuilder {

  Query query;

  String pointColumn;

  String shapeColumn;

  SelectStreamQuery boundary;

  String boundaryColumn;

  Boolean boundaryUnion;

  Map<String, String> boundaryJoin;

  SpatialOperations operation;

  Map<String, Object> context = Maps.newLinkedHashMap();

  String queryId;

  public GeoBoundaryFilterQueryBuilder() {
    queryId = CommonLocalVariable.getQueryId();
  }

  public GeoBoundaryFilterQueryBuilder query(Query query) {
    this.query = query;
    return this;
  }

  public GeoBoundaryFilterQueryBuilder boundary(SelectStreamQuery query, String boundaryColumn, boolean choropleth) {
    this.boundary = query;
    this.boundaryColumn = boundaryColumn;

    if (choropleth) {
      boundaryUnion = false;
      this.boundaryJoin = Maps.newLinkedHashMap();
      for (String column : boundary.getColumns()) {
        this.boundaryJoin.put(column, column);
      }
    }

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
      this.shapeColumn = geometry.getName() + ".shape";
    }

    return this;
  }

  public GeoBoundaryFilterQueryBuilder point(String pointColumn) {
    this.pointColumn = pointColumn + ".coord";
    return this;
  }

  public GeoBoundaryFilterQueryBuilder shape(String shapeColumn) {
    this.shapeColumn = shapeColumn + ".shape";
    return this;
  }

  public GeoBoundaryFilterQueryBuilder operation(GeoSpatialOperation geoSpatialOperation) {

    if (geoSpatialOperation instanceof GeoSpatialOperation.Within) {
      if (StringUtils.isNotEmpty(pointColumn)) {
        this.operation = SpatialOperations.CONTAINS; // not support WITHIN if base geometry is type of point
      } else {
        this.operation = SpatialOperations.WITHIN;
      }
    } else if (geoSpatialOperation instanceof GeoSpatialOperation.Intersects) {
      if (StringUtils.isNotEmpty(pointColumn)) {
        this.operation = SpatialOperations.CONTAINS; // not support INTERSECTS if base geometry is type of point
      } else {
        this.operation = SpatialOperations.INTERSECTS;
      }
    } else {
      throw new IllegalArgumentException("Invalid operation");
    }
    return this;
  }

  public GeoBoundaryFilterQuery build() {

    if (StringUtils.isNotEmpty(queryId)) {
      context.put("queryId", queryId);
    }

    GeoBoundaryFilterQuery geoBoundaryQuery = new GeoBoundaryFilterQuery(
        query,
        pointColumn,
        shapeColumn,
        boundary,
        boundaryColumn,
        boundaryUnion,
        boundaryJoin,
        operation,
        10,
        context
    );

    return geoBoundaryQuery;
  }


}
