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
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    // group by expression -> group by colnames (group by can be null)
    if (groupByColExpr != null) {
      groupByColNames = TeddyUtil.getIdentifierList(groupByColExpr);
      if (groupByColNames.isEmpty()) {
        throw new InvalidColumnExpressionTypeException(
                "DfAggregate.prepare(): invalid group by column expression type: " + groupByColExpr.toString());
      }
    }

    // aggregation value expression is not string literals any more.
    targetExprs = TeddyUtil.getFuncExprList(aggrValueExpr);
    if (targetExprs.isEmpty()) {
      throw new InvalidAggregationValueExpressionTypeException(
              "DfAggregate.prepare(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }

    preparedArgs.add(groupByColNames);
    preparedArgs.add(targetExprs);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<String> groupByColNames = (List<String>) preparedArgs.get(0);
    List<Expr.FunctionExpr> targetExprs = (List<Expr.FunctionExpr>) preparedArgs.get(1);

    LOGGER.trace("DfAggregate.gather(): start: offset={} length={} groupByColNames={}", offset, length,
            groupByColNames);

    aggregate(prevDf, groupByColNames, targetExprs);

    LOGGER.trace("DfAggregate.gather(): end: offset={} length={} groupByColNames={}", offset, length, groupByColNames);
    return null;
  }
}

