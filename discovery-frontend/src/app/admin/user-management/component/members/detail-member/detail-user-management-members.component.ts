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
import { User } from '../../../../../domain/user/user';
import { ActivatedRoute } from '@angular/router';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import { AbstractUserManagementComponent } from '../../../abstract.user-management.component';
import { Alert } from '../../../../../common/util/alert.util';
import { UpdateUserManagementMembersComponent } from '../update-member/update-user-management-members.component';
import { PermissionService } from '../../../../../user/service/permission.service';
import { CommonUtil } from '../../../../../common/util/common.util';
import { Group } from '../../../../../domain/user/group';
import { ChangeWorkspaceOwnerModalComponent } from '../change-workspace-owner-modal/change-workspace-owner-modal.component';
import { Location } from "@angular/common";

@Component({
  selector: 'app-member-detail',
  templateUrl: './detail-user-management-members.component.html',
})
export class DetailUserManagementMembersComponent extends AbstractUserManagementComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 아이디
  private _userId: string;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  // 그룹 편집 화면
  @ViewChild(UpdateUserManagementMembersComponent)
  private _setGroupComponent: UpdateUserManagementMembersComponent;

  private defaultPhotoSrc = '/assets/images/img_photo.png';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 데이터
  public userData: User = new User();

  // status list
  public userStatusList = [
    {
      label: this.translateService.instant('msg.mem.ui.active'),
      value: 'ACTIVATED',
    },
    {
      label: this.translateService.instant('msg.mem.ui.inactive'),
      value: 'LOCKED',
    },
  ];

  // 유저레벨 리스트 필터
  public userLevelList = [
    {label: 'General user', name: 'SYSTEM_USER', id: 'ROLE_SYSTEM_USER'},
    {label: 'General user', name: 'SYSTEM_GUEST', id: 'ROLE_SYSTEM_GUEST'},
    {
      label: 'Data manager',
      name: 'SYSTEM_SUPERVISOR',
      id: 'ROLE_SYSTEM_SUPERVISOR',
    },
    {label: 'Administrator', name: 'SYSTEM_ADMIN', id: 'ROLE_SYSTEM_ADMIN'},
  ];

  // status flag
  public statusShowFl: boolean = false;

  @ViewChild(ChangeWorkspaceOwnerModalComponent)
  private changeWorkspaceOwnerModal: ChangeWorkspaceOwnerModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private permissionService: PermissionService,
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

    // url에서 memberId 받아오기
    this.activatedRoute.params.subscribe((params) => {
      // memberId
      this._userId = params['userId'];
      // ui init
      this._initView();
      // 사용자 상세조회
      this.getUserDetail();
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
   * modal 이벤트 후 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    switch (modal.data) {
      case 'STATUS':
        this._updateUserStatus(modal['status']);
        break;
      case 'DELETE':
        this._deleteUser(this._userId);
        break;
      case 'LOGIN':
        break;
      case 'RESET':
        this._userResetPassword();
        break;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 사용자가 포함된 그룹의 수
   * @returns {number}
   */
  public getGroupLength(): number {
    return this.userData.groups ? this.getGroupList().length : 0;
  }

  /**
   * 현재 사용자가 포함된 그룹 목록
   * @returns {any}
   */
  public getGroupList(): Group[] {
    // groups가 있으면 filter
    return this.userData.groups
      ? this.userData.groups.filter((group) => {
        return this.userLevelList.findIndex((item) => {
          return item.id === group.id;
        }) === -1;
      })
      : [];
  }

  /**
   * 현재 사용자의 status
   * @returns {string}
   */
  public getUserStatus(): string {
    if (this.userData.status) {
      return this.userStatusList.filter((item) => {
        return item.value === this.userData.status.toString();
      })[0].label;
    } else {
      return this.userStatusList[0].label;
    }
  }

  /**
   * 사용자 상세정보 조회
   */
  public getUserDetail(): void {
    // 로딩 show
    this.loadingShow();
    // 상세정보 조회
    this.membersService.getUserDetail(this._userId).then((result) => {
      // 로딩 hide
      this.loadingHide();
      // 유저 정보 저장
      this.userData = result;
    }).catch(() => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 사용자 프로필 이미지
   * @returns {string}
   */
  public getUserImage(): string {
    return this.userData.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + this.userData.imageUrl + '/thumbnail'
      : this.defaultPhotoSrc;
  }

  /**
   * Role 이름 목록 나열
   * @param {string[]} roles
   * @return {string}
   */
  public getRoleNames(roles: string[]): string {
    return roles.map(item => {
      const strMsgCode: string = CommonUtil.getMsgCodeBySystemRole(item);
      return ('' === strMsgCode) ?
        '' :
        this.translateService.instant(strMsgCode);
    }).join(', ');
  } // function - getRoleNames

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 사용자 상태 변경 클릭
   * @param {string} status
   */
  public onChangeStatus(status: string) {
    // 같은 값이라면 변경이 발생하지 않음
    if (this.userData.status.toString() === status) {
      return;
    }
    // 모달 데이터 생성
    const modal = new Modal();
    modal.data = 'STATUS';
    // 이미 활성화 상태라면
    if (status === 'LOCKED') {
      modal.name = this.translateService.instant('msg.mem.ui.inactive.title',
        {value: this.userData.fullName});
      modal.description = this.translateService.instant(
        'msg.mem.ui.inactive.description');
      modal.btnName = this.translateService.instant('msg.mem.ui.inactive');
    } else {
      modal.name = this.translateService.instant('msg.mem.ui.active.title',
        {value: this.userData.fullName});
      modal.description = this.translateService.instant(
        'msg.mem.ui.active.description');
      modal.btnName = this.translateService.instant('msg.mem.ui.active');
    }
    // 변경할 status
    modal['status'] = status;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 비밀번호 초기화 클릭
   */
  public onClickResetPassword(): void {
    const modal = new Modal();
    modal.data = 'RESET';
    modal.name = this.translateService.instant('msg.mem.ui.pw.usr.title',
      {value: this.userData.fullName});
    modal.description = this.translateService.instant(
      'msg.mem.ui.pw.usr.description');
    modal.btnName = this.translateService.instant('msg.mem.btn.pw.usr');
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 사용자 삭제 클릭
   */
  public onClickDeleteUser(): void {
    this.changeWorkspaceOwnerModal.show(this._userId);
  }

  /**
   * 사용자 삭제 컨펌 보여주기
   */
  public showDeleteUserConfirm(event: { byPass: boolean }) {
    if (this.isDeleteUserConfirmPass(event)) {
      this.executeDeleteUser();
    } else {
      // 팝업 창 오픈
      this._confirmModalComponent.init(this._deleteUserModalDataGenerator());
    }
  }

  public executeDeleteUser() {
    this.confirmHandler(this._deleteUserModalDataGenerator());
  }

  /**
   * 그룹 편집창 클릭
   */
  public onClickEditGroups(): void {
    this._setGroupComponent.init(this.userData);
  }

  /**
   * 사용자 관리 목록으로 돌아가기
   */
  public onClickPrevUserList(): void {
    const url = this.cookieService.get('PREV_ROUTER_URL');
    if (url) {
      this.cookieService.delete('PREV_ROUTER_URL');
      this.router.navigate([url]);
    } else {
      this._location.back();
    }
  }

  /**
   * 그룹 상세화면으로 들어가기
   * @param {string} groupId
   */
  public onClickLinkGroup(groupId: string): void {
    // 쿠키에 현재 url 저장
    this._savePrevRouterUrl();
    // 그룹 상세화면으로 이동
    this.router.navigate(['/admin/user/groups', groupId]);
  }

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
  private _initView() {
    // 유저 정보 초기화
    this.userData = new User();
  }

  /**
   * 유저 삭제
   * @param {string} userId
   * @private
   */
  private _deleteUser(userId: string): void {
    // 로딩 show
    this.loadingShow();
    // 삭제 요청
    this.membersService.deleteUser(userId).then(() => {
      // alert
      Alert.success(
        this.translateService.instant('msg.mem.alert.delete.usr.success'));
      // 로딩 hide
      this.loadingHide();
      // 기존에 저장된 라우트 삭제
      this.cookieService.delete('PREV_ROUTER_URL');
      // 사용자 관리 목록으로 돌아가기
      this.router.navigate(['/admin/user/members']);
    }).catch((error) => {
      // alert
      Alert.error(error);
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 사용자 패스워드 초기화
   * @private
   */
  private _userResetPassword(): void {
    // 로딩 show
    this.loadingShow();
    // 비밀번호 초기화
    this.membersService.userPasswordReset(this.userData.email).
      then(() => {
        // alert
        Alert.success(
          this.translateService.instant('msg.mem.alert.reset.usr.pw.success'));
        // 로딩 hide
        this.loadingHide();
      }).
      catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 유저 상태 변경
   * @param {string} status
   * @private
   */
  private _updateUserStatus(status: string): void {
    // 로딩 show
    this.loadingShow();
    // 비밀번호 초기화
    this.membersService.updateUserStatus(this._userId, status).
      then(() => {
        // alert
        Alert.success(status === 'LOCKED'
          ?
          this.translateService.instant(
            'msg.mem.alert.change.usr.status.inactive.success',
            {value: this.userData.fullName})
          :
          this.translateService.instant(
            'msg.mem.alert.change.usr.status.active.success',
            {value: this.userData.fullName}));
        // 로딩 hide
        this.loadingHide();
        // 사용자 재조회
        this.getUserDetail();
      }).
      catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 현재 url을 쿠키서비스에 저장
   * @private
   */
  private _savePrevRouterUrl(): void {
    this.cookieService.set('PREV_ROUTER_URL', this.router.url);
  }

  /**
   * Create data for deleting user
   *
   * @private
   */
  private _deleteUserModalDataGenerator() {
    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.mem.ui.delete.usr.title', {value: this.userData.fullName});
    modal.description = this.translateService.instant('msg.mem.ui.delete.usr.description');
    modal.btnName = this.translateService.instant('msg.mem.btn.delete.usr');
    return modal;
  }

  // noinspection JSMethodCanBeStatic
  private isDeleteUserConfirmPass($event: { byPass: boolean }): boolean {
    return $event.byPass;
  }
}
