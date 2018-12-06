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

package app.metatron.discovery.query.druid.queries;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.PivotResultFormat;
import app.metatron.discovery.domain.datasource.data.result.SearchResultFormat;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.LikeFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.MeasureInequalityFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.MeasurePositionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.WildCardFilter;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.DefaultFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.Having;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.PostProcessor;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.dimensions.ExtractionDimension;
import app.metatron.discovery.query.druid.dimensions.LookupDimension;
import app.metatron.discovery.query.druid.extractionfns.ExpressionFunction;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.funtions.CaseFunc;
import app.metatron.discovery.query.druid.funtions.CastFunc;
import app.metatron.discovery.query.druid.funtions.RunningSumFunc;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.query.druid.havings.EqualTo;
import app.metatron.discovery.query.druid.havings.GreaterThan;
import app.metatron.discovery.query.druid.havings.GreaterThanOrEqual;
import app.metatron.discovery.query.druid.havings.LessThan;
import app.metatron.discovery.query.druid.havings.LessThanOrEqual;
import app.metatron.discovery.query.druid.limits.DefaultLimit;
import app.metatron.discovery.query.druid.limits.OrderByColumn;
import app.metatron.discovery.query.druid.limits.PivotWindowingSpec;
import app.metatron.discovery.query.druid.lookup.MapLookupExtractor;
import app.metatron.discovery.query.druid.model.HoltWintersPostProcessor;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;
import app.metatron.discovery.query.druid.postprocessor.PostAggregationProcessor;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

import static app.metatron.discovery.domain.datasource.data.CandidateQueryRequest.RESULT_VALUE_NAME_PREFIX;
import static app.metatron.discovery.domain.workbook.configurations.Sort.Direction.ASC;
import static app.metatron.discovery.domain.workbook.configurations.Sort.Direction.DESC;
import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;
import static app.metatron.discovery.domain.workbook.configurations.filter.MeasurePositionFilter.PositionType.BOTTOM;
import static app.metatron.discovery.domain.workbook.configurations.filter.WildCardFilter.ContainsType.AFTER;
import static app.metatron.discovery.domain.workbook.configurations.filter.WildCardFilter.ContainsType.BEFORE;
import static app.metatron.discovery.domain.workbook.configurations.filter.WildCardFilter.ContainsType.BOTH;
import static app.metatron.discovery.query.druid.Query.RESERVED_WORD_COUNT;

/**
 *
 */
public class GroupByQueryBuilder extends AbstractQueryBuilder {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupByQueryBuilder.class);

  private AndFilter filter = new AndFilter();

  private List<Dimension> dimensions = Lists.newArrayList();

  private GroupingSet groupingSet;

  private Set<String> outputColumns = Sets.newLinkedHashSet();

  private Granularity granularity;

  private app.metatron.discovery.query.druid.Limit limitSpec;

  private List<OrderByColumn> orderByColumns = Lists.newArrayList();

  private Map<String, String> sortFieldMap = Maps.newHashMap();

  private Map<String, String> sortFormatMap = Maps.newHashMap();

  private List<String> intervals = Lists.newArrayList();

  private PostProcessor postProcessor;

  private Having having;

  private List<String> percentPartitionExprs = Lists.newArrayList(
      "#_ = " + new RunningSumFunc("_").toExpression(),
      "concat(_, '" + ChartResultFormat.POSTFIX_PERCENTAGE + "') = "
          + new CaseFunc("#_ == 0",
                         0.0,
                         new CastFunc("_", CastFunc.CastType.DOUBLE).toExpression() + " / #_ * 100").toExpression()
  );

  public GroupByQueryBuilder(app.metatron.discovery.domain.workbook.configurations.datasource.DataSource dataSource) {
    super(dataSource);
  }

  public GroupByQueryBuilder initVirtualColumns(List<UserDefinedField> customFields) {

    setVirtualColumns(customFields);

    return this;
  }

  public GroupByQueryBuilder fields(List<Field> reqFields) {

    Preconditions.checkArgument(CollectionUtils.isNotEmpty(reqFields), "Required fields.");

    // 별도 forward context 추가시 Projection 항목 지정 위함
    projections = reqFields;

    for (Field field : reqFields) {

      String fieldName = checkColumnName(field.getColunm());
      if (!fieldName.equals(field.getColunm())) {
        field.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }
      String aliasName = field.getAlias();
      String refName = field.getRef();


      // outputColumns 입력
      outputColumns.add(aliasName);

      if (field instanceof DimensionField) {

        // for virtual column
        if (UserDefinedField.REF_NAME.equals(refName) && virtualColumns.containsKey(fieldName)) {
          dimensions.add(new DefaultDimension(fieldName, aliasName));
          unUsedVirtualColumnName.remove(fieldName);
          continue;
        }

        if (!metaFieldMap.containsKey(fieldName)) {
          LOGGER.debug("Not included field({}) in the datasource information.", fieldName);
          continue;
        }

        // for base data source
        app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);
        DimensionField dimensionField = (DimensionField) field;
        FieldFormat format = dimensionField.getFormat();

        // ValueAlias 처리, 기존 format 이나 Type 별 처리는 무시됨
        if (MapUtils.isNotEmpty(dimensionField.getValuePair())) {
          dimensions.add(new LookupDimension(fieldName,
                                             aliasName,
                                             new MapLookupExtractor(dimensionField.getValuePair())));
          continue;
        }

        switch (datasourceField.getLogicalType()) {
          case STRING:
            if (format != null && format instanceof DefaultFormat) {
              dimensions.add(new ExtractionDimension(fieldName,
                                                     aliasName,
                                                     new ExpressionFunction(((DefaultFormat) format).getFormat(), fieldName)));
            } else {
              dimensions.add(new DefaultDimension(fieldName, aliasName));
            }
            break;

          case TIMESTAMP:
            TimeFieldFormat timeFormat = (TimeFieldFormat) format;

            String innerFieldName = aliasName + Query.POSTFIX_INNER_FIELD;

            TimeFormatFunc timeFormatFunc = new TimeFormatFunc("\"" + fieldName + "\"",
                                                               datasourceField.getTimeFormat(),
                                                               null,
                                                               null,
                                                               timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                                               timeFormat.getTimeZone(),
                                                               timeFormat.getLocale());

            ExprVirtualColumn exprVirtualColumn = new ExprVirtualColumn(timeFormatFunc.toExpression(), innerFieldName);
            virtualColumns.put(aliasName, exprVirtualColumn);
            dimensions.add(new DefaultDimension(innerFieldName, aliasName));

            sortFormatMap.put(aliasName, timeFormat.getFormat());

            // PostProcessing 으로 본래 필드 Format 으로 변경
            if (timeFormat.enableSortField()) {

              if (postProcessor == null) {
                postProcessor = new PostAggregationProcessor();
              }

              if (postProcessor instanceof PostAggregationProcessor) {
                // Sort 를 위한 Format 으로 모든 연산 수행 후, 최종 클라이언트가 지정한 Format 으로 변경
                TimeFormatFunc postFormatFunc = new TimeFormatFunc("\"" + aliasName + "\"",
                                                                   timeFormat.getSortFormat(),
                                                                   null,
                                                                   null,
                                                                   timeFormat.getFormat(),
                                                                   timeFormat.getTimeZone(),
                                                                   timeFormat.getLocale());

                ((PostAggregationProcessor) postProcessor)
                    .addPostAggregation(
                        new MathPostAggregator(aliasName, postFormatFunc.toExpression(), null)
                    );
              }
            }

            break;
          default:
            dimensions.add(new DefaultDimension(fieldName, aliasName, datasourceField.getLogicalType()));
        }
      } else if (field instanceof MeasureField) {

        if (UserDefinedField.REF_NAME.equals(refName) && virtualColumns.containsKey(fieldName)) {
          addUserDefinedAggregationFunction((MeasureField) field);
          //
          virtualColumns.remove(fieldName);
          unUsedVirtualColumnName.remove(fieldName);
        } else {
          addAggregationFunction((MeasureField) field);
        }
      } else if (field instanceof TimestampField) {

        TimestampField timestampField = (TimestampField) field;
        TimeFieldFormat timeFormat = (TimeFieldFormat) timestampField.getFormat();

        String innerFieldName = aliasName + Query.POSTFIX_INNER_FIELD;
        String predefinedFieldName = timestampField.getPredefinedColumn(dataSource instanceof MappingDataSource);

        TimeFormatFunc timeFormatFunc = new TimeFormatFunc(predefinedFieldName,
                                                           timeFormat.enableSortField() ? timeFormat.getSortFormat() : timeFormat.getFormat(),
                                                           timeFormat.getTimeZone(),
                                                           timeFormat.getLocale());

        ExprVirtualColumn exprVirtualColumn = new ExprVirtualColumn(timeFormatFunc.toExpression(), innerFieldName);
        virtualColumns.put(aliasName, exprVirtualColumn);
        dimensions.add(new DefaultDimension(innerFieldName, aliasName));

        sortFormatMap.put(aliasName, timeFormat.getFormat());

        // PostProcessing 으로 본래 필드 Format 으로 변경
        if (timeFormat.enableSortField()) {

          if (postProcessor == null) {
            postProcessor = new PostAggregationProcessor();
          }

          if (postProcessor instanceof PostAggregationProcessor) {
            // Sort 를 위한 Format 으로 모든 연산 수행 후, 최종 클라이언트가 지정한 Format 으로 변경
            TimeFormatFunc postFormatFunc = new TimeFormatFunc("\"" + aliasName + "\"",
                                                               timeFormat.getSortFormat(),
                                                               null,
                                                               null,
                                                               timeFormat.getFormat(),
                                                               timeFormat.getTimeZone(),
                                                               timeFormat.getLocale());

            ((PostAggregationProcessor) postProcessor)
                .addPostAggregation(
                    new MathPostAggregator(aliasName, postFormatFunc.toExpression(), null)
                );
          }
        }

      }

    } // end of for loop


    // name can't be duplicate
    Set<Dimension> depdupeDimensions = new LinkedHashSet<>(dimensions);
    dimensions.clear();
    dimensions.addAll(depdupeDimensions);

    List<Aggregation> depdupeAggregations = new ArrayList<Aggregation>();
    Set setNames = new HashSet();
    for (Aggregation curAggregation : aggregations) {
      if (!setNames.contains(curAggregation.getName())) {
        depdupeAggregations.add(curAggregation);
        setNames.add(curAggregation.getName());
      }
    }
    aggregations = depdupeAggregations;

    List<PostAggregation> depdupePostAggregations = new ArrayList<PostAggregation>();
    setNames.clear();
    for (PostAggregation curPostAggregation : postAggregations) {
      if (!setNames.contains(curPostAggregation.getName())) {
        depdupePostAggregations.add(curPostAggregation);
        setNames.add(curPostAggregation.getName());
      }
    }
    postAggregations = depdupePostAggregations;

    // 기본값 지정
    granularity = new SimpleGranularity("all");

    return this;
  }

  public GroupByQueryBuilder count(String name) {
    this.aggregations.add(new CountAggregation(name));
    this.outputColumns.add(name);
    return this;
  }

  public GroupByQueryBuilder groupingSet(List<List<String>> names) {
    // 추후 dimension 체크 진행
    groupingSet = new GroupingSet.Names(names);
    return this;
  }

  public GroupByQueryBuilder advancedFilters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> filters) {

    for (Filter filter : filters) {
      if (filter instanceof MeasurePositionFilter) {    // Convert limit
        Sort sort;
        MeasurePositionFilter measureFilter = (MeasurePositionFilter) filter;
        MeasureField measureField = measureFilter.toMeasureField();
        measureField.setAlias(RESULT_VALUE_NAME_PREFIX + "position");
        addAggregationFunction(measureField);
        outputColumns.add(measureField.getAlias());

        if (measureFilter.getPosition() == BOTTOM) {
          sort = new Sort(measureField.getAlias(), ASC);
        } else {
          sort = new Sort(measureField.getAlias(), DESC);
        }

        limit(new Limit((Integer) measureFilter.getValue(), sort));

      } else if (filter instanceof MeasureInequalityFilter) { // Convert having

        MeasureInequalityFilter measureFilter = (MeasureInequalityFilter) filter;
        MeasureField measureField = measureFilter.toMeasureField();
        measureField.setAlias(RESULT_VALUE_NAME_PREFIX + "inequality");
        addAggregationFunction(measureField);
        outputColumns.add(measureField.getAlias());

        having(measureFilter.getInequality(), measureField.getAlias(), measureFilter.getValue());

      } else if (filter instanceof WildCardFilter) {          // Convert LikeFilter
        WildCardFilter wildCardFilter = (WildCardFilter) filter;

        // Add escape character, if exist special character.
        String likeExpr = StringUtils.replaceEach(wildCardFilter.getValue(),
                                                  new String[]{"\\", "_", "%"},
                                                  new String[]{"\\\\", "\\_", "\\%"});
        ;
        if (wildCardFilter.getContains() == BEFORE) {
          likeExpr = "%" + likeExpr;
        } else if (wildCardFilter.getContains() == AFTER) {
          likeExpr = likeExpr + "%";
        } else if (wildCardFilter.getContains() == BOTH) {
          likeExpr = "%" + likeExpr + "%";
        }

        filters(Lists.newArrayList(new LikeFilter(wildCardFilter.getField(), likeExpr, wildCardFilter.getRef())));
      }

    }

    // count aggregation 이 하나도 없을 경우 추가
    if (aggregations.stream()
                    .filter(aggregation -> RESERVED_WORD_COUNT.equals(aggregation.getName()))
                    .count() == 0) {
      aggregations.add(new CountAggregation(RESERVED_WORD_COUNT));
      outputColumns.add(RESERVED_WORD_COUNT);
    }

    return this;
  }

  public GroupByQueryBuilder filters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqFilters) {

    extractPartitions(reqFilters);

    setFilters(filter, reqFilters, intervals);

    return this;
  }

  public GroupByQueryBuilder limit(List<List<String>> groupingSets) {
    this.groupingSet = groupingSet;
    return this;
  }

  public GroupByQueryBuilder limit(Limit reqLimit) {

    if (reqLimit == null) {
      defaultSort();
      limitSpec = new DefaultLimit(100000, orderByColumns);
      return this;
    }

    List<Sort> sorts = reqLimit.getSort();

    if (CollectionUtils.isEmpty(sorts)) {
      defaultSort();
      limitSpec = new DefaultLimit(reqLimit.getLimit(), orderByColumns);
      return this;
    }

    // 디멘젼의 Logical Type 을 판별하여 Sort 비교 타입을 지정하기 위함
    Map<String, Dimension> dimensionMap = dimensions.stream()
                                                    .collect(Collectors
                                                                 .toMap(Dimension::getOutputName,
                                                                        dimension -> dimension));
    for (Sort sort : sorts) {

      OrderByColumn.COMPARATOR curComparator = OrderByColumn.COMPARATOR.ALPHANUMERIC;

      String sortField = sort.getField();

      if (sortFormatMap.containsKey(sortField)) {
        String format = sortFormatMap.get(sortField);

        if ("EEE".equals(format)) {
          curComparator = OrderByColumn.COMPARATOR.DAYOFWEEK;
        } else if ("MMM".equals(format)) {
          curComparator = OrderByColumn.COMPARATOR.MONTH;
        }

      } else {
        if (dimensionMap.containsKey(sortField)) {
          Dimension dimension = dimensionMap.get(sortField);
          if (dimension.getLogicalType() == LogicalType.INTEGER
              || dimension.getLogicalType() == LogicalType.DOUBLE) {
            curComparator = OrderByColumn.COMPARATOR.NUMERIC;
          }
          sortField = dimension.getOutputName();
        }
      }

      orderByColumns.add(new OrderByColumn(sortField,
                                           sort.getDirection() == ASC ?
                                               OrderByColumn.DIRECTION.ASCENDING : OrderByColumn.DIRECTION.DESCENDING,
                                           curComparator));
    }

    limitSpec = new DefaultLimit(reqLimit.getLimit(), orderByColumns);

    return this;
  }

  private void defaultSort() {

    for (Dimension dimension : dimensions) {
      String outputName = dimension.getOutputName();
      OrderByColumn.COMPARATOR curComparator = OrderByColumn.COMPARATOR.ALPHANUMERIC;

      if (sortFormatMap.containsKey(outputName)) {
        String format = sortFormatMap.get(outputName);

        if ("EEE".equals(format)) {
          curComparator = OrderByColumn.COMPARATOR.DAYOFWEEK;
        } else if ("MMM".equals(format)) {
          curComparator = OrderByColumn.COMPARATOR.MONTH;
        }
      } else {
        if (dimension.getLogicalType() == LogicalType.INTEGER
            || dimension.getLogicalType() == LogicalType.DOUBLE) {
          curComparator = OrderByColumn.COMPARATOR.NUMERIC;
        }
      }

      // Sort 전용 필드 자체로는 포함하지 않음
      if (outputName.lastIndexOf(Query.POSTFIX_SORT_FIELD) > 0) {
        continue;
      }

      // Sort 전용 필드와 매핑되는 필드가 있는 경우 Sort 전용 필드로 대치
      orderByColumns.add(new OrderByColumn(sortFieldMap.containsKey(outputName) ?
                                               sortFieldMap.get(outputName) : outputName,
                                           OrderByColumn.DIRECTION.ASCENDING,
                                           curComparator));

    }
  }

  public GroupByQueryBuilder having(MeasureInequalityFilter.InequalityType type, String name, Number value) {

    Preconditions.checkNotNull(type);
    Preconditions.checkNotNull(name);
    Preconditions.checkNotNull(value);

    switch (type) {
      case EQUAL_TO:
        having = new EqualTo(name, value);
        break;
      case GREATER_THAN:
        having = new GreaterThan(name, value);
        break;
      case LESS_THAN:
        having = new LessThan(name, value);
        break;
      case EQUAL_GREATER_THAN:
        having = new GreaterThanOrEqual(name, value);
        break;
      case EQUAL_LESS_THAN:
        having = new LessThanOrEqual(name, value);
        break;
    }

    return this;
  }

  public GroupByQueryBuilder analysis(Analysis analysis, List<Field> reqFields) {

    if (analysis instanceof PredictionAnalysis) {
      if (CollectionUtils.isEmpty(reqFields)) {
        throw new BadRequestException("Required timestamp field for prediction analysis.");
      }

      List<Field> timeFields = reqFields.stream()
                                        .filter(field -> field.getFormat() instanceof ContinuousTimeFormat)
                                        .collect(Collectors.toList());

      List<Field> measureFields = reqFields.stream()
                                           .filter(field -> field instanceof MeasureField)
                                           .collect(Collectors.toList());

      if (timeFields.size() != 1) {
        throw new BadRequestException("Only one timestamp field for prediction analysis");
      }
      Field timeField = timeFields.get(0);

      if (timeField instanceof TimestampField) {
        granularity = new SimpleGranularity(((ContinuousTimeFormat) timeField.getFormat()).getUnit().name());
      }

      postProcessor = new HoltWintersPostProcessor((PredictionAnalysis) analysis, timeField, measureFields);

    }

    return this;
  }

  public GroupByQueryBuilder forward(ResultForward resultForward) {

    setForwardContext(resultForward);

    return this;
  }

  public GroupByQueryBuilder format(SearchResultFormat resultFormat) {

    if (resultFormat instanceof PivotResultFormat) {
      PivotResultFormat pivotFormat = (PivotResultFormat) resultFormat;
      if (pivotFormat.getGroupingSize() != null) {
        this.groupingSet = pivotFormat.toGroupingSet();
      }
      this.windowingSpecs.add(pivotFormat.toEnginePivotSpec());
      exclusivePivotColumn(pivotFormat);
    } else if (resultFormat instanceof ChartResultFormat) {
      ChartResultFormat chartFormat = (ChartResultFormat) resultFormat;
      SearchResultFormat originalFormat = chartFormat.getOriginalFormat();
      if (originalFormat != null && originalFormat instanceof PivotResultFormat) {
        PivotResultFormat pivotFormat = (PivotResultFormat) originalFormat;

        List<String> partitionExpressions = Lists.newArrayList();
        Number intersectionValue = chartFormat.getOptionValue(ChartResultFormat.OPTION_INTERSECION_VALUE);
        if (intersectionValue != null) {
          partitionExpressions.add("_ = _ - " + intersectionValue);
        }

        if ("treemap".equals(chartFormat.getMode())) {
          this.groupingSet = pivotFormat.toGroupingSet();
          // 피봇 키 필드를 피봇필드로 이동 (Tree 를 구하기 위함)
          PivotResultFormat.Pivot newPivot =
              new PivotResultFormat.Pivot(new DimensionField(pivotFormat.getKeyFields().get(0)));
          pivotFormat.getPivots().add(0, newPivot);
          pivotFormat.setKeyFields(Lists.newArrayList());
        } else {
          // Category Value 추가
          Boolean showCategory = chartFormat.getOptionValue(ChartResultFormat.OPTION_SHOW_CATEGORY);
          if (BooleanUtils.isTrue(showCategory) && CollectionUtils.isNotEmpty(pivotFormat.getPivots())) {
            // Custom Grouping Set 지정
            List<String> allOfGroupByColumn = Lists.newArrayList(pivotFormat.getKeyFields());
            for (PivotResultFormat.Pivot pivot : pivotFormat.getPivots()) {
              allOfGroupByColumn.add(pivot.getFieldName());
            }

            this.groupingSet = new GroupingSet.Names(Lists.newArrayList(allOfGroupByColumn, pivotFormat.getKeyFields()));
            pivotFormat.setGroupingSize(2);
          }

          // Percentage 컬럼 추가
          Boolean showPercentage = chartFormat.getOptionValue(ChartResultFormat.OPTION_SHOW_PERCENTAGE);
          if (BooleanUtils.isTrue(showPercentage)) {
            pivotFormat.setIncludePercentage(true);
            partitionExpressions.addAll(percentPartitionExprs);
          }
        }

        PivotWindowingSpec pivotWindowingSpec = pivotFormat.toEnginePivotSpec(
            partitionExpressions.toArray(new String[partitionExpressions.size()])
        );

        this.windowingSpecs.add(pivotWindowingSpec);

        exclusivePivotColumn(pivotFormat);
      }
    }

    return this;
  }

  private void exclusivePivotColumn(PivotResultFormat format) {
    // 엔진에서 Pivot을 수행하는 경우 outputColumn 은 구성하지 않음
    // pivotSpec 에서 정의된 필드만 표현하도록 구성됨
    this.outputColumns = null;

    // pivot 컬럼으로 지정된 필드는 Sort/PostProcessor 제외
    List<String> pivotColumnNames = format.getPivots().stream()
                                          .map(pivot -> pivot.getFieldName())
                                          .collect(Collectors.toList());

    // Sort 항목 제거
    List<OrderByColumn> orderColumns = ((DefaultLimit) limitSpec).getColumns();
    if (CollectionUtils.isNotEmpty(orderColumns)) {
      Map<String, OrderByColumn> orderColumnMap = orderColumns.stream()
                                                              .collect(Collectors.toMap(OrderByColumn::getDimension, orderByColumn -> orderByColumn));

      pivotColumnNames.forEach(columnName -> {
        if (orderColumnMap.containsKey(columnName)) {
          orderColumns.remove(orderColumnMap.get(columnName));
        }
      });
    }

    // PostProcessor 항목 제거
    if (postProcessor != null && postProcessor instanceof PostAggregationProcessor) {
      PostAggregationProcessor processor = (PostAggregationProcessor) postProcessor;
      List<PostAggregation> postAggregations = processor.getPostAggregations();

      if (CollectionUtils.isNotEmpty(postAggregations)) {
        Map<String, PostAggregation> postAggregationMap = postAggregations.stream()
                                                                          .collect(Collectors.toMap(PostAggregation::getName, postAggregation -> postAggregation));

        pivotColumnNames.forEach(columnName -> {
          if (postAggregationMap.containsKey(columnName)) {
            postAggregations.remove(postAggregationMap.get(columnName));
          }
        });
      }
    }


  }

  @Override
  public GroupByQuery build() {

    GroupByQuery groupByQuery = new GroupByQuery();

    groupByQuery.setDataSource(getDataSourceSpec(dataSource));

    groupByQuery.setDimensions(dimensions);

    groupByQuery.setAggregations(aggregations);

    groupByQuery.setPostAggregations(postAggregations);

    groupByQuery.setOutputColumns(outputColumns);

    groupByQuery.setGroupingSets(groupingSet);

    if (CollectionUtils.isEmpty(filter.getFields())) {
      groupByQuery.setFilter(null);
    } else {
      groupByQuery.setFilter(filter);
    }

    if (virtualColumns != null) {
      // 먼저, 사용하지 않는 사용자 정의 컬럼 삭제
      for (String removeColumnName : unUsedVirtualColumnName) {
        virtualColumns.remove(removeColumnName);
      }
      groupByQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    if (granularity != null) {
      groupByQuery.setGranularity(granularity);
    } else {
      groupByQuery.setGranularity(new SimpleGranularity("all"));
    }

    if (CollectionUtils.isEmpty(intervals)) {
      groupByQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      groupByQuery.setIntervals(intervals);
    }

    if (limitSpec != null) {
      groupByQuery.setLimitSpec(limitSpec);
    } else {
      for (Dimension dimension : dimensions) {
        orderByColumns.add(new OrderByColumn(dimension.getOutputName(),
                                             OrderByColumn.DIRECTION.ASCENDING,
                                             OrderByColumn.COMPARATOR.ALPHANUMERIC));
      }
      limitSpec = new DefaultLimit(100000, orderByColumns);
      groupByQuery.setLimitSpec(limitSpec);
    }

    if (CollectionUtils.isNotEmpty(windowingSpecs)) {
      ((DefaultLimit) groupByQuery.getLimitSpec()).setWindowingSpecs(windowingSpecs);
    }

    if (having != null) {
      groupByQuery.setHaving(having);
    }

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if (postProcessor != null) {
      // Sub Module 지정시 구분 property 추가 안되는 이슈가 발생하여 Map으로 변환하여 전달
      addContext("postProcessing", GlobalObjectMapper.getDefaultMapper().convertValue(postProcessor, Map.class));
    }

    groupByQuery.setContext(context);

    return groupByQuery;

  }
}
