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

import { ColumnDictionary } from './column-dictionary';
import { CodeValuePair } from './code-value-pair';
import { AbstractHistoryEntity } from '../common/abstract-history-entity';
import { MetadataColumn } from './metadata-column';

export class CodeTable extends AbstractHistoryEntity {
  // id
  public id: string;
  // 코드 테이블 명
  public name: string;
  // 코드 테이블 설명
  public description: string;
  // 코드 값 정보
  public codes: CodeValuePair[];
  // 연결된 컬럼 사전 정보
  public dictionaries: ColumnDictionary[];
  // 연결된 메타데이터 컬럼 목록
  public columns: MetadataColumn[];
}
