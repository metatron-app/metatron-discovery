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

package app.metatron.discovery.common.oauth;

import com.google.common.base.Preconditions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.NotebookModel;
import app.metatron.discovery.domain.user.role.PermissionRepository;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workbook.widget.Widget;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.domain.workspace.folder.Folder;

/**
 * Workspace 관련 Custom 권한 처리
 */
@Component
@Transactional
public class BasePermissionEvaluator implements PermissionEvaluator {

  private static Logger LOGGER = LoggerFactory.getLogger(BasePermissionEvaluator.class);

  @Autowired
  public RoleRepository roleRepository;

  @Autowired
  public PermissionRepository permissionRepository;

  @Autowired
  public WorkspaceService workspaceService;

  @Override
  public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {

    if(targetDomainObject instanceof Workspace) {
      return checkWorkspacePermission(authentication, (Workspace) targetDomainObject, permission);
    } else if(targetDomainObject instanceof WorkBook) {
      return checkWorkBookPermission(authentication, (WorkBook) targetDomainObject, permission);
    } else if(targetDomainObject instanceof Folder) {
      return checkFolderPermission(authentication, (Folder) targetDomainObject, permission);
    } else if(targetDomainObject instanceof Notebook) {
      return checkNotebookPermission(authentication, (Notebook) targetDomainObject, permission);
    } else if(targetDomainObject instanceof DashBoard) {
      return checkDashBoardPermission(authentication, (DashBoard) targetDomainObject, permission);
    } else if(targetDomainObject instanceof Widget) {
      return checkWidgetPermission(authentication, (Widget) targetDomainObject, permission);
    } else if(targetDomainObject instanceof DataSource) {
      return checkDataSourcePermission(authentication, (DataSource) targetDomainObject, permission);
    } else if(targetDomainObject instanceof Role) {
      return checkRolePermission(authentication, (Role) targetDomainObject, permission);
    } else if(targetDomainObject instanceof RoleSet) {
      return checkRoleSetPermission(authentication, (RoleSet) targetDomainObject, permission);
    } else if(targetDomainObject instanceof NotebookModel) {
      return checkNotebookModelPermission(authentication, (NotebookModel) targetDomainObject, permission);
    } else if(targetDomainObject instanceof NotebookConnector) {
      return checkNotebookConnectorPermission(authentication, (NotebookConnector) targetDomainObject, permission);
    } else if(targetDomainObject instanceof Workbench) {
      return checkWorkbenchPermission(authentication, (Workbench) targetDomainObject, permission);
    }

    return false;
  }

  @Override
  public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
    throw new RuntimeException("Id and Class permissions are not supperted by this application");
  }

  private boolean checkWorkspacePermission(Authentication authentication, Workspace workspace, Object permission) {

    LOGGER.debug("Check WorkBook Permission : UserId({}), Id/OwnerId({},{}), Permission({})"
            , authentication.getName(), workspace.getId(), workspace.getOwnerId(), permission);

//    // 공유 대상의 Permission 체크
//    Set<String> permissionNames = workspaceService.getPermissions(workspace);
//
//    if(permissionNames.contains(permission)) {
//      return true;
//    }
//
//    return false;

    // TODO: workspace 퍼미션이 정리 될때까지 보류
    return true;
  }

  private boolean checkFolderPermission(Authentication authentication, Folder folder, Object permission) {
    Preconditions.checkNotNull(folder, "Folder resource is null.");
    LOGGER.debug("Check Folder Permission : UserId({}), Id({}), Permission({})"
        , authentication.getName(), folder.getId(), permission);
    return checkWorkspacePermission(authentication, folder.getWorkspace(), permission);
  }

  private boolean checkNotebookPermission(Authentication authentication, Notebook notebook, Object permission) {
    Preconditions.checkNotNull(notebook, "Notebook resource is null.");
    LOGGER.debug("Check Notebook Permission : UserId({}), Id({}), Permission({})"
        , authentication.getName(), notebook.getId(), permission);
    return checkWorkspacePermission(authentication, notebook.getWorkspace(), permission);
  }

  private boolean checkNotebookModelPermission(Authentication authentication, NotebookModel notebookModel, Object permission) {
    Preconditions.checkNotNull(notebookModel, "NotebookModel resource is null.");
    LOGGER.debug("Check NotebookModel Permission : UserId({}), Id({}), Permission({})"
            , authentication.getName(), notebookModel.getId(), permission);
    return checkWorkspacePermission(authentication, notebookModel.getNotebook().getWorkspace(), permission);
  }

  //TODO. check permission policy
  private boolean checkNotebookConnectorPermission(Authentication authentication, NotebookConnector connector, Object permission) {
    return true;
  }

  private boolean checkWorkBookPermission(Authentication authentication, WorkBook workBook, Object permission) {
    Preconditions.checkNotNull(workBook, "Workbook resource is null.");
    LOGGER.debug("Check WorkBook Permission : UserId({}), Id({}), Permission({})"
            , authentication.getName(), workBook.getId(), permission);
    return checkWorkspacePermission(authentication, workBook.getWorkspace(), permission);
  }

  private boolean checkDashBoardPermission(Authentication authentication, DashBoard board, Object permission) {
    Preconditions.checkNotNull(board, "Dashboard resource is null.");
    LOGGER.debug("Check dashboard Permission : UserId({}), Id({}), Permission({})"
        , authentication.getName(), board.getId(), permission);
    return checkWorkBookPermission(authentication, board.getWorkBook(), permission);
  }

  private boolean checkWidgetPermission(Authentication authentication, Widget widget, Object permission) {
    Preconditions.checkNotNull(widget, "Widget resource is null.");
    LOGGER.debug("Check widget Permission : UserId({}), Id({}), Permission({})"
            , authentication.getName(), widget.getId(), permission);
    return checkDashBoardPermission(authentication, widget.getDashBoard(), permission);
  }

  private boolean checkDataSourcePermission(Authentication authentication, DataSource dataSource, Object permission) {
    Preconditions.checkNotNull(dataSource, "dataSource resource is null.");
    LOGGER.debug("Check DataSource Permission : UserId({}), Id({}), Permission({})"
            , authentication.getName(), dataSource.getId(), permission);

    if(authentication.getAuthorities().contains(permission)) {
      return true;
    }

//    Set<Workspace> workspaces = dataSource.getWorkspaces();
//
//    if(CollectionUtils.isEmpty(workspaces)) {
//      return false;
//    }
//
//    // 관련된 워크스페이스를 일일히 찾아서, ㅠㅠ 권한체크를 해봐야함
//    for(Workspace targetWorkspace : workspaces) {
//      return checkWorkspacePermission(authentication, targetWorkspace, permission);
//    }

    return false;
  }

  private boolean checkRolePermission(Authentication authentication, Role role, Object permission) {
    Preconditions.checkNotNull(role, "dataSource resource is null.");
    LOGGER.debug("Check Role Permission : UserId({}), Id({}), Permission({}), Scope({})"
        , authentication.getName(), role.getId(), permission, role.getScope());

    if(role.getScope() == Role.RoleScope.WORKSPACE) {
      // TODO: 추후 고민이 필요함, 워크스페이스의 RoleSet 은  누가 수정하는지 정리가 필요함
      return true;
    }

    return authentication.getAuthorities().contains(permission);
  }

  private boolean checkRoleSetPermission(Authentication authentication, RoleSet roleSet, Object permission) {
    Preconditions.checkNotNull(roleSet, "dataSource resource is null.");
    LOGGER.debug("Check Role Permission : UserId({}), Id({}), Name({})"
        , authentication.getName(), roleSet.getId(), roleSet.getName());

    // TODO: 워크스페이스일 경우 처리 확인 필요

    return authentication.getAuthorities().contains(permission);
  }

  private boolean checkWorkbenchPermission(Authentication authentication, Workbench workbench, Object permission) {
    Preconditions.checkNotNull(workbench, "Workbench resource is null.");
    LOGGER.debug("Check Workbench Permission : UserId({}), Id({}), Permission({})"
            , authentication.getName(), workbench.getId(), permission);
    return checkWorkspacePermission(authentication, workbench.getWorkspace(), permission);
  }
}
