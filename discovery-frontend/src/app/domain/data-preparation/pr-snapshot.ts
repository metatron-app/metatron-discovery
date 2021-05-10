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

import {AbstractHistoryEntity} from '../common/abstract-history-entity';

export class PrDataSnapshot extends AbstractHistoryEntity {

  public ssId: string;
  public ssName: string;
  public storageType: StorageType;
  public dbName: string;
  public tblName: string;
  public status: Status;
  public launchTime: Date;
  public finishTime: Date;
  public mismatchedLines: number;
  public missingLines: number;
  public totalLines: number;
  public totalBytes: number;

  public elapsedTime: ElapsedTime = new ElapsedTime();
  public storedUri: string;

  public sourceInfo: LineageInfo;
  public connectionInfo: ConnectionInfo;
  public ruleStringInfo: any;

// 생성시 필요한 필드
  public ssType: SsType;
  public hiveFileFormat: HiveFileFormat;
  public hiveFileCompression: HiveFileCompression;
  public appendMode: AppendMode;
  public engine: Engine;
  public partitionColNames: string[];

// UI 에서 사용
  public gridData: any;
  public ruleCntDone: number;
  public ruleCntTotal: number;

  public custom: any;
  public isCancel: boolean = false;

  public displayStatus: string;
  public dsName: string;
  public dfName: string;

  public dsCreatedTime: Date;
  public dsModifiedTime: Date;
}

export class OriginDsInfo {
  public dsName: string;
  public qryStmt: string;
  public storedUri: string;
  public createdTime: string;
}

export class LineageInfo {
  public dfId: string;
  public dfName: string;

  public dsId: string;
  public dsName: string;
  public origDsName: string;
  public origDsStoredUri: string;
  public origDsQueryStmt: string;
  public origDsCreatedTime: string;
}

export class ConnectionInfo {
  public dcId: string;
}

export class ElapsedTime {

  public days: number;
  public hours: number;
  public minutes: number;
  public seconds: number;
  public milliseconds: number;

}

export enum SsType {
  URI = 'URI',
  DATABASE = 'DATABASE',
  STAGING_DB = 'STAGING_DB',
  DRUID = 'DRUID'
}

export enum AppendMode {
  OVERWRITE = 'OVERWRITE',
  APPEND = 'APPEND'
}

export enum HiveFileCompression {
  NONE = 'NONE',
  SNAPPY = 'SNAPPY',
  ZLIB = 'ZLIB'
}

export enum StorageType {
  LOCAL = 'LOCAL',
  HDFS = 'HDFS'
}

export enum UriFileFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  SQL = 'SQL'
}

export enum HiveFileFormat {
  CSV = 'CSV',
  ORC = 'ORC'
}

export enum Engine {
  EMBEDDED = 'EMBEDDED',
  SPARK = 'SPARK'
}

export enum Status {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  INITIALIZING = 'INITIALIZING',
  RUNNING = 'RUNNING',
  WRITING = 'WRITING',
  TABLE_CREATING = 'TABLE_CREATING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELING = 'CANCELING',
  CANCELED = 'CANCELED'
}



