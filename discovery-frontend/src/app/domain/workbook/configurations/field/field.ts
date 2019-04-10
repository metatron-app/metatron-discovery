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

import { DIRECTION } from 'app/domain/workbook/configurations/sort';
import { GranularityType } from './timestamp-field';
import { Field as DatasourceField, FieldPivot } from '../../../datasource/datasource';
import { Format } from '../format';

export abstract class Field {
  // 타입
  type: string;

  // 필드명
  name: string;

  // get alias(): string {
  //   if (this.aliasName)
  //     return this.aliasName;
  //   return this.name;
  // }
  //
  // set alias(alias: string) {
  //   this.aliasName = alias;
  // }
  // 현재 적용 Alias 명
  public alias: string;

  // 가상 필드 명
  public fieldAlias?: string;
  public pivotAlias?: string;

  // for druid
  // fieldName?: string;

  /**
   * Custom(Virtual) Column 을 참조할 경우, 또는 Lookup 필드 일경우 Lookup 데이터 소스명
   */
  ref?: string;

  // for UI
  // 서브 타입 (STRING, user_expr 등등..)
  subType?: string;
  // ROLE (TIMESTAMP, DIMENSION 등등..)
  subRole?: string;
  // 집계 타입
  aggregationType?: any;
  // 집계 타입 리스트
  aggregationTypeList?: any;
  // 집계 타입 옵션 (value=숫자값)
  options?: string;
  // Granularity
  granularity?: GranularityType;
  // Segment Granularity
  segGranularity?: GranularityType;
  // granularity list
  granularityList?: any;
  // 표시방식 지정
  timeExprUnit?: GranularityType;
  // 정렬
  direction?: DIRECTION;
  // 가장 최근 정렬 여부
  lastDirection?: boolean;
  // Show Value 여부
  showValue?: boolean;
  // 매칭되는 Datasource 필드
  field?: DatasourceField;
  // 선반에 올려진 위치
  pivot?: FieldPivot[];
  // Format 정보
  format?: Format;
  // 현재 선반에 올려진 위치
  currentPivot?: FieldPivot;
  // 수식이 포함된 컬럼여부
  aggregated?: boolean;

  // only used in UI
  isCustomField?: boolean
}
