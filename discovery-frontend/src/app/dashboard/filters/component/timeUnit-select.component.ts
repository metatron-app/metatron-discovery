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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {CommonUtil} from '@common/util/common.util';
import {ByTimeUnit, TimeUnit} from '@domain/workbook/configurations/field/timestamp-field';
import {AbstractComponent} from '@common/component/abstract.component';
import {TimeFilter} from '@domain/workbook/configurations/filter/time-filter';
import {FilterUtil} from '../../util/filter.util';

@Component({
  selector: 'timeUnit-select',
  templateUrl: './timeUnit-select.component.html'
})
export class TimeUnitSelectComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public filter: TimeFilter;
  /*
  public dpContinuousList: string[] = ['Minute', 'Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'None'];
  public dpDiscontinuousList: any[] = [
    { name: 'Day by week', unit: 'DAY', byUnit: 'WEEK' },
    { name: 'Day by month', unit: 'DAY', byUnit: 'MONTH' },
    { name: 'Day by year', unit: 'DAY', byUnit: 'YEAR' },
    { name: 'Week by month', unit: 'WEEK', byUnit: 'MONTH' },
    { name: 'Week by year', unit: 'WEEK', byUnit: 'YEAR' },
    { name: 'Month by year', unit: 'MONTH', byUnit: 'YEAR' },
    { name: 'Quarter', unit: 'QUARTER' },
    { name: 'Year', unit: 'YEAR' }
  ];
  */
  public dpContinuousList: string[] = ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year', 'None'];
  public dpDiscontinuousList: any[] = [
    {name: 'Day by week', unit: 'DAY', byUnit: 'WEEK'},
    {name: 'Day by month', unit: 'DAY', byUnit: 'MONTH'},
    {name: 'Day by year', unit: 'DAY', byUnit: 'YEAR'},
    {name: 'Week by month', unit: 'WEEK', byUnit: 'MONTH'},
    {name: 'Week by year', unit: 'WEEK', byUnit: 'YEAR'},
    {name: 'Month by year', unit: 'MONTH', byUnit: 'YEAR'},
    {name: 'Year', unit: 'YEAR'}
  ];
  public timeUnitLabel: string = 'NONE';

  public isOpenOpts: boolean = false;

  @Input()
  public mode: string = 'CHANGE';

  @Input('filter')
  public inputFilter: TimeFilter;

  @Output()
  public change: EventEmitter<TimeUnitSelectResult> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
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

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const dataChanges: SimpleChange = changes.inputFilter;
    if (dataChanges) {
      this.filter = dataChanges.currentValue;
      if (this.isNullOrUndefined(this.filter.timeUnit)) {
        this.filter.timeUnit = TimeUnit.NONE;
      }
      this.timeUnitLabel = 'Granularity :' + this.filter.timeUnit.toString();
    }
  } // function - ngOnChanges

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 연속 타입에서 선택여부 판단
   * @param {string} item
   * @returns {boolean}
   */
  public isSelectedContinuous(item: string): boolean {
    return !FilterUtil.isDiscontinuousTimeFilter(this.filter)
      && this.filter.timeUnit === TimeUnit[item.toUpperCase()];
  } // function - isSelectedContinuous

  /**
   * 불연속 타입에서 선택여부 판단
   * @param {any} item
   * @returns {boolean}
   */
  public isSelectedDiscontinuous(item: { name: string, unit: string, byUnit: string }): boolean {
    if (FilterUtil.isDiscontinuousTimeFilter(this.filter)) {
      if (item.byUnit) {
        return this.filter.timeUnit === TimeUnit[item.unit.toUpperCase()]
          && this.filter.byTimeUnit === ByTimeUnit[item.byUnit.toUpperCase()];
      } else {
        return this.filter.timeUnit === TimeUnit[item.unit.toUpperCase()];
      }
    } else {
      return false;
    }
  } // function - isSelectedDiscontinuous

  /**
   * TimeUnit 선택
   * @param {boolean} discontinuous
   * @param {string} unit
   * @param {string} byUnit
   */
  public selectTimeUnit(discontinuous: boolean = false, unit: string, byUnit?: string) {
    this.isOpenOpts = false;
    this.change.emit(
      new TimeUnitSelectResult(
        discontinuous,
        TimeUnit[unit.toUpperCase()],
        byUnit ? ByTimeUnit[byUnit.toUpperCase()] : null
      )
    );
  } // function - selectTimeUnit

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

export class TimeUnitSelectResult {
  public discontinuous: boolean;
  public unit: TimeUnit;
  public byUnit?: ByTimeUnit;

  constructor(discontinuous?: boolean, unit?: TimeUnit, byUnit?: ByTimeUnit) {
    this.unit = (CommonUtil.isNullOrUndefined(unit)) ? TimeUnit.NONE : unit;
    (CommonUtil.isNullOrUndefined(byUnit)) || (this.byUnit = byUnit);
    (CommonUtil.isNullOrUndefined(discontinuous)) || (this.discontinuous = discontinuous);
  }
} // class - TimeUnitSelectResult
