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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.util.EnumUtils;

/**
 * WildCard 필터 조건 수행 (for candidate)
 */
@JsonTypeName("wildcard")
public class WildCardFilter extends AdvancedFilter {

  /**
   *  포함 조건 BEFORE (*contains), AFTER (contains*), BOTH(*contains*)
   */
  @NotNull
  ContainsType contains;

  /**
   *  포함되는 단어
   */
  @NotNull
  String value;

  public WildCardFilter() {
  }

  @JsonCreator
  public WildCardFilter(@JsonProperty("field") String field,
                        @JsonProperty("ref") String ref,
                        @JsonProperty("contains") String contains,
                        @JsonProperty("value") String value) {
    super(field, ref);
    this.contains = EnumUtils.getCaseEnum(ContainsType.class, contains, ContainsType.AFTER);
    this.value = Preconditions.checkNotNull(value);
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }

  public ContainsType getContains() {
    return contains;
  }

  public void setContains(ContainsType contains) {
    this.contains = contains;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  /**
   * 포함 조건 타입 정의
   */
  public enum ContainsType {
    BEFORE, AFTER, BOTH
  }
}
