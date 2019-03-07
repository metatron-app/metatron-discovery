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

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.limits.OrderByColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

/**
 * Created by kyungtaak on 2017. 3. 6..
 */
@JsonTypeName("select.stream")
public class SelectStreamQuery extends Query {

  private Filter filter;

  private List<String> columns;

  private List<VirtualColumn> virtualColumns;

  private String concatString;

  private boolean descending;

  private List<OrderByColumn> orderBySpecs;

  private int limit;

  private List<String> intervals;

  Map<String, Object> context;

  /**
   *
   */
  @JsonIgnore
  private Map<String, String> fieldMapper;

  @JsonIgnore
  private Field geometry;

  public SelectStreamQuery() {
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  public List<String> getColumns() {
    return columns;
  }

  public void setColumns(List<String> columns) {
    this.columns = columns;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public String getConcatString() {
    return concatString;
  }

  public void setConcatString(String concatString) {
    this.concatString = concatString;
  }

  public boolean isDescending() {
    return descending;
  }

  public void setDescending(boolean descending) {
    this.descending = descending;
  }

  public List<OrderByColumn> getOrderBySpecs() {
    return orderBySpecs;
  }

  public void setOrderBySpecs(List<OrderByColumn> orderBySpecs) {
    this.orderBySpecs = orderBySpecs;
  }

  public int getLimit() {
    return limit;
  }

  public void setLimit(int limit) {
    this.limit = limit;
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

  public Map<String, String> getFieldMapper() {
    return fieldMapper;
  }

  public Field getGeometry() {
    return geometry;
  }

  public void setGeometry(Field geometry) {
    this.geometry = geometry;
  }

  public void setFieldMapper(Map<String, String> fieldMapper) {
    this.fieldMapper = fieldMapper;
  }

  public static SelectStreamQueryBuilder builder(DataSource dataSource) {
    return new SelectStreamQueryBuilder(dataSource);
  }
}
