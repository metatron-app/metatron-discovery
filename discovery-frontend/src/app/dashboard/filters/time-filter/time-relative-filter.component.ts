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

import {AbstractFilterPopupComponent} from '../abstract-filter-popup.component';
import {
  ElementRef,
  OnDestroy,
  OnInit,
  Injector,
  Component,
  Input,
  SimpleChanges,
  SimpleChange,
  EventEmitter, Output, ViewChild, AfterViewInit
} from '@angular/core';
import {TimeUnit} from '../../../domain/workbook/configurations/field/timestamp-field';
import {
  TimeRelativeFilter,
  TimeRelativeTense
} from '../../../domain/workbook/configurations/filter/time-relative-filter';
import {isNullOrUndefined} from 'util';
import {EventBroadcaster} from '../../../common/event/event.broadcaster';

declare let moment;

@Component({
  selector: 'app-time-relative-filter',
  templateUrl: './time-relative-filter.component.html'
})
export class TimeRelativeFilterComponent extends AbstractFilterPopupComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('filterArea')
  private _filterArea: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShowLastComboOpts: boolean = false;    // 과거 시점 입력 콤보박스 옵션 표시 여부
  public isShowNextComboOpts: boolean = false;    // 미래 시점 입력 콤보박스 옵션 표시 여부
  public timeUnitComboList = [
    /* { name: this.translateService.instant('msg.board.filter.ui.timeunit.seconds'), value: TimeUnit.SECOND }, */
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.minutes'), value: TimeUnit.MINUTE},
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.hours'), value: TimeUnit.HOUR},
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.days'), value: TimeUnit.DAY},
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.weeks'), value: TimeUnit.WEEK},
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.months'), value: TimeUnit.MONTH},
    /* { name: this.translateService.instant('msg.board.filter.ui.timeunit.quarters'), value: TimeUnit.QUARTER }, */
    {name: this.translateService.instant('msg.board.filter.ui.timeunit.years'), value: TimeUnit.YEAR}
  ];
  public selectedTimeUnitItem;

  public targetFilter: TimeRelativeFilter;    // 수정 대상 필터

  // 초기 입력 정보 정의
  @Input('filter')
  public inputFilter: TimeRelativeFilter;     // 입력 필터

  @Input('mode')
  public mode: string = 'CHANGE';             // CHANGE, PANEL, WIDGET

  // 필터 변경 이벤트
  @Output('change')
  public changeEvent: EventEmitter<TimeRelativeFilter> = new EventEmitter();

  public isShortLabel: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
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
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const filterChanges: SimpleChange = changes.inputFilter;
    if (filterChanges && filterChanges.currentValue) {
      this.setData(filterChanges.currentValue, !filterChanges.firstChange);
    }
  } // function - ngOnChanges


  /**
   * After View Init
   */
  public ngAfterViewInit() {

    // Set whether short labels
    this.isShortLabel = ('PANEL' === this.mode);
    this.safelyDetectChanges();

    // Widget Resize Event
    const $filterArea = $(this._filterArea.nativeElement);
    this.subscriptions.push(
      this.broadCaster.on<any>('RESIZE_WIDGET').subscribe(() => {
        if ('WIDGET' === this.mode) {
          this.isShortLabel = (320 > $filterArea.width());
          this.safelyDetectChanges();
        }
      })
    );
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 강제 데이터 설정
   * @param {TimeRelativeFilter} filter
   * @param {boolean} isBroadcast
   */
  public setData(filter: TimeRelativeFilter, isBroadcast: boolean = false) {
    let tempFilter: TimeRelativeFilter = filter;

    {
      // 기본값 설정
      (tempFilter.hasOwnProperty('value') && 0 < tempFilter.value) || (tempFilter.value = 1);
      (tempFilter.tense) || (tempFilter.tense = TimeRelativeTense.PREVIOUS);
      if (isNullOrUndefined(tempFilter.relTimeUnit)) {
        tempFilter.relTimeUnit = TimeUnit.WEEK;
      }
      this.selectedTimeUnitItem = this.timeUnitComboList.find(item => item.value === tempFilter.relTimeUnit);
    }

    this.targetFilter = tempFilter;

    (isBroadcast) && (this.changeEvent.emit(this.targetFilter));

    this.safelyDetectChanges();
  } // function - setData

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {InclusionFilter}
   */
  public getData(): TimeRelativeFilter {
    return this.targetFilter;
  } // function - getData

  /**
   * 프리뷰를 얻는다.
   */
  public getPreview() {

    // 포맷 설정
    let strFormat: string = '';
    let strManipulateKey: string = '';
    switch (this.targetFilter.relTimeUnit) {
      case TimeUnit.YEAR:
        strFormat = 'YYYY';
        strManipulateKey = 'y';
        break;
      case TimeUnit.QUARTER:
        strFormat = 'YYYY [Q]Q';
        strManipulateKey = 'Q';
        break;
      case TimeUnit.MONTH:
        strFormat = 'YYYY-MM';
        strManipulateKey = 'M';
        break;
      case TimeUnit.WEEK:
        strFormat = 'YYYY-MM [W]ww';
        strManipulateKey = 'w';
        break;
      case TimeUnit.DAY:
        strFormat = 'YYYY-MM-DD';
        strManipulateKey = 'd';
        break;
      case TimeUnit.HOUR:
        strFormat = 'YYYY-MM-DD HH';
        strManipulateKey = 'h';
        break;
      case TimeUnit.MINUTE:
        strFormat = 'YYYY-MM-DD HH:mm';
        strManipulateKey = 'm';
        break;
      case TimeUnit.SECOND:
        strFormat = 'YYYY-MM-DD HH:mm:ss';
        strManipulateKey = 's';
        break;
    }

    // 날짜 설정
    let objDate = moment();
    let strPreview: string = '';
    switch (this.targetFilter.tense) {
      case TimeRelativeTense.PREVIOUS :
        objDate.subtract(this.targetFilter.value, strManipulateKey);
        strPreview = objDate.format(strFormat);
        strPreview = strPreview + ' ~ ' + moment().format(strFormat);
        break;
      case TimeRelativeTense.NEXT :
        objDate.add(this.targetFilter.value, strManipulateKey);
        strPreview = objDate.format(strFormat);
        strPreview = moment().format(strFormat) + ' ~ ' + strPreview;
        break;
      default :
        strPreview = objDate.format(strFormat);
        break;
    }

    return strPreview;
  } // function - getPreview

  /**
   * Relative 설정함
   * @param {string} tense
   * @param {string} timeUnit
   * @param {number} value
   */
  public setRelative(tense: string, timeUnit: string, value?: number) {
    this.targetFilter.relTimeUnit = TimeUnit[timeUnit];
    this.targetFilter.tense = TimeRelativeTense[tense];
    if (value) {
      this.targetFilter.value = value;
    }
    this.selectedTimeUnitItem = this.timeUnitComboList.find(item => item.value === this.targetFilter.relTimeUnit);

    // 값 변경 전달
    this.changeEvent.emit(this.targetFilter);
  } // function - setRelative

  /**
   * Relative 에 대한 유효성 판단
   * @param {string} tense
   * @param {string} timeUnit
   * @param {string} inputType
   * @return {boolean}
   */
  public isSelectedRelative(inputType: string, tense: string, timeUnit?: string): boolean {
    let isSelected: boolean = (
      this.targetFilter.tense === TimeRelativeTense[tense]
      && (('BUTTON' === inputType) ? 1 === Number(this.targetFilter.value) : 1 < Number(this.targetFilter.value) )
    );
    if (timeUnit) {
      isSelected = isSelected && (this.targetFilter.relTimeUnit === TimeUnit[timeUnit]);
    }
    return isSelected;
  } // function - isSelectedRelative

  /**
   * 필터 값 설정
   * @param {number} filterValue
   */
  public setFilterValue(filterValue: number) {
    this.targetFilter.value = filterValue;

    // 값 변경 전달
    this.changeEvent.emit(this.targetFilter);
  } // function - setFilterValue

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
