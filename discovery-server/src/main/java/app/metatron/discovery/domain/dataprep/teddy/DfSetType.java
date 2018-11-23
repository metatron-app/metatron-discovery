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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.SetType;
import app.metatron.discovery.prep.parser.preparation.rule.expr.ExprType;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfSetType extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfSetType.class);

  public DfSetType(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    SetType setType = (SetType) rule;

    Expression targetColExpr = setType.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    String timestampFormat = setType.getFormat();
    ColumnType toType = getColTypeFromExprType(ExprType.bestEffortOf(setType.getType()));

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = prevDf.getColnoByColName(targetColName);
      if (colno == null) {
        throw new ColumnNotFoundException("DfSetType.prepare(): column not found: " + targetColName);
      }
      targetColnos.add(colno);
      interestedColNames.add(targetColName);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        targetColnos.add(prevDf.getColnoByColName(targetColName));
        interestedColNames.add(targetColName);
      }
    } else {
      throw new WrongTargetColumnExpressionException("DfSetType.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("DfSetType.prepare(): no target column designated: " + targetColExpr.toString());
    }

    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {
        if(toType == ColumnType.TIMESTAMP) {
          addColumnWithTimestampStyle(prevDf.getColName(colno), toType, timestampFormat);
        } else {
          addColumnWithTimestampStyle(prevDf.getColName(colno), toType, null);
        }
      } else {
        addColumn(prevDf.getColName(colno), prevDf.getColDesc(colno));
      }
    }

    preparedArgs.add(targetColnos);
    preparedArgs.add(toType);
    preparedArgs.add(timestampFormat);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    List<Integer> targetColnos = (List<Integer>) preparedArgs.get(0);
    ColumnType toType = (ColumnType) preparedArgs.get(1);
    String timestampFormat = (String) preparedArgs.get(2);

    LOGGER.trace("DfSetType.gather(): start: offset={} length={} targetColnos={} toType={} timestampFormat={}",
                 offset, length, targetColnos, toType, timestampFormat);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), targetColnos.contains(colno) ? cast(row.get(colno), toType, timestampFormat) : row.get(colno));
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfSetType.gather(): end: offset={} length={} targetColnos={} toType={} timestampFormat={}",
                 offset, length, targetColnos, toType, timestampFormat);
    return rows;
  }
}

