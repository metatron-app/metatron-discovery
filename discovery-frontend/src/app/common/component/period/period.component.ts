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

import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractComponent } from '../abstract.component';
import { PickerSettings } from '../../../domain/common/datepicker.settings';

declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-period',
  templateUrl: './period.component.html'
})
export class PeriodComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _startDate: Date;
  private _endDate: Date;

  // DatePicker 객체
  private _startPicker;
  private _endPicker;

  @ViewChild('startPickerInput') private _startPickerInput: ElementRef;
  @ViewChild('endPickerInput') private _endPickerInput: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 기간타입
  public periodType = PeriodType;

  // 선택 타입
  public selectedType = PeriodType.ALL;

  // 기준
  @Input()
  public selectedDate: string = 'CREATED';

  @Input()
  public containerClass:string = '';

  // title (default값은 time)
  @Input()
  public title: string = 'Time';

  // 시간 유무
  @Input()
  public withTime: boolean = true;

  @Input()
  public returnFormat: string;

  // 버튼 유무(버튼이 없을 경우 달력을 선택할 때마다 이벤트가 발생함)
  @Input()
  public isShowButtons: boolean = true;

  @Input()
  public useDefaultAllRange:boolean = false; // default 값을 All Range 로 사용함

  // 우선순위 1
  @Input()
  public startDateDefault: any;

  @Input()
  public endDateDefault: any;

  // 우선순위 2
  @Input()
  public defaultType: PeriodType = PeriodType.ALL;

  // 기준 일자 설정
  @Input()
  public dateType: boolean = false;

  // 달력 컴포넌트 disabled여부
  @Input()
  public disabled: boolean = false;

  // Make seconds 59
  @Input()
  public roundSecond: boolean = false;

  @Input()
  public useAllButton? : boolean = true;

  // 사용자 커스텀 date type
  @Input()
  public usedCustomDateType: boolean = false;

  // label, value 로 이루어진 date type list
  @Input()
  public customDateTypeList: {label: string, value: string}[];

  // 변경 이벤트
  @Output() public changeDate = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
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
   * 화면 초기화 이후 처리
   */
  public ngAfterViewInit() {

    let startInitialValue: any = '-';
    let endInitialValue: any = '-';
    if (this.defaultType === PeriodType.YEAR) {
      startInitialValue = moment().subtract(1, 'years');
      endInitialValue = moment();
    }

    // Default 값이 있는지 체크 (paging처리 하면서 추가)
    let isDefaultValue: boolean;
    isDefaultValue = false;

    if (this.startDateDefault && this.endDateDefault) {

      // startDateDefault & endDateDefault 있다면 this.defaultType 사용
      isDefaultValue = true;

      startInitialValue = moment(this.startDateDefault);
      endInitialValue = moment(this.endDateDefault);
    }

    if (this.returnFormat == null) {
      this.returnFormat = 'YYYY-MM-DDTHH:mm';
    }

    // 시작일 DatePicker 생성
    const startPickerSettings: PeriodPickerSettings
      = new PeriodPickerSettings(
      'ddp-input-typebasic',
      (fdate: string, date: Date) => {
        this._startDate = date;
        this.selectedType = PeriodType.NOT;
        this.validation(true);
      },
      () => {},
      this.withTime
    );
    this._startPicker = $(this._startPickerInput.nativeElement).datepicker(startPickerSettings).data('datepicker');
    ( '-' !== startInitialValue ) && ( this._startPicker.selectDate(startInitialValue.toDate()) );

    // 종료일 DatePicker 생성
    const endPickerSettings: PeriodPickerSettings
      = new PeriodPickerSettings(
      'ddp-input-typebasic',
      (fdate: string, date: Date) => {
        this._endDate = date;
        this.selectedType = PeriodType.NOT;
        this.validation(false);
      },
      () => {},
      this.withTime
    );
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ( '-' !== endInitialValue ) && ( this._endPicker.selectDate(endInitialValue.toDate()) );

    // defaultType이 있다면 All/Today/Last7days 를 set 한다. (paging처리 하면서 추가)
    this.selectedType = this.defaultType ? this.defaultType : !isDefaultValue? PeriodType.ALL : PeriodType.NOT;

    if ( !this.useAllButton ) {
      this.selectedType = PeriodType.TODAY;
      this.setToday();
    }
  }

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();

    // Date Picker 객체 제거
    (this._startPicker) && (this._startPicker.destroy());
    (this._endPicker) && (this._endPicker.destroy());
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 모든 날짜 선택 버튼
   */
  public setAll() {
    if( this.useDefaultAllRange ) {
      const startDate = moment(this.startDateDefault);
      const endDate = moment(this.endDateDefault);

      this._startPicker.selectDate(startDate.toDate());
      this._endPicker.selectDate(endDate.toDate());
    } else {
      this._startPickerInput.nativeElement.value = '';
      this._endPickerInput.nativeElement.value = '';

      this._startDate = null;
      this._endDate = null;

      // 전체 기간을 선택할 수 있도록 데이터 갱신
      this._startPicker.selectDate(null);
      this._endPicker.selectDate(null);
    }

    this.selectedType = PeriodType.ALL;

    this.done();
  } // function - setAll

  /**
   * 오늘 날짜 선택 버튼
   */
  public setToday() {
    // 오늘 날짜로 갱신
    const startDate = moment({ hour: 0 });
    const endDate = moment({ hour: 23, minute: 59, seconds: 59 });
    this._startPicker.selectDate(startDate.toDate());
    this._endPicker.selectDate(endDate.toDate());

    this.selectedType = PeriodType.TODAY;

    this.done();
  } // function - setToday

  /**
   * 마지막 7일 선택 버튼
   */
  public setLastWeek() {

    // 일주일로 갱신
    const startDate = moment({ hour: 0 }).subtract(6, 'days');
    const endDate = moment({ hour: 23, minute: 59, seconds: 59 });
    this._startPicker.selectDate(startDate.toDate());
    this._endPicker.selectDate(endDate.toDate());

    this.selectedType = PeriodType.LAST_WEEK;

    this.done();
  } // function - setLastWeek

  /**
   * 선택된 날짜 반환
   */
  public done() {

    const returnData = this.getReturnData();

    this.changeDate.emit(returnData);
  } // function - done


  /**
   * Returns
   * {
      startDate : this._startDate,
      endDate : this._endDate,
      type: this.selectedType.toString(),
      startDateStr: startDateStr,
      endDateStr: endDateStr
    } this data
   */
  public getReturnData() {

    let startDateStr:string;
    if( this._startDate ) {
      startDateStr = moment(this._startDate).format(this.returnFormat)
    } else {
      startDateStr = null;
    }

    let endDateStr:string = null;
    if( this._endDate) {
      if( this.roundSecond ) {
        endDateStr = moment(this._endDate).add(59,'seconds').format(this.returnFormat);
      } else {
        endDateStr = moment(this._endDate).format(this.returnFormat);
      }
    }

    const returnData = {
      startDate : this._startDate,
      endDate : this._endDate,
      type: this.selectedType.toString(),
      startDateStr: startDateStr,
      endDateStr: endDateStr
    };

    if (this.dateType || this.usedCustomDateType) {
      returnData['dateType'] = this.selectedDate;
    }

    return returnData;
  }


  /**
   * When radio button is clicked [last access / created] (custom)
   * @param data
   */
  public onChangeSelectedDateType(data: {label: string, value: string}) {
    this.selectedDate = data.value;
    this.changeDate.emit(this.getReturnData());
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 검증 후 맞지 않으면 날짜를 동일하게 변경
   * @param {boolean} isStart
   */
  protected validation(isStart: boolean) {

    if (this._startDate && this._endDate && (this._startDate.getTime() - this._endDate.getTime()) > 0) {
      if (isStart) {
        // 선택한 시작날짜가 종료날짜보다 크면 시작날짜로 셋팅
        this._endPicker.selectDate(this._startDate);
      } else {
        // 선택한 종료날짜가 시간날짜보다 크면 종료 날짜로 셋팅
        this._startPicker.selectDate(this._endDate);
      }
    }

    if( this.useDefaultAllRange
      && moment(this.startDateDefault).isSame( this._startDate )
      && moment(this.endDateDefault).isSame( this._endDate ) ) {
      this.selectedType = PeriodType.ALL;
    }

    // 버튼이 없는 경우 날짜 변경되면 이벤트 발생
    ( this.isShowButtons ) || ( this.done() );

  } // function - validation

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}

export enum PeriodType {
  ALL = <any>'ALL',
  TODAY = <any>'TODAY',
  LAST_WEEK = <any>'LAST_WEEK',
  NOT = <any>'NOT',
  YEAR = <any>'YEAR'
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
