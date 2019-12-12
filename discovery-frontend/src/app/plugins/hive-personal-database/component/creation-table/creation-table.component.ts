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

import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractPopupComponent} from "../../../../common/component/abstract-popup.component";
import {CommonUtil} from "../../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../../common/permission/permission";
import {DataconnectionService} from "../../../../dataconnection/service/dataconnection.service";
import {Dataconnection} from "../../../../domain/dataconnection/dataconnection";
import {StringUtil} from "../../../../common/util/string.util";
import {HivePersonalDatabaseService} from "../../service/plugins.hive-personal-database.service";
import {Alert} from "../../../../common/util/alert.util";

const PERSONAL_DATABASE_NAME = "개인데이터베이스";

@Component({
  selector: 'plugin-hive-personal-database-creation-table',
  templateUrl: './creation-table.component.html',
})
export class CreationTableComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private workbenchId: string = '';
  private dataConnection: Dataconnection;
  private webSocketId: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow = false;

  public databases: string[] = [PERSONAL_DATABASE_NAME];
  public columnDataTypes: string[] = ["string", "int"];
  public partitionColumnNames: string[] = ["dt", "hh"];

  public databaseName: string = PERSONAL_DATABASE_NAME;
  public tableName: string = '';
  public isInvalidTableName = false;
  public errMsgTableName: string = '';

  public creatingColumns: CreatingColumn[] = [];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataconnectionService: DataconnectionService,
              private hivePersonalDatabaseService: HivePersonalDatabaseService) {

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

  public init(workbenchId: string, dataConnection: Dataconnection, webSocketId: string) {
    this.isShow = true;
    this.workbenchId = workbenchId;
    this.dataConnection = dataConnection;
    this.webSocketId = webSocketId;
    this.databaseName = PERSONAL_DATABASE_NAME;
    this.tableName = '';
    this.creatingColumns = [];
    let defaultColumn = new CreatingColumn();
    defaultColumn.columnType = "general";
    this.creatingColumns.push(defaultColumn);

    this.getDatabases();
  }

  private getDatabases() {
    if(this.hasOtherDatabaseImportedPermission()) {
      this.dataconnectionService.getDatabaseListInConnection(this.dataConnection.id, {
        webSocketId: this.webSocketId,
        loginUserId: CommonUtil.getLoginUserId()
      }).then((result) => {
        this.databases = [PERSONAL_DATABASE_NAME];
        this.databases = this.databases.concat(result.databases);
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  public hasOtherDatabaseImportedPermission() {
    return CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_SYSTEM) ? true : false;
  }

  public addColumn(type: string) {
    let column = new CreatingColumn();
    column.columnType = type;
    if(type === 'partition') {
      column.columnDataType = "string";
    }
    this.creatingColumns.push(column);
  }

  public onClickRemoveColumn(index: number) {
    this.creatingColumns.splice(index, 1);
  }

  public validation(): boolean {
    let valid = true;

    // 테이블명
    if (StringUtil.isEmpty(this.tableName)) {
      this.isInvalidTableName = true;
      this.errMsgTableName = this.translateService.instant('msg.common.ui.required');
      valid = false;
    } else {
      if(StringUtil.isAlphaNumericUnderscore(this.tableName) === false) {
        this.isInvalidTableName = true;
        this.errMsgTableName = this.translateService.instant('msg.bench.alert.invalid-hive-name-rule', {value: 'Table'});
        valid = false;
      }
    }

    for(let i = 0; i < this.creatingColumns.length; i++) {
      let column = this.creatingColumns[i];
      column.error = false;
      column.errorMessage = '';
      if(column.columnType === 'partition') {
        if(StringUtil.isEmpty(column.columnName)) {
          column.error = true;
          column.errorMessage = '파티션 컬럼을 선택하세요.';
          continue;
        }

      } else {
        if(StringUtil.isEmpty(column.columnName)) {
          column.error = true;
          column.errorMessage = '컬럼명을 입력하세요.';
          continue;
        }

        if(StringUtil.isAlphaNumericUnderscore(column.columnName) === false) {
          column.error = true;
          column.errorMessage = this.translateService.instant('msg.bench.alert.invalid-hive-name-rule', {value: 'Table'});
          continue;
        }
      }

      if(StringUtil.isEmpty(column.columnDataType)) {
        column.error = true;
        column.errorMessage = '컬럼 데이터 타입을 선택하세요.';
        continue;
      }
    }

    this.creatingColumns.forEach((column : CreatingColumn) => {
      if(column.error == true) {
        valid = false;
      }
    });

    return valid;
  }

  public done() {
    if (this.validation()) {
      this.loadingShow();
      const databaseName = this.databaseName;
      const tableName = this.tableName;
      const columns = this.creatingColumns.map(column => ( {
        columnType: column.columnType,
        columnName: column.columnName,
        columnDataType: column.columnDataType
      }));

      const createTableRequest = {
        database: (StringUtil.isEmpty(databaseName) || databaseName == PERSONAL_DATABASE_NAME) ? this.dataConnection.hivePersonalDatasourceInformation['ownPersonalDatabaseName'] : this.databaseName.trim(),
        table: tableName.trim(),
        webSocketId: this.webSocketId,
        columns: columns
      };

      this.hivePersonalDatabaseService.createTable(this.workbenchId, createTableRequest).then((res) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.close();
      }).catch((error) => {
        this.loadingHide();
        console.log(error);
        if(error.code) {
          switch (error.code) {
            case "WB0004":
              Alert.error(this.translateService.instant('msg.bench.alert.already-exists-table'));
              break;
            default:
              this.commonExceptionHandler(error);
          }
        } else {
          this.commonExceptionHandler(error);
        }
      });
    }
  }
}

class CreatingColumn {
  public columnType: string = '';
  public columnName: string = '';
  public columnDataType: string = '';
  public error: boolean = false;
  public errorMessage: string = '';
}
