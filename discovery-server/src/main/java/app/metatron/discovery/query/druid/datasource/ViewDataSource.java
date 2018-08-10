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

package app.metatron.discovery.query.druid.datasource;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

/**
 * Created by kyungtaak on 2017. 5. 22..
 */
@JsonTypeName("view")
public class ViewDataSource extends TableDataSource {

  @JsonProperty
  private List<String> columns;

  @JsonProperty
  private List<String> columnExclusions;

  @JsonProperty
  private List<VirtualColumn> virtualColumns;

  @JsonProperty
  private Filter filter;

  @JsonProperty
  private boolean lowerCasedOutput;

  public ViewDataSource(String name,
                        List<String> columns,
                        List<String> columnExclusions,
                        List<VirtualColumn> virtualColumns,
                        Filter filter,
                        boolean lowerCasedOutput
  ) {
    super(Preconditions.checkNotNull(name));
    this.columns = columns == null ? ImmutableList.of() : columns;
    this.columnExclusions = columnExclusions == null ? ImmutableList.of() : columnExclusions;
    this.virtualColumns = virtualColumns;
    this.filter = filter;
    this.lowerCasedOutput = lowerCasedOutput;
  }

  public ViewDataSource(String name, List<String> columns, List<VirtualColumn> virtualColumns, Filter filter) {
    this(name, columns, null, virtualColumns, filter, false);
  }

  public List<String> getColumns() {
    return columns;
  }

  public void setColumns(List<String> columns) {
    this.columns = columns;
  }

  public List<String> getColumnExclusions() {
    return columnExclusions;
  }

  public void setColumnExclusions(List<String> columnExclusions) {
    this.columnExclusions = columnExclusions;
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

  public boolean isLowerCasedOutput() {
    return lowerCasedOutput;
  }

  public void setLowerCasedOutput(boolean lowerCasedOutput) {
    this.lowerCasedOutput = lowerCasedOutput;
  }
}
