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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Keep;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfKeep extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfKeep.class);

  public DfKeep(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Keep keep = (Keep) rule;

    Expression condExpr = keep.getRow();

    addColumnWithDfAll(prevDf);

    preparedArgs.add(condExpr);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    Expression condExpr = (Expression) preparedArgs.get(0);

    LOGGER.trace("DfKeep.gather(): start: offset={} length={} condExpr={}", offset, length, condExpr);

    List<Row> rows = filter(prevDf, condExpr, true, offset, length);

    LOGGER.trace("DfKeep.gather(): done: offset={} length={} condExpr={}", offset, length, condExpr);
    return rows;
  }
}

