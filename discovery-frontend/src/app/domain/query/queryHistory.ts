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

export class QueryHistory extends AbstractHistoryEntity {
  // identifer
  public id: string;
  // 수행한 Query 절
  public query: string;
  // Query 질의 시작시간
  public queryStartTime: string;
  // Query 질의 완료 시간
  public queryFinishTime: string;
  // Query 질의에 소요된 시간(ms)
  public queryTimeTaken: number;
  public queryTimeTakenFormatted: string;
  // Query Status
  public queryResultStatus: QueryResultStatus;
  // Query 대상 Database Name
  public databaseName: string;
  // Query History 삭제 여부
  public deleted: boolean;
  // Query 실패시 메시지
  public queryLog: string;
  // Data Connection Id
  public dataConnectionId: string;
  // Query 결과 count
  public numRows: number;
  // queryEditor
  // public queryEditor: QueryEditor;
}

// Query 상태
export enum QueryResultStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  CANCELLED = 'CANCELLED',
  RUNNING = 'RUNNING',
  ALL = 'ALL',
}
