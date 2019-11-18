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

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {MomentDatePipe} from '../../../common/pipe/moment.date.pipe';
import {AbstractComponent} from '../../../common/component/abstract.component';
import * as $ from 'jquery';
import {PageResult} from '../../../domain/common/page';
import {CommonUtil} from '../../../common/util/common.util';
import {AuditService} from '../service/audit.service';
import {ClipboardService} from 'ngx-clipboard';
import * as _ from "lodash";

@Component({
  selector: 'app-log-statistics-detail',
  templateUrl: './log-statistics.detail.component.html',
  providers: [MomentDatePipe]
})
export class LogStatisticsDetailComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 닫을떄
  @Output()
  public closeOutput = new EventEmitter();

  // 정렬
  @Output()
  public sortOutput = new EventEmitter();

  // 더보기
  @Output()
  public getMoreContentsOutput = new EventEmitter();

  // 테이블로 보여줄 데이터
  @Input()
  public statisticsData : any;

  // 정렬
  @Input()
  public selectedContentSort: Order;

  // 페이저 정보
  @Input()
  public pageResult : PageResult;

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  public isQueryDetailShow : boolean = false;

  public currentNumber : number;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _clipboardService: ClipboardService,
              protected auditService : AuditService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트 시작
   */
  public ngOnInit() {
    super.ngOnInit();

  } // function - onOnInit

  public ngOnChanges() {
    if (this.statisticsData.value === 'resource') {
      this.selectedContentSort.key === 'incrementMemorySeconds' ? this.selectedContentSort.key = 'sumMemorySeconds' :this.selectedContentSort.key = 'sumVCoreSeconds' ;
    } else if (this.statisticsData.value === 'success' || this.statisticsData.value === 'fail') {
      this.selectedContentSort.key = 'count';
    }
    this.changeSortKey(this.selectedContentSort.key);
    this.changeDetect.detectChanges();
  }


  /**
   * 컴포넌트 뷰 설정 이후 초기화
   */
  public ngAfterViewInit() {
    for (let i = 0 ; i < this.statisticsData.fields.length ; i++ ) {
      let col = document.createElement('col');
      col.width = this.statisticsData.fields[i].width;
      $('.tableColgroup').append("<col width=" + col.width + ">");
    }
    this.changeDetect.detectChanges();
  } // function - ngAfterViewInit


  /**
   * 컴포넌트 종료
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public CommonUtil = CommonUtil;


  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreContents(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;
    let data = {};
    switch(this.statisticsData.value) {
      case 'elapsedTime' :
        data = {
          names  : { name : 'msg.statistics.ui.longest', label : 'elapsedTime', arrayList : 'countQueryTimeList'},
          values : { name :'elapsedTime', sort : this.selectedContentSort.sort}
        };
        break;
      case 'numRows' :
        data = {
          names : { name : 'msg.statistics.ui.scan.data.volume', label : 'numRows', arrayList : 'countNumRowsList'},
          values : { name : 'numRows', sort : this.selectedContentSort.sort}
        };
        break;
      case 'incrementMemorySeconds' :
        data = {
          names : { name : 'msg.statistics.th.total.mem.usage', label : 'incrementMemorySeconds', arrayList : 'totalMemoryUsageList'},
          values : { name : 'incrementMemorySeconds', sort : this.selectedContentSort.sort}
        };
        break;
      case 'incrementVcoreSeconds' :
        data = {
          names : { name : 'msg.statistics.th.total.cpu.usage', label : 'incrementVcoreSeconds', arrayList : 'totalCPUUsageList'},
          values : { name : 'incrementVcoreSeconds', sort : this.selectedContentSort.sort}
        };
        break;
      case 'success' :
        data = {
          names : { name : 'msg.statistics.ui.query.success.frequency', label : 'success', arrayList : 'countSuccessList'},
          values : { name : 'status', status : 'SUCCESS', sort : this.selectedContentSort.sort}
        };
        break;
      case 'fail' :
        data = {
          names : { name : 'msg.statistics.ui.query.fail.frequency', label : 'fail', arrayList : 'countFailList'},
          values : { name : 'status', status : 'FAIL',sort : this.selectedContentSort.sort}
        };
        break;
      case 'resource' :
        data = {
          names : { name : 'msg.statistics.th.resource.usage', label : 'resource', arrayList : 'resourceList'},
          values : {name : 'resource', sort : this.page.sort}
        };
        break;
      default :
        data = {
          names : { name : 'Job log list - ' + this.statisticsData.value, label : 'user', arrayList : 'userList' , value : this.statisticsData.value},
          values : { sort : this.page.sort, user : this.statisticsData.value}
        };
        break;
    }

    data['values']['size'] = 15;
    data['values']['page'] = this.pageResult.number;

    this.getMoreContentsOutput.emit(data)
  }

  /**
   * Change Sorting key keyword, sumMemorySeconds,sumVCoreSeconds 를 바꿔줘야한다
   * @param data
   */
  public changeSortKey(data) {

    switch(data) {
      case 'keyword' :
        this.page.sort = 'queue'+ ',' + this.selectedContentSort.sort;
        break;
      case 'sumMemorySeconds' :
        this.page.sort = 'incrementMemorySeconds'+ ',' + this.selectedContentSort.sort;
        break;
      case 'sumVCoreSeconds' :
        this.page.sort = 'incrementVcoreSeconds'+ ',' + this.selectedContentSort.sort;
        break;
      default :
        this.page.sort = data + ',' + this.selectedContentSort.sort;
        break;
    }

  }

  /**
   * Sorting
   * @param data
   * @param index
   */
  public sortList(data, index) {
    this.pageResult.number = 0;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== data ? 'default' : this.selectedContentSort.sort;

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

    this.changeSortKey(data);

    if (this.statisticsData.fields.length === index + 1) {
      switch(this.statisticsData.value) {
        case 'elapsedTime' :
          this.sortOutput.emit({names : {name : 'msg.statistics.ui.longest', label : 'elapsedTime', arrayList : 'countQueryTimeList'}, values : {name :'elapsedTime',sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        case 'numRows' :
          this.sortOutput.emit({names : {name : 'msg.statistics.ui.scan.data.volume', label : 'numRows', arrayList : 'countNumRowsList'}, values : {name : 'numRows', sort : this.selectedContentSort.sort, size : 15 , page : this.pageResult.number} });
          return;
        case 'incrementMemorySeconds' :
          this.sortOutput.emit({names : {name : 'msg.statistics.th.total.mem.usage', label : 'incrementMemorySeconds', arrayList : 'totalMemoryUsageList'}, values : {name : 'incrementMemorySeconds',sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        case 'incrementVcoreSeconds' :
          this.sortOutput.emit({names : {name : 'msg.statistics.th.total.cpu.usage', label : 'incrementVcoreSeconds', arrayList : 'totalCPUUsageList'}, values : {name : 'incrementVcoreSeconds',sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        case 'success' :
          this.sortOutput.emit({names : {name : 'msg.statistics.ui.query.success.frequency', label : 'success', arrayList : 'countSuccessList'}, values : { name : 'status', status : 'SUCCESS',sort :this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        case 'fail' :
          this.sortOutput.emit({names : {name : 'msg.statistics.ui.query.fail.frequency', label : 'fail', arrayList : 'countFailList'}, values : { name : 'status', status : 'FAIL',sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        case 'resource' :
          this.sortOutput.emit({names : {name : 'msg.statistics.th.resource.usage', label : 'resource', arrayList : 'resourceList'}, values : {name : data === 'sumMemorySeconds' ? 'incrementMemorySeconds' : 'incrementVcoreSeconds', sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
          return;
        default :
          this.sortOutput.emit({names : {name : 'Job log list - ' + this.statisticsData.value, label : 'user', arrayList : 'userList' , value : this.statisticsData.value}, values : { sort : this.page.sort, user : this.statisticsData.value, size : 15 , page : this.pageResult.number} });
          return;
      }

    } else {
      console.info('not supposed to click --> ');
      if(this.statisticsData.value === 'resource') {
        this.sortOutput.emit({names : {name : 'msg.statistics.th.resource.usage', label : 'resource', arrayList : 'resourceList'}, values : {name : data === 'sumMemorySeconds' ? 'incrementMemorySeconds' : 'incrementVcoreSeconds', sort : this.selectedContentSort.sort, size : 15, page : this.pageResult.number} });
      } else if (this.statisticsData.value !== 'elapsedTime' && data === 'startTime') {
        this.sortOutput.emit({names : {name : 'Job log list - ' + this.statisticsData.value, label : 'user', arrayList : 'userList', value : this.statisticsData.value}, values : { sort : this.page.sort, user : this.statisticsData.value, size : 15, page : this.pageResult.number} });
      }
      return;
    }

  }

  /**
   * copy clipboard
   */
  public copyToClipboard(data) {
    this._clipboardService.copyFromContent( data );
  }

  /**
   * Close popup
   */
  public closePopup() {
    event.stopImmediatePropagation();
    this.isQueryDetailShow = false;
  }

  /**
   * Query popup open/close
   */
  public openQueryDetail(event,index) {
    event.stopImmediatePropagation();
    this.isQueryDetailShow = !this.isQueryDetailShow;
    if (this.isQueryDetailShow) {
      this.currentNumber = index
    }
  }

  /**
   * Check if data is long enough to open the query popup
   */
  public isDataLongEnough1(key , index?: number) : boolean {

    if (_.isNil(key) || _.isNil(index)) {
      return false;
    }

    return $('#' + index + key).width() >= $('#' + key).width() - 20;
  }


  /**
   * Check if data is long enough to open the query popup
   */
  public isDataLongEnough(key , id?) : boolean {
    if (id) {
      return $('#' + id).outerWidth() >= $('#'+key).outerWidth()-20;
    } else {
      return $('.ddp-data-logdet span').outerWidth() >= $('#'+key).outerWidth()-20;
    }
  }

  /**
   * Thousand separator
   * @param {number} data
   * @param {string} key
   * @return data or thousand separated value
   */
  public thousandSeparator(data : number, key: string) {
    if (key === 'sumVCoreSeconds' || key === 'sumMemorySeconds' || key === 'incrementVcoreSeconds' || key === 'incrementMemorySeconds' || key === 'numRows') {
      return CommonUtil.numberWithCommas(data)
    } else {
      return data
    }
  }

  /**
   * Navigate to audit detail page
   * @param data
   */
  public auditDetailOpen(data) {
    if(data.hasOwnProperty('id')) {
      this.auditService.previousRouter = '/management/monitoring/statistics';
      this.router.navigateByUrl('/management/monitoring/audit/' + data.id);
    }
  }

}

class Order {
  key: string = '';
  sort: string = '';
}

