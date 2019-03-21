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

import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

import app.metatron.discovery.common.entity.SearchParamValidator;

/**
 *
 */
public abstract class ListFilterRequest {
  List<String> createdBy;
  List<String> modifiedBy;
  DateTime createdTimeFrom;
  DateTime createdTimeTo;
  DateTime modifiedTimeFrom;
  DateTime modifiedTimeTo;
  String containsText;

  public List<String> getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(List<String> createdBy) {
    this.createdBy = createdBy;
  }

  public List<String> getModifiedBy() {
    return modifiedBy;
  }

  public void setModifiedBy(List<String> modifiedBy) {
    this.modifiedBy = modifiedBy;
  }

  public DateTime getCreatedTimeFrom() {
    return createdTimeFrom;
  }

  public void setCreatedTimeFrom(DateTime createdTimeFrom) {
    this.createdTimeFrom = createdTimeFrom;
  }

  public DateTime getCreatedTimeTo() {
    return createdTimeTo;
  }

  public void setCreatedTimeTo(DateTime createdTimeTo) {
    this.createdTimeTo = createdTimeTo;
  }

  public DateTime getModifiedTimeFrom() {
    return modifiedTimeFrom;
  }

  public void setModifiedTimeFrom(DateTime modifiedTimeFrom) {
    this.modifiedTimeFrom = modifiedTimeFrom;
  }

  public DateTime getModifiedTimeTo() {
    return modifiedTimeTo;
  }

  public void setModifiedTimeTo(DateTime modifiedTimeTo) {
    this.modifiedTimeTo = modifiedTimeTo;
  }

  public String getContainsText() {
    return containsText;
  }

  public void setContainsText(String containsText) {
    this.containsText = containsText;
  }

  public <E extends Enum<E>> List<E> getEnumList(List<String> enumStrList, Class<E> enumClass, String propName){
    List<E> enumList = null;
    if(enumStrList != null && !enumStrList.isEmpty()){
      enumList = new ArrayList<>();
      for(String enumStr : enumStrList){
        enumList.add(SearchParamValidator.enumUpperValue(enumClass, enumStr, propName));
      }
    }
    return enumList;
  }
}
