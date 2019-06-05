import * as _ from 'lodash';
import {PageResult} from "../../domain/common/page";
import {ConnectionParam} from "../../data-storage/service/data-connection-create.service";

export namespace MetadataEntity {
  export class CreateData {

    connectionInfo: ConnectionInfo;
    schemaInfo: SchemaInfo;
    completeInfo;


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
  }
  
  export class ConnectionInfo {
    connectionPresetList;
    selectedConnectionPreset;
    pageResult: PageResult;
    connection: ConnectionParam;

    constructor(connectionPresetList, selectedConnectionPreset, connection, pageResult) {
      this.connectionPresetList = connectionPresetList;
      this.selectedConnectionPreset = selectedConnectionPreset;
      this.connection = connection;
      this.pageResult = pageResult;
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
    
  }
}
