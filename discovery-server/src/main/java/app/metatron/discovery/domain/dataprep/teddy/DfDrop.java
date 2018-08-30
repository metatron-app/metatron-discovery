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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Drop;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfDrop extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfDrop.class);

  public DfDrop(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    List<String> targetColNames = new ArrayList<>();
    List<Integer> survivedColNos = new ArrayList<>();
    Drop drop = (Drop) rule;

    Expr expr = (Expr) drop.getCol();
    if (expr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) expr).getValue());
    } else if (expr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) expr).getValue());
    } else {
      assert false : expr;
    }

    for (String colName : targetColNames) {
      if (!prevDf.colsContains(colName)) {
        throw new ColumnNotFoundException("doDrop(): column not found: " + colName);
      }
    }

    for (int i = 0; i < prevDf.getColCnt(); i++) {
      if (targetColNames.contains(prevDf.getColName(i))) {
        continue;   // drop 대상 컬럼들은 새 df에서 누락
      }
      survivedColNos.add(i);
    }

    for (int colno : survivedColNos) {
      addColumnWithDf(prevDf, colno);
    }

    preparedArgs.add(survivedColNos);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException {
    List<Row> rows = new ArrayList<>();
    List<Integer> survivedColNos = (List<Integer>) preparedArgs.get(0);

    LOGGER.trace("DfDrop.gather(): start: offset={} length={} survivedColNos={}", offset, length, survivedColNos);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno : survivedColNos) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfDrop.gather(): done: offset={} length={} survivedColNos={}", offset, length, survivedColNos);

    return rows;
  }
}

