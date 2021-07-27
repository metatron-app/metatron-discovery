import * as _ from 'lodash';
import {AbstractComponent} from '@common/component/abstract.component';
import {
  Component,
  ElementRef, EventEmitter, Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {TimeUnit} from '@domain/workbook/configurations/field/timestamp-field';
import {CommonUtil} from '@common/util/common.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {PickerSettings} from '@domain/common/datepicker.settings';
import {TimeDateFilter} from '@domain/workbook/configurations/filter/time-date-filter';
import {FilterUtil} from '../../util/filter.util';


declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-time-date',
  templateUrl: 'time-date.component.html'
})
export class TimeDateComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy{
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // DatePicker 객체
  private _datePicker;
  private _date: Date;

  @ViewChild('datePickerInput')
  private _datePickerInput: ElementRef;

  // Quarter 및 Week 목록
  private _quarterList: ComboItem[] = [];
  private _weekList: ComboItem[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('mode')
  public mode: 'CHANGE' | 'WIDGET' | 'PANEL' = 'CHANGE';          // 화면 모드

  @Input('initial')
  public compData: TimeDateData;

  @Output()
  public onDateChange: EventEmitter<any> = new EventEmitter();

  public comboList: ComboItem[] = [];
  public dateComboIdx: number = 0;
  public selectedDateComboItem: ComboItem;

  public isLatestDateTime: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
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
  public ngOnChanges(changes: SimpleChanges): void {
    const compDataChanges: SimpleChange = changes.compData;

    if (compDataChanges){
      const currVal: TimeDateData = compDataChanges.currentValue;
      const preVal: TimeDateData = compDataChanges.previousValue;
      if(!preVal || currVal.timeUnit !== preVal.timeUnit || currVal.valueDate !== preVal.valueDate ) {
        this._setPicker();
      }
    }
  }

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();

    // Date Picker 객체 제거
    (this._datePicker) && (this._datePicker.destroy());
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Getter / Setter
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 위젯 모드 여부
   */
  public get isWidgetMode(): boolean {
    return 'WIDGET' === this.mode;
  } // get - isWidgetMode


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 콤보박스 선택 이벤트
   * @param {ComboItem} item
   * @param {boolean} isFrom
   */
  public onSelectComboItem(item: ComboItem) {
    this.selectedDateComboItem = item;
    this.onDateChange.emit(this._getTimeDate());
  } // function - onSelectComboItem

  /**
   * 콤보박스 표시 여부
   * @param {boolean} isShow
   */
  public onToggleSelectOptions(isShow: boolean) {
    this.broadCaster.broadcast('TIME_DATE_SHOW_SELECT_OPTS', { isShow : isShow });
  } // func - onToggleSelectOptions

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * DatePicker 설정
   * @private
   */
  private _setPicker(){

    this.safelyDetectChanges();

    if( !this.compData ) {
      return;
    }

    const maxTime: Date = this.compData.maxTime;
    let valueDate = this.compData.valueDate;

    if (valueDate === TimeDateFilter.LATEST_DATETIME) {
      if( this.isWidgetMode ) {
        this.isLatestDateTime = false;
        valueDate = FilterUtil.getDateTimeFormat(maxTime, this.compData.timeUnit);
      } else {
        this.isLatestDateTime = true;
      }
    } else {
      this.isLatestDateTime = false;
    }

    this.safelyDetectChanges();

    if (this.isLatestDateTime) {
      if(this._datePicker) {
        this._datePicker.destroy();
        this._datePicker = undefined;
      }
    } else {
      let dateMoment;
      if (valueDate && 'undefined' !== valueDate){
        dateMoment = (TimeUnit.WEEK === this.compData.timeUnit) ? valueDate :  this.customMoment(valueDate);
      } else{
        dateMoment = moment();
      }

      if (TimeUnit.WEEK === this.compData.timeUnit){
        this.comboList = _.cloneDeep(this._weekList);
        let dateWeek;
        const arrDateInfo = (valueDate as string).split('-');
        dateMoment = moment(arrDateInfo[0] + '-01-01');
        dateWeek = Number(arrDateInfo[1]);
        this.dateComboIdx = this.comboList.findIndex(item => item.value === dateWeek);
        this.selectedDateComboItem = this.comboList[this.dateComboIdx];
      } else if (TimeUnit.QUARTER === this.compData.timeUnit){
        this.comboList = _.cloneDeep(this._quarterList);
        const dateQuarter: number = dateMoment.quarter();
        this.dateComboIdx = this.comboList.findIndex(item => item.value === dateQuarter);
        this.selectedDateComboItem = this.comboList[this.dateComboIdx];
      }
      this._date = dateMoment.toDate();

      if(this.isNullOrUndefined(this._datePicker)){
        const datePickerSettings: TimeDatePickerSettings
          = new TimeDatePickerSettings(
          'ddp-text-calen',
          (_date: string, date: Date) => {
            this._date= date;
          },
          ()=>{
            this.onDateChange.emit(this._getTimeDate());
          },
          this.compData.timeUnit
        );
        this._datePicker = $(this._datePickerInput.nativeElement).datepicker(datePickerSettings).data('datepicker');
      }

      this._datePicker.date = this._date;
      this._datePicker.selectDate(this._date);
    }

  } // func - _setPicker

  /**
   * 값 검증
   * @returns {TimeDate}
   */
  private _getTimeDate(): TimeDate{
    const currTimeUnit: TimeUnit = this.compData.timeUnit;
    if (TimeUnit.YEAR === currTimeUnit){
      return this._getDateFromMoment(moment().year(this._date.getFullYear()),'year');
    } else if (TimeUnit.QUARTER === currTimeUnit) {
      return this._getDateFromMoment(moment().year(this._date.getFullYear()).quarter(this.selectedDateComboItem.value),
        'quarter');
    } else if (TimeUnit.MONTH === currTimeUnit) {
      return this._getDateFromMoment(moment().year(this._date.getFullYear()).month(this._date.getMonth()),
        'month');
    } else if (TimeUnit.WEEK === currTimeUnit) {
      return new TimeDate( this._date.getFullYear() + '-' + this.selectedDateComboItem.value)
    } else if (TimeUnit.DAY === currTimeUnit) {
      return new TimeDate(moment().year(this._date.getFullYear()).month(this._date.getMonth()).date(this._date.getDate()).startOf('date').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z')
    } else {
      return new TimeDate(moment(this._date).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z');
    }
  }

  /**
   * Moment 로 부터 Date 정보를 얻음
   * @param dateMoment
   * @param range
   * @private
   */
  private _getDateFromMoment(dateMoment: any, range: string): TimeDate{
    return new TimeDate(
      dateMoment.startOf(range).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z'
    );
  }
}


export class TimeDate{
  public valueDate: Date | string;

  constructor(valueDate: Date | string) {
    this.valueDate = valueDate;
  }
}

export class TimeDateData {

  public minTime: Date;
  public maxTime: Date;
  public valueDate: Date | string;
  public timeUnit: TimeUnit;

  constructor(valueDate: Date | string, minTime: Date, maxTime: Date, timeUnit?: TimeUnit) {
    this.valueDate = valueDate;
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.timeUnit = (CommonUtil.isNullOrUndefined(timeUnit)) ? TimeUnit.NONE : timeUnit;
  }
}

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

class TimeDatePickerSettings extends PickerSettings {
  constructor(clz: string, onSelectDate: (fdate: string, date: Date) => void, onHide: () => void, timeUnit: TimeUnit) {
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
} // structure - TimeDatePickerSettings
