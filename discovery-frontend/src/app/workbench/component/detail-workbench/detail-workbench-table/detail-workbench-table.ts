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

  private _differ: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // @Input()
  // public dataconnection:Dataconnection;
  //
  // @Input()
  // public websocketId: string;

  @Input()
  public disable: boolean = false;

  @Input()
  public inputParams: any;

  @Input()
  public set setClose(event: any) {
    // schema close 일때만 작동
    if (event && event.name === 'closeSchema') {
      this.tableSchemaClose();
      delete event.name;
    }
  }

  @Output()
  public sqlIntoEditorEvent: EventEmitter<string> = new EventEmitter();

  @Output()
  public tableDataEvent: EventEmitter<any> = new EventEmitter();

  // List of tables
  public tables: any[] = [];

  public selectedTable: string = '';

  // total table length
  public totalTableElements : number = 0;

  public schemaParams: {};
  public tableParams: {};

  // For searching
  public searchText: string = '';

  // 테이블 정보 Info Layer
  public selectedTableInfoLayer: boolean = false;

  public selectedTableSchemaLayer: boolean = false;

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

    if (paramChanges) {
      const prevVal = paramChanges.previousValue;
      const currVal = paramChanges.currentValue;
      if (isNullOrUndefined(prevVal) ||
        (prevVal.dataconnection.id ! == currVal.dataconnection.id
          || prevVal.dataconnection.database ! == currVal.dataconnection.database)
      ) {
        if (this.inputParams) {
          this.page.page = 0;
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

  // close schema info popup
  public tableSchemaClose() {
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query';
    this.selectedTableSchemaLayer = false;
  }

  /**
   * 스키마 클릭시 insert 이벤트
   * @param $event
   */
  public tableSchemaInsert($event) {
    this.sqlIntoEditorEvent.emit($event + ',');
  }


  /**
   * table 정렬 변경 시
   * @param sort
   */
  public tableListSorting( sort: 'ASC' | 'DESC' ) {

    const tables = this.tables;

    let column = "name";
    tables.sort(function (first, second) {
      if (sort === "ASC") return first[column].localeCompare(second[column]);
      else if (sort === "DESC") return second[column].localeCompare(first[column]);
    });

    ( sort === "ASC" ?  this.tableSortType = 'DESC' : this.tableSortType = 'ASC' );

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
    this.dataconnectionService.getTableListInConnection(this.inputParams.dataconnection.id, this.inputParams.dataconnection.database, this._getParameterForTable(WorkbenchService.websocketId, this.page, this.searchText))
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
      return this.localPagepage * this.localPageSize + this.localPageSize > this.pageResult.totalElements;
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
    this._setTableList(this.inputParams.dataconnection.id, this.inputParams.dataconnection.database);
  }

  /**
   * Set table list
   * @param {string} connectionId
   * @param {string} databaseName
   * @private
   */
  private _setTableList(connectionId: string, databaseName: string): void {
    // 호출 횟수 증가
    this._getTableListReconnectCount++;

    this.loadingShow();
    this.dataconnectionService.getTableListInConnection(connectionId, databaseName, this._getParameterForTable(WorkbenchService.websocketId, this.page, this.searchText))
      .then((data) => {
        // 호출 횟수 초기화
        this._getTableListReconnectCount = 0;

        this.loadingHide();
        this.pageResult = data['page'];
        this.tables = data['tables'];
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._setTableList(connectionId, databaseName);
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
    this.selectedTableSchemaLayer = false;
    this.selectedTableSchemaLayer = true;
    // $('.ddp-list-table').find('li:eq('+ index + ')').removeClass('ddp-info-selected');
    this.selectedNum = -1;
    //const offset: ClientRect = document.getElementById(`info${index}`).getBoundingClientRect();
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query ddp-tablepop';
    this.schemaParams = {
      dataconnection: this.inputParams.dataconnection,
      selectedTable: item,
      top: 250,
      websocketId: WorkbenchService.websocketId
    };
  }

  // 테이블 선택시.
  public setTableSql(item) {
    this.sqlIntoEditorEvent.emit('\nSELECT * FROM ' + this.inputParams.dataconnection.database + '.' + item + ';');
  }

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
