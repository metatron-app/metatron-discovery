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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.context.ContextService;
import app.metatron.discovery.domain.images.ImageRepository;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserProperties;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.org.Organization;
import app.metatron.discovery.domain.user.org.OrganizationMember;
import app.metatron.discovery.domain.user.org.OrganizationMemberRepository;
import app.metatron.discovery.domain.user.org.OrganizationPredicate;
import app.metatron.discovery.domain.user.org.OrganizationService;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.domain.workspace.WorkspaceMemberRepository;

@Component
@Transactional
public class GroupService {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupController.class);

  @Autowired
  ContextService contextService;

  @Autowired
  OrganizationService orgService;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  ImageRepository imageRepository;

  @Autowired
  UserProperties userProperties;

  @Autowired
  OrganizationMemberRepository orgMemberRepository;

  /**
   * Create a group
   *
   * @param group
   * @return
   */
  public Group create(Group group) {

    if (checkDuplicatedName(group.getName())) {
      throw new BadRequestException("Duplicated group name : " + group.getName());
    }

    Group result = groupRepository.saveAndFlush(group);

    // Save context
    contextService.saveContextFromDomain(group);

    // Add Organization
    String orgCode = CommonLocalVariable.getLocalVariable().getTenantAuthority().getOrgCode();
    orgService.addMembers(Lists.newArrayList(orgCode), result.getId(), result.getName(), DirectoryProfile.Type.GROUP);

    return result;
  }

  /**
   * Update a group
   *
   * @param group
   * @return
   */
  public Group update(Group group) {

    Group persistGroup = groupRepository.findOne(group.getId());
    if (persistGroup == null) {
      throw new ResourceNotFoundException(group.getId());
    }

    // 그룹명 셋팅
    if (StringUtils.isNotBlank(group.getName()) && !persistGroup.getName().equals(group.getName())) {

      if (checkDuplicatedName(group.getName())) {
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

    return groupRepository.save(persistGroup);
  }

  public void delete(String groupId) {

    Group persistGroup = groupRepository.findOne(groupId);
    if (persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    // Delete context related groups
    contextService.removeContextFromDomain(persistGroup);

    // Delete members in joined workspaces
    workspaceMemberRepository.deleteByMemberIds(Lists.newArrayList(groupId));

    // Delete the member of organizations
    orgService.deleteOrgMembers(groupId);

    groupRepository.delete(persistGroup);
  }

  public void updateGroupMembers(String groupId, List<CollectionPatch> members) {

    Group persistGroup = groupRepository.findOne(groupId);
    if (persistGroup == null) {
      throw new ResourceNotFoundException(groupId);
    }

    for (CollectionPatch patch : members) {
      String memberId = patch.getValue("memberId");
      switch (patch.getOp()) {
        case ADD:
          User realUser = userRepository.findByUsername(memberId);
          if (realUser != null) {
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
  }

  public void deleteGroupMember(String memberId) {
    List<GroupMember> groupMembers = groupMemberRepository.findByMemberId(memberId);
    for (GroupMember groupMember : groupMembers) {
      Group group = groupMember.getGroup();
      group.removeGroupMember(groupMember);
    }
  }

  @Transactional(readOnly = true)
  public Group getDefaultGroup() {
    // getting default group in tenant
    String orgCode = StringUtils.defaultString(CommonLocalVariable.getLocalVariable().getTenantAuthority().getOrgCode(), Organization.DEFAULT_ORGANIZATION_CODE);
    List<OrganizationMember> organizationMembers
        = (List) orgMemberRepository.findAll(OrganizationPredicate.searchOrgMemberList(orgCode, null, DirectoryProfile.Type.GROUP));

    List<String> groupIds = organizationMembers.stream().map(OrganizationMember::getMemberId).collect(Collectors.toList());
    return groupRepository.findByPredefinedAndDefaultGroupAndIdIn(true, true, groupIds);
  }

  /**
   * Check for duplicate group name
   *
   * @param groupName
   * @return
   */
  @Transactional(readOnly = true)
  public boolean checkDuplicatedName(String groupName) {
    return groupRepository.exists(GroupPredicate.searchDuplicatedName(groupName));
  }

  /**
   * Get joined groups by username for UserProjection
   *
   * @param username
   * @return
   */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> getJoinedGroupsForProjection(String username, boolean includeRole) {

    List<Group> groups = getJoinedGroups(username);

    List<Map<String,Object>> result = Lists.newArrayList();
    groups.forEach(group -> {
      Map<String,Object> groupMap = Maps.newHashMap();
      groupMap.put("id", group.getId());
      groupMap.put("name", group.getName());
      groupMap.put("predefined", group.getPredefined());
      if(includeRole) {
        groupMap.put("roleNames", roleRepository.findRoleNameByDirectoryId(group.getId()));
      }
      result.add(groupMap);
    });

    return result;
  }

  /**
   * Get joined groups by username
   *
   * @param username
   * @return
   */
  @Transactional(readOnly = true)
  public List<Group> getJoinedGroups(String username) {

    Iterable<Group> groups = groupRepository.findJoinedGroups(username);

    return Lists.newArrayList(groups);
  }

}
