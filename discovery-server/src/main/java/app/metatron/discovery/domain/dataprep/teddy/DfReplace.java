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
import app.metatron.discovery.prep.parser.preparation.rule.expr.*;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DfReplace extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfReplace.class);

  public DfReplace(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  private void putReplacedConditions(String targetColName, String ruleString, Map<String, Expr> rowConditionExprs) throws TeddyException {
    Rule rule = new RuleVisitorParser().parse(ruleString);
    Expression conditionExpr = ((Replace) rule).getRow();
    replace$col(conditionExpr, targetColName);
    rowConditionExprs.put(targetColName, (Expr) conditionExpr);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Replace replace = (Replace) rule;

    List<String> targetColNames = new ArrayList<>();
    Map<String, Expr> replacedConditionExprs = new HashMap<>();
    Expression targetColExpr = replace.getCol();
    Expression expr = replace.getOn();
    Expression withExpr = replace.getWith();
    Expression quote = replace.getQuote();
    Boolean globalReplace = replace.getGlobal();
    Boolean isCaseIgnore = replace.getIgnoreCase();
    String patternStr;
    String quoteStr = null;
    String regExQuoteStr=null;
    Pattern pattern;

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("DfReplace.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    for (String targetColName : targetColNames) {
      //Type Check
      if (prevDf.getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException(String.format("DfReplace.prepare(): works only on STRING: targetColName=%s type=%s",
                                                           targetColName, prevDf.getColTypeByColName(targetColName)));
      }
      //Highlighted Column List
      interestedColNames.add(targetColName);

      //Build Condition Expression
      putReplacedConditions(targetColName, ruleString, replacedConditionExprs);
    }

    addColumnWithDfAll(prevDf);

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not replace empty string!";

    //quote 문자가 없을 경우의 처리.

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

    } else { //quote 문자가 있을 경우의 처리(정규식으로 quote를 처리해야 해서 Pattern.compile 사용 불가)
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

      patternStr = compilePatternWithQuote(patternStr, regExQuoteStr);
      pattern = Pattern.compile(patternStr);
    }

    preparedArgs.add(targetColNames);
    preparedArgs.add(pattern);
    preparedArgs.add(withExpr);
    preparedArgs.add(globalReplace);
    preparedArgs.add(regExQuoteStr);
    preparedArgs.add(quoteStr);
    preparedArgs.add(replacedConditionExprs);

    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();

    List<String> targetColNames = (List<String>) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    Expression withExpr = (Expression) preparedArgs.get(2);
    Boolean globalReplace = (Boolean) preparedArgs.get(3);
    String quoteStr = (String) preparedArgs.get(4);
    String originalQuoteStr = (String) preparedArgs.get(5);
    Map<String, Expr> replacedConditionExprs = (Map<String, Expr>) preparedArgs.get(6);

    LOGGER.trace("DfReplace.gather(): start: offset={} length={}", offset, length);

    if(quoteStr == null) {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();
        for (int colno = 0; colno < getColCnt(); colno++) {
          String columnName = getColName(colno);
          if (targetColNames.contains(columnName) && row.get(colno)!=null && checkCondition(replacedConditionExprs.get(columnName), row)) {
            String targetStr = (String) row.get(colno);
            Matcher matcher = pattern.matcher(targetStr);
            if (matcher.find()) {
              if (globalReplace) {
                newRow.add(columnName, matcher.replaceAll(((Expr) withExpr).eval(row).stringValue()));
              } else {
                newRow.add(columnName, matcher.replaceFirst(((Expr) withExpr).eval(row).stringValue()));
              }
            } else {
              newRow.add(columnName, row.get(colno));
            }
          } else {
            newRow.add(columnName, row.get(colno));
          }
        }
        rows.add(newRow);
      }
    } else { //quote 문자가 있을 경우의 처리(정규식으로 quote를 처리해야 해서 Pattern.compile 사용 불가)
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();
        for (int colno = 0; colno < getColCnt(); colno++) {
          String columnName = getColName(colno);
          if (targetColNames.contains(columnName) && row.get(colno)!=null && checkCondition(replacedConditionExprs.get(columnName), row)) {
            String targetStr = (String) row.get(colno);
            if (StringUtils.countMatches(targetStr, originalQuoteStr) % 2 == 0) {
              Matcher matcher = pattern.matcher(targetStr);
              if (matcher.find()) {
                if (globalReplace) {
                  newRow.add(columnName, matcher.replaceAll(((Expr) withExpr).eval(row).stringValue()));
                } else {
                  newRow.set(columnName, matcher.replaceFirst(((Expr) withExpr).eval(row).stringValue()));
                }
              } else {
                newRow.add(columnName, row.get(colno));
              }
            } else {//quote가 홀수개일 때는 마지막 quote 이후의 문자열은 처리 하지 않는다.
              String targetStr2 = targetStr.substring(targetStr.lastIndexOf(originalQuoteStr));
              targetStr = targetStr.substring(0, targetStr.lastIndexOf(originalQuoteStr));

              Matcher matcher = pattern.matcher(targetStr);
              if (matcher.find()) {
                if (globalReplace) {
                  newRow.add(columnName, matcher.replaceAll(((Expr) withExpr).eval(row).stringValue()) + targetStr2);
                } else {
                  newRow.add(columnName, matcher.replaceFirst(((Expr) withExpr).eval(row).stringValue()) + targetStr2);
                }
              }
              else {
                newRow.add(columnName, row.get(colno));
              }
            }
          } else {
            newRow.add(columnName, row.get(colno));
          }
        }

        rows.add(newRow);
      }
    }

    LOGGER.trace("DfReplace.gather(): done: offset={} length={}", offset, length);
    return rows;
  }
}

