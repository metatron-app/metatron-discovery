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

import {AbstractHistoryEntity} from '../common/abstract-history-entity';
import {GranularityType} from '../workbook/configurations/field/timestamp-field';
import {Dataconnection} from '../dataconnection/dataconnection';
import {MetadataColumn} from '../meta-data-management/metadata-column';
import {
  CreateConnectionData,
  CreateSnapShotData,
  CreateSourceCompleteData,
  CreateSourceConfigureData
} from "../../data-storage/service/data-source-create.service";
import {PrDataSnapshot} from "../data-preparation/pr-snapshot";
import {isNullOrUndefined} from "util";
import {TimezoneService} from "../../data-storage/service/timezone.service";
import {AggregationType} from "../workbook/configurations/field/measure-field";

export class Datasource extends AbstractHistoryEntity {
  id: string;             // ID
  name: string;           // 데이터 소스 이름
  engineName: string;     // 엔진내 사용하는 데이터 소스 (실제 Query에서 활용하는 데이터 소스명)
  ownerId: string;         // 데이터 소스 사용자 ID
  description: string;    // 데이터 소스 설명
  dsType: string;         // <== DataSourceType 이어야 하지만... Notebook 에서 본 클래스를 사용하므로.. string으로 놔둠
  connType: ConnectionType;
  srcType: SourceType;
  granularity: GranularityType;
  segGranularity: GranularityType;
  partitionKeys: string;       // 파티션을 구성하는 필드 명 목록 (,) 구분자 사용
  partitionSeparator: string;  // 파티션을 구성하는 구분자 format : {datasource name}{partitionSeparator}{key1}{partitionSeparator}{key2}...
  status: Status;
  published: boolean;         // 전체 공개 여부 true일 경우 전체 공개
  linkedWorkspaces: number;   // 연결된 workspaces 개수
  ingestion;             // 데이터 소스 적재 정보
  fields: Field[];            // 데이터 소스 필드 정보
  snapshot?: PrDataSnapshot;
  // workspaces
  // dashBoards
  connection: Dataconnection;
  summary: DataSourceSummary;
  fieldsMatched: boolean;

  implementor: string;
  owner: any[];
  countOfDataSources: number;

  // for UI
  num?: number;
  temporary?: TemporaryDatasource;
  uiMetaData?: { name: string, id: string, description: string, columns: MetadataColumn[] };

  public static getConnection(datasource: Datasource) {
    return datasource.connection || datasource.ingestion.connection;
  }
}

export class DataSourceSummary {
  public id: number;
  public ingestionMinTime: Date;
  public ingestionMaxTime: Date;
  public lastAccessTime: Date;
  public size: number;
  public count: number;
} // class - DataSourceSummary

export class TemporaryDatasource {
  public dataSourceId: string;
  public expired: number;
  public id: string;
  public modifiedBy: string;
  public modifiedTime: string;
  public name: string;
  public nextExpireTime: string;
  public queryId: string;
  public registeredTime: string;
  public status: TempDsStatus;
  public volatiled: boolean;
  public filters?: any[];
}

export class DatasourceFile {
  // 파일 이름
  public filename: string;
  // 파일 path
  public filepath: string;
  // 파일 크기
  public fileSize: number;
  // 파일 키
  public filekey: string;
  // 시트
  public sheets: string[];
  // 선택한 시트 이름
  public selectedSheetName: any;
  // 선택한 데이터
  public selectedFile: File;
}

export class DatasourceHive {
  // 컬럼
  public fields: Field[];
  // partition 컬럼
  public partitionFields: Field[];
  // 샘플 data
  public data: any[];
  // CSV, ORC
  public fileFormat: any;
}

// package com.metatron.discovery.domain.datasource.Field
export class Field {
  // 필드 아이디
  id: string;
  // Field 명
  name: string;
  // logical name
  logicalName?: string;
  // description
  description: string;

  // Physical data type on engine
  type: string;
  // logical type
  // TODO type.Logical 변경 필요
  logicalType: LogicalType;
  // 필드 타입
  // TODO type.Role 변경 필요
  role: FieldRole;
  // Partition 대상 필드 인지 여부
  partitioned: boolean;

  // 필수적으로 필터링을 수행해야하는 필드인지 여부
  filtering: boolean;
  // 필수 필터링 순서 지정
  filteringSeq: number;
  // 필터링 옵션
  filteringOptions;

  aggrType?: AggregationType;
  // Whether to exclude what to load to engine
  unloaded?: boolean;
  seq: number;
  // is create field (optional)
  derived?: boolean;
  // derivationRule
  derivationRule?: DerivationRule;
  // IngestionRule
  ingestionRule: IngestionRule;

  // 기존 물리적인 필드를 매핑하여 신규 필드를 구성할 경우 관련 필드 정보
  mappedField: Field[];

  // format
  // TODO 추후 FieldFormat으로 변환
  // format: FieldFormat;
  format: any | FieldFormat;

  // Field 별칭
  alias: string;

  // for UI
  useFilter: boolean = false;
  useChartFilter: boolean = false;
  useChart: boolean = false;
  ref?: string;
  expr?: string;
  aggregated?: boolean;
  pivot?: FieldPivot[];     // 선반에 올려진 위치
  // pivotAlias?: string;   // Pivot에서 수정된 Alias
  headerKey?: string;       // join 시 그리드 헤더 키로 사용할 키
  dsName?: string;          // 필드의 데이터소스 이름
  granularity?: GranularityType;     // granularity
  segGranularity?: GranularityType;  // segGranularity

  // [UI] for Create Datasource
  isValidType?: boolean;
  isValidTimeFormat?: boolean;
  isValidReplaceValue?: boolean;
  typeValidMessage?: string;
  replaceValidMessage?: string;
  timeFormatValidMessage?: string;
  checked?: boolean;

  // [UI] valid layer popup
  isShowTypeList?: boolean;



  // [UI] for Alias
  dsId?: string;                   // 데이터소스 아이디
  dataSource?: string;            // 데이터소스 engine Name
  boardId?: string;               // 대시보드 아이디
  nameAlias?: FieldNameAlias;     // 데이터소스 필드 이름 별칭 정보
  valueAlias?: FieldValueAlias;   // 데이터소스 필드 값 별칭 정보

  // for MetaData
  uiMetaData?: MetadataColumn;

  // for Datasource detail
  op?: 'replace';

  removeUIproperties?() {
    delete this.isShowTypeList;
    delete this.isValidType;
  }

  public static getSlicedColumnName?(field: Field): string {
    if (field.name.length > 50) {
      return field.name.slice(0,50);
    } else {
      return field.name;
    }
  }

  /**
   * 차원값의 타입 아이콘 클래스 반환
   * @param {Field} field
   * @return {string}
   */
  public static getDimensionTypeIconClass(field: Field): string {
    //debugger
    const logicalType: string = (field.logicalType) ? field.logicalType.toString() : '';
    if ('STRING' === logicalType || 'user_expr' === field.type) {
      return 'ddp-icon-dimension-ab';
    } else if ('LNG' === logicalType) {
      return 'ddp-icon-dimension-longitude';
    } else if ('LNT' === logicalType) {
      return 'ddp-icon-dimension-latitude';
    } else if ('TIMESTAMP' === logicalType) {
      return 'ddp-icon-dimension-calen';
    } else if ('DOUBLE' === logicalType) {
      return 'ddp-icon-dimension-float';
    } else if ('INTEGER' === logicalType) {
      return 'ddp-icon-dimension-sharp';
    } else if ('BOOLEAN' === logicalType) {
      return 'ddp-icon-dimension-tf';
    } else if ('GEO_POINT' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-dimension-point';
    } else if ('GEO_LINE' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-dimension-line';
    } else if ('GEO_POLYGON' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-dimension-polygon';
    }
  } // function - getDimensionTypeIconClass

  /**
   * 측정값의 타입 아이콘 클래스 반환
   * @param {Field} field
   * @return {string}
   */
  public static getMeasureTypeIconClass(field: Field): string {
    //debugger
    const logicalType: string = (field.logicalType) ? field.logicalType.toString() : '';
    if ('STRING' === logicalType) {
      return 'ddp-icon-measure-ab';
    } else if ('LNG' === logicalType || 'LNT' === logicalType) {
      return 'ddp-icon-measure-local';
    } else if ('TIMESTAMP' === logicalType) {
      return 'ddp-icon-measure-calen';
    } else if ('DOUBLE' === logicalType) {
      return 'ddp-icon-measure-float';
    } else if ('INTEGER' === logicalType || 'user_expr' === field.type) {
      return 'ddp-icon-measure-sharp';
    } else if ('BOOLEAN' === logicalType) {
      return 'ddp-icon-measure-tf';
    } else if ('GEO_POINT' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-measure-point';
    } else if ('GEO_LINE' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-measure-line';
    } else if ('GEO_POLYGON' === logicalType) {
      return 'ddp-icon-map-view ddp-icon-measure-polygon';
    }
  } // function - getMeasureTypeIconClass
}

// 데이터소스 생성시 사용하는 정보
export class DatasourceInfo {
  // src type
  public type: SourceType;
  public dsType: DataSourceType;
  // conn type
  public connType: ConnectionType;
  // field list data
  public fieldList: any;
  // field data
  public fieldData: any;

  // 1step 커넥션 정보
  public connectionData: CreateConnectionData;
  // 1step 업로드 정보
  public uploadData;

  // 2step 데이터베이스 정보
  public databaseData: any;
  // 2step 파일 정보
  public fileData: any;
  // snapshot
  public snapshotData: CreateSnapShotData;

  // 3step 스키마 정보
  // TODO configureData로 변경
  public schemaData: any;
  public configureData: CreateSourceConfigureData;

  // 4step
  // TODO CreateSourceIngestionData로 타입 변경
  public ingestionData: any;

  // 5step 생성정보
  public completeData: CreateSourceCompleteData;

  // 분기를 위한 플래그
  // TODO isDisableDataSelect로 변경
  public workbenchFl: boolean;
  public isDisableDataSelect: boolean;
}

export class IngestionRule {
  // type
  public type: IngestionRuleType;
  // value
  public value: string;

  // constructor
  constructor() {
    this.type = IngestionRuleType.DEFAULT;
  }
}

export class DerivationRule {
  // type
  public type: string;
  // latField
  public latField: string;
  // lonField
  public lonField: string;
  // expr
  public expr: string;
}

// batch history 조회
export class IngestionHistory extends AbstractHistoryEntity {

  // 대상 데이터소스 id
  public dataSourceId: string;

  // 엔진내 적재 job id
  public ingestionId: string;

  // job 진행 시간
  public duration: number;

  // job 상태
  public status: IngestionStatus;

  // 실패시 원인 메시지
  public cause: string;
}

// job 상태
export enum IngestionStatus {
  SUCCESS = <any>'SUCCESS',
  FAILED = <any>'FAILED',
  RUNNING = <any>'RUNNING',
  PASS = <any>'PASS'
}

// dsType
export enum DataSourceType {
  MASTER = <any>'MASTER',
  JOIN = <any>'JOIN',
  VOLATILITY = <any>'VOLATILITY'
}

// connType
export enum ConnectionType {
  ENGINE = <any>'ENGINE',
  LINK = <any>'LINK'
}

// srcType
export enum SourceType {
  FILE = <any>'FILE',
  HDFS = <any>'HDFS',
  HIVE = <any>'HIVE',
  JDBC = <any>'JDBC',
  REALTIME = <any>'REALTIME',
  IMPORT = <any>'IMPORT',
  SNAPSHOT = <any>'SNAPSHOT',
  NONE = <any>'NONE'
}

export enum Status {
  ENABLED = <any>'ENABLED',
  PREPARING = <any>'PREPARING',
  FAILED = <any>'FAILED',
  BAD = <any>'BAD',
  DISABLED = <any>'DISABLED'
}

export enum LogicalType {
  TEXT = <any>'STRING',
  STRING = <any>'STRING',
  INTEGER = <any>'INTEGER',
  FLOAT = <any>'DOUBLE',
  DOUBLE = <any>'DOUBLE',
  TIMESTAMP = <any>'TIMESTAMP',
  BOOLEAN = <any>'BOOLEAN',
  MAP = <any>'STRUCT',
  STRUCT = <any>'STRUCT',
  ARRAY = <any>'ARRAY',
  LNT = <any>'LNT',
  LNG = <any>'LNG',
  POSTAL_CODE = <any>'POSTAL_CODE',
  PHONE_NUMBER = <any>'PHONE_NUMBER',
  ETC = <any>'ETC',
  GEO_POINT = <any>'GEO_POINT',
  GEO_LINE = <any>'GEO_LINE',
  GEO_POLYGON = <any>'GEO_POLYGON',
  USER_DEFINED = <any>'user_defined'
}

export enum FieldRole {
  DIMENSION = <any>'DIMENSION',
  MEASURE = <any>'MEASURE',
  TIMESTAMP = <any>'TIMESTAMP'
}

/**
 * 필드가 올려진 선반 타입
 */
export enum FieldPivot {
  ROWS = <any>'ROWS',
  COLUMNS = <any>'COLUMNS',
  AGGREGATIONS = <any>'AGGREGATIONS',
  // temp, for map chart
  MAP_LAYER0 = <any>'MAP_LAYER0',
  MAP_LAYER1 = <any>'MAP_LAYER1',
  MAP_LAYER2 = <any>'MAP_LAYER2'
}

/**
 * Datasource Field alias
 */
export class FieldAlias extends AbstractHistoryEntity {
  id: number;
  dataSourceId: string;
  dashBoardId: string;
  fieldName: string;
} // class - FieldAlias

/**
 * Datasource Field Name Alias
 */
export class FieldNameAlias extends FieldAlias {
  nameAlias: string;
} // Class - FieldNameAlias

/**
 * Datasource Field Value Alias
 */
export class FieldValueAlias extends FieldAlias {
  valueAlias: Object;
} // Class - FieldValueAlias

/**
 * Temporary Datasource Status
 */
export enum TempDsStatus {
  ENABLE = <any>'ENABLE',
  PREPARING = <any>'PREPARING',
  DISABLE = <any>'DISABLE'
}

export class FieldFormat {
  // default FieldFormatType.DATE_TIME
  type: FieldFormatType;
  unit?: FieldFormatUnit;  // ONLY USE UNIX
  format?: string; // ONLY USE TIME
  timeZone?: string; // ONLY USE TIME (default browser) TODO 추후 서비스 로직에서 default 설정
  locale?: string; // ONLY USE TIME
  originalSrsName?: string; // ONLY GEO
  ////////////////////////////////////////////////////////////////////////////
  // Value to be used only on View
  ////////////////////////////////////////////////////////////////////////////
  isValidTimeFormat?: boolean;
  timeFormatValidMessage?: string;
  // TODO 아래로 통일
  isValidFormat?: boolean;
  formatValidMessage?: string;
  isShowTimestampValidPopup?: boolean;

  formatInitialize() {
    this.format = 'yyyy-MM-dd';
  }

  geoCoordinateInitialize() {
    this.originalSrsName = 'EPSG:4326';
  }

  unitInitialize() {
    this.unit = FieldFormatUnit.MILLISECOND;
  }

  disableTimezone() {
    this.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
  }

  removeDateTypeProperties() {
    delete this.format;
    delete this.locale;
  }

  removeUnixTypeProperties() {
    delete this.unit;
  }

  removeUIProperties() {
    delete this.isValidFormat;
    delete this.formatValidMessage;
    delete this.isShowTimestampValidPopup;
  }

  constructor() {
    this.type = FieldFormatType.DATE_TIME;
    // TODO 타임스탬프 개선시 제거
    this.unit = FieldFormatUnit.MILLISECOND;
  }

  public static of(fieldFormat: FieldFormat) {
    let resultFieldFormat = new FieldFormat();
    resultFieldFormat.type = fieldFormat.type;
    // if not undefined properties
    if (!isNullOrUndefined(fieldFormat.unit)) {
      resultFieldFormat.unit = fieldFormat.unit;
    }
    if (!isNullOrUndefined(fieldFormat.timeZone)) {
      resultFieldFormat.timeZone = fieldFormat.timeZone;
    }
    if (!isNullOrUndefined(fieldFormat.format)) {
      resultFieldFormat.format = fieldFormat.format;
    }
    if (!isNullOrUndefined(fieldFormat.locale)) {
      resultFieldFormat.locale = fieldFormat.locale;
    }
    if (!isNullOrUndefined(fieldFormat.originalSrsName)) {
      resultFieldFormat.originalSrsName = fieldFormat.originalSrsName;
    }
    if (!isNullOrUndefined(fieldFormat.isValidFormat)) {
      resultFieldFormat.isValidFormat = fieldFormat.isValidFormat;
    }
    return resultFieldFormat;
  }
}

export enum FieldFormatType {
  // TIMESTAMP
  DATE_TIME = <any>'time_format',
  UNIX_TIME = <any>'time_unix',
  TEMPORARY_TIME = <any>'time_temporary',
  // GEO type
  GEO_POINT = <any>'geo_point',
  GEO_LINE = <any>'geo_line',
  GEO_POLYGON = <any>'geo_polygon',
}

export enum FieldFormatUnit {
  SECOND = 'SECOND',
  MILLISECOND = 'MILLISECOND'
}

export enum IngestionRuleType {
  DISCARD = <any>'discard',
  REPLACE = <any>'replace',
  // only used in UI
  DEFAULT = <any>'default'
}
