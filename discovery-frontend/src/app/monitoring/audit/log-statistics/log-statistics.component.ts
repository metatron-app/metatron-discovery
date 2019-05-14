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
  AfterViewInit,
  ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnChanges, OnDestroy, OnInit, Output, Renderer2,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { AuditService } from '../service/audit.service';
declare let moment: any;
import * as _ from 'lodash';
import { MomentDatePipe } from '../../../common/pipe/moment.date.pipe';
import { Alert } from '../../../common/util/alert.util';
import { PageResult } from '../../../domain/common/page';
import { isUndefined } from 'util';
import { CommonUtil } from '../../../common/util/common.util';
import {PeriodData} from "../../../common/value/period.data.value";

declare let echarts: any;

@Component({
  selector: 'app-log-statistics',
  templateUrl: './log-statistics.component.html',
  providers: [MomentDatePipe]
})
export class LogStatisticsComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('dailyJobRateChart')
  private _dailyJobRateChart: ElementRef;

  @ViewChild('queryDistributeChart')
  private _queryDistributeChart: ElementRef;

  private _defaultChartOptions: any = {
    backgroundColor: '#ffffff',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: '5%', left: '2%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ nameLocation: 'middle', nameGap: '30' }],
    yAxis: [{ nameLocation: 'middle', nameGap: '30', type: 'value' }],
    series: []
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 쿼리 데이터 리스트
  public queryLists: StatisticsList = new StatisticsList();

  // 팝업 모드
  public mode: string;

  // 디테일 팝업 show/hide 여부
  public isDetailPopupOpen : boolean = false;

  // 검색어
  public searchText : string = '';

  // Select box task type array
  public taskType : any = [];

  // selected data from task type
  public selectedType : string;

  // 선택된 날짜
  private selectedDate: PeriodData;

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  // 디테일 페이지로 넘길 데이터들
  public statisticsData : any;
  public type : string;
  public chart : any;
  public queryChart : any;
  public timer : any;

  // table headers for detail page
  public tableFields : any;

  // table data for detail page
  public tableData: any;

  // temp data
  public detailData : any;

  // 선택된 sorting order
  public selectedContentSort: Order = new Order();

  // Result Page
  public pageResult: PageResult = new PageResult();

  // selectedContentSort.key + ','selectedContentSort.sort
  public combinedSort : string = '';
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private auditService: AuditService, protected renderer: Renderer2,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트 시작
   */
  public ngOnInit() {
    super.ngOnInit();

    this.taskType = [
      {label : 'All', value : 'ALL'},
      {label : 'Workbench Query', value : 'QUERY'},
      {label : 'Workbench Others', value : 'JOB'}
    ];

    // Default value is ALL
    this.selectedType = this.taskType[0].value;

    this.pageResult.number = 0;
    this.pageResult.size = 5;
  } // function - onOnInit

  /**
   * 컴포넌트 뷰 설정 이후 초기화
   */
  public ngAfterViewInit() {

    this.changeDetect.detectChanges();

  } // function - ngAfterViewInit

  public ngOnChanges() {
    // 데이터 조회
    this.getStatisticData();
  }

  /**
   * 컴포넌트 종료
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
    this.renderer.removeStyle(document.body, 'overflow');
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public convertMilliseconds:Function = CommonUtil.convertMilliseconds;

  /**
   * audit 상세보기 오픈
   * @param {string} id
   */
  public auditDetailOpen(id: string) {
    this._savePrevRouterUrl();
    this.router.navigateByUrl('/management/monitoring/audit/' + id);
  }

  /**
   * 현재 url을 쿠키서비스에 저장
   * @private
   */
  private _savePrevRouterUrl(): void {
    this.auditService.previousRouter = '/management/monitoring/statistics';
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 조회
   */
  private getStatisticData() {
    // 로딩 시작
    this.loadingShow();
    const promise = [];
    // 차트 생성

    // 일별 쿼리 성공/실패률
    promise.push(this._getDailyJobRate());

    // 오늘 사용자 별 쿼리 빈도수
    promise.push(this._getQueryDistributeByUser({name :'count', sort : 'desc'}));

    // 오래 걸린순 조회
    promise.push(this.getQueryListByTimeOrRows('countQueryTimeList',{name :'elapsedTime', sort : 'desc'} , false));

    // 스캔 데이터량 조회
    promise.push(this.getQueryListByTimeOrRows('countNumRowsList',{ name : 'numRows', sort : 'desc'} , false));

    // 총 메모리 사용량
    promise.push(this.getQueryListByTimeOrRows('totalMemoryUsageList',{ name : 'incrementMemorySeconds', sort : 'desc'}  , false));

    // 총 CPU 사용량
    promise.push(this.getQueryListByTimeOrRows('totalCPUUsageList',{ name : 'incrementVcoreSeconds', sort : 'desc'} , false));

    // 쿼리 성공빈도 조회
    promise.push(this.getQueryListByStatus('countSuccessList',{ name : 'status', status: 'SUCCESS', sort : 'desc'}, false));

    // 쿼리 실패빈도 조회
    promise.push(this.getQueryListByStatus('countFailList',{  name : 'status', status: 'FAIL', sort : 'desc'} , false));

    // 쿼리 리소스 조회
    promise.push(this.getQueryListByResource('resourceList', { name : 'incrementMemorySeconds', sort : 'desc'} , false));

    Promise.all(promise).then(() => {
      // 로딩 종료
      this.loadingHide();
    }).catch(() => {
      // 로딩 종료
      this.loadingHide();
    });
  } // function - getStatisticData


  /**
   * selectedContentSort.key 와 selectedContentSort.sort를 합침
   * @param name (key)
   * @param sort (desc or asc)
   */
  public getCombinedSort(name,sort) {
    this.combinedSort = name + ',' + sort;
  }

  /**
   * 시간별 쿼리 성공/실패률
   * @private
   */
  private _getDailyJobRate() {
    return new Promise<any>((resolve, reject) => {
      this.auditService.getDailyJobSuccessRate(this.getLogStatisticsParams('successRate')).then(result => {
        if (result) {
          this.queryChart = echarts.init(this._dailyJobRateChart.nativeElement);
          const returnFormat = 'YYYY-MM-DD';
          let xAxisData = result.x.map(item => moment(item).format(returnFormat));
          let option: any = _.merge({}, this._defaultChartOptions, {
            xAxis: [{ name: 'Date', axisName: 'Date', data: xAxisData }],
            yAxis: [{ name: 'Count', axisName: 'Count' }],
            series: [
              {
                name: 'Success', type: 'bar', stack: 'count', data: result.series.SUCCESS,
                itemStyle: { normal: { color: '#4c92e0' } }
              },
              {
                name: 'Fail', type: 'bar', stack: 'count', data: result.series.FAIL,
                itemStyle: { normal: { color: '#eb5f58' } }
              }
            ]
          });
          this.queryChart.setOption(option);
          this.queryChart.resize();
        }
        resolve();
      }).catch((err) => reject(err));
    });
  } // function - _getDailyJobRate

  /**
   * 오늘 사용자 별 쿼리 빈도 수
   * @private
   */
  private _getQueryDistributeByUser(params) {
    let keys = [];
    return new Promise<any>((resolve, reject) => {
      this.getCombinedSort(params.name,params.sort);
      this.auditService.getQueryDistributionByUser(this.getLogStatisticsParams()).then(data => {
        this.chart = echarts.init(this._queryDistributeChart.nativeElement);
        keys = Object.keys(data);
        let values = Object.keys(data).map(key => data[key]);
        let option: any = _.merge({}, this._defaultChartOptions, {
          xAxis: [{ name: 'Person', axisName: 'Person', data: keys }],
          yAxis: [{ name: 'Count', axisName: 'Count' }],
          series: [{
            type: 'bar',
            data: values,
            itemStyle: { normal: { color: '#666eb2' } }
          }]
        });
        // use configuration item and data specified to show chart
        this.chart.setOption(option);
        this.chart.off('click');
        this.chart.on('click', (params) => {
          if (params) {
            let idx = params['dataIndex'];
            this.openPopupDetail({name : 'Job log list - ' + keys[idx], label : 'user', arrayList : 'userList', value : keys[idx]}, { sort : 'startTime,desc', user : keys[idx], size : 15 })
          }
        });
        this.chart.resize();
        resolve();
      }).catch((err) => reject(err));
    });
  } // function - _getQueryDistributeByUser

  /**
   * 쿼리 성공 빈도로 조회
   * @param {string} arrayName this.queryList[어떤 리스트 사용할지]
   * @param {string} params {status , size}
   * @param {boolean} isDetail Detail 페이지를 위한 API 호출 여부
   */
  private getQueryListByStatus(arrayName, params, isDetail?) {
    return new Promise<any>((resolve, reject) => {
      this.getCombinedSort(params.name, params.sort);
      this.auditService.getQueryListByStatus(this.getLogStatisticsParams('auditStatus', params))
        .then((result) => {
            if (result['_embedded']) {
              this.pageResult = result.page;
              this.getSortOrder(this.combinedSort);

              if (isDetail) {
                if (this.pageResult.number === 0) {
                  this.detailData = [];
                }
                // 데이터 있다면
                this.detailData = this.detailData ? this.detailData.concat(result._embedded.auditStatsDtoes) : [];
              } else {
                this.queryLists[arrayName] = result._embedded.auditStatsDtoes;
              }

            } else {
              isDetail ? this.detailData = [] : this.queryLists[arrayName] = [];
              this.pageResult = new PageResult();
            }
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  } // function - getQueryListByStatus


  /**
   * 걸린시간 과 데이터량으로 조회
   * @param {string} arrayName this.queryList[어떤 리스트 사용할지]
   * @param {string} params {name}
   * @param {boolean} isDetail Detail페이지를 위한 API 호출 여부
   */
  public getQueryListByTimeOrRows(arrayName, params : any, isDetail? : boolean) {
    return new Promise<any>((resolve, reject) => {

      this.getCombinedSort(params.name,params.sort);
      this.auditService.getQueryListBySort(this.getLogStatisticsParams()).then((result) => {

        if (result['_embedded']) {

          if (isDetail) {
            if (this.pageResult.number === 0) {
              this.detailData = [];
            }
            // 데이터 있다면
            this.detailData = this.detailData ? this.detailData.concat(result._embedded.audits) : [];
          } else {
            this.queryLists[arrayName] = result._embedded.audits;
          }
          this.pageResult = result.page;
          this.getSortOrder(this.combinedSort);

        } else {
          isDetail ? this.detailData = [] : this.queryLists[arrayName] = [];
          this.pageResult = new PageResult();

        }

        resolve();
      }).catch((err) => reject(err));
    });
  } // function - getQueryListByTimeOrRows

  /**
   * key,sort 가 붙어있는 것을 this.selectedContentSort.key 와 this.selectedContentSort.sort 로 분리한다
   * @param {string} combinedSort
   */
  public getSortOrder(combinedSort) {

    let sort = combinedSort.split(',');

    this.selectedContentSort.key = sort[0];
    this.selectedContentSort.sort = sort[1];
  }
  /**
   * Queue 별 리소스 사용량
   * @param {string} arrayName this.queryList[어떤 리스트 사용할지]
   * @param {string} params {size}
   * @param {boolean} isDetail Detail 페이지를 위한 API 호출 여부
   */
  private getQueryListByResource(arrayName, params, isDetail?) {
    return new Promise<any>((resolve, reject) => {
      this.getCombinedSort(params.name,params.sort);
      this.auditService.getQueryListByResource(this.getLogStatisticsParams())
        .then((result) => {

          if (result['_embedded']) {
            this.pageResult = result.page;
            this.getSortOrder(this.combinedSort);

            if (isDetail) {
              if (this.pageResult.number === 0) {
                this.detailData = [];
              }
              // 데이터 있다면
              this.detailData = this.detailData ? this.detailData.concat(result._embedded.auditStatsDtoes) : [];
            } else {
              this.queryLists[arrayName] = result._embedded.auditStatsDtoes;
            }


          } else {
            isDetail ? this.detailData = [] : this.queryLists[arrayName] = [];
            this.pageResult = new PageResult();
          }
          resolve();
        }).catch((err) => {
        reject(err);
      });
    });
  } // function - getQueryListByStatus


  /**
   * audit list request params
   * @param name
   * @param param
   */
  private getLogStatisticsParams(name?:string, param?) {

    const params = {};

    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    // type
    if (this.selectedType !== 'ALL') {
      params['type'] = this.selectedType;
    }

    // 검색어
    if (this.searchText !== '') {
      params['user'] = this.searchText;
    }

    if(name !== 'successRate') {

      // 한 페이지에 보여줄 개수 = 15 개씩 보여준다
      params['size']= ( this.pageResult.size ) ? this.pageResult.size : 5;

      // 몇번째 페이지 인지 처음은 0
      if (isUndefined(this.pageResult.number)){
        this.pageResult.number = 0;
      }
      params['page']=this.pageResult.number;

      // sorting
      params['sort']=this.combinedSort;

    }

    // success or fail
    if (name === 'auditStatus') {
      params[name] = param.status;
    }

    return params;
  }

  /**
   * Task type select box is selected
   * @param data - all or query
   */
  public onChangeTaskType(data) {
    this.selectedType = data.value;
    this.getStatisticData();

  }

  /**
   * 캘린더 선택 이벤트
   * @param event
   */
  public onChangeDate(event) {
    this.selectedDate = event;
    this.pageResult.number = 0;
    this.pageResult.size = 5;
    this.getStatisticData();

  }

  /**
   * Detail popup에서 sorting을 눌렀을 때
   * @param data
   */
  public sortDetail(data) {
    this.openPopupDetail(data.names, data.values)
  }

  /**
   * 검색 이벤트
   */
  public search() {
    this.getStatisticData();
  }

  public getMoreContents(event) {

    if (event.values.name === 'resource') {
      let key = event.values.sort.split(',')[0];
      let sort = event.values.sort.split(',')[1];
      event.values.name = key;
      event.values.sort = sort;
    }
    this.openPopupDetail(event.names, event.values);


  }

  /**
   * 디테일 페이지 창 오픈
   * @param names {any} {name : 번역 키 값, label : 특정 list 를 구별하기 위한 값, arrayList : this.querList[여기 값] }
   * @param params {any} {sort, size, status 등}
   */
  public openPopupDetail(names, params) {

    this.loadingShow();
    this.pageResult.size = params.size;

    if (names.label === 'elapsedTime' || names.label === 'numRows'  || names.label === 'incrementMemorySeconds' || names.label === 'incrementVcoreSeconds' ) {
      // 로딩 시작
      this.getQueryListByTimeOrRows(names.arrayList, params, true).then(() => {
        // 로딩 종료
        this.loadingHide();
        this.isDetailPopupOpen = true;
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
        this.getSortOrder(this.combinedSort);
        this.tableFields = this.getTableFields(names.label);
        this.tableData = this.detailData;
        this.statisticsData = {
          fields : this.tableFields,
          data   : this.tableData,
          name : names.name,
          value : names.label
        };

      }).catch((error) => {
        Alert.warning(error);
        this.loadingHide();
        // 로딩 종료
      });

    } else if (names.label === 'success' || names.label === 'fail') {
      // 로딩 시작
      this.getQueryListByStatus(names.arrayList, params, true).then(() => {
        this.isDetailPopupOpen = true;
        this.loadingHide();

        // 로딩 종료
        this.renderer.setStyle(document.body, 'overflow', 'hidden');

        this.tableFields = this.getTableFields(names.label);
        this.tableData = this.detailData;

        this.statisticsData = {
          fields : this.tableFields,
          data   : this.tableData,
          name : names.name,
          value : names.label
        };

      }).catch((error) => {
        this.loadingHide();
        Alert.warning(error);
        // 로딩 종료
      });

    } else if(names.label === 'user') {

      this.auditService.getAuditList(params).then((result) => {

        this.isDetailPopupOpen = true;
        this.loadingHide();
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
        if (result._embedded) {
          this.pageResult = result.page;

          this.getSortOrder(params.sort);

          if (this.pageResult.number === 0) {
            this.tableData = [];
          }
          // 데이터 있다면
          this.tableData = result._embedded.audits ? this.tableData.concat(result._embedded.audits) : [];
          // this.tableData = result._embedded.audits;
          this.tableFields = this.getTableFields(names.label);

          this.tableData.forEach((item) => {
            item.isUser = true;
          });
          this.statisticsData = {
            fields : this.tableFields,
            data   : this.tableData,
            name : names.name,
            value : names.value
          };
        } else {
          this.pageResult = new PageResult();
        }


      }).catch((error) => {
        this.loadingHide();
      });
    } else {
      // 로딩 시작
      this.getQueryListByResource(names.arrayList, params, true).then(() => {
        // 로딩 종료

        this.isDetailPopupOpen = true;
        this.loadingHide();
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
        this.tableFields = this.getTableFields(names.label);
        this.tableData = this.detailData;

        this.statisticsData = {
          fields : this.tableFields,
          data   : this.tableData,
          name : names.name,
          value : names.label,
          params : params
        };

      }).catch((error) => {
        Alert.warning(error);
        this.loadingHide();
        // 로딩 종료
      });

    }

  }

  /**
   * Close detail page
   */
  public closeDetail() {
    this.isDetailPopupOpen = false;
    this.pageResult.size = 5 ;
    this.pageResult.number = 0;
    this.combinedSort = '';
    this.renderer.removeStyle(document.body, 'overflow');
  }

  // TOdo: still working on it
  /**
   * Get fields (columns)
   * params listType 리스트에 따라 컬럼들이 다르다.
   */
  public getTableFields(listType: string) {

    const getQueryListByTimeOrRows = [
         { name : this.translateService.instant('msg.statistics.th.query'),         key : 'jobName'      , width : '*' },
         { name : this.translateService.instant('msg.statistics.th.query.time'),    key : 'startTime'    , width : '18%' },
         { name : this.translateService.instant('msg.statistics.th.user'),          key : 'user'         , width : '18%' },
         { name : this.translateService.instant('msg.statistics.th.result'),        key : 'status'       , width : '10%' },
      ];

    const getQueryListByStatus = [
         { name : this.translateService.instant('msg.statistics.th.query'),         key : 'keyword', width: '*' },
         { name : this.translateService.instant('msg.statistics.th.count'),         key : 'count' , width : '30%' }
      ];

    const getQueryListByMemory = [
      { name : this.translateService.instant('msg.statistics.th.query'),            key : 'query' , width: '*' },
      { name : this.translateService.instant('msg.log.th.application.id'),          key : 'applicationId' , width: '15%' },
      { name : this.translateService.instant('msg.log.th.queue'),                   key : 'queue' , width: '15%'},
      { name : this.translateService.instant('msg.statistics.th.memory'),           key : 'incrementMemorySeconds' , width: '10%'}
    ];

    const getQueryListByCPU = [
      { name : this.translateService.instant('msg.statistics.th.query'),           key : 'query' , width: '*' },
      { name : this.translateService.instant('msg.log.th.application.id'),         key : 'applicationId' , width: '15%' },
      { name : this.translateService.instant('msg.log.th.queue'),                  key : 'queue' , width: '15%'},
      { name : this.translateService.instant('msg.statistics.th.cpu'),             key : 'incrementVcoreSeconds' , width: '10%'}
    ];

    const getQueryListByResource = [
      { name : this.translateService.instant('msg.log.th.queue'),                key : 'keyword' , width: '*'},
      { name : this.translateService.instant('msg.statistics.th.mem.usage'),     key : 'sumMemorySeconds' , width: '18%'},
      { name : this.translateService.instant('msg.statistics.th.cpu.usage'),     key : 'sumVCoreSeconds' , width: '18%'}
    ];

    const jobLog = [
      { name : this.translateService.instant('msg.log.th.job.name'),          key : 'jobName' , width: '*'},
      { name : this.translateService.instant('msg.log.th.application.id'),    key : 'applicationId' , width: '15%'},
      { name : this.translateService.instant('msg.log.th.queue'),             key : 'queue' , width: '10%'},
      { name : this.translateService.instant('msg.log.th.status'),            key : 'status' , width: '10%'},
      { name : this.translateService.instant('msg.log.th.started.time'),      key : 'startTime' , width: '10%'},
      { name : this.translateService.instant('msg.log.th.elapsed.time'),      key : 'elapsedTime' , width: '10%'},
    ];

    switch(listType) {
      case 'elapsedTime':
        getQueryListByTimeOrRows.push({ name : this.translateService.instant('msg.log.th.elapsed.time'),  key : 'elapsedTime'  , width : '15%' });
        return getQueryListByTimeOrRows;
      case 'numRows':
        getQueryListByTimeOrRows.push({ name : this.translateService.instant('msg.statistics.th.count'),  key : 'numRows'  , width : '10%' });
        return getQueryListByTimeOrRows;
      case 'incrementMemorySeconds':
        return getQueryListByMemory;
      case 'incrementVcoreSeconds' :
        return getQueryListByCPU;
      case 'success' :
        return getQueryListByStatus;
      case 'fail' :
        return getQueryListByStatus;
      case 'resource' :
        return getQueryListByResource;
      case 'user' :
        return jobLog;
    }

  }


  /**
   * 차트 Resize
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    clearTimeout(this.timer);
    // 그리드스터에서 애니매이션이 있어서 딜레이가 필요...
    this.timer = setTimeout(
      () => {
        // 일별 쿼리 성공/실패률
        this.queryChart.resize();
        this.chart.resize();
      },
      1000);
  }

}

class StatisticsList {
  // 오래걸리는 순
  public countQueryTimeList: any[] = [];

  // 스캔 데이터량
  public countNumRowsList: any[] = [];

  // 쿼리 성공 빈도
  public countSuccessList: any[] = [];

  // 쿼리 실패 빈도
  public countFailList: any[] = [];

  // query 별 리소스 사용량
  public resourceList : any[] = [];

  // 총 메모리 사용량
  public totalMemoryUsageList : any[] = [];

  // 총 CPU 사용량
  public totalCPUUsageList : any[] = [];

  // User List
  public userList : any[] = [];
}


class Order {
  key: string = '';
  sort: string = '';
}
