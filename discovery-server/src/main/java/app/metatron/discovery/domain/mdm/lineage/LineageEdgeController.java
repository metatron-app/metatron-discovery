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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import app.metatron.discovery.domain.dataprep.PrepDatasetFileService;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataErrorCodes;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import app.metatron.discovery.domain.mdm.lineage.LineageMap.ALIGNMENT;

@RequestMapping(value = "/metadatas/lineages")
@RepositoryRestController
public class LineageEdgeController {

  private static Logger LOGGER = LoggerFactory.getLogger(LineageEdgeController.class);

  @Autowired
  LineageEdgeService lineageEdgeService;

  @Autowired
  LineageEdgeRepository lineageEdgeRepository;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  LineageMapService lineageMapService;

  @Autowired
  PrepDatasetFileService prepDatasetFileService;

  private static final int DEFAULT_NODE_CNT = 7;

  public LineageEdgeController() {
  }

  @RequestMapping(path = "/list", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> getLineages(
          @RequestParam(value = "descContains", required = false, defaultValue = "") String descContains,
          @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
          Pageable pageable,
          PersistentEntityResourceAssembler resourceAssembler
  ) {

    Page<LineageEdge> pages = null;
    if (descContains.isEmpty() == true) {
      pages = this.lineageEdgeRepository.findAll(pageable);
    } else {
      pages = this.lineageEdgeRepository.findByDescContaining(descContains, pageable);
    }

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(pages, resourceAssembler));
  }

  @RequestMapping(value = "/edges", method = RequestMethod.POST, produces = "application/json", consumes = "application/json")
  public ResponseEntity<?> createEdge(@RequestBody Map<String, String> request) {
    LineageEdge lineageEdge = null;

    try {
      String frMetaId = request.get("frMetaId");
      String toMetaId = request.get("toMetaId");
      String frMetaName = request.get("frMetaName");
      String toMetaName = request.get("toMetaName");
      String frColName = request.get("frColName");
      String toColName = request.get("toColName");
      Long tier = Long.parseLong(request.get("tier"));
      String desc = request.get("desc");

      lineageEdge = lineageEdgeService
              .createEdge(frMetaId, toMetaId, frMetaName, toMetaName, frColName, toColName, tier, desc);
    } catch (Exception e) {
      LOGGER.error("create(): caught an exception: ", e);
    }

    return ResponseEntity.created(URI.create("")).body(lineageEdge);
  }

  @RequestMapping(value = "/edges", method = RequestMethod.GET, produces = "application/json", consumes = "application/json")
  public ResponseEntity<?> listEdge() {
    List<LineageEdge> edges = lineageEdgeService.listEdge();

    return ResponseEntity.ok(edges);
  }

  @RequestMapping(value = "/edges/{edgeId}", method = RequestMethod.GET, produces = "application/json", consumes = "application/json")
  public ResponseEntity<?> getEdge(@PathVariable("edgeId") String edgeId) {
    LineageEdge lineageEdge = lineageEdgeService.getEdge(edgeId);

    return ResponseEntity.ok(lineageEdge);
  }

  @RequestMapping(value = "/map/{metaId}", method = RequestMethod.GET, produces = "application/json", consumes = "application/json")
  public ResponseEntity<?> getLineageMap(@PathVariable("metaId") String metaId,
          @RequestParam(value = "nodeCnt", required = false) String strNodeCnt,
          @RequestParam(value = "alignment", required = false) String strAlignment) {

    int nodeCnt;

    if (strNodeCnt != null
            && StringUtils.isNumeric(strNodeCnt)
            && Integer.valueOf(strNodeCnt) > 0
            && Integer.valueOf(strNodeCnt) < 20) {
      nodeCnt = Integer.valueOf(strNodeCnt);
    } else {
      nodeCnt = DEFAULT_NODE_CNT;
    }

    ALIGNMENT alignment;
    if (strAlignment == null) {
      alignment = ALIGNMENT.CENTER;
    } else {
      switch (strAlignment) {
        case "LEFT":
          alignment = ALIGNMENT.LEFT;
          break;
        case "RIGHT":
          alignment = ALIGNMENT.RIGHT;
          break;
        default:
          alignment = ALIGNMENT.CENTER;
      }
    }

    LineageMap map = lineageMapService.getLineageMap(metaId, nodeCnt, alignment);

    return ResponseEntity.ok(map);
  }

  // Load a lineaged map dataset named "dsName" (default=DEFAULT_LINEAGE_MAP), return the new edges created by this.
  @RequestMapping(value = "/map", method = RequestMethod.POST, produces = "application/json", consumes = "application/json")
  public ResponseEntity<?> loadLineageMap(@RequestBody Map<String, String> request) {
    List<LineageEdge> newEdges;
    String dsId = request.get("dsId");
    String dsName = request.get("dsName");

    if (dsId != null) {
      newEdges = lineageEdgeService.loadLineageMapDs(dsId, dsName);
    } else {
      newEdges = lineageEdgeService.loadLineageMapDsByDsName(dsName);
    }

    return ResponseEntity.created(URI.create("")).body(newEdges);
  }

  @RequestMapping(value = "/edge_list", method = RequestMethod.POST)
  public
  @ResponseBody
  ResponseEntity<?> postLineageEdgeList(
          @RequestBody List<Resource<LineageEdge>> lineageEdgeResources,
          PersistentEntityResourceAssembler resourceAssembler
  ) {
    List<LineageEdge> lineageEdges = Lists.newArrayList();
    try {
      this.lineageEdgeRepository.deleteAll();

      Iterator<Resource<LineageEdge>> iterator = lineageEdgeResources.iterator();
      while (iterator.hasNext()) {
        LineageEdge lineageEdge = iterator.next().getContent();

        List<Metadata> frMetadatas = this.metadataRepository.findByName(lineageEdge.getFrMetaName());
        if (frMetadatas.size() == 0) {
          LOGGER.error(
                  String.format("postLineageEdges(): frMetadata %s not found: ignored", lineageEdge.getFrMetaName()));
          continue;
        } else {
          lineageEdge.setFrMetaId(frMetadatas.get(0).getId());
        }
        List<Metadata> toMetadatas = this.metadataRepository.findByName(lineageEdge.getToMetaName());
        if (toMetadatas.size() == 0) {
          LOGGER.error(
                  String.format("postLineageEdges(): toMetadata %s not found: ignored", lineageEdge.getToMetaName()));
          continue;
        } else {
          lineageEdge.setToMetaId(toMetadatas.get(0).getId());
        }

        lineageEdges.add(this.lineageEdgeRepository.save(lineageEdge));
      }
    } catch (Exception e) {
      LOGGER.error("postLineageEdges(): caught an exception: ", e);
    }

    return ResponseEntity.created(URI.create("")).body(lineageEdges);
  }

  @RequestMapping(value = "/file_upload", method = RequestMethod.POST, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> file_upload(
          @RequestPart("file") MultipartFile file
  ) {

    String fileName = file.getOriginalFilename();
    String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();

    String tempFileName = "TEMP_LINEAGE_EDGE_" + UUID.randomUUID().toString() + "." + extensionType;
    String tempFilePath = System.getProperty("java.io.tmpdir") + File.separator + tempFileName;

    Map<String, Object> responseMap = Maps.newHashMap();
    responseMap.put("storedUri", tempFilePath);

    try {
      File tempFile = new File(tempFilePath);
      file.transferTo(tempFile);
    } catch (IOException e) {
      LOGGER.error("Failed to upload file : {}", e.getMessage());
      throw new LineageException(MetadataErrorCodes.LINEAGE_CANNOT_CREATE_EDGE, e.getCause());
    }

    return ResponseEntity.ok(responseMap);
  }

  @RequestMapping(value = "/lineage_file", method = RequestMethod.POST)
  public
  @ResponseBody
  ResponseEntity<?> postLineageFile(
          @RequestBody Map<String, Object> params
  ) {

    Map<String, Object> gridResponses = Maps.newHashMap();

    try {
      String storedUri = (String) params.get("storedUri");

      if (storedUri != null) {
        gridResponses = prepDatasetFileService.makeFileGrid("file://" + storedUri, 1000, ",", "\"", 8, false);
      }
    } catch (IllegalStateException e) {
      LOGGER.error("lineage_file POST(): caught an exception: ", e);
    } catch (Exception e) {
      LOGGER.error("lineage_file POST(): caught an exception: ", e);
    }

    return ResponseEntity.ok().body(gridResponses);
  }

  @RequestMapping(value = "/edges/{edgeId}", method = RequestMethod.DELETE, produces = "application/json", consumes = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> deleteEdge(@PathVariable("edgeId") String edgeId) {
    Map<String, Object> response = Maps.newHashMap();

    this.lineageEdgeRepository.delete(edgeId);

    response.put("deleted", edgeId);

    return ResponseEntity.ok().body(response);
  }

}

