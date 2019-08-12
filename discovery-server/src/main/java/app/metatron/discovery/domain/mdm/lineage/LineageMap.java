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

public class LineageMap implements Serializable {

  public enum ALIGNMENT {
    LEFT,
    RIGHT,
    CENTER
  }

  List<List<LineageMapNode>> nodeGrid;
  List<LineageEdge> needEdges;

  @JsonIgnore
  private int curColNo;

  @JsonIgnore
  private int curColCnt;

  @JsonIgnore
  private int masterColNo;

  @JsonIgnore
  private int maxColCnt;

  @JsonIgnore
  private ALIGNMENT alignment;

  public LineageMap(int maxColCnt, ALIGNMENT alignment) {
    nodeGrid = new ArrayList();
    needEdges = new ArrayList();
    curColNo = 0;
    curColCnt = 0;
    masterColNo = 0;
    this.maxColCnt = maxColCnt;
    this.alignment = alignment;
  }

  public List<List<LineageMapNode>> getNodeGrid() {
    return nodeGrid;
  }

  public void setNodeGrid(List<List<LineageMapNode>> nodeGrid) {
    this.nodeGrid = nodeGrid;
  }

  public List<LineageEdge> getNeedEdges() {
    return needEdges;
  }

  public void setNeedEdges(List<LineageEdge> needEdges) {
    this.needEdges = needEdges;
  }

  public Integer getCurColNo() {
    return curColNo;
  }

  public int getMasterColNo() {
    return masterColNo;
  }

  public void setCurColNo(int curColNo) {
    this.curColNo = curColNo;
  }

  // This function is meant to be called before any downstream processing.
  public void addColBefore() {
    nodeGrid.add(curColNo, new ArrayList());
    masterColNo = curColCnt;
    curColCnt++;

    for (List<LineageMapNode> col : nodeGrid) {
      for (LineageMapNode node : col) {
        if (node != null) {
          node.incrDepth();
        }
      }
    }
  }

  // This function is meant to be called all after upstream process done.
  public void addColAfter() {
    nodeGrid.add(new ArrayList());
    curColNo = curColCnt;
    curColCnt++;
  }

  private boolean colContains(List<LineageMapNode> col, LineageMapNode node) {
    for (LineageMapNode n : col) {
      if (node.getMetaId().equals(n.getMetaId())) {
        return true;
      }
    }
    return false;
  }

  // This function is meant to be called before any downstream processing.
  public void addFrNode(LineageMapNode node, LineageMapNode toNode) {
    List<LineageMapNode> col = nodeGrid.get(curColNo);

    if (colContains(col, node)) {
      return;
    }

    node.setDepth(curColNo);
    node.setPos(col.size());

    if (toNode == null || node.getPos() == toNode.getPos()) {
      col.add(node);
      return;
    }

    if (toNode.getPos() > node.getPos()) {
      while (col.size() < toNode.getPos()) {
        col.add(null);
      }
      node.setPos(col.size());
      col.add(node);
      return;
    }

    // increase all nodes' pos that are equal or greater pos than node's
    for (List<LineageMapNode> c : nodeGrid.subList(1, nodeGrid.size())) {
      incrPosAbove(c, node);
    }

    col.add(node);
  }

  // This function is meant to be called all after upstream process done.
  public void addToNode(LineageMapNode node, LineageMapNode fromNode) {
    List<LineageMapNode> col = nodeGrid.get(curColNo);

    if (colContains(col, node)) {
      return;
    }

    node.setDepth(curColNo);
    node.setPos(col.size());

    assert fromNode != null : node;

    if (node.getPos() == fromNode.getPos()) {
      col.add(node);
      return;
    }

    if (node.getPos() < fromNode.getPos()) {
      while (col.size() < fromNode.getPos()) {
        col.add(null);
      }
      node.setPos(fromNode.getPos());
      col.add(node);
      return;
    }

    // increate all nodes' pos that are equal or greater pos than node's
    for (List<LineageMapNode> c : nodeGrid.subList(masterColNo, nodeGrid.size() - 1)) {
      incrPosAbove(c, node);
    }

    col.add(node);
  }

  private void incrPosAbove(List<LineageMapNode> c, LineageMapNode node) {
    boolean fillSpace = false;

    for (int i = c.size() - 1; i >= 0; i--) {
      LineageMapNode n = c.get(i);
      if (n == null) {
        continue;
      }

      if (n.getPos() >= node.getPos()) {
        n.incrPos();
        fillSpace = true;
      } else {
        if (fillSpace) {
          c.add(node.getPos(), null);
        }
        break;
      }
    }
  }
}
