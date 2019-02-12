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

package app.metatron.discovery.domain.geo.query.model;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.geo.query.model.extension.AggregationExtension;
import app.metatron.discovery.domain.geo.query.model.extension.ViewExtension;
import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.BBox;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.OrOperator;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsBetween;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.BoundFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.ExpressionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialBboxFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeAllFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeListFilter;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoBoundaryFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoHashFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoJoinFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.dimensions.LookupDimension;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.filters.ExprFilter;
import app.metatron.discovery.query.druid.filters.InFilter;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;
import app.metatron.discovery.query.druid.lookup.MapLookupExtractor;
import app.metatron.discovery.query.druid.postaggregations.ExprPostAggregator;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

import static app.metatron.discovery.domain.datasource.Field.FieldRole;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

/**
 * Builder Geo Server WFS Query </br>
 *
 * http://docs.geoserver.org/latest/en/user/services/wfs/reference.html
 */
public class GeoQueryBuilder extends AbstractQueryBuilder {

  String srsName;

  List<PropertyName> propertyNames;

  GeoFilter geoFilter;

  List<Dimension> dimensions = Lists.newArrayList();

  AndFilter engineFilter = new AndFilter();

  String mainDataSource;

  String boundary;

  Map<String, Object> boundaryJoin;

  Map<String, String> projectionMapper = Maps.newHashMap();

  List<String> minMaxFields = Lists.newArrayList();

  boolean enableAggrExtension = false;

  int limit = 10000;

  public GeoQueryBuilder() {
  }

  public GeoQueryBuilder(DataSource dataSource) {
    super(dataSource);

    // TODO: Deciding where to place the type information of the coordinate system
    srsName = "EPSG:4326";
  }

  public GeoQueryBuilder initVirtualColumns(List<UserDefinedField> userFields) {

    setVirtualColumns(userFields);

    return this;
  }

  public GeoQueryBuilder projections(List<Field> projections) {

    if (propertyNames == null) {
      propertyNames = Lists.newArrayList();
    }

    setMainDataSource(projections);

    enableAggrExtension = needAggregationExtension(projections);

    int measureCnt = 1;
    int dimensionCnt = 1;
    int geoCnt = 1;
    for (Field field : projections) {

      String fieldName = checkColumnName(field.getColunm());
      String originalName = field.getName();
      String alias = field.getAlias();

      if (userFieldsMap.containsKey(originalName)) {
        UserDefinedField userDefinedField = userFieldsMap.get(originalName);
        if (!(userDefinedField instanceof ExpressionField)) {
          continue;
        }

        ExpressionField exprField = (ExpressionField) userDefinedField;
        if (field instanceof DimensionField) {
          String dummyDimName = "__s" + dimensionCnt++;

          dimensions.add(new DefaultDimension(fieldName, dummyDimName));
          projectionMapper.put(dummyDimName, alias);

          unUsedVirtualColumnName.remove(fieldName);

        } else if (field instanceof MeasureField) {
          MeasureField measureField = (MeasureField) field;
          String dummyMeasureName = "__d" + measureCnt++;

          if (exprField.isAggregated()) {
            addUserDefinedAggregationFunction((MeasureField) field);
            postAggregations.add(new ExprPostAggregator(dummyMeasureName + "=\\\"" + alias + "\\\""));
            projectionMapper.put(dummyMeasureName, alias);

            if (!exprField.isAggregated()) {
              unUsedVirtualColumnName.remove(fieldName);
            }
          } else {
            dimensions.add(new DefaultDimension(fieldName, dummyMeasureName));
            projectionMapper.put(dummyMeasureName, alias);
            unUsedVirtualColumnName.remove(fieldName);
          }

          minMaxFields.add(alias);
        }
        continue;
      }

      if (!metaFieldMap.containsKey(fieldName)) {
        throw new QueryTimeExcetpion("Invalid field name: " + fieldName);
      }

      app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);
      FieldFormat fieldFormat = field.getFormat();

      if (datasourceField.getRole() == FieldRole.DIMENSION) {

        if (MapUtils.isNotEmpty(field.getValuePair())) {
          String dummyDimName = "__s" + dimensionCnt++;

          dimensions.add(new LookupDimension(fieldName,
                                             dummyDimName,
                                             new MapLookupExtractor(field.getValuePair())));
          projectionMapper.put(dummyDimName, alias);
          continue;
        }

        if (datasourceField.getLogicalType() == LogicalType.GEO_POINT) {

          if (fieldFormat instanceof GeoHashFormat) {
            GeoHashFormat geoHashFormat = (GeoHashFormat) fieldFormat;

            String dummyDimName = "__s" + dimensionCnt++;
            String geoName = "__g" + geoCnt++;

            virtualColumns.put(dummyDimName, new ExprVirtualColumn(geoHashFormat.toHashExpression(field.getName()), dummyDimName));
            dimensions.add(new DefaultDimension(dummyDimName));
            postAggregations.add(new ExprPostAggregator(geoHashFormat.toWktExpression(dummyDimName, geoName)));

          } else if (fieldFormat instanceof GeoBoundaryFormat) {
            GeoBoundaryFormat boundaryFormat = (GeoBoundaryFormat) fieldFormat;
            boundary = boundaryFormat.toBoundary();
            boundaryJoin = boundaryFormat.toBoundaryJoin(projectionMapper, geoCnt++, dimensionCnt++);

          } else {
            for (String geoPointKey : LogicalType.GEO_POINT.getGeoPointKeys()) {
              String propName = fieldName + "." + geoPointKey;
              propertyNames.add(new PropertyName(propName));
            }
            //dimensions.add(new DefaultDimension(field.getColunm(), field.getAlias()));
          }
        } else if (datasourceField.getLogicalType() == LogicalType.GEO_POLYGON) {
          if (fieldFormat instanceof GeoJoinFormat) {
            continue;  // ignore
          }
          propertyNames.add(new PropertyName(fieldName));

        } else if (datasourceField.getLogicalType() == LogicalType.GEO_LINE) {
          propertyNames.add(new PropertyName(fieldName));

        } else if (datasourceField.getLogicalType() == LogicalType.TIMESTAMP) {

          TimeFieldFormat timeFormat = getTimeFieldFormat(field.getFormat(), datasourceField.getFormatObject());

          String dummyDimName = "__s" + dimensionCnt++;
          String innerFieldName = alias + Query.POSTFIX_INNER_FIELD;

          TimeFormatFunc timeFormatFunc = new TimeFormatFunc("\"" + fieldName + "\"",
                                                             datasourceField.getTimeFormat(),
                                                             null,
                                                             null,
                                                             timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                                             timeFormat.selectTimezone(),
                                                             timeFormat.getLocale());

          ExprVirtualColumn exprVirtualColumn = new ExprVirtualColumn(timeFormatFunc.toExpression(), innerFieldName);
          virtualColumns.put(innerFieldName, exprVirtualColumn);
          dimensions.add(new DefaultDimension(innerFieldName, dummyDimName));
          projectionMapper.put(dummyDimName, alias);

        } else {  // Case of Normal Dimension
          if (checkIgnore(field.getRef())) {
            continue;
          }

          propertyNames.add(new PropertyName(fieldName));
          projectionMapper.put(fieldName, field.getAlias());
          //dimensions.add(new DefaultDimension(fieldName, field.getAlias()));
        }
      } else if (datasourceField.getRole() == FieldRole.MEASURE) {

        if (checkIgnore(field.getRef())) {
          continue;
        }

        MeasureField measureField = (MeasureField) field;

        if (enableAggrExtension && measureField.getAggregationType() != MeasureField.AggregationType.NONE) {
          if (postAggregations == null) {
            postAggregations = Lists.newArrayList();
          }
          addAggregationFunction(measureField);

          String predefinedMeasure = "__d" + measureCnt++;
          postAggregations.add(new ExprPostAggregator(predefinedMeasure + "=\\\"" + alias + "\\\""));
          projectionMapper.put(predefinedMeasure, alias);
        } else {
          propertyNames.add(new PropertyName(originalName));
          projectionMapper.put(originalName, alias);
        }
        minMaxFields.add(alias);

      } else if (datasourceField.getRole() == FieldRole.TIMESTAMP) {
        TimestampField timestampField = (TimestampField) field;
        TimeFieldFormat timeFormat = getTimeFieldFormat(field.getFormat(), datasourceField.getFormatObject());

        String dummyDimName = "__s" + dimensionCnt++;
        String innerFieldName = alias + Query.POSTFIX_INNER_FIELD;
        String predefinedFieldName = timestampField.getPredefinedColumn(dataSource instanceof MappingDataSource);

        TimeFormatFunc timeFormatFunc = new TimeFormatFunc(predefinedFieldName,
                                                           timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                                           timeFormat.selectTimezone(),
                                                           timeFormat.getLocale());

        ExprVirtualColumn exprVirtualColumn = new ExprVirtualColumn(timeFormatFunc.toExpression(), innerFieldName);
        virtualColumns.put(innerFieldName, exprVirtualColumn);
        dimensions.add(new DefaultDimension(innerFieldName, dummyDimName));
        projectionMapper.put(dummyDimName, alias);
      }
    }

    return this;
  }

  private boolean checkIgnore(String dataSource) {

    if (UserDefinedField.REF_NAME.equals(dataSource)) {
      return false;
    }

    if (StringUtils.isNotEmpty(dataSource) && !mainDataSource.equals(dataSource)) {
      return true;
    }

    return false;
  }

  private TimeFieldFormat getTimeFieldFormat(FieldFormat shelfFormat, FieldFormat dataSourceFormat) {
    if (shelfFormat != null && shelfFormat instanceof TimeFieldFormat) {
      return (TimeFieldFormat) shelfFormat;
    }

    if (dataSourceFormat != null && dataSourceFormat instanceof TimeFieldFormat) {
      return (TimeFieldFormat) dataSourceFormat;
    } else {
      return new CustomDateTimeFormat(TimeFieldFormat.DEFAULT_DATETIME_FORMAT);
    }
  }

  private boolean needAggregationExtension(List<Field> fields) {

    for (Field field : fields) {
      if (field.getFormat() instanceof GeoJoinFormat
          || field.getFormat() instanceof GeoBoundaryFormat
          || field.getFormat() instanceof GeoHashFormat) {
        return true;
      }
    }

    return false;
  }

  private void setMainDataSource(List<Field> projections) {
    if (dataSource instanceof MultiDataSource) {
      for (Field field : projections) {
        if (field.getFormat() instanceof GeoFormat
            && !(field.getFormat() instanceof GeoJoinFormat)) {
          mainDataSource = field.getRef();
        }
      }
    } else {
      mainDataSource = dataSource.getName();
    }
  }

  public GeoQueryBuilder limit(Limit limit) {
    if (limit == null) {
      return this;
    }

    this.limit = limit.getLimit();
    return this;
  }

  public GeoQueryBuilder filters(List<Filter> filters) {

    if (geoFilter == null) {
      geoFilter = new GeoFilter();
    }

    if (CollectionUtils.isEmpty(filters)) {
      return this;
    }

    AndOperator andOperator = new AndOperator();

    for (Filter filter : filters) {

      if (checkIgnore(filter.getRef())) {
        continue;
      }

      String name = filter.getField();

      if (filter instanceof InclusionFilter) {
        List<String> values = ((InclusionFilter) filter).getValueList();
        if (CollectionUtils.isEmpty(values)) {
          continue;
        }

        if (UserDefinedField.REF_NAME.equals(filter.getRef())) {
          String columnName = filter.getColumn();
          if (!virtualColumns.containsKey(columnName)) {
            continue;
          }
          engineFilter.addField(new InFilter(columnName, values));
          unUsedVirtualColumnName.remove(columnName);
        } else {
          OrOperator orOperator = new OrOperator();
          for (String value : values) {
            orOperator.addFilter(new PropertyIsEqualTo(name, value));
          }
          andOperator.addLogicalOperator(orOperator);
        }
      } else if (filter instanceof BoundFilter) {
        BoundFilter boundFilter = (BoundFilter) filter;
        andOperator.addFilter(new PropertyIsBetween(name,
                                                    boundFilter.getMin().toString(),
                                                    boundFilter.getMax().toString()));
      } else if (filter instanceof TimeFilter) {
        addTimeFilter(andOperator, (TimeFilter) filter);
      } else if (filter instanceof SpatialFilter) {
        addSpatialFilter(andOperator, (SpatialFilter) filter);
      } else if (filter instanceof ExpressionFilter) {
        engineFilter.addField(new ExprFilter(((ExpressionFilter) filter).getExpr()));
      }
    }

    geoFilter.addLogicalOperator(andOperator);

    return this;
  }

  private void addSpatialFilter(AndOperator andOperator, SpatialFilter spatialFilter) {
    String columnName = spatialFilter.getColumn();
    app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(columnName);

    if (spatialFilter instanceof SpatialBboxFilter) {
      if (datasourceField.getLogicalType() != LogicalType.GEO_POINT) {
        return;
      }

      SpatialBboxFilter bboxFilter = (SpatialBboxFilter) spatialFilter;
      andOperator.addFilter(new BBox(datasourceField.getName() + ".coord", bboxFilter.getLowerCorner(), bboxFilter.getUpperCorner()));
    }
  }

  private void addTimeFilter(AndOperator andOperator, TimeFilter timeFilter) {

    if (timeFilter instanceof TimeAllFilter) {
      return;
    }

    String columnName = timeFilter.getColumn();
    app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(columnName);

    if (datasourceField.getRole() == TIMESTAMP && !(timeFilter instanceof TimeListFilter)) {
      OrOperator orOperator = new OrOperator();
      for (String engineInterval : timeFilter.getEngineIntervals(datasourceField)) {
        String[] spiltedTimes = StringUtils.split(engineInterval, "/");
        orOperator.addFilter(new PropertyIsBetween("__time", DateTime.parse(spiltedTimes[0]).getMillis() + "", DateTime.parse(spiltedTimes[1]).getMillis() + ""));
      }
      andOperator.addLogicalOperator(orOperator);
    } else {
      String expr = timeFilter.getExpression(columnName, datasourceField);
      if (StringUtils.isNotEmpty(expr)) {
        engineFilter.addField(new ExprFilter(timeFilter.getExpression(columnName, datasourceField)));
      }
    }

  }

  public GeoQuery build() {

    String queryTypeName = GeoQuery.PREFIX_TYPE_NAME + mainDataSource;

    GeoQuery geoQuery = new GeoQuery(queryTypeName, srsName);
    geoQuery.setFilter(geoFilter);

    if (CollectionUtils.isNotEmpty(propertyNames)) {
      geoQuery.addPropertyName(propertyNames.toArray(new PropertyName[propertyNames.size()]));
    }

    if (virtualColumns != null) {
      // 먼저, 사용하지 않는 사용자 정의 컬럼 삭제
      for (String removeColumnName : unUsedVirtualColumnName) {
        virtualColumns.remove(removeColumnName);
      }

      // Replace double quote in expression
      virtualColumns.forEach((s, virtualColumn) -> {
        if (!(virtualColumn instanceof ExprVirtualColumn)) {
          return;
        }
        ExprVirtualColumn exprVirtualColumn = (ExprVirtualColumn) virtualColumn;
        exprVirtualColumn.setExpression(
            StringUtils.replace(exprVirtualColumn.getExpression(), "\"", "\\\"")
        );
      });
    }

    // Replace double quote in expr filter
    if (engineFilter != null && CollectionUtils.isNotEmpty(engineFilter.getFields())) {
      for (app.metatron.discovery.query.druid.Filter filter : engineFilter.getFields()) {
        if (filter instanceof ExprFilter) {
          ExprFilter exprFilter = (ExprFilter) filter;
          exprFilter.setExpression(
              StringUtils.replace(exprFilter.getExpression(), "\"", "\\\"")
          );
        }
      }
    }

    if (enableAggrExtension) {
      // remove deprecated name 'count', need refactoring
      boolean existCount = false;
      List<Aggregation> rmvAggrs = Lists.newArrayList();
      for (Aggregation aggregation : aggregations) {
        if ("count".equals(aggregation.getName())) {
          if (existCount) {
            rmvAggrs.add(aggregation);
          } else {
            existCount = true;
          }
        }
      }
      if (CollectionUtils.isNotEmpty(rmvAggrs)) {
        aggregations.removeAll(rmvAggrs);
      }

      geoQuery.setExtension(new AggregationExtension(Lists.newArrayList(virtualColumns.values()), engineFilter,
                                                     dimensions, aggregations, postAggregations,
                                                     boundary, boundaryJoin));
    } else {
      geoQuery.setExtension(new ViewExtension(Lists.newArrayList(virtualColumns.values()), engineFilter,
                                              dimensions, aggregations, postAggregations));
    }

    geoQuery.setProjectionMapper(projectionMapper);
    geoQuery.setMinMaxFields(minMaxFields);
    geoQuery.setLimit(limit);

    return geoQuery;
  }
}
