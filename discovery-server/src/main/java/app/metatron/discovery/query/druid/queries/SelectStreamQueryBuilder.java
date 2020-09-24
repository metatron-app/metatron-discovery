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

package app.metatron.discovery.query.druid.queries;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialOperation;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.*;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.funtions.*;
import app.metatron.discovery.query.druid.limits.OrderByColumn;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import static app.metatron.discovery.domain.workbook.configurations.Sort.Direction.ASC;
import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;

/**
 * Builder for select.stream query specification
 */
public class SelectStreamQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private List<String> columns = Lists.newArrayList();

  private List<String> intervals = Lists.newArrayList();

  private Boolean descending = false;

  private String concatString = ",";

  private List<OrderByColumn> orderingSpecs;

  private int limit;

  private Map<String, String> fieldMapper = Maps.newLinkedHashMap();


  public SelectStreamQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  /**
   * Set Layer view for geo column
   */
  public SelectStreamQueryBuilder layer(MapViewLayer mapViewLayer) {
    enableMapLayer(mapViewLayer);
    return this;
  }

  public SelectStreamQueryBuilder initVirtualColumns(List<UserDefinedField> userDefinedFields) {
    setVirtualColumns(userDefinedFields);
    return this;
  }

  /**
   * @param reqFields
   * @return
   */
  public SelectStreamQueryBuilder fields(List<Field> reqFields) {

    // 별도 forward context 추가시 Projection 항목 지정 위함
    projections = reqFields;

    // If fields are empty in the search query, it will get field information from datasource.
    if (CollectionUtils.isEmpty(reqFields)) {
      reqFields = Lists.newArrayList(getAllFieldsByMapping());
    }

    for (Field reqField : reqFields) {

      String fieldName = checkColumnName(reqField.getColunm());
      String engineColumnName = engineColumnName(fieldName);

      if (!fieldName.equals(reqField.getColunm())) {
        reqField.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }

      String aliasName = reqField.getAlias();

      if (UserDefinedField.REF_NAME.equals(reqField.getRef())) {
        columns.add(fieldName);
        fieldMapper.put(fieldName, aliasName);
        continue;
      }

      if (reqField instanceof DimensionField) {

        DimensionField dimensionField = (DimensionField) reqField;
        app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);

        FieldFormat originalFormat = datasourceField.getFormatObject();

        if (datasourceField == null) {
          throw new QueryTimeExcetpion("'" + fieldName + "' not found  in datasource ( " + dataSource.getName() + " )");
        }

        // In case of GEO Type
        if (datasourceField.getLogicalType().isGeoType()) {

          String geoColumnName = geoJsonFormat ? GEOMETRY_COLUMN_NAME : aliasName;

          if (datasourceField.getLogicalType() == LogicalType.GEO_POINT) {
            virtualColumns.put(VC_COLUMN_GEO_COORD, concatPointExprColumn(engineColumnName, VC_COLUMN_GEO_COORD));
            columns.add(VC_COLUMN_GEO_COORD);

            fieldMapper.put(VC_COLUMN_GEO_COORD, geoColumnName);
          } else {
            columns.add(engineColumnName);

            fieldMapper.put(engineColumnName, geoColumnName);
          }

          // set geometry
          geometry = datasourceField;

          continue;
        }

        // ValueAlias Part, Processing by existing format or type is ignored
        if (MapUtils.isNotEmpty(dimensionField.getValuePair())) {
          String lookupColumn = engineColumnName + ".lookup.vc";
          LookupMapFunc lookupMapFunc = new LookupMapFunc(engineColumnName, dimensionField.getValuePair(), false, null);
          virtualColumns.put(lookupColumn, new ExprVirtualColumn(lookupMapFunc.toExpression(), lookupColumn));

          columns.add(lookupColumn);
          fieldMapper.put(lookupColumn, aliasName);
          continue;
        }

        FieldFormat format = dimensionField.getFormat();
        if (format != null && datasourceField.getLogicalType() == LogicalType.TIMESTAMP) {
          TimeFieldFormat originalTimeFormat = (TimeFieldFormat) originalFormat;
          TimeFieldFormat timeFormat = (TimeFieldFormat) format;

          TimeFormatFunc timeFormatFunc = createTimeFormatFunc(engineColumnName, originalTimeFormat, timeFormat);

          String formatColumnName = engineColumnName + ".vc";
          virtualColumns.put(formatColumnName, new ExprVirtualColumn(timeFormatFunc.toExpression(), formatColumnName));

          columns.add(formatColumnName);
          fieldMapper.put(formatColumnName, aliasName);
          continue;

        }

        columns.add(engineColumnName);
        fieldMapper.put(engineColumnName, aliasName);

      } else if (reqField instanceof MeasureField) {
        columns.add(engineColumnName);
        fieldMapper.put(engineColumnName, aliasName);
        minMaxFields.add(aliasName);
      } else if (reqField instanceof TimestampField) {

        if (!this.metaFieldMap.containsKey(fieldName)) {
          continue;
        }

        app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);
        TimeFieldFormat originalTimeFormat = (TimeFieldFormat) datasourceField.getFormatObject();

        TimestampField timestampField = (TimestampField) reqField;
        TimeFieldFormat timeFormat = (TimeFieldFormat) timestampField.getFormat();
        if (timeFormat == null) {
          timeFormat = originalTimeFormat;
        }

        TimeFormatFunc timeFormatFunc = new TimeFormatFunc(
                timestampField.getPredefinedColumn(dataSource instanceof MappingDataSource),
                timeFormat.getFormat(),
                timeFormat.selectTimezone(),
                timeFormat.getLocale());
        String formatColumnName = engineColumnName + ".vc";
        virtualColumns.put(formatColumnName, new ExprVirtualColumn(timeFormatFunc.toExpression(), formatColumnName));

        columns.add(formatColumnName);
        fieldMapper.put(formatColumnName, aliasName);
      }
    }

    return this;
  }

  public SelectStreamQueryBuilder compareLayer(List<Field> fields, GeoSpatialOperation operation) {

    for (Field field : fields) {
      String fieldName = checkColumnName(field.getColunm());
      String engineColumnName = engineColumnName(fieldName);
      if (metaFieldMap.get(fieldName).getLogicalType().isGeoType()) {
        geometry = metaFieldMap.get(fieldName);
      } else {
        columns.add(engineColumnName);
        fieldMapper.put(engineColumnName, field.getAlias());
      }
    }

    if (operation.getBuffer() > 0) {

      if (geometry.getLogicalType().isShape()) {
        String fromWktName = "__shapeFromWKT";
        virtualColumns.put(fromWktName,
                new ExprVirtualColumn(new ShapeFromWktFunc(geometry.getName()).toExpression(), fromWktName));

        ShapeBufferFunc bufferFunc = new ShapeBufferFunc(fromWktName, operation.getBuffer(),
                ShapeBufferFunc.EndCapStyle.FLAT);
        virtualColumns.put(GEOMETRY_BOUNDARY_COLUMN_NAME,
                new ExprVirtualColumn(new ShapeToWktFunc(bufferFunc.toExpression()).toExpression(),
                        GEOMETRY_BOUNDARY_COLUMN_NAME));
      } else {
        String fromLatLonName = "__shapeFromLatLon";
        virtualColumns.put(fromLatLonName,
                new ExprVirtualColumn(new ShapeFromLatLonFunc(geometry.getName()).toExpression(), fromLatLonName));

        ShapeBufferFunc bufferFunc = new ShapeBufferFunc(fromLatLonName, operation.getBuffer(), null);
        virtualColumns.put(GEOMETRY_BOUNDARY_COLUMN_NAME,
                new ExprVirtualColumn(new ShapeToWktFunc(bufferFunc.toExpression()).toExpression(),
                        GEOMETRY_BOUNDARY_COLUMN_NAME));
      }

    } else {
      if (geometry.getLogicalType().isShape()) {
        virtualColumns.put(GEOMETRY_BOUNDARY_COLUMN_NAME,
                new ExprVirtualColumn(geometry.getName(), GEOMETRY_BOUNDARY_COLUMN_NAME));
      } else {
        virtualColumns.put(GEOMETRY_BOUNDARY_COLUMN_NAME,
                concatPointExprColumn(geometry.getName(), GEOMETRY_BOUNDARY_COLUMN_NAME));
      }
    }

    columns.add(GEOMETRY_BOUNDARY_COLUMN_NAME);
    fieldMapper.put(GEOMETRY_BOUNDARY_COLUMN_NAME, GEOMETRY_COLUMN_NAME);

    return this;
  }

  public SelectStreamQueryBuilder columns(List<String> columns) {
    this.columns.addAll(columns);
    return this;
  }

  public SelectStreamQueryBuilder columns(String... columns) {
    this.columns.addAll(Lists.newArrayList(columns));
    return this;
  }

  public SelectStreamQueryBuilder virtualColumns(ExprVirtualColumn... virtualColumns) {
    for (ExprVirtualColumn virtualColumn : virtualColumns) {
      this.virtualColumns.put(virtualColumn.getOutputName(), virtualColumn);
    }
    return this;
  }

  public SelectStreamQueryBuilder filters(
          List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqfilters) {

    extractPartitions(reqfilters);

    setFilters(filter, reqfilters, intervals);

    return this;
  }

  public SelectStreamQueryBuilder limit(Limit reqLimit) {

    if (reqLimit != null) {
      limit = reqLimit.getLimit();
      orderingSpecs = Lists.newArrayList();

      if (reqLimit.getSort() != null) {
        for (Sort sort : reqLimit.getSort()) {
          if (!fieldMapper.containsValue(sort.getField())) {
            continue;
          }
          String originalFieldName = getFieldMapperByValue(sort.getField());
          if (originalFieldName == null) {
            continue;
          }

          // Specified null value in dimensionOrder because error occurs if order column is measure field.
          orderingSpecs.add(new OrderByColumn(originalFieldName,
                  sort.getDirection() == ASC ? OrderByColumn.DIRECTION.ASCENDING : OrderByColumn.DIRECTION.DESCENDING,
                  null));
        }
      }

    } else {
      limit = 1000;
    }

    return this;
  }

  public String getFieldMapperByValue(Object value) {
    for (String key : fieldMapper.keySet()) {
      if (fieldMapper.get(key).equals(value)) {
        return key;
      }
    }
    return null;
  }

  public SelectStreamQueryBuilder forward(ResultForward resultForward) {

    setForwardContext(resultForward);

    return this;
  }

  public SelectStreamQueryBuilder queryId(String queryId) {
    this.queryId = queryId;
    return this;
  }

  public SelectStreamQueryBuilder emptyQueryId() {
    queryId = null;

    return this;
  }

  @Override
  public SelectStreamQuery build() {

    SelectStreamQuery streamQuery = new SelectStreamQuery();

    streamQuery.setDataSource(getDataSourceSpec(dataSource));
    streamQuery.setColumns(columns);
    streamQuery.setGeometry(geometry);

    if (filter.isEmpty()) {
      streamQuery.setFilter(null);
    } else {
      streamQuery.setFilter(filter);
    }

    if (virtualColumns != null) {
      streamQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    if (CollectionUtils.isEmpty(intervals)) {
      streamQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      streamQuery.setIntervals(intervals);
    }

    streamQuery.setDefaultLimitSize(limit);

    streamQuery.setOrderingSpecs(orderingSpecs);

    streamQuery.setDescending(descending);

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    streamQuery.setContext(context);
    streamQuery.setFieldMapper(fieldMapper);

    return streamQuery;

  }
}
