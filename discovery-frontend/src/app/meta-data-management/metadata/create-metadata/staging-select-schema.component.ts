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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { MetadataModelService } from '../service/metadata.model.service';
import * as pixelWidth from 'string-pixel-width';
import { Field } from '../../../domain/datasource/datasource';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { GridOption } from '../../../common/component/grid/grid.option';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';

@Component({
  selector: 'app-staging-select-schema',
  templateUrl: './staging-select-schema.component.html'
})
export class StagingSelectSchemaComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(GridComponent)
  private _gridComponent: GridComponent;

  // loadingPart div
  @ViewChild('loadingPart')
  private loadingPart: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터베이스 검색어
  public searchTextDatabase: string = '';
  // 테이블 검색어
  public searchTextTable: string = '';
  // 데이터베이스 목록
  public databaseList: any[] = [];
  // 테이블 목록
  public tableList: any[] = [];
  // 선택한 데이터베이스
  public selectedDatabase: string = '';
  // 선택한 테이블
  public selectedTable: string = '';
  // 상세데이터
  public detailData: object = null;
  // 그리드 flag
  public clearGrid: boolean = true;

  // 조회 result message
  public resultTableErrorShowFl: boolean = false;

  // loading part flag
  public isLoading: boolean = false;


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _connectionService: DataconnectionService,
              public metaDataModelService: MetadataModelService,
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
    // 데이터 로드
    this.metaDataModelService.getCreateData()['schemaStep'] && this._loadData(this.metaDataModelService.getCreateData()['schemaStep']);
    // 데이터베이스 목록이 없다면 데이터베이스 목록 조회
    this.databaseList.length === 0 && this._getDatabaseList();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
    console.info('destroy');
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * 선택된 데이터베이스 index
   * @returns {number}
   */
  public getSelectedDatabaseIndex(): number {
    return this.selectedDatabase !== '' ? this.databaseList.findIndex((item) => {
      return item === this.selectedDatabase;
    }) : -1;
  }

  /**
   * 선택된 테이블 index
   * @returns {number}
   */
  public getSelectedTableIndex(): number {
    return this.selectedTable !== '' ? this.tableList.findIndex((item) => {
      return item === this.selectedTable;
    }) : -1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스가 선택된 상태인지 확인
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
    return this.detailData !== null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 다음 클릭 이벤트
   */
  public onClickNext(): void {
    // validation
    if (this.isExistTableDetail()) {
      // 현재 데이터 저장
      this._saveData();
      // 화면 전환
      this.metaDataModelService.setCreateStep('complete');
    }
  }

  /**
   * 데이터베이스가 변경된 경우 이벤트
   * @param {string} databaseName
   */
  public onChangeDatabase(databaseName: string): void {
    // 이전에 선택한 테이블 초기화
    this._initTableDetail();
    // 선택한 데이터베이스 이름
    this.selectedDatabase = databaseName;
    // 테이블 목록 조회
    this._getTableList(databaseName);
  }

  /**
   * 테이블이 변경된 경우 이벤트
   * @param {string} tableName
   */
  public onChangeTable(tableName: string): void {
    // 이전에 선택한 테이블 초기화
    this._initTableDetail();
    // 선택한 테이블 이름
    this.selectedTable = tableName;
    // 상세정보 조회
    this._getDetailData(this.selectedDatabase, tableName);
  }

  /**
   * 데이터베이스 검색어가 변경된 경우 이벤트
   * @param {string} searchText
   */
  public onSearchTextDatabase(searchText: string): void {
    // 데이터베이스 검색어
    this.searchTextDatabase = searchText;
  }

  /**
   * 테이블 검색어가 변경된 경우 이벤트
   * @param {string} searchText
   */
  public onSearchTextTable(searchText: string): void {
    // 테이블 검색어
    this.searchTextTable = searchText;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 데이터 init
   * @private
   */
  private _initTableDetail(): void {
    // 테이블 초기화
    this.selectedTable = '';
    // 테이블 상세정보 초기화
    this.detailData = null;
    // 그리드 클리어
    this.clearGrid = true;
  }

  /**
   * 현재 데이터 저장
   * @private
   */
  private _saveData(): void {
    const schemaStep = {
      // 데이터베이스 목록
      databaseList: this.databaseList,
      // 테이블 목록
      tableList: this.tableList,
      // 선택한 데이터베이스
      selectedDatabase: this.selectedDatabase,
      // 선택한 테이블
      selectedTable: this.selectedTable,
      // 상세데이터
      detailData: this.detailData,
      // 그리드 flag
      clearGrid: this.clearGrid
    };
    this.metaDataModelService.patchCreateData('schemaStep', schemaStep);
  }

  /**
   * 데이터 블러오기
   * @param {Object} schemaStep
   * @private
   */
  private _loadData(schemaStep: object): void {
    // 데이터베이스 목록
    this.databaseList = schemaStep['databaseList'];
    // 테이블 목록
    this.tableList = schemaStep['tableList'];
    // 선택한 데이터베이스
    this.selectedDatabase = schemaStep['selectedDatabase'];
    // 선택한 테이블
    this.selectedTable = schemaStep['selectedTable'];
    // 그리드 flag
    this.clearGrid = schemaStep['clearGrid'];
    // 상세데이터가 존재한다면
    if (schemaStep['detailData']) {
      // 상세데이터
      this.detailData = schemaStep['detailData'];
      //그리드 업데이트
      this._updateGrid(schemaStep['detailData'].data, schemaStep['detailData'].fields);
    }
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

  /**
   * 그리드 출력
   * @param {any[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    this._gridComponent.create(headers, rows, new GridOption()
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
   * @private
   */
  private _updateGrid(data: any, fields: Field[]) {
    // headers
    const headers: header[] = this._getHeaders(fields);
    // rows
    const rows: any[] = this._getRows(data);
    // grid 그리기
    this._drawGrid(headers, rows);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 목록 조회
   * @private
   */
  private _getDatabaseList(): void {
    // 로딩 show
    this.isLoading = true;
    // 데이터 베이스 목록 조회
    const sub = this._connectionService.getDatabaseForHiveWithCancel()
      .subscribe(
        res => {
          // 데이터베이스 목록 저장
          this.databaseList = res['databases'];
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        },
        err => {
          console.info('error');
          this.commonExceptionHandler(err)
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        }
      );
    this.subscriptions.push(sub);
  }

  /**
   * 테이블 목록 조회
   * @param {string} databaseName
   * @private
   */
  private _getTableList(databaseName: string): void {
    // 로딩 show
    this.isLoading = true;
    // resultShowFl
    this.resultTableErrorShowFl = false;
    // 데이터 베이스 목록 조회
    const sub = this._connectionService.getTableListForStageInMetadataWithCancel(databaseName)
      .subscribe(
        res => {
          // 테이블 목록 저장
          this.tableList = res['tables'] || [];
          // table이 없다면
          res['tables'].length === 0 && (this.resultTableErrorShowFl = true);
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        },
        err => {
          console.info('error');
          this.commonExceptionHandler(err);
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        }
      );
    this.subscriptions.push(sub);
  }

  /**
   * 상세 데이터 조회
   * @param {string} databaseName
   * @param {string} tableName
   * @private
   */
  private _getDetailData(databaseName: string, tableName: string): void {
    // 로딩 show
    this.isLoading = true;
    // 상세 데이터 조회
    const sub = this._connectionService.getTableDataForHiveWithCancel({
      database: databaseName,
      type: 'TABLE',
      query: tableName
    })
      .subscribe(
        res => {
          // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
          res['data'] = this._getReplacedDataList(res['data']);
          res['fields'] = this._getReplacedFieldList(res['fields']);
          // 상세 데이터 저장
          this.detailData = res;
          // 그리드 show
          this.clearGrid = false;
          // 그리드 업데이트
          this._updateGrid(res['data'], res['fields']);
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        },
        err => {
          this.commonExceptionHandler(err);
          this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
          this.isLoading = false;
        }
      );
    this.subscriptions.push(sub);
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
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getHeaders(fields: Field[]) {
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
   * @private
   */
  private _getRows(data: any) {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }
}
