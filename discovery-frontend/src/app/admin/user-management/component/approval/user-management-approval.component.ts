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
import { PeriodData } from '../../../../common/value/period.data.value';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { AbstractUserManagementComponent } from '../../abstract.user-management.component';
import { Alert } from '../../../../common/util/alert.util';
import { isUndefined } from "util";
declare let moment: any;
const defaultSort = 'createdTime,desc';

@Component({
  selector: 'app-user-management-approval',
  templateUrl: './user-management-approval.component.html'
})

export class UserManagementApprovalComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 리스트
  public userList: any;

  // 상태
  public statusId = 'requested,rejected';

  // date
  public selectedDate : PeriodData;

  // 검색어
  public searchKeyword : string;

  // Reject modal open/close
  public isRejectModalOpen : boolean = false;

  // Approve modal open/close
  public isApproveModalOpen : boolean = false;

  // 선택된 유저
  public selectedUser : string;

  // 정렬
  public selectedContentSort: Order = new Order();

  // Reject modal 에서 reject reason 을 쓰지 않았을 떄 error msg show / hide
  public isErrorMsgShow : boolean = false;

  // Reject modal 에서 거절 사유
  public rejectReason : string ;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              ) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
    this.init();
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
   * init 메소드
   */
  public init() {

    // default sort
    this.page.sort = defaultSort;

    this.getUsers();
  }

  /**
   * 가입 요청일자 변경시
   * @param data 날짜
   */
  public onChangeDate(data: PeriodData) {

    // 페이지 초기화
    this.page.page = 0;

    this.selectedDate = data;

    this.getUsers();
  }

  /**
   * 가입 요청자 리스트 불러오기
   * @param isAppend 기존 리스트에 추가 하는 경우 true else false
   */
  public getUsers(isAppend?) {

    this.loadingShow();

    this.membersService.getMemberApprovalList(this.setParam()).then((result) => {
      this.loadingHide();
      this.pageResult = result.page;
      const sorting = this.page.sort.split(',');
      this.selectedContentSort.key = sorting[0];
      this.selectedContentSort.sort = sorting[1];


      if (isAppend) {
          this.userList = this.userList.concat(result._embedded ? result._embedded.users : []);
        } else {
          this.userList = result._embedded ? result._embedded.users : [];
        }
    }).catch((error) => {
      this.loadingHide();
      Alert.warning(error.details);
    });
  }


  /**
   * status change
   * @param status all, rejected, pending
   */
  public changeStatus(status? : string) {
    if (status) {

      // 페이지 초기화
      this.page.page = 0;
      this.statusId = status;
      this.getUsers();
    }
  }

  /**
   * 더보기 클릭시
   */
  public loadMore() {

    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {

      this.page.page += 1;

      // 기존 리스트에 추가하기
      this.getUsers(true);
    }
  }

  /**
   * 검색하기
   * @param event 키보드 이벤트
   */
  public searchUser(event) {

    if (13 === event.keyCode) {

      this.page.page = 0;
      this.getUsers();
    } else if ( 27 === event.keyCode ) {

      this.page.page = 0;
      this.searchKeyword = '';
      this.getUsers();
    }

  }

  /**
   * Refresh filters
   */
  public refreshFilters() {
    this.page.page = 0;
    this.page.sort = defaultSort;
    this.searchKeyword = '';
    this.selectedDate = null;
    this.periodComponent.setAll();
    this.statusId = 'requested,rejected';
    this.getUsers();
  }


  /**
   * Change User status
   * @param status REJECT or APPROVE
   * @param username
   */
  public changeUserStatus(status : string, username : string) {

    if ( 'REJECT' === status) {
      this.selectedUser = username;
      this.isRejectModalOpen = true;
    } else if ( 'APPROVE' === status) {
      this.isApproveModalOpen = true;
      this.selectedUser = username;
    }

  }

  /**
   * Reject button click 시
   */
  public rejectUser() {

    if(isUndefined(this.rejectReason) || this.rejectReason.trim() === '') {
      this.isErrorMsgShow = true;
      return;
    } else {
      let params = {};

      params['message'] = this.rejectReason;

      this.loadingShow();
      this.membersService.rejectUser(this.selectedUser, params).then((result) => {
        this.selectedUser = '';
        console.info('rejected --> ', result);
        this.isRejectModalOpen = false;
        this.loadingHide();
        this.getUsers();
      }).catch((err) => {
        this.selectedUser = '';
        this.loadingHide();
        Alert.warning(err.details);

      })
    }

  }

  /**
   * 승인 모달에서 확인 클릭시
   */
  public approveUser() {

    this.loadingShow();

    this.membersService.approveUser(this.selectedUser).then((result) => {
      this.isApproveModalOpen = false;
      this.loadingHide();
      this.getUsers();
      Alert.success(this.translateService.instant('msg.approval.alert.approved'));

    }).catch((err) => {
      this.loadingHide();
      Alert.warning(err.details);

    })

  }

  /**
   * 정렬 바꿈
   * @param column 어떤 컬럼을 정렬 할 지
   */
  public sortList(column : string) {
    this.page.page = 0;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;

    // asc, desc, default
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

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    // 데이터소스 리스트 조회
    this.getUsers();
  }

  /**
   * Set parameter for api
   */
  private setParam(): Object {

    let result : Object;

    // 페이지, 사이즈 설정
    result =  {
      size: this.page.size,
      page: this.page.page
    };

    result['status'] = this.statusId;
    // 정렬
    result['sort'] = this.page.sort;

    // nameContains
    if (this.searchKeyword) {
      result['nameContains'] = this.searchKeyword;
    }

    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {

      result['searchDateBy'] = this.selectedDate.dateType;

      if (this.selectedDate.startDateStr) {
        result['from'] = moment(this.selectedDate.startDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
      }
      result['to'] = moment(this.selectedDate.endDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
    }

    return result;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
