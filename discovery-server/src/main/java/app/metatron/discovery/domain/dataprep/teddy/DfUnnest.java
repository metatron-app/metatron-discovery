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

import static app.metatron.discovery.domain.dataprep.teddy.ColumnType.ARRAY;
import static app.metatron.discovery.domain.dataprep.teddy.ColumnType.MAP;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnArrayOrMapException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Unnest;
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
    Expression idxExpr = unnest.getIdx();
    List<String> newColNames = new ArrayList();

    int targetColno = prevDf.getColnoByColName(targetColName);
    ColumnType prevType = prevDf.getColType(targetColno);

    if (prevType != MAP && prevType != ARRAY) {
      throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
    }

    addColumnWithDfAll(prevDf);

    List<String> idxs = TeddyUtil.getIdentifierList(idxExpr);

    for (int i = 0; i < idxs.size(); i++) {
      String idx = idxs.get(i);
      String newColName;
      if (prevType == MAP) {
        newColName = modifyDuplicatedColName(idx);
      } else {
        newColName = modifyDuplicatedColName(targetColName + "_" + idx);
      }
      newColNames.add(newColName);
      addColumn(targetColno + 1 + i, newColName, ColumnType.STRING);  // Later, will be converted into a proper type
    }

    interestedColNames.addAll(newColNames);

    preparedArgs.add(targetColno);
    preparedArgs.add(prevType);
    preparedArgs.add(idxs);
    preparedArgs.add(newColNames);
    return preparedArgs;
  }

  private String getElem(String jsonStr, String idx, ColumnType colType) throws InvalidJsonException {
    try {
      if (colType == MAP) {
        Map<String, Object> map = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, Map.class);
        Object obj = map.get(idx);
        return obj == null ? null : obj.toString();
      } else {
        List<Object> list = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, List.class);
        int i = Integer.valueOf(idx);
        assert i >= 0 : i;
        return i >= list.size() ? null : list.get(Integer.valueOf(idx)).toString();
      }
    } catch (IOException e) {
      LOGGER.warn("DfUnnest.gather(): cannot deserialize array/map type value", e);
      throw new InvalidJsonException(e.getMessage());
    }
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    ColumnType prevType = (ColumnType) preparedArgs.get(1);
    List<String> idxs = (List<String>) preparedArgs.get(2);
    List<String> newColNames = (List<String>) preparedArgs.get(3);

    LOGGER.debug("DfUnnest.gather(): start: offset={} length={} newColName={}", offset, length, newColNames);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // Add until the new column
      for (int colno = 0; colno <= targetColno; colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      String jsonStr = (String) row.get(targetColno);

      // Add new generated columns
      for (int i = 0; i < idxs.size(); i++) {
        String idx = idxs.get(i);
        String newColName = newColNames.get(i);
        newRow.add(newColName, getElem(jsonStr, idx, prevType));
      }

      // Add the rest.
      for (int colno = targetColno + 1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.debug("DfUnnest.gather(): end: offset={} length={} newColName={}", offset, length, newColNames);
    return rows;
  }
}
