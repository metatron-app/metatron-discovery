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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidIndexTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnArrayOrMapException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Unnest;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.StringExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfUnnest extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfUnnest.class);

  public DfUnnest(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Unnest unnest = (Unnest) rule;

    String targetColName = unnest.getCol();
    Expression idx = unnest.getIdx();

    if (!(idx instanceof Constant.StringExpr)) {
      throw new InvalidIndexTypeException("doUnnest(): invalid index type: " + idx.toString());
    }

    String targetKey = null;
    Integer targetIdx = null;

    int targetColno = prevDf.getColnoByColName(targetColName);
    ColumnType prevType = prevDf.getColType(targetColno);

    String idxEscaped = ((StringExpr) idx).getEscapedValue();
    String newColName = modifyDuplicatedColName(prevDf.getColName(targetColno) + "_" + idxEscaped);

    switch (prevType) {
      case MAP:
        targetKey = idxEscaped;
        break;
      case ARRAY:
        targetIdx = Integer.valueOf(idxEscaped);
        break;
      default:
        throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
    }

    addColumnWithDfAll(prevDf);
    addColumn(targetColno + 1, newColName, ColumnType.STRING);   // Converted into a proper type later (auto-typing)

    newColNames.add(newColName);
    interestedColNames.add(newColName);

    preparedArgs.add(targetColno);
    preparedArgs.add(prevType);
    preparedArgs.add(targetKey);
    preparedArgs.add(targetIdx);
    preparedArgs.add(newColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    ColumnType prevType = (ColumnType) preparedArgs.get(1);
    String targetKey = (String) preparedArgs.get(2);
    Integer targetIdx = (Integer) preparedArgs.get(3);
    String newColName = (String) preparedArgs.get(4);

    LOGGER.debug("DfUnnest.gather(): start: offset={} length={} newColName={}", offset, length, newColName);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // Add columns before the new one.
      for (int colno = 0; colno <= targetColno; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      String jsonStr = (String) row.get(targetColno);

      // Add the new column.
      try {
        switch (prevType) {
          case MAP:
            Map<String, Object> map = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, Map.class);
            Object obj = map.get(targetKey);
            newRow.add(newColName, obj);
            break;
          case ARRAY:
            List<Object> list = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, List.class);
            obj = targetIdx < list.size() ? list.get(targetIdx) : null;
            newRow.add(newColName, obj);
        }
      } catch (IOException e) {
        LOGGER.warn("DfUnnest.gather(): cannot deserialize array/map type value", e);
        throw new InvalidJsonException(e.getMessage());
      }

      // Add the rest.
      for (int colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.debug("DfUnnest.gather(): end: offset={} length={} newColName={}", offset, length, newColName);
    return rows;
  }
}
