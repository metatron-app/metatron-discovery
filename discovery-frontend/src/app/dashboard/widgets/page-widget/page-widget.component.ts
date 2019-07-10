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
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import {ClipboardService} from 'ngx-clipboard';
import {
  BrushType,
  ChartMouseMode,
  ChartSelectMode,
  ChartType,
  FunctionValidator,
  LegendConvertType,
  SPEC_VERSION
} from '../../../common/component/chart/option/define/common';
import {AbstractWidgetComponent} from '../abstract-widget.component';
import {PageWidget, PageWidgetConfiguration} from '../../../domain/dashboard/widget/page-widget';
import {BaseChart, ChartSelectInfo} from '../../../common/component/chart/base-chart';
import {UIOption} from '../../../common/component/chart/option/ui-option';
import {Alert} from '../../../common/util/alert.util';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {SearchQueryRequest} from '../../../domain/datasource/data/search-query-request';
import {Filter} from '../../../domain/workbook/configurations/filter/filter';
import {ImageService} from '../../../common/service/image.service';
import {WidgetService} from '../../service/widget.service';
import {AnalysisPredictionService} from '../../../page/component/analysis/service/analysis.prediction.service';
import {Widget} from '../../../domain/dashboard/widget/widget';
import {EventBroadcaster} from '../../../common/event/event.broadcaster';
import {FilterUtil} from '../../util/filter.util';
import {NetworkChartComponent} from '../../../common/component/chart/type/network-chart.component';
import {DashboardPageRelation} from '../../../domain/dashboard/widget/page-widget.relation';
import {BoardConfiguration, BoardDataSource, LayoutMode} from '../../../domain/dashboard/dashboard';
import {GridChartComponent} from '../../../common/component/chart/type/grid-chart.component';
import {BarChartComponent} from '../../../common/component/chart/type/bar-chart.component';
import {LineChartComponent} from '../../../common/component/chart/type/line-chart.component';
import {OptionGenerator} from '../../../common/component/chart/option/util/option-generator';
import {
  BoardSyncOptions,
  BoardWidgetOptions,
  WidgetShowType
} from '../../../domain/dashboard/dashboard.globalOptions';
import {DataDownloadComponent} from '../../../common/component/data-download/data.download.component';
import {CustomField} from '../../../domain/workbook/configurations/field/custom-field';
import {ChartLimitInfo, DashboardUtil} from '../../util/dashboard.util';
import {isNullOrUndefined} from 'util';
import {ConnectionType, Datasource, Field} from '../../../domain/datasource/datasource';
import {CommonUtil} from '../../../common/util/common.util';
import {GridComponent} from "../../../common/component/grid/grid.component";
import {header, SlickGridHeader} from "../../../common/component/grid/grid.header";
import {GridOption} from "../../../common/component/grid/grid.option";
import {Pivot} from "../../../domain/workbook/configurations/pivot";
import {MapChartComponent} from '../../../common/component/chart/type/map-chart/map-chart.component';
import {Shelf, ShelfLayers} from "../../../domain/workbook/configurations/shelf/shelf";
import {CommonConstant} from "../../../common/constant/common.constant";

declare let $;

@Component({
  selector: 'page-widget',
  templateUrl: 'page-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ['.ddp-pop-preview { position: fixed; width: 700px; height: 500px; top: 50%; left: 50%; margin-left: -350px; margin-top: -250px;}']
})
export class PageWidgetComponent extends AbstractWidgetComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('chart')
  private chart: BaseChart;

  @ViewChild('gridChart')
  private gridChart: GridChartComponent;

  @ViewChild('dataGrid')
  private _dataGridComp: GridComponent;

  @ViewChild(DataDownloadComponent)
  private _dataDownComp: DataDownloadComponent;

  // 프로세스 실행 여부
  private _isDuringProcess: boolean = false;

  private _interval: any;   // 실시간 데이터소스 조회 타이머
  private _timer: any;       // 차트 리사이즈 타이머

  // 대시보드 영역 overflow 여부
  private _dashboardOverflow: string;

  // 현재 위젯에서 발생시킨 필터정보
  private _selectFilterList: any[] = [];

  // Current Filters
  private _currentSelectionFilters: Filter[] = [];
  private _currentSelectionFilterString: string = '';
  private _currentGlobalFilterString: string = '';

  // child widget id list
  private _childWidgetIds: string[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 차트에서 사용하는 데이터
  protected resultData: any;

  // 그리드에서 사용하는 옵션 ({}을 넣게되면 차트를 그릴때 uiOption값이 없는데도 차트를 그리다가 오류가 발생하므로 제거하였음 by juhee)
  protected gridUiOption: UIOption;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public widget: PageWidget = new PageWidget();
  public parentWidget: Widget;

  public widgetConfiguration: PageWidgetConfiguration = new PageWidgetConfiguration();

  public chartType: string;

  public isMaximize = false;                // 최대 여부
  public mouseMode: string = 'SINGLE';     // 차트 마우스 모드

  public isSetChartData: boolean = false;          // 차트 데이터 설정 여부
  public isUpdateRedraw: boolean = true;          // 다시그리는 새로고침
  public isShowHierarchyView: boolean = false;    // 차트 계층 표시 여부
  public isInvalidPivot: boolean = false;          // 선반정보를 확인해야 하는 경우
  public isShowNoData: boolean = false;           // No-Data 표시 여부
  public isShowDownloadPopup: boolean = false;    // 다운로드 팝업 표시 여부
  public duringDataDown: boolean = false;         // 데이터 다운로드 진행 여부
  public duringImageDown: boolean = false;        // 이미지 다운로드 진행 여부

  // Limit 정보
  public limitInfo: ChartLimitInfo = {id: '', isShow: false, currentCnt: 0, maxCnt: 0};

  // Pivot 내 사용자 정의 컬럼 사용 여부
  public useCustomField: boolean = false;

  // 차트 기능 확인기
  public chartFuncValidator: FunctionValidator = new FunctionValidator();

  // 데이터 조회 쿼리
  public query: SearchQueryRequest;

  get uiOption(): UIOption {
    return this.widgetConfiguration.chart;
  }

  set uiOption(uiOption: UIOption) {
    this.widgetConfiguration.chart = uiOption;
  }

  get isShowChartTools() {
    return !this.isShowHierarchyView && !this.isError && !this.isShowNoData;
  } // get - isShowChartTools

  // is Origin data down
  public isOriginDown: boolean = false;
  public srchText: string = '';
  public isCanNotDownAggr: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables - Input & Output
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public widgetOption: BoardWidgetOptions;

  @Input('widget')
  public inputWidget: PageWidget;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private widgetService: WidgetService,
              private imageService: ImageService,
              private analysisPredictionService: AnalysisPredictionService,
              private _clipboardService: ClipboardService,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(broadCaster, elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    this._checkDatasource();
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const inputWidgetChanges: SimpleChange = changes.inputWidget;
    if (inputWidgetChanges && inputWidgetChanges.currentValue) {
      this._setWidget(inputWidgetChanges.currentValue);
    }
  } // function - ngOnChanges

  public ngAfterViewInit() {
    super.ngAfterViewInit();

    // 사용자 정의 컬럼 사용 여부 확인
    const conf: PageWidgetConfiguration = this.widget.configuration as PageWidgetConfiguration;
    let useCustomField: boolean = false;
    if (useCustomField || conf.pivot.aggregations.some(field => field.ref && 'user_defined' === field.ref)) {
      useCustomField = true;
    }
    if (useCustomField || conf.pivot.rows.some(field => field.ref && 'user_defined' === field.ref)) {
      useCustomField = true;
    }
    if (useCustomField || conf.pivot.columns.some(field => field.ref && 'user_defined' === field.ref)) {
      useCustomField = true;
    }
    this.useCustomField = useCustomField;

    // 새로 고침 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('REFRESH_WIDGET').subscribe(data => {
        (this.widget.id === data.widgetId) && (this._search());
      })
    );

    // 타이틀 변경 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('WIDGET_CHANGE_TITLE').subscribe(data => {
        if (this.isShowHierarchyView && this.parentWidget) {
          if (this.parentWidget.id === data.widgetId) {
            this.parentWidget.name = data.value;
          } else if (this.widget.id === data.widgetId) {
            this.widget.name = data.value;
          }
          this.safelyDetectChanges();
        }
      })
    );

    // 범례 표시 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_LEGEND').subscribe(data => {
        if (data.widgetId === this.widget.id) {
          this.toggleLegend();
        }
      })
    );

    // 미니맵 표시 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_MINIMAP').subscribe(data => {
        if (data.widgetId === this.widget.id) {
          this.toggleMiniMap();
        }
      })
    );

    // 모드 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_MODE').subscribe(data => {
        if (data.widgetId === this.widget.id) {
          this.changeMode(data.mode);
        }
      })
    );

    // 외부 필터 설정
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_GLOBAL_FILTER').subscribe(data => {
        if (data.widgetId && data.widgetId === this.widget.id) {
          this._search(data.filters);
        } else if (data.excludeWidgetId !== this.widget.id) {
          this._search(data.filters);
        }
      })
    );

    // 선택 필터 설정
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_SELECTION_FILTER').subscribe(data => {
        if (data.widgetId && data.widgetId === this.widget.id) {
          this._search(null, data.filters);
        } else if (data.excludeWidgetId !== this.widget.id) {
          this._search(null, data.filters);
        }

        this.query.selectionFilters = data.filters;
      })
    );

    // 사용자 필드 갱신
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_CUSTOM_FIELDS').subscribe(data => {
        this.widget.configuration['customFields'] = data.customFields;
      })
    );

    // 위젯 설정 변경 및 새로고침
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_WIDGET_CONFIG').subscribe(data => {
        if (data.widgetId === this.widget.id) {
          this.widget.configuration = data.config;
          (data.refresh) && (this._search());
        }
      })
    );

    // 위젯 설정 변경 및 새로고침
    this.subscriptions.push(
      this.broadCaster.on<any>('RESIZE_WIDGET').subscribe(data => {
        if (data && data.widgetId) {
          if (data.widgetId === this.widget.id) {
            this.resize();
          }
        } else {
          this.resize();
        }
      })
    );

  } // function - ngAfterViewInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public boardUtil = DashboardUtil;

  /**
   * 범례 표시여부 변경
   * @param {boolean} mode : 표시 여부
   */
  public toggleLegend(mode?: boolean): void {
    if (this.uiOption && this.chartFuncValidator.checkUseLegendByTypeString(this.chartType)) {
      const legend = _.cloneDeep(this.uiOption.legend);
      if (legend) {
        legend.auto = ('boolean' === typeof mode) ? mode : !legend.auto;
        legend.convertType = LegendConvertType.SHOW;
        this.uiOption = <UIOption>_.extend({}, this.uiOption, {legend});
        // 변경 적용
        this.safelyDetectChanges();
      }
    }
  } // function - toggleLegend

  /**
   * 미니맵 표시여부 변경
   * @param {boolean} mode : 표시 여부
   */
  public toggleMiniMap(mode?: boolean): void {
    if (this.uiOption && this.chartFuncValidator.checkUseMiniMapByTypeString(this.chartType)) {
      const chartZooms = _.cloneDeep(this.uiOption.chartZooms);
      if (chartZooms) {
        chartZooms.map((zoom) => (zoom.auto = ('boolean' === typeof mode) ? mode : !zoom.auto));
        this.uiOption = <UIOption>_.extend({}, this.uiOption, {chartZooms});
        // 변경 적용
        this.safelyDetectChanges();
      }
    }
  } // function - toggleMiniMap

  /**
   * 모드 변경
   * @param {string} mode
   */
  public changeMode(mode: string) {
    if (this.widget.mode !== mode) {
      this.widget.mode = mode;
      this.safelyDetectChanges();
      // pivot grid 호출
      ('grid' === mode) && (this._initGridChart());
      this.resize(true);
    }
  } // function - changeMode

  /**
   * 사이즈 재조정
   * @param {boolean} isImmediate
   */
  public resize(isImmediate: boolean = false) {
    if (this.chart) {
      // 변경 적용
      this.safelyDetectChanges();
      this._timer = setTimeout(
        () => {
          // control
          if (this.chart.hasOwnProperty('barChart') && this.chart.hasOwnProperty('lineChart')) {
            const barChart: BarChartComponent = this.chart['barChart'];
            const lineChart: LineChartComponent = this.chart['lineChart'];
            barChart.chart.resize();
            lineChart.chart.resize();
          } else if (this.chart.uiOption.type === ChartType.LABEL) {

          } else if (this.chart.uiOption.type === ChartType.NETWORK) {
            (this.isSetChartData) && ((<NetworkChartComponent>this.chart).draw());
          } else if (this.chart.uiOption.type === ChartType.MAP) {
            (<MapChartComponent>this.chart).resize();
          } else {
            try {
              if (this.chart && this.chart.chart) this.chart.chart.resize();
            } catch (error) {
            }
          }
          // 변경 적용
          this.safelyDetectChanges();
        },
        isImmediate ? 0 : 300
      );

    }

    if (this.gridChart) {
      setTimeout(() => this.gridChart.chart.arrange(), isImmediate ? 0 : 300);
    }
  } // function - resize

  // noinspection JSMethodCanBeStatic
  /**
   * 그리드 유효 여부
   * @param {PageWidget} widget
   * @returns {boolean}
   */
  public isAvaliableGrid(widget: PageWidget) {
    const chartType = (<PageWidgetConfiguration>widget.configuration).chart.type.toString();
    const notAvaliableChart = ['grid', 'scatter', 'pie'];

    return (notAvaliableChart.indexOf(chartType) === -1);
  } // function - isAvaliableGrid

  /**
   * 차트 선택, 비선택
   * @param {ChartSelectInfo} data
   */
  public chartSelectInfo(data: ChartSelectInfo) {
    if (this.layoutMode === LayoutMode.EDIT) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
    } else {

      // 마지막 외부필터로 들어온 데이터는 선택불가
      let selectData = [];
      if (data.data) {
        data.data.map((field) => {
          let isExternalFilter: boolean = false;
          if (this._currentSelectionFilters) {
            // 동일한 필터가 있는지 찾는다.
            isExternalFilter = this._currentSelectionFilters.some(filter => field.alias === filter.field);
          }

          // 내가 선택한거면 예외
          let isAlreadyFilter: boolean = this._selectFilterList.some(filter => field.alias === filter.alias);

          if (!isExternalFilter || isAlreadyFilter) {
            selectData.push(field);
          }
        });
      }
      if (selectData.length == 0 && !_.eq(data.mode, ChartSelectMode.CLEAR)) {
        return;
      } else {
        data.data = selectData;
      }

      // 임시적으로 에러 방지를 위해 params 가 정의되어 있지 않을 때, 강제적으로 widgetId를 설정해줌
      if (!data.params) {
        data.params = {
          widgetId: this.widget.id,
          externalFilters: false
        };
      }
      const widgetDataSource: Datasource
        = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, this.widgetConfiguration.dataSource);
      (widgetDataSource) && (data.params.engineName = widgetDataSource.engineName);

      // 현재 위젯에서 발생시킨 필터정보 변경
      this.changeSelectFilterList(data);

      this.broadCaster.broadcast('CHART_SELECTION_FILTER', {select: data});
    }
  } // function - chartSelectInfo

  /**
   * 현재 위젯에서 발생시킨 필터정보 변경
   * @param data
   */
  public changeSelectFilterList(data: ChartSelectInfo): void {

    // 추가
    if (_.eq(data.mode, ChartSelectMode.ADD)) {

      // 필터 목록 추가
      data.data.map((field) => {
        // 이미 추가된 필터인지 체크
        let isAlreadyFilter: boolean = false;
        this._selectFilterList.map((filter) => {
          // 동일한 필터가 있는지 찾는다.
          if (_.eq(field.alias, filter.alias)) {
            isAlreadyFilter = true;

            // 동일한 필터가 있다면 동일한 데이터가 있는지 확인한다.
            field.data.map((fieldData) => {
              let isAlreadyData: boolean = false;
              filter.data.map((filterData) => {
                if (_.eq(filterData, fieldData)) {
                  isAlreadyData = true;
                }
              });

              // 추가된적이 없다면 데이터 추가
              if (!isAlreadyData) {
                filter.data.push(fieldData);
              }
            });
          }
        });

        // 추가된적이 없는 필터라면 추가
        if (!isAlreadyFilter) {
          this._selectFilterList.push(_.cloneDeep(field));
        }
      });
    }
    // 삭제
    else if (_.eq(data.mode, ChartSelectMode.SUBTRACT)) {

      // 필터 목록 제거
      for (let num = (this._selectFilterList.length - 1); num >= 0; num--) {
        let filter = this._selectFilterList[num];
        data.data.map((field) => {
          // 동일한 필터를 찾은다음
          if (_.eq(field.alias, filter.alias)) {
            // 동일한 데이터를 제거한다.
            for (let num2 = (field.data.length - 1); num2 >= 0; num2--) {
              let data1 = field.data[num2];
              filter.data.map((data2) => {
                if (_.eq(data1, data2)) {
                  filter.data.splice(num, 1);
                }
              });
            }

            // 데이터가 모두 제거되었다면 필터자체를 제거한다.
            if (filter.data.length == 0) {
              this._selectFilterList.splice(num, 1);
            }
          }
        });
      }
    }
    // 초기화
    else if (_.eq(data.mode, ChartSelectMode.CLEAR)) {

      // 셀력션 데이터 치환
      data.mode = ChartSelectMode.SUBTRACT;
      data.data = this._selectFilterList;

      // 저장된 필터 목록 초기화
      this._selectFilterList = [];
    }
  }

  /**
   * 현재 위젯에서 발생시킨 필터정보 제외처리
   * @param externalFilters
   */
  public changeExternalFilterList(externalFilters?: Filter[]): Filter[] {

    (isNullOrUndefined(externalFilters)) && (externalFilters = []);

    // 대시보드에서 필터를 발생시킨경우 => 필터 목록 제거
    for (let num = (this._selectFilterList.length - 1); num >= 0; num--) {
      let filter = this._selectFilterList[num];
      let isNotFilter: boolean = true;
      externalFilters.map((externalFilter) => {
        // 동일한 필터를 찾은다음
        if (_.eq(externalFilter.field, filter.alias)) {
          isNotFilter = false;
          // 필터에 없는 데이터를 제거한다.
          for (let num2 = (filter.data.length - 1); num2 >= 0; num2--) {
            let data1 = filter.data[num2];
            let isNotData = true;
            externalFilter['valueList'].map((data2) => {
              if (_.eq(data1, data2)) {
                isNotData = false;
              }
            });
            if (isNotData) {
              filter.data.splice(num, 1);
            }
          }

          // 데이터가 모두 제거되었다면 필터자체를 제거한다.
          if (filter.data.length == 0) {
            this._selectFilterList.splice(num, 1);
          }
        }
      });

      // 발생시켰던 필터가 없어졌다면 저장목록에서도 제거
      if (isNotFilter) {
        this._selectFilterList.splice(num, 1);
      }
    }

    // 현재 차트에서 필터를 발생시킨경우
    if (externalFilters) {

      // 복사
      externalFilters = _.cloneDeep(externalFilters);

      // 필터 목록 제거
      for (let num = (externalFilters.length - 1); num >= 0; num--) {
        let filter = externalFilters[num];
        this._selectFilterList.map((field) => {
          if (_.eq(field.alias, filter.field)) {
            externalFilters.splice(num, 1);
          }
        });
      }
    }

    return externalFilters;
  }


  /**
   * 차트 옵션 변경 적용
   * @param uiOption
   */
  public uiOptionUpdatedHandler(uiOption) {
    this.uiOption = _.extend({}, this.uiOption, uiOption);
    if (this.widgetOption) {
      if (WidgetShowType.BY_WIDGET !== this.widgetOption.showMinimap) {
        this.toggleMiniMap((WidgetShowType.ON === this.widgetOption.showMinimap));
      }
      if (WidgetShowType.BY_WIDGET !== this.widgetOption.showLegend) {
        this.toggleLegend((WidgetShowType.ON === this.widgetOption.showLegend));
      }
    }
  } // function - uiOptionUpdatedHandler

  /**
   * 그리드 차트 옵션 변경 적용
   * @param uiOption
   */
  public gridUiOptionUpdatedHandler(uiOption) {
    this.gridUiOption = _.extend({}, this.gridUiOption, uiOption);
  } // function - gridUiOptionUpdatedHandler

  /**
   * 차트 표시 완료 이벤트
   */
  public updateComplete() {
    if (this._isDuringProcess) {

      // 새로고침 다시 그림 여부 설정
      this.isUpdateRedraw = (LayoutMode.EDIT === this.layoutMode);

      this.processEnd();
      this._isDuringProcess = false;

      if (!this.isGridType()
        && this.chartFuncValidator.checkUseSelectionByTypeString(this.chartType)
        && this.chartFuncValidator.checkUseMultiSelectionByTypeString(this.chartType)) {
        switch (this.mouseMode) {
          case 'SINGLE' :
            this.changeMouseSelectMode('single', 'single');
            break;
          case 'MULTI_RECT' :
            this.changeMouseSelectMode('multi', 'rect');
            break;
          case 'MULTI_POLY' :
            this.changeMouseSelectMode('multi', 'polygon');
            break;
        }
      }
    }
  } // function - updateComplete

  /**
   * 데이터 없음 표시
   */
  public showNoData() {
    this.isShowNoData = true;
    this.updateComplete();
  } // function - showNoData

  /**
   * 위젯 이름 표시 여부
   * @return {boolean}
   */
  public isShowWidgetName(): boolean {
    return this.isViewMode && this.widget && this.widget.name && this.isShowTitle && !this.isShowHierarchyView;
  } // function - isShowWidgetName

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - for Header
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 이름 조회
   * @return {string}
   */
  public getDataSourceName(): string {
    let strName: string = '';
    if (this.widget) {
      const widgetConf: PageWidgetConfiguration = this.widget.configuration;
      if (ChartType.MAP === widgetConf.chart.type && widgetConf.shelf.layers) {
        strName = widgetConf.shelf.layers.reduce((acc, currVal) => {
          const dsInfo: Datasource = this.widget.dashBoard.dataSources.find(item => item.engineName === currVal.ref);
          if (dsInfo) {
            acc = ('' === acc) ? acc + dsInfo.name : acc + ',' + dsInfo.name;
          }
          return acc;
        }, '');
      } else if (widgetConf.dataSource) {
        const widgetDataSource: Datasource
          = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, widgetConf.dataSource);
        (widgetDataSource) && (strName = widgetDataSource.name);
      } // enf if - widgetConf.dataSource
    } // end if - widget
    return strName;
  } // function - getDataSourceName

  /**
   * 대시보드 아이디 클립보드에 복사
   */
  public copyWidgetIdToClipboard() {
    if (this.widget) {
      this._clipboardService.copyFromContent(this.widget.id);
    }
  } // function - copyWidgetIdToClipboard

  /**
   * 피봇 정보 존재 여부
   * @param {string} category
   * @return {boolean}
   */
  public existPivot(category: string): boolean {
    return (this.widget && this.widget.configuration['pivot']
      && this.widget.configuration['pivot'][category]
      && 0 < this.widget.configuration['pivot'][category].length);
  } // function - existPivot

  /**
   * 선반의 필드 목록 반환
   * @param {string} category
   * @return {string}
   */
  public getPivotFieldsStr(category: string): string {
    let strFields: string = '';
    if (this.widget && this.widget.configuration['pivot']) {
      const pivotData = this.widget.configuration['pivot'][category];
      if (pivotData) {
        strFields = pivotData.map(item => item.name).join(',');
      }
    }
    return strFields;
  } // function - getPivotFieldsStr

  /**
   * 차트 필터 존재 여부
   * @return {boolean}
   */
  public existChartFilter(): boolean {
    return (this.widget && this.widget.configuration.filters && 0 < this.widget.configuration.filters.length);
  } // function - existChartFilter

  /**
   * 차트 필터 필드 목록 반환
   * @return {string}
   */
  public getChartFilterStr(): string {
    let strFields: string = '';
    if (this.widget && this.widget.configuration.filters) {
      strFields = this.widget.configuration.filters.map(item => item.field).join(',');
    }
    return strFields;
  } // function - getChartFilterStr

  /**
   * 차트 타입이 그리드 인지 반환한다.
   * @returns {boolean}
   */
  public isGridType(): boolean {
    if (this.widget) {
      const chartConf = this.widget.configuration.chart;
      return (chartConf && ChartType.GRID === chartConf.type) || ('grid' === this.widget.mode);
    } else {
      return false;
    }
  } // function - isGridType

  /**
   * 위젯 사이즈 전환
   */
  public toggleWidgetSize() {
    this.isMaximize = !this.isMaximize;
    this.broadCaster.broadcast('TOGGLE_SIZE', {widgetId: this.widget.id});
  } // function - toggleWidgetSize

  /**
   * 차트 이미지를 다운로드 한다.
   */
  public downloadChartImage() {
    // this.duringImageDown = true;
    // const tempWidget: PageWidget = <PageWidget>this.widget;

    this.imageService.downloadElementImage(this.$element.find('.ddp-box-widget:visible'), 'ChartImage.jpg');

    /*
    if (tempWidget.imageUrl) {
      this.imageService.downloadImageFromUrl(tempWidget.imageUrl)
        .then((result) => {
          saveAs(result.blob(), 'ChartImage.jpg');
          this.duringImageDown = false;
        })
        .catch(() => { this.duringImageDown = true; });
    } else {
      console.info('downerror');
      console.info(tempWidget);
    }
    */
  } // function - downloadChartImage

  /**
   * 마우스 select 모드 변경 변경
   * @param {string} mode
   * @param {string} brushType
   */
  public changeMouseSelectMode(mode: string, brushType: string) {
    if (isNullOrUndefined(this.chart)) {
      return;
    }
    if (ChartMouseMode.SINGLE.toString() === mode) {
      this.mouseMode = 'SINGLE';
      this.chart.convertMouseMode(ChartMouseMode.SINGLE);
    } else if (ChartMouseMode.MULTI.toString() === mode) {
      if (BrushType.RECT.toString() === brushType) {
        this.mouseMode = 'MULTI_RECT';
        this.chart.convertMouseMode(ChartMouseMode.MULTI, BrushType.RECT);
      } else {
        this.mouseMode = 'MULTI_POLY';
        this.chart.convertMouseMode(ChartMouseMode.MULTI, BrushType.POLYGON);
      }
    }
  } // function - changeMouseSelectMode

  /**
   * 마우스 zoomMode 모드 변경 변경
   * @param {string} mode
   */
  public changeMouseZoomMode(mode: string) {
    switch (mode) {
      case ChartMouseMode.DRAGZOOMIN.toString() :
        this.chart.convertMouseMode(ChartMouseMode.DRAGZOOMIN);
        break;
      case ChartMouseMode.ZOOMIN.toString() :
        this.chart.convertMouseMode(ChartMouseMode.ZOOMIN);
        break;
      case ChartMouseMode.ZOOMOUT.toString() :
        this.chart.convertMouseMode(ChartMouseMode.ZOOMOUT);
        break;
      case ChartMouseMode.REVERT.toString() :
        this.chart.convertMouseMode(ChartMouseMode.REVERT);
        break;
    }
  } // function - changeMouseZoomMode

  /**
   * 스타일 강제 설정
   * @param {boolean} isDisplay
   * @param {number} zIndex
   */
  public setForceStyle(isDisplay: boolean, zIndex: number = 3) {
    if (this.isShowDownloadPopup) {
      // when display download preview popup, not working
      return;
    }
    const $container: JQuery = $('.ddp-ui-widget');
    const $contents: JQuery = $('.ddp-ui-dash-contents');
    if (isDisplay) {
      this._dashboardOverflow = $container.css('overflow');
      // console.info( $( '.ddp-ui-widget').css( 'overflow' ) );
      $contents.css('z-index', zIndex);
      $container.css('overflow', '');
    } else {
      $contents.css('z-index', '');
      // $( '.ddp-ui-widget').css( 'overflow', this._dashboardOverflow );
    }
  } // function - setForceStyle

  /**
   * 차트 정보 레이어 표시될때의 처리 - 레이어 위치 설정
   * @param {MouseEvent} event
   */
  public showInfoLayer(event: MouseEvent) {
    let $target: JQuery = $(event.target);
    const btnLeft: number = $target.offset().left;
    const btnTop: number = $target.offset().top;
    this.$element.find('.ddp-box-btn2 .ddp-box-layout4').css({'left': btnLeft - 150, 'top': btnTop + 25});
  } // function - showInfoLayer

  // ----------------------------------------------------
  // 데이터 다운로드
  // ----------------------------------------------------

  /**
   * 다운로드 데이터 미리보기 표시
   * @param {MouseEvent} event
   */
  public showPreviewDownData(event: MouseEvent) {

    this.setForceStyle(true, 130);    // 스타일 설정
    this.isShowDownloadPopup = true;    // ui 표시
    this.safelyDetectChanges(); // 변경 적용
    setTimeout(() => {
      this.drawDataGrid();    // 그리드 표시
    }, 500);

  } // function - showPreviewDownData

  /**
   * 다운로드 데이터 미리보기 숨기기
   */
  public hidePreviewDownData() {
    this.isShowDownloadPopup = false;
    this.setForceStyle(false);
    this.safelyDetectChanges(); // 변경 적용
  } // function - hidePreviewDownData

  /*
  * 다운로드 팝업 표시
  * @param {MouseEvent} event
  */
  public showDownloadLayer(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (ConnectionType.LINK === ConnectionType[this.widget.configuration.dataSource.connType]) {
      this._dataDownComp.openGridDown(event, this._dataGridComp);
    } else {
      this._dataDownComp.openWidgetDown(event, this.widget.id, this.isOriginDown);
    }
  } // function - showDownloadLayer

  /**
   * draw data grid
   * @param isOriginal
   * @private
   */
  public drawDataGrid(isOriginal: boolean = false) {
    this.isOriginDown = isOriginal;
    this.isCanNotDownAggr = false;

    let fields = [];
    const clonePivot: Pivot = _.cloneDeep(this.widgetConfiguration.pivot);
    (clonePivot.rows) && (fields = fields.concat(clonePivot.rows));
    (clonePivot.columns) && (fields = fields.concat(clonePivot.columns));
    (clonePivot.aggregations) && (fields = fields.concat(clonePivot.aggregations));

    if (isOriginal && fields.some((field: Field) => (field['field'] && field['field'].aggregated))) {
      this.isCanNotDownAggr = true;
      this.safelyDetectChanges();
      return false;
    }

    this.loadingShow();
    const param = this.query.getDownloadFilters();

    // 그리드 생성 함수 정의
    const renderGrid: Function = (result) => {

      // 헤더정보 생성
      const headers: header[]
        = fields.map((field: Field) => {
        const logicalType: string = (field['field'] && field['field'].logicalType) ? field['field'].logicalType.toString() : '';
        let headerName: string = field.name;
        if (field['aggregationType']) {
          if (!isOriginal) {
            headerName = field.alias ? field.alias : field['aggregationType'] + '(' + field.name + ')';
          }
        } else if (field.alias) {
          headerName = field.alias;
        }

        return new SlickGridHeader()
          .Id(headerName)
          .Name('<span style="padding-left:20px;">'
            + '<em style="margin-top: -2px;" class="' + this.getFieldTypeIconClass(logicalType) + '"></em>'
            + headerName
            + '</span>'
          )
          .Field(headerName)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (headerName.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(false)
          .build();
      });

      let rows: any[] = result;
      // row and headers가 있을 경우에만 그리드 생성
      if (rows && 0 < headers.length) {
        if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
          rows = rows.map((row: any, idx: number) => {
            Object.keys(row).forEach(key => {
              row[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
            });
            row.id = idx;
            return row;
          });
        }

        // dom 이 모두 로드되었을때 작동
        this.changeDetect.detectChanges();

        this._dataGridComp.create(headers, rows, new GridOption()
          .SyncColumnCellResize(true)
          .RowHeight(32)
          .build());
        // search
        this._dataGridComp.search(this.srchText);

        this.loadingHide();
      }
    };

    if (ConnectionType.LINK === ConnectionType[this.widget.configuration.dataSource.connType]) {
      const boardConf: BoardConfiguration = this.widget.dashBoard.configuration;
      const query: SearchQueryRequest
        = this.datasourceService.makeQuery(
        this.widgetConfiguration,
        boardConf.fields,
        {
          url: this.router.url,
          dashboardId: this.widget.dashBoard.id,
          widgetId: this.widget.id
        }, null, true
      );
      this.widgetService.previewConfig(query, isOriginal, false, param)
        .then(result => renderGrid(result))
        .catch((err) => {
          console.error(err);
          this.loadingHide();
          // 변경 적용
          this.safelyDetectChanges();
        });
    } else {
      this.widgetService.previewWidget(this.widget.id, isOriginal, false, param)
        .then(result => renderGrid(result))
        .catch((err) => {
          console.error(err);
          this.loadingHide();
          // 변경 적용
          this.safelyDetectChanges();
        });
    }
  } // function - drawDataGrid

  /**
   * 검색어 설정 및 그리드 검색
   * @param {string} srchText
   */
  public setSearchText(srchText: string) {
    this.srchText = srchText;
    this._dataGridComp.search(this.srchText);
  } // function - setSearchText

  /**
   * redraw chart
   */
  public changeDraw() {
    this._search();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 위젯 설정
   * @param {PageWidget} widget
   * @private
   */
  private _setWidget(widget: PageWidget) {

    this.widget = <PageWidget>_.extend(new PageWidget(), widget);
    this.widgetConfiguration = <PageWidgetConfiguration>this.widget.configuration;
    this.chartType = this.widgetConfiguration.chart.type.toString();
    this.parentWidget = null;
    if (widget.dashBoard.configuration) {

      if (ChartType.MAP === (<PageWidgetConfiguration>this.widget.configuration).chart.type) {

        if ('default' === this.widgetConfiguration.dataSource.type) {
          // Pivot 내 누락된 필드 정보 설정
          const widgetDataSource: Datasource
            = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, this.widgetConfiguration.dataSource);
          const fields: Field[] = DashboardUtil.getFieldsForMainDataSource(this.widget.dashBoard.configuration, widgetDataSource.engineName);
          fields.forEach((field) => {

            // map - set shelf layers
            if (undefined !== this.widgetConfiguration.chart['layerNum'] && this.widgetConfiguration.chart['layerNum'] >= 0) {

              const shelfLayers: any = this.widgetConfiguration.shelf.layers[this.widgetConfiguration.chart['layerNum']];

              // 기존 스펙이 남아있을경우 변환
              if (_.isUndefined(shelfLayers['fields'])) {
                let tempShelf: Shelf = new Shelf();
                for (let idx = 0; idx < this.widgetConfiguration.shelf.layers.length; idx++) {
                  let tempLayer: any = _.cloneDeep(this.widgetConfiguration.shelf.layers[idx]);
                  if (_.isUndefined(tempShelf.layers[idx])) {
                    let shelfLayers: ShelfLayers = new ShelfLayers();
                    tempShelf.layers.push(shelfLayers);
                  }
                  tempShelf.layers[idx].fields = tempLayer;
                }
                this.widgetConfiguration.shelf = tempShelf;
              }

              this.widgetConfiguration.shelf.layers[this.widgetConfiguration.chart['layerNum']].fields
                .forEach((abstractField) => {
                  if (isNullOrUndefined(abstractField.field)
                    && String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
                    abstractField.field = field;
                  }
                });
            }
          });
        } else {

        }

        // 맵 차트
        this._setCommonConfig(this.widget);
      } else {
        // 일반 차트

        // Pivot 내 누락된 필드 정보 설정
        const widgetDataSource: Datasource
          = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, this.widgetConfiguration.dataSource);

        if (isNullOrUndefined(widgetDataSource)) {
          // If the widget does not have a data source
          this.processStart();
          this._isDuringProcess = true;
          this.isMissingDataSource = true;
          this._showError({
            code: 'GB0000',
            details: this.translateService.instant('msg.board.error.missing-datasource')
          });
          this.updateComplete();
        } else {
          // If the widget has a data source

          this.isMissingDataSource = false;

          const fields: Field[] = DashboardUtil.getFieldsForMainDataSource(this.widget.dashBoard.configuration, widgetDataSource.engineName);
          fields.forEach((field) => {
            this.widgetConfiguration.pivot.rows
              .forEach((abstractField) => {
                if (isNullOrUndefined(abstractField.field)
                  && String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
                  abstractField.field = field;
                }
              });

            this.widgetConfiguration.pivot.columns
              .forEach((abstractField) => {
                if (isNullOrUndefined(abstractField.field)
                  && String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
                  abstractField.field = field;
                }
              });

            this.widgetConfiguration.pivot.aggregations
              .forEach((abstractField) => {
                if (isNullOrUndefined(abstractField.field)
                  && String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
                  abstractField.field = field;
                }
              });
          });

          this._setCommonConfig(this.widget);
        } // end of - widgetDataSource

      } // end of - char type not Map

    } // end if - dashboard.configuration

    this.safelyDetectChanges();
    this.isInvalidPivot = !this.chart.isValid(this.widgetConfiguration.pivot, this.widgetConfiguration.shelf);

  } // function - _setWidget

  /**
   * 공통 설정
   * @param {PageWidget} widget
   * @private
   */
  private _setCommonConfig(widget: PageWidget) {

    this.isMissingDataSource = false;

    const boardConf: BoardConfiguration = widget.dashBoard.configuration;

    // Hierarchy 설정
    if (boardConf.relations) {
      const relations: DashboardPageRelation[] = boardConf.relations;
      const parentWidgetId: string = this._findParentWidgetId(widget.id, relations);
      if (parentWidgetId) {
        this.parentWidget = widget.dashBoard.widgets.find(item => item.id === parentWidgetId);
        this.isShowHierarchyView = true;
      }

      this._childWidgetIds = this._findChildWidgetIds(widget.id, relations);
    }

    // RealTime 데이터갱신 설정
    if (this.layoutMode !== LayoutMode.EDIT && boardConf.options.sync && boardConf.options.sync.enabled) {
      const syncOpts: BoardSyncOptions = boardConf.options.sync;
      this._interval = setInterval(() => {
        this.safelyDetectChanges();
        if (this.parentWidget) {
          // 차트에 대한 프로세스가 진행되었다는 것을 전파하기 위해 추가
          this.processStart();
          this._isDuringProcess = true;
          this.updateComplete();
        } else {
          this._search();
        }
      }, syncOpts.interval * 1000);
    }

    this.safelyDetectChanges();

    if (this.parentWidget) {
      // 차트에 대한 프로세스가 진행되었다는 것을 전파하기 위해 추가
      this.processStart();
      this._isDuringProcess = true;
      this.updateComplete();
    } else {
      this._search();
    }
  } // function - _setCommonConfig

  /**
   * 데이터 검색
   * @param {Filter[]} globalFilters
   * @param {Filter[]} selectionFilters
   * @private
   */
  private _search(globalFilters ?: Filter[], selectionFilters ?: Filter[]) {

    if (selectionFilters && selectionFilters.some(item => -1 < this._childWidgetIds.indexOf(item['selectedWidgetId']))) {
      return;
    }

    // 프로세스 실행 등록
    this.processStart();
    this._isDuringProcess = true;
    this.isSetChartData = false;

    if (!this.chart) {
      this.updateComplete();
      return;
    }

    // 버전 확인
    if (!this.uiOption.version || this.uiOption.version < SPEC_VERSION) {
      // 옵션 초기화
      this.uiOption = OptionGenerator.initUiOption(this.uiOption);
    }

    // 현재 위젯에서 발생시킨 필터정보 제외처리
    const currentSelectionFilters: Filter[] = this.changeExternalFilterList(selectionFilters);

    // Hierarchy View 설정
    if (this.parentWidget) {
      if (currentSelectionFilters) {
        const idx = currentSelectionFilters.findIndex(item => this.parentWidget.id === item['selectedWidgetId']);
        if (-1 < idx) {
          this.isShowHierarchyView = false;
        } else {
          this.isShowHierarchyView = true;
          this.updateComplete();
          this.safelyDetectChanges();
          return;
        }
      } else {
        this.isShowHierarchyView = true;
        this.updateComplete();
        this.safelyDetectChanges();
        return;
      }
    }

    const boardConf: BoardConfiguration = this.widget.dashBoard.configuration;

    // 커스텀 필드 설정
    const boardCustomFields: CustomField[] = boardConf.customFields;
    if (boardCustomFields && 0 < boardCustomFields.length) {
      const chartCustomField: CustomField[] = this.widgetConfiguration.customFields;
      if (!chartCustomField || chartCustomField.length !== boardCustomFields.length) {
        this.widgetConfiguration.customFields = $.extend(chartCustomField, _.cloneDeep(boardCustomFields));
      }
    }

    if (ChartType.MAP === this.widgetConfiguration.chart.type) {
      let targetDs: Datasource;
      if ('multi' === boardConf.dataSource.type) {
        const targetBoardDs: BoardDataSource = boardConf.dataSource.dataSources.find(item => {
          return item.engineName === this.widgetConfiguration.shelf.layers[0].ref
        });
        targetDs = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, targetBoardDs);
      } else {
        targetDs = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, boardConf.dataSource);
      }

      if (isNullOrUndefined(this.widgetConfiguration.chart['lowerCorner']) && targetDs.summary) {
        this.widgetConfiguration.chart['lowerCorner'] = targetDs.summary['geoLowerCorner'];
        this.widgetConfiguration.chart['upperCorner'] = targetDs.summary['geoUpperCorner'];
      }
    }

    // 쿼리 생성
    const query: SearchQueryRequest
      = this.datasourceService.makeQuery(
      this.widgetConfiguration,
      boardConf.fields,
      {
        url: this.router.url,
        dashboardId: this.widget.dashBoard.id,
        widgetId: this.widget.id
      }, null, true
    );

    // 선반 정보가 없을 경우 반환
    if (ChartType.MAP !== this.widgetConfiguration.chart.type && query.pivot.columns.length + query.pivot.rows.length + query.pivot.aggregations.length === 0) {
      this.updateComplete();
      return;
    }

    const uiCloneQuery = _.cloneDeep(query);

    if (ChartType.MAP === this.widgetConfiguration.chart.type) {
      if (this.widgetConfiguration.shelf.layers
        .filter(layer => layer.name !== CommonConstant.MAP_ANALYSIS_LAYER_NAME)
        .some(layer => {
          return isNullOrUndefined(this.widget.dashBoard.dataSources.find(item => item.engineName === layer.ref));
        })) {
        this.isMissingDataSource = true;
        this._showError({code: 'GB0000', details: this.translateService.instant('msg.board.error.missing-datasource')});
        this.updateComplete();
        return;
      }

      // 외부필터가 없고 글로벌 필터가 있을 경우 추가 (초기 진입시)
      if (isNullOrUndefined(globalFilters)) {
        globalFilters = [];
        this.widgetConfiguration.shelf.layers
          .filter(layer => layer.name !== CommonConstant.MAP_ANALYSIS_LAYER_NAME).forEach(layer => {
          globalFilters = globalFilters.concat(DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, layer.ref));
        });
      }

      // 외부 필터 ( 글로벌 필터 + Selection Filter )
      {
        let externalFilters = currentSelectionFilters ? globalFilters.concat(currentSelectionFilters) : globalFilters;
        this.widgetConfiguration.shelf.layers
          .filter(layer => layer.name !== CommonConstant.MAP_ANALYSIS_LAYER_NAME).forEach(layer => {
          uiCloneQuery.filters
            = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, layer.ref, externalFilters).concat(uiCloneQuery.filters);
        });
      }

    } else {
      // General Chart

      // 필터 설정
      const widgetDataSource: Datasource = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, this.widgetConfiguration.dataSource);

      if (isNullOrUndefined(widgetDataSource)) {
        this.isMissingDataSource = true;
        this._showError({code: 'GB0000', details: this.translateService.instant('msg.board.error.missing-datasource')});
        this.updateComplete();
        return;
      }

      // 외부필터가 없고 글로벌 필터가 있을 경우 추가 (초기 진입시)
      if (isNullOrUndefined(globalFilters)) {
        globalFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, widgetDataSource.engineName);
      }

      // 외부 필터 ( 글로벌 필터 + Selection Filter )
      {
        let externalFilters = currentSelectionFilters ? globalFilters.concat(currentSelectionFilters) : globalFilters;
        externalFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, widgetDataSource.engineName, externalFilters);
        uiCloneQuery.filters = externalFilters.concat(uiCloneQuery.filters);
      }
    }

    this.isShowNoData = false;
    this._hideError();

    // 서버 조회용 파라미터 (서버 조회시 필요없는 파라미터 제거)
    const cloneQuery = this._makeSearchQueryParam(_.cloneDeep(uiCloneQuery));

    // Map Chart 의 Multi Datasource 를 적용하기 위한 코드 - S
    // if (ChartType.MAP === this.widget.configuration.chart.type) {
    //
    //   let geoFieldCnt = 0;
    //   for (let column of this.widget.configuration.pivot.columns) {
    //     if (column.field.logicalType.toString().substring(0, 3) === 'GEO' && column['layerNum'] === 1) {
    //       geoFieldCnt = geoFieldCnt + 1;
    //     }
    //   }
    //
    //   if (geoFieldCnt > 1) { // < ==== multi datasource 가 되어야 하는 조건을 넣어주세요...
    //     cloneQuery.dataSource = _.cloneDeep(this.widget.dashBoard.configuration.dataSource);
    //
    //     for (let layer of cloneQuery.shelf.layers[0]) {
    //       layer.ref = layer.dataSource;
    //     }
    //
    //   }
    //
    //   // for(let layer of cloneQuery.shelf.layers[0]) {
    //   //   layer.ref = layer.dataSource;
    //   // }
    // }
    // Map Chart 의 Multi Datasource 를 적용하기 위한 코드 - E

    this.query = cloneQuery;
    if (this.chartType === 'label') {
      this.chart['setQuery'] = this.query;
    }

    // 차트 클리어 여부 판단
    const isClear: boolean = (this.chart && 'function' === typeof this.chart.clear
      && (this._currentSelectionFilterString !== JSON.stringify(currentSelectionFilters)
        || this._currentGlobalFilterString !== JSON.stringify(globalFilters)));

    // 필터 정보 저장
    this._currentSelectionFilters = currentSelectionFilters;
    this._currentSelectionFilterString = JSON.stringify(currentSelectionFilters);
    this._currentGlobalFilterString = JSON.stringify(globalFilters);

    this.datasourceService.searchQuery(cloneQuery).then((data) => {

      this.resultData = {
        data,
        config: query,
        uiOption: this.uiOption,
        params: {
          widgetId: this.widget.id,
          externalFilters: (currentSelectionFilters !== undefined && 0 < currentSelectionFilters.length),
          // 현재 차트가 선택한 필터목록
          selectFilterListList: this._selectFilterList
        }
      };

      let optionKeys = Object.keys(this.uiOption);
      if (optionKeys && optionKeys.length === 1) {
        delete this.resultData.uiOption;
      }

      this._initGridChart();

      // 대시보드 편집일 경우 차트 클릭 막음( params는 차트 클릭시 돌려받는 값)
      if (this.layoutMode === LayoutMode.EDIT && this.resultData.params) {
        delete this.resultData.params;
      }

      setTimeout(() => {

        // 차트 클리어
        (isClear) && (this.chart.clear());

        // line차트이면서 columns 데이터가 있는경우
        if (this.chartType === 'line' && this.resultData.data.columns && this.resultData.data.columns.length > 0) {
          // 고급분석 예측선 API 호출
          this.getAnalysis(cloneQuery);
        } else {
          this.chart.resultData = this.resultData;
          this.isSetChartData = true;
        }

        // Set Limit Info
        this.limitInfo = DashboardUtil.getChartLimitInfo(this.widget.id, ChartType[this.chartType.toUpperCase()], data);
        if (this.layoutMode === LayoutMode.EDIT) {
          this.broadCaster.broadcast('WIDGET_LIMIT_INFO', this.limitInfo);
        }

      }, 1000);

      // 변경 적용
      this.safelyDetectChanges();

    }).catch((error) => {
      // 프로세스 종료 등록 및 No Data 표시
      this._showError(error);
      this.updateComplete();
      // 변경 적용
      this.safelyDetectChanges();
    });
  } // function - _search

// noinspection JSMethodCanBeStatic
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
      for (let layers of cloneQuery.shelf.layers) {
        for (let layer of layers.fields) {
          delete layer['field'];
          delete layer['currentPivot'];
          delete layer['granularity'];
          delete layer['segGranularity'];
        }
      }

      // spatial analysis
      if (!_.isUndefined(cloneQuery.analysis)) {
        if (cloneQuery.analysis.use == true) {
          // 공간연산 사용
          delete cloneQuery.analysis.operation.unit;
          delete cloneQuery.analysis.layer;
          delete cloneQuery.analysis.layerNum;
          delete cloneQuery.analysis.use;
        } else {
          // 공간연산 미사용
          delete cloneQuery.analysis;
        }
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
        item.type === 'spatial_bbox' ||
        FilterUtil.isTimeAllFilter(item) ||
        FilterUtil.isTimeRelativeFilter(item) ||
        FilterUtil.isTimeRangeFilter(item) ||
        (FilterUtil.isTimeListFilter(item) && item['valueList'] && 0 < item['valueList'].length);
    });

    cloneQuery.userFields = CommonUtil.objectToArray(cloneQuery.userFields);

    return cloneQuery;
  } // function - _makeSearchQueryParam

  /**
   * 그리드 데이터 호출
   * @private
   */
  private _initGridChart() {
    try {
      if (this.gridChart && this.gridChart.isLoaded) {
        this.gridChart.resultData = this.resultData;
      }
    } catch (err) {
      console.error(err);
    }
  } // function - _initGridChart

  /**
   * 부모 위젯 아이디 탐색
   * @param {string} widgetId
   * @param {DashboardPageRelation[]} relations
   * @returns {string}
   * @private
   */
  private _findParentWidgetId(widgetId: string, relations: DashboardPageRelation[]): string {
    let parentId: string = '';

    relations.some(item => {
      if (item.children) {
        if (-1 < item.children.findIndex(child => child.ref === widgetId)) {
          parentId = item.ref;
          return true;
        } else {
          parentId = this._findParentWidgetId(widgetId, item.children);
          return ('' !== parentId);
        }
      } else {
        return false;
      }
    });

    return parentId;
  } // function - _findParentWidgetId

  /**
   * 자식 위젯 아이디 탐색
   * @param {string} widgetId
   * @param {DashboardPageRelation[]} relations
   * @param {boolean} isCollect
   * @return {string}
   * @private
   */
  private _findChildWidgetIds(widgetId: string, relations: DashboardPageRelation[], isCollect: boolean = false): string[] {
    let childIds: string[] = [];

    relations.forEach(item => {
      if (item.children) {
        if (item.ref === widgetId || isCollect) {
          childIds = item.children.map(child => child.ref);
          childIds = childIds.concat(this._findChildWidgetIds(widgetId, item.children, true));
        } else {
          childIds = childIds.concat(this._findChildWidgetIds(widgetId, item.children, false));
        }
      }
    });

    return childIds;
  } // function - _findChildWidgetIds

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
   * @param query
   */
  private getAnalysis(query: SearchQueryRequest): void {
    if (this.isAnalysisPredictionEnabled()) {
      Promise
        .resolve()
        .then(() => {
          if (this.isAnalysisPredictionEnabled()) {
            this.analysisPredictionService.getAnalysisPredictionLineFromDashBoard(
              this.widgetConfiguration, this.widget, this.chart, this.resultData, query.filters
            ).catch((error) => {
              this._showError(error);
              this.updateComplete();
            });
          } else {
            this.predictionLineDisabled();
          }
        })
    } else {
      this.predictionLineDisabled();
    }
  }

  /**
   * Check datasource
   * @private
   */
  private _checkDatasource(): void {
    let valid = true;
    let invalidDatasourceName = '';
    if (this.widget.configuration.chart.type === ChartType.MAP && !_.isNil(this.widget.configuration.dataSource.dataSources)) {
      for (const widgetDatasource of this.widget.configuration.dataSource.dataSources) {
        for (const dashboardDatasource of this.inputWidget.dashBoard.dataSources) {
          if (widgetDatasource.id == dashboardDatasource.id) {
            if (!dashboardDatasource.valid) {
              valid = false;
              if (invalidDatasourceName != '') {
                invalidDatasourceName += ', '
              }
              invalidDatasourceName += dashboardDatasource.name;
            }
          }
        }
      }
    } else {
      for (const dashboardDatasource of this.inputWidget.dashBoard.dataSources) {
        if (this.widget.configuration.dataSource.id == dashboardDatasource.id) {
          if (!dashboardDatasource.valid) {
            valid = false;
            invalidDatasourceName = dashboardDatasource.name;
          }
        }
      }
    }

    if (!valid) {
      this._showError({
        code: 'GB0000',
        details: this.translateService.instant('msg.board.error.deny-datasource', {datasource: invalidDatasourceName})
      });
    }
  }

}
