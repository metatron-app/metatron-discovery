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

import {FieldFormat, FieldFormatType} from '../datasource/datasource';
import {ColumnDictionary} from './column-dictionary';
import {CodeTable} from './code-table';
import {MetadataSource} from './metadata-source';
import {Type} from '../../shared/datasource-metadata/domain/type';
import * as _ from 'lodash';

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

  public static isEmptyFormat(metadataColumn: MetadataColumn) {
    return _.isNil(metadataColumn.format);
  }

  public static isGeoColumn(metadataColumn: MetadataColumn) {
    return metadataColumn.type === Type.Logical.GEO_POLYGON || metadataColumn.type === Type.Logical.GEO_POINT || metadataColumn.type === Type.Logical.GEO_LINE;
  }

  public static isRoleIsTimestamp(metadataColumn: MetadataColumn) {
    return metadataColumn.role === Type.Role.TIMESTAMP
  }

  public static isTypeIsTimestamp(metadataColumn: MetadataColumn) {
    return metadataColumn.type === Type.Logical.TIMESTAMP;
  }

  /**
   * Use it if you need to verify that it is the column specified to act as a timestamp
   */
  public static isTimestampColumn(metadataColumn: MetadataColumn) {
    return metadataColumn.role === Type.Role.TIMESTAMP
      && metadataColumn.type === Type.Logical.TIMESTAMP;
  }

  /**
   * The Current Date Time column provides a function to check the column
   * because it should not be exposed to the screen.
   */
  public static isCurrentDatetime(metadataColumn: MetadataColumn) {
    return _.negate(_.isNil)(metadataColumn.format)
      && _.negate(_.isNil)(metadataColumn.format.type)
      && metadataColumn.format.type === FieldFormatType.TEMPORARY_TIME
      && metadataColumn.role === Type.Role.TIMESTAMP;
  }

  /**
   * If a column dictionary is defined
   */
  public static isColumnDictionaryDefined(metadataColumn: MetadataColumn) {
    return _.negate(_.isNil)(metadataColumn)
      && _.negate(_.isNil)(metadataColumn.dictionary);
  }

  isValidType?: boolean;
  isValidTimeFormat?: boolean;
  timeFormatValidMessage?: string;
  isShowTypeValidPopup?: boolean;
  isShowTimestampValidPopup: boolean;
  replaceFl: boolean;
  checked: boolean;
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
