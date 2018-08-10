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
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.datasource.data.result.SearchResultFormat;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;

/**
 * "Search" 쿼리용 Request 객체
 *
 * @author Kyungtaak Noh
 * @since 1.0
 */
public class SearchQueryRequest extends AbstractQueryRequest implements QueryRequest {

  private static final Logger LOGGER = LoggerFactory.getLogger(SearchQueryRequest.class);

  /**
   * Filter 정보
   */
  List<Filter> filters;

  /**
   * Column/Row 관련 정보
   */
  Pivot pivot;

  /**
   * projection 에 넣는 MeasureField 에 aggregationType 이 null 인 경우 Select 구문 수행, 아닌 경우 GroupBy 구문 수행
   * <br/> (이때 모든 MeasureField 는 동일하게 aggregationType 이 존재하거나 없어야함, Validation 체크 필요)
   */
  List<Field> projections;

  /**
   * 기존 정의되어 있는 Field 외 가상 필드 정의
   */
  List<UserDefinedField> userFields;

  /**
   * Fetch 최대 Row Count 지정 및 Sorting 관련 정보
   */
  Limit limits;

  /**
   * Optional, 필요한 경우 resultFormat 지정
   */
  SearchResultFormat resultFormat;

  /**
   * Optional, 내부적으로 결과 값을 Forwarding 하도록 지정
   */
  ResultForward resultForward;

  /**
   * Optional, 고급 분석 수행을 위한 옵션 지정
   */
  Analysis analysis;

  /**
   * Optional, Can be logically expressed in terms of several GROUP BY queries connected by UNION.
   */
  List<List<String>> groupingSets;

  /**
   * Optional, SelectQuery의 경우 결과에 대한 Meta정보 처리 수행위한 플래그
   */
  Boolean metaQuery = false;

  /**
   * Optional, Preview 모드일때 필수필터의 영향을 받지 않도록 구성
   */
  Boolean preview = false;

  public SearchQueryRequest() {
    // Empty Constructor
  }

  @JsonCreator
  public SearchQueryRequest(@JsonProperty("dataSource") DataSource dataSource,
                            @JsonProperty("filters") List<Filter> filters,
                            @JsonProperty("pivot") Pivot pivot,
                            @JsonProperty("projections") List<Field> projections,
                            @JsonProperty("userFields") List<UserDefinedField> userFields,
                            @JsonProperty("limits") Limit limits,
                            @JsonProperty("resultFormat") SearchResultFormat resultFormat,
                            @JsonProperty("resultForward") ResultForward resultForward,
                            @JsonProperty("analysis") Analysis analysis,
                            @JsonProperty("groupingSets") List<List<String>> groupingSets,
                            @JsonProperty("metaQuery") Boolean metaQuery,
                            @JsonProperty("preview") Boolean preview,
                            @JsonProperty("context") Map<String, Object> context) {
    super(dataSource, context);

    this.filters = filters;
    this.pivot = pivot;
    this.projections = projections;
    this.userFields = userFields;
    this.limits = limits;
    this.resultForward = resultForward;
    this.analysis = analysis;
    this.groupingSets = groupingSets;
    this.metaQuery = BooleanUtils.toBoolean(metaQuery);
    this.preview = BooleanUtils.toBoolean(preview);

    // Request 객체 생성을 위해
    setResultFormat(resultFormat);
  }

  public SearchQueryRequest(DataSource dataSource, List<Filter> filters, Pivot pivot, Limit limits) {
    this(dataSource, filters, pivot, null, null, limits, null, null, null, null, null, null, null);
  }

  public SearchQueryRequest(DataSource dataSource, List<Filter> filters, List<Field> projections, Limit limits) {
    this(dataSource, null, filters, projections, limits);
  }

  public SearchQueryRequest(DataSource dataSource, List<UserDefinedField> userDefinedFields, List<Filter> filters, List<Field> projections, Limit limits) {
    this(dataSource, filters, null, projections, userDefinedFields, limits, null, null, null, null, null, null, null);
  }

  public SearchQueryRequest copyOf() {
    return new SearchQueryRequest(dataSource, filters, pivot, projections, userFields, limits,
                                  resultFormat, resultForward,
                                  analysis, groupingSets, metaQuery, preview, context);
  }

  public void addFilters(Filter filter) {
    if (this.filters == null) {
      this.filters = Lists.newArrayList();
    }

    this.filters.add(filter);
  }

  public void addUserDefinedFields(UserDefinedField userDefinedField) {
    if (this.userFields == null) {
      this.userFields = Lists.newArrayList();
    }

    this.userFields.add(userDefinedField);
  }

  /**
   * Aggregated 된 Expression Field 가 measure 필드에 선언되었는지 여부 확인
   *
   * @return
   */
  public boolean checkAggregatedExpressionField() {
    if(CollectionUtils.isEmpty(this.getUserFields())) {
      return false;
    }

    Set<String> measureFieldNames = this.getProjections().stream()
                                      .filter(field -> field instanceof MeasureField)
                                      .map(field -> field.getName())
                                      .collect(Collectors.toSet());

    if(measureFieldNames.isEmpty()) {
      return false;
    }

    // measure 필드로 선언된 컬럼 중 사용자 정의 컬럼이고 Aggregated 된 필드가 있는 경우 true
    for (UserDefinedField userDefinedField : this.getUserFields()) {
      if(measureFieldNames.contains(userDefinedField.getName()) &&
          userDefinedField instanceof ExpressionField &&
          ((ExpressionField) userDefinedField).isAggregated()) {
        return true;
      }
    }

    return false;
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public List<Filter> getFilters() {
    if(filters == null) {
      return Lists.newArrayList();
    }
    return filters;
  }

  public void setFilters(List<Filter> filters) {
    this.filters = filters;
  }

  public Pivot getPivot() {
    return pivot;
  }

  public void setPivot(Pivot pivot) {
    this.pivot = pivot;
  }

  public List<Field> getProjections() {
    if (pivot != null) {
      List<Field> pivotFields = pivot.getAllFields();
      if (CollectionUtils.isNotEmpty(pivotFields) && CollectionUtils.isEmpty(projections)) {
        return pivotFields;
      }
    }

    return projections == null ? Lists.newArrayList() : projections;
  }

  public void setProjections(List<Field> projections) {
    this.projections = projections;
  }

  public void setProjections(Pivot pivot, boolean original) {

    if(projections == null) {
      projections = Lists.newArrayList();
    }

    List<Field> fields = pivot.getAllFields();

    for(Field field : fields) {
      if(original && field instanceof MeasureField) {
        // 측정값 필드는 집계를 포함하지 않도록 처리
        MeasureField measureField = (MeasureField) field;
        measureField.setAggregationType(MeasureField.AggregationType.NONE);
        measureField.setAlias(measureField.getName());
        this.projections.add(field);
      } else if(original &&
          (field instanceof ExpressionField) && ((ExpressionField) field).isAggregated()) {
        // 원본 데이터일 경우 표현식중 집계가 있는 표현식은 제외
        continue;
      } else {
        this.projections.add(field);
      }
    }
  }

  public List<UserDefinedField> getUserFields() {
    if(userFields == null) {
      return Lists.newArrayList();
    }
    return userFields;
  }

  public void setUserFields(List<UserDefinedField> userFields) {
    this.userFields = userFields;
  }

  public Limit getLimits() {
    return limits;
  }

  public void setLimits(Limit limits) {
    this.limits = limits;
  }

  public SearchResultFormat getResultFormat() {
    return resultFormat;
  }

  public void setResultFormat(SearchResultFormat resultFormat) {
    this.resultFormat = resultFormat;

    if (this.resultFormat != null && this.resultFormat.getRequest() == null) {
      this.resultFormat.setRequest(this);
    }
  }

  public ResultForward getResultForward() {
    return resultForward;
  }

  public void setResultForward(ResultForward resultForward) {
    this.resultForward = resultForward;
  }

  public Boolean getMetaQuery() {
    return metaQuery;
  }

  public void setMetaQuery(Boolean metaQuery) {
    this.metaQuery = metaQuery;
  }

  public Boolean getPreview() {
    return preview;
  }

  public void setPreview(Boolean preview) {
    this.preview = preview;
  }

  public Analysis getAnalysis() {
    return analysis;
  }

  public void setAnalysis(Analysis analysis) {
    this.analysis = analysis;
  }

  public List<List<String>> getGroupingSets() {
    return groupingSets;
  }

  public void setGroupingSets(List<List<String>> groupingSets) {
    this.groupingSets = groupingSets;
  }

  @Override
  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public JsonNode makeResult(JsonNode root) {

    if (root == null || root.size() == 0) {
      return root;
    }

    // Result Type 판별
    //
    // Case "groupBy"
    if (!root.get(0).has("result")) {
      boolean deleteVersion = (this.analysis == null);  // 분석 쿼리일경우 version 정보를 유지할 목적으로 사용합니다.
      for (JsonNode node : root) {
        ObjectNode targetNode = (ObjectNode) node;
        // 불필요 노드 삭제
        if(deleteVersion) {
          targetNode.remove("version");
        }
        targetNode.remove("timestamp");

        // event 노드내 속성값을 Parent Node로 이동
        JsonNode eventNode = node.get("event");
        if (eventNode != null) {
          targetNode.setAll((ObjectNode) eventNode);
          // 기존 event 노드 삭제
          targetNode.remove("event");
        }
      }
    }
    // Case "select", "selectMeta"
    else {
      if(root.get(0).get("result").has("events")) {
        JsonNode eventNodes = root.get(0).get("result").get("events");
        for (JsonNode eventNode : eventNodes) {
          ObjectNode targetNode = (ObjectNode) eventNode;
          targetNode.setAll((ObjectNode) eventNode.get("event"));
          targetNode.remove("event");
          targetNode.remove("segmentId");
          targetNode.remove("offset");
          targetNode.remove("timestamp");
          targetNode.remove("__DUMMY");
        }
        root = eventNodes;
      } else {
        root = root.get(0).get("result");
      }
    }

    LOGGER.debug("[{}] Query Result Count : {}", CommonLocalVariable.getQueryId(), root.size());

    return root;
  }

  @Override
  public String toString() {
    return "SearchQueryRequest{" +
        "dataSource=" + dataSource +
        ", filters=" + filters +
        ", projections=" + projections +
        ", userFields=" + userFields +
        ", limits=" + limits +
        ", resultFormat=" + resultFormat +
        ", resultForward=" + resultForward +
        ", context=" + context +
        ", metaQuery=" + metaQuery +
        ", preview=" + preview +
        '}';
  }
}
