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

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class LineageMapNode implements Serializable, Comparable<LineageMapNode> {

  private String metaId;

  @JsonIgnore
  private List<LineageMapNode> frMapNodes;

  @JsonIgnore
  private List<LineageMapNode> toMapNodes;

  private boolean circuit;

  private String metaName;  // This is optional.

  private Integer depth;
  private Integer pos;

  public LineageMapNode() {
    metaId = null;
    frMapNodes = new ArrayList();
    toMapNodes = new ArrayList();
    circuit = false;
    this.depth = 7;
  }

  public LineageMapNode(String metaId, String metaName, int depth) {
    this();
    this.metaId = metaId;
    this.metaName = metaName;
    this.depth = depth;
  }

  public String getMetaId() {
    return metaId;
  }

  public List<LineageMapNode> getFrMapNodes() {
    return frMapNodes;
  }

  public List<LineageMapNode> getToMapNodes() {
    return toMapNodes;
  }

  public boolean isCircuit() {
    return circuit;
  }

  public void setCircuit(boolean circuit) {
    this.circuit = circuit;
  }

  public String getMetaName() {
    return metaName;
  }

  public void setMetaName(String metaName) {
    this.metaName = metaName;
  }

  public Integer getDepth() {
    return depth;
  }

  public void setDepth(Integer depth) {
    this.depth = depth;
  }

  public Integer getPos() {
    return pos;
  }

  public void setPos(Integer pos) {
    this.pos = pos;
  }

  @Override
  public String toString() {
    return "LineageMapNode{" +
        "metaId='" + metaId + '\'' +
        ", circuit=" + circuit +
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
