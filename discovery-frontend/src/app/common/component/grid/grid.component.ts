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
import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GridOption, Option } from './grid.option';
import { header, SlickGridHeader } from './grid.header';
import { saveAs } from 'file-saver';
import { isNumeric } from 'rxjs/util/isNumeric';

declare const jQuery_1_7;
declare const Slick: any;

@Component({
  selector: '[grid-component]',
  templateUrl: './grid.component.html',
  styleUrls: [
    '../../../../assets/grid/slick.grid.css',         // slickGrid default css
    '../../../../assets/grid/slick.columnpicker.css', // columnpicker plugin css
    '../../../../assets/grid/slick.grid.override.css', // slickGrid custom css
    '../../../../assets/grid/slick.headerbuttons.css', // slickGrid header button css
    '../../../../assets/grid/slick.headermenu.css' // slickGrid header button css
  ]
})
export class GridComponent implements AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Fixed jQuery version 1.7
  private $ = jQuery_1_7;
  // 클릭 이벤트 타임아웃 체크
  private clickEnabled: boolean = true;

  // -------------------------------------------------------------------------------------------------------------------
  // 상수
  // -------------------------------------------------------------------------------------------------------------------

  // 그리드를 생성할 DIV 아이디 PREFIX
  private GRID_TARGET_ID: string = 'myGrid';
  // 그리드에서 사용하는 total 로우 아이디
  private GRID_TOTAL_ID: string = 'total';
  // 로우 데이터가 없는 경우 -1
  private ROW_EMPTY: number = -1;
  // 아이디
  private ID_PROPERTY: string = '_idProperty_';

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 관련 변수
  // -------------------------------------------------------------------------------------------------------------------

  public grid;
  public dataView;
  private option: Option;
  private fields: string[] = [];
  private isGridCreated: boolean;
  private isError: boolean;
  private GRID_DEFAULT_OPTION: Option;
  private DATA_VIEW_DEFAULT_OPTION: Object = {
    groupItemMetadataProvider: null,
    inlineFilters: false
  };
  private gridSelectionModelType: string = '';

  private _selectColumnIds: string[] = []; // 선택된 컬럼의 아이디 목록 저장

  private columnResized : boolean = false;
  // -------------------------------------------------------------------------------------------------------------------
  // 이벤트
  // -------------------------------------------------------------------------------------------------------------------

  // 로우 선택시 알림
  @Output() private selectedEvent = new EventEmitter();
  // 정렬 변경시 알림
  @Output() private sortingEvent = new EventEmitter();
  // 헤더 선택시 알림
  @Output() private selectedHeaderEvent = new EventEmitter();

  @Output() private selectedHeaderMenuEvent = new EventEmitter();

  @Output() private onColumnResize = new EventEmitter();

  @Output() private onHeaderRowCellRendered = new EventEmitter();

  @Output() private onContextMenuClick = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(public elementRef: ElementRef) {

    // 그리드 유니크 아이디 생성
    this.createGridUniqueId();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngAfterViewInit(): void {

    // 그리드 기본 옵션
    this.GRID_DEFAULT_OPTION = new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .build();
  }

  public ngOnDestroy(): void {

    // 그리드 제거 함수
    this.destroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 전체 데이터에 대해서 비활성 처리??
   */
  public invalidateAllRows() {
    this.grid.invalidateAllRows();
  } // function - invalidateAllRows

  /**
   * 그리드 제거 함수
   */
  public destroy() {
    if (this.grid) {
      $(window).off();
      this.grid.invalidate();
      this.grid.destroy();
    }
    this.fields = [];
    this.grid = null;
    this.dataView = null;
  } // function - destroy

  /**
   * CSV file download
   */
  public csvDownload(fileName: string = ''): void {

    const rows: any[] = [];

    const header: any[] = [];
    this.fields
      .forEach((headerName, index) => {
        // if (index === 0 && this.option.dualSelectionActivate) {
        //   header.push(' ');
        // } else {
        //   header.push(headerName);
        // }
        header.push('"' + headerName + '"');
      });

    rows.push(header.join(','));

    this.getRows()
      .forEach((column) => {
        const obj: any[] = [];
        this.fields.forEach((headerName, index) => {
          // if (index === 0 && this.option.dualSelectionActivate) {
          //   obj.push(column['_idProperty_']);
          // } else {
          //   obj.push(column[headerName]);
          // }
          obj.push('"' + column[headerName] + '"');
        });
        rows.push(obj.join(','));
      });

    this.downloadCSV(rows.join('\n'), _.isEmpty(fileName) ? this.createTimeStamp() : fileName);
  }


  /**
   * Excel file download
   */
  public excelDownload(fileName: string = ''): void {

    const rows: any[] = [];

    const header: any[] = [];
    this.fields
      .forEach((headerName, index) => {
        // if (index === 0 && this.option.dualSelectionActivate) {
        //   header.push(' ');
        // } else {
        //   header.push(headerName);
        // }
        header.push('"' + headerName + '"');
      });

    rows.push(header.join(','));

    this.getRows()
      .forEach((column) => {
        const obj: any[] = [];
        this.fields.forEach((headerName, index) => {
          // if (index === 0 && this.option.dualSelectionActivate) {
          //   obj.push(column['_idProperty_']);
          // } else {
          //   obj.push(column[headerName]);
          // }
          obj.push('"' + column[headerName] + '"');
        });
        rows.push(obj.join(','));
      });

    this.downloadExcel(rows.join('\n'), _.isEmpty(fileName) ? this.createTimeStamp() : fileName);
  } // function - excelDownload

  /**
   * Active Cell 을 전부 취소??
   */
  public resetActiveCell() {
    $(this.grid.getActiveCellNode()).removeClass('ddp-selected');
    this.grid.resetActiveCell();
  } // function - resetActiveCell

  // -------------------------------------------------------------------------------------------------------------------
  // 데이터 반환 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 데이터뷰 전체 로우 데이터 목록
   * @returns {any[]}
   */
  public getGridRows(): any[] {
    return _.cloneDeep(
      this.dataView.getItems()
    );
  }

  /**
   * 데이터뷰에서 선택된 로우 데이터 전체 목록
   * @param scope
   * @returns {any[]}
   */
  public getSelectedRows(scope: any = null): any[] {

    const fnScope: any = scope === null ? this : scope;

    let rows: any[] =
      fnScope.grid.getSelectedRows()
        .map(rowIndex => fnScope.dataView.getItem(rowIndex));

    if (true === fnScope.option.frozenTotal) {
      rows = rows
        .filter(row => row.id.toString() !== fnScope.GRID_TOTAL_ID);
    }

    return _.cloneDeep(rows);
  }

  /**
   * 그리드에 보여지고 있는 로우 데이터 목록
   * @param scope
   * @returns {any[]}
   */
  public getRows(scope: any = null): any[] {

    const fnScope: any = scope === null ? this : scope;

    let rRows: any[] = [];

    // 그리드에 보여지고 있는 로우의 숫자
    const gridRowLength = fnScope.dataView.getLength();
    for (let index: number = 0; index < gridRowLength; index += 1) {
      const row: Object = fnScope.dataView.getItem(index);
      if (!('undefined' === typeof row)) {
        rRows.push(row);
      }
    }

    if (true === fnScope.option.frozenTotal) {
      rRows = rRows
        .filter(row => row.id.toString() !== fnScope.GRID_TOTAL_ID);
    }

    return _.cloneDeep(rRows);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 선택 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 컬럼 전체 선택
   * @param scope
   */
  public columnAllSelection(scope: any = null): void {
    const fnScope: any = scope === null ? this : scope;
    fnScope.grid.getColumns().forEach(item => {
      this.columnSelection(item.id, true);
    });
  } // function - columnAllSelection

  /**
   * 컬럼 전체 선택 해제
   * @param scope
   */
  public columnAllUnSelection(scope: any = null): void {
    const fnScope: any = scope === null ? this : scope;
    fnScope.grid.getColumns().forEach(item => {
      this.columnUnSelection(item.id, false);
    });
  } // function - columnAllUnSelection

  /**
   * 컬럼 선택
   * @param {number | string} column
   * @param scope
   */
  public columnSelection(column: number | string, scope: any = null,): void {
    this.selectColumn(column, true);
  } // function - columnSelection

  /**
   * row 선택 효과
   * @param {number | string} column
   * @param scope
   */
  public selectRowActivate(column: number | string, scope: any = null,): void {

    const fnScope: any = scope === null ? this : scope;

    const selectedRows: any[] = [];
    selectedRows.push(column);
    fnScope.grid.setSelectedRows(selectedRows);
  } // function - selectRowActivate


  /**
   * 현재의 sort column 상태 변경
   * @param isAsc - ASC : true, DESC : false
   * @param scope
   */
  public setCurrentSortColumns(isAsc : boolean, scope: any = null,): void {

    const fnScope: any = scope === null ? this : scope;
    let arr = [];
    const columnsList = fnScope.grid.getColumns();
    for (let index: number = 0; index < columnsList.length; index++) {
      let obj = {
        columnId : columnsList[index]['id'],
        sortAsc : isAsc
      };
      arr.push(obj);
    }
    fnScope.grid.setSortColumns(arr, isAsc);

  } // function - setCurrentSortColumn

  /**
   * 컬럼 선택 해제
   * @param {number | string} column
   * @param scope
   */
  public columnUnSelection(column: number | string, scope: any = null,): void {
    this.selectColumn(column, false);
  } // function - columnUnSelection

  /**
   * 컬럼 선택 변경
   * @param {number | string} column
   * @param scope
   */
  public columnSelectionToggle(column: number | string, scope: any = null,): void {
    this.selectColumn(column, 'TOGGLE');
  } // function - columnSelectionToggle

  /**
   * 로우 전체 선택
   * @param scope
   */
  public rowAllSelection(scope: any = null): void {

    const fnScope: any = scope === null ? this : scope;

    let rRows: any[] = [];

    // 그리드에 보여지고 있는 로우의 숫자
    const gridRowLength = fnScope.dataView.getLength();
    for (let index: number = 0; index < gridRowLength; index += 1) {
      rRows.push(index);
    }

    if (true === fnScope.option.frozenTotal) {

      rRows = rRows
        .filter((rowIndex) => {
          const row: any = fnScope.dataView.getItem(rowIndex);
          return row.id.toString() !== fnScope.GRID_TOTAL_ID;
        });
    }

    fnScope.grid.setSelectedRows(rRows);
  }

  /**
   * 로우 선택
   * @param index
   */
  public rowSelection(index): void {
    if (this.gridSelectionModelType === 'cell') {
      this.rowAllUnSelection();
    }
    this.gridSelectionModelType = 'row';
    this.grid.setSelectedRows(index);
  }

  /**
   * 로우 전체 선택해제
   * @param scope
   */
  public rowAllUnSelection(scope: any = null): void {

    const fnScope: any = scope === null ? this : scope;
    fnScope.grid.setSelectedRows([]);
  }

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

    const fnScope: any = scope === null ? this : scope;

    // 그리드 resizeCanvas() 호출
    fnScope.grid.resizeCanvas();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 생성 / 검색 / 추가 / 삭제 / 데이터 변경
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 그리드 생성
   * @param {header[]} headers
   * @param {any[]} rows
   * @param {Option} option
   * @returns {boolean}
   */
  public create(headers: header[], rows: any[], option: Option = null): boolean {

    try {

      // 기존 그리드 삭제
      this.destroy();

      // 아이디 중복나지 않도록 처리
      // _idProperty_ 는 그리드 컴포넌트 내부에서 사용하는 값이므로 사용하지 말 것
      rows.forEach((row, index) => row._idProperty_ = index + 1);

      // 헤더에 아이디 필드를 만들고 로우에 id 값을 넣지 않은 경우에는 _idProperty_ 값으로
      // 덮어 씌워질 수 있음 ( 확인이 필요 )
      // 로우의 아이디 값은 필수이므로 없는 경우 _idProperty_ 값을 id에 넣어준다
      if (rows.length > 0) {
        if (typeof rows[0].id === 'undefined') {
          rows.forEach(row => row.id = row._idProperty_);
        }
      }

      this.isGridCreated = false;

      // 변수 초기화
      this.fields = [];

      // 파라메터 검사
      this.validationParams(headers, option);

      // 검색에 사용할 필드이름 목록 생성
      this.createSearchFields(headers);

      // DualSelectionActivate 옵션 활성화시
      // 헤더 목록 처음에 아이디 프로퍼트 컬럼의 헤더 데이터 추가
      if (this.option.dualSelectionActivate) {
        headers.unshift(new SlickGridHeader()
          .Id(this.ID_PROPERTY)
          .Name(!this.option.enableSeqSort ? '' : 'No.')
          .Field(this.ID_PROPERTY)
          .Behavior('select')
          .CssClass(`dual_selection${this.ID_PROPERTY}`)
          .CssClass('txt-center')
          .Width(this.option.enableSeqSort ? 60 : 0)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(this.option.enableSeqSort)
          .Formatter((function (scope) {
            return function (row, cell, value, columnDef, dataContext) {
              if (scope.option.enableHeaderClick && columnDef.id === '_idProperty_') {
                return '<div style=\'line-height:30px;\'>' + '&middot;' + '</div>';
              } else {
                return value
              }
            };
          })(this))
          .build()
        );
      }

      // 그리드 생성
      this.createGrid(headers, rows);

      // 그리드 이벤트 바인딩
      this.bindingGridEvents();
    } catch (e) {

      this.isGridCreated = true;

      $(window).off();

      // 오류 로그 출력
      console.error(e);
    }

    return this.isGridCreated;
  }

  /**
   * display no data
   * @returns {boolean}
   */
  public noShowData(){
    this.destroy();
    return true;
  }

  /**
   * 검색
   * @param {string} searchText
   * @param {string[]} searchFields
   * @returns {boolean}
   */
  public search(searchText: string = '', searchFields: string[] = []): boolean {

    try {

      this.isError = false;

      // 검색에 사용할 필드명 유효성 검사
      this.validationSearchFields(searchFields);

      // 선택표시 전체 해제
      this.grid.setSelectedRows([]);

      // 검색 실행
      this.executeFilter(searchText, GridComponent.isAllSearch(searchFields) ? this.fields : searchFields);

      // dataView refresh
      this.dataView.refresh();

      // grid invalidate
      this.grid.invalidate();
    } catch (e) {

      this.isError = true;

      // 오류 로그 출력
      console.error(e);
    }

    return this.isError;
  }

  /**
   * 워크벤치 전체 선택시 호출할 함수
   */
  public allSelection(): void {

    if (this.getSelectedRows().length > 0) {
      this.rowAllUnSelection();
    } else {
      this.rowAllSelection();
    }

    // 그리드의 캔버스 엘리먼트 클릭 처리
    this.clickGridCanvasElement(this);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 수정 필요... 아래 함수들은 사용 x
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 데이터뷰에 로우 데이터 추가
   * @param {any[]} row
   * @returns {boolean}
   */
  public addRow(row: any[]): boolean {

    try {

      this.isError = false;

      // 로우 Array 값이 0 인 경우 || 로우 Array 길이가 1 보다 큰 경우
      if (0 === row.length || 1 < row.length) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Only one array length is allowed. Array length : ${row.length}`);
      }

      // 추가할 로우 데이터
      const aRow: any = row[0];
      // 추가할 로우 아이디
      const rowId = aRow.id;

      const gridRows: any[] = this.getGridRows();
      if (0 < gridRows.length) {
        // noinspection JSMismatchedCollectionQueryUpdate
        const row: any[] = gridRows
          .filter(row => String(row.id) === String(rowId));

        if (0 < row.length) {

          //noinspection ExceptionCaughtLocallyJS
          throw new Error(`An already existing ID has been used. ID: ${rowId}`);
        } else {

          // 데이터뷰에 로우 데이터 추가
          gridRows.push(aRow);

          // 데이터뷰에 데이터 갱신
          this.dataView.setItems(gridRows);
        }
      } else {

        // 데이터뷰에 데이터 갱신
        this.dataView.setItems([aRow]);
      }

      // 데이터뷰 refresh
      this.dataView.refresh();

      // 그리드 invalidate
      this.grid.invalidate();
    } catch (e) {

      this.isError = true;

      // 오류 로그 출력
      console.error(e);
    }

    return this.isError;
  }

  /**
   * 로우 아이디로 로우 삭제
   * @param {string} rowId
   * @returns {boolean}
   */
  public deleteRowByRowId(rowId: string): boolean {

    try {

      this.isError = false;

      // 로우 아이디 값이 있는지 검사
      if (_.isEmpty(rowId)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Row id is empty. ID: ${rowId}`);
      }

      // 데이터뷰에서 로우 삭제
      this.dataView.deleteItem(rowId);

      // 데이터뷰 로우 갱신
      this.dataView.setItems(this.dataView.getItems());

      // dataView refresh
      this.dataView.refresh();

      // grid invalidate
      this.grid.invalidate();
    } catch (e) {

      this.isError = true;

      // 오류 로그 출력
      console.error(e);
    }

    return this.isError;
  }

  // /**
  //  * 데이터뷰 전체 로우 데이터 변경
  //  * @param {any[]} rows
  //  * @returns {boolean}
  //  */
  // public changeRows(rows: any[]): boolean {
  //
  //   try {
  //
  //     this.isError = false;
  //
  //     // 그리드에 Rows 갱신
  //     this.dataView.setItems(rows);
  //
  //     // 그리드 refresh
  //     this.dataView.refresh();
  //
  //     // 그리드 invalidate
  //     this.grid.invalidate();
  //   } catch (e) {
  //
  //     this.isError = true;
  //
  //     // 오류 로그 출력
  //     console.error(e);
  //   }
  //
  //   return this.isError;
  // }
  //
  // /**
  //  * 로우 아이디 목록을 이용해서 현재 보여지고 있는 그리드 로우 데이터 선택하는 기능
  //  * @param {any[]} rowIds
  //  * @param scope
  //  */
  // public selectedRowByRowIds(rowIds: any[], scope: any = null): void {
  //
  //   const fnScope: any = scope === null ? this : scope;
  //
  //   const eRows: any[] = [];
  //
  //   // 그리드에 보여지고 있는 로우의 숫자
  //   const gridRowLength = fnScope.dataView.getLength();
  //   for (let index: number = 0; index < gridRowLength; index += 1) {
  //
  //     const row: Object = fnScope.dataView.getItem(index);
  //     if (!('undefined' === typeof row)) {
  //       eRows.push(row);
  //     }
  //   }
  //
  //   const rowIndexs: any[] = [];
  //   let index: number = 1;
  //   eRows.forEach((eRow) => {
  //     rowIds.forEach((id) => {
  //       if (eRow.id === id) {
  //         rowIndexs.push(index);
  //       }
  //     });
  //     index += 1;
  //   });
  //
  //   const selectedRows: any[] = fnScope.grid.getSelectedRows();
  //   rowIndexs.forEach(rowIndex => selectedRows.push(fnScope.getRowIndexByRowId(rowIndex)));
  //
  //   fnScope.grid.setSelectedRows(selectedRows);
  // }
  //
  // /**
  //  * 아이디로 선택되어 있는 로우의 선택 해제
  //  * @param rowId
  //  * @param scope
  //  */
  // public unSelectedRowByRowId(rowId: any, scope: any = null): void {
  //
  //   const fnScope: any = scope === null ? this : scope;
  //
  //   fnScope.grid.setSelectedRows(
  //           fnScope.grid.getSelectedRows()
  //                   .filter(rowIndex => fnScope.getRowByRowIndex(rowIndex) !== fnScope.ROW_EMPTY)
  //                   .filter(rowIndex => String(fnScope.getRowByRowIndex(rowIndex).id) !== String(rowId))
  //                   .map(rowIndex => rowIndex)
  //   );
  // }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -------------------------------------------------------------------------------------------------------------------
  // 선택 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 컬럼 선택
   * @param {number | string} column
   * @param {boolean} isSelectOrToggle
   * @param scope
   * @param isShiftKeyPressed shiftkey가 눌렸는지 여부
   * @param isCtrlKeyPressed ctrlKey가 눌렸는지 여부
   * @param type 컬럼 타입
   */
  public selectColumn(column: number | string, isSelectOrToggle: boolean | string, scope: any = null, isShiftKeyPressed?:boolean, isCtrlKeyPressed?:boolean, type?: string): void {

    const fnScope: any = scope === null ? this : scope;

    let columnId = '';

    if ('string' === typeof column) {
      columnId = column;
    } else if ('number' === typeof column) {
      columnId = fnScope.grid.getColumns()[column].id;
    } else {
      throw new Error('Invalid column information!!');
    }

    let isSelect = false;
    if ('string' === typeof isSelectOrToggle && 'TOGGLE' === isSelectOrToggle) {
      isSelect = ( 0 === this._selectColumnIds.filter(item => item === columnId).length );
    } else {
      isSelect = <boolean>isSelectOrToggle;
    }

    // 선택 컬럼 목록 변경
    if (this.option.multiSelect === false) {
      this._selectColumnIds = ( isSelect ) ? [columnId] : [];
    } else {
      this._selectColumnIds = this._selectColumnIds.filter(item => item !== columnId);
      ( isSelect ) && ( this._selectColumnIds.push(columnId) );
    }

    // 이벤트 발생
    fnScope.grid.getColumns().forEach( item => {
      item['select'] = ( -1 < this._selectColumnIds.indexOf( item.id ) );
    });

    let selectedColumnData = {
      id: columnId,
      isSelect: isSelect,
      selectColumnIds: this._selectColumnIds,
      shiftKey : isShiftKeyPressed,
      ctrlKey : isCtrlKeyPressed
    };

    if (type) { // 타입이 있을때만 같이 보냄
      selectedColumnData['type'] = type;
    }

    fnScope.selectedHeaderEvent.emit(selectedColumnData);

    // 스타일 업데이트
    this.grid.invalidate();
    this.grid.render();

  } // function - selectColumn

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 생성에서 사용하는 함수
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 검색에 사용할 필드 목록를 생성한다
   * @param {header[]} headers
   */
  private createSearchFields(headers: header[]): void {

    headers.forEach((header) => {

      const fieldName: string = header['field'];
      if (!('undefined' === typeof fieldName)) {
        this.fields.push(fieldName);
      }
    });
  }

  /**
   * 그리드 생성
   * @param {header[]} headers
   * @param {any[]} rows
   */
  private createGrid(headers: header[], rows: any[]): void {

    // 데이터 뷰 생성
    this.dataView = new Slick.Data.DataView(this.DATA_VIEW_DEFAULT_OPTION);
    this.dataView.beginUpdate();
    this.dataView.setItems(rows);
    this.dataView.endUpdate();

    this.elementRef.nativeElement.children[0].id = this.GRID_TARGET_ID;

    // 그리드 생성
    this.grid = new Slick.Grid(`#${this.GRID_TARGET_ID}`, this.dataView, headers, this.option);

    // 툴팁 플러그인 추가
    const autoTooltips = new Slick.AutoTooltips({ enableForHeaderCells: true });
    this.grid.registerPlugin(autoTooltips);

    // 자동 컬럼 리사이징 플러그인 추가
    const autoSize = new Slick.AutoColumnSize(true);
    this.grid.registerPlugin(autoSize);

    // 컬럼 그룹화 플러그인 기능 활성화
    if (true === this.option.columnGroup) {
      const plugin: any = new Slick.ColumnGroup();
      this.grid.registerPlugin(plugin);
    }

    if (this.isCellExternalCopyManagerActivate()) {

      if (false === this.option.enableCellNavigation) {
        this.option.enableCellNavigation = true;
      }

      // 셀 드래그 옵션 초기화
      this.initCellExternalCopyManager(this);
    } else {

      // 그리드 로우 선택 기능 활성화
      this.grid.setSelectionModel(
        new Slick.RowSelectionModel({ selectActiveRow: false })
      );
    }

    if (true === this.option.frozenTotal) {

      const rowsHeight: number = this.getRowsHeight();
      if (rows.length > rowsHeight) {
        this.option.frozenRow = 1;
        this.option.frozenBottom = true;
      } else {
        this.option.frozenRow = -1;
        this.option.frozenBottom = false;
      }

      this.grid.setOptions(this.option);

    }

    if (this.option.enableHeaderMenu) {

      // Header menu plugin
      let headerButtonsPlugin = new Slick.Plugins.HeaderButtons();
      headerButtonsPlugin.onCommand.subscribe((function (scope) {
          return function (e, args) {
            scope.onContextMenuClick.emit({columnName : args.button.command, index : args.button.index, left : e.pageX, top : e.pageY, columnType : args.button.type });
            scope.grid.invalidate();
          };
        })(this)
      );
      this.grid.registerPlugin(headerButtonsPlugin);

    }

  }

  /**
   * 그리드 이벤트 바인딩
   */
  private bindingGridEvents(): void {

    // -----------------------------------------------------------------------------------------------------------------
    //  onSelectedRowsChanged
    //    - select row 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    if( this.option.rowSelectionActivate ) {
      this.grid.onClick.subscribe(
        (function (scope) {
          return function (event, args) {

            const rowIndex: number = args.row;

            if (args.cell !== 0) {
              scope.gridSelectionModelType = 'cell';

              // 컬럼 전체 선택 해제
              scope.columnAllUnSelection();

              // 전체 선택 해제
              scope.rowAllUnSelection();

              // 셀 드래그 옵션 초기화
              scope.initCellExternalCopyManager(scope);
              return;
            }

            scope.gridSelectionModelType = 'row';

            // 그리드 로우 선택 기능 활성화
            scope.initRowSelectionModel(scope);
            scope.selectRowActivate(rowIndex);

          };
        })(this)
      );
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  onSort
    //    - sorting 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    this.grid.onSort
      .subscribe(
        (function (scope) {
          return function (event, args) {
            try {

              if (scope.isCellExternalCopyManagerActivate()) {
                scope.grid.setSelectedRows([]);
              } else {
                // 정렬 변경시에는 선택 표시 유지를 위해서 sync
                scope.dataView.syncGridSelection(scope.grid, true);
              }

              let totalRow: any = null;

              if (true === scope.option.frozenTotal) {

                const rowsHeight: number = this.getRowsHeight();

                if (scope.dataView.getLength() > rowsHeight) {
                  scope.option['frozenRow'] = 1;
                  scope.option['frozenBottom'] = true;
                } else {
                  scope.option['frozenRow'] = -1;
                  scope.option['frozenBottom'] = false;
                }

                scope.grid.setOptions(scope.option);
                scope.grid.invalidate();

                totalRow = _.cloneDeep(
                  scope.getRowByRowIndex(scope.getRowIndexByRowId(scope.GRID_TOTAL_ID))
                );

                if (!(-1 === totalRow)) {
                  scope.deleteRowByRowId(scope.GRID_TOTAL_ID);
                }
              }

              const cols = args.sortCols;

              // 기본적으로 사용하는 정렬 함수
              const sort = () => scope.dataView.sort((row1, row2) => {
                for (let index: number = 0; index < cols.length; index += 1) {
                  const field = cols[index].sortCol.field;
                  const sign = cols[index].sortAsc ? 1 : -1;

                  if (_.isNil(row1[field]) || row1[field] === '') {
                    row1[field] = " ";
                  }

                  if (_.isNil(row2[field]) || row2[field] === '') {
                    row2[field] = " ";
                  }

                  const value1 = isNumeric(row1[field]) ? Number(row1[field]) : row1[field];
                  const value2 = isNumeric(row2[field]) ? Number(row2[field]) : row2[field];

                  const result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                  if (!(0 === result)) {
                    return result;
                  }
                }
                return 0;
              });

              // 멀티 셀렉트 옵션 사용시
              if (scope.option.dualSelectionActivate) {

                // 아이디 헤더 선택시
                if (scope.isHeaderFieldIdProperty(args)) {
                  scope.dataView.sort((row1, row2) => {
                    for (let index: number = 0; index < cols.length; index += 1) {
                      const field = cols[index].sortCol.field;
                      const sign = cols[index].sortAsc ? 1 : -1;
                      const value1 = Number(row1[field]);
                      const value2 = Number(row2[field]);
                      const result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                      if (!(0 === result)) {
                        return result;
                      }
                    }
                    return 0;
                  });
                } else {
                  sort();
                }
              } else {
                sort();
              }

              if (true === scope.option.frozenTotal) {
                if (!(null === totalRow) && !(-1 === totalRow)) {
                  scope.addRow([totalRow]);
                  scope.dataView.getItemMetadata(scope.getRows().length - 1);
                }
              }

              scope.grid.invalidate();
              scope.grid.render();

              scope.clickGridCanvasElement(scope);
            } catch (e) {
              console.error(e);
            } finally {
              scope.sortingEvent.emit();
            }
          };
        })(this)
      );

    // -----------------------------------------------------------------------------------------------------------------
    //  onClick
    //    - 클릭 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    if (!this.isCellExternalCopyManagerActivate() || this.option.dualSelectionActivate) {
      this.grid.onClick.subscribe(
        (function (scope) {
          return function (event, args) {

            if (!scope.clickEnabled) {
              return;
            }

            setTimeout(() => scope.clickEnabled = true, 300);

            scope.clickEnabled = false;

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
              const row: any = scope.dataView.getItem(rowIndex);

              // 로우 데이터가 없으면
              if (row === scope.ROW_EMPTY) {
                //noinspection ExceptionCaughtLocallyJS
                throw Error('Row is empty.');
              }

              if (scope.option.dualSelectionActivate) {
                if (args.cell === 0) {

                  if (scope.gridSelectionModelType === 'cell') {

                    scope.gridSelectionModelType = 'row';

                    // 전체 선택 해제
                    scope.rowAllUnSelection();
                  }

                  // 그리드 로우 선택 기능 활성화
                  scope.initRowSelectionModel(scope);

                  scope.option.enableMultiSelectionWithCtrlAndShift ? scope.rowClickWithCtrlShiftOption(scope, row, result, rowIndex) : scope.onClickRowSelection(scope, row, result, rowIndex);
                } else {

                  scope.gridSelectionModelType = 'cell';

                  // 컬럼 전체 선택 해제
                  scope.columnAllUnSelection();

                  // 전체 선택 해제
                  scope.rowAllUnSelection();

                  // 셀 드래그 옵션 초기화
                  scope.initCellExternalCopyManager(scope);
                }
              } else {

                scope.option.enableMultiSelectionWithCtrlAndShift ? scope.rowClickWithCtrlShiftOption(scope, row, result, rowIndex) : scope.onClickRowSelection(scope, row, result, rowIndex);
              }

              result.row = row;
              scope.grid.invalidate();
              scope.grid.render();
            } catch (e) {

              // 에러 발생 여부
              result.error = true;

              // 에러 정보 출력
              console.error(e);
            } finally {

              // 클릭 이벤트 발생
              scope.selectedEvent.emit(result);
            }
          };
        })(this)
      );
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  onRowCountChanged
    //    - DataView의 Row 숫자가 변경되면 발생하는 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    this.dataView.onRowCountChanged.subscribe(
      (function (scope) {
        return function () {

          if (true === scope.option.frozenTotal) {

            const rowsHeight: number = this.getRowsHeight();

            if (scope.dataView.getLength() > rowsHeight) {
              scope.option.frozenRow = 1;
              scope.option.frozenBottom = true;
            } else {
              scope.option.frozenRow = -1;
              scope.option.frozenBottom = false;
            }

            scope.grid.setOptions(scope.option);
            scope.grid.invalidate();
          }

          scope.grid.updateRowCount();
          scope.grid.render();
        };
      })(this)
    );

    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderClick
    //    - 헤더 클릭 이벤트
    // -----------------------------------------------------------------------------------------------------------------

    if (this.option.enableHeaderClick) {
      this.grid.onHeaderClick.subscribe(
        (function (scope) {
          return function (event, args) {

            if (scope.columnResized) {
              scope.columnResized = false;
              return;
            }
            // cell 이 선택되어있다면 reset
            if (scope.gridSelectionModelType === 'cell') {
              // 전체 선택 해제
              scope.rowAllUnSelection();
              scope.initRowSelectionModel(scope);
            }

            if (scope.option.enableMultiSelectionWithCtrlAndShift) {
              if ((event.metaKey === false && event.ctrlKey === false) && event.shiftKey === false) {
                scope.columnAllUnSelection(scope);
              }
            }

            // Seq header 선택 block
            if (args.column.name === '') {
              return;
            }

            if (args.column.columnType === 'MAP' || args.column.columnType === 'ARRAY') {
              scope.selectColumn(args.column.id, 'TOGGLE', null, event.shiftKey, (event.metaKey || event.ctrlKey), args.column.columnType);
            } else {
              scope.selectColumn(args.column.id, 'TOGGLE', null, event.shiftKey, (event.metaKey || event.ctrlKey));
            }
            scope.columnResized = false;
          };
        })(this)
      );
    }

    if (this.option.editable) {
      this.grid.onActiveCellChanged.subscribe(
        (function (scope) {
          return function (event, args) {
            setTimeout(() => {
              if (scope.grid && args.row && args.cell) {
                $(scope.grid.getCellNode(args.row, args.cell)).find('input').focus();
              }
            }, 500);
          };
        })(this)
      );
    }

    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderRowCellRendered
    //  - 헤더 아래 컬럼이 render 했을때
    // -----------------------------------------------------------------------------------------------------------------

    if (this.option.showHeaderRow) {
      if (this.option.headerRowHeight !== 25) {
        $('.slick-viewport').css('top', this.option.headerRowHeight + 30 + 'px');
      }
      this.grid.onHeaderRowCellRendered.subscribe(
        (function (scope) {
          return function (event, args) {
            scope.onHeaderRowCellRendered.emit(args);

          };
        })(this))
    }


    // -----------------------------------------------------------------------------------------------------------------
    //  onHeaderRowCellRendered
    //  - 헤더 아래 컬럼이 render 했을때
    // -----------------------------------------------------------------------------------------------------------------
    this.grid.onColumnsResized.subscribe(
      (function (scope) {
        return function (event, args) {
          for (let i = 0, totI = scope.grid.getColumns().length; i < totI; i++) {
            let column = scope.grid.getColumns()[i];
            scope.columnResized = true;
            //Check if column width has changed
            if (column.width != column.previousWidth) {
              scope.onColumnResize.emit({ idx: i, name: column.id, width: column.width });
              setTimeout(function () { scope.columnResized = false; }, 300);
            }
          }
        }
      })(this)
    );

    // -----------------------------------------------------------------------------------------------------------------
    //  onScroll
    //  - 스크롤 이벤트
    // -----------------------------------------------------------------------------------------------------------------
    // this.grid.onScroll.subscribe(
    //   (function(scope) {
    //     return function () {
    //       console.info('arguments =-- > ', arguments);
    //     }
    //   })(this)
    // );
    // -----------------------------------------------------------------------------------------------------------------
    // 윈도우 리사이징에 대한 이벤트 처리
    // -----------------------------------------------------------------------------------------------------------------

    $(window).resize(() => {
      setTimeout(() => {
        const scope = this;
        if (typeof scope.grid !== 'undefined') {
          scope.resize();
        }
      }, 500);
    });

  }

  private initRowSelectionModel(scope) {
    scope.grid.setSelectionModel(
      new Slick.RowSelectionModel({ selectActiveRow: false })
    );
  }

// -------------------------------------------------------------------------------------------------------------------
  // 그리드 검색에서 사용하는 함수
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 전체 필드에서 검색이라면
   * @param {string[]} searchFields
   * @returns {boolean}
   */
  private static isAllSearch(searchFields: string[]): boolean {
    return searchFields.length === 0;
  }

  /**
   * 검색 실행
   * @param {string} searchText
   * @param {string[]} fields
   */
  private executeFilter(searchText: string, fields: string[]): void {

    if (_.isEmpty(searchText) && 0 === searchText.length) {

      this.dataView.setFilter(() => {
        return true;
      });
    } else {

      this.dataView.setFilter((row) => {

        let isValue = false;
        fields.forEach((key) => {

          if (-1 < String(row[key]).toLocaleUpperCase().indexOf(searchText.toLocaleUpperCase())) {
            isValue = true;
          }

          if (this.GRID_TOTAL_ID === row.id) {
            isValue = this.option.frozenTotal === true;
          }
        });
        return isValue;
      });
    }
  }

  /**
   * 검색 필드 유효성 검사
   *  - 생성시점에 만들어진 헤더의 필드정보랑 비교 검색하려는 필드 값이 헤더에 없는 필드명이면 예외가 발생
   * @param {string[]} fields
   */
  private validationSearchFields(fields: string[]): void {

    fields.forEach((argSearchField) => {

      let isCheckedField = false;
      this.fields.forEach((field) => {
        if (argSearchField === field) {
          isCheckedField = true;
        }
      });

      if (!isCheckedField) {
        throw new Error(`Not found '${argSearchField}' field name.`);
      }
    });
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 내부에서 로우 오브젝트를 찾기위한 함수 ( 인덱스 | 로우 아이디를 이용 )
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 데이터뷰 데이터에서 로우 인덱스로 로우 데이터 추출
   * @param {number} rowIndex
   * @param scope
   * @returns {any | number}
   */
  private getRowByRowIndex(rowIndex: number, scope: any = null): any | number {
    const fnScope: any = scope === null ? this : scope;
    const fnRowIndex: number = typeof rowIndex !== 'number' ? Number(rowIndex) : rowIndex;
    const row: Object = fnScope.dataView.getItemByIdx(fnRowIndex);
    return typeof row === 'undefined' ? fnScope.ROW_EMPTY : row;
  }

  /**
   * 데이터뷰에서 로우의 아이디로 로우의 인덱스를 구한다
   * @param rowId
   * @returns {any | number}
   */
  private getRowIndexByRowId(rowId: any): any | number {
    const rowIndex: number = this.dataView.getIdxById(rowId);
    return typeof rowIndex === 'undefined' ? this.ROW_EMPTY : rowIndex;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 검색에서 사용하는 함수
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 그리드 유니크 아이디 생성
   */
  private createGridUniqueId(): void {
    const date: Date = new Date();
    const timestamp: string =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString();
    this.GRID_TARGET_ID = this.GRID_TARGET_ID + '_' + timestamp + '_' + this.generateUUID();
  }

  /**
   * @returns {number}
   */
  private getRowsHeight(): number {
    return Math.floor(this.$(this.GRID_TARGET_ID)
      .find('.slick-pane-top').height() / this.option.rowHeight);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 그리드 옵션 체크를 위한 함수
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 셀 복사 붙여넣기 기능 활성화 여부 검사
   * @returns {boolean}
   */
  private isCellExternalCopyManagerActivate(): boolean {
    return true === this.option.cellExternalCopyManagerActivate;
  }

  // -------------------------------------------------------------------------------------------------------------------
  //
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 그리드를 만들기 전에 파라메터 유효성 검사
   * @param {header[]} headers
   * @param {Option} option
   */
  private validationParams(headers: header[], option: Option): void {

    // Header 검사
    if (0 === headers.length) {

      throw new TypeError('Invalid header value.');
    }

    // 옵션 검사
    if (!(null === option)) {
      this.option = JSON.stringify(option) === '{}' ? this.GRID_DEFAULT_OPTION : option;
    } else {
      this.option = this.GRID_DEFAULT_OPTION;
    }
  }

  /**
   * 셀 드래그 옵션 초기화
   * @param scope
   */
  private initCellExternalCopyManager(scope): void {

    scope.grid.setSelectionModel(
      new Slick.CellSelectionModel({ selectActiveRow: false })
    );

    const cellCopyManager = new Slick.CellExternalCopyManager();
    cellCopyManager.init(scope.grid);
  }

  /**
   * 클릭 이벤트 > 로우 선택 표시
   * @param scope
   * @param row
   * @param {event: any; row: any; selected: any; error: boolean} result
   * @param {number} rowIndex
   */
  private onClickRowSelection(scope: any, row: any, result: { event: any; row: any; selected: any; error: boolean }, rowIndex: number): void {

    const hasRow: any[] = scope.getSelectedRows()
      .filter(selectedRow => String(selectedRow[this.ID_PROPERTY]) === String(row[this.ID_PROPERTY]));

    result.selected = hasRow.length <= 0;
    if (result.selected) {
      if (this.option.multiSelect === false) {
        const selectedRows: any[] = [];
        selectedRows.push(rowIndex);
        scope.grid.setSelectedRows(selectedRows);
      } else {
        const selectedRows: any[] = scope.grid.getSelectedRows();
        selectedRows.push(rowIndex);

        scope.grid.setSelectedRows(selectedRows);
      }
    } else {
      let selectedRows: any[] = scope.grid.getSelectedRows();
      selectedRows = selectedRows
        .filter(selectedRowIndex => String(selectedRowIndex) !== String(rowIndex));

      scope.grid.setSelectedRows(selectedRows);
    }
  }

  /**
   * 헤더 필드가 아이디 프로퍼티인 경우
   * @param args
   * @returns {boolean}
   */
  private isHeaderFieldIdProperty(args): boolean {
    return args.sortCols[0].sortCol.field === this.ID_PROPERTY;
  }

  /**
   * 그리드의 캔버스 엘리먼트 클릭 처리
   * @param scope
   */
  private clickGridCanvasElement(scope): void {
    scope.elementRef.nativeElement
      .querySelector('.slick-viewport')
      .querySelector('.grid-canvas')
      .click();
  }

  /**
   *
   * @param e
   * @returns {boolean}
   */
  private isIdPropertyAreaDrag(e): boolean {
    return e.target.className.indexOf('dual_selection_idProperty') === -1;
  }

  /**
   * TimeStamp 생성
   * @returns {string}
   */
  private createTimeStamp(): string {

    const date: Date = new Date();
    const timestamp: string =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString() +
      date.getDate().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getMilliseconds().toString();
    return timestamp;
  }

  /**
   * UUID 생성
   * @returns {string}
   */
  private generateUUID(): string {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   * CSV download 실행
   * @param csv
   * @param filename
   */
  private downloadCSV(csv, filename): void {
    saveAs(new Blob(['\ufeff' + csv], { type: 'application/csv;charset=utf-8' }), filename + '.csv');
  }

  /**
   * Excel download 실행
   * @param xlsx
   * @param filename
   */
  private downloadExcel(xlsx, filename): void {
    saveAs(new Blob(['\ufeff' + xlsx], { type: 'application/vnd.ms-excel;charset=charset=utf-8' }), filename + '.xls');
  }

  /**
   * 클릭 이벤트 > 로우 선택 표시
   * @param scope
   * @param row
   * @param {event: any; row: any; selected: any; error: boolean} result
   * @param {number} rowIndex
   */
  private rowClickWithCtrlShiftOption(scope: any, row: any, result: { event: any; row: any; selected: any; error: boolean }, rowIndex: number): void {

    let selectedRows : any[] = [];
    const hasRow: any[] = scope.getSelectedRows()
      .filter(selectedRow => String(selectedRow[this.ID_PROPERTY]) === String(row[this.ID_PROPERTY]));
    result.selected = hasRow.length <= 0;

    if (result.selected) {
      if (this.option.multiSelect === false) {
        if (!((result.event.metaKey === false && result.event.ctrlKey === false) && result.event.shiftKey === false)) {
          selectedRows = scope.grid.getSelectedRows();
        }
        selectedRows.push(rowIndex);
      } else {
        if ((result.event.metaKey === false && result.event.ctrlKey === false) && result.event.shiftKey === false) {
          selectedRows = scope.grid.getSelectedRows();
          selectedRows.push(rowIndex);
        }
      }
      scope.grid.setSelectedRows(selectedRows);
    } else {
      if ((result.event.metaKey === false && result.event.ctrlKey === false) && result.event.shiftKey === false) {

        if (scope.grid.getSelectedRows().indexOf(row['_idProperty_']-1) > -1) {
          scope.grid.setSelectedRows([row['_idProperty_']-1]);
        }
      } else {
        selectedRows = scope.grid.getSelectedRows().filter(selectedRowIndex => String(selectedRowIndex) !== String(rowIndex));
        scope.grid.setSelectedRows(selectedRows);
      }
    }

  }

}
