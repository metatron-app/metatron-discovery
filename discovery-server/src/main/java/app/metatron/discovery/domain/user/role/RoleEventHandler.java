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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;

import app.metatron.discovery.domain.context.ContextService;

/**
 * Created by kyungtaak on 2016. 5. 14..
 */
@RepositoryEventHandler(Role.class)
public class RoleEventHandler {

  @Autowired
  ContextService contextService;

  @Autowired
  RoleRepository roleRepository;

  @HandleBeforeCreate
  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_MANAGE_USER')")
  public void handleBeforeCreate(Role role) {

    // 중복 Role 명 체크
    Long count;
    switch (role.getScope()) {
      case WORKSPACE:
        count = roleRepository.countByRoleSetAndName(role.getRoleSet(), role.getName());
        break;
      default:
        count = roleRepository.countByScopeAndName(role.getScope(), role.getName());
    }

    if(count > 0) {
      throw new DuplicatedRoleNameException(role.getScope(), role.getName());
    }

  }

  @HandleAfterCreate
  public void handleAfterCreate(Role role) {
    // Context 정보 저장, ID 가 지정후 생성 필요
    contextService.saveContextFromDomain(role);
  }

  @HandleBeforeSave
  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_MANAGE_USER')")
  public void handleBeforeSave(Role role) {
    // Context 정보 저장
    contextService.saveContextFromDomain(role);
  }

  @HandleBeforeDelete
  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_MANAGE_USER')")
  public void handleBeforeDelete(Role role) {
    // Context 정보 삭제
    contextService.removeContextFromDomain(role);
  }

}
