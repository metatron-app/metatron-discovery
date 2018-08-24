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

import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MetadataModelService } from '../service/metadata.model.service';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { GridComponent } from '../../../common/component/grid/grid.component';
import * as pixelWidth from 'string-pixel-width';
import { Field } from '../../../domain/datasource/datasource';

/**
 * Creating metadata with Hive - schema step
 */
@Component({
  selector: 'app-hive-select-schema',
  templateUrl: './hive-select-schema.component.html'
})
export class HiveSelectSchemaComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  @ViewChild(GridComponent)
  private _gridComponent: GridComponent;

  // database search text
  public searchTextDatabase: string = '';
  // table search text
  public searchTextTable: string = '';
  // database list
  public databaseList: any[] = [];
  // table list
  public tableList: any[] = [];
  // selected database
  public selectedDatabase: string = '';
  // selected table
  public selectedTable: string = '';
  // table detail data
  public detailData: object = null;
  // grid show hide flag
  public clearGrid: boolean = true;

  // not exist table show flag
  public resultTableErrorShowFl: boolean = false;


  // constructor
  constructor(public metaDataModelService: MetadataModelService,
              private _connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // if exist schemaStep, load data
    this.metaDataModelService.getCreateData()['schemaStep'] && this._loadData(this.metaDataModelService.getCreateData()['schemaStep']);
    // if not exist database list, get database list
    this.databaseList.length === 0 && this._getDatabaseList();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Get database index in database list
   * @returns {number}
   */
  public getSelectedDatabaseIndex(): number {
    return this.selectedDatabase !== '' ? this.databaseList.findIndex((item) => {
      return item === this.selectedDatabase;
    }) : -1;
  }

  /**
   * Get table index in table list
   * @returns {number}
   */
  public getSelectedTableIndex(): number {
    return this.selectedTable !== '' ? this.tableList.findIndex((item) => {
      return item === this.selectedTable;
    }) : -1;
  }

  /**
   * Is enable next validation
   * @returns {boolean}
   */
  public isExistTableDetail(): boolean {
    return this.detailData !== null;
  }

  /**
   * Next button click event
   */
  public onClickNext(): void {
    // if enable next validation
    if (this.isExistTableDetail()) {
      // save schema step data
      this._saveData();
      // go to complete step
      this.metaDataModelService.setCreateStep('complete');
    }
  }

  /**
   * Prev button click event
   */
  public onClickPrev(): void {
    // save schema step data
    this._saveData();
    // go to connection step
    this.metaDataModelService.setCreateStep('hive');
  }

  /**
   * Change database event
   * @param {string} databaseName
   */
  public onChangeDatabase(databaseName: string): void {
    // init table data
    this._initTableDetail();
    // set selected database
    this.selectedDatabase = databaseName;
    // get table list
    this._getTableList(databaseName);
  }

  /**
   * Change table event
   * @param {string} tableName
   */
  public onChangeTable(tableName: string): void {
    // init table data
    this._initTableDetail();
    // set selected table
    this.selectedTable = tableName;
    // get detail data
    this._getDetailData(this.selectedDatabase, tableName);
  }

  /**
   * Change text for search database event
   * @param {string} searchText
   */
  public onSearchTextDatabase(searchText: string): void {
    // set text for search database
    this.searchTextDatabase = searchText;
  }

  /**
   * Change text for search table event
   * @param {string} searchText
   */
  public onSearchTextTable(searchText: string): void {
    // set text for search table
    this.searchTextTable = searchText;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Init table data
   * @private
   */
  private _initTableDetail(): void {
    // init selected table
    this.selectedTable = '';
    // init detail data
    this.detailData = null;
    // grid hide
    this.clearGrid = true;
  }

  /**
   * Save schema step data
   * @private
   */
  private _saveData(): void {
    const schemaStep = {
      // database list
      databaseList: this.databaseList,
      // table list
      tableList: this.tableList,
      // selected database
      selectedDatabase: this.selectedDatabase,
      // selected table
      selectedTable: this.selectedTable,
      // detail data
      detailData: this.detailData,
      // grid show flag
      clearGrid: this.clearGrid
    };
    this.metaDataModelService.patchCreateData('schemaStep', schemaStep);
  }

  /**
   * Load schema step data
   * @param {Object} schemaStep
   * @private
   */
  private _loadData(schemaStep: object): void {
    // database list
    this.databaseList = schemaStep['databaseList'];
    // table list
    this.tableList = schemaStep['tableList'];
    // selected database
    this.selectedDatabase = schemaStep['selectedDatabase'];
    // selected table
    this.selectedTable = schemaStep['selectedTable'];
    // grid show flag
    this.clearGrid = schemaStep['clearGrid'];
    // if exist detail data
    if (schemaStep['detailData']) {
      // set detail data
      this.detailData = schemaStep['detailData'];
      // update grid
      this._updateGrid(schemaStep['detailData'].data, schemaStep['detailData'].fields);
    }
  }

  /**
   * Slice table name
   * @param key
   * @returns {string}
   * @private
   */
  private _sliceTableName(key): string {
    // return key.replace(this.selectedTable + '.', '');
    return key.substr(key.indexOf('.')+1);
  }

  /**
   * Draw grid
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
   * Update grid data
   * @param data
   * @param {Field[]} fields
   * @private
   */
  private _updateGrid(data: any, fields: Field[]) {
    // set headers
    const headers: header[] = this._getHeaders(fields);
    // set rows
    const rows: any[] = this._getRows(data);
    // draw grid
    this._drawGrid(headers, rows);
  }

  /**
   * Get database list
   * @private
   */
  private _getDatabaseList(): void {
    // loading show
    this.loadingShow();
    // get database list
    this._connectionService.getDatabasesWithoutId(this._getConnectionParams())
      .then((result) => {
        // set database list
        this.databaseList = result['databases'];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get table list in database
   * @param {string} databaseName
   * @private
   */
  private _getTableList(databaseName: string): void {
    // loading show
    this.loadingShow();
    // error message hide
    this.resultTableErrorShowFl = false;
    // get database list
    this._connectionService.getTableListForHiveInMetadata(this._getConnectionParams(databaseName))
      .then((result) => {
        // set table list
        this.tableList = result['tables'] || [];
        // if not exist table list, error message show
        result['tables'].length === 0 && (this.resultTableErrorShowFl = true);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get detail data in database table
   * @param {string} databaseName
   * @param {string} tableName
   * @private
   */
  private _getDetailData(databaseName: string, tableName: string): void {
    // loading show
    this.loadingShow();
    // get detail data
    this._connectionService.getTableDetailWitoutId(this._getConnectionParams(databaseName, tableName))
      .then((result) => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        result['data'] = this._getReplacedDataList(result['data']);
        result['fields'] = this._getReplacedFieldList(result['fields']);
        // set detail data
        this.detailData = result;
        // grid show flag true
        this.clearGrid = false;
        // update grid
        this._updateGrid(result['data'], result['fields']);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get parameter for connection
   * @param {string} databaseName
   * @param {string} tableName
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(databaseName?: string, tableName?: string): object {
    // connection data
    const connectionData = this.metaDataModelService.getCreateData()['connectionStep'];
    const params = {
      connection: {
        id: connectionData['selectedConnectionPreset'].id,
        implementor: connectionData['selectedDbType'].value
      },
      type: 'TABLE'
    };
    // if security type is not USERINFO, add username and password in connection
    if (connectionData.selectedSecurityType.value !== 'USERINFO') {
      params.connection['username'] = connectionData['username'];
      params.connection['password'] = connectionData['password'];
    }
    // if enable URL
    if (connectionData['isEnableUrl']) {
      params.connection['url'] = connectionData['url'];
    } else {
      params.connection['hostname'] = connectionData['hostname'];
      params.connection['port'] = connectionData['port'];
    }
    // if exist databaseName, add database(databaseName) in parameter
    databaseName && (params['database'] = databaseName);
    // if exist tableName, add query(tableName) in parameter
    tableName && (params['query'] = tableName);
    return params;
  }

  /**
   * Get replaced field in field list
   * @param fields`
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
   * Get replaced data in list
   * @param datas
   * @private
   */
  private _getReplacedDataList(datas: any) {
    return datas.map((item) => {
      return this._getReplacedObject(item);
    });
  }

  /**
   * Get replaced data in Object
   * @param {Object} data
   * @returns {{} & any}
   * @private
   */
  private _getReplacedObject(data: object) {
    return Object.assign({}, ...Object.keys(data).map(key => ({[this._sliceTableName(key)]: data[key]})));
  }

  /**
   * Get header list
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getHeaders(fields: Field[]) {
    return fields.map(
      (field: Field) => {
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
   * Get row list
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
