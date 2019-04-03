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

import * as _ from 'lodash';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {TimeUnit} from '../../../domain/workbook/configurations/field/timestamp-field';
import {PickerSettings} from '../../../domain/common/datepicker.settings';
import {isNullOrUndefined} from 'util';
import {TimeRangeFilter} from '../../../domain/workbook/configurations/filter/time-range-filter';

declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-time-range',
  templateUrl: './time-range.component.html'
})
export class TimeRangeComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _fromDate: Date;
  private _toDate: Date;

  // DatePicker 객체
  private _fromPicker;
  private _toPicker;

  @ViewChild('fromPickerInput') private _fromPickerInput: ElementRef;
  @ViewChild('toPickerInput') private _toPickerInput: ElementRef;

  // Quarter 및 Week 목록
  private _quarterList: ComboItem[] = [];
  private _weekList: ComboItem[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('mode')
  public mode: string = 'CHANGE';          // 화면 모드

  @Input('initial')
  public compData: TimeRangeData;

  @Output()
  public onDateChange: EventEmitter<any> = new EventEmitter();

  public comboList: ComboItem[] = [];
  public fromComboIdx: number = 0;
  public toComboIdx: number = 0;
  public selectedFromComboItem: ComboItem;
  public selectedToComboItem: ComboItem;

  // 최소/최후 시간 설정 여부
  public isEarliestDateTime: boolean = false;
  public isLatestDateTime: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
    for (let idx = 1; idx <= 52; idx++) {
      this._weekList.push(new ComboItem('W' + idx, idx));
    }
    for (let idx = 1; idx <= 4; idx++) {
      this._quarterList.push(new ComboItem('Q' + idx, idx));
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const compDataChanges: SimpleChange = changes.compData;
    if (compDataChanges) {
      const currVal: TimeRangeData = compDataChanges.currentValue;
      const prevVal: TimeRangeData = compDataChanges.previousValue;
      if (!prevVal ||
        currVal.minTime !== prevVal.minTime || currVal.maxTime !== prevVal.maxTime ||
        currVal.interval !== prevVal.interval || currVal.timeUnit !== prevVal.timeUnit) {
        this._setPicker();
      }
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();

    // Date Picker 객체 제거
    (this._fromPicker) && (this._fromPicker.destroy());
    (this._toPicker) && (this._toPicker.destroy());
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 콤보박스 선택 이벤트
   * @param {ComboItem} item
   * @param {boolean} isFrom
   */
  protected onSelectComboItem(item: ComboItem, isFrom: boolean) {
    if (isFrom) {
      this.selectedFromComboItem = item;
    } else {
      this.selectedToComboItem = item;
    }
    this.onDateChange.emit(this._getTimeRange(false));
  } // function - onSelectComboItem

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * DatePicker 설정
   * @private
   */
  private _setPicker() {
    // 모형 모드일 때는 기능 동작을 하지 않는다
    if (this.compData.mockup) {
      return;
    }

    // 초기 데이터 설정
    const minTime: Date = this.compData.minTime;
    const maxTime: Date = this.compData.maxTime;
    const interval: TimeRange = this.compData.interval;

    // 경계값 설정 여부 확인
    this.isEarliestDateTime = interval.startDate === TimeRangeFilter.EARLIEST_DATETIME;
    this.isLatestDateTime = interval.endDate === TimeRangeFilter.LATEST_DATETIME;

    this.safelyDetectChanges();

    if (this.isEarliestDateTime) {
      (this._fromPicker) && (this._fromPicker.destroy());
    } else {
      let fromMoment;
      if (interval.startDate && 'undefined' !== interval.startDate) {
        fromMoment = this.customMoment( interval.startDate );
      } else {
        fromMoment = moment(minTime);
      }

      if (TimeUnit.WEEK === this.compData.timeUnit) {
        this.comboList = _.cloneDeep(this._weekList);
        const arrDateInfo = (<string>interval.startDate).split('-');
        fromMoment = moment(arrDateInfo[0] + '-01-01');
        const startWeek: number = Number(arrDateInfo[1]);
        this.fromComboIdx = this.comboList.findIndex(item => item.value === startWeek);
        this.selectedFromComboItem = this.comboList[this.fromComboIdx];
      } else if (TimeUnit.QUARTER === this.compData.timeUnit) {
        this.comboList = _.cloneDeep(this._quarterList);
        const startQuarter: number = fromMoment.quarter();
        this.fromComboIdx = this.comboList.findIndex(item => item.value === startQuarter);
        this.selectedFromComboItem = this.comboList[this.fromComboIdx];
      }

      // if ([TimeUnit.NONE, TimeUnit.HOUR, TimeUnit.MINUTE].some(unit => unit === this.compData.timeUnit)) {
      //   this._fromDate = fromMoment.subtract(9, 'hours').toDate();
      // } else {
      //   this._fromDate = fromMoment.toDate();
      // }
      this._fromDate = fromMoment.toDate();

      if (isNullOrUndefined(this._fromPicker)) {
        // 시작일 DatePicker 생성
        const startPickerSettings: TimeRangePickerSettings
          = new TimeRangePickerSettings(
          'ddp-text-calen',
          (fdate: string, date: Date) => {
            this._fromDate = date;
          },
          () => {
            this.onDateChange.emit(this._getTimeRange(true));
          },
          this.compData.timeUnit
        );
        this._fromPicker = $(this._fromPickerInput.nativeElement).datepicker(startPickerSettings).data('datepicker');
      }

      this._fromPicker.date = this._fromDate;
      this._fromPicker.selectDate(this._fromDate);
    }

    if (this.isLatestDateTime) {
      (this._toPicker) && (this._toPicker.destroy());
    } else {
      let toMoment;
      if (interval.endDate && 'undefined' != interval.endDate) {
        toMoment = this.customMoment( interval.endDate );
      } else {
        toMoment = moment(maxTime);
      }

      if (TimeUnit.WEEK === this.compData.timeUnit) {
        this.comboList = _.cloneDeep(this._weekList);
        const arrDateInfo = (<string>interval.endDate).split('-');
        toMoment = moment(arrDateInfo[0] + '-01-01');
        const endWeek: number = Number(arrDateInfo[1]);
        this.toComboIdx = this.comboList.findIndex(item => item.value === endWeek);
        this.selectedToComboItem = this.comboList[this.toComboIdx];
      } else if (TimeUnit.QUARTER === this.compData.timeUnit) {
        this.comboList = _.cloneDeep(this._quarterList);
        const endQuarter: number = toMoment.quarter();
        this.toComboIdx = this.comboList.findIndex(item => item.value === endQuarter);
        this.selectedToComboItem = this.comboList[this.toComboIdx];
      }

      // if ([TimeUnit.NONE, TimeUnit.HOUR, TimeUnit.MINUTE].some(unit => unit === this.compData.timeUnit)) {
      //   this._toDate = toMoment.subtract(9, 'hours').toDate();
      // } else {
      //   this._toDate = toMoment.toDate();
      // }
      this._toDate = toMoment.toDate();

      // 종료일 DatePicker 생성
      if (isNullOrUndefined(this._toPicker)) {
        const endPickerSettings: TimeRangePickerSettings
          = new TimeRangePickerSettings(
          'ddp-text-calen',
          (fdate: string, date: Date) => {
            this._toDate = date;
          },
          () => {
            this.onDateChange.emit(this._getTimeRange(false));
          },
          this.compData.timeUnit
        );
        this._toPicker = $(this._toPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
      }

      this._toPicker.date = this._toDate;
      this._toPicker.selectDate(this._toDate);
    }

  } // function - _setPicker

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Date >> Range
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 값 검증
   * @param {boolean} isStart
   * @returns {TimeRange}
   */
  private _getTimeRange(isStart: boolean): TimeRange {

    if (this._fromDate && this._toDate && 0 < (this._fromDate.getTime() - this._toDate.getTime())) {
      // 선택한 시작날짜가 종료날짜보다 크면 시작날짜로 셋팅
      if (isStart) {
        this._toDate = this._fromDate;
        // 선택한 종료날짜가 시간날짜보다 크면 종료 날짜로 셋팅
      } else {
        this._fromDate = this._toDate;
      }
      this._fromPicker.selectDate(this._fromDate);
      this._toPicker.selectDate(this._toDate);
    }

    const currTimeUnit: TimeUnit = this.compData.timeUnit;
    if (TimeUnit.YEAR === currTimeUnit) {
      return this._getRangeFromMoment(
        (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : moment().year(this._fromDate.getFullYear()),
        (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : moment().year(this._toDate.getFullYear()),
        'year'
      );
    } else if (TimeUnit.QUARTER === currTimeUnit) {
      return this._getRangeFromMoment(
        (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : moment().year(this._fromDate.getFullYear()).quarter(this.selectedFromComboItem.value),
        (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : moment().year(this._toDate.getFullYear()).quarter(this.selectedToComboItem.value),
        'quarter'
      );
    } else if (TimeUnit.MONTH === currTimeUnit) {
      return this._getRangeFromMoment(
        (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : moment().year(this._fromDate.getFullYear()).month(this._fromDate.getMonth()),
        (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : moment().year(this._toDate.getFullYear()).month(this._toDate.getMonth()),
        'month'
      );
    } else if (TimeUnit.WEEK === currTimeUnit) {
      return new TimeRange(
        (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : this._fromDate.getFullYear() + '-' + this.selectedFromComboItem.value,
        (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : this._toDate.getFullYear() + '-' + this.selectedToComboItem.value
      );
    } else {

      if (TimeUnit.DAY === currTimeUnit) {
        return new TimeRange(
          (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : moment().year(this._fromDate.getFullYear()).month(this._fromDate.getMonth()).date(this._fromDate.getDate()).startOf('date').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z',
          (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : moment().year(this._toDate.getFullYear()).month(this._toDate.getMonth()).date(this._toDate.getDate()).startOf('date').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z'
        );
      } else {
        return new TimeRange(
          (this.isEarliestDateTime) ? TimeRangeFilter.EARLIEST_DATETIME : moment(this._fromDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z',
          (this.isLatestDateTime) ? TimeRangeFilter.LATEST_DATETIME : moment(this._toDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z'
        );
      }
    }

  } // function - _getTimeRange

  // noinspection JSMethodCanBeStatic
  /**
   * Moment 로 부터 Range 정보를 얻는다.
   * @param fromMoment
   * @param toMoment
   * @param {string} range
   * @returns {TimeRange}
   * @private
   */
  private _getRangeFromMoment(fromMoment: any, toMoment: any, range: string): TimeRange {
    return new TimeRange(
      fromMoment.startOf(range).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z',
      toMoment.endOf(range).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z'
    );
  } // function - _getRangeFromMoment
}


export class TimeRange {
  startDate: Date | string;
  endDate: Date | string;

  constructor(startDate: Date | string, endDate: Date | string) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public toInterval() {
    return this.startDate + '/' + this.endDate;
  }
}

/**
 * 초기 Time Range 데이터
 */
export class TimeRangeData {
  public minTime: Date;
  public maxTime: Date;
  public interval: TimeRange;
  public mockup: boolean;
  public timeUnit: TimeUnit;

  constructor(minTime: Date, maxTime: Date, interval: TimeRange, mockUp: boolean = false, timeUnit?: TimeUnit) {
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.interval = interval;
    this.mockup = mockUp;
    this.timeUnit = (isNullOrUndefined(timeUnit)) ? TimeUnit.NONE : timeUnit;
  }
} // structure - TimeRangeData

/**
 * 콤보 박스 아이템
 */
class ComboItem {
  public label: string;
  public value: number;

  constructor(label: string, value: number) {
    this.label = label;
    this.value = value;
  }
} // structure - ComboItem

/**
 * DatePicker 설정
 */
class TimeRangePickerSettings extends PickerSettings {

  constructor(clz: string, onSelectDate: Function, onHide: Function, timeUnit: TimeUnit) {
    super(clz, onSelectDate, onHide);

    switch (timeUnit) {
      case TimeUnit.YEAR:
      case TimeUnit.QUARTER:
      case TimeUnit.WEEK :
        this.dateFormat = 'yyyy';
        this.minView = 'years';
        this.view = 'years';
        break;
      case TimeUnit.MONTH :
        this.dateFormat = 'yyyy-mm';
        this.minView = 'months';
        this.view = 'months';
        break;
      case TimeUnit.DAY :
        this.dateFormat = 'yyyy-mm-dd';
        this.minView = 'days';
        this.view = 'days';
        break;
      case TimeUnit.HOUR:
        this.dateFormat = 'yyyy-mm-dd';
        this.timeFormat = 'hh';
        this.minView = 'days';
        this.view = 'days';
        this.timepicker = true;
        break;
      default :
        this.dateFormat = 'yyyy-mm-dd';
        this.timeFormat = 'hh:ii';
        this.minView = 'days';
        this.view = 'days';
        this.timepicker = true;
        break;
    }
  }
} // structure - TimeRangePickerSettings
