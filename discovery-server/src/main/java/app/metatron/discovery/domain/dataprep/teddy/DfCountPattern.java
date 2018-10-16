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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.CountPattern;
import app.metatron.discovery.prep.parser.preparation.rule.Replace;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.*;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    Boolean isCaseIgnore = countPattern.getIgnoreCase();
    String patternStr;
    String quoteStr = null;
    String regExQuoteStr = null;
    Pattern pattern;

    List<String> targetColNames = new ArrayList<>();
    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("DfCountPattern(): wrong target column expression: " + targetColExpr.toString());
    }

    String newColName = "countpattern";
    for (String targetColName : targetColNames) {
      targetColnos.add(prevDf.getColnoByColName(targetColName));
      newColName += "_" + targetColName;
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("doCountPattern(): no target column designated: " + targetColExpr.toString());
    }

    addColumnWithDfAll(prevDf);

    newColName = addColumn(targetColnos.get(targetColnos.size() - 1) + 1, newColName, ColumnType.LONG);  // 마지막 대상 컬럼 뒤로 삽입
    newColNames.add(newColName);
    interestedColNames.add(newColName);

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not count empty string!";

    //quote 여부에 다른 처리

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
        throw new IllegalPatternTypeException("DfCountPattern.prepare(): illegal pattern type: " + expr.toString());
      }

    } else { //quote 문자가 있을 경우의 처리(정규식으로 quote를 처리해야 해서 Pattern.compile 사용 불가)

      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();
        patternStr = disableRegexSymbols(patternStr);

        if (isCaseIgnore != null && isCaseIgnore)
          patternStr = makeCaseInsensitive(patternStr);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("DfCountPattern.prepare(): illegal pattern type: " + expr.toString());
      }

      if (quote instanceof Constant.StringExpr) {
        quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
        regExQuoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        regExQuoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("DfCountPattern.prepare(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);
    }

    preparedArgs.add(targetColnos);
    preparedArgs.add(pattern);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(newColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<Integer> targetColnos = (List<Integer>) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    String originalQuoteStr = (String) preparedArgs.get(3);
    String newColName = (String) preparedArgs.get(4);

    LOGGER.trace("DfCountPattern.gather(): start: offset={} length={} pattern={} quoteStr={}",
                 offset, length, pattern, quoteStr);

    int lastTargetColno = targetColnos.get(targetColnos.size() - 1);

    if(quoteStr == null) {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();
        long count = 0;   // 각 행마다 count

        // 마지막 대상 컬럼까지만 추가
        for (int colno = 0; colno <= lastTargetColno; colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        // 새 컬럼 추가
        for (int targetColno : targetColnos) {
          Matcher matcher = pattern.matcher(row.get(targetColno).toString());
          while (matcher.find()) {
            count++;
          }
        }
        newRow.add(newColName, count);

        // 나머지 추가
        for (int colno = lastTargetColno + 1; colno < prevDf.getColCnt(); colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
        rows.add(newRow);
      }
    } else { //quote 문자가 있을 경우의 처리(정규식으로 quote를 처리해야 해서 Pattern.compile 사용 불가)
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();
        long count = 0;   // 각 행마다 count

        // 마지막 대상 컬럼까지만 추가
        for (int colno = 0; colno <= lastTargetColno; colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        // 새 컬럼 추가
        for (int targetColno : targetColnos) {
          String targetStr = row.get(targetColno).toString();

          if (StringUtils.countMatches(targetStr, originalQuoteStr) % 2 != 0) {
            targetStr = targetStr.substring(0, targetStr.lastIndexOf(originalQuoteStr));
          }

          Matcher matcher = pattern.matcher(targetStr);
          while (matcher.find()) {
            count++;
          }
        }
        newRow.add(newColName, count);

        // 나머지 추가
        for (int colno = lastTargetColno + 1; colno < prevDf.getColCnt(); colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
        rows.add(newRow);
      }
    }

    LOGGER.trace("DfCountPattern.gather(): end: offset={} length={} pattern={} quoteStr={}",
                 offset, length, pattern, quoteStr);
    return rows;
  }
}

