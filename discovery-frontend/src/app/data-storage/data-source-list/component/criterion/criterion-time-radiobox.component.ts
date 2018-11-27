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

  private _startDate: Date;
  private _endDate: Date;

  // DatePicker 객체
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
    // Date Picker 객체 제거
    (this._startPicker) && (this._startPicker.destroy());
    (this._endPicker) && (this._endPicker.destroy());
  }

  /**
   * ngAfterViewInit
   */
  public ngAfterViewInit() {
    // init
    this._initView();
  }

  public onChangeTimeType(timeType: any): void {
    // change selected time type
    this.selectedTimeType = timeType;
    // TODO set time
    this._setTimePicker(timeType.value);

    // make
    const temp = {};
    // temp[this.criterion.criterionKey] = [
    //   {filterName: 'from', filterValue: this._startTime},
    //   {filterName: 'to', filterValue: this._endTime}
    // ];
    // change event emit
    this._changeSelectItemEvent.emit(temp);
  }

  private _setTimePicker(value: string): void {
    switch (value) {
      case 'ALL':
        this._startPickerInput.nativeElement.value = '';
        this._endPickerInput.nativeElement.value = '';
        this._startDate = null;
        this._endDate = null;
        // 전체 기간을 선택할 수 있도록 데이터 갱신
        this._startPicker.selectDate(null);
        this._endPicker.selectDate(null);
        break;
      case 'TODAY':
        this._startPicker.selectDate(moment({ hour: 0 }).toDate());
        this._endPicker.selectDate(moment({ hour: 23, minute: 59, seconds: 59 }).toDate());
        break;
      case '7DAYS':
        this._startPicker.selectDate(moment({ hour: 0 }).subtract(6, 'days').toDate());
        this._endPicker.selectDate(moment({ hour: 23, minute: 59, seconds: 59 }).toDate());
        break;
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

    let startInitialValue: any = '-';
    let endInitialValue: any = '-';

    // 시작일 DatePicker 생성
    const startPickerSettings: PeriodPickerSettings
      = new PeriodPickerSettings(
      'ddp-input-calen',
      (fdate: string, date: Date) => {
        this._startDate = date;
        // this.selectedType = PeriodType.NOT;
        // this.validation(true);
      },
      () => {}, true
    );
    this._startPicker = $(this._startPickerInput.nativeElement).datepicker(startPickerSettings).data('datepicker');
    ( '-' !== startInitialValue ) && ( this._startPicker.selectDate(startInitialValue.toDate()) );

    // 종료일 DatePicker 생성
    const endPickerSettings: PeriodPickerSettings
      = new PeriodPickerSettings(
      'ddp-input-calen',
      (fdate: string, date: Date) => {
        this._endDate = date;
        // this.selectedType = PeriodType.NOT;
        // this.validation(false);
      },
      () => {}, true
    );
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ( '-' !== endInitialValue ) && ( this._endPicker.selectDate(endInitialValue.toDate()) );
  }
}

class PeriodPickerSettings extends PickerSettings {
  constructor(clz: string, onSelectDate: Function, onHide: Function, useTimePicker: boolean ) {
    super( clz, onSelectDate, onHide );

    if( useTimePicker ) {
      this.dateFormat = 'yyyy-mm-dd';
      this.timeFormat = 'hh:ii';
      this.minView = 'days';
      this.view = 'days';
      this.timepicker = true;
    } else {
      this.dateFormat = 'yyyy-mm-dd';
      this.minView = 'days';
      this.view = 'days';
    }
  }
} // structure - PeriodPickerSettings
