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

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Maps;

import com.querydsl.core.types.Predicate;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

import app.metatron.discovery.util.ProjectionUtils;

/**
 * Created by kyungtaak on 2016. 7. 22..
 */
@RepositoryRestController
public class ColumnDictionaryController {

  private static Logger LOGGER = LoggerFactory.getLogger(ColumnDictionaryController.class);

  @Autowired
  ColumnDictionaryRepository columnDictionaryRepository;

  @Autowired
  MetadataColumnRepository metadataColumnRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  MetadataColumnProjections metadataColumnProjections = new MetadataColumnProjections();

  public ColumnDictionaryController() {
  }

  /**
   * Column Dictionary 목록을 조회합니다.
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(value = "/dictionaries", method = RequestMethod.GET)
  public ResponseEntity<?> findColumnDictionaries(
                                           @RequestParam(value = "nameContains", required = false) String nameContains,
                                           @RequestParam(value = "logicalNameContains", required = false) String logicalNameContains,
                                           @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                           @RequestParam(value = "from", required = false)
                                           @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                           @RequestParam(value = "to", required = false)
                                           @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                           Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // Get Predicate
    Predicate searchPredicated = ColumnDictionaryPredicate.searchList(nameContains, logicalNameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "logicalName", "name"));
    }

    // Find by predicated
    Page<ColumnDictionary> columnDictionaries = columnDictionaryRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(columnDictionaries, resourceAssembler));
  }

  @RequestMapping(path = "/dictionaries/name/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity<?> checkDuplicatedValue(@PathVariable("value") String value) {

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (columnDictionaryRepository.exists(ColumnDictionaryPredicate.searchDuplicatedName(value))) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }

  @RequestMapping(value = "/dictionaries/{dictionaryId}/columns", method = RequestMethod.GET)
  public ResponseEntity<?> findLinkedMedadataColumns(@PathVariable("dictionaryId") String dictionaryId,
                                                    @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
                                                    Pageable pageable) {

    if(columnDictionaryRepository.findOne(dictionaryId) == null) {
      throw new ResourceNotFoundException(dictionaryId);
    }

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "physicalName"));
    }

    Page<MetadataColumn> columns = metadataColumnRepository.linkedMetadataColumns(dictionaryId, pageable);


    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(
        ProjectionUtils.toPageResource(projectionFactory,
                                       metadataColumnProjections.getProjectionByName(projection),
                                       columns)
    ));

  }

}
