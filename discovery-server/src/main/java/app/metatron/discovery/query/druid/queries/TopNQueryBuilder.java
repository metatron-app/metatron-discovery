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

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.aggregations.LongSumAggregation;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.query.druid.limits.OrderByColumn;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.IndexVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

/**
 * Created by hsp on 2016. 7. 5..
 */
public class TopNQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private Dimension dimension;

  private Granularity granularity;

  private app.metatron.discovery.query.druid.Limit limitSpec;

  private List<OrderByColumn> orderByColumns = Lists.newArrayList();

  private List<String> intervals = Lists.newArrayList();

  public TopNQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public TopNQueryBuilder initVirtualColumns(List<UserDefinedField> userDefinedFields) {

    setVirtualColumns(userDefinedFields);

    return this;
  }

  public TopNQueryBuilder fields(Field reqField) {

    String fieldName = reqField.getColunm();
    String aliasName = reqField.getAlias();

    if (reqField instanceof DimensionField) {

      // for virtual column
      if (virtualColumns.containsKey(fieldName)) {
        VirtualColumn column = virtualColumns.get(fieldName);
        if(column instanceof IndexVirtualColumn) {
          IndexVirtualColumn indexVirtualColumn = (IndexVirtualColumn) column;
          dimension = new DefaultDimension(indexVirtualColumn.getKeyDimension(), aliasName);
        } else if(column instanceof ExprVirtualColumn) {
          dimension = new DefaultDimension(fieldName, aliasName);
        }

      } else {
        dimension = new DefaultDimension(fieldName, aliasName);
      }

    }
    else if (reqField instanceof MeasureField) {

      app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(fieldName);

      if( datasourceField.getType() == DataType.MAP ){

        String keyFieldName = "";
        for( app.metatron.discovery.domain.datasource.Field curField : datasourceField.getMappedField() ){
          if( curField.getRole() == app.metatron.discovery.domain.datasource.Field.FieldRole.DIMENSION ){
            keyFieldName = curField.getName();
            break;
          }
        }

        if( !keyFieldName.isEmpty() ){
          dimension = new DefaultDimension(keyFieldName, aliasName);
        }
      }

    }

    return this;
  }

  public TopNQueryBuilder filters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqFilters) {

    extractPartitions(reqFilters);

    setFilters(filter, reqFilters, intervals);

    return this;
  }


  public TopNQueryBuilder limit(Limit reqLimit) {
    return this;
  }

  @Override
  public TopNQuery build() {

    TopNQuery topNQuery = new TopNQuery();

    topNQuery.setDataSource(getDataSourceSpec(dataSource));
    topNQuery.setDimension(dimension);


    List<Aggregation> aggregations = Lists.newArrayList();
    aggregations.add(new LongSumAggregation("count", "count"));
    topNQuery.setAggregations(aggregations);


    String metric = "count";
    topNQuery.setMetric( metric );


    if (CollectionUtils.isEmpty(filter.getFields())) {
      topNQuery.setFilter(null);
    } else {
      topNQuery.setFilter(filter);
    }

    if (!virtualColumns.isEmpty()) {
      removeUserDefinedAggregationFunction();
      topNQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }


    topNQuery.setThreshold( 10000 );

    if ( granularity != null ){
      topNQuery.setGranularity( granularity );
    } else {
      topNQuery.setGranularity(new SimpleGranularity("all"));
    }

    if (CollectionUtils.isEmpty(intervals)) {
      topNQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      topNQuery.setIntervals(intervals);
    }

    if(StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if(context != null) {
      topNQuery.setContext(context);
    }

    return topNQuery;

  }



}
