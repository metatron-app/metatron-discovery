/*
 *
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

import * as _ from 'lodash';
import {PageResult} from "../../domain/common/page";
import {ConnectionParam} from "../../data-storage/service/data-connection-create.service";
import {Dataconnection} from "../../domain/dataconnection/dataconnection";

export namespace MetadataEntity {
  export class CreateData {

    connectionInfo: ConnectionInfo;
    schemaInfo: SchemaInfo;
    completeInfo: CompleteInfo;

    isNotEmptyConnectionInfo(): boolean {
      return !_.isNil(this.connectionInfo);
    }

    isNotEmptySchemaInfo(): boolean {
      return !_.isNil(this.schemaInfo);
    }

    isNotEmptyCompleteInfo(): boolean {
      return !_.isNil(this.completeInfo);
    }

    removeSchemaInfo(): void {
      delete this.schemaInfo;
    }

    removeCompleteInfo(): void {
      delete this.completeInfo;
    }
  }

  // Only used in complete step
  export class MetadataInComplete {
    table: string;
    name: string;
    description: string;
    isErrorName: boolean;
    errorMessage: string;

    constructor(table: string, name: string, description?: string, isErrorName?: boolean, errorMessage?: string) {
      this.table = table;
      this.name = name;
      if (!_.isNil(description)) {
        this.description = description;
      }
      if (!_.isNil(isErrorName)) {
        this.isErrorName = isErrorName;
      }
      if (!_.isNil(errorMessage)) {
        this.errorMessage = errorMessage;
      }
    }
  }
  
  export class ConnectionInfo {
    connectionPresetList;
    selectedConnectionPreset;
    pageResult: PageResult;
    connection: ConnectionParam;
    connectionDetail: Dataconnection;

    constructor(connectionPresetList, selectedConnectionPreset, connection: ConnectionParam, connectionDetail: Dataconnection, pageResult: PageResult) {
      this.connectionPresetList = connectionPresetList;
      this.selectedConnectionPreset = selectedConnectionPreset;
      this.connection = connection;
      this.pageResult = pageResult;
      this.connectionDetail = connectionDetail;
    }
  }

  export class SchemaInfo {
    schemaList;
    selectedSchema;
    tableList;
    selectedTable;
    selectedTableDetailData;
    checkedTableList;

    constructor(schemaList, selectedSchema, tableList, selectedTable, selectedTableDetailData, checkedTableList) {
      this.schemaList = schemaList;
      this.selectedSchema = selectedSchema;
      this.tableList = tableList;
      this.selectedTable = selectedTable;
      this.selectedTableDetailData = selectedTableDetailData;
      this.checkedTableList = checkedTableList;
    }
  }
  
  export class CompleteInfo {
    metadataList: MetadataInComplete[];
    isSearchableInExploreData: boolean;

    constructor(metadataList: MetadataInComplete[], isSearchableInExploreData: boolean) {
      this.metadataList = metadataList;
      this.isSearchableInExploreData = isSearchableInExploreData;
    }
  }
}
