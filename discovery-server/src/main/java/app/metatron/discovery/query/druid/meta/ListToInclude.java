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

package app.metatron.discovery.query.druid.meta;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

@JsonTypeName("list")
public class ListToInclude implements ToInclude {

  List<String> columns;

  public ListToInclude() {
  }

  public ListToInclude(List<String> columns) {
    this.columns = columns;
  }

  public ListToInclude(String... columns) {
    this.columns = Lists.newArrayList(columns);
  }

  public List<String> getColumns() {
    return columns;
  }
}
