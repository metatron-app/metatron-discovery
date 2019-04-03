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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Revision {
  public List<DataFrame> dfs;
  private Integer curStageIdx;

  private Revision() {
    dfs = new ArrayList<>();
    curStageIdx = null;
  }

  public Revision(DataFrame df) {
    this();
    dfs.add(df);
    curStageIdx = 0;
  }

  public Revision(Revision rev, int until) {
    this();
    for (int i = 0; i < until; i++) {
      dfs.add(rev.get(i));
    }
    curStageIdx = until - 1;
  }

  public int getCurStageIdx() {
    return curStageIdx;
  }

  public void setCurStageIdx(Integer curStageIdx) {
    if (curStageIdx == null) {
      curStageIdx = dfs.size() - 1;
    }
    this.curStageIdx = curStageIdx;
  }

  public void add(DataFrame df) {
    df.slaveDsNameMap = dfs.get(0).slaveDsNameMap;
    dfs.add(df);
  }

  public int size() {
    return dfs.size();
  }

  public DataFrame get(Integer idx) {
    if (idx == null) {
      return get();
    }

    if (idx == -1) {
      idx = dfs.size() - 1;
    }

    return dfs.get(idx);
  }

  public DataFrame get() {
    return dfs.get(curStageIdx);
  }

  // Keep dsId -> dsName map for join, union rules, accumulatively
  // All the maps of dataframes in the revision are synchronized to each other.
  // This is to serve the map when JUMP.
  // The reason to keep the map in the dataframe, not in the revision, is that only one dataframe is serialized for preview use.
  public void saveSlaveDsNameMap(Map<String, String> moreSlaveDsNameMap) {
    dfs.get(0).slaveDsNameMap.putAll(moreSlaveDsNameMap);
  }
}
