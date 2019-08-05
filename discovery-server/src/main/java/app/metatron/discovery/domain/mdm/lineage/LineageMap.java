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
import java.util.Collections;
import java.util.List;

public class LineageMap implements Serializable {

  List<List<LineageMapNode>> nodeGrid;
  List<LineageEdge> needEdges;
  Integer depthLimit;
  int depthAdjustment;

  @JsonIgnore
  List<LineageMapNode> origins;

  @JsonIgnore
  List<String> visitedMetaIds;

  public static int INITIAL_DEPTH = 0;

  public LineageMap() {
    nodeGrid = new ArrayList();
    needEdges = new ArrayList();
    origins = new ArrayList();
    visitedMetaIds = new ArrayList();
    depthLimit = 7;   // up + myself + down
  }

  public LineageMap(int depthLimit) {
    this();
    this.depthLimit = depthLimit;
  }

  public List<List<LineageMapNode>> getNodeGrid() {
    return nodeGrid;
  }

  public List<LineageEdge> getNeedEdges() {
    return needEdges;
  }

  void findOrigins(LineageMapNode node, int depth) {
    // A node that makes a circuit cannot be the origin.
    if (visitedMetaIds.contains(node.getMetaId())) {
      return;
    }
    visitedMetaIds.add(node.getMetaId());

    if (node.getUpstreamMapNodes().size() == 0) {
      node.setDepth(depth);
      origins.add(node);
    }

    for (LineageMapNode n : node.getUpstreamMapNodes()) {
      findOrigins(n, depth - 1);
    }

    Collections.sort(origins);
  }

  void setDepthAdjustment() {
    depthAdjustment = -origins.get(0).getDepth();  // TODO: when minDepth is less than depthLimit
  }

  int getDepthAdjustment() {
    return depthAdjustment;
  }

  void addColumn() {
    nodeGrid.add(new ArrayList());
  }

  void addNode(int depth, LineageMapNode node) {
    while (nodeGrid.size() <= depth) {
      addColumn();
    }

    List<LineageMapNode> column = nodeGrid.get(depth);
    column.add(node);
  }
}
