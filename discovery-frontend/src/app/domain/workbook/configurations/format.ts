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

import {ByTimeUnit, TimeUnit} from './field/timestamp-field';
import {CustomSymbol, UIChartFormatItem} from '@common/component/chart/option/ui-option/ui-format';

export class Format {

  // 포맷 타입
  type?: string;

  // 통화기호
  sign?: string;

  // 소수 자리수
  decimal?: number;

  // 1000자리 구분자 사용여부
  useThousandsSep?: boolean;

  // Time Role: discontinuous 타입여부
  discontinuous?: boolean;

  // Time Role: Unit 타입
  unit?: TimeUnit;

  // Time Role: discontinuous 타입일때 ByUnit 타입
  byUnit?: ByTimeUnit;

  // 전체적용 여부
  isAll?: boolean;

  // 사용자 기호 설정
  customSymbol?: CustomSymbol;

  // 수치표시 약어
  abbr?: string;

  ////////////////////////////////
  // 비교기간을 위한 설정
  ////////////////////////////////

  format?: string;
  timeZone?: string;
  locale?: string;

  ////////////////////////////////
  ///// 서버스펙이 미지정된 옵션들
  ////////////////////////////////

  // 개별필드 포맷 (전체적용 여부가 false일 경우 사용)
  each?: UIChartFormatItem[];
}
