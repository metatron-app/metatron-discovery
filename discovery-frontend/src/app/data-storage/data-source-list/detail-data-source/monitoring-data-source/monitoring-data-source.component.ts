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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { Datasource } from '../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import { DatasourceQueryHistory } from '../../../../domain/datasource/datasourceQueryHistory';
import { Alert } from '../../../../common/util/alert.util';
import * as _ from 'lodash';
import { Log } from '../../../../common/domain/modal';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import { CommonUtil } from '../../../../common/util/common.util';
import {PeriodData} from "../../../../common/value/period.data.value";

declare let echarts;
declare let moment;

@Component({
  selector: 'monitoring-data-source',
  templateUrl: './monitoring-data-source.component.html',
  providers: [MomentDatePipe]
})
export class MonitoringDataSourceComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('transactionChart')
  private transactionChart: ElementRef;

  @ViewChild('sizeChart')
  private sizeChart: ElementRef;

  @ViewChild('distributionUserChart')
  private distributionUserChart: ElementRef;

  @ViewChild('distributionTimeChart')
  private distributionTimeChart: ElementRef;

  // line 차트 옵션
  private lineOption: any = {};

  // 파이 차트 옵션
  private pieOption: any = {};

  // date
  private selectedDate : PeriodData;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public mode: string;

  @Input()
  public datasource: Datasource;

  // query types
  public queryTypes: any[];
  public selectedQueryType: any;

  // result types
  public resultTypes: any[];
  public selectedResultType: any;

  // 정렬
  public selectedContentSort: Order = new Order();

  // queryHistories
  public queryHistories: DatasourceQueryHistory[];

  @Output()
  public logEvent: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    // ui 초기화
    this.initView();
    // 차트 init
    this.initChart();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
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
  public checkMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * 리스트 더보기
   */
  public getMoreList() {
    // 페이지 넘버 추가
    this.pageResult.number += 1;
    // query 재조회
    this.getQueryLog(this.datasource.id);
  }

  /**
   * result type 선택 이벤트
   * @param type
   */
  public onChangeResultType(type: any) {
    // 이미 선택된 타입이면 return
    if (type.value === this.selectedResultType.value) {
      return;
    }

    // 페이지 초기화
    this.pageResult.number = 0;

    // 선택한 타입
    this.selectedResultType = type;

    // query 재조회
    this.getQueryLog(this.datasource.id);
  }

  /**
   * query type 선택 이벤트
   * @param type
   */
  public onChangeQueryType(type: any) {
    // 이미 선택된 타입이면 return
    if (type.value === this.selectedQueryType.value) {
      return;
    }

    // 페이지 초기화
    this.pageResult.number = 0;

    // 선택한 타입
    this.selectedQueryType = type;

    // query 재조회
    this.getQueryLog(this.datasource.id);
  }

  /**
   * 조회할 기간 변경 이벤트
   * @param event
   */
  public onChagePeriod(event) {
    // 페이지 초기화
    this.pageResult.number = 0;

    // 조회할 기간 변경
    this.selectedDate = event;

    // 재조회
    this.getQueryLog(this.datasource.id);
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
    // query 재조회
    this.getQueryLog(this.datasource.id);
  }


  /**
   * 로그 모달 오픈
   * @param {DatasourceQueryHistory} history
   */
  public openLogModal(history: DatasourceQueryHistory) {
    const log: Log = new Log;

    log.title = 'Query log';
    log.subTitle = [];
    log.subTitle.push(moment(history.createdTime).format('YYYY-MM-DD HH:mm'));
    log.subTitle.push(history.queryType.toString());
    log.subTitle.push(this.convertMilliseconds(history.elapsedTime));
    log.subTitle.push(history.succeed ? this.translateService.instant('msg.storage.ui.success') : this.translateService.instant('msg.storage.ui.fail'));
    log.data = history.query;
    log.isShowCopy = true;

    // log 모달 오픈
    this.logEvent.emit(log);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * chart init
   */
  private initChart() {
    // 로딩 show
    this.loadingShow();

    const id = this.datasource.id;
    const promise = [];
    promise.push(this.getDatasize(id)
      .then((result) => {
        const xAxis = result['x'];
        const series = result['series'];
        this.drawLineChart(this.sizeChart, xAxis, series);
      })
      .catch((error) => {
        Alert.error(error);
      }));
    promise.push(this.getTransaction(id)
      .then((result) => {
        const xAxis = result['x'];
        const series = result['series'];
        this.drawLineChart(this.transactionChart, xAxis, series);
      })
      .catch((error) => {
        Alert.error(error);
      }));
    promise.push(this.getDistributionByTime(id)
      .then((result) => {
        const xAxis = result['x'];
        const series = result['series'];
        this.drawPieChart(this.distributionTimeChart, xAxis, series[0]);
      })
      .catch((error) => {
        Alert.error(error);
      }));
    promise.push(this.getDistributionByUser(id)
      .then((result) => {
        const xAxis = result['x'];
        const series = result['series'];
        this.drawPieChart(this.distributionUserChart, xAxis, series[0]);
      })
      .catch((error) => {
        Alert.error(error);
      }));
    Promise.all(promise)
      .then(() => {
        this.getQueryLog(id);
      }).catch((error) => {
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
    });
  }

  // init
  private initView() {

    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 5;

    this.queryTypes = [
      { label: this.translateService.instant('msg.storage.li.querytypes.all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.li.querytypes.candidate') , value: 'CANDIDATE' },
      { label: this.translateService.instant('msg.storage.li.querytypes.meta'), value: 'META' },
      { label: this.translateService.instant('msg.storage.li.querytypes.search'), value: 'SEARCH' },
      { label: this.translateService.instant('msg.storage.li.querytypes.sum'), value: 'SUMMARY' },
      { label: this.translateService.instant('msg.storage.li.querytypes.covar'), value: 'COVARIANCE' },
      { label: this.translateService.instant('msg.storage.li.querytypes.sim'), value: 'SIMILARITY' }
    ];
    this.selectedQueryType = this.queryTypes[0];

    this.resultTypes = [
      { label: this.translateService.instant('msg.storage.li.resulttypes.all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.li.resulttypes.success'), value: 'SUCCESS' },
      { label: this.translateService.instant('msg.storage.li.resulttypes.fail'), value: 'FAIL' }
    ];
    this.selectedResultType = this.resultTypes[0];

    // line chart option
    this.lineOption = {
      color: ['#00dba2'],
      grid: {
        left: 0,
        right: 7,
        top: 7,
        bottom: 0,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
      },
      xAxis: {
        splitLine: {
          show: false
        },
        data: []
      },
      yAxis: {
        splitLine: {
          show: false
        }
      },
      series: [{
        type: 'line',
        symbolSize: 8,
        data: []
      }]
    };

    // pie chart option
    this.pieOption = {
      tooltip: {
        formatter: "{c} ({d}%)"
      },
      series: {
        type: 'pie',
        data: [],
        labelLine: {
          normal: {
            show: false
          }
        },
      }
    };
  }


  /**
   * 질의 수(트랜잭션) 조회
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  private getTransaction(datasourceId: string) {
    return new Promise((resolve, reject) => {
      this.datasourceService.getQueryHistoriesCount(datasourceId)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 용량 추이 조회
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  private getDatasize(datasourceId: string) {
    return new Promise((resolve, reject) => {
      this.datasourceService.getHistoriesSize(datasourceId)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 사용자별 질의 분포
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  private getDistributionByUser(datasourceId: string) {
    return new Promise((resolve, reject) => {
      this.datasourceService.getQueryHistoriesStatsUser(datasourceId)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  /**
   * 소요시간별 질의 분포
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  private getDistributionByTime(datasourceId: string) {
    return new Promise((resolve, reject) => {
      this.datasourceService.getQueryHistoriesStatsTime(datasourceId)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  /**
   * query history 조회시 이용할 params
   * @returns {{size: number; page: number; sort: string}}
   */
  private getQueryParams() {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    // 성공여부 타입
    if (this.selectedResultType.value !== 'ALL') {
      params['succeed'] = this.selectedResultType.value === 'SUCCESS' ? true : false;
    }
    // 선택한 쿼리 타입
    if (this.selectedQueryType.value !== 'ALL') {
      params['queryType'] = this.selectedQueryType.value;
    }
    // 기간으로 검색
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    return params;
  }


  /**
   * 질의 이력 조회
   * @param {string} datasourceId
   */
  private getQueryLog(datasourceId: string) {
    // 로딩 show
    this.loadingShow();

    this.datasourceService.getQueryHistories(datasourceId, this.getQueryParams())
      .then((result) => {
        // page
        this.pageResult = result.page;

        // 페이지가 첫번째면
        if (result.page.number === 0) {
          this.queryHistories = [];
        }

        // 목록 저장
        this.setQueryHistories(result['_embedded']);

        // 로딩 종료
        this.loadingHide();
      })
      .catch((error) => {
        Alert.error(error);
        // 로딩 종료
        this.loadingHide();
      });
  }


  /**
   * 쿼리 목록 저장
   * @param data
   */
  public setQueryHistories(data: any) {
    this.queryHistories = data ? this.queryHistories.concat(data.datasourcequeryhistories) : [];
  }


  /**
   * 파이차트 그리기
   * @param {ElementRef} chartElement
   * @param xAxis
   * @param series
   */
  private drawPieChart(chartElement: ElementRef, xAxis: any, series: any) {
    const pieChart = echarts.init(chartElement.nativeElement);

    pieChart.setOption(this.getPieOption(xAxis, series));
    pieChart.resize();
  }


  /**
   * 라인차트 그리기
   * @param {ElementRef} chartElement
   * @param xAxis
   * @param series
   */
  private drawLineChart(chartElement: ElementRef, xAxis: any, series: any) {
    const lineChart = echarts.init(chartElement.nativeElement);

    lineChart.setOption(this.getLineOption(xAxis, series));
    lineChart.resize();
  }


  /**
   * pie option 설정
   * @param xAxis
   * @param series
   * @returns {{} & any}
   */
  private getPieOption(xAxis: any, series: any) {
    // pie Option
    const pieOption = _.cloneDeep(this.pieOption);

    // series 데이터
    series.forEach((data, index) => {
      pieOption.series.data.push({ value : data, name: xAxis[index] });
    });

    return pieOption;
  }


  /**
   * line option 설정
   * @param xAxis
   * @param series
   * @returns {{} & any}
   */
  private getLineOption(xAxis: any, series: any) {
    // line Option
    const lineOption = _.cloneDeep(this.lineOption);

    // xAxis 데이터
    lineOption.xAxis.data = xAxis;

    // series 데이터
    series.forEach((data, index) => {
      lineOption.series[index].data = data;
    });
    return lineOption;
  }
}

class Order {
  key: string = 'elapsedTime';
  sort: string = 'desc';
}

