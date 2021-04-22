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

import * as _ from 'lodash';
import {CommonUtil} from '@common/util/common.util';
import {SsType} from '@domain/data-preparation/pr-snapshot';
import {DsType, FileFormat, ImportType, PrDataset} from '@domain/data-preparation/pr-dataset';

declare const moment: any;

export class PreparationCommonUtil {


  /**
   * 문자열에 타임스탬프 포맷을 적용함
   * @param {string} value
   * @param {string} timestampStyle
   * @return {string}
   * @private
   */
  public static setTimeStampFormat(value: string, timestampStyle?: string): string {
    (timestampStyle) || (timestampStyle = 'YYYY-MM-DDTHH:mm:ss');
    let result = moment.utc(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g, ''));
    if (result === 'Invalid date') {
      result = value;
    }
    return result;
  } // function - _setTimeStampFormat


  /**
   * 필드에 대한 형식 지정
   * @param value
   * @param {string} type
   * @param {{timestampStyle: string, arrColDesc: any, mapColDesc: any}} colDescs
   * @returns {string}
   * @private
   */
  public static setFieldFormatter(value: any, type: string,
                                  colDescs: { timestampStyle?: string, arrColDesc?: any, mapColDesc?: any }): string {
    let strFormatVal: string;
    if (colDescs) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = PreparationCommonUtil.setTimeStampFormat(value, colDescs.timestampStyle);
      } else {
        strFormatVal = value as string;
      }
      // ARRAY and MAP are represented as string
    } else {
      strFormatVal = value as string;
    }

    return strFormatVal;
  } // function - _setFieldFormatter


  public static removeQuotation(val: string): string {
    let result = val;
    if (val.startsWith('\'') && val.endsWith('\'')) {
      result = val.substring(1, val.length - 1);
    }
    return result
  }

  public static getRuleString(targetStr, regex) {


    const gIndex = 0;
    let match;
    const resultMap = {};
    let startIndex = -1;
    let key = '';
    // tslint:disable-next-line:no-conditional-assignment
    while (match = regex.exec(targetStr)) {

      if (key !== '' && !resultMap[key]) {
        resultMap[key] = targetStr.substring(startIndex, match['index']);
      }

      key = match[gIndex];
      startIndex = match['index'] + key.length;
    }

    if (startIndex !== -1 && !resultMap[key]) {

      // let idx = key.indexOf(':');
      // key = key.substring(0,idx).trim();

      resultMap[key] = targetStr.substring(startIndex);
    }

    // const resultMap = getRuleString(targetStr, prepRegEx);

    return resultMap;
  }

  /**
   * Simplify Rule List
   * @param rule
   * @param slaveDsMap
   * @param ruleString
   */
  public static simplifyRule(rule: any, slaveDsMap: any, ruleString?: string) {

    let result: string;
    let column: string;

    try {
      if (rule.col) {
        if ('string' === typeof rule.col) {
          column = rule.col;
        } else if ('string' === typeof rule.col.value) {
          column = rule.col.value;
        } else if (rule.col.value.length === 2) {
          column = rule.col.value.join(', ');
        } else {
          column = `${rule.col.value.length} columns`;
        }
      }

      switch (rule.command) {
        case 'create':
          result = `Create with DS ${rule.with}`;
          break;
        case 'header':
          result = `Convert row${rule.rownum} to header`;
          break;
        case 'keep':
          const row = ruleString.split(': ');
          result = `Keep rows where ` + row[1];
          break;
        case 'rename':

          let toString: string = '';
          if ('string' === typeof rule.to.value) {
            toString = ` to '${rule.to['escapedValue']}'`;
          } else if (rule.to.value.length === 2) {
            toString = ` to ${rule.to['value'].join(', ')}`;
          }
          result = `Rename ${column}${toString}`;
          break;
        case 'nest' :
          result = `Convert ${column} into ${rule.into}`;
          break;
        case 'unnest' :
          result = `Create new columns from ${column}`;
          break;
        case 'setformat':
          let fomatStr: string;
          if ('string' === typeof rule.col.value) {
            fomatStr = `${column} type`
          } else if (rule.col.value.length === 2) {
            fomatStr = `${column} types`;
          } else {
            fomatStr = column;
          }
          result = `Set ${fomatStr} format to ${rule.format}`;
          break;
        case 'settype':

          let columnStr: string;
          if ('string' === typeof rule.col.value) {
            columnStr = `${column} type`
          } else if (rule.col.value.length === 2) {
            columnStr = `${column} types`;
          } else {
            columnStr = column;
          }

          result = `Change ${columnStr} to ${rule.type}`;

          break;
        case 'delete':
          const deleteCondition = ruleString.split('row: ');
          result = `Delete rows where ${deleteCondition[1]}`;
          break;
        case 'set':
          const rowString = ruleString.split('value: ');
          result = `Set ${column} to ${rowString[1]}`;
          break;
        case 'split':
          result = `Split ${rule.col} into ${rule.limit + 1 > 1 ? rule.limit + 1 + ' columns' : rule.limit + 1 + ' column'} on ${rule.on.value}`;
          break;
        case 'extract':
          result = `Extract ${rule.on.value} ${rule.limit > 1 ? rule.limit + ' times' : rule.limit + ' time'} from ${rule.col}`;
          break;
        case 'flatten':
          result = `Convert arrays in ${rule.col} to rows`;
          break;
        case 'countpattern':
          result = `Count occurrences of ${rule.on.value} in ${column}`;
          break;
        case 'sort':
          if ('string' === typeof rule.order.value) {
            result = `Sort row by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-' + rule.order.value : rule.order.value}`;
            break;
          } else {
            result = `Sort rows by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-' + rule.order.value.toString() : rule.order.value.toString()}`;
            break;
          }
        case 'replace':
          result = `Replace ${rule.on.value} from `;
          if ('string' === typeof rule.col.value) {
            result += `${rule.col.value} with ${rule.with['value']}`;
          } else if (rule.col.value.length === 2) {
            result += `${rule.col.value.join(', ')} with ${rule.with['value']}`;
          } else {
            result += column;
          }
          break;
        case 'merge':
          result = `Concatenate ${column} separated by ${rule.with}`;
          break;
        case 'aggregate':
          result = `Aggregate with ${rule.value.escapedValue ? rule.value.escapedValue : rule.value.value.length + ' functions'} grouped by `;
          if ('string' === typeof rule.group.value) {
            result += `${rule.group.value}`
          } else if (rule.group.value.length === 2) {
            result += `${rule.group.value.join(', ')}`
          } else {
            result += `${rule.group.value.length} columns`
          }
          break;
        case 'move':
          result = `Move ${column}`;
          result += `${rule.before ? ' before ' + rule.before : ' after ' + rule.after}`;
          break;
        case 'union':
        case 'join':
          result = `${rule.command} with `;

          let datasetIds = [];
          if (rule.dataset2.escapedValue) {
            datasetIds = [rule.dataset2.escapedValue]
          } else {
            rule.dataset2.value.forEach((item) => {
              datasetIds.push(item.substring(1, item.length - 1))
            })
          }

          if (datasetIds.length === 1) {
            result += `${slaveDsMap[datasetIds[0]]}`;
          } else if (datasetIds.length === 2) {
            result += `${slaveDsMap[datasetIds[0]]}, ${slaveDsMap[datasetIds[1]]}`;
          } else {
            result += `${datasetIds.length} datasets`;
          }

          break;
        case 'derive':
          let deriveCondition = ruleString.split('value: ');
          deriveCondition = deriveCondition[1].split(' as: ');
          result = `Create ${rule.as} from ${deriveCondition[0]}`;
          break;
        case 'pivot':
          let formula = '';
          if (rule.value.escapedValue) {
            formula = rule.value.escapedValue
          } else {
            const list = [];
            rule.value.value.forEach((item) => {
              list.push(item.substring(1, item.length - 1));
            });
            formula = list.toString();
          }
          result = `Pivot ${column} and compute ${formula} grouped by`;

          if ('string' === typeof rule.group.value || rule.group.value.length === 2) {
            result += ` ${rule.group.value}`;
          } else {
            result += ` ${rule.group.value.length} columns`;
          }
          break;
        case 'unpivot':
          result = `Convert `;
          if ('string' === typeof rule.col.value) {
            result += `${rule.col.value} into row`;
          } else if (rule.col.value.length > 1) {
            result += `${column} into rows`;
          }
          break;
        case 'drop':
          result = `Drop ${column}`;
          break;
        default:
          result = '';
          break;

      }
      return result;
    } catch (error) {
      console.log('error -> ', error);
      return undefined;
    }
  }


  /**
   * Returns user friendly snapshot type name
   * FILE -> Local, JDBC -> Database, HIVE -> Staging DB HDFS-> HDFS
   * @param {string} ssType
   * @returns {string}
   */
  public static getSnapshotType(ssType: SsType): string {
    let result = null;
    if (ssType === SsType.URI) {
      result = 'FILE';
    } else if (ssType === SsType.STAGING_DB) {
      result = 'Staging DB';
    } else if (ssType === SsType.DATABASE) {
      result = 'Database';
    } else if (ssType === SsType.DRUID) {
      result = 'Druid';
    }
    return result
  } // user friendly snapshot type name

  public static getImportType(importType: ImportType): string {
    let result = null;
    if (importType === ImportType.UPLOAD) {
      result = 'FILE';
    } else if (importType === ImportType.URI) {
      result = 'URI';
    } else if (importType === ImportType.STAGING_DB) {
      result = 'STAGING_DB';
    } else if (importType === ImportType.DATABASE) {
      result = 'DB';
    } else if (importType === ImportType.DRUID) {
      result = 'DRUID';
    }
    return result
  } // user friendly import type name


  /**
   * returns file extension for snapshot
   * @param {string} fileName
   * @returns {string} extension
   * @private
   */
  public static getExtensionForSnapshot(fileName: string): string {

    const val = new RegExp(/^.*\.(csv|sql|txt|json)$/).exec(fileName);

    if (CommonUtil.isNullOrUndefined(val)) {
      return 'csv';
    }

    return val[1];

  }


  /**
   * returns file extension and file name
   * @param {string} fileName
   * @returns {string[]} [filename, extension]
   * @private
   */
  public static getFileNameAndExtension(fileName: string): string[] {

    const val = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName);

    // returns [fileName,'csv'] if regular expression is error
    if (CommonUtil.isNullOrUndefined(val)) {
      return [fileName, 'csv']
    }

    return [val[0].split('.' + val[1])[0], val[1]]

  }


  /**
   * Returns file format (csv, excel, json)
   * @param fileExtension
   */
  public static getFileFormat(fileExtension: string): FileFormat {
    const fileType: string = fileExtension.toUpperCase();

    const formats = [
      {extension: 'CSV', fileFormat: FileFormat.CSV},
      {extension: 'TXT', fileFormat: FileFormat.TXT},
      {extension: 'JSON', fileFormat: FileFormat.JSON},
      {extension: 'XLSX', fileFormat: FileFormat.EXCEL},
      {extension: 'XLS', fileFormat: FileFormat.EXCEL},
    ];

    const idx = _.findIndex(formats, {extension: fileType});

    if (idx !== -1) {
      return formats[idx].fileFormat
    } else {
      return formats[0].fileFormat
    }
  }

  /**
   * Returns icon class
   * @param type
   */
  public static getIconClass(type): string {
    let result = '';
    switch (type.toLowerCase()) {
      case 'dataset':
        result = 'ddp-icon-flow-dataset';
        break;
      case 'wrangled':
        result = 'ddp-icon-flow-wrangled';
        break;
      case 'db':
        result = 'ddp-icon-flow-db';
        break;
      case 'mysql':
        result = 'ddp-icon-flow-mysql';
        break;
      case 'post':
        result = 'ddp-icon-flow-post';
        break;
      case 'hive':
        result = 'ddp-icon-flow-db';
        break;
      case 'presto':
        result = 'ddp-icon-flow-presto';
        break;
      case 'phoenix':
        result = 'ddp-icon-flow-phoenix';
        break;
      case 'tibero':
        result = 'ddp-icon-flow-tibero';
        break;
      case 'file':
        result = 'ddp-icon-flow-file';
        break;
      case 'xls':
        result = 'ddp-icon-flow-xls';
        break;
      case 'xlsx':
        result = 'ddp-icon-flow-xlsx';
        break;
      case 'csv':
        result = 'ddp-icon-flow-csv';
        break;
      default:
        break;
    }
    return result;
  }


  /**
   * Formatting number to 2 whole number digit
   * 1 -> 01
   * @param num {number}
   */
  public static padLeft(num: number): string {
    const z = '0';
    const n = num + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
  }

  /**
   * Return rows adapt for drawing slick grid
   * @param data
   * @returns {any[]}
   */
  public static getRows(data: any) {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }

  /**
   * Return a modified icon title
   * @param data
   * @param length(Optional): set number of words appeared per line
   * @param steps(Optional): set number of lines appeared per icon
   * @returns any
   */
  public static parseChartName(data: any, length?: any, steps?: any) {

    if (data !== null && data !== undefined) {
      length = length ? length : 20; // default value of 20, appearing twenty words per line
      steps = steps ? steps : 2; // default value of 2, appearing two lines per icon

      if (data.length < length) {
        return data;
      } else { // parse icon name
        let temp = '';
        let index = 0;

        for (let i = 0; i < steps; i = i + 1) {
          if (index > data.length) {
            temp = temp + data.substring(index);
            break;
          }
          temp = temp + data.substring(index, index + length);

          if (i + 1 === steps) {
            const isFinalLine = (index + length) < data.length;
            temp = isFinalLine ? temp.substring(0, index + length - 3) + ' ...' : temp;
            break;
          }

          temp = temp + '\n';
          index = index + length;
        }
        return temp;
      }
    } else {
      return '';
    }
  }

  /**
   * Return a modified tooltip info
   * @param data
   * @param length(Optional): set maximum number of words each line
   * @returns any
   */
  public static parseTooltip(data: any, length?: any) {

    if (data !== null && data !== undefined) {
      length = length ? length : 20; // default at 20, twenty words each line
      const steps = Math.ceil(data.length / length);
      if (data.length < length) {
        return data;
      } else { // parse tooltip info
        let temp = '';
        let index = 0;

        for (let i = 0; i < steps; i = i + 1) {
          if (index > data.length || i + 1 === steps) {
            temp = temp + data.substring(index);
            break;
          }
          temp = temp + data.substring(index, index + length);
          temp = temp + '</br>';
          index = index + length;
        }
        return temp;
      }
    } else {
      return '';
    }
  }


  /**
   * Returns appropriate file format for each extension
   * Extensions : CSV, TXT, JSON, XLSX, XLS
   * @param fileExtension {string}
   * @returns {FileFormat}
   * @private
   */
  public static getFileFormatWithExtension(fileExtension: string) {
    const fileType: string = fileExtension.toUpperCase();

    const formats = [
      {extension: 'CSV', fileFormat: FileFormat.CSV},
      {extension: 'TXT', fileFormat: FileFormat.TXT},
      {extension: 'JSON', fileFormat: FileFormat.JSON},
      {extension: 'XLSX', fileFormat: FileFormat.EXCEL},
      {extension: 'XLS', fileFormat: FileFormat.EXCEL},
    ];

    const idx = _.findIndex(formats, {extension: fileType});

    if (idx !== -1) {
      return formats[idx].fileFormat
    } else {
      return formats[0].fileFormat
    }
  }


  /**
   * Find name to get svg icon
   * HIVE, MYSQL, POSTGRESQL, PRESTO, TIBERO, ORACLE
   * EXCEL, CSV, JSON, TXT
   * @param {PrDataset} ds
   * @returns {string}
   */
  public static getNameForSvgWithDataset(ds: PrDataset) {

    let name = '';
    if (ds.importType === ImportType.UPLOAD || ds.importType === ImportType.URI) {
      name = this.getFileFormatWithExtension(this.getFileNameAndExtension(ds.filenameBeforeUpload)[1]).toString();
    } else if (ds.importType === ImportType.DATABASE) {
      name = ds['dcImplementor'];
    } else if (ds.importType === ImportType.STAGING_DB) {
      return 'HIVE'
    } else if (ds.importType === ImportType.DRUID) {
      name = 'DRUID'
    } else if (ds.dsType === DsType.WRANGLED) {
      name = 'WRANGLED';
    }
    return name;
  }


  /**
   * There are different ways to show type of dataset
   * Database ==> DB(MYSQL) etc
   * STAGING  ==> STAGING_DB
   * FILE     ==> FILE(EXCEL)
   * URI      ==> URI(EXCEL)
   * @param dataset
   */
  public static getDatasetType(dataset: PrDataset) {

    let result: any = '';
    const iType: string = this.getImportType(dataset.importType);

    if ('FILE' === iType || 'URI' === iType) {
      const ext = this.getFileNameAndExtension(dataset.filenameBeforeUpload)[1];
      result = `(${this.getFileFormatWithExtension(ext)})`
    } else if ('DB' === iType) {
      result = `(${dataset['dcImplementor']})`;
    }
    return `${iType}${result}`
  }
}
