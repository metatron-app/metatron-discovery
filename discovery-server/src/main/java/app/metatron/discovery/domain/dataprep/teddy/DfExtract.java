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
import app.metatron.discovery.prep.parser.preparation.rule.Extract;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DfExtract extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfExtract.class);

  public DfExtract(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Extract extract = (Extract) rule;

    List<String> targetColNames = new ArrayList<>();
    Map<String, List<String>> extractedColNameList = new HashMap<>();
    Expression targetColExpr = extract.getCol();
    int targetColno;
    Expression expr = extract.getOn();
    Expression quote = extract.getQuote();
    Boolean isCaseIgnore = extract.getIgnoreCase();
    String patternStr;
    String quoteStr = null;
    String regExQuoteStr=null;
    Pattern pattern;

    int limit = extract.getLimit();
    if (limit <= 0) {
      throw new NoLimitException("doExtract(): limit should be >= 0: " + limit);
    }

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("DfExtract.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    addColumnWithDfAll(prevDf);

    for (String targetColName : targetColNames) {
      //Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(String.format("DfExtract.prepare(): works only on STRING: targetColName=%s type=%s",
                targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      //Highlighted Column List
      interestedColNames.add(targetColName);
      targetColno = getColnoByColName(targetColName);
      List<String> extractedColNames = new ArrayList<>();

      for (int i = 1; i < limit+1; i++) {
        String newColName = "extract_" + targetColName + i;
        newColName = addColumn(targetColno + i, newColName, ColumnType.STRING);  // 중간 삽입
        extractedColNames.add(newColName);
        interestedColNames.add(newColName);
      }

      extractedColNameList.put(targetColName,extractedColNames);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not extract empty string!";

    //quote가 없을 때의 처리
    if(quote == null) {
      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();

        if (isCaseIgnore != null && isCaseIgnore)
          pattern = Pattern.compile(patternStr, Pattern.LITERAL + Pattern.CASE_INSENSITIVE);
        else
          pattern = Pattern.compile(patternStr, Pattern.LITERAL);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
        pattern = Pattern.compile(patternStr);
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }
    } else {

      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();
        patternStr = disableRegexSymbols(patternStr);

        if (isCaseIgnore != null && isCaseIgnore)
          patternStr = makeCaseInsensitive(patternStr);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }

      if (quote instanceof Constant.StringExpr) {
        quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
        regExQuoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        regExQuoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);
    }

    preparedArgs.add(targetColNames);
    preparedArgs.add(pattern);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    preparedArgs.add(extractedColNameList);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    String originalQuoteStr = (String) preparedArgs.get(3);
    int extract_limit = (int) preparedArgs.get(4);
    Map<String, List<String>> extractedColNameList = (Map<String, List<String>>) preparedArgs.get(5);
    int colno;

    LOGGER.trace("DfExtract.gather(): start: offset={} length={} targetColno={}", offset, length, targetColNames);

    if(quoteStr == null) {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();

        for(colno=0; colno < prevDf.colCnt; colno++) {
          if(targetColNames.contains(prevDf.getColName(colno))) {
            newRow.add(prevDf.getColName(colno), row.get(colno));

            String targetStr = (String) row.get(colno);
            Matcher matcher = pattern.matcher(targetStr);

            // 새 컬럼들 추가
            for (int i = 0; i < extract_limit; i++) {
              if (matcher.find()) {
                String newColData = targetStr.substring(matcher.start(), matcher.end());
                newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), newColData);
              } else {
                newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), "");
              }
            }
          } else {
            newRow.add(prevDf.getColName(colno), row.get(colno));
          }
        }

        rows.add(newRow);
      }
    } else {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();

        for(colno=0; colno < prevDf.colCnt; colno++) {
          if (targetColNames.contains(prevDf.getColName(colno))) {
            newRow.add(prevDf.getColName(colno), row.get(colno));

            // quote의 수가 홀수개 일 때 마지막 quote 이후의 문자열은 처리대상이 아님으로 날려버린다
            String targetStr = (String) row.get(colno);
            if (StringUtils.countMatches(targetStr, originalQuoteStr) % 2 != 0) {
              targetStr = targetStr.substring(0, targetStr.lastIndexOf(originalQuoteStr));
            }

            Matcher matcher = pattern.matcher(targetStr);

            // 새 컬럼들 추가
            for (int i = 0; i < extract_limit; i++) {
              if (matcher.find()) {
                String newColData = targetStr.substring(matcher.start(), matcher.end());
                newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), newColData);
              } else {
                newRow.add(extractedColNameList.get(prevDf.getColName(colno)).get(i), "");
              }
            }
          } else {
            newRow.add(prevDf.getColName(colno), row.get(colno));
          }
        }

        rows.add(newRow);
      }
    }

    LOGGER.trace("DfExtract.gather(): end: offset={} length={} targetColno={}", offset, length, targetColNames);
    return rows;
  }
}

