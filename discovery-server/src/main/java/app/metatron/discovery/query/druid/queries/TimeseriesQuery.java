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

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.datasource.TableDataSource;
import app.metatron.discovery.query.druid.serializers.GranularitySerializer;

import static com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonTypeName("timeseries")
public class TimeseriesQuery extends Query {
  @NotNull
  Granularity granularity;

  @NotNull
  List<String> intervals;

  @JsonInclude(Include.NON_NULL)
  Filter filter;

  @NotNull
  List<Aggregation> aggregations;

  @JsonInclude(Include.NON_NULL)
  List<PostAggregation> postAggregations;

  public TimeseriesQuery() {
  }

  public TimeseriesQuery(String dataSource, Granularity granularity, List<String> intervals, Filter filter, List<Aggregation> aggregations, List<PostAggregation> postAggregations) {
    super(new TableDataSource(dataSource));
    this.granularity = granularity;
    this.intervals = intervals;
    this.filter = filter;
    this.aggregations = aggregations;
    this.postAggregations = postAggregations;
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
}
