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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalPatternTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Replace;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfReplace extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfReplace.class);

  public DfReplace(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  private void putReplacedConditions(String targetColName, String ruleString, Map<String, Expr> rowConditionExprs)
          throws TeddyException {
    Rule rule = new RuleVisitorParser().parse(ruleString);
    Expression conditionExpr = ((Replace) rule).getRow();
    replace$col(conditionExpr, targetColName);
    rowConditionExprs.put(targetColName, (Expr) conditionExpr);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Replace replace = (Replace) rule;

    Map<String, Expr> replacedConditionExprs = new HashMap<>();
    Expression targetColExpr = replace.getCol();
    Expression expr = replace.getOn();
    Expression withExpr = replace.getWith();
    Expression quote = replace.getQuote();
    Boolean globalReplace = replace.getGlobal();
    Boolean ignoreCase = replace.getIgnoreCase();
    String patternStr;
    String quoteStr = null;
    String regExQuoteStr = null;
    Pattern pattern;

    List<String> targetColNames = TeddyUtil.getIdentifierList(targetColExpr);
    if (targetColNames.isEmpty()) {
      throw new WrongTargetColumnExpressionException(
              "DfReplace.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    for (String targetColName : targetColNames) {
      //Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(
                String.format("DfReplace.prepare(): works only on STRING: targetColName=%s type=%s",
                        targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      //Highlighted Column List
      interestedColNames.add(targetColName);

      //Build Condition Expression
      putReplacedConditions(targetColName, ruleString, replacedConditionExprs);
    }

    addColumnWithDfAll(prevDf);

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not replace empty string!";

    patternStr = TeddyUtil.getPatternStr(expr, ignoreCase);
    quoteStr = TeddyUtil.getQuoteStr(quote);
    patternStr = TeddyUtil.modifyPatternStrWithQuote(patternStr, quoteStr);

    preparedArgs.add(targetColNames);
    preparedArgs.add(patternStr);
    preparedArgs.add(withExpr);
    preparedArgs.add(globalReplace);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(replacedConditionExprs);

    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    String patternStr = (String) preparedArgs.get(1);
    Expression withExpr = (Expression) preparedArgs.get(2);
    Boolean globalReplace = (Boolean) preparedArgs.get(3);
    String quoteStr = (String) preparedArgs.get(4);
    String originalQuoteStr = (String) preparedArgs.get(5);
    Map<String, Expr> replacedConditionExprs = (Map<String, Expr>) preparedArgs.get(6);

    LOGGER.trace("DfReplace.gather(): start: offset={} length={}", offset, length);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        String colName = getColName(colno);
        if (targetColNames.contains(colName) && row.get(colno) != null && checkCondition(
                replacedConditionExprs.get(colName), row)) {
          String coldata = (String) row.get(colno);

          String replacement = ((Expr) withExpr).eval(row).stringValue();
          coldata = TeddyUtil.replace(coldata, patternStr, replacement, quoteStr, globalReplace);
          newRow.add(colName, coldata);
        } else {
          newRow.add(colName, row.get(colno));
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfReplace.gather(): done: offset={} length={}", offset, length);
    return rows;
  }
}

