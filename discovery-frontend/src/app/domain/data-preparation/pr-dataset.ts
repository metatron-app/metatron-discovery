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

import {AbstractHistoryEntity, UserDetail} from '../common/abstract-history-entity';
import { PrDataflow } from './pr-dataflow';
import {header} from "../../common/component/grid/grid.header";

export class PrDataset extends AbstractHistoryEntity {

  public dsId: string = '';
  public dsName: string;
  public dsDesc: string;
  public dataflows: PrDataflow[];
  public dsType: DsType;
  public importType: ImportType;
  public storageType: StorageType;
  public storedUri: string;
  public filenameBeforeUpload: string;
  public totalLines: number;
  public totalBytes: number;
  public rsType: RsType;
  public dbName: string;
  public tblName: string;
  public queryStmt: string;
  public transformRules: any; // need to make a transformRule class
  public creatorDfId: string;
  public ruleCurIdx: number;
  public sheetName: string;
  public fileFormat: FileFormat;
  public delimiter: string;
  public refDfCount: number;
  public custom: any; // JSON string으로 조회되나 UI에서 사용 시 JSON형태로 파싱해서 사용하여 any로 선언

  public creatorDfName: string;
  public redoable: boolean;
  public undoable: boolean;

  public gridResponse: any;

  // UI에서만 사용
  public selected?: boolean;
  public isHover? : boolean;
  public data?: string;
  public gridData?: any;
  public origin?: boolean;
  public rules?: any[];
  public isCurrentDataflow?: boolean;
  public nameCnt?:number;
  public current?:boolean;
  public validCount?: number = 0;
  public upstreamDsIds?:string[];
  public histogram?: any;
  public colTypes?: any;
  public colDescs?: any;
  public rootDataset?: PrDataset;

  // Join ui 에서 사용
  public selectedJoinType: string;
  public rightJoinKey: string;
  public leftJoinKey: string;
  public joinRuleList: any[];
  public leftSelectCol: any[];
  public rightSelectCol: any[];
  public joinButtonText: string;
  public ruleNo: string;

  // add api modify
  //public connectionInfo: any;

  // connection Info
  public dcId: string;
  public dcType: string;
  public dcHostname: string;
  public dcPort: number;
  public dcUrl: string;
}

export class Datasets {
  private datasets: PrDataset[];

  public getList() {
    return this.datasets;
  }
}

export enum DsType {
  IMPORTED = <any>'IMPORTED',
  WRANGLED = <any>'WRANGLED',
}

export enum ImportType {
  UPLOAD = <any>'UPLOAD',
  URI = <any>'URI',
  DATABASE = <any>'DATABASE',
  STAGING_DB = <any>'STAGING_DB',
  DRUID = <any>'DRUID',
}

export enum StorageType {
  LOCAL = <any>'LOCAL',
  HDFS = <any>'HDFS',
  S3 = <any>'S3',
  BLOB = <any>'BLOB',
  FTP = <any>'FTP',
}

export enum FileFormat {
  CSV = <any>'CSV',
  EXCEL = <any>'EXCEL',
  JSON = <any>'JSON',
}

export enum RsType {
  TABLE = <any>'TABLE',
  QUERY = <any>'QUERY',
}

export class Field {
  public name: string;
  public type: string;
  public uuid? : string;
  public logicalType? : string;
  public isHover? : boolean;
  public seq? : number;
  public values?: any[];
}

// add KJ
export class PrDatasetFile extends PrDataset {
  public sheets: string[];
  public sheetIndex: number;
  public selectedSheets: any[] = [];
  public sheetInfo: SheetInfo[];
  public fileName: string;
  public fileExtension: string;
  public selected : boolean = false;
  public error : any;
}

export class PrDatasetHive extends PrDataset {
  public sqlInfo? : QueryInfo;
  public tableInfo? : TableInfo;

  public dataconnection?: any;
}

export class PrDatasetJdbc extends PrDataset {
  public dcId: string;
  public sqlInfo? : QueryInfo;
  public tableInfo? : TableInfo;

  public dataconnection: any;
  public connectionList?: any[];
}

export class Rule {
  public command: string = '';
  public alias: string;
  public desc: string;
  public col: string;
  public to: string;
  public rownum: number;
  public row: string = '';
  public with: string;
  public on: any;
  public global: boolean = true;
  public type: any;
  public value: any;
  public order : any;
  public as: string;
  public ignoreCase: boolean = true;
  public limit: string;
  public quote: string;
  public group: string;
  public into: string;
  public groupEvery: string;
  public idx: string;
  public timestamp : string;

  // ui에서만 사용
  public cols: string[] = [];
  public groups: string[] = [];
  public patternType: string = 'string';
  public quoteType: string = 'none';
  public beforeOrAfter: string = 'before';
  public colForMove: string = '';
  public where : string;
  public pattern : string = '';

  public isEditMode: boolean;
  public isInsertStep: boolean;
}

export class QueryInfo {
  public headers: header[];
  public rows: any[];
  public queryStmt: string;
  public valid?: boolean;
  public databaseName?: string;
}

export class TableInfo {
  public headers: header[];
  public rows: any[];
  public databaseName: string;
  public tableName: string;

}

export class SheetInfo {
  selected : boolean;
  data : any;
  fields : any;
  totalRows? : number;
  valid: boolean;
  sheetName?: string;
  columnCount? : number;
}
