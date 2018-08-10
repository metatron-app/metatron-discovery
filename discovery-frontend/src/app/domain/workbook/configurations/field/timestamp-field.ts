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

import { Field } from './field';

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
  ALL = <any>'ALL',
  SECOND = <any>'SECOND',
  MINUTE = <any>'MINUTE',
  HOUR = <any>'HOUR',
  DAY = <any>'DAY',
  DAYOFWEEK = <any>'DAYOFWEEK',
  WEEK = <any>'WEEK',
  MONTH = <any>'MONTH',
  QUARTER = <any>'QUARTER',
  YEAR = <any>'YEAR',
  NONE = <any>'NONE'
}

export enum TimeUnit {
  SECOND = <any>'SECOND',
  MINUTE = <any>'MINUTE',
  HOUR = <any>'HOUR',
  DAY = <any>'DAY',
  WEEK = <any>'WEEK',
  MONTH = <any>'MONTH',
  QUARTER = <any>'QUARTER',
  YEAR = <any>'YEAR',
  NONE = <any>'NONE'
}

export enum ByTimeUnit {
  WEEK = <any>'WEEK',
  MONTH = <any>'MONTH',
  QUARTER = <any>'QUARTER',
  YEAR = <any>'YEAR'
}

/**
 * Candidate 필터링 타입
 */
export enum FilteringType {
  LIST = <any>'LIST',
  RANGE = <any>'RANGE'
}
