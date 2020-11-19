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

package app.metatron.discovery.domain.dataprep.service;

import com.google.common.collect.Maps;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshotProjections;
import app.metatron.discovery.domain.dataprep.repository.PrSnapshotRepository;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_NO_SNAPSHOT;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_SHOULD_BE_MADE_BY_TRANSFORM;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

@RequestMapping(value = "/preparationsnapshots")
@RepositoryRestController
public class PrSnapshotController {

  private static Logger LOGGER = LoggerFactory.getLogger(PrSnapshotController.class);

  @Autowired
  private PrSnapshotRepository snapshotRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  private PrSnapshotService snapshotService;

  @Autowired
  private PrepProperties prepProperties;

  @RequestMapping(value = "/{ssId}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getSnapshot(
          @PathVariable("ssId") String ssId,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {
    PrSnapshot snapshot;
    Resource<PrSnapshotProjections.DefaultProjection> projectedSnapshot;
    try {
      snapshot = this.snapshotRepository.findOne(ssId);
      if (snapshot != null) {
      } else {
        throw snapshotError(MSG_DP_ALERT_NO_SNAPSHOT, ssId);
      }

      PrSnapshotProjections.DefaultProjection projection = projectionFactory
              .createProjection(PrSnapshotProjections.DefaultProjection.class, snapshot);
      projectedSnapshot = new Resource<>(projection);
    } catch (Exception e) {
      LOGGER.error("getSnapshot(): caught an exception: ", e);
      throw snapshotError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedSnapshot);
  }

  @RequestMapping(value = "/{ssId}", method = RequestMethod.PATCH)
  @ResponseBody
  public ResponseEntity<?> patchSnapshot(
          @PathVariable("ssId") String ssId,
          @RequestBody Resource<PrSnapshot> snapshotResource,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {

    PrSnapshot snapshot;
    PrSnapshot patchSnapshot;
    PrSnapshot savedSnapshot;
    Resource<PrSnapshotProjections.DefaultProjection> projectedSnapshot;

    try {
      snapshot = this.snapshotRepository.findOne(ssId);
      patchSnapshot = snapshotResource.getContent();

      this.snapshotService.patchAllowedOnly(snapshot, patchSnapshot);

      savedSnapshot = snapshotRepository.save(snapshot);
      LOGGER.debug(savedSnapshot.toString());

      this.snapshotRepository.flush();
    } catch (Exception e) {
      LOGGER.error("postSnapshot(): caught an exception: ", e);
      throw snapshotError(e);
    }

    PrSnapshotProjections.DefaultProjection projection = projectionFactory
            .createProjection(PrSnapshotProjections.DefaultProjection.class, savedSnapshot);
    projectedSnapshot = new Resource<>(projection);
    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedSnapshot);
  }

  @RequestMapping(value = "/{ssId}/contents", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> getContents(
          @PathVariable("ssId") String ssId,
          @RequestParam(value = "offset", required = false, defaultValue = "0") Integer offset,
          @RequestParam(value = "target", required = false, defaultValue = "1") Integer target
  ) {
    Map<String, Object> responseMap = snapshotService.getContents(ssId, offset, target);

    return ResponseEntity.status(HttpStatus.SC_OK).body(responseMap);
  }

  @RequestMapping(value = "/{ssId}/download", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> getDownload(
          HttpServletRequest request,
          HttpServletResponse response,
          @PathVariable("ssId") String ssId,
          @RequestParam(value = "fileType", required = false, defaultValue = "0") String fileType
  ) {
    try {
      String downloadFileName = this.snapshotService.downloadSnapshotFile(ssId, response, fileType);
      response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", downloadFileName));
      if(fileType.equalsIgnoreCase("csv")) {
        response.setContentType("application/csv; charset=utf-8");
      } else if(fileType.equalsIgnoreCase("json")) {
        response.setContentType("application/json; charset=utf-8");
      } else {
        response.setContentType("text/plain; charset=utf-8");
      }
      response.setCharacterEncoding("UTF-8");

    } catch (Exception e) {
      LOGGER.error("getDownload(): caught an exception: ", e);
      throw snapshotError(e);
    }

    return null;
  }

  @RequestMapping(value = "/{dsId}/work_list", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> workList(
          @PathVariable("dsId") String dsId,
          @RequestParam(value = "option", required = false, defaultValue = "NOT_ALL") String option) {
    Map<String, Object> response = Maps.newHashMap();
    try {
      List<PrSnapshot> snapshots = this.snapshotService.getWorkList(dsId, option);
      response.put("snapshots", snapshots);
    } catch (Exception e) {
      LOGGER.error("workList(): caught an exception: ", e);
      throw snapshotError(e);
    }
    return ResponseEntity.ok(response);
  }
}

