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
import {isNullOrUndefined} from "util";
import {Type} from '../../shared/datasource-metadata/domain/type';
import {MetadataColumn} from "../../domain/meta-data-management/metadata-column";
import {StringUtil} from "../../common/util/string.util";

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

  public changeTimeFormatOrUnixType(fieldFormat: FieldFormat, format?: string): void {
    // change to UNIX (only require type, unit)
    if (fieldFormat.type === FieldFormatType.DATE_TIME) {
      fieldFormat.type = FieldFormatType.UNIX_TIME;
      fieldFormat.unitInitialize();
      // set time format valid TRUE
      fieldFormat.isValidFormat = true;
      // remove format valid message property
      delete fieldFormat.formatValidMessage;
      // remove format
      delete fieldFormat.format;
      // remove timezone
      delete fieldFormat.timeZone;
      delete fieldFormat.locale;
    } else if (fieldFormat.type === FieldFormatType.UNIX_TIME) { // change to TIME (only require type, format, timezone, locale)
      fieldFormat.type = FieldFormatType.DATE_TIME;
      // set validation message
      fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.check');
      if (format) {
        fieldFormat.format = format;
      }
      // remove format unit property
      delete fieldFormat.unit;
      // remove format valid property
      delete fieldFormat.isValidFormat;
    }
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
      // if not exist srs name
      if (isNullOrUndefined(fieldFormat.originalSrsName)) {
        fieldFormat.geoCoordinateInitialize();
        fieldFormat.type = this._getSrsName(targetType);
      }
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
          values: dataList.slice(0, 19)
        };
        // api result
        this.post(this.API_URL + 'datasources/validation/wkt', params)
          .then((result: {valid: boolean, suggestType: LogicalType, message: string}) => {
            // is enable GEO type
            if (result.valid) {
              fieldFormat.isValidFormat = true;
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
   *
   * @param {FieldFormat} fieldFormat
   * @param {string[]} dateList
   * @param {boolean} isInitValid
   * @return {Promise<any>}
   */
  public checkEnableDateTimeFormatAndSetValidationResultInField(fieldFormat: FieldFormat, dateList: string[], isInitValid?: boolean) {
    return new Promise((resolve, reject) => {
      // if not exist fieldFormat data list
      if (dateList.length < 1) {
        // set time fieldFormat valid FALSE
        fieldFormat.isValidFormat = false;
        // set time fieldFormat valid message
        fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.column.no.data');
        resolve(fieldFormat);
      } else {  // if exist fieldFormat data list
        const params: {samples: string[], format?: string} = {
          samples: dateList.slice(0,19)
        };
        // if not init valid, set fieldFormat in params
        if(!isInitValid) {
          // if empty fieldFormat
          if (StringUtil.isEmpty(fieldFormat.format)) {
            // set time fieldFormat valid FALSE
            fieldFormat.isValidFormat = false;
            // set time fieldFormat valid message
            fieldFormat.formatValidMessage = this._translateSvc.instant('msg.common.ui.required');
            resolve(fieldFormat);
          } else {  // if not empty fieldFormat
            // set fieldFormat in params
            (params.format = fieldFormat.format);
          }
        }
        this.post(this.API_URL + 'datasources/validation/datetime', params)
          .then((result: {valid?: boolean, pattern?: string}) =>{
            // if valid or exist pattern
            if (result.valid || result.pattern) {
              // set time fieldFormat valid TRUE
              fieldFormat.isValidFormat = true;
              // if exist pattern, set time fieldFormat in fieldFormat
              (result.pattern) && (fieldFormat.format = result.pattern);
              // if enable timezone, set browser timezone at fieldFormat
              if (this._timezoneSvc.isEnableTimezoneInDateFormat(fieldFormat)) {
                !fieldFormat.timeZone && (fieldFormat.timeZone = this._timezoneSvc.getBrowserTimezone().momentName);
                fieldFormat.locale = this._timezoneSvc.browserLocale;
              } else { // if not enable timezone
                fieldFormat.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
              }
            } else { // invalid
              // set time fieldFormat valid FALSE
              fieldFormat.isValidFormat = false;
              // set time fieldFormat valid message
              fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
            }
            // if valid fieldFormat, set enable time fieldFormat
            (result.valid) && (fieldFormat.isValidFormat = true);
            resolve(fieldFormat);
          })
          .catch((error) => {
            // if init valid, set default time fieldFormat in fieldFormat
            if (isInitValid)  {
              fieldFormat.formatInitialize();
            }
            // set time fieldFormat valid FALSE
            fieldFormat.isValidFormat = false;
            // set time fieldFormat valid message
            fieldFormat.formatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
            reject(fieldFormat);
          });

      }
    });
  }

  /**
   * Convert type
   * @param {LogicalType} logicalType
   * @return {any}
   */
  public convertType(logicalType: LogicalType) {
    if (logicalType === LogicalType.GEO_POINT) {
      return Type.Logical.GEO_POINT;
    } else if (logicalType === LogicalType.GEO_LINE) {
      return Type.Logical.GEO_LINE;
    } else if (logicalType === LogicalType.GEO_POLYGON) {
      return Type.Logical.GEO_POLYGON;
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
