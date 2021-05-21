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

export class MeasureField extends Field {
  /**
   * 집합 함수 타입, 기본값 SUM
   */
  public aggregationType: AggregationType;

  constructor() {
    super();
    this.type = 'measure';
    this.aggregationType = AggregationType.SUM;
  }
}

/**
 * 집합함수 Enum Type
 * com.metatron.discovery.domain.workbook.configurations.field.MeasureField
 */
export enum AggregationType {
  // 사용자 노출 타입
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  PERCENTILE = 'PERCENTILE',

  NONE = 'NONE',

  STDDEV = 'STDDEV',
  MEDIAN = 'MEDIAN',
  AREA = 'AREA',
  RANGE = 'RANGE',
  QUANTILE = 'QUANTILE',

  SLOPE = 'SLOPE',

  // Ingestion 타입
  VARIATION = 'VARIATION',
  APPROX = 'APPROX',

  // 계산식내 집계함수 포함 경우
  COMPLEX = 'COMPLEX',

  IFCOUNTD = 'IFCOUNTD',
  COUNTD = 'COUNTD'
}
