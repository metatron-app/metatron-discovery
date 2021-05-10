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
import {ConnectionType} from './datasource';

export class DatasourceQueryHistory extends AbstractHistoryEntity {
  // id
  public id: string;
  // 질의 스펙
  public query: string;
  // 질의 대상 아이디
  public dataSourceId: string;
  // 연결 타입
  public connType: ConnectionType;
  // 질의 타입
  public queryType: QueryType;
  // 엔진 질의 스펙
  public engineQuery: string;
  // 엔진 질의 id
  public engineQueryId: string;
  // 엔진 질의 타입
  public engineQueryType: EngineQueryType;
  // 엔진 결과 처리 타입

  // 질의 성공 여부
  public succeed: boolean;
  // 질의 실패시 메시지 표시
  public message: string;
  // 질의 결과 카운트
  public resultCount: number;
  // 질의 결과 size
  public resultSize: number;
  // 전체 질의 소요시간
  public elapsedTime: number;
  // 엔진 질의 시간
  public engineElapsedTime: number;
  // creator
  public creator: any;
}

export enum QueryType {
  CANDIDATE = 'CANDIDATE',
  META = 'META',
  SEARCH = 'SEARCH',
  SUMMARY = 'SUMMARY',
  COVARIANCE = 'COVARIANCE',
  SIMILARITY = 'SIMILARITY'
}

export enum EngineQueryType {
  TOPN = 'TOPN',
  TIMEBOUNDARY = 'TIMEBOUNDARY',
  SEARCH = 'SEARCH',
  SELECT = 'SELECT',
  SEGMENTMETA = 'SEGMENTMETA',
  SELECTMETA = 'SELECTMETA',
  GROUPBY = 'GROUPBY',
  SUMMARY = 'SUMMARY',
  COVARIANCE = 'COVARIANCE',
  SIMILARITY = 'SIMILARITY'
}
