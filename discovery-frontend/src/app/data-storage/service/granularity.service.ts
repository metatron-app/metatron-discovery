/*
 *
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

import {Injectable, Injector} from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {FieldFormatType, FieldFormatUnit} from "../../domain/datasource/datasource";

declare let moment: any;

@Injectable()
export class GranularityService {

  public granularityList: GranularityObject[];

  private _translateService: TranslateService;

  constructor(private injector: Injector) {
    this._translateService = injector.get(TranslateService);
    // set granularity list
    this.granularityList = [
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-none'), value: Granularity.NONE },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-second'), value: Granularity.SECOND },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-minute'), value: Granularity.MINUTE },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-hour'), value: Granularity.HOUR },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-day'), value: Granularity.DAY },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-month'), value: Granularity.MONTH },
      { label: this._translateService.instant('msg.storage.li.dsource.granularity-year'), value: Granularity.YEAR }
    ];
  }

  /**
   * Get segment granularity list
   * @returns {GranularityObject[]}
   */
  public getSegmentGranularityList(): GranularityObject[] {
    return this.granularityList.filter(item => item.value !== Granularity.NONE && item.value !== Granularity.SECOND && item.value !== Granularity.MINUTE);
  }

  /**
   * Get query granularity list
   * @param {GranularityObject} granularity
   * @returns {GranularityObject[]}
   */
  public getQueryGranularityList(granularity: GranularityObject): GranularityObject[] {
    return this.granularityList.slice(0, this.granularityList.findIndex(item => item.value === granularity.value) + 1);
  }

  /**
   * Get initialized granularity
   * @param {string} format
   * @param {number} startNumber
   * @return {{segmentGranularity: GranularityObject; queryGranularity: GranularityObject; lastFormat: string}}
   */
  public getInitializedGranularity(format: string, startNumber: number): {segmentGranularity: GranularityObject, queryGranularity: GranularityObject, lastFormat: string} {
    const result = {
      segmentGranularity: undefined,
      queryGranularity: undefined,
      lastFormat: undefined
    };
    this._automationGranularity(format, startNumber, result);
    return result;
  }

  /**
   * Get init interval
   * @param momentData
   * @param {GranularityObject} granularity
   * @return {string}
   */
  public getInitInterval(momentData: any, granularity: GranularityObject): string {
    // if dateTime is number, trans to string
    return momentData.format(this._getDateTimeFormat(granularity));
  }

  /**
   * GEt interval used params
   * @param {string} interval
   * @param {GranularityObject} granularity
   * @return {string}
   */
  public getIntervalUsedParam(interval: string, granularity: GranularityObject): string {
    return moment(interval).format(this._getDateTimeFormat(granularity, true));
  }

  /**
   * Get initialized interval
   * @param {any[]} fieldDataList
   * @param {string} format
   * @param {GranularityObject} granularity
   * @param {FieldFormatType} type
   * @param {FieldFormatUnit} unit
   * @param {string} lastFormat
   * @return {GranularityIntervalInfo}
   */
  public getInitializedInterval(fieldDataList: any[], format: string, granularity: GranularityObject, type: FieldFormatType, unit: FieldFormatUnit, lastFormat: string): GranularityIntervalInfo {
    const firstMoment = this._getConvertedMoment(fieldDataList[0], format, type, lastFormat);
    const endMoment = this._getConvertedMoment(fieldDataList[fieldDataList.length-1], format, type, lastFormat);
    // init
    const result: GranularityIntervalInfo = {
      startInterval: this.getInitInterval(firstMoment, granularity),
      endInterval: this.getInitInterval(endMoment, granularity),
      firstMoment: firstMoment,
      endMoment: endMoment,
      intervalValid: true,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // check interval
    if (this._getGranularityUnit(result.startInterval, result.endInterval, granularity) < 9800) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(firstMoment, 100, granularity);
      // add 100 end interval
      result.endInterval = this._getIntervalAddedUnit(endMoment, 100, granularity);
    } else if (this._getGranularityUnit(result.startInterval, result.endInterval, granularity) < 9900) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(firstMoment, 100, granularity);
    } else {  // if invalid
      result.intervalValid = false;
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.unit');
    }
    // set granularity unit
    result.granularityUnit = this._getGranularityUnit(result.startInterval, result.endInterval, granularity);
    return result;
  }

  /**
   * Get interval validation information
   * @param {string} startInterval
   * @param {string} endInterval
   * @param {GranularityObject} granularity
   * @returns {GranularityIntervalInfo}
   */
  public getIntervalValidationInfo(startInterval: string, endInterval: string, granularity: GranularityObject): GranularityIntervalInfo {
    const result: GranularityIntervalInfo = {
      intervalValid: false,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // if invalid interval format
    if (!this._isValidInterval(startInterval, granularity) || !this._isValidInterval(endInterval, granularity)) {
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.format', {format: this._getDateTimeGuideFormat(granularity)});
    } else if (!this._isValidIntervalPeriod(startInterval, endInterval)) { // if difference first, end value
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.period');
    } else if (!this._isValidGranularityUnit(startInterval, endInterval, granularity)) { // units number exceed 10000
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.unit');
      result.granularityUnit = this._getGranularityUnit(startInterval, endInterval, granularity);
    } else {  // success
      result.intervalValid = true;
      result.granularityUnit = this._getGranularityUnit(startInterval, endInterval, granularity);
    }
    return result;
  }

  /**
   * Is valid interval
   * @param {string} dateTime
   * @param {GranularityObject} granularity
   * @returns {boolean}
   * @private
   */
  private _isValidInterval(dateTime: string, granularity: GranularityObject): boolean {
    return this._getDateTimeRegexp(granularity).test(dateTime);
  }

  /**
   * Is valid interval period
   * @param {string} startInterval
   * @param {string} endInterval
   * @returns {boolean}
   * @private
   */
  private _isValidIntervalPeriod(startInterval: string, endInterval: string): boolean {
    return this._getDateTimeDiff(startInterval, endInterval) > 0
  }

  /**
   * Is valid granularity unit
   * @param {string} startInterval
   * @param {string} endInterval
   * @param {GranularityObject} granularity
   * @returns {boolean}
   * @private
   */
  private _isValidGranularityUnit(startInterval: string, endInterval: string, granularity: GranularityObject): boolean {
    return this._getGranularityUnit(startInterval, endInterval, granularity) <= 10000;
  }

  /**
   * Is upper case format
   * @param {string} lastFormat
   * @return {boolean}
   * @private
   */
  private _isUpperCase(lastFormat: string): boolean {
    return 'YMD'.indexOf(lastFormat) !== -1;
  }

  /**
   * Get converted moment
   * @param data
   * @param {string} format
   * @param {FieldFormatType} type
   * @param {string} lastFormat
   * @return {any}
   * @private
   */
  private _getConvertedMoment(data: any, format: string, type: FieldFormatType, lastFormat: string): any {
    if (type === FieldFormatType.UNIX_TIME) {
      return moment(data);
    } else if (typeof data === 'number') {
      return moment(data + '', this._isUpperCase(lastFormat) ? format.toUpperCase() : format);
    } else if (typeof data === 'string') {
      return moment(data, this._isUpperCase(lastFormat) ? format.toUpperCase() : format);
    }
  }


  /**
   * Get date time format (only used data)
   * @param {GranularityObject} granularity
   * @param {boolean} usedParam
   * @return {string}
   * @private
   */
  private _getDateTimeFormat(granularity: GranularityObject, usedParam?: boolean): string {
    switch (granularity.value) {
      case Granularity.SECOND:
        return usedParam ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
      case Granularity.MINUTE:
        return usedParam ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD HH:mm';
      case Granularity.HOUR:
        return usedParam ? 'YYYY-MM-DDTHH' : 'YYYY-MM-DD HH';
      case Granularity.DAY:
        return 'YYYY-MM-DD';
      case Granularity.MONTH:
        return 'YYYY-MM';
      case Granularity.YEAR:
        return 'YYYY';
      default:
        return usedParam ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
    }
  }

  /**
   * Get date time guide format
   * @param {GranularityObject} granularity
   * @return {string}
   * @private
   */
  private _getDateTimeGuideFormat(granularity: GranularityObject): string {
    switch (granularity.value) {
      case Granularity.SECOND:
        return 'yyyy-MM-dd HH:mm:ss';
      case Granularity.MINUTE:
        return 'yyyy-MM-dd HH:mm';
      case Granularity.HOUR:
        return 'yyyy-MM-dd HH';
      case Granularity.DAY:
        return 'yyyy-MM-dd';
      case Granularity.MONTH:
        return 'yyyy-MM';
      case Granularity.YEAR:
        return 'yyyy';
      default:
        return 'yyyy-MM-dd HH:mm:ss';
    }
  }

  /**
   * Get granularity unit
   * @param {string} startDateTime
   * @param {string} endDateTime
   * @param {GranularityObject} granularity
   * @returns {number}
   * @private
   */
  private _getGranularityUnit(startDateTime: string, endDateTime: string, granularity: GranularityObject): number {
    return Math.ceil(this._getDateTimeDiff(startDateTime, endDateTime) / this._getGranularityUnitMillis(granularity));
  }

  /**
   * Get added interval
   * @param {string} dateTime
   * @param {number} value
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getIntervalAddedUnit(momentData: any, value: number, granularity: GranularityObject): string {
    return momentData.add(value, this._getMomentKey(granularity)).format(this._getDateTimeFormat(granularity));
  }

  /**
   *  Get reduced interval
   * @param {string} dateTime
   * @param {number} value
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getIntervalReducedUnit(momentData: any, value: number, granularity: GranularityObject): string {
    return momentData.subtract(value, this._getMomentKey(granularity)).format(this._getDateTimeFormat(granularity));
  }
  
  /**
   * Get date time diff
   * @param {string} startDateTime
   * @param {string} endDateTime
   * @returns {number}
   * @private
   */
  private _getDateTimeDiff(startDateTime: string, endDateTime: string): number {
    return moment(endDateTime).diff(moment(startDateTime));
  }

  /**
   * Get date time regexp
   * @param {GranularityObject} granularity
   * @returns {RegExp}
   * @private
   */
  private _getDateTimeRegexp(granularity: GranularityObject): RegExp {
    switch (granularity.value) {
      case Granularity.SECOND:  // YYYY-MM-DD HH:mm:ss
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
      case Granularity.MINUTE:  // YYYY-MM-DD HH:mm
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]$/;
      case Granularity.HOUR:  // YYYY-MM-DD HH
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9])$/;
      case Granularity.DAY:  // YYYY-MM-DD
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      case Granularity.MONTH:  // YYYY-MM
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])$/;
      case Granularity.YEAR:  // YYYY YY
        return /^(\d{4}|\d{2})$/;
      default:  // YYYY-MM-DD HH:mm:ss
        return /^(\d{4}|\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
    }
  }

  /**
   * Get granularity unit milliseconds
   * @param {GranularityObject} granularity
   * @returns {number}
   * @private
   */
  private _getGranularityUnitMillis(granularity: GranularityObject): number {
    switch (granularity.value) {
      case Granularity.SECOND:
        return 1000;
      case Granularity.MINUTE:
        return 60000;
      case Granularity.HOUR:
        return 3600000;
      case Granularity.DAY:
        return 86400000;
      case Granularity.MONTH:
        return 2629800000;
      case Granularity.YEAR:
        return 31557600000;
      default:
        return 1000;
    }
  }

  /**
   * Get moment key
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getMomentKey(granularity: GranularityObject): string {
    switch (granularity.value) {
      case Granularity.SECOND:
        return 's';
      case Granularity.MINUTE:
        return 'm';
      case Granularity.HOUR:
        return 'h';
      case Granularity.DAY:
        return 'd';
      case Granularity.MONTH:
        return 'M';
      case Granularity.YEAR:
        return 'y';
      default:
        return 's';
    }
  }

  /**
   * Automation granularity
   * @param {string} format
   * @param {number} startNumber
   * @param {{segmentGranularity: GranularityObject; queryGranularity: GranularityObject; lastFormat: string}} resultObject
   * @private
   */
  private _automationGranularity(format: string, startNumber: number, resultObject: {segmentGranularity: GranularityObject, queryGranularity: GranularityObject, lastFormat: string}) {
    switch (format.slice(startNumber, startNumber + 1)) {
      case 'Y':
      case 'y':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity YEAR
        resultObject.queryGranularity = this.granularityList[6];
        // set last format
        resultObject.lastFormat = 'Y';
        break;
      case 'M':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity MONTH
        resultObject.queryGranularity = this.granularityList[5];
        // set last format
        resultObject.lastFormat = 'M';
        break;
      case 'D':
      case 'd':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity DAY
        resultObject.queryGranularity = this.granularityList[4];
        // set last format
        resultObject.lastFormat = 'D';
        break;
      case 'H':
      case 'h':
        // set segment granularity MONTH
        resultObject.segmentGranularity = this.granularityList[5];
        // set query granularity HOUR
        resultObject.queryGranularity = this.granularityList[3];
        // set last format
        resultObject.lastFormat = 'H';
        break;
      case 'm':
        // set segment granularity DAY
        resultObject.segmentGranularity = this.granularityList[4];
        // set query granularity MINUTE
        resultObject.queryGranularity = this.granularityList[2];
        // set last format
        resultObject.lastFormat = 'm';
        break;
      case 'S':
      case 's':
        // set segment granularity HOUR
        resultObject.segmentGranularity = this.granularityList[3];
        // set query granularity SECOND
        resultObject.queryGranularity = this.granularityList[1];
        // set last format
        resultObject.lastFormat = 'S';
        break;
      default:
        // if not startNum first index, call _automationGranularity method
        if (startNumber !== 0) {
          this._automationGranularity(format, startNumber - 1, resultObject);
        } else { // set default
          // set segment granularity HOUR
          resultObject.segmentGranularity = this.granularityList[3];
          // set query granularity SECOND
          resultObject.queryGranularity = this.granularityList[1];
        }
        break;
    }
  }

}

enum Granularity {
  NONE = <any>'NONE',
  SECOND = <any>'SECOND',
  MINUTE = <any>'MINUTE',
  HOUR = <any>'HOUR',
  DAY = <any>'DAY',
  MONTH = <any>'MONTH',
  YEAR = <any>'YEAR'
}

interface GranularityObject {
  label: string,
  value: Granularity
}

interface GranularityIntervalInfo {
  startInterval?: string;
  endInterval?: string;
  intervalValid?: boolean;
  intervalValidMessage?: string;
  granularityUnit?: number;
  firstMoment?: any;
  endMoment?: any;
}
