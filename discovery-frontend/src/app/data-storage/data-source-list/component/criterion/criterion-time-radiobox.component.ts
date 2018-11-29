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

import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { DatasourceCriterion } from '../../../../domain/datasource/datasourceCriterion';
import { PickerSettings } from '../../../../domain/common/datepicker.settings';

declare let moment: any;
declare let $: any;

@Component({
  selector: 'criterion-time-radio-component',
  templateUrl: 'criterion-time-radiobox.component.html'
})
export class CriterionTimeRadioboxComponent extends AbstractComponent {

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
  private _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private _endPickerInput: ElementRef;

  @Output('changedSelectItem')
  private _changeSelectItemEvent: EventEmitter<any> = new EventEmitter();

  // origin criterion
  @Input('criterion')
  public criterion: DatasourceCriterion;

  // is enable ALL option
  @Input('enableAllOption')
  public isEnableAllOption: boolean;
  // is enable from to option
  @Input('enableFromToOption')
  public isEnableFromToOption: boolean;

  // time format
  @Input('timeFormat')
  public timeFormat: string = 'YYYY-MM-DD HH:mm';

  // time type list
  public timeTypeList: any = [];
  // selected time type
  public selectedTimeType: any;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * ngAfterViewInit
   */
  public ngAfterViewInit() {
    // init
    this._initView();
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
      // change event emit
      this._changeSelectItemEvent.emit(this._getSelectedTimeData());
    }
  }

  /**
   * Init ui
   * @private
   */
  private _initView(): void {
    // time type list
    this.timeTypeList = [
      {label: this.translateService.instant('msg.storage.ui.criterion.today'), value: 'TODAY'},
      {label: this.translateService.instant('msg.storage.ui.criterion.last-7-days'), value: '7DAYS'},
      {label: this.translateService.instant('msg.storage.ui.criterion.between'), value: 'BETWEEN'},
    ];
    // if enable all option
    if (this.isEnableAllOption) {
      this.timeTypeList.unshift({label: `(${this.translateService.instant('msg.comm.ui.list.all')})`, value: 'ALL'});
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
    const result = {};
    // create time data
    const startTimeData = {
      filterKey: this.criterion.filters[0].filterKey,
      filterName: this.selectedTimeType.value === 'BETWEEN'
        ? (this._startPickerDate ? moment(this._startPickerDate).format(this.timeFormat) : null)
        : this._startDate
    };
    const endTimeData = {
      filterKey: this.criterion.filters[0].filterSubKey,
      filterName: this.selectedTimeType.value === 'BETWEEN'
        ? (this._endPickerDate ? moment(this._endPickerDate).format(this.timeFormat) : null)
        : this._endDate
    };
    if (startTimeData.filterName) {
      startTimeData['filterValue'] = moment(startTimeData.filterName).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    if (endTimeData.filterName) {
      endTimeData['filterValue'] = moment(endTimeData.filterName).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    // set timetype key
    result[this.selectedTimeType.value] = [startTimeData, endTimeData];
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
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
      },
      () => {}
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
        // change event emit
        this._changeSelectItemEvent.emit(this._getSelectedTimeData());
      },
      () => {}
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
      case 'ALL':
        this._startDate = null;
        this._endDate = null;
        break;
      case 'TODAY':
        this._startDate = moment({ hour: 0 }).format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        break;
      case '7DAYS':
        this._startDate = moment({ hour: 0 }).subtract(6, 'days').format(this.timeFormat);
        this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
        break;
      case 'BETWEEN':
        this._setDatePickerSettings();
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
  }
}
