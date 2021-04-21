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
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {Alert} from '@common/util/alert.util';
import {PreparationAlert} from '../../util/preparation-alert.util';
import {
  DsType,
  Field,
  ImportType,
  PrDatasetHive,
  QueryInfo,
  RsType,
  TableInfo
} from '@domain/data-preparation/pr-dataset';
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {GridOption} from '@common/component/grid/grid.option';
import {StringUtil} from '@common/util/string.util';
import * as $ from 'jquery';
import {DataconnectionService} from '@common/service/dataconnection.service';

@Component({
  selector: 'app-create-dataset-staging-selectdata',
  templateUrl: './create-dataset-staging-selectdata.component.html'
})
export class CreateDatasetStagingSelectdataComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

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
  public datasetHive: PrDatasetHive;


  public databaseList: any[] = [];              // Database list (first selectBox)
  public isDatabaseListShow: boolean = false;  // Database list show/hide
  public isQueryDatabaseListShow: boolean = false;


  public isQuerySuccess: boolean;               // 쿼리 성공 실패 여부
  public showQueryStatus: boolean = false;
  public queryErrorMsg: string = '';


  public schemaList: any[] = [];                // schema list (next selectBox)
  public isSchemaListShow: boolean = false;     // tables list show/hide


  public clickable: boolean = false;            // is next btn clickable


  public dbSearchText: string = '';
  public schemaSearchText: string = '';
  public queryDbSearchText: string = '';


  // 선택된 데이터베이스 (query)
  public selectedDatabaseQuery: string = '';

  public flag: boolean = false;

  public clearGrid: boolean = false;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private _connectionService: DataconnectionService,
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
    if (this.isNullOrUndefined(this.datasetHive.sqlInfo)) {
      this.datasetHive.sqlInfo = new QueryInfo();
    }

    // Only initialise tableInfo when tableInfo doesn't have value
    if (this.isNullOrUndefined(this.datasetHive.tableInfo)) {
      this.datasetHive.tableInfo = new TableInfo();
    }

    // Set default value
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

    if (this.datasetHive.rsType === RsType.QUERY) {

      if (this.showQueryStatus && this.isQuerySuccess) {
        this.datasetHive.sqlInfo.valid = true;
      } else {
        if (this.isNullOrUndefined(this.isQuerySuccess) || !this.isQuerySuccess) {
          this.showQueryStatus = true;
          this.isQuerySuccess = false;
          this.queryErrorMsg = this.translateService.instant('msg.common.ui.required');
          return;
        }
      }

    }

    this.typeEmitter.emit('STAGING');
    this.popupService.notiPopup({
      name: 'create-dataset-name',
      data: null
    });
  }

  public prev() {
    this.popupService.notiPopup({
      name: 'select-datatype',
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
   * @param database
   */
  public selectDatabase(database) {

    this.isDatabaseListShow = false;
    this.datasetHive.tableInfo.databaseName = database.name;
    this.datasetHive.tableInfo.tableName = undefined;
    this._deleteGridInfo(this.datasetHive.rsType);
    this.getTables(database.name);
    this.initSelectedCommand(this.filteredDbList);
  } // function - selectDatabase

  /**
   * change selected table
   * @param event
   * @param data
   */
  public onChangeTable(event, data: any) {
    this.isSchemaListShow = false;
    event.stopPropagation();
    this.loadingShow();

    // Save table name -
    this.datasetHive.tableInfo.tableName = data.name;

    this._connectionService.getTableDataForHive({
      database: this.datasetHive.tableInfo.databaseName,
      type: 'TABLE',
      query: data.name
    }).then((result) => {
      this.loadingHide();

      if (result.fields.length > 0) {

        const headers: Header[] = this._getHeaders(result.fields);
        const rows: any[] = this._getRows(result.data);

        this.datasetHive.tableInfo.headers = headers;
        this.datasetHive.tableInfo.rows = rows;

        this.clearGrid = false;
        this._drawGrid(headers, rows);
        this.clickable = true;

      } else {

        this.gridComponent.destroy();
        this._deleteGridInfo(this.datasetHive.rsType);
      }


    })
      .catch((error) => {
        this.clearGrid = false;
        this.loadingHide();
        const prepError = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
      });
    this.initSelectedCommand(this.filteredSchemaList);
  } // function - onChangeTable


  /**
   * Open /close database select box*
   */
  public showDatabaseList(event?) {
    event ? event.stopImmediatePropagation() : null;

    this.dbSearchText = ''; // 검색어 초기화

    // Open select box and focus on input
    setTimeout(() => {
      this.isDatabaseListShow = true;
      $('#table-db-input').trigger('focus');
    });

    this.isSchemaListShow = false;

  } // function - showDatabaseList


  /**
   * Open / close schemalist select box
   */
  public showSchemaList() {
    this.isSchemaListShow = true;
    this.isDatabaseListShow = false;
    this.schemaSearchText = ''; // 검색어 초기화
    setTimeout(() => $('.schema-search').trigger('focus')); // focus on input

  } // function - showSchemaList

  /**
   * Table or Query ?
   * @param method
   */
  public selectTab(method) {

    // When same tab is clicked
    if (this.datasetHive.rsType === method) {
      return;
    }

    // set tab
    this.datasetHive.rsType = method;

    // destroy grid
    this.gridComponent.destroy();

    // When QUERY tab => db, schema select box is hidden
    if (this.datasetHive.rsType !== RsType.TABLE) {
      this.isDatabaseListShow = false;
      this.isSchemaListShow = false;
      this.clickable = true;
    }

    let data;
    if (this.datasetHive.rsType === RsType.TABLE) {
      data = this.datasetHive.tableInfo;

      if (this.datasetHive.tableInfo.databaseName === undefined) {
        this.showDatabaseList();
      } else if (this.datasetHive.tableInfo.tableName === undefined) {
        this.showSchemaList();
      }
    } else {
      data = this.datasetHive.sqlInfo;
      if (this.datasetHive.sqlInfo.databaseName === undefined) {
        this.showQueryDatabaseList();
      }
    }

    if (data.headers && data.headers.length > 0) {
      this.clearGrid = false;
      this._drawGrid(data.headers, data.rows)
    } else {
      this.clickable = false;
      this.clearGrid = true;
    }

  } // function - selectTab

  /**
   * Run query and get grid info
   */
  public runStagingDBQuery() {

    if (this.datasetHive.sqlInfo.databaseName === undefined) {
      this.queryErrorMsg = this.translateService.instant('msg.storage.ui.dsource.create.choose-db');
      this.isQuerySuccess = false;
      this.showQueryStatus = true;
      this.clickable = false;
      return;
    }

    this.loadingShow();
    this.queryErrorMsg = '';


    this._connectionService.getTableDataForHive({
      database: this.datasetHive.sqlInfo.databaseName,
      type: 'QUERY',
      query: this.datasetHive.sqlInfo.queryStmt
    }).then((result) => {
      this.loadingHide();
      if (result.hasOwnProperty('errorMsg')) {
        this.showQueryStatus = true;
        this.queryErrorMsg = this.translateService.instant('msg.storage.ui.invalid.query');
        this.clickable = false;
        this.datasetHive.sqlInfo.valid = false;
        this._deleteGridInfo(this.datasetHive.rsType);
        return;
      }
      this.showQueryStatus = true;
      this.isQuerySuccess = true;


      const headers: Header[] = this._getHeaders(result.fields);
      const rows: any[] = this._getRows(result.data);

      this.datasetHive.sqlInfo.headers = headers;
      this.datasetHive.sqlInfo.rows = rows;
      this.datasetHive.sqlInfo.valid = true;

      this.clearGrid = false;
      this._drawGrid(headers, rows);
      this.clickable = true;


    }).catch(() => {

      this.loadingHide();
      this.showQueryStatus = true;
      this.queryErrorMsg = this.translateService.instant('msg.storage.ui.invalid.query');
      this.clickable = false;
      this.datasetHive.sqlInfo.valid = false;
      this.gridComponent.destroy();
      this.clearGrid = true;

    });
  }

  // TODO
  public editorTextChange(param: string) {
    if (this.clickable) {
      this.clickable = !this.clickable;
    }

    if (this.datasetHive.sqlInfo.queryStmt !== param) {

      this.datasetHive.sqlInfo.queryStmt = param;
      this.datasetHive.sqlInfo.valid = false;

      this._deleteGridInfo(this.datasetHive.rsType);
      this.clickable = true;
      this.isQuerySuccess = false;
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
    const height = 25;

    // open select box when arrow up/ arrow down is pressed
    if (event.keyCode === 38 || event.keyCode === 40) {
      switch (method) {
        case 'db' :
          !this.isDatabaseListShow ? this.isDatabaseListShow = true : null;
          break;
        case 'schema' :
          !this.isSchemaListShow ? this.isSchemaListShow = true : null;
          break;
        case 'query' :
          !this.isQueryDatabaseListShow ? this.isQueryDatabaseListShow = true : null;
          break;
      }
    }

    // when there is no element in the list
    if (currentList.length === 0) {
      return;
    }

    // this.commandList 에 마지막 인덱스
    const lastIndex = currentList.length - 1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.selected) {
        return command;
      }
    });
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if (idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].selected = true;

        // 스크롤을 마지막으로 보낸다
        $('.ddp-selectdown').scrollTop(lastIndex * height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].selected = false;
        currentList[lastIndex].selected = true;


        // 스크롤을 마지막으로 보낸다
        $('.ddp-selectdown').scrollTop(lastIndex * height);

      } else {
        currentList[idx].selected = false;
        currentList[idx - 1].selected = true;
        $('.ddp-selectdown').scrollTop((idx - 1) * height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if (idx === -1) {
        currentList[0].selected = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      } else if (idx === lastIndex) {

        currentList[0].selected = true;
        currentList[lastIndex].selected = false;
        $('.ddp-selectdown').scrollTop(0);

      } else {
        currentList[idx].selected = false;
        currentList[idx + 1].selected = true;
        $('.ddp-selectdown').scrollTop((idx + 1) * height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const selectedIdx = currentList.findIndex((command) => {
        if (command.selected) {
          return command;
        }
      });

      // 선택된게 없는데 엔터를 눌렀을때
      if (selectedIdx === -1) {
        return;
      } else {
        switch (method) {
          case 'db' :
            this.selectDatabase(currentList[selectedIdx]);
            break;
          case 'schema' :
            this.onChangeTable(event, currentList[selectedIdx]);
            break;
          case 'query' :
            this.selectQueryDatabase(currentList[selectedIdx]);
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
  public listHover(event, list, index) {

    let tempList = [];
    switch (list) {
      case 'db':
        tempList = this.filteredDbList;
        $('[tabindex=1]').focus();
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
    if (event.keyCode === 13) {
      if (!this.isSchemaListShow && !this.isSchemaListShow) {
        this.next();
      }
    }
  }


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
   * Query tab : Select database from select box
   * @param database
   */
  public selectQueryDatabase(database) {
    this.isQueryDatabaseListShow = false;
    this.datasetHive.sqlInfo.databaseName = database.name;
    this._deleteGridInfo(this.datasetHive.rsType);
    this.initSelectedCommand(this.filteredDbList);

    this.datasetHive.sqlInfo.valid = false;
    this.isQuerySuccess = false;
    if (StringUtil.isNotEmpty(this.datasetHive.sqlInfo.queryStmt)) {
      this.clickable = true;
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터베이스 목록 조회
   */
  private getDatabases() {
    this.loadingShow();
    this._connectionService.getDatabaseForHive().then((result) => {
      this.loadingHide();
      if (!result['databases']) {
        Alert.error('No databases');
      } else {
        result['databases'].forEach((item, index) => {
          this.databaseList.push({idx: index, name: item, selected: false})
        });
        // TABLE && GRID INFO
        if (this.datasetHive.rsType === RsType.TABLE && this.datasetHive.tableInfo.headers) {

          this.clearGrid = false;
          this.getTables(this.datasetHive.tableInfo.databaseName);
          this._drawGrid(this.datasetHive.tableInfo.headers, this.datasetHive.tableInfo.rows);

          // QUERY AND GRID INFO
        } else if (this.datasetHive.rsType === RsType.QUERY && this.datasetHive.sqlInfo.queryStmt) {

          if (this.datasetHive.tableInfo && this.datasetHive.tableInfo.databaseName) {
            this.getTables(this.datasetHive.tableInfo.databaseName);
          }

          // GRID INFO O
          if (this.datasetHive.sqlInfo.headers.length > 0) {
            this.clearGrid = false;
            this._drawGrid(this.datasetHive.sqlInfo.headers, this.datasetHive.sqlInfo.rows);
          } else {

            // GRID INFO X
            this.clickable = true;
            this.clearGrid = true;
          }

        } else {  // Neither
          this.showDatabaseList();
        }
      }
    }).catch(() => {
      this.loadingHide();
    });

  } // function - getDatabases


  /**
   * Get table list
   * @param {string} database
   */
  private getTables(database: string) {
    this.loadingShow();

    this._connectionService.getTableForHive(database).then((result) => {
      this.loadingHide();
      this.schemaList = [];

      if (result['tables']) {
        result['tables'].forEach((item, index) => {
          this.schemaList.push({idx: index, name: item, selected: false});
        });
        this.isTableEmpty = false;
      } else {
        this.schemaList = [];
        this.datasetHive.tableInfo.tableName = undefined;
        this.isTableEmpty = true;

        setTimeout(() => this.isSchemaListShow = true);

        if (this.gridComponent) {
          this.gridComponent.destroy();
        }
      }

    }).catch((error) => {
      this.loadingHide();
      this.commonExceptionHandler(error);
    })

  } // function - getTables


  /**
   * Return Rows for grid
   * @param rows
   * @returns {any[]}
   * @private
   */
  private _getRows(rows): any[] {
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
  private _getHeaders(headers): Header[] {
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
   * Draw Grid
   * @param {header[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(headers: Header[], rows: any[]) {
    // 그리드가 영역을 잡지 못해서 setTimeout으로 처리
    setTimeout(() => {
      this.gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .NullCellStyleActivate(true)
        .build()
      )
    }, 400);
    this.clickable = true;
  }


  /**
   * Set default values
   * @private
   */
  private _setDefaultValues() {

    // Imported and Hive type is default value
    this.datasetHive.dsType = DsType.IMPORTED;
    this.datasetHive.importType = ImportType.STAGING_DB;


    // When type info is null set it to TABLE
    if (this.isNullOrUndefined(this.datasetHive.rsType)) {
      this.datasetHive.rsType = RsType.TABLE;
    }

    // Check if validity is already checked
    if (this.datasetHive.sqlInfo && this.datasetHive.sqlInfo.valid) {
      this.isQuerySuccess = true;
      this.showQueryStatus = true;
      this.clickable = true;
      this.clearGrid = false;
    }

    /* FIXME: changed dataset schema
    this.datasetHive.tblName = '';
    this.datasetHive.dbName = '';
    this.datasetHive.queryStmt = '';
    this.datasetHive.dsType = DsType.IMPORTED;
    this.datasetHive.rsType = RsType.TABLE;
    this.datasetHive.importType = ImportType.STAGING_DB;
    */

  }

  /**
   * Initialise status
   * @param {RsType} type
   * @private
   */
  private _deleteGridInfo(type: RsType) {

    if (type === RsType.QUERY) {

      this.datasetHive.sqlInfo.headers = [];
      this.datasetHive.sqlInfo.rows = [];
      this.showQueryStatus = false;

    } else {

      this.datasetHive.tableInfo.headers = [];
      this.datasetHive.tableInfo.rows = [];

    }

    this.gridComponent.destroy();
    this.clearGrid = true;
    this.clickable = false;
  }


}
