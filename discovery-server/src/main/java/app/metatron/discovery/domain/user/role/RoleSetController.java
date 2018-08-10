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

package app.metatron.discovery.domain.user.role;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;

import com.querydsl.core.types.Predicate;

import org.apache.commons.lang.StringUtils;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
import java.util.Map;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspacePredicate;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;

/**
 * Created by kyungtaak on 2016. 7. 21..
 */
@RepositoryRestController
public class RoleSetController {

  private static final Logger LOGGER = LoggerFactory.getLogger(RoleSetController.class);

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  RoleSetRepository roleSetRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  /**
   * RoleSets 목록 조회
   *
   * @param scope
   * @param nameContains 그룹명에 포함되는 문자
   * @param searchDateBy 그룹 조회시 날짜 기준 (생성/수정)
   * @param from 검색 시작 일시
   * @param to 검색 종료 일시
   * @param pageable 페이징/정렬 정보(page, size, sort)
   * @return
   */
  @RequestMapping(path = "/rolesets", method = RequestMethod.GET)
  public ResponseEntity<?> findRoleSets(@RequestParam(value = "scope", required = false) String scope,
                                        @RequestParam(value = "nameContains", required = false) String nameContains,
                                        @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                        @RequestParam(value = "from", required = false)
                                          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                        @RequestParam(value = "to", required = false)
                                          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    RoleSet.RoleSetScope reqScope = null;
    if(StringUtils.isNotBlank(scope)) {
      reqScope = SearchParamValidator.enumUpperValue(RoleSet.RoleSetScope.class, scope, "scope");
    }

    // Get Predicate
    Predicate searchPredicated = RoleSetPredicate.searchRoleSetList(reqScope, nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    Page<RoleSet> resultsRoleSets = roleSetRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(resultsRoleSets, resourceAssembler));
  }

  /**
   * RoleSet 을 지정한 Workspace 목록 조회
   *
   * @param nameContains 그룹명에 포함되는 문자
   * @param searchDateBy 그룹 조회시 날짜 기준 (생성/수정)
   * @param from 검색 시작 일시
   * @param to 검색 종료 일시
   * @param pageable 페이징/정렬 정보(page, size, sort)
   * @return
   */
  @RequestMapping(path = "/rolesets/{rolesetId}/workspaces", method = RequestMethod.GET)
  public ResponseEntity<?> findWorkspacesByRoleSet(@PathVariable(value = "rolesetId") String rolesetId,
                                        @RequestParam(value = "nameContains", required = false) String nameContains,
                                        @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                        @RequestParam(value = "from", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                        @RequestParam(value = "to", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                        Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    RoleSet roleSet = roleSetRepository.findOne(rolesetId);
    if(roleSet == null) {
      throw new ResourceNotFoundException(rolesetId);
    }

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    // Get Predicate
    Predicate searchPredicated = WorkspacePredicate.searchWorkspaceOnRoleSet(roleSet, nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    Page<Workspace> resultsWorkspaces = workspaceRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(resultsWorkspaces, resourceAssembler));
  }

  /**
   * RoleSet 명 중복 체크
   *
   * @param value
   * @return
   */
  @RequestMapping(path = "/rolesets/name/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity<?> checkDuplicatedRoleSetName(@PathVariable("value") String value) {


    Preconditions.checkArgument(StringUtils.isNotBlank(value), "group name to check duplication required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (roleSetService.checkDuplicatedName(value)) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }

  @RequestMapping(path = "/rolesets", method = RequestMethod.POST)
  public ResponseEntity<?> createRoleSet(@RequestBody RoleSet roleSet) {

    RoleSet addRoleSet = roleSetService.createRoleSet(roleSet);

    return ResponseEntity.created(URI.create("")).body(addRoleSet);
  }

  @RequestMapping(path = "/rolesets/{id}/copy", method = RequestMethod.POST)
  public ResponseEntity<?> copyRoleSet(@PathVariable("id") String id,
                                       @RequestParam(name = "name", required = false) String name) {
    RoleSet originalRoleSet = roleSetRepository.findOne(id);
    if(originalRoleSet == null) {
      throw new ResourceNotFoundException(id);
    }

    RoleSet copiedRoleSet = roleSetService.copyRoleSet(originalRoleSet, name);

    return ResponseEntity.ok(copiedRoleSet);
  }

  @RequestMapping(path = "/rolesets/{id}", method = RequestMethod.PUT)
  public ResponseEntity<?> updateRoleSet(@PathVariable("id") String id,
                                         @RequestBody RoleSet roleSet) {

    RoleSet persistRole = roleSetRepository.findOne(id);
    if(persistRole == null) {
      throw new ResourceNotFoundException(id);
    }

    RoleSet updatedRoleSet = roleSetService.updateRoleSet(roleSet, persistRole);

    return ResponseEntity.ok(updatedRoleSet);
  }

}
