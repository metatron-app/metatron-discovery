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

package app.metatron.discovery.domain.activities;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

import app.metatron.discovery.domain.activities.spec.ActivityType;


/**
 *
 */
@RepositoryRestController
public class ActivityStreamController {
  private static final Logger LOGGER = LoggerFactory.getLogger(ActivityStreamController.class);

  @Autowired
  ActivityStreamRepository activityStreamRepository;

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  /**
   * activity list for admin
   * @param actions
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/activities", method = RequestMethod.GET)
  public ResponseEntity<?> findActivityStreams(@RequestParam(name = "action", required = false) List<ActivityType> actions,
                                               @RequestParam(value = "nameContains", required = false) String nameContains,
                                               @RequestParam(value = "clientContains", required = false) String clientContains,
                                               @RequestParam(value = "from", required = false)
                                               @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                               @RequestParam(value = "to", required = false)
                                               @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                               Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    LOGGER.debug("request ok.");
    LOGGER.debug("actions : {}", actions);
    LOGGER.debug("pageable : {}", pageable);
    Page<ActivityStream> pagedActivity
        = activityStreamService.findActivityStreams(null, actions, nameContains, clientContains, from, to, pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(pagedActivity, resourceAssembler));
  }

  /**
   * get user activity
   * @param username
   * @param resourceAssembler
   * @return
   */
  @PreAuthorize("authentication.name == #username or hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/activities/user/{username:.+}", method = RequestMethod.GET)
  public ResponseEntity<?> findUserActivities(@PathVariable("username") String username,
                                              @RequestParam(name = "action", required = false) List<ActivityType> actions,
                                              @RequestParam(value = "nameContains", required = false) String nameContains,
                                              @RequestParam(value = "clientContains", required = false) String clientContains,
                                              @RequestParam(value = "from", required = false)
                                              @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                              @RequestParam(value = "to", required = false)
                                              @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                              Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    Page<ActivityStream> pagedActivity
        = activityStreamService.findActivityStreams(username, actions, nameContains, clientContains, from, to, pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(pagedActivity, resourceAssembler));
  }
}
