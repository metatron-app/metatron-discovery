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

export class Audit extends AbstractHistoryEntity{
  // identifer
  public id: string;
  // job name
  public jobName: string;
  // job id
  public jobId: string;
  // application id
  public applicationId: string;
  // application Type
  public applicationType: string;
  // application name
  public applicationName: string;
  // queue
  public queue: string;
  // 수행 시작 시간
  public startTime: string;
  // 수행 완료 시간
  public finishTime: string;
  // 수행에 걸린 시간 (ms)
  public elapsedTime: number;
  // 상태 (Success, Fail)
  public status: AuditStatus;
  // 종류
  public type: AuditType;
  // job log
  public jobLog: string;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 DataConnection Id
  public dataConnectionId: string;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 Host
  public dataConnectionHostName: string;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 Database
  public dataConnectionDatabase: string;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 Port
  public dataConnectionPort: number;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 ConnectionUrl
  public dataConnectionConnectUrl: string;
  // Workbench를 통해 수행된 경우 해당 DataConnection의 Implementor
  public dataConnectionImplementor: string;

  // Workbench를 통해 수행된 경우 해당 QueryHistory Id
  public queryHistoryId: number;
  // TYPE이 QUERY일 경우 EXPLAIN 결과
  public plan: string;

  public user: string;

  // for UI
  public num?:number; // Row Number

  public memorySeconds: any;
  public vcoreSeconds: any;

  // num rows
  public numRows: number;
  // memorySeconds 증분
  public incrementMemorySeconds: number;
  // VcoreSeconds 증분
  public incrementVcoreSeconds: number;
  // ResourceManager Log Link
  public logsLink: string[];
}

// Query 상태
export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RUNNING = 'RUNNING',
  CANCELLED = 'CANCELLED'
}

// AuditType
export enum AuditType {
  QUERY = 'QUERY',
  JOB = 'JOB'
}
