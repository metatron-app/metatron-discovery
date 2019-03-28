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

import {
  Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { PublicType, Workspace } from '../../../domain/workspace/workspace';
import { CommonUtil } from 'app/common/util/common.util';
import { Alert } from '../../../common/util/alert.util';
import { WorkspaceService } from '../../service/workspace.service';
import { PermissionService } from '../../../user/service/permission.service';
import { RoleSet, RoleSetScope } from '../../../domain/user/role/roleSet';
import { PermissionSchemaComponent } from '../permission/permission-schema.component';
import { AbstractComponent } from '../../../common/component/abstract.component';
import * as _ from 'lodash';
import { PermissionSchemaSetComponent } from '../permission/permission-schema-set.component';

@Component({
  selector: 'app-create-workspace',
  templateUrl: './create-workspace.component.html',
})
// 공용 워크스페이스 생성
export class CreateWorkspaceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _docOverflow: string;  // 화면 불러오기 시 이전에 설정된 overflow 값

  // 퍼미션 스키마 컴포넌트
  @ViewChild(PermissionSchemaComponent)
  private _permSchemaComp: PermissionSchemaComponent;

  // 퍼미션 스키마 설정 컴포넌트
  @ViewChild(PermissionSchemaSetComponent)
  private _permissionSchemaSetComp: PermissionSchemaSetComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public createComplete = new EventEmitter();

  public isShow: boolean = false;
  public shareWorkspace: Workspace;

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 유효성 관련 - 설명
  public isInvalidDesc: boolean = false;
  public errMsgDesc: string = '';

  public isShowPredefinedRoleSetList: boolean = false;
  public isShowCustomRoleSetList: boolean = false;
  public isUseCustomRoleSet: boolean = false;

  // Role & RoleSet
  public roleSetList: RoleSet[] = [];       // RoleSet 목록
  public selectedRoleSetInfo: RoleSet;      // RoleSet 선택 정보
  public selectedRoleSetDetail: RoleSet;    // 선택된 RoleSet 상세 정보

  get disableCreateWorkspace() {
    return this.isInvalidName || this.isInvalidDesc
      || !this.shareWorkspace.name || '' === this.shareWorkspace.name
      || !this.selectedRoleSetDetail;
  } // get - disableCreateWorkspace

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workbookService: WorkspaceService,
              protected permissionService: PermissionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
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
    $(document.body).css('overflow', this._docOverflow);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - 공통 및 워크스페이스 관련
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 시작점
  public init() {
    // 초기 hidden 처리
    this._docOverflow = $(document.body).css('overflow');
    $(document.body).css('overflow', 'hidden');

    // 데이터 초기화
    this.roleSetList = [];                // RoleSet 목록
    this.selectedRoleSetInfo = null;      // RoleSet 선택 정보
    this.selectedRoleSetDetail = null;    // 선택된 RoleSet 상세 정보
    this.isShowPredefinedRoleSetList = false;
    this.isShowCustomRoleSetList = false;
    this.isUseCustomRoleSet = false;

    this._loadRoleSets().then(() => {
      this.shareWorkspace = new Workspace();
      this.isShow = true;
    });

  } // function - init

  // 닫기
  public close() {
    $(document.body).css('overflow', this._docOverflow);
    this.isShow = false;
  }

  /**
   * 컴포넌트 자체 클릭 이벤트
   * @param {MouseEvent} event
   */
  public clickComponent(event: MouseEvent) {
    event.stopPropagation();
    const $eventTarget: any = $(event.target);
    if (!$eventTarget.hasClass('ddp-type-selectbox') && 0 === $eventTarget.closest('.ddp-type-selectbox').length) {
      this.isShowCustomRoleSetList = false;
      this.isShowPredefinedRoleSetList = false;
    }
  } // function - clickComponent

  /**
   * RoleSet 선택
   * @param {RoleSet} item
   * @param {boolean} isCustom
   */
  public selectRoleSet(item: RoleSet, isCustom: boolean = false) {
    this.selectedRoleSetInfo = item;
    this.permissionService.getRolesetDetail(item.id).then((result: RoleSet) => {
      if (isCustom) {
        // Custom에서 신규 모드로 무조건 생성하기 위해. 아이디 정보를 지운다.
        delete result.id;
        delete result.name;
        result.scope = RoleSetScope.PRIVATE;
      }
      this.selectedRoleSetDetail = result;
    }).catch(err => this.commonExceptionHandler(err));
  } // function - selectRolSet

  /**
   * 공유 워크스페이스 생성
   */
  public createShareWorkspace() {

    if( this.disableCreateWorkspace ) {
      return;
    }

    this.shareWorkspace.name = this.shareWorkspace.name ? this.shareWorkspace.name.trim() : '';
    if (this.shareWorkspace.name == null || this.shareWorkspace.name.length === 0) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    }

    // 이름 길이 체크
    if (CommonUtil.getByte(this.shareWorkspace.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }

    // 설명 길이 체크
    if (this.shareWorkspace.description != null
      && CommonUtil.getByte(this.shareWorkspace.description.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }

    this.loadingShow();

    this.shareWorkspace.publicType = PublicType.SHARED;

    // RoleSet 정보 저장
    this._permSchemaComp.setRoleSets(this.shareWorkspace.id, this.shareWorkspace.name).then((roleSet: RoleSet) => {

      const createParam: any = _.cloneDeep(this.shareWorkspace);
      createParam['roleSets'] = ['/api/rolesets/' + roleSet.id];

      // 워크스페이스 생성
      this.workbookService.createWorkspace(createParam).then((workspace: Workspace) => {
        this.loadingHide();
        Alert.success(`'${this.shareWorkspace.name}' ` + this.translateService.instant('msg.space.alert.create.workspace.success'));
        this.close();
        this.createComplete.emit(workspace.id);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.create.workspace.fail'));
        this.loadingHide();
      });
    });

  } // function - createShareWorkspace

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Role & RoleSet 관련 함수
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * RoleSet Type 변경
   * @param {boolean} isCustom
   */
  public changeRoleSetType(isCustom: boolean) {
    this.isUseCustomRoleSet = isCustom;
    this.selectedRoleSetInfo = null;
    if (isCustom) {
      this.selectedRoleSetDetail = new RoleSet();
    } else {
      this.selectedRoleSetDetail = null;
      this.selectRoleSet( this.roleSetList[0], false );
    }
  } // function - changeRoleSetType

  /**
   * 사전정의 RoleSet 옵션 펼침
   */
  public openPredefinedRoleSetOpts() {
    this.isUseCustomRoleSet = false;
    this.isShowCustomRoleSetList = false;
    this.isShowPredefinedRoleSetList = !this.isShowPredefinedRoleSetList;
  } // function - openPredefinedRoleSetOpts

  /**
   * 커스텀 RoleSet 옵션 펼침
   */
  public openCustomRoleSetOpts() {
    this.isUseCustomRoleSet = true;
    this.isShowPredefinedRoleSetList = false;
    this.isShowCustomRoleSetList = !this.isShowCustomRoleSetList;
  } // function - openCustomRoleSetOpts

  /**
   * 퍼미션 설정 팝업 오픈
   */
  public onClickOpenPermissionSchemaSet() {
    const cloneRoleSet: RoleSet = _.cloneDeep(this.selectedRoleSetDetail);
    this._permissionSchemaSetComp.init(cloneRoleSet, true, false);
  } // function - onClickOpenPermissionSchemaSet

  public afterUpdatePermissionRoles(roleset:RoleSet) {
    this.selectedRoleSetDetail = roleset;
  } // function - afterUpdatePermissionRoles

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
          this.roleSetList = result['_embedded']['roleSets'];
          this.selectRoleSet( this.roleSetList[0], false );
        }
        resolve();
        this.loadingHide();
      }).catch(err => {
        this.commonExceptionHandler(err);
        reject();
      });
    });
  } // function - _loadRoleSets

}
