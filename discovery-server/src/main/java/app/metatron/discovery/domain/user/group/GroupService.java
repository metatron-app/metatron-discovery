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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.images.ImageRepository;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.role.RoleRepository;

@Component
public class GroupService {

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  ImageRepository imageRepository;

  public Group getDefaultGroup() {
    return groupRepository.findByPredefinedAndDefaultGroup(true, true);
  }

  public boolean checkDuplicatedName(String groupName) {
    return groupRepository.exists(GroupPredicate.searchDuplicatedName(groupName));
  }

  public void deleteGroupMember(String memberIds) {
    List<GroupMember> groupMembers = groupMemberRepository.findByMemberId(memberIds);
    for (GroupMember groupMember : groupMembers) {
      Group group = groupMember.getGroup();
      group.removeGroupMember(groupMember);
    }
  }

  /**
   * UserProjection 에서 사용
   *
   * @param username
   * @return
   */
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
   * 소속된 그룹 가져오기
   *
   * @param username
   * @return
   */
  public List<Group> getJoinedGroups(String username) {

    Iterable<Group> groups = groupRepository.findJoinedGroups(username);

    return Lists.newArrayList(groups);
  }

  /**
   *
   * @param user
   * @param groupNames
   * @param requiredGroup
   */
//  public void setJoinedGroups(User user, List<String> groupNames, boolean requiredGroup) {
//
//    Set<Role> joinRoles = Sets.newHashSet();
//    if (CollectionUtils.isNotEmpty(groupNames)) {
//      for (String name : groupNames) {
//        Role role = roleRepository.findByScopeAndName(Role.RoleScope.GLOBAL, name);
//        if (role != null) {
//          joinRoles.add(role);
//        }
//      }
//    }
//
//    // 선택한 그룹이 없을 경우 기본 그룹에 포함
//    if (joinRoles.isEmpty() && requiredGroup) {
//      joinRoles.add(roleRepository.findByScopeAndName(Role.RoleScope.GLOBAL, "SYSTEM_USER"));
//    }
//
//  }

}
