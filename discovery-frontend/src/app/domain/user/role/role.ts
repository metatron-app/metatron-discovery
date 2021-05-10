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

import {Permission} from './permission';
import {RoleSet} from './roleSet';
import {AbstractHistoryEntity} from '../../common/abstract-history-entity';
import {User} from '../user';

export class Role extends AbstractHistoryEntity {
  public id: string;
  public name: string;
  public description: string;
  public scope: RoleScope;
  public predefined: boolean;
  public adminRole: boolean;     // Workspace 내 RoleSet 에 포함된 경우, Admin. Role 인 경우
  public defaultRole: boolean;   // Workspace 내 RoleSet 에 포함된 경우, Default Role 인 경우
  public refRole: string;
  public cntMembers: number;
  public permissions: Permission[] = [];
  public users: User[] = [];
  public roleSet: RoleSet;
  public permissionNames: string[] = [];
  public userCount: number;
  public groupCount: number;

  // for UI
  // orgName -> roleSet, permission-schema.component.ts 에서 사용
}

export enum RoleScope {
  GLOBAL = 'GLOBAL',
  WORKSPACE = 'WORKSPACE'
}

export enum RoleType {
  USER = 'USER',
  GROUP = 'GROUP'
}
