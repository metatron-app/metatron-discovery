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

package app.metatron.discovery.domain.workspace;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;

import app.metatron.discovery.domain.context.ContextService;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.user.role.RoleSetService;
import app.metatron.discovery.util.AuthUtils;

import static app.metatron.discovery.domain.workspace.Workspace.PublicType.SHARED;

/**
 * Created by kyungtaak on 2016. 5. 10..
 */
@RepositoryEventHandler(Workspace.class)
public class WorkspaceEventHandler {

  @Autowired
  ContextService contextService;

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  WorkspaceFavoriteRepository workspaceFavoriteRepository;

  @HandleBeforeCreate
  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_MANAGE_SHARED_WORKSPACE')")
  public void handleBeforeCreate(Workspace workspace) {

    if(StringUtils.isEmpty(workspace.getOwnerId())) {
      workspace.setOwnerId(AuthUtils.getAuthUserName());
    }

    // 공유 워크스페이스일 경우 처리
    if(workspace.getPublicType() == SHARED) {

      // 롤셋 관련 처리 - 지정된 RoleSet이 없는 경우 기본 롤셋 추가
      if(CollectionUtils.isEmpty(workspace.getRoleSets())) {
        RoleSet defaultRoleSet = roleSetService.getDefaultRoleSet();
        defaultRoleSet.plusLink();
        workspace.addRoleSet(defaultRoleSet);
      } else {
        for (RoleSet roleSet : workspace.getRoleSets()) {
          roleSet.plusLink();
        }
      }
    }

  }

  @HandleAfterCreate
  public void handleAfterCreate(Workspace workspace) {
    // Context 정보 저장, ID 가 지정후 생성 필요
    contextService.saveContextFromDomain(workspace);
  }

  @HandleBeforeSave
  @PreAuthorize("authentication.name == #workspace.ownerId " +
            "or hasPermission(#workspace, 'PERM_SYSTEM_MANAGE_SHARED_WORKSPACE')")
  public void handleBeforeSave(Workspace workspace) {
    // Context 정보 저장
    contextService.saveContextFromDomain(workspace);
  }

  @HandleBeforeDelete
  @PreAuthorize("authentication.name == #workspace.ownerId " +
            "or hasPermission(#workspace, 'PERM_SYSTEM_MANAGE_SHARED_WORKSPACE')")
  public void handleBeforeDelete(Workspace workspace) {
    // Favorite 정보 삭제
    workspaceFavoriteRepository.deleteByWorkspaceId(workspace.getId());

    // 워크스페이스 삭제시 RoleSet 링크 개수 제거
    if(CollectionUtils.isNotEmpty(workspace.getRoleSets())) {
      for (RoleSet roleSet : workspace.getRoleSets()) {
        roleSet.minusLink();
      }
    }

    // Context 정보 삭제
    contextService.removeContextFromDomain(workspace);
  }
}
