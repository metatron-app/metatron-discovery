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

export class Sort {
  /**
   *  필드명 <br/>
   *  선반에 놓인(Projection) 필드중 Dimension 필드명만 위치해야함
   */
  field: string;

  direction: DIRECTION;

  // 가장 최근 정렬 여부
  lastDirection?: boolean;
}

export enum DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC',
  NONE = 'NONE' // for UI
}
