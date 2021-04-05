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
  SUM = <any>'SUM',
  AVG = <any>'AVG',
  COUNT = <any>'COUNT',
  MIN = <any>'MIN',
  MAX = <any>'MAX',
  PERCENTILE = <any>'PERCENTILE',

  NONE = <any>'NONE',

  STDDEV = <any>'STDDEV',
  MEDIAN = <any>'MEDIAN',
  AREA = <any>'AREA',
  RANGE = <any>'RANGE',
  QUANTILE = <any>'QUANTILE',

  SLOPE = <any>'SLOPE',

  // Ingestion 타입
  VARIATION = <any>'VARIATION',
  APPROX = <any>'APPROX',

  // 계산식내 집계함수 포함 경우
  COMPLEX = <any>'COMPLEX',

  IFCOUNTD = <any>'IFCOUNTD'
}
