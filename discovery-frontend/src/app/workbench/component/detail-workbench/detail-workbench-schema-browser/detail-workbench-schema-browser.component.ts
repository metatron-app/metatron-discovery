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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Page} from '@domain/common/page';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {Alert} from '@common/util/alert.util';
import {Workbench} from '@domain/workbench/workbench';
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {GridOption} from '@common/component/grid/grid.option';
import {WorkbenchService} from '../../../service/workbench.service';
import {ActivatedRoute} from '@angular/router';
import {Dataconnection} from '@domain/dataconnection/dataconnection';
import {MetadataService} from '../../../../meta-data-management/metadata/service/metadata.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {AbstractWorkbenchComponent} from '../../abstract-workbench.component';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from '@common/util/common.util';
import * as _ from 'lodash';

@Component({
  selector: 'detail-workbench-schema-browser',
  templateUrl: './detail-workbench-schema-browser.component.html',
})
export class DetailWorkbenchSchemaBrowserComponent extends AbstractWorkbenchComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  //
  @ViewChild('schemaMain')
  private gridSchemaComponent: GridComponent;

  //
  @ViewChild('schemaColumn')
  private gridSchemaColumnComponent: GridComponent;

  //
  @ViewChild('schemaData')
  private gridSchemaDataComponent: GridComponent;

  //
  private selectedTabNum: number = 0;

  //
  private workbench: Workbench;

  //
  private workbenchId: string;

  //
  private _websocketId: string;

  // tab list
  private textList: any[]; // { name: '' + this.tabNum, query: '', selected: true }

  // request reconnect count
  private _getColumnListReconnectCount: number = 0;
  private _getMetaDataReconnectCount: number = 0;
  private _getSingleQueryReconnectCount: number = 0;
  private _getTableDetailDataReconnectCount: number = 0;
  private _getDatabaseListReconnectCount: number = 0;
  private _getTableListReconnectCount: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  //
  public dataConnection: Dataconnection = new Dataconnection();

  //
  public databaseList: any[] = [];

  //
  public schemaTableList: any[] = [];
  //
  public schemaTableColumnList: any[] = [];

  //
  public schemaTableMetadataList: any[] = [];

  //
  public schemaTableDataList: any[] = [];
  public schemaTableDataDataList: any[] = [];


  //  .
  public schemaSelectedTab: string = '';

  //
  public selectedSchemaTable: string = '';

  //
  public searchTableText: string = '';
  //
  public searchColumnText: string = '';
  //
  public searchDataText: string = '';
  //
  public searchDatabaseText: string = '';

  //
  public selectedDatabaseName: string;

  //
  public isFull: boolean;

  // show flag
  public isShow: boolean;
  //   show flag
  public connectionInfoShowFl: boolean = false;
  //   show flag
  public databaseListShowFl: boolean = false;

  // tab list, no data
  public isColumListNoData: boolean = false;
  public isMetadataListNoData: boolean = false;
  public isDataListNoData: boolean = false;

  public connTargetImgUrl: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  //
  constructor(private activatedRoute: ActivatedRoute,
              private _metaDataService: MetadataService,
              private connectionService: DataconnectionService,
              protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(workbenchService, element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // browser data
    this._getBrowserData();
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
   * init
   */
  public init(param: object): void {
    // ui
    this._initView();
    //
    this.isFull = false;
    // show
    this.isShow = true;
    // item
    this.workbench = param['workbench'];
    this.workbenchId = param['workbenchId'];
    this._websocketId = param['websocketId'];
    this.textList = param['textList'];
    //
    this.dataConnection = _.cloneDeep(this.workbench.dataConnection);
    //
    this.selectedDatabaseName = this.dataConnection.database;
    //
    this.selectedSchemaTable = '';
    //
    this.schemaSelectedTab = '';
    //
    this.databaseList = [];
    this.schemaTableList = [];
    this.schemaTableColumnList = [];
    this.schemaTableMetadataList = [];
    this.schemaTableDataList = [];
    this.schemaTableDataDataList = [];
    //
    if (isNullOrUndefined(this.dataConnection.authenticationType)) {
      this.dataConnection.authenticationType = 'MANUAL';
    }

    //
    this._getDatabaseList();
  }

  /**
   *
   */
  public close() {
    this.isShow = false;
  }

  /**
   *
   */
  public changeWindowMode(): void {
    // close
    this.close();
    //
    const param = {
      workbench: this.workbench,
      workbenchId: this.workbenchId,
      websocketId: WorkbenchService.websocketId,
      textList: this.textList
    };
    //
    sessionStorage.setItem('METATRON_SCHEMA_BROWSER_DATA' + this.workbenchId, JSON.stringify(param));
    const popupX = (window.screen.width / 2) - (1200 / 2);
    const popupY = (window.screen.height / 2) - (900 / 2);
    const popUrl = `workbench/${this.workbenchId}/schemabrowser`;
    //
    window.open(popUrl, '', 'status=no, height=700, width=1200, left=' + popupX + ', top=' + popupY + ', screenX=' + popupX + ', screenY= ' + popupY);
    //
    sessionStorage.removeItem('METATRON_SCHEMA_BROWSER_DATA' + this.workbenchId);
  }

  /**
   *
   * @returns {boolean}
   */
  public isMoreDatabaseList(): boolean {
    return this.page.page < this.pageResult.totalPages - 1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   */
  public getTableList() {
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 5000;
    //  show
    this.loadingShow();
    //
    this._getSearchTablesForServer(this.dataConnection, this.selectedDatabaseName, page);
  }

  /**
   *
   */
  public getColumnList() {
    //
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    //
    this.searchColumnText = '';
    //
    this.schemaSelectedTab = 'column';
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 99999;
    //
    this._getColumnListForServer(this.dataConnection.id, this.selectedDatabaseName, this.selectedSchemaTable, this._websocketId, page);
  }

  /**
   *
   */
  public getMetaData() {
    //
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    //
    this.schemaSelectedTab = 'metadata';
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 99999;
    //
    this._getMetaDataForServer(this.dataConnection.id, this.selectedDatabaseName, this.selectedSchemaTable, this._websocketId, page);
  }

  /**
   *
   */
  public getTableDetailData() {
    //
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    //
    this.searchDataText = '';
    //
    this._getTableDetailDataForServer(this.textList[this.selectedTabNum]['editorId'], this._websocketId);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   * @param {string} database
   */
  public onChangeDatabase(database: string): void {
    // close show list
    this.databaseListShowFl = false;
    //
    this.selectedDatabaseName = database;
    //
    this.schemaTableList = [];
    //
    this.selectedSchemaTable = '';
    //
    this.getTableList();
  }

  public onSearchDatabaseKeypress(event: KeyboardEvent): void {
    this.searchDatabaseText = this._inputSearch.nativeElement.value;
    if (13 === event.keyCode) {
      this._searchDatabase();
    } else if (27 === event.keyCode) {
      this.onSearchDatabaseClear();
    }
  }

  public onSearchDatabaseClear(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    this._inputSearch.nativeElement.value = '';
    this._searchDatabase();
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  public onSearchTable(event: KeyboardEvent): void {
    //
    this.searchTableText = event.target['value'];
    //
    this._searchTableEvent();
  }

  /**
   *
   */
  public onSearchTableInit(): void {
    //
    this.searchTableText = '';
    //
    this._searchTableEvent();
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  public onSearchColumn(event: KeyboardEvent): void {
    //
    this.searchColumnText = event.target['value'];
    //
    this._searchColumnEvent();
  }

  /**
   *
   */
  public onSearchColumnInit(): void {
    //
    this.searchColumnText = '';
    //
    this._searchColumnEvent();
  }

  /**
   *
   * @param {KeyboardEvent} event
   */
  public onSearchData(event: KeyboardEvent): void {
    //
    this.searchDataText = event.target['value'];
    //
    this._searchDataEvent();
  }

  /**
   *
   */
  public onSearchDataInit(): void {
    //
    this.searchDataText = '';
    //
    this._searchDataEvent();
  }

  /**
   *
   * @param event
   */
  public onSelectedTable(event) {
    //
    this.selectedSchemaTable = event.row.name;
    //    show
    switch (this.schemaSelectedTab) {
      case 'column':
        this.getColumnList();
        break;
      case 'metadata':
        this.getMetaData();
        break;
      case 'data':
        this.getTableDetailData();
        break;
      default:
        this.getColumnList();
        break;
    }
  }

  /**
   * open or cloe data connection info layer
   */
  public connectionInfoShow(event: MouseEvent) {

    this.connectionInfoShowFl = !this.connectionInfoShowFl;
    this.safelyDetectChanges();

    const target = $(event.target);
    const infoLeft: number = target.offset().left;
    const infoTop: number = target.offset().top;
    const element = document.getElementById(`connectionInfo`);
    $(element).css({left: infoLeft - 30, top: infoTop + 17});

  } // function - dataConnectionInfoShow

  /**
   *  Default
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return StringUtil.isEmpty(this.dataConnection.url);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   * @private
   */
  private _initView(): void {
    //
    this.databaseList = [];
    //
    this.selectedDatabaseName = '';
    //
    this.searchDatabaseText = '';
    // connection info flag
    this.connectionInfoShowFl = false;
    // database list flag
    this.databaseListShowFl = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   * @private
   */
  private _searchTableEvent(): void {
    //
    if (typeof this.gridSchemaComponent !== 'undefined') {
      //
      this._searchGridComponent(this.gridSchemaComponent, this.searchTableText);
    }
  }

  /**
   *
   * @private
   */
  private _searchColumnEvent(): void {
    //
    if (typeof this.gridSchemaColumnComponent !== 'undefined') {
      //
      this._searchGridComponent(this.gridSchemaColumnComponent, this.searchColumnText);
    }
  }

  /**
   *
   * @private
   */
  private _searchDataEvent(): void {
    //
    if (typeof this.gridSchemaDataComponent !== 'undefined') {
      //
      this._searchGridComponent(this.gridSchemaDataComponent, this.searchDataText);
    }
  }

  /**
   *
   * @private
   */
  private _searchDatabase(): void {
    this.searchDatabaseText = this._inputSearch.nativeElement.value;
    this.page.page = 0;
    this.databaseList = [];
    this._getDatabaseList(true);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   * @param {boolean} searchFl
   * @private
   */
  private _getDatabaseList(searchFl: boolean = false): void {
    this.connTargetImgUrl = this.getConnImplementorImgUrl(
      this.dataConnection.connectionInformation.implementor,
      this.dataConnection.connectionInformation.iconResource1
    );
    this._getDatabaseListReconnectCount++;

    this.loadingShow();
    this.connectionService.getDatabaseListInConnection(this.dataConnection.id, this._getParameterForDatabase(this._websocketId, this.page, this.searchDatabaseText))
      .then((data) => {
        if (data) {
          this._getDatabaseListReconnectCount = 0;
          this.databaseList = this.databaseList.concat(data.databases);
          this.pageResult = data.page;
        }

        searchFl ? this.loadingHide() : this.getTableList();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getDatabaseListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getDatabaseList(searchFl);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   *
   * @param dataConnection
   * @param {string} databaseName
   * @param {Page} page
   * @param {string} tableName
   * @private
   */
  private _getSearchTablesForServer(dataConnection, databaseName: string, page: Page, tableName: string = ''): void {
    //
    this._getTableListReconnectCount++;

    dataConnection.database = databaseName;
    //  show
    this.loadingShow();
    this.connectionService.getTableListInConnectionQuery(dataConnection, this._getParameterForTable(this._websocketId, page, tableName))
      .then((result) => {
        //
        this._getTableListReconnectCount = 0;
        //  hide
        this.loadingHide();
        // table
        if (result['tables']) {
          //
          this.schemaTableList = result['tables'];
          //
          this._getTableMetaDataList(result['tables']);
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getSearchTablesForServer(dataConnection, databaseName, page, tableName);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   *
   * @param {string} connectionId
   * @param {string} databaseName
   * @param {string} tableName
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} columnNamePattern
   * @private
   */
  private _getColumnListForServer(connectionId: string, databaseName: string, tableName: string, webSocketId: string, page: Page, columnNamePattern: string = ''): void {
    //
    this._getColumnListReconnectCount++;
    // no data
    this.isColumListNoData = false;
    //  show
    this.loadingShow();
    this.connectionService.getColumnList(connectionId, databaseName, tableName, columnNamePattern, webSocketId, page)
      .then((result) => {
        //
        this._getColumnListReconnectCount = 0;
        // column list
        if (result['columns']) {
          //
          this.schemaTableColumnList = result['columns'];
          //
          this._getTableMetaDataDetail(tableName);
        } else {
          //
          this.schemaTableColumnList = [];
          this.isColumListNoData = true;
          Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
          //  hide
          this.loadingHide();
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getColumnListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getColumnListForServer(connectionId, databaseName, tableName, this._websocketId, page, columnNamePattern);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   *
   * @param {string} connectionId
   * @param {string} databaseName
   * @param {string} tableName
   * @param {string} webSocketId
   * @param {Page} page
   * @private
   */
  private _getMetaDataForServer(connectionId: string, databaseName: string, tableName: string, webSocketId: string, page: Page): void {
    //
    this._getMetaDataReconnectCount++;
    // no data
    this.isMetadataListNoData = false;
    //  show
    this.loadingShow();
    this.connectionService.getTableInfomation(connectionId, databaseName, tableName, webSocketId, page)
      .then((result) => {
        //
        this._getMetaDataReconnectCount = 0;
        //  hide
        this.loadingHide();

        //
        this.schemaTableMetadataList = [];

        const resultData = [];
        for (const key in result) {
          if (key) {
            const param = {
              itemKey: key,
              item: result[key]
            };
            resultData.push(param);
          }
        }

        //
        let tempLabel = '';
        let tempArr: any[] = [];

        // result Data
        for (const key in resultData) {
          if (key) {
            const tempData = {
              label: '',
              data: tempArr
            };

            if (resultData[key]['itemKey'].startsWith('#')) {

              if (key !== '0') {
                tempData.label = tempLabel.split('#')[1];
                tempData.data = tempArr;
                this.schemaTableMetadataList.push(tempData);

                tempLabel = '';
                tempArr = [];
              }

              // label
              tempLabel = resultData[key]['itemKey'];
            } else {
              // data
              tempArr.push(resultData[key]);
            }

            //
            if (resultData.length - 1 === Number(key)) {
              tempData.label = tempLabel.split('#')[1];
              tempData.data = tempArr;
              this.schemaTableMetadataList.push(tempData);
            }
          }
        }

        //
        if (this.schemaTableMetadataList.length === 0) {
          this.isMetadataListNoData = true;
        }

      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getMetaDataReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getMetaDataForServer(connectionId, databaseName, tableName, this._websocketId, page);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   *
   * @param {string} editorId
   * @param {string} webSocketId
   * @private
   */
  private _getTableDetailDataForServer(editorId: string, webSocketId: string): void {
    //
    this._getTableDetailDataReconnectCount++;
    //  show
    this.loadingShow();
    this.workbenchService.checkConnectionStatus(editorId, webSocketId)
      .then((result) => {
        //
        this._getTableDetailDataReconnectCount = 0;
        if (result === 'IDLE') {
          //
          this.schemaSelectedTab = 'data';
          //
          this._getSingleQueryForServer();
        } else {
          //  hide
          this.loadingHide();
          Alert.error(this.translateService.instant('msg.bench.ui.query.run'));
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableDetailDataReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getTableDetailDataForServer(editorId, this._websocketId);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   *
   * @private
   */
  private _getSingleQueryForServer(): void {

    //      - init
    this.dataConnection.database = this.selectedDatabaseName;
    // no data
    this.isDataListNoData = false;
    //
    this._getSingleQueryReconnectCount++;
    this.workbenchService.getSchemaInfoTableData(this.selectedSchemaTable, this.dataConnection)
      .then((result) => {
        //
        this._getSingleQueryReconnectCount = 0;

        if (result.data.length > 0) {
          this.schemaTableDataList = result;
          this.schemaTableDataDataList = result.data;
          //
          this._drawGridTableDetailData();
        } else {
          this.schemaTableDataList = [];
          this.schemaTableDataDataList = [];
          this.isDataListNoData = true;
          // Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
        }
        //  hide
        this.loadingHide();

      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getSingleQueryReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getSingleQueryForServer();
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  // /**
  //  *
  //  * @returns {QueryEditor}
  //  * @private
  //  */
  // private _getQueryEditor(): QueryEditor {
  //   const queryEditor: QueryEditor = new QueryEditor();
  //   queryEditor.name = this.textList[this.selectedTabNum]['name'];
  //   queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
  //   queryEditor.order = this.selectedTabNum;
  //   // query
  //   queryEditor.query = 'select * from ' + this.selectedDatabaseName + '.' + this.selectedSchemaTable + ';';
  //   // webSocket id
  //   queryEditor.webSocketId = this._websocketId;
  //   // editor id
  //   queryEditor.editorId = this.textList[this.selectedTabNum]['editorId'];
  //   return queryEditor;
  // }

  /**
   * session storage
   * @private
   */
  private _getBrowserData(): void {
    let workbenchId: string;
    // url  id parse
    this.activatedRoute.params.subscribe((params) => {
      workbenchId = params['id'];
    });
    const param = JSON.parse(sessionStorage.getItem('METATRON_SCHEMA_BROWSER_DATA' + workbenchId));
    //
    sessionStorage.removeItem('METATRON_SCHEMA_BROWSER_DATA' + workbenchId);
    //
    if (param) {
      // ui
      this._initView();
      // show flag
      this.isShow = true;
      this.isFull = true;
      // workbench
      this.workbench = param.workbench;
      this.workbenchId = param.workbenchId;
      this._websocketId = param.websocketId;
      this.textList = param.textList;
      //
      this.dataConnection = _.cloneDeep(this.workbench.dataConnection);
      //
      this.selectedDatabaseName = this.dataConnection.database;
      //
      this._getDatabaseList();
    }
  }

  /**
   *
   * @param {any[]} tableList
   * @private
   */
  private _getTableMetaDataList(tableList: any[]): void {
    this._metaDataService.getMetadataByConnection(this.dataConnection.id, this.selectedDatabaseName, tableList.map(item => item), 'forItemListView')
      .then((result) => {
        // result   merge
        if (result.length > 0) {
          this.schemaTableList = this.schemaTableList.map((item) => {
            return _.merge(item, _.find(result.map((column) => {
              return {table: column.table, metadataName: column.name}
            }), {table: item}));
          });
        }
        //
        this._drawGridTableList();
        //  hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   *
   * @param {string} tableName
   * @private
   */
  private _getTableMetaDataDetail(tableName: string): void {

    // table array
    const tableNameArr: string[] = [];
    if (tableName !== '') {
      tableNameArr.push(tableName);
    }

    this._metaDataService.getMetadataByConnection(this.dataConnection.id, this.selectedDatabaseName, tableNameArr)
      .then((result) => {
        // result   merge
        if (result.length > 0) {
          this.schemaTableColumnList = this.schemaTableColumnList.map((item) => {
            return _.merge(item, _.find(result[0].columns, {physicalName: item.columnName}));
          });
        }
        //
        this._drawGridColumnList();
        //  hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - grid
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *
   * @private
   */
  private _drawGridColumnList(): void {
    // data
    const data: any = this.schemaTableColumnList;
    const enableMetaData: boolean = _.some(this.schemaTableColumnList, column => column.name);
    // headers
    const headers: Header[] = [];
    // Physical name
    headers.push(this._createSlickGridHeader('physicalName', 'Column Name', 300));
    // Logical name
    enableMetaData && headers.push(this._createSlickGridHeader('LogicalName', 'Logical Column Name', 300));
    // Type
    headers.push(this._createSlickGridHeader('type', 'Type', 200));
    // Desc
    headers.push(this._createSlickGridHeader('description', 'Description', 300));
    // rows
    const rows: any[] = [];
    for (let idx: number = 0, nMax = data.length; idx < nMax; idx = idx + 1) {
      const row = {};
      // Physical name
      row['physicalName'] = data[idx]['columnName'];
      // Logical name
      enableMetaData && (row['LogicalName'] = data[idx]['name']);
      // Type
      // column size
      if (isUndefined(data[idx]['columnSize'])) {
        row['type'] = data[idx]['columnType'];
      } else {
        row['type'] = data[idx]['columnType'] + '(' + data[idx]['columnSize'] + ')';
      }
      // Desc
      row['description'] = data[idx]['description'];
      rows.push(row);
    }
    //
    this._createGridComponent(this.gridSchemaColumnComponent, headers, rows, 32);
  }

  /**
   *
   * @private
   */
  private _drawGridTableList(): void {
    // data
    const data: any = this.schemaTableList;
    const enableMetaData: boolean = _.some(this.schemaTableList, table => table.metadataName);
    // headers
    const headers: Header[] = [];
    // headers.push(this._createSlickGridHeader('name', 200));
    // headers.push(this._createSlickGridHeader('type', 120));
    // headers.push(this._createSlickGridHeader('comment', 260));

    headers.push(this._createSlickGridHeader('name', 'Table Name', enableMetaData ? 230 : 460));
    // MetaData name
    enableMetaData && headers.push(this._createSlickGridHeader('metadataName', 'Metadata Name', 230));

    // rows
    const rows: any[] = [];
    for (let idx: number = 0, nMax = data.length; idx < nMax; idx = idx + 1) {
      const row = {};
      row['name'] = data[idx];
      enableMetaData && (row['metadataName'] = data[idx]['metadataName'] || '');
      rows.push(row);
    }
    //
    this._createTableGridComponent(this.gridSchemaComponent, headers, rows, 32);
    //
    if (this.searchTableText !== '') {
      //
      this.onSearchTableInit();
    }

    //     column
    if (this.schemaTableList.length > 0) {
      //
      this.selectedSchemaTable = this.schemaTableList[0];
      this.schemaSelectedTab = 'column';
      this.getColumnList();

      //
      this.gridSchemaComponent.selectRowActivate(0);
      //   sort asc
      this.gridSchemaComponent.setCurrentSortColumns(true);

      for (let index: number = 0; index < headers.length; index++) {
        // icon default
        const gridSchemaHeader = $('.ddp-pop-wrapList .slick-header-columns');
        gridSchemaHeader.find('.slick-sort-indicator').eq(index).removeClass('slick-sort-indicator-asc');
      }

    }
  }

  /**
   *
   * @private
   */
  private _drawGridTableDetailData(): void {
    // data
    const data: any = this.schemaTableDataList;
    // headers
    const headers: Header[] = [];
    for (let index: number = 0, nMax = data.fields.length; index < nMax; index = index + 1) {
      const temp = data.fields[index].name;
      const columnCnt = temp.length;
      //
      const columnWidth = (7 > columnCnt) ? 80 : (columnCnt * 13.5);
      headers.push(this._createSlickGridHeader(temp, temp, columnWidth, data.fields[index].logicalType.toString()));
    }
    // rows
    const rows: any[] = [];
    for (let idx1: number = 0, nMax1 = data.data.length; idx1 < nMax1; idx1 = idx1 + 1) {
      const row = {};
      for (let idx2: number = 0, nMax2 = data.fields.length; idx2 < nMax2; idx2 = idx2 + 1) {
        const temp = data.fields[idx2].name;
        if (data.fields[idx2].logicalType === 'INTEGER') {
          try {
            row[temp] = Number(data.data[idx1][temp]);
          } catch (e) {
            row[temp] = 0;
          }
        } else {
          row[temp] = data.data[idx1][temp];
        }
      }
      rows.push(row);
    }
    //
    this._createGridComponent(this.gridSchemaDataComponent, headers, rows, 32);
  }

  /**
   * slick grid header
   * @param {string} field
   * @param {string} name
   * @param {number} width
   * @param {string} iconType
   * @returns {header}
   * @private
   */
  private _createSlickGridHeader(field: string, name: string, width: number, iconType?: string): Header {
    return iconType
      ? new SlickGridHeader()
        .Id(field)
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(iconType) + '"></em>' + name + '</span>')
        .Field(field)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(width)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .build()
      : new SlickGridHeader()
        .Id(field)
        .Name(name)
        .Field(field)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(width)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .build();
  }

  /**
   * grid component
   * @param {GridComponent} gridComponent
   * @param {header[]} headers
   * @param {any[]} rows
   * @param {number} rowHeight
   * @private
   */
  private _createGridComponent(gridComponent: GridComponent, headers: Header[], rows: any[], rowHeight: number): void {
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(rowHeight)
      .DualSelectionActivate(true)
      .CellExternalCopyManagerActivate(true)
      .EnableSeqSort(true)
      .build()
    );
  }

  /**
   * Table grid create
   * @param {GridComponent} gridComponent
   * @param {header[]} headers
   * @param {any[]} rows
   * @param {number} rowHeight
   * @private
   */
  private _createTableGridComponent(gridComponent: GridComponent, headers: Header[], rows: any[], rowHeight: number): void {
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(rowHeight)
      .DualSelectionActivate(false)
      .MultiSelect(false)
      .build()
    );
  }

  /**
   * grid component
   * @param {GridComponent} gridComponent
   * @param {string} searchText
   * @private
   */
  private _searchGridComponent(gridComponent: GridComponent, searchText: string): void {
    gridComponent.search(searchText);
  }

  /**
   * Get parameters for database list
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} databaseName
   * @returns {any}
   * @private
   */
  private _getParameterForDatabase(webSocketId: string, page?: Page, databaseName?: string): any {
    const params = {
      webSocketId: webSocketId,
      loginUserId: CommonUtil.getLoginUserId()
    };
    if (page) {
      params['sort'] = page.sort;
      params['page'] = page.page;
      params['size'] = page.size;
    }
    if (StringUtil.isNotEmpty(databaseName)) {
      params['databaseName'] = databaseName.trim();
    }
    return params;
  }

  /**
   * Get parameter for table
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} tableName
   * @returns {any}
   * @private
   */
  private _getParameterForTable(webSocketId: string, page?: Page, tableName?: string): any {
    const params = {
      webSocketId: webSocketId
    };
    if (page) {
      params['sort'] = page.sort;
      params['page'] = page.page;
      params['size'] = page.size;
    }
    if (StringUtil.isNotEmpty(tableName)) {
      params['tableName'] = tableName.trim();
    }
    return params;
  }

}
