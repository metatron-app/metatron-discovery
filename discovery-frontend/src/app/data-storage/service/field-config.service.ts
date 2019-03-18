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
import {Field, FieldFormat, LogicalType} from "../../domain/datasource/datasource";
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
   * Check valid date time format in field
   * @param {Field} field
   * @param {string[]} fieldDataList
   * @param {boolean} isInitValid
   * @return {Promise<any>}
   */
  public checkEnableDateTimeFormatAndSetValidationResultInField(field: Field | MetadataColumn, fieldDataList: string[], isInitValid?: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // if not exist field data list
      if (fieldDataList.length < 1) {
        // set time format valid FALSE
        field.isValidTimeFormat = false;
        // set time format valid message
        field.timeFormatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.column.no.data');
        resolve(field);
      } else {  // if exist field data list
        const params: {samples: string[], format?: string} = {
          samples: fieldDataList.slice(0,19)
        };
        // if not exist format in field, init format
        (!field.format) && (field.format = new FieldFormat());
        // if not init valid, set format in params
        if(!isInitValid) {
          // if empty format
          if (StringUtil.isEmpty(field.format.format)) {
            // set time format valid FALSE
            field.isValidTimeFormat = false;
            // set time format valid message
            field.timeFormatValidMessage = this._translateSvc.instant('msg.common.ui.required');
            resolve(field);
          } else {  // if not empty format
            // set format in params
            (params.format = field.format.format);
          }
        }
        this.post(this.API_URL + 'datasources/validation/datetime', params)
          .then((result: {valid?: boolean, pattern?: string}) =>{
            // if valid or exist pattern
            if (result.valid || result.pattern) {
              // set time format valid TRUE
              field.isValidTimeFormat = true;
              // if exist pattern, set time format in field
              (result.pattern) && (field.format.format = result.pattern);
              // if enable timezone, set browser timezone at field
              if (this._timezoneSvc.isEnableTimezoneInDateFormat(field.format)) {
                !field.format.timeZone && (field.format.timeZone = this._timezoneSvc.browserTimezone.momentName);
                field.format.locale = this._timezoneSvc.browserLocale;
              } else { // if not enable timezone
                field.format.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
              }
            } else { // invalid
              // set time format valid FALSE
              field.isValidTimeFormat = false;
              // set time format valid message
              field.timeFormatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
            }
            // if valid format, set enable time format
            (result.valid) && (field.isValidTimeFormat = true);
            resolve(field);
          })
          .catch((error) => {
            // if init valid, set default time format in field
            (isInitValid) && (field.format.format = 'yyyy-MM-dd');
            // set time format valid FALSE
            field.isValidTimeFormat = false;
            // set time format valid message
            field.timeFormatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
            reject(field);
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
  public checkEnableGeoTypeAndSetValidationResult(targetField: Field, fieldDataList: string[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // if not exist field data list
      if (fieldDataList.length < 1) {
        // set type valid FALSE
        targetField.isValidType = false;
        // set type valid message
        targetField.typeValidMessage = this._translateSvc.instant('msg.storage.ui.schema.column.no.data');
        resolve(targetField);
      } else {
        const wktKeyword = this._getKeywordWKT(targetField);
        const params = {
          geoType: targetField.logicalType,
          values: fieldDataList.slice(0, 19).map(data => `${wktKeyword} (${data.replace(/,/, ' ')})`)
        };
        // api result
        this.post(this.API_URL + 'datasources/validation/wkt', params)
          .then((result: {valid: boolean, suggestType: LogicalType, message: string}) => {
            // is enable GEO type
            if (result.valid) {
              targetField.isValidType = true;
            } else {  // is disable GEO type
              targetField.isValidType = false;
            }
            resolve(targetField);
          })
          .catch((error) => {
            targetField.isValidType = false;
            reject(error);
          });
      }
    });
  }

  /**
   * Get keyword WKT
   * @param {Field} targetField
   * @return {Type.WKT}
   * @private
   */
  private _getKeywordWKT(targetField: Field) {
    if (targetField.logicalType === LogicalType.GEO_POINT) {
      return Type.WKT.POINT;
    } else if (targetField.logicalType === LogicalType.GEO_LINE) {
      return Type.WKT.LINESTRING;
    } else if (targetField.logicalType === LogicalType.GEO_POLYGON) {
      return Type.WKT.POLYGON;
    }
  }
}
