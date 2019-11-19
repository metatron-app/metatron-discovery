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
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Split;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfSplit extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfSplit.class);

  public DfSplit(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Split split = (Split) rule;

    List<String> targetColNames = new ArrayList<>();
    Map<String, List<String>> splitedColNameList = new HashMap<>();
    Expression targetColExpr = split.getCol();
    Expression expr = split.getOn();
    Expression quote = split.getQuote();
    Integer limit = split.getLimit();
    Boolean ignoreCase = split.getIgnoreCase();
    String patternStr;
    String quoteStr;
    int targetColno;

    if (limit == null) {
      limit = 0;
    }

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException(
              "DfSplit.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    for (String targetColName : targetColNames) {
      // Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(
                String.format("DfSplit.prepare(): works only on STRING: targetColName=%s type=%s",
                        targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      // Highlighted Column List
      interestedColNames.add(targetColName);
    }

    int colIndex = 0;
    for (targetColno = 0; targetColno < prevDf.colCnt; targetColno++) {
      String targetColName = prevDf.getColName(targetColno);

      if (targetColNames.contains(targetColName)) {
        List<String> splitedColNames = new ArrayList<>();

        for (int i = 1; i <= limit + 1; i++) {
          String newColName = "split_" + targetColName + i;
          newColName = addColumn(colIndex++, newColName, ColumnType.STRING);  // Add in the middle
          splitedColNames.add(newColName);
          interestedColNames.add(newColName);
        }

        splitedColNameList.put(targetColName, splitedColNames);
      } else {
        addColumn(colIndex++, targetColName, prevDf.getColDesc(targetColno));
      }
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not split with empty string!";

    patternStr = TeddyUtil.getPatternStr(expr, ignoreCase);
    quoteStr = TeddyUtil.getQuoteStr(quote);
    patternStr = TeddyUtil.modifyPatternStrWithQuote(patternStr, quoteStr);

    preparedArgs.add(targetColNames);
    preparedArgs.add(patternStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    preparedArgs.add(splitedColNameList);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    String patternStr = (String) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    int splitLimit = (int) preparedArgs.get(3);
    Map<String, List<String>> splitedColNameList = (Map<String, List<String>>) preparedArgs.get(4);
    int colno;

    LOGGER.trace("DfSplit.gather(): start: offset={} length={} targetColno={}", offset, length, targetColNames);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      for (colno = 0; colno < prevDf.colCnt; colno++) {
        if (targetColNames.contains(prevDf.getColName(colno))) {
          String coldata = (String) row.get(colno);
          if (coldata == null) {
            continue;
          }
          String[] tokens = TeddyUtil.split(coldata, patternStr, quoteStr, splitLimit + 1);

          // Add new columns. The original columns is deleted.
          int i = 0;
          for (/* NOP */; i < tokens.length; i++) {
            newRow.add(splitedColNameList.get(prevDf.getColName(colno)).get(i), tokens[i]);
          }
          for (/* NOP */; i <= splitLimit; i++) {
            newRow.add(splitedColNameList.get(prevDf.getColName(colno)).get(i), null);
          }
        } else {
          // Leave irrelevant columns as they were
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfSplit.gather(): end: offset={} length={} targetColno={}", offset, length, targetColNames);
    return rows;
  }
}

