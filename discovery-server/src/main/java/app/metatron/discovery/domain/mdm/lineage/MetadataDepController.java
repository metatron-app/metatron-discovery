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
import javax.ws.rs.Path;
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
public class MetadataDepController {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataDepController.class);

  @Autowired
  MetadataDepService depService;

  public MetadataDepController() {
  }

  @RequestMapping(value = "/metadatas/deps", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> createMetadataDep(@RequestBody Map<String, String> request) {
    MetadataDep metadataDep = null;

    try {
      String desc = request.get("desc");
      String upstreamId = request.get("upstreamId");
      String downstreamId = request.get("downstreamId");

      metadataDep = depService.createMetadateDep(desc, upstreamId, downstreamId);
    } catch (Exception e) {
      LOGGER.error("create(): caught an exception: ", e);
    }

    return ResponseEntity.created(URI.create("")).body(metadataDep);
  }

  @RequestMapping(value = "/metadatas/deps", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> listMetadataDep() {
    List<MetadataDep> metadataDeps = depService.listMetadateDep();

    return ResponseEntity.ok(metadataDeps);
  }

  @RequestMapping(value = "/metadatas/deps/{id}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getMetadataDep(@PathVariable("id") String id) {
    MetadataDep metadataDep = depService.getMetadateDep(id);

    return ResponseEntity.ok(metadataDep);
  }

  @RequestMapping(value = "/metadatas/deps/map/{metaId}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getMetadataDepMap(@PathVariable("metaId") String metaId) {
    MetadataDepMapNode metadataDepMapNode = depService.getMetadataDepMap(metaId);

    return ResponseEntity.ok(metadataDepMapNode);
  }
}
