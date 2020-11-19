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

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.filters.AndFilter;

/**
 * Created by kyungtaak on 2017. 5. 18..
 */
public class CovarianceQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private String column;

  private List<String> intervals;

  private List<String> excludes = Lists.newArrayList("__time", "count");

  private Map<String, Object> context;

  public CovarianceQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public CovarianceQueryBuilder initVirtualColumns(List<UserDefinedField> userDefinedFields) {

    setVirtualColumns(userDefinedFields);

    return this;
  }

  public CovarianceQueryBuilder filters(List<Filter> reqFilters) {

    extractPartitions(reqFilters);

    setFilters(filter, reqFilters, intervals);

    return this;
  }

  public CovarianceQueryBuilder column(String column) {

    this.column = column;

    return this;
  }

  public CovarianceQueryBuilder excludes(String... excludeColumns) {

    excludes.addAll(Lists.newArrayList(excludeColumns));

    return this;
  }

  public CovarianceQueryBuilder queryId(String queryId) {
    super.queryId = queryId;

    return this;
  }

  @Override
  public Query build() {
    CovarianceQuery covarianceQuery = new CovarianceQuery();

    covarianceQuery.setDataSource(getDataSourceSpec(dataSource));
    covarianceQuery.setColumn(column);

    if (CollectionUtils.isEmpty(filter.getFields())) {
      covarianceQuery.setFilter(null);
    } else {
      covarianceQuery.setFilter(filter);
    }

    if (virtualColumns != null) {
      removeUserDefinedAggregationFunction();
      covarianceQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    if (CollectionUtils.isEmpty(intervals)) {
      covarianceQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      covarianceQuery.setIntervals(intervals);
    }

    covarianceQuery.setExcludes(excludes);

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if (context != null) {
      covarianceQuery.setContext(context);
    }

    return covarianceQuery;
  }
}
