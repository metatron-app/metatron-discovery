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

export class WildCardFilter extends AdvancedFilter {
  /**
   *  포함 조건 BEFORE (*contains), AFTER (contains*), BOTH(*contains*)
   */
  public contains: ContainsType;

  /**
   *  포함되는 단어
   */
  public value: string;

  constructor() {
    super();
    this.type = 'wildcard';
  }
}

/**
 * 포함 조건 타입 정의
 */

export enum ContainsType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  BOTH = 'BOTH'
}
