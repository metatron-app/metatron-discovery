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

import {Component, ElementRef, HostListener, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {RoleSet} from '@domain/user/role/roleSet';
import {Role} from 'app/domain/user/role/role';
import {PermissionService} from '../../../user/service/permission.service';
import * as _ from 'lodash';
import {CommonUtil} from 'app/common/util/common.util';
import {WORKSPACE_PERMISSION} from 'app/common/permission/permission';
import {Alert} from '@common/util/alert.util';

@Component({
  selector: 'app-permission-schema',
  templateUrl: './permission-schema.component.html',
})
export class PermissionSchemaComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // RoleSet 정보
  public editRoleSet: RoleSet;

  public errorMsg: string = '';

  @Input('roleSet')
  set setRoleSet(roleSet: RoleSet) {
    if (roleSet.roles && 0 < roleSet.roles.length) {
      roleSet.roles.forEach((role: Role) => {
        role['orgName'] = role.name; // mapper 설정을 위해 orgName 설정
        if (role.permissions && 0 < role.permissions.length) {
          role.permissionNames = role.permissions.map(item => {
            return (item.name ? item.name : item) as string;
          });
        }
      });
    } else {
      roleSet = this._getBasicRoleSet(roleSet);
    }
    this.editRoleSet = _.cloneDeep(roleSet);
    this.editRoleSet.removeRoleNames = [];
    this.changeDetect.markForCheck();
  } // function - setRoleSet

  @Input() public editMode: boolean = true;   // 수정 모드 여부
  @Input() public desc: boolean = true;       // 설명 표시 여부
  @Input() public useAPI: boolean = true;      // API 사용 여부

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private permissionService: PermissionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  @HostListener('click', ['$event.target'])
  public clickOther(target) {
    this.errorMsg = '';
    this.editRoleSet.roles.forEach(item => delete item['error']);
    const $eventTarget: JQuery = $(target);
    if (!$eventTarget.hasClass('ddp-txt-edit') && 0 === $eventTarget.closest('.ddp-txt-edit').length) {
      this.editRoleSet.roles.forEach(item => this.resetRoleName(item));
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Role 추가
   */
  public addRole() {
    const role: Role = new Role();
    role.name = 'new role';
    role['isNewRole'] = true;
    role['editName'] = 'new role';
    role.defaultRole = (0 === this.editRoleSet.roles.length); // 무조건 하나의 Role 을 Default로 선정해준다.
    this.editRoleSet.roles.push(role);
  } // function - addRole

  /**
   * Role 삭제
   * @param {number} removeIdx
   */
  public removeRole(removeIdx: number) {
    if (this.isNullOrUndefined(this.editRoleSet.roles[removeIdx]['isNewRole'])) {
      // 삭제 RoleSet 이름 저장
      this.editRoleSet.removeRoleNames.push(this.editRoleSet.roles[removeIdx].name);
    }
    // Role 삭제
    (-1 < removeIdx) && (this.editRoleSet.roles.splice(removeIdx, 1));
    // 무조건 하나의 Role 을 Default 로 선정해준다.
    (1 === this.editRoleSet.roles.length) && (this.editRoleSet.roles[0].defaultRole = true);
  } // function - removeRole

  /**
   * Role 이름 설정 ( 키보드에 의해 ... )
   * @param {KeyboardEvent} event
   * @param {Role} role
   */
  public setRoleNameByKeyboard(event: KeyboardEvent, role: Role) {
    if (13 === event.keyCode) {
      this.setRoleName(role);
    } else if (27 === event.keyCode) {
      this.resetRoleName(role);
    }
  } // function - setRoleNameByKeyboard

  /**
   * Role 이름 설정
   * @param {Role} role
   */
  public setRoleName(role: Role) {
    role.name = role['editName'];
    role['edit'] = false;
  } // function - setRoleName

  /**
   * Role 이름 되돌림
   * @param {Role} role
   */
  public resetRoleName(role: Role) {
    role['editName'] = role.name;
    role['edit'] = false;
  } // function - resetRoleName

  /**
   * 유효한 퍼미션 여부 체크
   * @param {Role} role
   * @param {string} permKey
   */
  public checkValidPerm(role: Role, permKey: string) {
    if (role.permissionNames) {
      return -1 !== role.permissionNames.indexOf(permKey);
    } else {
      return false;
    }
  } // function - checkValidPerm

  /**
   * 퍼미션 적용 여부 전환
   * @param {Role} role
   * @param {string} permKey
   */
  public togglePerm(role: Role, permKey: string) {
    if (this.editMode) {
      let isAdd: boolean;
      if (role.permissionNames) {
        const permIdx: number = role.permissionNames.indexOf(permKey);
        if (-1 === permIdx) {
          role.permissionNames.push(permKey);
          isAdd = true;
        } else {
          role.permissionNames.splice(permIdx, 1);
          role.permissionNames = role.permissionNames.filter(perm => perm !== permKey);
          isAdd = false;
        }
      } else {
        role.permissionNames = [permKey];
        isAdd = true;
      }

      // permission dependency 체크
      role.permissionNames = this._setPermissionDependency(role.permissionNames, isAdd);
    }
  } // function - togglePerm

  /**
   * defaultRole 체크 클릭 ( 수정모드일때만 동작 )
   * @param idx
   */
  public clickDefaultRole(idx: number) {
    if (this.editMode) {
      this.editRoleSet.roles.forEach((item, index) => {
        item.defaultRole = (index === idx);
      });
    }
  } // function - clickDefaultRole

  /**
   * RoleSet 설정 ( Create/Update )
   * @param {string} newRoleSetName
   * @param {string} newRoleSetDesc
   * @return {Promise<any>}
   */
  public setRoleSets(newRoleSetName?: string, newRoleSetDesc?: string): Promise<any> {
    const roleSet: RoleSet = this.editRoleSet;
    const roles: Role[] = roleSet.roles;

    // 유효성 체크
    if (roles && 0 < roles.length) {
      let isSetDefault: boolean = false;
      let prevName: string = '';
      for (let idx = 0, nMax = roles.length; idx < nMax; idx++) {

        if ('' === roles[idx].name.trim()) {
          // check - 이름이 설정되지 않은 role
          const errMsg: string = this.translateService.instant('msg.permission.alert.no-name');
          roles[idx]['error'] = true;
          this.errorMsg = errMsg;
          this.loadingHide();
          Alert.fail(this.translateService.instant('msg.comm.alert.error'));
          return Promise.reject(errMsg);
        }
        if (prevName === roles[idx].name.trim()) {
          // check - 이름이 중복된 role
          const errMsg: string = this.translateService.instant('msg.permission.alert.duplicate-name');
          roles[idx]['error'] = true;
          this.errorMsg = errMsg;
          this.loadingHide();
          Alert.fail(this.translateService.instant('msg.comm.alert.error'));
          return Promise.reject(errMsg);
        }
        if (!roles[idx].permissionNames || 1 > roles[idx].permissionNames.length) {
          // check - 퍼미션이 정의되지 않은 role
          const errMsg: string = this.translateService.instant('msg.permission.alert.require-perm');
          roles[idx]['error'] = true;
          this.errorMsg = errMsg;
          this.loadingHide();
          Alert.fail(this.translateService.instant('msg.comm.alert.error'));
          return Promise.reject(errMsg);
        }

        (isSetDefault) || (isSetDefault = roles[idx].defaultRole);
        prevName = roles[idx].name.trim();
      }
      if (!isSetDefault) {
        const errMsg: string = this.translateService.instant('msg.permission.alert.require-default');
        this.errorMsg = errMsg;
        this.loadingHide();
        Alert.fail(this.translateService.instant('msg.comm.alert.error'));
        return Promise.reject(errMsg);
      }
    } else {
      const errMsg: string = this.translateService.instant('msg.permission.alert.require-role');
      this.errorMsg = errMsg;
      this.loadingHide();
      Alert.fail(this.translateService.instant('msg.comm.alert.error'));
      return Promise.reject(errMsg);
    }

    // 등록 실행
    return new Promise((resolve, reject) => {
      if (this.useAPI && this.isPermissionManager()) {  // RoleSet 생성/변경

        // 파라메터 설정
        const params = RoleSet.convertRoleSetToParam(roleSet);

        // 서비스 호출
        if (roleSet.id) {
          (newRoleSetName) && (roleSet.name = newRoleSetName);
          (newRoleSetDesc) && (roleSet.description = newRoleSetDesc);
          this.permissionService.updateRoleset(roleSet.id, params).then(result => {
            resolve(result);
          }).catch(err => {
            this.commonExceptionHandler(err);
            reject(err);
          });
        } else {
          params.name = newRoleSetName ? newRoleSetName : CommonUtil.getUUID();
          (newRoleSetDesc) && (params.description = newRoleSetDesc);
          this.permissionService.createRoleset(params as RoleSet).then(result => {
            resolve(result);
          }).catch(err => {
            this.commonExceptionHandler(err);
            reject(err);
          });
        }
      } else {    // 현재 정보 반환
        resolve(roleSet);
      }
    });
  } // function - setRoleSets

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 퍼미션간 의존성을 적용하여 퍼미션 목록을 반환한다
   * @param {string[]} permNames
   * @param {boolean} isAdd
   * @return {string[]}
   * @private
   */
  private _setPermissionDependency(permNames: string[], isAdd: boolean): string[] {

    const perms: string[][] = [
      [
        WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBOOK.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBOOK.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_WORKBOOK.toString()
      ],
      [
        WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_NOTEBOOK.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_NOTEBOOK.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_NOTEBOOK.toString()
      ],
      [
        WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBENCH.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBENCH.toString(),
        WORKSPACE_PERMISSION.PERM_WORKSPACE_VIEW_WORKBENCH.toString()
      ]
    ];

    if (isAdd) {
      // 추가
      for (let idx0 = 0; idx0 < 3; idx0++) {
        for (let idx1 = 0; idx1 < 3; idx1++) {
          if (-1 < permNames.indexOf(perms[idx0][idx1])) {
            for (let idx2 = idx1; idx2 < 3; idx2++) {
              if (-1 === permNames.indexOf(perms[idx0][idx2])) {
                permNames.push(perms[idx0][idx2]);
              }
            } // end if - 하위 퍼미션 loop
          }
        } // end if - 각 영역별 퍼미션 loop
      } // end if - 각 영역별 loop
    } else {
      // 제거
      for (let idx0 = 0; idx0 < 3; idx0++) {
        for (let idx1 = 2; idx1 >= 0; idx1--) {
          if (-1 === permNames.indexOf(perms[idx0][idx1])) {
            for (let idx2 = idx1; idx2 >= 0; idx2--) {
              if (-1 < permNames.indexOf(perms[idx0][idx2])) {
                permNames = permNames.filter(perm => perm !== perms[idx0][idx2]);
              }
            } // end if - 하위 퍼미션 loop
          }
        } // end if - 각 영역별 퍼미션 loop
      } // end if - 각 영역별 loop
    }

    return permNames;

    // Edit any 는 Create 가 클릭되었을때만 클릭되도록 체크하는 기능
    // return permNames.filter(perm => {
    //   switch (perm) {
    //     case WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBOOK.toString() :
    //       return -1 < permNames.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBOOK.toString());
    //     case WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_NOTEBOOK.toString() :
    //       return -1 < permNames.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_NOTEBOOK.toString());
    //     case WORKSPACE_PERMISSION.PERM_WORKSPACE_MANAGE_WORKBENCH.toString() :
    //       return -1 < permNames.indexOf(WORKSPACE_PERMISSION.PERM_WORKSPACE_EDIT_WORKBENCH.toString());
    //     default:
    //       return true;
    //   }
    // });
  } // function - _setPermissionDependency

  /**
   * 기존 RoleSet 을 정의한다.
   * @param {RoleSet} definedRoleSet
   * @return {RoleSet}
   * @private
   */
  private _getBasicRoleSet(definedRoleSet?: RoleSet): RoleSet {
    if (definedRoleSet) {
      definedRoleSet.roles.push(RoleSet.getDefaultRole());
      return definedRoleSet;
    } else {
      return new RoleSet();
    }
  } // function - _getBasicRoleSet

}
