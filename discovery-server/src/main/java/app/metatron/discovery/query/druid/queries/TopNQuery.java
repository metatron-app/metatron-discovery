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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

/**
 * Created by hsp on 2016. 2. 12..
 */
@JsonTypeName("topN")
public class TopNQuery extends Query {

  @NotNull
  Dimension dimension;

  @NotNull
  Granularity granularity;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  Filter filter;

  @NotNull
  List<Aggregation> aggregations;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  List<PostAggregation> postAggregations;

  List<VirtualColumn> virtualColumns;

  @NotNull
  List<String> intervals;

  @NotNull
  String metric;

  @NotNull
  int threshold;

  Map<String, Object> context;

  public TopNQuery() {
  }

  public int getThreshold() {
    return threshold;
  }

  public void setThreshold(int threshold) {
    this.threshold = threshold;
  }

  public String getMetric() {
    return metric;
  }

  public void setMetric(String metric) {
    this.metric = metric;
  }

  public Dimension getDimension() {
    return dimension;
  }

  public void setDimension(Dimension dimension) {
    this.dimension = dimension;
  }

  @JsonSerialize(using = GranularitySerializer.class, typing = JsonSerialize.Typing.DYNAMIC)
  public Granularity getGranularity() {
    return granularity;
  }

  public void setGranularity(Granularity granularity) {
    this.granularity = granularity;
  }

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

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static TopNQueryBuilder builder(DataSource dataSource) {
    return new TopNQueryBuilder(dataSource);
  }
}
