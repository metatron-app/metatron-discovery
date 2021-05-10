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

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '@common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import {CommonUtil} from '@common/util/common.util';
import {RoleSet, RoleSetScope} from '@domain/user/role/roleSet';

@Injectable()
export class PermissionService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Role 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Role 목록 조회
   * @param params
   * @return {Promise<any>}
   */
  public getRoles(params?: any): Promise<any> {
    let url = this.API_URL + 'roles?projection=forListView';
    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getRoles

  /**
   * Role 상세 정보 조회
   * @param {string} roleId
   * @return {Promise<any>}
   */
  public getRoleDetail(roleId: string): Promise<any> {
    return this.get(this.API_URL + `roles/${roleId}?projection=forDetailView`);
  } // function - getRoleDetail


  /**
   * Role 내 할당된 사용자 그룹  목록를 조회
   * @param {string} roleId
   * @param {any} params
   * @return {Promise<any>}
   */
  public getAssignedRoleMember(roleId: string, params: any): Promise<any> {
    let url = this.API_URL + `roles/${roleId}/directories`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getAssignedRoleMember

  /**
   * Add/Remove Assigned Role Member
   * @param {string} roleId
   * @param {any} params
   * @return {Promise<any>}
   */
  public addRemoveAssignedRoleMember(roleId: string, params: any): Promise<any> {
    return this.patch(this.API_URL + `roles/${roleId}/directories`, params);
  } // function - addRemoveAssignedRoleMember

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | RoleSet 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Role Set 목록 조회
   * @param params
   * @return {Promise<any>}
   */
  public getRolesets(params?: any): Promise<any> {
    let url = this.API_URL + 'rolesets?projection=forListView';
    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getRolesets

  /**
   * Workspace 자체 퍼미션 정보 조회
   * @param {string} workspaceId
   * @return {Promise<any>}
   */
  public getWorkspaceCustomRoleSet(workspaceId: string): Promise<any> {
    return this.getRolesets({scope: RoleSetScope.PRIVATE, nameContains: workspaceId})
      .then(listResult => {
        if (listResult['_embedded'] && listResult['_embedded']['roleSets']) {
          // 기존 Private RoleSet이 존재할 경우
          const roleSet: RoleSet = listResult['_embedded']['roleSets'][0];
          return Promise.resolve(roleSet);
        } else {
          return Promise.resolve(null);
        }
      });
  } // function - getWorkspaceCustomRoleSet

  /**
   * Role Set 상세 정보 조회
   * @param {string} rolesetId
   * @return {Promise<any>}
   */
  public getRolesetDetail(rolesetId: string): Promise<any> {
    return this.get(this.API_URL + `rolesets/${rolesetId}?projection=forDetailView`);
  } // function - getRolesetDetail

  /**
   * Role Set 생성
   * @param {RoleSet} roleSet
   * @return {Promise<any>}
   */
  public createRoleset(roleSet: RoleSet) {
    return this.post(this.API_URL + 'rolesets', roleSet);
  } // function - createRoleset

  /**
   * Role Set 수정
   * @param {string} roleSetId
   * @param {any} params
   * @return {Promise<any>}
   */
  public updateRoleset(roleSetId: string, params: any) {
    return this.put(this.API_URL + `rolesets/${roleSetId}`, params);
  } // function - updateRoleset

  /**
   *
   * @param {string} roleSetId
   */
  public copyRoleset(roleSetId: string) {
    return this.post(this.API_URL + `rolesets/${roleSetId}/copy`, null);
  } // function - copyRoleset

  /**
   * Role Set 삭제
   * @param {string} roleSetId
   * @return {Promise<any>}
   */
  public deleteRoleset(roleSetId: string) {
    return this.delete(this.API_URL + `rolesets/${roleSetId}`);
  } // function - deleteRoleset

  /**
   * Role set 수정 (이름과 설명만 적용)
   * @param {string} roleSetId
   * @param params
   * @returns {Promise<any>}
   */
  public updateNameAndDescRoleset(roleSetId: string, params: any) {
    return this.patch(this.API_URL + `rolesets/${roleSetId}`, params);
  } // function - updateRoleset

  /**
   * RoleSet 별 워크스페이스 목록 조회
   * @param {string} roleSetId
   * @param params
   * @return {Promise<any>}
   */
  public getWorkspacesByRoleSet(roleSetId: string, params: any) {
    let url = this.API_URL + `rolesets/${roleSetId}/workspaces?projection=forSimpleListView`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getWorkspacesByRoleSet

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Permission 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 유저 권한 조회
   * @param {string} domain
   * @return {Promise<any>}
   */
  public getPermissions(domain: string): Promise<any> {
    return this.get(this.API_URL + 'auth/' + domain + '/permissions');
  } // function - getPermissions

  /**
   * 유저 권한 체크
   * @param {string} domain
   * @param {string} permission
   * @return {Promise<boolean>}
   */
  public getPermissionCheck(domain: string, permission: string): Promise<boolean> {
    return this.get(this.API_URL + 'auth/' + domain + '/permissions/check?permissions=' + permission)
      .then(response => Promise.resolve((response && response['hasPermission'])))
      .catch(() => Promise.resolve(false));
  } // function - getPermissionCheck

}
