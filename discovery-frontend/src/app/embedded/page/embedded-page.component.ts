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

import * as _ from 'lodash';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { ActivatedRoute } from '@angular/router';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { BaseChart } from '../../common/component/chart/base-chart';
import { BarChartComponent } from 'app/common/component/chart/type/bar-chart.component';
import { LineChartComponent } from '../../common/component/chart/type/line-chart.component';
import { ChartType, SPEC_VERSION } from '../../common/component/chart/option/define/common';
import { NetworkChartComponent } from '../../common/component/chart/type/network-chart.component';
import { OptionGenerator } from '../../common/component/chart/option/util/option-generator';
import { SearchQueryRequest } from '../../domain/datasource/data/search-query-request';
import { Filter } from '../../domain/workbook/configurations/filter/filter';
import { FilterUtil } from '../../dashboard/util/filter.util';
import { PageWidget, PageWidgetConfiguration } from '../../domain/dashboard/widget/page-widget';
import { UIOption } from '../../common/component/chart/option/ui-option';
import { DatasourceService } from '../../datasource/service/datasource.service';
import { AnalysisPredictionService } from '../../page/component/analysis/service/analysis.prediction.service';
import { WidgetService } from '../../dashboard/service/widget.service';
import { DashboardUtil } from '../../dashboard/util/dashboard.util';
import { CommonUtil } from '../../common/util/common.util';
import { MapChartComponent } from '../../common/component/chart/type/map-chart/map-chart.component';

@Component({
  selector: 'app-embedded-page',
  templateUrl: './embedded-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbeddedPageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('chart')
  private chart: BaseChart;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 차트에서 사용하는 데이터
  protected resultData: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public widget: PageWidget = new PageWidget();
  public widgetConfiguration: PageWidgetConfiguration = new PageWidgetConfiguration();
  public chartType: string;
  public isShowNoData: boolean = false;
  public isError: boolean = false;                // 에러 상태 표시 여부

  // 데이터 조회 쿼리
  public query: SearchQueryRequest;

  get uiOption(): UIOption {
    return this.widgetConfiguration.chart;
  }

  set uiOption(uiOption: UIOption) {
    this.widgetConfiguration.chart = uiOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private widgetService: WidgetService,
              private analysisPredictionService: AnalysisPredictionService,
              private activatedRoute: ActivatedRoute,
              protected element: ElementRef,
              protected injector: Injector) {

    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    // Init
    super.ngOnInit();

    window.history.pushState(null, null, window.location.href);

    this.activatedRoute.params.subscribe((params) => {
      // dashboard 아이디를 넘긴경우에만 실행
      // 로그인 정보 생성
      (params['loginToken']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, params['loginToken'], 0, '/'));
      (params['loginType']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, params['loginType'], 0, '/'));
      (params['refreshToken']) && (this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, params['refreshToken'], 0, '/'));
      if (params['pageId']) {
        this._getPageInfo(params['pageId']);
      }
    });
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  @HostListener('window:popstate', ['$event'])
  public onPopstate() {
    window.history.pushState(null, null, window.location.href);
  }


  /**
   * 사이즈 재조정
   * @param {boolean} isImmediate
   */
  public resize(isImmediate: boolean = false) {
    if (this.chart) {
      setTimeout(
        () => {
          // control
          if (this.chart.hasOwnProperty('barChart') && this.chart.hasOwnProperty('lineChart')) {
            const barChart: BarChartComponent = this.chart['barChart'];
            const lineChart: LineChartComponent = this.chart['lineChart'];
            barChart.chart.resize();
            lineChart.chart.resize();
          } else if (this.chart.uiOption.type === ChartType.LABEL) {

          } else if (this.widgetConfiguration.chart.type.toString() === 'grid') {
            //(<GridChartComponent>this.chart).grid.arrange();
          } else if (this.chart.uiOption.type === ChartType.NETWORK) {
            (<NetworkChartComponent>this.chart).draw();
          } else if (this.chart.uiOption.type === ChartType.MAP) {
            (<MapChartComponent>this.chart).resize();
          } else {
            if (this.chart && this.chart.chart) this.chart.chart.resize();
          }
          // 변경 적용
          this.changeDetect.detectChanges();
        },
        isImmediate ? 0 : 300
      );

    }
  } // function - resize

  /**
   * 위젯 이름 표시 여부
   * @return {boolean}
   */
  public isShowWidgetName(): boolean {
    return this.widget && this.widget.hasOwnProperty('name');
  } // function - isShowWidgetName

  /**
   * 데이터 없음 표시
   */
  public showNoData() {
    this.isShowNoData = true;
    this.loadingHide();
  } // function - showNoData

  /**
   * 에러 표시
   */
  public showError() {
    this.isError = true;
    this.loadingHide();

    // 변경 적용
    this.safelyDetectChanges();
  } // function - showError

  /**
   * 차트의 아이콘 클래스명 반환
   * @return {string}
   */
  public getChartIconClass(): string {
    let iconClass: string = '';
    switch (this.widget.configuration.chart.type) {
      case ChartType.BAR :
        iconClass = 'ddp-chart-bar';
        break;
      case ChartType.LINE :
        iconClass = 'ddp-chart-linegraph';
        break;
      case ChartType.GRID :
        iconClass = 'ddp-chart-table';
        break;
      case ChartType.SCATTER :
        iconClass = 'ddp-chart-scatter';
        break;
      case ChartType.HEATMAP :
        iconClass = 'ddp-chart-heatmap';
        break;
      case ChartType.PIE :
        iconClass = 'ddp-chart-pie';
        break;
      case ChartType.MAP :
        iconClass = 'ddp-chart-map';
        break;
      case ChartType.CONTROL :
        iconClass = 'ddp-chart-cont';
        break;
      case ChartType.LABEL :
        iconClass = 'ddp-chart-kpi';
        break;
      case ChartType.LABEL2 :
        iconClass = 'ddp-chart-kpi';
        break;
      case ChartType.BOXPLOT :
        iconClass = 'ddp-chart-boxplot';
        break;
      case ChartType.WATERFALL :
        iconClass = 'ddp-chart-waterfall';
        break;
      case ChartType.WORDCLOUD :
        iconClass = 'ddp-chart-wordcloud';
        break;
      case ChartType.COMBINE :
        iconClass = 'ddp-chart-combo';
        break;
      case ChartType.TREEMAP :
        iconClass = 'ddp-chart-treemap';
        break;
      case ChartType.RADAR :
        iconClass = 'ddp-chart-radar';
        break;
      case ChartType.NETWORK :
        iconClass = 'ddp-chart-network';
        break;
      case ChartType.SANKEY :
        iconClass = 'ddp-chart-sankey';
        break;
      case ChartType.GAUGE :
        iconClass = 'ddp-chart-bar';
        break;
    }
    return iconClass;
  } // function - getChartIconClass

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지 아이디를 바탕으로 페이지 정보 조회
   * @param {string} pageId
   * @private
   */
  private _getPageInfo(pageId:string) {
    this.widgetService.getWidget(pageId).then(result => {
      this.widget = <PageWidget>_.extend(new PageWidget(), result);
      this.widgetConfiguration = <PageWidgetConfiguration>this.widget.configuration;
      this.chartType = this.widgetConfiguration.chart.type.toString();
      this.changeDetect.detectChanges();
      this._search();
    });
  } // function - _getPageInfo

  /**
   * 데이터 검색
   * @private
   */
  private _search() {

    if (!this.chart) {
      return;
    }

    // 버전 확인
    if (!this.uiOption.version || this.uiOption.version < SPEC_VERSION) {
      // 옵션 초기화
      this.uiOption = OptionGenerator.initUiOption(this.uiOption);
    }

    const query: SearchQueryRequest
      = this.datasourceService.makeQuery(
      this.widgetConfiguration,
      this.widget.dashBoard.configuration.fields,
      {
        url: this.router.url,
        dashboardId: this.widget.dashBoard.id,
        widgetId: this.widget.id
      }, null, true
    );

    if (ChartType.MAP !== this.widgetConfiguration.chart.type && query.pivot.columns.length + query.pivot.rows.length + query.pivot.aggregations.length === 0) {
      return;
    }

    const uiCloneQuery = _.cloneDeep(query);

    // 외부필터가 없고 글로벌 필터가 있을 경우 추가(초기 진입시)
    const boardFilter: Filter[] = DashboardUtil.getAllFiltersDsRelations( this.widget.dashBoard, this.widgetConfiguration.dataSource.engineName );
    (boardFilter && 0 < boardFilter.length) && ( uiCloneQuery.filters = boardFilter.concat(uiCloneQuery.filters) );

    this.isShowNoData = false;

    // 서버 조회용 파라미터 (서버 조회시 필요없는 파라미터 제거)
    const cloneQuery = this._makeSearchQueryParam(_.cloneDeep(uiCloneQuery));

    this.query = cloneQuery;
    if( this.chartType === 'label' ) {
      this.chart['setQuery'] = this.query;
    }

    this.loadingShow();

    this.datasourceService.searchQuery(cloneQuery).then((data) => {

      this.resultData = {
        data,
        config: query,
        uiOption: this.uiOption,
        params: {
          widgetId: this.widget.id,
          externalFilters: false
        }
      };

      let optionKeys = Object.keys(this.uiOption);
      if (optionKeys && optionKeys.length === 1) {
        delete this.resultData.uiOption;
      }

      setTimeout( () => {
        // line차트이면서 columns 데이터가 있는경우
        if (this.chartType === 'line' && this.resultData.data.columns && this.resultData.data.columns.length > 0) {
          // 고급분석 예측선 API 호출
          this.getAnalysis();
        } else {
          this.chart.resultData = this.resultData;
        }
      }, 1000 );

      this.loadingHide();

      // 변경 적용
      this.safelyDetectChanges();

    }).catch((error) => {
      console.error(error);
      this.showError();
      this.loadingHide();
    });
  } // function - _search

  /**
   * 서버시에 필요없는 ui에서만 사용되는 파라미터 제거
   */
  private _makeSearchQueryParam(cloneQuery): SearchQueryRequest {

    // 선반 데이터 설정
    for (let field of _.concat(cloneQuery.pivot.columns, cloneQuery.pivot.rows, cloneQuery.pivot.aggregations)) {
      delete field['field'];
      delete field['currentPivot'];
      delete field['granularity'];
      delete field['segGranularity'];
    }

    // map - set shelf layers
    if (cloneQuery.shelf && cloneQuery.shelf.layers && cloneQuery.shelf.layers.length > 0) {
      for (let layer of cloneQuery.shelf.layers[0]) {
        delete layer['field'];
        delete layer['currentPivot'];
        delete layer['granularity'];
        delete layer['segGranularity'];
      }
    }

    // 필터 설정
    for (let filter of cloneQuery.filters) {
      filter = FilterUtil.convertToServerSpec(filter);
    }

    // 값이 없는 측정값 필터 제거
    cloneQuery.filters = cloneQuery.filters.filter(item => {
      return (item.type === 'include' && item['valueList'] && 0 < item['valueList'].length) ||
        (item.type === 'bound' && item['min'] != null) ||
        FilterUtil.isTimeAllFilter(item) ||
        FilterUtil.isTimeRelativeFilter(item) ||
        FilterUtil.isTimeRangeFilter(item) ||
        (FilterUtil.isTimeListFilter(item) && item['valueList'] && 0 < item['valueList'].length);
    });

    cloneQuery.userFields = CommonUtil.objectToArray( cloneQuery.userFields );

    return cloneQuery;
  } // function - _makeSearchQueryParam

  // ----------------------------------------------------
  // 고급분석 예측선 관련
  // ----------------------------------------------------

  /**
   * 고급분석 예측선 활성화 여부 검사
   * @returns {boolean}
   */
  private isAnalysisPredictionEnabled(): boolean {
    return !_.isUndefined(this.widgetConfiguration.analysis) && !_.isEmpty(this.widgetConfiguration.analysis);
  }

  /**
   * 고급분석 예측선을 사용안하는 경우 처리
   */
  private predictionLineDisabled(): void {
    this.chart.analysis = null;
    this.chart.resultData = this.resultData;
  }

  /**
   * 고급분석 예측선 API 호출
   */
  private getAnalysis(): void {
    if (this.isAnalysisPredictionEnabled()) {
      Promise
        .resolve()
        .then(() => {
          if (this.isAnalysisPredictionEnabled()) {
            this.analysisPredictionService.getAnalysisPredictionLineFromDashBoard(this.widgetConfiguration, this.widget, this.chart, this.resultData)
              .catch(() => {
                this.showError();
              });
          } else {
            this.predictionLineDisabled();
          }
        });
    } else {
      this.predictionLineDisabled();
    }
  }
}
