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

import { AbstractHistoryEntity } from '../common/abstract-history-entity';
import { Dataflow } from './dataflow';

export class Dataset extends AbstractHistoryEntity {

  public dsId: string = '';
  public dsName: string;
  public dsDesc: string;
  public refDfCount: number;
  public dsType: DsType;
  public importType: ImportType;
  public creatorDfName: string;
  public custom: any; // JSON string으로 조회되나 UI에서 사용 시 JSON형태로 파싱해서 사용하여 any로 선언
  public totalBytes: number;
  public totalLines: number;
  public filename: string;
  public dataflows: Dataflow[];
  public creatorDfId: string;
  public ruleCurIdx: number;
  public ruleCnt: string;
  public filekey: string;
  public redoable: boolean;
  public undoable: boolean;

  // ruleStringInfos , martixResponse 추가됨
  public ruleStringInfos: any;
  public matrixResponse: any;
  public gridResponse: any;

  // UI에서만 사용
  public selected: boolean;
  public isHover : boolean;
  public ticked: boolean;
  public data: string;
  public gridData: any;
  public origin: boolean;
  public rules: any[];
  public isCurrentDataflow: boolean;
  public nameCnt:number;
  public current:boolean;
  public validCount: number = 0;
  public upstreamDsIds:string[];
  public histogram : any;
  public colTypes : any;
  public colDescs : any;

  // Join ui 에서 사용
  public selectedJoinType: string;
  public rightJoinKey: string;
  public leftJoinKey: string;
  public joinRuleList: any[];
  public leftSelectCol: any[];
  public rightSelectCol: any[];
  public joinButtonText: string;
  public ruleNo: string;

}

export class Datasets {
  private datasets: Dataset[];

  public getList() {
    return this.datasets;
  }
}

export enum DsType {
  IMPORTED = <any>'IMPORTED',
  WRANGLED = <any>'WRANGLED',
  FULLWRANGLED = <any>'FULLWRANGLED',
}

export enum RsType {
  TABLE = <any>'TABLE',
  SQL = <any>'SQL',
}

export enum ImportType {
  FILE = <any>'FILE',
  DB = <any>'DB',
  HIVE = <any>'HIVE'
}

export class Field {
  public name: string;
  public type: string;
  public logicalType? : string;
  public isHover? : boolean;
  public seq? : number;
  public values?: any[];
}

// add KJ
export class DatasetFile extends Dataset {
  public filename: string;
  public filepath: string;
  public filekey: string;
  public sheets: string[];
  public sheetname: string;
  public sheetIndex: number;
  public name: string;
  public desc: string;
  public selectedSheets: any[] = [];
  public delimiter: string;
  public totalLines: number;
  public totalBytes: number;
}

export class DatasetHive extends Dataset {
  public queryStmt: string;
  public tableName: string;
  public databaseName: string;
  public rsType: RsType;
  public dsName: string;
  public dsDesc: string;
}

export class DatasetJdbc extends Dataset {
  public dcId: string;
  public queryStmt: string;
  public tableName: string;
  public databaseName: string;
  public rsType: RsType;
  public dsName: string;
  public dsDesc: string;

  public dataconnection: any;
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
