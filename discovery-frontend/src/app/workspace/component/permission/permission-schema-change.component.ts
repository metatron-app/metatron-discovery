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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Workspace} from '@domain/workspace/workspace';
import {RoleSet, RoleSetScope} from '@domain/user/role/roleSet';
import {PermissionService} from '../../../user/service/permission.service';
import {Role} from '@domain/user/role/role';
import {WorkspaceService} from '../../service/workspace.service';
import {AbstractComponent} from '@common/component/abstract.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {PermissionSchemaSetComponent} from './permission-schema-set.component';
import * as _ from 'lodash';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {SYSTEM_PERMISSION} from '@common/permission/permission';

@Component({
  selector: 'app-permission-schema-change',
  templateUrl: './permission-schema-change.component.html',
})
export class PermissionSchemaChangeComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 퍼미션 스키마 설정 컴포넌트
  @ViewChild(PermissionSchemaSetComponent)
  private _permissionSchemaSetComp: PermissionSchemaSetComponent;

  private _workspace: Workspace;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 화면 처리 T/F
  public isShow: boolean = false;             // 컴포넌트 화면 표시 여부
  public isShowRoleSetList: boolean = false;   // RoleSet 옵션 표시 여부

  // 현재 워크스페이스에 적용된 RoleSet
  public currentRoleSet: RoleSet;

  // Role & RoleSet
  public roleSetList: RoleSet[] = [];       // RoleSet 목록
  public selectedRoleSetInfo: RoleSet;      // RoleSet 선택 정보
  public selectedRoleSetDetail: RoleSet;    // 선택된 RoleSet 상세 정보

  public isPermSchemaEditMode: boolean = false;  // 퍼미션 스키마 수정 가능 여부
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              protected permissionService: PermissionService,
              protected workspaceService: WorkspaceService,
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public init(workspace: Workspace, currentRoleSet: RoleSet) {
    this._workspace = workspace;
    this.currentRoleSet = currentRoleSet;

    // 데이터 초기화
    this.isShowRoleSetList = false;       // RoleSet 옵션 표시 여부
    this.roleSetList = [];                // RoleSet 목록
    this.selectedRoleSetInfo = null;      // RoleSet 선택 정보
    this.selectedRoleSetDetail = null;    // 선택된 RoleSet 상세 정보

    this._loadRoleSets().then(() => {
      this.changeDetect.markForCheck();
      this.isShow = true;
    });
  } // function - init

  /**
   * 컴포넌트 닫기
   */
  public close() {
    this.isShow = false;
  } // function - close

  /**
   * 퍼미션 변경 완료 및 컴포넌트 닫기
   */
  public done() {
    if (this.selectedRoleSetDetail.id) {
      this._changeRoleSetInWorkspace();
    } else {
      const params = this.selectedRoleSetDetail.getRequestParam();
      this.permissionService.createRoleset(params).then((result) => {
        this.selectedRoleSetDetail = result;
        this._changeRoleSetInWorkspace();
      });
    }
  } // function - done

  /**
   * RoleSet 이름 조회
   * @param {RoleSet} roleSet
   * @return {string}
   */
  public getRoleSetName(roleSet: RoleSet) {
    return (RoleSetScope.PRIVATE === roleSet.scope) ? this.translateService.instant('msg.permission.ui.custom-schema') : roleSet.name;
  } // function - getRoleSetName

  /**
   * Role 콤보박스 클릭 이벤트
   * @param {Role} role
   */
  public clickRoleSelectbox(role: Role) {
    role['isOpenNewRoleOpts'] = !role['isOpenNewRoleOpts'];
    this.currentRoleSet.roles.forEach((item: Role) => {
      if (item.name !== role.name) {
        item['isOpenNewRoleOpts'] = false;
      }
    });
  } // function - clickRoleSelectbox

  /**
   * RoleSet 선택
   * @param {RoleSet} item
   */
  public selectRoleSet(item: RoleSet) {
    if (this.currentRoleSet.name !== item.name) {
      this.selectedRoleSetInfo = item;
      if (RoleSetScope.PRIVATE === item.scope) {
        // 워크스페이스 정의 RoleSet 조회
        this.permissionService.getWorkspaceCustomRoleSet(this._workspace.id).then((wsCustomResult: RoleSet) => {
          if (wsCustomResult) {
            // 기존 Private RoleSet이 존재할 경우
            this.permissionService.getRolesetDetail(wsCustomResult.id).then(itemResult => {
              const customRoleSet: RoleSet = itemResult;
              customRoleSet.scope = RoleSetScope.PRIVATE;
              this.selectedRoleSetDetail = customRoleSet;
              this.isPermSchemaEditMode = true;
            }).catch(err => this.commonExceptionHandler(err));
          } else {
            // 기존 Private RoleSet이 없을 경우
            const customRoleSet: RoleSet = new RoleSet();
            customRoleSet.name = this._workspace.id;
            customRoleSet.description = this._workspace.name;
            this.selectedRoleSetDetail = customRoleSet;
            this.isPermSchemaEditMode = true;
          }
        })
      } else {
        // 관리자 정의 RoleSet 조회
        this.permissionService.getRolesetDetail(item.id).then(result => {
          this.selectedRoleSetDetail = result;
          this.selectedRoleSetDetail.scope = RoleSetScope.PUBLIC;
          this.isPermSchemaEditMode = false;
        }).catch(err => this.commonExceptionHandler(err));
      }
    }
  } // function - selectRolSet

  /**
   * 퍼미션 설정 팝업 오픈
   */
  public onClickOpenPermissionSchemaSet() {
    const cloneRoleSet: RoleSet = _.cloneDeep(this.selectedRoleSetDetail);
    this._permissionSchemaSetComp.init(cloneRoleSet, true, true);
  } // function - onClickOpenPermissionSchemaSet

  /**
   * 퍼미션 설정 완료 후 작업 - 상세 정보 재조회
   */
  public afterUpdatePermissionRoles(roleSet: RoleSet) {
    this.permissionService.getRolesetDetail(roleSet.id).then(result => {
      if (result) {
        const customRoleSet: RoleSet = result;
        customRoleSet.scope = RoleSetScope.PRIVATE;
        this.selectedRoleSetDetail = customRoleSet;
        this.isPermSchemaEditMode = true;
      }
    });
  } // function - onClickOpenPermissionSchemaSet

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * RoleSet 목록 조회
   * @return {Promise<any>}
   * @private
   */
  private _loadRoleSets(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadingShow();
      const params = {
        page: this.page.page,
        size: 1000,
        sort: this.page.sort,
        scope: RoleSetScope.PUBLIC
      };
      this.permissionService.getRolesets(params).then(result => {
        if (result && result['_embedded']) {
          let roleSetList: RoleSet[] = result['_embedded']['roleSets'];
          roleSetList = roleSetList.filter(item => item.name !== this.currentRoleSet.name);
          if (CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_WORKSPACE)
            && RoleSetScope.PUBLIC === this.currentRoleSet.scope) {
            const privateRoleSet: RoleSet = new RoleSet();
            privateRoleSet.name = this.translateService.instant('msg.permission.ui.custom-schema');
            roleSetList.push(privateRoleSet);
          }
          this.roleSetList = roleSetList;
        }
        resolve(null);
        this.loadingHide();
      }).catch(err => {
        this.commonExceptionHandler(err);
        reject();
      });
    });
  } // function - _loadRoleSets

  /**
   * 워크스페이스 RoleSet 변경
   * @private
   */
  private _changeRoleSetInWorkspace() {
    try {
      this.loadingShow();
      // Role 변환 Mapper 설정
      const changeRoleMapper = {};
      this.currentRoleSet.roles.forEach((item: Role) => {
        if (item['newRole']) {
          changeRoleMapper[item.name] = item['newRole']['name'];
        } else {
          throw new Error('모든 Role은 변경할 Role을 지정해주어야 합니다.');
        }
      });
      // RoleSet 변경 호출
      this.workspaceService.changeRoleSetInWorkspace(
        this._workspace.id, this.currentRoleSet.name, this.selectedRoleSetDetail.name, changeRoleMapper)
        .then(() => {
          this.broadCaster.broadcast('CHANGE_WORKSPACE_PERMS_SCHEMA', {
            id: this.selectedRoleSetDetail.id
          });
          this.loadingHide();
          this.close();
        })
        .catch(err => this.commonExceptionHandler(err));
    } catch (err) {
      Alert.error(err);
      this.loadingHide();
    }
  } // function - _changeRoleSetInWorkspace

}
