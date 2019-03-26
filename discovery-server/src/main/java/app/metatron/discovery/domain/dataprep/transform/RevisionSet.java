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

import java.util.ArrayList;
import java.util.List;

// 1 Wrangled Dataset -> 1 RevisionSet  -> N Revisions
// 1 Revision -> 1 Rule List -> N DataFrames
// 1 DataFrame -> 1 Rule String
public class RevisionSet {
  public List<Revision> revs;
  private int curRevIdx;
  private int resetRevIdx;

  // exposed only for logging (otherwise, do not call)
  public int getCurRevIdx() {
    return curRevIdx;
  }

  public int getRevCnt() {
    return revs.size();
  }

  public RevisionSet(Revision rev) {
    revs = new ArrayList<>();
    revs.add(rev);
    curRevIdx = 0;
    resetRevIdx = 0;
  }

  public void add(Revision rev) {
    trim();
    revs.add(rev);
    curRevIdx++;
  }

  public Revision undo() {
    return revs.get(--curRevIdx);
  }

  public Revision redo() {
    return revs.get(++curRevIdx);
  }

  public Revision get(int idx) {
    return revs.get(idx);
  }

  public Revision get() {
    return revs.get(curRevIdx);
  }

  public int size() {
    return revs.size();
  }

  private void trim() {
    for (int i = revs.size() - 1; i > curRevIdx; i--) {
      revs.remove(i);
    }
  }

  public void reset() {
    trim();
    resetRevIdx = curRevIdx;
  }

  public boolean isUndoable() {
    return (curRevIdx > resetRevIdx);
  }

  public boolean isRedoable() {
    return (curRevIdx < revs.size() - 1);
  }
}
