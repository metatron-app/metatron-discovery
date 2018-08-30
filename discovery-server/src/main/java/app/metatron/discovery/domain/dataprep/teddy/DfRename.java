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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.Rename;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DfRename extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfRename.class);

  public DfRename(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Rename rename = (Rename) rule;

    Expression targetColExpr = rename.getCol();
    Expression newColNameExpr = rename.getTo();
    List<String> targetColNames = new ArrayList<>();
    List<String> newColNames = new ArrayList<>();
    List<String> oldColNames = new ArrayList<>();
    Map<Integer, String> newColnoAndColName = new HashMap<>();

    //타깃 컬럼/컬럼리스트 처리
    if(targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if(targetColExpr instanceof  Identifier.IdentifierArrayExpr) {
      targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
    } else {
      throw new WrongTargetColumnExpressionException("doRename(): wrong target column expression: " + targetColExpr.toString());
    }

    //타깃 컬럼의 새로운 컬럼이름 처리
    if(newColNameExpr instanceof Constant.StringExpr) {
      newColNames.add(newColNameExpr.toString());
    } else if(newColNameExpr instanceof  Constant.ArrayExpr) {
      newColNames = ((Constant.ArrayExpr) newColNameExpr).getValue();
    } else {
      throw new IllegalColumnNameExpressionException("doRename(): the new column name expression is not an appropriate expression type: " + newColNameExpr.toString());
    }

    //새로운 컬럼이름의 중복/특수문자 처리
    oldColNames.addAll(prevDf.colNames);
    oldColNames.removeAll(targetColNames);

    for(int i = 0; i < newColNames.size(); i++) {
      String newColName = newColNames.get(i);
      newColName = makeParsable(newColName);
      newColName = modifyDuplicatedColName(oldColNames, newColName);

      newColNames.set(i, newColName);   // newColumns는 항상 grid의 column 순서로 옴
      oldColNames.add(newColName);
    }
    // newColNames 확정. 이제 다른 이름으로 변하지 않음.

    //타깃컬럼번호-신규이름 매핑
    for(int i = 0; i < targetColNames.size(); i++) {
      newColnoAndColName.put(prevDf.getColnoByColName(targetColNames.get(i)), newColNames.get(i));
    }

    for (int colNo = 0; colNo < prevDf.getColCnt(); colNo++) {
      if (newColnoAndColName.containsKey(colNo)) {
        addColumn(newColnoAndColName.get(colNo), prevDf.getColDesc(colNo));
      } else {
        addColumn(prevDf.getColName(colNo), prevDf.getColDesc(colNo));
      }
    }

    interestedColNames.addAll(newColNames);

    preparedArgs.add(newColnoAndColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException {
    List<Row> rows = new ArrayList<>();
    Map<Integer, String> newColnoAndColName = (Map<Integer, String>) preparedArgs.get(0);

    LOGGER.trace("DfRename.gather(): start: offset={} length={} newColnoAndColName={}", offset, length, newColnoAndColName);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        if (newColnoAndColName.containsKey(colno)) {
          newRow.add(newColnoAndColName.get(colno), row.get(colno));
        } else {
          newRow.add(getColName(colno), row.get(colno));
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfRename.gather(): done: offset={} length={} newColnoAndColName={}", offset, length, newColnoAndColName);
    return rows;
  }
}

