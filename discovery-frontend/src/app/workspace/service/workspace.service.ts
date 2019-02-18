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

/**
 * Created by LDL on 2017. 6. 16..
 */

import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '../../common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import { Workspace, Workspaces } from '../../domain/workspace/workspace';
import { BookTree } from '../../domain/workspace/book';
import { CommonUtil } from '../../common/util/common.util';
import { Page } from '../../domain/common/page';
import { SYSTEM_PERMISSION } from '../../common/permission/permission';
import { PermissionService } from '../../user/service/permission.service';
import { RoleSet } from '../../domain/user/role/roleSet';
import { saveAs } from 'file-saver';

@Injectable()
export class WorkspaceService extends AbstractService {

  constructor(private permissionService: PermissionService,
              protected injector: Injector) {
    super(injector);
  }

  /**
   * 개인 워크스페이스
   * @param {string} projection
   * @returns {Promise<Workspace>}
   */
  public getMyWorkspace(projection?: string): Promise<Workspace> {

    if (CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_PRIVATE_WORKSPACE)) {
      // 일반 유저 - 권한이 있는 경우
      let url = this.API_URL + 'workspaces/my';
      (projection) && ( url = url + '?projection=' + projection );
      return this.get(url);
    } else {
      // 게스트 유저 - 권한이 없는 경우
      return new Promise((resolve, reject) => {
        const params = {
          size: 10,
          page: 0,
          sort: 'name,desc'
        };
        this.getSharedWorkspaces('forListView', params).then(result => {
          let workspace: Workspace = new Workspace();
          if (result && result['_embedded'] && result['_embedded']['workspaces']) {
            const workspaces: Workspace[] = result['_embedded']['workspaces'];
            ( 0 < workspaces.length ) && ( workspace = workspaces[0] );
          }
          resolve(workspace);
        }).catch((err) => reject(err));
      });
    }
  } // function - getMyWorkspace

  // 공유 워크스페이스 조회
  public getSharedWorkspaces(projection: string, params?: any): Promise<Workspaces> {
    let url = this.API_URL + `workspaces/my/public?projection=${projection}`;

    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  // 공유 워크스페이스 조회
  public getSharedFavoriteWorkspaces(projection: string, params?: any): Promise<Workspaces> {
    let url = this.API_URL + `workspaces/my/public?onlyFavorite=true&projection=${projection}`;

    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  // 폴더 조회
  public getFolder(id: string, projection?: string) {
    return this.get(this.API_URL + 'books/' + id + '?projection=' + projection);
  }

  // 폴더 이동
  public changeFolder(bookIds: any, targetId: string) {
    return this.post(this.API_URL + 'books/' + bookIds + '/move/' + targetId, null);
  }

  // 특정 워크스페이스
  public getWorkSpace(workspaceId: string, projection?: string): Promise<any> {
    let url = this.API_URL + 'workspaces/' + workspaceId;
    if (projection) {
      url = url + '?projection=' + projection;
    }
    return this.get(url);
  }

  // 특정 워크스페이스
  public getWorkSpaceAll(params: any, projection: string = 'forListView'): Promise<any> {
    let url = this.API_URL + `workspaces?projection=${projection}`;
    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * 공유워크스페이스 멤버조회
   * @param {string} workspaceId
   * @param {string} type
   * @param {Page} page
   * @returns {Promise<any>}
   */
  public getWorkspaceMembers(workspaceId: string, type: string = 'all', page?: Page): Promise<any> {
    let url: string = this.API_URL + 'workspaces/' + workspaceId + '/members?type=' + type;
    if (page) {
      url += '&' + CommonUtil.objectToUrlString(page);
    }
    return this.get(url);
  } // function - getWorkspaceMembers

  /**
   * 공유워크스페이스 사용자 조회
   * @param {string} workspaceId
   * @param {Page} page
   * @returns {Promise<any>}
   */
  public getWorkspaceUsers(workspaceId: string, page?: Page): Promise<any> {
    return this.getWorkspaceMembers(workspaceId, 'user', page);
  } // function - getWorkspaceUsers

  /**
   * 공유워크스페이스 그룹 조회
   * @param {string} workspaceId
   * @param {Page} page
   * @returns {Promise<any>}
   */
  public getWorkspaceGroups(workspaceId: string, page?: Page): Promise<any> {
    return this.getWorkspaceMembers(workspaceId, 'group', page);
  } // function - getWorkspaceGroups


  // 해당 워크스페이스에 멤버 추가
  public updateWorkspaceUser(workspaceId: string, member: any[]): Promise<any[]> {
    return this.put(this.API_URL + 'workspaces/' + workspaceId + '/members', member);
  }

  // 워크스페이스가 가진 데이터 소스 조회
  public getDataSources(workspaceId: string, params: any, projection: string = 'forListInWorkspaceView'): Promise<any> {
    let url = this.API_URL + 'workspaces/' + workspaceId + '/datasources';
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }

    return this.get(url + '&projection=' + projection);
  }

  // 워크스페이스가 가진 워크북 조회
  public getWorkbooks(workspaceId: string, bookId: string, projection: string): Promise<BookTree> {
    return this.get(this.API_URL + `workspaces/${workspaceId}/books/${bookId}?bookType=workbook&projection=${projection}`);
  }

  // 이동 가능한 워크스페이스 목록 조회
  public getWorkspaceImportAvailable(workbookId: string, params?: { excludes: string }): Promise<any> {
    let url = this.API_URL + `workspaces/import/books/${workbookId}/available`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getWorkspaceImportAvailable

  /**
   * 워크스페이스 생성
   * @param {Workspace} workspace
   * @return {Promise<any>}
   */
  public createWorkspace(workspace: Workspace): Promise<any> {
    return this.post(this.API_URL + 'workspaces', workspace);
  } // function - createWorkspace

  /**
   * 워크스페이스 수정
   * @param {string} workspaceId
   * @param {Workspace} workspace
   * @return {Promise<any>}
   */
  public updateWorkspace(workspaceId: string, workspace: Workspace): Promise<any> {
    return this.patch(this.API_URL + 'workspaces/' + workspaceId, workspace);
  } // function - updateWorkspace

  /**
   * 워크스페이스 삭제
   * @param {string} workspaceId
   * @return {Promise<any>}
   */
  public deleteWorkspace(workspaceId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.permissionService.getWorkspaceCustomRoleSet(workspaceId).then((wsCustomResult: RoleSet) => {
        if (wsCustomResult) {
          // Private RoleSet 삭제 후 워크스페이스 삭제
          this.permissionService.deleteRoleset(wsCustomResult.id).then(() => {
            return this.delete(this.API_URL + 'workspaces/' + workspaceId).then(() => resolve()).catch(err => reject(err));
          });
        } else {
          // 바로 워크스페이스 삭제
          return this.delete(this.API_URL + 'workspaces/' + workspaceId).then(() => resolve()).catch(err => reject(err));
        }
      });
    });
  } // function - deleteWorkspace

  /**
   * 워크스페이스내 RoleSet 변경
   * @param {string} workspaceId
   * @param {string} fromRoleSetName
   * @param {string} toRoleSetName
   * @param mapper
   * @return {Promise<any>}
   */
  public changeRoleSetInWorkspace(workspaceId: string, fromRoleSetName: string, toRoleSetName: string, mapper: any) {
    return this.put(this.API_URL + `workspaces/${workspaceId}/rolesets/${fromRoleSetName}/to/${toRoleSetName}`, mapper);
  } // function - changeRoleSetInWorkspace

  /**
   * 워크스페이스내 RoleSet 삭제
   * @param {string} workspaceId
   * @param {string} roleSetName
   * @return {Promise<any>}
   */
  public deleteRoleSetInWorkspace(workspaceId: string, roleSetName: string) {
    return this.delete(this.API_URL + `workspaces/${workspaceId}/rolesets/${roleSetName}`);
  } // function - deleteRoleSetInWorkspace

  /**
   * 즐겨찾기 등록
   * @param {string} id
   * @return {Promise<any>}
   */
  public setFavorite(id: string) {
    return this.post(this.API_URL + 'workspaces/' + id + '/favorite', id);
  } // function - setFavorite

  /**
   * 즐겨찾기 제거
   * @param {string} id
   * @return {Promise<any>}
   */
  public deleteFavorite(id: string) {
    return this.delete(this.API_URL + 'workspaces/' + id + '/favorite');
  } // function - deleteFavorite

  /**
   * 노트북 서버 설정
   * @param {string} workspaceId
   * @param {string[]} connectorIds
   * @return {Promise<any>}
   */
  public setNotebookServer(workspaceId: string, connectorIds: string[]) {
    const links = connectorIds.map((id) => {
      return id;
    }).join(',');
    return this.post(this.API_URL + `workspaces/${workspaceId}/connectors/${links}`, null);
  } // function - setNotebookServer

  /**
   * 워크스페이스에 등록된 서버 목록 조회
   * @param {string} workspaceId
   * @return {Promise<any>}
   */
  public getNotebookServers(workspaceId: string) {
    return this.get(this.API_URL + `workspaces/${workspaceId}/connectors`);
  } // function - getNotebookServers

  /**
   * 워크스페이스에 사용가능한 커넥션 목록 조회
   * @param {string} workspaceId
   * @param params
   * @returns {Promise<any>}
   */
  public getConnections(workspaceId: string, params: any) {
    let url = this.API_URL + `workspaces/${workspaceId}/connections`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * 어드민 > 워크스페이스 전체 목록조회
   * @param params
   * @returns {Promise<any>}
   */
  public getWorkspaceByAdmin(params: any) {
    let url = this.API_URL + `workspaces/byadmin`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * 어드민 > 워크스페이스 활성화|비활성화
   * @param {string} workspaceId
   * @param {string} status
   * @returns {Promise<any>}
   */
  public changeWorkspaceStatus(workspaceId: string, status: string): Promise<any> {
    return this.post(this.API_URL + `workspaces/${workspaceId}/activate/${status}`, null);
  }

  /**
   * 워크스페이스 소유 양도
   * @param {string} workspaceId
   * @param {string} userName
   * @return {Promise<any>}
   */
  public transferWorkspaceOwner(workspaceId: string, userName: string): Promise<any> {
    return this.post(this.API_URL + `workspaces/${workspaceId}/delegate/${userName}`, null);
  } // function - transferWorkspaceOwner


  /**
   * 노트북 커넥터 리스트 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getNoteBookConnectorList(workspaceId: string, params: object, projection: string = 'default'): Promise<any> {
    let url = this.API_URL + `workspaces/${workspaceId}/connectors`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 데이터 커넥션 리스트 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getDataConnectionList(workspaceId: string, params: object, projection: string = 'default'): Promise<any> {
    let url = this.API_URL + `workspaces/${workspaceId}/connections`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 어드민 > 워크스페이스 통계 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public getWorkspaceStatistics(workspaceId: string, params: object): Promise<any> {
    let url = this.API_URL + `workspaces/${workspaceId}/statistics`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

}
