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

package app.metatron.discovery.domain.workbook.configurations;


import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

public class Limit implements Serializable {
  int limit;
  List<Sort> sort;

  public Limit() {
    // Empty Constructor
  }

  public Limit(int limit, Sort... sort) {
    this.sort = Lists.newArrayList(sort);
    this.limit = limit;
  }

  public List<Sort> getSort() {
    return sort;
  }

  public void setSort(List<Sort> sort) {
    this.sort = sort;
  }

  public int getLimit() {
    return limit;
  }

  public void setLimit(int limit) {
    this.limit = limit;
  }
}
