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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoLimitException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.Extract;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfExtract extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfExtract.class);

  public DfExtract(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Extract extract = (Extract) rule;

    Map<String, List<String>> extractedColNameList = new HashMap<>();
    Expression targetColExpr = extract.getCol();
    int targetColno;
    Expression expr = extract.getOn();
    Expression quote = extract.getQuote();
    Boolean ignoreCase = extract.getIgnoreCase();
    String patternStr;
    String quoteStr;
    String regExQuoteStr = null;
    Pattern pattern;

    int limit = extract.getLimit();
    if (limit <= 0) {
      throw new NoLimitException("doExtract(): limit should be >= 0: " + limit);
    }

    List<String> targetColNames = TeddyUtil.getIdentifierList(targetColExpr);
    if (targetColNames.isEmpty()) {
      throw new WrongTargetColumnExpressionException(
              "DfExtract.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    addColumnWithDfAll(prevDf);

    for (String targetColName : targetColNames) {
      //Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(
                String.format("DfExtract.prepare(): works only on STRING: targetColName=%s type=%s",
                        targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      //Highlighted Column List
      interestedColNames.add(targetColName);
      targetColno = getColnoByColName(targetColName);
      List<String> extractedColNames = new ArrayList<>();

      for (int i = 1; i < limit + 1; i++) {
        String newColName = "extract_" + targetColName + i;
        newColName = addColumn(targetColno + i, newColName, ColumnType.STRING);  // 중간 삽입
        extractedColNames.add(newColName);
        interestedColNames.add(newColName);
      }

      extractedColNameList.put(targetColName, extractedColNames);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not extract empty string!";

    patternStr = TeddyUtil.getPatternStr(expr, ignoreCase);
    quoteStr = TeddyUtil.getQuoteStr(quote);
    patternStr = TeddyUtil.modifyPatternStrWithQuote(patternStr, quoteStr);
    pattern = Pattern.compile(patternStr);

    preparedArgs.add(targetColNames);
    preparedArgs.add(pattern);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    preparedArgs.add(extractedColNameList);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    String originalQuoteStr = (String) preparedArgs.get(2);
    int extractLimit = (int) preparedArgs.get(3);
    Map<String, List<String>> extractedColNameList = (Map<String, List<String>>) preparedArgs.get(4);
    int colno;

    LOGGER.trace("DfExtract.gather(): start: offset={} length={} targetColno={}", offset, length, targetColNames);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      for (colno = 0; colno < prevDf.colCnt; colno++) {
        if (targetColNames.contains(prevDf.getColName(colno))) {
          String coldata = (String) row.get(colno);
          if (coldata == null) {
            continue;
          }

          List<String> tokens = TeddyUtil.match(coldata, pattern, originalQuoteStr, extractLimit);

          // The original columns is saved.
          newRow.add(prevDf.getColName(colno), row.get(colno));

          // Add new columns.
          int i = 0;
          for (/* NOP */; i < tokens.size(); i++) {
            newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), tokens.get(i));
          }
          for (/* NOP */; i < extractLimit; i++) {
            newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), null);
          }
        } else {
          // Leave irrelevant columns as they were
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
      }

      rows.add(newRow);
    }

    LOGGER.trace("DfExtract.gather(): end: offset={} length={} targetColno={}", offset, length, targetColNames);
    return rows;
  }
}

