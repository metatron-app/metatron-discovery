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

@Component({
  selector: 'time-radio-box-component',
  templateUrl: 'time-radio-box.component.html'
})
export class TimeRadioBoxComponent extends AbstractComponent {

  // start picker input
  @ViewChild('startPickerInput')
  private _startPickerInput: ElementRef;
  // end picker input
  @ViewChild('endPickerInput')
  private _endPickerInput: ElementRef;

  // changed time event
  @Output('changedTime')
  private _changedTimeEvent: EventEmitter<any> = new EventEmitter();

  // is enable from to option
  @Input('enableFromToOption')
  public isEnableFromToOption: boolean;
  // is enable ALL option
  @Input('enableAllOption')
  public isEnableAllOption: boolean = false;

  // time type list
  public timeTypeList: any = [
    {label: `(${this.translateService.instant('msg.comm.ui.list.all')})`, value: 'ALL', enable: false},
    {label: this.translateService.instant('msg.storage.ui.criterion.today'), value: 'TODAY', enable: true},
    {label: this.translateService.instant('msg.storage.ui.criterion.last-7-days'), value: 'DAYS', enable: true},
    {label: this.translateService.instant('msg.storage.ui.criterion.between'), value: 'BETWEEN', enable: true},
  ];
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
    // init
    this._initView();
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
    // loop time type list
    this.timeTypeList.forEach((timeType) => {
      // if type value is ALL and enable all option
      if (timeType.value === 'ALL' && this.isEnableAllOption) {
        timeType.enable = true;
      } else if (timeType.value === 'BETWEEN' && this.isEnableFromToOption) { // if enable from to option
        timeType.enableFromTo = true;
      }
    });
  }

  public onChangeTimeType(timeType: any): void {
    // change selected time type
    this.selectedTimeType = timeType;
    // TODO set time
  }

  /**
   * Init ui
   * @private
   */
  private _initView(): void {
    this.selectedTimeType = this.timeTypeList[0];
  }
}
