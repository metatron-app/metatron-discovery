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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.CountPattern;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfCountPattern extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfCountPattern.class);

  public DfCountPattern(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    CountPattern countPattern = (CountPattern) rule;

    Expression targetColExpr = countPattern.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    Expression expr = countPattern.getOn();
    Expression quote = countPattern.getQuote();
    Boolean ignoreCase = countPattern.getIgnoreCase();
    String patternStr;
    String quoteStr;
    String regExQuoteStr = null;
    Pattern pattern;

    List<String> targetColNames = TeddyUtil.getIdentifierList(targetColExpr);
    if (targetColNames.isEmpty()) {
      throw new WrongTargetColumnExpressionException(
              "DfCountPattern(): wrong target column expression: " + targetColExpr.toString());
    }

    String newColName = "countpattern";
    for (String targetColName : targetColNames) {
      if (prevDf.getColType(prevDf.getColnoByColName(targetColName)) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException("Countpattern should be applied only to string columns.");
      }
      targetColnos.add(prevDf.getColnoByColName(targetColName));
      newColName += "_" + targetColName;
    }

    addColumnWithDfAll(prevDf);

    newColName = addColumn(targetColnos.get(targetColnos.size() - 1) + 1, newColName, ColumnType.LONG);
    newColNames.add(newColName);
    interestedColNames.add(newColName);

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not count empty string!";

    patternStr = TeddyUtil.getPatternStr(expr, ignoreCase);
    quoteStr = TeddyUtil.getQuoteStr(quote);
    patternStr = TeddyUtil.modifyPatternStrWithQuote(patternStr, quoteStr);
    pattern = Pattern.compile(patternStr);

    preparedArgs.add(targetColnos);
    preparedArgs.add(pattern);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(newColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<Integer> targetColnos = (List<Integer>) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    String originalQuoteStr = (String) preparedArgs.get(3);
    String newColName = (String) preparedArgs.get(4);

    LOGGER.trace("DfCountPattern.gather(): start: offset={} length={} pattern={} quoteStr={}",
            offset, length, pattern, quoteStr);

    int lastColno = targetColnos.get(0);
    for (int i = 1; i < targetColnos.size(); i++) {
      lastColno = Math.max(lastColno, targetColnos.get(i));
    }

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // Count first
      long count = 0;
      for (int i = 0; i < targetColnos.size(); i++) {
        int colno = targetColnos.get(i);
        String coldata = (String) row.get(colno);
        if (coldata == null) {
          continue;
        }

        count += TeddyUtil.match(coldata, pattern, originalQuoteStr, 1000).size();
      }

      for (int colno = 0; colno < row.size(); colno++) {
        // Add the original columns anyway.
        newRow.add(prevDf.getColName(colno), row.get(colno));

        // Add count column after the last target.
        if (colno == lastColno) {
          newRow.add(newColName, count);
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfCountPattern.gather(): end: offset={} length={} pattern={} quoteStr={}",
            offset, length, pattern, quoteStr);
    return rows;
  }
}

