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

package app.metatron.discovery.spec.druid.ingestion.input;

import java.util.List;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Filter;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class DataSourceIngestionSpec {

  @NotNull
  String dataSource;

  @NotNull
  List<String> intervals;

  String granularity;

  Filter filter;

  List<String> dimensions;

  List<String> metrics;

  Boolean ignoreWhenNoSegments;

  public DataSourceIngestionSpec() {
  }

  public DataSourceIngestionSpec(String dataSource, List<String> intervals) {
    this.dataSource = dataSource;
    this.intervals = intervals;
  }

  public String getDataSource() {
    return dataSource;
  }

  public void setDataSource(String dataSource) {
    this.dataSource = dataSource;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public String getGranularity() {
    return granularity;
  }

  public void setGranularity(String granularity) {
    this.granularity = granularity;
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public List<String> getDimensions() {
    return dimensions;
  }

  public void setDimensions(List<String> dimensions) {
    this.dimensions = dimensions;
  }

  public List<String> getMetrics() {
    return metrics;
  }

  public void setMetrics(List<String> metrics) {
    this.metrics = metrics;
  }

  public Boolean getIgnoreWhenNoSegments() {
    return ignoreWhenNoSegments;
  }

  public void setIgnoreWhenNoSegments(Boolean ignoreWhenNoSegments) {
    this.ignoreWhenNoSegments = ignoreWhenNoSegments;
  }
}
