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

import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.ArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.StringExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.FunctionArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.FunctionExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier.IdentifierArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier.IdentifierExpr;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
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

  public static List<String> getIdentifierList(Expression expr) {
    List<String> colNames = new ArrayList<>();

    if (expr instanceof IdentifierExpr) {
      colNames.add(((IdentifierExpr) expr).getValue());
    } else if (expr instanceof IdentifierArrayExpr) {
      colNames = ((IdentifierArrayExpr) expr).getValue();
    }
    return colNames;
  }

  public static List<String> getStringList(Expression expr) {
    List<String> colNames = new ArrayList<>();

    if (expr instanceof StringExpr) {
      colNames.add(expr.toString());
    } else if (expr instanceof ArrayExpr) {
      colNames = ((ArrayExpr) expr).getValue();
    }
    return colNames;
  }

  public static List<FunctionExpr> getFuncExprList(Expression expr) {
    List<FunctionExpr> targetExprs = new ArrayList();

    if (expr instanceof FunctionExpr) {
      targetExprs.add((FunctionExpr) expr);
    } else if (expr instanceof FunctionArrayExpr) {
      targetExprs = ((FunctionArrayExpr) expr).getFunctions();
    }
    return targetExprs;
  }
}
