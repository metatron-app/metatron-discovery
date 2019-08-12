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

package app.metatron.discovery.domain.mdm.lineage;

import java.io.Serializable;

public class LineageMapNode implements Serializable, Comparable<LineageMapNode> {

  private String metaId;
  private String metaName;  // This is optional.
  private int depth;
  private int pos;

  public LineageMapNode() {
  }

  public LineageMapNode(String metaId, String metaName) {
    this.metaId = metaId;
    this.metaName = metaName;
    this.depth = -1;
    this.pos = -1;
  }

  public String getMetaId() {
    return metaId;
  }

  public String getMetaName() {
    return metaName;
  }

  public void setMetaName(String metaName) {
    this.metaName = metaName;
  }

  public int getDepth() {
    return depth;
  }

  public void setDepth(int depth) {
    this.depth = depth;
  }

  public int getPos() {
    return pos;
  }

  public void setPos(int pos) {
    this.pos = pos;
  }

  public void incrDepth() {
    depth++;
  }

  public void incrPos() {
    pos++;
  }

  @Override
  public String toString() {
    return "LineageMapNode{" +
        "metaId='" + metaId + '\'' +
        ", metaName='" + metaName + '\'' +
        '}';
  }

  @Override
  public int compareTo(LineageMapNode node) {
    if (this.depth > node.getDepth()) {
      return -1;
    } else if (this.depth == node.getDepth()) {
      return 0;
    } else {
      return 1;
    }
  }
}
