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

import {AdvancedFilter} from './advanced-filter';
import {AggregationType} from '../field/measure-field';

export class MeasurePositionFilter extends AdvancedFilter {

  /**
   *  집계 타입
   */
  public aggregation: AggregationType;

  /**
   *  조건
   */
  public position: PositionType;

  /**
   *  조건 값, aggreationType(field) conditionType value
   *  ex. SUM(param) > 10
   */
  public value: number;

  constructor() {
    super();
    this.type = 'measure_position';
  }

}

/**
 * 조건(=, >, <, >=, <=) 및 제한(상위,하위) 형태 포함
 */
export enum PositionType {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}
