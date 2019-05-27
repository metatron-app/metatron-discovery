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
import { isNullOrUndefined, isUndefined } from "util";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
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

  // date
  private _filterDate: PeriodData;

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

  public initialPeriodData:PeriodData;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              private activatedRoute: ActivatedRoute,
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

    // 파라메터 조회
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params => {

        if (!_.isEmpty(params)) {

          const page = params['page'];
          (isNullOrUndefined(page)) || (this.page.page = page);

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }

          const size = params['size'];
          (isNullOrUndefined(size)) || (this.page.size = size);

          // Status
          const status = params['status'];
          (isNullOrUndefined(status)) || (this.statusId = status);

          // 검색어
          const searchText = params['nameContains'];
          (isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

          const from = params['from'];
          const to = params['to'];

          this._filterDate = new PeriodData();
          this._filterDate.type = 'ALL';
          if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
            this._filterDate.startDate = from;
            this._filterDate.endDate = to;
            this._filterDate.type = params['type'];

            this._filterDate.startDateStr = decodeURIComponent(from);
            this._filterDate.endDateStr = decodeURIComponent(to);
            this.initialPeriodData = this._filterDate;
            this.safelyDetectChanges();
          }
        }

        // 퍼미션 스키마 조회
        this.getUsers();
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
   * init 메소드
   */
  public init() {

    // 정렬 초기화
    this.selectedContentSort = new Order();
    this.selectedContentSort.key = 'createdTime';
    this.selectedContentSort.sort = 'desc';

  }

  /**
   * 가입 요청일자 변경시
   * @param data 날짜
   */
  public onFilterDate(data: PeriodData) {

    // 페이지 초기화
    this.page.page = 0;

    this.selectedDate = data;

    // 페이지 재 조회
    this.reloadPage();
  }

  /**
   * 가입 요청자 리스트 불러오기
   */
  public getUsers(): void {

    this.loadingShow();

    this.userList = [];

    const params = this.setParam();
    this.membersService.getMemberApprovalList(params).then((result) => {

      this.loadingHide();

      this._searchParams = params;

      this.pageResult = result.page;

      this.userList = result['_embedded'] ? this.userList.concat(result['_embedded'].users) : [];

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
      this.statusId = status;
      this.reloadPage();
    }
  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;

      // 재조회
      this.reloadPage(false);
    }
  } // function - changePag



  /**
   * 검색하기
   * @param event 키보드 이벤트
   */
  public searchUser(event) {

    if (13 === event.keyCode || 27 === event.keyCode) {
      if ( 27 === event.keyCode ) {
        this.searchKeyword = '';
      }
      this.reloadPage();
    }

  }

  /**
   * Refresh filters
   */
  public refreshFilters() {
    this.changeStatus('requested,rejected');
    this.page.sort = defaultSort;
    this.searchKeyword = '';
    this.selectedDate = null;
    this.periodComponent.setAll();
    this.reloadPage();
  }


  /**
   * Change User status
   * @param status REJECT or APPROVE
   * @param username
   */
  public changeUserStatus(status : string, username : string) {

    if ( 'REJECT' === status) {
      this.selectedUser = username;
      this.rejectReason = undefined;
      this.isErrorMsgShow = false;
      this.isRejectModalOpen = true;
    } else if ( 'APPROVE' === status) {
      this.isApproveModalOpen = true;
      this.selectedUser = username;
    }

  } // function - changeUserStatus

  /**
   * 반려 모달 닫기
   */
  public closeRejectModal() {
    this.selectedUser = undefined;
    this.rejectReason = undefined;
    this.isErrorMsgShow = false;
    this.isRejectModalOpen = false;
  } // function - closeRejectModal

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
        this.reloadPage();
      }).catch((err) => {
        this.selectedUser = '';
        this.loadingHide();
        Alert.warning(err.details);

      })
    }

  } // function - rejectUser

  /**
   * 승인 모달에서 확인 클릭시
   */
  public approveUser() {

    this.loadingShow();

    this.membersService.approveUser(this.selectedUser).then((result) => {
      this.isApproveModalOpen = false;
      this.loadingHide();
      this.reloadPage();
      Alert.success(this.translateService.instant('msg.approval.alert.approved'));

    }).catch((err) => {
      this.loadingHide();
      Alert.warning(err.details);

    })

  }

  /**
   * 정렬 바꿈
   * @param key 어떤 컬럼을 정렬 할 지
   */
  public sortList(key : string) {
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

    // 데이터소스 리스트 조회
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this.setParam();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage


  /**
   * Set parameter for api
   */
  private setParam(): any {

    let result : Object;

    // 페이지, 사이즈 설정
    result =  {
      size: this.page.size,
      page: this.page.page,
      pseudoParam : (new Date()).getTime()
    };

    result['status'] = this.statusId;

    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      result['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }

    // nameContains
    if (this.searchKeyword) {
      result['nameContains'] = this.searchKeyword;
    }

    // date
    result['type'] = 'ALL';
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {

      result['searchDateBy'] = this.selectedDate.dateType;
      result['type'] = this.selectedDate.type;
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
