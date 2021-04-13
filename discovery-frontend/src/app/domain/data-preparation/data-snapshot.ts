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

/*
import { AbstractHistoryEntity } from '../common/abstract-history-entity';

export class DataSnapshot extends AbstractHistoryEntity{

  public ssId:string;
  public ssName: string;
  public dfName: string;
  public dsName: string;
  public elapsedTime: ElapsedTime = new ElapsedTime();
  public launchTime: Date;
  public validLines: number;
  public mismatchedLines: number;
  public missingLines: number;
  public totalBytes: number;
  public totalLines: number;
  public ssType: SsType;
  public mode: Mode;
  public dbName: string;
  public tblName: string;
  public status: string;
  public engine : string;
  public finishTime : any;
  public location : string;
  public uri : string; // fileURL : string;

  // 생성시 필요한 필드
  public compression: Compression;
  public format: Format;
  public partKeys: string[];

  // UI 에서 사용
  public gridData: any;
  public ruleCntDone : number;
  public ruleCntTotal : number;

  public custom: any;
  public lineageInfo: string;
  public jsonLineageInfo: any;
  public isCancel : boolean = false;

  public displayStatus: string;
}

export class OriginDsInfo {
  public dsName: string;
  public qryStmt: string;
  public filePath: string;
  public createdTime: string;
}

export class DataSnapshots {
  private  dataSnapshots: DataSnapshot[];
  public getList() {
    return this.dataSnapshots;
  }
}

export class ElapsedTime {

  public days: number;
  public hours: number;
  public minutes: number;
  public seconds: number;
  public milliseconds: number;

}

export enum SsType {

  FILE = 'FILE',
  HDFS = 'HDFS',
  JDBC = 'JDBC',
  HIVE = 'HIVE'
}

export enum Mode {
  OVERWRITE = 'OVERWRITE',
  APPEND = 'APPEND'
}

export enum Compression {

  NONE = 'NONE',
  SNAPPY = 'SNAPPY',
  ZLIB = 'ZLIB',
}

export enum Format {

  CSV = 'CSV',
  JSON = 'JSON',
  ORC = 'ORC',
  PARQUET = 'PARQUET'

}

*/

