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

import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { Status, User } from '../../../../domain/user/user';
import { PeriodData } from '../../../../common/value/period.data.value';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { AbstractUserManagementComponent } from '../../abstract.user-management.component';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import { CreateUserManagementMembersComponent } from './create-member/create-user-management-members.component';
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../common/domain/modal';
import { Alert } from '../../../../common/util/alert.util';

declare let moment: any;

@Component({
  selector: 'app-user-management-members',
  templateUrl: './user-management-members.component.html',
  providers: [MomentDatePipe]
})
export class UserManagementMembersComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(CreateUserManagementMembersComponent)
  private _createUserComponent: CreateUserManagementMembersComponent;

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 리스트
  public membersList: User[] = [];

  // 전체 / 활성화 / 비활성화 필터
  public statusId = 'ALL';

  // 검색 키워드
  public searchKeyword: string = '';

  // date
  public selectedDate : PeriodData;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this._initView();
    // members list 조회
    this._getMemberList();
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
   * 필터 모두 초기화
   */
  public initFilters() {
    // status 초기화
    this.statusId = 'ALL';
    // join date 초기화
    this.selectedDate = null;
    // 검색조건 초기화
    this.searchKeyword = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // sort 초기화
    this.selectedContentSort = new Order();
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * modal 이벤트 후 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    switch (modal.data) {
      case 'STATUS':
        this._changeUserStatus(modal['userId'], modal['status'], modal['userName']);
        break;
      case 'DELETE':
        this._deleteUser(modal['userId']);
        break;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 멤버 리스트 초기화 후 재조회
   * @private
   */
  public getMemberListInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 멤버 리스트 조회
    this._getMemberList();
  }

  /**
   * 사용자의 현재 상태
   * @param {Status} status
   * @returns {any}
   */
  public getUserStatus(status: Status) {
    return status === Status.ACTIVATED ? this.translateService.instant('msg.mem.ui.active') : this.translateService.instant('msg.mem.ui.inactive');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * status 셀렉트 박스 클릭
   * @param {User} user
   */
  public onClickShowStatus(user: User): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // status show flag 변경
    user['statusShowFl'] = !user['statusShowFl'];
  }

  /**
   * 사용자 제거 클릭 이벤트
   * @param {User} user
   */
  public onClickDeleteUser(user: User): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.mem.ui.delete.usr.title', {value: user.fullName});
    modal.description = this.translateService.instant('msg.mem.ui.delete.usr.description');
    modal.btnName = this.translateService.instant('msg.mem.btn.delete.usr');
    // 유저 아이디
    modal['userId'] = user.id;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * status 변경 이벤트
   * @param {User} user
   * @param {string} status
   */
  public onChangeUserStatus(user: User, status: string): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();

    if( user.status.toString() === status ) {
      return;
    }

    // status show flag
    user['statusShowFl'] = false;
    // 같은 값이라면 변경이 발생하지 않음
    // if (user.status.toString() === status) {
    //   return;
    // }
    // 모달 데이터 생성
    const modal = new Modal();
    modal.data = 'STATUS';
    // 이미 활성화 상태라면
    if (status === 'LOCKED') {
      modal.name = this.translateService.instant('msg.mem.ui.inactive.title', {value:user.fullName});
      modal.description = this.translateService.instant('msg.mem.ui.inactive.description');
      modal.btnName = this.translateService.instant('msg.mem.ui.inactive');
    } else {
      modal.name = this.translateService.instant('msg.mem.ui.active.title', {value:user.fullName});
      modal.description = this.translateService.instant('msg.mem.ui.active.description');
      modal.btnName = this.translateService.instant('msg.mem.ui.active');
    }
    // 유저 아이디
    modal['userId'] = user.id;
    // 유저 이름
    modal['userName'] = user.fullName;
    // 변경할 status
    modal['status'] = status;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  } // function - onChangeUserStatus

  /**
   * 가입 요청일자 변경시
   */
  public onChangeDate(data: PeriodData) {
    // 선택한 날짜
    this.selectedDate = data;
    // members 리스트 조회
    this.getMemberListInit();
  }

  /**
   * status 변경시
   */
  public onChangeStatus(statusId: string) {
    // 상태값 아이디 설정
    this.statusId = statusId;
    // members 리스트 조회
    this.getMemberListInit();
  }

  /**
   * 멤버 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    ( 13 === event.keyCode ) && (this._searchText(event.target['value']));
  }

  /**
   * 멤버 검색 초기화
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreContents(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;
    // 멤버 조회
    this._getMemberList();
  }

  /**
   * 목록 정렬 필터링
   * @param {string} key
   */
  public onFilterSort(key: string): void {
    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
    // 멤버 조회
    this.getMemberListInit();
  }




  /**
   * 멤버 생성 페이지 오픈
   */
  public showCreateUser(): void {
    this._createUserComponent.init();
  }

  /**
   * 멤버 상세 페이지 오픈
   * @param {User} user
   */
  public showDetailUser(user: User): void {
    // 기존에 저장된 라우트 삭제
    this.cookieService.delete('PREV_ROUTER_URL');
    this.router.navigate(['/admin/user/members', user.id]);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 유저 삭제
   * @param {string} userId
   * @private
   */
  private _deleteUser(userId: string): void {
    // 로딩 show
    this.loadingShow();
    // 삭제 요청
    this.membersService.deleteUser(userId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.mem.alert.delete.usr.success'));
        // 재조회
        this.getMemberListInit();
      })
      .catch((error)=> {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 유저 상태 변경
   * @param {string} userId
   * @param {string} status
   * @private
   */
  private _changeUserStatus(userId: string, status: string, userName: string): void {
    // 로딩 show
    this.loadingShow();
    // 상태 변경 요청
    this.membersService.updateUserStatus(userId, status)
      .then((result) => {
        // alert
        Alert.success(status === 'LOCKED'
          ? this.translateService.instant('msg.mem.alert.change.usr.status.inactive.success', {value: userName})
          : this.translateService.instant('msg.mem.alert.change.usr.status.active.success', {value: userName}));
        // 재조회
        this.getMemberListInit();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });

  }


  /**
   * ui 초기화
   * @private
   */
  private _initView():void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // search text
    this.searchKeyword = '';
    // status
    this.statusId = 'ALL';
  }

  /**
   * 검색어로 멤버 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchKeyword = keyword;
    // 재조회
    this.getMemberListInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 멤버 리스트 조회
   * @private
   */
  private _getMemberList(): void {
    // 로딩 show
    this.loadingShow();
    // group 리스트 조회
    this.membersService.getRequestedUser(this._getMemberParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        // 페이지가 첫번째면 초기화
        if (this.pageResult.number === 0) {
          this.membersList = [];
        }
        // 데이터 있다면
        this.membersList = result._embedded ? this.membersList.concat(result._embedded.users) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 멤버 리스트 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getMemberParams(): object {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number
    };
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // status
    if (this.statusId !== 'ALL') {
      params['active'] = this.statusId === 'ACTIVE' ? true : false;
    }
    // 검색어
    if (this.searchKeyword.trim() !== '') {
      params['nameContains'] = this.searchKeyword.trim();
    }
    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = "CREATED";
      if (this.selectedDate.startDateStr) { // TODO: 9시간을 빼서 처리..
        params['from'] = moment(this.selectedDate.startDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
      }
      params['to'] = moment(this.selectedDate.endDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
    }

    return params;
  }
}


class Order {
  key: string = 'createdTime';
  sort: string = 'asc';
}
