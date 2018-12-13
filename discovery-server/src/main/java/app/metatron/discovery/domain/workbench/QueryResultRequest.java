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

package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.domain.datasource.Field;

import java.util.List;

public class QueryResultRequest {

  String csvFilePath;
  List<Field> fieldList;
  Integer pageSize;
  Integer pageNumber;

  public String getCsvFilePath() {
    return csvFilePath;
  }

  public void setCsvFilePath(String csvFilePath) {
    this.csvFilePath = csvFilePath;
  }

  public Integer getPageSize() {
    return pageSize;
  }

  public void setPageSize(Integer pageSize) {
    this.pageSize = pageSize;
  }

  public Integer getPageNumber() {
    return pageNumber;
  }

  public void setPageNumber(Integer pageNumber) {
    this.pageNumber = pageNumber;
  }

  public List<Field> getFieldList() {
    return fieldList;
  }

  public void setFieldList(List<Field> fieldList) {
    this.fieldList = fieldList;
  }

  @Override
  public String toString() {
    return "QueryResultRequest{" +
            "csvFilePath='" + csvFilePath + '\'' +
            ", fieldList=" + fieldList +
            ", pageSize=" + pageSize +
            ", pageNumber=" + pageNumber +
            '}';
  }
}
