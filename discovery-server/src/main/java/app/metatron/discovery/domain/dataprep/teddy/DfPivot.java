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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.prep.parser.preparation.rule.Pivot;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DfPivot extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfPivot.class);

  public DfPivot(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  private String buildPivotNewColName(AggrType aggrType, String aggrTargetColName,
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
      newColName = makeParsable(newColName);
      return modifyDuplicatedColName(oldColNames, newColName);
  }

  private String buildPivotNewColName2(String colPrefix, List<String> pivotColNames, List<String> oldColNames, Row row) throws TeddyException {
    String newColName = colPrefix;

    for (String pivotColName : pivotColNames) {
      newColName += "_" + row.get(pivotColName);
    }

    newColName = makeParsable(newColName);
    return modifyDuplicatedColName(oldColNames, newColName);
  }

  private Map<String, Object> buildGroupByKey(Row row, List<String> groupByColNames) {
    Map<String, Object> groupByKey = new HashMap<>();
    for (String groupByColName : groupByColNames) {
      groupByKey.put(groupByColName, row.get(groupByColName));
    }
    return groupByKey;
  }

  private boolean groupByKeyChanged(Row row, List<String> groupByColNames, Map<String, Object> groupByKey) {
    for (String groupByColName : groupByColNames) {
      if (!groupByKey.get(groupByColName).equals(row.get(groupByColName))) {
        return true;
      }
    }
    return false;
  }

  // row: row from aggregatedDf
  private Row newPivotRow(Row row, DataFrame pivotDf, List<String> groupByColNames) throws TeddyException {
    Row newRow = new Row();
    int colno;

    for (String groupByColName : groupByColNames) {
      newRow.add(groupByColName, row.get(groupByColName));
    }

    // 일단 기본값으로 깔고, 실제 있는 값을 채우기로 함
    for (colno = groupByColNames.size(); colno < pivotDf.getColCnt(); colno++) {
      ColumnType colType = pivotDf.getColType(colno);
      switch (colType) {
        case DOUBLE:
          newRow.add(pivotDf.getColName(colno), Double.valueOf(0));
          break;
        case LONG:
          newRow.add(pivotDf.getColName(colno), Long.valueOf(0));
          break;
        default:
          throw new ColumnTypeShouldBeDoubleOrLongException("doPivot(): column type of aggregation value should be DOUBLE or LONG: " + colType);
      }
    }
    return newRow;
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
    List<Expr.FunctionExpr> funcExprs;

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

    // aggregation value expression is not string literals any more.
    if (aggrValueExpr instanceof Expr.FunctionExpr) {
      funcExprs = new ArrayList(1);
      funcExprs.add((Expr.FunctionExpr) aggrValueExpr);
    } else if (aggrValueExpr instanceof Expr.FunctionArrayExpr) {
      funcExprs = ((Expr.FunctionArrayExpr) aggrValueExpr).getFunctions();
    } else {
      throw new InvalidAggregationValueExpressionTypeException("DfAggregate.prepare(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }

    List<String> mergedGroupByColNames = new ArrayList<>();
    mergedGroupByColNames.addAll(pivotColNames);
    mergedGroupByColNames.addAll(groupByColNames);

    preparedArgs.add(mergedGroupByColNames);
    preparedArgs.add(funcExprs);
    preparedArgs.add(groupByColNames);
    preparedArgs.add(pivotColNames);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<String> mergedGroupByColNames = (List<String>) preparedArgs.get(0);
    List<Expr.FunctionExpr> funcExprs = (List<Expr.FunctionExpr>) preparedArgs.get(1);
    List<String> groupByColNames = (List<String>) preparedArgs.get(2);
    List<String> pivotColNames = (List<String>) preparedArgs.get(3);
    List<String> newColNames = new ArrayList<>();
    List<Integer> targetColnos = new ArrayList<>();   // Each aggregation value has 1 target column. (except "count")

    LOGGER.trace("DfPivot.gather(): start: offset={} length={}", offset, length);

    DataFrame aggregatedDf = new DfAggregate(dsName, null);
    aggregatedDf.aggregate(prevDf, mergedGroupByColNames, funcExprs);

    for (String colName : groupByColNames) {
      addColumn(colName, prevDf.getColTypeByColName(colName));
    }

    DataFrame pivotColSortedDf = new DfSort(dsName, null);
    pivotColSortedDf.sorted(aggregatedDf, pivotColNames, SortType.ASCENDING);

    String[] colPrefixes = new String[funcExprs.size()];

    for (int i = 0; i <  funcExprs.size(); i++) {
      Expr.FunctionExpr funcExpr = funcExprs.get(i);
      ColumnType newColType;

      List<Expr> args = funcExpr.getArgs();

      switch (funcExpr.getName()) {
        case "count":
          if (args == null || args.size() == 0) {   // I'm not sure what parser produces.
            colPrefixes[i] = "row_count";
            targetColnos.add(-1);
          } else {
            colPrefixes[i] = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          }
          newColType = ColumnType.LONG;
          break;
        case "avg":
          colPrefixes[i] = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          newColType = ColumnType.DOUBLE;
          break;
        case "sum":
        case "min":
        case "max":
          colPrefixes[i] = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          newColType = prevDf.getColType(targetColnos.get(targetColnos.size() - 1));   // last appended colType
          break;
        default:
          throw new UnsupportedAggregationFunctionExpressionException("DfPivot: unsupported aggregation function: " + funcExpr.toString());
      }

      Map<String, Object> pivotColGroupKey = null;
      for (Row row : pivotColSortedDf.rows) {
        if (pivotColGroupKey == null || groupByKeyChanged(row, pivotColNames, pivotColGroupKey)) {
          String finalColName = buildPivotNewColName2(colPrefixes[i], pivotColNames, groupByColNames, row);
          newColNames.add(finalColName);

          addColumn(finalColName, newColType);

          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
        if (pivotColGroupKey == null) {
          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
      }

      if (getColCnt() > 2000) {  // FIXME: hard-cording
        throw new TooManyPivotedColumnsException("doPivot(): too many pivoted column count: " + getColCnt());
      }
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

      for (int i = 0; i < funcExprs.size(); i++) {
        String finalColName = buildPivotNewColName2(colPrefixes[i], pivotColNames, groupByColNames, row);
        newRow.set(finalColName, row.get(aggregatedDataPointer + i));
      }
    }
    rows.add(newRow); // add the last retained row

    LOGGER.trace("DfPivot.gather(): end: offset={} length={}", offset, length);
    return null;
  }
}

