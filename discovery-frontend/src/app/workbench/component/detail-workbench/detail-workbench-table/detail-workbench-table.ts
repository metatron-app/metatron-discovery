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

///<reference path="../../../../common/util/string.util.ts"/>
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { isNullOrUndefined, isUndefined } from 'util';
import { Page } from '../../../../domain/common/page';
import { StringUtil } from '../../../../common/util/string.util';
import { AbstractWorkbenchComponent } from '../../abstract-workbench.component';
import { WorkbenchService } from '../../../service/workbench.service';
import {DeleteModalComponent} from "../../../../common/component/modal/delete/delete.component";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";
import {ImplementorType} from "../../../../domain/dataconnection/dataconnection";

@Component({
  selector: 'detail-workbench-table',
  templateUrl: './detail-workbench-table.html',
})
export class DetailWorkbenchTable extends AbstractWorkbenchComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('tableInfo')
  private tableInfo: ElementRef;


  @ViewChild(DeleteModalComponent)
  private deleteHiveTableModalComponent: DeleteModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // @Input()
  // public dataconnection:Dataconnection;
  //
  // @Input()
  // public websocketId: string;
  @Input()
  public implementorType:ImplementorType;

  @Input()
  public disable: boolean = false;

  @Input()
  public inputParams: any;

  @Input()
  public set setClose(event: any) {
    // schema close 일때만 작동
    if (event && event.name === 'closeSchema') {
      // this.tableSchemaClose();
      delete event.name;
    }
  }

  @Output()
  public sqlIntoEditorEvent: EventEmitter<string> = new EventEmitter();

  @Output()
  public tableDataEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  public openTableSchemaEvent:EventEmitter<{dataconnection: any, selectedTable: string, top: number, websocketId: string}> = new EventEmitter();

  // List of tables
  public tables: any[] = [];

  public selectedTable: string = '';

  // total table length
  public totalTableElements : number = 0;

  public tableParams: {};

  // For searching
  public searchText: string = '';

  // 테이블 정보 Info Layer
  public selectedTableInfoLayer: boolean = false;

  // totalPage가 1 MEMORY 아닐 경우 PAGE
  public pageMode: string = 'PAGE';

  public localPageSize: number = 30;

  public localPagepage: number = 0;

  public localData: any[] = [];

  // request reconnect count
  private _getTableListReconnectCount: number = 0;

  // 선택된 row number
  public selectedNum: number = 0;

  // sort type (DEFAULT, ASC, DESC)
  public tableSortType : string = 'DEFAULT';

  public isPersonalDatabase: boolean = false;

  public showRenameTableModal: boolean = false;
  public renameTable: string = '';

  public webSocketId: string = '';
  public dataConnectionId: string = '';
  public database: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbenchService: WorkbenchService,
              protected dataconnectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(workbenchService, element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    super.ngOnInit();

  }

  public ngOnChanges(changes: SimpleChanges) {
    const paramChanges: SimpleChange = changes.inputParams;

    this.isPersonalDatabase = false;
    if(this.inputParams && this.inputParams.dataconnection
      && this.inputParams.dataconnection.database && this.inputParams.dataconnection.supportPersonalDatabase) {
      const personalDatabasePrefix = this.inputParams.dataconnection.properties['metatron.personal.database.prefix'];
      if(this.inputParams.dataconnection.database.startsWith(personalDatabasePrefix)) {
        this.isPersonalDatabase = true;
      }
    }

    if (paramChanges) {
      const prevVal = paramChanges.previousValue;
      const currVal = paramChanges.currentValue;
      if (isNullOrUndefined(prevVal) ||
        (prevVal.dataconnection.id ! == currVal.dataconnection.id
          || prevVal.dataconnection.database ! == currVal.dataconnection.database)
      ) {
        if (this.inputParams) {
          this.page.page = 0;
          this.webSocketId = this.inputParams.webSocketId;
          this.dataConnectionId = this.inputParams.dataconnection.id;
          this.database = this.inputParams.dataconnection.database;
          this.getTables();
        }
      }
    }
  }

  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // public setChangeDatabase() {
  //   this.page.page = 0;
  //   this.getTables();
  // }

  // close table info popup
  public tableInfoClose($event) {
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query';
    this.selectedTableInfoLayer = false;
  }

  /**
   * table 정렬 변경 시
   * @param sort
   */
  public tableListSorting( sort: 'ASC' | 'DESC' ) {

    const tables = this.tables;

    let tableNames : string[] = [];
    for (let idx: number = 0; idx < tables.length; idx++) {
      tableNames.push( tables[idx] );
    }

    tableNames.sort();
    if (sort === "ASC") {
      this.tableSortType = 'DESC';
    } else if (sort === "DESC") {
      tableNames.reverse();
      this.tableSortType = 'ASC';
    }

    this.tables = [];
    this.tables = tableNames;

  }

  // 데이터 베이스 리스트 가져오기
  public getTables() {
    // sort 초기화
    this.tableSortType = 'DEFAULT';
    // 테이블 갯수 초기화
    this.totalTableElements = 0;

    this.localPageSize = 5000;
    if (isUndefined(this.inputParams.dataconnection.id)) {
      return;
    }

    if (this.page.page === 0) {
      this.tables = [];
    }

    // 호출 횟수 증가
    this._getTableListReconnectCount++;

    this.loadingShow();
    this.dataconnectionService.getTableListInConnectionQuery(this.inputParams.dataconnection, this._getParameterForTable(WorkbenchService.websocketId, this.page, this.searchText))
      .then((data) => {
        // 호출 횟수 초기화
        this._getTableListReconnectCount = 0;
        this.localPageSize = 30;

        this.loadingHide();
        if (data['page']['totalPages'] === 1) {
          this.pageMode = 'MEMORY';
          this.localPagepage = 0;
          this.pageResult = data['page'];
          this.localData = data['tables'];
          this.tables = this.localData.slice(this.localPagepage * this.localPageSize, this.localPagepage + this.localPageSize);
        } else {
          this.pageMode = 'PAGE';
          this.pageResult = data['page'];
          this.tables = this.tables.concat(data['tables']);
        }
        this.totalTableElements = data.page.totalElements;
        this.tableDataEvent.emit(data['tables']);
        this.safelyDetectChanges();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this.getTables();
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }


  /**
   * 이전버튼 disable 여부
   * @returns {boolean}
   */
  public get isDisabledPrev() {
    if (this.pageMode === 'PAGE') {
      return this.page.page === 0;
    } else {
      return this.localPagepage === 0;
    }
  }

  /**
   * 다음버튼 disable 여부
   * @returns {boolean}
   */
  public get isDisabledNext() {
    if (this.pageMode === 'PAGE') {
      return this.page.page + 1 >= this.pageResult.totalPages;
    } else {
      return this.localPagepage * this.localPageSize + this.localPageSize >= this.pageResult.totalElements;
    }
  }

  public setPage(param: string) {

    // sorting init
    this.tableSortType = 'DEFAULT';

    if (isUndefined(this.inputParams.dataconnection.id)) {
      return;
    }

    if (param === 'next') {
      if (this.page.page + 1 >= this.pageResult.totalPages) {
        return;
      }
      this.page.page = this.page.page + 1;
    } else if (param === 'prev') {
      if (this.page.page === 0) {
        return;
      }
      this.page.page = this.page.page - 1;
    }
    // set table list
    this._setTableList(this.inputParams.dataconnection);
  }

  /**
   * Set table list
   * @param {string} connectionId
   * @param {string} databaseName
   * @private
   */
  private _setTableList(dataconnection: any): void {
    // 호출 횟수 증가
    this._getTableListReconnectCount++;

    this.loadingShow();
    this.dataconnectionService.getTableListInConnectionQuery(dataconnection, this._getParameterForTable(WorkbenchService.websocketId, this.page, this.searchText))
      .then((data) => {
        // 호출 횟수 초기화
        this._getTableListReconnectCount = 0;

        this.loadingHide();
        this.pageResult = data['page'];
        this.tables = data['tables'];
        $('.ddp-list-table').scrollTop(0);
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._setTableList(dataconnection);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  public setPageMemory(param: string) {

    // sorting init
    this.tableSortType = 'DEFAULT';

    if (param === 'next') {
      if (this.localPagepage * this.localPageSize + this.localPageSize > this.pageResult.totalElements)
        return;

      this.localPagepage = this.localPagepage + 1;
      this.tables = this.localData.slice(this.localPagepage * this.localPageSize, this.localPagepage * this.localPageSize + this.localPageSize);
    } else if (param === 'prev') {
      if (this.localPagepage === 0)
        return;

      this.localPagepage = this.localPagepage - 1;
      this.tables = this.localData.slice(this.localPagepage * this.localPageSize, this.localPagepage * this.localPageSize + this.localPageSize);
    }

    $('.ddp-list-table').scrollTop(0);
  }

  // Show/hide Table information popup
  public showTableInfo(item: string, index: number): void {
    if (this.disable) {
      return;
    }
    this.selectedTableInfoLayer = false;
    this.selectedTableInfoLayer = true;
    this.selectedNum = index;
    // $('.ddp-list-table').find('li:eq('+ index + ')').addClass('ddp-info-selected');
    event.stopImmediatePropagation();
    const offset: ClientRect = document.getElementById(`info${index}`).getBoundingClientRect();
    this.tableParams = {
      dataconnection: this.inputParams.dataconnection,
      selectedTable: item,
      // top:offset.top,
      top: 250,
      websocketId: WorkbenchService.websocketId
    };
  }

  // Show/hide Schema information popup
  public showTableSchemaInfo(item: string, index: number): void {
    if (this.disable) {
      return;
    }
    event.stopImmediatePropagation();
    this.selectedTableInfoLayer = false;
    this.selectedNum = -1;

    this.openTableSchemaEvent.emit({
      dataconnection: this.inputParams.dataconnection,
      selectedTable: item,
      top: 250,
      websocketId: WorkbenchService.websocketId
    });
  }

  /**
   * 테이블 선택시.
   * @param item
   */
  public setTableSql(item) {
    if( ImplementorType.DRUID === this.implementorType ) {
      this.sqlIntoEditorEvent.emit('\nSELECT * FROM ' + this.inputParams.dataconnection.database + '."' + item + '";');
    } else {
      this.sqlIntoEditorEvent.emit('\nSELECT * FROM ' + this.inputParams.dataconnection.database + '.' + item + ';');
    }
  } // function - setTableSql

  /**
   * 테이블 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public searchTableText(event: KeyboardEvent) {
    (event.keyCode === 13) && (this.searchTable());
  }

  /**
   * 테이블 검색 초기화
   */
  public searchTableTextInit() {
    if( this.disable ) {
      return;
    }
    // 검색어 초기화
    this.searchText = '';
    // 테이블 조회
    this.searchTable();
  }

  /**
   * 현재 페이지
   * @returns {number}
   */
  public get getCurrentPage() {

    let currentPage : number;
    if (this.pageMode === 'PAGE') {
      currentPage = this.page.page+1;
    } else {
      currentPage = this.localPagepage+1;
    }
    return currentPage;
  }

  /**
   * 총 페이지 수
   * @returns {number}
   */
  public get getTotalPage() {

    let totalPage : number;
    if (this.pageMode === 'PAGE') {
      totalPage = this.pageResult.totalPages;
    } else {
      totalPage = Math.ceil(this.pageResult.totalElements/ this.localPageSize);
    }
    return totalPage;
  }

  public openModalDeleteTableInPersonalDatabase(item) {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.ui.delete.table.title');
    modal.description = this.translateService.instant('msg.bench.ui.delete.table.description', {value: item});
    modal.data = {
      webSocketId: this.webSocketId,
      dataConnectionId: this.dataConnectionId,
      database: this.database,
      table: item
    };

    this.deleteHiveTableModalComponent.init(modal);
  }

  public openModalRenameTableInPersonalDatabase(item) {
    this.renameTable = item;
    this.showRenameTableModal = true;
  }

  public deleteTableInPersonalDatabase() {
    const data = this.deleteHiveTableModalComponent.modal.data;
    this.loadingShow();
    this.dataconnectionService.deleteTable(data.dataConnectionId, data.database, data.table, data.webSocketId)
      .then((response) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
        this.getTables();
      }).catch((error) => {
      this.loadingHide();
      console.log(error);
      Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
    });
  }

  public renameTableSucceed() {
    this.getTables();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 검색
   */
  private searchTable(): void {
    if( this.disable ) {
      return;
    }
    // page 초기화
    this.page.page = 0;
    // 테이블 조회
    this.getTables();
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
      params['size'] = this.localPageSize;
    }
    if (StringUtil.isNotEmpty(tableName)) {
      params['tableName'] = tableName.trim();
    }
    return params;
  }
}
