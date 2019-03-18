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

import {FieldFormat} from '../datasource/datasource';
import {ColumnDictionary} from './column-dictionary';
import {CodeTable} from './code-table';
import {MetadataSource} from './metadata-source';
import {Type} from '../../shared/datasource-metadata/domain/type';

export class MetadataColumn {
  // id
  public id: number;
  // 물리 컬럼 타입
  public physicalType: string;
  // 물리 컬럼 이름
  public physicalName: string;
  // 컬럼 이름
  public name: string;
  // 컬럼 타입
  public type: Type.Logical;
  // 설명
  public description: string;
  // 연결된 컬럼 사전
  public dictionary: ColumnDictionary;
  // 컬럼 포맷
  public format: FieldFormat;
  // 연결된 코드 테이블
  public codeTable: CodeTable;
  // 인기도
  public popularity: number;
  // 역할
  public role: Type.Role;

  ////////////////////////////////////////////////////////////////////////////
  // Value to be used only on View
  ////////////////////////////////////////////////////////////////////////////
  isValidType?: boolean;
  isValidTimeFormat?: boolean;
  timeFormatValidMessage?: string;
  isShowTypeValidPopup?: boolean;
}

export class LinkedMetaDataColumn extends MetadataColumn {
  // id
  public metadataId: number;
  // 메타데이터 이름
  public metadataName: string;
  // 메타데이터 소스 타입
  public metadataSourceType: string;
  // 메타데이터 소스
  public metadataSource: MetadataSource;
}
