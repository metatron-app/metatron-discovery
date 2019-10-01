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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.query.druid.queries;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.SearchResultFormat;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

public class MonitoringQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private List<String> intervals = Lists.newArrayList();

  private Granularity granularity;

  private List<Aggregation> aggregations;

  private List<PostAggregation> postAggregations;

  public MonitoringQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public MonitoringQueryBuilder filters(List<Filter> reqFilter) {
    setAndFilter(filter, reqFilter);
    return this;
  }

  public MonitoringQueryBuilder intervals(List<String> intervalList) {
    setIntervals(intervals, intervalList);
    return this;
  }

  public MonitoringQueryBuilder granularity(Granularity granularity) {
    if (granularity == null) {
      this.granularity = new SimpleGranularity("all");
    } else {
      this.granularity = granularity;
    }
    return this;
  }

  public MonitoringQueryBuilder aggregation(List<Aggregation> aggregations) {
    this.aggregations = aggregations;
    return this;
  }

  public MonitoringQueryBuilder postAggregation(List<PostAggregation> postAggregations) {
    this.postAggregations = postAggregations;
    return this;
  }

  public MonitoringQueryBuilder format(SearchResultFormat resultFormat) {
    if (resultFormat instanceof ChartResultFormat) {
      ChartResultFormat chartFormat = (ChartResultFormat) resultFormat;
      SearchResultFormat originalFormat = chartFormat.getOriginalFormat();
    }

    return this;
  }

  @Override
  public MonitoringQuery build() {
    MonitoringQuery monitoringQuery = new MonitoringQuery();

    monitoringQuery.setDataSource(getDataSourceSpec(dataSource));

    if(filter == null || CollectionUtils.isEmpty(filter.getFields())) {
      monitoringQuery.setFilter(null);
    } else {
      monitoringQuery.setFilter(filter);
    }

    if (CollectionUtils.isEmpty(intervals)) {
      monitoringQuery.setIntervals(getDefaultInterval());
    } else {
      monitoringQuery.setIntervals(intervals);
    }

    if (CollectionUtils.isEmpty(aggregations)) {
      monitoringQuery.setAggregations(null);
    } else {
      monitoringQuery.setAggregations(aggregations);
    }

    if (CollectionUtils.isEmpty(postAggregations)) {
      monitoringQuery.setPostAggregations(null);
    } else {
      monitoringQuery.setPostAggregations(postAggregations);
    }

    monitoringQuery.setGranularity(granularity);

    monitoringQuery.setVirtualColumns(Lists.newArrayList(
        new ExprVirtualColumn(getTimeFormatExpr(granularity), "event_time.inner")));
    monitoringQuery.setDimensions(Lists.newArrayList(
        new DefaultDimension("event_time.inner","event_time")));

    return monitoringQuery;
  }

  private List<String> getDefaultInterval() {
    LocalDateTime nowTime = LocalDateTime.now();

    String toDate = nowTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
    String fromDate = nowTime.minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));

    return Lists.newArrayList(fromDate + "/" + toDate);
  }

  private void setAndFilter(AndFilter filter, List<Filter> reqFilters) {
    if (CollectionUtils.isEmpty(reqFilters)){
      return;
    }
    for ( Filter reqFilter : reqFilters ) {
      filter.addField(reqFilter);
    }
  }

  private void setIntervals(List<String> intervals, List<String> intervalList) {
    if (CollectionUtils.isEmpty(intervalList) || intervalList.stream().noneMatch(Objects::nonNull)) {
      return;
    } else {
      LocalDateTime nowTime = LocalDateTime.now();

      String fromDate = intervalList.get(0);
      String toDate = nowTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));

      if (intervalList.size() == 2 && intervalList.get(1) != null) {
        toDate = intervalList.get(1);
      }
      intervals.add(fromDate+"/"+toDate);
    }
  }

  private String getTimeFormatExpr(Granularity granularity) {
    if (granularity instanceof SimpleGranularity){
      switch (((SimpleGranularity) granularity).getValue()){
        case "MONTH":
          return "time_format(__time,out.format='yyyy-MM')";
        case "DAY":
          return "time_format(__time,out.format='yyyy-MM-dd')";
        case "HOUR":
          return "time_format(__time,out.format='yyyy-MM-dd HH')";
        default:
          return "time_format(__time,out.format='yyyy-MM-dd HH:mm')";
      }
    } else {
      return "time_format(__time,out.format='yyyy-MM-dd HH:mm')";
    }
  }

}
