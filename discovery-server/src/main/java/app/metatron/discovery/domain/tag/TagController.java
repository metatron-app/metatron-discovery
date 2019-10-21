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

package app.metatron.discovery.domain.tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import app.metatron.discovery.common.entity.DomainType;

@RepositoryRestController
public class TagController {

  private static Logger LOGGER = LoggerFactory.getLogger(TagController.class);

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  TagService tagService;

  /**
   * Tag Count 목록을 조회합니다.
   */
  @RequestMapping(value = "/tags/popularity", method = RequestMethod.GET)
  public ResponseEntity<?> findTags(@RequestParam(value = "scope", required = false) Tag.Scope scope,
                                    @RequestParam(value = "domainType", required = false) DomainType domainType,
                                    @RequestParam(value = "nameContains", required = false) String nameContains,
                                    @RequestParam(value = "includeEmpty", required = false) boolean includeEmpty,
                                    Pageable pageable) {
    Page<TagCountDTO> tags = tagService.getTagsWithCount(scope, domainType, nameContains, includeEmpty, pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(tags));
  }
}
