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

import java.util.List;

import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;

/**
 * Created by kyungtaak on 2017. 5. 12..
 */
public class SearchHitSort {

  List<String> ordering;

  public SearchHitSort() {
  }

  public SearchHitSort(List<String> ordering) {
    this.ordering = ordering;
  }

  public static SearchHitSort searchSort(CandidateQueryRequest.SortCreteria sortCreteria) {
    if(sortCreteria == CandidateQueryRequest.SortCreteria.COUNT) {
      return new SearchHitSort(Lists.newArrayList("$count:desc", "$value"));
    } else {
      return new SearchHitSort(Lists.newArrayList("$value", "$count:desc"));
    }
  }

  public List<String> getOrdering() {
    return ordering;
  }

  public void setOrdering(List<String> ordering) {
    this.ordering = ordering;
  }
}
