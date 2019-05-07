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

package app.metatron.discovery.domain.datasource.data.result;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.URI;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ParquetResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.ClusterAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.TrendAnalysis;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.query.druid.limits.PivotColumn;
import app.metatron.discovery.query.druid.limits.PivotSpec;
import app.metatron.discovery.query.druid.limits.PivotWindowingSpec;
import app.metatron.discovery.query.druid.queries.GroupingSet;
import app.metatron.discovery.util.EnumUtils;

/**
 * Created by kyungtaak on 2016. 8. 21..
 */
@JsonTypeName("dpivot")
public class PivotResultFormat extends SearchResultFormat {

  private static final Logger LOGGER = LoggerFactory.getLogger(PivotResultFormat.class);

  private static final String DEFAULT_SEPARATOR = "\u2015";

  String separator;

  List<String> keyFields;

  List<Pivot> pivots;

  List<Aggregation> aggregations;

  List<PivotSpec.ConditionExpression> expressions;

  ResultType resultType;

  Integer groupingSize = 0;

  Boolean includePercentage = false;

  public PivotResultFormat() {
  }

  @JsonCreator
  public PivotResultFormat(@JsonProperty("separator") String separator,
                           @JsonProperty("keyFields") List<String> keyFields,
                           @JsonProperty("pivots") List<Pivot> pivots,
                           @JsonProperty("aggregations") List<Aggregation> aggregations,
                           @JsonProperty("expressions") List<PivotSpec.ConditionExpression> expressions,
                           @JsonProperty("resultType") String resultType,
                           @JsonProperty("groupingSize") Integer groupingSize,
                           @JsonProperty("includePercent") Boolean includePercentage) {

    this.separator = separator == null ? DEFAULT_SEPARATOR : separator;

    Preconditions.checkArgument(CollectionUtils.isNotEmpty(keyFields), "keyFields required.");
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(pivots), "pivots required.");
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(aggregations), "aggregations required.");
    this.keyFields = keyFields;
    this.pivots = pivots;
    this.aggregations = aggregations;
    this.expressions = expressions;
    this.resultType = EnumUtils.getUpperCaseEnum(ResultType.class, resultType, ResultType.MAP);
    this.groupingSize = groupingSize == null ? 0 : groupingSize;
    this.includePercentage = includePercentage == null ? false : true;
  }

  public void addPivot(String fieldName) {
    if (pivots == null) {
      pivots = Lists.newArrayList();
    }

    pivots.add(new Pivot(fieldName));
  }

  public void addAggregation(String fieldName) {
    if (aggregations == null) {
      aggregations = Lists.newArrayList();
    }

    aggregations.add(new Aggregation(fieldName));
  }

  public void addExpression(PivotSpec.ConditionExpression expression) {
    if (expressions == null) {
      expressions = Lists.newArrayList();
    }

    expressions.add(expression);
  }

  public PivotWindowingSpec toEnginePivotSpec(String... expressions) {
    PivotWindowingSpec spec = new PivotWindowingSpec();

    // 키필드 지정
    spec.setPartitionColumns(keyFields);

    // 피봇 필드 지정
    PivotSpec pivotSpec = new PivotSpec();
    pivotSpec.setSeparator(separator);
    pivotSpec.setTabularFormat(true); // 모든 쌍이 표현되도록 true 로 지정
    pivotSpec.setAppendValueColumn(true);

    pivotSpec.setPivotColumns(pivots.stream()
                                    .map(pivot -> {
                                      PivotColumn pivotColumn = new PivotColumn(pivot.getField());

                                      Optional<Sort> findSort = this.getRequest().getLimits().getSort()
                                          .stream().filter(sort -> sort.getField().equalsIgnoreCase(pivot.getFieldName()))
                                          .findFirst();
                                      if(findSort.isPresent()) {
                                        pivotColumn.setDirection(
                                            findSort.get().getDirection() == Sort.Direction.DESC ?
                                                PivotColumn.Direction.DESCENDING : PivotColumn.Direction.ASCENDING);
                                      }

                                      return pivotColumn;
                                    }).collect(Collectors.toList()));

    pivotSpec.setValueColumns(aggregations.stream()
                                          .map(aggregation -> aggregation.getFieldName())
                                          .collect(Collectors.toList()));

    for (String expression : expressions) {
      addExpression(new PivotSpec.ConditionExpression(expression));
    }

    pivotSpec.setPartitionExpressions(this.expressions);

    spec.setPivotSpec(pivotSpec);

    return spec;
  }

  @Override
  public Object makeResult(JsonNode node) {
    if (checkFileResult(node)) {  // File Result 인 경우
      URI resultFileURI = getResultFileURI(node);

      ResultForward resultForward = request.getResultForward();
      try {
        if (resultForward instanceof CsvResultForward) {
          // TODO: 준비가 되면 작업
          return null;
        } else if (resultForward instanceof JsonResultForward) {
          // TODO: 준비가 되면 작업
          return null;
        } else if (resultForward instanceof ParquetResultForward) {
          // TODO: Druid에 준비가 되면 작업
          return null;
        } else {
          throw new QueryTimeExcetpion("Type of result is file, you must set 'resultForward' property.");
        }
      } finally {
        if (resultForward.getRemoveFile() && FileUtils.deleteQuietly(new File(resultFileURI))) {
          LOGGER.info("Successfully delete local file({})", resultFileURI.toString());
        }
      }
    } else {

      if (resultType == ResultType.MATRIX) {
        return toResultSetByMatrixType(request.makeResult(node));
      } else {
        return request.makeResult(node);
      }

    }

  }

  /**
   * 내부에서 관리하는 Matrix 타입 방식으로 전달
   */
  public MatrixResponse toResultSetByMatrixType(JsonNode node) {

    List<String> rows = Lists.newArrayList();
    Map<String, List<List<Double>>> categoryMap = Maps.newLinkedHashMap();
    Map<String, List<List<Double>>> valueMap = Maps.newLinkedHashMap();

    boolean analysisResults = (request.getAnalysis() != null);
    int keyFieldCnt = keyFields.size();

    ArrayNode analysisNode = null;
    String analysisKey = null;
    if (analysisResults) {
      analysisNode = GlobalObjectMapper.getDefaultMapper().createArrayNode();
      analysisKey = request.getAnalysis().getVersionKey();
    }

    // Grouping 을 수행한 경우 카테고리 명 별로 처리를 위한 변수
    boolean grouped = groupingSize > 1;
    // Grouping 을 수행한 경우 카테고리 명 별로 처리하도록 미리 셋팅
    if (grouped && CollectionUtils.isNotEmpty(pivots)) {
      // 추후 그룹핑(groupingSize)에 따른 루핑도 고려해야함
      for (Aggregation aggregation : aggregations) {
        String valueCategoryName = aggregation.getFieldName();
        // 카테고리 관련 처리를 위한 값 셋팅
        categoryMap.put(valueCategoryName, Lists.newArrayList(Lists.newArrayList(), Lists.newArrayList()));
      }
    }

    for (JsonNode aNode : node) {
      Iterator<Map.Entry<String, JsonNode>> fields = aNode.fields();
      if (analysisResults) {
        Map.Entry<String, JsonNode> nodeMap = fields.next();
        if (nodeMap.getValue().asText().equals(analysisKey)) {
          analysisNode.add(aNode);
          continue;
        }
      }

      List<String> rowKeys = Lists.newArrayList();
      for (int i = 0; i < keyFieldCnt; i++) {
        Map.Entry<String, JsonNode> nodeMap = fields.next();
        rowKeys.add(nodeMap.getValue().asText());
      }
      String categoryName = StringUtils.join(rowKeys, separator);
      rows.add(categoryName);

      while (fields.hasNext()) {
        Map.Entry<String, JsonNode> nodeMap = fields.next();
        String nodeKey = nodeMap.getKey();
        // Escape separator if nodeKey start with separator. ex. -SUM(m1) --SUM(m1)
        nodeKey = nodeKey.startsWith(separator) ? nodeKey.substring(pivots.size()) : nodeKey;
        JsonNode nodeValue = nodeMap.getValue();

        // Percentage Case
        if (includePercentage && StringUtils.endsWith(nodeKey, ChartResultFormat.POSTFIX_PERCENTAGE)) {
          String originalKey = StringUtils.substring(nodeKey, 0, nodeKey.length() - ChartResultFormat.POSTFIX_PERCENTAGE.length());
          if (grouped && categoryMap.containsKey(originalKey)) {
            List<List<Double>> values = categoryMap.get(originalKey);
            values.get(1).add(getDoubleValue(nodeValue));
          } else if (valueMap.containsKey(originalKey)) {
            valueMap.get(originalKey).get(1).add(getDoubleValue(nodeValue));
          } else {
            valueMap.put(originalKey,
                         Lists.newArrayList(Lists.newArrayList(),
                                            Lists.newArrayList(getDoubleValue(nodeValue))));
          }
          // Normal Value Case
        } else {
          if (grouped && categoryMap.containsKey(nodeKey)) {
            categoryMap.get(nodeKey).get(0).add(getDoubleValue(nodeValue));
          } else if (valueMap.containsKey(nodeKey)) {
            valueMap.get(nodeKey).get(0).add(getDoubleValue(nodeValue));
          } else {
            valueMap.put(nodeKey,
                         Lists.newArrayList(Lists.newArrayList(getDoubleValue(nodeValue)),
                                            Lists.newArrayList()));
          }
        }
      }
    }

    LOGGER.info("Row number of matrix results : {}", rows.size());

    MatrixResponse response = new MatrixResponse<>(rows, categoryMap, valueMap);
    if (analysisResults) {
      response.addInfo("analysis", getAnalysisResult(analysisNode));
    }

    return response;
  }

  private Double getDoubleValue(JsonNode jsonNode) {
    return jsonNode.isNull() ? null : jsonNode.asDouble();
  }

  public Object getAnalysisResult(JsonNode node) {

    Analysis analysis = request.getAnalysis();
    String versionKey = analysis.getVersionKey();

    if (analysis instanceof PredictionAnalysis) {
      // 시간 필드를 구하고,
      List<Field> timeFields = request.getProjections().stream()
                                      .filter(field -> field.getFormat() instanceof ContinuousTimeFormat)
                                      .collect(Collectors.toList());
      String timeFieldName = timeFields.get(0).getAlias();

      // 예측 대상 필드 구하고,
      PredictionAnalysis predictionAnalysis = (PredictionAnalysis) analysis;

      List<String> parameterNames = null;
      if (CollectionUtils.isEmpty(predictionAnalysis.getForecast().getParameters())) {
        parameterNames = request.getProjections().stream()
                                .filter(field -> field instanceof MeasureField)
                                .map(field -> field.getAlias())
                                .collect(Collectors.toList());
      } else {
        parameterNames = predictionAnalysis.getForecast().getParameters().stream()
                                           .map(hyperParameter -> hyperParameter.getField())
                                           .collect(Collectors.toList());
      }
      // 각 요소별 데이터 초기화
      Map<String, List> result = com.facebook.presto.jdbc.internal.guava.collect.Maps.newHashMap();
      result.put(timeFieldName, Lists.newArrayList());
      for (String parameterName : parameterNames) {
        List<List<Double>> values = Lists.newArrayList();
        values.add(Lists.newArrayList()); // upper
        values.add(Lists.newArrayList()); // operation
        values.add(Lists.newArrayList()); // lower
        result.put(parameterName, values);
      }

      Iterator<JsonNode> it = node.iterator();
      boolean first = true;
      while (it.hasNext()) {
        JsonNode itemNode = it.next();
        if (versionKey.equals(itemNode.get("version").textValue())) {

          // Dimension 값 가져오기
          result.get(timeFieldName).add(itemNode.get(timeFieldName).textValue());

          // 예측 대상 시리즈(파라미터) 가져오기
          for (String parameterName : parameterNames) {
            List<List<Double>> paramValues = result.get(parameterName);
            JsonNode paramNode = itemNode.get(parameterName);
            if (paramNode == null) {
              paramValues.get(0).add(0.0);
              paramValues.get(1).add(0.0);
              paramValues.get(2).add(0.0);
            } else {
              paramValues.get(0).add(paramNode.get(0).asDouble());
              paramValues.get(1).add(paramNode.get(1).asDouble());
              paramValues.get(2).add(paramNode.get(2).asDouble());
            }
          }

          // 파라미터 정보 가져오기
          if (first) {
            for (String parameterName : parameterNames) {
              String paramNamePlus = parameterName + ".params";  // .param postfix 로 [alpha, beta, gamma] 값이 포함됨
              // Array node 파싱
              JsonNode paramNode = itemNode.get(paramNamePlus);

              List<Double> infoValues;
              if (paramNode == null) {
                infoValues = Lists.newArrayList(0.0, 0.0, 0.0);
              } else {
                infoValues = Lists.newArrayList();
                paramNode.forEach(arrayItem -> infoValues.add(arrayItem.asDouble()));
              }

              result.put(paramNamePlus, infoValues);
            }
            first = false;
          }

          // Prediction 값은 제거
          it.remove();
        }
      }
      return result;

    } else if (analysis instanceof TrendAnalysis) {

    } else if (analysis instanceof ClusterAnalysis) {

    }

    return null;
  }

  public String getSeparator() {
    return separator;
  }

  public void setSeparator(String separator) {
    this.separator = separator;
  }

  public List<String> getKeyFields() {
    return keyFields;
  }

  public void setKeyFields(List<String> keyFields) {
    this.keyFields = keyFields;
  }

  public List<Pivot> getPivots() {
    return pivots;
  }

  public void setPivots(List<Pivot> pivots) {
    this.pivots = pivots;
  }

  public List<Aggregation> getAggregations() {
    return aggregations;
  }

  public void setAggregations(List<Aggregation> aggregations) {
    this.aggregations = aggregations;
  }

  public ResultType getResultType() {
    return resultType;
  }

  public void setResultType(ResultType resultType) {
    this.resultType = resultType;
  }

  public List<PivotSpec.ConditionExpression> getExpressions() {
    return expressions;
  }

  public void setExpressions(List<PivotSpec.ConditionExpression> expressions) {
    this.expressions = expressions;
  }

  public Integer getGroupingSize() {
    return groupingSize;
  }

  public void setGroupingSize(Integer groupingSize) {
    this.groupingSize = groupingSize;
  }

  public Boolean getIncludePercentage() {
    return includePercentage;
  }

  public void setIncludePercentage(Boolean includePercentage) {
    this.includePercentage = includePercentage;
  }

  /**
   * GrouppingSet 지정 <br/>
   * ex) [[key1, pivot1, pivot2], [key1, pivot1], [key1]]
   *
   * @return
   */
  public GroupingSet toGroupingSet() {
    // Grouping Set 지정
    List<String> allOfGroupByColumn = Lists.newArrayList(this.getKeyFields());
    List<String> pivotColumn = Lists.newArrayList();
    for (PivotResultFormat.Pivot pivot : this.getPivots()) {
      pivotColumn.add(pivot.getFieldName());
      allOfGroupByColumn.add(pivot.getFieldName());
    }

    List<List<String>> groupNames = Lists.newArrayList();
    groupNames.add(allOfGroupByColumn);
    for (int i = pivotColumn.size(); i > 0; i--) {
      List<String> names = Lists.newArrayList(keyFields);

      for (int j = 0; j < i-1; j++) {
        names.add(pivotColumn.get(j));
      }

      groupNames.add(names);
    }

    if(groupingSize != null) {
      int diff = groupNames.size() - groupingSize;
      if(groupNames.size() > diff) {
        for (int i = 0; i < diff; i++) {
          groupNames.remove(i + 1);
        }
      }
    }

    // GroupingSize 재지정
    groupingSize = groupNames.size();

    return new GroupingSet.Names(groupNames);
  }

  public static class Pivot {

    String fieldName;

    List<String> values;

    // 추후 PivotSpec 작업시 field 정보 확인 위해 필요
    @JsonIgnore
    transient Field field;

    @JsonCreator
    public Pivot(@JsonProperty(value = "fieldName", required = true) String fieldName,
                 @JsonProperty("values") List<String> values) {
      Preconditions.checkArgument(StringUtils.isNotEmpty(fieldName), "fieldName required.");
      this.fieldName = fieldName;
      this.values = values;
    }

    public Pivot(String fieldName, String... values) {
      this(fieldName, Lists.newArrayList(values));
    }

    public Pivot(Field field, String... values) {
      this(field.getAlias(), Lists.newArrayList(values));
      this.field = field;
    }

    public String getFieldName() {
      return fieldName;
    }

    public void setFieldName(String fieldName) {
      this.fieldName = fieldName;
    }

    public List<String> getValues() {
      return values;
    }

    public void setValues(List<String> values) {
      this.values = values;
    }

    public Field getField() {
      return field;
    }
  }

  public static class Aggregation {

    String fieldName;

    String defaultValue;

    public Aggregation() {
    }

    @JsonCreator
    public Aggregation(@JsonProperty(value = "fieldName", required = true) String fieldName,
                       @JsonProperty(value = "defaultValue") String defaultValue) {
      this.fieldName = fieldName;
      this.defaultValue = defaultValue;
    }

    public Aggregation(String fieldName) {
      this.fieldName = fieldName;
    }

    public String getFieldName() {
      return fieldName;
    }

    public void setFieldName(String fieldName) {
      this.fieldName = fieldName;
    }

    public String getDefaultValue() {
      return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
      this.defaultValue = defaultValue;
    }

  }

}
