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

export class Task {
  created_time: string;
  datasource: string;
  duration: number;
  location: string;
  rank: number;
  status: TaskStatus;
  task_id: string;
  type: TaskType;
  queue_ingestion_time: string;
  host: string;
}

export enum TaskStatus {
  ALL = <any>'ALL',
  PENDING = <any>'PENDING',
  WAITING = <any>'WAITING',
  RUNNING = <any>'RUNNING',
  SUCCESS = <any>'SUCCESS',
  FAILED = <any>'FAILED'
}

export enum TaskType {
  ALL = <any>'ALL',
  INDEX = <any>'index',
  KAFKA = <any>'index_kafka',
  HADOOP = <any>'index_hadoop'
}

// ONLY USE UI
export enum TaskDateTimeType {
  ALL = 'ALL',
  TODAY = 'TODAY',
  SEVEN_DAYS = 'SEVEN_DAYS',
  BETWEEN = 'BETWEEN'
}
