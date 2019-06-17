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

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LineageEdgeService {
  private static Logger LOGGER = LoggerFactory.getLogger(LineageEdgeService.class);

  @Autowired
  LineageEdgeRepository edgeRepository;

  public LineageEdgeService() {
  }

  @Transactional(rollbackFor = Exception.class)
  public LineageEdge createEdge(String fromMetaId, String toMetaId, String description) throws Exception {
    LOGGER.trace("createEdge(): start");

    LineageEdge lineageEdge = new LineageEdge(fromMetaId, toMetaId, description);
    edgeRepository.saveAndFlush(lineageEdge);

    LOGGER.trace("createEdge(): end");
    return lineageEdge;
  }

  public List<LineageEdge> listEdge() {
    LOGGER.trace("listEdge(): start");

    List<LineageEdge> edges = edgeRepository.findAll();

    LOGGER.trace("listEdge(): end");
    return edges;
  }

  public LineageEdge getEdge(String edgeId) {
    LOGGER.trace("getEdge(): start");

    LineageEdge lineageEdge = edgeRepository.findOne(edgeId);

    LOGGER.trace("getEdge(): end");
    return lineageEdge;
  }

  private void addMapNodeRecursive(LineageMapNode node, boolean upward, List<String> visitedMetaIds) {
    String metaId = node.getMetaId();
    List<LineageEdge> edges;
    LineageMapNode newNode;

    // Edges that have A as downstream are upstream edges of A, vice versa.
    if (upward) {
      edges = edgeRepository.findByToMetaId(metaId);
    } else {
      edges = edgeRepository.findByFromMetaId(metaId);
    }

    // Once started upward, we only find upstreams, and upstreams of upstreams, and so on.
    // We are not interested the downstreams of any upstreams. Vice versa.
    for (LineageEdge edge : edges) {
      if (upward) {
        newNode = new LineageMapNode(edge.getFromMetaId(), edge.getDescription());
        node.getFromMapNodes().add(newNode);
      } else {
        newNode = new LineageMapNode(edge.getToMetaId(), edge.getDescription());
        node.getToMapNodes().add(newNode);
      }

      if (visitedMetaIds.contains(newNode.getMetaId())) {
        newNode.setCircuit(true);
        continue;
      } else {
        visitedMetaIds.add(newNode.getMetaId());
      }

      addMapNodeRecursive(newNode, upward, visitedMetaIds);
    }
  }

  public LineageMapNode getLineageMap(String metaId) {
    LOGGER.trace("getLineageMap(): start");

    List<String> visitedMetaIds = new ArrayList();
    visitedMetaIds.add(metaId);

    LineageMapNode topNode = new LineageMapNode(metaId);

    addMapNodeRecursive(topNode, true, visitedMetaIds);
    addMapNodeRecursive(topNode, false, visitedMetaIds);

    LOGGER.trace("getLineageMap(): end");
    return topNode;
  }
}
