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
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.RegularExpr;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.LocalDateTime;

public class TeddyUtil {

  static void showSep(List<Integer> widths) {
    System.out.print("+");
    for (int width : widths) {
      for (int i = 0; i < width; i++) {
        System.out.print("-");
      }
      System.out.print("+");
    }
    System.out.println("");
  }

  static void showColNames(List<Integer> widths, List<String> colNames) {
    assert widths.size() == colNames.size() :
            String.format("widths.size()=%d colNames.size()=%d", widths.size(), colNames);

    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format("%" + widths.get(i) + "s", colNames.get(i)));
      System.out.print("|");
    }
    System.out.println("");
  }

  static void showColTypes(List<Integer> widths, List<ColumnDescription> colDescs) {
    assert widths.size() == colDescs.size() :
            String.format("widths.size()=%d colDescs.size()=%d", widths.size(), colDescs);

    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format("%" + widths.get(i) + "s", colDescs.get(i).getType()));
      System.out.print("|");
    }
    System.out.println("");
  }

  static void showRow(List<Integer> widths, Row row) {
    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format(
              "%" + widths.get(i) + "s", row.get(i) == null ? "null" : row.get(i).toString()));
      System.out.print("|");
    }
    System.out.println("");
  }

  public static LocalDateTime sqlTimestampToJodaLocalDateTime(Timestamp timestamp) {
    return LocalDateTime.fromDateFields(timestamp);
  }

  public static DateTime sqlTimestampToJodaDateTime(Timestamp timestamp) {
    return sqlTimestampToJodaLocalDateTime(timestamp).toDateTime();
  }

  private static String disableRegexSymbols(String str) {
    String regExSymbols = "[\\<\\(\\[\\{\\\\\\^\\-\\=\\$\\!\\|\\]\\}\\)\\?\\*\\+\\.\\>]";
    return str.replaceAll(regExSymbols, "\\\\$0");
  }

  private static String makeCaseInsensitive(String str) {
    String ignorePatternStr = "";
    for (int i = 0; i < str.length(); i++) {
      String c = String.valueOf(str.charAt(i));

      if (c.matches("[a-zA-Z]")) {
        ignorePatternStr += "[" + c.toUpperCase() + c.toLowerCase() + "]";
      } else {
        ignorePatternStr += c;
      }
    }
    return ignorePatternStr;
  }

  public static String getQuoteStr(Expression quoteExpr) throws IllegalPatternTypeException {
    if (quoteExpr == null) {
      return "";
    }

    if (!(quoteExpr instanceof Constant.StringExpr)) {
      throw new IllegalPatternTypeException("illegal pattern type: " + quoteExpr);
    }

    return ((Constant.StringExpr) quoteExpr).getEscapedValue();
  }

  public static String modifyPatternStrWithQuote(String pattern, String quote) {
    if (quote.isEmpty()) {
      return pattern;
    }
    return String.format("%s(?=([^%s]*%s[^%s]*%s)*[^%s]*$)", pattern, quote, quote, quote, quote, quote);
  }

  public static String getPatternStr(Expression expr, Boolean ignoreCase) throws IllegalPatternTypeException {
    String patternStr;

    if (expr instanceof Constant.StringExpr) {
      patternStr = ((Constant.StringExpr) expr).getEscapedValue();
      patternStr = disableRegexSymbols(patternStr);

      if (ignoreCase != null && ignoreCase) {
        patternStr = makeCaseInsensitive(patternStr);
      }
    } else if (expr instanceof RegularExpr) {
      patternStr = ((RegularExpr) expr).getEscapedValue();
    } else {
      throw new IllegalPatternTypeException("illegal pattern type: " + expr.toString());
    }

    return patternStr;
  }

  public static String[] split(String str, String pattern, String quoteStr, int limit) {
    assert str != null;

    if (StringUtils.countMatches(str, quoteStr) % 2 == 1) {
      str = str.substring(0, str.lastIndexOf(quoteStr));
    }

    return str.split(pattern, limit);
  }

  public static List<String> match(String str, Pattern pattern, String quoteStr, int limit) {
    assert str != null;

    if (StringUtils.countMatches(str, quoteStr) % 2 == 1) {
      str = str.substring(0, str.lastIndexOf(quoteStr));
    }

    List<String> tokens = new ArrayList();
    Matcher m = pattern.matcher(str);
    while (m.find()) {
      tokens.add(m.group());
      if (tokens.size() >= limit) {
        break;
      }
    }

    return tokens;
  }

  public static String replace(String str, String pattern, String replacement, String quoteStr, Boolean global) {
    assert str != null;
    String replaceTarget;
    String restStr;

    if (StringUtils.countMatches(str, quoteStr) % 2 == 1) {
      replaceTarget = str.substring(0, str.lastIndexOf(quoteStr));
      restStr = str.substring(str.lastIndexOf(quoteStr));
    } else {
      replaceTarget = str;
      restStr = "";
    }

    if (global == null || global) {
      replaceTarget = replaceTarget.replaceAll(pattern, replacement);
    } else {
      replaceTarget = replaceTarget.replaceFirst(pattern, replacement);
    }

    return replaceTarget + restStr;
  }
}
