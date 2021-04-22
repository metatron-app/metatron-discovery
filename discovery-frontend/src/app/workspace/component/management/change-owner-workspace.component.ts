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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Workspace} from '@domain/workspace/workspace';
import {Alert} from '@common/util/alert.util';
import {Page, PageResult} from 'app/domain/common/page';
import {WorkspaceService} from '../../service/workspace.service';
import {AbstractComponent} from '@common/component/abstract.component';
import {WorkspaceMemberProjection} from '@domain/workspace/workspace-member';

@Component({
  selector: 'app-change-workspace-owner',
  templateUrl: './change-owner-workspace.component.html'
})
export class ChangeOwnerWorkspaceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _workspace: Workspace;

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public afterChange: EventEmitter<boolean> = new EventEmitter();

  public isShow: boolean = false;       // 컴포넌트 표시 여부
  public isNoMember: boolean = false;   // Member 가 없는지 여부

  // 현재 워크스페이스 사용자 목록 및 선택된 사용자
  public users: any[] = [];
  public selectedUser: any;

  // 페이지 번호
  public userPageNum: number = 0;

  // 전체 개수
  public totalUser: number = 0;

  // More 버튼 표시 여부
  public isDisplayBtnUserMore: boolean = false;

  // 검색어
  public searchText: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트 실행
   */
  public init(workspace: Workspace) {
    this.selectedUser = undefined;
    this.searchText = '';
    $('body').removeClass('body-hidden').addClass('body-hidden');
    this._workspace = workspace;
    this._getUsers(workspace.id).then(() => {
      this.isNoMember = (0 === this.users.length);
      this.isShow = true;
    });
  } // function - init

  /**
   * 화면 종료
   */
  public close() {
    $('body').removeClass('body-hidden');
    this.isShow = false;
  } // function - close

  /*s
   * 소유자 변경 후 화면 종료
   */
  public done() {
    if (!this.isNoMember && !this.isNullOrUndefined(this.selectedUser)) {
      this.loadingShow();
      if (this.isNullOrUndefined(this.selectedUser)) {
        this.loadingHide();
        Alert.warning(this.translateService.instant('msg.space.ui.ph.owner'));
      } else {
        this.workspaceService.transferWorkspaceOwner(this._workspace.id, this.selectedUser.member.username).then(() => {
          this.loadingHide();
          this.afterChange.emit(true);
          this.close();
        }).catch(err => this.commonExceptionHandler(err));
      }
    }
  } // function - done

  /**
   * 사용자 선택
   * @param {WorkspaceMemberProjection} selectedUser
   */
  public selectNewOwner(selectedUser: WorkspaceMemberProjection) {
    this.selectedUser = selectedUser;
    this.users.forEach(item => {
      item['checked'] = (selectedUser.member.username === item.member.username);
    });
  } // function - selectNewOwner

  /**
   * 멤버 더 불러오기
   */
  public moreMember() {
    this.loadingShow();
    this._getUsers(this._workspace.id, this.userPageNum + 1).then(() => this.loadingHide());
  } // function - moreMember

  /**
   * 검색 조회 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public searchDataPressKey(event: KeyboardEvent) {
    (13 === event.keyCode) && (this.searchData());
  } // function - searchDataPressKey

  /**
   * 검색
   */
  public searchData() {
    this.loadingShow();
    // 검색어 설정
    this.searchText = this._inputSearch.nativeElement.value;
    // 데이터 조회
    this._getUsers(this._workspace.id).then(() => this.loadingHide());
  } // function - searchData

  /**
   * 검색어 리셋
   */
  public resetSearchText(isClear: boolean) {
    if (isClear) {
      this._inputSearch.nativeElement.value = '';
    } else {
      // 검색어 설정
      this._inputSearch.nativeElement.value = this.searchText;
    }
  } // function - resetSearchText

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
      this.selectedUser = undefined;
      (0 === pageNum) && (this.users = []);
      const param: Page = new Page();
      param.sort = 'memberName,asc';
      param.page = pageNum;
      ('' !== this.searchText) && (param['nameContains'] = this.searchText);
      this.workspaceService.getWorkspaceUsers(workspaceId, param).then((data) => {
        // 데이터 있다면
        if (data['_embedded']) {
          this.users = this.users.concat(data['_embedded']['members']);
          const pageData: PageResult = data.page;
          this.totalUser = pageData.totalElements;
          this.userPageNum = pageData.number;
          this.isDisplayBtnUserMore = (0 < pageData.totalPages && pageData.totalPages - 1 > pageData.number);
        } else {
          this.isDisplayBtnUserMore = false;
        }
        resolve(null);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
    });
  }  // function - _getUsers
}
