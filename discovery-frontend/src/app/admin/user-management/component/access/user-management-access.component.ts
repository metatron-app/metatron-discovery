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

import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {PeriodData} from '@common/value/period.data.value';
import {PeriodComponent} from '@common/component/period/period.component';
import {AbstractUserManagementComponent} from '../../abstract.user-management.component';
import {Alert} from '@common/util/alert.util';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import {Activity} from '@domain/user/activity';

declare let moment: any;
const defaultSort = 'createdTime,desc';

@Component({
  selector: 'app-user-management-access',
  templateUrl: './user-management-access.component.html'
})

export class UserManagementAccessComponent extends AbstractUserManagementComponent implements OnInit {

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

  public activities: Activity[] = [];

  public action: string = 'ARRIVE,LEAVE';

  // date
  public selectedDate: PeriodData;

  // 검색어
  public searchKeyword: string;

  // 정렬
  public selectedContentSort: Order = new Order();

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  public initialPeriodData: PeriodData;

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
          (this.isNullOrUndefined(page)) || (this.page.page = page);

          const sort = params['sort'];
          if (!this.isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }

          const size = params['size'];
          (this.isNullOrUndefined(size)) || (this.page.size = size);

          // Status
          const action = params['action'];
          (this.isNullOrUndefined(action)) || (this.action = action);

          // 검색어
          const searchText = params['nameContains'];
          (this.isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

          const from = params['from'];
          const to = params['to'];

          this._filterDate = new PeriodData();
          this._filterDate.type = 'ALL';
          if (!this.isNullOrUndefined(from) && !this.isNullOrUndefined(to)) {
            this._filterDate.startDate = from;
            this._filterDate.endDate = to;
            this._filterDate.type = params['type'];

            this._filterDate.startDateStr = decodeURIComponent(from);
            this._filterDate.endDateStr = decodeURIComponent(to);
            this.initialPeriodData = this._filterDate;
            this.safelyDetectChanges();
          }
        }

        this.getAccessHistory();
      })
    );
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
    this.selectedContentSort.key = 'publishedTime';
    this.selectedContentSort.sort = 'desc';

  }

  public onFilterDate(data: PeriodData) {

    // 페이지 초기화
    this.page.page = 0;

    this.selectedDate = data;

    // 페이지 재 조회
    this.reloadPage();
  }

  public getAccessHistory(): void {

    this.loadingShow();

    this.activities = [];

    const params = this.setParam();
    this.membersService.getAccessHistory(params).then((result) => {

      this.loadingHide();

      this._searchParams = params;

      this.pageResult = result.page;

      this.activities = result['_embedded'] ? this.activities.concat(result['_embedded'].activities) : [];

    }).catch((error) => {
      this.loadingHide();
      Alert.warning(error.details);
    });
  }


  /**
   * action change
   * @param action all, ARRIVE, LEAVE
   */
  public changeAction(action?: string) {
    if (action) {
      // 페이지 초기화
      this.action = action;
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
      if (27 === event.keyCode) {
        this.searchKeyword = '';
      }
      this.reloadPage();
    }

  }

  /**
   * Refresh filters
   */
  public refreshFilters() {
    this.changeAction('ARRIVE,LEAVE');
    this.page.sort = defaultSort;
    this.searchKeyword = '';
    this.selectedDate = null;
    this.periodComponent.setAll();
    this.reloadPage();
  }


  /**
   * 정렬 바꿈
   * @param key 어떤 컬럼을 정렬 할 지
   */
  public sortList(key: string) {
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

  public clearSearchKeyword() {
    this.searchKeyword = '';
    this.reloadPage();
  } // function - clearSearchKeyword

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

    let result: object;

    // 페이지, 사이즈 설정
    result = {
      size: this.page.size,
      page: this.page.page,
      pseudoParam: (new Date()).getTime()
    };

    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      result['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }

    // nameContains
    if (this.searchKeyword) {
      result['nameContains'] = this.searchKeyword;
    }

    // date
    result['action'] = this.action;
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {

      result['searchDateBy'] = this.selectedDate.dateType;
      result['type'] = this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        result['from'] = moment(this.selectedDate.startDateStr).subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
      }
      result['to'] = moment(this.selectedDate.endDateStr).subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
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
  key: string = 'publishedTime';
  sort: string = 'default';
}
