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
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.workspace.WorkspaceMemberRepository;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;

@Component
@Transactional(readOnly = true)
public class RoleSetService {

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  PermissionRepository permRepository;

  @Autowired
  RoleSetRepository roleSetRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Transactional
  public RoleSet createRoleSet(RoleSet roleSet) {
    // 이름이 중복인지 체크함
    if(checkDuplicatedName(roleSet.getName())) {
      throw new DuplicatedRoleSetNameException(roleSet.getName());
    }

    // RoleSet 내 Role 이 존재하는 경우 default role 이 반드시 하나씩 존재해야 함
    if(!existDefaultRoleSet(roleSet)) {
      throw new IllegalArgumentException("One default role must be specified.");
    }

    List<Role> roles = roleSet.getRoles();
    int seq = 1;
    for (Role role : roles) {
      role.setRoleSet(roleSet);
      role.setSeq(seq++);
      role.setScope(Role.RoleScope.WORKSPACE);
      if(CollectionUtils.isNotEmpty(role.getPermissionNames())) {
        role.setPermissions(permRepository.findByNameInAndDomain(role.getPermissionNames(),
                                                                 Permission.DomainType.WORKSPACE));
      }
    }

    return roleSetRepository.save(roleSet);
  }

  @Transactional
  public RoleSet copyRoleSet(RoleSet originalRoleSet, String name) {

    RoleSet copiedRoleSet = originalRoleSet.copyOf();

    // 복사시 롤셋명을 지정했을 경우, 이름에 대한 중복될 경우 오류 처리를 수행하며
    // 자동 지정이고 중복인 경우 Numbering 을 수행합니다
    if(StringUtils.isNotEmpty(name)) {
      copiedRoleSet.setName(name);
    } else {
      if(checkDuplicatedName(copiedRoleSet.getName())) {
        String candidateName = copiedRoleSet.getName() + "_";
        long count = roleSetRepository.count(RoleSetPredicate.searchDuplicatedName(candidateName, true));
        copiedRoleSet.setName(candidateName + (++count));
      }
    }

    return createRoleSet(copiedRoleSet);
  }

  @Transactional
  public RoleSet updateRoleSet(RoleSet roleSet, RoleSet persistRoleSet) {

    // 이름이 다른 경우 중복체크를 수행합니다
    if(!persistRoleSet.getName().equals(roleSet.getName())) {
      if (checkDuplicatedName(roleSet.name)) {
        throw new DuplicatedRoleSetNameException(roleSet.getName());
      }
      persistRoleSet.setName(roleSet.getName());
    }

    persistRoleSet.setDescription(roleSet.getDescription());

    // RoleSet 내 Role 이 존재하는 경우 default role 이 반드시 하나씩 존재해야 함
    if(!existDefaultRoleSet(roleSet)) {
      throw new IllegalArgumentException("One default role must be specified.");
    }

    // Mapper 값 설정을 위해 미리 셋팅
    List<String> fromRoleNames = persistRoleSet.getRoleNames();
    List<String> toRoleNames = roleSet.getRoleNames();

    roleRepository.deleteRoleInRoleSet(persistRoleSet);

    List<Role> roles = Lists.newArrayList();
    int seq = 1;
    for (Role role : roleSet.getRoles()) {
      role.setRoleSet(persistRoleSet);
      role.setScope(Role.RoleScope.WORKSPACE);
      role.setSeq(seq++);
      if(CollectionUtils.isNotEmpty(role.getPermissionNames())) {
        role.setPermissions(permRepository.findByNameInAndDomain(role.getPermissionNames(),
                                                                 Permission.DomainType.WORKSPACE));
      }
      roles.add(role);
    }

    persistRoleSet.setRoles(roles);

    roleSetRepository.saveAndFlush(persistRoleSet);

    // mapper 값을 통해 기존 GroupMember 값을 변경
    Map<String, String> mapper = roleSet.getMapper();

    // RoleSet에 연결되어 있는 Workspace 가 존재시 매핑 정보 참조하여 변경
    List<String> linkedWorkspaceIds = workspaceRepository.findIdByRoleSetId(persistRoleSet.getId());
    if(CollectionUtils.isNotEmpty(linkedWorkspaceIds)) {
      Role defaultRole = persistRoleSet.getDefaultRole();
      if (MapUtils.isNotEmpty(mapper)) {
        // mapper 내 값 유효성 검증
        if (!fromRoleNames.containsAll(mapper.keySet())) {
          throw new BadRequestException("Invalid mapper property: from Name(" + fromRoleNames + "), mapper key(" + mapper.keySet() + ")");
        }

        // 변환된 Role 에 대해 WorkspaceMember 내 값들을 변경, toRoleName 이 존재하지 않는 경우 Default 값 처리
        for (String fromRoleName : mapper.keySet()) {
          String toRoleName = mapper.get(fromRoleName);
          workspaceMemberRepository.updateMultiMemberRoleInWorkspaces(linkedWorkspaceIds, fromRoleName,
                                                                      StringUtils.isEmpty(toRoleName) ? defaultRole.getName() : toRoleName);
        }
      } else {
        if (!CollectionUtils.isEqualCollection(fromRoleNames, toRoleNames)) {
          for (String fromRoleName : fromRoleNames) {
            workspaceMemberRepository.updateMultiMemberRoleInWorkspaces(linkedWorkspaceIds, fromRoleName, defaultRole.getName());
          }
        }
      }
    }

    return persistRoleSet;
  }

  public boolean checkDuplicatedName(String name) {
    return roleSetRepository.exists(RoleSetPredicate.searchDuplicatedName(name, false));
  }

  public boolean existDefaultRoleSet(RoleSet roleSet) {
    return CollectionUtils.isNotEmpty(roleSet.getRoles()) && roleSet.getDefaultRole() != null;
  }

  public RoleSet getDefaultRoleSet() {
    return roleSetRepository.findOne(RoleSet.ROLESET_ID_DEFAULT);
  }

}
