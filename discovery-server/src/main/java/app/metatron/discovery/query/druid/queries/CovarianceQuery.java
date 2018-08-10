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
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

public class CovarianceQuery extends Query {

  Filter filter;

  String column;

  List<VirtualColumn> virtualColumns;

  List<String> excludes;

  List<String> intervals;

  Map<String, Object> context;

  public CovarianceQuery() {
    // Empty Constructor
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public String getColumn() {
    return column;
  }

  public void setColumn(String column) {
    this.column = column;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public List<String> getExcludes() {
    return excludes;
  }

  public void setExcludes(List<String> excludes) {
    this.excludes = excludes;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static CovarianceQueryBuilder builder(DataSource dataSource) {
    return new CovarianceQueryBuilder(dataSource);
  }
}
