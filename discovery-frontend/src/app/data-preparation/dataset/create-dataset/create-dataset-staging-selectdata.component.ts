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
import { Alert } from '../../../common/util/alert.util';
import { PreparationAlert } from '../../util/preparation-alert.util';
import { DatasetHive, DsType, RsType, ImportType, Field, TableInfo, QueryInfo } from '../../../domain/data-preparation/dataset';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { StringUtil } from '../../../common/util/string.util';
import * as $ from "jquery";
import { isNullOrUndefined } from "util";

@Component({
  selector: 'app-create-dataset-staging-selectdata',
  templateUrl: './create-dataset-staging-selectdata.component.html'
})
export class CreateDatasetStagingSelectdataComponent extends AbstractPopupComponent implements OnInit  {

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
  public datasetHive: DatasetHive;

  public isDatabaseListShow : boolean = false;  // Database list show/hide
  public isSchemaListShow: boolean = false;     // tables list show/hide

  public isQuerySuccess: boolean;               // 쿼리 성공 실패 여부
  public showQueryStatus: boolean = false;
  public queryErrorMsg: string = '';

  public databaseList: any[] = [];              // Database list (first selectBox)
  public schemaList: any[] = [];                // schema list (next selectBox)

  public clickable: boolean = false;            // is next btn clickable

  // 선택된 데이터베이스 (query)
  public selectedDatabaseQuery: string = '';

  public dbSearchText: string = '';
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
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    this.getDatabases();

    // Only initialise sqlInfo when sqlInfo doesn't have value
    if (isNullOrUndefined(this.datasetHive.sqlInfo)) {
      this.datasetHive.sqlInfo = new QueryInfo();
    }

    // Only initialise tableInfo when tableInfo doesn't have value
    if (isNullOrUndefined(this.datasetHive.tableInfo)) {
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

    if (this.datasetHive.rsType === RsType.SQL) {
      this.datasetHive.sqlInfo.valid = true;
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

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  } // function - close

  /**
   * 데이터베이스 변경에 대한 이벤트 핸들러
   * @param event
   * @param database
   */
  public onChangeDatabase(event,database) {
    this.isDatabaseListShow = false;
    event.stopPropagation();
    this.datasetHive.tableInfo.databaseName = database.name;
    this.datasetHive.tableInfo.tableName = undefined;

    this.clickable = false; // table 이 선택 되지 않아서 다음으로 넘어갈수 없음
    this.clearGrid = true;
    this.getTables(database.name);

    $('[tabindex=1]').trigger('focus');
    this.initSelectedCommand(this.filteredDbList);
  } // function - onChangeDatabase

  /**
   * 테이블 변경에 대한 이벤트 핸들러
   * @param event
   * @param data
   */
  public onChangeTable(event, data:any) {
    this.isSchemaListShow = false;
    event.stopPropagation();
    this.loadingShow();

    // Save table name -
    this.datasetHive.tableInfo.tableName = data.name;

    this.datasetService.getStagingTableData(this.datasetHive.tableInfo.databaseName, data.name)
      .then((result) => {
        this.loadingHide();

        const headers: header[] = this._getHeaders(result.fields);
        const rows: any[] = this._getRows(result.data);

        this.datasetHive.tableInfo.headers = headers;
        this.datasetHive.tableInfo.rows = rows;

        this.clearGrid = false;
        this._drawGrid(headers,rows);
        this.clickable = true;

      })
      .catch((error) => {
        this.clearGrid = false;
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    this.initSelectedCommand(this.filteredSchemaList);
  } // function - onChangeTable

  /** 데이터베이스 셀렉트 박스 show/hide */
  public showDatabaseList(event?) {
    event ? event.stopImmediatePropagation() : null;
    this.isDatabaseListShow = true;
    this.isSchemaListShow = false;
    this.dbSearchText = ''; //검색어 초기화
    setTimeout(() => $('.db-search').trigger('focus')); // focus on input

  } // function - showDatabaseList

  /** 특정 데이터 베이스 내 테이블 셀렉트 박스 show/hide */
  public showSchemaList(event) {
    event.stopImmediatePropagation();
    this.isSchemaListShow = true;
    this.isDatabaseListShow = false;
    this.schemaSearchText = ''; //검색어 초기화
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
    }

    // If grid data exists, draw grid.
    let data = this.datasetHive[method.toLowerCase()+'Info'];
    if (data.headers && data.headers.length > 0) {
      this._drawGrid(data.headers,data.rows)
    }

  } // function - selectTab

  /** 쿼리로 테이블 불러오기 */
  public runStagingDBQuery() {

    if (this.datasetHive.sqlInfo.queryStmt == '' ) {
      return;
    }

    this.loadingShow();
    this.queryErrorMsg = '';


    this.datasetService.getResultWithStagingDBQuery(this.datasetHive.sqlInfo.queryStmt).then((result) => {
      this.loadingHide();
      if (result.hasOwnProperty('errorMsg')) {
        this.showQueryStatus = true;
        this.isQuerySuccess = false;
        this.queryErrorMsg = result.errorMsg;
        this.clickable = false;
        this.gridComponent.destroy();
        return;
      }
      this.showQueryStatus = true;
      this.isQuerySuccess = true;


      const headers: header[] = this._getHeaders(result.fields);
      const rows: any[] = this._getRows(result.data);

      this.datasetHive.sqlInfo.headers = headers;
      this.datasetHive.sqlInfo.rows = rows;

      this.clearGrid = false;
      this._drawGrid(headers,rows);
      this.clickable = true;


    }).catch((error) => {

      this.loadingHide();
      this.gridComponent.destroy();
      this.clearGrid = true;
      this.showQueryStatus = true;
      this.isQuerySuccess = false;
      this.queryErrorMsg = error.details;
      this.clickable = false;

    });
  }

  // TODO
  public editorTextChange(param: string) {
    if(this.clickable) {
      this.clickable = !this.clickable;
    }

    if (this.datasetHive.sqlInfo.queryStmt !== param) {
      // 변경된 텍스트 저장
      this.datasetHive.sqlInfo.queryStmt = param;
      // 데이터 초기화
      this.gridComponent.destroy();
      this.showQueryStatus = false;
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
            this.onChangeDatabase(event,currentList[idx]);
            break;
          case 'schema' :
            this.onChangeTable(event, currentList[idx]);
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
        $('[tabindex=1]').focus();
        break;
      case 'schema':
        tempList = this.filteredSchemaList;
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
   * 데이터베이스 목록 조회
   */
  private getDatabases() {
    this.loadingShow();
    this.datasetService.getStagingConnectionInfo().then((data) => {

      if (data.errorMsg) {
          Alert.error(data.errorMsg);
          this.loadingHide();
        } else {

          this.datasetService.setConnInfo(data);

          this.datasetService.getStagingSchemas().then((data) => {

            this.loadingHide();

              this.databaseList = [];

              if (data) {
                data.forEach((item, index) => {
                  this.databaseList.push({idx : index, name : item, selected : false})
                })
              }

              // If type is table and has grid info
              if (this.datasetHive.rsType === RsType.TABLE && this.datasetHive.tableInfo.headers) {

                this.clearGrid = false;
                this.getTables(this.datasetHive.tableInfo.databaseName);
                this._drawGrid(this.datasetHive.tableInfo.headers,this.datasetHive.tableInfo.rows);

              // If type is Query and has query info
              } else if (this.datasetHive.rsType === RsType.SQL && this.datasetHive.sqlInfo.queryStmt) {

                if (this.datasetHive.tableInfo && this.datasetHive.tableInfo.tableName) {
                  this.getTables(this.datasetHive.tableInfo.databaseName);
                }

                this.clearGrid = false;
                this._drawGrid(this.datasetHive.sqlInfo.headers,this.datasetHive.sqlInfo.rows);

              } else {  // Neither
                this.showDatabaseList();
              }

            })
            .catch((error) => {
              this.loadingHide();
              let prep_error = this.dataprepExceptionHandler(error);
              PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
            });
        }
      })
      .catch((error) => {
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
    this.datasetService.getStagingTables(database)
      .then((data) => {
        this.loadingHide();
        this.schemaList = [];
        if (data) {
          for (let idx = 0, nMax = data.length; idx < nMax; idx = idx + 1) {
            this.schemaList.push({ idx : idx, name : data[idx], selected : false });
          }
          this.isTableEmpty = false;

        } else {
          this.schemaList = [];
          this.datasetHive.tableInfo.tableName = undefined;
          this.isTableEmpty = true;
        }
      })
      .catch((error) => {

        this.schemaList = [];
        this.isTableEmpty = true;

        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - getTables


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
   * Draw Grid
   * @param {header[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(headers: header[], rows : any[]) {
    // 그리드가 영역을 잡지 못해서 setTimeout으로 처리
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



  /**
   * Set default values
   * @private
   */
  private _setDefaultValues() {

    // Imported and Hive type is default value
    this.datasetHive.dsType = DsType.IMPORTED;
    this.datasetHive.importType = ImportType.HIVE;


    // When type info is null set it to TABLE
    if (isNullOrUndefined(this.datasetHive.rsType)) {
      this.datasetHive.rsType = RsType.TABLE;
    } else {

      // If type is sql, no need run query
      if (this.datasetHive.rsType === RsType.SQL) {
        this.clickable = true;
        if (this.datasetHive.sqlInfo.valid) {
          this.isQuerySuccess = true;
          this.showQueryStatus = true;
        }
      }

      this.clearGrid = false;

    }
  }



}
