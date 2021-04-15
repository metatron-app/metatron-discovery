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

import {Field} from './field';

export class TimestampField extends Field {

  // Granularity
  granularity: GranularityType;

  // 표시방식 지정
  timeExprUnit: GranularityType;

  // 출력 시간대 지정
  timeZone: string;

  // Locale 지정
  locale: string;

  constructor() {
    super();
    this.type = 'timestamp';
  }
}

export enum GranularityType {
  ALL = 'ALL',
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  DAYOFWEEK = 'DAYOFWEEK',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  NONE = 'NONE'
}

export enum TimeUnit {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  NONE = 'NONE'
}

export enum ByTimeUnit {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR'
}

/**
 * Candidate 필터링 타입
 */
export enum FilteringType {
  LIST = 'LIST',
  RANGE = 'RANGE'
}
