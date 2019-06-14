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

public class MetadataDepMapNode implements Serializable {
  private String metaId;

  private List<MetadataDepMapNode> upstreamNodes;
  private List<MetadataDepMapNode> downstreamNodes;

  private boolean circuit;

  public MetadataDepMapNode() {
    metaId = null;
    upstreamNodes = new ArrayList();
    downstreamNodes = new ArrayList();
    circuit = false;
  }

  public MetadataDepMapNode(String metaId) {
    this();
    this.metaId = metaId;
  }

  public String getMetaId() {
    return metaId;
  }

  public void setMetaId(String metaId) {
    this.metaId = metaId;
  }

  public List<MetadataDepMapNode> getUpstreamNodes() {
    return upstreamNodes;
  }

  public void setUpstreamNodes(
      List<MetadataDepMapNode> upstreamNodes) {
    this.upstreamNodes = upstreamNodes;
  }

  public List<MetadataDepMapNode> getDownstreamNodes() {
    return downstreamNodes;
  }

  public void setDownstreamNodes(
      List<MetadataDepMapNode> downstreamNodes) {
    this.downstreamNodes = downstreamNodes;
  }

  public boolean isCircuit() {
    return circuit;
  }

  public void setCircuit(boolean circuit) {
    this.circuit = circuit;
  }

  @Override
  public String toString() {
    return "MetadataDepMapNode{" +
        "metaId='" + metaId + '\'' +
        ", upstreamNodes=" + upstreamNodes +
        ", downstreamNodes=" + downstreamNodes +
        ", circuit=" + circuit +
        '}';
  }
}
