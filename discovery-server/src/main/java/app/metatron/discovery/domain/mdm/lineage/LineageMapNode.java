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
import java.util.ArrayList;
import java.util.List;

public class LineageMapNode implements Serializable {
  private String metaId;
  private String description;

  private List<LineageMapNode> upstreamMapNodes;
  private List<LineageMapNode> downstreamMapNodes;

  private boolean circuit;

  private String metaName;  // This is optional.

  public LineageMapNode() {
    metaId = null;
    description = null;
    upstreamMapNodes = new ArrayList();
    downstreamMapNodes = new ArrayList();
    circuit = false;
  }

  public LineageMapNode(String metaId) {
    this();
    this.metaId = metaId;
  }

  public LineageMapNode(String metaId, String description) {
    this(metaId);
    this.description = description;
  }

  public LineageMapNode(String metaId, String description, String metaName) {
    this(metaId, description);
    this.metaName = metaName;
  }

  public String getMetaId() {
    return metaId;
  }

  public void setMetaId(String metaId) {
    this.metaId = metaId;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<LineageMapNode> getUpstreamMapNodes() {
    return upstreamMapNodes;
  }

  public void setUpstreamMapNodes(
      List<LineageMapNode> upstreamMapNodes) {
    this.upstreamMapNodes = upstreamMapNodes;
  }

  public List<LineageMapNode> getDownstreamMapNodes() {
    return downstreamMapNodes;
  }

  public void setDownstreamMapNodes(
      List<LineageMapNode> downstreamMapNodes) {
    this.downstreamMapNodes = downstreamMapNodes;
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

  @Override
  public String toString() {
    return "LineageMapNode{" +
        "metaId='" + metaId + '\'' +
        ", description='" + description + '\'' +
        ", upstreamMapNodes=" + upstreamMapNodes +
        ", downstreamMapNodes=" + downstreamMapNodes +
        ", circuit=" + circuit +
        ", metaName='" + metaName + '\'' +
        '}';
  }
}
