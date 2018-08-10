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

import { UIFormatSymbolPosition } from '../define/common';
export interface UIChartFormat extends UIChartFormatItem{

  // 전체적용 여부
  isAll?: boolean;

  // 개별필드 포맷 (전체적용 여부가 false일 경우 사용)
  each?: UIChartFormatItem[];
}

export interface UIChartFormatItem {

  // 필드이름
  name?: string;

  // Alias
  alias?: string;

  // Aggregation Type
  aggregationType?: string;

  // 포맷 타입
  type?: string;

  // 통화기호
  sign?: string;

  // 소수 자리수
  decimal?: number;

  // 1000자리 구분자 사용여부
  useThousandsSep?: boolean;

  // 사용자 기호 설정
  customSymbol?: CustomSymbol;

  // 수치표시 약어
  abbr?: string;
}

export interface CustomSymbol {

  // 사용자 정의 기호
  value?: string;

  // 기호 위치
  pos?: UIFormatSymbolPosition;

  // 숫자기호 표시여부
  abbreviations?: boolean;
}
