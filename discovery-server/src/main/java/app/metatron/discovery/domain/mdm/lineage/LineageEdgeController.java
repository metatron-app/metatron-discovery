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

import java.net.URI;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RepositoryRestController
public class LineageEdgeController {

  private static Logger LOGGER = LoggerFactory.getLogger(LineageEdgeController.class);

  @Autowired
  LineageEdgeService lineageEdgeService;

  public LineageEdgeController() {
  }

  @RequestMapping(value = "/metadatas/lineage/edge", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> createEdge(@RequestBody Map<String, String> request) {
    LineageEdge lineageEdge = null;

    try {
      String desc = request.get("desc");
      String fromMetaId = request.get("fromMetaId");
      String toMetaId = request.get("toMetaId");

      lineageEdge = lineageEdgeService.createEdge(desc, fromMetaId, toMetaId);
    } catch (Exception e) {
      LOGGER.error("create(): caught an exception: ", e);
    }

    return ResponseEntity.created(URI.create("")).body(lineageEdge);
  }

  @RequestMapping(value = "/metadatas/lineage/edge", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> listEdge() {
    List<LineageEdge> edges = lineageEdgeService.listEdge();

    return ResponseEntity.ok(edges);
  }

  @RequestMapping(value = "/metadatas/lineage/edge/{edgeId}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getEdge(@PathVariable("edgeId") String edgeId) {
    LineageEdge lineageEdge = lineageEdgeService.getEdge(edgeId);

    return ResponseEntity.ok(lineageEdge);
  }

  @RequestMapping(value = "/metadatas/lineage/map/{metaId}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getLineageMap(@PathVariable("metaId") String metaId) {
    LineageMapNode lineageMapNode = lineageEdgeService.getLineageMap(metaId);

    return ResponseEntity.ok(lineageMapNode);
  }
}
