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

import * as $ from 'jquery';
import * as _ from 'lodash';
import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Injector, Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ScrollLoadingGridModel } from './scroll-loading-grid.model';
import { isNull, isNullOrUndefined, isUndefined } from 'util';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { header, SlickGridHeader } from '../../../../../../common/component/grid/grid.header';
import { DataflowService } from '../../../../service/dataflow.service';
import { HeaderMenu } from '../../../../../../common/component/grid/grid.header.menu';
import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import { ScrollLoadingGridComponent } from './scroll-loading-grid.component';
import { GridOption } from '../../../../../../common/component/grid/grid.option';
import { RuleContextMenuComponent } from '../rule-context-menu.component';
import { PreparationAlert } from '../../../../../util/preparation-alert.util';
import { EventBroadcaster } from '../../../../../../common/event/event.broadcaster';
import {CommonUtil} from "../../../../../../common/util/common.util";

declare const moment: any;
declare const echarts: any;

@Component({
  selector: 'edit-rule-grid',
  templateUrl: 'edit-rule-grid.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class EditRuleGridComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(ScrollLoadingGridComponent)
  private _gridComp: ScrollLoadingGridComponent;

  @ViewChild(RuleContextMenuComponent)
  private _contextMenuComp: RuleContextMenuComponent;

  // Grid
  private _$gridElm: any;                     // 그리드 jQuery Element
  private _apiGridData: any;                  // API로 받은 그리드 정보 ( gridResponse )
  private _gridData: GridData;                // 그리드 정보 ( 필드, 데이터 )
  private _selectedRows: any = [];            // 그리드에서 선택된 로우 리스트
  private _selectedColumns: string[] = [];    // 그리드에서 선택된 컬럼 리스트
  private _savedViewPort: { top: number, left: number };

  // private _selectedBarChartRows: string[] = [];

  // Histogram
  private _charts: any = [];
  private _defaultChartOption: any;
  private _clickedSeries = {};
  private _barClickedSeries = {};

  private _hoverHistogramData: string;  // Hover 했을 때 보여지는 데이타
  private _hoverHistogramIndo: any = {}; // Hover 했을 때 해당 Chart data 할당

  private readonly _HISTOGRAM_DEFAULT_COLOR: string = '#c1cef1';
  private readonly _HISTOGRAM_HOVER_COLOR: string = '#9aa5c1';
  private readonly _HISTOGRAM_CLICK_COLOR: string = '#666eb2';

  // Bar chart
  private _barCharts: any = [];
  private readonly _BARCHART_MISSING_COLOR: string = '#4b515b';
  private readonly _BARCHART_MISSING_CLICK_COLOR: string = '#25292f';
  private readonly _BARCHART_MISSING_HOVER_COLOR: string = '#3c4149';
  private readonly _BARCHART_MISMATCH_COLOR: string = '#dc494f';
  private readonly _BARCHART_MISMATCH_CLICK_COLOR: string = '#9b252a';
  private readonly _BARCHART_MISMATCH_HOVER_COLOR: string = '#b03a3f';

  private cntBatchEvent:number = 0;

  public barChartTooltipPosition: string;
  public barChartTooltipShow: boolean = false;
  public barChartTooltipValue: string;
  public barChartTooltipIndex: number;
  public barChartTooltipLabel: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public searchText: string = '';        // 그리드 검색어

  // 컬럼 정보
  public columnWidths: ColumnWidth;       // 컴럼별 너비 정보
  public totalColumnCnt: number = 0;      // 그리드 column 구성
  public totalRowCnt: number = 0;         // 전체 조회 행수
  public columnTypeCnt: number = 0;       // 전체 컬럼 type 갯수
  // public columnTypeList: string[] = [];   // 전체 컬럼 type list
  public columnTypeList : any;

  // T/F
  public isShowColumnTypes: boolean = false;
  public isApiMode: boolean = true;
  public isComboEvent: boolean = false;  // 콤보박스 이벤트 실행중 여부

  public ruleIdx: number;
  public dataSetId: string;

  // 공백 치환 관련
  public spaceSymbol = '&middot;';

  @Input()
  public isAggregationIncluded: boolean;

  @Output('selectHeader')
  public selectHeaderEvent: EventEmitter<any> = new EventEmitter();

  @Output('selectContextMenu')
  public selectContextMenuEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('typeListElement')
  public typeListElement: ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataflowService: DataflowService,
              private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
    this._gridData = new GridData();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();

    // 콤보박스 아이템 선택에 대한 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('EDIT_RULE_COMBO_SEL')
        .subscribe((data: { id: string, isSelectOrToggle: boolean | string, isMulti: boolean }) => {
          this.isComboEvent = true;
          (data.isMulti) || (this.unSelectionAll('COL'));
          this.selectColumn(data.id, data.isSelectOrToggle);
          this.isComboEvent = false;
        })
    );



  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 초기 설정
   * @param {string} dsId
   * @param {string} params (if OP is 'UPDATE' disable context menu)
   */
  public init(dsId: string, params : any) {

    this.dataSetId = dsId;
    let method : string = 'get';

    // ruleIdx is unnecessary in undo and redo
    if ('UNDO' === params['op'] || 'REDO' === params['op']) {
      delete params['ruleIdx']
    }

    if ('INITIAL' === params['op'] || 'PREPARE_UPDATE' === params['op']) {
      delete params['op']
    } else {
      method = 'put';
    }

    // if(this._gridComp!=null){try{this._gridComp.getGridCore().scrollRowIntoView(0);}catch (error){}}
    return this.dataflowService.transformAction(this.dataSetId, method, params).then(data => {
      // 데이터 초기화
      {

        // Grid
        this._apiGridData = data['gridResponse'];
        this._$gridElm = null;
        this._gridData = null;
        this._selectedRows = [];
        this._selectedColumns = [];



        // Histogram
        this._charts = [];
        this._barCharts = [];
        this._defaultChartOption = null;
        this._clickedSeries = {};
        this._hoverHistogramData = '';  // Hover 했을 때 보여지는 데이타
        this._hoverHistogramIndo = {};  // Hover 했을 때 해당 Chart data 할당

        this.searchText = '';

        // 컬럼 정보
        this.columnWidths = null;       // 컴럼별 너비 정보
        this.totalColumnCnt = 0;      // 그리드 column 구성
        this.totalRowCnt = 0;         // 전체 조회 행수
        this.columnTypeCnt = 0;       // 전체 컬럼 type 갯수
        this.columnTypeList = [];   // 전체 컬럼 type list

        // T/F
        this.isShowColumnTypes = false;

      }
      // 룰 index
      this.ruleIdx = data.ruleCurIdx;

      // 그리드 데이터 생성
      const gridData: GridData = this._getGridDataFromGridResponse(this._apiGridData);
      this._gridData = gridData;


      // Column Width 설정
      // (this.columnWidths) || (this.columnWidths = {});
      // this.columnWidths = this._setColumnWidthInfo(this.columnWidths, this._apiGridData.colNames, gridData);

      const colTypes = [];
      const colNameTypes = [];
      this._apiGridData.colDescs.forEach( item =>{ colTypes.push(item.type);});
      this._apiGridData.colNames.forEach((item, i)=>{
        let obj = { colname :null, coltype : null};
        obj.colname = item;
        obj.coltype = colTypes[i];
        colNameTypes.push(obj);
        obj = { colname :null, coltype : null};
      });
      // Column Width 설정
      (this.columnWidths) || (this.columnWidths = {});
      this.columnWidths = this._setColumnWidthInfo(this.columnWidths, colNameTypes, gridData);

      // 클릭 시리즈 정보 초기화
      this._apiGridData.colNames.forEach((item, index) => {
        this._clickedSeries[index] = [];
        this._barClickedSeries[index] = [];
      });

      // 그리드 생성
      gridData.fields.forEach(field => field.isHover = false);

      // 히스토그램 정보 설정
      return this._getHistogramInfoByWidths(this.columnWidths, gridData.fields.length).then(() => {
        this._renderGrid(gridData, this.ruleIdx, data.totalRowCnt);
        // 그리드 요약 정보 설정
        this._summaryGridInfo(gridData);
        this.totalRowCnt = data.totalRowCnt;
        return {
          apiData: data,
          gridData: gridData
        };
      });

    }).catch((error) => {
      this.loadingHide();
      return {
        error : error
      };
    });

  } // function - init


  /**
   * Type list show/hide
   * @param {Event} event
   */
  public toggleShowColumnTypes(event) {

    if (event.target.tagName !== 'A') { // Not sure if this is a good idea..
      this.isShowColumnTypes = !this.isShowColumnTypes;
    }

  } // function - toggleShowColumnTypes

  //noinspection JSUnusedGlobalSymbols
  /**
   * Scroll 위치 강제 조정
   * @param {string} column 선택된 컬럼 위치에 따라 스크롤 위치 수정
   * @private
   */
  public moveScrollHorizontally(column: string) {

    // 스크롤을 강제적으로 주는것
    const colIdx: number = this._gridData.fields.findIndex(item => item.uuid === column);
    (-1 < colIdx) && (this._gridComp.getGridCore().scrollCellIntoView(0, colIdx + 1));

  } // function - moveScrollHorizontally

  /**
   * Select column
   * @param {string} id - uuid
   * @param {boolean | string} isSelectOrToggle
   * @param {string} type
   */
  public selectColumn(id: string, isSelectOrToggle: boolean | string, type?: string) {
    this._gridComp.selectColumn(id, isSelectOrToggle, type);
  } // function - selectColumn

  /**
   * 그리드 선택을 전부 취소한다.
   * @param {string} direction
   */
  public unSelectionAll(direction?: string) {
    // 선택된 컬럼이 있다면 클리어 한다.
    if (!isNull(this._gridComp.getGridCore())) {
      switch (direction) {
        case 'COL' :
          if (this._selectedColumns.length > 0) {
            this._gridComp.columnAllUnSelection();
            this._selectedColumns = [];
          }
          break;
        case 'ROW' :
          if (0 < this._selectedRows.length) {
            this._gridComp.rowAllUnSelection();
            this._selectedRows = [];
          }
          break;
        default :
          if (0 < this._selectedRows.length) {
            this._gridComp.rowAllUnSelection();
            this._selectedRows = [];
          }
          if (this._selectedColumns.length > 0) {
            this._gridComp.columnAllUnSelection();
            this._selectedColumns = [];
          }
      }
    }
  } // function - unSelectionAll


  /**
   * Rule 적용에 영향 받는 컬럼 설정
   * @param {any[]} cols
   * @param {string} command
   */
  public setAffectedColumns(cols: any[], command: string) {

    const singleSelectionMap: string[] = ['derive'];
    const multiSelectionMap: string[] = ['aggregate', 'unpivot', 'pivot', 'drop', 'rename', 'sort', 'nest', 'window',
      'merge', 'split', 'unnest', 'extract', 'countpattern', 'replace', 'settype', 'flatten', 'set', 'move', 'join', 'setformat'];

    if (-1 < singleSelectionMap.indexOf(command)) {
      this._gridComp.getGridCore().scrollCellIntoView(0, this._findSmallestIndex(cols[0]) + 1);
      if ('' !== this.getColumnUUIDByColumnName(cols[0])) {
        this.selectColumn(this.getColumnUUIDByColumnName(cols[0]), true);
      }
    } else if (-1 < multiSelectionMap.indexOf(command)) {
      cols.forEach((item) => {
        this.selectColumn(this.getColumnUUIDByColumnName(item), true);
      });
      this._gridComp.getGridCore().scrollCellIntoView(0, this._findSmallestIndex(cols) + 1);
    }

  } // function - setAffectedColumns

  /**
   * 스크롤 위치를 저장한다.
   */
  public savePosition() {
    const viewPort = this._$gridElm.find('.slick-viewport').get(0);
    this._savedViewPort = {
      top: viewPort.scrollTop,
      left: viewPort.scrollLeft
    };
  } // function - savePosition

  /**
   * 저장된 스크롤 위치로 이동한다.
   */
  public moveToSavedPosition() {
    const $viewPort = this._$gridElm.find('.slick-viewport');
    $viewPort.scrollTop(this._savedViewPort.top);
    $viewPort.scrollLeft(this._savedViewPort.left);
  } // function - moveToSavedPosition

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - Grid Event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 그리드 검색
   * @param {boolean} isReset
   */
  public searchGrid(isReset: boolean = false) {
    (isReset) && (this.searchText = '');


    this._gridComp.getGridCore().scrollRowIntoView(0);
    this._selectedRows = [];
    this._rowClickHandler(this._selectedRows);

    // 현재 선택되어있는 바 차트 refresh
    let options_bar;
    let chartIndex = -1;
    Object.keys(this._barClickedSeries).forEach((key, index) => {
      if (this._barClickedSeries[key].length > 0) {
        chartIndex = index;
      }
    });
    if (chartIndex !== -1) {
      this._barClickedSeries[chartIndex] = [];
      options_bar = this._getDefaultBarChartOption(this._getHistogramInfo(chartIndex), chartIndex);
      this._applyChart(this._barCharts[chartIndex], options_bar)
    }

    // 히스토그램 바 refresh.
    let options;
    this._apiGridData.colNames.forEach((item, index) => {
      if (this._clickedSeries[index].length > 0) {
        this._clickedSeries[index] = [];
        options = this._getDefaultChartOption(this._getHistogramInfo(index), index);
        this._applyChart(this._charts[index], options)
      }
    });


    // 그리드  검색
    this._gridComp.search(this.searchText);
  } // function - searchGrid

  /**
   * 헤더 클릭 이벤트
   * @param {{ id: string, isSelect: boolean, selectColumnIds: string[], shiftKey: boolean, ctrlKey: boolean, batchCount: number }} data
   */
  public gridHeaderClickHandler(
    data: { id: string, isSelect: boolean, selectColumnIds: string[], shiftKey: boolean, ctrlKey: boolean, batchCount: number }
  ) {

    // 선택되어있던 Row unselect !
    if (this._gridComp.getSelectedRows().length > 0) {
      for (let i in this._clickedSeries) {
        if (this._clickedSeries[i].length > 0) {
          this._clickedSeries[i] = [];
          let options = this._getDefaultChartOption(this._getHistogramInfo(i), i);
          this._applyChart(this._charts[i], options)
        }
      }
      for (let i in this._barClickedSeries) {
        if (this._barClickedSeries[i].length > 0) {
          this._barClickedSeries[i] = [];
          let options = this._getDefaultBarChartOption(this._getHistogramInfo(i), i);
          this._applyChart(this._barCharts[i], options)
        }
      }
      this._gridComp.rowAllUnSelection();
      this._selectedRows = [];

    }

    // let list = this._gridData.fields.map((item) => {
    //   return this.escapedName(item.name);
    // });

    // Only use data.id when data.id exists in this_gridData.fields
    const idx: number = this._gridData.fields.findIndex(orgItem => orgItem.uuid === data.id);
    if (-1 === idx) {
      return;
    } else {
      let selectedDiv = this.$element.find('.slick-header-columns').children()[idx + 1];

      if (data.isSelect) {
        selectedDiv.setAttribute('style', 'background-color : #d6d9f1; width : ' + selectedDiv.style.width);
      } else {
        selectedDiv.setAttribute('style', 'background-color : ; width : ' + selectedDiv.style.width);
      }
    }

    // selected columns
    this._selectedColumns = [];
    // use only data.selectedColumnIds that exists in this_gridData.fields
    data.selectColumnIds.forEach((item) => {
      const idx: number = this._gridData.fields.findIndex(orgItem => orgItem.uuid === item);
      if (-1 !== idx) {
        this._selectedColumns.push(item);
      }
    });

    // 이벤트 전파
    this.selectHeaderEvent.emit(
      {
        id: data.id,
        isSelect: data.isSelect,
        columns: this._selectedColumns,
        fields: this._gridData.fields
      }
    );

    if (data.shiftKey) {
      this._onShiftKeyPressedSelectColumn(data);
    } if (!this.isComboEvent) {
      if( data.batchCount && 0 < data.batchCount) {
        this.cntBatchEvent++;
        if( data.batchCount === this.cntBatchEvent ) {
          this.broadCaster.broadcast('EDIT_RULE_GRID_SEL_COL', {
            selectedColIds: this._selectedColumns,
            fields: this._gridData.fields
          });
          this.cntBatchEvent = 0;
        }
      } else {
        this.cntBatchEvent = 0;
        this.broadCaster.broadcast('EDIT_RULE_GRID_SEL_COL', {
          selectedColIds: this._selectedColumns,
          fields: this._gridData.fields
        });
      }
    }

  } // function - gridHeaderClickHandler


  /**
   * When row is clicked
   * @param event
   */
  public gridRowClickHandler(event) {

    // 컬럼이 선택되어 있다면 all unsel
    if (this._selectedColumns.length > 0) {
      this._gridComp.columnAllUnSelection();
    }

    // 현재 선택되어있는 바 차트 refresh
    let options_bar;
    let chartIndex = -1;
    Object.keys(this._barClickedSeries).forEach((key, index) => {
      if (this._barClickedSeries[key].length > 0) {
        chartIndex = index;
      }
    });
    if (chartIndex !== -1) {
      this._barClickedSeries[chartIndex] = [];
      // this.unSelectionAll('ROW');
      options_bar = this._getDefaultBarChartOption(this._getHistogramInfo(chartIndex), chartIndex);
      this._applyChart(this._barCharts[chartIndex], options_bar)
    }



    // cell이 선택 했을 때 선택 되어있던 히스토그램 바 refresh.
    // if (event.selected === null) {
    let options;
    this._apiGridData.colNames.forEach((item, index) => {
      if (this._clickedSeries[index].length > 0) {
        this._clickedSeries[index] = [];
        options = this._getDefaultChartOption(this._getHistogramInfo(index), index);
        this._applyChart(this._charts[index], options)
      }
    });
    this._selectedRows = [];
    // }

    if (event.event.shiftKey) {
      this._onShiftKeyPressedSelectRow(event.event, event.row);
    }
  } // function - gridRowClickHandler


  /**
   * Draw histogram when width is changed
   * @param data {any} - {idx : array index, name : 컬럼 이름, width : 변경된 컬럼 width}
   */
  public drawChart(data) {

    if (this.columnWidths[data.field]) { // 바뀐 컬럼 width overwrite
      this.columnWidths[data.field] = data.width
    }

    // 첫번째 컬럼은 해당 안됨
    if (data.name === ScrollLoadingGridComponent.ID_PROPERTY) {
      return;
    }

    // 히스토그램 redraw
    this._getDistinctHistogram({
      dsId: this.dataSetId
      , columnIndex: this._apiGridData.colNames.indexOf(data.field)
      , columnWidth: data.width
      , chartIndex: data.idx - 1
      , columnName: data.field
      , uuid : data.uuid
    });

  } // function - drawChart



  /**
   * 전체 컨텍스트 메뉴 close
   * @param event
   */
  public gridAllContextClose(): void {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : false } );
  }

  /**
   * 컨텍스트 메뉴 클릭
   * @param data
   */
  public onContextMenuClick(data) {

    let columnUUID: string = '';
    if ('' !== this.getColumnUUIDByColumnName(data.columnName)) {
      columnUUID = this.getColumnUUIDByColumnName(data.columnName);
    } else {
      return;
    }

    let param: any = {};

    // 컨텍스트 메뉴 클릭시 헤더가 클릭 되게 변경 단, row가 선택되어있으면 컬럼 선택 안됨(전체 해제 -> 컬럼 선택)
    if (this._selectedColumns.length > 1) {
      this.selectColumn(columnUUID, true, data.columnType);
    } else if (0 === this._barClickedSeries[data.index].length && 0 === this._clickedSeries[data.index].length) {
      this.unSelectionAll('COL');
      this.selectColumn(columnUUID, true, data.columnType);
    } else { // histogram 이 클릭 되어 있는 상태
      param['selected'] = [columnUUID];
    }

    const currentContextMenuInfo = {
      columnType: data.columnType,
      columnName: data.columnName,
      columnId : columnUUID,
      index: data.index,
      top: data.top,
      left: data.left,
      gridResponse: _.cloneDeep(this._apiGridData)
    };

    if (data.timestampStyle) {
      currentContextMenuInfo['timestampStyle'] = data.timestampStyle;
    }

    Object.keys(this._clickedSeries).forEach((key, index) => {
      if (this._clickedSeries[key].length >= 1 && index === data.index) {
        param['clickable']= true;
        param['values'] = this._clickedSeries[key];
      }
    });

    Object.keys(this._barClickedSeries).forEach((key, index) => {
      if (this._barClickedSeries[key].length >= 1 && index === data.index) {
        param['clickable']= true;
        param['values'] = this._barClickedSeries[key];
        param['isColumnSelect'] = true;
      }
    });

    if (param.clickable) {
      param['labels'] = this._apiGridData.colHists[data.index].labels;
    }

    this._contextMenuComp.openContextMenu({contextInfo : currentContextMenuInfo, fields : this._gridData.fields.map((item) => item.uuid), selectedColumnIds : this._selectedColumns , params : param });
  } // function - onContextMenuClick

  // noinspection JSMethodCanBeStatic
  /**
   * Grid component 안에 있는 onHeaderRowCellRendered 가 일어났을때 아래 로직 적용
   * @param {{column: any, grid: any, node: any}} args
   */
  public onHeaderRowCellRendered(args: { column: any, grid: any, node: any }) {

    let uuid = args.column.id;
    let name = args.column.field;

    if (uuid !== ScrollLoadingGridComponent.ID_PROPERTY) {
      $('<div></div>')
        .attr('id', 'barChart_' + uuid)
        .css({
          'width': args.column.width + 'px',
          'height': '15px',
        })
        .appendTo(args.node);
      $('<div></div>')
        .attr('id', 'histogram_' + uuid)
        .css({ 'width': args.column.width + 'px', 'height': '45px' })
        .appendTo(args.node);
      $('<div></div>')
        .attr('id', uuid)
        .css({
          'width': args.column.width + 'px',
          'height': '30px',
          'border-top': '1px solid #ebebed',
          'line-height': '29px',
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
          'overflow': 'hidden',
          'paddingLeft' : '9px',
          'paddingRight' : '9px',
          'box-sizing' :'border-box'
        })
        .appendTo(args.node);

      let index = this._apiGridData.colNames.indexOf(name);
      let chart = echarts.init(document.getElementById('histogram_' + uuid));
      let barChart = echarts.init(document.getElementById('barChart_' + uuid));

      this._charts.push(chart);
      this._barCharts.push(barChart);

      this._drawChartsByColumn({ chart1: chart, chart2: barChart, index: index });

      this._histogramMouseEvent(chart, uuid, this._getHistogramInfo(index), index);
      if (!isNullOrUndefined(this._getHistogramInfo(index))) {
        this._barChartHoverEvent(barChart, index);
        this._barChartClickEvent(barChart, this._getHistogramInfo(index), index);
      }
    } else {
      $('<div></div>')
        .attr('id', 'firstColumn')
        .css({ 'height': '90px' })
        .appendTo(args.node); //75
    }
  } // function - onHeaderRowCellRendered


  /**
   * Grid 검색 초기화 (Histogram 또는 Bar chart click 한 경우)
   * @private
   */
  private searchProcessReset(): void {
    // if(searchText)
    this.searchText = '';
    try{
      this._gridComp.getGridCore().scrollRowIntoView(0);
      this._gridComp.searchProcessReset();
    }catch (error) {}
  }

  /**
   * Resizing grid outside of this component
   */
  public resizeGrid() {
    return this._gridComp.resize();
  }


  public getColumnUUIDByColumnName(name : string) : string {

    let uuid : string = '';

    let idx = this._gridData.fields.findIndex((item) => {
      return item.name === name;
    });

    if (idx !== -1) {
      uuid = this._gridData.fields[idx].uuid;
    }

    return uuid;
  }


  /**
   * 컬럼별로 히스토그램, 바차트 그리기
   * @param {any} data
   * @private
   */
  private _drawChartsByColumn(data: { chart1: any, chart2: any, index: number }) {
    let histogramInfo = this._getHistogramInfo(data.index);
    try {
      this._applyChart(data.chart1, this._getDefaultChartOption(histogramInfo, data.index));
      this._applyChart(data.chart2, this._getDefaultBarChartOption(histogramInfo, data.index));
    } catch (e) {
      console.error(e);
    }
    // this._histogramMouseEvent(data.chart1, name, histogramInfo,data.index);
    //
    // this._barChartHoverEvent(data.chart2, name, histogramInfo, data.index);
    // this._barChartClickEvent(data.chart2, histogramInfo, data.index);
  } // function - _drawChartsByColumn

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - Context Menu Event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Context Menu Rule 적용 이벤트
   * @param data
   */
  public applyRuleFromContextMenu(data) {

    if (data.more) {
      this._gridComp.columnAllUnSelection();

      const singleSelectionMap: string[] = ['rename', 'unnest'];
      const multiSelectionMap: string[] = ['merge', 'replace', 'set', 'nest', 'settype', 'setformat', 'move', 'countpattern', 'extract', 'split'];

      if (-1 < singleSelectionMap.indexOf(data.more.command)) {
        this._gridComp.selectColumn(data.more.col.value[0], true);
      } else if (-1 < multiSelectionMap.indexOf(data.more.command)) {
        this._selectedColumns = data.more.col.value;
        // let originalSelectedDatasets = _.cloneDeep(this._selectedColumns);
        // let idx = originalSelectedDatasets.indexOf(data.more.col);
        // if (idx === -1) {
        //   originalSelectedDatasets.push(data.more.col);
        // }
        this._selectedColumns.forEach((item) => {
          this._gridComp.selectColumn(item, true);
        });
      } else if ('derive' === data.more.command) {
        this._selectedRows = [];
      }
    }

    this.selectContextMenuEvent.emit(data);

  } // function - applyRuleFromContextMenu


  /**
   * Returns selected columns
   * @returns {string[]}
   */
  public getSelectedColumns(): string[] {
    return this._selectedColumns;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Util Method - 추후 Util 로 빠져야 하는 메서드 모음
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * 큰 숫자 축약 문자 사용
   * @param {number} from
   * @param {number} to
   * @return string
   */
  private _getAbbrNumberRange(from: number, to: number): string {

    // TODO : Negative numbers

    let returnVal: string;
    let fromReversedList = from.toString().split('').reverse();
    let toReversedList = to.toString().split('').reverse();

    let idx;
    if (from == 0) {
      idx = this._findUnitIdx(toReversedList);
    } else {
      idx = Math.min(this._findUnitIdx(fromReversedList), this._findUnitIdx(toReversedList));
    }

    if (-1 === idx || Math.floor(idx / 3) === 0) {
      returnVal = `${from} ~ ${to}`;
    } else {
      returnVal = `${ from == 0 ? 0 : this._getAbbrNumber(fromReversedList, idx) } ~ ${this._getAbbrNumber(toReversedList, idx)}`;
    }

    return returnVal;
  } // function - _abbrNum


  /**
   * 축약된 숫자를 얻어온다 eg) 15K
   * @param numberList
   * @param idx
   * @return {string}
   * @private
   */
  private _getAbbrNumber(numberList, idx): string {
    const abbrLetters: any = ['K', 'M', 'B', 'T'];
    numberList.splice(0, Math.floor(idx / 3) * 3);
    return numberList.reverse().join('') + abbrLetters[Math.floor(idx / 3) - 1];
  }

  /**
   * List에서 가장 처음 0 이 아닌 숫자의 index를 찾는다
   * @param list
   * @return {number}
   * @private
   */
  private _findUnitIdx(list: any): number {

    return list.findIndex((item) => {
      return item !== '0'
    });

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - for Chart
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * 차트 변경 사항 적용
   * @param chart
   * @param option
   * @private
   */
  private _applyChart(chart: any, option: any) {
    chart.setOption(option);
  } // function - _applyChart

  /**
   * Get histogram info from this.dataSet.histogram
   * @param index
   * @private
   */
  private _getHistogramInfo(index): any {
    return this._apiGridData.colHists[index];
    // return this.dataSet.histogram[index];
  } // function - _getHistogramInfo

  /**
   * get Histogram info with col widths
   * @param colWidths
   * @param fieldLength {number}
   * @param isInitialLoad 처음 그리드 로드 여부
   * @param isEditMode 편집 모드 여부
   * @private
   */
  private _getHistogramInfoByWidths(colWidths, fieldLength: number): Promise<any> {

    let widths = Object.keys(colWidths).map((i) => {
      return colWidths[i]
    });

    let colnos = Array.from(Array(fieldLength).keys());
    let params = {
      colnos: colnos,
      colWidths: widths,
      ruleIdx: this.ruleIdx
    };

    return this.dataflowService.getHistogramInfo(this.dataSetId, params).then((result) => {
      if (result.colHists) {
        this._apiGridData.colHists = result.colHists;

        // Draw histogram
        // this.drawChart();
      }
    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    })
  } // function - _getHistogramInfoByWidths

  /**
   * Get histogram info of changed column width
   * @param {any} opts : { dsId:string, columnIndex:Number, columnWidth:Number, chartIndex : number, columnName : string }
   */
  private _getDistinctHistogram(opts: any) {

    // 히스토그램 정보 바뀌기 전
    let previousHistogramInfo = this._apiGridData.colHists[opts.columnIndex];

    let params = {
      ruleIdx: this.ruleIdx,
      colnos: [opts.columnIndex],
      colWidths: [opts.columnWidth]
    };

    // ToDo: getHistogramInfo 공통으로..
    this.dataflowService.getHistogramInfo(opts.dsId, params).then((data) => {
      this._apiGridData.colHists[opts.columnIndex] = data['colHists'][0];

      // // 변경된 width를 바꾸고
      $('#histogram_' + opts.uuid)[0].style.width = opts.columnWidth + 'px';
      $('#barChart_' + opts.uuid)[0].style.width = opts.columnWidth + 'px';
      $(`#` + opts.uuid)[0].style.width = opts.columnWidth + 'px';

      if (this._barClickedSeries[opts.columnIndex].length === 0) {
        this._selectedRows = [];
        // 폭이 조정됐을 떄 선택 되어있던 히스토그램이 이제 보이지 않는다면 unselect 과정..
        let clonedData = _.cloneDeep(this._clickedSeries[opts.columnIndex]);
        clonedData.forEach((item) => {
          if (-1 === this._apiGridData.colHists[opts.columnIndex].labels.indexOf(item)) {
            this._clickedSeries[opts.columnIndex].splice(this._clickedSeries[opts.columnIndex].indexOf(item), 1);
          } else {
            let idx = previousHistogramInfo.labels.indexOf(item);
            this._selectedRows = _.union(this._selectedRows, previousHistogramInfo.rownos[idx]);
          }
        });
      }

      // 조정된 컬럼만 다시 그린다.
      this._drawChartsByColumn({
        chart1: this._charts[opts.columnIndex],
        chart2: this._barCharts[opts.columnIndex],
        index: opts.columnIndex
      });
      this._barCharts[opts.columnIndex].resize();
      this._charts[opts.columnIndex].resize();
      this._rowClickHandler(this._selectedRows);

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - _getDistinctHistogram

  /**
   * Histogram Mouse event
   * @param chart 현재 마우스이벤트가 일어나는 echart
   * @param {string} divId 현재 echart의 div의 ID
   * @param histogramInfo 히스토그램 정보
   * @param {number} index charts 에서 몇번째 인지
   */
  private _histogramMouseEvent(chart: any, divId: string, histogramInfo: any, index: number) {

    let histInfo = this._apiGridData.colHists[index];

    let value = '';

    if (isUndefined(histInfo) || (0 === histInfo.labels.length && 0 === histInfo.counts.length)) {
      value = 'No valid values';
    } else {
      switch (this._apiGridData.colDescs[index].type) {
        case 'LONG':
        case 'TIMESTAMP':
          value = `${histogramInfo.min} ~ ${histogramInfo.max}`;
          break;
        case 'DOUBLE':
          value = `${parseFloat(histogramInfo.min).toFixed(2)} ~ ${parseFloat(histogramInfo.max).toFixed(2)}`;
          break;
        default :
          value = histogramInfo.distinctValCount === 1 ? histogramInfo.distinctValCount + ' category' : histogramInfo.distinctValCount + ' categories';
          break;
      }
    }

    $('#' + divId).empty().append(value);

    if (!isNullOrUndefined(histogramInfo)) {
      // when mouse out, show categories
      chart.off('mouseout');
      chart.on('mouseout', () => {
        if (histogramInfo !== '') {
          this._hoverHistogramData = histogramInfo.counts.length;
          this._hoverHistogramIndo = {};
          $('#' + divId).empty().append(value);
        }
      });
      this._histogramClickEvent(chart, index);
    }
  } // function - _histogramMouseEvent

  /**
   * Histogram bar click handler
   * @param chart - current chart
   * @param histogramInfo - current histogram info
   * @param index - index from chart array (그리드에서 현재 클릭된 히스토그램이 몇번쨰 인지 확인하기 위한)
   */
  private _histogramClickEvent(chart, index) {

    let options;
    chart.off('click');
    chart.on('click', (params) => {
      // 검색 단계인 경우를 대비하여 검색 단계 초기화
      this.searchProcessReset();

      // param이 null 이라면 선택된 bar 초기화 한다.
      if (isNull(params) && this._hoverHistogramIndo.hasOwnProperty('name') === false) {
        if (this._clickedSeries[index].length > 0) {
          this._clickedSeries[index] = [];
          this.unSelectionAll('ROW');
          options = this._getDefaultChartOption(this._getHistogramInfo(index), index);
          this._applyChart(chart, options)
        }
      } else {

        const useParam: any = {};
        if (isNull(params)){
          useParam.name = this._hoverHistogramIndo.name;
          useParam.dataIndex = this._hoverHistogramIndo.dataIndex;
        }else{
          useParam.name = params.name;
          useParam.dataIndex = params.dataIndex;
        }

        // 현재 선택되어있는 column/row refresh
        if (this._selectedColumns.length > 0) {
          this._gridComp.columnAllUnSelection();
          this._selectedRows = [];
        }

        // 현재 선택되어있는 바 차트 refresh
        let chartIndex = -1;
        Object.keys(this._barClickedSeries).forEach((key, index) => {
          if (this._barClickedSeries[key].length > 0) {
            chartIndex = index;
          }
        });
        if (chartIndex !== -1) {
          this._barClickedSeries[chartIndex] = [];
          this.unSelectionAll('ROW');
          options = this._getDefaultBarChartOption(this._getHistogramInfo(chartIndex), chartIndex);
          this._applyChart(this._barCharts[chartIndex], options)
        }

        this._apiGridData.colNames.forEach((item, i) => {
          if (i !== index) {
            if (this._clickedSeries[i].length !== 0) {
              this._clickedSeries[i] = [];
              this.unSelectionAll('ROW');
              options = this._getDefaultChartOption(this._apiGridData.colHists[i], i);
              // options = this._getDefaultChartOption(this.dataSet.histogram[i],i);
              this._applyChart(this._charts[i], options)
            }
          }
        });
        let idx = this._clickedSeries[index].indexOf(useParam.name);
        if (idx === -1) {
          this._selectedRows = _.union(this._selectedRows, this._getHistogramInfo(index).rownos[useParam.dataIndex]);
          this._selectedRows.sort(function(a,b){return a-b});

          let minSelect: number = -1;
          if(this._selectedRows.length > 0) {minSelect = this._selectedRows[0];}

          if(minSelect==-1) {
            this._rowClickHandler(this._selectedRows);
            this._clickedSeries[index].push(useParam.name);
          }else{
            const pageInfo:any = this._gridComp.getPageInfo();
            const plusNumber: number = 10 + Math.floor(minSelect/pageInfo.pageSize * 10);
            minSelect = minSelect + plusNumber;
            if(pageInfo.lastPage == true || minSelect < pageInfo.length) {
              this._rowClickHandler(this._selectedRows);
              this._clickedSeries[index].push(useParam.name);
            }else{
              this.loadingShow();
              const moreParam: any = this._getExternalMoreDataParam(pageInfo, minSelect);
              this.dataflowService.getSearchCountDataSets(this.dataSetId, pageInfo.ruleIndex, moreParam.offset, moreParam.count).then((result) => {
                this.loadingHide();
                this._gridComp.setExternalData(result, moreParam.changePageNumber);
                this._gridComp.resize();

                this._rowClickHandler(this._selectedRows);
                this._clickedSeries[index].push(useParam.name);
                options = this._getDefaultChartOption(this._getHistogramInfo(index), index);
                this._applyChart(chart, options);
              }).catch((error) => {
                this.loadingHide();
                console.error(error);
              });
              return;
            }
          }
        } else {
          // 이미 선택되어있다면 삭제
          let minusTarget: any[] = [];
          let tempRows: any[] = [];
          try{
            minusTarget = _.clone(this._getHistogramInfo(index).rownos[useParam.dataIndex]);
            tempRows = _.clone(this._selectedRows);
            this._selectedRows = [];
          }catch (error){
            minusTarget = [];
            tempRows = [];
          }
          for(let i:number =0; i< tempRows.length; i = i +1) {
            let chk: number = -1;
            for(let j:number =0; j< minusTarget.length; j = j +1) {if(tempRows[i] === minusTarget[j]) {chk = i;break;}}
            if(chk == -1) {this._selectedRows.push(tempRows[i]);}
          }

          this._rowClickHandler(this._selectedRows);
          this._clickedSeries[index].splice(idx, 1);
        }
        options = this._getDefaultChartOption(this._getHistogramInfo(index), index);
        this._applyChart(chart, options)
      }
    })
  } // function - _histogramClickEvent


  /**
   * Bar chart / Histogram click : get moreData service Parameter
   * @param pageInfo
   * @param minSelect
   * @private
   */
  private _getExternalMoreDataParam(pageInfo:any, minSelect: number): any {

    const result: any = {};

    const offset: number = (pageInfo.currentPage + 1) * 100;
    let count: number;
    if(minSelect % pageInfo.pageSize == 0) {
      count = minSelect;
    }else{
      count = (Math.floor(minSelect / pageInfo.pageSize) + 1) * pageInfo.pageSize;
    }
    count = count - offset;
    if(count == 0) count =  pageInfo.pageSize;
    if(offset + count > pageInfo.totalRowCnt) count = pageInfo.totalRowCnt - offset;
    const changePageNumber = pageInfo.currentPage + Math.floor(count/pageInfo.pageSize);

    result.offset = offset;
    result.count = count;
    result.changePageNumber = changePageNumber;

    return result;
  }



  /**
   * Bar chart click event 처리
   * @param chart
   * @param histogramInfo
   * @param index
   * @private
   */
  private _barChartClickEvent(chart, histogramInfo, index) {
    let options;
    chart.off('click');
    chart.on('click', (params) => {

      // 검색 단계인 경우를 대비하여 검색 단계 초기화
      this.searchProcessReset();

      // 컬럼이 선택되어있다면 초기화
      if (this._selectedColumns.length > 0) {
        this.unSelectionAll('COL');
      }

      // 바가 아닌 다른 영역을 클릭했을 경우 선택 해지.
      if (isNull(params)) {
        // 현재 클릭된 시리즈 해제
        this._barClickedSeries[index] = [];
        this._selectedRows = [];
        this.unSelectionAll('ROW');

      } else {

        // 선택되어있는 히스토그램 및 rows 초기화 //
        let chartIndex = -1;
        Object.keys(this._clickedSeries).forEach((key, index) => {
          if (this._clickedSeries[key].length > 0) {
            chartIndex = index;
          }
        });
        if (chartIndex !== -1) {
          this._clickedSeries[chartIndex] = [];
          this.unSelectionAll('ROW');
          this._selectedRows = [];
          options = this._getDefaultChartOption(this._getHistogramInfo(chartIndex), chartIndex);
          this._applyChart(this._charts[chartIndex], options)
        }
        // 선택되어있는 히스토그램 및 rows 초기화 //


        // 자기 이외에 다른 차트가 선택되어있으면 모두 선택 해제
        this._apiGridData.colNames.forEach((item, i) => {
          if (i !== index) {
            if (this._barClickedSeries[i].length !== 0) {
              this._barClickedSeries[i] = [];
              this.unSelectionAll('ROW');
              this._selectedRows = [];
              options = this._getDefaultBarChartOption(this._getHistogramInfo(i), i);
              this._applyChart(this._barCharts[i], options)
            }
          }
        });



        // 현재 선택된 시리즈가 이미 선택되어있는지 확인한다.
        let idx = this._barClickedSeries[index].indexOf(params.seriesName);
        if (idx === -1) {

          // 선택되어있지 않으면 추가
          // 선택된 rows 도 클릭이 되어야하는 상태 ..
          // this.selectedDataset.gridResponse.colHists[index] 에서
          // params.seriesName + rows 를 찾아와서 rows를 그리드에 선택 되게 한다.
          this._selectedRows = _.union(this._selectedRows, this._getHistogramInfo(index)[params.seriesName + 'Rows']);
          this._selectedRows.sort(function(a,b){return a-b});

          let minSelect: number = -1;
          if(this._selectedRows.length > 0) {minSelect = this._selectedRows[0];}

          if(minSelect==-1) {
            this._rowClickHandler(this._selectedRows);
            this._barClickedSeries[index].push(params.seriesName);
          }else{
            const pageInfo:any = this._gridComp.getPageInfo();
            const plusNumber: number = 10 + Math.floor(minSelect/pageInfo.pageSize * 10);
            minSelect = minSelect + plusNumber;

            if(pageInfo.lastPage == true || minSelect < pageInfo.length) {
              this._rowClickHandler(this._selectedRows);
              this._barClickedSeries[index].push(params.seriesName);
            }else{
              this.loadingShow();
              const moreParam: any = this._getExternalMoreDataParam(pageInfo, minSelect);
              this.dataflowService.getSearchCountDataSets(this.dataSetId, pageInfo.ruleIndex, moreParam.offset, moreParam.count).then((result) => {
                this.loadingHide();
                this._gridComp.setExternalData(result, moreParam.changePageNumber);
                this._gridComp.resize();

                this._rowClickHandler(this._selectedRows);
                this._barClickedSeries[index].push(params.seriesName);
                options = this._getDefaultBarChartOption(histogramInfo, index);
                this._applyChart(chart, options);
              }).catch((error) => {
                this.loadingHide();
                console.error(error);
              });
              return;
            }
          }
        } else {
          let minusTarget: any[] = [];
          let tempChartRows: any[] = [];
          try{
            minusTarget = _.clone(this._getHistogramInfo(index)[params.seriesName + 'Rows']);
            tempChartRows = _.clone(this._selectedRows);
            this._selectedRows = [];
          }catch (error){
            minusTarget = [];
            tempChartRows = [];
          }
          for(let i:number =0; i< tempChartRows.length; i = i +1) {
            let chk: number = -1;
            for(let j:number =0; j< minusTarget.length; j = j +1) {if(tempChartRows[i] === minusTarget[j]) {chk = i;break;}}
            if(chk == -1) {this._selectedRows.push(tempChartRows[i]);}
          }

          this._rowClickHandler(this._selectedRows);
          this._barClickedSeries[index].splice(idx, 1);
        }
      }
      options = this._getDefaultBarChartOption(histogramInfo, index);
      this._applyChart(chart, options);
    })
  } // function - _barChartClickEvent

  /**
   * Bar chart hover event 처리
   * @param chart
   * @param index
   * @private
   */
  private _barChartHoverEvent(chart, index) {
    this.barChartTooltipShow = false;
    chart.off('mouseout');
    chart.on('mouseover', (param) => {

      this.barChartTooltipIndex = index;
      // 이미 호버된 영역에 툴팁이 띄어져 있다면 또 띄우지 않는다
      if ((param.event && this.barChartTooltipLabel !== param.seriesName)) {

        // 현재 호버 한 시리즈 width
        let seriesWidth: number = param.event.target.shape.x;

        // 화면 끝에서 현재 마우스가 있는 곳 까지의 거리
        let distanceFromWindowToCursor: number = param.event.event.pageX;

        // 현재 차트가 들어있는 div 처음에서 마우스가 있는 곳 까지의 거리
        let distanceFromDivToCursor: number = seriesWidth !== 0 ? param.event.event.offsetX - seriesWidth : param.event.event.offsetX;

        if (distanceFromDivToCursor + 30 > seriesWidth) {
          if (distanceFromDivToCursor < 30) {
            distanceFromWindowToCursor = distanceFromWindowToCursor + 30;
          } else if (param.event.target.shape.width - distanceFromDivToCursor < 30) {
            distanceFromWindowToCursor = distanceFromWindowToCursor - 30;
          }
        }

        this.barChartTooltipPosition = distanceFromWindowToCursor + 'px';
        this.barChartTooltipValue = param.value;
        this.barChartTooltipLabel = param.seriesName;
        this.barChartTooltipShow = true;
      }
    });
    chart.on('mouseout', () => {
      this.barChartTooltipShow = false;
      this.barChartTooltipLabel = '';
    });
  } // function - _barChartHoverEvent

  /**
   * 바 차트 디폴트 옵션 설정
   * @param chartInfo
   * @param {number} index
   * @return {any}
   * @private
   */
  private _getDefaultBarChartOption(chartInfo: any, index: any): any {

    if (!isNullOrUndefined(chartInfo)) {
      return {
        animation: false,
        grid: { right: '0', left: '0', bottom: '55' },
        xAxis: [{ type: 'category', show: false },
          { type: 'value', show: false, max: chartInfo.matched + chartInfo.missing + chartInfo.mismatched }],
        yAxis: [
          { type: 'value', show: false, position: 'left' },
          { type: 'category', position: 'right', show: false, }],
        series: [
          {
            name: 'matched', type: 'bar', stack: 'stack1', barWidth: 8,
            label: {
              normal: {
                show: false,
              }
            },
            data: [chartInfo.matched],
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: ((params) => {
                  if (this._barClickedSeries[index].length === 0) {
                    return this._HISTOGRAM_DEFAULT_COLOR
                  } else {
                    let idx = this._barClickedSeries[index].indexOf(params.seriesName);
                    if (idx === -1) {
                      return this._HISTOGRAM_DEFAULT_COLOR
                    } else {
                      return this._HISTOGRAM_CLICK_COLOR
                    }
                  }
                })
              }, emphasis: { color: this._HISTOGRAM_HOVER_COLOR }
            }
          },
          {
            name: 'mismatched',
            type: 'bar',
            stack: 'stack1',

            label: {
              normal: {
                show: false,
              }
            },
            data: [chartInfo.mismatched],
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: ((params) => {
                  if (this._barClickedSeries[index].length === 0) {
                    return this._BARCHART_MISMATCH_COLOR
                  } else {
                    let idx = this._barClickedSeries[index].indexOf(params.seriesName);
                    if (idx === -1) {
                      return this._BARCHART_MISMATCH_COLOR
                    } else {
                      return this._BARCHART_MISMATCH_CLICK_COLOR
                    }
                  }
                })
              }, emphasis: { color: this._BARCHART_MISMATCH_HOVER_COLOR }
            }
          },
          {
            name: 'missing',
            type: 'bar',
            stack: 'stack1',

            label: {
              normal: {
                show: false,
              }
            },
            data: [chartInfo.missing],
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: ((params) => {
                  if (this._barClickedSeries[index].length === 0) {
                    return this._BARCHART_MISSING_COLOR
                  } else {
                    let idx = this._barClickedSeries[index].indexOf(params.seriesName);
                    if (idx === -1) {
                      return this._BARCHART_MISSING_COLOR
                    } else {
                      return this._BARCHART_MISSING_CLICK_COLOR
                    }
                  }
                })
              }, emphasis: { color: this._BARCHART_MISSING_HOVER_COLOR }
            }
          },
        ]
      }
    } else {
      return {}
    }
  }

  /**
   * Set Histogram option
   * @param histogramInfo 히스토그램 정보
   * @param index
   * @returns {any}
   * @private
   */
  private _getDefaultChartOption(histogramInfo: any, index): any {

    // 옵션들
    this._defaultChartOption = {
      animation: false, // 차트가 처음 그릴떄 깜박거리는거
      brush: {
        xAxisIndex: [],
        yAxisIndex: [],
        transformable: false,
        inBrush: {
          opacity: 1
        },
        outOfBrush: {
          opacity: 0.2
        }
      }, toolbox: {
        show: false,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      cursor: 'pointer',
      grid: { top: '0px', left: '10px', right: '10px', bottom: '0' },
      xAxis: { show: false, min: 0 },
      yAxis: { show: false, min: 0 },
      series: [{
        name: '',
        type: 'bar',
        barGap: 2,
        itemStyle: {
          normal: {
            color: (params) => {
              if (this._clickedSeries[index].length === 0) {
                return this._HISTOGRAM_DEFAULT_COLOR;
              } else {
                let idx = this._clickedSeries[index].indexOf(params.name);
                if (idx === -1) {
                  return this._HISTOGRAM_DEFAULT_COLOR;
                } else {
                  return this._HISTOGRAM_CLICK_COLOR;
                }
              }
            }
          }, emphasis: { color: this._HISTOGRAM_HOVER_COLOR, opacity: '0.15' }
        },
      }]
    };

    if (!isNullOrUndefined(histogramInfo)) {
      let labels = _.cloneDeep(histogramInfo.labels);
      if (histogramInfo.labels.length !== histogramInfo.counts.length) {
        labels.pop();
      }
      return _.merge({}, this._defaultChartOption, {
        tooltip: {
          trigger: 'axis', axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            let labels = this._apiGridData.colHists[index].labels;
            let sum = this.totalRowCnt;
            let data = ` ${params[0].data} `;
            let percentage = '<span style="color:#b4b9c4">' + ((params[0].value / sum) * 100).toFixed(2) + '%' + '</span>';
            this._hoverHistogramIndo ={'index':index, 'name':params[0].name, 'dataIndex': params[0].dataIndex};
            switch (this._apiGridData.colDescs[index].type) {
              case 'TIMESTAMP':
                this._hoverHistogramData = `${labels[params[0].dataIndex]} ~ ${labels[params[0].dataIndex + 1]}${data}${percentage}`;
                break;
              case 'LONG' :
                this._hoverHistogramData = `${this._getAbbrNumberRange(labels[params[0].dataIndex], labels[params[0].dataIndex + 1])}${data}${percentage}`;
                break;
              case 'DOUBLE':
                this._hoverHistogramData = `${parseFloat(labels[params[0].dataIndex]).toFixed(2)} ~ ${parseFloat(labels[params[0].dataIndex + 1]).toFixed(2)}${data}${percentage}`;
                break;
              default:
                this._hoverHistogramData = params[0].name + data + percentage;
                break;
            }
            $('#' + this._gridData.fields[index].uuid).empty().append(this._hoverHistogramData);

          }
        },
        xAxis: [{ data: labels }],
        yAxis: { max: histogramInfo.maxCount },
        series: [{ data: histogramInfo.counts }]
      });
    } else {
      return this._defaultChartOption;
    }

  } // function - _getDefaultChartOption

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - for Grid
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Find smallest index
   * @param list
   * @return {number} smallest Index
   * @private
   */
  private _findSmallestIndex(list): number {
    let indexList = [];
    let result = -1;
    if (typeof list === 'object') {
      list.forEach((item) => {
        indexList.push(this._apiGridData.colNames.indexOf(item));
      });
      result = _.min(indexList)
    } else {
      result = this._apiGridData.colNames.indexOf(list);
    }
    return result
  } // function - _findSmallestIndex

  /**
   * Trigger click event on row
   * @param selectedRows
   */
  public _rowClickHandler(selectedRows) {
    this._gridComp.rowSelection(selectedRows);
    this._gridComp.getGridCore().scrollRowIntoView(_.min(selectedRows));
  } // function - _rowClickHandler

  /**
   * Row clicked with Shift key
   * @param event
   * @param row
   * @private
   */
  private _onShiftKeyPressedSelectRow(event, row) {

    if (event.selected === false) {
      return;
    }

    let selectedRows = null;

    try {
      selectedRows = this._gridComp.getSelectedRows().map((item) => {
        return item[ScrollLoadingGridComponent.ID_PROPERTY] - 1
      });
    }catch (error){
      return;
    }

    let baseColumn = selectedRows[selectedRows.length - 2];
    let selectedIdx = row[ScrollLoadingGridComponent.ID_PROPERTY] - 1;

    let selectlist = [baseColumn];
    if (selectedIdx > baseColumn) {
      this._apiGridData.rows.forEach((item, index) => {
        if (index < selectedIdx && index > baseColumn) {
          selectlist.push(index);
        }
      });
    } else {
      this._apiGridData.rows.forEach((item, index) => {
        if (index > selectedIdx && index < baseColumn) {
          selectlist.push(index);
        }
      });
    }
    selectlist.push(selectedIdx);
    this._gridComp.rowSelection(_.union(selectedRows, selectlist));

  } // function - _onShiftKeyPressedSelectRow


  /**
   * Shift key가 눌린 상태에서 컬럼 선택시
   * @param data
   * @private
   */
  private _onShiftKeyPressedSelectColumn(data: { id: string, isSelect: boolean, selectColumnIds: string[], shiftKey: boolean, ctrlKey: boolean, batchCount: number }) {

    if (data.isSelect === false) {
      return;
    }

    let selectedIdx = this._selectedColumns.indexOf(data.id);
    let baseColumn = this._selectedColumns[selectedIdx - 1];

    const gridFields = this._gridData.fields.map(f => f.uuid );

    let selectedIndex = gridFields.indexOf(data.id);
    let baseColumnIndex = gridFields.indexOf(baseColumn);

    let selectList = [];
    if (selectedIndex > baseColumnIndex) {
      this._gridData.fields.forEach((item, index) => {
        if (index < selectedIndex && index > baseColumnIndex && !item.selected) {
          selectList.push(item);
        }
      });
    } else {
      this._gridData.fields.forEach((item, index) => {
        if (index > selectedIndex && index < baseColumnIndex && !item.selected) {
          selectList.push(item);
        }
      });
    }

    selectList.forEach((item) => {
      this._gridComp.selectColumn(item.uuid, !item.selected, null, { batchCount : selectList.length + 1 } );
    });
  } // function - _onShiftKeyPressedSelectColumn

  /**
   * API 조회 결과를 바탕으로 그리드 데이터 구조를 얻는다.
   * @param gridResponse
   * @returns {GridData}
   * @private
   */
  private _getGridDataFromGridResponse(gridResponse: any): GridData {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData: GridData = new GridData();

    for (let idx = 0; idx < colCnt; idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx,
        uuid : CommonUtil.getUUID()
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for (let idx = 0; idx < colCnt; idx++) {
        obj[colNames[idx]] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - _getGridDataFromGridResponse

  /**
   * Set Column width
   * @param {ColumnWidth} colWidths
   * @param {any} colNameTypes
   * @param {GridData} gridData
   * @returns {ColumnWidth}
   * @private
   */
  private _setColumnWidthInfo(colWidths: ColumnWidth, colNameTypes: any, gridData: GridData): ColumnWidth {
    const maxDataLen: any = {};
    const maxLength = 500;
    const fields: Field[] = gridData.fields;
    let rows: any[] = gridData.data;
    // Row 생성 및 컬럼별 최대 길이 측정
    if (rows.length > 0) {
      rows.forEach((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          let colWidth: number = 0;
          if (typeof row[field.name] == 'string') {
            colWidth = Math.floor((row[field.name]).length * 12 );
          } else if (typeof row[field.name] === 'number') {
            colWidth = Math.floor((row[field.name]).toString().length * 12);
          } else if (typeof row[field.name] === 'object') {
            colWidth = Math.floor(JSON.stringify(row[field.name]).length * 12 );
          }
          if (!maxDataLen[field.name] || (maxDataLen[field.name] < colWidth)) {
            if (colWidth > 500) {
              maxDataLen[field.name] = maxLength;
            } else {
              maxDataLen[field.name] = colWidth;
            }
          }
        });
        // row id 설정
        (row.hasOwnProperty('id')) || (row.id = idx);
      });
    }
    colNameTypes.forEach((item)=>{
      let headerWidth: number = Math.floor(item.colname.length * 7) + 62;
      if (headerWidth > 500) headerWidth = 500;
      if(item.coltype == "TIMESTAMP"){
        let maxDataLenth = 35*7;
        if (!colWidths.hasOwnProperty(item)) {
          colWidths[item.colname] = maxDataLenth > headerWidth ? maxDataLenth : headerWidth
        }
      } else {
        if (!colWidths.hasOwnProperty(item)) {
          colWidths[item.colname] = maxDataLen[item.colname] > headerWidth ? maxDataLen[item.colname] : headerWidth
        }
      }
    });
    return colWidths;
  } // function - _setColumnWidthInfo

  // noinspection JSMethodCanBeStatic
  /**
   * Set header menu
   * @param {Field} field
   * @return HeaderMenu
   */
  private _getHeaderMenu(field: Field): HeaderMenu {
    let headerMenu = new HeaderMenu();
    headerMenu.buttons = [{
      cssClass: 'slick-header-menubutton', command: field.name, index: field.seq, type: field.type
    }];


    // if timestamp type -> include timestamp style
    if (field.type === 'TIMESTAMP') {
      headerMenu.buttons[0]['timestampStyle'] = this._getHistogramInfo(field.seq).timestampLabels;
    }
    return headerMenu;
  } // function - _getHeaderMenu

  /**
   * 그리드를 그린다.
   * @param {GridData} gridData
   * @param {number} ruleIdx
   * @param {number} totalRowCnt
   * @private
   */
  private _renderGrid(gridData: GridData, ruleIdx: number, totalRowCnt: number) {
    // const ruleIndex: number = ruleIdx;

    const fields: Field[] = gridData.fields;

    const defaultStyle: string = 'line-height:30px;';
    const nullStyle: string = 'color:#b8bac2; font-style: italic;';
    const selectStyle: string = 'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0px; line-height:30px; padding:0 10px;';
    const mismatchStyle: string = 'color:' + this._BARCHART_MISMATCH_COLOR + '; font-style: italic;';

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field) => {

      return new SlickGridHeader()
        .Id(field.uuid)
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
        .Field(field.name)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(this.columnWidths[field.name])
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .RerenderOnResize(true)
        .Unselectable(true)
        .Sortable(false)
        .Header(this._getHeaderMenu(field))
        .ColumnType(field.type)
        .Formatter((row, cell, value, columnDef) => {

          const colDescs = (this._apiGridData) ? this._apiGridData.colDescs[cell - 1] : {};
          value = this._setFieldFormatter(value, columnDef.columnType, colDescs);

          if (field.type === 'STRING') {
            value = (value) ? value.toString().replace(/</gi, '&lt;') : value;
            value = (value) ? value.toString().replace(/>/gi, '&gt;') : value;
            value = (value) ? value.toString().replace(/\n/gi, '&crarr;') : value;
            let re = /\s/gi;
            let tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0px">' + this.spaceSymbol + '</span>';
            value = (value) ? value.toString().replace(re, tag) : value;
          }

          if (isNull(value) && columnDef.select) {
            return '<div style="' + defaultStyle + nullStyle + selectStyle + '">' + '(null)' + '</div>';
          } else if (isNull(value) && !columnDef.select) {
            return '<div  style="' + defaultStyle + nullStyle + '">' + '(null)' + '</div>';
          } else if (!isNull(value) && columnDef.select) {
            if (this._getHistogramInfo(cell - 1) && this._getHistogramInfo(cell - 1).mismatchedRows.length !== 0 && this._getHistogramInfo(cell - 1).mismatchedRows.indexOf(row) !== -1) {
              return '<div style="' + defaultStyle + mismatchStyle + selectStyle + '">' + value + '</div>';
            } else {
              return '<div style="' + defaultStyle + selectStyle + '">' + value + '</div>';
            }

          } else if (columnDef.id === ScrollLoadingGridComponent.ID_PROPERTY) {
            return '<div style="' + defaultStyle + '">' + '&middot;' + '</div>';
          } else {
            if (this._getHistogramInfo(cell - 1) && this._getHistogramInfo(cell - 1).mismatchedRows.length !== 0 && this._getHistogramInfo(cell - 1).mismatchedRows.indexOf(row) !== -1) {
              return '<div style="' + defaultStyle + mismatchStyle + '">' + value + '</div>';
            } else {
              return value;
            }
          }

        })
        .build();
    });

    // 그리드 생성
    this._gridComp.create(
      headers,
      new ScrollLoadingGridModel(
        (ruleIdx:number, pageNum: number = 0, pageSize: number) => {
          if (this.isApiMode) {
            return this.dataflowService.getSearchCountDataSets(this.dataSetId, ruleIdx, pageNum, pageSize);
          } else {
            return new Promise<any>((resolve) => {
              let startIdx = ((pageNum - 1) * pageSize);
              let endIdx = (pageNum * pageSize);
              resolve(gridData.data.slice(startIdx, endIdx));
            });
          }
        },
        (data) => {
          if (this.isApiMode) {
            let gridRes = data['gridResponse'];
            const pagedGridData = this._getGridDataFromGridResponse(gridRes);

            // 그리드 데이터 추가
            gridData.data = gridData.data.concat(pagedGridData.data);

            return pagedGridData.data;
          } else {
            return data;
          }
        },
        (this.isApiMode) ? gridData.data : []
      ),
      new GridOption()
        .SyncColumnCellResize(true)
        .RowHeight(32)
        .MultiSelect(false)
        .MultiColumnSort(false)
        .EnableHeaderClick(true)
        .DualSelectionActivate(true)
        .EnableColumnReorder(false)
        .EnableHeaderMenu(true)
        .EnableSeqSort(false)
        .ShowHeaderRow(true)
        .HeaderRowHeight(90)
        .ExplicitInitialization(true)
        .NullCellStyleActivate(true)
        .EnableMultiSelectionWithCtrlAndShift(true)
        .build(),
      ruleIdx,
      totalRowCnt
    );

    // 그리드 실행
    this._gridComp.execGrid();

    // 그리드 엘레멘트 저장
    this._$gridElm = this._gridComp.getGridJQueryObject();

    this.loadingHide();

  } // function - _renderGrid

  /**
   * 필드에 대한 형식 지정
   * @param value
   * @param {string} type
   * @param {{timestampStyle: string, arrColDesc: any, mapColDesc: any}} colDescs
   * @returns {string}
   * @private
   */
  private _setFieldFormatter(value: any, type: string,
                             colDescs: { timestampStyle?: string, arrColDesc?: any, mapColDesc?: any }): string {
    let strFormatVal: string = '';
    if (colDescs) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = this._setTimeStampFormat(value, colDescs.timestampStyle);
      } else if ('ARRAY' === type) {
        // 배열 형식내 각 항목별 타임 스템프 처리
        const arrColDescs = colDescs.arrColDesc ? colDescs.arrColDesc : {};
        strFormatVal = JSON.stringify(
          value.map((item: any, idx: number) => {
            const colDesc = arrColDescs[idx] ? arrColDescs[idx] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              return this._setTimeStampFormat(item, colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(item, colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              return ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          })
        );
      } else if ('MAP' === type) {
        // 구조체내 각 항목별 타임 스템프 처리
        const mapColDescs = colDescs.mapColDesc ? colDescs.mapColDesc : {};
        let newMapValue = {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            const colDesc = mapColDescs.hasOwnProperty(key) ? mapColDescs[key] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              newMapValue[key] = this._setTimeStampFormat(value[key], colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(value[key], colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              newMapValue[key]
                = ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          }
        }
        strFormatVal = JSON.stringify(newMapValue);
      } else {
        strFormatVal = <string>value;
      }
    } else {
      strFormatVal = <string>value;
    }

    return strFormatVal;
  } // function - _setFieldFormatter

  /**
   * 문자열에 타임스탬프 포맷을 적용함
   * @param {string} value
   * @param {string} timestampStyle
   * @return {string}
   * @private
   */
  private _setTimeStampFormat(value: string, timestampStyle?: string): string {

    (timestampStyle) || (timestampStyle = 'YYYY-MM-DDTHH:mm:ss');
    let result = moment.utc(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g, ''));
    if (result === 'Invalid date') {
      result = value;
    }
    return result;

    // if (-1 > timestampStyle.indexOf('H')) {
    //   // return moment(value + `+0000`).format(timestampStyle);
    // } else {
    //   return moment(value).format(timestampStyle);
    // }
  } // function - _setTimeStampFormat

  /**
   * 그리드 요약 정보 설정
   * @param {GridData} gridData
   * @private
   */
  private _summaryGridInfo(gridData: GridData) {

    // init type list
    this.columnTypeList = [];

    //(isUndefined(gridData.data)) || (this.totalRowCnt = gridData.data.length);
    (isUndefined(gridData.fields)) || (this.totalColumnCnt = gridData.fields.length);

    const tempMap: Map<string, number> = new Map();
    gridData.fields.forEach((item) => {
      if (tempMap.get(item.type) > -1) {
        const temp = tempMap.get(item.type) + 1;
        tempMap.set(item.type, temp);
      } else {
        tempMap.set(item.type, 1);
      }
    });
    this.columnTypeCnt = tempMap.size;

    tempMap.forEach((value: number, key: string) => {
      this.columnTypeList.push({label : key, value : value < 2 ? `${value} column` : `${value} columns`});
    });

  } // function - _summaryGridInfo


  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.typeListElement.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowColumnTypes = false;
    }
  }

}

class GridData {
  public data: any[];
  public fields: any[];

  constructor() {
    this.data = [];
    this.fields = [];
  }
}

interface ColumnWidth {
  [widthName: string]: number;
}
