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
   * returns file extension and file name
   * @param {string} fileName
   * @returns {string[]} [filename, extension]
   * @private
   */
  public static getFileNameAndExtension(fileName: string) : string[] {

    const val = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName);

    return [val[0].split('.' + val[1])[0],val[1]]

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
