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

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkSave;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import app.metatron.discovery.domain.workspace.Workspace;

/**
 * Created by kyungtaak on 2016. 5. 14..
 */
@RepositoryEventHandler(RoleSet.class)
public class RoleSetEventHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(RoleSetEventHandler.class);

  @Autowired
  RoleSetService roleSetService;

  @HandleBeforeCreate
//  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_WRITE_USER') " +
//          "or hasPermission(#roleSet, 'PERM_WORKSPACE_WRITE_MEMBER')")
  public void handleBeforeCreate(RoleSet roleSet) {

    // 이름이 중복인지 체크함
    if(roleSetService.checkDuplicatedName(roleSet.getName())) {
      throw new DuplicatedRoleSetNameException(roleSet.getName());
    }

    // RoleSet 내 Role 이 존재하는 경우 default role 이 반드시 하나씩 존재해야 함
    if(CollectionUtils.isNotEmpty(roleSet.getRoles()) && roleSet.getDefaultRole() == null) {
      throw new IllegalArgumentException("One default role must be specified.");
    }

  }

  @HandleBeforeSave
//  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_WRITE_USER') " +
//          "or hasPermission(#roleSet, 'PERM_WORKSPACE_WRITE_MEMBER')")
  public void handleBeforeSave(RoleSet roleSet) {
  }

  @HandleBeforeLinkSave
//  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_WRITE_USER') " +
//      "or hasPermission(#roleSet, 'PERM_WORKSPACE_WRITE_MEMBER')")
  public void handleBeforeLinkSave(RoleSet roleSet, Object linked) {

    // 연결된 워크스페이스 개수 처리,
    // PATCH 일경우 linked 객체에 값이 주입되나 PUT 인경우 값이 주입되지 않아
    // linked 객체 체크를 수행하지 않음
    if (roleSet.getScope() == RoleSet.RoleSetScope.PUBLIC) {
      roleSet.setLinkedWorkspaces(roleSet.getWorkspaces().size());
      LOGGER.debug("UPDATED: Set linked workspace in roleset({}) : {}", roleSet.getId(), roleSet.getLinkedWorkspaces());
    }
  }

  @HandleBeforeDelete
//  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_WRITE_USER') " +
//          "or hasPermission(#roleSet, 'PERM_WORKSPACE_WRITE_MEMBER')")
  public void handleBeforeDelete(RoleSet roleSet) {
  }

  @HandleBeforeLinkDelete
//  @PreAuthorize("hasAnyAuthority('PERM_SYSTEM_WRITE_USER') " +
//      "or hasPermission(#roleSet, 'PERM_WORKSPACE_WRITE_MEMBER')")
  public void handleBeforeLinkDelete(RoleSet roleSet, Object linked) {

    // 연결된 워크스페이스 개수 처리,
    // 전체 공개 워크스페이스가 아니고 linked 내 Entity 타입이 Workspace 인 경우
    if (roleSet.getScope() == RoleSet.RoleSetScope.PUBLIC &&
        !CollectionUtils.sizeIsEmpty(linked) &&
        CollectionUtils.get(linked, 0) instanceof Workspace) {
      roleSet.setLinkedWorkspaces(roleSet.getWorkspaces().size());
      LOGGER.debug("DELETED: Set linked workspace in roleset({}) : {}", roleSet.getId(), roleSet.getLinkedWorkspaces());
    }

  }

}
