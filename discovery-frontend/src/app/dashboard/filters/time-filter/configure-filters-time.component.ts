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
import { Component, ElementRef, Injector, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractFilterPopupComponent } from '../abstract-filter-popup.component';
import { Dashboard } from '../../../domain/dashboard/dashboard';
import { CustomField } from '../../../domain/workbook/configurations/field/custom-field';
import { Field } from '../../../domain/datasource/datasource';
import { TimeUnit, ByTimeUnit } from '../../../domain/workbook/configurations/field/timestamp-field';
import { TimeListFilterComponent } from './time-list-filter.component';
import { TimeRelativeFilterComponent } from './time-relative-filter.component';
import { TimeRangeFilterComponent } from './time-range-filter.component';
import { TimeFilter } from '../../../domain/workbook/configurations/filter/time-filter';
import { FilterUtil } from '../../util/filter.util';

@Component({
  selector: 'app-config-filter-time',
  templateUrl: './configure-filters-time.component.html'
})
export class ConfigureFiltersTimeComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild( TimeListFilterComponent )
  private _candidateComp:TimeListFilterComponent;

  @ViewChild( TimeRelativeFilterComponent )
  private _relativeComp:TimeRelativeFilterComponent;

  @ViewChild( TimeRangeFilterComponent )
  private _rangeComp:TimeRangeFilterComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShow: boolean = false;         // 컴포넌트 표시 여부

  // 수정 정보
  public targetFilter: TimeFilter;      // 필터
  public targetField: Field | CustomField;  // 필드
  public dashboard: Dashboard;              // 대시보드

  // T/F
  public isShowGranularitySelect:boolean = true;  // Granularity-Select 표시 여부
  public isContinuousByAll: boolean = false;      // Granularity 가 지정되지 않은 연속성 여부 판단
  public isDiscontinuousFilter:boolean = false;   // 불연속 필터 여부
  public isAllType:boolean = false;         // All Time Filter
  public isRelativeType:boolean = false;    // Relative Time Filter
  public isRangeType:boolean = false;       // Range Time Filter
  public isListType:boolean = false;        // List Time Filter

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

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트를 표시한다.
   * @param {Dashboard} board
   * @param {TimeFilter} targetFilter
   * @param {Field | CustomField} targetField
   * @param {boolean} isShowGranularitySelect
   */
  public showComponent(board: Dashboard, targetFilter: TimeFilter,
                       targetField?: (Field | CustomField), isShowGranularitySelect:boolean=true) {
    this.isShowGranularitySelect = isShowGranularitySelect;
    this.dashboard = _.cloneDeep( board );
    this.targetField = _.cloneDeep( targetField );
    this.targetFilter = _.cloneDeep( targetFilter );
    ( this.targetFilter.timeUnit ) || ( this.targetFilter.timeUnit = TimeUnit.NONE );

    this.isShow = true;
    this._setStatus();
    this.safelyDetectChanges();

  } // function - showComponent

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {TimeFilter}
   */
  public getData(): TimeFilter {

    let returnData:TimeFilter;
    switch (this.targetFilter.type) {
      case 'time_list' :
        returnData = this._candidateComp.getData();
        break;
      case 'time_relative' :
        returnData = this._relativeComp.getData();
        break;
      case 'time_range' :
        returnData = this._rangeComp.getData();
        break;
      default :
        returnData = this.targetFilter;
        break;
    }
    return _.cloneDeep( returnData );
  } // function - getData

  /**
   * TimeAllFilter 설정
   */
  /*
  public setTimeAllFilter() {
    this.targetFilter = FilterUtil.getTimeAllFilter( this.targetFilter.clzField, this.targetFilter.ui.importanceType );
    this._setStatus();
  } // function - setTimeAllFilter
   */

  /**
   * TimeRangeFilter 설정
   */
  public setTimeRangeFilter() {
    this.targetFilter = FilterUtil.getTimeRangeFilter(
      this.targetFilter.clzField, this.targetFilter.timeUnit, this.targetFilter.ui.importanceType,
      this.dashboard.dataSources.find( ds => ds.engineName === this.targetFilter.dataSource )
    );
    this._setStatus();
  } // function - setTimeRangeFilter

  /**
   * TimeRelativeFilter 설정
   */
  public setTimeRelativeFilter() {
    this.targetFilter = FilterUtil.getTimeRelativeFilter( this.targetFilter.clzField, this.targetFilter.timeUnit, this.targetFilter.ui.importanceType );
    this._setStatus();
  } // function - setTimeRelativeFilter

  /**
   * TimeListFilter 설정
   */
  public setTimeListFilter() {
    this.targetFilter = FilterUtil.getTimeListFilter(
      this.targetFilter.clzField, this.targetFilter.discontinuous,
      this.targetFilter.timeUnit, this.targetFilter.byTimeUnit,
      this.targetFilter.ui.importanceType
    );
    this._setStatus();
  } // function - setTimeListFilter

  /**
   * 타임유닛 변경
   * @param {any} data
   */
  public changeTimeUnit(data:{discontinuous:boolean, unit?:TimeUnit, byUnit?:ByTimeUnit}) {
    let currFilter:TimeFilter = _.cloneDeep( this.targetFilter );
    if(TimeUnit.NONE !== data.unit) {
      currFilter = FilterUtil.getTimeListFilter( currFilter.clzField, data.discontinuous, data.unit, data.byUnit, currFilter.ui.importanceType );
    } else {
      currFilter = FilterUtil.getTimeRangeFilter(
        currFilter.clzField, TimeUnit.NONE, currFilter.ui.importanceType,
        this.dashboard.dataSources.find( ds => ds.engineName === this.targetFilter.dataSource )
      );
    }
    this.targetFilter = currFilter;
    this._setStatus();
  } // function - changeTimeUnit
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 상태값 설정
   * @private
   */
  private _setStatus() {
    this.isContinuousByAll = FilterUtil.isContinuousByAll(this.targetFilter);
    this.isDiscontinuousFilter = FilterUtil.isDiscontinuousTimeFilter(this.targetFilter);
    this.isAllType = FilterUtil.isTimeAllFilter(this.targetFilter);
    this.isRelativeType = FilterUtil.isTimeRelativeFilter(this.targetFilter);
    this.isRangeType = FilterUtil.isTimeRangeFilter(this.targetFilter);
    this.isListType = FilterUtil.isTimeListFilter(this.targetFilter);
  } // function - _setStatus

}
