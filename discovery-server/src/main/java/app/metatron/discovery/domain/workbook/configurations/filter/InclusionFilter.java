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

import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

@JsonTypeName("include")
public class InclusionFilter extends Filter {

  /**
   * 선택 값(목록) 정보
   */
  List<String> valueList;

  /**
   * UI 에 표시될 선택표시 유형 추가 (Optional, for UI)
   */
  SelectorType selector;

  /**
   * 보기 설정된 아이템 항목  (Optional, for UI)
   */
  List<String> candidateValues;

  /**
   * User-Defined 타입인 경우 정의된 값 정보 (Optional, for UI)
   */
  List<String> definedValues;

  /**
   * InclusionFilter 값을 선택하기전 수행 필터 정보 (Optional, for UI)
   */
  List<AdvancedFilter> preFilters;

  /**
   * Value Pair
   */
  Map<String, String> valuePair;

  public InclusionFilter() {
    // Empty Constructor
  }

  public InclusionFilter(String field, List<String> valueList) {
    super(field);
    this.valueList = valueList;
  }

  public InclusionFilter(String field, String ref, List<String> valueList) {
    super(field, ref);
    this.valueList = valueList;
  }

  @Override
  public boolean compare(Filter filter) {
    if(!(filter instanceof InclusionFilter)) {
      return false;
    }

    InclusionFilter compareFilter = (InclusionFilter) filter;

    if(StringUtils.compare(field, compareFilter.getField()) != 0) {
      return false;
    }

    if(StringUtils.compare(ref, compareFilter.getRef()) != 0) {
      return false;
    }

    if(CollectionUtils.isEqualCollection(this.valueList, compareFilter.getValueList())) {
      return true;
    }

    return false;
  }

  public List<String> getValueList() {
    return valueList;
  }

  public void setValueList(List<String> valueList) {
    this.valueList = valueList;
  }

  public SelectorType getSelector() {
    return selector;
  }

  public void setSelector(SelectorType selector) {
    this.selector = selector;
  }

  public List<String> getCandidateValues() {
    return candidateValues;
  }

  public void setCandidateValues(List<String> candidateValues) {
    this.candidateValues = candidateValues;
  }

  public List<String> getDefinedValues() {
    return definedValues;
  }

  public void setDefinedValues(List<String> definedValues) {
    this.definedValues = definedValues;
  }

  public List<AdvancedFilter> getPreFilters() {
    return preFilters;
  }

  public void setPreFilters(List<AdvancedFilter> preFilters) {
    this.preFilters = preFilters;
  }

  public Map<String, String> getValuePair() {
    return valuePair;
  }

  public void setValuePair(Map<String, String> valuePair) {
    this.valuePair = valuePair;
  }

  public enum SelectorType {
    SINGLE_LIST, SINGLE_COMBO, MULTI_LIST, MULTI_COMBO, USER_DEFINED
  }
}
