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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { DatasourceInfo, Field } from '../../../../../domain/datasource/datasource';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../common/component/grid/grid.option';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import * as _ from 'lodash';
import * as pixelWidth from 'string-pixel-width';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'staging-db-select',
  templateUrl: './staging-db-select-data.component.html'
})
export class StagingDbSelectDataComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  // database list
  private databaseList: any[] = [];

  // table list
  private tableList: any[] = [];

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  // 조회 result message
  public resultTableErrorShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // database 검색어
  public searchTextDatabase: string = '';
  // table 검색어
  public searchTextTable: string = '';

  // 선택된 데이터 베이스
  public selectedDatabase: string = '';
  // 선택된 테이블
  public selectedTable: string = '';
  // 선택된 테이블 데이터
  public selectedTableDetail: any = null;

  // flag
  public dbShowFl: boolean = false;
  public tableShowFl: boolean = false;

  // grid clear
  public clearGrid: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
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

    // 이전에서 넘어온경우 data init
    if (this.sourceData.hasOwnProperty('databaseData')) {
      // data init
      this.initData(_.cloneDeep(this.sourceData.databaseData));
      // grid
      this.updateGrid(this.selectedTableDetail.data, this.selectedTableDetail.fields);
    } else {
      // 데이터베이스 리스트
      this.setDatabaseList();
    }
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
   * 다음 화면으로 이동
   */
  public next() {
    // validation
    if (this.isExistTableDetail()) {
      // 데이터 변경이 일어난경우 스키마 데이터와 적재데이터 제거
      this._deleteSchemaData();
      // 기존 데이터베이스 삭제후 생성
      this.deleteAndSaveDatabaseData();
      // 다음 step 으로 이동
      this.step = 'staging-db-configure-schema';
      this.stepChange.emit(this.step);
    }
  }

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
   * 데이터베이스 place holder
   * @returns {string}
   */
  public get getDatabaseSearchPlaceHolder(): string {
    return this.translateService.instant('msg.storage.ui.dsource.create.search-schema');
  }

  /**
   * 테이블 place holder
   * @returns {string}
   */
  public get getTableSearchPlaceHolder(): string {
    return this.translateService.instant('msg.storage.ui.dsource.create.search-table');
  }

  /**
   * 데이터 베이스 choose text
   * @returns {string}
   */
  public get getDatabaseChooseText(): string {
    return this.translateService.instant('msg.storage.ui.dsource.create.choose-schema');
  }

  /**
   * 테이블 choose text
   * @returns {string}
   */
  public get getTableChooseText(): string {
    return this.translateService.instant('msg.storage.ui.dsource.create.choose-table');
  }

  /**
   * 현재 선택된 데이터베이스 쿼리의 index
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
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
   * 테이블 선택 이벤트
   * @param table
   */
  public onSelectedTable(table: string) {
    // 데이터 초기화
    this.initTableDetail();
    // 선택한 테이블 이름
    this.selectedTable = table;
    // 테이블 상세데이터
    this.setTableDetail(this.selectedDatabase, table);
  }

  /**
   * 데이터베이스 선택된 상태인지 체크
   * @returns {boolean}
   */
  public isSelectedDatabase(): boolean {
    return this.selectedDatabase !== '';
  }

  /**
   * 테이블 상세데이터가 있는지 확인
   * @returns {boolean}
   */
  public isExistTableDetail(): boolean {
    return this.selectedTableDetail !== null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그리드 출력
   * @param {any[]} headers
   * @param {any[]} rows
   */
  private drawGrid(headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * grid 정보 업데이트
   * @param data
   * @param {Field[]} fields
   */
  private updateGrid(data: any, fields: Field[]) {
    // headers
    const headers: header[] = this.getHeaders(fields);
    // rows
    const rows: any[] = this.getRows(data);
    // grid 그리기
    this.drawGrid(headers, rows);
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
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + Field.getSlicedColumnName(field) + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .Formatter((row, cell, value) => {
            let content = value;
            // trans to string
            if (typeof value === "number") {
              content = value + '';
            }
            if (content && content.length > 50) {
              return content.slice(0,50);
            } else {
              return content;
            }
          })
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
   * 데이터가 변경이 일어나고 스키마데이터가 있다면 스키마데이터, 적재데이터 삭제
   */
  private _deleteSchemaData() {
    if (this.isChangeData()) {
      this.sourceData.hasOwnProperty('schemaData') && (delete this.sourceData.schemaData);
      this.sourceData.hasOwnProperty('ingestionData') && (delete this.sourceData.ingestionData);
    }
  }

  /**
   * 기존 데이터베이스 삭제후 새로 생성
   */
  private deleteAndSaveDatabaseData() {
    // 데이터베이스 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('databaseData')) {
      delete this.sourceData.databaseData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this.saveDatabaseData(this.sourceData);
    // set field list, field data
    this.sourceData.fieldList = this.selectedTableDetail.fields;
    this.sourceData.fieldData = this.selectedTableDetail.data;
  }

  /**
   * 현재 페이지의 데이터베이스 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveDatabaseData(sourceData: DatasourceInfo) {
    const databaseData = {
      // database list
      databaseList: this.databaseList,
      // table list
      tableList: this.tableList,
      // database 검색어
      searchTextDatabase: this.searchTextDatabase,
      // table 검색어
      searchTextTable: this.searchTextTable,
      // 선택된 데이터 베이스
      selectedDatabase: this.selectedDatabase,
      // 선택된 테이블
      selectedTable: this.selectedTable,
      // 선택된 테이블 데이터
      selectedTableDetail: this.selectedTableDetail,
      // flag
      dbShowFl: this.dbShowFl,
      tableShowFl: this.tableShowFl,
      // grid clear
      clearGrid: this.clearGrid,
    };

    // file format setting
    if (!this.isExistFileFormat()) {
      this.setDefaultFileFormat(databaseData.selectedTableDetail);
    }


    sourceData['databaseData'] = databaseData;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 변경된 필드 리스트 얻기
   * @param fields
   * @private
   */
  private _getReplacedFieldList(fields: any) {
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
   * @private
   */
  private _sliceTableName(key) {
    // return key.replace(this.selectedTable + '.', '');
    return key.substr(key.indexOf('.')+1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - setter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 파일 포맷이 없는경우 file format 디폴트 값 세팅
   * @param selectedTableDetail
   */
  private setDefaultFileFormat(selectedTableDetail) {
    selectedTableDetail['fileFormat'] = {
      type: 'csv',
      delimeter: ","
    };
  }

  /**
   * 데이터베이스 목록 설정
   */
  private setDatabaseList(): void {
    // loading show
    this.loadingShow();

    this.connectionService.getDatabaseForHive()
      .then((result) => {
        // 목록 저장
        this.databaseList = result['databases'];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 테이블 리스트 설정
   * @param {string} databaseName
   */
  private setTableList(databaseName: string): void {
    // loading show
    this.loadingShow();
    // resultShowFl
    this.resultTableErrorShowFl = false;
    // 테이블 리스트 조회
    this.connectionService.getTableForHive(databaseName)
      .then((result) => {
        // 테이블 리스트 저장
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
   * 테이블 상세데이터 설정
   * @param {string} databaseName
   * @param {string} tableName
   */
  private setTableDetail(databaseName: string, tableName: string) {
    // loading show
    this.loadingShow();
    this.connectionService.getTableDataForHive({
      database: databaseName,
      type: 'TABLE',
      query: tableName
      })
      .then((result) => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        result['data'] = this._getReplacedDataList(result['data']);
        result['fields'] = this._getReplacedFieldList(result['fields']);
        // 테이블 상세데이터
        this.selectedTableDetail = result;
        // grid show
        this.clearGrid = false;
        // loading hide
        this.loadingHide();
        // grid update
        this.updateGrid(result['data'], result['fields']);
      })
      .catch((error) => {
        if (error.code && error.code === 'error.dataconnection.stagedb.preview.table') {
          // loading hide
          this.loadingHide();
          // grid hide
          this.clearGrid = true;
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터가 변경이 일어났는지 확인
   * @returns {boolean}
   */
  private isChangeData(): boolean {
    if (this.sourceData.databaseData) {
      // 데이터베이스 이름이 변경된 경우
      if (this.sourceData.databaseData.selectedDatabase !== this.selectedDatabase) {
        return true;
      }
      // 테이블 이름이 변경된 경우
      if (this.sourceData.databaseData.selectedTable !== this.selectedTable) {
        return true;
      }
    }
    return false;
  }

  /**
   * detail 데이터에 file format 이 있는지
   * @returns {boolean}
   */
  private isExistFileFormat(): boolean {
    if (this.selectedTableDetail.hasOwnProperty('fileFormat')) {
      return true;
    }
    return false;
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
    this.selectedTableDetail = null;
    // 그리드 클리어
    this.clearGrid = true;
  }

  /**
   * init view
   */
  private initView() {
    // database list
    this.databaseList = [];
    // table list
    this.tableList = [];
    // database 검색어
    this.searchTextDatabase = '';
    // table 검색어
    this.searchTextTable = '';
    // 선택된 데이터 베이스
    this.selectedDatabase = '';
    // 선택된 테이블
    this.selectedTable = '';
    // 선택된 테이블 데이터
    this.selectedTableDetail = null;
    // flag
    this.dbShowFl = false;
    this.tableShowFl = false;
    // grid clear
    this.clearGrid = true;
  }

  /**
   * init database data
   * @param databaseData
   */
  private initData(databaseData: any) {
    // database list
    this.databaseList = databaseData.databaseList;
    // table list
    this.tableList = databaseData.tableList;
    // database 검색어
    this.searchTextDatabase = databaseData.searchTextDatabase;
    // table 검색어
    this.searchTextTable = databaseData.searchTextTable;
    // 선택된 데이터 베이스
    this.selectedDatabase = databaseData.selectedDatabase;
    // 선택된 테이블
    this.selectedTable = databaseData.selectedTable;
    // 선택된 테이블 데이터
    this.selectedTableDetail = databaseData.selectedTableDetail;
    // flag
    this.dbShowFl = databaseData.dbShowFl;
    this.tableShowFl = databaseData.dbShowFl;
    // grid clear
    this.clearGrid = databaseData.dbShowFl;
  }
}
