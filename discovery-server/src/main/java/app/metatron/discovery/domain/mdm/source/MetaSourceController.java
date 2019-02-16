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

package app.metatron.discovery.domain.mdm.source;

import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataController;

@RepositoryRestController
public class MetaSourceController {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataController.class);

  @Autowired
  MetadataSourceRepository metadataSourceRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(value = "/metasources", method = RequestMethod.GET)
  public ResponseEntity<?> getMetadataSources(@RequestParam(value = "sourceId", required = false) String sourceId,
                                              @RequestParam(value = "type", required = false) String type,
                                              @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                              @RequestParam(value = "from", required = false)
                                                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                              @RequestParam(value = "to", required = false)
                                                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                              Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Metadata.SourceType metadataSourceType = null;
    if(StringUtils.isNotEmpty(type)) {
      metadataSourceType = SearchParamValidator
          .enumUpperValue(Metadata.SourceType.class, type, "type");
    }

    // Get Predicate
    Predicate searchPredicated = MetadataSourcePredicate.searchList(metadataSourceType, sourceId, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    // Find by predicated
    Page<MetadataSource> metadataSources = metadataSourceRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadataSources, resourceAssembler));
  }
}
