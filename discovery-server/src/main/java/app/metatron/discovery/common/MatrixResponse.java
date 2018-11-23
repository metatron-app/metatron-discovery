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

package app.metatron.discovery.common;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.node.NumericNode;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.StringTokenizer;

import app.metatron.discovery.common.datasource.DataType;

import static java.util.stream.Collectors.toList;

/**
 * Created by kyungtaak on 2016. 10. 19..
 */
public class MatrixResponse<R, C> implements Serializable {

  private static Logger LOGGER = LoggerFactory.getLogger(MatrixResponse.class);

  /**
   * Row Names
   */
  List<R> rows = Lists.newArrayList();

  /**
   * Category
   */
  List<Column<C>> categories;

  /**
   * Columns
   */
  List<Column<C>> columns;

  Map<String, Object> info;

  /**
   * 총 Values 목록, addMinMax 옵션을 위해 임시로 넣는 공간 (treemap/heatmap 에서 활용)
   */
  @JsonIgnore
  List<C> values;

  @JsonIgnore
  Integer categoryCount;

  public MatrixResponse() {
  }

  public MatrixResponse(List<R> rows, List<Column<C>> columns) {
    this(rows, columns, null);
  }

  public MatrixResponse(List<R> rows, List<Column<C>> columns, List<C> values) {
    this.rows = rows;
    if(rows != null) this.categoryCount = rows.size();
    this.columns = columns;
    this.values = values;
  }

  public MatrixResponse(List<R> rows, Map<String, List<C>> columnMap) {
    this.rows = rows;
    if(rows != null) this.categoryCount = rows.size();
    columns = Lists.newArrayList();
    for (String key : columnMap.keySet()) {
      columns.add(new Column<>(key, columnMap.get(key)));
    }
  }

  public MatrixResponse(List<R> rows, Map<String, List<List<C>>> categoryMap, Map<String, List<List<C>>> columnMap) {
    this.rows = rows;
    if(rows != null) this.categoryCount = rows.size();

    this.categories = Lists.newArrayList();
    for (String key : categoryMap.keySet()) {
      List<List<C>> values = categoryMap.get(key);
      this.categories.add(new Column(key, values.get(0), values.get(1)));
    }

    this.columns = Lists.newArrayList();
    for (String key : columnMap.keySet()) {
      List<List<C>> values = columnMap.get(key);
      this.columns.add(new Column(key, values.get(0), values.get(1)));
    }
  }

  public void addInfo(String key, Object value) {
    if (info == null) {
      info = Maps.newLinkedHashMap();
    }
    info.put(key, value);
  }

  /**
   * Scatter 차트 표현위한 데이터 전환
   */
  public MatrixResponse<R, C> reshapeForScatter(String columnDelimeter) {
    List<R> newRows = Lists.newArrayList();
    List<Column<C>> newColumns = Lists.newArrayList();
    List<C> valueForMinMax = Lists.newArrayList();
    int rowSize = rows.size();
    for (int i = 0; i < rowSize; i++) {
      List<C> newValue = Lists.newArrayList();
      StringJoiner joiner = new StringJoiner(columnDelimeter);
      for (int j = 0; j < columns.size(); j++) {
        C value = columns.get(j).getValue().get(i);
        // MinMax 값은 y 축 기준으로 측정하기 때문에 별도로 처리
        if (j == 1) {
          valueForMinMax.add(value);
        }
        newValue.add(value);
        joiner.add(columns.get(j).getName());
      }
      //      for (Column<C> column : columns) {
      //        newValue.add(column.getValue().get(i));
      //        joiner.add(column.getName());
      //      }
      newRows.add((R) joiner.toString());
      newColumns.add(new Column<>((String) rows.get(i), newValue));
    }

    return new MatrixResponse<>(newRows, newColumns, valueForMinMax);
  }

  /**
   * Heatmap 차트 표현 위한 데이터 전환
   */
  public MatrixResponse<R, C> reshapeForHeatmap(String columnDelimeter) {
    List<C> valueForMinMax = Lists.newArrayList(); // MinMax 처리용 값
    List<R> newRows = Lists.newArrayList();
    List<Column<C>> newColumns = Lists.newArrayList();
    int rowSize = rows.size();
    int columnSize = columns.size();

    for (Integer i = 0; i < rowSize; i++) {

      String rowName = (String) rows.get(i);
      boolean emptyRowName = StringUtils.isEmpty(rowName);

      Integer columnIdx = 0;
      for (Integer j = 0; j < columnSize; j++) {
        Column<C> col = columns.get(j);
        StringJoiner joiner = new StringJoiner(columnDelimeter);

        // Remove measure name from name of column.
        String joinName = StringUtils.substringBeforeLast(col.getName(), columnDelimeter);
        if(StringUtils.isEmpty(joinName) || joinName.endsWith(columnDelimeter)) {
          continue;
        }

        if(emptyRowName) {
          // If no field is located in the Row, the measure name is placed in front.
          String[] splitedName = StringUtils.split(col.getName(), columnDelimeter);//
          if(splitedName.length > 1) {
            joiner.add(splitedName[splitedName.length - 1]);
            for (int z = 0; z < splitedName.length - 1; z++) {
              joiner.add(splitedName[z]);
            }
          } else {
              joiner.add(col.getName());
          }
        } else {
          joiner.add(rowName);
          joiner.add(joinName);
        }

        // 행/열 인덱스값 및 Value 추가
        List<C> newValue = Lists.newArrayList();
        newValue.add((C) i);
        newValue.add((C) columnIdx++);
        C realValue = col.getValue().get(i);
        newValue.add(realValue);
        valueForMinMax.add(realValue);
        newColumns.add(new Column<>(joiner.toString(), newValue));
      }
    }

    MatrixResponse reshapedResponse = new MatrixResponse<>(newRows, newColumns, valueForMinMax);
    reshapedResponse.setCategoryCount(categoryCount);

    return reshapedResponse;
  }

  /**
   * Grid 표현을 위한 데이터 전환
   */
  public MatrixResponse reshapeForGrid(String aggrType) {
    if (StringUtils.isEmpty(aggrType)) {
      return this;
    }

    for (Column<C> column : this.columns) {
      switch (aggrType) {
        case "SUM":
          column.setAggrValue(column.value.parallelStream()
                                          .filter(value -> (value != null) && (value instanceof NumericNode || value instanceof Number))
                                          .mapToDouble(value -> value instanceof NumericNode ? ((NumericNode) value).doubleValue() : ((Number) value).doubleValue())
                                          .sum());
          break;
        case "AVG":
          column.setAggrValue(column.value.parallelStream()
                                          .filter(value -> (value != null) && (value instanceof NumericNode || value instanceof Number))
                                          .mapToDouble(value -> value instanceof NumericNode ? ((NumericNode) value).doubleValue() : ((Number) value).doubleValue())
                                          .average().orElse(Double.NaN));
          break;
        case "MIN":
          column.setAggrValue(column.value.parallelStream()
                                          .filter(value -> (value != null) && (value instanceof NumericNode || value instanceof Number))
                                          .mapToDouble(value -> value instanceof NumericNode ? ((NumericNode) value).doubleValue() : ((Number) value).doubleValue())
                                          .min().orElse(Double.NaN));
          break;
        case "MAX":
          column.setAggrValue(column.value.parallelStream()
                                          .filter(value -> (value != null) && (value instanceof NumericNode || value instanceof Number))
                                          .mapToDouble(value -> value instanceof NumericNode ? ((NumericNode) value).doubleValue() : ((Number) value).doubleValue())
                                          .max().orElse(Double.NaN));
          break;
        case "COUNT":
          column.setAggrValue(column.value.parallelStream()
                                          .filter(value -> (value != null) && (value instanceof NumericNode || value instanceof Number))
                                          .count());
          break;
      }
    }
    return this;
  }

  /**
   * Boxplot 차트 표현 위한 데이터 전환
   */
  public MatrixResponse reshapeForBoxplot(String columnDelimeter) {

    List<Column<C>> newColumns = Lists.newArrayList();
    for (int i = 0; i < rows.size(); i++) {
      List<C> values = Lists.newArrayList();
      for (Column<C> column : columns) {
        values.add(column.getValue().get(i));
      }
      newColumns.add(new Column<>((String) rows.get(i), values));
    }

    List<String> newRows = columns.stream()
                                  .map(column -> StringUtils.substringBefore(column.getName(), columnDelimeter))
                                  .collect(toList());

    return new MatrixResponse<>(newRows, newColumns);
  }

  /**
   * Pie 차트 표현 위한 데이터 전환
   */
  public MatrixResponse reshapeForPie() {

    List<Column<NameValuePair>> newColumns = Lists.newArrayList();

    for (Column<C> column : columns) {

      List<NameValuePair> values = Lists.newArrayList();
      List<C> originalValues = column.getValue();

      // Percentage 가 포함된 경우 처리
      List<Double> percentageValues = column.getPercentage();
      boolean includePercentage = false;
      if (CollectionUtils.isNotEmpty(percentageValues) && originalValues.size() == percentageValues.size()) {
        includePercentage = true;
      }

      for (int i = 0; i < originalValues.size(); i++) {
        Object value = originalValues.get(i);
        // Pivoting 결과 값이 없는 경우 제외
        if (value == null) {
          continue;
        }
        values.add(new NameValuePair((String) rows.get(i),
                                     value,
                                     includePercentage ? percentageValues.get(i) : null));
      }
      newColumns.add(new Column<>(column.getName(), values));
    }

    MatrixResponse reshapedResponse = new MatrixResponse<>(Lists.newArrayList(), newColumns);
    reshapedResponse.setCategoryCount(categoryCount);

    return reshapedResponse;
  }

  /**
   * Wordcloud 차트 표현 위한 데이터 전환
   */
  public MatrixResponse reshapeForWordcloud() {

    List<Column<NameValuePair>> newColumns = Lists.newArrayList();

    for (Column<C> column : columns) {

      List<NameValuePair> values = Lists.newArrayList();
      List<C> originalValues = column.getValue();
      for (int i = 0; i < originalValues.size(); i++) {
        Object value = originalValues.get(i);
        values.add(new NameValuePair((String) rows.get(i), value));
      }
      newColumns.add(new Column<>(column.getName(), values));
    }

    MatrixResponse reshapedResponse = new MatrixResponse<>(Lists.newArrayList(), newColumns);
    reshapedResponse.setCategoryCount(categoryCount);

    return reshapedResponse;
  }

  /**
   * Wordcloud 차트 표현 위한 데이터 전환
   */
  public MatrixResponse reshapeForTreeMap(String columnDelimeter, boolean setPercentage) {

    // 값이 없는 경우는 빈값 전달
    if (CollectionUtils.isEmpty(this.columns)) {
      return new MatrixResponse<>(Lists.newArrayList(), Lists.newArrayList());
    }

    List<String[]> arrays = this.columns.stream()
                                     .map(c -> splitColumnName(c.getName(), columnDelimeter))
                                     .collect(toList());

    // addMinMax를 위한 처리
    List<Double> valueForMinMax = this.columns.stream()
                                              .map(c -> (Double) c.getValue().get(0))
                                              .collect(toList());

    NameValueTree tree = new NameValueTree(arrays, valueForMinMax);
    if(setPercentage) {
      tree.calculatedPecentage();
    }

    MatrixResponse response = new MatrixResponse<>(Lists.newArrayList(), Lists.newArrayList(
        new Column<>("tree", tree.getChildren())
    ));
    response.setValues(valueForMinMax);

    return response;
  }

  /**
   * 맨 마지막 measure 필드를 제거하고, dimension 필드만 컬럼 구분자로 분할하여 처리
   * @param str
   * @param delimiter
   * @return
   */
  private String[] splitColumnName(String str, String delimiter) {

    List<String> columnToken = Lists.newArrayList();

    StringTokenizer token = new StringTokenizer(str, delimiter);

    int count = token.countTokens() - 1;
    for (int i = 0; i < count; i++) {
      columnToken.add(token.nextToken());
    }

    return columnToken.toArray(new String[0]);
  }

  public void addMinMax() {
    if (info == null) {
      info = Maps.newLinkedHashMap();
    }

    if (values == null) {
      // null 이 있는 경우 제외
      values = Lists.newArrayList();
      columns.forEach(col -> values.addAll(col.getValue().parallelStream()
                                              .filter(c -> c != null)
                                              .collect(toList())));
    }

    Double minLimit = Double.NEGATIVE_INFINITY;
    Double maxLimit = Double.POSITIVE_INFINITY;
    Double min = maxLimit;
    Double max = minLimit;

    for (int i = 0; i < values.size(); i++) {
      Object obj = values.get(i);
      Double target = null;
      if (obj instanceof NameValuePair) {  // TreeMap 에서 NameValuePair 사용 케이스 고려
        Object valueInPair = ((NameValuePair) obj).getValue();
        if (valueInPair instanceof Number) {
          target = ((Number) valueInPair).doubleValue();
        }
      } else if (obj instanceof Number) {  // Number 인 경우만 계산
        target = ((Number) obj).doubleValue();
      } else if (obj instanceof NumericNode) {  // NumericNode 인 경우만 계산
        target = ((NumericNode) obj).doubleValue();
      } else {
        continue;
      }

      if (target == null) {
        continue;
      }

      if (target <= maxLimit && target >= minLimit) {
        if (target > max) {
          max = target;
        }
        if (target < min) {
          min = target;
        }
      }
    }

    info.put("maxValue", max);
    info.put("minValue", min);
  }

  public List<R> getRows() {
    return rows;
  }

  public void setRows(List<R> rows) {
    this.rows = rows;
  }

  public List<Column<C>> getColumns() {
    return columns;
  }

  public void setColumns(List<Column<C>> columns) {
    this.columns = columns;
  }

  public Map<String, Object> getInfo() {
    return info;
  }

  public void setInfo(Map<String, Object> info) {
    this.info = info;
  }

  public List<C> getValues() {
    return values;
  }

  public void setValues(List<C> values) {
    this.values = values;
  }

  public List<Column<C>> getCategories() {
    return categories;
  }

  public void setCategories(List<Column<C>> categories) {
    this.categories = categories;
  }

  public Integer getCategoryCount() {
    return categoryCount;
  }

  public void setCategoryCount(Integer categoryCount) {
    this.categoryCount = categoryCount;
  }

  public static class Column<C> implements Serializable {

    /**
     * Column name
     */
    String name;

    /**
     * Column type
     */
    DataType type;

    /**
     * Value list
     */
    List<C> value;

    /**
     * Percentage list
     */
    List<Double> percentage;

    Number aggrValue;

    public Column(String name, DataType type) {
      this.name = name;
      this.type = type;
    }

    public Column(String name, List<C> value) {
      this.name = name;
      this.value = value;
    }

    public Column(String name, List<C> value, List<Double> percentage) {
      this.name = name;
      this.value = value;
      this.percentage = percentage;
    }

    public void addValue(C val) {
      if (value == null) {
        value = Lists.newArrayList();
      }
      value.add(val);
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public DataType getType() {
      return type;
    }

    public void setType(DataType type) {
      this.type = type;
    }

    public List<C> getValue() {
      return value;
    }

    public void setValue(List<C> value) {
      this.value = value;
    }

    public List<Double> getPercentage() {
      return percentage;
    }

    public void setPercentage(List<Double> percentage) {
      this.percentage = percentage;
    }

    public Number getAggrValue() {
      return aggrValue;
    }

    public void setAggrValue(Number aggrValue) {
      this.aggrValue = aggrValue;
    }
  }

  public static class NameValuePair implements Serializable {
    /**
     *
     */
    String name;

    /**
     *
     */
    Object value;

    /**
     *
     */
    Double percentage;

    public NameValuePair(String name, Object value) {
      this(name, value, null);
    }

    public NameValuePair(String name, Object value, Double percentage) {
      this.name = name;
      this.value = value;
      this.percentage = percentage;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public Object getValue() {
      return value;
    }

    public void setValue(Object value) {
      this.value = value;
    }

    public Double getPercentage() {
      return percentage;
    }

    public void setPercentage(Double percentage) {
      this.percentage = percentage;
    }
  }

  public static class NameValueTree implements Serializable {

    /**
     *
     */
    String name;

    /**
     *
     */
    Object value;

    /**
     *
     */
    Double percentage;

    /**
     * 하위 노드
     */
    List<NameValueTree> children;

    /**
     *
     */
    int depth;


    public NameValueTree(String name, Object value, int depth) {
      this.name = name;
      this.value = value;
      this.depth = depth;
    }

    public NameValueTree(List<String[]> strArray, List<Double> values) {

      Map<String, NameValueTree> treeMap = Maps.newHashMap();

      this.name = "ROOT";
      this.depth = 0;

      for (int i = 0; i < strArray.size(); i++) {
        String[] array = strArray.get(i);
        int depth = array.length;
        String name = array[depth - 1];
        NameValueTree tree = new NameValueTree(name, values.get(i), depth);
        if (!treeMap.containsKey(name)) {
          treeMap.put(name, tree);
        }
        if (depth == 1) {
          this.addChild(tree);
        } else {
          String parentName = array[depth - 2];
          NameValueTree parentTree = treeMap.get(parentName);
          if (parentTree != null) {
            parentTree.addChild(tree);
          }
        }
      }
    }

    public void calculatedPecentage() {
      if(CollectionUtils.isEmpty(children)) {
        return;
      }

      double minusSum = 0.0;
      double sum = 0.0;
      for (NameValueTree child : children) {
        double value = child.getValue() == null ? 0.0 : (double) child.getValue();
        if(value < 0.0) {
          minusSum += value;
        } else {
          sum += value;
        }
      }
      minusSum = Math.abs(minusSum) * 2;
      sum += minusSum * children.size();

      for (NameValueTree child : children) {
        double value = child.getValue() == null ? 0.0 : (double) child.getValue();
        child.setPercentage( sum == 0.0 ? 0.0 : ((value + minusSum) / sum) * 100);
        child.calculatedPecentage();
      }
    }

    public void addChild(NameValueTree childTree) {
      if(children == null) {
        children = Lists.newArrayList();
      }
      children.add(childTree);
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public Object getValue() {
      return value;
    }

    public void setValue(Object value) {
      this.value = value;
    }

    public Double getPercentage() {
      return percentage;
    }

    public void setPercentage(Double percentage) {
      this.percentage = percentage;
    }

    public List<NameValueTree> getChildren() {
      return children;
    }

    public void setChildren(List<NameValueTree> children) {
      this.children = children;
    }

    public int getDepth() {
      return depth;
    }

    public void setDepth(int depth) {
      this.depth = depth;
    }
  }
}
