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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalPatternTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Split;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfSplit extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfSplit.class);

  public DfSplit(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Split split = (Split) rule;

    String targetColName = split.getCol();
    Expression expr = split.getOn();
    Expression quote = split.getQuote();
    Integer limit = split.getLimit();
    Boolean ignoreCase = split.getIgnoreCase();
    String patternStr;
    String quoteStr=null;
    String regExQuoteStr=null;
    int targetColno = -1;
    int colno;

    if (limit==null) {
      limit = 0;
    }

    for (colno = 0; colno < prevDf.getColCnt(); colno++) {
      if (prevDf.getColName(colno).equals(targetColName)) {
        if (prevDf.getColType(colno) != ColumnType.STRING) {
          throw new WorksOnlyOnStringException("doSplit(): works only on STRING: " + prevDf.getColType(colno));
        }
        targetColno = colno;
        break;
      }
    }

    if (colno == prevDf.getColCnt()) {
      throw new ColumnNotFoundException("doSplit(): column not found: " + targetColName);
    }
    addColumnWithDfAll(prevDf);

    for (int i = 1; i <= limit + 1; i++) {
      String newColName = "split_" + targetColName + i;
      newColName = addColumn(targetColno + i, newColName, ColumnType.STRING);  // 중간 삽입
      newColNames.add(newColName);
      interestedColNames.add(newColName);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not replace empty string!";

    //패턴에 대한 처리. 1. 문자열 1-1. 대소문자 무시 2.정규식
    if (expr instanceof Constant.StringExpr) {
      patternStr = ((Constant.StringExpr) expr).getEscapedValue();
      patternStr = disableRegexSymbols(patternStr);

      if(ignoreCase!=null && ignoreCase)
        patternStr = makeCaseInsensitive(patternStr);

    } else if (expr instanceof RegularExpr) {
      patternStr = ((RegularExpr) expr).getEscapedValue();
    } else {
      throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
    }

    //콰트에 대한 처리. 1. 문자열 2.정규식
    if(quote == null) {
      quoteStr ="";
    }
    else if (quote instanceof Constant.StringExpr) {
      quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
      regExQuoteStr = disableRegexSymbols(quoteStr);
    } else if (expr instanceof RegularExpr) {
      regExQuoteStr = ((RegularExpr) quote).getEscapedValue();
    } else {
      throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
    }

    if(quoteStr != "")
      patternStr = compilePatternWithQuote(patternStr, regExQuoteStr);

    preparedArgs.add(targetColno);
    preparedArgs.add(patternStr);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    String patternStr = (String) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    String originalQuoteStr = (String) preparedArgs.get(3);
    int splitLimit = (int) preparedArgs.get(4);
    int colno;

    LOGGER.trace("DfSplit.gather(): start: offset={} length={} targetColno={}", offset, length, targetColno);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // 목적 컬럼까지만 추가
      for (colno = 0; colno <= targetColno; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      String targetStr = (String)row.get(targetColno);
      String[] tokens = new String[splitLimit+1];
      int index = 0;

      if(StringUtils.countMatches(targetStr, originalQuoteStr)%2 == 0) {
        String[] tempTokens = targetStr.split(patternStr, splitLimit+1);
        if(tempTokens.length<=limit) {
          for(index=0; index<tempTokens.length; index++) {
            tokens[index] = tempTokens[index];
          }
        } else
          tokens=tempTokens;
      } else {
        int lastQuoteMark = targetStr.lastIndexOf(originalQuoteStr);

        String[] firstHalf = targetStr.substring(0, lastQuoteMark).split(patternStr, splitLimit+1);

        for(int i=0; i < firstHalf.length; i++) {
          tokens[i] = firstHalf[i];
          index = i;
        }
        tokens[index]=tokens[index]+targetStr.substring(lastQuoteMark);
      }

      // 새 컬럼들 추가
      for (int i = 0; i <= splitLimit; i++) {
        newRow.add(newColNames.get(i), tokens[i]);
      }

      // 나머지 추가
      for (colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.trace("DfSplit.gather(): end: offset={} length={} targetColno={}", offset, length, targetColno);
    return rows;
  }
}

