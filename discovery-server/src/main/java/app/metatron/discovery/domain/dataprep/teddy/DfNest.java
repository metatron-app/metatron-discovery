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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Nest;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfNest extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfNest.class);

  public DfNest(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Nest nest = (Nest) rule;

    Expression targetExpr = nest.getCol();
    List<String> targetColNames = new ArrayList<>();
    String into = nest.getInto();
    String newColName = nest.getAs().replaceAll("'", "");

    if (targetExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetExpr).getValue());
    } else if (targetExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetExpr).getValue());
    } else {
      assert false : targetExpr;
    }

    // The new column is located the last related column.
    int newColPos = 0;
    for (String colName : targetColNames) {
      newColPos = prevDf.getColnoByColName(colName) > newColPos ? prevDf.getColnoByColName(colName) : newColPos;
    }
    newColPos++;

    addColumnWithDfAll(prevDf);

    ColumnType newColType = into.equalsIgnoreCase("ARRAY") ? ColumnType.ARRAY : ColumnType.MAP;
    ColumnDescription newColDesc = new ColumnDescription(newColType, null);

    newColName = addColumn(newColPos, newColName, newColDesc);  // Add into middle (Afterwards move right)
    interestedColNames.add(newColName);

    preparedArgs.add(newColPos);
    preparedArgs.add(targetColNames);
    preparedArgs.add(newColName);
    preparedArgs.add(newColType);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int newColPos = (int) preparedArgs.get(0);
    List<String> targetColNames = (List<String>) preparedArgs.get(1);
    String newColName = (String) preparedArgs.get(2);
    ColumnType newColType = (ColumnType) preparedArgs.get(3);
    int colno;

    LOGGER.trace("DfNest.gather(): start: offset={} length={} newColName={} newColType={}", offset, length, newColName,
            newColType);

    try {
      for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
        Row row = prevDf.rows.get(rowno);
        Row newRow = new Row();

        // Add until the last target column
        for (colno = 0; colno < newColPos; colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        // Add the new generated column
        if (newColType == ColumnType.ARRAY) {
          List<Object> arr = new ArrayList();
          for (String colName : targetColNames) {
            arr.add(row.get(colName));
          }
          String str = GlobalObjectMapper.getDefaultMapper().writeValueAsString(arr);
          newRow.add(newColName, str);
        } else {
          Map<String, Object> map = new TreeMap();
          for (String colName : targetColNames) {
            map.put(colName, row.get(colName));
          }
          String str = GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
          newRow.add(newColName, str);
        }

        // Add the rest columns
        for (colno = newColPos; colno < prevDf.getColCnt(); colno++) {
          newRow.add(prevDf.getColName(colno), row.get(colno));
        }

        rows.add(newRow);
      }
    } catch (JsonProcessingException e) {
      LOGGER.error("DfNest.gather():", e);
      throw new CannotSerializeIntoJsonException(e.getMessage());
    }

    LOGGER.debug("DfNest.gather(): end: offset={} length={} newColName={} newColType={}", offset, length, newColName,
            newColType);
    return rows;
  }
}

