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

export class JoinMapping {
  // 조인 Type
  type: JoinType;

  // 데이터 소스 Name
  name: string;

  // 데이터 소스 Name Alias, 하위 Join 수행시 namespace 로 활용
  joinAlias: string;

  // Join 할 Mutliple KeyMap, key : Mater Key , value : Lookup Key
  keyPair: Map<string, string>;

  // 하위에 조인할 join 정보
  join: JoinMapping;
}

/**
 * 연결(Join) 타입
 */
export enum JoinType {
  INNER = 'INNER',
  LEFT_OUTER = 'LEFT_OUTER',
  RIGHT_OUTER = 'RIGHT_OUTER', // Not Supported
  FULL = 'FULL' // Not Supported
}
