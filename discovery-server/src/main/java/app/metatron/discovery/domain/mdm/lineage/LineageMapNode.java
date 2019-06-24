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

  private List<LineageMapNode> fromMapNodes;
  private List<LineageMapNode> toMapNodes;

  private boolean circuit;

  private String metaName;  // This is optional.

  public LineageMapNode() {
    metaId = null;
    description = null;
    fromMapNodes = new ArrayList();
    toMapNodes = new ArrayList();
    circuit = false;
  }

  public LineageMapNode(String metaId) {
    this();
    this.metaId = metaId;
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

  public List<LineageMapNode> getFromMapNodes() {
    return fromMapNodes;
  }

  public void setFromMapNodes(
      List<LineageMapNode> fromMapNodes) {
    this.fromMapNodes = fromMapNodes;
  }

  public List<LineageMapNode> getToMapNodes() {
    return toMapNodes;
  }

  public void setToMapNodes(
      List<LineageMapNode> toMapNodes) {
    this.toMapNodes = toMapNodes;
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
        ", fromMapNodes=" + fromMapNodes +
        ", toMapNodes=" + toMapNodes +
        ", circuit=" + circuit +
        ", metaName='" + metaName + '\'' +
        '}';
  }
}
