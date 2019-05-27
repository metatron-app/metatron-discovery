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
import { ChangeWorkspaceOwnerModalComponent } from './change-workspace-owner-modal/change-workspace-owner-modal.component';
import { ActivatedRoute } from "@angular/router";
import { isNullOrUndefined } from "util";

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

  @ViewChild(ChangeWorkspaceOwnerModalComponent)
  private changeWorkspaceOwnerModal: ChangeWorkspaceOwnerModalComponent;

  private _selectedUser: User;

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

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  public initialPeriodData:PeriodData;

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
              private activatedRoute: ActivatedRoute,
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

    // 파라메터 조회
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params => {

        // TODO selected type

        const size = params['size'];
        (isNullOrUndefined(size)) || (this.page.size = size);

        const page = params['page'];
        (isNullOrUndefined(page)) || (this.page.page = page);

        const sort = params['sort'];
        if (!isNullOrUndefined(sort)) {
          const sortInfo = decodeURIComponent(sort).split(',');
          this.selectedContentSort.key = sortInfo[0];
          this.selectedContentSort.sort = sortInfo[1];
        }

        // 검색어
        const searchText = params['nameContains'];
        (isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

        // Status
        const active = params['active'];
        if (!isNullOrUndefined(active)) {
          this.statusId = ('true' === active) ? 'ACTIVE' : 'INACTIVE';
        }

        this.selectedDate = new PeriodData();
        this.selectedDate.type = 'ALL';
        const from = params['from'];
        const to = params['to'];
        if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
          this.selectedDate.startDate = from;
          this.selectedDate.endDate = to;
          this.selectedDate.startDateStr = decodeURIComponent(from);
          this.selectedDate.endDateStr = decodeURIComponent(to);
          this.selectedDate.type = params['type'];
          this.initialPeriodData = this.selectedDate;
          this.safelyDetectChanges();
        }

        // members list 조회
        this._getMemberList();
      })
    );
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
   * 사용자 삭제 컨펌 보여주기
   */
  public showDeleteUserConfirm(event: { byPass: boolean }) {
    if (this.isDeleteUserConfirmPass(event)) {
      this.executeDeleteUser();
    } else {
      // 팝업 창 오픈
      this._confirmModalComponent.init(this._deleteUserModalDataGenerator(this._selectedUser));
    }
  }

  public executeDeleteUser() {
    this.confirmHandler(this._deleteUserModalDataGenerator(this._selectedUser));
  }

  /**
   * 사용자 제거 클릭 이벤트
   * @param {User} user
   */
  public onClickDeleteUser(user: User): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();

    this._selectedUser = user;
    this.changeWorkspaceOwnerModal.show(this._selectedUser.id);
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
    this.reloadPage();
  }

  /**
   * status 변경시
   */
  public onChangeStatus(statusId: string) {
    // 상태값 아이디 설정
    this.statusId = statusId;
    // members 리스트 조회
    this.reloadPage();
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
    this.reloadPage();
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
    this.router.navigate(['/admin/user/members', user.id], {queryParams: this._searchParams});
  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;

      // 멤버 리스트 조회
      this.reloadPage(false);
    }
  } // function - changePage


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getMemberParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage


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

        if (this.page.page > 0 && this.membersList.length === 1) {
          this.page.page = this.page.page - 1;
        }
        // 재조회
        this.reloadPage(false);
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
        this.reloadPage(false);
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
    this.reloadPage();
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
    this.membersList = [];
    const params = this._getMemberParams();
    this.membersService.getRequestedUser(params)
      .then((result) => {

        // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다
        if (this.page.page > 0 &&
          isNullOrUndefined(result['_embedded']) ||
          (!isNullOrUndefined(result['_embedded']) && result['_embedded'].users.length === 0))
        {
          this.page.page = result.page.number - 1;
          this._getMemberList();
        }

        // 검색 파라메터 정보 저장
        this._searchParams = params;

        // 페이지
        this.pageResult = result.page;
        // 페이지가 첫번째면 초기화
        if (this.pageResult.number === 0) {
          this.membersList = [];
        }
        // 데이터 있다면
        this.membersList = result._embedded ? result._embedded.users : [];
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
  private _getMemberParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      pseudoParam : (new Date()).getTime()
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
    params['type'] = 'ALL';
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = "CREATED";
      params['type'] = this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    return params;
  }

  /**
   * Create data for deleting user
   *
   * @private
   */
  private _deleteUserModalDataGenerator(user: User) {
    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.mem.ui.delete.usr.title', {value: user.fullName});
    modal.description = this.translateService.instant('msg.mem.ui.delete.usr.description');
    modal.btnName = this.translateService.instant('msg.mem.btn.delete.usr');
    modal['userId'] = user.id;
    return modal;
  }

  // noinspection JSMethodCanBeStatic
  private isDeleteUserConfirmPass($event: { byPass: boolean }): boolean {
    return $event.byPass;
  }
}


class Order {
  key: string = 'createdTime';
  sort: string = 'asc';
}
