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

import com.google.common.collect.Lists;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotUnnestEmptyColumnException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidIndexTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnArrayOrMapException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Unnest;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.ArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.LongExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.StringExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

import static app.metatron.discovery.domain.dataprep.teddy.ColumnType.ARRAY;
import static app.metatron.discovery.domain.dataprep.teddy.ColumnType.MAP;

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
    List<String> elemKeys = new ArrayList();
    List<Integer> elemIdxs = new ArrayList();

    int targetColno = prevDf.getColnoByColName(targetColName);
    ColumnType prevType = prevDf.getColType(targetColno);

    if (idx == null) {    // TODO: remove this case after changing UI code to send all columns instead.
      // Cannot proceed if there's no row.
      if (prevDf.rows.size() == 0) {
        throw new CannotUnnestEmptyColumnException("doUnnest(): no row");
      }

      // Cannot proceed if the first target value is null.
      Row row = prevDf.rows.get(0);
      if (row.get(targetColno) == null) {
        throw new InvalidIndexTypeException("doUnnest(): first target column is null");
      }

      // Gather target element's key/index --> elemKeys/Idxs
      String jsonStr = (String) row.get(targetColno);
      try {
        switch (prevType) {
          case MAP:
            Map<String, Object> map = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, Map.class);
            for (String key : map.keySet()) {
              elemKeys.add(key);
            }
            break;
          case ARRAY:
            List<Object> list = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, List.class);
            for (int i = 0; i < list.size(); i++) {
              elemIdxs.add(i);
            }
            break;
          default:
            throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
        }
      } catch (IOException e) {
        LOGGER.warn("DfUnnest.prepare(): cannot deserialize array/map type value", e);
        throw new InvalidJsonException(e.getMessage());
      }
    } else {
      if( prevType!=MAP && prevType!=ARRAY ) {
        throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
      }

      // everything is as string because ArrayExpr is using
      List<String> listObj = Lists.newArrayList();
      if( idx instanceof ArrayExpr ) {
        for (Object obj : ((ArrayExpr) idx).getValue()) {
          listObj.add( (new StringExpr((String)obj)).getEscapedValue() );
        }
      } else if ( idx instanceof StringExpr ) {
        listObj.add( ((StringExpr) idx).getEscapedValue() );
      } else if ( prevType == ARRAY && idx instanceof LongExpr ) {
        listObj.add( ((LongExpr) idx).getValue().toString() );
      } else {
        throw new InvalidIndexTypeException("doUnnest(): invalid index type: " + idx.toString());
      }

      for(String idxObj : listObj) {
        switch (prevType) {
          case MAP:
            elemKeys.add(idxObj);
            break;
          case ARRAY:
            elemIdxs.add(Integer.valueOf(idxObj));
            break;
          default:
            throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
        }
      }
    }

    // Set columns
    List<String> newColNames = new ArrayList();

    addColumnWithDfAll(prevDf);
    switch (prevType) {
      case MAP:
        for (int i = 0; i < elemKeys.size(); i++) {
          String elemKey = elemKeys.get(i);
          String newColName = modifyDuplicatedColName(elemKey);
          addColumn(targetColno + 1 + i, newColName, ColumnType.STRING);  // Later, will be converted into a proper type
          newColNames.add(newColName);
        }
        break;
      case ARRAY:
        for (int i = 0; i < elemIdxs.size(); i++) {
          Integer elemIdx = elemIdxs.get(i);
          String newColName = modifyDuplicatedColName(prevDf.getColName(targetColno) + "_" + elemIdx);
          addColumn(targetColno + 1 + i, newColName, ColumnType.STRING);  // Later, will be converted into a proper type
          newColNames.add(newColName);
        }
        break;
      default:
        throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
    }

    interestedColNames.addAll(newColNames);

    preparedArgs.add(targetColno);
    preparedArgs.add(prevType);
    preparedArgs.add(elemKeys);
    preparedArgs.add(elemIdxs);
    preparedArgs.add(newColNames);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int targetColno = (int) preparedArgs.get(0);
    ColumnType prevType = (ColumnType) preparedArgs.get(1);
    List<String> elemKeys = (List<String>) preparedArgs.get(2);
    List<Integer> elemIdxs = (List<Integer>) preparedArgs.get(3);
    List<String> newColNames = (List<String>) preparedArgs.get(4);

    LOGGER.debug("DfUnnest.gather(): start: offset={} length={} newColName={}", offset, length, newColNames);

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
            assert elemKeys.size() == newColNames.size();
            Map<String, Object> map = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, Map.class);
            for (int i = 0; i < elemKeys.size(); i++) {
              String key = elemKeys.get(i);
              Object obj = map.get(key);

              // When obj is String, useless quotes are generated by object mapper.
              newRow.add(newColNames.get(i),
                      obj instanceof String ? obj : GlobalObjectMapper.getDefaultMapper().writeValueAsString(obj));
            }
            break;
          case ARRAY:
            assert elemIdxs.size() == newColNames.size();
            List<Object> list = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, List.class);
            for (int i = 0; i < elemIdxs.size(); i++) {
              Integer idx = elemIdxs.get(i);
              Object obj = idx < list.size() ? list.get(idx) : null;

              // When obj is String, useless quotes are generated by object mapper.
              newRow.add(newColNames.get(i),
                      obj instanceof String ? obj : GlobalObjectMapper.getDefaultMapper().writeValueAsString(obj));
            }
            break;
          default:
            throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + prevType);
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

    LOGGER.debug("DfUnnest.gather(): end: offset={} length={} newColName={}", offset, length, newColNames);
    return rows;
  }
}
