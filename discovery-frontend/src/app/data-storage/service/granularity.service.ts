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

  private _translateService: TranslateService;

  constructor(private injector: Injector) {
    this._translateService = injector.get(TranslateService);
  }

  /**
   * Get granularity list
   * @returns {[{label: string; value: Granularity}]}
   */
  public getGranularityList(): [{label: string, value: Granularity}] {
    return [
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
   * Get interval
   * @param {string} date
   * @param {string} granularityValue
   * @returns {string}
   */
  public getInterval(date: string, granularityValue: string): string {
    return moment(moment(date, this._getDateTimeFormat(granularityValue))).format(this._getDateTimeFormat(granularityValue));
  }

  /**
   * Get initialized interval
   * @param {string} startData
   * @param {string} endData
   * @param {string} granularityValue
   * @returns {{startInterval: string; endInterval: string}}
   */
  public getInitializedInterval(startData: string, endData: string, granularityValue: string): {startInterval: string, endInterval: string, intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} {
    // init
    const result = {
      startInterval: this.getInterval(startData, granularityValue),
      endInterval: this.getInterval(endData, granularityValue),
      intervalValid: true,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // check interval
    if (this._getGranularityUnit(result.startInterval, result.endInterval, granularityValue) < 9800) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(result.startInterval, 100, granularityValue);
      // add 100 end interval
      result.endInterval = this._getIntervalAddedUnit(result.endInterval, 100, granularityValue);
    } else if (this._getGranularityUnit(result.startInterval, result.endInterval, granularityValue) < 9900) {
      // reduce 100 start interval
      result.startInterval = this._getIntervalReducedUnit(result.startInterval, 100, granularityValue);
    } else {  // if invalid
      result.intervalValid = false;
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.unit');
    }
    // set granularity unit
    result.granularityUnit = this._getGranularityUnit(result.startInterval, result.endInterval, granularityValue);
    return result;
  }

  /**
   * Get interval validation information
   * @param {string} startInterval
   * @param {string} endInterval
   * @param {string} granularityValue
   * @returns {{intervalValid: boolean; intervalValidMessage: string; granularityUnit: number}}
   */
  public getIntervalValidationInfo(startInterval: string, endInterval: string, granularityValue: string): {intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} {
    const result: {intervalValid: boolean, intervalValidMessage: string, granularityUnit: number} = {
      intervalValid: false,
      intervalValidMessage: '',
      granularityUnit: 0
    };
    // if invalid interval format
    if (!this._isValidInterval(startInterval, granularityValue) || !this._isValidInterval(endInterval, granularityValue)) {
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.format', {format: this._getDateTimeFormat(granularityValue)});
    } else if (!this._isValidIntervalPeriod(startInterval, endInterval)) { // if difference first, end value
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.period');
    } else if (!this._isValidGranularityUnit(startInterval, endInterval, granularityValue)) { // units number exceed 10000
      result.intervalValidMessage = this._translateService.instant('msg.storage.ui.intervals.invalid.unit');
      result.granularityUnit = this._getGranularityUnit(startInterval, endInterval, granularityValue);
    } else {  // success
      result.intervalValid = true;
      result.granularityUnit = this._getGranularityUnit(startInterval, endInterval, granularityValue);
    }
    return result;
  }

  /**
   * @param {string} dateTime
   * @param {string} granularityValue
   * @returns {boolean}
   * @private
   */
  private _isValidInterval(dateTime: string, granularityValue: string): boolean {
    return this._getDateTimeRegexp(granularityValue).test(dateTime);
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
   * @param {string} granularityValue
   * @returns {boolean}
   * @private
   */
  private _isValidGranularityUnit(startInterval: string, endInterval: string, granularityValue: string): boolean {
    return this._getGranularityUnit(startInterval, endInterval, granularityValue) <= 10000;
  }

  /**
   * Get date time format
   * @param {string} granularityValue
   * @returns {string}
   * @private
   */
  private _getDateTimeFormat(granularityValue: string): string {
    switch (granularityValue) {
      case 'SECOND':
        return 'YYYY-MM-DD HH:mm:ss';
      case 'MINUTE':
        return 'YYYY-MM-DD HH:mm';
      case 'HOUR':
        return 'YYYY-MM-DD HH';
      case 'DAY':
        return 'YYYY-MM-DD';
      case 'MONTH':
        return 'YYYY-MM';
      case 'YEAR':
        return 'YYYY';
      default:
        return 'YYYY-MM-DD HH:mm:ss';
    }
  }


  /**
   * Get granularity unit
   * @param {string} startDateTime
   * @param {string} endDateTime
   * @param {string} granularityValue
   * @returns {number}
   * @private
   */
  private _getGranularityUnit(startDateTime: string, endDateTime: string, granularityValue: string): number {
    return Math.ceil(this._getDateTimeDiff(startDateTime, endDateTime) / this._getGranularityUnitMillis(granularityValue));
  }

  /**
   * Get added interval
   * @param {string} dateTime
   * @param {number} value
   * @param {string} granularityValue
   * @returns {string}
   * @private
   */
  private _getIntervalAddedUnit(dateTime: string, value: number, granularityValue: string): string {
    return moment(dateTime).add(value, this._getMomentKey(granularityValue)).format(this._getDateTimeFormat(granularityValue));
    // return moment(dateTime, this._getDateTimeFormat(granularityValue)).add(value, this._getMomentKey(granularityValue)).format(this._getDateTimeFormat(granularityValue));
  }

  /**
   * Get reduced interval
   * @param {string} dateTime
   * @param {number} value
   * @param {string} granularityValue
   * @returns {string}
   * @private
   */
  private _getIntervalReducedUnit(dateTime: string, value: number, granularityValue: string): string {
    return moment(dateTime).subtract(value, this._getMomentKey(granularityValue)).format(this._getDateTimeFormat(granularityValue));
    // return moment(dateTime, this._getDateTimeFormat(granularityValue)).subtract(value, this._getMomentKey(granularityValue)).format(this._getDateTimeFormat(granularityValue));
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
   * @param {string} granularityValue
   * @returns {RegExp}
   * @private
   */
  private _getDateTimeRegexp(granularityValue: string): RegExp {
    switch (granularityValue) {
      case 'SECOND':  // YYYY-MM-DD HH:mm:ss
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
      case 'MINUTE':  // YYYY-MM-DD HH:mm
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]$/;
      case 'HOUR':  // YYYY-MM-DD HH
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9])$/;
      case 'DAY':  // YYYY-MM-DD
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      case 'MONTH':  // YYYY-MM
        return /^\d{4}-(0[1-9]|1[0-2])$/;
      case 'YEAR':  // YYYY
        return /^\d{4}$/;
      default:  // YYYY-MM-DD HH:mm:ss
        return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
    }
  }

  /**
   * Get granularity unit milliseconds
   * @param {string} granularityValue
   * @returns {number}
   * @private
   */
  private _getGranularityUnitMillis(granularityValue: string): number {
    switch (granularityValue) {
      case 'SECOND':
        return 1000;
      case 'MINUTE':
        return 60000;
      case 'HOUR':
        return 3600000;
      case 'DAY':
        return 86400000;
      case 'MONTH':
        return 2629800000;
      case 'YEAR':
        return 31557600000;
      default:
        return 1000;
    }
  }

  /**
   * Get moment key
   * @param {string} granularityValue
   * @returns {string}
   * @private
   */
  private _getMomentKey(granularityValue: string): string {
    switch (granularityValue) {
      case 'SECOND':
        return 's';
      case 'MINUTE':
        return 'm';
      case 'HOUR':
        return 'h';
      case 'DAY':
        return 'd';
      case 'MONTH':
        return 'M';
      case 'YEAR':
        return 'y';
      default:
        return 's';
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
