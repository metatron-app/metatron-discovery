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

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

@JsonTypeName("timeseries")
public class TimeseriesQuery extends Query {

  private boolean descending;

  private List<String> intervals;

  private Granularity granularity;

  private List<VirtualColumn> virtualColumns;

  private Filter filter;

  private List<Aggregation> aggregations;

  private List<PostAggregation> postAggregations;

  private Set<String> outputColumns;

  private Map<String, Object> context;

  public TimeseriesQuery() {
  }

  public boolean isDescending() {
    return descending;
  }

  public void setDescending(boolean descending) {
    this.descending = descending;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  @JsonSerialize(using = GranularitySerializer.class, typing= JsonSerialize.Typing.DYNAMIC)
  public Granularity getGranularity() {
    return granularity;
  }

  public void setGranularity(Granularity granularity) {
    this.granularity = granularity;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
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

  public Set<String> getOutputColumns() {
    return outputColumns;
  }

  public void setOutputColumns(Set<String> outputColumns) {
    this.outputColumns = outputColumns;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static TimeseriesQueryBuilder builder(DataSource dataSource) {
    return new TimeseriesQueryBuilder(dataSource);
  }
}
