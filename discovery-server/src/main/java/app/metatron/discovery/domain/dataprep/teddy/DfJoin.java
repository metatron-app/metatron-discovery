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
import app.metatron.discovery.prep.parser.preparation.rule.Join;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfJoin extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfJoin.class);

  public DfJoin(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  static private List<String> getIdentifierList(Expression expr) {
    List<String> colNames = new ArrayList<>();
    if (expr instanceof Identifier.IdentifierExpr) {
      colNames.add(((Identifier.IdentifierExpr) expr).getValue());
    } else if (expr instanceof Identifier.IdentifierArrayExpr) {
      colNames.addAll(((Identifier.IdentifierArrayExpr) expr).getValue());
    } else {
      assert false : expr;
    }
    return colNames;
  }

  private void gatherPredicates(Expression expr, DataFrame leftDf, DataFrame rightDf,
                                List<Identifier.IdentifierExpr> leftPredicates,
                                List<Identifier.IdentifierExpr> rightPredicates) throws TeddyException {
    int colno;

    if (expr instanceof Expr.BinAndExpr) {
      gatherPredicates(((Expr.BinAndExpr) expr).getLeft(), leftDf, rightDf, leftPredicates, rightPredicates);
      gatherPredicates(((Expr.BinAndExpr) expr).getRight(), leftDf, rightDf, leftPredicates, rightPredicates);
    }
    else if (expr instanceof Expr.BinAsExpr) {
      if (!((Expr.BinAsExpr) expr).getOp().equals("=")) {
        throw new JoinTypeNotSupportedException("join(): join type not suppoerted: op: " + ((Expr.BinAsExpr) expr).getOp());
      }

      for (colno = 0; colno < leftDf.getColCnt(); colno++) {
        if (leftDf.getColName(colno).equals(((Expr.BinAsExpr) expr).getLeft().toString())) {
          leftPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getLeft());
          break;
        }
      }
      if (colno == leftDf.getColCnt()) {
        throw new LeftPredicateNotFoundException("join(): left predicate not found: " + expr.toString());
      }

      for (colno = 0; colno < leftDf.getColCnt(); colno++) {
        if (rightDf.getColName(colno).equals(((Expr.BinAsExpr) expr).getRight().toString())) {
          rightPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getRight());
          break;
        }
      }
      if (colno == leftDf.getColCnt()) {
        throw new RightPredicateNotFoundException("join(): right predicate not found: " + expr.toString());
      }
    }
  }

  private String checkRightColName(String rightColName) throws TeddyException {
    if (colsContains(rightColName)) {
      return checkRightColName("r_" + rightColName);
    }
    return rightColName;
  }

  private Row addJoinedRow(Row lrow, List<String> leftSelectColNames, Row rrow, List<String> rightSelectColNames) {
    Row newRow = new Row();
    for (String colName : leftSelectColNames) {
      newRow.add(colName, lrow.get(colName));                           // left에서 온 컬럼은 이름 그대로 넣음
    }
    for (String colName : rightSelectColNames) {
      newRow.add(this.getColName(newRow.colCnt), rrow.get(colName));  // 필요한 경우 "r_"이 붙은 컬럼 이름 (여기까지 온 것은 이미 붙은 상황)
    }
    return newRow;
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Join join = (Join) rule;

    List<String> leftSelectColNames = getIdentifierList(join.getLeftSelectCol());
    List<String> rightSelectColNames = getIdentifierList(join.getRightSelectCol());
    Expression condition = join.getCondition();
    String joinType = join.getJoinType();
    DataFrame rightDf = slaveDfs.get(0);


    List<Identifier.IdentifierExpr> leftPredicates = new ArrayList<>();
    List<Identifier.IdentifierExpr> rightPredicates = new ArrayList<>();
    gatherPredicates(condition, prevDf, rightDf, leftPredicates, rightPredicates);

    List<Expr.BinEqExpr> eqExprs = new ArrayList<>();
    for (int i = 0; i < leftPredicates.size(); i++) {
      eqExprs.add(new Expr.BinEqExpr("=", leftPredicates.get(i), rightPredicates.get(i)));
    }

    for (String colName : leftSelectColNames) {
      this.addColumn(colName, prevDf.getColDescByColName(colName));
    }
    for (String colName : rightSelectColNames) {
      String rightColName = this.checkRightColName(colName);   // 같은 column이름이 있을 경우 right에서 온 것에 "r_"을 붙여준다.
      this.addColumn(rightColName, rightDf.getColDescByColName(colName));
      this.interestedColNames.add(rightColName);
    }

    List<Object[]> lobjsList = new ArrayList<>();
    List<Object[]> robjsList = new ArrayList<>();

    for (int i = 0; i < leftPredicates.size(); i++) {
      lobjsList.add(new Object[prevDf.rows.size()]);
      robjsList.add(new Object[rightDf.rows.size()]);
    }

    Row lrow = null;
    Row rrow = null;
    lrow = prevDf.rows.get(0);

    for (int rrowno = 0; rrowno < rightDf.rows.size(); rrowno++) {
      rrow = rightDf.rows.get(rrowno);
      for (int i = 0; i < leftPredicates.size(); i++) {
        (robjsList.get(i))[rrowno] = rightPredicates.get(i).eval(rrow).value();
      }
    }

    // 각 predicate column 별로 1줄만 type check
    for (int i = 0; i < leftPredicates.size(); i++) {
      if (lrow == null || rrow == null || leftPredicates.get(i).eval(lrow).type() != rightPredicates.get(i).eval(rrow).type()) {
        throw new PredicateTypeMismatchException(String.format("join(): predicate type mismatch: left=%s right=%s", lrow == null ? "null" : leftPredicates.get(i).eval(lrow).type().name(), rrow == null ? "null" : rightPredicates.get(i).eval(rrow).type().name()));

      }
    }

    preparedArgs.add(leftPredicates);
    preparedArgs.add(lobjsList);
    preparedArgs.add(robjsList);
    preparedArgs.add(rightDf);
    preparedArgs.add(leftSelectColNames);
    preparedArgs.add(rightSelectColNames);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    Row lrow = null;
    Row rrow = null;

    List<Identifier.IdentifierExpr> leftPredicates = (List<Identifier.IdentifierExpr>) preparedArgs.get(0);
    List<Object[]> lobjsList = (List<Object[]>) preparedArgs.get(1);
    List<Object[]> robjsList = (List<Object[]>) preparedArgs.get(2);
    DataFrame rightDf = (DataFrame) preparedArgs.get(3);
    List<String> leftSelectColNames = (List<String>) preparedArgs.get(4);
    List<String> rightSelectColNames = (List<String>) preparedArgs.get(5);


    LOGGER.trace("DfJoin.gather(): start: offset={} length={}", offset, length);

    for (int lrowno = offset; lrowno < offset + length; cancelCheck(++lrowno)) {
      lrow = prevDf.rows.get(lrowno);
      for (int i = 0; i < leftPredicates.size(); i++) {
        (lobjsList.get(i))[lrowno] = leftPredicates.get(i).eval(lrow).value();
      }
    }

    for (int lrowno = offset; lrowno < offset + length; cancelCheck(++lrowno)) {
      for (int rrowno = 0; rrowno < rightDf.rows.size(); rrowno++) {
        boolean equal = true;
        for (int i = 0; i < lobjsList.size(); i++) {
          if (!(lobjsList.get(i))[lrowno].equals((robjsList.get(i))[rrowno])) {
            equal = false;
            break;
          }
        }
        if (equal) {
          lrow = prevDf.rows.get(lrowno);
          rrow = rightDf.rows.get(rrowno);
          rows.add(addJoinedRow(lrow, leftSelectColNames, rrow, rightSelectColNames));

          if (rows.size() == limit) {
            return rows;
          }
        }
      }
    }

    LOGGER.trace("DfSet.gather(): end: offset={} length={}", offset, length);
    return rows;
  }
}

