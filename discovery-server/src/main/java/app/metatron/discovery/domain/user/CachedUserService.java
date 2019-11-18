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

package app.metatron.discovery.domain.user;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupProfile;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.role.RoleService;
import app.metatron.discovery.domain.workspace.WorkspaceMember;

/**
 * Created by kyungtaak on 2016. 5. 18..
 */
@Component("cachedUserService")
public class CachedUserService {

  private static final Logger LOGGER = LoggerFactory.getLogger(InnerUserServiceImpl.class);

  private static final Map<String, User> userMap = Maps.newHashMap();

  private static final Map<String, Group> groupMap = Maps.newHashMap();

  @Autowired
  RoleService roleService;

  @Autowired
  UserRepository userRepository;

  @Autowired
  GroupRepository groupRepository;

  public User findUser(String username) {

    if(StringUtils.isBlank(username)) {
      return null;
    }

    if (userMap.containsKey(username)) {
      return userMap.get(username);
    } else {
      User user = userRepository.findByUsername(username);
      if (user == null) {
        LOGGER.debug("User({}) not found. Return empty User object.", username);
        return null;
      } else {
        user.setRoleService(roleService);
        userMap.put(username, user);
        return user;
      }
    }
  }

  public void removeCachedUser(String userId) {
    if(userMap.containsKey(userId)) {
      userMap.remove(userId);
    }
  }

  public Group findGroup(String groupId) {

    if(groupId == null) {
      return null;
    }

    if (groupMap.containsKey(groupId)) {
      return groupMap.get(groupId);
    } else {
      Group group = groupRepository.findOne(groupId);
      if (group == null) {
        LOGGER.debug("Role({}) not found. Return empty Role object.", groupId);
        return null;
      } else {
        groupMap.put(groupId, group);
        return group;
      }
    }
  }

  /**
   * Member 타입(사용자/그룹) 별 profile 정보 가져오기,
   * Projection 내 Spel 처리시 활용
   *
   * @param id
   * @param type
   * @return
   */
  public DirectoryProfile findProfileByMemberType(String id, WorkspaceMember.MemberType type) {
    switch (type) {
      case USER:
        return findUserProfile(id);
      case GROUP:
        return findGroupProfile(id);
    }
    return null;
  }

  /**
   * Member 타입(사용자/그룹) 별 profile 정보 가져오기,
   * Projection 내 Spel 처리시 활용
   *
   * @param id
   * @param type
   * @return
   */
  public DirectoryProfile findProfileByDirectoryType(String id, DirectoryProfile.Type type) {
    switch (type) {
      case USER:
        return findUserProfile(id);
      case GROUP:
        return findGroupProfile(id);
    }
    return null;
  }

  public GroupProfile findGroupProfile(String groupId) {
    Group group = findGroup(groupId);
    if(group == null) {
      return new GroupProfile(groupId, GroupProfile.UNKNOWN_GROUPNAME);
    } else {
      return GroupProfile.getProfile(group);
    }
  }

  public UserProfile findUserProfile(String username) {
    User user = findUser(username);

    if(user == null) {
      return new UserProfile(username, UserProfile.UNKNOWN_USERNAME, null);
    } else {
      return UserProfile.getProfile(user);
    }
  }

}
