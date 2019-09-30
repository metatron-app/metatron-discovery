import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {Criteria} from "../../../domain/datasource/criteria";
import {PeriodData} from "../../../common/value/period.data.value";
import {PickerSettings} from "../../../domain/common/datepicker.settings";

declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-created-time-radio-filter',
  templateUrl: 'created-time-radio-filter.html'
})
export class CreatedTimeRadioFilter extends AbstractComponent{
  @Output() changeSort = new EventEmitter();

  @ViewChild('startPickerInput')
  private readonly _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private readonly _endPickerInput: ElementRef;

  sortOptionList = [
    {name: this.translateService.instant('msg.storage.ui.criterion.all'), value: Criteria.DateTimeType.ALL},
    {name: this.translateService.instant('msg.storage.ui.criterion.today'), value: Criteria.DateTimeType.TODAY},
    {name: this.translateService.instant('msg.storage.ui.criterion.last-7-days'), value: Criteria.DateTimeType.SEVEN_DAYS},
    {name: this.translateService.instant('msg.storage.ui.criterion.between'), value: Criteria.DateTimeType.BETWEEN},
  ];

  // filter show flag
  createdTimeFilterShowFlag = false;

  selectedDate: PeriodData;

  private _startPickerDate: Date;
  private _endPickerDate: Date;
  private _startDate: Date;
  private _endDate: Date;

  private _startDateStr: string = '';
  private _endDateStr: string = '';

  // DatePicker object
  private _startPicker;
  private _endPicker;

  selectedCreatedTimeOptionName: string = 'ALL';

  public readonly timeFormat: string = 'YYYY-MM-DD HH:mm';

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.selectedDate = new PeriodData();
    this.selectedDate.type = Criteria.DateTimeType.ALL;
  }

  /**
   * Toggle show flag
   */
  toggleSelectedFilterShowFlag() {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.createdTimeFilterShowFlag = !this.createdTimeFilterShowFlag;
  }

  /**
   * When click another filter
   */
  onChangeFilter(sortOption: any) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.selectedCreatedTimeOptionName = sortOption.name;

    // If sortOption is BETWEEN reset picker dates
    if (sortOption.value === Criteria.DateTimeType.TODAY
      || sortOption.value === Criteria.DateTimeType.SEVEN_DAYS
      || sortOption.value === Criteria.DateTimeType.ALL) {
      this._startPickerDate = null;
      this._endPickerDate = null;
    }

    if (sortOption.value === Criteria.DateTimeType.TODAY) {
      this._startDate = moment({ hour: 0 }).format(this.timeFormat);
      this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
    } else if (sortOption.value === Criteria.DateTimeType.SEVEN_DAYS) {
      this._startDate = moment({ hour: 0 }).subtract(6, 'days').format(this.timeFormat);
      this._endDate = moment({ hour: 23, minute: 59, seconds: 59 }).format(this.timeFormat);
    }

    // if sortOption is not BETWEEN
    if (!this._startPickerDate && !this._endPickerDate) {
      let startDateStr:string = null;
      let endDateStr:string = null;
      const returnFormat = 'YYYY-MM-DDTHH:mm';

      if( this._startDate ) {
        startDateStr = moment(this._startDate).format(returnFormat)
      } else {
        startDateStr = null;
      }

      if( this._endDate ) {
        endDateStr = moment(this._endDate).add(59,'seconds').format(returnFormat);
      } else {
        endDateStr = null;
      }

      const returnData = {
        startDate : this._startDate,
        endDate : this._endDate,
        type: sortOption.value.toString(),
        startDateStr: startDateStr,
        endDateStr: endDateStr,
        dateType: null,
      };

      this.selectedDate = returnData;

      this.changeSort.emit(this.selectedDate);
    }

    if (sortOption.value === 'BETWEEN') {
      this._setTimePicker(sortOption.value);
    }
  }

  /**
   * Set time picker
   * @param {string} value
   * @private
   */
  private _setTimePicker(value: string): void {
    if (value === Criteria.DateTimeType.BETWEEN) {
      this.loadingShow();
      setTimeout(() => {
        this._setDatePickerSettings();
        this.loadingHide();
      }, 200);
    }
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
          this._setSelectedDateFromDatePicker();
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
          this._setSelectedDateFromDatePicker();
        }
      }
    );
    // endPickerSettings.position = 'left top';
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ( '-' !== endInitialValue ) && ( this._endPicker.selectDate(endInitialValue.toDate()) );
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
   * Complete date picker and request api again
   * @private
   */
  private _setSelectedDateFromDatePicker() {
    if (this._startPickerDate && this._endPickerDate) {
      let startDateStr:string = null;
      let endDateStr:string = null;
      const returnFormat = 'YYYY-MM-DDTHH:mm';

      if( this._startPickerDate ) {
        startDateStr = moment(this._startPickerDate).format(returnFormat);
        this._startDateStr = moment(this._startDate).format('YYYY-MM-DD:mm');
      } else {
        startDateStr = null;
      }

      if( this._endPickerDate ) {
        endDateStr = moment(this._endPickerDate).add(59,'seconds').format(returnFormat);
        this._endDateStr =  moment(this._startDate).format('YYYY-MM-DD:mm');
      } else {
        endDateStr = null;
      }

      this.selectedCreatedTimeOptionName = this._startDateStr + ' ~ ' + this._endDateStr;

      const returnData = {
        startDate : this._startPickerDate,
        endDate : this._endPickerDate,
        type: 'BETWEEN',
        startDateStr: startDateStr,
        endDateStr: endDateStr,
        dateType: null,
      };

      this.selectedDate = returnData;

      this.changeSort.emit(this.selectedDate);
      this.createdTimeFilterShowFlag = false;
    }
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
