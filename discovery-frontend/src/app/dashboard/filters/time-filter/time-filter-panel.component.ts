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
  Injector,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { BIType, Field, FieldRole } from '../../../domain/datasource/datasource';
import { AbstractFilterPanelComponent } from '../abstract-filter-panel.component';
import { ByTimeUnit, TimeUnit } from '../../../domain/workbook/configurations/field/timestamp-field';
import { TimeListFilterComponent } from './time-list-filter.component';
import { TimeRelativeFilterComponent } from './time-relative-filter.component';
import { TimeRangeFilterComponent } from './time-range-filter.component';
import { TimeFilter } from '../../../domain/workbook/configurations/filter/time-filter';
import { FilterUtil } from '../../util/filter.util';
import { TimeRangeFilter } from '../../../domain/workbook/configurations/filter/time-range-filter';
import { TimeRelativeFilter } from '../../../domain/workbook/configurations/filter/time-relative-filter';
import { TimeListFilter } from '../../../domain/workbook/configurations/filter/time-list-filter';
import { isNullOrUndefined } from "util";
import { Filter } from '../../../domain/workbook/configurations/filter/filter';
import { PopupService } from '../../../common/service/popup.service';
import { SubscribeArg } from '../../../common/domain/subscribe-arg';
import {CommonConstant} from "../../../common/constant/common.constant";

@Component({
  selector: 'time-filter-panel',
  templateUrl: './time-filter-panel.component.html'
})
export class TimeFilterPanelComponent extends AbstractFilterPanelComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(TimeListFilterComponent)
  private _candidateComp: TimeListFilterComponent;

  @ViewChild(TimeRelativeFilterComponent)
  private _relativeComp: TimeRelativeFilterComponent;

  @ViewChild(TimeRangeFilterComponent)
  private _rangeComp: TimeRangeFilterComponent;

  // 임시 값을 저장하기 위한 변수
  private _tempRelativeFilter:TimeRelativeFilter;
  private _tempRangeFilter:TimeRangeFilter;
  private _tempListFilter:TimeListFilter;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필터
  public filter: TimeFilter;

  public isTimeStamp = false;

  public isContinuousByAll: boolean = false;      // Granularity 가 지정되지 않은 연속성 여부 판단
  public isDiscontinuousFilter: boolean = false;  // 불연속 필터 여부
  public isAllType: boolean = false;              // All Time Filter
  public isRelativeType: boolean = false;         // Relative Time Filter
  public isRangeType: boolean = false;            // Range Time Filter
  public isListType: boolean = false;             // List Time Filter

  @Input('filter')
  public originalFilter: TimeFilter;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
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
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
    // 컴포넌트 초기화
    this._initialize(this.originalFilter);

    // 위젯에서 필터를 업데이트 popup은 아니지만 동일한 기능이 필요해서 popupService를 사용
    const popupSubscribe = this.popupService.filterView$.subscribe((data: SubscribeArg) => {

      // 페이지에서 호출했는데 대시보드인경우 처리 하지 않음
      if (data.type === 'page' && this.isDashboardMode) return;

      // 필터 위젯에서 값이 변경될 경우
      if ('change-filter' === data.name && this.filter.field === data.data.field && this.filter.dataSource === data.data.dataSource) {
        this._initialize(data.data);
      }
    });
    this.subscriptions.push(popupSubscribe);

  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;

  /**
   * 필터 변경 이벤트 핸들러
   * @param {TimeFilter} filter
   */
  public changeFilterEvent(filter: TimeFilter) {
    if (isNullOrUndefined(filter) || !FilterUtil.isTimeFilter(filter)) {
      return;
    }

    console.info( '>>>>>>> changeFilterEvent', filter );

    // this.filter = _.cloneDeep(filter);
    // this._setStatus();
    this._updateFilter(filter);
  } // function - changeFilterEvent

  /**
   * 필터 초기값으로 리셋
   */
  public resetFilter() {
    const filter: TimeFilter = _.cloneDeep(this.originalFilter);
    switch (filter.type) {
      case 'time_list' :
        this._candidateComp.setData(<TimeListFilter>filter);
        break;
      case 'time_relative' :
        this._relativeComp.setData(<TimeRelativeFilter>filter);
        break;
      case 'time_range' :
        this._rangeComp.setData(<TimeRangeFilter>filter);
        break;
    }
    this.filter = filter;
    this.safelyDetectChanges();
    this._updateFilter(filter);
  } // function resetFilter

  /**
   * 상세메뉴 온오프
   */
  public toggleDetailMenu() {
    this.isShowDetailMenu = !this.isShowDetailMenu;
  } // function resetFilter

  /**
   * TimeUnit 변경
   * @param {any} data
   */
  public changeTimeUnit(data: { discontinuous: boolean, unit: TimeUnit, byUnit?: ByTimeUnit }) {
    let currFilter: TimeFilter = _.cloneDeep(this.filter);
    if(TimeUnit.NONE !== data.unit) {
      currFilter = FilterUtil.getTimeListFilter( currFilter.clzField, data.discontinuous, data.unit, data.byUnit, currFilter.ui.importanceType );
    } else {
      currFilter = FilterUtil.getTimeAllFilter( currFilter.clzField, currFilter.ui.importanceType );
    }
    this._initialize(currFilter, true);
  } // function - changeTimeUnit

  /**
   * TimeAllFilter 설정
   */
  public setTimeAllFilter() {
    this.filter = FilterUtil.getTimeAllFilter( this.filter.clzField, this.filter.ui.importanceType );
    this._setStatus();
    this._updateFilter( this.filter );
  } // function - setTimeAllFilter

  /**
   * TimeRangeFilter 설정
   */
  public setTimeRangeFilter() {
    if( this._tempRangeFilter) {
      this.filter = this._tempRangeFilter;
    } else {
      this.filter = FilterUtil.getTimeRangeFilter( this.filter.clzField, this.filter.timeUnit, this.filter.ui.importanceType );
    }
    this._setStatus();
  } // function - setTimeRangeFilter

  /**
   * TimeRelativeFilter 설정
   */
  public setTimeRelativeFilter() {
    if( this._tempRelativeFilter ) {
      this.filter = this._tempRelativeFilter;
    } else {
      this.filter = FilterUtil.getTimeRelativeFilter( this.filter.clzField, this.filter.timeUnit, this.filter.ui.importanceType );
    }
    this._setStatus();
  } // function - setTimeRelativeFilter

  /**
   * TimeListFilter 설정
   */
  public setTimeListFilter() {
    if( this._tempListFilter ) {
      this.filter = this._tempListFilter;
    } else {
      this.filter = FilterUtil.getTimeListFilter(
        this.filter.clzField, this.filter.discontinuous,
        this.filter.timeUnit, this.filter.byTimeUnit,
        this.filter.ui.importanceType
      );
    }
    this._setStatus();
  } // function - setTimeListFilter

  /**
   * 필터 삭제
   * @param {Filter} filter
   */
  public deleteFilter(filter: Filter) {
    ( this.originalFilter.ui.widgetId ) && ( filter.ui.widgetId = this.originalFilter.ui.widgetId );
    this.deleteFilterEvent.emit(filter);
  } // function - deleteFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 필터 업데이트
   * @param {TimeFilter} filter
   * @private
   */
  private _updateFilter(filter:TimeFilter) {
    ( this.originalFilter.ui.widgetId ) && ( filter.ui.widgetId = this.originalFilter.ui.widgetId );

    if( !filter.discontinuous ) {
      switch( filter.type ) {
        case 'time_relative' :
          this._tempRelativeFilter = _.cloneDeep(<TimeRelativeFilter>filter);
          break;
        case 'time_range' :
          this._tempRangeFilter = _.cloneDeep(<TimeRangeFilter>filter);
          break;
        case 'time_list' :
          this._tempListFilter = _.cloneDeep(<TimeListFilter>filter);
          break;
      }
    }

    this.updateFilterEvent.emit(filter);
  } // function - _updateFilter

  /**
   * 컴포넌트 초기화
   * @param {TimeFilter} filter
   * @param {boolean} isTriggerUpdateEvent
   * @private
   */
  private _initialize(filter: TimeFilter, isTriggerUpdateEvent: boolean = false) {
    // 위젯 화면 숨김
    this.isShowFilter = false;
    this.safelyDetectChanges();   // 화면 적용을 위해 실행

    // 임시값 초기화
    this._tempRelativeFilter = null;
    this._tempRangeFilter = null;
    this._tempListFilter = null;

    this.filter = filter;

    this.setPanelData(filter);    // 패널에서 사용하는 데이터 설정

    if( this.dataSource )  {

      // 타임스탬프인지 판단
      if (this.field && this.field.biType === BIType.TIMESTAMP
        && this.field.role === FieldRole.TIMESTAMP) {
        this.isTimeStamp = true;
      } else if (this.field == null && filter.field === CommonConstant.COL_NAME_CURRENT_DATETIME) {
        this.isTimeStamp = true;
      }

      this._setStatus();

      // 위젯 화면 표시
      this.isShowFilter = true;

      if (isTriggerUpdateEvent) {
        this.updateFilterEvent.emit(filter);
      }
    }

    this.safelyDetectChanges();
  } // function - _initialize

  /**
   * 상태값 설정
   * @private
   */
  private _setStatus() {
    this.isContinuousByAll = FilterUtil.isContinuousByAll(this.filter);
    this.isDiscontinuousFilter = FilterUtil.isDiscontinuousTimeFilter(this.filter);
    this.isAllType = FilterUtil.isTimeAllFilter(this.filter);
    this.isRelativeType = FilterUtil.isTimeRelativeFilter(this.filter);
    this.isRangeType = FilterUtil.isTimeRangeFilter(this.filter);
    this.isListType = FilterUtil.isTimeListFilter(this.filter);
    this.safelyDetectChanges();
  } // function - _setStatus
}
