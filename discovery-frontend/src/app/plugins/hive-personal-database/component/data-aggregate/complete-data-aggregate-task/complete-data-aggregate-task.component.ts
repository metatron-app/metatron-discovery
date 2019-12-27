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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from "../../../../../common/component/abstract-popup.component";
import {EventBroadcaster} from "../../../../../common/event/event.broadcaster";
import {DataAggregate, RangeType} from "../data-aggregate.component";
import {PickerSettings} from "../../../../../domain/common/datepicker.settings";
import {StringUtil} from "../../../../../common/util/string.util";
import {Alert} from "../../../../../common/util/alert.util";
import {HivePersonalDatabaseService} from "../../../service/plugins.hive-personal-database.service";
import {SelectComponent} from "../../../../../common/component/select/select.component";

declare let moment: any;
declare let $: any;

@Component({
  selector: 'plugin-hive-personal-database-complete-data-aggregate-task',
  templateUrl: './complete-data-aggregate-task.component.html',
})
export class CompleteDataAggregateTaskComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private workbenchId: string;
  private dataAggregate: DataAggregate;
  private hours: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];

  @ViewChild('startPickerInput')
  private readonly _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private readonly _endPickerInput: ElementRef;

  private _startPickerDate: Date;
  private _endPickerDate: Date;

  // DatePicker object
  private _startPicker;
  private _endPicker;

  @ViewChild('startHourSelect')
  private startHourSelect: SelectComponent;

  @ViewChild('endHourSelect')
  private endHourSelect: SelectComponent;

  private startHour: string = '';
  private endHour: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster,
              private hivePersonalDatabaseService: HivePersonalDatabaseService) {
    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    this.isShow = false;
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  public close() {
    this.isShow = false;
  }

  public init(workbenchId: string, dataAggregate: DataAggregate) {
    this.isShow = true;
    this.workbenchId = workbenchId;
    this.dataAggregate = dataAggregate;
    this.safelyDetectChanges();
    if(this.isRangeTypeDate()) {
      this._setDatePickerSettings();
    }
  }

  public isRangeTypeDate(): boolean {
    return this.dataAggregate.getRangeType() === RangeType.DATE ? true : false;
  }

  public isRangeTypeHour(): boolean {
    return this.dataAggregate.getRangeType() === RangeType.HOUR ? true : false;
  }

  public onSelectedStartHour(hour: string): void {
    this.startHour = hour;
    this.pickerHourValidation();
  }

  public onSelectedEndHour(hour: string): void {
    this.endHour = hour;
    this.pickerHourValidation();
  }

  public isEnableNext(): boolean {
    if(this.dataAggregate) {
      if(this.dataAggregate.getRangeType() === RangeType.DATE) {
        if(StringUtil.isNotEmpty(this.dataAggregate.name)
          && (this._startPickerDate && this._endPickerDate)
          && StringUtil.isNotEmpty(this.dataAggregate.rangeFormat)) {
          return true;
        } else {
          return false;
        }
      } else if(this.dataAggregate.getRangeType() === RangeType.HOUR) {
        if(StringUtil.isNotEmpty(this.dataAggregate.name)
          && StringUtil.isNotEmpty(this.startHour)
          && StringUtil.isNotEmpty(this.endHour)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }


    } else {
      return false;
    }
  }

  public previous() {
    this.broadCaster.broadcast('SHOW_HIVE_PERSONAL_DATABASE_CREATION_DATA_AGGREGATE_TASK', this.dataAggregate);
    this.isShow = false;
    this.close();
  }

  public done() {
    if (this.isEnableNext()) {
      if(this.dataAggregate.getRangeType() === RangeType.DATE) {
        this.dataAggregate.rangeFrom = moment(this._startPickerDate).format('YYYYMMDD');
        this.dataAggregate.rangeTo = moment(this._endPickerDate).format('YYYYMMDD');
      } else if(this.dataAggregate.getRangeType() === RangeType.HOUR) {
        this.dataAggregate.rangeFrom = this.startHour;
        this.dataAggregate.rangeTo = this.endHour
      } else {
        // TODO 에러....
      }

      this.loadingShow();
      this.hivePersonalDatabaseService.createDataAggregateTask(this.workbenchId, this.dataAggregate).then((res) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.broadCaster.broadcast('COMPLETE_HIVE_PERSONAL_DATABASE_CREATE_DATA_AGGREGATE_TASK');
        this.close();
      }).catch((error) => {
        this.loadingHide();
        this.commonExceptionHandler(error);
        // if(error.code) {
        //   switch (error.code) {
        //     case "WB0004":
        //       Alert.error(this.translateService.instant('msg.bench.alert.already-exists-table'));
        //       break;
        //     default:
        //       this.commonExceptionHandler(error);
        //   }
        // } else {
        //   this.commonExceptionHandler(error);
        // }
      });
    }
  }

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
          // this._changeSelectItemEvent.emit(this._getSelectedTimeData());
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
          // this._changeSelectItemEvent.emit(this._getSelectedTimeData());
        }
      }
    );
    // endPickerSettings.position = 'left top';
    this._endPicker = $(this._endPickerInput.nativeElement).datepicker(endPickerSettings).data('datepicker');
    ( '-' !== endInitialValue ) && ( this._endPicker.selectDate(endInitialValue.toDate()) );
  }

  private _pickerDateValidation(isStartDate: boolean): void {
    // if exist start date, end date
    if (this._startPickerDate && this._endPickerDate && (this._startPickerDate.getTime() - this._endPickerDate.getTime()) > 0) {
      // Set as start date if selected is greater than end date
      isStartDate ? this._endPicker.selectDate(this._startPickerDate) : this._startPicker.selectDate(this._endPickerDate);
    }
  }

  private pickerHourValidation(): void {
    if(this.startHour && this.endHour && (parseInt(this.startHour) - parseInt(this.endHour)) > 0) {
      this.endHour = this.startHour;
      this.endHourSelect.selected(this.endHour);
    }
  }
}

class DatePickerSettings extends PickerSettings {
  constructor(clz: string, onSelectDate: Function, onHide: Function) {
    super(clz, onSelectDate, onHide);
    this.minView = 'days';
    this.view = 'days';
    // set show timepicker
    this.timepicker = false;
    // set date picker position
    this.position = 'right top';
  }
}
