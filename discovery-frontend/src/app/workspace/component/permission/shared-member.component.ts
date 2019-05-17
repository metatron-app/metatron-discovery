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

import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { WorkspaceService } from '../../service/workspace.service';
import { Alert } from '../../../common/util/alert.util';
import { PermissionChecker, Workspace } from '../../../domain/workspace/workspace';
import { Page } from '../../../domain/common/page';

@Component({
  selector: 'app-shared-member',
  templateUrl: './shared-member.component.html',
})
export class SharedMemberComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public showComplete = new EventEmitter();

  // 현재 워크스페이스 사용자 및 그룹 목록
  public users: any[] = [];
  public groups: any[] = [];

  // 팝업 닫기
  public isShow: boolean = false;

  // 권한 설정
  public isManageMember: boolean = false;
  public isGuest:boolean = false;

  // 페이지 번호
  public userPageNum: number = 0;
  public groupPageNum: number = 0;

  // 전체 개수
  public totalUser: number = 0;
  public totalGroup: number = 0;

  // More 버튼 표시 여부
  public isDisplayBtnUserMore:boolean = false;
  public isDisplayBtnGroupMore:boolean = false;

  // 워크스페이스 정보
  public workspace: Workspace;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              private renderer: Renderer2,
              private workspaceService: WorkspaceService) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public init(workspace: Workspace) {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // 초기화
    this._reset();

    // 워크스페이스 정보 설정
    this.workspace = workspace;

    const checker:PermissionChecker = new PermissionChecker(workspace);
    this.isManageMember = checker.isManageWorkspace();
    this.isGuest = checker.isWorkspaceGuest();

    const workspaceId: string = this.workspace.id;
    this.loadingShow();
    const promise = [];
    promise.push(this._getUsers(workspaceId));
    promise.push(this._getGroups(workspaceId));
    Promise.all(promise).then(() => {
      // 팝업 오픈
      this.isShow = true;
      this.loadingHide();
    }).catch(() => {
      this.loadingHide();
    });
  }

  // 닫기
  public close(settingFl: boolean) {
    // 팝업 닫기
    this.isShow = false;
    this.showComplete.emit(settingFl);
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /**
   * 워크스페이스 전체 공개 여부
   */
  public toggleWorkspacePublished() {
    this.loadingShow();
    this.workspace.published = !this.workspace.published;
    this.workspaceService.updateWorkspace(
      this.workspace.id,
      (<any>{ published: this.workspace.published })
    ).then(() => {
      // 로딩 hide
      this.loadingHide();
      // 수정 알림
      Alert.success(this.translateService.instant('msg.space.alert.edit.workspace.success'));
    }).catch((error) => {
      // 로딩 hide
      this.loadingHide();
      // 수정 알림
      Alert.error(this.translateService.instant('msg.space.alert.edit.workspace.fail'));
    });
  } // function - toggleWorkspacePublished

  /**
   * 사용자 더 불러오기
   */
  public getUserMore() {
    this.loadingShow();
    this.userPageNum++;
    this._getUsers(this.workspace.id, this.userPageNum).then(() => {
      this.loadingHide();
    });
  } // function - getUserMore

  /**
   * 그룹 더 불러오기
   */
  public getGroupMore() {
    this.loadingShow();
    this.groupPageNum++;
    this._getGroups(this.workspace.id, this.groupPageNum).then(() => {
      this.loadingHide();
    });
  } // function - getGroupMore

  /**
   * 유저의 프로필 사진
   * @param user
   * @returns {string}
   */
  public getProfileImage(user): string {
    return user.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + user.imageUrl + '/thumbnail'
      : '/assets/images/img_photo.png';
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 워크스페이스 사용자 목록 조회
   * @param {string} workspaceId
   * @param {number} pageNum
   * @private
   */
  private _getUsers(workspaceId: string, pageNum: number = 0) {
    return new Promise((resolve) => {
      ( 0 === pageNum ) && ( this.users = [] );
      const param: Page = new Page();
      param.sort = 'memberName,asc';
      param.page = pageNum;
      this.workspaceService.getWorkspaceUsers(workspaceId, param).then((data) => {
        // 데이터 있다면
        if (data['_embedded']) {
          this.users = this.users.concat(data['_embedded']['members']);
          this.totalUser = data.page.totalElements;
          this.isDisplayBtnUserMore = ( data.page.totalPages - 1 > data.page.number );
        }
        resolve();
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
    });

  }  // function - _getUsers

  /**
   * 워크스페이스 그룹 목록 조회
   * @param {string} workspaceId
   * @param {number} pageNum
   * @private
   */
  private _getGroups(workspaceId: string, pageNum: number = 0) {
    return new Promise((resolve) => {
      ( 0 === pageNum ) && ( this.groups = [] );
      const param: Page = new Page();
      param.sort = 'memberName,asc';
      param.page = pageNum;
      this.workspaceService.getWorkspaceGroups(workspaceId, param).then((data) => {
        // 데이터 있다면
        if (data['_embedded']) {
          this.groups = this.groups.concat(data['_embedded']['members']);
          this.totalGroup = data.page.totalElements;
          this.isDisplayBtnGroupMore = ( data.page.totalPages - 1  > data.page.number );
        }
        resolve();
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
    });
  }  // function - _getGroups

  /**
   * 변수 초기화
   * @private
   */
  private _reset() {
    // 팝업 닫기
    this.isShow = false;
    // 워크스페이스
    this.workspace = null;
    // 현재 워크스페이스 User & Group
    this.users = [];
    this.groups = [];
    // 페이지 설정
  } // function - _reset
}
