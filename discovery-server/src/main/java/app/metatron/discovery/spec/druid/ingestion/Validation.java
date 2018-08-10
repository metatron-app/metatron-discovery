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

package app.metatron.discovery.spec.druid.ingestion;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * 유효성 검증을 통해 검증식이 일치하면 대상 필드가 포함된 Row가 적재 되지 않도록 구성
 */
public class Validation {

  /**
   * 대상 Field
   */
  String columnName;

  /**
   * 검증 조건
   */
  List<String> exclusions;

  public Validation() {
  }

  public static Validation discardNullValidation(String columnName) {
    Validation validation = new Validation();
    validation.setColumnName(columnName);
    validation.setExclusions(Lists.newArrayList(columnName + "== null"));

    return validation;
  }

  public String getColumnName() {
    return columnName;
  }

  public void setColumnName(String columnName) {
    this.columnName = columnName;
  }

  public List<String> getExclusions() {
    return exclusions;
  }

  public void setExclusions(List<String> exclusions) {
    this.exclusions = exclusions;
  }
}
