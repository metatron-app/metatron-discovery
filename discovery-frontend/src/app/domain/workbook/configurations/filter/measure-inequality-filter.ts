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

import { AdvancedFilter } from './advanced-filter';
import { AggregationType } from '../field/measure-field';

export class MeasureInequalityFilter extends AdvancedFilter{
  /**
   *  집계 타입
   */
  public aggregation: AggregationType;

  /**
   *  조건
   */
  public inequality: InequalityType;

  /**
   *  조건 값, aggreationType(field) conditionType value
   *  ex. SUM(param) > 10
   */
  public value: number;

  constructor() {
    super();
    this.type = 'measure_inequality';
  }

}

export enum InequalityType {
  EQUAL_TO = <any>'EQUAL_TO',
  GREATER_THAN = <any>'GREATER_THAN',
  LESS_THAN = <any>'LESS_THAN',
  EQUAL_GREATER_THAN = <any>'EQUAL_GREATER_THAN',
  EQUAL_LESS_THAN = <any>'EQUAL_LESS_THAN',
}
