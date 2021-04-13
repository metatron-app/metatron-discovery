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

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../abstract.component';
import { PickerSettings } from '@domain/common/datepicker.settings';

declare let moment: any;
declare let $: any;

@Component({
  selector: 'component-date',
  templateUrl: './date.component.html'
})
export class DateComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  // TODO 워크벤치에서 사용할 용도로 데이터 컴포넌트를 구현해 놓음 우선 워크벤치에서 사용할 최소한의 기능만 구현.. 필요한 기능이 있을 경우 기존 코드에 영향없이 수정바랍니다~

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // Picker 객체
  private _datePicker;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('date')
  public dateInput: ElementRef;

  @Input('isReadOnly')
  public isReadOnly: boolean = false;

  @Output()
  public onDateChange = new EventEmitter();

  @Input()
  public date: string;

  @Input()
  public placeholder: string;

  // return time format (default : YYYY-MM-DD)
  @Input('timeFormat')
  public timeFormat: string = 'YYYY-MM-DD';


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

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {

    let initialValue: any = '-';

    // 날짜값이 있으면 날짜로 셋팅
    if (this.date) initialValue = moment(this.date);

    const pickerSettings: PickerSettings
      = new PickerSettings(
      'ddp-input-typebasic',
      (_fdate: string, date: Date) => {
        // has changed, return time
        this.onDateChange.emit(moment(date).format(this.timeFormat));
      },
      () => {}
    );
    pickerSettings.position = 'left top';
    this._datePicker = $(this.dateInput.nativeElement).datepicker(pickerSettings).data('datepicker');
    ( '-' !== initialValue ) && ( this._datePicker.selectDate(initialValue.toDate()) );
  }


  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
    ( this._datePicker ) && ( this._datePicker.destroy() );
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * calendar icon
   * @param {MouseEvent} event
   */
  public onClickCalendarIcon(event:MouseEvent) {
    event.stopPropagation();
    if( event.target['tagName'] !== 'INPUT' ) {
      ( this._datePicker ) && ( this._datePicker.show() );
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
