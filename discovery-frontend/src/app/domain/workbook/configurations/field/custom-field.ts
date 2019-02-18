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

import { BIType, Field, FieldPivot, FieldRole, IngestionRule, LogicalType } from '../../../datasource/datasource';
import { UserDefinedField } from './user-defined-field';

export class CustomField extends UserDefinedField {

  public dataSource:string;

  // Expression
  public expr: string;

  // Dimension or Measure
  public role: FieldRole;

  /**
   * TODO Expression 결과 Data Type
   */
  public dataType: any;

   // Expression이 이미 집계가 된 것인지 여부 확인
  public aggregated: boolean;

  // For UI
  public oriColumnName: string = '';
  public useChart: boolean = false;
  public useFilter: boolean = false;
  public useChartFilter: boolean = false;

  // for ui ( Spec 정리 후에 삭제 예정 ) - S
  biType: BIType;   // BI 타입
  id: string;       // 필드 아이디
  logicalType: LogicalType; // logical type
  seq: number;
  type: string;   // 데이터 타입
  partitioned: boolean;   // Partition 대상 필드 인지 여부
  filtering: boolean;   // 필수적으로 필터링을 수행해야하는 필드인지 여부
  filteringSeq: number; // 필수 필터링 순서 지정
  filteringOptions: any;  // 필터링 옵션
  mappedField: Field[];   // 기존 물리적인 필드를 매핑하여 신규 필드를 구성할 경우 관련 필드 정보
  ingestionRule: IngestionRule;   // IngestionRule
  // format: string;   // format
  description: string;  // description
  // for ui ( Spec 정리 후에 삭제 예정 ) - E

  constructor() {
    super();
    this.type = 'user_expr';
  }
}
