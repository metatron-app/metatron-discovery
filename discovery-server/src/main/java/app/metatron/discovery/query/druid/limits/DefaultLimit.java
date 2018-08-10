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


import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Limit;

@JsonTypeName("default")
public class DefaultLimit implements Limit {

  List<WindowingSpec> windowingSpecs;

  @NotNull
  int limit;

  @NotNull
  List<OrderByColumn> columns;

  public DefaultLimit() {
  }

  public DefaultLimit(int limit, List<OrderByColumn> columns) {
    this.limit = limit;
    this.columns = columns;
  }

  public void addWindowingSpec(WindowingSpec... windowingSpecs) {
    if(this.windowingSpecs == null) {
      this.windowingSpecs = Lists.newArrayList();
    }

    this.windowingSpecs.addAll(Lists.newArrayList(windowingSpecs));
  }

  public int getLimit() {
    return limit;
  }

  public void setLimit(int limit) {
    this.limit = limit;
  }

  public List<OrderByColumn> getColumns() {
    return columns;
  }

  public void setColumns(List<OrderByColumn> columns) {
    this.columns = columns;
  }

  public List<WindowingSpec> getWindowingSpecs() {
    return windowingSpecs;
  }

  public void setWindowingSpecs(List<WindowingSpec> windowingSpecs) {
    this.windowingSpecs = windowingSpecs;
  }
}
