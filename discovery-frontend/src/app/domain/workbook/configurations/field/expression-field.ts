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

import {UserDefinedField} from './user-defined-field';
import {FieldRole} from '@domain/datasource/datasource';

export class ExpressionField extends UserDefinedField {

  /**
   * Expression
   */
  public expr: string;

  /**
   * Dimension or Measure
   */
  public role: FieldRole;

  /**
   * TODO Expression 결과 Data Type
   */
  public dataType: any;
  /**
   * Expression이 이미 집계가 된 것인지 여부 확인
   */
  public aggregated: boolean;

  // For UI
  public oriColumnName: string = '';
  public useFilter: boolean = false;
  public useChartFilter: boolean = false;
  public useChart: boolean = false;

  constructor() {
    super();
    this.type = 'user_expr';
  }
}
