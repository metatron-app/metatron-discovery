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

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

@JsonTypeName("groupBy")
public class MonitoringQuery extends Query {

  List<String> intervals;

  Granularity granularity;

  List<Aggregation> aggregations;

  List<PostAggregation> postAggregations;

  List<VirtualColumn> virtualColumns;

  List<Dimension> dimensions;

  Filter filter;

  public MonitoringQuery() {
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

  public List<Aggregation> getAggregations() {
    return aggregations;
  }

  public void setAggregations(List<Aggregation> aggregations) {
    this.aggregations = aggregations;
  }

  public List<PostAggregation> getPostAggregations() { return postAggregations; }

  public void setPostAggregations(List<PostAggregation> postAggregations) { this.postAggregations = postAggregations; }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public List<Dimension> getDimensions() {
    return dimensions;
  }

  public void setDimensions(List<Dimension> dimensions) {
    this.dimensions = dimensions;
  }

  public static MonitoringQueryBuilder builder(DataSource datasource) {
    return new MonitoringQueryBuilder(datasource);
  }
}
