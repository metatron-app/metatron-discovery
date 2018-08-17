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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Derive;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfDerive extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfDerive.class);

  public DfDerive(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Derive derive = (Derive) rule;

    String targetColName = derive.getAs().replaceAll("'", "");  // FIXME: use makeParsible()
    String timestampStyle;
    Expression expr = derive.getValue();
    int newColPos = -1;

    // add columns
    addColumnWithDfAll(prevDf);

    //concat에 포함된 timestamp column 처리
    convertTimestampForConcat(expr);

    // 새 컬럼의 타입을 결정 (+ rule에 등장하는 identifier들도 체크)
    ColumnType newColType = decideType(expr);

    if (ruleColumns.size() == 0) {             // identifier가 없거나 2개 이상인 경우, 제일 끝으로 붙인다.
      newColPos = getColCnt();
      timestampStyle = null;
    } else if(ruleColumns.size() == 1){                        // 딱 한 개의 identifier가 있는 경우 해당 identifier 뒤로 붙인다.
      newColPos = prevDf.getColnoByColName(ruleColumns.get(0))+1;
      timestampStyle = colDescs.get(newColPos-1).getTimestampStyle();
    } else {                                    //여러개인 경우 colno가 가장 마지막인 녀석 뒤로 붙인다.
      for(String colName : ruleColumns) {
        newColPos = getColnoByColName(colName) > newColPos ? getColnoByColName(colName) : newColPos;
      }

      newColPos++;
      timestampStyle = null;
    }

    // TODO: targetColName -> newColName (makes better sense)
    targetColName = addColumnWithTimestampStyle(newColPos, targetColName, newColType, timestampStyle);
    interestedColNames.add(targetColName);

    preparedArgs.add(newColPos);
    preparedArgs.add(targetColName);
    preparedArgs.add(expr);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int newColPos = (int) preparedArgs.get(0);
    String targetColName = (String) preparedArgs.get(1);
    Expression expr = (Expression) preparedArgs.get(2);
    int colno;

    LOGGER.trace("DfDerive.gather(): start: offset={} length={} targetColName={}", offset, length, targetColName);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // 새 컬럼 position 이전까지
      for (colno = 0; colno < newColPos; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      // 새 컬럼
      newRow.add(targetColName, eval((Expr) expr, row, getColType(colno)));

      // 이후 컬럼들
      for (colno = newColPos; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfDerive.gather(): end: offset={} length={} targetColName={}", offset, length, targetColName);
    return rows;
  }
}

