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

import { Component, ElementRef, Injector, OnInit, Input, ViewChild, HostListener, EventEmitter, Output } from '@angular/core';
import { DatasetService } from '../service/dataset.service';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { PreparationAlert } from '../../util/preparation-alert.util';
import { PrDatasetJdbc, DsType, RsType, ImportType, Field, QueryInfo, TableInfo } from '../../../domain/data-preparation/pr-dataset';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { StringUtil } from '../../../common/util/string.util';
import * as $ from "jquery";
import { isNullOrUndefined } from "util";
import * as _ from 'lodash';

@Component({
  selector: 'app-create-dataset-db-query',
  templateUrl: './create-dataset-db-query.component.html',
  providers: [DataconnectionService]
})
export class CreateDatasetDbQueryComponent extends AbstractPopupComponent implements OnInit  {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  //public datasetJdbc: DatasetJdbc;
  public datasetJdbc: PrDatasetJdbc;

  public databaseList: any[] = [];
  public isDatabaseListShow : boolean = false;
  public isQueryDatabaseListShow: boolean = false;

  public schemaList: any[] = [];
  public isSchemaListShow: boolean = false;

  public isQuerySuccess: boolean;
  public showQueryStatus: boolean = false;
  public queryErrorMsg: string = '';

  public clickable: boolean = false;            // is next btn clickable

  public dbSearchText: string = '';
  public queryDbSearchText: string = '';
  public schemaSearchText: string = '';

  public flag: boolean = false;

  public clearGrid : boolean = false;

  public isTableEmpty: boolean = false;

  public rsType = RsType;

  @Output()
  public typeEmitter = new EventEmitter<string>();

  // editor option
  public options: any = {
    maxLines: 20,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };


  get filteredQueryDbList() {
    let databaseList = this.databaseList;

    const isDbSearchTextEmpty = StringUtil.isNotEmpty(this.queryDbSearchText);

    // 검색어가 있다면
    if (isDbSearchTextEmpty) {
      databaseList = databaseList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.queryDbSearchText.toLowerCase()) > -1;
      });
    }
    return databaseList;

  }


  get filteredDbList() {
    let databaseList = this.databaseList;

    const isDbSearchTextEmpty = StringUtil.isNotEmpty(this.dbSearchText);

    // 검색어가 있다면
    if (isDbSearchTextEmpty) {
      databaseList = databaseList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.dbSearchText.toLowerCase()) > -1;
      });
    }
    return databaseList;

  }

  get filteredSchemaList() {
    let schemaList = this.schemaList;

    const isSchemaSearchTextEmpty = StringUtil.isNotEmpty(this.schemaSearchText);

    // 검색어가 있다면
    if (isSchemaSearchTextEmpty) {
      schemaList = schemaList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.schemaSearchText.toLowerCase()) > -1;
      });
    }
    return schemaList;

  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              private connectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    // get database list
    this.getDatabases();

    // Only initialise sqlInfo when sqlInfo doesn't have value
    if (isNullOrUndefined(this.datasetJdbc.sqlInfo)) {
      this.datasetJdbc.sqlInfo = new QueryInfo();
    }

    // Only initialise tableInfo when tableInfo doesn't have value
    if (isNullOrUndefined(this.datasetJdbc.tableInfo)) {
      this.datasetJdbc.tableInfo = new TableInfo();
    }

    this._setDefaultValues();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public next() {

    // 선택된 테이블/query가 없다면
    if (!this.clickable) {
      return;
    }

    if (this.datasetJdbc.rsType === RsType.QUERY) {

      if (this.showQueryStatus && this.isQuerySuccess) {
        this.datasetJdbc.sqlInfo.valid = true;
      } else {

        if (isNullOrUndefined(this.isQuerySuccess) || !this.isQuerySuccess) {
          this.showQueryStatus = true;
          this.isQuerySuccess = false;
          this.queryErrorMsg = this.translateService.instant('msg.common.ui.required');
          return;
        }

      }

    }

    this.typeEmitter.emit('DB');
    this.popupService.notiPopup({
      name: 'create-dataset-name',
      data: null
    });
  }

  public prev() {
    this.popupService.notiPopup({
      name: 'create-db-select',
      data: null
    });
  }

  public close() {

    super.close();
    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  } // function - close

  /**
   * Change selected database
   * @param event
   * @param database
   */
  public selectDatabase(database) {

    this.isDatabaseListShow = false;
    this.datasetJdbc.tableInfo.databaseName = database.name;
    this.datasetJdbc.tableInfo.tableName = undefined;
    this._deleteGridInfo(this.datasetJdbc.rsType);
    this.getTables(database.name);
    this.initSelectedCommand(this.filteredDbList);

  } // function - onChangeDatabase


  /**
   * Query tab : Select database from select box
   * @param database
   */
  public selectQueryDatabase(database) {
    this.isQueryDatabaseListShow = false;
    this.datasetJdbc.sqlInfo.databaseName = database.name;
    this._deleteGridInfo(this.datasetJdbc.rsType);
    this.initSelectedCommand(this.filteredDbList);

    this.datasetJdbc.sqlInfo.valid = false;
    this.isQuerySuccess = false;
    if (StringUtil.isNotEmpty(this.datasetJdbc.sqlInfo.queryStmt)) {
      this.clickable = true;
    }

  }

  /**
   * change selected table
   * @param event
   * @param data
   */
  public onChangeTable(event, data:any) {
    this.isSchemaListShow = false;
    event.stopPropagation();

    this.loadingShow();

    // Save table name -
    this.datasetJdbc.tableInfo.tableName = data.name;

    let params = {
      connection : this.datasetJdbc.dataconnection.connection,
      database : this.datasetJdbc.tableInfo.databaseName,
      query : this.datasetJdbc.tableInfo.tableName,
      type : RsType.TABLE
    };

    this.connectionService.getTableDetailWitoutId(params, false).then((result) => {

      this.loadingHide();
      if (result.fields.length > 0 ) {

        const headers: header[] = this._getHeaders(result.fields);
        const rows: any[] = this._getRows(result.data);

        // Save grid info -
        this.datasetJdbc.tableInfo.headers = headers;
        this.datasetJdbc.tableInfo.rows = rows;

        this.clearGrid = false;
        this._drawGrid(headers, rows);
        this.clickable = true;

      } else {
        this.gridComponent.destroy();
        this._deleteGridInfo(this.datasetJdbc.rsType);
      }

    })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    this.initSelectedCommand(this.filteredSchemaList);
  } // function - onChangeTable


  /**
   * Table Tab : open/close database select box
   * @param event
   */
  public showDatabaseList(event?) {

    event ? event.stopImmediatePropagation() : null;

    // Reset search text
    this.dbSearchText = '';

    // Open select box and focus on input
    setTimeout(() => {
      this.isDatabaseListShow = true;
      $('#table-db-input').trigger('focus');
    });

    this.isSchemaListShow = false;

  } // function - showDatabaseList


  /**
   * Query Tab : open/close database select box
   * @param event
   */
  public showQueryDatabaseList(event?) {

    event ? event.stopImmediatePropagation() : null;

    // Reset search text
    this.queryDbSearchText = '';

    // open select box and focus on input
    setTimeout(() => {
      this.isQueryDatabaseListShow = true;
    });

    setTimeout(() => {
      $('#query-db-input').trigger('focus');
    });

    // Query tab - X schema list
    this.isSchemaListShow = false;

  }


  /**
   * Open/ close schemalist select box
   * @param event
   */
  public showSchemaList(event?) {
    event ? event.stopImmediatePropagation() : null;
    this.isDatabaseListShow = false;
    this.schemaSearchText = ''; //검색어 초기화

    setTimeout(() => {
      this.isSchemaListShow = true;
      $('.schema-search').trigger('focus')
    }); // focus on input

  } // function - showSchemaList

  /**
   * Table or Query ?
   * @param method
   */
  public selectTab(method) {

    // When same tab is clicked
    if (this.datasetJdbc.rsType === method) {
      return;
    }

    // set tab
    this.datasetJdbc.rsType = method;

    // destroy grid
    this.gridComponent.destroy();

    let data = null;
    if (this.datasetJdbc.rsType === RsType.TABLE) {
      data = this.datasetJdbc.tableInfo;

      if (this.datasetJdbc.tableInfo.databaseName === undefined) {
        this.showDatabaseList();
      } else if (this.datasetJdbc.tableInfo.tableName === undefined) {
        this.showSchemaList();
      }
    } else {
      data = this.datasetJdbc.sqlInfo;
      if (this.datasetJdbc.sqlInfo.databaseName === undefined) {
        this.showQueryDatabaseList();
      }
    }

    if (data.headers && data.headers.length > 0) {
      this.clearGrid = false;
      this._drawGrid(data.headers,data.rows)
    } else {
      this.clickable = false;
      this.clearGrid = true;
    }

  } // function - selectedMethod

  /**
   * Run query and get grid info
   */
  public runJdbcQuery() {

    if (this.datasetJdbc.sqlInfo.databaseName === undefined) {
      this.queryErrorMsg = this.translateService.instant('msg.storage.ui.dsource.create.choose-db');
      this.isQuerySuccess = false;
      this.showQueryStatus = true;
      this.clickable = false;
      return;
    }

    this.loadingShow();

    const param: any = {};
    param.connection = this.datasetJdbc.dataconnection.connection;
    param.query = this.datasetJdbc.sqlInfo.queryStmt;
    param.database = this.datasetJdbc.sqlInfo.databaseName;
    param.type = 'QUERY';

    this.queryErrorMsg = '';

    // Get grid info using query
    this.connectionService.getTableDetailWitoutId(param, false)
      .then((result) => {

        this.loadingHide();
        if (result.hasOwnProperty('errorMsg')) {
          this.queryErrorMsg = this.translateService.instant('msg.storage.ui.invalid.query');
          this.clickable = false;
          this.datasetJdbc.sqlInfo.valid = false;
          this._deleteGridInfo(this.datasetJdbc.rsType);

          return;
        }
        this.showQueryStatus = true;
        this.isQuerySuccess = true;

        const headers: header[] = this._getHeaders(result.fields);
        const rows = this._getRows(result.data);

        // Save grid info -
        this.datasetJdbc.sqlInfo.headers = headers;
        this.datasetJdbc.sqlInfo.rows = rows;
        this.datasetJdbc.sqlInfo.valid = true;

        this.clearGrid = false;
        this._drawGrid(headers,rows);
        this.clickable = true;

      })
      .catch((error) => {

        this.loadingHide();
        this.gridComponent.destroy(); // destroy grid
        this.showQueryStatus = true;
        this.isQuerySuccess = false;
        this.clearGrid = true;
        this.queryErrorMsg = this.translateService.instant('msg.storage.ui.invalid.query');
        this.clickable = false;

      });
  }

  /**
   * When text changes in text editor
   * @param {string} param
   */
  public editorTextChange(param: string) {
    if(this.clickable) {
      this.clickable = !this.clickable;
    }

    if (this.datasetJdbc.sqlInfo.queryStmt !== param) {
      this.datasetJdbc.sqlInfo.queryStmt = param;
      this.datasetJdbc.sqlInfo.valid = false;

      this._deleteGridInfo(this.datasetJdbc.rsType);
      this.clickable = true;
    }

  }

  /**
   * Select box - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   * @param method
   */
  public navigateWithKeyboardShortList(event, currentList, method) {

    // set scroll height
    let height = 25;

    // open select box when arrow up/ arrow down is pressed
    if(event.keyCode === 38 || event.keyCode === 40) {
      switch(method) {
        case 'db' :
          !this.isDatabaseListShow ? this.isDatabaseListShow = true: null;
          break;
        case 'schema' :
          !this.isSchemaListShow ? this.isSchemaListShow = true: null;
          break;
        case 'query' :
          !this.isQueryDatabaseListShow ? this.isQueryDatabaseListShow = true: null;
          break;
      }
    }

    // when there is no element in the list
    if(currentList.length === 0){
      return;
    }

    // this.commandList 에 마지막 인덱스
    let lastIndex = currentList.length-1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.selected) {
        return command;
      }
    });
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if ( idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].selected = true;

        // 스크롤을 마지막으로 보낸다
        $('.ddp-selectdown').scrollTop(lastIndex*height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].selected = false;
        currentList[lastIndex].selected = true;


        // 스크롤을 마지막으로 보낸다
        $('.ddp-selectdown').scrollTop(lastIndex*height);

      } else {
        currentList[idx].selected = false;
        currentList[idx-1].selected = true;
        $('.ddp-selectdown').scrollTop((idx-1)*height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if ( idx === -1) {
        currentList[0].selected = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      }  else if (idx === lastIndex) {

        currentList[0].selected = true;
        currentList[lastIndex].selected = false;
        $('.ddp-selectdown').scrollTop(0);

      } else {
        currentList[idx].selected = false;
        currentList[idx+1].selected = true;
        $('.ddp-selectdown').scrollTop((idx+1)*height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const idx = currentList.findIndex((command) => {
        if (command.selected) {
          return command;
        }
      });

      // 선택된게 없는데 엔터를 눌렀을때
      if (idx === -1) {
        return;
      } else {
        switch(method) {
          case 'db' :
            this.selectDatabase(currentList[idx]);
            break;
          case 'schema' :
            this.onChangeTable(event, currentList[idx]);
            break;
          case 'query' :
            this.selectQueryDatabase(currentList[idx]);
            break;
        }
      }
      // 스크롤, command select 초기화
      this.initSelectedCommand(currentList);
    }
  }


  /**
   * list 에서 Mouseover 일때 Selected = true, mouseleave 일때 selected = false
   * @param event 이벤트
   * @param list
   * @param index
   */
  public listHover(event,list,index) {

    let tempList = [];
    switch(list) {
      case 'db':
        tempList = this.filteredDbList;
        break;
      case 'schema':
        tempList = this.filteredSchemaList;
        break;
      case 'query':
        tempList = this.filteredQueryDbList;
        break;
    }

    if (!this.flag) {
      if (event.type === 'mouseover') {
        tempList[index].selected = true;

      } else if (event.type === 'mouseout') {
        this.initSelectedCommand(tempList);
      }
    }
  } // function - commandListHover


  /** change list selected -> false (초기화) */
  public initSelectedCommand(list) {
    list.forEach((item) => {
      return item.selected = false;
    })
  } // function - initSelectedCommand


  /** apply rule with enter key */
  @HostListener('document:keydown.enter', ['$event'])
  public onEnterKeydownHandler(event: KeyboardEvent) {
    // enter key only works when there is not popup or selectbox opened
    if(event.keyCode === 13) {
      if (!this.isSchemaListShow && !this.isSchemaListShow ) {
        this.next();
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Get database list
   */
  private getDatabases() {
    this.loadingShow();

    if (!this.datasetJdbc.dataconnection.connection) {
      // this.datasetJdbc.dcId = this.datasetJdbc.dataconnection.id;

      const connectionInfo = _.clone(this.datasetJdbc.dataconnection);

      this.datasetJdbc.dataconnection = {connection : {
          hostname: connectionInfo.hostname,
          implementor: connectionInfo.implementor,
          password: connectionInfo.password,
          port: connectionInfo.port,
          url: connectionInfo.url,
          username: connectionInfo.username,
          authenticationType: connectionInfo.authenticationType
        }
      };

      if (this.datasetJdbc.dataconnection.connection.implementor === 'POSTGRESQL' && !connectionInfo.url) {
        this.datasetJdbc.dataconnection.connection.database = connectionInfo.database;
      }

      if (this.datasetJdbc.dataconnection.connection.implementor === 'PRESTO' && !connectionInfo.url) {
        this.datasetJdbc.dataconnection.connection.catalog = connectionInfo.catalog;
      }

      if (this.datasetJdbc.dataconnection.connection.implementor === 'TIBERO' && !connectionInfo.url) {
        this.datasetJdbc.dataconnection.connection.sid = connectionInfo.sid;
      }

    }


    this.loadingShow();
    this.connectionService.getDatabasesWithoutId(this.datasetJdbc.dataconnection)
      .then((data) => {
        this.loadingHide();

        this.databaseList = [];

        if (data && data.databases) {
          data.databases.forEach((item, index) => {
            this.databaseList.push({idx : index, name : item, selected : false})
          })
        }

        // TABLE && GRID INFO
        if (this.datasetJdbc.rsType === RsType.TABLE && this.datasetJdbc.tableInfo.headers && this.datasetJdbc.tableInfo.headers.length > 0) {
          this.clearGrid = false;
          this.getTables(this.datasetJdbc.tableInfo.databaseName);
          this._drawGrid(this.datasetJdbc.tableInfo.headers,this.datasetJdbc.tableInfo.rows);

          // QUERY AND GRID INFO
        } else if (this.datasetJdbc.rsType === RsType.QUERY && this.datasetJdbc.sqlInfo.databaseName && this.datasetJdbc.sqlInfo.queryStmt !== '') {

          // STILL NEED TO GET TABLE INFO
          if (this.datasetJdbc.tableInfo && this.datasetJdbc.tableInfo.databaseName) {
            this.getTables(this.datasetJdbc.tableInfo.databaseName);
          }

          // GRID INFO O
          if (this.datasetJdbc.sqlInfo.headers.length > 0) {
            this.clearGrid = false;
            this._drawGrid(this.datasetJdbc.sqlInfo.headers,this.datasetJdbc.sqlInfo.rows);
          } else {

            // GRID INFO X
            this.clickable = true;
            this.clearGrid = true;
          }

        } else {  // Neither
          this.showDatabaseList();
        }

      }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });


  } // function - getDatabases

  /**
   * Get table list
   * @param {string} database
   */
  private getTables(database:string) {
    this.loadingShow();

    const param = {
      connection : this.datasetJdbc.dataconnection.connection,
      database : database
    };

    this.connectionService.getTablesWitoutId(param).then((data) => {
      this.loadingHide();

      this.schemaList = [];
      if (data && data.tables.length > 0) {
        data.tables.forEach((item, index) => {
          this.schemaList.push({idx : index, name : item, selected : false});
        });
        this.isTableEmpty = false;

      } else {
        this.schemaList = [];
        this.datasetJdbc.tableInfo.tableName = undefined;
        this.isTableEmpty = true;
        setTimeout(() => this.isSchemaListShow = true );
        if (this.gridComponent) {
          this.gridComponent.destroy();
        }
      }

    }).catch((error) => {
      this.schemaList = [];
      this.isTableEmpty = true;
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });

  } // function - getTables


  /**
   * Draw Grid
   * @param {header[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(headers: header[], rows : any[]) {
    // 그리드가 영역을 잡지 못해서 setTimeout으로 처리
    if (this.gridComponent) {
      setTimeout(() => {
        this.gridComponent.create(headers, rows, new GridOption()
          .SyncColumnCellResize(true)
          .MultiColumnSort(true)
          .RowHeight(32)
          .NullCellStyleActivate(true)
          .build()
        )},400);
      this.clickable = true;
    }
  }


  /**
   * Return Rows for grid
   * @param rows
   * @returns {any[]}
   * @private
   */
  private _getRows(rows) : any[] {
    let result = rows;
    if (result.length > 0 && !result[0].hasOwnProperty('id')) {
      result = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return result;
  }


  /**
   * Returns headers for grid
   * @param headers
   * @returns {header[]}
   * @private
   */
  private _getHeaders(headers) : header[] {
    return headers.map(
      (field: Field) => {
        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type === 'UNKNOWN' ? field.logicalType : field.type) + '"></em>' + field.name + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (field.name.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );
  }


  /**
   * Set default values
   * @private
   */
  private _setDefaultValues() {

    // Imported and DB type is default value
    this.datasetJdbc.dsType = DsType.IMPORTED;
    this.datasetJdbc.importType = ImportType.DATABASE;


    // When no tab is selected -> default is TABLE
    if (isNullOrUndefined(this.datasetJdbc.rsType)) {
      this.datasetJdbc.rsType = RsType.TABLE;
    }

    // Check if validity is already checked
    if (this.datasetJdbc.sqlInfo && this.datasetJdbc.sqlInfo.valid) {
      this.isQuerySuccess = true;
      this.showQueryStatus = true;
      this.clickable = true;
      this.clearGrid = false;
    }
  }


  /**
   * Initialise status
   * @param {RsType} type
   * @private
   */
  private _deleteGridInfo(type : RsType) {

    if (type === RsType.QUERY) {

      this.datasetJdbc.sqlInfo.headers = [];
      this.datasetJdbc.sqlInfo.rows = [];
      this.showQueryStatus = false;

    } else {

      this.datasetJdbc.tableInfo.headers = [];
      this.datasetJdbc.tableInfo.rows = [];

    }

    this.gridComponent.destroy();
    this.clearGrid = true;
    this.clickable = false;
  }

}
