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

import {Component, ElementRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {PublicType, WorkspaceAdmin} from '@domain/workspace/workspace';
import * as _ from 'lodash';
import {WorkspaceService} from '../../../../../../../workspace/service/workspace.service';

declare let echarts;
declare let moment;

@Component({
  selector: 'detail-workspaces-statistics',
  templateUrl: './detail-workspace-statistics.component.html'
})
export class DetailWorkspaceStatisticsComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 정보
  private _workspace: WorkspaceAdmin;

  @ViewChild('itemDistribution')
  private _itemDistribution: ElementRef;

  @ViewChild('userAccess')
  private _userAccess: ElementRef;

  // line 차트 옵션
  private _lineOption: any = {};

  // 파이 차트 옵션
  private _pieOption: any = {};

  // 기간 범위 리스트
  private _periodList: any[] = [];
  // 선택된 기간 범위
  private _selectedPeriod: any;

  // 기간 범위 날짜 리스트
  private _rangeList: any[] = [];
  // 선택된 기간 범위 날짜
  private _selectedRange: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('workspace')
  public set setWorkspace(workspace) {
    // 워크스페이스 상세정보
    this._workspace = workspace;
    // 워크스페이스 아이디가 있다면
    if (workspace.id) {
      // 기간 범위 리스트
      this._rangeList = this._getPeriodRangeList();
      // 선택된 기간 범위
      this._selectedRange = this._rangeList[0];
      // 통계 조회
      this._getWorkspaceStatistics();
    }
  }

  // 기간 범위 설정 flag
  public periodShowFl: boolean = false;
  // 기간 범위 날짜 flag
  public rangeShowFl: boolean = false;

  // book items
  public bookItems: object = {};

  // 현재 워크스페이스가 즐겨찾기로 등록된 수
  public countFavoriteWorkspace: number = 0;
  // 대시보드 평균 수
  public avgDashboardByWorkBook: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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
    // ui init
    this._initView();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 기간 범위 설정 변경
   * @param period
   */
  public onSelectedPeriod(period: any): void {
    this._selectedPeriod = period;
    // 워크스페이스 통계 조회
    this._getWorkspaceStatistics();
  }

  /**
   * 기간 범위 날짜 설정 변경
   * @param range
   */
  public onSelectedRange(range: any): void {
    this._selectedRange = range;
    // 워크스페이스 통계 조회
    this._getWorkspaceStatistics();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 아이템 수
   * @returns {number}
   */
  public getCountBookItems(): number {
    return this.getWorkbookCount() + this.getNotebookCount() + this.getWorkbenchCount();
  }

  /**
   * 워크북 수
   * @returns {number}
   */
  public getWorkbookCount(): number {
    return this.bookItems['workbook'] ? this.bookItems['workbook'] : 0;
  }

  /**
   * 노트북 수
   * @returns {number}
   */
  public getNotebookCount(): number {
    return this.bookItems['notebook'] ? this.bookItems['notebook'] : 0;
  }

  /**
   * 워크벤치 수
   * @returns {number}
   */
  public getWorkbenchCount(): number {
    return this.bookItems['workbench'] ? this.bookItems['workbench'] : 0;
  }

  /**
   * 기간 범위 리스트
   * @returns {any[]}
   */
  public get getPeriodList(): any[] {
    return this._periodList;
  }

  /**
   * 선택한 기간 범위
   * @returns {any}
   */
  public get getSelectedPeriod(): any {
    return this._selectedPeriod;
  }

  /**
   * 기간 범위 날짜 리스트
   * @returns {any[]}
   */
  public get getRangeList(): any[] {
    return this._rangeList;
  }

  /**
   * 선택한 기간 범위 날짜
   * @returns {any}
   */
  public get getSelectedRange(): any {
    return this._selectedRange;
  }

  /**
   * 현재 보여자는 기간 범위
   * @returns {string}
   */
  public getPeriodRange(): string {
    if (this._rangeList && this._rangeList.length !== 0) {
      return this.isPeriodMonthly() ? this.getSelectedRange.label : this.getOverallPeriod();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 기간 범위 설정이 월별 통계인지 확인
   * @returns {boolean}
   */
  public isPeriodMonthly(): boolean {
    return this.getSelectedPeriod.value === 'MONTHLY';
  }

  /**
   * 워크스페이스가 공유 워크스페이스인지 확인
   * @returns {boolean}
   */
  public isPublicWorkspace(): boolean {
    return this._workspace.publicType === PublicType.SHARED;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 파이차트 그리기
   * @param {ElementRef} chartElement
   * @param datas
   * @private
   */
  private _drawPieChart(chartElement: ElementRef, datas: any) {
    const pieChart = echarts.init(chartElement.nativeElement);
    pieChart.setOption(this._getPieOption(datas));
    pieChart.resize();
  }

  /**
   * 라인차트 그리기
   * @param {ElementRef} chartElement
   * @param rows
   * @param datas
   * @private
   */
  private _drawLineChart(chartElement: ElementRef, rows: any, datas: any) {
    const lineChart = echarts.init(chartElement.nativeElement);
    lineChart.setOption(this._getLineOption(rows, datas));
    lineChart.resize();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 전체기간 string
   * @returns {string}
   */
  private getOverallPeriod(): string {
    // range가 2개 이상일때는 기간으로 표기
    return this._rangeList.length > 1
      ? this._rangeList[this._rangeList.length - 1].overall + ' ~ ' + this._rangeList[0].overall
      : this._rangeList[0].overall;
  }

  /**
   * 워크스페이스 통계 조회
   * @private
   */
  private _getWorkspaceStatistics(): void {
    // 로딩 show
    this.loadingShow();
    this.workspaceService.getWorkspaceStatistics(this._workspace.id, this._getStatisticsParams())
      .then((result) => {
        // books
        this.bookItems = result['countBookByType'];
        // avgDashboardByWorkBook
        this.avgDashboardByWorkBook = this._getAvgDashboardByWorkbook(result['avgDashboardByWorkBook']);
        // countFavoriteWorkspace
        this.countFavoriteWorkspace = result['countFavoriteWorkspace'];
        // distribution chart
        this._drawPieChart(this._itemDistribution, this.bookItems);
        // user access
        this._drawLineChart(this._userAccess, result['viewCountByTime'].rows, result['viewCountByTime'].columns[0].value);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 워크북 안에 있는 대시보드의 평균 수
   * @param {number} avgDashboardByWorkbook
   * @returns {number}
   * @private
   */
  private _getAvgDashboardByWorkbook(avgDashboardByWorkbook: number): number {
    return _.ceil(avgDashboardByWorkbook, 1);
  }

  /**
   * pie option 설정
   * @param {Object} bookItems
   * @returns {any}
   * @private
   */
  private _getPieOption(bookItems: object) {
    // pie Option
    const pieOption = _.cloneDeep(this._pieOption);
    // data
    for (const item in bookItems) {
      if (item) {
        // item label
        const label = this._getBookLabel(item);
        // 범례
        pieOption.legend.data.push(label);
        // 데이터
        pieOption.series[0].data.push({value: bookItems[item], name: label});
      }
    }
    return pieOption;
  }

  /**
   * line option 설정
   * @param rows
   * @param datas
   * @returns {Object}
   * @private
   */
  private _getLineOption(rows: any, datas: any): object {
    // line Option
    const lineOption = _.cloneDeep(this._lineOption);
    // xAxis 데이터
    lineOption.xAxis.data = rows;
    // series 데이터
    lineOption.series[0].data = datas;
    return lineOption;
  }

  /**
   * book label string
   * @param {string} item
   * @returns {string}
   * @private
   */
  private _getBookLabel(item: string): string {
    switch (item) {
      case 'workbook':
        return this.translateService.instant('msg.spaces.spaces.detail.statistics.ui.workbook');
      case 'notebook':
        return this.translateService.instant('msg.spaces.spaces.detail.statistics.ui.notebook');
      case 'workbench':
        return this.translateService.instant('msg.spaces.spaces.detail.statistics.ui.workbench');
      case 'folder':
        return this.translateService.instant('msg.spaces.spaces.detail.statistics.ui.folder');
    }
  }

  /**
   * 통계 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getStatisticsParams(): object {
    const params = {};

    // 전체기간 조회의 경우
    if (this._selectedPeriod.value === 'OVERALL') {
      params['timeUnit'] = 'month';
      params['from'] = this._workspace.createdTime;
      params['to'] = moment().format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
    } else {
      params['timeUnit'] = 'day';
      params['from'] = this._selectedRange.startTime;
      params['to'] = this._selectedRange.endTime;
    }

    return params
  }

  /**
   * 통계용 워크스페이스 기간 범위 리스트
   * @returns {Array}
   * @private
   */
  private _getPeriodRangeList() {
    // 범위리스트
    const rangeList = [];
    // 시작타임 (워크스페이스 생성시간)
    let startTime = moment(this._workspace.createdTime);
    // 종료타임 (현재시간)
    const endTime = moment();
    // 루프 플래그 (현재시간보다 작을때 반복)
    let loopFl: boolean = (startTime.format('YYYY-MM') < endTime.format('YYYY-MM'));
    // make rangeList
    while (loopFl) {
      rangeList.unshift({
        label: startTime.format('MMMM YYYY'),
        overall: startTime.format('D MMM YYYY'),
        startTime: startTime.startOf('month').format('YYYY-MM-DDTHH:mm:ss') + '.000Z',
        endTime: startTime.endOf('month').format('YYYY-MM-DDTHH:mm:ss') + '.5959Z'
      });
      // 시작타임 월 증가
      startTime = startTime.add(1, 'month');
      // 루프 플래그 재설정
      loopFl = startTime.format('YYYY-MM') < endTime.format('YYYY-MM');
    }
    // 가장 최근 값
    rangeList.unshift({
      label: moment().format('MMMM YYYY'),
      overall: moment().format('D MMM YYYY'),
      startTime: moment().startOf('month').format('YYYY-MM-DDTHH:mm:ss') + '.000Z',
      endTime: moment().format('YYYY-MM-DDTHH:mm:ss') + '.5959Z'
    });
    return rangeList;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // pie option
    this._pieOption = {
      tooltip: {
        formatter: '{c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        y: 'bottom',
        data: []
      },
      series: [
        {
          // 시계방향으로 큰 값 순서대로 그림
          clockwise: false,
          type: 'pie',
          radius: ['50%', '70%'],
          label: {
            normal: {
              show: false,
              position: 'center'
            },
          },
          data: []
        }
      ]
    };
    // line option
    this._lineOption = {
      color: ['#2D5FDB'],
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [],
        type: 'line'
      }]
    };

    // period list
    this._periodList = [
      {label: this.translateService.instant('msg.spaces.shared.detail.statistics.monthly'), value: 'MONTHLY'},
      {label: this.translateService.instant('msg.spaces.shared.detail.statistics.overall'), value: 'OVERALL'},
    ];
    // period default는 monthly
    this._selectedPeriod = this._periodList[0];

    // range list
    this._rangeList = [];
    // range default는 이번달
    this._selectedRange = null;
    // 통계 관련 init
    this._initStatistics();
  }

  /**
   * 통계 관련 변수 init
   * @private
   */
  private _initStatistics(): void {
    // 통계
    this.countFavoriteWorkspace = 0;
    this.avgDashboardByWorkBook = 0;
    this.bookItems = {};
  }
}
