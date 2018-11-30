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

import app.metatron.discovery.domain.dataprep.entity.PrTransformRule;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class PrepTransformResponse implements Serializable {
  String wrangledDsId;
  int ruleCurIdx;
  List<PrTransformRule> transformRules;
  String undoable;
  String redoable;
  DataFrame gridResponse;

  // for debugging
  Map<String, Object> cacheInfo;

  public PrepTransformResponse() { }

  public PrepTransformResponse(String wrangledDsId) {
    this.wrangledDsId = wrangledDsId;
  }

  public PrepTransformResponse(int ruleCurIdx, DataFrame gridResponse) {
    this.ruleCurIdx = ruleCurIdx;
    this.setGridResponse( gridResponse );
  }

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

  public List<PrTransformRule> getTransformRules() {
    return transformRules;
  }

  public void setTransformRules(List<PrTransformRule> transformRules, Boolean undoable, Boolean redoable) {
    this.transformRules = transformRules;

    this.undoable = undoable.toString();
    this.redoable = redoable.toString();
  }

  public String getUndoable() {
    return undoable;
  }

  public String getRedoable() {
    return redoable;
  }

  public DataFrame getGridResponse() {
    if(null==gridResponse) {
      gridResponse = new DataFrame();
    }
    return gridResponse;
  }

  public void setGridResponse(DataFrame gridResponse) {
    this.gridResponse = gridResponse;
    if(gridResponse==null || null==gridResponse.rows) {
      this.setTotalRowCnt(0);
    } else {
      this.setTotalRowCnt(gridResponse.rows.size());
    }
  }

  Long sampledRows;
  Long fullBytes;
  public Long getSampledRows() {
    return sampledRows;
  }
  public Long getFullBytes() {
    return fullBytes;
  }
  public void setSampledRows(Long sampledRows) {
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
