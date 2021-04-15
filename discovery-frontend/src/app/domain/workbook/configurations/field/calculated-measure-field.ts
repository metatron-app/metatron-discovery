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

import {CustomField} from './custom-field';
import {AggregationType} from './measure-field';

export class CalculatedMeasureField extends CustomField {
  /**
   * 계산식
   */
  public expr: string;
  /**
   * 가상 필드명, 없는 경우 필드명 과 AggregationType 값과 조합하여 구성 ex. SUM(fieldName)
   */
  public alias: string;
  /**
   * 집계여부
   */
  public isAggregated: string;
  /**
   * 집합 함수 타입
   * page 선반에 저장할때 필요
   */
  public aggregationType: AggregationType;


  constructor() {
    super();
    this.type = 'calculated';
  }
}
