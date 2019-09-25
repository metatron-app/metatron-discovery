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

import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Row implements Expr.NumericBinding {

  public List<Object> objCols;

  @JsonIgnore
  public Map<String, Integer> nameIdxs;

  @JsonIgnore
  public int colCnt;    // FIXME: not needed

  @JsonIgnore
  List<Integer> cmpKeyIdxs;

  @JsonIgnore
  List<ColumnType> cmpKeyTypes;

  public Row() {
    objCols = new ArrayList<>();
    nameIdxs = new HashMap<>();
    colCnt = 0;
  }

  public void add(String colName, Object objCol) {
    objCols.add(objCol);
    nameIdxs.put(colName, colCnt++);
  }

  public void set(String colName, Object objCol) {
    assert nameIdxs.containsKey(colName) : colName;
    objCols.set(nameIdxs.get(colName), objCol);
  }

  public int size() {
    return colCnt;
  }

  @Override
  public Object get(String colName) {
    return objCols.get(nameIdxs.get(colName));
  }

  public Object get(int colNo) {
    return objCols.get(colNo);
  }
}
