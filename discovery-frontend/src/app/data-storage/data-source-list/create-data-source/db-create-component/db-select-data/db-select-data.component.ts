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
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo, Field } from '../../../../../domain/datasource/datasource';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../common/component/grid/grid.option';
import { Alert } from '../../../../../common/util/alert.util';
import { EditorComponent } from '../../../../../workbench/component/detail-workbench/datail-workbench-editor/editor.component';
import * as _ from 'lodash';
import * as pixelWidth from 'string-pixel-width';

/**
 * Creating datasource with Database - database step
 */
@Component({
  selector: 'db-select-data',
  templateUrl: './db-select-data.component.html'
})
export class DbSelectDataComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // create source data
  private _sourceData: DatasourceInfo;

  @ViewChild('table')
  private tableComponent: GridComponent;

  @ViewChild('query')
  private queryComponent: GridComponent;

  @ViewChild('editor')
  private editorComponent: EditorComponent;

  // 상세 데이터
  // 쿼리 상세데이터
  private queryDetailData: any = null;
  // 테이블 상세데이터
  private tableDetailData: any = null;

  // database list
  private databaseList: any[] = [];
  // table list
  private tableList: any[] = [];

  // 선택한 타입
  private selectedType: string = 'TABLE';

  // selected database
  public selectedDatabase: string = '';
  // selected table
  public selectedTable: string = '';
  // selected database in query
  public selectedDatabaseQuery: string = '';

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this._sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // 쿼리 text
  public queryText: string = '';

  // flag
  // select box show flag
  public tableShowFl: boolean = false;
  public dbQueryShowFl: boolean = false;
  public dbShowFl: boolean = false;
  // 쿼리 조회 성공여부
  public queryResultFl: boolean = null;

  // 그리드 숨기기
  public tableClearGrid: boolean = true;
  public queryClearGrid: boolean = true;

  // editor option
  public options: any = {
    maxLines: 20,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };

  // search
  // search text database
  public searchTextDatabase: string = '';
  // search text database query
  public searchTextDatabaseQuery: string = '';
  // search text table
  public searchTextTable: string = '';

  // 조회 result message
  public resultTableErrorShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataconnectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this.initView();

    // 현재 페이지 데이터베이스 정보가 있다면
    if (this._sourceData.hasOwnProperty('databaseData')) {
      this.initData(_.cloneDeep(this._sourceData.databaseData));
      // 그리드 데이터 존재시
      this.initDataGrid();
    }
    //if not exist database list, set database list
    this.databaseList.length === 0 && this.setDatabaseList();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이번화면으로 이동
   */
  public prev() {
    // 기존 데이터베이스 삭제후 생성
    this.deleteAndSaveDatabaseData();
    // 이전페이지로 이동
    this.step = 'db-data-connection';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음화면으로 이동
   */
  public next() {
    // validation
    if (this.nextValidation()) {
      // 데이터 변경이 일어난경우 스키마 삭제
      this.deleteSchemaData();
      // 기존 데이터베이스 삭제후 생성
      this.deleteAndSaveDatabaseData();
      // 다음페이지로 이동
      this.step = 'db-configure-schema';
      this.stepChange.emit(this.step);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 베이스 리스트
   * @returns {any[]}
   */
  public get getDatabaseList() {
    return this.databaseList;
  }

  /**
   * 테이블 리스트
   * @returns {any[]}
   */
  public get getTableList() {
    return this.tableList;
  }

  /**
   * 현재 선택된 데이터베이스 쿼리의 index
   * @returns {number}
   */
  public getDatabaseQueryDefaultIndex(): number {
    if (this.selectedDatabaseQuery !== '') {
      return this.databaseList.findIndex((item) => {
        return item === this.selectedDatabaseQuery;
      });
    }
    return -1;
  }

  /**
   * 현재 선택된 데이터베이스 index
   * @returns {number}
   */
  public getDatabaseDefaultIndex(): number {
    if (this.selectedDatabase !== '') {
      return this.databaseList.findIndex((item) => {
        return item === this.selectedDatabase;
      });
    }
    return -1;
  }

  /**
   * 현재 선택된 테이블 index
   * @returns {number}
   */
  public getTableDefaultIndex(): number {
    if (this.selectedTable !== '') {
      return this.tableList.findIndex((item) => {
        return item === this.selectedTable;
      });
    }
    return -1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선택된 타입이 테이블인지 여부
   * @returns {boolean}
   */
  public isSelectedTypeTable(): boolean {
    return this.selectedType === 'TABLE';
  }

  /**
   * 선택된 타입이 쿼리인지 여부
   * @returns {boolean}
   */
  public isSelectedTypeQuery(): boolean {
    return this.selectedType === 'QUERY';
  }

  /**
   * 데이터베이스 선택된 상태인지 체크
   * @returns {boolean}
   */
  public isSelectedDatabase(): boolean {
    return this.selectedDatabase !== '';
  }

  /**
   * 쿼리 텍스트가 있는지 확인
   * @returns {boolean}
   */
  public isExistQueryText(): boolean {
    return this.queryText.trim() !== '';
  }

  /**
   * 테이블 상세정보가 존재하는지 확인
   * @returns {boolean}
   */
  public isExistTableDetailData(): boolean {
    return this.tableDetailData !== null;
  }

  /**
   * 쿼리 상세정보가 존재하는지 확인
   * @returns {boolean}
   */
  public isExistQueryDetailData(): boolean {
    return this.queryDetailData !== null;
  }

  /**
   * 다음페이지로 넘어가기 위한 validation
   * @returns {boolean}
   */
  public nextValidation(): boolean {
    // 선택한 탭이 테이블인 경우
    if (this.isSelectedTypeTable()) {
      return this.isExistTableDetailData();
    }
    // 선택한 탭이 쿼리인 경우
    if (this.isSelectedTypeQuery) {
      return this.isExistQueryDetailData();
    }
    return true;
  }

  /**
   * 데이터 베이스 사용 여부
   * @returns {boolean}
   */
  public isUsedDatabase(): boolean {
    return this._sourceData.connectionData.selectedDbType.value === 'MYSQL';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 선택 이벤트
   * @param database
   */
  public onSelectedDatabase(database: string) {
    // 선택한 데이터 베이스 이름
    this.selectedDatabase = database;
    // 데이터 초기화
    this.initTableDetail();
    // 테이블 리스트
    this.setTableList(database);
  }

  /**
   * 쿼리의 데이터베이스 선택 이벤트
   * @param {string} database
   */
  public onSelectedDatabaseQuery(database: string) {
    // 선택한 데이터 베이스 이름
    this.selectedDatabaseQuery = database;
    // 데이터 초기화
    this.initQueryDetail();
  }

  /**
   * 테이블 선택 이벤트
   * @param table
   */
  public onSelectedTable(table: string) {
    // 데이터 초기화
    this.initTableDetail();
    // 선택한 테이블 이름
    this.selectedTable = table;
    // 테이블 상세데이터
    this.getTableDetail(this.selectedDatabase, table);
  }

  /**
   * 쿼리의 데이터베이스 검색어 이벤트
   * @param {string} searchText
   */
  public onSearchDatabaseQuery(searchText: string) {
    this.searchTextDatabaseQuery = searchText;
  }

  /**
   * 데이터베이스 검색어 이벤트
   * @param {string} searchText
   */
  public onSearchDatabase(searchText: string) {
    this.searchTextDatabase = searchText;
  }

  /**
   * 테이블 검색어 이벤트
   * @param {string} searchText
   */
  public onSearchTable(searchText: string) {
    this.searchTextTable = searchText;
  }

  /**
   * 탭 변경 이벤트
   * @param type
   */
  public onChangeTab(type) {
    // 같은 타입이면 return
    if (this.selectedType === type) {
      return;
    }
    // 타입 변경
    this.selectedType = type;
    // 선택한 타입이 테이블 이라면
    if (this.isSelectedTypeTable()) {
      // query grid hide
      this.queryClearGrid = true;
      // 선택된 테이블데이터가 없다면 hide
      this.tableClearGrid = !this.isExistTableDetailData();
    } else {
      // table grid hide
      this.tableClearGrid = true;
      // 쿼리가 성공이 아니라면 hide
      this.queryClearGrid = !this.isExistQueryDetailData();
    }
  }

  /**
   * 쿼리 실행 클릭 이벤트
   */
  public onClickRunQuery() {
    // 입력된 값이 없다면 return
    if (!this.isExistQueryText()) {
      Alert.warning(this.translateService.instant('msg.storage.alert.input.query.error'));
      return;
    }
    // 쿼리 데이터 상세조회
    this.getQueryDetailFromServer(this.selectedDatabaseQuery, this.queryText);
  }

  /**
   * query text 변경
   * @param {string} param
   */
  public editorTextChange(param: string) {
    // 같지 않을때만 작동
    if (this.queryText !== param) {
      // 변경된 텍스트 저장
      this.queryText = param;
      // 데이터 초기화
      this.initQueryDetail();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터가 변경이 일어나고 스키마데이터가 있다면 스키마데이터 삭제
   */
  private deleteSchemaData() {
    // 데이터 변경이 일어난경우 스키마 삭제
    if (this._sourceData.hasOwnProperty('schemaData')
      && this.isChangeData()) {
      delete this._sourceData.schemaData;
    }
  }

  /**
   * 기존 데이터베이스 삭제후 새로 생성
   */
  private deleteAndSaveDatabaseData() {
    // 데이터베이스 정보가 있다면 삭제
    if (this._sourceData.hasOwnProperty('databaseData')) {
      delete this._sourceData.databaseData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this.saveDatabaseData(this._sourceData);
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @param {string} implementor
   * @returns {boolean}
   */
  private isRequiredDatabase(implementor: string): boolean {
    // postgre 만 사용
    return implementor === 'POSTGRESQL';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @param {string} implementor
   * @returns {boolean}
   */
  private isRequiredSid(implementor: string): boolean {
    // tibero, oracle 만 사용
    return implementor === 'TIBERO' || implementor === 'ORACLE';
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @param {string} implementor
   * @returns {boolean}
   */
  private isRequiredCatalog(implementor: string): boolean {
    // presto 만 사용
    return implementor === 'PRESTO';
  }

  /**
   * 데이터가 변경이 일어났는지 확인
   * @returns {boolean}
   */
  private isChangeData(): boolean {
    // 데이터 타입이 변경된경우
    if (this._sourceData.databaseData.selectedType !== this.selectedType) {
      return true;
    // 현재 데이터 타입이 TABLE 이고 데이터베이스 이름이나 테이블 이름이 변경된 경우
    // 현재 데이터 타입이 QUERY 이고 데이터베이스 이름이나 테이블 이름이 변경된 경우
    } else if ((this.selectedType === 'TABLE'
        && (this._sourceData.databaseData.selectedDatabase !== this.selectedDatabase || this._sourceData.databaseData.selectedTable !== this.selectedTable))
      || (this.selectedType === 'QUERY'
        && (this._sourceData.databaseData.selectedDatabaseQuery !== this.selectedDatabaseQuery || this._sourceData.databaseData.queryText !== this.queryText))) {
      return true;
    }
    return false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 조회 파라메터
   * @returns {Object}
   */
  private getDatabaseParams(): object {
    // db type
    const implementor = this._sourceData.connectionData.selectedDbType.value;
    // params
    const params = {
      connection: {
        implementor: implementor
      }
    };
    // if security type is not USERINFO, add username and password in connection
    if (this._sourceData.connectionData.selectedSecurityType.value !== 'USERINFO') {
      params.connection['username'] = this._sourceData.connectionData.username;
      params.connection['password'] = this._sourceData.connectionData.password;
    }
    // URL 타입이라면
    if (this._sourceData.connectionData.isEnableUrl) {
      params.connection['url'] = this._sourceData.connectionData.url;
    } else {
      // DEFAULT 타입이라면
      params.connection['hostname'] = this._sourceData.connectionData.hostname;
      params.connection['port'] = this._sourceData.connectionData.port;
    }
    // database
    if (this.isRequiredDatabase(implementor)) {
      params.connection['database'] = this._sourceData.connectionData.database;
    }
    // sid
    if (this.isRequiredSid(implementor)) {
      params.connection['sid'] = this._sourceData.connectionData.sid;
    }
    // catalog
    if (this.isRequiredCatalog(implementor)) {
      params.connection['catalog'] = this._sourceData.connectionData.catalog;
    }
    return params;
  }

  /**
   * 테이블 조회 파라메터
   * @param {string} databaseName
   * @returns {{connection: {hostname; port; username; password; implementor}}}
   */
  private getTableParams(databaseName: string) {
    const params = this.getDatabaseParams();
    // 데이터베이스 이름이 존재할때만
    if (databaseName !== '') {
      params['database'] = databaseName;
    }
    return params;
  }

  /**
   * 테이블 | 쿼리 상세조회 파라메터
   * @param {string} databaseName
   * @param {string} tableOrQueryText
   * @returns {{connection: {hostname; port; username; password; implementor}}}
   */
  private getTableDetailParams(databaseName: string, tableOrQueryText: string) {
    const params = this.getTableParams(databaseName);
    // 선택한 탭 타입
    params['type'] = this.selectedType;
    // 선택한 테이블 또는 쿼리
    params['query'] = tableOrQueryText;

    return params;
  }

  /**
   * 서버에서 데이터베이스 목록 조회
   */
  private getDatabaseListFromServer() {
    // loading show
    this.loadingShow();
    // 데이터베이스 리스트 조회
    this.dataconnectionService.getDatabasesWithoutId(this.getDatabaseParams())
      .then((result) => {
        // 데이터베이스 리스트 저장
        this.databaseList = result['databases'];
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 서버에서 테이블 목록 조회
   * @param {string} databaseName
   */
  private getTableListFromServer(databaseName: string) {
    // loading show
    this.loadingShow();
    // resultShowFl
    this.resultTableErrorShowFl = false;
    // 테이블 리스트 조회
    this.dataconnectionService.getTablesWitoutId(this.getTableParams(databaseName))
      .then((result) => {
        // 테이블 목록 저장
        this.tableList = result['tables'] || [];
        // table이 없다면
        result['tables'].length === 0 && (this.resultTableErrorShowFl = true);
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 서버에서 테이블 상세데이터 조회
   * @param {string} databaseName
   * @param {string} tableName
   */
  private getTableDetailFromServer(databaseName: string, tableName: string) {
    // loading show
    this.loadingShow();
    // 상세데이터 조회
    this.dataconnectionService.getTableDetailWitoutId(this.getTableDetailParams(databaseName, tableName))
      .then((result) => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        if (this._sourceData.connectionData.selectedDbType.value === 'HIVE') {
          result['data'] = this._getReplacedDataList(result['data']);
          result['fields'] = this._getReplacedFieldList(result['fields']);
        }
        // 테이블 상세데이터 저장
        this.tableDetailData = result;

        // 그리드 show
        this.tableClearGrid = false;
        // 그리드 업데이트
        this.updateGrid(result['data'], result['fields'], this.selectedType);
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 서버에서 쿼리 상세데이터 조회
   * @param {string} databaseName
   * @param {string} queryText
   */
  private getQueryDetailFromServer(databaseName: string, queryText: string) {
    // loading show
    this.loadingShow();
    // 쿼리 데이터 초기화
    this.queryDetailData = null;
    // 그리드 hide
    this.queryClearGrid = true;
    // 테이블 상세 조회
    this.dataconnectionService.getTableDetailWitoutId(this.getTableDetailParams(databaseName, queryText))
      .then((result) => {
        // error 가 있다면
        if (result.hasOwnProperty('message')) {
          // fail
          this.queryResultFl = false;
          return;
        }
        // 쿼리 데이터 저장
        this.queryDetailData = result;
        // 그리드 show
        this.queryClearGrid = false;
        // 데이터 그리드 업데이트
        this.updateGrid(result['data'], result['fields'], this.selectedType);
        // success
        this.queryResultFl = true;
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        // fail
        this.queryResultFl = false;
        // loading hide
        this.loadingHide();
      });
  }

  /**
   * 테이블 상세데이터 조회
   * @param {string} databaseName
   * @param {string} tableName
   */
  private getTableDetail(databaseName: string, tableName: string): void {
    this.getTableDetailFromServer(databaseName, tableName);
  }

  /**
   * 변경된 필드 리스트 얻기
   * @param fields
   * @private
   */
  private _getReplacedFieldList(fields: any) {
    return fields.map((item) => {
      // name
      item.name = this._sliceTableName(item.name);
      // alias
      item.alias = this._sliceTableName(item.alias);
      return item;
    });
  }

  /**
   * 변경된 데이터 리스트 얻기
   * @param datas
   * @private
   */
  private _getReplacedDataList(datas: any) {
    return datas.map((item) => {
      return this._getReplacedObject(item);
    });
  }

  /**
   * 변경된 object 파일
   * @param {Object} data
   * @returns {{} & any}
   * @private
   */
  private _getReplacedObject(data: object) {
    return Object.assign({}, ...Object.keys(data).map(key => ({[this._sliceTableName(key)]: data[key]})));
  }

  /**
   * 테이블이름 잘라내기
   * @param key
   * @returns {string}
   * @private
   */
  private _sliceTableName(key): string {
    // return key.replace(this.selectedTable + '.', '');
    return key.substr(key.indexOf('.')+1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - setter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 목록 설정
   */
  private setDatabaseList(): void {
    this.getDatabaseListFromServer();
  }

  /**
   * 테이블 리스트 설정
   * @param {string} databaseName
   */
  private setTableList(databaseName: string): void {
    this.getTableListFromServer(databaseName);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - grid
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * grid 정보 업데이트
   * @param data
   * @param {Field[]} fields
   */
  private updateGrid(data: any, fields: Field[], selectedType: string) {
    // headers
    const headers: header[] = this.getHeaders(fields);
    // rows
    const rows: any[] = this.getRows(data);
    // grid 그리기
    const gridComponent = selectedType === 'TABLE' ? this.tableComponent : this.queryComponent;
    this.drawGrid(gridComponent, headers, rows);
  }

  /**
   * 그리드 출력
   * @param {GridComponent} gridComponent
   * @param {any[]} headers
   * @param {any[]} rows
   */
  private drawGrid(gridComponent: GridComponent, headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   */
  private getHeaders(fields: Field[]) {
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
   * rows 얻기
   * @param data
   * @returns {any[]}
   */
  private getRows(data: any) {
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
   * 그리드 데이터 존재시 init
   */
  private initDataGrid() {
    if (this.queryDetailData !== null) {
      this.updateGrid(this.queryDetailData.data, this.queryDetailData.fields, 'QUERY');
    }
    if (this.tableDetailData !== null) {
      this.updateGrid(this.tableDetailData.data, this.tableDetailData.fields, 'TABLE');
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 데이터 init
   */
  private initTableDetail() {
    // 테이블 초기화
    this.selectedTable = '';
    // 테이블 상세정보 초기화
    this.tableDetailData = null;
    // 그리드 클리어
    this.tableClearGrid = true;
  }

  /**
   * 쿼리 데이터 init
   */
  private initQueryDetail() {
    // 쿼리 상세정보 초기화
    this.queryDetailData = null;
    // 그리드 클리어
    this.queryClearGrid = true;
    // 쿼리 성공 초기화
    this.queryResultFl = null;
  }

  /**
   * ui init
   */
  private initView() {
    // 상세 데이터
    // 쿼리 상세데이터
    this.queryDetailData = null;
    // 테이블 상세데이터
    this.tableDetailData = null;
    // database list
    this.databaseList = [];
    // table list
    this.tableList = [];
    // 선택된 데이터베이스
    this.selectedDatabase = '';
    // 선택된 테이블
    this.selectedTable = '';
    // 선택된 데이터베이스 쿼리
    this.selectedDatabaseQuery = '';
    // 선택한 타입
    this.selectedType = 'TABLE';
    // flag
    // 쿼리 조회 성공여부
    this.queryResultFl = null;
    // 쿼리
    this.queryText = '';
    // 그리드 숨기기
    this.tableClearGrid = true;
    this.queryClearGrid = true;
    // search
    // search text database
    this.searchTextDatabase = '';
    // search text database query
    this.searchTextDatabaseQuery = '';
    // search text table
    this.searchTextTable = '';
    // flag
    this.tableShowFl = false;
    this.dbQueryShowFl = false;
    this.dbShowFl = false;

  }

  /**
   * init database data
   * @param databaseData
   */
  private initData(databaseData: any) {
    // 쿼리 상세데이터
    this.queryDetailData = databaseData.queryDetailData;
    // 테이블 상세데이터
    this.tableDetailData = databaseData.tableDetailData;
    // database list
    this.databaseList = databaseData.databaseList;
    // table list
    this.tableList = databaseData.tableList;
    // 선택된 데이터베이스
    this.selectedDatabase = databaseData.selectedDatabase;
    // 선택된 테이블
    this.selectedTable = databaseData.selectedTable;
    // 선택된 데이터베이스 쿼리
    this.selectedDatabaseQuery = databaseData.selectedDatabaseQuery;
    // 선택한 타입
    this.selectedType = databaseData.selectedType;
    // flag
    // 쿼리 조회 성공여부
    this.queryResultFl = databaseData.queryResultFl;
    // 쿼리
    this.queryText = databaseData.queryText;
    // 그리드 숨기기
    this.tableClearGrid = databaseData.tableClearGrid;
    this.queryClearGrid = databaseData.queryClearGrid;
    // search
    // search text database
    this.searchTextDatabase = databaseData.searchTextDatabase;
    // search text database query
    this.searchTextDatabaseQuery = databaseData.searchTextDatabaseQuery;
    // search text table
    this.searchTextTable = databaseData.searchTextTable;
  }

  /**
   * 현재 페이지의 데이터베이스 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveDatabaseData(sourceData: DatasourceInfo) {
    const databaseData = {
      // 쿼리 상세데이터
      queryDetailData: this.queryDetailData,
      // 테이블 상세데이터
      tableDetailData: this.tableDetailData,
      // database list
      databaseList: this.databaseList,
      // table list
      tableList: this.tableList,
      // 선택된 데이터베이스
      selectedDatabase: this.selectedDatabase,
      // 선택된 테이블
      selectedTable: this.selectedTable,
      // 선택된 데이터베이스 쿼리
      selectedDatabaseQuery: this.selectedDatabaseQuery,
      // 선택한 타입
      selectedType: this.selectedType,
      // flag
      // 쿼리 조회 성공여부
      queryResultFl: this.queryResultFl,
      // 쿼리
      queryText: this.queryText,
      // 그리드 숨기기
      tableClearGrid: this.tableClearGrid,
      queryClearGrid: this.queryClearGrid,
      // search
      // search text database
      searchTextDatabase: this.searchTextDatabase,
      // search text database query
      searchTextDatabaseQuery: this.searchTextDatabaseQuery,
      // search text table
      searchTextTable: this.searchTextTable
    };
    sourceData['databaseData'] = databaseData;
  }
}
