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

package app.metatron.discovery.domain.datasource.data;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.TimeUtils;

import static app.metatron.discovery.domain.datasource.data.CandidateQueryRequest.SortCreteria.COUNT;

/**
 * "Candidate" 쿼리용 Reqeust 객체
 */
public class CandidateQueryRequest extends AbstractQueryRequest implements QueryRequest {

  private static final Logger LOGGER = LoggerFactory.getLogger(CandidateQueryRequest.class);

  public static final String RESULT_KEY_NAME = "field";
  public static final String RESULT_VALUE_NAME_PREFIX = "value_";

  /**
   * 추가(ex. Page 내에서 지정) Filter 정보
   */
  List<Filter> filters;

  /**
   * 기존 정의되어 있는 Field 외 가상 필드 정의
   */
  List<UserDefinedField> userFields;

  /**
   * Search word
   */
  String searchWord;

  /**
   * Candidate 대상 field 정보 (Dimension/Timestamp/Measure Field)
   */
  Field targetField;

  /**
   * value of limitation
   */
  Integer limit;

  /**
   * Dementaion Field 일 경우 정렬 기준 정의, 기본값은 Value Count 순
   */
  SortCreteria sortBy = COUNT;

  public CandidateQueryRequest() {
  }

  @JsonCreator
  public CandidateQueryRequest(
      @JsonProperty("dataSource") DataSource dataSource,
      @JsonProperty("filters") List<Filter> filters,
      @JsonProperty("userFields") List<UserDefinedField> userFields,
      @JsonProperty("targetField") Field targetField,
      @JsonProperty("searchWord") String searchWord,
      @JsonProperty("sortBy") String sortBy,
      @JsonProperty("limit") Integer limit,
      @JsonProperty("context") Map<String, Object> context) {

    super(dataSource, context);

    this.filters = filters;
    this.userFields = userFields;

    this.searchWord = searchWord;
    this.sortBy = EnumUtils.getCaseEnum(SortCreteria.class, sortBy, COUNT);
    this.limit = limit;

    this.targetField = targetField;
    this.targetField.setAlias(RESULT_KEY_NAME);
  }

  public CandidateQueryRequest(DataSource dataSource, List<Filter> filters, Field targetField) {
    this(dataSource, filters, null, targetField);
  }

  public CandidateQueryRequest(DataSource dataSource, List<Filter> filters, List<UserDefinedField> userFields, Field targetField) {
    this(dataSource, filters, userFields, targetField, null, null, null, null);
  }

  @JsonIgnore
  public List<Filter> getAvailableFilters() {

    List<Filter> availableFilters = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(filters)) {
      availableFilters.addAll(filters);
    }

    return availableFilters;
  }

  public List<Filter> getFilters() {
    return filters;
  }

  public void setFilters(List<Filter> filters) {
    this.filters = filters;
  }

  public List<UserDefinedField> getUserFields() {
    return userFields;
  }

  public void setUserFields(List<UserDefinedField> userFields) {
    this.userFields = userFields;
  }

  public Field getTargetField() {
    return targetField;
  }

  public void setTargetField(Field targetField) {
    this.targetField = targetField;
  }

  public SortCreteria getSortBy() {
    return sortBy;
  }

  public void setSortBy(SortCreteria sortBy) {
    this.sortBy = sortBy;
  }

  public String getSearchWord() {
    return searchWord;
  }

  public void setSearchWord(String searchWord) {
    this.searchWord = searchWord;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  public JsonNode makeResult(JsonNode root) {

    if (root == null || root.size() == 0) {
      return root;
    }

    if (root.get(0).has("result")) {
      JsonNode resultNode = root.get(0).get("result");
      if (resultNode instanceof ArrayNode) { // topn/search case
        JsonNode firstNode = resultNode.get(0);
        if (firstNode != null && firstNode.has("value")) {  // Search case
          for (JsonNode eventNode : resultNode) {
            ObjectNode node = (ObjectNode) eventNode;
            node.put(RESULT_KEY_NAME, node.get("value").asText());
            node.remove("dimension");
            node.remove("value");
          }
        }
        root = resultNode;
      } else { // timeboundary case
        root = resultNode;
      }
    } else {
      if (root.get(0).has("columns")) {  // SegmentMetaQuery Case
        JsonNode node = root.get(0).get("columns");

        app.metatron.discovery.domain.datasource.Field field = dataSource.getMetaDataSource().getFieldByName(targetField.getName());

        ObjectNode targetNode = (ObjectNode) node.get(targetField.getName());

        if ("user_defined".equals(targetField.getRef())) {
          // FIXME :  중복 코드 해결 할것!
          targetNode = (ObjectNode) node.get(targetField.getColunm());
          targetNode.set("minValue", targetNode.get("minValue"));
          targetNode.set("maxValue", targetNode.get("maxValue"));

        } else if (field.getLogicalType() == LogicalType.TIMESTAMP) {
          DateTimeFormatter dateTimeFormatter = StringUtils.isNotEmpty(field.getTimeFormat()) ?
              DateTimeFormat.forPattern(field.getTimeFormat()) :
              DateTimeFormat.fullDateTime();

          // 명시적으로 UTC 타입존으로 지정
          dateTimeFormatter = dateTimeFormatter.withZone(DateTimeZone.UTC);

          if (!node.has(field.getName())) {
            LOGGER.error("field name in result not found. {}", GlobalObjectMapper.writeValueAsString(root));
            throw new QueryTimeExcetpion("field name in result not found.");
          }

          DateTime minDateTime = TimeUtils.getMinTime();
          DateTime maxDateTime = TimeUtils.getMaxTime();

          try {
            minDateTime = dateTimeFormatter.parseDateTime(targetNode.get("minValue").asText());
          } catch (Exception e) {
            LOGGER.warn("Fail to parse datetime: {}", targetNode.get("minValue"));
          }
          try {
            maxDateTime = dateTimeFormatter.parseDateTime(targetNode.get("maxValue").asText());
          } catch (Exception e) {
            LOGGER.warn("Fail to parse datetime: {}", targetNode.get("maxValue"));
          }

          targetNode.put("minTime", minDateTime.toString());
          targetNode.put("maxTime", maxDateTime.toString());
        } else if (field.getType() == DataType.FLOAT || field.getType() == DataType.DOUBLE ||
            field.getType() == DataType.LONG || field.getType() == DataType.INTEGER) {

          targetNode.set("minValue", extractNumberNode(targetNode.get("minValue")));
          targetNode.set("maxValue", extractNumberNode(targetNode.get("maxValue")));

        }

        targetNode.remove(Lists.newArrayList("type", "hasMultipleValues", "size",
                                             "cardinality", "errorMessage", "serializedSize", "nullCount"));

        root = targetNode;

      } else if (root.get(0).has("event")) {  // Case of GroupBy query.
        for (JsonNode node : root) {
          ObjectNode targetNode = (ObjectNode) node;
          ObjectNode eventNode = (ObjectNode) node.get("event");
          targetNode.remove(Lists.newArrayList("event", "version", "timestamp"));
          targetNode.setAll(eventNode);
        }
      }
    }

    LOGGER.debug("Query Result Count : " + root.size());

    return root;
  }

  /**
   * Extract number type node
   *
   * case 1. "Sales": { "minValue": 0.0, "maxValue": 22638.0 } case 2. "Sales": { "minValue": {
   * "Float": 0 }, "maxValue": { "Float": 22638 } }
   */
  public JsonNode extractNumberNode(JsonNode jsonNode) {
    return jsonNode.isNumber() ? jsonNode : jsonNode.fields().next().getValue();
  }

  public enum SortCreteria {
    COUNT, VALUE
  }
}
