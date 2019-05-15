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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '../../../../user/service/permission.service';
import { RoleSet } from '../../../../domain/user/role/roleSet';
import { Alert } from '../../../../common/util/alert.util';
import { Modal } from '../../../../common/domain/modal';
import { Location } from "@angular/common";
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { isUndefined } from 'util';
import { CommonUtil } from '../../../../common/util/common.util';
import { PermissionSchemaSetComponent } from '../../../../workspace/component/permission/permission-schema-set.component';
import * as _ from 'lodash';
import { Page } from '../../../../domain/common/page';
import { Workspace } from '../../../../domain/workspace/workspace';

@Component({
  selector: 'app-detail-permission-schema',
  templateUrl: './detail-permission-schema.component.html'
})
export class DetailPermissionSchemaComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공통 확인 팝업
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  // 퍼미션 스키마 설정 컴포넌트
  @ViewChild(PermissionSchemaSetComponent)
  private _permissionSchemaSetComp: PermissionSchemaSetComponent;

  // 스키마 아이디
  private _schemaId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 스키마 상세정보 데이터
  public roleSet: RoleSet;

  // RoleSet 에 연결된 워크스페이스 목록
  public firstWorkspace: Workspace;
  public otherWorkspaces: Workspace[] = [];
  public totalWsCnt:number = 0;

  // 스키마 이름 수정
  public editName: string;
  // 스키마 설명 수정
  public editDesc: string;
  // 스키마 이름 수정 플래그
  public editNameFl: boolean;
  // 스키마 설명 수정 플래그
  public editDescFl: boolean;

  // 워크스페이스 목록 패널 펼침 여부
  public isOpenWorkspaceList: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private permissionService: PermissionService,
              private activatedRoute: ActivatedRoute,
              private _location:Location,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    // url에서 schema id 받아오기
    this.activatedRoute.params.subscribe((params) => {
      // schemaId
      this._schemaId = params['schemaId'];
      // ui init
      this._initView();
      // 퍼미션 스키마 상세정보 및 연관 워크스페이스 목록 조회
      this._getPermissionSchemaDetail(this._schemaId);
    });
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * modal 이벤트 후 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    modal.data === 'CLONE' ? this._clonePermissionSchema(modal['schemaId']) : this._deletePermissionSchema(modal['schemaId']);
  }

  /**
   * 스키마 이름 변경모드
   */
  public schemaNameEditMode(): void {
    if( !this.roleSet.readOnly ) {
      // 현재 그룹 이름
      this.editName = this.roleSet.name;
      // flag
      this.editNameFl = true;
    }
  } // function - schemaNameEditMode

  /**
   * 스키마 설명 변경모드
   */
  public schemaDescEditMode(): void {
    if( !this.roleSet.readOnly ) {
      // 현재 그룹 설명
      this.editDesc = this.roleSet.description;
      // flag
      this.editDescFl = true;
    }
  } // function - schemaDescEditMode

  /**
   * 스키마 이름 수정
   */
  public updateSchemaName(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // validation
    if (this._nameValidation()) {
      const params = {
        name: this.editName
      };
      // 로딩 show
      this.loadingShow();
      // 스키마 수정
      this._updateSchema(params).then(() => {
        // alert

        // flag
        this.editNameFl = false;
        // 스키마 정보 재조회
        this._getPermissionSchemaDetail(this._schemaId);
      }).catch((error) => {
        // 로딩 hide
        this.loadingHide();
        // error show
        if (error.hasOwnProperty('details') && error.details.includes('Duplicate')) {
          Alert.warning(this.translateService.instant('msg.groups.alert.name.used'));
        }
      });
    }
  }

  /**
   * 스키마 설명 수정
   */
  public updateSchemaDesc(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // validation
    if (this._descValidation()) {
      const params = {
        description: this.editDesc
      };
      // 로딩 show
      this.loadingShow();
      // 스키마 수정
      this._updateSchema(params).then(() => {
        // flag
        this.editDescFl = false;
        // 스키마 정보 재조회
        this._getPermissionSchemaDetail(this._schemaId);
      }).catch((error) => {
        // 로딩 hide
        this.loadingHide();
        // error
        Alert.error(error);
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * name validation
   * @returns {boolean}
   * @private
   */
  private _nameValidation(): boolean {
    // 스키마 이름이 비어 있다면
    if (isUndefined(this.editName) || this.editName.trim() === '') {
      Alert.warning(this.translateService.instant('msg.groups.alert.name.empty'));
      return false;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.editName.trim()) > 150) {
      Alert.warning(this.translateService.instant('msg.groups.alert.name.len'));
      return false;
    }
    return true;
  }

  /**
   * description validation
   * @returns {boolean}
   * @private
   */
  private _descValidation(): boolean {
    if (!isUndefined(this.editDesc) && this.editDesc.trim() !== '') {
      // 설명 길이 체크
      if (this.editDesc.trim() !== ''
        && CommonUtil.getByte(this.editDesc.trim()) > 450) {
        Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
        return false;
      }
      return true;
    }
    return true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 뒤로가기 버튼 클릭
   */
  public onClickPrev(): void {
    this._location.back();
  }

  /**
   * 퍼미션 스키마 삭제 클릭
   */
  public onClickDeletePermissionSchema(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.permission.ui.delete-schema.ph');
    modal.description = this.translateService.instant('msg.permission.ui.delete-schema.ph.sub', { value : `${this.roleSet.linkedWorkspaces ? this.roleSet.linkedWorkspaces : 0}`});
    if( this.firstWorkspace ) {
      let wsNames = this.firstWorkspace.name;
      if( 0 < this.otherWorkspaces.length ) {
        wsNames = wsNames + ',' + this.otherWorkspaces.map( item => item.name ).join( ',' );
      }
      modal.subDescription = wsNames;
    }
    modal.btnName = this.translateService.instant('msg.permission.ui.delete-schema');
    // schema id
    modal['schemaId'] = this.roleSet.id;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 퍼미션 스키마 복제 클릭
   */
  public onClickClonePermissionSchema(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.data = 'CLONE';
    modal.name = this.translateService.instant('msg.permission.ui.copy-schema.ph', { value : `\'${this.roleSet.name} \'`});
    modal.btnName = this.translateService.instant('msg.permission.ui.copy-schema');
    // schema id
    modal['schemaId'] = this.roleSet.id;

    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 퍼미션 설정 팝업 오픈
   */
  public onClickOpenPermissionSchemaSet() {
    const cloneRoleSet: RoleSet = _.cloneDeep(this.roleSet);
    this._permissionSchemaSetComp.init(cloneRoleSet, true, true);
  } // function - onClickOpenPermissionSchemaSet

  /**
   * 워크스페이스 클릭 이벤트
   * @param {Workspace} workspace
   */
  public onClickWorkspace(workspace:Workspace) {
    this.router.navigate([`/admin/workspaces/shared/${workspace.id}`]).then();
  } // function - onClickWorkspace

  /**
   * Role 의 퍼미션 변경 후처리
   */
  public afterUpdatePermissionRoles() {
    // 스키마 정보 재조회
    this._getPermissionSchemaDetail(this._schemaId);
  } // function - afterUpdatePermissionRoles

  /**
   * 다른 워크스페이스 목록을 표시/숨김한다.
   */
  public showHideOtherWorkspaces() {
    this.isOpenWorkspaceList = !this.isOpenWorkspaceList;
    if( this.isOpenWorkspaceList && 1 < this.totalWsCnt && 0 === this.otherWorkspaces.length ) {
      this._getWorkspacesByRoleSet(this._schemaId, this.totalWsCnt);
    }
  } // function - showHideOtherWorkspaces

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    this.roleSet = new RoleSet();
  }

  /**
   * 스키마 상세정보 조회
   * @param {string} schemaId
   * @private
   */
  private _getPermissionSchemaDetail(schemaId: string) {
    // 로딩 show
    this.loadingShow();
    // 스키마 상세정보 조회
    this.permissionService.getRolesetDetail(schemaId)
      .then((result) => {
        // 스키마 상세정보
        this.roleSet = result;
        // 로딩 hide
        this.loadingHide();
        // 연관 워크스페이스 목록 조회
        this._getWorkspacesByRoleSet(schemaId);
      })
      .catch((error) => this.commonExceptionHandler(error));
  } // function - _getPermissionSchemaDetail

  /**
   * RoleSet에 연결된 워크스페이스 목록 조회
   * @param {string} roleSetId
   * @param {number} pageSize
   * @private
   */
  private _getWorkspacesByRoleSet(roleSetId: string, pageSize:number = 1) {
    this.loadingShow();
    const param = new Page();
    param.page = 0;
    param.size = pageSize;
    param.sort = 'name,asc';
    if( 1 === pageSize ) {
      this.firstWorkspace = null;
    } else {
      this.otherWorkspaces = [];
    }
    this.permissionService.getWorkspacesByRoleSet(roleSetId, param).then(result => {
      if (result && result['_embedded'] && result['_embedded']['workspaces']) {
        const wsList = result['_embedded']['workspaces'];
        if( 1 === pageSize ) {
          this.firstWorkspace = wsList[0];
          this.totalWsCnt = ( 0 < result['page']['totalElements'] ) ? result['page']['totalElements'] - 1 : 0;
        } else {
          if( 1 < wsList.length ) {
            wsList.shift(0);
            this.otherWorkspaces = wsList;
          }
        }
      }
      this.loadingHide();
    }).catch((error) => this.commonExceptionHandler(error));
  } // function - _getWorkspacesByRoleSet

  /**
   * 퍼미션 스키마 복사
   * @param {string} schemaId
   * @private
   */
  private _clonePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 복사
    this.permissionService.copyRoleset(schemaId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.permission.alert.create.ok', {value: result.name}));

        // 복제한 스키마 상세페이지로 이동
        this.router.navigate(['/admin/workspaces/permission', result.id]).then();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 퍼미션 스키마 삭제
   * @param {string} schemaId
   * @private
   */
  private _deletePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 삭제
    this.permissionService.deleteRoleset(schemaId).then(() => {
      // alert
      Alert.success(this.translateService.instant('msg.permission.alert.delete.ok'));
      // 나가기
      this.onClickPrev();

    }).catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 스키마 수정
   * @param {Object} params
   * @returns {Promise<any>}
   * @private
   */
  private _updateSchema(params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      // 수정 요청
      this.permissionService.updateNameAndDescRoleset(this._schemaId, params)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
