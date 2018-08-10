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

package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.domain.dataprep.teddy.DataFrame;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class PrepTransformResponse implements Serializable {
  String wrangledDsId;
  int ruleCurIdx;
  List<PrepTransformRule> ruleStringInfos;
  String undoable;
  String redoable;
  //MatrixResponse<Integer, Object> matrixResponse;
  DataFrame gridResponse;

  // for debugging
  Map<String, Object> cacheInfo;

  public PrepTransformResponse() { }

  public PrepTransformResponse(String wrangledDsId) {
    this.wrangledDsId = wrangledDsId;
  }

  /*
  public PrepTransformResponse(int ruleCurIdx, MatrixResponse<Integer, Object> matrixResponse) {
    this.ruleCurIdx = ruleCurIdx;
    this.matrixResponse = matrixResponse;
  }
  */
  public PrepTransformResponse(int ruleCurIdx, DataFrame gridResponse) {
    this.ruleCurIdx = ruleCurIdx;
    this.setGridResponse( gridResponse );
  }

  /*
  public PrepTransformResponse(MatrixResponse<Integer, Object> matrixResponse) {
    this.matrixResponse = matrixResponse;
  }
  */
  public PrepTransformResponse(DataFrame gridResponse) {
    this.gridResponse = gridResponse;
  }

  public String getWrangledDsId() {
    return wrangledDsId;
  }

  public void setWrangledDsId(String wrangledDsId) {
    this.wrangledDsId = wrangledDsId;
  }

  public int getRuleCurIdx() {
    return ruleCurIdx;
  }

  public void setRuleCurIdx(int ruleCurIdx) {
    this.ruleCurIdx = ruleCurIdx;
  }

  public List<PrepTransformRule> getRuleStringInfos() {
    return ruleStringInfos;
  }

  public void setRuleStringInfos(List<PrepTransformRule> ruleStringInfos, Boolean undoable, Boolean redoable) {
    this.ruleStringInfos = ruleStringInfos;
    this.undoable = undoable.toString();
    this.redoable = redoable.toString();
  }

  public String getUndoable() {
    return undoable;
  }

  public String getRedoable() {
    return redoable;
  }

  /*
  public MatrixResponse<Integer, Object> getMatrixResponse() {
    if(null==matrixResponse) {
      matrixResponse = new MatrixResponse<Integer, Object>();
    }
    if(null==matrixResponse.getColumns()) {
      matrixResponse.setColumns(Lists.newArrayList());
    } else {
      for(MatrixResponse.Column<Object> column : matrixResponse.getColumns()) {
        if( null==column.getValue() ) {
          column.setValue(Lists.newArrayList());
        }
      }
    }
    return matrixResponse;
  }
  */
  public DataFrame getGridResponse() {
    if(null==gridResponse) {
      gridResponse = new DataFrame();
    }
    return gridResponse;
  }
  /*
  public void setMatrixResponse(MatrixResponse<Integer, Object> matrixResponse) {
    this.matrixResponse = matrixResponse;
  }
  */

  /*
  public DataFrame getGridResponse() {
    return makeGridResponse(matrixResponse);
  }
  public DataFrame makeGridResponse(MatrixResponse<Integer,Object> matrixResponse) {
    DataFrame gridResponse = new DataFrame();
    if(null!=matrixResponse && null!=matrixResponse.getColumns()) {
      boolean firstRow = true;
      gridResponse.colCnt = 0;
      for(MatrixResponse.Column<Object> column : matrixResponse.getColumns()) {
        String colName = column.getName();
        gridResponse.colNames.add(colName);

        DataType dataType = column.getType();
        gridResponse.colTypes.add(ColumnType.valueOf(dataType.name()));

        gridResponse.colCnt++;

        Integer rowIdx = 0;
        for(Object o : column.getValue()) {
          Row row = null;
          if(true==firstRow) {
            row = new Row();
            gridResponse.rows.add(row);
          } else {
            row = gridResponse.rows.get(rowIdx);
          }
          row.add( colName, o );
          rowIdx++;
        }

        firstRow = false;
      }
    }
    return gridResponse;
  }
  */

  public void setGridResponse(DataFrame gridResponse) {
    this.gridResponse = gridResponse;
    if(gridResponse==null || null==gridResponse.rows) {
      this.setTotalRowCnt(0);
    } else {
      this.setTotalRowCnt(gridResponse.rows.size());
    }
  }

  Integer sampledRows;
  Long fullBytes;
  public Integer getSampledRows() {
    return sampledRows;
  }
  public Long getFullBytes() {
    return fullBytes;
  }
  public void setSampledRows(Integer sampledRows) {
    this.sampledRows = sampledRows;
  }
  public void setFullBytes(Long fullBytes) {
    this.fullBytes = fullBytes;
  }

  Integer totalRowCnt;
  public Integer getTotalRowCnt() {
    return totalRowCnt;
  }

  public void setTotalRowCnt(Integer totalRowCnt) {
    this.totalRowCnt = totalRowCnt;
  }

  public Map<String, Object> getCacheInfo() {
    return cacheInfo;
  }

  public void setCacheInfo(Map<String, Object> cacheInfo) {
    this.cacheInfo = cacheInfo;
  }
}
