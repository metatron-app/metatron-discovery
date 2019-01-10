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

import { Injectable, Injector } from '@angular/core';
import { TranslateService } from 'ng2-translate';
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
   * @returns {{segmentGranularity: GranularityObject; queryGranularity: GranularityObject}}
   */
  public getInitializedGranularity(format: string, startNumber: number): {segmentGranularity: GranularityObject, queryGranularity: GranularityObject} {
    const result = {
      segmentGranularity: undefined,
      queryGranularity: undefined
    };
    this._automationGranularity(format, startNumber, result);
    return result;
  }

  /**
   * Get interval
   * @param {string} dateTime
   * @param {GranularityObject} granularity
   * @returns {string}
   */
  public getInterval(dateTime: string, granularity: GranularityObject): string {
    return moment(granularity.value === Granularity.YEAR ? new Date(dateTime) : dateTime).format(this._getDateTimeFormat(granularity));
  }

  /**
   * Get initialized interval
   * @param {string} startData
   * @param {string} endData
   * @param {GranularityObject} granularity
   * @returns {{startInterval: string; endInterval: string; intervalValid: boolean; intervalValidMessage: string; granularityUnit: number}}
   */
  public getInitializedInterval(startData: string, endData: string, granularity: GranularityObject): {startInterval: string, endInterval: string, intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} {
    // init
    const result = {
      startInterval: this.getInterval(startData, granularity),
      endInterval: this.getInterval(endData, granularity),
      intervalValid: true,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // check interval
    if (this._getGranularityUnit(result.startInterval, result.endInterval, granularity) < 9800) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(result.startInterval, 100, granularity);
      // add 100 end interval
      result.endInterval = this._getIntervalAddedUnit(result.endInterval, 100, granularity);
    } else if (this._getGranularityUnit(result.startInterval, result.endInterval, granularity) < 9900) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(result.startInterval, 100, granularity);
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
   * @returns {{intervalValid: boolean; intervalValidMessage: string; granularityUnit: number}}
   */
  public getIntervalValidationInfo(startInterval: string, endInterval: string, granularity: GranularityObject): {intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} {
    const result: {intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} = {
      intervalValid: false,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // if invalid interval format
    if (!this._isValidInterval(startInterval, granularity) || !this._isValidInterval(endInterval, granularity)) {
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.format', {format: this._getDateTimeFormat(granularity)});
    } else if (!this._isValidIntervalPeriod(startInterval, endInterval, granularity)) { // if difference first, end value
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
   * @param {GranularityObject} granularity
   * @returns {boolean}
   * @private
   */
  private _isValidIntervalPeriod(startInterval: string, endInterval: string, granularity: GranularityObject): boolean {
    return this._getDateTimeDiff(startInterval, endInterval, granularity) > 0
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
   * Get date time format
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getDateTimeFormat(granularity: GranularityObject): string {
    switch (granularity.value) {
      case Granularity.SECOND:
        return 'YYYY-MM-DD HH:mm:ss';
      case Granularity.MINUTE:
        return 'YYYY-MM-DD HH:mm';
      case Granularity.HOUR:
        return 'YYYY-MM-DD HH';
      case Granularity.DAY:
        return 'YYYY-MM-DD';
      case Granularity.MONTH:
        return 'YYYY-MM';
      case Granularity.YEAR:
        return 'YYYY';
      default:
        return 'YYYY-MM-DD HH:mm:ss';
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
    return Math.ceil(this._getDateTimeDiff(startDateTime, endDateTime, granularity) / this._getGranularityUnitMillis(granularity));
  }

  /**
   * Get added interval
   * @param {string} dateTime
   * @param {number} value
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getIntervalAddedUnit(dateTime: string, value: number, granularity: GranularityObject): string {
    return moment(granularity.value === Granularity.YEAR ? new Date(dateTime) : dateTime).add(value, this._getMomentKey(granularity)).format(this._getDateTimeFormat(granularity));
  }

  /**
   *  Get reduced interval
   * @param {string} dateTime
   * @param {number} value
   * @param {GranularityObject} granularity
   * @returns {string}
   * @private
   */
  private _getIntervalReducedUnit(dateTime: string, value: number, granularity: GranularityObject): string {
    return moment(granularity.value === Granularity.YEAR ? new Date(dateTime) : dateTime).subtract(value, this._getMomentKey(granularity)).format(this._getDateTimeFormat(granularity));
  }

  /**
   * Get date time diff
   * @param {string} startDateTime
   * @param {string} endDateTime
   * @returns {number}
   * @private
   */
  private _getDateTimeDiff(startDateTime: string, endDateTime: string, granularity: GranularityObject): number {
    return moment(granularity.value === Granularity.YEAR ? new Date(endDateTime) : endDateTime).diff(moment(granularity.value === Granularity.YEAR ? new Date(startDateTime) : startDateTime));
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
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
      case Granularity.MINUTE:  // YYYY-MM-DD HH:mm
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]$/;
      case Granularity.HOUR:  // YYYY-MM-DD HH
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9])$/;
      case Granularity.DAY:  // YYYY-MM-DD
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      case Granularity.MONTH:  // YYYY-MM
        return /^\d{4}-(0[1-9]|1[0-2])$/;
      case Granularity.YEAR:  // YYYY
        return /^\d{4}$/;
      default:  // YYYY-MM-DD HH:mm:ss
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
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
   * automation granularity
   * @param {string} format
   * @param {number} startNumber
   * @param {{segmentGranularity: GranularityObject; queryGranularity: GranularityObject}} resultObject
   * @private
   */
  private _automationGranularity(format: string, startNumber: number, resultObject: {segmentGranularity: GranularityObject, queryGranularity: GranularityObject}) {
    switch (format.slice(startNumber, startNumber + 1)) {
      case 'Y':
      case 'y':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity YEAR
        resultObject.queryGranularity = this.granularityList[6];
        break;
      case 'M':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity MONTH
        resultObject.queryGranularity = this.granularityList[5];
        break;
      case 'D':
      case 'd':
        // set segment granularity YEAR
        resultObject.segmentGranularity = this.granularityList[6];
        // set query granularity DAY
        resultObject.queryGranularity = this.granularityList[4];
        break;
      case 'H':
      case 'h':
        // set segment granularity MONTH
        resultObject.segmentGranularity = this.granularityList[5];
        // set query granularity HOUR
        resultObject.queryGranularity = this.granularityList[3];
        break;
      case 'm':
        // set segment granularity DAY
        resultObject.segmentGranularity = this.granularityList[4];
        // set query granularity MINUTE
        resultObject.queryGranularity = this.granularityList[2];
        break;
      case 'S':
      case 's':
        // set segment granularity HOUR
        resultObject.segmentGranularity = this.granularityList[3];
        // set query granularity SECOND
        resultObject.queryGranularity = this.granularityList[1];
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
