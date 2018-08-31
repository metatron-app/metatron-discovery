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
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Unpivot;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfUnpivot extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfUnpivot.class);

  public DfUnpivot(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Unpivot unpivot = (Unpivot) rule;

    Expression unpivotColExpr = unpivot.getCol();
    int groupEvery = (unpivot.getGroupEvery() == null) ? 1 : unpivot.getGroupEvery();
    List<String> unpivotColNames = new ArrayList<>();
    List<String> fixedColNames = new ArrayList<>();

    // group by expression -> group by colnames
    if (unpivotColExpr instanceof Identifier.IdentifierExpr) {
      unpivotColNames.add(((Identifier.IdentifierExpr) unpivotColExpr).getValue());
    } else if (unpivotColExpr instanceof Identifier.IdentifierArrayExpr) {
      unpivotColNames.addAll(((Identifier.IdentifierArrayExpr) unpivotColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("doUnpivot(): invalid unpivot target column expression type: " + unpivotColExpr.toString());
    }

    for (String colName : unpivotColNames) {
      if (!prevDf.colNames.contains(colName)) {
        throw new ColumnNotFoundException("doUnpivot(): column not found: " + colName);
      }
    }

    if (groupEvery != 1 && groupEvery != unpivotColNames.size()) {
      throw new WrongGroupEveryCountException(
              "doUnpivot(): group every count should be 1 or all: " + groupEvery);
    }

    // FIXME: 왜 여기서만 colName을 기준으로 할까? 다른 곳은 colNo를 가지고 모으고, 넣고 했는데..

    // 고정 column 리스트 확보
    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      if (!unpivotColNames.contains(prevDf.getColName(colno))) {
        fixedColNames.add(prevDf.getColName(colno));
      }
    }

    for (int i = 0; i < fixedColNames.size(); i++) {
      String colName = fixedColNames.get(i);
      this.addColumn(colName, prevDf.getColTypeByColName(colName));
    }
    for (int i = 0; i < unpivotColNames.size(); i++) {
      String unpivotColName = unpivotColNames.get(i);
      ColumnType unpivotColType = prevDf.getColTypeByColName(unpivotColName);
      this.addColumn("key" + (i + 1), ColumnType.STRING);
      this.addColumn("value" + (i + 1), unpivotColType);

      // groupEvery가 1인 경우 key1, value1만 사용함.
      // 이 경우, 모든 unpivot 대상 column의 TYPE이 같아야함.
      if (groupEvery == 1) {
        for (i++; i < unpivotColNames.size(); i++) {
          unpivotColName = unpivotColNames.get(i);
          if (unpivotColType != prevDf.getColTypeByColName(unpivotColName)) {
            throw new TypeDifferentException(String.format(
                    "doUnpivot(): unpivot target column types differ: %s != %s",
                    unpivotColType, prevDf.getColTypeByColName(unpivotColName)));
          }
        }
        break;
      }
    }

    preparedArgs.add(fixedColNames);
    preparedArgs.add(unpivotColNames);
    preparedArgs.add(groupEvery);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    List<String> fixedColNames = (List<String>) preparedArgs.get(0);
    List<String> unpivotColNames = (List<String>) preparedArgs.get(1);
    int groupEvery = (int) preparedArgs.get(2);

    LOGGER.trace("DfUnPivot.gather(): start: offset={} length={}", offset, length);

    Row row;     // of aggregatedDf
    Row newRow;  // of pivotedDf

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      row = prevDf.rows.get(rowno);
      newRow = new Row();
      for (String fixedColName : fixedColNames) {
        newRow.add(fixedColName, row.get(fixedColName));
      }
      int keyNo = 1;
      for (int i = 0; i < unpivotColNames.size(); i++) {
        String unpivotColName = unpivotColNames.get(i);
        newRow.add("key" + keyNo, unpivotColName);
        newRow.add("value" + keyNo, row.get(unpivotColName));
        if (groupEvery == 1) {
          rows.add(newRow);
          keyNo = 1;
          newRow = new Row();
          for (String fixedColName : fixedColNames) {
            newRow.add(fixedColName, row.get(fixedColName));
          }
          continue;
        } else if (groupEvery != unpivotColNames.size()) {
          throw new WrongGroupEveryCountException("doUnpivot(): group every count should be 1 or all: " + groupEvery);
        }
        keyNo++;
      }
      if (groupEvery != 1) {
        rows.add(newRow);
      }
    }

    LOGGER.trace("DfUnpivot.gather(): end: offset={} length={}", offset, length);
    return rows;
  }
}

