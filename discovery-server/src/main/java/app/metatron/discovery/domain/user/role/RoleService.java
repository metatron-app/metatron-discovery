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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.org.Organization;
import app.metatron.discovery.domain.workspace.Workspace;

@Component
public class RoleService {

  @Autowired
  CachedUserService userService;

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  RoleDirectoryRepository roleDirectoryRepository;

  @Autowired
  PermissionRepository permRepository;

  public Role createRole(Role role) {
    // 이름이 중복인지 체크함
    if (checkDuplicatedName(role.getName())) {
      throw new DuplicatedRoleSetNameException(role.getName());
    }

    if (CollectionUtils.isNotEmpty(role.getPermissionNames())) {
      Permission.DomainType type = null;
      if (role.getScope() == Role.RoleScope.WORKSPACE) {
        type = Permission.DomainType.WORKSPACE;
      } else {
        type = Permission.DomainType.SYSTEM;
      }

      role.setPermissions(permRepository.findByNameInAndDomain(role.getPermissionNames(), type));
    }

    return roleRepository.save(role);
  }

  public Role copyRole(Role originalRole) {

    Role copiedRole = originalRole.copyOf();

    return createRole(copiedRole);
  }

  public Role updateRole(Role role, Role persistRole) {

    // 이름이 다른 경우 중복체크를 수행합니다
    if (!persistRole.getName().equals(role.getName())) {
      if (checkDuplicatedName(role.name)) {
        throw new DuplicatedRoleSetNameException(role.getName());
      }
      persistRole.setName(role.getName());
    }

    persistRole.setDescription(role.getDescription());

    if (CollectionUtils.isNotEmpty(role.getPermissionNames())) {
      Permission.DomainType type = null;
      if (role.getScope() == Role.RoleScope.WORKSPACE) {
        type = Permission.DomainType.WORKSPACE;
      } else {
        type = Permission.DomainType.SYSTEM;
      }

      role.setPermissions(permRepository.findByNameInAndDomain(role.getPermissionNames(), type));
    }

    return roleRepository.save(persistRole);
  }

  public void assignDirectory(Role role, List<CollectionPatch> patches) {

    for (CollectionPatch patch : patches) {
      String directoryId = patch.getValue("directoryId");
      String directoryType = patch.getValue("type");

      // 값 검증 (별도 메소드 처리 필요)
      if(StringUtils.isEmpty(directoryId) || StringUtils.isEmpty(directoryType)) {
        continue;
      }
      DirectoryProfile.Type type = DirectoryProfile.Type.valueOf(directoryType);
      if(type == null) {
        continue;
      }

      switch (patch.getOp()) {
        case ADD:
          DirectoryProfile profile = userService.findProfileByDirectoryType(directoryId, type);

          CommonLocalVariable.TenantAuthority tenantAuthority = CommonLocalVariable.getLocalVariable().getTenantAuthority();
          String orgCode = StringUtils.defaultIfEmpty(tenantAuthority.getOrgCode(), Organization.DEFAULT_ORGANIZATION_CODE);

          RoleDirectory newRoleDirectory = new RoleDirectory(role, profile);
          newRoleDirectory.setOrgCode(orgCode);
          role.addDirectory(newRoleDirectory);
          break;
        case REMOVE:
          RoleDirectory removeDirectory = roleDirectoryRepository.findByRoleAndTypeAndDirectoryId(role, type, directoryId);
          role.removeDirectory(removeDirectory);
          break;
        default:
          break;
      }
    }

    roleRepository.save(role);
  }

  public void addRoleDirectory(Role role, String directoryId, String directoryType, String orgCode) {

    // 값 검증 (별도 메소드 처리 필요)
    if(StringUtils.isEmpty(directoryId) || StringUtils.isEmpty(directoryType)) {
      return;
    }
    DirectoryProfile.Type type = DirectoryProfile.Type.valueOf(directoryType);
    if(type == null) {
      return;
    }

    DirectoryProfile profile = userService.findProfileByDirectoryType(directoryId, type);

    RoleDirectory newRoleDirectory = new RoleDirectory(role, profile);
    newRoleDirectory.setOrgCode(orgCode);
    role.addDirectory(newRoleDirectory);

    roleRepository.save(role);
  }

  public boolean checkDuplicatedName(String name) {
    return roleRepository.exists(RolePredicate.searchDuplicatedName(name));
  }

  public List<Role> getRolesByUsername(String username) {

    List<String> directoryIds = Lists.newArrayList(username);

    // 사용자가 포함된 그룹 조회
    List<String> groupIds = groupRepository.findGroupIdsByMemberId(username);
    if(CollectionUtils.isNotEmpty(groupIds)) {
      directoryIds.addAll(groupIds);
    }

    List<Role> resultRoles = roleRepository.findRoleByDirectoryId(
        directoryIds.toArray(new String[directoryIds.size()]));

    return resultRoles;
  }

  /**
   * UserProjection 내에서 활용
   * @param username
   * @return
   */
  public List<String> getRoleNamesByUsername(String username) {

    List<String> directoryIds = Lists.newArrayList(username);

    // 사용자가 포함된 그룹 조회
    List<String> groupIds = groupRepository.findGroupIdsByMemberId(username);
    if(CollectionUtils.isNotEmpty(groupIds)) {
      directoryIds.addAll(groupIds);
    }

    List<String> resultRoleNames = roleRepository.findRoleNameByDirectoryId(
        directoryIds.toArray(new String[directoryIds.size()]));

    return resultRoleNames;
  }

  public List<String> getRoleNamesByGroupId(String groupId) {

    List<String> directoryIds = Lists.newArrayList(groupId);

    List<String> resultRoleNames = roleRepository.findRoleNameByDirectoryId(
        directoryIds.toArray(new String[directoryIds.size()]));

    return resultRoleNames;
  }

  public List<String> getRoleName(Workspace workspace, String... permName) {
    List<RoleSet> roleSets = workspace.getRoleSets();

    if(CollectionUtils.isEmpty(roleSets)) {
      roleSets = Lists.newArrayList(roleSetService.getDefaultRoleSet());
    }

    return roleRepository.findRoleNamesByScopeAndPerm(Role.RoleScope.WORKSPACE, roleSets, permName);
  }

}
