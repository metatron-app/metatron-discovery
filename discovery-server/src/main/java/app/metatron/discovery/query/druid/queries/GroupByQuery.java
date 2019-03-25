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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.Having;
import app.metatron.discovery.query.druid.Limit;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

@JsonTypeName("groupBy")
public class GroupByQuery extends Query {

  @NotNull
  Granularity granularity;

  @NotNull
  List<String> intervals;

  List<VirtualColumn> virtualColumns;

  List<Dimension> dimensions;

  GroupingSet groupingSets;

  Filter filter;

  @NotNull
  List<Aggregation> aggregations;

  List<PostAggregation> postAggregations;

  Limit limitSpec;

  Having having;

  Set<String> outputColumns;

  Map<String, Object> context;

  @JsonIgnore
  private Field geometry;

  public GroupByQuery() {
    super();
  }

  public List<Dimension> getDimensions() {
    return dimensions;
  }

  public void setDimensions(List<Dimension> dimensions) {
    this.dimensions = dimensions;
  }

  public GroupingSet getGroupingSets() {
    return groupingSets;
  }

  public void setGroupingSets(GroupingSet groupingSets) {
    this.groupingSets = groupingSets;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public Limit getLimitSpec() {
    return limitSpec;
  }

  public void setLimitSpec(Limit limitSpec) {
    this.limitSpec = limitSpec;
  }

  @JsonSerialize(using = GranularitySerializer.class, typing= JsonSerialize.Typing.DYNAMIC)
  public Granularity getGranularity() {
    return granularity;
  }

  public void setGranularity(Granularity granularity) {
    this.granularity = granularity;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> interval) {
    this.intervals = interval;
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public List<Aggregation> getAggregations() {
    return aggregations;
  }

  public void setAggregations(List<Aggregation> aggregations) {
    this.aggregations = aggregations;
  }

  public List<PostAggregation> getPostAggregations() {
    return postAggregations;
  }

  public void setPostAggregations(List<PostAggregation> postAggregations) {
    this.postAggregations = postAggregations;
  }

  public Having getHaving() {
    return having;
  }

  public void setHaving(Having having) {
    this.having = having;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public Set<String> getOutputColumns() {
    return outputColumns;
  }

  public void setOutputColumns(Set<String> outputColumns) {
    this.outputColumns = outputColumns;
  }

  public Field getGeometry() {
    return geometry;
  }

  public void setGeometry(Field geometry) {
    this.geometry = geometry;
  }

  public static GroupByQueryBuilder builder(DataSource dataSource) {
    return new GroupByQueryBuilder(dataSource);
  }
}
