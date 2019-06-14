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
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;

@Service
public class MetadataDepService {
  private static Logger LOGGER = LoggerFactory.getLogger(MetadataDepService.class);

  @Autowired
  MetadataDepRepository depRepository;

  public MetadataDepService() {
  }

  @Transactional(rollbackFor = Exception.class)
  public MetadataDep createMetadateDep(String desc, String upstreamId, String downstreamId) throws Exception {
    LOGGER.trace("createMetadateDep(): start");

    MetadataDep metadataDep = new MetadataDep(desc, upstreamId, downstreamId);
    depRepository.saveAndFlush(metadataDep);

    LOGGER.trace("createMetadateDep(): end");
    return metadataDep;
  }

  public List<MetadataDep> listMetadateDep() {
    LOGGER.trace("listMetadateDep(): start");

    List<MetadataDep> metadataDeps = depRepository.findAll();

    LOGGER.trace("listMetadateDep(): end");
    return metadataDeps;
  }

  public MetadataDep getMetadateDep(String id) {
    LOGGER.trace("getMetadateDep(): start");

    MetadataDep metadataDep = depRepository.findOne(id);

    LOGGER.trace("getMetadateDep(): end");
    return metadataDep;
  }

  private void addMetadataDepMap(MetadataDepMapNode node, boolean upward, List<String> visitedMetaIds) {
    String metaId = node.getMetaId();
    List<MetadataDep> deps;
    MetadataDepMapNode newNode;

    if (upward) {
      deps = depRepository.findByDownstreamId(metaId);
    } else {
      deps = depRepository.findByUpstreamId(metaId);
    }

    for (MetadataDep dep : deps) {
      if (upward) {
        newNode = new MetadataDepMapNode(dep.getUpstreamId());
        node.getUpstreamNodes().add(newNode);
      } else {
        newNode = new MetadataDepMapNode(dep.getDownstreamId());
        node.getDownstreamNodes().add(newNode);
      }

      if (visitedMetaIds.contains(newNode.getMetaId())) {
        node.setCircuit(true);
      } else {
        visitedMetaIds.add(node.getMetaId());
      }

      addMetadataDepMap(newNode, upward, visitedMetaIds);
    }
  }

  public MetadataDepMapNode getMetadataDepMap(String metaId) {
    LOGGER.trace("getMetadataDepMap(): start");

    List<String> visitedMetaIds = new ArrayList();
    MetadataDepMapNode topNode = new MetadataDepMapNode(metaId);
    addMetadataDepMap(topNode, true, visitedMetaIds);
    addMetadataDepMap(topNode, false, visitedMetaIds);

    LOGGER.trace("getMetadataDepMap(): end");
    return topNode;
  }
}
