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

import {AbstractService} from "../../common/service/abstract.service";
import {Injectable, Injector} from "@angular/core";
import {Field, FieldFormat, FieldFormatType, LogicalType} from "../../domain/datasource/datasource";
import {TimezoneService} from "./timezone.service";
import {TranslateService} from "@ngx-translate/core";
import {StringUtil} from "../../common/util/string.util";
import {isNullOrUndefined} from "util";
import {Type} from '../../shared/datasource-metadata/domain/type';
import {MetadataColumn} from "../../domain/meta-data-management/metadata-column";

@Injectable()
export class FieldConfigService extends AbstractService {

  private _timezoneSvc: TimezoneService;
  private _translateSvc: TranslateService;

  constructor(protected injector: Injector) {
    super(injector);
    this._timezoneSvc = this.injector.get(TimezoneService);
    this._translateSvc = this.injector.get(TranslateService);
  }

  /**
   * Get field data list
   * @param {Field} targetField
   * @param {any[]} originDataList
   * @return {string[]}
   */
  public getFieldDataList(targetField: Field | MetadataColumn, originDataList: any[]): string[] {
    return originDataList.reduce((acc, data) => {
      !isNullOrUndefined(data[targetField.name]) && acc.push(data[targetField.name]);
      return acc;
    }, []);
  }

  /**
   * Check enable geo type and set validation result
   * @param {FieldFormat} fieldFormat
   * @param {string[]} dataList
   * @param {Type.Logical} targetType
   * @return {Promise<any>}
   */
  public checkEnableGeoTypeAndSetValidationResult(fieldFormat: FieldFormat, dataList: string[], targetType: Type.Logical) {
    return new Promise((resolve, reject) => {
      // if not exist data list
      if (isNullOrUndefined(dataList) || dataList.length < 1) {
        // set type valid FALSE
        fieldFormat.isValidFormat = false;
        // set type valid message
        fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.valid.geo.format.no.data');
        resolve(fieldFormat);
      } else {
        const params = {
          geoType: targetType,
          values: dataList.slice(0, 19).map(data => `${this._getKeywordWKT(targetType)} (${data.replace(/,/, ' ')})`)
        };
        // api result
        this.post(this.API_URL + 'datasources/validation/wkt', params)
          .then((result: {valid: boolean, suggestType: LogicalType, message: string}) => {
            // is enable GEO type
            if (result.valid) {
              fieldFormat.isValidFormat = true;
              // if not exist srs name
              if (isNullOrUndefined(fieldFormat.originalSrsName)) {
                fieldFormat.geoCoordinateInitialize();
                fieldFormat.type = this._getSrsName(targetType);
              }
            } else {  // is disable GEO type
              fieldFormat.isValidFormat = false;
              // set type valid message
              fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.valid.geo.format.error');
            }
            resolve(fieldFormat);
          })
          .catch((error) => {
            fieldFormat.isValidFormat = false;
            // set type valid message
            fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.valid.geo.format.error');
            reject(error);
          });
      }
    });
  }

  /**
   * Check enable geo type and set validation result
   * @param {Field} targetField
   * @param {string[]} fieldDataList
   * @return {Promise<any>}
   */
  // public checkEnableGeoTypeAndSetValidationResult(targetField: Field, fieldDataList: string[]): Promise<any> {
  //   return new Promise<any>((resolve, reject) => {
  //     // if not exist field data list
  //     if (fieldDataList.length < 1) {
  //       // set type valid FALSE
  //       targetField.isValidType = false;
  //       // set type valid message
  //       targetField.typeValidMessage = this._translateSvc.instant('msg.storage.ui.schema.column.no.data');
  //       resolve(targetField);
  //     } else {
  //       const wktKeyword = this._getKeywordWKT(targetField);
  //       const params = {
  //         geoType: targetField.logicalType,
  //         values: fieldDataList.slice(0, 19).map(data => `${wktKeyword} (${data.replace(/,/, ' ')})`)
  //       };
  //       // api result
  //       this.post(this.API_URL + 'datasources/validation/wkt', params)
  //         .then((result: {valid: boolean, suggestType: LogicalType, message: string}) => {
  //           // is enable GEO type
  //           if (result.valid) {
  //             targetField.isValidType = true;
  //           } else {  // is disable GEO type
  //             targetField.isValidType = false;
  //           }
  //           resolve(targetField);
  //         })
  //         .catch((error) => {
  //           targetField.isValidType = false;
  //           reject(error);
  //         });
  //     }
  //   });
  // }

  /**
   * Get keyword WKT
   * @param {LogicalType} type
   * @return {any}
   * @private
   */
  private _getKeywordWKT(type: Type.Logical) {
    if (type === Type.Logical.GEO_POINT) {
      return Type.WKT.POINT;
    } else if (type === Type.Logical.GEO_LINE) {
      return Type.WKT.LINESTRING;
    } else if (type === Type.Logical.GEO_POLYGON) {
      return Type.WKT.POLYGON;
    }
  }

  /**
   * Get geo coordinate
   * @param {Type.Logical} type
   * @return {any}
   * @private
   */
  private _getSrsName(type: Type.Logical) {
    if (type === Type.Logical.GEO_POINT) {
      return FieldFormatType.GEO_POINT;
    } else if (type === Type.Logical.GEO_LINE) {
      return FieldFormatType.GEO_LINE;
    } else if (type === Type.Logical.GEO_POLYGON) {
      return FieldFormatType.GEO_POLYGON;
    }
  }
}
