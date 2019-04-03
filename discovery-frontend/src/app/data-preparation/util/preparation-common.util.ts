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

import {FileFormat, ImportType} from '../../domain/data-preparation/pr-dataset';
import { SsType } from '../../domain/data-preparation/pr-snapshot';
import {isNullOrUndefined} from "util";

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
    return moment.utc(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g, ''));
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
    let strFormatVal: string = '';
    if (colDescs) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = PreparationCommonUtil.setTimeStampFormat(value, colDescs.timestampStyle);
      } else if ('ARRAY' === type) {
        // 배열 형식내 각 항목별 타임 스템프 처리
        const arrColDescs = colDescs.arrColDesc ? colDescs.arrColDesc : {};
        strFormatVal = JSON.stringify(
          value.map((item: any, idx: number) => {
            const colDesc = arrColDescs[idx] ? arrColDescs[idx] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              return PreparationCommonUtil.setTimeStampFormat(item, colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = PreparationCommonUtil.setFieldFormatter(item, colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              return ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          })
        );
      } else if ('MAP' === type) {
        // 구조체내 각 항목별 타임 스템프 처리
        const mapColDescs = colDescs.mapColDesc ? colDescs.mapColDesc : {};
        let newMapValue = {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            const colDesc = mapColDescs.hasOwnProperty(key) ? mapColDescs[key] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              newMapValue[key] = PreparationCommonUtil.setTimeStampFormat(value[key], colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = PreparationCommonUtil.setFieldFormatter(value[key], colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              newMapValue[key]
                = ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          }
        }
        strFormatVal = JSON.stringify(newMapValue);
      } else {
        strFormatVal = <string>value;
      }
    } else {
      strFormatVal = <string>value;
    }

    return strFormatVal;
  } // function - _setFieldFormatter


  public static removeQuotation(val : string) : string {
    let result = val;
    if (val.startsWith('\'') && val.endsWith('\'')) {
      result = val.substring(1, val.length - 1);
    }
    return result
  }

  public static getRuleString(targetStr, regex) {


    const gIndex =0;
    let match;
    const resultMap ={};
    let startIndex  = -1;
    let key = '';
    while ( match = regex.exec(targetStr)) {

      if( key !== '' && !resultMap[key] ){
        resultMap[key] = targetStr.substring(startIndex, match['index'] ) ;
      }

      key = match[gIndex];
      startIndex = match['index'] + key.length;
    }

    if( startIndex !== -1 && !resultMap[key]) {

      // let idx = key.indexOf(':');
      // key = key.substring(0,idx).trim();

      resultMap[key] = targetStr.substring(startIndex );
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
          let row = ruleString.split(': ');
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
          result = `Set ${fomatStr} format to ${ rule.format }`;
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

          result = `Change ${columnStr} to ${ rule.type }`;

          break;
        case 'delete':
          const deleteCondition = ruleString.split('row: ');
          result = `Delete rows where ${deleteCondition[1]}`;
          break;
        case 'set':
          let rowString = ruleString.split('value: ');
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
          result += `${rule.before ? ' before ' + rule.before : ' after ' + rule.after }`;
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
            let list = [];
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
    } catch(error) {
      console.info('error -> ', error);
      return undefined;
    }
  }


  /**
   * Returns user friendly snapshot type name
   * FILE -> Local, JDBC -> Database, HIVE -> Staging DB HDFS-> HDFS
   * @param {string} ssType
   * @returns {string}
   */
  public static getSnapshotType(ssType: SsType) : string {
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

  public static getImportType(importType: ImportType) : string {
    let result = null;
    if (importType === ImportType.UPLOAD) {
      result = 'FILE';
    } else if (importType === ImportType.URI) {
      result = 'URI';
    } else if (importType === ImportType.STAGING_DB) {
      result = 'Staging DB';
    } else if (importType === ImportType.DATABASE) {
      result = 'Database';
    } else if (importType === ImportType.DRUID) {
      result = 'Druid';
    }
    return result
  } // user friendly import type name



  /**
   * returns file extension and file name
   * @param {string} fileName
   * @returns {string[]} [filename, extension]
   * @private
   */
  public static getFileNameAndExtension(fileName: string) : string[] {

    const val = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName);

    // returns [fileName,'csv'] if regular expression is error
    if (isNullOrUndefined(val)) {
      return [fileName, 'csv']
    }

    return [val[0].split('.' + val[1])[0],val[1]]

  }


  /**
   * Returns file format (csv, excel, json)
   * @param fileExtension
   */
  public static getFileFormat(fileExtension: string) : FileFormat{
    let fileType : string = fileExtension.toUpperCase();
    if (fileType === 'CSV' || fileType === 'TXT'){
      return FileFormat.CSV;
    } else if (fileType === 'XLSX' || fileType === 'XLS'){
      return FileFormat.EXCEL
    } else if (fileType === 'JSON'){
      return FileFormat.JSON
    } else {
      return null;
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
  public static padLeft(num : number): string {
    let z = '0';
    let n = num + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
  }

  /**
   * Return rows adapt for drawing slick grid
   * @param data
   * @returns {any[]}
   */
  public static getRows(data : any) {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }

}
