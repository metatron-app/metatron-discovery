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
import {AbstractPopupComponent} from "../../../../../common/component/abstract-popup.component";
import {GridComponent} from "../../../../../common/component/grid/grid.component";
import {DataconnectionService} from "../../../../../dataconnection/service/dataconnection.service";
import {Alert} from "../../../../../common/util/alert.util";
import {header, SlickGridHeader} from "../../../../../common/component/grid/grid.header";
import {isUndefined} from "util";
import {GridOption} from "../../../../../common/component/grid/grid.option";
import {Page} from "../../../../../domain/common/page";
import {EventBroadcaster} from "../../../../../common/event/event.broadcaster";
import {DataAggregate, RangeType} from "../data-aggregate.component";
import {StringUtil} from "../../../../../common/util/string.util";
import {SelectComponent} from "../../../../../common/component/select/select.component";
import {CommonUtil} from "../../../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../../../common/permission/permission";
import {Dataconnection} from "../../../../../domain/dataconnection/dataconnection";

const QUERY_EDITOR_COMMENT: string =
  "-- 반복해서 실행할 SELECT 쿼리를 입력해 주세요.\n" +
  "-- 범위는 날짜와 시간 유형이 있으며 두 가지 예약어 ${date_range}, ${hour_range}로 지정하여 사용합니다.\n" +
  "-- 범위는 다음 화면에서 지정합니다. 단. 둘을 혼용해서 사용할 수 없으며 하나만 사용 가능 합니다.\n" +
  "-- 주의. SELECT 컬럼은 INSERT TABLE의 컬럼 수와 순서가 같아야 합니다.\n" +
  "-- 1. 날짜 범위 지정 예시 - ${date_range} 사용\n" +
  "-- select sum(amt) as tot_amt, ${date_range} as dt\n" +
  "-- from sample where dt = ${date_range}\n" +
  "-- 2. 시간 범위 지정 예시 - ${hour_range} 사용\n" +
  "-- select sum(amt) as tot_amt, ${hour_range} as hh\n" +
  "-- from sample where dt = '20191212' and hh = ${hour_range}\n";

@Component({
  selector: 'plugin-hive-personal-database-creation-data-aggregate-task',
  templateUrl: './creation-data-aggregate-task.component.html',
})
export class CreationDataAggregateTaskComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('schemaColumn')
  private gridSchemaColumnComponent: GridComponent;

  @ViewChild('sourceDatabaseSelect')
  private sourceDatabaseSelect: SelectComponent;

  @ViewChild('targetDatabaseSelect')
  private targetDatabaseSelect: SelectComponent;

  @ViewChild('targetTableSelect')
  private targetTableSelect: SelectComponent;

  private dataAggregate: DataAggregate;
  private initTableList: boolean = false;
  private queryErrorMessage = "";

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow = false;

  public queryText: string = "";
  public sourceDatabases: string[] = [];
  public targetDatabases: string[] = [];
  private webSocketId: string = "";
  public tables: string[] = [];
  public schemaTableColumnList: any[] = [];
  public isColumnListNoData: boolean = false;



  // editor option
  public options: any = {
    maxLines: 20,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };

  private dataConnectionId: string = "";

  public searchTextSourceDatabaseName: string;
  public searchTextTargetDatabaseName: string;
  public searchTextTargetTableName: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataconnectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster) {
    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  public close() {
    this.isShow = false;
  }

  public init(dataConnectionId: string, databases: string[], webSocketId: string, dataConnection: Dataconnection, dataAggregate: DataAggregate = null) {
    this.isShow = true;
    this.dataConnectionId = dataConnectionId;
    if(CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_SYSTEM)) {
      this.sourceDatabases = databases;
      this.targetDatabases = databases;
    } else {
      this.sourceDatabases = databases;
      this.targetDatabases = [dataConnection.hivePersonalDatasourceInformation['ownPersonalDatabaseName']];
    }
    this.webSocketId = webSocketId;
    if(dataAggregate) {
      this.dataAggregate = dataAggregate;
      this.tables = dataAggregate.targetTableList;
      this.initTableList = true;
      this.safelyDetectChanges();

      if(this.sourceDatabaseSelect && this.dataAggregate.sourceDatabase) {
        this.sourceDatabaseSelect.selected(this.dataAggregate.sourceDatabase);
      }
      if(this.targetDatabaseSelect && this.dataAggregate.targetDatabase) {
        this.targetDatabaseSelect.selected(this.dataAggregate.targetDatabase);
      }
      if(this.targetTableSelect && this.dataAggregate.targetTable) {
        this.targetTableSelect.selected(this.dataAggregate.targetTable);
      }
    } else {
      this.dataAggregate = new DataAggregate();
      this.dataAggregate.sourceQuery = QUERY_EDITOR_COMMENT;
    }
  }

  public onSelectedSourceDatabaseName(databaseName : any) {
    this.dataAggregate.sourceDatabase = databaseName;
  }

  public onSelectedTargetDatabaseName(databaseName : any) {
    this.dataAggregate.targetDatabase = databaseName;
    if(this.initTableList) {
      this.initTableList = false;
    } else {
      this.getTables(databaseName);
    }
  }

  private getTables(databaseName: string) {
    this.loadingShow();
    this.tables = [];
    this.dataconnectionService.getTableListInConnection(this.dataConnectionId, databaseName, null)
      .then((result) => {
        this.loadingHide();
        if(result.tables) {
          this.tables = result.tables;
        }
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  public onSelectedTargetTableName(tableName: any) {
    this.dataAggregate.targetTable = tableName;
    this.dataAggregate.targetTableList = this.tables;
    this.getTableColumnInformation(tableName);
  }

  private getTableColumnInformation(table: string) {
    this.loadingShow();
    const page: Page = new Page();
    page.page = 0;
    page.size = 99999;
    this.isColumnListNoData = false;

    this.dataconnectionService.getColumnList(this.dataConnectionId, this.dataAggregate.targetDatabase, table, '', this.webSocketId, page)
      .then((result) => {
        this.loadingHide();
        if (result['columns']) {
          this.schemaTableColumnList = result['columns'];
          this._drawGridColumnList();
        } else {
          //
          this.schemaTableColumnList = [];
          this.isColumnListNoData = true;
          Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
        }
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  private _drawGridColumnList(): void {
    // data
    const data: any = this.schemaTableColumnList;
    // headers
    const headers: header[] = [];
    // Physical name
    headers.push(this._createSlickGridHeader('physicalName', 'Column Name', 300));
    // Type
    headers.push(this._createSlickGridHeader('type', 'Type', 200));
    // Desc
    headers.push(this._createSlickGridHeader('description', 'Description', 300));
    // rows
    const rows: any[] = [];
    for (let idx: number = 0; idx < data.length; idx = idx + 1) {
      const row = {};
      // Physical name
      row['physicalName'] = data[idx]['columnName'];
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

  private _createSlickGridHeader(field: string, name: string, width: number, iconType?: string): header {
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

  private _createGridComponent(gridComponent: GridComponent, headers: header[], rows: any[], rowHeight: number): void {
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

  public onChangedQueryText(text: string): void {
    this.queryErrorMessage = '';
    // 같지 않을때만 작동
    if (this.dataAggregate.sourceQuery !== text) {
      // 변경된 텍스트 저장
      this.dataAggregate.sourceQuery = text;
    }
  }

  public isEnableNext(): boolean {
    if(this.dataAggregate) {
      if(StringUtil.isNotEmpty(this.dataAggregate.sourceDatabase)
        && (StringUtil.isNotEmpty(this.dataAggregate.sourceQuery.trim()) && this.dataAggregate.sourceQuery.trim() !== QUERY_EDITOR_COMMENT.trim())
        && StringUtil.isNotEmpty(this.dataAggregate.targetDatabase) && StringUtil.isNotEmpty(this.dataAggregate.targetTable)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public next() {
    if (this.isEnableNext()) {
      if(this.dataAggregate.getRangeType() === RangeType.NA) {
        this.queryErrorMessage = "쿼리에 ${date_range}, ${hour_range} 둘 중 하나는 입력해야 합니다.";
        return;
      }

      if(this.dataAggregate.getRangeType() === RangeType.BOTH) {
        this.queryErrorMessage = "쿼리에 ${date_range}, ${hour_range} 둘 중 하나만 사용해야 합니다.";
        return;
      }

      this.broadCaster.broadcast('SHOW_HIVE_PERSONAL_DATABASE_COMPLETE_DATA_AGGREGATE_TASK', this.dataAggregate);
      this.close();
    }
  }
}
