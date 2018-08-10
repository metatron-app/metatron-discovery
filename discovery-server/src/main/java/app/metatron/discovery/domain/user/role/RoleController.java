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
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.util.AuthUtils;

/**
 *
 */
@RepositoryRestController
public class RoleController {

  private static final Logger LOGGER = LoggerFactory.getLogger(RoleController.class);

  @Autowired
  RoleService roleService;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  RoleDirectoryRepository roleDirectoryRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  /**
   * Role 목록 조회
   *
   * @param nameContains 그룹명에 포함되는 문자
   * @param searchDateBy 그룹 조회시 날짜 기준 (생성/수정)
   * @param from         검색 시작 일시
   * @param to           검색 종료 일시
   * @param pageable     페이징/정렬 정보(page, size, sort)
   */
  @RequestMapping(path = "/roles", method = RequestMethod.GET)
  public ResponseEntity<?> findRoles(@RequestParam(value = "scope", required = false) String scope,
                                     @RequestParam(value = "roleSetId", required = false) String roleSetId,
                                     @RequestParam(value = "nameContains", required = false) String nameContains,
                                     @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                     @RequestParam(value = "from", required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                     @RequestParam(value = "to", required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                     Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    Role.RoleScope reqScope = null;
    if (StringUtils.isNotBlank(scope)) {
      reqScope = SearchParamValidator.enumUpperValue(Role.RoleScope.class, scope, "scope");
    }

    // Get Predicate
    Predicate searchPredicated = RolePredicate.searchRoleList(reqScope, roleSetId, nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    Page<Role> resultsRoles = roleRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(resultsRoles, resourceAssembler));
  }

  /**
   * 사용자 본인의 Role 정보 가져오기
   */
  @RequestMapping(path = "/roles/my", method = RequestMethod.GET)
  public ResponseEntity<?> findMySystemRoles(PersistentEntityResourceAssembler resourceAssembler) {

    String username = AuthUtils.getAuthUserName();

    // TODO:

    return null;
  }

  /**
   * Workspace 내 현재 사용자의 Role 정보 가져오기
   */
  @RequestMapping(path = "/roles/workspaces/{workspaceId}", method = RequestMethod.GET)
  public ResponseEntity<?> findWorkspaceRoles(@PathVariable("workspaceId") String workspaceId,
                                              PersistentEntityResourceAssembler resourceAssembler) {
    String username = AuthUtils.getAuthUserName();

    // TODO:

    return null;
  }

  /**
   * Role 명 중복 체크
   */
  @RequestMapping(path = "/roles/name/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity<?> checkDuplicatedRoleName(@PathVariable("value") String value) {


    Preconditions.checkArgument(StringUtils.isNotBlank(value), "role name to check duplication required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (roleRepository.exists(RolePredicate.searchDuplicatedName(value))) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }

  @RequestMapping(path = "/roles", method = RequestMethod.POST)
  public ResponseEntity<?> createRole(@RequestBody Role role) {

    Role addRole = roleService.createRole(role);

    return ResponseEntity.created(URI.create("")).body(addRole);
  }

  @RequestMapping(path = "/roles/{id}/copy", method = RequestMethod.POST)
  public ResponseEntity<?> copyRole(@PathVariable("id") String id) {
    Role originalRole = roleRepository.findOne(id);
    if (originalRole == null) {
      throw new ResourceNotFoundException(id);
    }

    Role copiedRole = roleService.copyRole(originalRole);

    return ResponseEntity.ok(copiedRole);
  }

  @RequestMapping(path = "/roles/{id}", method = RequestMethod.PUT)
  public ResponseEntity<?> updateRole(@PathVariable("id") String id,
                                      @RequestBody Role role) {

    Role persistRole = roleRepository.findOne(id);
    if (persistRole == null) {
      throw new ResourceNotFoundException(id);
    }

    Role updatedRole = roleService.updateRole(role, persistRole);

    return ResponseEntity.ok(updatedRole);
  }

  /**
   * Role 에 할당된 사용자/Group 목록 조회
   *
   * @param nameContains 사용자 또는 그룹명에 포함되는 문자
   * @param searchDateBy 그룹 조회시 날짜 기준 (생성/수정)
   * @param from         검색 시작 일시
   * @param to           검색 종료 일시
   * @param pageable     페이징/정렬 정보(page, size, sort)
   */
  @RequestMapping(path = "/roles/{roleId}/directories", method = RequestMethod.GET)
  public ResponseEntity<?> findRoleDirectoriesInRole(@PathVariable("roleId") String roleId,
                                                     @RequestParam(value = "type", required = false) String type,
                                                     @RequestParam(value = "nameContains", required = false) String nameContains,
                                                     @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                                     @RequestParam(value = "from", required = false)
                                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                                     @RequestParam(value = "to", required = false)
                                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                                     Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Role role = roleRepository.findOne(roleId);
    if (role == null) {
      throw new ResourceNotFoundException(roleId);
    }

    DirectoryProfile.Type reqType = null;
    if (StringUtils.isNotBlank(type)) {
      reqType = SearchParamValidator.enumUpperValue(DirectoryProfile.Type.class, type, "type");
    }

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    // Get Predicate
    Predicate searchPredicated = RoleDirectoryPredicate.searchRoleDirectoryList(role, reqType, nameContains);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "directoryName"));
    }

    Page<RoleDirectory> resultDirectories = roleDirectoryRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(resultDirectories, resourceAssembler));
  }

  /**
   * Role 권한 할당/해제 (User or Group)
   */
  @RequestMapping(path = "/roles/{roleId}/directories", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public @ResponseBody
  ResponseEntity<?> patchRoleDirectories(
      @PathVariable("roleId") String roleId, @RequestBody List<CollectionPatch> patches) {

    Role role = roleRepository.findOne(roleId);
    if (role == null) {
      throw new ResourceNotFoundException(roleId);
    }

    roleService.assignDirectory(role, patches);

    return ResponseEntity.noContent().build();

  }
}
