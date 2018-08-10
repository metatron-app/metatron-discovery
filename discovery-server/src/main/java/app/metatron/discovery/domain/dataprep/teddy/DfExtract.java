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

import app.metatron.discovery.prep.parser.preparation.rule.Extract;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalPatternTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoLimitException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;

public class DfExtract extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfExtract.class);

  public DfExtract(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Extract extract = (Extract) rule;

    String targetColName = extract.getCol();
    int targetColno;
    Expression expr = extract.getOn();
    Expression quote = extract.getQuote();
    Boolean isCaseIgnore = extract.getIgnoreCase();
    String patternStr;
    String quoteStr = null;
    Pattern pattern;

    int limit = extract.getLimit();
    if (limit <= 0) {
      throw new NoLimitException("doExtract(): limit should be >= 0: " + limit);
    }

    targetColno = prevDf.getColnoByColName(targetColName);
    if (prevDf.getColType(targetColno) != ColumnType.STRING) {
      throw new WorksOnlyOnStringException("doExtract(): works only on STRING: " + prevDf.getColType(targetColno));
    }

    addColumnWithDfAll(prevDf);

    for (int i = 1; i <= limit; i++) {
      String newColName = addColumn(targetColno + i, "extract_" + targetColName + i, ColumnType.STRING);  // 중간 삽입
      newColNames.add(newColName);  // for newRow add
      interestedColNames.add(newColName);
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
        quoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        quoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);
    }

    preparedArgs.add(targetColno);
    preparedArgs.add(pattern);
    preparedArgs.add(quoteStr);
    preparedArgs.add(limit);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    Pattern pattern = (Pattern) preparedArgs.get(1);
    String quoteStr = (String) preparedArgs.get(2);
    int extract_limit = (int) preparedArgs.get(3);
    int colno;

    LOGGER.trace("DfExtract.gather(): start: offset={} length={} targetColno={}", offset, length, targetColno);

    if(quoteStr == null) {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();

        // 목적 컬럼까지만 추가
        for (colno = 0; colno <= targetColno; colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        String targetStr = (String) row.get(targetColno);
        Matcher matcher = pattern.matcher(targetStr);

        // 새 컬럼들 추가
        for (int i = 0; i < extract_limit; i++) {
          if (matcher.find()) {
            String newColData = targetStr.substring(matcher.start(), matcher.end());
            newRow.add(newColNames.get(i), newColData);
          } else {
            newRow.add(newColNames.get(i), "");
          }
        }

        // 나머지 추가
        for (colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
        rows.add(newRow);
      }
    } else {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();

        // 목적 컬럼까지만 추가
        for (colno = 0; colno <= targetColno; colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        // quote의 수가 홀수개 일 때 마지막 quote 이후의 문자열은 처리대상이 아님으로 날려버린다
        String targetStr = (String) row.get(targetColno);
        if (StringUtils.countMatches(targetStr, quoteStr) % 2 != 0) {
          targetStr = targetStr.substring(0, targetStr.lastIndexOf(quoteStr));
        }

        Matcher matcher = pattern.matcher(targetStr);

        // 새 컬럼들 추가
        for (int i = 0; i < limit; i++) {
          if (matcher.find()) {
            String newColData = targetStr.substring(matcher.start(), matcher.end());
            newRow.add(newColNames.get(i), newColData);
          } else {
            newRow.add(newColNames.get(i), "");
          }
        }

        // 나머지 추가
        for (colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }
        rows.add(newRow);
      }
    }

    LOGGER.trace("DfExtract.gather(): end: offset={} length={} targetColno={}", offset, length, targetColno);
    return rows;
  }
}

