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

import { AbstractUserManagementComponent } from '../../../abstract.user-management.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { ActivatedRoute } from '@angular/router';
import { Modal } from '../../../../../common/domain/modal';
import { Alert } from '../../../../../common/util/alert.util';
import { UpdateUserManagementGroupsComponent } from '../update-group/update-user-management-groups.component';
import { isUndefined } from 'util';
import { CommonUtil } from '../../../../../common/util/common.util';
import { Group } from '../../../../../domain/user/group';
import { GroupMember } from '../../../../../domain/user/group-member';
import { Location } from "@angular/common";

@Component({
  selector: 'app-group-detail',
  templateUrl: './detail-user-management-groups.component.html'
})
export class DetailUserManagementGroupsComponent extends AbstractUserManagementComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 아이디
  private _groupId: string;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  @ViewChild(UpdateUserManagementGroupsComponent)
  private _setMembersComponent: UpdateUserManagementGroupsComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 데이터
  public groupData: Group = new Group();

  // 그룹에 포함된 멤버 목록
  public members: GroupMember[] = [];

  // 그룹 이름 수정
  public editName: string;
  // 그룹 설명 수정
  public editDesc: string;
  // 그룹 이름 수정 플래그
  public editNameFl: boolean;
  // 그룹 설명 수정 플래그
  public editDescFl: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activatedRoute: ActivatedRoute,
              protected element: ElementRef,
              private _location:Location,
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
    // 쿼리 파라메터 저장

    // url에서 groupId 받아오기
    this.activatedRoute.params.subscribe((params) => {
      // groupId
      this._groupId = params['groupId'];
      // ui init
      this._initView();
      // 사용자 상세조회
      this._getGroupDetail(this._groupId, true);
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
   * 권한 목록 조회
   * @return {string}
   */
  public getPermissions():string {
    if( this.groupData && this.groupData.roleNames ) {
      return this.groupData.roleNames.map(role => {
        const strMsgCode: string = CommonUtil.getMsgCodeBySystemRole( role );
        return ( '' === strMsgCode ) ? '' : this.translateService.instant(strMsgCode);
      }).join(', ');
    } else {
      return '';
    }
  } // function - getPermisssions

  /**
   * 그룹 삭제
   */
  public deleteGroup(): void {
    // 로딩 show
    this.loadingShow();
    // 삭제 요청
    this.groupsService.deleteGroup(this._groupId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.groups.alert.grp.del.success'));
        // 로딩 hide
        this.loadingHide();
        // 기존에 저장된 라우트 삭제
        this.cookieService.delete('PREV_ROUTER_URL');
        // 그룹 관리 목록으로 돌아가기
        this.router.navigate(['/admin/user/groups']);
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 멤버 업데이트 후
   */
  public completeMembersUpdate(): void {
    // 멤버 재조회
    this._getMembersInGroup(this._groupId);
  }

  /**
   * 그룹 이름 변경모드
   */
  public groupNameEditMode(): void {
    if (!this.groupData.readOnly) {
      // 현재 그룹 이름
      this.editName = this.groupData.name;
      // flag
      this.editNameFl = true;
    }
  }

  /**
   * 그룹 설명 변경모드
   */
  public groupDescEditMode(): void {
    if (!this.groupData.readOnly) {
      // 현재 그룹 설명
      this.editDesc = this.groupData.description;
      // flag
      this.editDescFl = true;
    }
  }

  /**
   * 그룹 이름 수정
   */
  public updateGroupName(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // validation
    if (this._nameValidation()) {
      const params = {
        name: this.editName
      };
      // 로딩 show
      this.loadingShow();
      // 그룹 수정
      this._updateGroup(params)
        .then((result) => {
          // alert
          Alert.success(this.translateService.instant('msg.groups.alert.grp.update.success'));
          // flag
          this.editNameFl = false;
          // 그룹 정보 재조회
          this._getGroupDetail(this._groupId);
        })
        .catch((error) => {
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
   * 그룹 설명 수정
   */
  public updateGroupDesc(): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // validation
    if (this._descValidation()) {
      const params = {
        description: this.editDesc
      };
      // 로딩 show
      this.loadingShow();
      // 그룹 수정
      this._updateGroup(params)
        .then((result) => {
          // alert
          Alert.success(this.translateService.instant('msg.groups.alert.grp.update.success'));
          // flag
          this.editDescFl = false;
          // 그룹 정보 재조회
          this._getGroupDetail(this._groupId);
        })
        .catch((error) => {
          // 로딩 hide
          this.loadingHide();
          // error
          Alert.error(error);
        });
    }
  }

  /**
   * 그룹에 속한 멤버의 이메일
   * @returns {string}
   */
  public getAllEmailAddress(): string {
    return this.members.map((item) => {
      return item.profile.email;
    }).join(',');
  }

  /**
   * 삭제가 가능한지 여부
   * @returns {boolean}
   */
  public isEnableDelete(): boolean {
    return !this.groupData.predefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그룹 관리 목록으로 돌아가기
   */
  public onClickPrevGroupList(): void {
    const url = this.cookieService.get('PREV_ROUTER_URL');
    if (url) {
      this.cookieService.delete('PREV_ROUTER_URL');
      this.router.navigate([url]);
    } else {
      this._location.back();
    }
  }

  /**
   * 그룹 삭제 클릭
   */
  public onClickDeleteGroup(): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.groups.ui.del-grp.title');
    modal.description = this.translateService.instant('msg.groups.ui.del-grp.sub.title');
    modal.btnName = this.translateService.instant('msg.groups.btn.del-grp');
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 사용자 편집창 클릭
   */
  public onClickEditMembers(): void {
    this._setMembersComponent.init(this.groupData, this.members);
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
    // 그룹 이름이 비어 있다면
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
    // 초기화
    this.groupData = new Group();
    this.members = [];
  }

  /**
   * 사용자 상세정보 조회
   * @param {string} groupId
   * @param {boolean} firstFl
   * @private
   */
  private _getGroupDetail(groupId: string, firstFl: boolean = false): void {
    // 로딩 show
    this.loadingShow();
    // 상세정보 조회
    this.groupsService.getGroupDetail(groupId)
      .then((result) => {
        // group 데이터
        this.groupData = result;
        // 최초 조회인지 확인
        firstFl ? this._getMembersInGroup(groupId) : this.loadingHide();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹에 속한 멤버 조회
   * @param {string} groupId
   * @private
   */
  private _getMembersInGroup(groupId: string): void {
    // 로딩 show
    this.loadingShow();

    const pageParam = { size : 10000, page : 0 };

    // 상세정보 조회
    this.groupsService.getGroupUsers(groupId, pageParam)
      .then((result) => {
        // 멤버목록 초기화
        this.members = [];
        // 멤버 데이터 수 초기화
        this.groupData.memberCount = 0;
        // group 데이터
        if (result['_embedded']) {
          // 멤버 데이터
          this.members = result['_embedded'].members;
          // 멤버 데이터 수 변경
          this.groupData.memberCount = result['_embedded'].members.length;
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹 수정
   * @param {Object} params
   * @returns {Promise<any>}
   * @private
   */
  private _updateGroup(params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      // 수정 요청
      this.groupsService.updateGroup(this._groupId, params)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
