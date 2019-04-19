import {Injectable, Injector} from "@angular/core";
import {FileItem, ParsedResponseHeaders} from "ng2-file-upload";
import {TranslateService} from '@ngx-translate/core';
import {StringUtil} from "../../common/util/string.util";
import {GranularityType} from "../../domain/workbook/configurations/field/timestamp-field";
import {
  ConnectionType,
  DatasourceInfo,
  DataSourceType,
  Field,
  FieldFormatType,
  FieldRole,
  IngestionRuleType,
  LogicalType,
  SourceType
} from "../../domain/datasource/datasource";
import {PageResult} from "../../domain/common/page";
import {GranularityObject, GranularityService} from "./granularity.service";
import {HiveFileFormat, PrDataSnapshot, SsType} from "../../domain/data-preparation/pr-snapshot";
import * as _ from "lodash";
import {CommonConstant} from "../../common/constant/common.constant";
import {ConnectionParam} from "./data-connection-create.service";

@Injectable()
export class DataSourceCreateService {

  // TODO 데이터소스 개선 할때 사용 (INPUT으로 넣어주고 있던 것을 여기에 넣기)
  public createData: DatasourceInfo;

  private _translateService: TranslateService;

  private _granularityService: GranularityService;

  constructor(injector: Injector) {
    this._translateService = injector.get(TranslateService);
    this._granularityService = injector.get(GranularityService);
  }

  /**
   * Get convert sheets
   * @param {object} sheets
   * @return {Sheet[]}
   */
  public getConvertSheets(sheets: object): Sheet[] {
    return Object.keys(sheets).map(key => {
      return sheets[key].valid ? {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning} : {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning, errorMessage: this.getFileErrorMessage(sheets[key].warning)};
    });
  }

  /**
   * Get file error message
   * @param {string} errorCode
   * @return {string}
   */
  public getFileErrorMessage(errorCode: string): string {
    return this._translateService.instant(`msg.storage.ui.file.result.${errorCode}`);
  }

  /**
   * Get converted partition list
   * @param partitionList
   * @return {any[]}
   */
  public getConvertedPartitionList(partitionList: any): any[] {
    // result
    const result = [];
    // loop
    for (let i = 0; i < partitionList.length; i++) {
      // partition keys
      const partitionKeys = partitionList[i];
      // partition
      const partition = {};
      // loop
      for (let j = 0; j < partitionKeys.length; j++) {
        // #619 enable empty value
        // is value empty break for loop
        // if (StringUtil.isEmpty(partitionKeys[j].value)) {
        //   break;
        // }
        // add partition #619 enable empty value
        partition[partitionKeys[j].name] = (partitionKeys[j].value || '');
      }
      // if exist partition, add in result
      if (Object.keys(partition).length) {
        result.push(partition);
      }
    }
    return result;
  }

  /**
   * Get partition label
   * @param {any[]} convertedPartitionList
   * @return {string}
   */
  public getPartitionLabel(convertedPartitionList: any[]): string {
    // if exist partition keys in ingestion data
    if (convertedPartitionList && convertedPartitionList.length !== 0) {
      return convertedPartitionList.reduce((acc, partition) => {
        acc += acc === ''
          ? Object.keys(partition).reduce((line, key) => {
            StringUtil.isNotEmpty(partition[key]) && (line += line === '' ? `${key}=${partition[key]}` : `/${key}=${partition[key]}`);
            return line;
          }, '')
          : '<br>' + Object.keys(partition).reduce((line, key) => {
          StringUtil.isNotEmpty(partition[key]) && (line += line === '' ? `${key}=${partition[key]}` : `/${key}=${partition[key]}`);
          return line;
        }, '');
        return acc;
      }, '');
    } else { // if not exist partition keys
      return this._translateService.instant('msg.storage.ui.set.false');
    }
  }

  /**
   * Get snapshot type filter list
   * @return {TypeFilterObject[]}
   */
  public getSnapshotTypeList(): TypeFilterObject[] {
    return [
      {label: this._translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
      {label: this._translateService.instant('msg.dp.ui.list.file'), value: 'URI'},
      {label: this._translateService.instant('msg.dp.ui.list.staging-db'), value: 'STAGING_DB'},
    ];
  }

  /**
   * Get role type filter list
   * @return {TypeFilterObject[]}
   */
  public getRoleTypeFilterList(): TypeFilterObject[] {
    return [
      {label: this._translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
      {label: this._translateService.instant('msg.storage.ui.list.dimension'), value: FieldRole.DIMENSION},
      {label: this._translateService.instant('msg.storage.ui.list.measure'), value: FieldRole.MEASURE}
    ];
  }

  /**
   * Get logical type filter list
   * @return {TypeFilterObject[]}
   */
  public getLogicalTypeFilterList(): TypeFilterObject[] {
    return [
      {label: this._translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
      {
        label: this._translateService.instant('msg.storage.ui.list.string'),
        icon: 'ddp-icon-type-ab',
        value: LogicalType.STRING
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.boolean'),
        icon: 'ddp-icon-type-tf',
        value: LogicalType.BOOLEAN
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.integer'),
        icon: 'ddp-icon-type-int',
        value: LogicalType.INTEGER
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.double'),
        icon: 'ddp-icon-type-float',
        value: LogicalType.DOUBLE
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.date'),
        icon: 'ddp-icon-type-calen',
        value: LogicalType.TIMESTAMP
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.lnt'),
        icon: 'ddp-icon-type-latitude',
        value: LogicalType.LNT
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.lng'),
        icon: 'ddp-icon-type-longitude',
        value: LogicalType.LNG
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.geo.point'),
        icon: 'ddp-icon-type-point',
        value: LogicalType.GEO_POINT
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.geo.polygon'),
        icon: 'ddp-icon-type-polygon',
        value: LogicalType.GEO_POLYGON
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.geo.line'),
        icon: 'ddp-icon-type-line',
        value: LogicalType.GEO_LINE
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.expression'),
        icon: 'ddp-icon-type-expression',
        value: LogicalType.USER_DEFINED
      }
    ];
  }

  /**
   * Create source params
   * @param {DatasourceInfo} sourceInfo
   * @return {CreateSourceParams}
   */
  public getCreateSourceParams(sourceInfo: DatasourceInfo): CreateSourceParams {
    const result: CreateSourceParams = {
      name: sourceInfo.completeData.sourceName.trim(),
      description: StringUtil.isEmpty(sourceInfo.completeData.sourceDescription) ? '' : sourceInfo.completeData.sourceDescription,
      granularity: sourceInfo.ingestionData.selectedQueryGranularity.value,
      segGranularity: sourceInfo.ingestionData.selectedSegmentGranularity.value,
      dsType: sourceInfo.dsType,
      srcType: sourceInfo.type,
      connType: sourceInfo.connType,
      fields: this._getFieldParams(sourceInfo.schemaData),
      ingestion: this.getIngestionParams(sourceInfo)
    };
    // if snapshot type
    if (sourceInfo.type === SourceType.SNAPSHOT) {
      result.snapshot = `/api/preparationsnapshots/${sourceInfo.snapshotData.selectedSnapshot.ssId}`;
    }
    // if db type, is enable connection preset
    if (sourceInfo.type === SourceType.JDBC && !sourceInfo.connectionData.selectedConnectionPreset.default) {
      result.connection = `/api/connections/${sourceInfo.connectionData.selectedConnectionPreset.id}`;
    }
    return result;
  }

  /**
   * Get ingestion params
   * @param {DatasourceInfo} sourceInfo
   * @return {CreateSourceIngestionParams}
   */
  public getIngestionParams(sourceInfo: DatasourceInfo): CreateSourceIngestionParams {
    const result: CreateSourceIngestionParams = {
      type: undefined,
      rollup: sourceInfo.ingestionData.selectedRollUpType.value
    };
    // if exist tuning options
    sourceInfo.ingestionData.tuningConfig.some(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)) && (result.tuningOptions = this._toObject(sourceInfo.ingestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value))));
    // if not used current_time TIMESTAMP, set intervals
    if (sourceInfo.schemaData.selectedTimestampType !== ConfigureTimestampType.CURRENT_TIME) {
      result.intervals =  [this._granularityService.getIntervalUsedParam(sourceInfo.ingestionData.startIntervalText, sourceInfo.ingestionData.selectedSegmentGranularity) + '/' + this._granularityService.getIntervalUsedParam(sourceInfo.ingestionData.endIntervalText, sourceInfo.ingestionData.selectedSegmentGranularity)];
    }
    // DB
    if (sourceInfo.type === SourceType.JDBC) {
    } else if (sourceInfo.type === SourceType.FILE) { // File
    } else if (sourceInfo.type === SourceType.HIVE) { // StagingDB
      this._setStagingIngestionParams(result, sourceInfo);
    } else if (sourceInfo.type === SourceType.SNAPSHOT) { // Snapshot
      this._setSnapshotIngestionParams(result, sourceInfo);
    }
    return result;
  }

  /**
   * Is CSV file string
   * @param {string} uri
   * @return {boolean}
   * @private
   */
  private _isCsvFile(uri: string): boolean {
    return !!uri.match(/.csv$/);
  }

  /**
   * Set file ingestion params
   * @param {CreateSourceIngestionParams} result
   * @param {DatasourceInfo} sourceInfo
   * @private
   */
  private _setFileIngestionParams(result: CreateSourceIngestionParams, sourceInfo: DatasourceInfo): void {
    result.type = 'local';
    result.removeFirstRow = sourceInfo.fileData.isFirstHeaderRow;
    result.path = sourceInfo.fileData.fileResult.filePath;
    const isExcelType: boolean = sourceInfo.fileData.fileResult.sheets && sourceInfo.fileData.fileResult.sheets.length !== 0;
    result.format = {
      type: isExcelType ? 'excel' : 'csv'
    };
    if (isExcelType) {
      result.format.delimiter = sourceInfo.fileData.delimiter;
      result.format.lineSeparator = sourceInfo.fileData.separator;
    } else {
      result.format.sheetIndex = sourceInfo.fileData.fileResult.sheets.findIndex(sheet => sheet === sourceInfo.fileData.fileResult.selectedSheet);
    }
  }

  /**
   * Set staging ingestion params
   * @param {CreateSourceIngestionParams} result
   * @param {DatasourceInfo} sourceInfo
   * @private
   */
  private _setStagingIngestionParams(result: CreateSourceIngestionParams, sourceInfo: DatasourceInfo): void {
    result.type = 'hive';
    result.format = _.cloneDeep(sourceInfo.databaseData.selectedTableDetail.fileFormat);
    result.source = sourceInfo.databaseData.selectedDatabase + '.' + sourceInfo.databaseData.selectedTable;
    result.partitions = sourceInfo.ingestionData.selectedPartitionType.value === 'ENABLE' ? this.getConvertedPartitionList(sourceInfo.ingestionData.partitionKeyList) : [];
    sourceInfo.ingestionData.jobProperties.some(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)) && (result.jobProperties = this._toObject(sourceInfo.ingestionData.jobProperties.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value))));
    sourceInfo.databaseData.selectedTableDetail.fileFormat.type === 'CSV' && (result.format.lineSeparator = '\n');
  }

  /**
   * Set snapshot ingestion params
   * @param {CreateSourceIngestionParams} result
   * @param {DatasourceInfo} sourceInfo
   * @private
   */
  private _setSnapshotIngestionParams(result: CreateSourceIngestionParams, sourceInfo: DatasourceInfo): void {
    result.format = {type: undefined};
    // if StagingDB
    if (!sourceInfo.snapshotData.selectedSnapshot.storedUri) {
      result.type = 'hive';
      sourceInfo.ingestionData.jobProperties.some(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)) && (result.jobProperties = this._toObject(sourceInfo.ingestionData.jobProperties.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value))));
      result.partitions = sourceInfo.ingestionData.selectedPartitionType.value === 'ENABLE' ? this.getConvertedPartitionList(sourceInfo.ingestionData.partitionKeyList) : [];
      result.format.type = sourceInfo.snapshotData.selectedSnapshot.hiveFileFormat === HiveFileFormat.CSV ? 'csv' : 'orc';
      result.source = `${sourceInfo.snapshotData.selectedSnapshot.dbName}.${sourceInfo.snapshotData.selectedSnapshot.tblName}`;
    } else if (sourceInfo.snapshotData.selectedSnapshot.storedUri.match(/^file:/)) {  // if File file
      result.type = 'local';
      result.path = sourceInfo.snapshotData.selectedSnapshot.storedUri;
      // if CSV file
      if (this._isCsvFile(sourceInfo.snapshotData.selectedSnapshot.storedUri)) {
        result.removeFirstRow = true;
        result.format.type = 'csv';
      } else {  // if JSON file
        result.format.type = 'json';
      }
    } else if (sourceInfo.snapshotData.selectedSnapshot.storedUri.match(/^hdfs:/)) { // if HDFS type
      result.type = 'hdfs';
      result.findRecursive = false;
      result.paths = [sourceInfo.snapshotData.selectedSnapshot.storedUri];
      // if CSV file
      if (this._isCsvFile(sourceInfo.snapshotData.selectedSnapshot.storedUri)) {
        result.removeFirstRow = true;
        result.format.type = 'csv';
      } else {  // if JSON file
        result.format.type = 'json';
      }
    }
  }

  /**
   * Get field params
   * @param schemaData
   * @return {Field[]}
   * @private
   */
  private _getFieldParams(schemaData: any): Field[] {
    // timestamp enable
    const isCreateTimestamp = schemaData.selectedTimestampType === ConfigureTimestampType.CURRENT_TIME;
    // fields param clone
    let fields = _.cloneDeep(schemaData._originFieldList);
    // seq number
    let seq = 0;
    // field 설정
    fields.forEach((field: Field) => {
      // set seq num and increase seq
      field['seq'] = seq++;
      // if you don't want to create a timestamp column
      if (!isCreateTimestamp && field.logicalType === LogicalType.TIMESTAMP && field.name === schemaData.selectedTimestampField.name) {
        field.role = FieldRole.TIMESTAMP;
      }
      // remove unnecessary property
      this._removeUnnecessaryPropertyInField(field);
    });
    // if no column is specified as timestamp
    if (isCreateTimestamp) {
      fields.push(this._createCurrentField(seq));
    }
    return fields;
  }

  /**
   * Create current column
   * @param {number} seq
   * @returns {Object}
   * @private
   */
  private _createCurrentField(seq: number): object {
    return {
      seq: seq,
      name: CommonConstant.COL_NAME_CURRENT_DATETIME,
      type: LogicalType.TIMESTAMP,
      role: FieldRole.TIMESTAMP,
      derived: true,
      format: {
        type: FieldFormatType.TEMPORARY_TIME,
        format: 'yyyy-MM-dd HH:mm:ss'
      }
    };
  }

  /**
   * Remove unnecessary property in field
   * @param {Field} field
   * @private
   */
  private _removeUnnecessaryPropertyInField(field: Field) {
    delete field['biType'];
    // delete used UI
    delete field.isValidTimeFormat;
    delete field.isValidReplaceValue;
    delete field.replaceValidMessage;
    delete field.timeFormatValidMessage;
    delete field.checked;
    // if unloaded property is false, delete unloaded property
    if (field.unloaded === false) {
      delete field.unloaded;
    }
    // if exist ingestion rule property
    if (field.hasOwnProperty('ingestionRule')) {
      // ingestion type
      const type = field.ingestionRule.type;
      // if type is default
      if (type === IngestionRuleType.DEFAULT) {
        delete field.ingestionRule;
      } else if (type === IngestionRuleType.DISCARD) {
        delete field.ingestionRule.value;
      }
    }
    // if not GEO types
    if (field.logicalType.toString().indexOf('GEO_') === -1) {
      if (field.logicalType !== LogicalType.TIMESTAMP && field.format) {
        delete field.format;
      } else if (field.logicalType === LogicalType.TIMESTAMP && field.format.type === FieldFormatType.UNIX_TIME) {
        // remove format
        delete field.format.format;
        // remove timezone
        delete field.format.timeZone;
        delete field.format.locale;
      } else if (field.logicalType === LogicalType.TIMESTAMP && field.format.type === FieldFormatType.DATE_TIME) {
        delete field.format.unit;
      }
    }
  }

  /**
   * Convert array to object
   * @param array
   * @returns {Object}
   * @private
   */
  private _toObject(array: any): object {
    return array.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }

}

export enum ConfigureTimestampType {
  CURRENT_TIME = 'CURRENT',
  TIMESTAMP_FIELD = 'FIELD'
}

// 타입 셀렉트 필터
export interface TypeFilterObject {
  label: string;
  value: string | LogicalType | FieldRole | SsType;
  icon?: string;
}

export interface FileResult {
  filePath: string;
  fileKey: string;
  fileSize: string;
  fileName: string;
  sheets?: Sheet[];
  selectedSheet?: Sheet;
}

export interface Sheet {
  sheetName: string;
  valid: boolean;
  warning?: string;
  errorMessage?: string;
}

export interface UploadResult {
  success: boolean;
  item: FileItem;
  response: any;
  status: number;
  headers: ParsedResponseHeaders;
}

export interface FileDetail {
  data: any[];
  fields: any[];
  headers?: any[];
  success?: boolean;
  totalRows?: number;
  isParsable: {valid: boolean, warning?: string};
  errorMessage?: string;
}

export interface QueryDataResult {
  // result info
  data?: any[];
  fields?: any[];
  totalRows?: number;
  // error info
  code?: string;
  details?: string;
  message?: string;
}

export interface CreateSourceParams {
  name: string;
  description?: string;
  dsType: DataSourceType;
  connType: ConnectionType;
  srcType: SourceType;
  granularity: GranularityType;
  segGranularity: GranularityType;
  fields: Field[];
  ingestion: CreateSourceIngestionParams;
  // only SNAPSHOT
  snapshot?: string;
  // only DB
  connection?: string;
}

export interface CreateSourceIngestionParams {
  type: string;
  rollup: boolean;
  intervals?: string[];
  tuningOptions?: object;
  // DB
  query?: string;
  database?: string;
  expired?: number;
  period?: {frequency: string, time?: number, weekDays?: string[], value?: number};
  maxLimit?: number;
  range?: number;
  scope?: any;  //TODO
  connection?: any;  //TODO
  connectionUsername?: string;
  connectionPassword?: string;
  // file
  removeFirstRow?: boolean;
  path?: string;
  // snapshot
  findRecursive?: boolean;
  // staging
  source?: string;
  jobProperties?: object;
  partitions?: any[];
  paths?: string[];
  format?: {type: string, delimiter?: string, lineSeparator?: string, sheetIndex?: number};
}

export interface CreateConnectionData {
  connectionPresetList;
  selectedConnectionPreset;
  selectedIngestionType;
  pageResult?: PageResult;
  connection: ConnectionParam;
}

// create data source stagingDB select step data
class CreateStagingDbData {

}

// create data source file select step data
class CreateFileData {

}

// create data source DB select step data
class CreateDatabaseData {

}

// create data source snapshot select step data
export class CreateSnapShotData {
  // snapshot list
  public snapshotList: any[];
  // selected snapshot
  public selectedSnapshot: PrDataSnapshot;
  // search text
  public searchText: string;
  // selected filter
  public selectedSnapshotTypeFilter: TypeFilterObject;
  // page result
  public pageResult: PageResult;
  // sort
  public sort: string = 'createdTime,desc';
  // error snapshot id
  public errorSnapshotIdList: string[] = [];
}

// create data source configure step data
export class CreateSourceConfigureData {
  // origin field & data list
  public _originFieldList: Field[];
  public _originFieldData: any;
  // filtered field list
  public filteredFieldList: Field[];
  // timestamp field list
  public timestampFieldList: Field[];
  // selected field
  public selectedField: Field;
  // selected data list in field
  public selectedFieldDataList: any;
  // selected timestamp field
  public selectedTimestampField: Field;
  // selected timestamp Type
  public selectedTimestampType: ConfigureTimestampType;
  // search text
  public searchText: string;
  // selected filter type
  public selectedLogicalTypeFilter: TypeFilterObject ;
  public selectedRoleTypeFilter: TypeFilterObject;
  // field data list in timestamp field
  public timestampFieldData: any;
  // selected action
  public selectedAction: {selectedType: string, selectedRoleType: TypeFilterObject, selectedLogicalType: TypeFilterObject};
}

// create data source ingestion step data
export class CreateSourceIngestionData {
  // common
  // query granularity list
  public queryGranularityList: GranularityObject[];
  // save selected segment granularity
  public selectedSegmentGranularity: GranularityObject;
  // save query granularity
  public selectedQueryGranularity: GranularityObject;
  // save selected rollup type
  public selectedRollUpType: any;
  // save tuning configuration
  public tuningConfig: any[];
  // isShowAdvancedSetting
  public isShowAdvancedSetting: boolean;
  // interval text
  public startIntervalText: string;
  public endIntervalText: string;
  // interval valid message
  public intervalValidMessage: string;
  // interval valid
  public intervalValid: boolean;
  // granularity unit
  public granularityUnit: number;
}

// create data source complete step data
export class CreateSourceCompleteData {
  // source name
  public sourceName: string;
  // source description
  public sourceDescription: string;
  // valid
  public isInvalidName: boolean;
  public isInvalidDesc: boolean;
  // valid message
  public nameInvalidMessage: string;
  public descInvalidMessage: string;
}


