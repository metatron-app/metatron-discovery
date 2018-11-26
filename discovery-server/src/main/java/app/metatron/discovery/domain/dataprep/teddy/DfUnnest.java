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
import app.metatron.discovery.prep.parser.preparation.rule.Unnest;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DfUnnest extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfUnnest.class);

  public DfUnnest(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Unnest unnest = (Unnest) rule;

    String targetColName = unnest.getCol();
    int targetColno;
    Expression idx = unnest.getIdx(); // constant numeric, literal, numeric as literal  --> 정작 array가 필요

    targetColno = prevDf.getColnoByColName(targetColName);
    if (prevDf.getColType(targetColno) != ColumnType.ARRAY && prevDf.getColType(targetColno) != ColumnType.MAP) {
      throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevDf.getColType(targetColno));
    }

    int arrayIdx = -1;
    String mapKey = null;   // if null -> array
    String newColName;
    ColumnDescription colDesc = prevDf.getColDesc(targetColno);
    ColumnDescription newColDesc;

    if (prevDf.getColType(targetColno) == ColumnType.ARRAY) {
      // 컬럼이름은 언제나 unnest_0
      // row별로 fetch는 arrayIdx로
      if (idx instanceof Constant.StringExpr) {   // supports StringExpr for backward-compatability
        arrayIdx = Integer.valueOf(((Constant.StringExpr) idx).getEscapedValue());
      } else if (idx instanceof Constant.LongExpr) {
        arrayIdx = ((Long)((Constant.LongExpr) idx).getValue()).intValue();
      } else {
        throw new InvalidIndexTypeException("doUnnest(): invalid index type: " + idx.toString());
      }
      newColName = modifyDuplicatedColName("unnest_" + arrayIdx);
    } else {
      // row별로 fetch는 mapKey로, 컬럼이름은 mapKey를 기존컬럼과 안겹치게 변형한 것
      if (idx instanceof Identifier.IdentifierExpr) {
        throw new IdxOnMapTypeShouldBeStringException("doUnnest(): idx on MAP type should be STRING (maybe, this is a column name): " + ((Identifier.IdentifierExpr) idx).getValue());
      } else if (idx instanceof Constant.StringExpr) {
        mapKey = ((Constant.StringExpr) idx).getEscapedValue();
        if(mapKey.startsWith("`") && mapKey.endsWith("`")) {
            mapKey = mapKey.substring(1, mapKey.length()-1);
        }
        newColName = modifyDuplicatedColName("unnest_" + mapKey);
      } else {
        throw new IdxOnMapTypeShouldBeStringException("doUnnest(): idx on MAP type should be STRING: " + idx.toString());
      }
    }

    addColumnWithDfAll(prevDf);

    if (mapKey == null) {
      newColDesc = colDesc.getArrColDesc().get(arrayIdx);
    } else {
      newColDesc = colDesc.getMapColDesc().get(mapKey);
    }
    assert newColDesc != null : prevDf.getColName(targetColno);
    newColName = addColumn(targetColno + 1, newColName, newColDesc);

    newColNames.add(newColName);
    interestedColNames.add(newColName);

    preparedArgs.add(targetColno);
    preparedArgs.add(mapKey);
    preparedArgs.add(arrayIdx);
    preparedArgs.add(newColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    String mapKey = (String) preparedArgs.get(1);
    int arrayIdx = (int) preparedArgs.get(2);
    String newColName = (String) preparedArgs.get(3);
    int colno;

    LOGGER.trace("DfUnnest.gather(): start: offset={} length={} newColName={}", offset, length, newColName);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // 목적 컬럼까지만 추가
      for (colno = 0; colno <= targetColno; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      // 새 컬럼 추가
      if (mapKey == null) {
        List arr = (List) row.get(targetColno);
        if (arrayIdx >= arr.size()) {
          throw new WrongArrayIndexException(String.format("doUnnest(): arrayIdx > array length: idx=%d len=%d rowno=%d", arrayIdx, arr.size(), rowno));
        }
        Object obj = arr.get(arrayIdx);
        newRow.add(newColName, obj);
      } else {
        Map<String, Object> map = (Map<String, Object>) row.get(targetColno);
        if (!map.containsKey(mapKey)) {
          throw new WrongMapKeyException("doUnnest(): the map value does not have the requested key: " + mapKey);
        }
        Object obj = map.get(mapKey);
        newRow.add(newColName, obj);
      }

      // 나머지 추가
      for (colno = targetColno+1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.trace("DfUnnest.gather(): end: offset={} length={} newColName={}", offset, length, newColName);
    return rows;
  }
}

