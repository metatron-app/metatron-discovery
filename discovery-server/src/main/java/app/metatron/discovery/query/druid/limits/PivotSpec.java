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

package app.metatron.discovery.query.druid.limits;

import java.util.List;

/**
 * Druid 내 Pivot Spec 정의
 */
public class PivotSpec {

  /**
   * Pivot 컬럼 구분자
   */
  String separator;

  /**
   * true 로 지정시 결과 값 Row 내, 전체 쌍이 표현되도록 구성
   */
  Boolean tabularFormat;

  /**
   * Value 표현 방식 설정 <br/>
   * 해당 속성을 지정 하지 않거나 false 지정시,
   * <pre>
   *   {
   *     ...
   *     "{pivotColumnValue}" : [ {value1}, {value2}, ...]
   *   }
   *
   * </pre>
   * true 이면, <br/>
   * <pre>
   *  {
   *    ...
   *    "{pivotColumnValue}{separator}{valueColumnName}" : {value1},
   *    "{pivotColumnValue}{separator}{valueColumnName}" : {value2},
   *    ...
   *  }
   * </pre>
   */
  Boolean appendValueColumn;

  /**
   *
   */
  List<String> valueColumns;

  /**
   * Pivot 컬럼 지정, Ordering 지정
   */
  List<PivotColumn> pivotColumns;

  /**
   *
   */
  List<String> rowExpression;

  /**
   *
   */
  List<ConditionExpression> partitionExpressions;


  public PivotSpec() {
  }

  public PivotSpec(String separator, Boolean tabularFormat, Boolean appendValueColumn, List<String> valueColumns, List<PivotColumn> pivotColumns, List<String> rowExpression, List<ConditionExpression> partitionExpressions) {
    this.separator = separator;
    this.tabularFormat = tabularFormat;
    this.appendValueColumn = appendValueColumn;
    this.valueColumns = valueColumns;
    this.pivotColumns = pivotColumns;
    this.rowExpression = rowExpression;
    this.partitionExpressions = partitionExpressions;
  }

  public String getSeparator() {
    return separator;
  }

  public void setSeparator(String separator) {
    this.separator = separator;
  }

  public Boolean getTabularFormat() {
    return tabularFormat;
  }

  public void setTabularFormat(Boolean tabularFormat) {
    this.tabularFormat = tabularFormat;
  }

  public Boolean getAppendValueColumn() {
    return appendValueColumn;
  }

  public void setAppendValueColumn(Boolean appendValueColumn) {
    this.appendValueColumn = appendValueColumn;
  }

  public List<String> getValueColumns() {
    return valueColumns;
  }

  public void setValueColumns(List<String> valueColumns) {
    this.valueColumns = valueColumns;
  }

  public List<PivotColumn> getPivotColumns() {
    return pivotColumns;
  }

  public void setPivotColumns(List<PivotColumn> pivotColumns) {
    this.pivotColumns = pivotColumns;
  }

  public List<String> getRowExpression() {
    return rowExpression;
  }

  public void setRowExpression(List<String> rowExpression) {
    this.rowExpression = rowExpression;
  }

  public List<ConditionExpression> getPartitionExpressions() {
    return partitionExpressions;
  }

  public void setPartitionExpressions(List<ConditionExpression> partitionExpressions) {
    this.partitionExpressions = partitionExpressions;
  }

  public static class ConditionExpression {
    String condition;
    String expression;

    public ConditionExpression() {
      // Empty Constructor
    }

    public ConditionExpression(String expression) {
      this.expression = expression;
    }

    public ConditionExpression(String condition, String expression) {
      this.condition = condition;
      this.expression = expression;
    }

    public String getCondition() {
      return condition;
    }

    public void setCondition(String condition) {
      this.condition = condition;
    }

    public String getExpression() {
      return expression;
    }

    public void setExpression(String expression) {
      this.expression = expression;
    }

    @Override
    public String toString() {
      return "ConditionExpression{" +
          "condition='" + condition + '\'' +
          ", expression='" + expression + '\'' +
          '}';
    }
  }
}
