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

import {AbstractComponent} from '../../../../../common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from "@angular/common";
import {ActivatedRoute} from '@angular/router';
import {Modal} from '../../../../../common/domain/modal';
import {ConfirmModalComponent} from '../../../../../common/component/modal/confirm/confirm.component';
import {PublicType, WorkspaceAdmin} from '../../../../../domain/workspace/workspace';
import {Alert} from '../../../../../common/util/alert.util';
import {WorkspaceService} from '../../../../../workspace/service/workspace.service';

@Component({
  selector: 'app-detail-workspace',
  templateUrl: './detail-workspace.component.html'
})
export class DetailWorkspaceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 아이디
  private _workspaceId: string;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 객체
  public workspace: WorkspaceAdmin;

  // status
  public statusList: any[];
  public selectedStatus: any;

  // status flag
  public statusShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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

    // url에서 workspaceId 받아오기
    this.activatedRoute.params.subscribe((params) => {
      // sourceId
      this._workspaceId = params['workspaceId'];
      // ui init
      this._initView();
      // 워크스페이스 상세조회
      this._getWorkspaceDetail(this._workspaceId);
    });
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 모달 확인
   * @param modal
   */
  public confirmEvent(modal): void {
    modal.data === 'DELETE' ? this._deleteWorkspace() : this._changeWorkspaceStatus(modal.status);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 워크스페이스의 상태
   * @returns {string}
   */
  public getWorkspaceStatus(): string {
    return this.workspace.active ? this.statusList[0].label : this.statusList[1].label;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스가 공유 워크스페이스인지 확인
   * @returns {boolean}
   */
  public isPublicWorkspace(): boolean {
    return this.workspace.publicType === PublicType.SHARED;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스 관리 목록으로 돌아가기
   */
  public onClickPrevWorkspaces(): void {
    const url = this.cookieService.get('PREV_ROUTER_URL');
    if (url) {
      this.cookieService.delete('PREV_ROUTER_URL');
      this.router.navigate([url]).then();
    } else {
      this._location.back();
    }
  }

  /**
   * 해당 워크스페이스 새창으로 open
   */
  public onOpenDiscovery(): void {
    window.open(`workspace/${this._workspaceId}`);
  }

  /**
   * 워크스페이스 status 변경 모달오픈
   * @param {string} status
   */
  public onOpenChangeStatus(status: string): void {

    if ((this.workspace.active ? 'active' : 'inactive') === status) {
      return;
    }

    const modal = new Modal();
    modal.data = 'STATUS';
    // 이미 활성화 상태라면
    if (status === 'inactive') {
      modal.name = this.translateService.instant('msg.spaces.spaces.ui.inactive.title', {value: this.workspace.name});
      modal.description = this.translateService.instant('msg.spaces.spaces.ui.inactive.description');
      modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.inactive');
    } else {
      modal.name = this.translateService.instant('msg.spaces.spaces.ui.active.title', {value: this.workspace.name});
      modal.description = this.translateService.instant('msg.spaces.spaces.ui.active.description');
      modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.active');
    }
    // 변경할 워크스페이스 아이디 저장
    modal['workspaceId'] = this._workspaceId;
    // 변경할 status
    modal['status'] = status;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 워크스페이스 삭제 모달오픈
   */
  public onOpenDeleteWorkspace(): void {
    // event stop
    event.stopPropagation();

    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.spaces.spaces.ui.delete.title');
    modal.description = this.translateService.instant('msg.spaces.spaces.ui.delete.description');
    modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.delete.btn');
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스 상세정보 조회
   * @param {string} workspaceId
   * @private
   */
  private _getWorkspaceDetail(workspaceId: string): void {
    // 로딩 show
    this.loadingShow();
    // 워크스페이스 상세정보 조회
    this.workspaceService.getWorkSpace(workspaceId, 'forDetailView')
      .then((result) => {
        // 워크스페이스 상세정보
        this.workspace = result;
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 워크스페이스 삭제
   * @private
   */
  private _deleteWorkspace(): void {
    // 로딩 show
    this.loadingShow();
    // 워크스페이스 삭제
    this.workspaceService.deleteWorkspace(this._workspaceId)
      .then(() => {
        // alert
        Alert.success(this.translateService.instant('msg.spaces.shared.alert.delete'));
        // 기존에 저장된 라우트 삭제
        this.cookieService.delete('PREV_ROUTER_URL');
        // 워크스페이스 관리 창으로 돌아가기
        this.onClickPrevWorkspaces();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 워크스페이스 status 변경
   * @param {string} status
   * @private
   */
  private _changeWorkspaceStatus(status: string): void {
    // 로딩 show
    this.loadingShow();
    // 워크스페이스 활성화 | 비활성화
    this.workspaceService.changeWorkspaceStatus(this._workspaceId, status)
      .then(() => {
        // alert
        Alert.success(status === 'active' ? this.translateService.instant('msg.spaces.shared.alert.status.active') : this.translateService.instant('msg.spaces.shared.alert.status.inactive'));
        // 재조회
        this._getWorkspaceDetail(this._workspaceId);
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // workspace
    this.workspace = new WorkspaceAdmin();
    // status
    this.statusList = [
      {label: this.translateService.instant('msg.spaces.spaces.ui.active'), value: 'active'},
      {label: this.translateService.instant('msg.spaces.spaces.ui.inactive'), value: 'inactive'},
    ];
    // TODO 선택된 status
    this.selectedStatus = this.statusList[0];
  }
}
