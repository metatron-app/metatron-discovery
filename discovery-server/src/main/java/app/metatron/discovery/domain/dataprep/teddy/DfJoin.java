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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.JoinTypeNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.LeftPredicateNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.PredicateTypeMismatchException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.RightPredicateNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Join;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
                                List<Identifier.IdentifierExpr> lPredicates,
                                List<Identifier.IdentifierExpr> rPredicates) throws TeddyException {
    int colno;

    if (expr instanceof Expr.BinAndExpr) {
      gatherPredicates(((Expr.BinAndExpr) expr).getLeft(), leftDf, rightDf, lPredicates, rPredicates);
      gatherPredicates(((Expr.BinAndExpr) expr).getRight(), leftDf, rightDf, lPredicates, rPredicates);
    }
    else if (expr instanceof Expr.BinAsExpr) {
      if (!((Expr.BinAsExpr) expr).getOp().equals("=")) {
        throw new JoinTypeNotSupportedException("join(): join type not suppoerted: op: " + ((Expr.BinAsExpr) expr).getOp());
      }

      for (colno = 0; colno < leftDf.getColCnt(); colno++) {
        if (leftDf.getColName(colno).equals(((Expr.BinAsExpr) expr).getLeft().toString())) {
          lPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getLeft());
          break;
        }
      }
      if (colno == leftDf.getColCnt()) {
        throw new LeftPredicateNotFoundException("join(): left predicate not found: " + expr.toString());
      }

      for (colno = 0; colno < rightDf.getColCnt(); colno++) {
        if (rightDf.getColName(colno).equals(((Expr.BinAsExpr) expr).getRight().toString())) {
          rPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getRight());
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

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Join join = (Join) rule;

    assert slaveDfs.size() == 1 : slaveDfs.size();
    DataFrame slaveDf = slaveDfs.get(0);

    // Get all the selected column names.
    List<String> lSelectColNames = getIdentifierList(join.getLeftSelectCol());
    List<String> rSelectColNames = getIdentifierList(join.getRightSelectCol());
    Expression cond = join.getCondition();
    String joinType = join.getJoinType();

    // Get all the predicates' identifiers for both left and right side.
    List<Identifier.IdentifierExpr> lPredicates = new ArrayList<>();
    List<Identifier.IdentifierExpr> rPredicates = new ArrayList<>();
    gatherPredicates(cond, prevDf, slaveDf, lPredicates, rPredicates);
    assert lPredicates.size() == rPredicates.size();

    // Change column names into String[]
    List<String> lPredColNames = new ArrayList<>(lPredicates.size());
    List<String> rPredColNames = new ArrayList<>(lPredicates.size());

    for (int i = 0; i < lPredicates.size(); i++) {
      lPredColNames.add(lPredicates.get(i).getValue());
      rPredColNames.add(rPredicates.get(i).getValue());
    }

    // Check predicate type mismatch
    for (int i = 0; i < lPredColNames.size(); i++) {
      ColumnType lType = prevDf.getColTypeByColName(lPredColNames.get(i));
      ColumnType rType = slaveDf.getColTypeByColName(rPredColNames.get(i));
      if (lType != rType) {
        throw new PredicateTypeMismatchException(String.format(
            "join(): predicate type mismatch: left=%s right=%s", lType.name(), rType.name()));
      }
    }

    // Add columns from left to right
    for (String colName : lSelectColNames) {
      addColumn(colName, prevDf.getColDescByColName(colName));
    }

    for (String colName : rSelectColNames) {
      String rightColName = checkRightColName(colName);   // 같은 column이름이 있을 경우 right에서 온 것에 "r_"을 붙여준다.
      addColumn(rightColName, slaveDf.getColDescByColName(colName));
      interestedColNames.add(rightColName);
    }

    // Toss parameters to sub-threads
    preparedArgs.add(slaveDf);
    preparedArgs.add(lSelectColNames);
    preparedArgs.add(rSelectColNames);
    preparedArgs.add(lPredColNames);
    preparedArgs.add(rPredColNames);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    // Restore prepared parameters
    DataFrame slaveDf = (DataFrame) preparedArgs.get(0);
    List<String> lSelectColNames = (List<String>) preparedArgs.get(1);
    List<String> rSelectColNames = (List<String>) preparedArgs.get(2);
    List<String> lPredColNames = (List<String>) preparedArgs.get(3);
    List<String> rPredColNames = (List<String>) preparedArgs.get(4);

    LOGGER.trace("DfJoin.gather(): start: offset={} length={}", offset, length);
    List<Row> rows = new ArrayList<>();

    // Simple Nest Loop Join
    for (int lrowno = offset; lrowno < offset + length; cancelCheck(++lrowno)) {
      Row lrow = prevDf.rows.get(lrowno);

      for (int rrowno = 0; rrowno < slaveDf.rows.size(); rrowno++) {
        Row rrow = slaveDf.rows.get(rrowno);
        boolean matched = true;

        for (int predno = 0; predno < lPredColNames.size(); predno++) {
          Object lObj = lrow.get(lPredColNames.get(predno));
          if (lObj == null) {
            matched = false;
            break;
          }

          if (lObj.equals(rrow.get(rPredColNames.get(predno))) == false) {
            matched = false;
            break;
          }
        }

        if (matched) {
          Row newRow = new Row();
          for (String colName : lSelectColNames) {
            newRow.add(colName,
                lrow.get(colName));                           // left에서 온 컬럼은 이름 그대로 넣음
          }

          for (String colName : rSelectColNames) {
            newRow.add(getColName(newRow.colCnt),
                rrow.get(colName));  // 필요한 경우 "r_"이 붙은 컬럼 이름 (여기까지 온 것은 이미 붙은 상황)
          }

          rows.add(newRow);
        }
      }
    }

    LOGGER.trace("DfSet.gather(): end: offset={} length={}", offset, length);
    return rows;
  }
}

