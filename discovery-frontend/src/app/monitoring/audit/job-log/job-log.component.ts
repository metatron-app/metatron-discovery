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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import {AbstractComponent} from '../../../common/component/abstract.component';
import {AuditService} from '../service/audit.service';
import {Alert} from '../../../common/util/alert.util';
import {Audit} from '../../../domain/audit/audit';
import {MomentDatePipe} from '../../../common/pipe/moment.date.pipe';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {CommonConstant} from '../../../common/constant/common.constant';
import {CommonUtil} from '../../../common/util/common.util';
import {PeriodData} from "../../../common/value/period.data.value";
import {PeriodComponent} from "../../../common/component/period/period.component";

import {isNullOrUndefined} from "util";
import * as _ from 'lodash';

declare let moment: any;


@Component({
  selector: 'app-job-log',
  templateUrl: './job-log.component.html',
  providers: [MomentDatePipe]
})
export class JobLogComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 선택된 캘린더
  public selectedDate: PeriodData;

  // audit 리스트
  public auditList: Audit[] = [];

  // status types
  public statusTypes: any[];
  public selectedStatus: any;

  // types
  public types: any[];
  public selectedType: any;

  // 검색어
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  // 팝업 모드
  public mode: string;

  public selectedElapsedTime : any;

  public CommonUtil = CommonUtil;

  @ViewChild('elapsedTime')
  public elapsedTime : ElementRef;

  public logTypeDefaultIndex: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private auditService: AuditService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    super.ngOnInit();

    // ui init
    this.initView();

    this.subscriptions.push(
      // Get query param from url
      this.activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['searchKeyword'])) {
            this.searchText = params['searchKeyword'];
          }

          // status
          let index = 0;
          if (!isNullOrUndefined(params['status'])) {
            index = this.statusTypes.findIndex((item) => {
              return item.value.toLowerCase() === params['status'].toLowerCase()
            });
          }
          this.selectedStatus = this.statusTypes[index];

          // log type
          let idx = 0;
          if (!isNullOrUndefined(params['type'])) {
            idx = this.types.findIndex((item) => {
              return item.value.toLowerCase() === params['type'].toLowerCase()
            });
          }
          this.selectedType = this.types[idx];
          this.logTypeDefaultIndex = idx;

          // sort
          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }

          // elapsed time
          if (!isNullOrUndefined(params['elapsedTime'])) {
            const sec = ["10", "30", "60"];
            this.selectedElapsedTime = Number(params['elapsedTime']);
            if (sec.indexOf(params['elapsedTime']) === -1) {
              this.elapsedTime.nativeElement.value = this.selectedElapsedTime;
            }
          } else {
            this.selectedElapsedTime = 'ALL';
          }

          // Date
          const from = params['from'];
          const to = params['to'];
          this.selectedDate = new PeriodData();
          this.selectedDate.type = 'ALL';
          if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
            this.selectedDate.startDate = from;
            this.selectedDate.endDate = to;
            this.selectedDate.dateType = 'CREATED';
            this.selectedDate.startDateStr = decodeURIComponent(from);
            this.selectedDate.endDateStr = decodeURIComponent(to);
            this.selectedDate.type = params['dateType'];
            this.safelyDetectChanges();
          }
        }

        this.getAuditList();
      })
    )

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 워크스페이스 조회
      this.reloadPage(false);
    }
  }


  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this.getAuditRequestParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  }


  /**
   * audit 상세보기 오픈
   * @param {string} id
   */
  public auditDetailOpen(id: string) {
    // 페이지 이동
    this.router.navigateByUrl('/management/monitoring/audit/' + id);
  }


  /**
   * 타입 필터링 변경 이벤트
   */
  public onChangeType(event) {

    // type 변경
    this.selectedType = event;

    this.reloadPage();
  }

  /**
   * 캘린더 선택 이벤트
   * @param event
   */
  public onChangeDate(event) {

    this.selectedDate = event;

    this.reloadPage();
  }

  /**
   * 검색 이벤트
   */
  public search() {

    this.reloadPage();

  }


  /**
   * status 정렬 필터링
   * @param status
   */
  public onChangeStatus(status) {

    this.selectedStatus = status;

    this.reloadPage();
  }


  /**
   * 정렬 필터링
   * @param {string} key
   */
  public sort(key: string) {

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

    this.reloadPage();
  }


  /**
   * Refresh filters
   */
  public refreshFilters() {

    // 정렬
    this.selectedContentSort = new Order();

    // create date 초기화
    this.selectedDate = null;

    // 검색조건 초기화
    this.searchText = '';

    this.periodComponent.setAll();

    this.selectedType = this.types[0];
    this.logTypeDefaultIndex = 0;

    this.onChangeStatus(this.statusTypes[0]);

    this.onClickElapsedTime('ALL');

    this.reloadPage();

  }

  /**
   * On click of elapsed time
   * @param time
   */
  public onClickElapsedTime(time?: string|number) {

    if(time) {

      this.elapsedTime.nativeElement.value = '';
      this.selectedElapsedTime = time;

    } else {

      this.selectedElapsedTime = this.elapsedTime.nativeElement.value;

    }

    this.reloadPage();
  }

  /**
   * Csv download
   */
  public downloadCsv() {

    if (this.auditList.length === 0) {
      return;
    }

    let url = CommonConstant.API_CONSTANT.API_URL + `audits/download`;
    let params = {};

    if (this.searchText) {
      params = {
        searchKeyword : this.searchText
      }
    }
    // status
    if (this.selectedStatus.value !== 'all') {
      params['status'] = this.selectedStatus.value;
    }
    // type
    if (this.selectedType.value !== 'all') {
      params['type'] = this.selectedType.value;
    }

    if (this.selectedElapsedTime !== 'ALL') {
      params['elapsedTime'] = Number(this.selectedElapsedTime);
    }

    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }

    try {
      const form = document.getElementsByTagName('form');
      const inputs = form[0].getElementsByTagName('input');
      inputs[0].value = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
      inputs[1].value = 'job_log_list';
      const downloadCsvForm = $('#downloadCsvForm');
      downloadCsvForm.attr('action', url);
      downloadCsvForm.submit();
    } catch (e) {
      // 재현이 되지 않음.
      console.info('Download error : ' + e);
    }
  }


  /**
   * Elapsed time keyup event
   */
  public elapsedTimeKeyup() {

    // Remove selected btn
    this.selectedElapsedTime = '';

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private initView() {

    this.types = [
      { label: 'All', value: 'all' },
      { label: 'Workbench Query', value: 'QUERY' },
      { label : 'Workbench Others', value : 'JOB'}

    ];
    this.selectedType = this.types[0];

    this.statusTypes = [
      { label: 'All', value: 'all' },
      { label: 'Success', value: 'SUCCESS' },
      { label: 'Running', value: 'RUNNING' },
      { label: 'Cancelled', value: 'CANCELLED' },
      { label: 'Fail', value: 'FAIL' }
    ];
    this.selectedStatus = this.statusTypes[0];
    this.selectedElapsedTime = 'ALL';
  }


  /**
   * audit list request params
   * @returns {page: number; size: number}
   */
  private getAuditRequestParams() : any{
    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime()
    };
    // 이름
    if (this.searchText !== '') {
      params['searchKeyword'] = this.searchText;
    }
    // status
    if (this.selectedStatus.value !== 'all') {
      params['status'] = this.selectedStatus.value;
    }
    // type
    if (this.selectedType.value !== 'all') {
      params['type'] = this.selectedType.value;
    }
    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['dateType']= this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    // sort
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }

    if (this.selectedElapsedTime !== 'ALL') {
      params['elapsedTime'] = this.selectedElapsedTime;
    }

    return params;
  }

  /**
   * audit 리스트 조회
   */
  private getAuditList() {
    // 로딩 시작
    this.loadingShow();

    const params = this.getAuditRequestParams();

    this.auditList = [];

    this.auditService.getAuditList(params)
      .then((result) => {

        this._searchParams = params;

        // page
        this.pageResult = result.page;

        // 리스트 존재 시
        this.auditList = result['_embedded'] ? this.auditList.concat(result['_embedded'].audits) : [];

        // 로딩 종료
        this.loadingHide();
      })
      .catch((error) => {
        Alert.error(error);
        // 로딩 종료
        this.loadingHide();
      });
  }



}

class Order {
  key: string = 'startTime';
  sort: string = 'desc';
}

