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

package app.metatron.discovery.domain.user.group;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
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
import org.springframework.data.projection.ProjectionFactory;
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
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.context.ContextService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.role.PermissionRepository;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.domain.workspace.WorkspaceMemberRepository;

/**
 *
 */
@RepositoryRestController
public class GroupController {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupController.class);

  @Autowired
  GroupService groupService;

  @Autowired
  ContextService contextService;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PermissionRepository permRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  /**
   * Group 목록 조회
   *
   * @param nameContains 그룹명에 포함되는 문자
   * @param searchDateBy 그룹 조회시 날짜 기준 (생성/수정)
   * @param from 검색 시작 일시
   * @param to 검색 종료 일시
   * @param pageable 페이징/정렬 정보(page, size, sort)
   * @return
   */
  @RequestMapping(path = "/groups", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findGroups(@RequestParam(value = "nameContains", required = false) String nameContains,
                                      @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                      @RequestParam(value = "from", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                      @RequestParam(value = "to", required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                      PersistentEntityResourceAssembler resourceAssembler, Pageable pageable) {

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    // Get Predicate
    Predicate searchPredicated = GroupPredicate.searchGroupList(nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      Sort newSort = new Sort(Sort.Direction.DESC, "predefined");
      newSort.and(new Sort(Sort.Direction.ASC, "name"));

      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), newSort);
    } else {
      Sort newSort = new Sort(Sort.Direction.DESC, "predefined");
      newSort = newSort.and(pageable.getSort());

      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), newSort);
    }

    Page<Group> groups = groupRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(groups, resourceAssembler));
  }

//  @RequestMapping(path = "/groups/{groupId}", method = RequestMethod.GET)
//  public ResponseEntity<?> findGroup(@PathVariable("groupId") String groupId,
//                                     PersistentEntityResourceAssembler resourceAssembler) {
//    Group group = groupRepository.findOne(groupId);
//    if(group == null) {
//      throw new ResourceNotFoundException(groupId);
//    }
//
//    return ResponseEntity.ok(resourceAssembler.toResource(group));
//  }

  @RequestMapping(path = "/groups", method = RequestMethod.POST)
  public ResponseEntity<?> createGroups(@RequestBody Group group) {

    if(groupService.checkDuplicatedName(group.getName())) {
      throw new BadRequestException("Duplicated group name : " + group.getName());
    }

    Group result = groupRepository.saveAndFlush(group);

    // Context 저장
    contextService.saveContextFromDomain(group);

    return ResponseEntity.created(URI.create("")).body(result);
  }

  @RequestMapping(path = "/groups/{groupId}", method = RequestMethod.PUT)
  public ResponseEntity<?> updateGroups(@PathVariable("groupId") String groupId, @RequestBody Group group) {

    Group persistGroup = groupRepository.findOne(groupId);
    if(persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    // 그룹명 셋팅
    if(StringUtils.isNotBlank(group.getName()) && !persistGroup.getName().equals(group.getName())) {

      if (groupService.checkDuplicatedName(group.getName())) {
        throw new RuntimeException("Duplicated group name : " + group.getName());
      }

      persistGroup.setName(group.getName());

      // Workspace Member 이름 갱신
      workspaceMemberRepository.updateMemberName(persistGroup.getId(), persistGroup.getName());
    }

    // 그룹 설명 셋팅
    persistGroup.setDescription(group.getDescription());

    // Context 저장
    persistGroup.setContexts(group.getContexts());
    contextService.saveContextFromDomain(persistGroup);

    Group result = groupRepository.save(persistGroup);

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/groups/{groupId}", method = RequestMethod.DELETE)
  public ResponseEntity<?> deleteGroups(@PathVariable("groupId") String groupId) {
    Group persistGroup = groupRepository.findOne(groupId);
    if(persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    // Context 정보 삭제
    contextService.removeContextFromDomain(persistGroup);

    groupRepository.delete(persistGroup);

    // Workspace Member 삭제
    workspaceMemberRepository.deleteByMemberIds(Lists.newArrayList(groupId));

    return ResponseEntity.noContent().build();
  }

  /**
   *
   * @param value
   * @return
   */
  @RequestMapping(path = "/groups/name/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity<?> checkDuplicatedValue(@PathVariable("value") String value) {


    Preconditions.checkArgument(StringUtils.isNotBlank(value), "group name to check duplication required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (groupService.checkDuplicatedName(value)) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }


  @RequestMapping(path = "/groups/{id}/members", method = RequestMethod.GET)
  public ResponseEntity<?> findGroupMembers(@PathVariable("id") String groupId,
                                            Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Group persistGroup = groupRepository.findOne(groupId);
    if(persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    Page<GroupMember> memberResults = groupMemberRepository.findByGroup(persistGroup, pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(memberResults, resourceAssembler));
  }

  @RequestMapping(path = "/groups/{id}/members", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public ResponseEntity<?> updateGroupMembers(@PathVariable("id") String groupId, @RequestBody List<CollectionPatch> members) {

    Group persistGroup = groupRepository.findOne(groupId);
    if(persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    for (CollectionPatch patch : members) {
      String memberId = patch.getValue("memberId");
        switch (patch.getOp()) {
          case ADD:
            User realUser = userRepository.findByUsername(memberId);
            if(realUser != null) {
              persistGroup.addGroupMember(new GroupMember(memberId, realUser.getFullName()));
            }
            break;
          case REMOVE:
            GroupMember removeMember = groupMemberRepository.findByGroupAndMemberId(persistGroup, memberId);
            persistGroup.removeGroupMember(removeMember);
            break;
          default:
            LOGGER.warn("Not supported action");
        }
    }

    groupRepository.save(persistGroup);

    return ResponseEntity.noContent().build();
  }

}
