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

package app.metatron.discovery.query.druid.limits;

import java.util.List;

import javax.validation.constraints.NotNull;

/**
 *
 */
public class WindowingSpec {

  @NotNull
  List<String> partitionColumns;

  List<OrderByColumn> sortingColumns;

  List<String> expressions;

  WindowingSpecFlattener flattener;

  public WindowingSpec() {
    // Empty Constructor
  }

  public WindowingSpec(List<String> partitionColumns, List<OrderByColumn> sortingColumns, List<String> expressions) {
    this.partitionColumns = partitionColumns;
    this.sortingColumns = sortingColumns;
    this.expressions = expressions;
  }


  public List<String> getPartitionColumns() {
    return partitionColumns;
  }

  public void setPartitionColumns(List<String> partitionColumns) {
    this.partitionColumns = partitionColumns;
  }

  public List<OrderByColumn> getSortingColumns() {
    return sortingColumns;
  }

  public void setSortingColumns(List<OrderByColumn> sortingColumns) {
    this.sortingColumns = sortingColumns;
  }

  public List<String> getExpressions() {
    return expressions;
  }

  public void setExpressions(List<String> expressions) {
    this.expressions = expressions;
  }

  public WindowingSpecFlattener getFlattener() {
    return flattener;
  }

  public void setFlattener(WindowingSpecFlattener flattener) {
    this.flattener = flattener;
  }

  @Override
  public String toString() {
    return "WindowingSpec{" +
            "partitionColumns=" + partitionColumns +
            ", sortingColumns=" + sortingColumns +
            ", expressions=" + expressions +
            ", flattener=" + flattener +
            '}';
  }
}
