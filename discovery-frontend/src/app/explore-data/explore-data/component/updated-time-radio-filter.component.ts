import {Subject} from 'rxjs';
import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Criteria} from '@domain/datasource/criteria';
import {PeriodData} from '@common/value/period.data.value';
import {PickerSettings} from '@domain/common/datepicker.settings';

declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-updated-time-radio-filter',
  templateUrl: 'updated-time-radio-filter.component.html'
})
export class UpdatedTimeRadioFilterComponent extends AbstractComponent implements OnInit {
  @Input() filterFlags: Subject<{}>;
  @Output() changeSort = new EventEmitter();

  @ViewChild('startPickerInput')
  private readonly _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private readonly _endPickerInput: ElementRef;

  sortOptionList = [
    {name: this.translateService.instant('msg.storage.ui.criterion.all'), value: Criteria.DateTimeType.ALL},
    {name: this.translateService.instant('msg.storage.ui.criterion.today'), value: Criteria.DateTimeType.TODAY},
    {
      name: this.translateService.instant('msg.storage.ui.criterion.last-7-days'),
      value: Criteria.DateTimeType.SEVEN_DAYS
    },
    {name: this.translateService.instant('msg.storage.ui.criterion.between'), value: Criteria.DateTimeType.BETWEEN},
  ];

  // filter show flag
  updatedTimeFilterShowFlag = false;
  datePickerIsOn = false;
  previousSelectedDate: PeriodData;
  selectedDate: PeriodData;

  // pick date using date picker again
  pickDateAgain: boolean = false;

  pickDateAgainCount: number = 0;

  private _startPickerDate: Date;
  private _endPickerDate: Date;
  private _startDate: Date;
  private _endDate: Date;

  public startDateStr: string = '';
  public endDateStr: string = '';

  // DatePicker object
  private _startPicker;
  private _endPicker;

  selectedUpdatedTimeOptionName: string = 'ALL';

  public readonly timeFormat: string = 'YYYY-MM-DD HH:mm';

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.selectedDate = new PeriodData();
    this.selectedDate.type = Criteria.DateTimeType.ALL;
    this.previousSelectedDate = new PeriodData();
    this.previousSelectedDate.type = Criteria.DateTimeType.ALL;

    this.filterFlags.subscribe((flags) => {
      this.updatedTimeFilterShowFlag = flags[FilterTypes.UPDATED_TIME];
    });
  }

  /**
   * Toggle show flag
   */
  toggleSelectedFilterShowFlag() {
    event.stopPropagation();
    event.stopImmediatePropagation();

    const filterFlags = {};

    Object.keys(FilterTypes).forEach((key) => {
      if (key === FilterTypes.UPDATED_TIME) {
        filterFlags[key] = !this.updatedTimeFilterShowFlag;
      } else {
        filterFlags[key] = false;
      }
    });

    this.filterFlags.next(filterFlags);
  }

  /**
   * When click another filter
   */
  onChangeFilter(sortOption: any) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this._removeDatePicker();

    this.selectedUpdatedTimeOptionName = sortOption.name;
    console.log(sortOption);
    // If sortOption is BETWEEN reset picker dates
    if (sortOption.value === Criteria.DateTimeType.TODAY
      || sortOption.value === Criteria.DateTimeType.SEVEN_DAYS
      || sortOption.value === Criteria.DateTimeType.ALL) {
      this._startPickerDate = null;
      this._endPickerDate = null;
      // set datePicker flag is false
      this.datePickerIsOn = false;
      this.pickDateAgainCount = 0;
      this.pickDateAgain = false;
    }

    if (sortOption.value === Criteria.DateTimeType.TODAY) {
      this._startDate = moment({hour: 0}).format(this.timeFormat);
      this._endDate = moment({hour: 23, minute: 59, seconds: 59}).format(this.timeFormat);
    } else if (sortOption.value === Criteria.DateTimeType.SEVEN_DAYS) {
      this._startDate = moment({hour: 0}).subtract(6, 'days').format(this.timeFormat);
      this._endDate = moment({hour: 23, minute: 59, seconds: 59}).format(this.timeFormat);
    }

    // if filterOption is not BETWEEN
    if (!this._startPickerDate && !this._endPickerDate && sortOption.value && sortOption) {
      let startDateStr: string;
      let endDateStr: string;
      const returnFormat = 'YYYY-MM-DDTHH:mm';

      if (this._startDate) {
        startDateStr = moment(this._startDate).format(returnFormat)
      } else {
        startDateStr = null;
      }

      if (this._endDate) {
        endDateStr = moment(this._endDate).add(59, 'seconds').format(returnFormat);
      } else {
        endDateStr = null;
      }

      this.selectedDate = {
        startDate: this._startDate,
        endDate: this._endDate,
        type: sortOption.value.toString(),
        startDateStr: startDateStr,
        endDateStr: endDateStr,
        dateType: null,
      };

      if (sortOption.value !== 'BETWEEN') {
        this.changeSort.emit(this.selectedDate);

        this.previousSelectedDate = this.selectedDate;
      }
    }

    if (sortOption.value === 'BETWEEN') {
      // this.datePickerIsOn = true;
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
      (_fdate: string, date: Date) => {
        // set picker start date
        this._startPickerDate = date;
        // picker date validation
        this._pickerDateValidation(true);
      },
      // if hide picker
      (_inst, completed: boolean) => {
        if (completed === false) {
          this._setSelectedDateFromDatePicker();
        }
      }
    );
    // startPickerSettings.position = 'left top';
    this._startPicker = $(this._startPickerInput.nativeElement).datepicker(startPickerSettings).data('datepicker');
    ('-' !== startInitialValue) && (this._startPicker.selectDate(startInitialValue.toDate()));

    // end picker create
    const endPickerSettings: PickerSettings
      = new DatePickerSettings(
      'ddp-input-calen',
      (_fdate: string, date: Date) => {
        // set picker end date
        this._endPickerDate = date;
        // picker date validation
        this._pickerDateValidation(false);
      },
      (_inst, completed: boolean) => {
        // if hide picker
        if (completed === false) {
          this._setSelectedDateFromDatePicker();
        }
      }
    );
    // endPickerSettings.position = 'left top';
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ('-' !== endInitialValue) && (this._endPicker.selectDate(endInitialValue.toDate()));
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
      let startDateStr: string;
      let endDateStr: string;

      const returnFormat = 'YYYY-MM-DDTHH:mm';

      if (this._startPickerDate) {
        startDateStr = moment(this._startPickerDate).format(returnFormat);
        this.startDateStr = moment(this._startPickerDate).format('YYYY-MM-DD:mm');
      } else {
        startDateStr = null;
      }

      if (this._endPickerDate) {
        endDateStr = moment(this._endPickerDate).add(59, 'seconds').format(returnFormat);
        this.endDateStr = moment(this._endPickerDate).format('YYYY-MM-DD:mm');
      } else {
        endDateStr = null;
      }

      this.selectedUpdatedTimeOptionName = this.startDateStr + ' ~ ' + this.endDateStr;

      this.selectedDate = {
        startDate: this._startPickerDate,
        endDate: this._endPickerDate,
        type: 'BETWEEN',
        startDateStr: startDateStr,
        endDateStr: endDateStr,
        dateType: null,
      };

      if (this.pickDateAgain) {
        if (this.pickDateAgainCount === 0) {
          this.pickDateAgainCount++;
          this.datePickerIsOn = false;
          this.changeSort.emit(this.selectedDate);
        } else {
          this.pickDateAgainCount = 0;
          // hide filter
          this.updatedTimeFilterShowFlag = false;
          // set datePicker flag is false
          this.datePickerIsOn = false;

          this.changeSort.emit(this.selectedDate);
        }
      } else {
        // hide filter
        this.updatedTimeFilterShowFlag = false;
        // set datePicker flag is false
        this.datePickerIsOn = false;

        this.pickDateAgain = true;

        this.changeSort.emit(this.selectedDate);
      }
      this.previousSelectedDate = this.selectedDate;
    }
  }

  closeSelectedFilter() {
    if (!this.datePickerIsOn || (!this._startPickerDate && !this._endPickerDate)) {
      this.updatedTimeFilterShowFlag = false;

      if (this.selectedDate.type === Criteria.DateTimeType.BETWEEN && !this._startPickerDate && !this._endPickerDate) {
        if (this.previousSelectedDate.type === Criteria.DateTimeType.ALL) {
          this.selectedUpdatedTimeOptionName = 'All'
        } else if (this.previousSelectedDate.type === Criteria.DateTimeType.SEVEN_DAYS) {
          this.selectedUpdatedTimeOptionName = 'Last 7 days'
        } else if (this.previousSelectedDate.type === Criteria.DateTimeType.TODAY) {
          this.selectedUpdatedTimeOptionName = 'Today'
        }

        this.selectedDate.type = this.previousSelectedDate.type;
      }
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
  constructor(clz: string, onSelectDate: (fdate: string, date: Date) => void, onHide: (inst, completed: boolean) => void) {
    super(clz, onSelectDate, onHide);
    this.minView = 'days';
    this.view = 'days';
    // set show timepicker
    this.timepicker = true;
    // set date picker position
    this.position = 'right top';
  }
}

enum FilterTypes {
  DATA_TYPE = 'DATA_TYPE',
  UPDATED_TIME = 'UPDATED_TIME'
}
