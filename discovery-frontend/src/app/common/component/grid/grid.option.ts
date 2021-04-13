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

declare const Slick: any;

export class GridOption {
  /* tslint:disable:variable-name function-name */

  private _dualSelectionActivate: boolean = false;

  /**
   * CellExternalCopyManager 플러그인 사용 여부
   *  - 그리드 드래그 셀 선택 기능 ( 엑셀 복사 붙여기 )
   *    해당 기능은 로우 선택 기능과 동시에 사용할 수 없기때문에 해당 기능을 활성화하면 클릭 이벤트가 동작하지 않는다
   */
  private _cellExternalCopyManagerActivate: boolean = false;

  /**
   * slick.columngroup.js 컬럼 그룹화 플러그인 사용을 위한 옵션
   *
   * @type {boolean}
   * @private
   */
  private _columnGroup: boolean = false;

  /**
   * SlickGrid 기본 옵션이 아니고 커스텀으로 추가한 옵션입니다
   * 옵션을 true 로 사용하면 적용되며 그리드에 로우 숫자가 컨텐츠 사이즈를 초과하면 합계 로우를 맨 마지막에 고정 시키고 로우의 숫자가 컨텐츠의 사이즈보다 작을 경우는 로우의 마지막에 표시됩니다
   * FrozenTotal 옵션을 사용하면 FrozenBottom, FrozenRow 값은 override 되서 사용할 수 없습니다
   *
   * @type {boolean}
   * @private
   */
  private _frozenTotal: boolean = false;

  /**
   * SlickGrid가 특정 측정을 수행하고 이벤트 리스너를 초기화 할 수 있으려면 그리드가 작성되는 컨테이너가 DOM에 있어야하며 레이아웃에 참여해야합니다 (can be 'visibility:hidden' but not 'display:none')
   * 일반적으로이 작업은 SlickGrid 인스턴스를 만들 때 수행됩니다.
   * 선택적으로 위의 조건이 충족 될 때까지 초기화를 연기하고 grid.init() 메서드를 명시 적으로 호출 할 수 있습니다.
   * 명시적 초기화를 사용하려면 explicitInitialization 옵션을 true로 설정.
   *
   * e.g )
   *
   *     <script>
   *            var grid;
   *            var columns = [
   *                {id: "title", name: "Title", field: "title"},
   *                {id: "duration", name: "Duration", field: "duration"},
   *                {id: "%", name: "% Complete", field: "percentComplete"},
   *                {id: "start", name: "Start", field: "start"},
   *                {id: "finish", name: "Finish", field: "finish"},
   *                {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
   *            ];
   *            var options = {
   *              enableCellNavigation: true,
   *              enableColumnReorder: false,
   *              explicitInitialization: true
   *            };
   *            $(function () {
   *              var data = [];
   *              for (var i = 0; i < 500; i++) {
   *                data[i] = {
   *                  title: "Task " + i,
   *                  duration: "5 days",
   *                  percentComplete: Math.round(Math.random() * 100),
   *                  start: "01/01/2009",
   *                  finish: "01/05/2009",
   *                  effortDriven: (i % 5 == 0)
   *                };
   *              }
   *              // create a detached container element
   *              var myGrid = $("<div id='myGrid' style='width:600px;height:500px;'></div>");
   *              grid = new Slick.Grid(myGrid, data, columns, options);
   *              myGrid.appendTo($("#myTable"));
   *              grid.init();
   *           })
   *    </script>
   *
   * @type {boolean}
   * @private
   */
  private _explicitInitialization: boolean = false;

  /**
   *
   * @type {number}
   * @private
   */
  private _rowHeight: number = 25;

  /**
   *
   * @type {number}
   * @private
   */
  private _defaultColumnWidth: number = 80;

  /**
   * True인 경우 빈 행이 하단에 표시됩니다.
   * 행의 입력 값은 새 행을 추가합니다. 값을 저장하려면 onAddNewRow를 구독해야 합니다.
   *
   * @type {boolean}
   * @private
   */
  private _enableAddRow: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _leaveSpaceForNewRows: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _editable: boolean = false;

  /**
   * 작은 지연 후에 셀 편집기 부하를 비동기식으로 만듭니다. 따라서 키보드 탐색 속도가 크게 향상됩니다.
   *
   * @type {boolean}
   * @private
   */
  private _asyncEditorLoading: boolean = false;

  /**
   * 셀 편집기가 로드된 후 지연됩니다.
   * asyncEditorLoading이 true가 아닌 경우 무시됩니다.
   *
   * @type {number}
   * @private
   */
  private _asyncEditorLoadDelay: number = 100;

  /**
   *
   * @type {number}
   * @private
   */
  private _asyncPostRenderDelay: number = 50;

  /**
   * 선택한 경우 셀은 자동으로 편집 모드로 전환되지 않습니다.
   *
   * @type {boolean}
   * @private
   */
  private _autoEdit: boolean = true;

  /**
   * 수직 스크롤이 비활성화됩니다.
   *
   * @type {boolean}
   * @private
   */
  private _autoHeight: boolean = false;

  /**
   * flashCell() function 을 사용해서 깜박이는 셀에 적용할 CSS 클래스명.
   *
   * @type {string}
   * @private
   */
  private _cellFlashingCssClass: string = 'flashing';

  /**
   *
   * @type {any}
   * @private
   */
  private _dataItemColumnValueExtractor: string = null;

  /**
   * 다른 formatter가 지정되지 않은 경우 기본 값 formatter 적용.
   */
  private _defaultFormatter: any = Slick.defaultFormatter;

  /**
   * 지정된 셀의 에디터를 작성하는 팩토리 객체입니다.
   * getEditor (column)를 구현해야합니다.
   *
   * @type {any}
   * @private
   */
  private _editorFactory: string = null;

  /**
   * 데이터를 동시에 편집 하는 경우 제어를 위해서 사용할 Slick.EditorLock 인스턴스입니다.
   */
  private _editorLock: any = Slick.GlobalEditorLock;

  /**
   * True이면 비동기 Post렌더링이 발생하고 열에 대한 asyncPostRender function이 호출됩니다.
   *
   * @type {boolean}
   * @private
   */
  private _enableAsyncPostRender: boolean = false;

  /**
   * 대규모 데이터 세트로 최적화 된 속도를 위해 셀 가상화를 가능하게합니다
   *
   * @type {boolean}
   * @private
   */
  private _enableCellNavigation: boolean = true;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _enableColumnReorder: boolean = true;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _enableTextSelectionOnCells: boolean = false;

  /**
   * 컬럼 크기를 컨테이너에 맞춥니다 (수평 스크롤 방지) 컬럼 넓이를 조정할 수 있도록 컬럼 넓이를 효과적으로 설정합니다.
   * 작은 컨테이너에 있는 컬럼은 바람직하지 않을 수 있다.
   *
   * @type {boolean}
   * @private
   */
  private _forceFitColumns: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _forceSyncScrolling: boolean = false;

  /**
   * 지정된 셀의 포맷터를 작성하는 팩토리 객체입니다.
   * getFormatter(column)을 구현해야 합니다.
   *
   * @type {any}
   * @private
   */
  private _formatterFactory: string = null;

  /**
   * 테이블 행 div가 컨테이너의 전체 너비로 확장되고 테이블 셀 div가 왼쪽 정렬됩니다.
   *
   * @type {boolean}
   * @private
   */
  private _fullWidthRows: boolean = false;

  /**
   *
   * @type {number}
   * @private
   */
  private _headerRowHeight: number = 25;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _multiColumnSort: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _multiSelect: boolean = true;

  /**
   *
   * @type {string}
   * @private
   */
  private _selectedCellCssClass: string = 'selected';

  /**
   *
   * @type {boolean}
   * @private
   */
  private _showHeaderRow: boolean = false;

  /**
   *
   * @type {number}
   * @private
   */
  private _topPanelHeight: number = 25;

  /**
   * setHighlightedCells() function 을 사용해서 강조 표시된 셀에 적용할 CSS 클래스명.
   *
   * @type {string}
   * @private
   */
  private _cellHighlightCssClass: string = 'selected';

  /**
   * Not listed as a default under options in slick.grid.js
   *
   * e.g) Slick.queueAndExecuteCommand
   */
  private _editCommandHandler: any;

  /**
   * WARNING : SlickGrid 2.1에 해당 옵션 deprecated
   *
   * @type {any}
   * @private
   */
  private _enableCellRangeSelection: string = null;

  /**
   * WARNING : SlickGrid 2.1에 해당 옵션 deprecated
   *
   * @type {any}
   * @private
   */
  private _enableRowReordering: string = null;

  /**
   * True이면 크기가 조정되는 컬럼은 마우스가 드래그하고있을 때 해당 넓이를 변경합니다. 거짓이면 마우스 드래그 끝에 열이 크기 조정됩니다.
   *
   * @type {boolean}
   * @private
   */
  private _syncColumnCellResize: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _showTopPanel: boolean = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  private _frozenBottom: boolean = false;

  /**
   *
   * @type {number}
   * @private
   */
  private _frozenColumn: number = -1;

  /**
   *
   * @type {number}
   * @private
   */
  private _frozenRow: number = -1;

  /**
   * 헤더 클릭 기능 활성 여부
   * @type {boolean} : 활성여부
   * @private
   */
  private _enableHeaderClick: boolean = false;

  /**
   * cell type에 따라서 css 적용 여부
   * @type {boolean} : 활성여부
   * @private
   */
  private _nullCellStyleActivate: boolean = false;

  /**
   * context menu사용 여부
   * @type {boolean} : 활성여부
   * @private
   */
  private _enableHeaderMenu: boolean = false;

  /**
   * enable sort when dualSelectionActivate
   * @type {boolean} : 활성여부
   * @private
   */
  private _enableSeqSort: boolean = true;

  /**
   * enable multi selection (header) with ctrl, shift key
   * @type {boolean} : 활성여부
   * @private
   */
  private _enableMultiSelectionWithCtrlAndShift: boolean = false;

  /**
   * No. row seleted
   * @type {boolean} : 활성여부
   * @private
   */
  private _enableRowSelected: boolean = false;

  constructor() {
  }

  get rowSelectionActivate(): boolean {
    return this._enableRowSelected;
  }

  RowSelectionActivate(value: boolean): GridOption {
    this._enableRowSelected = value;
    return this;
  }

  get dualSelectionActivate(): boolean {
    return this._dualSelectionActivate;
  }

  // noinspection JSUnusedGlobalSymbols
  DualSelectionActivate(value: boolean): GridOption {
    this._dualSelectionActivate = value;
    return this;
  }

  get cellExternalCopyManagerActivate(): boolean {
    return this._cellExternalCopyManagerActivate;
  }

  // noinspection JSUnusedGlobalSymbols
  CellExternalCopyManagerActivate(value: boolean): GridOption {
    this._cellExternalCopyManagerActivate = value;
    return this;
  }

  get columnGroup(): boolean {
    return this._columnGroup;
  }

  //noinspection JSUnusedGlobalSymbols
  ColumnGroup(value: boolean): GridOption {
    this._columnGroup = value;
    return this;
  }

  get frozenTotal(): boolean {
    return this._frozenTotal;
  }

  //noinspection JSUnusedGlobalSymbols
  FrozenTotal(value: boolean): GridOption {
    this._frozenTotal = value;
    return this;
  }

  get explicitInitialization(): boolean {
    return this._explicitInitialization;
  }

  //noinspection JSUnusedGlobalSymbols
  ExplicitInitialization(value: boolean): GridOption {
    this._explicitInitialization = value;
    return this;
  }

  get rowHeight(): number {
    return this._rowHeight;
  }

  //noinspection JSUnusedGlobalSymbols
  RowHeight(value: number): GridOption {
    this._rowHeight = value;
    return this;
  }

  get defaultColumnWidth(): number {
    return this._defaultColumnWidth;
  }

  //noinspection JSUnusedGlobalSymbols
  DefaultColumnWidth(value: number): GridOption {
    this._defaultColumnWidth = value;
    return this;
  }

  get enableAddRow(): boolean {
    return this._enableAddRow;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableAddRow(value: boolean): GridOption {
    this._enableAddRow = value;
    return this;
  }

  get leaveSpaceForNewRows(): boolean {
    return this._leaveSpaceForNewRows;
  }

  //noinspection JSUnusedGlobalSymbols
  LeaveSpaceForNewRows(value: boolean): GridOption {
    this._leaveSpaceForNewRows = value;
    return this;
  }

  get editable(): boolean {
    return this._editable;
  }

  //noinspection JSUnusedGlobalSymbols
  Editable(value: boolean): GridOption {
    this._editable = value;
    return this;
  }

  get asyncEditorLoading(): boolean {
    return this._asyncEditorLoading;
  }

  //noinspection JSUnusedGlobalSymbols
  AsyncEditorLoading(value: boolean): GridOption {
    this._asyncEditorLoading = value;
    return this;
  }

  get asyncEditorLoadDelay(): number {
    return this._asyncEditorLoadDelay;
  }

  //noinspection JSUnusedGlobalSymbols
  AsyncEditorLoadDelay(value: number): GridOption {
    this._asyncEditorLoadDelay = value;
    return this;
  }

  get asyncPostRenderDelay(): number {
    return this._asyncPostRenderDelay;
  }

  //noinspection JSUnusedGlobalSymbols
  AsyncPostRenderDelay(value: number): GridOption {
    this._asyncPostRenderDelay = value;
    return this;
  }

  get autoEdit(): boolean {
    return this._autoEdit;
  }

  //noinspection JSUnusedGlobalSymbols
  AutoEdit(value: boolean): GridOption {
    this._autoEdit = value;
    return this;
  }

  get autoHeight(): boolean {
    return this._autoHeight;
  }

  //noinspection JSUnusedGlobalSymbols
  AutoHeight(value: boolean): GridOption {
    this._autoHeight = value;
    return this;
  }

  get cellFlashingCssClass(): string {
    return this._cellFlashingCssClass;
  }

  //noinspection JSUnusedGlobalSymbols
  CellFlashingCssClass(value: string): GridOption {
    this._cellFlashingCssClass = value;
    return this;
  }

  get dataItemColumnValueExtractor(): string {
    return this._dataItemColumnValueExtractor;
  }

  //noinspection JSUnusedGlobalSymbols
  DataItemColumnValueExtractor(value: string): GridOption {
    this._dataItemColumnValueExtractor = value;
    return this;
  }

  get defaultFormatter(): any {
    return this._defaultFormatter;
  }

  //noinspection JSUnusedGlobalSymbols
  DefaultFormatter(value: any): GridOption {
    this._defaultFormatter = value;
    return this;
  }

  get editorFactory(): string {
    return this._editorFactory;
  }

  //noinspection JSUnusedGlobalSymbols
  EditorFactory(value: string): GridOption {
    this._editorFactory = value;
    return this;
  }

  get editorLock(): any {
    return this._editorLock;
  }

  //noinspection JSUnusedGlobalSymbols
  EditorLock(value: any): GridOption {
    this._editorLock = value;
    return this;
  }

  get enableAsyncPostRender(): boolean {
    return this._enableAsyncPostRender;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableAsyncPostRender(value: boolean): GridOption {
    this._enableAsyncPostRender = value;
    return this;
  }

  get enableCellNavigation(): boolean {
    return this._enableCellNavigation;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableCellNavigation(value: boolean): GridOption {
    this._enableCellNavigation = value;
    return this;
  }

  get enableColumnReorder(): boolean {
    return this._enableColumnReorder;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableColumnReorder(value: boolean): GridOption {
    this._enableColumnReorder = value;
    return this;
  }

  get enableTextSelectionOnCells(): boolean {
    return this._enableTextSelectionOnCells;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableTextSelectionOnCells(value: boolean): GridOption {
    this._enableTextSelectionOnCells = value;
    return this;
  }

  get forceFitColumns(): boolean {
    return this._forceFitColumns;
  }

  //noinspection JSUnusedGlobalSymbols
  ForceFitColumns(value: boolean): GridOption {
    this._forceFitColumns = value;
    return this;
  }

  get forceSyncScrolling(): boolean {
    return this._forceSyncScrolling;
  }

  //noinspection JSUnusedGlobalSymbols
  ForceSyncScrolling(value: boolean): GridOption {
    this._forceSyncScrolling = value;
    return this;
  }

  get formatterFactory(): string {
    return this._formatterFactory;
  }

  //noinspection JSUnusedGlobalSymbols
  FormatterFactory(value: string): GridOption {
    this._formatterFactory = value;
    return this;
  }

  get fullWidthRows(): boolean {
    return this._fullWidthRows;
  }

  //noinspection JSUnusedGlobalSymbols
  FullWidthRows(value: boolean): GridOption {
    this._fullWidthRows = value;
    return this;
  }

  get headerRowHeight(): number {
    return this._headerRowHeight;
  }

  //noinspection JSUnusedGlobalSymbols
  HeaderRowHeight(value: number): GridOption {
    this._headerRowHeight = value;
    return this;
  }

  get multiColumnSort(): boolean {
    return this._multiColumnSort;
  }

  //noinspection JSUnusedGlobalSymbols
  MultiColumnSort(value: boolean): GridOption {
    this._multiColumnSort = value;
    return this;
  }

  get multiSelect(): boolean {
    return this._multiSelect;
  }

  //noinspection JSUnusedGlobalSymbols
  MultiSelect(value: boolean): GridOption {
    this._multiSelect = value;
    return this;
  }

  get selectedCellCssClass(): string {
    return this._selectedCellCssClass;
  }

  //noinspection JSUnusedGlobalSymbols
  SelectedCellCssClass(value: string): GridOption {
    this._selectedCellCssClass = value;
    return this;
  }

  get showHeaderRow(): boolean {
    return this._showHeaderRow;
  }

  //noinspection JSUnusedGlobalSymbols
  ShowHeaderRow(value: boolean): GridOption {
    this._showHeaderRow = value;
    return this;
  }

  get topPanelHeight(): number {
    return this._topPanelHeight;
  }

  //noinspection JSUnusedGlobalSymbols
  TopPanelHeight(value: number): GridOption {
    this._topPanelHeight = value;
    return this;
  }

  get cellHighlightCssClass(): string {
    return this._cellHighlightCssClass;
  }

  //noinspection JSUnusedGlobalSymbols
  CellHighlightCssClass(value: string): GridOption {
    this._cellHighlightCssClass = value;
    return this;
  }

  get editCommandHandler(): any {
    return this._editCommandHandler;
  }

  //noinspection JSUnusedGlobalSymbols
  EditCommandHandler(value: any): GridOption {
    this._editCommandHandler = value;
    return this;
  }

  get enableCellRangeSelection(): string {
    return this._enableCellRangeSelection;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableCellRangeSelection(value: string): GridOption {
    this._enableCellRangeSelection = value;
    return this;
  }

  get enableRowReordering(): string {
    return this._enableRowReordering;
  }

  //noinspection JSUnusedGlobalSymbols
  EnableRowReordering(value: string): GridOption {
    this._enableRowReordering = value;
    return this;
  }

  get syncColumnCellResize(): boolean {
    return this._syncColumnCellResize;
  }

  //noinspection JSUnusedGlobalSymbols
  SyncColumnCellResize(value: boolean): GridOption {
    this._syncColumnCellResize = value;
    return this;
  }

  get showTopPanel(): boolean {
    return this._showTopPanel;
  }

  //noinspection JSUnusedGlobalSymbols
  ShowTopPanel(value: boolean): GridOption {
    this._showTopPanel = value;
    return this;
  }

  get frozenBottom(): boolean {
    return this._frozenBottom;
  }

  //noinspection JSUnusedGlobalSymbols
  FrozenBottom(value: boolean): GridOption {
    this._frozenBottom = value;
    return this;
  }

  get frozenColumn(): number {
    return this._frozenColumn;
  }

  //noinspection JSUnusedGlobalSymbols
  FrozenColumn(value: number): GridOption {
    this._frozenColumn = value;
    return this;
  }

  get frozenRow(): number {
    return this._frozenRow;
  }

  //noinspection JSUnusedGlobalSymbols
  FrozenRow(value: number): GridOption {
    this._frozenRow = value;
    return this;
  }

  get enableHeaderClick(): boolean {
    return this._enableHeaderClick;
  }

  EnableHeaderClick(value: boolean): GridOption {
    this._enableHeaderClick = value;
    return this;
  }

  get nullCellStyleActivate(): boolean {
    return this._nullCellStyleActivate;
  }

  NullCellStyleActivate(value: boolean): GridOption {
    this._nullCellStyleActivate = value;
    return this;
  }

  get enableHeaderMenu(): boolean {
    return this._enableHeaderMenu;
  }

  EnableHeaderMenu(value: boolean): GridOption {
    this._enableHeaderMenu = value;
    return this;
  }

  get enableSeqSort(): boolean {
    return this._enableSeqSort;
  }

  EnableSeqSort(value: boolean): GridOption {
    this._enableSeqSort = value;
    return this;
  }

  get enableMultiSelectionWithCtrlAndShift(): boolean {
    return this._enableMultiSelectionWithCtrlAndShift;
  }

  EnableMultiSelectionWithCtrlAndShift(value: boolean): GridOption {
    this._enableMultiSelectionWithCtrlAndShift = value;
    return this;
  }

  //noinspection JSUnusedGlobalSymbols
  build(): Option {
    return new Option(this);
  }

}

export class Option {

  constructor(builder: GridOption) {
    if (typeof builder.dualSelectionActivate !== 'undefined') {
      this._dualSelectionActivate = builder.dualSelectionActivate;
    }
    if (typeof builder.cellExternalCopyManagerActivate !== 'undefined') {
      this._cellExternalCopyManagerActivate = builder.cellExternalCopyManagerActivate;
    }
    if (typeof builder.columnGroup !== 'undefined') {
      this._columnGroup = builder.columnGroup;
    }
    if (typeof builder.explicitInitialization !== 'undefined') {
      this._explicitInitialization = builder.explicitInitialization;
    }
    if (typeof builder.frozenTotal !== 'undefined') {
      this._frozenTotal = builder.frozenTotal;
    }
    if (typeof builder.rowHeight !== 'undefined') {
      this._rowHeight = builder.rowHeight;
    }
    if (typeof builder.defaultColumnWidth !== 'undefined') {
      this._defaultColumnWidth = builder.defaultColumnWidth;
    }
    if (typeof builder.enableAddRow !== 'undefined') {
      this._enableAddRow = builder.enableAddRow;
    }
    if (typeof builder.leaveSpaceForNewRows !== 'undefined') {
      this._leaveSpaceForNewRows = builder.leaveSpaceForNewRows;
    }
    if (typeof builder.editable !== 'undefined') {
      this._editable = builder.editable;
    }
    if (typeof builder.asyncEditorLoading !== 'undefined') {
      this._asyncEditorLoading = builder.asyncEditorLoading;
    }
    if (typeof builder.asyncEditorLoadDelay !== 'undefined') {
      this._asyncEditorLoadDelay = builder.asyncEditorLoadDelay;
    }
    if (typeof builder.asyncPostRenderDelay !== 'undefined') {
      this._asyncPostRenderDelay = builder.asyncPostRenderDelay;
    }
    if (typeof builder.autoEdit !== 'undefined') {
      this._autoEdit = builder.autoEdit;
    }
    if (typeof builder.autoHeight !== 'undefined') {
      this._autoHeight = builder.autoHeight;
    }
    if (typeof builder.cellFlashingCssClass !== 'undefined') {
      this._cellFlashingCssClass = builder.cellFlashingCssClass;
    }
    if (typeof builder.dataItemColumnValueExtractor !== 'undefined') {
      this._dataItemColumnValueExtractor = builder.dataItemColumnValueExtractor;
    }
    if (typeof builder.defaultFormatter !== 'undefined') {
      this._defaultFormatter = builder.defaultFormatter;
    }
    if (typeof builder.editorFactory !== 'undefined') {
      this._editorFactory = builder.editorFactory;
    }
    if (typeof builder.editorLock !== 'undefined') {
      this._editorLock = builder.editorLock;
    }
    if (typeof builder.enableAsyncPostRender !== 'undefined') {
      this._enableAsyncPostRender = builder.enableAsyncPostRender;
    }
    if (typeof builder.enableCellNavigation !== 'undefined') {
      this._enableCellNavigation = builder.enableCellNavigation;
    }
    if (typeof builder.enableColumnReorder !== 'undefined') {
      this._enableColumnReorder = builder.enableColumnReorder;
    }
    if (typeof builder.enableTextSelectionOnCells !== 'undefined') {
      this._enableTextSelectionOnCells = builder.enableTextSelectionOnCells;
    }
    if (typeof builder.forceFitColumns !== 'undefined') {
      this._forceFitColumns = builder.forceFitColumns;
    }
    if (typeof builder.forceSyncScrolling !== 'undefined') {
      this._forceSyncScrolling = builder.forceSyncScrolling;
    }
    if (typeof builder.formatterFactory !== 'undefined') {
      this._formatterFactory = builder.formatterFactory;
    }
    if (typeof builder.fullWidthRows !== 'undefined') {
      this._fullWidthRows = builder.fullWidthRows;
    }
    if (typeof builder.headerRowHeight !== 'undefined') {
      this._headerRowHeight = builder.headerRowHeight;
    }
    if (typeof builder.multiColumnSort !== 'undefined') {
      this._multiColumnSort = builder.multiColumnSort;
    }
    if (typeof builder.multiSelect !== 'undefined') {
      this._multiSelect = builder.multiSelect;
    }
    if (typeof builder.selectedCellCssClass !== 'undefined') {
      this._selectedCellCssClass = builder.selectedCellCssClass;
    }
    if (typeof builder.showHeaderRow !== 'undefined') {
      this._showHeaderRow = builder.showHeaderRow;
    }
    if (typeof builder.topPanelHeight !== 'undefined') {
      this._topPanelHeight = builder.topPanelHeight;
    }
    if (typeof builder.cellHighlightCssClass !== 'undefined') {
      this._cellHighlightCssClass = builder.cellHighlightCssClass;
    }
    if (typeof builder.editCommandHandler !== 'undefined') {
      this._editCommandHandler = builder.editCommandHandler;
    }
    if (typeof builder.enableCellRangeSelection !== 'undefined') {
      this._enableCellRangeSelection = builder.enableCellRangeSelection;
    }
    if (typeof builder.enableRowReordering !== 'undefined') {
      this._enableRowReordering = builder.enableRowReordering;
    }
    if (typeof builder.syncColumnCellResize !== 'undefined') {
      this._syncColumnCellResize = builder.syncColumnCellResize;
    }
    if (typeof builder.showTopPanel !== 'undefined') {
      this._showTopPanel = builder.showTopPanel;
    }
    if (typeof builder.frozenBottom !== 'undefined') {
      this._frozenBottom = builder.frozenBottom;
    }
    if (typeof builder.frozenColumn !== 'undefined') {
      this._frozenColumn = builder.frozenColumn;
    }
    if (typeof builder.frozenRow !== 'undefined') {
      this._frozenRow = builder.frozenRow;
    }
    if (typeof builder.enableHeaderClick !== 'undefined') {
      this._enableHeaderClick = builder.enableHeaderClick;
    }
    if (typeof builder.nullCellStyleActivate !== 'undefined') {
      this._nullCellStyleActivate = builder.nullCellStyleActivate;
    }
    if (typeof builder.enableHeaderMenu !== 'undefined') {
      this._enableHeaderMenu = builder.enableHeaderMenu;
    }
    if (typeof builder.enableSeqSort !== 'undefined') {
      this._enableSeqSort = builder.enableSeqSort;
    }
    if (typeof builder.enableMultiSelectionWithCtrlAndShift !== 'undefined') {
      this._enableMultiSelectionWithCtrlAndShift = builder.enableMultiSelectionWithCtrlAndShift;
    }
    if (typeof builder.rowSelectionActivate !== 'undefined') {
      this._enableRowSelected = builder.rowSelectionActivate;
    }

  }

  private _columnGroup: boolean;
  private _frozenTotal: boolean;

  private _explicitInitialization: boolean;
  private _rowHeight: number;
  private _defaultColumnWidth;
  private _enableAddRow: boolean;
  private _leaveSpaceForNewRows: boolean;
  private _editable: boolean;
  private _asyncEditorLoading: boolean;
  private _asyncEditorLoadDelay: number;
  private _asyncPostRenderDelay: number;
  private _autoEdit: boolean;
  private _autoHeight: boolean;
  private _cellFlashingCssClass: string;
  private _dataItemColumnValueExtractor: string;
  private _defaultFormatter: any;
  private _editorFactory: string;
  private _editorLock: any;
  private _enableAsyncPostRender: boolean;
  private _enableCellNavigation: boolean;
  private _enableColumnReorder: boolean;
  private _enableTextSelectionOnCells: boolean;
  private _forceFitColumns: boolean;
  private _forceSyncScrolling: boolean;
  private _formatterFactory: string;
  private _fullWidthRows: boolean;
  private _headerRowHeight: number;
  private _multiColumnSort: boolean;
  private _multiSelect: boolean;
  private _selectedCellCssClass: string;
  private _showHeaderRow: boolean;
  private _topPanelHeight: number;

  private _cellHighlightCssClass: string;
  private _editCommandHandler: any;
  private _enableCellRangeSelection: string;
  private _enableRowReordering: string;
  private _syncColumnCellResize: boolean;

  private _showTopPanel: boolean;
  private _frozenBottom: boolean;
  private _frozenColumn: number;
  private _frozenRow: number;
  private _enableHeaderClick: boolean;
  private _nullCellStyleActivate: boolean;
  private _enableHeaderMenu: boolean;
  private _enableSeqSort: boolean;

  private _dualSelectionActivate: boolean;
  private _enableRowSelected: boolean;
  private _cellExternalCopyManagerActivate: boolean;
  private _enableMultiSelectionWithCtrlAndShift: boolean;

  get rowSelectionActivate(): boolean {
    return this._enableRowSelected;
  }

  set rowSelectionActivate(value: boolean) {
    this._enableRowSelected = value;
  }

  get dualSelectionActivate(): boolean {
    return this._dualSelectionActivate;
  }

  set dualSelectionActivate(value: boolean) {
    this._dualSelectionActivate = value;
  }

  get cellExternalCopyManagerActivate(): boolean {
    return this._cellExternalCopyManagerActivate;
  }

  set cellExternalCopyManagerActivate(value: boolean) {
    this._cellExternalCopyManagerActivate = value;
  }

  get columnGroup(): boolean {
    return this._columnGroup;
  }

  set columnGroup(value: boolean) {
    this._columnGroup = value;
  }

  get frozenTotal(): boolean {
    return this._frozenTotal;
  }

  set frozenTotal(value: boolean) {
    this._frozenTotal = value;
  }

  get explicitInitialization(): boolean {
    return this._explicitInitialization;
  }

  set explicitInitialization(value: boolean) {
    this._explicitInitialization = value;
  }

  get rowHeight(): number {
    return this._rowHeight;
  }

  set rowHeight(value: number) {
    this._rowHeight = value;
  }

  get defaultColumnWidth() {
    return this._defaultColumnWidth;
  }

  set defaultColumnWidth(value) {
    this._defaultColumnWidth = value;
  }

  get enableAddRow(): boolean {
    return this._enableAddRow;
  }

  set enableAddRow(value: boolean) {
    this._enableAddRow = value;
  }

  get leaveSpaceForNewRows(): boolean {
    return this._leaveSpaceForNewRows;
  }

  set leaveSpaceForNewRows(value: boolean) {
    this._leaveSpaceForNewRows = value;
  }

  get editable(): boolean {
    return this._editable;
  }

  set editable(value: boolean) {
    this._editable = value;
  }

  get asyncEditorLoading(): boolean {
    return this._asyncEditorLoading;
  }

  set asyncEditorLoading(value: boolean) {
    this._asyncEditorLoading = value;
  }

  get asyncEditorLoadDelay(): number {
    return this._asyncEditorLoadDelay;
  }

  set asyncEditorLoadDelay(value: number) {
    this._asyncEditorLoadDelay = value;
  }

  get asyncPostRenderDelay(): number {
    return this._asyncPostRenderDelay;
  }

  set asyncPostRenderDelay(value: number) {
    this._asyncPostRenderDelay = value;
  }

  get autoEdit(): boolean {
    return this._autoEdit;
  }

  set autoEdit(value: boolean) {
    this._autoEdit = value;
  }

  get autoHeight(): boolean {
    return this._autoHeight;
  }

  set autoHeight(value: boolean) {
    this._autoHeight = value;
  }

  get cellFlashingCssClass(): string {
    return this._cellFlashingCssClass;
  }

  set cellFlashingCssClass(value: string) {
    this._cellFlashingCssClass = value;
  }

  get dataItemColumnValueExtractor(): string {
    return this._dataItemColumnValueExtractor;
  }

  set dataItemColumnValueExtractor(value: string) {
    this._dataItemColumnValueExtractor = value;
  }

  get defaultFormatter(): any {
    return this._defaultFormatter;
  }

  set defaultFormatter(value: any) {
    this._defaultFormatter = value;
  }

  get editorFactory(): string {
    return this._editorFactory;
  }

  set editorFactory(value: string) {
    this._editorFactory = value;
  }

  get editorLock(): any {
    return this._editorLock;
  }

  set editorLock(value: any) {
    this._editorLock = value;
  }

  get enableAsyncPostRender(): boolean {
    return this._enableAsyncPostRender;
  }

  set enableAsyncPostRender(value: boolean) {
    this._enableAsyncPostRender = value;
  }

  get enableCellNavigation(): boolean {
    return this._enableCellNavigation;
  }

  set enableCellNavigation(value: boolean) {
    this._enableCellNavigation = value;
  }

  get enableColumnReorder(): boolean {
    return this._enableColumnReorder;
  }

  set enableColumnReorder(value: boolean) {
    this._enableColumnReorder = value;
  }

  get enableTextSelectionOnCells(): boolean {
    return this._enableTextSelectionOnCells;
  }

  set enableTextSelectionOnCells(value: boolean) {
    this._enableTextSelectionOnCells = value;
  }

  get forceFitColumns(): boolean {
    return this._forceFitColumns;
  }

  set forceFitColumns(value: boolean) {
    this._forceFitColumns = value;
  }

  get forceSyncScrolling(): boolean {
    return this._forceSyncScrolling;
  }

  set forceSyncScrolling(value: boolean) {
    this._forceSyncScrolling = value;
  }

  get formatterFactory(): string {
    return this._formatterFactory;
  }

  set formatterFactory(value: string) {
    this._formatterFactory = value;
  }

  get fullWidthRows(): boolean {
    return this._fullWidthRows;
  }

  set fullWidthRows(value: boolean) {
    this._fullWidthRows = value;
  }

  get headerRowHeight(): number {
    return this._headerRowHeight;
  }

  set headerRowHeight(value: number) {
    this._headerRowHeight = value;
  }

  get multiColumnSort(): boolean {
    return this._multiColumnSort;
  }

  set multiColumnSort(value: boolean) {
    this._multiColumnSort = value;
  }

  get multiSelect(): boolean {
    return this._multiSelect;
  }

  set multiSelect(value: boolean) {
    this._multiSelect = value;
  }

  get selectedCellCssClass(): string {
    return this._selectedCellCssClass;
  }

  set selectedCellCssClass(value: string) {
    this._selectedCellCssClass = value;
  }

  get showHeaderRow(): boolean {
    return this._showHeaderRow;
  }

  set showHeaderRow(value: boolean) {
    this._showHeaderRow = value;
  }

  get topPanelHeight(): number {
    return this._topPanelHeight;
  }

  set topPanelHeight(value: number) {
    this._topPanelHeight = value;
  }

  get cellHighlightCssClass(): string {
    return this._cellHighlightCssClass;
  }

  set cellHighlightCssClass(value: string) {
    this._cellHighlightCssClass = value;
  }

  get editCommandHandler(): any {
    return this._editCommandHandler;
  }

  set editCommandHandler(value: any) {
    this._editCommandHandler = value;
  }

  get enableCellRangeSelection(): string {
    return this._enableCellRangeSelection;
  }

  set enableCellRangeSelection(value: string) {
    this._enableCellRangeSelection = value;
  }

  get enableRowReordering(): string {
    return this._enableRowReordering;
  }

  set enableRowReordering(value: string) {
    this._enableRowReordering = value;
  }

  get syncColumnCellResize(): boolean {
    return this._syncColumnCellResize;
  }

  set syncColumnCellResize(value: boolean) {
    this._syncColumnCellResize = value;
  }

  get showTopPanel(): boolean {
    return this._showTopPanel;
  }

  set showTopPanel(value: boolean) {
    this._showTopPanel = value;
  }

  get frozenBottom(): boolean {
    return this._frozenBottom;
  }

  set frozenBottom(value: boolean) {
    this._frozenBottom = value;
  }

  get frozenColumn(): number {
    return this._frozenColumn;
  }

  set frozenColumn(value: number) {
    this._frozenColumn = value;
  }

  get frozenRow(): number {
    return this._frozenRow;
  }

  set frozenRow(value: number) {
    this._frozenRow = value;
  }

  get enableHeaderClick(): boolean {
    return this._enableHeaderClick;
  }

  set enableHeaderClick(value: boolean) {
    this._enableHeaderClick = value;
  }

  get nullCellStyleActivate(): boolean {
    return this._nullCellStyleActivate;
  }

  set nullCellStyleActivate(value: boolean) {
    this._nullCellStyleActivate = value;
  }

  get enableHeaderMenu(): boolean {
    return this._enableHeaderMenu;
  }

  set enableHeaderMenu(value: boolean) {
    this._enableHeaderMenu = value;
  }

  get enableSeqSort(): boolean {
    return this._enableSeqSort;
  }

  set enableSeqSort(value: boolean) {
    this._enableSeqSort = value;
  }

  get enableMultiSelectionWithCtrlAndShift(): boolean {
    return this._enableMultiSelectionWithCtrlAndShift;
  }

  set enableMultiSelectionWithCtrlAndShift(value: boolean) {
    this._enableMultiSelectionWithCtrlAndShift = value;
  }


  /* tslint:enable:variable-name function-name */
}
