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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Set;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.format.DefaultFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.dimensions.ExpressionDimension;
import app.metatron.discovery.query.druid.dimensions.ExtractionDimension;
import app.metatron.discovery.query.druid.dimensions.LookupDimension;
import app.metatron.discovery.query.druid.extractionfns.ExpressionFunction;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.query.druid.lookup.MapLookupExtractor;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;

/**
 * Builder for select query specification
 */
public class SelectQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private List<Dimension> dimensions = Lists.newArrayList();

  private Set<String> metrics = Sets.newLinkedHashSet();

  private PagingSpec pagingSpec = new PagingSpec(100);

  private List<String> intervals = Lists.newArrayList();

  private Boolean descending = false;

  private Boolean streaming = false;

  public SelectQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public SelectQueryBuilder initVirtualColumns(List<UserDefinedField> userDefinedFields) {

    setVirtualColumns(userDefinedFields);

    return this;
  }

  /**
   *
   * @param reqFields
   * @return
   */
  public SelectQueryBuilder fields(List<Field> reqFields) {

    // 별도 forward context 추가시 Projection 항목 지정 위함
    projections = reqFields;

    // If fields are empty in the search query, it will get field information from datasource.
    if (CollectionUtils.isEmpty(reqFields)) {
      reqFields = Lists.newArrayList(getAllFieldsByMapping());
    }

    for (Field reqField : reqFields) {

      String fieldName = checkColumnName(reqField.getColunm());
      if (!fieldName.equals(reqField.getColunm())) {
        reqField.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }

      String aliasName = reqField.getAlias();

      if (UserDefinedField.REF_NAME.equals(reqField.getRef())) {
        if (reqField instanceof DimensionField) {
          dimensions.add(new DefaultDimension(fieldName, aliasName));
        } else {
          virtualColumns.put(aliasName, new ExprVirtualColumn(fieldName, aliasName));
          metrics.add(aliasName);
        }

        continue;
      }

      if (reqField instanceof DimensionField) {

        DimensionField dimensionField = (DimensionField) reqField;
        app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);

        if (datasourceField == null) {
          throw new QueryTimeExcetpion("'" + fieldName + "' not found  in datasource ( " + dataSource.getName() + " )");
        }

        FieldFormat originalFormat = datasourceField.getFormatObject();
        FieldFormat format = dimensionField.getFormat();
        if (format == null) {
          format = originalFormat;
        }

        // In case of GEO Type, druid engine recognizes it as metric
        if (datasourceField.getLogicalType() == LogicalType.GEO_POINT
            || datasourceField.getLogicalType() == LogicalType.GEO_POLYGON
            || datasourceField.getLogicalType() == LogicalType.GEO_LINE) {
          metrics.add(fieldName);
          continue;
        }

        // ValueAlias Part, Processing by existing format or type is ignored
        if (MapUtils.isNotEmpty(dimensionField.getValuePair())) {
          dimensions.add(new LookupDimension(fieldName,
                                             aliasName,
                                             new MapLookupExtractor(dimensionField.getValuePair())));
          continue;
        }

        if (format != null) {
          switch (datasourceField.getLogicalType()) {
            case STRING:
              dimensions.add(new ExtractionDimension(fieldName, aliasName,
                                                     new ExpressionFunction(((DefaultFormat) format).getFormat(), fieldName)));
              break;
            case TIMESTAMP:
              TimeFieldFormat originalTimeFormat = (TimeFieldFormat) originalFormat;
              TimeFieldFormat timeFormat = (TimeFieldFormat) format;

              if (datasourceField.backwardTime()) {
                originalTimeFormat.setUTC();
                timeFormat.setUTC();
              }

              TimeFormatFunc timeFormatFunc = createTimeFormatFunc(fieldName, originalTimeFormat, timeFormat);

              dimensions.add(new ExpressionDimension(aliasName, timeFormatFunc.toExpression()));

              break;
            default:
              dimensions.add(new DefaultDimension(fieldName, aliasName,
                                                  datasourceField.getLogicalType()));
          }
        } else {
          dimensions.add(new DefaultDimension(fieldName, aliasName,
                                              datasourceField.getLogicalType()));
        }

      } else if (reqField instanceof MeasureField) {
        if (UserDefinedField.REF_NAME.equals(reqField.getRef())) {
          dimensions.add(new DefaultDimension(fieldName, aliasName));
        } else {
          metrics.add(fieldName);
        }

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

        if (datasourceField.backwardTime()) {
          timeFormat.setUTC();
        }

        TimeFormatFunc timeFormatFunc = new TimeFormatFunc(timestampField.getPredefinedColumn(dataSource instanceof MappingDataSource),
                                                           timeFormat.getFormat(),
                                                           timeFormat.selectTimezone(),
                                                           timeFormat.getLocale());

        dimensions.add(new ExpressionDimension(aliasName, timeFormatFunc.toExpression()));
      }
    }

    return this;
  }

  public SelectQueryBuilder filters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqfilters) {

    extractPartitions(reqfilters);

    setFilters(filter, reqfilters, intervals);

    return this;
  }

  public SelectQueryBuilder limit(Limit reqLimit) {

    if (reqLimit != null) {
      pagingSpec.setThreshold(reqLimit.getLimit());

      for (Sort sort : reqLimit.getSort()) {
        if (this.metaFieldMap.containsKey(sort.getField())) {
          app.metatron.discovery.domain.datasource.Field field = this.metaFieldMap.get(sort.getField());
          if (field.getRole() == app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP) {
            descending = sort.getDirection() == Sort.Direction.DESC;
          } // Ignore any sorting on the rest of the field of timestamp role
        }
      }

    } else {
      pagingSpec.setThreshold(100);
    }

    return this;
  }

  public SelectQueryBuilder forward(ResultForward resultForward) {

    setForwardContext(resultForward);

    return this;
  }

  public SelectQueryBuilder streaming() {
    this.streaming = true;

    return this;
  }

  @Override
  public SelectQuery build() {

    SelectQuery selectQuery = new SelectQuery();

    selectQuery.setDataSource(getDataSourceSpec(dataSource));
    selectQuery.setDimensions(dimensions);

    // 빈 값을 넣을시 전체 metric 값 출력을 방지 위함
    if (metrics.isEmpty()) {
      metrics.add("__DUMMY");
    }
    selectQuery.setMetrics(metrics);

    if (filter.isEmpty()) {
      selectQuery.setFilter(null);
    } else {
      selectQuery.setFilter(filter);
    }

    if (virtualColumns != null) {
      removeUserDefinedAggregationFunction();
      selectQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    selectQuery.setGranularity(new SimpleGranularity("all"));

    if (CollectionUtils.isEmpty(intervals)) {
      selectQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      selectQuery.setIntervals(intervals);
    }

    selectQuery.setPagingSpec(pagingSpec);

    selectQuery.setDescending(descending);

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if (context != null) {
      selectQuery.setContext(context);
    }

    return selectQuery;

  }

}
