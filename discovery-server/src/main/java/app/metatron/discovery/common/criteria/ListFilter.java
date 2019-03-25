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

/**
 *
 */
public class ListFilter {
  ListCriterionKey criterionKey;
  String filterKey;
  String filterSubKey;
  String filterName;
  String filterValue;
  String filterSubValue;


  public ListFilter(){

  }

  public ListFilter(ListCriterionKey criterionKey, String filterKey, String filterSubKey,
                              String filterValue, String filterSubValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterSubKey = filterSubKey;
    this.filterValue = filterValue;
    this.filterSubValue = filterSubValue;
    this.filterName = filterName;
  }

  public ListFilter(ListCriterionKey criterionKey, String filterKey, String filterValue, String filterName){
    this.criterionKey = criterionKey;
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public ListFilter(String filterKey, String filterValue, String filterName){
    this.filterKey = filterKey;
    this.filterValue = filterValue;
    this.filterName = filterName;
  }

  public ListCriterionKey getCriterionKey() {
    return criterionKey;
  }

  public void setCriterionKey(ListCriterionKey criterionKey) {
    this.criterionKey = criterionKey;
  }

  public String getFilterKey() {
    return filterKey;
  }

  public void setFilterKey(String filterKey) {
    this.filterKey = filterKey;
  }

  public String getFilterSubKey() {
    return filterSubKey;
  }

  public void setFilterSubKey(String filterSubKey) {
    this.filterSubKey = filterSubKey;
  }

  public String getFilterName() {
    return filterName;
  }

  public void setFilterName(String filterName) {
    this.filterName = filterName;
  }

  public String getFilterValue() {
    return filterValue;
  }

  public void setFilterValue(String filterValue) {
    this.filterValue = filterValue;
  }

  public String getFilterSubValue() {
    return filterSubValue;
  }

  public void setFilterSubValue(String filterSubValue) {
    this.filterSubValue = filterSubValue;
  }
}
