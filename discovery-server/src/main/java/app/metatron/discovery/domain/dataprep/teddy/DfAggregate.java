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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidAggregationValueExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidColumnExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Aggregate;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfAggregate extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfAggregate.class);

  public DfAggregate(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Aggregate aggregate = (Aggregate) rule;

    Expression groupByColExpr = aggregate.getGroup();
    Expression aggrValueExpr = aggregate.getValue();
    List<String> groupByColNames = new ArrayList<>();
    List<Expr.FunctionExpr> targetExprs;

    // group by expression -> group by colnames
    if (groupByColExpr == null) {
      /* NOP */
    } else if (groupByColExpr instanceof Identifier.IdentifierExpr) {
      groupByColNames.add(((Identifier.IdentifierExpr) groupByColExpr).getValue());
    } else if (groupByColExpr instanceof Identifier.IdentifierArrayExpr) {
      groupByColNames.addAll(((Identifier.IdentifierArrayExpr) groupByColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("DfAggregate.prepare(): invalid group by column expression type: " + groupByColExpr.toString());
    }

    // aggregation value expression is not string literals any more.
    if (aggrValueExpr instanceof Expr.FunctionExpr) {
      targetExprs = new ArrayList(1);
      targetExprs.add((Expr.FunctionExpr) aggrValueExpr);
    } else if (aggrValueExpr instanceof Expr.FunctionArrayExpr) {
      targetExprs = ((Expr.FunctionArrayExpr) aggrValueExpr).getFunctions();
    } else {
      throw new InvalidAggregationValueExpressionTypeException("DfAggregate.prepare(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }

    preparedArgs.add(groupByColNames);
    preparedArgs.add(targetExprs);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    List<String> groupByColNames = (List<String>) preparedArgs.get(0);
    List<Expr.FunctionExpr> targetExprs = (List<Expr.FunctionExpr>) preparedArgs.get(1);

    LOGGER.trace("DfAggregate.gather(): start: offset={} length={} groupByColNames={}", offset, length, groupByColNames);

    aggregate(prevDf, groupByColNames, targetExprs);

    LOGGER.trace("DfAggregate.gather(): end: offset={} length={} groupByColNames={}", offset, length, groupByColNames);
    return null;
  }
}

