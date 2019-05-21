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

package app.metatron.discovery.query.druid;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.QueryHistoryTeller;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ExcelResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;
import app.metatron.discovery.domain.datasource.data.forward.OrcResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ParquetResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MapField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.BoundFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.*;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.UnixTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.LayerView;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.query.druid.aggregations.AreaAggregation;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMaxAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMinAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.aggregations.HyperUniqueAggregation;
import app.metatron.discovery.query.druid.aggregations.RangeAggregation;
import app.metatron.discovery.query.druid.aggregations.SketchAggregation;
import app.metatron.discovery.query.druid.aggregations.VarianceAggregation;
import app.metatron.discovery.query.druid.datasource.QueryDataSource;
import app.metatron.discovery.query.druid.datasource.TableDataSource;
import app.metatron.discovery.query.druid.extractionfns.LookupFunction;
import app.metatron.discovery.query.druid.filters.*;
import app.metatron.discovery.query.druid.funtions.CastFunc;
import app.metatron.discovery.query.druid.funtions.DateTimeMillisFunc;
import app.metatron.discovery.query.druid.funtions.InFunc;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;
import app.metatron.discovery.query.druid.limits.WindowingSpec;
import app.metatron.discovery.query.druid.lookup.MapLookupExtractor;
import app.metatron.discovery.query.druid.postaggregations.ArithmeticPostAggregation;
import app.metatron.discovery.query.druid.postaggregations.FieldAccessorPostAggregator;
import app.metatron.discovery.query.druid.postaggregations.SketchQuantilePostAggregator;
import app.metatron.discovery.query.druid.postaggregations.StddevPostAggregator;
import app.metatron.discovery.query.druid.queries.JoinQuery;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.IndexVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;
import app.metatron.discovery.query.polaris.ComputationalField;
import app.metatron.discovery.util.PolarisUtils;
import app.metatron.discovery.util.TimeUnits;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.CONFUSING_FIELD_CODE;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.DIMENSION;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;
import static app.metatron.discovery.domain.datasource.data.forward.ResultForward.ForwardType.CSV;
import static app.metatron.discovery.domain.datasource.data.forward.ResultForward.ForwardType.EXCEL;
import static app.metatron.discovery.domain.datasource.data.forward.ResultForward.ForwardType.JSON;
import static app.metatron.discovery.domain.datasource.data.forward.ResultForward.ForwardType.NONE;
import static app.metatron.discovery.domain.datasource.data.forward.ResultForward.ForwardType.PARQUET;
import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;

/**
 * Abstarct Query Builder
 */
public abstract class AbstractQueryBuilder {

  /**
   * Default Intervals, Define if interval is null.
   */
  public static final List<String> DEFAULT_INTERVALS = Lists.newArrayList("1900-01-01T00:00:00.0Z/2051-01-01T00:00:00.0Z");

  public static final String VC_COLUMN_GEO_COORD = "__geom.vc";

  public static final String GEOMETRY_COLUMN_NAME = "__geometry";

  public static final String GEOMETRY_BOUNDARY_COLUMN_NAME = "__geomBoundary";

  /**
   * Partition 관련 처리, 추후 지원여부 확인 필요
   */
  public static final String PATTERN_POST_STRING = "\\s*==\\s*'*([^\\s)']+)";

  public static final String PATTERN_FIELD_NAME_STRING = "([a-zA-Z_][0-9a-zA-Z_\\-]+\\" + FIELD_NAMESPACE_SEP + ")*%s$";

  protected List<String> targetPartitionPostfixs = Lists.newArrayList();

  protected Map<String, Set<String>> partitionMap = Maps.newLinkedHashMap();

  /**
   * Query DataSource
   */
  protected DataSource dataSource;

  /**
   * Meta-info for main datasource.
   */
  protected app.metatron.discovery.domain.datasource.DataSource mainMetaDataSource;

  /**
   * Meta-info for join datasources
   */
  protected List<app.metatron.discovery.domain.datasource.DataSource> joinMetaDataSources = Lists.newArrayList();

  /**
   * Meta-info Map (for multi-datasource)
   */
  protected Map<String, app.metatron.discovery.domain.datasource.DataSource> metaDataSourceMap = Maps.newHashMap();

  /**
   * Meta field map in meta-datasources
   */
  protected Map<String, app.metatron.discovery.domain.datasource.Field> metaFieldMap = Maps.newLinkedHashMap();

  /**
   * 추가적인 검토 필요
   */
  protected Map<String, VirtualColumn> virtualColumnsValueFieldNames = Maps.newHashMap();

  /**
   * 엔진에서 인식하는 필드명 집합
   */
  protected Set<String> validColumnNames = Sets.newHashSet();

  /**
   * 사용자 정의 필드 맵
   */
  protected Map<String, UserDefinedField> userFieldsMap = Maps.newHashMap();

  /**
   * Join Query 인지 여부
   */
  protected Boolean isJoinQuery = false;

  /**
   * 선언된 Projection Fields
   */
  protected List<Field> projections;

  /**
   * 엔진 내 Virtrual Column 선언 Map : Spec 작성시 저장 용도
   */
  protected Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();

  /**
   * 사용하지 않는 UserDefined Virtual Column Name
   */
  protected List<String> unUsedVirtualColumnName = Lists.newArrayList();

  protected List<Aggregation> aggregations = Lists.newArrayList();

  protected List<PostAggregation> postAggregations = Lists.newArrayList();

  /**
   * need to process user defined field
   */
  protected List<WindowingSpec> windowingSpecs = Lists.newArrayList();

  /**
   * process min/max
   */
  protected List<String> minMaxFields = Lists.newArrayList();

  /**
   * Target map view layer
   */
  protected MapViewLayer mapViewLayer;

  /**
   * Geometry Field
   */
  protected app.metatron.discovery.domain.datasource.Field geometry;

  /**
   * need to geojson format
   */
  protected boolean geoJsonFormat;

  /**
   * case of disabling dimension
   */
  protected boolean disableDimension;

  /**
   * 엔진에 질의할 때 필요한 추가 정보
   */
  protected Map<String, Object> context = Maps.newHashMap();

  /**
   * 질의할 queryId, 캔슬시 활용
   */
  protected String queryId;

  public AbstractQueryBuilder() {
  }

  protected AbstractQueryBuilder(DataSource dataSource) {

    this.dataSource = dataSource;

    // Segmentmeta Query 의 경우 별로 datasource 메타정보가 필요없는 경우가 존재함
    if (dataSource.getMetaDataSource() == null
        && !(dataSource instanceof MultiDataSource)) {
      return;
    }


    // make list of field
    if (dataSource instanceof DefaultDataSource) {

      mainMetaDataSource = dataSource.getMetaDataSource();
      metaFieldMap.putAll(mainMetaDataSource.getMetaFieldMap(false, ""));

    } else if (dataSource instanceof MultiDataSource) {

      MultiDataSource multiDataSource = (MultiDataSource) dataSource;
      for (DataSource source : multiDataSource.getDataSources()) {
        metaFieldMap.putAll(source.getMetaDataSource().getMetaFieldMap(true, null));
        metaDataSourceMap.put(source.getName(), source.getMetaDataSource());
      }

      mainMetaDataSource = multiDataSource.getMetaDataSource();

    } else {

      mainMetaDataSource = dataSource.getMetaDataSource();

      MappingDataSource mappingDataSource = (MappingDataSource) dataSource;

      isJoinQuery = true;
      metaFieldMap.putAll(mainMetaDataSource.getMetaFieldMap(true, ""));
      mappingDataSource.getJoins().forEach(joinMapping -> visitJoinMapping(joinMapping));
    }

    validColumnNames.addAll(metaFieldMap.keySet());

    // QueryService 진입시 부여 받은 QueryId 주입
    queryId = CommonLocalVariable.getQueryId();

  }

  private void visitJoinMapping(JoinMapping joinMapping) {
    if (joinMapping == null) {
      return;
    }

    joinMetaDataSources.add(joinMapping.getMetaDataSource());

    if (joinMapping.getJoin() == null) {
      metaFieldMap.putAll(joinMapping.getMetaDataSource().getMetaFieldMap(true, ""));
    } else {
      metaFieldMap.putAll(joinMapping.getMetaDataSource().getMetaFieldMap(true, joinMapping.getJoinAlias()));

      JoinMapping childJoinMapping = joinMapping.getJoin();
      metaFieldMap.putAll(childJoinMapping.getMetaDataSource().getMetaFieldMap(true, joinMapping.getJoinAlias()));
    }

    visitJoinMapping(joinMapping.getJoin());
  }

  protected app.metatron.discovery.query.druid.datasource.DataSource getDataSourceSpec(DataSource dataSource) {
    if (dataSource instanceof DefaultDataSource) {
      return new TableDataSource(dataSource.getName());
    } else if (dataSource instanceof MultiDataSource) {
      return new TableDataSource(((MultiDataSource) dataSource).getMainDataSource().getName());
    } else {
      return new QueryDataSource(JoinQuery.builder(dataSource).build());
    }
  }

  protected void extractPartitions(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqfilters) {

    String partitionKeys = mainMetaDataSource.getPartitionKeys();
    if (StringUtils.isEmpty(partitionKeys)) {
      return;
    }

    // Initialize partitions
    List<String> keys = Arrays.asList(StringUtils.split(partitionKeys, ","));
    for (String key : keys) {
      partitionMap.put(key, Sets.newHashSet());
    }

    for (app.metatron.discovery.domain.workbook.configurations.filter.Filter reqFilter : reqfilters) {

      if (reqFilter instanceof InclusionFilter) {
        InclusionFilter inclusionFilter = (InclusionFilter) reqFilter;
        String fieldName = inclusionFilter.getField();

        if (keys.contains(fieldName)) {
          Set<String> partitionValues = partitionMap.get(fieldName);
          inclusionFilter.getValueList().forEach(
              value -> partitionValues.add(value)
          );
        }

      } else if (reqFilter instanceof ExpressionFilter) {

        ExpressionFilter expressionFilter = (ExpressionFilter) reqFilter;
        String expr = expressionFilter.getExpr();

        for (String key : keys) {
          Pattern p = Pattern.compile(key + PATTERN_POST_STRING);
          List<String> values = PolarisUtils.findMatchedValues(expr, p);

          Set<String> partitionValues = partitionMap.get(key);
          values.forEach(
              value -> partitionValues.add(value)
          );
        }

      }

    }
  }

  protected void enableMapLayer(MapViewLayer mapViewLayer) {
    this.mapViewLayer = mapViewLayer;
    this.geoJsonFormat = true;
    this.disableDimension = (mapViewLayer.getView() != null)
        && (mapViewLayer.getView() instanceof LayerView.ClusteringLayerView);

    if (dataSource instanceof MultiDataSource) {
      MultiDataSource multiDataSource = (MultiDataSource) dataSource;
      multiDataSource.electMainDataSource(mapViewLayer);
      mainMetaDataSource = multiDataSource.getMetaDataSource();

      // set ref, if 'ref' value in field is null
      // under the multi-datasource, field has to get 'ref' value.
      for (Field field : mapViewLayer.getFields()) {
        if (StringUtils.isEmpty(field.getRef())) {
          field.setRef(mapViewLayer.getRef());
        }
      }
    }

  }

  protected TimeFormatFunc createTimeFormatFunc(String fieldName, TimeFieldFormat originalTimeFormat, TimeFieldFormat timeFormat) {
    TimeFormatFunc timeFormatFunc;
    if (originalTimeFormat instanceof UnixTimeFormat) {
      CastFunc func = new CastFunc(fieldName, CastFunc.CastType.LONG);
      String expr = func.toExpression();
      if (((UnixTimeFormat) originalTimeFormat).getUnit() == TimeUnits.SECOND) {
        expr += expr + "* 1000";
      }

      timeFormatFunc = new TimeFormatFunc(expr,
                                          timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                          timeFormat.selectTimezone(),
                                          timeFormat.getLocale());

    } else {
      if (timeFormat instanceof ContinuousTimeFormat
          && ((ContinuousTimeFormat) timeFormat).getUnit() == TimeFieldFormat.TimeUnit.NONE) {
        // convert original time format, if unit is NONE
        ((ContinuousTimeFormat) timeFormat).setOriginalFormat(originalTimeFormat.getFormat());
      }

      timeFormatFunc = new TimeFormatFunc("\"" + fieldName + "\"",
                                          originalTimeFormat.getFormat(),
                                          originalTimeFormat.selectTimezone(),
                                          originalTimeFormat.getLocale(),
                                          timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                          timeFormat.selectTimezone(),
                                          timeFormat.getLocale());

    }

    return timeFormatFunc;
  }


  protected List<String> getAllOutputFieldName() {

    if (projections != null) {
      return projections.stream()
                        .map(field -> field.getAlias())
                        .collect(Collectors.toList());
    }

    return Lists.newArrayList();
  }

  protected List<Field> getAllFieldsByMapping() {

    final List<Field> fields = Lists.newArrayList();
    // true, if join datasource is not empty

    // Add field of main datasource
    fields.addAll(mainMetaDataSource.getAllSpecFields(isJoinQuery, ""));

    if (!isJoinQuery) {
      return fields;
    }

    List<JoinMapping> joins = ((MappingDataSource) dataSource).getJoins();

    for (JoinMapping joinMapping : joins) {
      if (joinMapping.getJoin() == null) {
        fields.addAll(joinMapping.getMetaDataSource().getAllSpecFields(isJoinQuery, ""));
      } else {
        // Child Joinmapping 포함하여 추가
        fields.addAll(joinMapping.getMetaDataSource().getAllSpecFields(isJoinQuery, joinMapping.getJoinAlias()));

        JoinMapping childJoinMapping = joinMapping.getJoin();
        fields.addAll(childJoinMapping.getMetaDataSource().getAllSpecFields(isJoinQuery, joinMapping.getJoinAlias()));
      }
    }

    return fields;
  }

  public void setVirtualColumns(List<UserDefinedField> userFields) {

    if (CollectionUtils.isEmpty(userFields)) {
      return;
    }

    for (UserDefinedField userField : userFields) {

      // Set UserDefinedField Map for Building Query.
      userFieldsMap.put(userField.getName(), userField);

      if (userField instanceof MapField) {
        MapField mapField = (MapField) userField;
        IndexVirtualColumn column = new IndexVirtualColumn();
        column.setKeyDimension(mapField.getKeyField());
        column.setValueMetrics(mapField.getValueFields());
        column.setOutputName(mapField.getName());
        virtualColumns.put(mapField.getName(), column);
        if (StringUtils.isNotEmpty(mapField.getValueFieldName())) {
          virtualColumnsValueFieldNames.put(mapField.getValueFieldName(), column);
        }
      } else if (userField instanceof ExpressionField) {
        ExpressionField expressionField = (ExpressionField) userField;
        virtualColumns.put(expressionField.getColunm(),
                           new ExprVirtualColumn(expressionField.getExpr(), expressionField.getColunm()));
        unUsedVirtualColumnName.add(expressionField.getColunm());
      }

      // 사용자 정의 필드 명 추가
      validColumnNames.add(userField.getColunm());
    }

  }

  protected void setFilters(AndFilter filter,
                            List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqFilters,
                            List<String> intervals) {

    if (CollectionUtils.isEmpty(reqFilters)) {
      return;
    }

    for (app.metatron.discovery.domain.workbook.configurations.filter.Filter reqFilter : reqFilters) {

      if (isNotMainDataSourceColumn(reqFilter)) {
        continue;
      }

      String fieldName = checkColumnName(reqFilter.getColumn());
      String engineColumnName = engineColumnName(fieldName);
      if (!fieldName.equals(reqFilter.getColumn())) {
        reqFilter.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }


      if (reqFilter instanceof InclusionFilter) {

        InclusionFilter inclusionFilter = (InclusionFilter) reqFilter;

        if (CollectionUtils.isEmpty(inclusionFilter.getValueList())) {
          continue;
        }

        if (virtualColumns.containsKey(fieldName)) {
          if (virtualColumns.get(fieldName) instanceof IndexVirtualColumn) {
            IndexVirtualColumn indexVirtualColumn = (IndexVirtualColumn) virtualColumns.get(fieldName);
            indexVirtualColumn.setKeyFilter(new InFilter(fieldName, inclusionFilter.getValueList()));
          } else {
            filter.addField(new InFilter(inclusionFilter.getColumn(), inclusionFilter.getValueList()));
            unUsedVirtualColumnName.remove(fieldName);
          }
        } else {
          // Value Alias가 있는 경우 처리
          if (MapUtils.isNotEmpty(inclusionFilter.getValuePair())) {
            LookupFunction lookupFunction = new LookupFunction(new MapLookupExtractor(inclusionFilter.getValuePair()));

            OrFilter orFilter = new OrFilter();
            for (String value : inclusionFilter.getValueList()) {
              orFilter.addField(new SelectorFilter(inclusionFilter.getColumn(), value, lookupFunction));
            }

            filter.addField(orFilter);
          } else {
            filter.addField(new InFilter(engineColumnName, inclusionFilter.getValueList()));
          }
        }

      } else if (reqFilter instanceof ExpressionFilter) {

        ExpressionFilter expressionFilter = (ExpressionFilter) reqFilter;
        String expr = expressionFilter.getExpr();

        filter.addField(new ExprFilter(expr));

      } else if (reqFilter instanceof BoundFilter) {

        BoundFilter boundFilter = (BoundFilter) reqFilter;

        filter.addField(new ExprFilter(boundFilter.toExpr()));

      } else if (reqFilter instanceof LikeFilter) {

        LikeFilter likeFilter = (LikeFilter) reqFilter;

        filter.addField(new RegExpFilter(fieldName, PolarisUtils.convertSqlLikeToRegex(likeFilter.getExpr(), false)));

      } else if (reqFilter instanceof IntervalFilter) {

        IntervalFilter intervalFilter = (IntervalFilter) reqFilter;

        // 전체인 경우, 필터는 무의미함
        if (intervalFilter.getSelector() == IntervalFilter.SelectorType.ALL) {
          continue;
        }

        if (!metaFieldMap.containsKey(fieldName)) {
          continue;
        }

        app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);

        if (datasourceField.getRole() == TIMESTAMP) {
          intervals.addAll(intervalFilter.getEngineIntervals());
        } else if (datasourceField.getRole() == DIMENSION && datasourceField.getLogicalType() == LogicalType.TIMESTAMP) {
          OrFilter orFilter = new OrFilter();
          List<String> curIntervals = intervalFilter.getEngineIntervals();
          for (String interval : curIntervals) {
            String[] splitedInterval = StringUtils.split(interval, "/");
            String expr = String.format("(timestamp(%s, format='%s') >= timestamp('%s') && (timestamp(%s, format='%s') <= timestamp('%s')",
                                        engineColumnName, datasourceField.getTimeFormat(), splitedInterval[0], engineColumnName, datasourceField.getFormat(), splitedInterval[1]);

            orFilter.addField(new MathFilter(expr));
          }
          filter.addField(orFilter);
        } else {
          throw new QueryTimeExcetpion("Not support field type on interval filter");
        }
      } else if (reqFilter instanceof TimestampFilter) {

        TimestampFilter timestampFilter = (TimestampFilter) reqFilter;
        if (!metaFieldMap.containsKey(fieldName)) {
          continue;
        }

        app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);

        String field;
        if (datasourceField.getRole() == TIMESTAMP) {
          field = "__time";
        } else {
          DateTimeMillisFunc millisFunc = new DateTimeMillisFunc(engineColumnName,
                                                                 datasourceField.getTimeFormat(),
                                                                 null, null);
          field = millisFunc.toExpression();
        }

        TimeFieldFormat timeFormat = (TimeFieldFormat) timestampFilter.getTimeFormat();
        TimeFormatFunc timeFormatFunc = new TimeFormatFunc(field,
                                                           timeFormat.getFormat(),
                                                           timeFormat.selectTimezone(),
                                                           timeFormat.getLocale());

        InFunc inFunc = new InFunc(timeFormatFunc.toExpression(), timestampFilter.getSelectedTimestamps());

        filter.addField(new ExprFilter(inFunc.toExpression()));
      } else if (reqFilter instanceof SpatialFilter) {

        app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);
        if (!datasourceField.getLogicalType().isGeoType()) {
          return;
        }

        addSpatialFilter(filter, (SpatialFilter) reqFilter, datasourceField);

      } else if (reqFilter instanceof TimeFilter) {
        addTimeFilter(filter, (TimeFilter) reqFilter, intervals);
      }
    }

  }

  public void addSpatialFilter(AndFilter filter, SpatialFilter reqFilter, app.metatron.discovery.domain.datasource.Field datasourceField) {

    Filter spatialFilter = null;

    if (reqFilter instanceof SpatialBboxFilter) {
      SpatialBboxFilter reqBboxFilter = (SpatialBboxFilter) reqFilter;

      if (datasourceField.getLogicalType().isPoint()) {
        spatialFilter = new LucenePointFilter(reqBboxFilter);
      } else {
        spatialFilter = new LuceneSpatialFilter(reqBboxFilter);
      }
    } else if (reqFilter instanceof SpatialPointFilter) {
      spatialFilter = new LucenePointFilter((SpatialPointFilter) reqFilter, datasourceField.getLogicalType().isPoint());
    } else if (reqFilter instanceof SpatialShapeFilter) {
      if (datasourceField.getLogicalType().isPoint()) {
        spatialFilter = new LuceneLonLatPolygonFilter((SpatialShapeFilter) reqFilter, datasourceField.getLogicalType().isPoint());
      } else {
        spatialFilter = new LuceneSpatialFilter((SpatialShapeFilter) reqFilter, datasourceField.getLogicalType().isPoint());
      }
    } else {
      throw new IllegalArgumentException("Not support spatial filter");
    }

    filter.addField(spatialFilter);
  }

  public void addTimeFilter(AndFilter filter, TimeFilter timeFilter, List<String> intervals) {
    if (timeFilter instanceof TimeAllFilter) {
      // 전체 시간 범위를 의미하므로 추가의미 없음
      return;
    }

    String fieldName = timeFilter.getColumn();
    String engineColumnName = engineColumnName(fieldName);
    app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);

    if (datasourceField.getRole() == TIMESTAMP && !(timeFilter instanceof TimeListFilter)) {
      intervals.addAll(timeFilter.getEngineIntervals(datasourceField));
    } else {
      String expr = timeFilter.getExpression(engineColumnName, datasourceField);
      if (StringUtils.isNotEmpty(expr)) {
        filter.addField(new ExprFilter(timeFilter.getExpression(engineColumnName, datasourceField)));
      }
    }

  }

  private boolean isNotMainDataSourceColumn(app.metatron.discovery.domain.workbook.configurations.filter.Filter filter) {

    if (dataSource instanceof MultiDataSource) {
      if (!mainMetaDataSource.getEngineName().equals(filter.getDataSource())) {
        return true;
      }

      if (StringUtils.isEmpty(filter.getRef())) {
        filter.setRef(mainMetaDataSource.getEngineName());
      }
    }

    return false;
  }


  protected void addAggregationFunction(MeasureField measureField) {

    String fieldName = engineColumnName(measureField.getColunm());
    String aliasName = measureField.getAlias();
    String paramName = null;
    String dataType = "double";

    switch (measureField.getAggregationType()) {
      case NONE:
        break;
      case MIN:
        aggregations.add(new GenericMinAggregation(aliasName, fieldName, dataType));
        break;
      case MAX:
        aggregations.add(new GenericMaxAggregation(aliasName, fieldName, dataType));
        break;
      case COUNT:
        aggregations.add(new CountAggregation(aliasName));
        break;
      case COUNTD:
        aggregations.add(new HyperUniqueAggregation(aliasName, fieldName));
        break;
      case SUM:
        aggregations.add(new GenericSumAggregation(aliasName, fieldName, dataType));
        break;

      case AVG:
        String countField = measureField.getRef() == null ? "count" : measureField.getRef() + "." + "count";
        aggregations.add(new GenericSumAggregation(fieldName + "_sum", fieldName, dataType));

        if (!(dataSource instanceof MultiDataSource)
            && dataSource.getMetaDataSource().rollup()) {
          aggregations.add(new GenericSumAggregation("count", countField, dataType));
        } else {
          aggregations.add(new CountAggregation("count"));
        }

        ArithmeticPostAggregation postAggregation = new ArithmeticPostAggregation();
        postAggregation.setName(aliasName);
        postAggregation.setFn(ArithmeticPostAggregation.AggregationFunction.DIVISION);

        List<PostAggregation> postAggregationFields = new ArrayList<PostAggregation>();

        postAggregationFields.add(new FieldAccessorPostAggregator(fieldName + "_sum", fieldName + "_sum"));
        postAggregationFields.add(new FieldAccessorPostAggregator("count", "count"));

        postAggregation.setFields(postAggregationFields);

        postAggregations.add(postAggregation);
        break;
      case STDDEV:
        paramName = "aggregationfunc" + String.format("_%03d", aggregations.size());
        aggregations.add(new VarianceAggregation(paramName, fieldName));

        StddevPostAggregator stddevPostAggregator = new StddevPostAggregator(aliasName, paramName);
        postAggregations.add(stddevPostAggregator);
        break;
      case MEDIAN:
        // TODO: Field 메타 정보를 뒤져 approxHistogram 으로 preaggregation 되었는지 확인후 타입 결정
        // 현재는 preaggregation 고려하지 않음
        // http://druid.io/docs/latest/development/extensions-core/approximate-histograms.html
        paramName = "aggregationfunc" + String.format("_%03d", aggregations.size());
        aggregations.add(new SketchAggregation(paramName, fieldName, SketchAggregation.SKETCH_OP_QUANTILE));

        SketchQuantilePostAggregator medianPostAggregator = new SketchQuantilePostAggregator(aliasName, paramName, 0.5);
        postAggregations.add(medianPostAggregator);
        break;
      case AREA:
        aggregations.add(new AreaAggregation(aliasName, fieldName));
        break;
      case RANGE:
        aggregations.add(new RangeAggregation(aliasName, fieldName));
        break;
      case PERCENTILE:
        paramName = "aggregationfunc" + String.format("_%03d", aggregations.size());
        aggregations.add(new SketchAggregation(paramName, fieldName, SketchAggregation.SKETCH_OP_QUANTILE));

        SketchQuantilePostAggregator quantilePostAggregator = new SketchQuantilePostAggregator(aliasName, paramName, measureField.getParamValue("value"));
        postAggregations.add(quantilePostAggregator);
        break;
      case VARIATION:
        aggregations.add(new VarianceAggregation(aliasName, fieldName));
        break;
      case APPROX:
        break;
      case COMPLEX:
        break;
    }

    return;
  }

  protected void addUserDefinedAggregationFunction(MeasureField field) {

    ExpressionField expressionField = (ExpressionField) userFieldsMap.get(field.getName());

    String curExpr = expressionField.getExpr();

    switch (field.getAggregationType()) {

      case NONE:
        break;
      case MIN:
        curExpr = "minof(" + curExpr + ")";
        break;
      case MAX:
        curExpr = "maxof(" + curExpr + ")";
        break;
      case COUNT:
        curExpr = "countof(" + curExpr + ")";
        break;
      case SUM:
        curExpr = "sumof(" + curExpr + ")";
        break;
      case AVG:
        curExpr = "avgof(" + curExpr + ")";
        break;
      case STDDEV:
        curExpr = "stddevof(" + curExpr + ")";
        break;
      case MEDIAN:
        break;
      case AREA:
        break;
      case RANGE:
        break;
      case PERCENTILE:
        break;
      case VARIATION:
        curExpr = "varianceof(" + curExpr + ")";
        break;
      case APPROX:
        break;
      case COMPLEX:
        break;
    }

    // TODO: 파라미터도 추가해야함, 일단 기존 로직 유지
    Map<String, String> exprMap = userFieldsMap.values().stream()
                                               .filter(userDefinedField -> userDefinedField instanceof ExpressionField)
                                               .collect(Collectors.toMap(UserDefinedField::getName, f -> ((ExpressionField) f).getExpr()));

    ComputationalField.makeAggregationFunctionsIn(field.getAlias(), curExpr, aggregations
        , postAggregations, windowingSpecs, context, exprMap);

  }

  /**
   * Check field name.
   *
   * @param name valid field name.
   */
  public String checkColumnName(final String name) {

    // If it doesn't need a name.. ex ExpressionFilter
    if (StringUtils.isEmpty(name)) {
      return "";
    }

    // remove prefix, if default datasource get ref value in field or filter
    String checkName = name;
    if (dataSource instanceof DefaultDataSource) {
      String dataSourceStartWith = mainMetaDataSource.getEngineName() + FIELD_NAMESPACE_SEP;
      if (name.startsWith(dataSourceStartWith)) {
        checkName = StringUtils.removeStart(name, dataSourceStartWith);
      }
    }

    // to escape column name for regular expression
    String escapedName = PolarisUtils.escapeSpecialRegexChars(checkName);
    Pattern pattern = Pattern.compile(String.format(PATTERN_FIELD_NAME_STRING, escapedName));

    List<String> validColumn = validColumnNames.parallelStream()
                                               .filter(colName -> pattern.matcher(colName).matches())
                                               .collect(Collectors.toList());

    if (validColumn.size() == 1) {
      return validColumn.get(0);
    } else {
      throw new QueryTimeExcetpion(CONFUSING_FIELD_CODE, String.format("Confusing '%s' field name.", name));
    }
  }

  /**
   * Check field name.
   *
   * @param name valid field name.
   */
  protected String engineColumnName(final String name) {

    // If it doesn't need a name.. ex ExpressionFilter
    if (StringUtils.isEmpty(name)) {
      return "";
    }

    String dataSourceStartWith = mainMetaDataSource.getEngineName() + FIELD_NAMESPACE_SEP;
    if (!isJoinQuery && name.startsWith(dataSourceStartWith)) {
      return StringUtils.removeStart(name, dataSourceStartWith);
    }

    return name;
  }

  protected ExprVirtualColumn concatPointExprColumn(String engineColumnName, String outputName) {
    String lat = engineColumnName + "." + LogicalType.GEO_POINT.getGeoPointKeys().get(0);
    String lon = engineColumnName + "." + LogicalType.GEO_POINT.getGeoPointKeys().get(1);
    String concatExpr = "concat('POINT (', \"" + lon + "\", ' ', \"" + lat + "\",')')";

    return new ExprVirtualColumn(concatExpr, outputName);
  }

  protected void addContext(String key, Object value) {
    if (context == null) {
      context = Maps.newHashMap();
    }
    context.put(key, value);
  }

  protected void addContext(Map<String, Object> property) {
    if (context == null) {
      context = Maps.newHashMap();
    }
    context.putAll(property);
  }

  protected void setForwardContext(ResultForward resultForward) {
    if (resultForward instanceof JsonResultForward) {
      addJsonContext((JsonResultForward) resultForward);
      /* for history */
      QueryHistoryTeller.setForwardType(JSON);
    } else if (resultForward instanceof CsvResultForward) {
      addCsvContext((CsvResultForward) resultForward);
      /* for history */
      QueryHistoryTeller.setForwardType(CSV);
    } else if (resultForward instanceof ExcelResultForward) {
      addExcelContext((ExcelResultForward) resultForward);
      /* for history */
      QueryHistoryTeller.setForwardType(EXCEL);
    } else if (resultForward instanceof ParquetResultForward) {
      // TODO: Druid 에서 준비가 되면 구성
      /* for history */
      QueryHistoryTeller.setForwardType(PARQUET);
    } else {
      /* for history */
      QueryHistoryTeller.setForwardType(NONE);
    }
  }

  protected void addQueryId(String queryId) {
    addContext("queryId", queryId);
  }

  private void addCsvContext(CsvResultForward resultForward) {
    addContext("forwardURL", resultForward.getForwardUrl());
    Map<String, Object> csvContext = Maps.newHashMap();
    csvContext.put("withHeader", resultForward.isHasHeader());
    csvContext.put("format", "csv");
    csvContext.put("columns", StringUtils.join(getAllOutputFieldName(), ","));
    addContext("forwardContext", csvContext);
  }

  private void addJsonContext(JsonResultForward resultForward) {
    addContext("forwardURL", resultForward.getForwardUrl());
    Map<String, Object> csvContext = Maps.newHashMap();
    csvContext.put("format", "json");
    csvContext.put("wrapAsList", resultForward.isWrapAsList());
    csvContext.put("columns", StringUtils.join(getAllOutputFieldName(), ","));
    addContext("forwardContext", csvContext);
  }

  private void addExcelContext(ExcelResultForward resultForward) {
    addContext("forwardURL", resultForward.getForwardUrl());
    Map<String, Object> context = Maps.newHashMap();
    context.put("format", "excel");
    context.put("cleanup", "true");
    context.put("maxRowsPerSheet", resultForward.getMaxRowsPerSheet());
    context.put("columns", StringUtils.join(getAllOutputFieldName(), ","));
    addContext("forwardContext", context);
  }

  private void addOrcContext(OrcResultForward resultForward) {
    addContext("forwardURL", resultForward.getForwardUrl());
    Map<String, Object> orcContext = Maps.newHashMap();
    orcContext.put("format", "orc");
    orcContext.put("columns", StringUtils.join(getAllOutputFieldName(), ","));
    addContext("forwardContext", orcContext);
  }

  public abstract Query build();

}
