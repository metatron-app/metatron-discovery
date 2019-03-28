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
  Component, DoCheck, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {Widget} from '../../../domain/dashboard/widget/widget';
import {PageWidget, PageWidgetConfiguration} from 'app/domain/dashboard/widget/page-widget';
import {saveAs} from 'file-saver';
import {Alert} from '../../../common/util/alert.util';
import {ChartType, FunctionValidator} from '../../../common/component/chart/option/define/common';
import {EventBroadcaster} from '../../../common/event/event.broadcaster';
import {LayoutMode} from '../../../domain/dashboard/dashboard';
import {FilterWidgetConfiguration} from '../../../domain/dashboard/widget/filter-widget';
import {Filter} from '../../../domain/workbook/configurations/filter/filter';
import {
  InclusionFilter,
  InclusionSelectorType
} from '../../../domain/workbook/configurations/filter/inclusion-filter';
import {DashboardUtil} from '../../util/dashboard.util';
import {Datasource} from '../../../domain/datasource/datasource';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'dashboard-widget-header',
  templateUrl: './dashboard.widget.header.component.html'
})
export class DashboardWidgetHeaderComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('controlContainer')
  private controlContainer: ElementRef;

  // 차트 기능 확인기
  private _chartFuncValidator: FunctionValidator = new FunctionValidator();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input&Ouput Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public widget: Widget;

  @Input()
  public layoutMode: LayoutMode;

  @Input()
  public isShowTitle: boolean = true;    // Title 표시 여부

  @Output()
  public eventHeaderControls = new EventEmitter();

  public isEditTitle: boolean = false;     // 타이틀

  public isMiniHeader: boolean = false;  // 미니 헤더 적용 여부
  public isShowMore: boolean = false;    // 미니 헤더 More 적용 여부
  public isMissingDataSource: boolean = false;

  public limitInfo: { id: string, isShow: boolean, currentCnt: number, maxCnt: number } = {
    id: '',
    isShow: false,
    currentCnt: 0,
    maxCnt: 0
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * 화면 초기화 이후 처리
   */
  public ngAfterViewInit() {
    // Header 내 아이콘이 그러지지 않는 상황에 대한 임시 해결
    setTimeout(() => {

      if (this.isPageWidget && this.widget) {
        const pageWidgetConf:PageWidgetConfiguration = (<PageWidgetConfiguration>this.widget.configuration);
        if (ChartType.MAP === pageWidgetConf.chart.type) {
          if( pageWidgetConf.shelf.layers.some( layer => {
            return isNullOrUndefined(this.widget.dashBoard.dataSources.find( item => item.engineName === layer.ref ));
          }) ) {
            this.isMissingDataSource = true;
          }
        } else {
          const widgetDataSource: Datasource
            = DashboardUtil.getDataSourceFromBoardDataSource( this.widget.dashBoard, pageWidgetConf.dataSource );
          this.isMissingDataSource = !widgetDataSource;
        }
      } else {
        this.isMissingDataSource = false;
      }
      this.safelyDetectChanges();
    }, 200);

    // Event for Chart Limit
    this.subscriptions.push(
      this.broadCaster.on<any>('WIDGET_LIMIT_INFO').subscribe(
        (data: { id: string, isShow: boolean, currentCnt: number, maxCnt: number }) => {
          if (this.widget.id === data.id) {
            this.limitInfo = data;
            this.safelyDetectChanges();
          }
        })
    );

  } // function - ngAfterViewInit

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /**
   * 너비 변경을 체크하기 위한 작업
   * ( 너무 빈번한 호출로. 퍼포먼스 문제가 있음.. 후에 변경되어야 함 )
   */
  public ngDoCheck() {
    if (this.isEditMode()) {
      this.isMiniHeader = (300 > this.controlContainer.nativeElement.offsetWidth);
    }
  } // function - ngDoCheck

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 이름 조회
   * @return {string}
   */
  public getDataSourceName(): string {
    let strName: string = '';

    if (this.isPageWidget && this.widget) {
      const widgetConf: PageWidgetConfiguration = (<PageWidgetConfiguration>this.widget.configuration);
      if (ChartType.MAP === widgetConf.chart.type && widgetConf.shelf.layers) {
        strName = widgetConf.shelf.layers.reduce((acc, currVal) => {
          const dsInfo: Datasource = this.widget.dashBoard.dataSources.find(item => item.engineName === currVal.ref);
          if( dsInfo ) {
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
   * 범례 설정이 유효한 차트인지 여부
   * @returns {boolean}
   */
  public isValidLegend(): boolean {
    if (this.isPageWidget && this.widget) {
      const chartConf = this.widget.configuration['chart'];
      return (this._chartFuncValidator.checkUseLegendByTypeString(chartConf.type)
        && 'grid' !== (<PageWidget>this.widget).mode);
    } else {
      return false;
    }
  } // function - isValidLegend

  /**
   * 차트 필터 존재 여부
   * @return {boolean}
   */
  public existChartFilter(): boolean {
    return (this.isPageWidget && this.widget
      && (<PageWidgetConfiguration>this.widget.configuration).filters
      && 0 < (<PageWidgetConfiguration>this.widget.configuration).filters.length);
  } // function - existChartFilter

  /**
   * 차트 필터 필드 목록 반환
   * @return {string}
   */
  public getChartFilterStr(): string {
    let strFields: string = '';
    if (this.isPageWidget && this.widget && (<PageWidgetConfiguration>this.widget.configuration).filters) {
      strFields = (<PageWidgetConfiguration>this.widget.configuration).filters.map(item => item.field).join(',');
    }
    return strFields;
  } // function - getChartFilterStr

  /**
   * 미니맵 설정이 유효한 차트인지 여부
   * @returns {boolean}
   */
  public isValidMiniMap(): boolean {
    if (this.isPageWidget && this.widget) {
      const chartConf = this.widget.configuration['chart'];
      return (this._chartFuncValidator.checkUseMiniMapByTypeString(chartConf.type)
        && 'grid' !== (<PageWidget>this.widget).mode);
    } else {
      return false;
    }
  } // function - isValidMiniMap

  /**
   * 범례 표시 여부
   * @returns {boolean}
   */
  public isShowLegend(): boolean {
    // if( this.widget ) {
    //   const chartConf = this.widget.configuration['chart'];
    //   return ( chartConf && chartConf.legend && 'grid' !== chartConf.type) ? chartConf.legend.auto : false;
    // } else {
    //   return false;
    // }
    return this.widget.configuration['chart'].legend.auto;
  } // function - isShowLegend

  /**
   * 미니맵 표시 여부
   * @returns {boolean}
   */
  public isShowMiniMap(): boolean {
    if (this.widget) {
      const chartConf = this.widget.configuration['chart'];
      return (chartConf && chartConf.chartZooms && 'grid' !== chartConf.type && chartConf.chartZooms) ? chartConf.chartZooms[0].auto : false;
    } else {
      return false;
    }
  } // function - isShowMiniMap

  /**
   * 이름 편집 모드로 변경
   * @param {MouseEvent} $event
   */
  public editModeName($event: MouseEvent) {
    $event.stopImmediatePropagation();
    this.isEditTitle = true;
    this.changeDetect.detectChanges();
  } // function - editModeName

  /**
   * 이름 변경 등록
   * @param {string} inputName
   */
  public changeWidgetName(inputName: string) {
    this.isEditTitle = false;
    inputName = inputName ? inputName.trim() : '';
    if (inputName && 0 < inputName.length) {
      this.widget.name = inputName;
      this.broadCaster.broadcast('WIDGET_CHANGE_TITLE', {
        widgetId: this.widget.id,
        value: inputName
      });
    } else {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.empty'));
    }
  } // function - changeWidgetName

  /**
   * 그리드 모드의 차트위젯 여부
   */
  public get isGridModePageWidget() {
    return (this.widget) ? 'grid' === (<PageWidget>this.widget).mode : false;
  } // function - isGridModePageWidget

  /**
   * 페이지 위젯 여부
   * @returns {boolean}
   */
  public get isPageWidget(): boolean {
    return (this.widget) ? 'page' === this.widget.type : false;
  } // function - isPageWidget

  /**
   * Dimension 필터 위젯 여부
   * @returns {boolean}
   */
  public get isDimensionFilterWidget(): boolean {
    return (this.widget
      && 'filter' === this.widget.type
      && 'include' === (<FilterWidgetConfiguration>this.widget.configuration).filter.type);
  } // function - isDimensionFilterWidget

  /**
   * List 형태 여부 - Dimension Filter
   * @return {boolean}
   */
  public get isListDimensionFilter(): boolean {
    const filter: Filter = (<FilterWidgetConfiguration>this.widget.configuration).filter;
    if ('include' === filter.type) {
      const selector: InclusionSelectorType = (<InclusionFilter>filter).selector;
      return -1 < selector.toString().indexOf('LIST');
    } else {
      return false;
    }
  } // function - isListDimensionFilter

  /**
   * 텍스트 위젯 여부
   * @returns {boolean}
   */
  public get isTextWidget(): boolean {
    return (this.widget) ? 'text' === this.widget.type : false;
  } // function - isTextWidget

  /**
   * 편집 모드 여부를 반환한다.
   * @returns {boolean}
   */
  public isEditMode(): boolean {
    return this.layoutMode === LayoutMode.EDIT;
  } // function - siEditMode

  /**
   * 제목 표시 변경
   */
  public toggleTitle() {
    this.isShowTitle = !this.isShowTitle;
    this.broadCaster.broadcast('TOGGLE_TITLE', {
      widgetId: this.widget.id,
      widgetType: this.widget.type,
      mode: this.isShowTitle
    });
  } // function - toggleTitle

  /**
   * 범례 표시 변경
   */
  public toggleLegend() {
    this.broadCaster.broadcast('TOGGLE_LEGEND', {widgetId: this.widget.id});
  } // function - toggleLegend

  /**
   * 미니맵 표시 변경
   */
  public toggleMiniMap() {
    this.broadCaster.broadcast('TOGGLE_MINIMAP', {widgetId: this.widget.id});
  } // function - toggleMiniMap

  /**
   * 위젯 수정
   */
  public editWidget() {
    if (this.isMissingDataSource) {
      Alert.warning(this.translateService.instant('msg.board.alert.can-not-edit-missing-datasource'));
      return;
    }
    this.broadCaster.broadcast('EDIT_WIDGET', {widgetId: this.widget.id, widgetType: this.widget.type});
  } // function - editWidget

  /**
   * 위젯 복제
   */
  public copyPageWidget() {
    if (this.isMissingDataSource) {
      Alert.warning(this.translateService.instant('msg.board.alert.can-not-copy-missing-datasource'));
      return;
    }
    this.broadCaster.broadcast('COPY_WIDGET', {widgetId: this.widget.id});
  } // function - copyPageWidget

  /**
   * 위젯 모드 변경
   * @param {string} mode
   */
  public onChangeWidgetMode(mode: string) {
    if (this.isPageWidget) {
      (<PageWidget>this.widget).mode = mode;
      this.broadCaster.broadcast('CHANGE_MODE', {widgetId: this.widget.id, mode: mode});
    }
  } // function - onChangeWidgetMode

  /**
   * 위젯 삭제
   */
  public removeWidget() {
    this.broadCaster.broadcast('REMOVE', {widgetId: this.widget.id, widgetType: this.widget.type});
  } // function - removeWidget

  /**
   * 그리드 버튼 표시 여부
   * @param {PageWidget} widget
   * @returns {boolean}
   */
  public isAvailableGrid(widget: PageWidget) {
    const chartType = (<PageWidgetConfiguration>widget.configuration).chart.type.toString();
    const invalidChart = ['grid', 'scatter', 'pie'];
    return (-1 === invalidChart.indexOf(chartType));
  } // function - isAvailableGrid

  /**
   * Dimension Filter 의 Selector Type - List 로 변경
   */
  public setSelectorTypeList() {
    const filter: Filter = (<FilterWidgetConfiguration>this.widget.configuration).filter;
    if ('include' === filter.type) {
      let selector: InclusionSelectorType = (<InclusionFilter>filter).selector;
      switch (selector) {
        case InclusionSelectorType.SINGLE_LIST :
        case InclusionSelectorType.SINGLE_COMBO :
          (<InclusionFilter>filter).selector = InclusionSelectorType.SINGLE_LIST;
          break;
        case InclusionSelectorType.MULTI_LIST :
        case InclusionSelectorType.MULTI_COMBO :
          (<InclusionFilter>filter).selector = InclusionSelectorType.MULTI_LIST;
          break;
      }
      (<FilterWidgetConfiguration>this.widget.configuration).filter = filter;
      this.broadCaster.broadcast('CHANGE_FILTER_SELECTOR', {widget: this.widget, filter: filter});
    }
  } // function - setSelectorTypeList

  /**
   * Dimension Filter 의 Selector Type - Combo 로 변경
   */
  public setSelectorTypeCombo() {
    const filter: Filter = (<FilterWidgetConfiguration>this.widget.configuration).filter;
    if ('include' === filter.type) {
      let selector: InclusionSelectorType = (<InclusionFilter>filter).selector;
      switch (selector) {
        case InclusionSelectorType.SINGLE_LIST :
        case InclusionSelectorType.SINGLE_COMBO :
          (<InclusionFilter>filter).selector = InclusionSelectorType.SINGLE_COMBO;
          break;
        case InclusionSelectorType.MULTI_LIST :
        case InclusionSelectorType.MULTI_COMBO :
          (<InclusionFilter>filter).selector = InclusionSelectorType.MULTI_COMBO;
          break;
      }
      (<FilterWidgetConfiguration>this.widget.configuration).filter = filter;
      this.broadCaster.broadcast('CHANGE_FILTER_SELECTOR', {widget: this.widget, filter: filter});
    }
  } // function - setSelectorTypeCombo

  /**
   * 추가 설정 레이어 표시 On/Off
   */
  public toggleDisplayMoreLayer() {
    this.isShowMore = !this.isShowMore;
    if (this.isShowMore) {
      this.mouseOverHeader();
    } else {
      this.mouseOutHeader(true);
    }
  } // function - toggleDisplayMoreLayer

  /**
   * Header 에 마우스 오버 했을 때의 동작
   */
  public mouseOverHeader() {
    if (0 === $('.sys-widget-header-layer:visible').length) {
      this.$element.closest('.lm_header')
        .attr('style', 'display: block; height: 25px; z-index:21 !important;');
    }
  } // function - mouseOverHeader

  /**
   * Header 에 마우스 아웃 했을 때의 상황
   */
  public mouseOutHeader(isForce: boolean = false) {
    if (isForce || !this.isShowMore) {
      this.$element.closest('.lm_header')
        .attr('style', 'display: block; height: 25px;');
      this.isShowMore = false;
    }
  } // function - mouseOutHeader

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
