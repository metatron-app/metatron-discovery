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
import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ScrollLoadingGridModel } from './scroll-loading-grid.model';
import { GridOption, Option } from '@common/component/grid/grid.option';
import { Header, SlickGridHeader } from '@common/component/grid/grid.header';

declare const jQuery_1_7;
declare const Slick: any;

@Component({
  selector: '[scroll-grid-component]',
  template: `<div class="myGrid"></div>`,
  styleUrls: [
    '../../../../../../../assets/grid/slick.grid.css',          // slickGrid default css
    '../../../../../../../assets/grid/slick.columnpicker.css',  // columnpicker plugin css
    '../../../../../../../assets/grid/slick.grid.override.css', // slickGrid custom css
    '../../../../../../../assets/grid/slick.headerbuttons.css', // slickGrid header button css
    '../../../../../../../assets/grid/slick.headermenu.css'     // slickGrid header button css
  ]
})
export class ScrollLoadingGridComponent implements OnInit, AfterViewInit, OnDestroy {

  public static readonly ID_PROPERTY: string = '_idProperty_';     // 아이디

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private $ = jQuery_1_7;                       // Fixed jQuery version 1.7

  private _selectColumnIds: string[] = [];      // 선택된 컬럼의 아이디 목록 저장
  private _gridSelectionModelType: string = ''; // 선택 모델 형식

  private _clickEnabled: boolean = true;        // 클릭 이벤트 타임아웃 체크
  private _columnResized: boolean = false;     // 컬럼 리사이징 여부

  private _loadingIndicator: any;

  private _grid;

  private _option: Option;                        // 그리드 옵션

  private _gridModel: ScrollLoadingGridModel;     // 데이터 모델

  private readonly _GRID_ID: string;              // 그리드 아이디

  private readonly _GRID_DEFAULT_OPTION: Option;  // 그리드 기본 옵션

  private readonly _ROW_EMPTY: number = -1;       // 로우 데이터가 없는 경우 -1

  private _selectedRows: any = [];            // 그리드에서 선택된 로우 리스트

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output() private selectedHeaderEvent = new EventEmitter();           // 헤더 선택시 알림

  @Output() private selectedEvent = new EventEmitter();                 // 로우 선택시 알림

  @Output() private onColumnResize = new EventEmitter();                // 컬럼 크기 조정시 이벤트

  @Output() private onContextMenuClick = new EventEmitter();

  @Output() private onHeaderRowCellRendered = new EventEmitter();

  @Output() private onGridContextCloseEvent = new EventEmitter();            // 그리드 context menu close


  public totalRowCnt: number = 0;

  private _currentScrollLeft: number = 0; // grid current scrollLeft value
  private _gridTimer = null;   // grid timer

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public elementRef: ElementRef) {
    this._GRID_ID = this._createGridUniqueId();   // 그리드 유니크 아이디 생성

    // 그리드 기본 옵션
    this._GRID_DEFAULT_OPTION = new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(false)
      .build();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    this.elementRef.nativeElement.children[0].id = this._GRID_ID;
  }

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getPageInfo(): any {
    return this._gridModel.getPageInfo();
  }

  public setExternalData(data:any, currentPage:number): void {
    this._gridModel.setExternalData(data, currentPage);
  }

  public searchProcessReset(): void {
    this._gridModel.searchProcessReset();
  }

  /**
   * 그리드 생성
   * @param {header[]} headers
   * @param {ScrollLoadingGridModel} gridModel
   * @param {Option} option
   * @param {number} ruleIdx
   * @param {number} totalRowCnt
   */
  public create(headers: Header[], gridModel: ScrollLoadingGridModel, option: Option = null, ruleIdx: number, totalRowCnt: number) {

    // 기존 그리드 삭제
    this.destroy();

    // Header 검사
    if (0 === headers.length) {
      throw new TypeError('Invalid header value.');
    }

    // 옵션 검사
    if (!(null === option)) {
      this._option = JSON.stringify(option) === '{}' ? this._GRID_DEFAULT_OPTION : option;
    } else {
      this._option = this._GRID_DEFAULT_OPTION;
    }

    // DualSelectionActivate 옵션 활성화시
    // 헤더 목록 처음에 아이디 프로퍼트 컬럼의 헤더 데이터 추가
    if (this._option.dualSelectionActivate) {
      headers.unshift(new SlickGridHeader()
        .Id(ScrollLoadingGridComponent.ID_PROPERTY)
        .Name(!this._option.enableSeqSort ? '' : 'SEQ')
        .Field(ScrollLoadingGridComponent.ID_PROPERTY)
        .Behavior('select')
        .CssClass(`dual_selection${ScrollLoadingGridComponent.ID_PROPERTY}`)
        .CssClass('txt-center')
        .Width(this._option.enableSeqSort ? 60 : 0)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(this._option.enableSeqSort)
        .Formatter((_row, _cell, value, columnDef) => {
          if (this._option.enableHeaderClick && columnDef.id === ScrollLoadingGridComponent.ID_PROPERTY) {
            return '<div style=\'line-height:30px;\'>' + '&middot;' + '</div>';
          } else {
            return value
          }
        })
        .build()
      );
    }

    // 그리드 모델 정의
    this._gridModel = gridModel;


    // this._gridModel.

    // 데이터 전체 카운트 & ruleIdx
    if(this._gridModel) {
      this._gridModel.setTotalRowCnt(totalRowCnt);
      this._gridModel.setRuleIndex(ruleIdx);
    }

    // 그리드 생성
    this._grid = this._generateGrid(headers, gridModel);

    // horizontal_scroll_in_histogram_area
    const naviAgent: string = navigator.userAgent.toLowerCase();
    let ieBrowser: boolean = false;

    if(naviAgent.indexOf('msie') > 0 || naviAgent.indexOf('trident/') > 0 || naviAgent.indexOf('edge/') > 0) {
      ieBrowser = true;
    }
    if(ieBrowser === false){
      $('.slick-headerrow').css('overflow-x','auto');
      $('.slick-header').css('overflow-x','auto');
    }
    // horizontal_scroll_in_histogram_area

    // 그리드 이벤트 연결
    this._bindEvent(this._grid, gridModel);
  } // function - grid

  /**
   * 그리드 코어 오브젝트 반환
   */
  public getGridCore() {
    return this._grid;
  } // function - getGridCore

  /**
   * 그리드의 jQuery Object 반환
   * @returns {JQuery}
   */
  public getGridJQueryObject() {
    return $(`#${this._GRID_ID}`);
  } // function - getGridJQueryObject

  /**
   * 그리드 실행
   */
  public execGrid() {
    this._grid.init();
  } // function - execGrid

  /**
   * 그리드 제거 함수
   */
  public destroy() {

    if (this._grid) {
      this._grid.invalidate();
      this._grid.destroy();
    }
    this._grid = null;
    this._option = null;
    this._gridModel = null;

  } // function - destroy

  /**
   * 검색
   * @param {string} searchText
   */
  public search(searchText: string = '') {
    try {
      this._gridModel.search(searchText);
    } catch (e) {
      // 오류 로그 출력
      console.error(e);
    }
  } // function - search

  // -------------------------------------------------------------------------------------------------------------------
  // 레아아웃 관련
  // -------------------------------------------------------------------------------------------------------------------

  // noinspection JSUnusedGlobalSymbols
  /**
   * 그리드 리사이징
   *  - 윈도우 리사이징은 이벤트가 걸려 있지만, 그리드 엘리먼트의 크기를 변경해서 그리드 컴포넌트의 크기가 변경 되는 경우에는 resize() 함수를 통해서
   *  resizeCanvas() 를 호출해야한다
   * @param scope
   */
  public resize(scope: any = null): void {

    const fnScope: any = scope ? scope : this;

    // 그리드 resizeCanvas() 호출
    fnScope._grid.resizeCanvas();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 선택 관련
  // -------------------------------------------------------------------------------------------------------------------

  // noinspection JSUnusedGlobalSymbols
  /**
   * 데이터뷰에서 선택된 로우 데이터 전체 목록
   * @param scope
   * @returns {any[]}
   */
  public getSelectedRows(scope: any = null): any[] {

    const fnScope: any = scope === null ? this : scope;

    // let rows: any[] =
    //   fnScope._grid.getSelectedRows()
    //     .map(rowIndex => fnScope.dataView.getItem(rowIndex));
    const rows: any[] =
      fnScope._grid.getSelectedRows().map(rowIndex => fnScope._gridModel.data[rowIndex]);

    return _.cloneDeep(rows);
  } // function - getSelectedRows

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * 컬럼 선택
   * @param {string} id -- UUID
   * @param {boolean|string} isSelectOrToggle
   * @param {string} type 컬럼 타입
   * @param {{ isShiftKeyPressed?: boolean, isCtrlKeyPressed?: boolean, batchCount:number }} opts 부가정보
   */
  public selectColumn(id: string, isSelectOrToggle: boolean | string, type?: string,
                      opts?: { isShiftKeyPressed?: boolean, isCtrlKeyPressed?: boolean, batchCount?:number }): void {

    (opts) || (opts = {});

    // get column index with column id
    const columnIdx = this._grid.getColumnIndex(id);

    let isSelect: boolean;
    if ('string' === typeof isSelectOrToggle && 'TOGGLE' === isSelectOrToggle) {
      isSelect = (0 === this._selectColumnIds.filter(item => item === id).length);
    } else {
      isSelect = isSelectOrToggle as boolean;
    }

    // 선택 컬럼 목록 변경
    this._selectColumnIds = this._selectColumnIds.filter(item => item !== id);
    (isSelect) && (this._selectColumnIds.push(id));

    // 이벤트 발생
    (this._grid.getColumns()[columnIdx]) && (this._grid.getColumns()[columnIdx]['select'] = isSelect);

    const selectedColumnData = {
      id: id,
      isSelect: isSelect,
      selectColumnIds: this._selectColumnIds,
      shiftKey: opts.isShiftKeyPressed,
      ctrlKey: opts.isCtrlKeyPressed,
      batchCount: opts.batchCount
    };
    (type) && (selectedColumnData['type'] = type); // 타입이 있을때만 같이 보냄
    this.selectedHeaderEvent.emit(selectedColumnData);

    // 스타일 업데이트
    this._grid.invalidate();
    this._grid.render();

  } // function - selectColumn

  // noinspection JSUnusedGlobalSymbols
  /**
   * 컬럼 전체 선택
   */
  public columnAllSelection(): void {
    const cntTotalCols:number = this._grid.getColumns().length;
    this._grid.getColumns().forEach(item => this.selectColumn(item.id, true, null, { batchCount : cntTotalCols } ));
  } // function - columnAllSelection

  // noinspection JSUnusedGlobalSymbols
  /**
   * 컬럼 전체 선택 해제
   */
  public columnAllUnSelection(): void {
    const cntTotalCols:number = this._grid.getColumns().length;
    this._grid.getColumns().forEach(item => this.selectColumn(item.id, false, null, { batchCount : cntTotalCols } ));
  } // function - columnAllUnSelection

  // noinspection JSUnusedGlobalSymbols
  /**
   * 컬럼 선택
   * @param {string} id
   */
  public columnSelection(id: string): void {
    this.selectColumn(id, true);
  } // function - columnSelection

  // noinspection JSUnusedGlobalSymbols
  /**
   * 컬럼 선택 해제
   * @param {string} id
   */
  public columnUnSelection( id: string): void {
    this.selectColumn(id, false);
  } // function - columnUnSelection

  // noinspection JSUnusedGlobalSymbols
  /**
   * 컬럼 선택 변경
   * @param {string} id
   */
  public columnSelectionToggle(id: string): void {
    this.selectColumn(id, 'TOGGLE');
  } // function - columnSelectionToggle

  // noinspection JSUnusedGlobalSymbols
  /**
   * 로우 전체 선택
   * @param scope
   */
  public rowAllSelection(scope: any = null): void {

    const fnScope: any = scope === null ? this : scope;

    const rRows: any[] = [];

    // 그리드에 보여지고 있는 로우의 숫자
    // const gridRowLength = fnScope.dataView.getLength();
    const gridRowLength = fnScope._gridModel.data.length;
    for (let index: number = 0; index < gridRowLength; index += 1) {
      rRows.push(index);
    }

    fnScope._grid.setSelectedRows(rRows);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * 로우 선택
   * @param index
   */
  public rowSelection(index): void {
    // console.log('index', index);
    this._selectedRows = index;
    if (this._gridSelectionModelType === 'cell') {
      this.rowAllUnSelection();
    }
    this._gridSelectionModelType = 'row';
    this._grid.setSelectedRows(index);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * 로우 전체 선택해제
   * @param scope
   */
  public rowAllUnSelection(scope: any = null): void {
    const fnScope: any = scope === null ? this : scope;
    fnScope._grid.setSelectedRows([]);
    this._selectedRows = [];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 그리드 생성
   * @param {header[]} headers
   * @param {ScrollLoadingGridModel} gridModel
   * @private
   */
  private _generateGrid(headers: Header[], gridModel: ScrollLoadingGridModel) {

    // 그리드 생성
    const grid = new Slick.Grid(`#${this._GRID_ID}`, gridModel.data, headers, this._option);

    // 툴팁 플러그인 추가
    const autoTooltips = new Slick.AutoTooltips({ enableForHeaderCells: true });
    grid.registerPlugin(autoTooltips);

    // 자동 컬럼 리사이징 플러그인 추가
    const autoSize = new Slick.AutoColumnSize(true);
    grid.registerPlugin(autoSize);

    // 컬럼 그룹화 플러그인 기능 활성화
    if (true === this._option.columnGroup) {
      const plugin: any = new Slick.ColumnGroup();
      grid.registerPlugin(plugin);
    }

    // 그리드 로우 선택 기능 활성화
    grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));

    if (this._option.enableHeaderMenu) {
      // Header menu plugin
      const headerButtonsPlugin = new Slick.Plugins.HeaderButtons();
      headerButtonsPlugin.onCommand.subscribe((e, args) => {

        const contextMenuParam = {
          columnName: args.button.command,
          index: args.button.index,
          left: e.pageX,
          top: e.pageY,
          columnType: args.button.type
        };

        if (args.button.timestampStyle){ // only if column is timestamp type
          contextMenuParam['timestampStyle'] = args.button.timestampStyle;
        }

        this.onContextMenuClick.emit(contextMenuParam);
        grid.invalidate();

      });
      grid.registerPlugin(headerButtonsPlugin);
    }

    grid.getContainerNode().querySelector('.slick-header').addEventListener('scroll', (_event)=>{
      if(grid.getContainerNode().querySelector('.slick-viewport').scrollLeft !== grid.getContainerNode().querySelector('.slick-header').scrollLeft)
      grid.getContainerNode().querySelector('.slick-viewport').scrollLeft = grid.getContainerNode().querySelector('.slick-header').scrollLeft;
    });


    if (this.isCellExternalCopyManagerActivate()) {

      if (false === this._option.enableCellNavigation) {
        this._option.enableCellNavigation = true;
      }

      // 셀 드래그 옵션 초기화
      this.initCellExternalCopyManager(grid);
    } else {

      // 그리드 로우 선택 기능 활성화
      grid.setSelectionModel(
        new Slick.RowSelectionModel({ selectActiveRow: false })
      );
    }

    return grid;
  } // function - _generateGrid

  /**
   * Grid horizaltal scroll timer
   * @param {number} viewPortLeftPx
   * @private
   */
  private fixGridScroll(viewPortLeftPx: number): void {
    if(this._gridTimer) {clearTimeout(this._gridTimer);}
    this._gridTimer = setTimeout(() => {this._currentScrollLeft = viewPortLeftPx;this._grid.invalidate();this._grid.render();}, 400);
  }


  /**
   * Grid onScroll 이벤트 발생
   * @private
   */
  private allContextMenuClose(): void {
    this.onGridContextCloseEvent.emit();
  }

  /**
   * 그리드 이벤트 연결
   * @param grid
   * @param {ScrollLoadingGridModel} gridModel
   * @private
   */
  private _bindEvent(grid, gridModel: ScrollLoadingGridModel) {

    // 그리드 스크롤 이벤트 정의
    grid.onViewportChanged.subscribe(() => {
      const viewPort = grid.getViewport();
      gridModel.ensureData(viewPort.top, viewPort.bottom);
      const viewPortLeftPx: number = viewPort.leftPx;
      if(this._currentScrollLeft !==  viewPortLeftPx) {
        this.fixGridScroll(viewPortLeftPx)
      }
    });

    // 그리드 스크롤 이벤트
    grid.onScroll.subscribe((_e: any, _args:any) => {
      this.allContextMenuClose();
    });


    // 로더 이벤트 정의
    gridModel.onDataLoading.subscribe(() => {
      if (!this._loadingIndicator) {
        this._loadingIndicator = this.$('<span class=\'loading-indicator\'><label>Buffering...</label></span>').appendTo(document.body);
        const $grid = this.$(`#${this._GRID_ID}`);
        this._loadingIndicator
          .css('position', 'absolute')
          .css('top', $grid.position().top + $grid.height() / 2 - this._loadingIndicator.height() / 2)
          .css('left', $grid.position().left + $grid.width() / 2 - this._loadingIndicator.width() / 2);
      }
      this._loadingIndicator.show();
    });

    gridModel.onDataLoaded.subscribe((_e, args) => {

      // 데이터 업데이트
      grid.setData(gridModel.data);

      if (0 === args.from) {
        grid.invalidate();
      } else {
        for (let idx = args.from, nMax = args.to; idx <= nMax; idx++) {
          grid.invalidateRow(idx);
        }
      }
      grid.updateRowCount();
      grid.render();
      (this._loadingIndicator) && (this._loadingIndicator.fadeOut());
    });
    // load the first page
    grid.onViewportChanged.notify();


    // 로더 이벤트 정의 - more complete
    gridModel.onMoreDataComplete.subscribe(() => {
      this.moreEventAfterSelectRow();
    });

    // -----------------------------------------------------------------------------------------------------------------
    //  onClick
    //    - 클릭 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    if (this._option.dualSelectionActivate) {
      grid.onClick.subscribe((event, args) => {

        if (!this._clickEnabled) {
          return;
        }

        setTimeout(() => this._clickEnabled = true, 300);

        this._clickEnabled = false;

        //noinspection JSValidateJSDoc
        /**
         * 1. 선택된 로우 데이터
         * 2. 선택 여부
         * 3. 이벤트 오브젝트
         * 4. 에러 여부
         *
         * @type {{row: any; selected: any; event: any; error: boolean}}
         */
        const result = {
          event,
          row: null,
          selected: null,
          error: false
        };

        try {

          // 로우 인덱스 값
          const rowIndex: number = args.row;

          // 로우 인덱스로 로우 데이터 추출
          // const row: any = scope.dataView.getItem(rowIndex);
          const row: any = this._gridModel.data[rowIndex];

          // 로우 데이터가 없으면
          if (row === this._ROW_EMPTY) {
            //noinspection ExceptionCaughtLocallyJS
            throw Error('Row is empty.');
          }

          if (this._option.dualSelectionActivate) {
            if (args.cell === 0) {

              if (this._gridSelectionModelType === 'cell') {

                this._gridSelectionModelType = 'row';

                // 전체 선택 해제
                this.rowAllUnSelection();
              }

              // 그리드 로우 선택 기능 활성화
              this._initRowSelectionModel(this);

              if (this._option.enableMultiSelectionWithCtrlAndShift) {
                this._rowClickWithCtrlShiftOption(this, row, result, rowIndex);
              } else {
                this._onClickRowSelection(this, row, result, rowIndex);
              }
            } else {

              this._gridSelectionModelType = 'cell';

              // 컬럼 전체 선택 해제
              this.columnAllUnSelection();

              // 전체 선택 해제
              this.rowAllUnSelection();

              this.initCellExternalCopyManager(this._grid);
            }
          } else {
            if (this._option.enableMultiSelectionWithCtrlAndShift) {
              this._rowClickWithCtrlShiftOption(this, row, result, rowIndex);
            } else {
              this._onClickRowSelection(this, row, result, rowIndex);
            }
          }

          result.row = row;
          this._grid.invalidate();
          this._grid.render();
        } catch (e) {

          // 에러 발생 여부
          result.error = true;

          // 에러 정보 출력
          console.error(e);
        } finally {

          // 클릭 이벤트 발생
          this.selectedEvent.emit(result);
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderClick
    //    - 헤더 클릭 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    if (this._option.enableHeaderClick) {
      grid.onHeaderClick.subscribe((event, args) => {

        if (this._columnResized) {
          this._columnResized = false;
          return;
        }
        // cell 이 선택되어있다면 reset
        if (this._gridSelectionModelType === 'cell') {
          // 전체 선택 해제
          this.rowAllUnSelection();
          this._initRowSelectionModel(this);
        }

        if (this._option.enableMultiSelectionWithCtrlAndShift
          && event.metaKey === false && event.ctrlKey === false && event.shiftKey === false) {
          this.columnAllUnSelection();
        }

        // Seq header 선택 block
        if (args.column.name === '') {
          return;
        }
        if (args.column.columnType === 'MAP' || args.column.columnType === 'ARRAY') {
          this.selectColumn(
            args.column.id, 'TOGGLE', args.column.columnType,
            { isShiftKeyPressed: event.shiftKey, isCtrlKeyPressed: (event.metaKey || event.ctrlKey) }
          );
        } else {
          this.selectColumn(
            args.column.id, 'TOGGLE', null,
            { isShiftKeyPressed: event.shiftKey, isCtrlKeyPressed: (event.metaKey || event.ctrlKey) }
          );
        }
        this._columnResized = false;
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderRowCellRendered
    //  - 헤더 아래 컬럼이 render 했을때
    // -----------------------------------------------------------------------------------------------------------------

    if (this._option.showHeaderRow) {
      if (this._option.headerRowHeight !== 25) {
        $('.slick-viewport').css('top', this._option.headerRowHeight + 30 + 'px');
      }
      grid.onHeaderRowCellRendered.subscribe((_event, args) => {
        this.onHeaderRowCellRendered.emit(args);
      });
    }


    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderRowCellRendered
    //  - 헤더 아래 컬럼이 render 했을때
    // -----------------------------------------------------------------------------------------------------------------
    grid.onColumnsResized.subscribe(() => {
      for (let i = 0, totI = this._grid.getColumns().length; i < totI; i++) {
        const column = this._grid.getColumns()[i];
        this._columnResized = true;
        // Check if column width has changed
        if (column.width !== column.previousWidth) {
          this.onColumnResize.emit({ idx: i, field : column.field,name: column.name, uuid : column.id, width: column.width });
          setTimeout(() => {
            this._columnResized = false;
          }, 300);
        }
      }
    });


    // -----------------------------------------------------------------------------------------------------------------
    // 윈도우 리사이징에 대한 이벤트 처리
    // -----------------------------------------------------------------------------------------------------------------

    $(window).resize(() => {
      setTimeout(() => {
        if (typeof this._grid !== 'undefined') {
          this.resize();
        }
      }, 500);
    });

  } // function - _bindEvent


  /**
   * MORE 이벤트 > 로우 선택 표시
   * @private
   */
  private moreEventAfterSelectRow(): void {
    if(this._gridSelectionModelType !== 'row') return;
    this._grid.setSelectedRows(this._selectedRows);
  }



  /**
   * 클릭 이벤트 > 로우 선택 표시
   * @param scope
   * @param row
   * @param {{event: any, row: any, selected: any, error: boolean}} result
   * @param {number} rowIndex
   * @private
   */
  private _onClickRowSelection(scope: any, row: any, result: { event: any; row: any; selected: any; error: boolean }, rowIndex: number): void {

    const idProperty: string = ScrollLoadingGridComponent.ID_PROPERTY;
    result.selected = !(scope.getSelectedRows().some(selectedRow => selectedRow[idProperty] === row[idProperty]));

    if (result.selected) {
      if (scope._option.multiSelect === false) {
        scope._grid.setSelectedRows([rowIndex]);
      } else {
        const selectedRows: any[] = scope._grid.getSelectedRows();
        selectedRows.push(rowIndex);
        scope._grid.setSelectedRows(selectedRows);
      }
    } else {
      let selectedRows: any[] = scope._grid.getSelectedRows();
      selectedRows = selectedRows.filter(selectedRowIndex => String(selectedRowIndex) !== String(rowIndex));
      scope._grid.setSelectedRows(selectedRows);
    }
  } // function - _onClickRowSelection

  /**
   * 클릭 이벤트 > 로우 선택 표시
   * @param scope
   * @param row
   * @param {{event: any, row: any, selected: any, error: boolean}} result
   * @param {number} rowIndex
   * @private
   */
  private _rowClickWithCtrlShiftOption(scope: any, row: any, result: { event: any; row: any; selected: any; error: boolean }, rowIndex: number): void {

    const idProperty: string = ScrollLoadingGridComponent.ID_PROPERTY;
    const selectedList: any[] = scope.getSelectedRows();
    let currentSelected: boolean = false;
    if(selectedList==null || selectedList.length === 0) {
        result.selected = true;
    }else{
      if(row.hasOwnProperty(idProperty)) {
        for(let i: number = 0, nMax = selectedList.length; i < nMax; i = i + 1) {
          if(selectedList[i] === undefined) continue;
          if(selectedList[i].hasOwnProperty(idProperty) === false) continue;
          if(selectedList[i][idProperty] === row[idProperty]) {
              currentSelected = true;
              break;
          }
        }
      }
      result.selected = !currentSelected;
    }

    const isDisableOptionKey: boolean = (
      result.event.metaKey === false && result.event.ctrlKey === false && result.event.shiftKey === false
    );

    let selectedRows: any[] = [];
    if (result.selected) {
      if (scope._option.multiSelect) {
        if (isDisableOptionKey) {
          selectedRows = scope._grid.getSelectedRows();
          selectedRows.push(rowIndex);
        }
      } else {
        if (!isDisableOptionKey) {
          selectedRows = scope._grid.getSelectedRows();
        }
        selectedRows.push(rowIndex);
      }
      scope._grid.setSelectedRows(selectedRows);
    } else {
      if (isDisableOptionKey) {
        if (scope._grid.getSelectedRows().indexOf(row[idProperty] - 1) > -1) {
          scope._grid.setSelectedRows([row[idProperty] - 1]);
        }
      } else {
        selectedRows = scope._grid.getSelectedRows().filter(selectedRowIndex => String(selectedRowIndex) !== String(rowIndex));
        scope._grid.setSelectedRows(selectedRows);
      }
    }

  } // function - _rowClickWithCtrlShiftOption

  // noinspection JSMethodCanBeStatic
  /**
   * Row 선택 모델 초기화
   * @param scope
   * @private
   */
  private _initRowSelectionModel(scope) {
    scope._grid.setSelectionModel(
      new Slick.RowSelectionModel({ selectActiveRow: false })
    );
  } // function - _initRowSelectionModel

  /**
   * 그리드 유니크 아이디 생성
   * @returns {string}
   * @private
   */
  private _createGridUniqueId(): string {
    const date: Date = new Date();
    const timestamp: string =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString();
    return 'myGrid' + '_' + timestamp + '_' + this._generateUUID();
  } // function - _createGridUniqueId

  /**
   * UUID 생성
   * @returns {string}
   * @private
   */
  private _generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const d = new Date().getTime();
      const r = (d + Math.random() * 16) % 16 | 0;
      // d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  } // function - _generateUUID

  /**
   * 셀 드래그 옵션 초기화
   * @param grid
   */
  private initCellExternalCopyManager(grid): void {

    grid.setSelectionModel(
      new Slick.CellSelectionModel({ selectActiveRow: false })
    );

    const cellCopyManager = new Slick.CellExternalCopyManager();
    cellCopyManager.init(grid);
  }

  /**
   * 셀 복사 붙여넣기 기능 활성화 여부 검사
   * @returns {boolean}
   */
  private isCellExternalCopyManagerActivate(): boolean {
    return true === this._option.cellExternalCopyManagerActivate;
  }

}
