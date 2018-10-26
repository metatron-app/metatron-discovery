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
import { AbstractComponent } from '../../../common/component/abstract.component';
import { AuditService } from '../service/audit.service';
import { Alert } from '../../../common/util/alert.util';
import { Audit } from '../../../domain/audit/audit';
import { MomentDatePipe } from '../../../common/pipe/moment.date.pipe';
import { isUndefined } from "util";
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { CommonConstant } from '../../../common/constant/common.constant';
import { CookieService } from 'ng2-cookies';
import { CommonUtil } from '../../../common/util/common.util';
import { ElapsedTime } from '../../../domain/data-preparation/data-snapshot';
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

  // 선택된 캘린더
  private selectedDate: Date;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  public elapsedTimeInput: any;

  @ViewChild('elapsedTime')
  public elapsedTime : ElementRef;
  // public defaultElapsedSeconds : ElapsedSeconds = ElapsedSeconds.ALL;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private auditService: AuditService,
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

    // 리스트 조회
    this.getAuditList();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public convertMilliseconds:Function = CommonUtil.convertMilliseconds;

  /**
   * 더 조회할 리스트가 있는지 여부
   * @returns {boolean}
   */
  public get checkMoreContents(): boolean {
    if (this.pageResult.number < this.pageResult.totalPages - 1) {
      return true;
    }
    return false;
  }

  /**
   * audit 상세보기 오픈
   * @param {string} id
   */
  public auditDetailOpen(id: string) {
    // 페이지 이동
    this.router.navigateByUrl('/management/monitoring/audit/' + id);
    // this.mode = 'detail-job-log';
    // this.selectedId = id;
  }

  /**
   * 쿼리 리스트 컨텐츠 조회
   */
  public moreAuditList() {

    // 페이지 초기화
    this.pageResult.number += 1;

    // 리스트 재조회
    this.getAuditList();
  }

  /**
   * 타입 필터링 변경 이벤트
   */
  public onChangeType(event) {

    // type 변경
    this.selectedType = event;

    // 페이지 초기화
    this.pageResult.number = 0;

    // 리스트 재조회
    this.getAuditList();
  }

  /**
   * 캘린더 선택 이벤트
   * @param event
   */
  public onChangeDate(event) {

    // 페이지 초기화
    this.pageResult.number = 0;

    this.selectedDate = event;

    // 리스트 재조회
    this.getAuditList();
  }

  /**
   * 검색 이벤트
   * @param event
   */
  public search(event : KeyboardEvent) {

    if ( 13 === event.keyCode) {

      // 페이지 초기화
      this.pageResult.number = 0;
      // 리스트 재조회
      this.getAuditList();

    } else if ( 27 === event.keyCode ) {

      this.searchText = '';
      // 페이지 초기화
      this.pageResult.number = 0;
      // 리스트 재조회
      this.getAuditList();
    }

  }


  /**
   * status 정렬 필터링
   * @param status
   */
  public onChangeStatus(status) {
    this.selectedStatus = status;

    // 페이지 초기화
    this.pageResult.number = 0;

    // 리스트 재조회
    this.getAuditList();
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

    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this.getAuditList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private initView() {

    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;

    this.types = [
      { label: 'All', value: 'all' },
      { label: 'Workbench Query', value: 'QUERY' },
      { label : 'Workbench Others', value : 'JOB'}

    ];
    this.selectedType = this.types[0];

    this.statusTypes = [
      { label: 'All', value: 'all' },
      { label: 'Success', value: 'SUCCESS' },
      { label: 'Fail', value: 'FAIL' }
    ];
    this.selectedStatus = this.statusTypes[0];
    this.selectedElapsedTime = 'ALL';
  }


  /**
   * audit list request params
   * @returns {page: number; size: number}
   */
  private getAuditRequestParams() {
    const params = {
      page: this.pageResult.number,
      size: this.pageResult.size
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
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
      }
      params['to'] = moment(this.selectedDate.endDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
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

    this.auditService.getAuditList(this.getAuditRequestParams())
      .then((result) => {

        // page
        this.pageResult = result.page;

        // 페이지가 첫번째면
        if (result.page.number === 0) {
          this.auditList = [];
        }

        // 리스트 존재 시
        this.auditList = result['_embedded'] ? this.auditList.concat(result['_embedded'].audits) : [];

        this.auditList.forEach((item: Audit, idx: number) => {
          item.num = this.pageResult.totalElements - idx;
        });

        // 로딩 종료
        this.loadingHide();
      })
      .catch((error) => {
        Alert.error(error);
        // 로딩 종료
        this.loadingHide();
      });
  }

  public applyElapsedTime(time?:any) {
    if(time) {
      this.elapsedTime.nativeElement.value = '';
      this.selectedElapsedTime = time;

      // 페이지 초기화
      this.pageResult.number = 0;
      this.auditList = [];
      this.getAuditList();
    } else {
      this.selectedElapsedTime = this.elapsedTime.nativeElement.value;
      // 페이지 초기화
      this.pageResult.number = 0;
      this.auditList = [];
      this.getAuditList();
    }

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
        params['from'] = moment(this.selectedDate.startDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
      }
      params['to'] = moment(this.selectedDate.endDateStr).subtract(9,'hours').format('YYYY-MM-DDTHH:mm:ss.sss')+'Z';
    }

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }

    // console.info('url --> ', url);

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

  public elapsedTimeKeyup(event) {
    this.selectedElapsedTime = '';

  }
}

class Order {
  key: string = 'startTime';
  sort: string = 'desc';
}

class Date {
  // dateType : string;
  endDateStr: string;
  startDateStr: string;
  type: string;
}
