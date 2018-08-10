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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.prep.parser.preparation.rule.Pivot;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidAggregationValueExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidColumnExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TooManyPivotedColumnsException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnsupportedAggregationFunctionExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongAggregationFunctionExpressionException;

public class DfPivot extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfPivot.class);

  public DfPivot(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  protected String buildPivotNewColName(AggrType aggrType, String aggrTargetColName,
                                          List<String> pivotColNames, List<String> oldColNames, Row row) throws TeddyException {
      String newColName = null;

      switch (aggrType) {
          case COUNT:
              newColName = "row_count";
              break;
          case SUM:
              newColName = "sum_" + aggrTargetColName;
              break;
          case AVG:
              newColName = "avg_" + aggrTargetColName;
              break;
          case MIN:
              newColName = "min_" + aggrTargetColName;
              break;
          case MAX:
              newColName = "max_" + aggrTargetColName;
              break;
      }

      for (String pivotColName : pivotColNames) {
          newColName += "_" + row.get(pivotColName);
      }
      return modifyDuplicatedColName(oldColNames, newColName);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Pivot pivot = (Pivot) rule;

    Expression pivotColExpr = pivot.getCol();
    Expression groupByColExpr = pivot.getGroup();
    Expression aggrValueExpr = pivot.getValue();
    List<String> pivotColNames = new ArrayList<>();
    List<String> groupByColNames = new ArrayList<>();
    List<String> aggrValueStrs = new ArrayList<>();      // sum(x), avg(x), count() 등의 expression string

    // group by expression -> group by colnames
    if (groupByColExpr == null) {
      /* NOP */
    } else if (groupByColExpr instanceof Identifier.IdentifierExpr) {
      groupByColNames.add(((Identifier.IdentifierExpr) groupByColExpr).getValue());
    } else if (groupByColExpr instanceof Identifier.IdentifierArrayExpr) {
      groupByColNames.addAll(((Identifier.IdentifierArrayExpr) groupByColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doPivot(): invalid group by column expression type: " + groupByColExpr.toString());
    }

    // pivot target (to-be-column) column expression -> group by colnames
    if (pivotColExpr instanceof Identifier.IdentifierExpr) {
      pivotColNames.add(((Identifier.IdentifierExpr) pivotColExpr).getValue());
    } else if (pivotColExpr instanceof Identifier.IdentifierArrayExpr) {
      pivotColNames.addAll(((Identifier.IdentifierArrayExpr) pivotColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + pivotColExpr.toString());
    }

    // aggregation value expression -> aggregation expression strings
    if (aggrValueExpr instanceof Constant.StringExpr) {
      aggrValueStrs.add((String) (((Constant.StringExpr) aggrValueExpr).getValue()));
    } else if (aggrValueExpr instanceof Constant.ArrayExpr) {
      for (Object obj : ((Constant.ArrayExpr) aggrValueExpr).getValue()) {
        String strAggrValue = (String) obj;
        aggrValueStrs.add(strAggrValue);
      }
    } else {
      throw new InvalidAggregationValueExpressionTypeException("doPivot(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }

    List<String> mergedGroupByColNames = new ArrayList<>();
    mergedGroupByColNames.addAll(pivotColNames);
    mergedGroupByColNames.addAll(groupByColNames);

    preparedArgs.add(mergedGroupByColNames);
    preparedArgs.add(aggrValueStrs);
    preparedArgs.add(groupByColNames);
    preparedArgs.add(pivotColNames);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<String> mergedGroupByColNames = (List<String>) preparedArgs.get(0);
    List<String> aggrValueStrs = (List<String>) preparedArgs.get(1);
    List<String> groupByColNames = (List<String>) preparedArgs.get(2);
    List<String> pivotColNames = (List<String>) preparedArgs.get(3);

    List<AggrType> aggrTypes = new ArrayList<>();
    List<String> aggrTargetColNames = new ArrayList<>();

    LOGGER.trace("DfPivot.gather(): start: offset={} length={}", offset, length);

    DataFrame aggregatedDf = new DfAggregate(dsName, null);
    aggregatedDf.aggregate(prevDf, mergedGroupByColNames, aggrValueStrs);

    for (String colName : groupByColNames) {
      addColumn(colName, prevDf.getColTypeByColName(colName));
    }

    DataFrame pivotColSortedDf = new DfSort(dsName, null);
    pivotColSortedDf.sorted(aggregatedDf, pivotColNames, SortType.ASCENDING);

    for (int i = 0; i < aggrValueStrs.size(); i++) {
      String aggrValueStr = stripSingleQuote(aggrValueStrs.get(i));
      AggrType aggrType;
      ColumnType newColType;
      String newColName;
      String aggrTargetColName = null;

      if (aggrValueStr.toUpperCase().startsWith("COUNT")) {
        aggrType = AggrType.COUNT;
        newColType = ColumnType.LONG;
      } else {
        if (aggrValueStr.toUpperCase().startsWith(AggrType.SUM.name())) {
          aggrType = AggrType.SUM;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.AVG.name())) {
          aggrType = AggrType.AVG;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.MIN.name())) {
          aggrType = AggrType.MIN;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.MAX.name())) {
          aggrType = AggrType.MAX;
        } else {
          throw new UnsupportedAggregationFunctionExpressionException("doAggregateInternal(): unsupported aggregation function: " + aggrValueStr);
        }

        Pattern pattern = Pattern.compile("\\w+\\((\\w+)\\)");
        Matcher matcher = pattern.matcher(aggrValueStr);
        if (matcher.find() == false) {
          throw new WrongAggregationFunctionExpressionException("doAggregateInternal(): wrong aggregation function expression: " + aggrValueStr);
        }

        aggrTargetColName = matcher.group(1);
        newColType = (aggrType == AggrType.AVG) ? ColumnType.DOUBLE : prevDf.getColTypeByColName(aggrTargetColName);
      }

      Map<String, Object> pivotColGroupKey = null;
      for (Row row : pivotColSortedDf.rows) {
        if (pivotColGroupKey == null || groupByKeyChanged(row, pivotColNames, pivotColGroupKey)) {
          newColName = buildPivotNewColName(aggrType, aggrTargetColName, pivotColNames, groupByColNames, row);

          addColumn(newColName, newColType);

          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
        if (pivotColGroupKey == null) {
          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
      }

      if (getColCnt() > 2000) {  // FIXME: hard-cording
        throw new TooManyPivotedColumnsException("doPivot(): too many pivoted column count: " + getColCnt());
      }

      aggrTypes.add(aggrType);
      aggrTargetColNames.add(aggrTargetColName);
    }

    DataFrame groupByColSortedDf = new DfSort(dsName, null);
    groupByColSortedDf.sorted(pivotColSortedDf, groupByColNames, SortType.ASCENDING);
    Map<String, Object> groupByKey = null;
    //agrgregatedDF에서 실제 데이터가 위치하는 point를 가르킴.
    int aggregatedDataPointer = mergedGroupByColNames.size();

    Iterator<Row> iter = groupByColSortedDf.rows.iterator();
    Row row;            // of groupByColSortedDf
    Row newRow = null;  // of this
    while (iter.hasNext()) {
      row = iter.next();  // of groupByColSortedDf
      if (groupByKey == null) {
        newRow = newPivotRow(row, this, groupByColNames);
        groupByKey = buildGroupByKey(row, groupByColNames);
      } else if (groupByKeyChanged(row, groupByColNames, groupByKey)) {
        rows.add(newRow);
        newRow = newPivotRow(row, this, groupByColNames);
        groupByKey = buildGroupByKey(row, groupByColNames);
      }

      List<String> aggregatedDfColNames = new ArrayList<>();
      for (int colno = 0; colno < aggrTargetColNames.size(); colno++) {
        aggregatedDfColNames.add(groupByColSortedDf.getColName(colno));
      }
      for (int i = 0; i < aggrTargetColNames.size(); i++) {
        String aggrTargetColName = aggrTargetColNames.get(i);
        newRow.set(buildPivotNewColName(aggrTypes.get(i), aggrTargetColName, pivotColNames, groupByColNames, row), row.get(aggregatedDataPointer+i));
      } //이름 당연히 있으니까 중복되지...ㅜ
    }
    rows.add(newRow); // add the last retained row

    LOGGER.trace("DfPivot.gather(): end: offset={} length={}", offset, length);
    return null;
  }
}

