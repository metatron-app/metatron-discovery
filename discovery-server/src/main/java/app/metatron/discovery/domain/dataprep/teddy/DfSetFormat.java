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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnTimestampException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.SetFormat;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfSetFormat extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfSetFormat.class);

  public DfSetFormat(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    SetFormat setFormat = (SetFormat) rule;

    Expression targetColExpr = setFormat.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    String timestampFormat = setFormat.getFormat();

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = prevDf.getColnoByColName(targetColName);

      if (prevDf.getColType(colno) != ColumnType.TIMESTAMP) {
        throw new WorksOnlyOnTimestampException("DfSetFormt.prepare(): This column is not timestamp type: " + targetColName);
      }
      targetColnos.add(colno);
      interestedColNames.add(targetColName);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        Integer colno = prevDf.getColnoByColName(targetColName);

        if (prevDf.getColType(colno) != ColumnType.TIMESTAMP) {
          throw new WorksOnlyOnTimestampException("DfSetFormt.prepare(): This column is not timestamp type: " + targetColName);
        }
        targetColnos.add(colno);
        interestedColNames.add(targetColName);
      }
    } else {
      throw new WrongTargetColumnExpressionException("DfSetFormt.prepare(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("DfSetFormt.prepare(): no target column designated: " + targetColExpr.toString());
    }

    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {
        addColumnWithTimestampStyle(prevDf.getColName(colno), prevDf.getColType(colno), timestampFormat);
      } else {
        addColumn(prevDf.getColName(colno), prevDf.getColDesc(colno));
      }
    }

    rows = prevDf.rows;

    return null;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    // rows are not changed in setformat
    return null;
  }
}

