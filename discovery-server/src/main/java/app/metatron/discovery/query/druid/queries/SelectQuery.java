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

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

@JsonTypeName("select")
public class SelectQuery extends Query {

  @NotNull
  List<String> intervals;

  Filter filter;

  List<Dimension> dimensions;

  Set<String> metrics;

  List<VirtualColumn> virtualColumns;

  @NotNull
  Granularity granularity;

  String concatString = ",";

  Boolean descending;

  @NotNull
  PagingSpec pagingSpec;

  Map<String, Object> context;

  public SelectQuery() {
  }

  //  public SelectStreamQuery ofStreamQuery() {
  //    SelectStreamQuery selectStreamQuery = new SelectStreamQuery();
  //    selectStreamQuery.setDataSource(super.getDataSource());
  //    selectStreamQuery.setDimensions(dimensions);
  //    selectStreamQuery.setMetrics(metrics);
  //    selectStreamQuery.setFilter(filter);
  //    selectStreamQuery.setVirtualColumns(virtualColumns);
  //    selectStreamQuery.setGranularity(granularity);
  //    selectStreamQuery.setIntervals(intervals);
  //    selectStreamQuery.setPagingSpec(pagingSpec);
  //    selectStreamQuery.setDescending(descending);
  //    selectStreamQuery.setContext(context);
  //
  //    return selectStreamQuery;
  //  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public List<Dimension> getDimensions() {
    return dimensions;
  }

  public void setDimensions(List<Dimension> dimensions) {
    this.dimensions = dimensions;
  }

  public Set<String> getMetrics() {
    return metrics;
  }

  public void setMetrics(Set<String> metrics) {
    this.metrics = metrics;
  }

  @JsonSerialize(using = GranularitySerializer.class, typing = JsonSerialize.Typing.DYNAMIC)
  public Granularity getGranularity() {
    return granularity;
  }

  public void setGranularity(Granularity granularity) {
    this.granularity = granularity;
  }

  public PagingSpec getPagingSpec() {
    return pagingSpec;
  }

  public void setPagingSpec(PagingSpec pagingSpec) {
    this.pagingSpec = pagingSpec;
  }

  public String getConcatString() {
    return concatString;
  }

  public void setConcatString(String concatString) {
    this.concatString = concatString;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public Boolean getDescending() {
    return descending;
  }

  public void setDescending(Boolean descending) {
    this.descending = descending;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static SelectQueryBuilder builder(DataSource dataSource) {
    return new SelectQueryBuilder(dataSource);
  }
}
