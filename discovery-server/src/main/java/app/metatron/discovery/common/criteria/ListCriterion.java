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

package app.metatron.discovery.common.criteria;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ListCriterion {

  ListCriterionKey criterionKey;
  ListCriterionType criterionType;
  String criterionName;
  List<ListCriterion> subCriteria;
  List<ListFilter> filters;
  Boolean searchable;

  public ListCriterion(){
  }

  public ListCriterion(ListCriterionKey criterionKey, ListCriterionType criterionType, String criterionName){
    this.criterionKey = criterionKey;
    this.criterionType = criterionType;
    this.criterionName = criterionName;
  }

  public ListCriterion(ListCriterionKey criterionKey, ListCriterionType criterionType, String criterionName, Boolean searchable){
    this.criterionKey = criterionKey;
    this.criterionType = criterionType;
    this.criterionName = criterionName;
    this.searchable = searchable;
  }

  public void addFilter(ListFilter filter){
    if(filters == null){
      filters = new ArrayList<>();
    }
    filters.add(filter);
  }

  public void addSubCriterion(ListCriterion subCriterion){
    if(subCriteria == null){
      subCriteria = new ArrayList<>();
    }
    subCriteria.add(subCriterion);
  }

  public ListCriterionKey getCriterionKey() {
    return criterionKey;
  }

  public void setCriterionKey(ListCriterionKey criterionKey) {
    this.criterionKey = criterionKey;
  }

  public ListCriterionType getCriterionType() {
    return criterionType;
  }

  public void setCriterionType(ListCriterionType criterionType) {
    this.criterionType = criterionType;
  }

  public String getCriterionName() {
    return criterionName;
  }

  public void setCriterionName(String criterionName) {
    this.criterionName = criterionName;
  }

  public List<ListCriterion> getSubCriteria() {
    return subCriteria;
  }

  public void setSubCriteria(List<ListCriterion> subCriteria) {
    this.subCriteria = subCriteria;
  }

  public List<ListFilter> getFilters() {
    return filters;
  }

  public void setFilters(List<ListFilter> filters) {
    this.filters = filters;
  }

  public Boolean getSearchable() {
    return searchable;
  }

  public void setSearchable(Boolean searchable) {
    this.searchable = searchable;
  }
}
