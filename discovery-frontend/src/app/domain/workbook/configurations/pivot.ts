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

import {Field} from './field/field';

export class Pivot {

  // 열 영역에 위치한 필드 정보
  columns: Field[];

  // 행 영역에 위치한 필드 정보
  rows: Field[];

  // 교차 영역에 위치한 필드 정보
  aggregations: Field[];


  constructor() {
    this.columns = [];
    this.rows = [];
    this.aggregations = [];
  }
}
