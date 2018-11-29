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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Split;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;
import org.apache.commons.lang.StringUtils;
import org.opensaml.xml.signature.P;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    String quoteStr=null;
    String regExQuoteStr=null;
    int targetColno = -1;
    int colno;

    if (limit==null) {
      limit = 0;
    }

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("DfSplit.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    for (String targetColName : targetColNames) {
      //Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(String.format("DfSplit.prepare(): works only on STRING: targetColName=%s type=%s",
                targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      //Highlighted Column List
      interestedColNames.add(targetColName);
    }

    int colIndex = 0;
    for(targetColno = 0; targetColno < prevDf.colCnt; targetColno++) {
      String targetColName = prevDf.getColName(targetColno);

      if(targetColNames.contains(targetColName)) {
        List<String> splitedColNames = new ArrayList<>();

        for (int i = 1; i <= limit + 1; i++) {
          String newColName = "split_" + targetColName + i;
          newColName = addColumn(colIndex++, newColName, ColumnType.STRING);  // 중간 삽입
          splitedColNames.add(newColName);
          interestedColNames.add(newColName);
        }

        splitedColNameList.put(targetColName, splitedColNames);
      } else {
        addColumn(colIndex++, targetColName, prevDf.getColDesc(targetColno));
      }
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not split with empty string!";

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

    preparedArgs.add(targetColNames);
    preparedArgs.add(patternStr);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    preparedArgs.add(splitedColNameList);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    String patternStr = (String) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    String originalQuoteStr = (String) preparedArgs.get(3);
    int splitLimit = (int) preparedArgs.get(4);
    Map<String, List<String>> splitedColNameList = (Map<String, List<String>>) preparedArgs.get(5);
    int colno;

    LOGGER.trace("DfSplit.gather(): start: offset={} length={} targetColno={}", offset, length, targetColNames);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      for(colno=0; colno < prevDf.colCnt; colno++) {
        if(targetColNames.contains(prevDf.getColName(colno))) {
          String targetStr = (String)row.get(colno);
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
            newRow.add(splitedColNameList.get(prevDf.getColName(colno)).get(i), tokens[i]);
          }

        } else {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfSplit.gather(): end: offset={} length={} targetColno={}", offset, length, targetColNames);
    return rows;
  }
}

