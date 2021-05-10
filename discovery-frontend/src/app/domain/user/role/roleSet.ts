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

import {AbstractHistoryEntity} from '../../common/abstract-history-entity';
import {Workspace} from '../../workspace/workspace';
import {Role} from './role';
import {WORKSPACE_PERMISSION} from '@common/permission/permission';

export class RoleSet extends AbstractHistoryEntity {

  constructor() {
    super();
    this.scope = RoleSetScope.PRIVATE;
    this.predefined = false;
    this.readOnly = false;
    this.roles.push(RoleSet.getDefaultRole());
  }

  public id: string;
  public name: string;
  public description: string;
  public scope: RoleSetScope;      // RoleSet 범위(Workspace 내 PRIVATE, 공통 사용가능한 PUBLIC)
  public linkedWorkspaces: number;
  public workspaces: Workspace[] = [];
  public roles: Role[] = [];
  public predefined: boolean;
  public readOnly: boolean;

  // for UI
  public removeRoleNames: string[] = [];

  /**
   * RoleSet 의 기본롤 정보 ( 매니저 ) 를 생성함
   * @return {Role}
   */
  public static getDefaultRole(): Role {
    const managerRole: Role = new Role();
    managerRole.name = 'Manager';
    managerRole['editName'] = 'Manager';
    managerRole.defaultRole = true;
    managerRole.permissionNames = [];
    for (const key in WORKSPACE_PERMISSION) {
      if (key) {
        managerRole.permissionNames.push(WORKSPACE_PERMISSION[key]);
      }
    }
    return managerRole;
  } // function - getDefaultRole

  /**
   * RoleSet을 Param으로 변환한다.
   * @param {RoleSet} roleSet
   * @return {any}
   */
  public static convertRoleSetToParam(roleSet: RoleSet): any {
    const mapper: any = {};
    const param = {
      name: roleSet.name,
      description: roleSet.description,
      scope: roleSet.scope,
      roles: roleSet.roles.map((item: Role) => {
        // 이름 변경된 Role에 대한 Mapper 설정
        (item['orgName'] && item['orgName'] !== item.name) && (mapper[item['orgName']] = item.name);
        return {
          name: item.name,
          defaultRole: item.defaultRole,
          permissionNames: item.permissionNames
        };
      })
    };
    // 삭제된 Role에 대한 Mapper 설정
    if (0 < roleSet.removeRoleNames.length) {
      const defaultRole: Role = roleSet.roles.find(item => item.defaultRole);
      roleSet.removeRoleNames.forEach(item => mapper[item] = defaultRole.name);
    }
    // 맵퍼 파라메터 추가 판단
    (0 < Object.keys(mapper).length) && (param['mapper'] = mapper);
    return param;
  } // function - convertRoleSetToParam

  /**
   * 현재 RoleSet 에 대한 RequestParam을 얻는다.
   * @return {any}
   */
  public getRequestParam(): any {
    return {
      name: this.name,
      description: this.description,
      scope: this.scope,
      roles: this.roles.map((item: Role) => {
        return {
          name: item.name,
          defaultRole: item.defaultRole,
          permissionNames: item.permissionNames
        };
      })
    };
  } // function - getRequestParam
}

export enum RoleSetScope {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}
