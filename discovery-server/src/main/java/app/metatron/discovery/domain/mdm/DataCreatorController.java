/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Lists;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.favorite.FavoriteService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;

@RepositoryRestController
public class DataCreatorController {

  private static Logger LOGGER = LoggerFactory.getLogger(DataCreatorController.class);

  @Autowired
  DataCreatorService dataCreatorService;

  @Autowired
  MetadataService metadataService;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  FavoriteService favoriteService;

  public DataCreatorController() {
  }

  /**
   * Add or Remove favorite to data creator
   *
   * @param creatorId the creator id
   * @param action    the action
   * @return the response entity
   */
  @RequestMapping(value = "/metadatas/datacreators/{creatorId}/favorite/{action:attach|detach}", method = RequestMethod.POST)
  public ResponseEntity <?> manageFavoriteCreator(@PathVariable("creatorId") String creatorId, @PathVariable("action") String action) {
    switch (action) {
      case "attach":
        favoriteService.addFavorite(DomainType.METADATA_CREATOR, creatorId);
        break;
      case "detach":
        favoriteService.removeFavorite(DomainType.METADATA_CREATOR, creatorId);
        break;
    }
    return ResponseEntity.noContent().build();
  }

  /**
   * Gets Metadata creator List.
   *
   * @param nameContains      the name contains
   * @param resourceAssembler the resource assembler
   * @return the favorite creator
   */
  @RequestMapping(path = "/metadatas/datacreators", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getDataCreatorList(@RequestParam(value = "nameContains", required = false) String nameContains,
                                              PersistentEntityResourceAssembler resourceAssembler) {
    List<DataCreatorDTO> dataCreatorList = dataCreatorService.getDataCreatorList(nameContains);
    return ResponseEntity.ok(dataCreatorList);
  }

  /**
   * Gets favorite creator detail.
   *
   * @param creatorId the creator id
   * @return the favorite creator detail
   */
  @RequestMapping(value = "/metadatas/datacreators/{creatorId}", method = RequestMethod.GET)
  public ResponseEntity <?> getFavoriteCreatorDetail(@PathVariable("creatorId") String creatorId) {
    DataCreatorDTO dataCreator = dataCreatorService.getDataCreator(creatorId);
    return ResponseEntity.ok(dataCreator);
  }

  /**
   * Getting Metadata List by Creator
   *
   * @param creatorId         the creator id
   * @param nameContains      the name contains
   * @param pageable          the pageable
   * @param resourceAssembler the resource assembler
   * @return the response entity
   */
  @RequestMapping(value = "/metadatas/datacreators/{creatorId}/metadatas", method = RequestMethod.GET)
  public ResponseEntity <?> findMetadatas(@PathVariable("creatorId") String creatorId,
                                          @RequestParam(value = "nameContains", required = false) String nameContains,
                                          Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    User targetUser = userRepository.findByUsername(creatorId);
    List<String> targetUserId = Lists.newArrayList(targetUser.getUsername());
    Page<Metadata> metadatas = metadataRepository.searchMetadatas(null, null, null, null,
                                                                  nameContains, null, targetUserId,
                                                                  null, null, null, pageable);
    //add additional properties for list projection
    metadataService.addProjectionProperties(metadatas.getContent());
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadatas, resourceAssembler));
  }
}
