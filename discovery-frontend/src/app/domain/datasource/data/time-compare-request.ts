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

import {Field} from '../../workbook/configurations/field/field';
import {SearchQueryRequest} from './search-query-request';

export class TimeCompareRequest extends SearchQueryRequest {

  /**
   * 기존 타입스템프 타입의 필드 지정, UI 에서는 별도 지정이 없으니 Timestmp Role 필드 정보를 전달합니다.
   */
  timeField: Field;

  /**
   * 비교기간을 구할 메져 정보
   */
  measures: Field[];

  /**
   * 비교기간 타입 (YEAR/MONTH/DAY/HOUR)
   */
  timeUnit: string;

  /**
   * 직전이 1로 지정, ○ 몇건 지정
   */
  value: number;

  /**
   * UI 상 타입존 지정
   */
  timeZone: string;

}
