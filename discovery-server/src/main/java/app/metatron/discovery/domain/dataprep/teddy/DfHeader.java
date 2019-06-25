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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoRowException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.rule.Header;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class DfHeader extends DataFrame {
  private static Logger LOGGER = LoggerFactory.getLogger(DfHeader.class);

  public DfHeader(String dsName, String ruleString) {
    super(dsName, ruleString);
  }

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    List<Object> preparedArgs = new ArrayList<>();
    Header header = (Header) rule;

    int targetRowno = header.getRownum().intValue() - 1;
    if (targetRowno < 0 || targetRowno >= prevDf.rows.size()) {
      throw new NoRowException("DfHeader.prepare(): row number should be >= 1 and < row_count: rowno=" + (targetRowno + 1));
    }

    int i = 1;
    Row targetRow = prevDf.rows.get(targetRowno);
    for (int colno = 0; colno < prevDf.getColCnt(); colno++) {
      String newColName = targetRow.get(colno) == null ? null : targetRow.get(colno).toString();

      // if column value is missing, use "columnN" naming
      if (newColName ==  null || newColName.equals("")) {
        newColName = "column" + (i++);
      } else {
        newColName = makeParsable(newColName);
      }

      newColName = modifyDuplicatedColName(newColName);
      addColumn(newColName, prevDf.getColDesc(colno));
    }

    preparedArgs.add(targetRowno);
    return preparedArgs;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException {
    List<Row> rows = new ArrayList<>();
    int targetRowno = (int) preparedArgs.get(0);

    LOGGER.trace("DfHeader.gather(): start: offset={} length={} targetRowno={}", offset, length, targetRowno);

    assert prevDf.getColCnt() == getColCnt() : String.format("prevDf.colcnt=%d this.colcnt=%d", prevDf.getColCnt(), getColCnt());

    for (int rowno = offset; rowno < offset + length; cancelCheck(++rowno)) {
      if (rowno == targetRowno) {
        continue;
      }

      Row row = prevDf.rows.get(rowno);
      Row newRow = new Row();

      for (int colno = 0; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }
      rows.add(newRow);
    }

    LOGGER.trace("DfHeader.gather(): done: offset={} length={} targetRowno={}", offset, length, targetRowno);
    return rows;
  }
}

