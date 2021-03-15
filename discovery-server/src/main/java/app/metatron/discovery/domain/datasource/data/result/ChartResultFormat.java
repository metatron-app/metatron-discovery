/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.JsonNode;

import org.apache.commons.collections.CollectionUtils;
import org.hibernate.validator.constraints.NotBlank;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.ClusterAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.TrendAnalysis;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.funtions.RunningSumFunc;
import app.metatron.discovery.query.druid.limits.PivotSpec;

import static app.metatron.discovery.domain.datasource.data.result.SearchResultFormat.ResultType.MATRIX;

/**
 * Created by kyungtaak on 2016. 7. 4..
 */
@JsonTypeName("chart")
public class ChartResultFormat extends SearchResultFormat {

  public static final String POSTFIX_PERCENTAGE = ".percent";

  public static final String OPTION_INTERSECION_VALUE = "intersectionValue";
  public static final String OPTION_SHOW_CATEGORY = "showCategory";
  public static final String OPTION_SHOW_PERCENTAGE = "showPercentage";
  public static final String OPTION_SHOW_TOTAL_CATEGORY = "showTotalCategory";
  public static final String OPTION_IS_CUMULATIVE = "isCumulative";

  @NotBlank
  String mode;

  Map<String, Object> options;

  String columnDelimeter = "\u2015";

  @JsonIgnore
  SearchResultFormat originalResultFormat;

  @JsonIgnore
  int columnCnt;

  public ChartResultFormat() {
  }

  public ChartResultFormat(String mode) {
    this.mode = mode;
  }

  public void preHandling() {

    switch (mode.toLowerCase()) {
      case "grid":
        if (getOptions("isOriginal", false)) {
          // original mode 일 경우, timestamp 포맷은 무시하도록 구성 (데이터 소스에 정의된 필드를 통해 확인)
          request.getProjections().forEach(field -> {
            if (field instanceof TimestampField) {
              ((TimestampField) field).emptyFormat();
            } else if (field instanceof DimensionField && field.getFormat() instanceof TimeFieldFormat) {
              ((DimensionField) field).emptyFormat();
            } else if (field instanceof MeasureField) {
              // if original mode, force set aggreation type to NONE
              ((MeasureField) field).setAggregationType(MeasureField.AggregationType.NONE);
            }
          });

          if (request.checkAggregatedExpressionField()) {
            throw new IllegalArgumentException("Not supported 'isOriginal' option, if aggregated expression field is included");
          }

          ObjectResultFormat objectResultFormat = new ObjectResultFormat();
          objectResultFormat.setRequest(request);
          objectResultFormat.setResultType(MATRIX);
          objectResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
          originalResultFormat = objectResultFormat;
        }
        break;
      default:
        break;
    }
  }

  @Override
  public Object makeResult(JsonNode node) {

    MatrixResponse response = null;

    switch (mode.toLowerCase()) {
      case "scatter":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForScatter(columnDelimeter);
        break;
      case "heatmap":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForHeatmap(columnDelimeter);
        break;
      case "boxplot":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForBoxplot(columnDelimeter);
        break;
      case "pie":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForPie();
        break;
      case "wordcloud":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForWordcloud();
        break;
      case "treemap":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        response = response.reshapeForTreeMap(columnDelimeter, getOptions(OPTION_SHOW_PERCENTAGE, false));
        break;
      case "map":
        return originalResultFormat.makeResult(node);
      case "grid":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        String columnAggregation = getOptions("columnAggregation", "");
        response = response.reshapeForGrid(columnAggregation);
        break;
      case "bar":
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        if (request.getPivot().reverseMode()) { // process for reverse mode
          response = response.reshapeForReverse(columnDelimeter);
        }
        break;
      case "line":
      case "combine":
      case "control":
      case "radar":
      case "waterfall":
      case "gauge":
      default:
        response = (MatrixResponse) originalResultFormat.makeResult(node);
        break;
    }

    if (response != null) {
      Boolean addMinMax = getOptions("addMinMax", false);
      if (addMinMax) {
        response.addMinMax();
      }
      return response;
    }

    return response;
  }

  @JsonIgnore
  public SearchResultFormat getOriginalFormat() {
    Pivot pivot = request.getPivot();

    if (pivot == null || pivot.getAllFields().isEmpty()) {
      throw new IllegalArgumentException("'pivot' property required.");
    }

    switch (mode.toLowerCase()) {
      case "grid":
        originalResultFormat = toGridPivotFormat(pivot);
        break;
      case "scatter":
        originalResultFormat = toScatterPivotFormat(pivot);
        break;
      case "heatmap":
        originalResultFormat = toHeatMapPivotFormat(pivot);
        break;
      case "boxplot":
        originalResultFormat = toBoxplotPivotFormat(pivot);
        break;
      case "pie":
        originalResultFormat = toPiePivotFormat(pivot);
        break;
      case "wordcloud":
        originalResultFormat = toWordCloudPivotFormat(pivot);
        break;
      case "radar":
        originalResultFormat = toRadarPivotFormat(pivot);
        break;
      case "treemap":
        originalResultFormat = toTreeMapPivotFormat(pivot);
        break;
      case "map":
        originalResultFormat = new RawResultFormat();
        break;
      case "line":
      case "control":
      case "combine":
        originalResultFormat = toLinePivotFormat(pivot);
        break;
      case "bar":
      case "waterfall":
        originalResultFormat = toBarPivotFormat(pivot);
        break;
      case "gauge":
        originalResultFormat = toGaugePivotFormat(pivot);
        break;
      default:
        originalResultFormat = toGridPivotFormat(pivot);
        break;
    }

    return originalResultFormat;
  }

  @JsonIgnore
  public Object getAnalysisResult(JsonNode node) {

    Analysis analysis = request.getAnalysis();
    if (analysis instanceof PredictionAnalysis) {
      // 시간 필드를 구하고,
      List<Field> timeFields = request.getProjections().stream()
                                      .filter(field -> field.getFormat() instanceof ContinuousTimeFormat)
                                      .collect(Collectors.toList());
      String timeFieldName = timeFields.get(0).getAlias();

      // 예측 대상 필드 구하고,
      PredictionAnalysis predictionAnalysis = (PredictionAnalysis) analysis;
      List<String> parameterNames = predictionAnalysis.getForecast().getParameters()
                                                      .stream()
                                                      .map(hyperParameter -> hyperParameter.getField())
                                                      .collect(Collectors.toList());
      // 각 요소별 데이터 초기화
      Map<String, List> result = Maps.newHashMap();
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
        if ("predict".equals(itemNode.get("version").textValue())) {

          JsonNode eventNode = itemNode.get("event");

          // Dimension 값 가져오기
          result.get(timeFieldName).add(eventNode.get(timeFieldName).textValue());

          // 예측 대상 시리즈(파라미터) 가져오기
          for (String parameterName : parameterNames) {
            List<List<Double>> paramValues = result.get(parameterName);
            JsonNode paramNode = eventNode.get(parameterName);
            paramValues.get(0).add(paramNode.get(0).asDouble());
            paramValues.get(1).add(paramNode.get(1).asDouble());
            paramValues.get(2).add(paramNode.get(2).asDouble());
          }

          // 파라미터 정보 가져오기
          if (first) {
            for (String parameterName : parameterNames) {
              String paramNamePlus = parameterName + ".params";  // .param postfix 로 [alpha, beta, gamma] 값이 포함됨
              List<Double> infoValues = Lists.newArrayList();

              // Array node 파싱
              JsonNode paramNode = eventNode.get(paramNamePlus);
              paramNode.forEach(arrayItem -> infoValues.add(arrayItem.asDouble()));

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

  public void addOptions(String key, Object value) {
    if (options == null) {
      options = Maps.newHashMap();
    }

    options.put(key, value);
  }

  @JsonIgnore
  public <T> T getOptionValue(String key) {
    if (options == null) {
      return null;
    }

    if (!options.containsKey(key)) {
      return null;
    }

    return (T) options.get(key);
  }

  public SearchResultFormat toLinePivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(new PivotResultFormat.Aggregation(field.getAlias()));
        } else if (field instanceof DimensionField || field instanceof TimestampField) {
          pivotFields.add(new PivotResultFormat.Pivot(field));
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    if (getOptions("isCumulative", false)) {
      PivotSpec.ConditionExpression expression = new PivotSpec.ConditionExpression();
      expression.setExpression("_ = " + new RunningSumFunc("_").toExpression());

      format.addExpression(expression);
    }

    return format;
  }

  public SearchResultFormat toBarPivotFormat(Pivot pivot) {

    boolean reverseMode = pivot.reverseMode();

    List<Field> columns;
    List<Field> rows;
    if (reverseMode) {
      columns = pivot.getRows();
      rows = pivot.getColumns();
    } else {
      columns = pivot.getColumns();
      rows = pivot.getRows();
    }
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> pivotFields.add(new PivotResultFormat.Pivot(field)));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(new PivotResultFormat.Aggregation(field.getAlias()));
        } else if (field instanceof DimensionField || field instanceof TimestampField) {
          if (reverseMode) {
            keyFields.add(field.getAlias());
          } else {
            pivotFields.add(new PivotResultFormat.Pivot(field));
          }
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  public SearchResultFormat toGaugePivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();


    if (CollectionUtils.isNotEmpty(columns)) {
      //columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(new PivotResultFormat.Aggregation(field.getAlias()));
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  public PivotResultFormat toGridPivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> pivotFields.add(new PivotResultFormat.Pivot(field)));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  public PivotResultFormat toScatterPivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        }
      });
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        }
      });
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      aggrs.forEach(field -> keyFields.add(field.getAlias()));
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  public PivotResultFormat toHeatMapPivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> pivotFields.add(new PivotResultFormat.Pivot(field)));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        } else if (field instanceof DimensionField) {
          pivotFields.add(new PivotResultFormat.Pivot(field));
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  private SearchResultFormat toBoxplotPivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      rows.forEach(field -> pivotFields.add(new PivotResultFormat.Pivot(field)));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField ||
            (field instanceof ExpressionField && ((ExpressionField) field).getRole() == app.metatron.discovery.domain.datasource.Field.FieldRole.MEASURE)) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;

  }

  /**
   * 행/열 선반 사용 불가, 교차에만 측정값 차원값 지정 가능
   */
  private SearchResultFormat toPiePivotFormat(Pivot pivot) {

    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        } else if (field instanceof DimensionField) {
          keyFields.add(field.getAlias());
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  private SearchResultFormat toWordCloudPivotFormat(Pivot pivot) {

    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        } else if (field instanceof DimensionField) {
          keyFields.add(field.getAlias());
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  private SearchResultFormat toRadarPivotFormat(Pivot pivot) {
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        } else if (field instanceof DimensionField) {
          keyFields.add(field.getAlias());
        }
      }
    }

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  public SearchResultFormat toTreeMapPivotFormat(Pivot pivot) {

    List<Field> columns = pivot.getColumns();
    List<Field> rows = pivot.getRows();
    List<Field> aggrs = pivot.getAggregations();

    List<String> keyFields = Lists.newArrayList();
    List<PivotResultFormat.Pivot> pivotFields = Lists.newArrayList();
    List<PivotResultFormat.Aggregation> aggregation = Lists.newArrayList();

    if (CollectionUtils.isNotEmpty(columns)) {
      columns.forEach(field -> keyFields.add(field.getAlias()));
    }

    if (CollectionUtils.isNotEmpty(rows)) {
      //rows.forEach(field -> keyFields.add(field.getAlias()));
      rows.forEach(field -> pivotFields.add(new PivotResultFormat.Pivot(field)));
    }

    if (CollectionUtils.isNotEmpty(aggrs)) {
      for (Field field : aggrs) {
        if (field instanceof MeasureField || field instanceof ExpressionField) {
          aggregation.add(
              new PivotResultFormat.Aggregation(field.getAlias())
          );
        }
      }
    }

    // Reshape 에 활용위한 셋팅
    columnCnt = columns.size();

    PivotResultFormat format = new PivotResultFormat();
    format.setRequest(request);
    format.setConnType(connType);
    format.setResultType(MATRIX);
    format.setKeyFields(keyFields);
    format.setPivots(pivotFields);
    format.setAggregations(aggregation);
    format.setSeparator(columnDelimeter);

    return format;
  }

  private <T> T getOptions(String optionName, T defaultValue) {
    if (options != null && options.containsKey(optionName)) {
      return (T) options.get(optionName);
    }
    return defaultValue;
  }

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public Map<String, Object> getOptions() {
    return options;
  }

  public void setOptions(Map<String, Object> options) {
    this.options = options;
  }

  public String getColumnDelimeter() {
    return columnDelimeter;
  }

  public void setColumnDelimeter(String columnDelimeter) {
    this.columnDelimeter = columnDelimeter;
  }
}
