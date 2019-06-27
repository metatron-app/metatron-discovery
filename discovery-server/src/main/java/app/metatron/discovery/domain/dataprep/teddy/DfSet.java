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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Set;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfSet extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfSet.class);

  public DfSet(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  private void putTargetCol(DataFrame prevDf, String targetColName, String ruleString,
                            List<Integer> targetColnos, Map<Integer, Expr> replacedColExprs, Map<Integer, Expr> replacedConditionExprs) throws TeddyException {
    // add targetColno
    int colno = prevDf.getColnoByColName(targetColName);
    targetColnos.add(colno);

    // add replacedColExpr
    Rule rule = new RuleVisitorParser().parse(ruleString);
    Expression exprCopy = ((Set) rule).getValue();
    Expression conditionExpr = ((Set) rule).getRow();
    replace$col(exprCopy, targetColName);
    replace$col(conditionExpr, targetColName);
    prevDf.convertTimestampForConcat(exprCopy);
    prevDf.convertTimestampForConcat(conditionExpr);
    replacedColExprs.put(colno, (Expr) exprCopy);
    replacedConditionExprs.put(colno, (Expr) conditionExpr);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Set set = (Set) rule;

    Expression targetColExpr = set.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    Map<Integer, Expr> replacedColExprs = new HashMap<>();
    Map<Integer, Expr> replacedConditionExprs = new HashMap<>();

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      interestedColNames.add(targetColName);
      putTargetCol(prevDf, targetColName, ruleString, targetColnos, replacedColExprs, replacedConditionExprs);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        interestedColNames.add(targetColName);
        putTargetCol(prevDf, targetColName, ruleString, targetColnos, replacedColExprs, replacedConditionExprs);
      }
    } else {
      throw new WrongTargetColumnExpressionException("doSet(): wrong target column expression: " + targetColExpr.toString());
    }

    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      addColumn(prevDf.getColName(colno), prevDf.getColDesc(colno));
    }

    preparedArgs.add(targetColnos);
    preparedArgs.add(replacedColExprs);
    preparedArgs.add(replacedConditionExprs);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    List<Integer> targetColnos = (List<Integer>) preparedArgs.get(0);
    Map<Integer, Expr> replacedColExprs = (Map<Integer, Expr>) preparedArgs.get(1);
    Map<Integer, Expr> replacedConditionExprs = (Map<Integer, Expr>) preparedArgs.get(2);

    LOGGER.trace("DfSet.gather(): start: offset={} length={} targetColnos={}", offset, length, targetColnos);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        if (targetColnos.contains(colno) && checkCondition(replacedConditionExprs.get(colno), row)) {
          newRow.add(getColName(colno), eval(replacedColExprs.get(colno), row, getColType(colno)));
        } else {
          newRow.add(getColName(colno), row.get(colno));
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfSet.gather(): end: offset={} length={} targetColnos={}", offset, length, targetColnos);
    return rows;
  }
}

