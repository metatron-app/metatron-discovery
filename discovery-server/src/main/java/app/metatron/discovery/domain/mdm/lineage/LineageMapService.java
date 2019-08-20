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

import static app.metatron.discovery.domain.mdm.MetadataErrorCodes.LINEAGE_NODE_COUNT_DONE;

import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import app.metatron.discovery.domain.mdm.lineage.LineageMap.ALIGNMENT;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LineageMapService {

  private static Logger LOGGER = LoggerFactory.getLogger(LineageMapService.class);

  @Autowired
  LineageEdgeRepository edgeRepository;

  @Autowired
  MetadataRepository metadataRepository;

  public LineageMapService() {
  }

  private List<LineageEdge> getUpstreamEdgesOf(String metaId) {
    return edgeRepository.findByToMetaId(metaId);
  }

  // Returns true if found any downstream
  private List<LineageEdge> getDownstreamEdgesOf(String metaId) {
    return edgeRepository.findByFrMetaId(metaId);
  }

  private boolean addUpstreamOfCol(LineageMap map) {
    List<LineageMapNode> col = map.nodeGrid.get(map.getCurColNo());
    boolean found = false;

    if (map.getAlignment() == ALIGNMENT.LEFT) {   // No upstream is needed.
      return false;
    }

    for (LineageMapNode node : col) {
      String metaId = node.getMetaId();
      List<LineageEdge> edges = getUpstreamEdgesOf(metaId);
      for (LineageEdge edge : edges) {
        String newMetaId = edge.getFrMetaId();
        LineageMapNode newNode = new LineageMapNode(newMetaId, getMetaName(newMetaId));
        if (found == false) {
          map.addColBefore();
          found = true;
        }
        map.addFrNode(newNode, node);
        map.getNeedEdges().add(edge);
      }
    }

    return found;
  }

  // Returns true if found any downstream
  private boolean addDownstreamOfCol(LineageMap map) {
    List<LineageMapNode> col = map.nodeGrid.get(map.getCurColNo());
    boolean found = false;

    if (map.getAlignment() == ALIGNMENT.RIGHT) {   // No downstream is needed.
      return false;
    }

    for (LineageMapNode node : col) {
      String metaId = node.getMetaId();
      List<LineageEdge> edges = getDownstreamEdgesOf(metaId);
      for (LineageEdge edge : edges) {
        String newMetaId = edge.getToMetaId();
        LineageMapNode newNode = new LineageMapNode(newMetaId, getMetaName(newMetaId));
        if (found == false) {
          map.addColAfter();
          found = true;
        }
        map.addToNode(newNode, node);
        map.getNeedEdges().add(edge);
      }
    }

    return found;
  }

  public LineageMap getLineageMap(String metaId, int nodeCnt, ALIGNMENT alignment) {
    LineageMap map = new LineageMap(nodeCnt, alignment);
    boolean found;

    LineageMapNode masterNode = new LineageMapNode(metaId, getMetaName(metaId));

    map.addColBefore();
    map.addFrNode(masterNode, null);

    try {
      do {
        found = addUpstreamOfCol(map);
      } while (found);
    } catch (LineageException e) {
      if (e.getCode() != LINEAGE_NODE_COUNT_DONE) {
        throw e;
      }
    }

    map.setCurColNo(map.getMasterColNo());

    try {
      do {
        found = addDownstreamOfCol(map);
      } while (found);
    } catch (LineageException e) {
      if (e.getCode() != LINEAGE_NODE_COUNT_DONE) {
        throw e;
      }
    }

    // TODO: If a node is a downstream of another node, re-place it next to the upstream.

    // TODO: Sort nodes in each depth. longest-downsteram first

    return map;
  }

  private Long getMinTier(List<LineageEdge> edges) {
    Long min = null;

    for (LineageEdge edge : edges) {
      if (edge.getTier() == null) {
        continue;
      } else if (min == null) {
        min = edge.getTier();
      } else if (edge.getTier() < min) {
        min = edge.getTier();
      }
    }

    return min;
  }

  private Long getMaxTier(List<LineageEdge> edges) {
    Long max = null;

    for (LineageEdge edge : edges) {
      if (edge.getTier() == null) {
        continue;
      } else if (max == null) {
        max = edge.getTier();
      } else if (edge.getTier() > max) {
        max = edge.getTier();
      }
    }

    return max;
  }

  private String getMetaName(String metaId) {
    List<Metadata> metadatas = metadataRepository.findById(metaId);
    return metadatas.get(0).getName();
  }

}
