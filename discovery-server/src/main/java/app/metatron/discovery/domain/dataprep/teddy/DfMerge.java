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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoInputColumnDesignatedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Merge;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DfMerge extends DataFrame {

  private static Logger LOGGER = LoggerFactory.getLogger(DfMerge.class);

  public DfMerge(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  private String strip(String str) {
    return str.substring(1, str.length() - 1);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Merge merge = (Merge) rule;

    Expression targetExpr = merge.getCol();
    String with = strip(merge.getWith());
    String newColName = strip(merge.getAs());

    List<String> targetColNames = TeddyUtil.getIdentifierList(targetExpr);
    if (targetColNames.isEmpty()) {
      throw new NoInputColumnDesignatedException("DfMerge.prepare(): no input column designated");
    }

    // Find where to put among the columns
    int lastColPos = 0;
    for (String colName : targetColNames) {
      lastColPos = prevDf.getColnoByColName(colName) > lastColPos ? prevDf.getColnoByColName(colName) : lastColPos;
    }

    // Merge target columns are dropped.
    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      String colName = prevDf.getColName(colno);
      if (targetColNames.contains(colName)) {
        continue;
      }
      addColumnWithDf(prevDf, colno);
    }

    // Insert the new merged column in the middle
    int newColPos = lastColPos - targetColNames.size() + 1;
    newColName = this.addColumn(newColPos, newColName, ColumnType.STRING);
    this.interestedColNames.add(newColName);

    preparedArgs.add(lastColPos);
    preparedArgs.add(targetColNames);
    preparedArgs.add(with);
    preparedArgs.add(newColName);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit)
          throws InterruptedException, TeddyException {
    List<Row> rows = new ArrayList<>();
    int lastColPos = (int) preparedArgs.get(0);
    List<String> targetColNames = (List<String>) preparedArgs.get(1);
    String with = (String) preparedArgs.get(2);
    String newColName = (String) preparedArgs.get(3);
    int colno;

    LOGGER.trace("DfMerge.gather(): start: offset={} length={} newColName={}", offset, length, newColName);

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      // Up to the last target column (inclusive)
      for (colno = 0; colno < lastColPos; colno++) {
        String colName = prevDf.getColName(colno);
        if (targetColNames.contains(colName)) {
          continue;
        }
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      // The new merged column
      StringBuilder sb = new StringBuilder();

      for (int i = 0; i < targetColNames.size(); i++) {
        Object coldata = row.get(targetColNames.get(i));
        if (coldata == null) {
          continue;
        }
        String str = coldata.toString();
        sb.append(str).append(with);
      }
      if (sb.length() > 0) {
        sb.setLength(sb.length() - with.length());
      }
      newRow.add(newColName, sb.toString());

      // 나머지 추가
      for (colno = lastColPos + 1; colno < prevDf.getColCnt(); colno++) {
        newRow.add(prevDf.getColName(colno), row.get(colno));
      }

      rows.add(newRow);
    }

    LOGGER.trace("DfMerge.gather(): end: offset={} length={} newColName={}", offset, length, newColName);
    return rows;
  }
}

