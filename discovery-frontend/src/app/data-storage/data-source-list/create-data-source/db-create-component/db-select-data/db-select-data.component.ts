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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractPopupComponent} from "../../../../../common/component/abstract-popup.component";
import {DatasourceInfo, Field} from "../../../../../domain/datasource/datasource";
import {GridComponent} from "../../../../../common/component/grid/grid.component";
import {EditorComponent} from "../../../../../workbench/component/detail-workbench/datail-workbench-editor/editor.component";
import {QueryDataResult} from "../../../../service/data-source-create.service";
import {DataconnectionService} from "../../../../../dataconnection/service/dataconnection.service";
import {ConnectionParam, DataConnectionCreateService} from "../../../../service/data-connection-create.service";
import {StringUtil} from "../../../../../common/util/string.util";
import {ImplementorType} from "../../../../../domain/dataconnection/dataconnection";
import {header, SlickGridHeader} from "../../../../../common/component/grid/grid.header";
import {GridOption} from "../../../../../common/component/grid/grid.option";
import {Alert} from "../../../../../common/util/alert.util";
import * as pixelWidth from 'string-pixel-width';
import * as _ from "lodash";
import {isNullOrUndefined} from "util";


@Component({
  selector: 'db-select-data',
  templateUrl: './db-select-data.component.html'
})
export class DbSelectDataComponent extends AbstractPopupComponent {

  // create source data
  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  @ViewChild(GridComponent)
  private _gridComponent: GridComponent;

  @ViewChild('editor')
  private _editorComponent: EditorComponent;

  @Input()
  public step: string;

  // 쿼리 상세데이터
  public queryResultData: QueryDataResult;
  // 테이블 상세데이터
  public tableResultData: QueryDataResult;

  // selected table TABLE / QUERY
  public tab: any = Tab;
  public selectedTab: Tab = Tab.TABLE;

  // database list
  public databaseList: string[] = [];
  // table list (Only used TABLE tab)
  public tableList: string[] = [];

  // selected database
  public selectedDatabase: string;
  // selected database in QUERY tab
  public selectedDatabaseInQuery: string;
  // selected table
  public selectedTable: string;

  // search text database
  public searchTextDatabase: string;
  // search text database in QUERY tab
  public searchTextDatabaseInQuery: string;
  // search text table
  public searchTextTable: string;

  // query text
  public queryText: string;

  // clear grid
  public clearGrid: boolean = true;

  // table list error flag
  public isTableListError: boolean;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // editor option
  public options: any = {
    maxLines: 20,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };

  // 생성자
  constructor(private connectionService: DataconnectionService,
              private connectionCreateService: DataConnectionCreateService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // 현재 페이지 데이터베이스 정보가 있다면
    if (this._sourceData.hasOwnProperty('databaseData')) {
      // load data
      this._loadSelectedDataInSourceData(_.cloneDeep(this._sourceData.databaseData));
      // result data
      const data = this.selectedTab === Tab.TABLE ? this.tableResultData : this.queryResultData;
      // exist data, draw grid
      data && data.fields && this._updateGrid(data.fields, data.data);
    }
    //if not exist database list, set database list
    this.databaseList.length === 0 && this._setDatabaseList();
  }

  /**
   * Prev
   */
  public prev(): void {
    // save
    this._saveSelectedDataInSourceData(this._sourceData);
    // change step
    this.step = 'db-data-connection';
    this.stepChange.emit(this.step);
  }

  /**
   * Next
   */
  public next(): void {
    // save
    if (this.isEnableNext()) {
      // if changed data
      if (this._isChangedData()) {
        delete this._sourceData.schemaData;
        delete this._sourceData.ingestionData;
      }
      // save
      this._saveSelectedDataInSourceData(this._sourceData);
      // 다음페이지로 이동
      this.step = 'db-configure-schema';
      this.stepChange.emit(this.step);
    }
  }

  /**
   * Run query
   */
  public runQuery(): void {
    // 입력된 값이 없다면 return
    if (!this.isExistQueryText()) {
      Alert.warning(this.translateService.instant('msg.storage.alert.input.query.error'));
    } else {
      // set table result
      this._setResult(this.selectedDatabaseInQuery, this.queryText, this.selectedTab);
    }
  }

  /**
   * Changed tab
   * @param {Tab} tab
   */
  public onChangedTab(tab: Tab): void {
    if (tab !== this.selectedTab) {
      // set selected tab
      this.selectedTab = tab;
      // data
      const data = this.selectedTab === Tab.TABLE ? this.tableResultData : this.queryResultData;
      // if exist result data
      if (data && data.fields) {
        this._updateGrid(data.fields, data.data);
      } else {
        this._clearGrid();
      }
    }
  }

  /**
   * Changed database in TABLE tab
   * @param {string} database
   */
  public onChangedDatabase(database: string): void {
    // changed selected database
    this.selectedDatabase = database;
    // init selected table
    this.selectedTable = '';
    this.tableResultData = undefined;
    // clear grid
    this._clearGrid();
    // set table list
    this._setTableList(database);
  }

  /**
   * Changed database in QUERY tab
   * @param {string} database
   */
  public onChangedDatabaseInQuery(database: string): void {
    // change selected database
    this.selectedDatabaseInQuery = database;
    // init query data
    this.queryResultData = undefined;
    // clear grid
    this._clearGrid();
  }

  /**
   * Changed table
   * @param {string} table
   */
  public onChangedTable(table: string): void {
    // changed selected table
    this.selectedTable = table;
    // set table result
    this._setResult(this.selectedDatabase, this.selectedTable, this.selectedTab);
  }

  /**
   * query text 변경
   * @param {string} param
   */
  public onChangedQueryText(text: string): void {
    // 같지 않을때만 작동
    if (this.queryText !== text) {
      // 변경된 텍스트 저장
      this.queryText = text;
      // if exist query result data
      if (this.queryResultData) {
        // clear grid
        this._clearGrid();
        // init query data
        this.queryResultData = undefined;
      }
    }
  }

  /**
   * Get default index in list
   * @param {string} listKey
   * @return {number}
   */
  public getDefaultIndexInList(listKey: string): number {
    switch (listKey) {
      case 'DATABASE':
        return StringUtil.isEmpty(this.selectedDatabase) ? -1 : this.databaseList.findIndex(database => this.selectedDatabase === database);
      case 'TABLE':
        return StringUtil.isEmpty(this.selectedTable) ? -1 : this.tableList.findIndex(database => this.selectedTable === database);
      case 'DATABASE_QUERY':
        return StringUtil.isEmpty(this.selectedDatabaseInQuery) ? -1 : this.databaseList.findIndex(database => this.selectedDatabaseInQuery === database);
    }
  }

  /**
   * Get unselected database message
   * @return {string}
   */
  public getUnSelectedDatabaseMessage(): string {
    return this._sourceData.connectionData.connection.implementor === ImplementorType.MYSQL ? this.translateService.instant('msg.storage.ui.dsource.create.choose-db') : this.translateService.instant('msg.storage.ui.dsource.create.choose-schema');
  }

  /**
   * Get database search placeholder message
   * @return {string}
   */
  public getDatabaseSearchPlaceHolderMessage(): string {
    return this._sourceData.connectionData.connection.implementor === ImplementorType.MYSQL ? this.translateService.instant('msg.storage.ui.dsource.create.search-db') : this.translateService.instant('msg.storage.ui.dsource.create.search-schema');
  }

  /**
   * 쿼리 텍스트가 있는지 확인
   * @returns {boolean}
   */
  public isExistQueryText(): boolean {
    return StringUtil.isNotEmpty(this.queryText);
  }

  /**
   * Is enable next
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    return !!(this.selectedTab === Tab.TABLE ? (this.tableResultData && this.tableResultData.fields) : (this.queryResultData && this.queryResultData.fields));
  }

  /**
   * Is changed result data
   * @return {boolean}
   * @private
   */
  private _isChangedData(): boolean {
    return !this._sourceData.databaseData || (this._sourceData.databaseData.selectedTab !== this.selectedTab ||
      (Tab.TABLE === this.selectedTab && (this.selectedDatabase !== this._sourceData.databaseData.selectedDatabase || this.selectedTable !== this._sourceData.databaseData.selectedTable)) ||
      (Tab.QUERY === this.selectedTab && (this.selectedDatabaseInQuery !== this._sourceData.databaseData.selectedDatabaseInQuery || this.queryText !== this._sourceData.databaseData.queryText)));
  }

  /**
   * Get database params
   * @return {{connection: ConnectionParam}}
   * @private
   */
  private _getDatabaseParams(): {connection: ConnectionParam} {
    return {connection: _.cloneDeep(this._sourceData.connectionData.connection)};
  }

  /**
   * Get table params
   * @param {string} databaseName
   * @return {{connection: ConnectionParam; database?: string}}
   * @private
   */
  private _getTableParams(databaseName: string): {connection: ConnectionParam, database?: string} {
    const result: {connection: ConnectionParam, database?: string} = this._getDatabaseParams();
    StringUtil.isNotEmpty(databaseName) && (result.database = databaseName);
    return result;
  }

  /**
   * Get result params
   * @param {string} databaseName
   * @param {string} tableOrQueryText
   * @return {{connection: ConnectionParam; database?: string; type?: Tab; query?: string}}
   * @private
   */
  private _getResultParams(databaseName: string, tableOrQueryText: string): {connection: ConnectionParam, database?:string, type?: Tab, query?: string} {
    const result: {connection: ConnectionParam, database?:string, type?: Tab, query?: string} = this._getTableParams(databaseName);
    result.type = this.selectedTab;
    result.query = tableOrQueryText;
    return result;
  }

  /**
   * Get grid headers
   * @param {Field[]} fields
   * @return {header[]}
   * @private
   */
  private _getGridHeaders(fields: Field[]): header[] {
    return fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 62;
        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + field.name + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );
  }

  /**
   * Get grid rows
   * @param data
   * @return {any[]}
   * @private
   */
  private _getGridRows(data: any): any[] {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }

  /**
   * 변경된 데이터 리스트 얻기
   * @param datas
   * @return {any}
   * @private
   */
  private _getReplacedDataList(datas: any): any {
    return datas.map(item => this._getReplacedObject(item));
  }

  /**
   * 변경된 필드 리스트 얻기
   * @param fields
   * @return {any}
   * @private
   */
  private _getReplacedFieldList(fields: any): any {
    return fields.map((item) => {
      // name
      item.name = this._sliceTableName(item.name);
      // if exist alias, convert alias
      if (!isNullOrUndefined(item.alias)) {
        item.alias = this._sliceTableName(item.alias);
      }
      return item;
    });
  }

  /**
   * 변경된 object 파일
   * @param {Object} data
   * @returns {any}
   * @private
   */
  private _getReplacedObject(data: object): any {
    return Object.assign({}, ...Object.keys(data).map(key => ({[this._sliceTableName(key)]: data[key]})));
  }


  /**
   * Set database list
   * @private
   */
  private _setDatabaseList(): void {
    // loading show
    this.loadingShow();
    // 데이터베이스 리스트 조회
    this.connectionService.getDatabasesWithoutId(this._getDatabaseParams())
      .then((result: {databases: string[]}) => {
        // 데이터베이스 리스트 저장
        this.databaseList = result.databases;
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set table list
   * @param {string} databaseName
   * @private
   */
  private _setTableList(databaseName: string): void {
    // loading show
    this.loadingShow();
    // init table list error
    this.isTableListError = false;
    // 테이블 리스트 조회
    this.connectionService.getTablesWitoutId(this._getTableParams(databaseName))
      .then((result: {tables: string[]}) => {
        // 테이블 목록 저장
        this.tableList = result.tables || [];
        // if not exist table list, set table list error TRUE
        this.tableList.length === 0 && (this.isTableListError = true);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set result data
   * @param {string} databaseName
   * @param {string} tableOrQueryText
   * @param {Tab} selectedTab
   * @private
   */
  private _setResult(databaseName: string, tableOrQueryText: string, selectedTab: Tab): void {
    // loading show
    this.loadingShow();
    // 테이블 상세 조회
    this.connectionService.getTableDetailWitoutId(this._getResultParams(databaseName, tableOrQueryText), false)
      .then((result: QueryDataResult) => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        if (this._sourceData.connectionData.connection.implementor === ImplementorType.HIVE) {
          result.data = this._getReplacedDataList(result.data);
          result.fields = this._getReplacedFieldList(result.fields);
        }
        // set result data
        if (Tab.TABLE === selectedTab) {
          // 테이블 상세데이터 저장
          this.tableResultData = result;
        } else {
          // 쿼리 데이터 저장
          this.queryResultData = result;
        }
        // 그리드 업데이트
        this._updateGrid(result.fields, result.data);
        // loading hide
        this.loadingHide();
      })
      .catch((error: QueryDataResult) => {
        // set result data
        if (Tab.TABLE === selectedTab) {
          // 테이블 상세데이터 저장
          this.tableResultData = error;
          // override message (only table)
          this.tableResultData.message = this.translateService.instant('msg.storage.ui.connection.jdbc.table.error');
        } else {
          // 쿼리 데이터 저장
          this.queryResultData = error;
        }
        // clear grid
        this._clearGrid();
        // loading hide
        this.loadingHide();
      });
  }

  /**
   * Update grid
   * @param {Field[]} fields
   * @param data
   * @private
   */
  private _updateGrid(fields: Field[], data: any) {
    // grid
    this.clearGrid = false;
    // detect
    this.changeDetect.detectChanges();
    // draw grid
    this._drawGrid(this._gridComponent, this._getGridHeaders(fields), this._getGridRows(data));
  }

  /**
   * Draw grid
   * @param {GridComponent} gridComponent
   * @param {header[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(gridComponent: GridComponent, headers: header[], rows: any[]): void {
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * 테이블이름 잘라내기
   * @param key
   * @returns {string}
   * @private
   */
  private _sliceTableName(key): string {
    return key.substr(key.indexOf('.') + 1);
  }

  /**
   * Clear grid
   * @private
   */
  private _clearGrid(): void {
    this.clearGrid = true;
    this._gridComponent.destroy();
  }

  /**
   * Save selected data
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveSelectedDataInSourceData(sourceData: DatasourceInfo): void {
    const databaseData = {
      // 쿼리 상세데이터
      queryResultData: this.queryResultData,
      // 테이블 상세데이터
      tableResultData: this.tableResultData,
      // database list
      databaseList: this.databaseList,
      // table list
      tableList: this.tableList,
      // 선택된 데이터베이스
      selectedDatabase: this.selectedDatabase,
      // 선택된 테이블
      selectedTable: this.selectedTable,
      // 선택된 데이터베이스 쿼리
      selectedDatabaseInQuery: this.selectedDatabaseInQuery,
      // 선택한 타입
      selectedTab: this.selectedTab,
      // 쿼리
      queryText: this.queryText,
      // search text database
      searchTextDatabase: this.searchTextDatabase,
      // search text database query
      searchTextDatabaseInQuery: this.searchTextDatabaseInQuery,
      // search text table
      searchTextTable: this.searchTextTable
    };
    sourceData.databaseData = databaseData;
    // set field list, field data
    const data = this.selectedTab === Tab.TABLE ? this.tableResultData : this.queryResultData;
    if (data && data.fields) {
      sourceData.fieldList = data.fields;
      sourceData.fieldData = data.data;
    }
  }

  /**
   * Load selected data
   * @param data
   * @private
   */
  private _loadSelectedDataInSourceData(data: any): void {
    // 쿼리 상세데이터
    this.queryResultData = data.queryResultData;
    // 테이블 상세데이터
    this.tableResultData = data.tableResultData;
    // database list
    this.databaseList = data.databaseList;
    // table list
    this.tableList = data.tableList;
    // 선택된 데이터베이스
    this.selectedDatabase = data.selectedDatabase;
    // 선택된 테이블
    this.selectedTable = data.selectedTable;
    // 선택된 데이터베이스 쿼리
    this.selectedDatabaseInQuery = data.selectedDatabaseInQuery;
    // 선택한 타입
    this.selectedTab = data.selectedTab;
    // 쿼리
    this.queryText = data.queryText;
    // search text database
    this.searchTextDatabase = data.searchTextDatabase;
    // search text database query
    this.searchTextDatabaseInQuery = data.searchTextDatabaseInQuery;
    // search text table
    this.searchTextTable = data.searchTextTable;
    // if not exist table list, set table list error TRUE
    this.tableList.length === 0 && (this.isTableListError = true);
  }
}

enum Tab {
  TABLE = 'TABLE',
  QUERY = 'QUERY'
}
