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

package app.metatron.discovery.query.druid.sorts;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.query.druid.Sort;

/**
 * Search Query 내에서 명시적으로 count 기준 정렬을 위해 활용
 *
 */
@JsonTypeName("generic")
public class GenericSort implements Sort {

  List<String> ordering;

  public GenericSort() {
  }

  public GenericSort(List<String> ordering) {
    this.ordering = ordering;
  }

  public static GenericSort defaultCountSort() {
    return new GenericSort(Lists.newArrayList("$count:desc", "$value:integer"));
  }

  public List<String> getOrdering() {
    return ordering;
  }

  public void setOrdering(List<String> ordering) {
    this.ordering = ordering;
  }
}
