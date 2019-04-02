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
  OnInit,
  OnDestroy,
  Input,
  SimpleChange,
  SimpleChanges,
  EventEmitter, Output
} from '@angular/core';
import {AbstractFilterPopupComponent} from '../abstract-filter-popup.component';
import {Dashboard} from '../../../domain/dashboard/dashboard';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {TimeRangeFilter} from '../../../domain/workbook/configurations/filter/time-range-filter';
import {TimeRange, TimeRangeData} from '../component/time-range.component';

@Component({
  selector: 'app-time-range-filter',
  templateUrl: './time-range-filter.component.html'
})
export class TimeRangeFilterComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // UI 상 임시값 정의
  public lastIntervals = '';

  public targetFilter: TimeRangeFilter;    // 필터

  public rangeBoundary: RangeBoundary;
  public timeRangeList: TimeRange[];
  public isEarliestTime: boolean = false;
  public isLatestTime: boolean = false;

  // 초기 입력 정보 정의
  @Input('filter')
  public inputFilter: TimeRangeFilter;     // 입력 필터

  @Input('dashboard')
  public dashboard: Dashboard;            // 대시보드

  @Input('mode')
  public mode: string = 'CHANGE';          // 화면 모드

  // 필터 변경 이벤트
  @Output('change')
  public changeEvent: EventEmitter<TimeRangeFilter> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
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
    if (filterChanges) {
      const prevFilter: TimeRangeFilter = filterChanges.previousValue;
      const currFilter: TimeRangeFilter = filterChanges.currentValue;
      if (currFilter && (
        !prevFilter || prevFilter.field !== currFilter.field ||
        0 < _.difference(prevFilter.intervals, currFilter.intervals).length)) {
        this.setData(filterChanges.currentValue, !filterChanges.firstChange);
      }
    }
  } // function - ngOnChanges

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
   * @param {TimeRangeFilter} filter
   * @param {boolean} isBroadcast
   */
  public setData(filter: TimeRangeFilter, isBroadcast: boolean = false) {
    this.loadingShow();
    const cloneFilter: TimeRangeFilter = _.cloneDeep(filter);
    this.datasourceService.getCandidateForFilter(cloneFilter, this.dashboard).then((result) => {
      this.targetFilter = this._setRangeFilter(result, cloneFilter);
      this.safelyDetectChanges();

      // 변경사항 전파
      (isBroadcast) && (this._broadcastChange());

      this.loadingHide();
    }).catch(err => this.commonExceptionHandler(err));

  } // function - setData

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {InclusionFilter}
   */
  public getData(): TimeRangeFilter {
    this.targetFilter.intervals = this.timeRangeList.map(item => item.startDate + '/' + item.endDate);
    return this.targetFilter;
  } // function - getData

  /**
   * Interval Range 컴포넌트의 데이터 설정
   * @param {TimeRange} item
   * @return {TimeRangeData}
   */
  public getTimeRangeData(item: TimeRange): TimeRangeData {
    return new TimeRangeData(this.rangeBoundary.minTime, this.rangeBoundary.maxTime, item, false, this.targetFilter.timeUnit);
  } // function - getIntervalRangeData

  /**
   * 시간필터 - 최초 시간 설정 On/Off
   * @param $event
   * @param {TimeRangeFilter} filter
   */
  public setEarliestTime($event, filter: TimeRangeFilter) {
    const checked = $event.target ? $event.target.checked : $event.currentTarget.checked;

    this.isEarliestTime = checked;

    const interval: string = filter.intervals[0];
    const intervalUI: TimeRange = this.timeRangeList[0];

    if (checked) {
      // 체크시 LATEST_DATETIME 으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        const item: TimeRange = new TimeRange(TimeRangeFilter.EARLIEST_DATETIME, intervalUI.endDate);
        this.timeRangeList[0] = item;
        filter.intervals[0] = item.toInterval();
      }
    } else {
      // 체크 해제시 maxTime으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        const item: TimeRange = new TimeRange(this.rangeBoundary.minTime, intervalUI.endDate);
        this.timeRangeList[0] = item;
        filter.intervals[0] = item.toInterval();
      }
    }

    // 변경사항 전파
    this._broadcastChange();

  } // function - setEarliestTime

  /**
   * 시간필터 - 최후 시간 설정 On/Off
   * @param $event
   * @param {TimeRangeFilter} filter
   */
  public setLatestTime($event, filter: TimeRangeFilter) {
    const checked = $event.target ? $event.target.checked : $event.currentTarget.checked;

    this.isLatestTime = checked;

    const interval: string = filter.intervals[filter.intervals.length - 1];
    const intervalUI: TimeRange = this.timeRangeList[this.timeRangeList.length - 1];

    if (checked) {
      // 체크시 LATEST_DATETIME 으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        const item: TimeRange = new TimeRange(intervalUI.startDate, TimeRangeFilter.LATEST_DATETIME);
        this.timeRangeList[this.timeRangeList.length - 1] = item;
        filter.intervals[filter.intervals.length - 1] = item.toInterval();
      }
    } else {
      // 체크 해제시 maxTime으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        const item: TimeRange = new TimeRange(intervalUI.startDate, this.rangeBoundary.maxTime);
        this.timeRangeList[this.timeRangeList.length - 1] = item;
        filter.intervals[filter.intervals.length - 1] = item.toInterval();
      }
    }

    // 변경사항 전파
    this._broadcastChange();

  } // function - setLatestTime

  /**
   * 기간셋을 추가할 경우
   * @param {TimeRangeFilter} filter
   */
  public addIntervalRange(filter: TimeRangeFilter) {
    // set to current time 이 체크되어 있으면 리턴
    if (this.isLatestTime) return;

    // 날짜 추가
    const item: TimeRange = new TimeRange(this.rangeBoundary.minTime, this.rangeBoundary.maxTime);
    this.timeRangeList.push(item);
    filter.intervals.push(item.toInterval());

    // 변경사항 전파
    this._broadcastChange();
  } // function - addIntervalRange

  /**
   * 기간셋을 삭제할 경우
   * @param {TimeRangeFilter} filter
   */
  public deleteIntervalRange(filter: TimeRangeFilter) {
    (this.timeRangeList.length > 1) && (this.timeRangeList.pop());
    this.isLatestTime = false;

    // 변경사항 전파
    this._broadcastChange();
  } // function - deleteIntervalRange

  /**
   * 값 선택
   * @param {TimeRange} date
   * @param {number} idx
   */
  public onDateChange(date: TimeRange, idx: number) {

    this.timeRangeList[idx] = date;
    this.targetFilter.intervals = this.timeRangeList.map(item => item.startDate + '/' + item.endDate);

    // 변경사항 전파
    this._broadcastChange();
  } // function -  onDateChange

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 변경사항 전파
   * @private
   */
  private _broadcastChange() {
    const filterData: TimeRangeFilter = this.getData();
    // 결과 값이 다를 경우만 이벤트 전달하여 차트 갱신
    if (this.lastIntervals != filterData.intervals.join('')) {
      this.lastIntervals = filterData.intervals.join('');
      this.changeEvent.emit(filterData);
    }
  } // function - _broadcastChange

  /**
   * TimeRangeFilter Candidate 결과 처리
   * @param {RangeBoundary} result
   * @param {TimeRangeFilter} targetFilter
   * @returns {TimeRangeFilter}
   * @private
   */
  private _setRangeFilter(result: RangeBoundary, targetFilter: TimeRangeFilter): TimeRangeFilter {

    // 초기화
    this.isEarliestTime = false;
    this.isLatestTime = false;

    this.rangeBoundary = result;
    if (targetFilter.intervals && 0 < targetFilter.intervals.length) {
      const items: any[] = [];
      targetFilter.intervals.forEach(item => {
        const arrInterval: any[] = item.split('/');
        if (TimeRangeFilter.EARLIEST_DATETIME === arrInterval[0]) {
          this.isEarliestTime = true;
        }
        if (TimeRangeFilter.LATEST_DATETIME === arrInterval[1]) {
          this.isLatestTime = true;
        }
        items.push(new TimeRange(arrInterval[0], arrInterval[1]));
      });
      this.timeRangeList = items;
    } else {
      const item: TimeRange = new TimeRange(result.minTime, result.maxTime);
      this.timeRangeList = [item];
      targetFilter.intervals = [item.toInterval()];
    }

    return targetFilter;
  } // function - _setRangeFilter

}

class RangeBoundary {
  minTime: Date;
  maxTime: Date;
}
