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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../common/component/abstract-popup.component';
import {PageWidget, PageWidgetConfiguration} from '../domain/dashboard/widget/page-widget';
import {PopupService} from '../common/service/popup.service';

import {StringUtil} from '../common/util/string.util';
import {Pivot} from '../domain/workbook/configurations/pivot';
import {ConnectionType, Datasource, Field, FieldPivot, FieldRole, LogicalType} from '../domain/datasource/datasource';
import {
  BarMarkType,
  ChartColorType,
  ChartType,
  EventType,
  LegendConvertType,
  ShelveFieldType,
  SPEC_VERSION
} from '../common/component/chart/option/define/common';
import {Field as AbstractField} from '../domain/workbook/configurations/field/field';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {PagePivotComponent} from './page-pivot/page-pivot.component';
import {SearchQueryRequest} from '../domain/datasource/data/search-query-request';
import {DatasourceService} from '../datasource/service/datasource.service';
import {BaseChart, ChartSelectInfo} from '../common/component/chart/base-chart';
import {UIOption} from '../common/component/chart/option/ui-option';
import {GridChartComponent} from '../common/component/chart/type/grid-chart/grid-chart.component';
import {Subject} from 'rxjs/Subject';
import {DIRECTION, Sort} from '../domain/workbook/configurations/sort';
import {Filter} from '../domain/workbook/configurations/filter/filter';
import {OptionGenerator} from '../common/component/chart/option/util/option-generator';
import {Widget} from '../domain/dashboard/widget/widget';
import {ImageService} from '../common/service/image.service';
import {ExpressionField} from '../domain/workbook/configurations/field/expression-field';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {Alert} from '../common/util/alert.util';
import {WidgetService} from '../dashboard/service/widget.service';
import {saveAs} from 'file-saver';
import {Modal} from '../common/domain/modal';
import {ConfirmModalComponent} from '../common/component/modal/confirm/confirm.component';
import {DragulaService} from '../../lib/ng2-dragula';
import {PageDataContextComponent} from './page-data/page-data-context.component';
import {Format} from '../domain/workbook/configurations/format';
import {FilterUtil} from '../dashboard/util/filter.util';
import {isNullOrUndefined, isUndefined} from 'util';
import {AnalysisComponent} from './component/analysis/analysis.component';
import {AnalysisPredictionService} from './component/analysis/service/analysis.prediction.service';
import {CustomField} from '../domain/workbook/configurations/field/custom-field';
import {CommonOptionComponent} from './chart-style/common-option.component';
import {FormatOptionComponent} from './chart-style/format-option.component';
import {BarChartComponent} from '../common/component/chart/type/bar-chart/bar-chart.component';
import {LineChartComponent} from '../common/component/chart/type/line-chart/line-chart.component';
import {NetworkChartComponent} from '../common/component/chart/type/network-chart/network-chart.component';
import {HyperParameter} from './component/value/analysis';
import {ColorOptionComponent} from './chart-style/color-option.component';
import {ConfigureFiltersComponent} from '../dashboard/filters/configure-filters.component';
import {PageFilterPanel} from './filter/filter-panel.component';
import {SecondaryIndicatorComponent} from './chart-style/secondary-indicator.component';
import {DataLabelOptionComponent} from './chart-style/datalabel-option.component';
import {ChartLimitInfo, DashboardUtil} from '../dashboard/util/dashboard.util';
import {BoardConfiguration} from '../domain/dashboard/dashboard';
import {CommonUtil} from '../common/util/common.util';
import {MapChartComponent} from '../common/component/chart/type/map-chart/map-chart.component';
import {MapFormatOptionComponent} from './chart-style/map/map-format-option.component';
import {MapTooltipOptionComponent} from './chart-style/map/map-tooltip-option.component';
import {MapLayerOptionComponent} from './chart-style/map/map-layer-option.component';
import {Shelf, ShelfLayers} from '../domain/workbook/configurations/shelf/shelf';
import {MapPagePivotComponent} from './page-pivot/map/map-page-pivot.component';
import {UIMapOption} from '../common/component/chart/option/ui-option/map/ui-map-chart';
import {MapLayerType} from '../common/component/chart/option/define/map/map-common';
import {fromEvent} from "rxjs";
import {debounceTime, map} from "rxjs/operators";

const possibleMouseModeObj: any = {
  single: ['bar', 'line', 'grid', 'control', 'scatter', 'heatmap', 'pie', 'wordcloud', 'boxplot', 'combine'],
  multi: ['bar', 'line', 'control', 'scatter', 'combine'],
  zoom: ['bar', 'line', 'scatter', 'control', 'boxplot', 'combine', 'waterfall', 'combine']
};

const possibleChartObj: any = {
  common: ['bar', 'line', 'grid', 'scatter', 'heatmap', 'pie', 'control', 'label', 'boxplot', 'waterfall', 'combine', 'treemap', 'radar', 'network', 'sankey', 'gauge'],
  // rnb 색상 보여주는 차트
  color: ['bar', 'grid', 'line', 'scatter', 'control', 'pie', 'wordcloud', 'boxplot', 'radar', 'heatmap', 'combine', 'gauge', 'network', 'sankey', 'treemap'],
  // rnb filter 보여주는 차트
  format: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'control', 'label', 'boxplot', 'waterfall', 'combine', 'treemap', 'radar', 'gauge', 'network', 'sankey', 'grid'],
  // Split 가능 차트 목록
  //split: ['bar', 'line', 'scatter', 'heatmap'],
  split: [],
  //legend: ['bar', 'line', 'scatter', 'heatmap', 'pie'],
  legend: [],
  yAxis: ['bar', 'line', 'scatter', 'heatmap', 'gauge', 'control', 'boxplot', 'waterfall', 'combine'],
  xAxis: ['bar', 'line', 'scatter', 'heatmap', 'gauge', 'control', 'boxplot', 'waterfall', 'combine'],
  dataLabel: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'gauge', 'control', 'waterfall', 'combine', 'radar', 'network', 'sankey', 'treemap'],
  tooltip: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'control', 'boxplot', 'waterfall', 'combine', 'treemap', 'radar', 'network', 'sankey', 'gauge'],
  calculatedRow: ['grid'],
  secondaryIndicator: ['label'],
  secondaryAxis: ['combine'],
  mapCommon: ['map'],
  mapLayer: ['map'],
  mapLayer1: ['map'],
  mapLayer2: ['map'],
  mapLayer3: ['map'],
  mapLegend: ['map'],
  mapFormat: ['map'],
  mapTooltip: ['map']
};

@Component({
  selector: 'app-page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(ConfirmModalComponent)
  private confirmModalComponent: ConfirmModalComponent;

  @ViewChild('pagePivot')
  private pagePivot: PagePivotComponent;

  @ViewChild('mapPivot')
  private mapPivot: MapPagePivotComponent;

  @ViewChild('chart')
  private chart: BaseChart;

  @ViewChild(NetworkChartComponent)
  private networkChart: NetworkChartComponent;

  @ViewChild(MapChartComponent)
  private mapChart: MapChartComponent;

  @ViewChild('gridChart')
  private gridChart: GridChartComponent;

  @ViewChild('formatOption')
  private formatOption: FormatOptionComponent;

  @ViewChild('commonOption')
  private commonOption: CommonOptionComponent;

  @ViewChild('dataLabelOption')
  private dataLabelOption: DataLabelOptionComponent;

  @ViewChild('colorOption')
  private colorOption: ColorOptionComponent;

  @ViewChild('secondaryIndicatorOption')
  private secondaryIndicatorOption: SecondaryIndicatorComponent;

  // color 패널
  @ViewChild(ColorOptionComponent)
  private colorComponent: ColorOptionComponent;

  @ViewChild(AnalysisComponent)
  public analysisComponent: AnalysisComponent;

  @ViewChild(LineChartComponent)
  private lineChartComponent: LineChartComponent;

  private selectChartSource: Subject<Object> = new Subject<Object>();
  private selectChart$ = this.selectChartSource.asObservable().pipe(debounceTime(100));

  // page data 하위의 context menu
  @ViewChild(PageDataContextComponent)
  private dataContext: PageDataContextComponent;

  @ViewChild(ConfigureFiltersComponent)
  private _configFilterComp: ConfigureFiltersComponent;

  @ViewChild(PageFilterPanel)
  private _filterPanelComp: PageFilterPanel;

  /////////////////////////
  // 맵뷰 옵션들
  /////////////////////////

  @ViewChild('mapFormatOption')
  private mapFormatOption: MapFormatOptionComponent;

  @ViewChild('mapTooltipOption')
  private mapTooltipOption: MapTooltipOptionComponent;

  @ViewChild('mapLayerOption')
  private mapLayerOption: MapLayerOptionComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  protected isShowGuide: boolean;
  protected guideLayout: any = [];

  // 차트에서 사용하는 옵션
  // protected uiOption: UIOption = {};

  /* 사용자 정의 필드 관련 */

  // 변경할 커스텀 필드
  protected selectedCustomField: ExpressionField;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터 소스
  public dataSource: Datasource;

  // TODO: 차트 테스트용
  @Input()
  public isChartTest: boolean;

  // 스펙확인전 최초 호출여부
  public isVersionCheck: boolean = false;

  // 차트에서 사용하는 데이터
  public resultData: any;

  // 차트뷰 여부 (true: 차트뷰, false: 그리드뷰)
  public isChartView: boolean = true;

  // 그리드에서 사용하는 옵션
  public gridUiOption: UIOption = {};

  // 추천차트 목록
  public recommendCharts: string[] = [];

  // 사용자 정의 필드
  public isShowCustomFiled: boolean = false;

  // LNB > Data > 사용자 정의 측정값
  public customMeasures: ExpressionField[];

  // LNB > Data > 측정값
  public measures: Field[];

  // LNB > Data > 차원값U
  public dimensions: Field[];

  // PAGE > OPTION PANNEL (fields with custom fields)
  public fieldsWCustom: Field[];

  // LNB > Data > 사용자 정의 차원값U
  public customDimensions: ExpressionField[];

  // 페이징 정보
  public MAX_PAGE_COUNT: number = 30;
  public pageDimensions: Field[] = [];
  public pageMeasures: Field[] = [];

  // Dimension 페이지 정보
  public dimensionPage: number = 1;
  public dimensionTotalPage: number = 1;

  // Measure 페이지 정보
  public measurePage: number = 1;
  public measureTotalPage: number = 1;

  // Widget 데이터
  public widget: PageWidget;
  public originalWidget: PageWidget;

  // 위젯 속성 일부분만 변경하여 저장할 때 사용할 용도
  public originalWidgetConfiguration: PageWidgetConfiguration;

  // Dashboard에서 띄워지는지 여부
  public isDashboard: boolean = true;

  // 페이지 이름 에디팅여부
  public isPageNameEdit: boolean = false;

  // 에디팅중인 페이지 이름
  public editingPageName: string;

  // Data Detail 팝업 Show 여부
  public isShowDataDetail: boolean = false;

  // Data Detail 팝업: 컬럼 디테일 여부
  public isColumnDetail: boolean = false;

  public isNoData: boolean = false;         // No Data 여부
  public isError: boolean = false;          // 에러 상태 표시 여부

  // Limit 정보
  public limitInfo: ChartLimitInfo = {id: '', isShow: false, currentCnt: 0, maxCnt: 0};

  // 센키차트 모든노트 표시안함 여부
  public isSankeyNotAllNode: boolean = false;

  // 데이터 조회 쿼리
  public query: SearchQueryRequest;

  // 데이터소스 목록
  public dataSourceList: Datasource[] = [];
  public fields: Field[] = [];
  public boardFilters: Filter[] = [];

  // geo type from datasource fields (for map)
  public geoType: LogicalType;

  // public getSankeyNotAllNode(): boolean {
  //   console.info(this.isSankeyNotAllNode);
  //   let isSankeyNotAllNode: boolean = this.isSankeyNotAllNode && !this.isNoData && this.isChartView == 'block' && this.selectChart == 'sankey';
  //   return isSankeyNotAllNode;
  // }
  // public setSankeyNotAllNode(isSankeyNotAllNode: boolean): void {
  //   console.info(this.isSankeyNotAllNode);
  //   this.isSankeyNotAllNode = isSankeyNotAllNode;
  // }

  @Input('widget')
  set setWidget(widget: PageWidget) {

    if (widget.configuration.filters) {
      widget.configuration.filters.forEach(item => {
        (item.ui) || (item.ui = {});
        item.ui.importanceType = 'general';
      });
    }

    this.originalWidget = widget;

    this.dataSourceList = DashboardUtil.getMainDataSources(widget.dashBoard);

    const widgetDataSource: Datasource
      = DashboardUtil.getDataSourceFromBoardDataSource(widget.dashBoard, widget.configuration.dataSource);
    this.selectDataSource(widgetDataSource ? widgetDataSource : this.dataSourceList[0], false);
  }

  @Input('dashboard')
  set setIsDashboard(isDashboard: boolean) {

    // Set
    this.isDashboard = isDashboard;
  }

  @Output('changeFieldAlias')
  public changeFieldAliasEvent: EventEmitter<Field> = new EventEmitter();

  // LNB 메뉴 SHOW, HIDE FLAG
  public dataLayerKey: string;
  // public isDataLayerShow: boolean;
  public isDataDimensionLayerShow: boolean;
  public isDataMeasureLayerShow: boolean;
  // public isChartLayerShow: boolean;
  public isModelLayerShow: boolean;
  // public isStyleLayerShow: boolean = false;
  // public isDiscoveryLayerShow: boolean = false;

  // LNB > Data > 검색어
  public fieldSearchText: string = '';
  public fieldDetailLayer: Field;
  public $fieldDetailLayer: JQuery;

  // RNB > Menu
  public rnbMenu: string = '';

  // dimension / measure / parameter 구분값
  public columnType: string;

  // set z-index class in map
  public panelZIndex: boolean = false;

  get widgetConfiguration(): PageWidgetConfiguration {
    return <PageWidgetConfiguration>this.widget.configuration;
  }

  get selectChart(): string {
    return this.widgetConfiguration.chart.type ? this.widgetConfiguration.chart.type.toString().toLowerCase() : '';
  }

  set selectChart(chartType: string) {

    // 차트타입을 재선택시 return
    if (this.selectChart === chartType) {
      return;
    } else {
      this.widgetConfiguration.chart.type = ChartType[chartType.toUpperCase()] as ChartType;

      const deepCopyUiOption = _.cloneDeep(this.uiOption);

      // ui 초기화
      this.uiOption = OptionGenerator.initUiOption(this.uiOption);

      // 차트만 변경시 min / max값은 변경되지 않으므로 초기화되지않게 설정
      this.uiOption.minValue = deepCopyUiOption.minValue;
      this.uiOption.maxValue = deepCopyUiOption.maxValue;

      // // 차트별 선반위치 변경
      // this.pagePivot.onChangePivotPosition(chartType);

      // 차트별 선반위치 변경
      this.changeDetect.detectChanges();

      // convert pivot to shelf or shelf to pivot
      if ('map' === chartType) {
        this.shelf = this.convertPivotToShelf(this.shelf);

        // find geo type from dimension list
        this.geoType = this.getMapGeoType();

        this._setDefaultAreaForBBox(this.dataSource);

      } else {
        this.pivot = this.convertShelfToPivot(this.pivot, deepCopyUiOption);
      }

      // 차트별 선반위치 변경
      this.changeDetect.detectChanges();

      this.getPivotComp().onChangePivotPosition(chartType);

      // 변경된 선반위치로 추천가능한 차트리스트 설정
      this.recommendChart();
    }

    this.selectChartSource.next({chartType: chartType, type: EventType.CHART_TYPE});

  }

  get uiOption(): UIOption {
    return this.widgetConfiguration.chart;
  }

  set uiOption(uiOption: UIOption) {
    this.widgetConfiguration.chart = uiOption;
  }

  get pivot(): Pivot {
    if (this.widgetConfiguration.pivot === undefined) {
      return new Pivot();
    }
    return this.widgetConfiguration.pivot;
  }

  set pivot(pivot: Pivot) {
    this.widgetConfiguration.pivot = pivot;
  }

  get shelf(): Shelf {
    if (this.widgetConfiguration.shelf === undefined) {
      return new Shelf();
    }
    return this.widgetConfiguration.shelf;
  }

  set shelf(shelf: Shelf) {
    this.widgetConfiguration.shelf = shelf;
  }

  get sorts(): Sort[] {
    return this.widgetConfiguration.limit.sort;
  }

  set sorts(sorts: Sort[]) {
    this.widgetConfiguration.limit.sort = sorts;
  }

  get filters(): Filter[] {
    return this.widgetConfiguration.filters;
  }

  set filters(filters: Filter[]) {
    this.widgetConfiguration.filters = filters;
  }

  // LNB > 차트 > 마우스 오버시 정보를 보여주기 위한 변수
  public showInfoChart: string;

  public isChartShow: boolean;

  // data패널의 필드의 icon show hide 설정
  public showFieldIconsFl: boolean = false;

  // 선택한 필드
  public selectedField: Field;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dashboardService: DashboardService,
              private widgetService: WidgetService,
              private popupService: PopupService,
              private activatedRoute: ActivatedRoute,
              private dragulaService: DragulaService,
              private datasourceService: DatasourceService,
              private imageService: ImageService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private analysisPredictionService: AnalysisPredictionService) {
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

    // resize시 data panel의 내부 스크롤 설정
    const resizeEvent$ = fromEvent(window, 'resize')
      .pipe(
        map(() => document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight),
        debounceTime(500)
      );
    const windowResizeSubscribe = resizeEvent$.subscribe(() => {
      this.dataPanelInnerScroll();

      // 컬러패널이 활성화 되어있을때 컬러패널 resize에 따라서 위치 재설정
      if (this.colorComponent && this.colorComponent.colorPicker && this.colorComponent.colorPicker.show) {
        // color picker 팝업 이동 설정
        const $target = this.$element.find('.ddp-wrap-chart-side .ddp-box-color.ddp-selected');
        const $picker = this.$element.find('.ddp-pop-colorpicker');
        if ($target && $target.offset()) {
          const $targetX = $target.offset().left;

          $picker.css({
            'left': $targetX - 30
          });
        }
      }
    });

    this.subscriptions.push(windowResizeSubscribe);

    const changeChartSubs = this.selectChart$.subscribe((param) => {
      if (param['chartType'] !== '') {
        this.drawChart({type: param['type']});
      }
    });

    const paramSubs: Subscription = this.activatedRoute.params.subscribe((params) => {
      const pageId = params['pageId'];
      // console.info('pageId', pageId, this.widget);

      // 위젯이 아닌 직접 들어온 경우
      if (pageId) {
        // 테스트 코드
        const pageWidget: PageWidget = new PageWidget();
        pageWidget.id = StringUtil.random(10);
        pageWidget.name = '페이지 위젯 (더미선반정보) - line';

        const pageConf: PageWidgetConfiguration = <PageWidgetConfiguration>pageWidget.configuration;
        pageConf.chart.type = ChartType.BAR;

        pageConf.dataSource = JSON.parse(`{"type":"default","name":"sales"}`);

        pageConf.pivot = JSON.parse(`{"columns":[{"type":"dimension","name":"Region","alias":"Region"}],"rows":[],"aggregations":[{"type":"measure","aggregationType":"SUM","name":"Sales","alias":"Sales"},{"type":"measure","aggregationType":"SUM","name":"Profit","alias":"Profit"}]}`);

        // pageWidget.dashBoard = JSON.parse(`{"name":"ㅁㅁㅁ","id":"bb2c35dd-a203-4b0e-9a8c-3729ccf7d305","seq":0,"modifiedBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"modifiedTime":"2017-08-21T08:21:19.000Z","createdBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"createdTime":"2017-08-21T08:21:19.000Z","dataSources":[{"createdBy":"polaris","createdTime":"2017-08-21T12:24:35.000Z","modifiedBy":"unknown","modifiedTime":"2017-08-21T03:25:30.000Z","id":"ds-37","name":"sales","engineName":"sales","ownerId":"polaris","description":"sales data (2011~2014)","dsType":"MASTER","connType":"ENGINE","granularity":"DAY","status":"ENABLED","published":true,"fields":[{"name":"OrderDate","alias":"OrderDate","type":"TIMESTAMP","biType":"TIMESTAMP","role":"TIMESTAMP","seq":0,"mappedField":[]},{"name":"Category","alias":"Category","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":1,"mappedField":[]},{"name":"City","alias":"City","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":2,"mappedField":[]},{"name":"Country","alias":"Country","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":3,"mappedField":[]},{"name":"CustomerName","alias":"CustomerName","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":4,"mappedField":[]},{"name":"Discount","alias":"Discount","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":5,"mappedField":[]},{"name":"OrderID","alias":"OrderID","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":6,"mappedField":[]},{"name":"PostalCode","alias":"PostalCode","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":7,"mappedField":[]},{"name":"ProductName","alias":"ProductName","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":8,"mappedField":[]},{"name":"Profit","alias":"Profit","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":9,"mappedField":[]},{"name":"Quantity","alias":"Quantity","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":10,"mappedField":[]},{"name":"Region","alias":"Region","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":11,"mappedField":[]},{"name":"Sales","alias":"Sales","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":12,"mappedField":[]},{"name":"Segment","alias":"Segment","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":13,"mappedField":[]},{"name":"ShipDate","alias":"ShipDate","type":"TIMESTAMP","biType":"DIMENSION","role":"DIMENSION","seq":14,"format":"yyyy. MM. dd.","mappedField":[]},{"name":"ShipMode","alias":"ShipMode","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":15,"mappedField":[]},{"name":"State","alias":"State","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":16,"mappedField":[]},{"name":"Sub-Category","alias":"Sub-Category","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":17,"mappedField":[]},{"name":"DaystoShipActual","alias":"DaystoShipActual","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":18,"mappedField":[]},{"name":"SalesForecast","alias":"SalesForecast","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":19,"mappedField":[]},{"name":"ShipStatus","alias":"ShipStatus","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":20,"mappedField":[]},{"name":"DaystoShipScheduled","alias":"DaystoShipScheduled","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":21,"mappedField":[]},{"name":"OrderProfitable","alias":"OrderProfitable","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":22,"mappedField":[]},{"name":"SalesperCustomer","alias":"SalesperCustomer","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":23,"mappedField":[]},{"name":"ProfitRatio","alias":"ProfitRatio","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":24,"mappedField":[]},{"name":"SalesaboveTarget","alias":"SalesaboveTarget","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":25,"mappedField":[]},{"name":"latitude","alias":"latitude","type":"LNT","biType":"DIMENSION","role":"DIMENSION","seq":26,"mappedField":[]},{"name":"longitude","alias":"longitude","type":"LNG","biType":"DIMENSION","role":"DIMENSION","seq":27,"mappedField":[]}],"summary":{"ingestionMinTime":"2011-01-01T00:00:00.000Z","ingestionMaxTime":"2015-01-01T00:00:00.000Z","size":3061790,"count":9993},"alias":"sales","dataSourceType":"MASTER","implementor":""}],"widgets":[{"isLoading":false,"type":"filter","configuration":{"layout":{"x":0,"y":0,"cols":2,"rows":2},"filter":{"type":"include","field":"Category","valueList":[]}},"id":"IL7cqV7l5v"},{"isLoading":false,"type":"text","configuration":{"layout":{"x":2,"y":0,"cols":2,"rows":2}},"id":"tFkjQ21hFK","contents":"<h1><strong class=\\"ql-font-monospace\\" style=\\"color: rgb(255, 255, 255); background-color: rgb(255, 153, 0);\\">Metatron!<br/>메타트론</strong></h1>"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":4,"y":0,"cols":6,"rows":3},"chart":{"type":"line"}},"mode":"chart","id":"BIZ2r2DA4P","name":"페이지 위젯 (더미선반정보) - line"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":0,"y":2,"cols":4,"rows":4},"chart":{"type":"bar"}},"mode":"chart","id":"69xX3Bfis4","name":"페이지 위젯 (더미선반정보) - bar"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":4,"y":3,"cols":3,"rows":3},"chart":{"type":"heatmap"}},"mode":"chart","id":"56ZXrO8gWP","name":"페이지 위젯 (더미선반정보) - heatmap"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":7,"y":3,"cols":3,"rows":3},"chart":{"type":"scatter"}},"mode":"chart","id":"FZiTJHaqJH","name":"페이지 위젯 (더미선반정보) - scatter"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":0,"y":5,"cols":5,"rows":3},"chart":{"type":"grid"}},"mode":"chart","id":"1K6b3CnUHt"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":5,"y":5,"cols":5,"rows":3},"chart":{"type":"control"}},"mode":"chart","id":"o4MQCuHBtR","name":"페이지 위젯 (더미선반정보) - control"}],"configuration":{"dataSource":{"joins":[],"name":"sales","type":"default"}},"_links":{"self":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305"},"dashboard":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305{?projection}","templated":true},"workBook":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/workbook"},"dataSources":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/datasources"},"widgets":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/widgets"}},"workBook":{"name":"ㄹㄹ","id":"e55c7c3c-0bb3-465d-9c03-317cb21527d2","type":"workbook","dataSource":[{"name":"sales","id":"ds-37","description":"sales data (2011~2014)","engineName":"sales","_links":{"self":{"href":"http://localhost:8180/api/datasources/ds-37{?projection}","templated":true},"connection":{"href":"http://localhost:8180/api/datasources/ds-37/connection"},"workspaces":{"href":"http://localhost:8180/api/datasources/ds-37/workspaces"},"dashBoards":{"href":"http://localhost:8180/api/datasources/ds-37/dashboards"}}}],"modifiedBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"modifiedTime":"2017-08-21T08:21:19.000Z","workspaceId":"ws-00","createdBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"createdTime":"2017-08-21T08:21:11.000Z","dashBoards":[{"name":"ㅁㅁㅁ","id":"bb2c35dd-a203-4b0e-9a8c-3729ccf7d305","seq":0,"_links":{"self":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305{?projection}","templated":true},"workBook":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/workbook"},"dataSources":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/datasources"},"widgets":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/widgets"}}}],"folderId":"ROOT","countOfComments":0,"_links":{"self":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2"},"workbook":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2{?projection}","templated":true},"workspace":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2/workspace"},"dashBoards":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2/dashboards"}}}}`);
        pageWidget.dashBoard = JSON.parse(`{"name":"For Chart Test","id":"bb2c35dd-a203-4b0e-9a8c-3729ccf7d305","seq":0,"modifiedBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"modifiedTime":"2017-08-21T08:21:19.000Z","createdBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"createdTime":"2017-08-21T08:21:19.000Z","dataSources":[{"createdBy":"polaris","createdTime":"2017-08-21T12:24:35.000Z","modifiedBy":"unknown","modifiedTime":"2017-08-21T03:25:30.000Z","id":"ds-37","name":"sales","engineName":"sales","ownerId":"polaris","description":"sales data (2011~2014)","dsType":"MASTER","connType":"ENGINE","granularity":"DAY","status":"ENABLED","published":true,"fields":[{"name":"OrderDate","alias":"OrderDate","type":"TIMESTAMP","biType":"TIMESTAMP","role":"TIMESTAMP","seq":0,"mappedField":[]},{"name":"Category","alias":"Category","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":1,"mappedField":[]},{"name":"City","alias":"City","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":2,"mappedField":[]},{"name":"Country","alias":"Country","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":3,"mappedField":[]},{"name":"CustomerName","alias":"CustomerName","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":4,"mappedField":[]},{"name":"Discount","alias":"Discount","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":5,"mappedField":[]},{"name":"OrderID","alias":"OrderID","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":6,"mappedField":[]},{"name":"PostalCode","alias":"PostalCode","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":7,"mappedField":[]},{"name":"ProductName","alias":"ProductName","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":8,"mappedField":[]},{"name":"Profit","alias":"Profit","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":9,"mappedField":[]},{"name":"Quantity","alias":"Quantity","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":10,"mappedField":[]},{"name":"Region","alias":"Region","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":11,"mappedField":[]},{"name":"Sales","alias":"Sales","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":12,"mappedField":[]},{"name":"Segment","alias":"Segment","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":13,"mappedField":[]},{"name":"ShipDate","alias":"ShipDate","type":"TIMESTAMP","biType":"DIMENSION","role":"DIMENSION","seq":14,"format":"yyyy. MM. dd.","mappedField":[]},{"name":"ShipMode","alias":"ShipMode","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":15,"mappedField":[]},{"name":"State","alias":"State","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":16,"mappedField":[]},{"name":"Sub-Category","alias":"Sub-Category","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":17,"mappedField":[]},{"name":"DaystoShipActual","alias":"DaystoShipActual","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":18,"mappedField":[]},{"name":"SalesForecast","alias":"SalesForecast","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":19,"mappedField":[]},{"name":"ShipStatus","alias":"ShipStatus","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":20,"mappedField":[]},{"name":"DaystoShipScheduled","alias":"DaystoShipScheduled","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":21,"mappedField":[]},{"name":"OrderProfitable","alias":"OrderProfitable","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":22,"mappedField":[]},{"name":"SalesperCustomer","alias":"SalesperCustomer","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":23,"mappedField":[]},{"name":"ProfitRatio","alias":"ProfitRatio","type":"DOUBLE","biType":"MEASURE","role":"MEASURE","seq":24,"mappedField":[]},{"name":"SalesaboveTarget","alias":"SalesaboveTarget","type":"TEXT","biType":"DIMENSION","role":"DIMENSION","seq":25,"mappedField":[]},{"name":"latitude","alias":"latitude","type":"LNT","biType":"DIMENSION","role":"DIMENSION","seq":26,"mappedField":[]},{"name":"longitude","alias":"longitude","type":"LNG","biType":"DIMENSION","role":"DIMENSION","seq":27,"mappedField":[]}],"summary":{"ingestionMinTime":"2011-01-01T00:00:00.000Z","ingestionMaxTime":"2015-01-01T00:00:00.000Z","size":3061790,"count":9993},"alias":"sales","dataSourceType":"MASTER","implementor":""}],"widgets":[{"isLoading":false,"type":"filter","configuration":{"layout":{"x":0,"y":0,"cols":2,"rows":2},"filter":{"type":"include","field":"Category","valueList":[]}},"id":"IL7cqV7l5v"},{"isLoading":false,"type":"text","configuration":{"layout":{"x":2,"y":0,"cols":2,"rows":2}},"id":"tFkjQ21hFK","contents":"<h1><strong class=\\"ql-font-monospace\\" style=\\"color: rgb(255, 255, 255); background-color: rgb(255, 153, 0);\\">Metatron!<br/>메타트론</strong></h1>"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":4,"y":0,"cols":6,"rows":3},"chart":{"type":"line"}},"mode":"chart","id":"BIZ2r2DA4P","name":"페이지 위젯 (더미선반정보) - line"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":0,"y":2,"cols":4,"rows":4},"chart":{"type":"bar"}},"mode":"chart","id":"69xX3Bfis4","name":"페이지 위젯 (더미선반정보) - bar"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":4,"y":3,"cols":3,"rows":3},"chart":{"type":"heatmap"}},"mode":"chart","id":"56ZXrO8gWP","name":"페이지 위젯 (더미선반정보) - heatmap"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":7,"y":3,"cols":3,"rows":3},"chart":{"type":"scatter"}},"mode":"chart","id":"FZiTJHaqJH","name":"페이지 위젯 (더미선반정보) - scatter"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":0,"y":5,"cols":5,"rows":3},"chart":{"type":"grid"}},"mode":"chart","id":"1K6b3CnUHt"},{"isLoading":false,"type":"page","configuration":{"layout":{"x":5,"y":5,"cols":5,"rows":3},"chart":{"type":"control"}},"mode":"chart","id":"o4MQCuHBtR","name":"페이지 위젯 (더미선반정보) - control"}],"configuration":{"dataSource":{"joins":[],"name":"sales","type":"default"},"pivot":{"columns":[{"type":"dimension","name":"Sub-Category","alias":"Sub-Category"}],"rows":[],"aggregations":[{"type":"measure","aggregationType":"SUM","name":"Sales","alias":"Sales"},{"type":"measure","aggregationType":"SUM","name":"Discount","alias":"Discount"}]}},"_links":{"self":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305"},"dashboard":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305{?projection}","templated":true},"workBook":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/workbook"},"dataSources":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/datasources"},"widgets":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/widgets"}},"workBook":{"name":"ㄹㄹ","id":"e55c7c3c-0bb3-465d-9c03-317cb21527d2","type":"workbook","dataSource":[{"name":"sales","id":"ds-37","description":"sales data (2011~2014)","engineName":"sales","_links":{"self":{"href":"http://localhost:8180/api/datasources/ds-37{?projection}","templated":true},"connection":{"href":"http://localhost:8180/api/datasources/ds-37/connection"},"workspaces":{"href":"http://localhost:8180/api/datasources/ds-37/workspaces"},"dashBoards":{"href":"http://localhost:8180/api/datasources/ds-37/dashboards"}}}],"modifiedBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"modifiedTime":"2017-08-21T08:21:19.000Z","workspaceId":"ws-00","createdBy":{"type":"user","username":"admin","fullName":"Administrator","email":"admin@metatron.com"},"createdTime":"2017-08-21T08:21:11.000Z","dashBoards":[{"name":"Dashboard Test","id":"bb2c35dd-a203-4b0e-9a8c-3729ccf7d305","seq":0,"_links":{"self":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305{?projection}","templated":true},"workBook":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/workbook"},"dataSources":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/datasources"},"widgets":{"href":"http://localhost:8180/api/dashboards/bb2c35dd-a203-4b0e-9a8c-3729ccf7d305/widgets"}}}],"folderId":"ROOT","countOfComments":0,"_links":{"self":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2"},"workbook":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2{?projection}","templated":true},"workspace":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2/workspace"},"dashBoards":{"href":"http://localhost:8180/api/workbooks/e55c7c3c-0bb3-465d-9c03-317cb21527d2/dashboards"}}}}`);

        this.setWidget = pageWidget;
      }

    });

    this.subscriptions.push(paramSubs, changeChartSubs);

    // Setting dragular
    this.settingDragAndDrop();

    setTimeout(() => {
      // 선택된 데이터 패널의 내부 스크롤 설정
      this.dataPanelInnerScroll();
    }, 700); // css의 duration이 0.5s로 되어 있으므로 600 이하로 설정하면 안됨
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();

    this.dragulaService.destroy('dragbag');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Multi DataSource
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * BBox 필터를 위한 기본 영역 설정
   * @param dataSource
   * @private
   */
  private _setDefaultAreaForBBox(dataSource: Datasource) {
    if ((isNullOrUndefined(this.widgetConfiguration.chart['lowerCorner']) || !this.isChartShow) && dataSource.summary) {
      this.widgetConfiguration.chart['lowerCorner'] = dataSource.summary['geoLowerCorner'];
      this.widgetConfiguration.chart['upperCorner'] = dataSource.summary['geoUpperCorner'];
    }
  } // function - _setDefaultAreaForBBox

  /**
   * 현재 레이어에 데이터 소스를 설정한다.
   * @param dataSource
   * @private
   */
  private _setDataSourceCurrentLayer(dataSource: Datasource) {
    if (this.widgetConfiguration.shelf) {
      const currentLayer: ShelfLayers = this.widgetConfiguration.shelf.layers[(<UIMapOption>this.uiOption).layerNum];
      if (0 === currentLayer.fields.length) {
        currentLayer.ref = dataSource.engineName;
      }
    }
  } // function - _setDataSourceCurrentLayer

  /**
   * 데이터소스 선택 및 차트 초기화
   * @param {Datasource} dataSource
   * @param {boolean} isBBoxChange
   */
  public selectDataSource(dataSource: Datasource, isBBoxChange: boolean) {

    (this.widget) || (this.widget = _.cloneDeep(this.originalWidget));

    if (ChartType.MAP === this.widget.configuration.chart.type) {
      // this.boardFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, this.widget.configuration.dataSource.engineName);
      this.boardFilters = this.widget.dashBoard.configuration.filters;
      this.dataSource = dataSource;

      (isBBoxChange) && (this._setDefaultAreaForBBox(dataSource));

      // 데이터 필드 설정 (data panel의 pivot 설정)
      this.setDatasourceFields(true);

      // 차트 데이터소스 설정
      this.widget.configuration.dataSource = this.widget.dashBoard.configuration.dataSource;

      // Shelf 내 타겟 데이터소스 설정
      this._setDataSourceCurrentLayer(dataSource);

      // find geo type from dimension list
      this.geoType = this.getMapGeoType();
    } else {
      this.isChartShow = false;
      this.dataSource = dataSource;
      let widgetName: string = null;
      if (this.widget && this.widget.name) {
        widgetName = this.widget.name;
      }
      this.widget = _.cloneDeep(this.originalWidget);
      this.widget.name = !widgetName ? this.originalWidget.name : widgetName;
      const widgetDataSource: Datasource
        = DashboardUtil.getDataSourceFromBoardDataSource(this.widget.dashBoard, this.widget.configuration.dataSource);

      if (widgetDataSource.id !== dataSource.id) {
        this.widget.configuration = new PageWidgetConfiguration();
        this.widget.configuration.dataSource = DashboardUtil.getBoardDataSourceFromDataSource(this.widget.dashBoard, dataSource);
        this.widget.configuration.filters = [];
        this.widget.configuration.customFields = [];
      }

      if (ConnectionType.LINK === this.dataSource.connType) {
        this.boardFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, this.dataSource.engineName);
      } else {
        this.boardFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, this.widget.configuration.dataSource.engineName);
      }

      if (StringUtil.isEmpty(this.widget.name)) {
        this.widget.name = 'New Chart';
      }
      this.uiOption = this.widgetConfiguration.chart;
      this.originalWidgetConfiguration = _.cloneDeep(this.widgetConfiguration);

      // 데이터 필드 설정 (data panel의 pivot 설정)
      this.setDatasourceFields(true);

      if (this.pagePivot) this.pagePivot.removeAnimation();
    }
  } // function - selectDataSource

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public boardUtil = DashboardUtil;

  /**
   * 차트 이미지 업로드
   * @param {string} widgetId
   * @returns {Promise<any>}
   */
  public uploadChartImage(widgetId: string): Promise<any> {

    return new Promise<any>((resolve, reject) => {

      // chart element 설정
      const chart = this.$element.find('.ddp-ui-chart-area');

      // chart가 undefined인 경우
      if (0 === chart.length) {
        reject('not found chart');
      }
      chart.css('background-color', '#FFF');

      this.imageService.getBlob(chart).then((blob) => {
        this.imageService.uploadImage(this.widget.name, blob, widgetId, 'page', 250).then((response) => {
          resolve(response);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  } // funciton - uploadChartImage

  /**
   * 저장
   */
  public save() {

    // 차트가 없거나 차트가 그려지지 않은경우 return
    if (!this.chart || !this.isChartShow) {

      return;
    }

    this.loadingShow();

    if (this.isNewWidget()) {
      // 위젯 생성
      // 위젯 도메인상 네임이 필수값이라 없을 경우 처리
      if (StringUtil.isEmpty(this.widget.name)) {
        this.widget.name = 'New Chart';
      }

      let param;

      // map - set shelf layers
      if (_.eq(this.selectChart, ChartType.MAP)) {

        param = _.extend({}, this.widget, {shelf: this.shelf});

      } else {
        param = _.extend({}, this.widget, {pivot: this.pivot});
      }

      // 서버에 저장될필요 없는 파라미터 제거
      param.configuration = DashboardUtil.convertPageWidgetSpecToServer(param.configuration);

      const pageConf: PageWidgetConfiguration = param.configuration as PageWidgetConfiguration;
      // 미니맵 범위 저장
      if (!_.isEmpty(this.chart.saveDataZoomRange())) pageConf.chart.chartZooms = this.chart.saveDataZoomRange();

      // 버전기록
      pageConf.chart.version = 2;

      this.widgetService.createWidget(param, this.widget.dashBoard.id)
        .then((widget) => {

          const pageWidget: PageWidget = _.extend(new PageWidget(), widget);
          pageWidget.dashBoard = this.widget.dashBoard;

          // 차트 필터 위젯 아이디 등록 처리
          pageWidget.configuration.filters.forEach(filter => {
            (filter.ui) || (filter.ui = {});
            filter.ui.widgetId = pageWidget.id;
          });

          // 이미지 업로드
          this.uploadChartImage(pageWidget.id)
            .then((res) => {
              // 이미지 및 차트 필터 정보 변경
              const configuration = {configuration: pageWidget.configuration, imageUrl: res['imageUrl']};
              this.widgetService
                .updateWidget(pageWidget.id, configuration)
                .then(() => {
                  this.popupService.notiPopup({
                    name: 'create-page-complete',
                    data: pageWidget
                  });
                });

            })
            .catch((err) => {
              console.log('image upload error', err);
              this.popupService.notiPopup({
                name: 'create-page-complete',
                data: pageWidget
              });
            });

        })
        .catch((err) => {
          this.loadingHide();
          console.info(err);
        });


    } else {
      // 위젯 수정
      const param = {
        configuration: this.widgetConfiguration,
        name: this.widget.name
      };

      // 서버에 저장될필요 없는 파라미터 제거
      param.configuration = DashboardUtil.convertPageWidgetSpecToServer(param.configuration);

      const pageConf: PageWidgetConfiguration = param.configuration as PageWidgetConfiguration;
      // 미니맵 범위 저장
      // TODO 차트가 그려질때마다 저장되다면 이부분은 삭제예정
      if (!_.isEmpty(this.chart.saveDataZoomRange())) pageConf.chart.chartZooms = this.chart.saveDataZoomRange();
      // delete pageConf.layout.widget; // 순환 에러 처리

      // 버전기록
      pageConf.chart.version = 2;

      this.widgetService.updateWidget(this.widget.id, param)
        .then((widget) => {

          // 대시보드 옵션 업데이트
          this.dashboardService.updateDashboard(
            this.widget.dashBoard.id, {configuration: this.widget.dashBoard.configuration}
          ).then(() => {
            const pageWidget: PageWidget = _.extend(new PageWidget(), widget);
            pageWidget.dashBoard = this.widget.dashBoard;

            // 차트 필터 위젯 아이디 등록 처리
            pageWidget.configuration.filters.forEach(filter => {
              (filter.ui) || (filter.ui = {});
              filter.ui.widgetId = pageWidget.id;
            });

            // Update Image
            this.uploadChartImage(pageWidget.id)
              .then((res) => {
                const imageUrl = res['imageUrl'];
                this.widgetService
                  .updateWidget(pageWidget.id, {imageUrl})
                  .then(() => {
                    this.popupService.notiPopup({
                      name: 'modify-page-complete',
                      data: pageWidget
                    });
                  });

              })
              .catch((err) => {
                console.log('image upload error', err);
                this.popupService.notiPopup({
                  name: 'modify-page-complete',
                  data: pageWidget
                });
              });
          }).catch((err) => {
            this.loadingHide();
            console.info(err);
          });

        })
        .catch((err) => {
          this.loadingHide();
          console.info(err);
        });
    }
  }

  public close() {
    super.close();

    // close 시 에도 사용자 정의필드는 업데이트가 되어야함

    // Set CustomFields
    if (this.widget.dashBoard.configuration.hasOwnProperty('customFields')) {
      this.originalWidget.dashBoard.configuration['customFields'] = this.widget.dashBoard.configuration['customFields'];
    } else {
      this.originalWidget.dashBoard.configuration['customFields'] = [];
    }

    this.popupService.notiPopup({
      name: 'modify-page-close',
      data: {
        widget: this.originalWidget,
        isNew: this.isNewWidget()
      }
    });
  }

  /**
   * 테이블 데이터 다운로드 핸들러
   */
  public onTableDataDownload(): void {

    this.widgetService.downloadWidget(this.widget.id, true, 1000000)
      .subscribe(result => {

        // 파일 저장
        saveAs(result, 'TableData.csv');
      });
  }

  /**
   * 차트 데이터 다운로드 핸들러
   */
  public onChartDataDownload(): void {

    this.widgetService.downloadWidget(this.widget.id, false, 1000000)
      .subscribe(result => {

        // 파일 저장
        saveAs(result, 'ChartData.csv');
      });
  }

  /**
   *  커스텀 컬럼 필드 오픈
   * @param customField?
   */
  public openCustomFieldPopup(customField?: ExpressionField, columnType?: string) {

    // dimension / measure / parameter 구분값
    this.columnType = columnType;

    if (customField) {
      this.selectedCustomField = customField;
    } else {
      this.selectedCustomField = null;
    }

    this.isShowCustomFiled = true;
  }

  /**
   * 컬럼 디테일 팝업 호출
   * @param field
   */
  public onColumnDetailPopup(field: Field): void {
    this.selectedField = field;
    this.isColumnDetail = true;
    this.isShowDataDetail = true;
  }

  /**
   * 데이터 디테일 팝업 호출
   */
  public onDataPreviewPopup(): void {
    this.selectedField = null;
    this.isColumnDetail = false;
    this.isShowDataDetail = true;
  } // function - onDataPreviewPopup

  /**
   * map chart - toggle map layer
   * @param {string} rnbMenu
   * @param {number} layerNum
   */
  public toggleMapLayer(rnbMenu: string, layerNum: number) {

    // set disable for shelf, option panel
    this.setDisableShelf(layerNum);

    // toggle rnb menu
    this.toggleRnb(rnbMenu);
  }

  /**
   * rnb 토글시
   * @param rnbMenu
   */
  public toggleRnb(rnbMenu: string) {

    // filter를 제외한 차트가 그려지지 않은상태이면 return
    if (!this.isChartShow && 'filter' !== rnbMenu) {
      return;
    }

    // rnbMenu가 같은경우
    if (this.rnbMenu === rnbMenu) {

      // 해당 메뉴 hide
      this.rnbMenu = '';

      // rnbMenu가 다른경우 설정
    } else {

      // rnbMenu에 설정
      this.rnbMenu = rnbMenu;
    }

    // rnbMenu show hide 설정반영
    this.changeDetect.detectChanges();

    // set shelve animation
    if (this.getPivotComp()) this.getPivotComp().onShelveAnimation(this.$element.find('.ddp-wrap-default'));

    // 차트 리사이즈
    if (this.selectChart == 'map' || this.rnbMenu == '') this.chartResize();
  }

  public isShowChartInfo(chartType: string) {
    return (this.selectChart === chartType && this.showInfoChart === '') || this.showInfoChart === chartType;
  }

  /**
   * 마우스 select 모드 변경 변경
   *
   * @param event
   */
  public changeMouseSelectMode(event) {
    // 선택한 마우스 모드
    const mode = $(event.currentTarget).data('mode');
    // 멀티 선택 모드시 브러쉬 모드
    const brushType = $(event.currentTarget).data('type');
    // 툴버튼 그룹
    const selectGroup = $('div[data-type="select-gruop"]');
    // 선택 마우스 모드 클래스
    const selectedTool = $(event.currentTarget).children().first();
    // 현재 마우스 모드 버튼
    const currentButton = selectGroup.find('.ddp-btn-tool').first();
    // 현재 마우스 모드 클래스
    const currentTool = currentButton.children().first();
    // 현재 마우스 모드 버튼의 클래스 및 데이터 변경
    currentButton.data('mode', mode);
    currentButton.data('type', brushType);
    currentTool.attr('class', selectedTool[0].className);
    // 마우스 모드 변경 적용
    this.chart.convertMouseMode(mode, brushType);
  }

  /**
   * 사용가능한 마우드 모드 체크
   *
   * @param {string} type
   * @param {ChartType} chartType
   * @returns {boolean}
   */
  public possibleMouseModeCheck(type: string, chartType: ChartType) {
    return _.indexOf(possibleMouseModeObj[type], chartType) > -1;
  }

  /**
   * 마우스 zoomMode 모드 변경 변경
   *
   * @param event
   */
  public changeMouseZoomMode(mode) {
    // 마우스 모드 변경 적용
    this.chart.convertMouseMode(mode);
  }

  /**
   * 범례 표시여부 변경
   *
   * @param {boolean} show
   */
  public showLegend(show: boolean): void {
    const legend = _.cloneDeep(this.uiOption.legend);
    legend.auto = show;
    legend.convertType = LegendConvertType.SHOW;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {legend});
  }

  /**
   * 미니맵 표시 여부 변경
   *
   * @param show
   */
  public showDataZoom(show: boolean): void {
    const chartZooms = _.cloneDeep(this.uiOption.chartZooms);
    chartZooms.forEach((zoom) => {
      zoom.auto = show;
    });

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {chartZooms});
  }

  /**
   * 이름 변경 완료후
   */
  public onNameChange(): void {

    // Edit 상태 종료
    this.isPageNameEdit = false;

    // Validation
    if (StringUtil.isEmpty(this.editingPageName.trim())) {

      Alert.info(this.translateService.instant('msg.page.alert.insert.chart.name'));
      return;
    }

    // Set
    this.widget.name = this.editingPageName.trim();
    console.info(this.widget.name);
  }

  /**
   * 페이지명 에디터 모드로 변경
   * @param $event
   */
  public onNameEdit($event: Event): void {

    $event.stopPropagation();
    this.isPageNameEdit = !this.isPageNameEdit;
    this.editingPageName = this.widget.name;
    this.changeDetect.detectChanges();
  }

  /**
   * 페이지명 에디터 모드 해제
   */
  public onNameEditCancel(): void {

    // 에디트 모드가 아니라면 중지
    if (!this.isPageNameEdit) {
      return;
    }

    // 이름 원복
    this.editingPageName = this.widget.name;

    // 에디트 모드 변경
    this.isPageNameEdit = !this.isPageNameEdit;
  }

  /**
   * 선반에서 필드에 포맷을 추가했을때 핸들러
   * @param field
   */
  public onChangePivotFormat(field: AbstractField): void {

    // Map chart
    if (_.eq(this.selectChart, ChartType.MAP)) {

      // RNB 토글
      if (!this.mapFormatOption) {
        this.toggleRnb('mapFormat');
      }

      // 필드 추가
      if (field != null && this.mapFormatOption) {
        this.mapFormatOption.setFormatType(field);
      } else if (field && !this.mapFormatOption) {
        Alert.warning(this.translateService.instant('msg.page.alert.apply.after.chart'));
      }
    }
    // Other
    else {

      // RNB 토글
      if (!this.formatOption) {
        this.toggleRnb('format');
      }

      // 필드 추가
      if (field != null && this.formatOption) {
        this.formatOption.setFormatType(field);
      } else if (field && !this.formatOption) {
        Alert.warning(this.translateService.instant('msg.page.alert.apply.after.chart'));
      }
    }
  }

  /**
   * 개별포맷 변경 핸들러
   * @param pivot
   */
  public onFormatEachChange(pivot: any): void {

    if (_.eq(this.selectChart, ChartType.MAP)) {

      this.shelf = pivot;
    } else {
      // 포맷변경
      this.pivot = pivot;
    }
    delete this.widgetConfiguration.format;
  }

  /**
   * map chart - change each format handler
   * @param shelf
   */
  public onShelfFormatEachChange(shelf: Shelf): void {

    // 포맷변경
    this.shelf = shelf;
    delete this.widgetConfiguration.format;
  }

  /**
   * 공통포맷 변경 핸들러
   * @param pivot
   */
  public onFormatCommonChange(format: Format): void {

    // 포맷변경
    this.widgetConfiguration.format = format;
  }

  /**
   * custom 필드 삭제시
   */
  public deleteCustomField(field: Field) {

    const useChartList: string[] = [];
    const useFilterList: string[] = [];

    // 차트필터 리스트
    let chartFilters: Filter[] = [];

    const widgets = this.widget.dashBoard.widgets;
    // 차트에서 사용중인지 체크
    if (widgets && widgets.length > 0) {

      let customFields: CustomField[];
      if (this.widget.dashBoard.configuration.hasOwnProperty('customFields')) {
        customFields = this.widget.dashBoard.configuration.customFields;
      } else {
        customFields = [];
      }

      // 위젯의 차트, 필터 체크
      widgets.forEach((widget: PageWidget) => {

        // 현재 위젯을 제외한 다른 위젯의 필터리스터
        if (this.widget.id !== widget.id) {
          //  위젯의 컬럼에서 사용중인지 체크
          if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('columns')) {
            const idx = _.findIndex(widget.configuration['pivot']['columns'], {name: field.name});
            if (idx > -1) useChartList.push(widget.name);
          }
          // 위젯의 aggregations에서 사용중인지 체크
          if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('aggregations')) {
            const idx = _.findIndex(widget.configuration['pivot']['aggregations'], {name: field.name});
            if (idx > -1) useChartList.push(widget.name);
          }
          // 위젯의 aggregations에서 사용중인지 체크
          if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('rows')) {
            const idx = _.findIndex(widget.configuration['pivot']['rows'], {name: field.name});
            if (idx > -1) useChartList.push(widget.name);
          }
          // 필터에서 사용중인지 체크
          if (widget.configuration.hasOwnProperty('filters') && widget.configuration.filters.length > 0) {
            widget.configuration.filters.forEach((filter: Filter) => {
              filter.ui.widgetId = widget.id;
              chartFilters.push(filter);
            });
          }
        }
      });
    }

    // 현재 위젯 필터 추가
    if (this.widget.configuration.filters) {
      chartFilters = chartFilters.concat(this.widget.configuration.filters);
    }

    //  현재 위젯의 컬럼에서 사용중인지 체크
    if (this.widget.configuration && this.widget.configuration.hasOwnProperty('pivot') && this.widget.configuration['pivot'].hasOwnProperty('columns')) {
      const idx = _.findIndex(this.widget.configuration['pivot']['columns'], {name: field.name});
      if (idx > -1) useChartList.push(this.widget.name);
    }
    // 현재 위젯의 aggregations에서 사용중인지 체크
    if (this.widget.configuration && this.widget.configuration.hasOwnProperty('pivot') && this.widget.configuration['pivot'].hasOwnProperty('aggregations')) {
      const idx = _.findIndex(this.widget.configuration['pivot']['aggregations'], {name: field.name});
      if (idx > -1) useChartList.push(this.widget.name);
    }

    // 현재 위젯의 aggregations에서 사용중인지 체크
    if (this.widget.configuration && this.widget.configuration.hasOwnProperty('pivot') && this.widget.configuration['pivot'].hasOwnProperty('rows')) {
      const idx = _.findIndex(this.widget.configuration['pivot']['rows'], {name: field.name});
      if (idx > -1) useChartList.push(this.widget.name);
    }

    // 차트필터에서 사용중인지 체크
    let idx = _.findIndex(chartFilters, {field: field.name});
    if (idx > -1) useFilterList.push(chartFilters[idx].type + '_' + chartFilters[idx].field);

    // 글로벌필터에서 사용중인지 체크
    const globalFilters = this.widget.dashBoard.configuration.filters;
    idx = _.findIndex(globalFilters, {field: field.name});
    if (idx > -1) useFilterList.push(globalFilters[idx].type + '_' + globalFilters[idx].field);


    // 사용중인 곳이 있으면 알림 팝업
    if (useFilterList.length > 0 || useChartList.length > 0) {
      let description: string = '';
      if (useFilterList.length > 0 && useChartList.length > 0) {
        description = '\'' + useChartList.join('\' , \'') + '\',\'' + useFilterList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.chart.filter');
      } else if (useChartList.length > 0) {
        description = '\'' + useChartList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.chart');
      } else if (useFilterList.length > 0) {
        description = '\'' + useFilterList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.filter');
      }

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.board.ui.not.delete.custom');
      modal.description = description;
      modal.isShowCancel = false;
      modal.data = {
        type: 'deleteCustomField'

      };
      this.confirmModalComponent.init(modal);
      return;
    }

    // 사용중인 곳이 없다면 바로 삭제
    if (this.widget.dashBoard.configuration && !this.widget.dashBoard.configuration.customFields) this.widget.dashBoard.configuration.customFields = [];
    const customFields = this.widget.dashBoard.configuration.customFields;

    idx = _.findIndex(customFields, {name: field.name});

    if (idx > -1) {
      customFields.splice(idx, 1);

      this.widget.dashBoard.configuration.customFields = customFields;
      (<PageWidgetConfiguration>this.widget.configuration).customFields = customFields;

      // 필드 리스트 갱신
      this.setDatasourceFields();
    }
  } // function - deleteCustomField

  // -------------------------------------------------
  // 고급분석 - 예측선 관련
  // -------------------------------------------------

  /**
   * Forecast 값이 변경 되는 경우
   *  - forecast 값이 바뀌는 경우 차트를 다시 그리지 않고 옵션만 변경
   */
  public changeForecast(): void {
    this.lineChartComponent.analysis = _.cloneDeep(this.widgetConfiguration.analysis);
    this.lineChartComponent.changeForecast();
  }

  /**
   * Confidence 값이 변경 되는 경우
   *  - confidence 값이 바뀌는 경우 차트를 다시 그리지 않고 옵션만 변경
   */
  public changeConfidence(): void {
    this.lineChartComponent.analysis = _.cloneDeep(this.widgetConfiguration.analysis);
    this.lineChartComponent.changeConfidence();
  }

  /**
   * 고급분석 컴포넌트에서 데이터가 변경되었다는 알림을 받으면 호출되는 함수
   */
  public changeAnalysisPredictionLine(): void {

    // 고급분석 - 예측선 데이터 변경시 - 예측선 사용하지 않는 경우
    if (this.isAnalysisPredictionEnabled() === false) {
      this.drawChart();
    }

    // 고급분석 - 예측선 데이터 변경시 - 예측선 사용하는 경우
    else {
      this.loadingShow();

      this.analysisPredictionService
        .changeAnalysisPredictionLine(this.widgetConfiguration, this.widget, this.lineChartComponent, null)
        .then((result) => {
          this.widgetConfiguration.analysis.forecast.parameters.forEach((parameter) => {
            const resultHyperParameter: HyperParameter = result.info.analysis[`${parameter.field}.params`];
            parameter.alpha = resultHyperParameter[0];
            parameter.beta = resultHyperParameter[1];
            parameter.gamma = resultHyperParameter[2];
          });
        })
        .catch((error) => {
          this.isError = true;
          this.loadingHide();
          this.commonExceptionHandler(error);
          console.info('error', error);
        });
    }
  }

  /**
   * 라인차트 생성 완료 이벤트
   *  - (drawFinished)="lineChartDrawComplete($event);"
   */
  public lineChartDrawComplete(): void {
    // 고급분석 컴포넌트에 라인차트가 생성되었음을 알려주면
    // 내부에서 고급분석 데이터 싱크를 맞춘다
    this.analysisComponent.drawComplete(this.uiOption, {pivot: this.pivot});
  }

  /**
   * 차트 옵션 패널에서 전달된 drawChart시 사용되는 파라미터 설정
   * @param drawChartParam
   */
  public onSetDrawChartParam(drawChartParam) {
    this.drawChart({
      resultFormatOptions: drawChartParam.resultFormatOptions,
      type: drawChartParam.type
    });
  }

  /**
   * 차트를 그리기전 옵션패널의 툴팁
   * @param event
   */
  public drawChartTooltip(event): void {

    // 차트가 그려지지 않은경우 설정
    if (!this.isChartShow) {
      const offsetTop = event.target.offsetTop;
      $(event.target).find('.ddp-ui-tooltip-info').css('top', offsetTop + 106);
    }

    // // 공간연산 tooltip이 제대로 적용이 되지 않을 경우
    if (this.uiOption['analysis'] != null && this.uiOption['analysis']['use'] == true) {
      $('.ddp-wrap-chart-menu a').mouseover(function () {
        let $tooltipTop = $(this).offset().top;
        $(this).find('.ddp-ui-tooltip-info').css('top', $tooltipTop + 15)
      });
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커스텀 컬럼 필드 업데이트
   * @param {any} data
   */
  protected updateCustomFields(data: { customField: any, isEdit: boolean }) {

    const customField: any = data.customField;
    const isEdit: boolean = data.isEdit;

    // 커스텀 컬럼이
    if (this.widget.dashBoard.configuration && !this.widget.dashBoard.configuration.customFields) this.widget.dashBoard.configuration.customFields = [];
    const customFields = this.widget.dashBoard.configuration.customFields;

    if (!isEdit) {
      // 수정이 아닐 경우 insert
      customFields.push(customField);
    } else {
      // 필드 수정
      customFields.forEach((field) => {
        if (field.name === customField.oriColumnName) {
          field.alias = customField.alias;
          field.name = customField.name;
          field.expr = customField.expr;
          field.aggregated = customField.aggregated;
          // 다른 차트에서 사용하는 커스텀 필드에 대한 내용을 바꿔주기 위해 이전 값을 저장함
          field.oriColumnName = customField.oriColumnName;
        }
      });
      // 차트 필터 변경
      this.widget.configuration.filters.some((filter: Filter) => {
        if (filter.field === customField.oriColumnName) {
          filter.field = customField.name;
          return true;
        }
      });
      // 글로벌 필터 변경
      this.widget.dashBoard.configuration.filters.some((filter: Filter) => {
        if (filter.field === customField.oriColumnName) {
          filter.field = customField.name;
          return true;
        }
      });
    }

    // 대시보드에서 오픈한 경우만 업데이트
    if (this.isDashboard) {

      if (isEdit) {
        Alert.success(this.translateService.instant('msg.board.custom.ui.update', {name: customField.name}));
      } else {
        this.setDatasourceFields();
        Alert.success(this.translateService.instant('msg.board.custom.ui.create', {name: customField.name}));
      }

      // 차트 정보로 갱신
      (<PageWidgetConfiguration>this.widget.configuration).customFields = this.widget.dashBoard.configuration.customFields;

      // customField값과 같은 값을 pivot에 설정된값
      let currentField;

      // 현재 선반에 올라간 필드라면
      if (customField.pivot && customField.pivot['length'] > 0) {

        // 해당 선반 데이터 설정
        const setPivot = ((pivot) => {

          for (let index = pivot.length; index--;) {

            const item = pivot[index];

            if (item.name === customField.oriColumnName) {
              item.name = customField.name;
              item['aggregated'] = customField.aggregated;
              item['expr'] = customField.expr;
              item['alias'] = customField.alias;
              item['biType'] = customField.biType;

              // aggregated가 true인 경우 aggregation Type 제거
              if (customField.aggregated) {

                const duplicateList = pivot.filter((data) => {
                  return customField.oriColumnName == data.name
                });

                // 중복리스트가 있는경우
                if (duplicateList.length > 1) {

                  // 선반에서 제거
                  pivot.splice(index, 1);

                  // data 패널에서 해제
                  item.field.pivot.splice(item.field.pivot.indexOf(item.currentPivot), 1);
                }
                delete item['aggregationType'];

              }
              // 현재 필드값 pivot 리스트에서 찾기
              currentField = item;
            }
          }
        });

        // pivot 갱신
        setPivot(this.pivot.aggregations);
        setPivot(this.pivot.columns);
        setPivot(this.pivot.rows);

        // dashboard 단의 pivot도 전체변경
        // this.widget.configuration['pivot'] = this.pivot;

        // pivot 값에 따라서 currentTarget값 지정
        const currentTarget = currentField['currentPivot'] === FieldPivot.AGGREGATIONS ? 'aggregation' : currentField['currentPivot'] === FieldPivot.ROWS ? 'row' : 'column';
        this.getPivotComp().convertField(customField, currentTarget, false);
      }
      this.isShowCustomFiled = false;

    } else {
      this.widget.configuration['customFields'] = this.widget.dashBoard.configuration.customFields;
      this.setDatasourceFields();
      this.isShowCustomFiled = false;
    }
  } // function - updateCustomFields

  /**
   * LNB > DATA > 필드 상세정보 ContextMenu
   * @param event
   * @param field
   */
  protected openFieldDetailLayer(event, field) {

    // 이벤트 버블링 막기
    event.stopPropagation();

    // 현재 선택된 필드 설정
    this.fieldDetailLayer = field;

    // 해당 context menu init, context menu show hide에 따른 field icon show hide 설정하기
    this.showFieldIconsFl = this.dataContext.init(field, this.widget.dashBoard.configuration.dataSource, $(event.currentTarget));
  }

  /**
   * LNB > Data > 검색어 처리
   * @param {string} sText
   * @param {string} targetText
   * @returns {boolean}
   */
  protected isContainSearchText(sText: string, targetText: string) {
    // ngIf로 하면 dragular값이 초기화 되기 때문에 display none으로 처리
    if (StringUtil.isEmpty(sText)) return true;
    return targetText.toLowerCase().includes(sText.toLowerCase());
  }

  /**
   * 차트 싱크화
   * @param uiOption
   */
  protected updateUIOption(uiOption) {
    console.info('updateUIOption~');
    this.uiOption = _.extend({}, this.uiOption, uiOption);
  }

  /**
   * 차트 선택, 비선택
   * @param {ChartSelectInfo} data
   */
  protected chartSelectInfo(data: ChartSelectInfo) {
    // console.info(data.mode, data.data);

    // this.chartSelectInfoEvent.emit(data);
  }

  /**
   * map chart - change shelf
   * @param {Object} data
   */
  protected onChangeShelf(data: Object) {

    const shelf = data['shelf'];
    const eventType = data['eventType'];
    this.shelf = shelf;

    // 맵 layer 열려있을때 처리
    if (this.mapLayerOption) {
      this.mapLayerOption.setShelf = shelf;
    }

    // 맵 포맷창이 열려있을때 처리
    if (this.mapFormatOption) {
      this.mapFormatOption.setShelf = shelf;
    }

    // when map tooltip option is opened
    if (this.mapTooltipOption) {
      this.mapTooltipOption.setShelf = shelf;
    }

    // TODO sort

    // 추천가능차트 설정
    this.recommendChart();

    // 데이터 필드 설정 (data panel의 pivot 설정)
    this.setDatasourceFields(true);

    // 공간연산 data 전달
    if (this.selectChart === 'map') {
      this.analysisComponent.mapSpatialChanges(this.uiOption, this.shelf);
    }

    // 선반변경시 drawChart
    this.drawChart({type: eventType});
  }

  protected onChangePivot(data: Object) {

    // 피봇 데이터
    const pivot = data['pivot'];
    // 이벤트 타입
    const eventType = data['eventType'];
    this.pivot = pivot;

    // 선반에 따라서 중첩 / 병렬 변경
    this.uiOption = this.setUIOptionByPivot();

    // 포맷창이 열려있을때 처리
    if (this.formatOption) {
      this.formatOption.setPivot = pivot;
    }

    // Common창이 열려있을때 처리
    if (this.commonOption) {
      this.commonOption.setPivot = pivot;
    }

    // dataLabel창이 열려있을때 처리
    if (this.dataLabelOption) {
      this.dataLabelOption.setPivot = pivot;
    }

    // Common창이 열려있을때 처리
    if (this.secondaryIndicatorOption) {
      this.secondaryIndicatorOption.setPivot = pivot;
    }

    // Common창이 열려있을때 처리
    if (this.secondaryIndicatorOption) {
      this.secondaryIndicatorOption.setPivot = pivot;
    }

    // sort 처리
    const sortFields: Sort[] = _.concat(pivot.columns, pivot.rows, pivot.aggregations)
      .filter((field: AbstractField) => {
        return (field.direction === DIRECTION.ASC || field.direction === DIRECTION.DESC);
      })
      .map((field: AbstractField) => {
        const sort: Sort = new Sort();

        sort.field = field.alias ? field.alias : field.name;
        if (field.type == 'measure' && field.aggregationType && (!field.alias || field.alias == field.name)) {
          const name: string = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : field['name'];
          sort.field = field.aggregationType + `(${name})`;
        }
        sort.direction = field.direction;
        sort.lastDirection = field.lastDirection;
        return sort;
      });

    if (this.chart instanceof GridChartComponent) {
      this.sorts = sortFields;
    } else {
      if (sortFields.length > 0) {

        // Sort 목록 (이전에 추가된 sort가 나중에 들어가도록 처리하기 위함)
        let sortList: Sort[] = [];

        // 원래 있던 필드들 추가
        if (this.sorts) {
          for (let beforeField of this.sorts) {
            let isUse: boolean = false;
            for (let afterField of sortFields) {
              if (afterField.field == beforeField.field && !afterField.lastDirection) {
                isUse = true;
                break;
              }
            }
            if (isUse) {
              sortList.push(beforeField);
            }
          }
        }

        // 마지막에 추가한 Sort를 제일앞에 추가한다.
        for (let afterField of sortFields) {
          if (afterField.lastDirection) {
            delete afterField.lastDirection;
            sortList.unshift(afterField);
            break;
          }
        }

        this.sorts = sortList;
        console.info(this.sorts);
        console.info('==========');
      } else {
        this.sorts = [];
      }
    }
    // 추천가능차트 설정
    this.recommendChart();
    // 선반변경시 drawChart 발생
    this.drawChart({type: eventType});
  }

  /**
   * 새로운 위젯인지 여부
   * @returns {boolean}
   */
  public isNewWidget() {
    return StringUtil.isEmpty(this.widget.id);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | FILTER Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 편집 팝업 오픈
   * @param {Filter} filter
   */
  public openUpdateFilterPopup(filter?: Filter) {
    this._configFilterComp.open(this.widget.dashBoard, this.widget.configuration.filters, filter, this.widget);
  } // function - openUpdateFilterPopup

  /**
   * 필터 편집 팝업 닫음
   */
  public closeFilterPopup() {
    this._configFilterComp.close();
  } // function - closeFilterPopup

  /**
   * 필터 업데이트
   * @param {Filter} filter
   * @param {boolean} isSetPanel
   */
  public updateFilter(filter: Filter, isSetPanel: boolean = false) {
    // if (!this.isDashboard) {
    //   return;
    // }

    if (filter.ui.widgetId) {
      this._setChartFilter(filter, isSetPanel);   // 차트 필터 설정
    }
    this.drawChart({type: EventType.FILTER}); // 차트 다시그리기
    this.closeFilterPopup();          // 필터 수정 팝업 닫기
  } // function - updateFilter

  /**
   * 필터 설정 ( 설정 팝업을 통해 )
   * @param {Filter} filter
   */
  public configureFilter(filter: Filter) {
    this.updateFilter(filter, true);
  } // function - configureFilter

  /**
   * 필터 삭제
   * @param {Filter} filter
   */
  public deleteFilter(filter: Filter) {
    // if (filter.ui.widgetId || !this.isDashboard) {
    if (filter.ui.widgetId) {
      // 차트필터 또는 워크벤치인경우 제거
      const idx = _.findIndex(this.widgetConfiguration.filters, {field: filter.field});
      if (idx < 0) {
        return;
      } else {
        this.widgetConfiguration.filters.splice(idx, 1);
      }

      // 이미 생성된 위젯인 경우만 제거(API)
      this._setUseFilter();
      this.drawChart();

    } else {
      // 글로벌 필터제거
      const idx = _.findIndex(this.widget.dashBoard.configuration.filters, {field: filter.field});
      if (idx < 0) {
        return;
      } else {
        this.widget.dashBoard.configuration.filters.splice(idx, 1);
      }

      this._setUseFilter();
      this.drawChart();
    }
    // 필터 패널에 데이터 강제 설정
    if (this._filterPanelComp) {
      this._filterPanelComp.setFilters(
        this.widget.dashBoard.configuration.filters,
        this.widget.configuration.filters
      );
    }
  } // function - deleteFilter


  /**
   * 사용자 정의 측정값 필드 여부
   * @param {Field} field
   * @returns {boolean}
   */
  public isCustomMeasureField(field: Field) {

    return FieldRole.MEASURE === field.role && 'user_expr' === field.type;
  } // function - isCustomMeasureField

  /**
   * 필터 토글
   * @param {Field} field
   * @param {MouseEvent} $event
   */
  public toggleFilter(field: Field, $event?: MouseEvent) {

    ($event) && ($event.stopPropagation());

    // 사용자 정의 측정값 필터는 사용할 수 없다고 해서 막음
    if (this.isCustomMeasureField(field)) {
      return;
    }

    // custom measure필드에서 aggregation 함수가 쓰인경우 필터 적용못하게 막기
    if (field.aggregated) {
      Alert.info(this.translateService.instant('msg.page.custom.measure.aggregation.unavailable'));
      return;
    }

    let selectedField: Field;

    if (field['field']) selectedField = field['field'];
    else selectedField = field;

    this.rnbMenu = 'filter';
    if (selectedField.useFilter) {
      // 제거

      if (selectedField.filtering) {
        Alert.warning(this.translateService.instant('msg.board.alert.recomm-filter.del.error'));
        return;
      }

      selectedField.useFilter = false;


      const globalFilters = this.widget.dashBoard.configuration.filters;
      const chartFilters = this.widgetConfiguration.filters;

      // filter에서 해당 필드 제거로직
      let idx = _.findIndex(globalFilters, {field: selectedField.name});
      if (idx > -1) this.deleteFilter(globalFilters[idx]);
      idx = _.findIndex(chartFilters, {field: selectedField.name});
      if (idx > -1) this.deleteFilter(chartFilters[idx]);

      // 선반에 필터정보 업데이트
      this.getPivotComp().setWidgetConfig = this.widgetConfiguration;

      return;
    } else {
      // 추가

      selectedField.useFilter = true;

      if (selectedField.logicalType === LogicalType.TIMESTAMP) {
        // 시간 필터
        const timeFilter = FilterUtil.getTimeAllFilter(selectedField);

        // widgetId set
        timeFilter.ui.widgetId = this.widget.id;
        if (this.isNewWidget()) {
          timeFilter.ui.widgetId = 'NEW';
        }

        this.widgetConfiguration.filters.push(timeFilter);

      } else if (selectedField.role === FieldRole.MEASURE) {
        // 측정값 필터
        const boundFilter = FilterUtil.getBasicBoundFilter(selectedField);
        // widgetId set
        boundFilter.ui.widgetId = this.widget.id;
        if (this.isNewWidget()) {
          boundFilter.ui.widgetId = 'NEW';
        }

        // 사용자 필드일경우
        if (selectedField.type === 'user_expr') {
          boundFilter.ref = 'user_defined';
        }

        this.widgetConfiguration.filters.push(boundFilter);
      } else {
        // inclusion필터
        const inclusionFilter = FilterUtil.getBasicInclusionFilter(selectedField);

        // widgetId set
        inclusionFilter.ui.widgetId = this.widget.id;
        if (this.isNewWidget()) {
          inclusionFilter.ui.widgetId = 'NEW';
        }

        // 사용자 필드일경우
        if (selectedField.type === 'user_expr') {
          inclusionFilter.ref = 'user_defined';
        }

        this.widgetConfiguration.filters.push(inclusionFilter);
      }


      // 필터 업데이트
      if (!this.isNewWidget()) {
        // 글로벌 필터 업데이트
        const widget = {configuration: _.cloneDeep(this.originalWidgetConfiguration)};
        widget.configuration.filters = _.cloneDeep(this.widgetConfiguration.filters);

        // 스펙 변경
        widget.configuration = DashboardUtil.convertPageWidgetSpecToServer(widget.configuration);

        this.loadingShow();
        this.widgetService.updateWidget(this.widget.id, widget).then((page: Widget) => {
          this.loadingHide();
          return page;
        }).catch((error) => {
          this.loadingHide();
          if (!isUndefined(error.details)) {
            Alert.error(error.details);
          } else if (!isUndefined(error.message)) {
            Alert.error(error.message);
          } else {
            Alert.error(error);
          }
        });
      }
    }
  } // function - toggleFilter

  /**
   * 확인팝업
   * @param {Filter} filter
   * @param {string} type
   */
  public openConfirmPopup(filter: Filter, type: string) {
    if ('toChartFilter' === type) {
      // 차트 필터를 글로벌필터
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.board.filter.alert.change.chart');
      modal.description = this.translateService.instant('msg.board.filter.alert.change.chart.des');
      modal.data = {
        afterConfirm: () => {
          this._setChartFilter(filter);
        }
      };
      this.confirmModalComponent.init(modal);
    }
  } // function - openConfirmPopup


  /**
   * 확인 팝업 확인 클릭시
   * @param {Modal} modal
   */
  public confirm(modal: Modal) {

    if (modal.data.afterConfirm) {
      modal.data.afterConfirm.call(this);
      // 그리드 차트의 원본보기변경시 사용자 프리셋설정 초기화
    } else if (modal.data.eventType === EventType.GRID_ORIGINAL) {
      this.commonOption.changeGridViewType(modal.data.data);

      // 바차트의 병렬 / 중첩상태 변경시 사용자 프리셋설정 초기화
    } else if (modal.data.eventType == EventType.SERIES_VIEW) {
      this.commonOption.changeBarSeriesViewType(modal.data.data);

      // granularity 변경시 사용자 프리셋설정 초기화
    } else if (modal.data.eventType == EventType.GRANULARITY) {
      this.getPivotComp().onSetGranularity(modal.data.data.discontinuous, modal.data.data.unit, modal.data.data.byUnit);

      // 라인차트의 기본 / 누적타입 변경시
    } else if (modal.data.eventType == EventType.CUMULATIVE) {
      this.commonOption.changeCumulative(modal.data.data);
    }
  } // function - confirm


  /**
   * 병렬 / 중첩으로 viewType 변경시 선반위치 변경
   * @param type
   */
  public changeAxisByStack(type: BarMarkType) {

    let checkDimensionExist: boolean = false;

    const allRowAggregations = this.pivot.rows.concat(this.pivot.aggregations);

    // 행이나 교차에 dimension이 있는경우
    for (const item of allRowAggregations) {

      if (item.type === String(ShelveFieldType.DIMENSION)) {

        checkDimensionExist = true;
      }
    }

    // dimension이 열이나 교차에 있는경우
    if (checkDimensionExist) {

      // 중첩일때
      if (String(BarMarkType.STACKED) === String(type)) {

        // 교차선반에 있는 dimension을 행선반으로 이동
        for (let num = this.pivot.aggregations.length; num--;) {

          let item = this.pivot.aggregations[num];

          // dimension이면
          if (item.type === String(ShelveFieldType.DIMENSION)) {

            // 교차선반에서 제거
            this.pivot.aggregations.splice(num, 1);

            // 교차 선반으로 설정
            item.currentPivot = FieldPivot.ROWS;

            // 행선반에 추가
            this.pivot.rows.push(item);
          }
        }
        // 병렬일때
      } else {

        // 행에 있는 dimension을 교차선반으로 이동
        for (let num = this.pivot.rows.length; num--;) {

          let item = this.pivot.rows[num];

          // dimension이면
          if (item.type === String(ShelveFieldType.DIMENSION)) {

            // 행선반에서 제거
            this.pivot.rows.splice(num, 1);

            // 교차 선반으로 설정
            item.currentPivot = FieldPivot.AGGREGATIONS;

            // 교차선반에 추가
            this.pivot.aggregations.push(item);
          }
        }
      }
    }
  }

  /**
   * 그리드 유효 여부
   */
  public isAvaliableGrid() {

    const notAvaliableChart = ['grid', 'scatter', 'pie'];
    return (notAvaliableChart.indexOf(this.selectChart) === -1);
  } // function - isAvaliableGrid

  /**
   * 그리드 데이터 초기화
   */
  public initGridChart() {

    try {
      if (this.gridChart && this.gridChart.isLoaded) {
        this.gridChart.resultData = this.resultData;
      }
    } catch (err) {
      //console.info(err);
    }
  }

  /**
   * 그리드 차트 옵션 변경 적용
   * @param uiOption
   */
  public gridUiOptionUpdatedHandler(uiOption) {
    this.gridUiOption = _.extend({}, this.gridUiOption, uiOption);
  } // function - updateGridUIOption

  /**
   * 차트뷰 or 테이블뷰 모드변경
   * @param isChartView
   */
  public onModeChange(isChartView: boolean): void {

    if (this.isChartView != isChartView) {

      // Flag Change
      this.isChartView = isChartView;

      // Grid뷰일경우
      if (!this.isChartView) {

        // 데이터 초기화
        this.initGridChart();
      }

      // 리사이즈
      this.chartResize(true);
    }
  }

  /**
   * 사용자 정의 필드 Expresion 표현형태로 치환
   * @param expr
   * @returns {string}
   */
  public unescapeCustomColumnExpr(expr: string) {
    return StringUtil.unescapeCustomColumnExpr(expr)
  }

  /**
   * 데이터(dimension, measure)에서 선반에 표시된 아이콘(행,열,교차) 제거하고 해당 값으로 설정
   * @param item  해당 field 리스트의 아이템
   * @param measureTargetList 선반에 올린 measure가 포함된 타겟 리스트
   */
  public onChangePivotItem(data: Object) {

    const item: AbstractField = data['data'];
    const measureTargetList: AbstractField[] = data['list'];
    const addTargetType: FieldPivot = data['addType'];
    const deleteTargetType: FieldPivot = data['deleteType'];

    // dimension일때
    if (String(ShelveFieldType.DIMENSION) === item.type || String(ShelveFieldType.TIMESTAMP) === item.type) {

      // data에서 선택된 열 / 행 선반의 표시 제거
      item.field.pivot.splice(item.field.pivot.indexOf(deleteTargetType), 1);
      item.field.pivot.push(addTargetType);

      // measure일때
    } else if (String(ShelveFieldType.MEASURE) === item.type) {

      // 교차에 해당 측정값이 있는지 체크
      const existIndex = _.findIndex(measureTargetList, (aggItem) => item.name === aggItem.name);

      // 있는경우
      if (-1 !== existIndex) {

        const field = item.field;

        // 측정값의 선반을 교차선반으로 표시
        const measureIndex = _.findIndex(this.measures, (measureItem) => {
          return field.alias === measureItem.alias && field.name === measureItem.name && field.type === measureItem.type;
        });

        // 열 / 행 선반의 표시 제거
        // 해당 선반의 표시 제거
        item.field.pivot.splice(item.field.pivot.indexOf(deleteTargetType), 1);

        // 해당 index가 있는경우
        if (-1 !== measureIndex && addTargetType) {

          // 교차선반을 타입으로 설정
          this.measures[measureIndex].pivot.push(addTargetType);
        }
        // 없는경우
      } else {

        // 해당 필드의 pivot을 삭제
        item.field.pivot.splice(item.field.pivot.indexOf(deleteTargetType), 1);
      }
    }
  }

  /**
   * 데이터(dimension, measure)에서 선반에 표시된 아이콘(행,열,교차) 제거하기
   * @param item  해당 field 리스트의 아이템
   * @param measureTargetList 선반에 올린 measure가 포함된 타겟 리스트
   */
  public onDeletePivotItem(data: Object) {

    const item: AbstractField = data['data'];
    const addType: FieldPivot = data['addType'];
    const deleteType: FieldPivot = data['deleteType'];

    // dimension일때
    if (String(ShelveFieldType.DIMENSION) === item.type || String(ShelveFieldType.TIMESTAMP) === item.type) {

      // data에서 선택된 열 / 행 선반의 표시 제거
      delete item.field.pivot;

      // measure일때
    } else if (String(ShelveFieldType.MEASURE) === item.type) {

      // 삭제타입이 있는경우 field pivot에서 해당 deleteType 제거
      if (deleteType) item.field.pivot.splice(item.field.pivot.indexOf(deleteType), 1);

      // 추가타입이 있는경우 addType 추가
      if (addType) item.field.pivot.push(addType);
    }
  }

  /**
   * 데이터 패널 클릭시 show hide 처리
   */
  public clickDataPanel(dataLayerKey: string) {

    // 같은 값인경우 초기화
    if (JSON.stringify(this.dataLayerKey) === JSON.stringify(dataLayerKey)) {

      this.dataLayerKey = '';
    } else {

      // 해당 패널의 key값 설정
      this.dataLayerKey = dataLayerKey;
    }

    // 선택된 데이터 패널의 내부 스크롤 설정
    this.dataPanelInnerScroll();
  }

  /**
   * 해당차트의 구현 가능한 기능 체크
   *
   * @param {string} type
   * @param {ChartType} chartType
   * @returns {boolean}
   */
  public possibleChartCheck(type: string, chartType: string): boolean {

    // when it's map chart, option is mapLayer
    if ('map' === chartType && -1 !== type.indexOf('mapLayer')) {
      return _.indexOf(possibleChartObj[type], chartType) > -1 && !this.setDisableMapLayer();
    }

    return _.indexOf(possibleChartObj[type], chartType) > -1;
  }

  /**
   * 데이터패널에서 선택된 dimension /measure 개수 return
   */
  public getCntShelfItem(type: 'DIMENSION' | 'MEASURE'): number {

    let cntShelfItems = 0;
    const strType: string = type.toLowerCase();
    if (ChartType.MAP === this.widgetConfiguration.chart.type) {
      // 선택된 아이템 변수 - shelf 정보가 있는 아이템만 설정
      this.shelf.layers.forEach(layer => {
        cntShelfItems = cntShelfItems + layer.fields.filter(field => {
          return strType === field.type && field.field.dataSource === this.dataSource.engineName;
        }).length;
      });
    } else {
      // 선택된 아이템 변수 - pivot 정보가 있는 아이템만 설정
      cntShelfItems = cntShelfItems + this.pivot.rows.filter(row => {
        return strType === row.type && row.field.dataSource === this.dataSource.engineName;
      }).length;
      cntShelfItems = cntShelfItems + this.pivot.columns.filter(col => {
        return strType === col.type && col.field.dataSource === this.dataSource.engineName;
      }).length;
      cntShelfItems = cntShelfItems + this.pivot.aggregations.filter(aggr => {
        return strType === aggr.type && aggr.field.dataSource === this.dataSource.engineName;
      }).length;
    }
    return cntShelfItems;
  } // function - getCntShelfItem

  /**
   * 차트 데이터가 없을시 No Data 노출
   */
  public onNoData(): void {
    this.isNoData = true;
    this.changeDetect.detectChanges();
  }

  /**
   * 차트의 조건이 안맞아서 차트표시대신 guide화면으로 표시
   */
  public onShowGuide(): void {
    this.isChartShow = false;
    this.changeDetect.detectChanges();
  }

  /**
   * 해당 선반에서 선반 데이터 제거
   */
  public onChangePivotData(data: any): void {

    // 선반 타입 (column, row, agg)
    let shelveTypeList: FieldPivot[] = data['shelveTypeList'];
    // measure / dimension 타입
    let shelveFieldTypeList: string[] = data['shelveFieldTypeList'];

    // 해당 선반 타입에 대한 리스트를 제거
    for (const type of shelveTypeList) {

      this.pivot[type].forEach((item) => {
        item.field.pivot = []
      });
      this.pivot[type] = [];
    }
  }

  /**
   * MapView 여부에 따른 Pivot 컴포넌트 반환
   * @returns {PagePivotComponent}
   */
  public getPivotComp(): PagePivotComponent {

    if (_.eq(this.selectChart, 'map')) {
      return this.mapPivot;
    } else {
      return this.pagePivot;
    }
  }

  /**
   * 선택된 필드 자동 피봇팅
   * @param {Field} targetField
   * @param {boolean} isDimension
   */
  public onPivotSelect(targetField: Field, isDimension: boolean): void {

    // 필드 변환
    // ( 초기에 이곳에서 fieldAlias 를 설정했으나,
    // pivot에 설정된 후에 convertField 메서드를 이용해서 필드가 재설정되므로 이곳에서의 설정은 의미 없음
    let pivotFiled: any = {
      name: targetField.name,
      alias: targetField.alias,
      role: targetField.role,
      type: targetField.type
    };

    // 이미 선반에 들어가있는지 여부
    let isAlreadyPivot: boolean = false;
    let alreadyFieldPivot: FieldPivot;
    let alreadyPivot: AbstractField[];
    let alreadyIndex: number;

    // when it's map
    if (_.eq(this.selectChart, ChartType.MAP)) {

      // 선반에 아이템이 존재한 상태에서 데이터소스가 변경되고, 새로 아이템을 추가할 경우에 맞추기 위해서...
      this._setDataSourceCurrentLayer(this.dataSource);

      let layerNum = (<UIMapOption>this.uiOption).layerNum;
      let currentMapLayer = this.shelf.layers[layerNum].fields;

      // check is different database on the same shelf (do not need to loop because database checking)
      if (!isNullOrUndefined(currentMapLayer) && !isNullOrUndefined(currentMapLayer[0]) && !isNullOrUndefined(currentMapLayer[0]['field'])
        && targetField.dataSource != currentMapLayer[0].field.dataSource) {
        Alert.warning(this.translateService.instant('msg.page.layer.multi.datasource.same.shelf'));
        return;
      }

      let fieldPivot: FieldPivot;

      if ('MAP_LAYER' + layerNum === FieldPivot.MAP_LAYER0.toString()) {
        fieldPivot = FieldPivot.MAP_LAYER0;
      } else if ('MAP_LAYER' + layerNum === FieldPivot.MAP_LAYER1.toString()) {
        fieldPivot = FieldPivot.MAP_LAYER1;
      } else if ('MAP_LAYER' + layerNum === FieldPivot.MAP_LAYER2.toString()) {
        fieldPivot = FieldPivot.MAP_LAYER2;
      }

      // 이미 들어가있는 선반을 찾는다.
      for (let num: number = 0; num < currentMapLayer.length; num++) {
        let field: AbstractField = currentMapLayer[num];
        if (field.name == targetField.name) {
          isAlreadyPivot = true;
          alreadyFieldPivot = fieldPivot;
          alreadyPivot = currentMapLayer;
          alreadyIndex = num;
          break;
        }
      }

      // dimension
      if (isDimension) {
        // add to shelf
        if (!isAlreadyPivot) {
          // push pivotField to layers
          this.shelf.layers[layerNum].fields.push(pivotFiled);
          this.mapPivot.convertField(targetField, 'layer' + layerNum);
        } else {
          // remove
          this.mapPivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
        // measure
      } else {
        // 사용자 필드이면서 aggregated가 true인 이미 선반에 올라간 컬럼인경우 제거
        if ('user_expr' == targetField.type && targetField.aggregated && isAlreadyPivot) {

          this.mapPivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);

          // point, heatmap, line, polygon => no aggregation / hexagon => set aggregation
        } else if (isAlreadyPivot && MapLayerType.TILE !== (<UIMapOption>this.uiOption).layers[(<UIMapOption>this.uiOption).layerNum].type) {

          this.mapPivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
          // push pivotField to layers
        } else {

          this.shelf.layers[layerNum].fields.push(pivotFiled);
          this.mapPivot.convertField(targetField, 'layer' + layerNum);
        }
      }
      return;

    }

    // geo column validation 체크
    if (!_.eq(this.selectChart, ChartType.MAP) && !_.eq(this.selectChart, '')
      && (targetField.logicalType && targetField.logicalType.toString().indexOf('GEO') != -1)) {
      Alert.warning(this.translateService.instant('msg.board.ui.invalid-column'));
      return;
    }

    // 이미 들어가있는 선반을 찾는다.
    for (let num: number = 0; num < this.pivot.columns.length; num++) {
      let field: AbstractField = this.pivot.columns[num];
      if (field.name == targetField.name) {
        isAlreadyPivot = true;
        alreadyFieldPivot = FieldPivot.COLUMNS;
        alreadyPivot = this.pivot.columns;
        alreadyIndex = num;
        break;
      }
    }
    for (let num: number = 0; num < this.pivot.rows.length; num++) {
      let field: AbstractField = this.pivot.rows[num];
      if (field.name == targetField.name) {
        isAlreadyPivot = true;
        alreadyFieldPivot = FieldPivot.ROWS;
        alreadyPivot = this.pivot.rows;
        alreadyIndex = num;
        break;
      }
    }
    for (let num: number = 0; num < this.pivot.aggregations.length; num++) {
      let field: AbstractField = this.pivot.aggregations[num];
      if (field.name == targetField.name) {
        isAlreadyPivot = true;
        alreadyFieldPivot = FieldPivot.AGGREGATIONS;
        alreadyPivot = this.pivot.aggregations;
        alreadyIndex = num;
        break;
      }
    }

    // Dimension 이라면
    if (isDimension) {

      // map chart validation
      if ((targetField.logicalType && targetField.logicalType.toString().indexOf('GEO') != -1)
        && !_.eq(this.selectChart, '')) {
        Alert.warning(this.translateService.instant('msg.board.ui.invalid-pivot'));
        return;
      }

      // 열에 등록
      if (_.eq(this.selectChart, ChartType.BAR)
        || _.eq(this.selectChart, ChartType.LINE)
        || _.eq(this.selectChart, ChartType.HEATMAP)
        || _.eq(this.selectChart, ChartType.CONTROL)
        || _.eq(this.selectChart, ChartType.COMBINE)
        || _.eq(this.selectChart, ChartType.WATERFALL)
        || _.eq(this.selectChart, ChartType.SANKEY)
        || _.eq(this.selectChart, ChartType.GRID)
        || _.eq(this.selectChart, '')) {

        // 추가
        if (!isAlreadyPivot) {
          this.pivot.columns.push(pivotFiled);
          this.pagePivot.convertField(targetField, 'column');
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
      // 행에 등록
      else if (_.eq(this.selectChart, ChartType.GAUGE)) {

        // 추가
        if (!isAlreadyPivot) {
          this.pivot.rows.push(pivotFiled);
          this.pagePivot.convertField(targetField, 'row');
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
      // 교차에 등록
      else if (_.eq(this.selectChart, ChartType.SCATTER)
        || _.eq(this.selectChart, ChartType.PIE)
        || _.eq(this.selectChart, ChartType.WORDCLOUD)
        || _.eq(this.selectChart, ChartType.RADAR)) {

        // 추가
        if (!isAlreadyPivot) {
          this.pivot.aggregations.push(pivotFiled);
          this.pagePivot.convertField(targetField, 'aggregation');
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
      // 첫번째 열, 두번째 행에 등록 후 나머지는 열에 등록
      else if (_.eq(this.selectChart, ChartType.BOXPLOT)
        || _.eq(this.selectChart, ChartType.NETWORK)) {

        // 추가
        if (!isAlreadyPivot) {

          // 열에 들어가있는 개수
          let columnCount: number = 0;
          for (let num: number = 0; num < this.pivot.columns.length; num++) {
            columnCount++;
          }

          // 행에 들어가있는 개수
          let rowCount: number = 0;
          for (let num: number = 0; num < this.pivot.rows.length; num++) {
            rowCount++;
          }

          // 열에 한건도 없으면 열에 등록
          if (columnCount == 0) {
            this.pivot.columns.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'column');
          }
          // 행에 한건도 없으면 행에 등록
          else if (rowCount == 0) {
            this.pivot.rows.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'row');
          }
          // 나머지는 열에 등록
          else {
            this.pivot.columns.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'column');
          }
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
      // 첫번째 열, 두번째 행에 등록 후 나머지는 행에 등록
      else if (_.eq(this.selectChart, ChartType.TREEMAP)) {

        // 추가
        if (!isAlreadyPivot) {

          // 열에 들어가있는 개수
          let columnCount: number = 0;
          for (let num: number = 0; num < this.pivot.columns.length; num++) {
            columnCount++;
          }

          // 행에 들어가있는 개수
          let rowCount: number = 0;
          for (let num: number = 0; num < this.pivot.rows.length; num++) {
            rowCount++;
          }

          // 열에 한건도 없으면 열에 등록
          if (columnCount == 0) {
            this.pivot.columns.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'column');
          }
          // 행에 한건도 없으면 행에 등록
          else if (rowCount == 0) {
            this.pivot.rows.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'row');
          }
          // 나머지는 행에 등록
          else {
            this.pivot.rows.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'row');
          }
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
    }
    // Measure라면
    else {

      // 교차에 등록
      if (_.eq(this.selectChart, ChartType.BAR)
        || _.eq(this.selectChart, ChartType.LINE)
        || _.eq(this.selectChart, ChartType.HEATMAP)
        || _.eq(this.selectChart, ChartType.PIE)
        || _.eq(this.selectChart, ChartType.CONTROL)
        || _.eq(this.selectChart, ChartType.LABEL)
        || _.eq(this.selectChart, ChartType.BOXPLOT)
        || _.eq(this.selectChart, ChartType.WATERFALL)
        || _.eq(this.selectChart, ChartType.WORDCLOUD)
        || _.eq(this.selectChart, ChartType.COMBINE)
        || _.eq(this.selectChart, ChartType.TREEMAP)
        || _.eq(this.selectChart, ChartType.RADAR)
        || _.eq(this.selectChart, ChartType.NETWORK)
        || _.eq(this.selectChart, ChartType.SANKEY)
        || _.eq(this.selectChart, ChartType.GAUGE)
        || _.eq(this.selectChart, ChartType.GRID)
        || _.eq(this.selectChart, ChartType.MAP)
        || _.eq(this.selectChart, '')) {

        // 사용자 필드이면서 aggregated가 true인 이미 선반에 올라간 컬럼인경우 제거
        if ('user_expr' == targetField.type && targetField.aggregated && isAlreadyPivot) {

          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
          // 추가
        } else {
          this.pivot.aggregations.push(pivotFiled);
          this.pagePivot.convertField(targetField, 'aggregation');
        }
      }
      // 첫번째 열, 두번째 행에 등록 후 나머지는 등록안함
      else if (_.eq(this.selectChart, ChartType.SCATTER)) {

        // 추가
        if (!isAlreadyPivot) {

          // 열에 들어가있는 개수
          let columnCount: number = 0;
          for (let num: number = 0; num < this.pivot.columns.length; num++) {
            columnCount++;
          }

          // 행에 들어가있는 개수
          let rowCount: number = 0;
          for (let num: number = 0; num < this.pivot.rows.length; num++) {
            rowCount++;
          }

          // 열에 한건도 없으면 열에 등록
          if (columnCount == 0) {
            this.pivot.columns.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'column');
          }
          // 행에 한건도 없으면 행에 등록
          else if (rowCount == 0) {
            this.pivot.rows.push(pivotFiled);
            this.pagePivot.convertField(targetField, 'row');
          }
        }
        // 제거
        else {
          this.getPivotComp().removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
        }
      }
    }
  }

  // /**
  //  * 선택된 필드 자동 피봇팅
  //  * @param {Field} targetField
  //  * @param {boolean} isDimension
  //  */
  // public onPivotSelect(targetField: Field, isDimension: boolean): void {
  //
  //   // 필드 변환
  //   // ( 초기에 이곳에서 fieldAlias 를 설정했으나,
  //   // pivot에 설정된 후에 convertField 메서드를 이용해서 필드가 재설정되므로 이곳에서의 설정은 의미 없음
  //   let pivotFiled: any = {
  //     name: targetField.name,
  //     alias: targetField.alias,
  //     biType: targetField.biType
  //   };
  //
  //   // console.info( '>>>>>>> targetField', _.cloneDeep( targetField ) );
  //   // console.info( '>>>>>>> current targetField', targetField );
  //
  //   // 이미 선반에 들어가있는지 여부
  //   let isAlreadyPivot: boolean = false;
  //   let alreadyFieldPivot: FieldPivot;
  //   let alreadyPivot: AbstractField[];
  //   let alreadyIndex: number;
  //
  //   // 이미 들어가있는 선반을 찾는다.
  //   for (let num: number = 0; num < this.pivot.columns.length; num++) {
  //     let field: AbstractField = this.pivot.columns[num];
  //     if (field.name == targetField.name) {
  //       isAlreadyPivot = true;
  //       alreadyFieldPivot = FieldPivot.COLUMNS;
  //       alreadyPivot = this.pivot.columns;
  //       alreadyIndex = num;
  //       break;
  //     }
  //   }
  //   for (let num: number = 0; num < this.pivot.rows.length; num++) {
  //     let field: AbstractField = this.pivot.rows[num];
  //     if (field.name == targetField.name) {
  //       isAlreadyPivot = true;
  //       alreadyFieldPivot = FieldPivot.ROWS;
  //       alreadyPivot = this.pivot.rows;
  //       alreadyIndex = num;
  //       break;
  //     }
  //   }
  //   for (let num: number = 0; num < this.pivot.aggregations.length; num++) {
  //     let field: AbstractField = this.pivot.aggregations[num];
  //     if (field.name == targetField.name) {
  //       isAlreadyPivot = true;
  //       alreadyFieldPivot = FieldPivot.AGGREGATIONS;
  //       alreadyPivot = this.pivot.aggregations;
  //       alreadyIndex = num;
  //       break;
  //     }
  //   }
  //
  //   // Dimension 이라면
  //   if (isDimension) {
  //
  //     // 열에 등록
  //     if (_.eq(this.selectChart, ChartType.BAR)
  //       || _.eq(this.selectChart, ChartType.LINE)
  //       || _.eq(this.selectChart, ChartType.HEATMAP)
  //       || _.eq(this.selectChart, ChartType.CONTROL)
  //       || _.eq(this.selectChart, ChartType.COMBINE)
  //       || _.eq(this.selectChart, ChartType.WATERFALL)
  //       || _.eq(this.selectChart, ChartType.SANKEY)
  //       || _.eq(this.selectChart, ChartType.GRID)
  //       || _.eq(this.selectChart, '')) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //         this.pivot.columns.push(pivotFiled);
  //         this.pagePivot.convertField(targetField, 'column');
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //     // 행에 등록
  //     else if (_.eq(this.selectChart, ChartType.GAUGE)) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //         this.pivot.rows.push(pivotFiled);
  //         this.pagePivot.convertField(targetField, 'row');
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //     // 교차에 등록
  //     else if (_.eq(this.selectChart, ChartType.SCATTER)
  //       || _.eq(this.selectChart, ChartType.PIE)
  //       || _.eq(this.selectChart, ChartType.WORDCLOUD)
  //       || _.eq(this.selectChart, ChartType.RADAR)) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //         this.pivot.aggregations.push(pivotFiled);
  //         this.pagePivot.convertField(targetField, 'aggregation');
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //     // 첫번째 열, 두번째 행에 등록 후 나머지는 열에 등록
  //     else if (_.eq(this.selectChart, ChartType.BOXPLOT)
  //       || _.eq(this.selectChart, ChartType.NETWORK)) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //
  //         // 열에 들어가있는 개수
  //         let columnCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.columns.length; num++) {
  //           columnCount++;
  //         }
  //
  //         // 행에 들어가있는 개수
  //         let rowCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.rows.length; num++) {
  //           rowCount++;
  //         }
  //
  //         // 열에 한건도 없으면 열에 등록
  //         if (columnCount == 0) {
  //           this.pivot.columns.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'column');
  //         }
  //         // 행에 한건도 없으면 행에 등록
  //         else if (rowCount == 0) {
  //           this.pivot.rows.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'row');
  //         }
  //         // 나머지는 열에 등록
  //         else {
  //           this.pivot.columns.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'column');
  //         }
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //     // 첫번째 열, 두번째 행에 등록 후 나머지는 행에 등록
  //     else if (_.eq(this.selectChart, ChartType.TREEMAP)) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //
  //         // 열에 들어가있는 개수
  //         let columnCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.columns.length; num++) {
  //           columnCount++;
  //         }
  //
  //         // 행에 들어가있는 개수
  //         let rowCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.rows.length; num++) {
  //           rowCount++;
  //         }
  //
  //         // 열에 한건도 없으면 열에 등록
  //         if (columnCount == 0) {
  //           this.pivot.columns.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'column');
  //         }
  //         // 행에 한건도 없으면 행에 등록
  //         else if (rowCount == 0) {
  //           this.pivot.rows.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'row');
  //         }
  //         // 나머지는 행에 등록
  //         else {
  //           this.pivot.rows.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'row');
  //         }
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //   }
  //   // Measure라면
  //   else {
  //
  //     // 교차에 등록
  //     if (_.eq(this.selectChart, ChartType.BAR)
  //       || _.eq(this.selectChart, ChartType.LINE)
  //       || _.eq(this.selectChart, ChartType.HEATMAP)
  //       || _.eq(this.selectChart, ChartType.PIE)
  //       || _.eq(this.selectChart, ChartType.CONTROL)
  //       || _.eq(this.selectChart, ChartType.LABEL)
  //       || _.eq(this.selectChart, ChartType.BOXPLOT)
  //       || _.eq(this.selectChart, ChartType.WATERFALL)
  //       || _.eq(this.selectChart, ChartType.WORDCLOUD)
  //       || _.eq(this.selectChart, ChartType.COMBINE)
  //       || _.eq(this.selectChart, ChartType.TREEMAP)
  //       || _.eq(this.selectChart, ChartType.RADAR)
  //       || _.eq(this.selectChart, ChartType.NETWORK)
  //       || _.eq(this.selectChart, ChartType.SANKEY)
  //       || _.eq(this.selectChart, ChartType.GAUGE)
  //       || _.eq(this.selectChart, ChartType.GRID)
  //       || _.eq(this.selectChart, '')) {
  //
  //       // 사용자 필드이면서 aggregated가 true인 이미 선반에 올라간 컬럼인경우 제거
  //       if ('user_expr' == targetField.type && targetField.aggregated && isAlreadyPivot) {
  //
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //         // 추가
  //       } else {
  //         this.pivot.aggregations.push(pivotFiled);
  //         this.pagePivot.convertField(targetField, 'aggregation');
  //       }
  //     }
  //     // 첫번째 열, 두번째 행에 등록 후 나머지는 등록안함
  //     else if (_.eq(this.selectChart, ChartType.SCATTER)) {
  //
  //       // 추가
  //       if (!isAlreadyPivot) {
  //
  //         // 열에 들어가있는 개수
  //         let columnCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.columns.length; num++) {
  //           columnCount++;
  //         }
  //
  //         // 행에 들어가있는 개수
  //         let rowCount: number = 0;
  //         for (let num: number = 0; num < this.pivot.rows.length; num++) {
  //           rowCount++;
  //         }
  //
  //         // 열에 한건도 없으면 열에 등록
  //         if (columnCount == 0) {
  //           this.pivot.columns.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'column');
  //         }
  //         // 행에 한건도 없으면 행에 등록
  //         else if (rowCount == 0) {
  //           this.pivot.rows.push(pivotFiled);
  //           this.pagePivot.convertField(targetField, 'row');
  //         }
  //       }
  //       // 제거
  //       else {
  //         this.pagePivot.removeField(null, alreadyFieldPivot, alreadyPivot, alreadyIndex);
  //       }
  //     }
  //   }
  // }

  /**
   * 필드 이전버튼 클릭 이벤트
   * @param isDimension
   */
  public fieldPrev(isDimension: boolean): void {

    if (isDimension) {

      // 이전페이지를 갈 수 없다면 중지
      if (this.dimensionPage <= 1) {
        return;
      }

      // 페이지 증가
      this.dimensionPage--;

      // 페이지 목록 비움
      this.pageDimensions = [];

      // 검색어에 해당하는 목록
      let list: Field[] = this.getFieldSearchList(this.dimensions);

      // 페이지에 해당하는 데이터 채워넣음
      let start: number = (this.dimensionPage - 1) * this.MAX_PAGE_COUNT;
      let end: number = Math.floor(this.dimensionPage * this.MAX_PAGE_COUNT);
      end = end > list.length ? list.length : end;
      for (let num: number = start; num < end; num++) {
        this.pageDimensions.push(list[num]);
      }
    } else {

      // 이전페이지를 갈 수 없다면 중지
      if (this.measurePage <= 1) {
        return;
      }

      // 페이지 증가
      this.measurePage--;

      // 페이지 목록 비움
      this.pageMeasures = [];

      // 검색어에 해당하는 목록
      let list: Field[] = this.getFieldSearchList(this.measures);

      // 페이지에 해당하는 데이터 채워넣음
      let start: number = (this.measurePage - 1) * this.MAX_PAGE_COUNT;
      let end: number = Math.floor(this.measurePage * this.MAX_PAGE_COUNT);
      end = end > list.length ? list.length : end;
      for (let num: number = start; num < end; num++) {
        this.pageMeasures.push(list[num]);
      }
    }
  }

  /**
   * 필드 다음버튼 클릭 이벤트
   * @param isDimension
   */
  public fieldNext(isDimension: boolean): void {

    if (isDimension) {

      // 다음페이지를 갈 수 없다면 중지
      if (this.dimensionTotalPage <= this.dimensionPage) {
        return;
      }

      // 페이지 증가
      this.dimensionPage++;

      // 페이지 목록 비움
      this.pageDimensions = [];

      // 검색어에 해당하는 목록
      let list: Field[] = this.getFieldSearchList(this.dimensions);

      // 페이지에 해당하는 데이터 채워넣음
      let start: number = (this.dimensionPage - 1) * this.MAX_PAGE_COUNT;
      let end: number = Math.floor(this.dimensionPage * this.MAX_PAGE_COUNT);
      end = end > list.length ? list.length : end;
      for (let num: number = start; num < end; num++) {
        this.pageDimensions.push(list[num]);
      }
    } else {

      // 다음페이지를 갈 수 없다면 중지
      if (this.measureTotalPage <= this.measurePage) {
        return;
      }

      // 페이지 증가
      this.measurePage++;

      // 페이지 목록 비움
      this.pageMeasures = [];

      // 검색어에 해당하는 목록
      let list: Field[] = this.getFieldSearchList(this.measures);

      // 페이지에 해당하는 데이터 채워넣음
      let start: number = (this.measurePage - 1) * this.MAX_PAGE_COUNT;
      let end: number = Math.floor(this.measurePage * this.MAX_PAGE_COUNT);
      end = end > list.length ? list.length : end;
      for (let num: number = start; num < end; num++) {
        this.pageMeasures.push(list[num]);
      }
    }
  }

  public getFieldSearchList(list: Field[]): Field[] {

    // 반환 목록
    let result: Field[] = [];

    // 검색어가 없다면 전체 반환
    if (StringUtil.isEmpty(this.fieldSearchText)) {
      return list;
    }

    // 검색어가 포함된 결과만 추출
    for (let item of list) {
      if (item.name.toLowerCase().includes(this.fieldSearchText.toLowerCase())) {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * 필드 토탈 페이지 계산
   * @param {number} page
   */
  public setFieldTotalPage(page: number = 1): void {

    // 페이지 초기화
    this.pageDimensions = [];
    this.pageMeasures = [];
    this.dimensionPage = page;
    this.measurePage = page;

    // 검색어에 해당하는 목록
    let dimensionList: Field[] = this.getFieldSearchList(this.dimensions);
    let measureList: Field[] = this.getFieldSearchList(this.measures);

    // Dimension 전체 페이지 계산
    this.dimensionTotalPage = (Math.floor(dimensionList.length / this.MAX_PAGE_COUNT)) + (dimensionList.length % this.MAX_PAGE_COUNT == 0 ? 0 : 1);

    // Measure 전체 페이지 계산
    this.measureTotalPage = (Math.floor(measureList.length / this.MAX_PAGE_COUNT)) + (measureList.length % this.MAX_PAGE_COUNT == 0 ? 0 : 1);

    // 데이터 초기화
    this.dimensionPage = 0;
    this.measurePage = 0;
    this.fieldNext(true);
    this.fieldNext(false);
  }

  /**
   * 차트타입에 따라서 번역된 명칭으로 리턴
   */
  public getChartTypeTransLate(selectChart): string {

    switch (selectChart) {
      case ChartType.BAR :
        return this.translateService.instant('msg.page.ui.bar');
      case ChartType.GRID :
        return this.translateService.instant('msg.page.ui.text-table');
      case ChartType.LINE :
        return this.translateService.instant('msg.page.ui.line');
      case ChartType.SCATTER :
        return this.translateService.instant('msg.page.ui.scatter');
      case ChartType.HEATMAP :
        return this.translateService.instant('msg.page.ui.heat-map');
      case ChartType.PIE :
        return this.translateService.instant('msg.page.ui.pie');
      case ChartType.CONTROL :
        return this.translateService.instant('msg.page.ui.control-chart');
      case ChartType.LABEL :
        return this.translateService.instant('msg.page.ui.kpi');
      case ChartType.BOXPLOT :
        return this.translateService.instant('msg.page.ui.box-plot');
      case ChartType.WATERFALL :
        return this.translateService.instant('msg.page.ui.water-fall');
      case ChartType.WORDCLOUD :
        return this.translateService.instant('msg.page.ui.word-cloud');
      case ChartType.COMBINE :
        return this.translateService.instant('msg.page.ui.combine-chart');
      case ChartType.TREEMAP :
        return this.translateService.instant('msg.page.ui.tree-map');
      case ChartType.RADAR :
        return this.translateService.instant('msg.page.ui.radar-chart');
      case ChartType.NETWORK :
        return this.translateService.instant('msg.page.ui.network');
      case ChartType.SANKEY :
        return this.translateService.instant('msg.page.ui.sankey');
      case ChartType.GAUGE :
        return this.translateService.instant('msg.page.ui.gauge-chart');
    }
  }

  /**
   * 팝업 init
   */
  public onShowPopup(modalData: Modal) {
    this.confirmModalComponent.init(modalData);
  }

  /**
   * 데이터소스 필드의 별칭이 변경되었을때의 처리
   * @param {Field} changeField
   */
  public changeDatasourceFieldAlias(changeField: Field) {
    this.widget.dashBoard.configuration.fields.some((field: Field) => {
      if (field.name === changeField.name) {
        field = changeField;
        // when it's not map, set pivot alias
        if (ChartType.MAP !== this.widgetConfiguration.chart.type) {
          PageComponent.updatePivotAliasFromField(this.widgetConfiguration.pivot, field);
          // when it's map, set shelf alias
        } else {
          PageComponent.updateShelfAliasFromField(this.widgetConfiguration.shelf, field, (<UIMapOption>this.widgetConfiguration.chart).layerNum);
        }
        return true;
      }
    });
    this.originalWidget.dashBoard.configuration.fields.some((field: Field) => {
      if (field.name === changeField.name) {
        field = changeField;
        if (ChartType.MAP !== this.widgetConfiguration.chart.type) {
          PageComponent.updatePivotAliasFromField(this.widgetConfiguration.pivot, field);
          // when it's map, set shelf alias
        } else {
          PageComponent.updateShelfAliasFromField(this.widgetConfiguration.shelf, field, (<UIMapOption>this.widgetConfiguration.chart).layerNum);
        }
        return true;
      }
    });
    changeField = _.cloneDeep(changeField);
    delete changeField.pivot;
    this.changeFieldAliasEvent.emit(changeField);
    this.setDatasourceFields(true);
    //this.drawChart();

    if (_.eq(this.selectChart, ChartType.MAP)) {
      this.onChangeShelf({
        shelf: this.shelf,
        eventType: EventType.DASHBOARD_ALIAS
      });
    } else {
      this.onChangePivot({
        pivot: this.pivot,
        eventType: EventType.DASHBOARD_ALIAS
      });
    }

  } // function - changeDatasourceFieldAlias

  /**
   * 필드로 부터 피봇 별칭 정보를 갱신한다.
   * @param {Pivot} pivot
   * @param {Field} field
   */
  public static updatePivotAliasFromField(pivot: Pivot, field: Field) {
    pivot.columns.forEach(col => {
      if (col.name === field.name) {
        // console.info( '>>>>> col alias : %s, fieldAlias : %s, newAlias : %s', col.alias, col.fieldAlias, field.nameAlias.nameAlias );
        (col.fieldAlias === col.alias || col.name === col.alias) && (col.alias = field.nameAlias.nameAlias);
        col.fieldAlias = field.nameAlias.nameAlias;
        col.field = _.merge(col.field, field);
        return true;
      }
    });
    pivot.rows.forEach(row => {
      if (row.name === field.name) {
        // console.info( '>>>>> row alias : %s, fieldAlias : %s, newAlias : %s', row.alias, row.fieldAlias, field.nameAlias.nameAlias );
        (row.fieldAlias === row.alias || row.name === row.alias) && (row.alias = field.nameAlias.nameAlias);
        row.fieldAlias = field.nameAlias.nameAlias;
        row.field = _.merge(row.field, field);
        return true;
      }
    });
    pivot.aggregations.forEach(aggr => {
      if (aggr.name === field.name) {
        // console.info( '>>>>> row alias : %s, fieldAlias : %s, newAlias : %s', aggr.alias, aggr.fieldAlias, field.nameAlias.nameAlias );
        (aggr.fieldAlias === aggr.alias || aggr.name === aggr.alias) && (aggr.alias = field.nameAlias.nameAlias);
        aggr.fieldAlias = field.nameAlias.nameAlias;
        aggr.field = _.merge(aggr.field, field);
        return true;
      }
    });
  } // function - updatePivotAliasFromField

  /**
   * update shelf alias from field
   * @param {Pivot} pivot
   * @param {Field} field
   */
  public static updateShelfAliasFromField(shelf: Shelf, field: Field, layerNum: number) {

    shelf.layers[layerNum].fields.forEach((layer) => {
      if (layer.name === field.name) {
        (layer.fieldAlias === layer.alias || layer.name === layer.alias) && (layer.alias = field.nameAlias.nameAlias);
        layer.fieldAlias = field.nameAlias.nameAlias;
        layer.field = _.merge(layer.field, field);
        return true;
      }
    });
  } // function - updatePivotAliasFromField

  /**
   * set disable shelf in map chart
   * @param {number} layerNum
   */
  public setDisableShelf(layerNum: number): boolean {

    let valid: boolean = true;

    // 공간연산 실행시 나머지 옵션 레이어 disable
    if ('map' == this.selectChart && this.uiOption['analysis'] != null && this.uiOption['analysis']['use'] == true) {
      (layerNum == this.shelf.layers.length - 1 ? valid = false : valid = true);
      return valid;
    }

    if (_.isUndefined(this.shelf.layers[layerNum])) {
      return valid;
    }

    let layers = this.shelf.layers[layerNum].fields;
    if (layers) {
      for (let layer of layers) {
        if (layer.field && layer.field.logicalType && -1 !== layer.field.logicalType.toString().indexOf('GEO')) {
          valid = false;
        }
      }
    }

    // set disable class
    return valid;
  }

  /**
   * rnbMenu type set disable in map chart
   * @returns {boolean}
   */
  public setDisableMapLayer(): boolean {

    let index: number;
    (this.rnbMenu.indexOf('1') != -1 ? index = 0 : index = (Number(this.rnbMenu.split('mapLayer')[1]) - 1));

    return this.setDisableShelf(index);

  }

  /**
   * set z-index class in map
   * @param event
   */
  public onSetZIndex(value: any) {
    this.panelZIndex = value;
  }

  /**
   * redraw chart
   */
  public changeDraw(value?: any) {

    // 공간연산 analysis 실행 여부
    if (!_.isUndefined(value) && value == 'removeAnalysisLayerEvent') {
      // 공간연산 중지
      this.mapPivot.removeAnalysis();
      this.drawChart();
    } else if (!_.isUndefined(value)) {
      // 공간 연산
      this.mapPivot.spatialAnalysisBtnClicked(value);
      this.changeDetect.detectChanges();
      this.onChangeShelf({
        shelf: this.shelf,
        eventType: EventType.MAP_SPATIAL_ANALYSIS
      });
    } else {
      this.drawChart();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private settingDragAndDrop() {

    const acceptsContainer = ['column', 'row', 'aggregation', 'column-guide', 'row-guide', 'aggregation-guide', 'layer0', 'layer1', 'layer2', 'layer-guide'];

    // 드래그 옵션
    function copy(el) {
      return ['dimension', 'measure'].indexOf(el['dataset']['source']) > -1;
    }

    function accepts(el, target, source, sibling) {
      return acceptsContainer.indexOf(target.dataset.container) > -1;
    }

    function moves(el, source) {
      return !el.classList.contains('dragIgnore');
    }

    // function cancel(el, target, source) {
    //
    //   return true;
    // }

    this.dragulaService.setOptions('dragbag', {
      copy,
      accepts,
      moves,
      // cancel,
      direction: 'horizontal',
      revertOnSpill: true
    });

    // drag 이벤트
    const dragulaDragSubs = this.dragulaService.drag.subscribe((value) => {
      // console.log('drag', value);
      if (_.eq(this.selectChart, ChartType.MAP)) {
        // 선반에 아이템이 존재한 상태에서 데이터소스가 변경되고, 새로 아이템을 추가할 경우에 맞추기 위해서...
        this._setDataSourceCurrentLayer(this.dataSource);
      }
    });

    const dragulaDropSubs = this.dragulaService.drop.subscribe((value) => {

      // console.log('drop', value);
      // const [bagName, e, el] = value;
      // console.log('id is:', e);
    });

    const dragulaOverSubs = this.dragulaService.over.subscribe((value) => {
      // console.log('over', value);
    });

    const dragulaOutSubs = this.dragulaService.out.subscribe((value) => {
      // console.log('out', value);
    });

    const dragulaDropModelSubs = this.dragulaService.dropModel.subscribe((value) => {

      // 선반에서 기존위치의 선반으로 들어가게 설정
      this.dragulaService.find('dragbag').drake.cancel(true);

      const [el, target, source] = value.slice(1);

      if (undefined === target) {
        return;
      }

      const info = {
        name: el.dataset.name,
        source: el.dataset.source,
        target: target.dataset.container
      };

      let targetField;
      if (info.source === 'dimension') {
        targetField = this.dimensions.find((field) => {
          return info.name === field.name;
        });

      } else if (info.source === 'measure') {
        targetField = this.measures.find((field) => {
          return info.name === field.name;
        });
      }

      if (acceptsContainer.indexOf(info.target) > -1) {

        if (info.target.includes('guide') && targetField) {
          // 가이드를 통해 넣은 경우
          this.getPivotComp().addField(targetField, info.target.replace(/-.*$/, ''), this.getPivotComp().dragField);
        } else {

          // 가이드가 아닌 직접 선반에 넣은 경우
          if (targetField) {
            // geo column validation 체크
            if (!_.eq(this.selectChart, ChartType.MAP) && !_.eq(this.selectChart, '')
              && (targetField.logicalType && targetField.logicalType.toString().indexOf('GEO') != -1)) {
              if (info.target === 'column') {
                this.invalidGeoData(this.pivot.columns);
              } else if (info.target === 'row') {
                this.invalidGeoData(this.pivot.rows);
              } else if (info.target === 'aggregation') {
                this.invalidGeoData(this.pivot.aggregations);
              }
              Alert.warning(this.translateService.instant('msg.board.ui.invalid-column'));
              return;
            }
            this.getPivotComp().convertField(targetField, info.target);
          } else if (info.target) {

            // 타겟필드 찾음
            targetField = _.concat(this.dimensions, this.measures).find((field) => {
              return this.getPivotComp().dragField.name === field.name;
            });

            // 내부에서 순서만 변경
            this.getPivotComp().changeFieldPivot(targetField, info.target, this.getPivotComp().dragField);
          }
        }
      }
    });

    const dragulaRemoveModelSubs = this.dragulaService.removeModel.subscribe((value) => {
      // console.log('removeModel', value);
    });

    this.subscriptions.push(dragulaDragSubs, dragulaDropSubs, dragulaOverSubs, dragulaOutSubs, dragulaDropModelSubs, dragulaRemoveModelSubs);

  }


  /**
   * LNB > Data> 필드 설정
   * @param fieldPivotSetFl field의 pivot 리스트에 해당값 설정여부
   */
  private setDatasourceFields(fieldPivotSetFl?: boolean) {
    this.dimensions = [];
    this.measures = [];

    const boardConf: BoardConfiguration = this.widget.dashBoard.configuration;
    let totalFields: Field[] = boardConf.fields;

    if (totalFields && totalFields.length > 0) {
      totalFields = DashboardUtil.getFieldsForMainDataSource(boardConf, this.dataSource.engineName);
      totalFields.forEach((field) => {
        if (field.role === FieldRole.MEASURE) {
          this.measures.push(field);
        } else if (field.role === FieldRole.DIMENSION || field.role === FieldRole.TIMESTAMP) {
          this.dimensions.push(field);
        } else {
          // 정의되지 않은 필드 세팅 필요
          console.error('정의되지 않은 필드 세팅 필요', field);
        }
      });
      this.fields = totalFields;
    } else {
      this.fields = [];
    }

    this.customDimensions = [];
    this.customMeasures = [];
    if (boardConf.hasOwnProperty('customFields') && boardConf.customFields.length > 0) {
      // set main datasource fields
      boardConf.customFields
        .filter(item => item.dataSource === this.widget.configuration.dataSource.engineName)
        .forEach((field: CustomField) => {
          if (field.role === FieldRole.DIMENSION) {
            this.customDimensions.push(field);

            const dimension: Field = new Field();
            dimension.type = field.type;
            dimension.role = field.role;
            dimension.name = field.name;
            dimension.alias = field.name;
            dimension.expr = field.expr;
            dimension.ref = field.ref;

            this.dimensions.push(dimension);
          } else if (field.role === FieldRole.MEASURE) {
            this.customMeasures.push(field);

            const measure: Field = new Field();
            measure.type = field.type;
            measure.role = field.role;
            measure.name = field.name;
            measure.alias = field.name;
            measure.expr = field.expr;
            measure.ref = field.ref;
            measure.aggregated = field.aggregated;
            this.measures.push(measure);
          }
        });

      // set join datasource fields
    }

    // // 테스트용 뻥튀기
    // let test = _.cloneDeep(this.dimensions);
    // for( let idx: number = 0 ; idx < 20 ; idx++ ) {
    //   for (let num: number = 0; num < test.length; num++) {
    //     let item = _.cloneDeep(test[num]);
    //     item.name = item.name +"_"+ idx +"_"+ num;
    //     item.alias = item.name;
    //     this.dimensions.push(item);
    //   }
    // }
    //
    // // 테스트용 뻥튀기
    // test = _.cloneDeep(this.measures);
    // for( let idx: number = 0 ; idx < 20 ; idx++ ) {
    //   for (let num: number = 0; num < test.length; num++) {
    //     let item = _.cloneDeep(test[num]);
    //     item.name = item.name +"_"+ idx +"_"+ num;
    //     item.alias = item.name;
    //     this.measures.push(item);
    //   }
    // }

    // 페이징 계산
    this.setFieldTotalPage();

    // 선반에 올라간 필드 표시처리
    if (this.widgetConfiguration.pivot && fieldPivotSetFl) {
      _.concat(this.dimensions, this.measures).forEach((field) => {
        // Remove Pivot
        field.pivot = [];

        this.widgetConfiguration.pivot.rows
          .forEach((abstractField) => {
            if (String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
              abstractField.field = field;
              field.pivot = field.pivot ? field.pivot : [];
              field.pivot.push(FieldPivot.ROWS);
            }
          });

        this.widgetConfiguration.pivot.columns
          .forEach((abstractField) => {
            if (String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
              abstractField.field = field;
              field.pivot = field.pivot ? field.pivot : [];
              field.pivot.push(FieldPivot.COLUMNS);
            }
          });

        this.widgetConfiguration.pivot.aggregations
          .forEach((abstractField) => {
            if (String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
              abstractField.field = field;
              field.pivot = field.pivot ? field.pivot : [];
              field.pivot.push(FieldPivot.AGGREGATIONS);
            }
          });

        if (undefined !== this.widgetConfiguration.chart['layerNum'] && this.widgetConfiguration.chart['layerNum'] >= 0) {
          for (let layerIndex = 0; layerIndex < this.widgetConfiguration.chart['layers'].length; layerIndex++) {
            // set map chart layers pivot
            let fieldPivot: FieldPivot = layerIndex == 1 ? FieldPivot.MAP_LAYER1 : layerIndex == 2 ? FieldPivot.MAP_LAYER2 : FieldPivot.MAP_LAYER0;
            this.widgetConfiguration.shelf.layers[this.widgetConfiguration.chart['layerNum']].fields.forEach((abstractField) => {
              if (String(field.type) == abstractField.type.toUpperCase() && field.name == abstractField.name) {
                abstractField.field = field;
                field.pivot = field.pivot ? field.pivot : [];
                field.pivot.push(fieldPivot);
              }
            });
          }
        }
      });
    }

    // fields include custom fields
    this.fieldsWCustom = _.concat(this.dimensions, this.measures);

    // 필터로 사용중인 필드 플래그셋팅
    this._setUseFilter();
  }


  private init() {

    // default로 열리는 데이터 패널
    this.dataLayerKey = 'data';
    this.isModelLayerShow = false;
    this.isDataDimensionLayerShow = true;
    this.isDataMeasureLayerShow = true;
    this.recommendCharts = [];
    this.showInfoChart = '';
    this.isShowGuide = true;

    this.$fieldDetailLayer = $('#fieldDetailLayer');

    // 차트별 가이드 레이아웃
    this.guideLayout = {
      layout1: ['pie', 'label', 'wordcloud', 'radar'], // aggregation
      layout2: ['bar', 'grid', 'line', 'combine'], // aggregation, column
      layout3: ['waterfall', 'sankey'], // column, aggregation
      // 컨트롤차트 지원중단
      // layout3: ['waterfall', 'control', 'sankey'], // column, aggregation
      layout4: ['scatter', 'heatmap', 'boxplot', 'treemap', 'network'], // aggregation, column, rows
      layout5: ['gauge'], // aggregation, rows
      layout6: ['map'] // geo column
    };

  }

  /**
   * 현재 추천가능한 차트인지 체크
   */
  private recommendChart() {

    this.recommendCharts = [];

    function getShelfCnt(shelfType: string, fieldType: string[], pivot): number {
      let shelf: AbstractField[];
      if (shelfType === 'col') {
        shelf = pivot.columns;

      } else if (shelfType === 'row') {
        shelf = pivot.rows;

      } else if (shelfType === 'agg') {
        shelf = pivot.aggregations;
      } else {
        throw new Error('Unknown shelfType');
      }

      return shelf.filter((field: AbstractField) => {
        return fieldType.indexOf(field.type) > -1;
      }).length;

    }

    /**
     * 모든 선반에서 해당 타입에 해당하는 값 개수 리턴
     * @param fieldType
     * @param allPivot
     */
    function getAllShelfCntByType(fieldType: string[], allPivot): number {

      return allPivot.filter((field: AbstractField) => {
        return fieldType.indexOf(field.type) > -1;
      }).length;

    }

    /**
     * return geo logical type list
     * @param {string} logicalType
     * @param {Field[]} allPivot
     * @returns {number}
     */
    function getGeoType(logicalType: string, allPivot: AbstractField[], uiOption: UIOption): number {

      if (!_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use']) {
        return allPivot.length;
      }

      return allPivot.filter((item: AbstractField) => {
        return item.field.logicalType && -1 !== item.field.logicalType.toString().indexOf(logicalType);
      }).length;
    }

    // const colDimensionCnt = getShelfCnt('col', ['dimension'], this.pivot);
    // const colMeasureCnt = getShelfCnt('col', ['measure'], this.pivot);
    // const colTimestampCnt = getShelfCnt('col', ['timestamp'], this.pivot);
    // const rowDimensionCnt = getShelfCnt('row', ['dimension'], this.pivot);
    // const rowMeasureCnt = getShelfCnt('row', ['measure'], this.pivot);
    // // const rowTimestampCnt = getShelfCnt('row', ['timestamp'], this.pivot);
    // const aggDimensionCnt = getShelfCnt('agg', ['dimension'], this.pivot);
    // const aggMeasureCnt = getShelfCnt('agg', ['measure'], this.pivot);
    // // const aggTimestampCnt = getShelfCnt('agg', ['timestamp'], this.pivot);

    let pivotList = [];
    if (this.shelf && this.shelf.layers && undefined !== (<UIMapOption>this.uiOption).layerNum) pivotList = this.shelf.layers[(<UIMapOption>this.uiOption).layerNum].fields;
    else if (this.pivot) pivotList = this.pivot.aggregations.concat(this.pivot.rows.concat(this.pivot.columns));

    const geoCnt = getGeoType('GEO', pivotList, this.uiOption);

    // map chart
    if (geoCnt > 0) {
      this.recommendCharts.push('map');
      return;
    }

    const dimensionCnt = getAllShelfCntByType(['dimension'], pivotList);
    const measureCnt = getAllShelfCntByType(['measure'], pivotList);
    const timestampCnt = getAllShelfCntByType(['timestamp'], pivotList);

    // bar, line 동일
    // 차원값 1개 이상, 측정값 1개 이상
    if (dimensionCnt > 0 && measureCnt > 0) {
      this.recommendCharts.push('bar');
      this.recommendCharts.push('line');
      this.recommendCharts.push('pie');
    }

    // bar 시간필드
    // 시간필드 1개 이상, 측정값 1개 이상
    if (timestampCnt > 0 && measureCnt > 0) {
      this.recommendCharts.push('bar');
      this.recommendCharts.push('line');
    }

    // grid
    // 차원값 1개 이상, 측정값 1개 이상
    if (dimensionCnt > 0 && measureCnt > 0) {
      this.recommendCharts.push('grid');
    }

    // scatter
    // 차원값 1개 이상, 측정값 2개
    if (dimensionCnt > 0 && measureCnt == 2) {
      this.recommendCharts.push('scatter');
    }

    // heatmap
    // 차원값 1개 이상, 측정값 1개
    if (dimensionCnt > 0 && measureCnt == 1) {
      this.recommendCharts.push('heatmap');
      this.recommendCharts.push('boxplot');
      this.recommendCharts.push('wordcloud');
      this.recommendCharts.push('treemap');
      this.recommendCharts.push('gauge');
    }

    // mapview
    // 교차 : 위도 1개 경도 1개, 측정값 1개 => TODO 문서 재확인 해야함 내용이 다름

    // control
    // 날짜 & 시간을 포함한 차원값 1개, 측정값 1개 이상
    if (timestampCnt > 0 && measureCnt > 0) {
      this.recommendCharts.push('control');
    }

    // label
    // 차원값 / 시간값 0개, 측정값 1개이상
    if (dimensionCnt == 0 && timestampCnt == 0 && measureCnt > 0) {
      this.recommendCharts.push('label');
    }

    // waterfall
    // 날짜 & 시간을 포함한 차원값 1개,  측정값 1개
    if (timestampCnt === 1 && measureCnt === 1) {
      this.recommendCharts.push('waterfall');
    }

    // combine
    // 차원값 1개 이상, 측정값 2-4개
    if (dimensionCnt > 0 && measureCnt > 1 && 5 > measureCnt) {
      this.recommendCharts.push('combine');
    }

    // radar
    // 차원값 1개, 측정값 1개 이상
    if (dimensionCnt === 1 && measureCnt > 0) {
      this.recommendCharts.push('radar');
    }

    // network
    // 차원값 2개, 측정값 1개
    if (dimensionCnt == 2 && measureCnt == 1) {
      this.recommendCharts.push('network');
    }

    // sankey
    // 차원값 3개 이상, 측정값 1개
    if (dimensionCnt > 2 && measureCnt == 1) {
      this.recommendCharts.push('sankey');
    }

    this.recommendCharts = _.uniq(this.recommendCharts);

  }

  private chartResize(isImmediate: boolean = false) {
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
            if (this.chart && this.chart.chart) this.chart.chart.resize();
            //(<GridChartComponent>this.chart).grid.arrange();
          } else if (this.chart.uiOption.type === ChartType.NETWORK) {
            this.networkChart.draw();
          } else if (this.chart.uiOption.type === ChartType.MAP) {
            this.mapChart.resize();
          } else {
            if (this.chart && this.chart.chart) this.chart.chart.resize();
          }
        },
        isImmediate ? 0 : 300
      );

    }

    if (this.gridChart) {
      setTimeout(() => this.gridChart.chart.arrange(), isImmediate ? 0 : 300);
    }
  }

  // 이전꺼
  // private chartResize() {
  //   if (this.chart) { // 더블클릭이나 빠른 재선택시 UI에서 제거 될 수 있으므로 처리
  //     // control
  //     if (this.chart.hasOwnProperty('barChart') && this.chart.hasOwnProperty('lineChart')) {
  //       const barChart: BarChartComponent = this.chart['barChart'];
  //       const lineChart: LineChartComponent = this.chart['lineChart'];
  //       barChart.chart.resize();
  //       lineChart.chart.resize();
  //
  //     } else if (this.selectChart === 'grid') {
  //       (<GridChartComponent>this.chart).grid.arrange();
  //     } else {
  //       // $('.chartCanvas').find('canvas').attr('width','100%').attr('height', '100%');
  //       this.chart.chart.resize();
  //     }
  //
  //     // TODO 차트가 그려지고 난후 이벤트 받아서 resize 호출 필요
  //     if ($('.chartCanvas').find('canvas').width() === 100) {
  //       setTimeout(this.chartResize, 500);
  //     }
  //   } else {
  //     setTimeout(this.chartResize, 500);
  //   }
  //
  //   if (this.gridChart) {
  //     setTimeout(() => this.gridChart.grid.arrange(), 0);
  //   }
  // }

  private drawChart(params: any = {
    successCallback: null,// Draw 성공시 callback
    resultFormatOptions: {}, // Search Result Option
    filters: [], // 추천필터나 타임스탬프 변경시 필터를 적용하기 위해
    type: '' // 호출된 종류 설정
  }) {
    // valid
    if (StringUtil.isEmpty(this.selectChart)) return;

    if (this.chart === undefined || this.chart === null) {
      // 최초 페이지 진입 후에는 initView가 끝난 후에 호출 해야함
      setTimeout(() => this.drawChart(), 300);
      return;
    }

    // 최초 호출시 이전버전의 스펙이라면 스펙을 초기화시켜줌
    if (!this.isVersionCheck) {

      // 버전 확인
      if (!this.uiOption.version || this.uiOption.version < SPEC_VERSION) {
        // 옵션 초기화
        this.uiOption = OptionGenerator.initUiOption(this.uiOption);
      }

      // 버전 체크완료
      this.isVersionCheck = true;
    }

    // chart pivot valid
    if ('map' !== this.selectChart && false === this.chart.isValid(this.pivot) ||
      ('map' === this.selectChart && false === this.chart.isValid(new Pivot(), this.shelf))) {
      this.isChartShow = false;
      this.isError = true;
      return;
    }

    // ui상에서 설정된 ui용 파라미터
    const query: SearchQueryRequest
      = this.datasourceService.makeQuery(
      this.widgetConfiguration,
      this.fields,
      {
        url: this.router.url,
        dashboardId: this.widget.dashBoard.id,
        widgetId: this.widget.id
      }, params.resultFormatOptions
    );

    const uiCloneQuery = _.cloneDeep(query);

    if ('map' !== this.selectChart && uiCloneQuery.pivot.columns.length + uiCloneQuery.pivot.rows.length + uiCloneQuery.pivot.aggregations.length === 0) {
      return;
    }

    // (bar차트) 행 또는 교차 선반에 값이 올라갈 경우 차원값 색상 및 범례 변경
    if ('bar' == this.selectChart) {

      let isChangeDimensionType: boolean = false;

      // 행선반에 dimension 값이 처음 생기는 경우
      this.pivot.rows.forEach((item) => {
        if (item.type === String(ShelveFieldType.DIMENSION)) {
          isChangeDimensionType = true;
        }
      });

      // 교차선반에 dimension 값이 처음 생기는 경우
      this.pivot.aggregations.forEach((item) => {
        if (item.type === String(ShelveFieldType.DIMENSION)) {
          isChangeDimensionType = true;
        }
      });

      // dimension color 변경
      if (isChangeDimensionType) {
        this.uiOption.color['schema'] = 'SC1';
        this.uiOption.color['type'] = ChartColorType.DIMENSION;
        this.uiOption.color['targetField'] = '';
      }

    } // end if - barChart

    this.loadingShow();
    this.isNoData = false;
    this.isError = false;
    this.isChartShow = true;

    // 변경사항 반영 (resultData설정시 설정할 옵션전에 패널이 켜지므로 off)
    // this.changeDetect.detectChanges();

    // 글로벌 필터 추가
    if (this.boardFilters && 0 < this.boardFilters.length) {
      uiCloneQuery.filters = this.boardFilters.concat(uiCloneQuery.filters);
    }
    // 파라미터 필터가 있을 경우 우선 적용
    if (params.filters && params.filters.length > 0) uiCloneQuery.filters = params.filters;

    // 서버 조회용 파라미터 (서버 조회시 필요없는 파라미터 제거)
    const cloneQuery = this.makeSearchQueryParam(_.cloneDeep(uiCloneQuery));

    this.query = cloneQuery;
    if (this.selectChart === 'label') {
      this.chart['setQuery'] = this.query;
    }

    this.datasourceService.searchQuery(cloneQuery).then(
      (data) => {

        const resultData = {
          data: data,
          config: uiCloneQuery,
          uiOption: this.uiOption,
          type: params.type
        };
        this.resultData = resultData;

        if (Object.keys(this.uiOption).length === 1) {
          delete resultData.uiOption;
        }

        this.initGridChart();

        // Set Limit Info
        this.limitInfo = DashboardUtil.getChartLimitInfo(this.widget.id, this.widget.configuration.chart.type, data);

        // 라인차트이고 고급분석 예측선 사용하는 경우
        if (this.selectChart === 'line') {

          if (this.isAnalysisPredictionEnabled()) {
            Promise
              .resolve()
              .then(() => {

                // discontinuous 타입일때 예측선 비활성화 (isPredictionLineDisabled 가 true가 아니라 false일때가 disabled true인 상태임)
                this.analysisComponent.synchronize(this.uiOption, {pivot: this.pivot},
                  {type: params.type, widget: this.widget, lineChart: this.lineChartComponent});

                if (this.analysisComponent.isValid() === false) {
                  this.lineChartComponent.analysis = null;
                  this.chart.resultData = resultData;
                }

                if (this.isAnalysisPredictionEnabled()) {
                  this.loadingShow();
                  this.analysisPredictionService
                    .getAnalysisPredictionLineFromPage(this.widgetConfiguration, this.widget, this.lineChartComponent, resultData)
                    .catch((err) => {
                      this.loadingHide();
                      this.isError = true;
                      this.commonExceptionHandler(err);
                    });
                } else {
                  this.lineChartComponent.analysis = null;
                  this.chart.resultData = resultData;
                }
              });
          } else {
            if (this.analysisComponent.isValid()) {
              this.analysisComponent.changePredictionLineDisabled();
            }
            this.lineChartComponent.analysis = null;
            setTimeout(() => {
              this.chart.resultData = resultData;
            }, 300);
          }
        } else if (this.selectChart == 'map') {
          // map chart 일 경우 aggregation type 변경시 min/max 재설정 필요
          if (!_.isUndefined(params) && !_.isUndefined(params.type) && params.type == EventType.AGGREGATION) {
            this.uiOption['layers'][this.uiOption['layerNum']]['isColorOptionChanged'] = true;
          }
          setTimeout(() => {
            this.chart.resultData = resultData;
          }, 300);
        } else {
          setTimeout(() => {
            this.chart.resultData = resultData;
          }, 300);
        }

        this.loadingHide();
        if (params.successCallback) {
          params.successCallback();
        }
      }
    ).catch((reason) => {
      let err = {};
      // only analysis 사용할때 에러 발생시 예외 처리
      if (!_.isUndefined(this.uiOption['analysis']) && this.uiOption['analysis']['use'] == true) {
        if (!_.isUndefined(reason) && (!_.isUndefined(reason['message']) || !_.isUndefined(reason['details']))) {
          err['code'] = reason.code;
          // 에러 메시지가 형식대로 떨어질 경우
          let message = reason['message'];
          let detailMessage = reason['details'];
          // message 길 경우
          if (!_.isUndefined(message) && message.length > 30) {
            err['message'] = 'Spatial Config Error <br/>' + message.substring(0, 30);
            err['details'] = message + '<br/>' + detailMessage;
          } else {
            err['message'] = 'Spatial Config Error';
            err['details'] = message + '<br/>' + detailMessage;
          }
        } else {
          err['message'] = 'Spatial Config Error <br/>';
          err['details'] = reason;
        }
      } else {
        err = reason;
      }
      console.error('Search Query Error =>', err);
      this.isChartShow = false;
      this.isError = true;
      this.commonExceptionHandler(err);

      // 변경사항 반영
      this.changeDetect.detectChanges();
      this.loadingHide();
    });
  }

  /**
   * 선택된 데이터 패널의 내부 스크롤 설정
   */
  private dataPanelInnerScroll() {

    // ui 설정 반영
    this.changeDetect.detectChanges();
    // data 패널 아코디언 선택된부분의 내부스크롤 설정
    let $contentsHeight = this.$element.find('.ddp-ui-chart-lnb').outerHeight(true) - (this.$element.find('.ddp-ui-drop-title').outerHeight(true) * 3);
    this.$element.find('.ddp-ui-dropmenu.ddp-selected .ddp-ui-drop-contents').height($contentsHeight);
  }

  // -------------------------------------------------
  // 고급분석 - 예측선 관련
  // -------------------------------------------------

  /**
   * 고급분석 - 예측선 활성화 여부 검사
   * @returns {boolean}
   */
  private isAnalysisPredictionEnabled(): boolean {
    return !_.isUndefined(this.widgetConfiguration.analysis) && !_.isEmpty(this.widgetConfiguration.analysis);
  }

  /**
   * 서버시에 필요없는 ui에서만 사용되는 파라미터 제거
   */
  private makeSearchQueryParam(cloneQuery): SearchQueryRequest {

    // 선반 데이터 설정
    if (cloneQuery.pivot) {
      for (let field of _.concat(cloneQuery.pivot.columns, cloneQuery.pivot.rows, cloneQuery.pivot.aggregations)) {
        delete field['field'];
        delete field['currentPivot'];
        delete field['granularity'];
        delete field['segGranularity'];
      }
    }

    // map - set shelf layers
    if (cloneQuery.shelf && cloneQuery.shelf.layers && cloneQuery.shelf.layers.length > 0) {

      cloneQuery.shelf.layers = _.remove(cloneQuery.shelf.layers, function (layer) {
        return layer['fields'].length != 0;
      });

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
    for (let idx = 0, nMax = cloneQuery.filters.length; idx < nMax; idx++) {
      cloneQuery.filters[idx] = FilterUtil.convertToServerSpec(cloneQuery.filters[idx]);
    }

    // 값이 없는 측정값 필터 제거
    cloneQuery.filters = cloneQuery.filters.filter(item => !(item.type === 'bound' && item['min'] == null));

    cloneQuery.userFields = CommonUtil.objectToArray(cloneQuery.userFields);

    return cloneQuery;
  }

  /**
   * 변경된 pivot정보에 따라서 uiOption 변경, uiOption, 선반위치 두개에 따라서 변경되므로 base-chart에서 설정되면 안됨
   */
  private setUIOptionByPivot(): UIOption {

    // 바차트일때 중첩/병렬에 따라서 uiOpino series mark값 변경
    if (this.uiOption.type == ChartType.BAR) {

      // 행선반에 dimension 값이 있는경우
      this.pivot.rows.forEach((item) => {

        // dimension이면
        if (item.type === String(ShelveFieldType.DIMENSION)) {

          // 중첩으로 series mark 설정
          this.uiOption['mark'] = BarMarkType.STACKED;
        }
      });

      // 교차선반에 dimension 값이 있는경우
      this.pivot.aggregations.forEach((item) => {

        // dimension이면
        if (item.type === String(ShelveFieldType.DIMENSION)) {

          // 병렬로 series mark 설정
          this.uiOption['mark'] = BarMarkType.MULTIPLE;
        }
      });
    }

    return this.uiOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * LNB > Data> 필드 필터로 사용되는지
   * @private
   */
  private _setUseFilter() {
    if (!this.fields) return;

    // 필터 셋팅
    let globalFilters = this.widget.dashBoard.configuration.filters;
    let chartFilters = this.widgetConfiguration.filters;

    if (!globalFilters) globalFilters = [];
    if (!chartFilters) chartFilters = [];

    const filters = globalFilters.concat(chartFilters);

    // 필드 셋팅
    const fields: Field[] = this.dimensions.concat(this.measures);

    // 값 초기화
    fields.concat(this.measures).forEach((field) => {
      field.useFilter = false;
    });

    // 필터에서 사용하고 있으면 useFilter플래그 true
    fields.concat(this.measures).forEach((field) => {
      if (field.ref) {
        if (_.findIndex(filters, {field: field.name, ref: field.ref}) > -1) {
          field.useFilter = true;
        }
      } else {
        if (_.findIndex(filters, {field: field.name}) > -1) {
          field.useFilter = true;
        }
      }
    });
  } // function - _setUseFilter

  /**
   * 글로벌 필터를 차트 필터로 변경 or 차트 필터 등록
   * @param {Filter} targetFilter
   * @param {boolean} isSetPanel
   * @private
   */
  private _setChartFilter(targetFilter: Filter, isSetPanel: boolean = true) {

    // 같은 필드의 대시보드 필터 제거
    _.remove(this.widget.dashBoard.configuration.filters, {
      field: targetFilter.field,
      dataSource: targetFilter.dataSource
    });

    // 보드 필터 설정
    if (ChartType.MAP === this.widget.configuration.chart.type) {
      this.boardFilters = this.widget.dashBoard.configuration.filters;
    } else {
      this.boardFilters = DashboardUtil.getAllFiltersDsRelations(this.widget.dashBoard, this.widget.configuration.dataSource.engineName);
    }

    // 해당 필터에 차트 위젯 아이디 설정
    targetFilter.ui.widgetId = this.isNewWidget() ? 'NEW' : this.widget.id;

    // 해당 필터를 차트 필터에 추가
    const chartFilters: Filter[] = this.widget.configuration.filters;
    const idx: number = chartFilters.findIndex(item => item.field === targetFilter.field);
    if (-1 === idx) {
      chartFilters.push(_.cloneDeep(targetFilter));
    } else {
      chartFilters[idx] = _.cloneDeep(targetFilter);
    }
    this.widget.configuration.filters = chartFilters;

    // 필터 패널에 데이터 강제 설정
    if (isSetPanel && this._filterPanelComp) {
      this._filterPanelComp.setFilters(this.boardFilters, this.widget.configuration.filters);
    }
  } // function - _setChartFilter

  /**
   * convert shelf to pivot (when convert map to other charts)
   */
  private convertShelfToPivot(pivot: Pivot, uiOption: UIOption) {

    // when shelf layers exists, pivot is null, convert shelf to pivot
    if (this.shelf.layers && this.shelf.layers[0] && this.shelf.layers[0].fields[0] && this.shelf.layers[0].fields.length > 0) {

      // init pivot
      pivot = new Pivot();

      _.each(this.shelf.layers, (layer, layerNum) => {
        let layers = layer['fields'];
        _.each(layers, (item, index) => {
          if (item.field
            && LogicalType.GEO_POINT !== item.field.logicalType
            && LogicalType.GEO_LINE !== item.field.logicalType
            && LogicalType.GEO_POLYGON !== item.field.logicalType) {

            if (item.field.pivot) {
              item.field.pivot = _.map(item.field.pivot, (pivotItem) => {
                pivotItem = FieldPivot.AGGREGATIONS;
                return pivotItem;
              });
            }

            // when it's point or heatmap, add aggregation type
            if (MapLayerType.SYMBOL === (<UIMapOption>uiOption).layers[layerNum].type ||
              MapLayerType.HEATMAP === (<UIMapOption>uiOption).layers[layerNum].type) {
              this.pagePivot.distinctPivotItems(layers, item, index, layers, 'layer' + layerNum);
            }

            pivot.aggregations.push(item);
          }
        });
      });
    }

    // init shelf
    this.shelf = new Shelf();

    return pivot;
  }

  /**
   * convert pivot to shelf (when convert other charts to map)
   */
  private convertPivotToShelf(shelf: Shelf): Shelf {

    // when shelf is empty, convert shelf from pivot
    // if (0 === shelf.layers[(<UIMapOption>this.uiOption).layerNum].length) {
    const currentLayer: ShelfLayers = shelf.layers[(<UIMapOption>this.uiOption).layerNum];
    if (!_.isUndefined(currentLayer) && 0 === currentLayer.fields.length) {

      currentLayer.ref = this.dataSource.engineName;

      // convert shelf from pivot
      _.forEach(_.cloneDeep(this.pivot), (value, key) => {
        this.pivot[key].map((item) => {

          // convert pivot type(agg, column, row) to shelf type (MAP_LAYER0 ..)
          if (item.field && item.field.pivot) {
            item.field.pivot = _.map(item.field.pivot, (pivotItem) => {
              pivotItem = FieldPivot.MAP_LAYER0;
              return pivotItem;
            });
          }

          // remove aggregation type
          delete item.aggregationType;

          currentLayer.fields.push(item);
        });
      });

      // remove duplicate measure, timestamp
      currentLayer.fields = _.uniqBy(currentLayer.fields, 'name');

      // remove duplicate measure pivot
      for (const item of currentLayer.fields) {
        item.field.pivot = _.uniq(item.field.pivot);
      }
    }

    // init pivot
    this.pivot = new Pivot();

    return shelf;
  }

  /**
   * get geoType in dimension list (map)
   */
  private getMapGeoType() {

    // find geo type from dimension list
    for (const item of this.pageDimensions) {
      if (item.logicalType && -1 !== item.logicalType.toString().indexOf('GEO')) {
        return this.geoType = item.logicalType;
      }
    }
  }

  /**
   * invalid pivot - geo column
   * @param targetPivot
   * @returns {any}
   */
  private invalidGeoData(targetPivot: AbstractField[]) {
    _.remove(targetPivot, function (item: any) {
      return !_.isUndefined(item.logicalType) && item.logicalType.toString().indexOf('GEO') != -1;
    });
    return targetPivot;
  }

  public onChangeLayer(shelf) {
    // convert pivot to shelf or shelf to pivot
    this.shelf = this.convertPivotToShelf(shelf);

    // 차트별 선반위치 변경
    this.changeDetect.detectChanges();
  }

  // public onSelectLayer(index:number) {
  //   this.mapChart.selectedLayer(index);
  //   // 차트별 선반위치 변경
  //   this.changeDetect.detectChanges();
  // }

  /**
   * remove analysis layer
   * @param value
   */
  public removeAnalysisLayer(shelf) {
    this.changeDetect.detectChanges();
    // convert pivot to shelf or shelf to pivot
    this.onChangeShelf({
      shelf: shelf,
      eventType: EventType.MAP_SPATIAL_ANALYSIS
    });
  }

}
