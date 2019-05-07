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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { PickerSettings } from '../../../domain/common/datepicker.settings';
import {StringUtil} from "../../../common/util/string.util";
import {Criteria} from "../../../domain/datasource/criteria";

declare let moment: any;
declare let $: any;

@Component({
  selector: 'criterion-time-radiobox-list',
  templateUrl: 'criterion-time-radiobox-list.component.html'
})
export class CriterionTimeRadioboxListComponent extends AbstractComponent {

  // date
  private _startDate: Date;
  private _endDate: Date;
  // date (only DatePicker use)
  private _startPickerDate: Date;
  private _endPickerDate: Date;

  // DatePicker object
  private _startPicker;
  private _endPicker;

  @ViewChild('startPickerInput')
  private readonly _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private readonly _endPickerInput: ElementRef;

  @Output('changedSelectItem')
  private readonly _changeSelectItemEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  public readonly changeLabel = new EventEmitter();

  @Input()
  public readonly defaultSelectedItemList;

  // origin criterion
  @Input('criterion')
  public readonly criterion: Criteria.ListCriterion;

  // is enable ALL option
  @Input('enableAllOption')
  public readonly isEnableAllOption: boolean;
  // is enable from to option
  @Input('enableFromToOption')
  public readonly isEnableFromToOption: boolean;

  // time format
  @Input('timeFormat')
  public readonly timeFormat: string = 'YYYY-MM-DD HH:mm';

  // time type list
  public timeTypeList: any = [];
  // selected time type
  public selectedTimeType: any;

  // enum
  public readonly DATE_TYPE = Criteria.DateTimeType;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngAfterViewInit
   */
  public ngAfterViewInit() {
    // init
    this._initView();
    Object.keys(this.defaultSelectedItemList).forEach((key) => {
      if (key === Criteria.KEY_DATETIME_TYPE_SUFFIX) {
        // change selected time type
        this.selectedTimeType = this.timeTypeList.find(type => type.value === this.defaultSelectedItemList[key][0]) || this.timeTypeList[0];
      } else if (StringUtil.isNotEmpty(this.defaultSelectedItemList[key][0])) {
        if (key.indexOf('From') !== -1) {
          this._startPickerDate = new Date(this.defaultSelectedItemList[key][0]);
        } else if (key.indexOf('To') !== -1) {
          this._endPickerDate = new Date(this.defaultSelectedItemList[key][0]);
        }
      }
    });
    // safe detect
    this._removeDatePicker();
    this.safelyDetectChanges();
    switch (this.selectedTimeType.value) {
      case Criteria.DateTimeType.ALL:
        break;
      case Criteria.DateTimeType.TODAY:
        this._startDate = moment({ hour: 0 }).format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        break;
      case Criteria.DateTimeType.SEVEN_DAYS:
        this._startDate = moment({ hour: 0 }).subtract(6, 'days').format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        break;
      case Criteria.DateTimeType.BETWEEN:
        this._setDatePickerSettings();
        break;
    }
    this.changeLabel.emit(this._getSelectedTimeData());
    // safe detect
    this.safelyDetectChanges();
  }

  /**
   * Time type change event
   * @param timeType
   */
  public onChangeTimeType(timeType: any): void {
    if (timeType.value !== this.selectedTimeType.value) {
      // change selected time type
      this.selectedTimeType = timeType;
      // remove date picker
      this._removeDatePicker();
      // change detect
      this.safelyDetectChanges();
      // set time date
      this._setTimePicker(timeType.value);
    }
  }

  /**
   * Init ui
   * @private
   */
  private _initView(): void {
    // time type list
    this.timeTypeList = [
      {label: this.translateService.instant('msg.storage.ui.criterion.today'), value: Criteria.DateTimeType.TODAY},
      {label: this.translateService.instant('msg.storage.ui.criterion.last-7-days'), value: Criteria.DateTimeType.SEVEN_DAYS},
      {label: this.translateService.instant('msg.storage.ui.criterion.between'), value: Criteria.DateTimeType.BETWEEN},
    ];
    // if enable all option
    if (this.isEnableAllOption) {
      this.timeTypeList.unshift({label: `(${this.translateService.instant('msg.comm.ui.list.all')})`, value: Criteria.DateTimeType.ALL});
    }
    // if not exist selected time type
    if (!this.selectedTimeType) {
      // init selected time type
      this.selectedTimeType = this.timeTypeList[0];
    }
  }

  /**
   * Get selected time data
   * @returns {Object}
   * @private
   */
  private _getSelectedTimeData(): object {
    // result
    const result = {TYPE: [this.selectedTimeType.value]};
    // create time data
    const startTimeData = {
      filterKey: this.criterion.filters[0].filterKey,
      filterName: this.selectedTimeType.value === Criteria.DateTimeType.BETWEEN
        ? (this._startPickerDate ? moment(this._startPickerDate).format(this.timeFormat) : null)
        : this._startDate,
      filterValue: undefined
    };
    const endTimeData = {
      filterKey: this.criterion.filters[0].filterSubKey,
      filterName: this.selectedTimeType.value === Criteria.DateTimeType.BETWEEN
        ? (this._endPickerDate ? moment(this._endPickerDate).format(this.timeFormat) : null)
        : this._endDate,
      filterValue: undefined
    };
    if (startTimeData.filterName) {
      startTimeData.filterValue = moment(startTimeData.filterName).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    if (endTimeData.filterName) {
      endTimeData.filterValue = moment(endTimeData.filterName).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    // set timetype key
    result[this.criterion.filters[0].filterKey] = [startTimeData];
    result[this.criterion.filters[0].filterSubKey] = [endTimeData];
    // return
    return result;
  }

  /**
   * Set date picker settings
   * @private
   */
  private _setDatePickerSettings(): void {
    // initial value
    let startInitialValue: any = '-';
    let endInitialValue: any = '-';
    // 날짜값이 있으면 날짜로 셋팅
    if (this._startPickerDate) {
      startInitialValue = moment(this._startPickerDate);
    }
    if (this._endPickerDate) {
      endInitialValue = moment(this._endPickerDate);
    }
    // start picker create
    const startPickerSettings: PickerSettings
      = new DatePickerSettings(
      'ddp-input-calen',
      (fdate: string, date: Date) => {
        // set picker start date
        this._startPickerDate = date;
        // picker date validation
        this._pickerDateValidation(true);
      },
      // if hide picker
      (inst, completed: boolean) => {
        if (completed === false) {
          this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        }
      }
    );
    // startPickerSettings.position = 'left top';
    this._startPicker = $(this._startPickerInput.nativeElement).datepicker(startPickerSettings).data('datepicker');
    ( '-' !== startInitialValue ) && ( this._startPicker.selectDate(startInitialValue.toDate()) );
    // end picker create
    const endPickerSettings: PickerSettings
      = new DatePickerSettings(
      'ddp-input-calen',
      (fdate: string, date: Date) => {
        // set picker end date
        this._endPickerDate = date;
        // picker date validation
        this._pickerDateValidation(false);
      },
      (inst, completed: boolean) => {
        // if hide picker
        if (completed === false) {
          this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        }
      }
    );
    // endPickerSettings.position = 'left top';
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ( '-' !== endInitialValue ) && ( this._endPicker.selectDate(endInitialValue.toDate()) );
  }

  /**
   * Set time picker
   * @param {string} value
   * @private
   */
  private _setTimePicker(value: string): void {
    switch (value) {
      case Criteria.DateTimeType.ALL:
        this._startDate = null;
        this._endDate = null;
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        break;
      case Criteria.DateTimeType.TODAY:
        this._startDate = moment({ hour: 0 }).format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        break;
      case Criteria.DateTimeType.SEVEN_DAYS:
        this._startDate = moment({ hour: 0 }).subtract(6, 'days').format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        break;
      case Criteria.DateTimeType.BETWEEN:
        this._setDatePickerSettings();
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        break;
    }
  }

  /**
   * Picker date validation
   * @param {boolean} isStartDate
   * @private
   */
  private _pickerDateValidation(isStartDate: boolean): void {
    // if exist start date, end date
    if (this._startPickerDate && this._endPickerDate && (this._startPickerDate.getTime() - this._endPickerDate.getTime()) > 0) {
      // Set as start date if selected is greater than end date
      isStartDate ? this._endPicker.selectDate(this._startPickerDate) : this._startPicker.selectDate(this._endPickerDate);
    }
  }

  /**
   * Remove date picker
   * @private
   */
  private _removeDatePicker(): void {
    this._startPicker && this._startPicker.destroy();
    this._endPicker && this._endPicker.destroy();
  }
}

class DatePickerSettings extends PickerSettings {
  constructor(clz: string, onSelectDate: Function, onHide: Function) {
    super(clz, onSelectDate, onHide);
    this.minView = 'days';
    this.view = 'days';
    // set show timepicker
    this.timepicker = true;
    // set date picker position
    this.position = 'right top';
  }
}
