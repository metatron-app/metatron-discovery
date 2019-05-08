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

import {UserProfile} from '../user/user-profile';
import {Book} from './book';
import {AbstractHistoryEntity} from '../common/abstract-history-entity';
import {NotebookConnector} from '../notebook/notebookConnector';
import {WORKSPACE_PERMISSION} from '../../common/permission/permission';
import {RoleSet} from '../user/role/roleSet';
import {WorkspaceMember} from './workspace-member';
import {CommonUtil} from '../../common/util/common.util';

export class Workspace extends AbstractHistoryEntity {
  public id: string;
  public name: string;
  public description: string;
  public publicType: PublicType;
  public published: boolean;
  public active: boolean;
  public books: Book[];
  public members: WorkspaceMember[];
  public roleSets: RoleSet[];
  public connectors: NotebookConnector[];
  public favorite: boolean;
  public type: WorkspaceType;
  public roles: any;
  public countByBookType: CountByBookType;
  public countOfDataSources: number;
  public countByMemberType: { user: number, group: number };
  public hierarchies: Hirearchies[];
  public permissions: WORKSPACE_PERMISSION[];

  // read Only
  public owner: UserProfile;

  // write Only
  public ownerId: string;
}

export class Workspaces {
  private workspaces: Workspace[];

  public getList() {
    return this.workspaces;
  }
}

export class WorkspaceAdmin extends AbstractHistoryEntity {
  // data
  public id: string;
  public name: string;
  public description: string;
  public owner: UserProfile;
  public publicType: PublicType;
  public published: boolean;
  public status: any;
  public active: boolean;
  public lastAccessedTime: string;
  // ui
  public statusShowFl: boolean = false;
}

export class Hirearchies {
  public id: string;
  public name: string;
}


export class CountByBookType {
  public workBook: number;
  public folder: number;
  public report: number;
  public workBench: number;
  public notebook: number;
}

export enum PublicType {
  PRIVATE = <any>'PRIVATE',
  SHARED = <any>'SHARED'
}

export enum WorkspaceType {
  DEFAULT = <any>'DEFAULT', // 워크북, 워크벤치, 노트북 지원
  TYPE_1 = <any>'TYPE_1',   // 워크북, 워크벤치 사용 가능
  TYPE_2 = <any>'TYPE_2'    // 워크북 지원
}

/**
 * 권한 체커
 */
export class PermissionChecker {
  private _permissions: WORKSPACE_PERMISSION[] = [];
  private readonly _isAvailableWorkbook: boolean = false;
  private readonly _isAvailableNotebook: boolean = false;
  private readonly _isAvailableWorkbench: boolean = false;
  private readonly _loginUserId: string;
  private readonly _isPublished: boolean = false;

  constructor(workspace: Workspace) {
    if (workspace) {
      switch (workspace.type) {
        case WorkspaceType.TYPE_1 :
          this._isAvailableNotebook = false;
          this._isAvailableWorkbench = true;
          this._isAvailableWorkbook = true;
          break;
        case WorkspaceType.TYPE_2 :
          this._isAvailableNotebook = false;
          this._isAvailableWorkbench = false;
          this._isAvailableWorkbook = true;
          break;
        default :
          this._isAvailableNotebook = true;
          this._isAvailableWorkbench = true;
          this._isAvailableWorkbook = true;
          break;
      }

      (workspace.published) && (this._isPublished = workspace.published);
      (workspace.permissions) && (this._permissions = workspace.permissions);
    }
    this._loginUserId = CommonUtil.getLoginUserId();
  }

  /**
   * 워크스페이스 게스트 체크
   * @returns {boolean}
   */
  public isWorkspaceGuest(): boolean {
    return 0 === this._permissions.length;
  } // function - isWorkspaceGuest

  /**
   * 워크스페이스 관리 권한 체크
   * @returns {boolean}
   */
  public isManageWorkspace(): boolean {
    return -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKSPACE);
  } // function - isManageWorkspace

  /**
   * 워크스페이스 폴더 관리 권한 체크
   * @returns {boolean}
   */
  public isManageWsFolder(): boolean {
    return -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_FOLDER);
  } // function - isManageWsFolder

  /**
   * 워크북 사용 권한 체크
   * @returns {boolean}
   */
  public isViewWorkbook(): boolean {
    return this._isAvailableWorkbook
      && (this._isPublished || -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_WORKBOOK));
  } // function - isViewWorkbook

  /**
   * 워크북 생성 권한 체크
   * @return {boolean}
   */
  public isWriteWorkbook(): boolean {
    return this._isAvailableWorkbook
      && (-1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBOOK)
        || -1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBOOK)
      );
  } // function - isWriteWorkbook

  /**
   * 워크북 수정 권한 체크
   * @param {string} userId
   * @return {boolean}
   */
  public isEditWorkbook(userId: string): boolean {
    return this._isAvailableWorkbook
      && (-1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBOOK) && this._loginUserId === userId);
  } // function - isEditWorkbook

  /**
   * 워크북 관리 권한 체크
   * @returns {boolean}
   */
  public isManageWorkbook(): boolean {
    return this._isAvailableWorkbook
      && -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBOOK);
  } // function - isManageWorkbook

  /**
   * 노트북 사용 권한 체크
   * @returns {boolean}
   */
  public isViewNotebook(): boolean {
    return this._isAvailableNotebook
      && (this._isPublished || -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_NOTEBOOK));
  } // function - isViewNotebook

  /**
   * 노트북 생성 권한 체크
   * @return {boolean}
   */
  public isWriteNotebook(): boolean {
    return this._isAvailableNotebook
      && (-1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_NOTEBOOK)
        || -1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_NOTEBOOK)
      );
  } // function - isWriteNotebook

  /**
   * 노트북 수정 권한 체크
   * @returns {boolean}
   */
  public isEditNotebook(userId: string): boolean {
    return this._isAvailableNotebook
      && (-1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_NOTEBOOK) && this._loginUserId === userId);
  } // function - isEditNotebook

  /**
   * 노트북 관리 권한 체크
   * @returns {boolean}
   */
  public isManageNotebook(): boolean {
    return this._isAvailableNotebook
      && -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_NOTEBOOK);
  } // function - isManageNotebook

  /**
   * 워크벤치 조회 권한 체크
   * @returns {boolean}
   */
  public isViewWorkbench(): boolean {
    return this._isAvailableWorkbench
      && (this._isPublished || -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_WORKBENCH));
  } // function - isViewWorkbench

  /**
   * 워크벤치 생성 권한 체크
   * @return {boolean}
   */
  public isWriteWorkbench(): boolean {
    return this._isAvailableWorkbench
      && (-1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBENCH)
        || -1 < this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBENCH)
      );
  } // function - isWriteWorkbench

  /**
   * 워크벤치 수정 권한 체크
   * @return {boolean}
   */
  public isEditWorkbench(userId: string): boolean {
    return this._isAvailableWorkbench
      && (-1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBENCH) && this._loginUserId === userId);
  } // function - isEditWorkbench

  /**
   * 워크벤치 관리 권한 체크
   * @return {boolean}
   */
  public isManageWorkbench(): boolean {
    return this._isAvailableWorkbench
      && -1 !== this._permissions.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBENCH);
  } // function - isManageWorkbench
}

