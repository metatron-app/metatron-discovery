import {Injectable, Injector} from "@angular/core";
import {FileItem, ParsedResponseHeaders} from "ng2-file-upload";
import { TranslateService } from '@ngx-translate/core';
import {StringUtil} from "../../common/util/string.util";
import {GranularityType} from "../../domain/workbook/configurations/field/timestamp-field";
import {
  ConnectionType, DatasourceInfo,
  DataSourceType,
  Field,
  FieldRole,
  LogicalType,
  SourceType
} from "../../domain/datasource/datasource";
import {PageResult} from "../../domain/common/page";
import {GranularityObject} from "./granularity.service";
import {SsType} from "../../domain/data-preparation/pr-snapshot";

@Injectable()
export class DataSourceCreateService {

  // TODO 데이터소스 개선 할때 사용 (INPUT으로 넣어주고 있던 것을 여기에 넣기)
  public createData: DatasourceInfo;

  private _translateService: TranslateService;

  constructor(injector: Injector) {
    this._translateService = injector.get(TranslateService);
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
   * @return {object}
   */
  public getConvertedPartitionList(partitionList: any): object {
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

  public getSnapshotTypeList(): TypeFilterObject[] {
    return [
      {label: 'All', value: 'ALL'},
      {label: 'File', value: 'URI'},
      {label: 'StagingDB', value: 'STAGING_DB'},
    ];
  }

  public getRoleTypeFilterList(): TypeFilterObject[] {
    return [
      {label: this._translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
      {label: this._translateService.instant('msg.storage.ui.list.dimension'), value: FieldRole.DIMENSION},
      {label: this._translateService.instant('msg.storage.ui.list.measure'), value: FieldRole.MEASURE}
    ];
  }

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
        label: this._translateService.instant('msg.storage.ui.list.geo.line'),
        icon: 'ddp-icon-type-line',
        value: LogicalType.GEO_LINE
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.geo.polygon'),
        icon: 'ddp-icon-type-polygon',
        value: LogicalType.GEO_POLYGON
      },
      {
        label: this._translateService.instant('msg.storage.ui.list.expression'),
        icon: 'ddp-icon-type-expression',
        value: LogicalType.USER_DEFINED
      }
    ];
  }

  public getCreateSourceParams() {

  }
}

export enum ConfigureTimestampType {
  FIELD = <any>'FIELD',
  CURRENT = <any>'CURRENT',
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
  snapshot?: string;
}

export interface CreateSourceIngestionParams {
  type: string;
  paths?: string[];
  findRecursive?: boolean;
  format: any;
  jobProperties?: object;
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
  public selectedSnapshot: any;
  // selected snapshot data
  public selectedSnapshotData: any;
  // search text
  public searchText: string;
  // selected filter
  public selectedSnapshotTypeFilter: TypeFilterObject;
  // page result
  public pageResult: PageResult;
  // sort
  public sort: string = 'createdTime,desc';
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


