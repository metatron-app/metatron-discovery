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
import app.metatron.discovery.query.druid.SpatialOperations;

public class ChoroplethMapQueryBuilder {

  GroupByQuery query;

  String pointColumn;

  String shapeColumn;

  SelectStreamQuery boundary;

  String boundaryColumn;

  SpatialOperations operation;

  Map<String, String> boundaryJoin = Maps.newLinkedHashMap();

  Map<String, Object> context = Maps.newLinkedHashMap();

  String queryId;

  public ChoroplethMapQueryBuilder() {
    queryId = CommonLocalVariable.getQueryId();
  }

  public ChoroplethMapQueryBuilder query(GroupByQuery query) {
    this.query = query;
    return this;
  }

  public ChoroplethMapQueryBuilder boundary(SelectStreamQuery query, String boundaryColumn) {
    this.boundary = query;
    this.boundaryColumn = boundaryColumn;

    for (String column : boundary.getColumns()) {
      this.boundaryJoin.put(column, column);
    }

    return this;
  }

  public ChoroplethMapQueryBuilder context(String key, Object value) {
    if (context == null) {
      context = Maps.newLinkedHashMap();
    }

    context.put(key, value);

    return this;
  }

  public ChoroplethMapQueryBuilder geometry(Field geometry) {
    if (geometry.getLogicalType() == LogicalType.GEO_POINT) {
      this.pointColumn = geometry.getName() + ".coord";
    } else {
      this.shapeColumn = geometry.getName();
    }

    return this;
  }

  public ChoroplethMapQueryBuilder point(String pointColumn) {
    this.pointColumn = pointColumn + ".coord";
    return this;
  }

  public ChoroplethMapQueryBuilder shape(String shapeColumn) {
    this.shapeColumn = shapeColumn;
    return this;
  }

  public ChoroplethMapQueryBuilder operation(GeoSpatialOperation geoSpatialOperation) {

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

  public ChoroplethMapQuery build() {

    if (StringUtils.isNotEmpty(queryId)) {
      context.put("queryId", queryId);
    }

    ChoroplethMapQuery choroplethMapQuery = new ChoroplethMapQuery(
        query,
        pointColumn,
        boundary,
        boundaryColumn,
        boundaryJoin,
        context
    );

    return choroplethMapQuery;
  }


}
