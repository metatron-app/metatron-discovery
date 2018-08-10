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

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

/**
 * 데이터 소스내 필드 통계 질의
 *
 * @author Kyungtaak Noh
 * @since 1.1
 */
public class SummaryQuery extends Query {

  List<String> dimensions;

  List<String> metrics;

  List<VirtualColumn> virtualColumns;

  List<String> intervals;

  boolean includeTimeStats;

  Map<String, Object> context;

  public SummaryQuery() {
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

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public boolean isIncludeTimeStats() {
    return includeTimeStats;
  }

  public void setIncludeTimeStats(boolean includeTimeStats) {
    this.includeTimeStats = includeTimeStats;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static SummaryQueryBuilder builder(DataSource dataSource) {
    return new SummaryQueryBuilder(dataSource);
  }
}
