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

import { FieldFormat, LogicalType } from '../datasource/datasource';
import { DataType } from '../dataconnection/connectionrequest';
import { CodeTable } from './code-table';
import { AbstractHistoryEntity } from '../common/abstract-history-entity';
import { MetadataColumn } from './metadata-column';

export class ColumnDictionary extends AbstractHistoryEntity {
  // id
  public id: string;
  // 컬럼 물리 명
  public name: string;
  // 컬럼 축약 명
  public shortName: string;
  // 컬럼 논리 명
  public logicalName: string;
  // 컬럼 설명
  public description: string;
  // 물리 데이터 타입
  public dataType: DataType;
  // 논리 데이터 타입
  public logicalType: LogicalType;
  // 데이터 포맷
  // TODO 추후 FieldFormat으로 변경
  // public format: FieldFormat;
  public format: any;
  // 연결된 코드 테이블 정보
  public codeTable: CodeTable;
  // 링크된 코드테이블 존재 여부
  public linkCodeTable: boolean;
  // 연결된 메타데이터 컬럼 목록
  public columns: MetadataColumn[];
}
