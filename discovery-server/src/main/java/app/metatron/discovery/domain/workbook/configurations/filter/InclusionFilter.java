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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.util.EnumUtils;

/**
 * In Filter
 */
@JsonTypeName("include")
public class InclusionFilter extends Filter {

  /**
   * Selected Item List
   */
  List<String> valueList;

  /**
   * Selection Type (Optional, for UI)
   */
  SelectorType selector;

  /**
   * View set items  (Optional, for UI)
   */
  List<String> candidateValues;

  /**
   * User-Defined Item (Optional, for UI)
   */
  List<String> definedValues;

  /**
   * InclusionFilter 값을 선택하기전 수행 필터 정보 (Optional, for UI)
   */
  List<AdvancedFilter> preFilters;

  /**
   * Sort condition (Optional, for UI)
   */
  ItemSort sort;

  /**
   * Only show selected item (Optional, for UI)
   */
  Boolean showSelectedItem;

  /**
   * Value Pair (Optional, for Lookup)
   */
  Map<String, String> valuePair;

  Integer limit;

  public InclusionFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public InclusionFilter(@JsonProperty("dataSource") String dataSource,
                         @JsonProperty("field") String field,
                         @JsonProperty("ref") String ref,
                         @JsonProperty("valueList") List<String> valueList,
                         @JsonProperty("values") List<String> values,
                         @JsonProperty("selector") String selector,
                         @JsonProperty("candidateValues") List<String> candidateValues,
                         @JsonProperty("definedValues") List<String> definedValues,
                         @JsonProperty("preFilters") List<AdvancedFilter> preFilters,
                         @JsonProperty("sort") ItemSort sort,
                         @JsonProperty("showSelectedItem") Boolean showSelectedItem,
                         @JsonProperty("valuePair") Map<String, String> valuePair,
                         @JsonProperty("limit") Integer limit) {
    super(dataSource, field, ref);

    this.valueList = valueList;
    if(values != null) {
      this.valueList = values;
    }

    this.selector = EnumUtils.getUpperCaseEnum(SelectorType.class, selector);
    this.candidateValues = candidateValues;
    this.definedValues = definedValues;
    this.preFilters = preFilters;
    this.sort = sort;
    this.showSelectedItem = showSelectedItem;
    this.valuePair = valuePair;
    this.limit = limit;
  }

  public InclusionFilter(String field, List<String> valueList) {
    super(field);
    this.valueList = valueList;
  }

  public InclusionFilter(String field, String ref, List<String> valueList) {
    super(field, ref);
    this.valueList = valueList;
  }

  public InclusionFilter(String dataSource, String field, String ref, List<String> valueList) {
    super(dataSource, field, ref);
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

  public ItemSort getSort() {
    return sort;
  }

  public void setSort(ItemSort sort) {
    this.sort = sort;
  }

  public Boolean getShowSelectedItem() {
    return showSelectedItem;
  }

  public Integer getLimit() { return limit; }

  public void setLimit(Integer limit) { this.limit = limit; }

  @Override
  public String toString() {
    return "InclusionFilter{" +
        "valueList=" + valueList +
        ", selector=" + selector +
        ", candidateValues=" + candidateValues +
        ", definedValues=" + definedValues +
        ", preFilters=" + preFilters +
        ", sort=" + sort +
        ", valuePair=" + valuePair +
        ", limit=" + limit +
        "} " + super.toString();
  }

  /**
   * Define sort conditions
   */
  public static class ItemSort implements Serializable {

    /**
     * Sort By
     */
    SortBy by;

    /**
     * Sort Direction
     */
    Sort.Direction direction;

    @JsonCreator
    public ItemSort(@JsonProperty("by") String by,
                    @JsonProperty("direction") String direction) {
      this.by = EnumUtils.getUpperCaseEnum(SortBy.class, by);
      this.direction = EnumUtils.getUpperCaseEnum(Sort.Direction.class, direction);
    }

    public SortBy getBy() {
      return by;
    }

    public Sort.Direction getDirection() {
      return direction;
    }

    @Override
    public String toString() {
      return "ItemSort{" +
          "by=" + by +
          ", direction=" + direction +
          '}';
    }
  }

  public enum  SortBy {
    COUNT, TEXT, NUMERIC, DATE
  }

  public enum SelectorType {
    SINGLE_LIST, SINGLE_COMBO, MULTI_LIST, MULTI_COMBO, USER_DEFINED
  }
}
