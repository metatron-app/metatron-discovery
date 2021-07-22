import * as _ from 'lodash';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, SimpleChange,
  SimpleChanges,
} from '@angular/core';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {TimeRangeFilter} from '@domain/workbook/configurations/filter/time-range-filter';
import {TimeDateFilter} from '@domain/workbook/configurations/filter/time-date-filter';
import {Dashboard} from '@domain/dashboard/dashboard';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {FilterUtil} from '../../util/filter.util';
import {AbstractFilterPopupComponent} from '../abstract-filter-popup.component';
import {TimeDate, TimeDateData} from '../component/time-date.component';

@Component({
  selector: 'app-time-date-filter',
  templateUrl: './time-date-filter.component.html'
})
export class TimeDateFilterComponent extends AbstractFilterPopupComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _isRunningCandidate: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 초기 입력 정보 정의
  @Input('filter')
  public inputFilter: TimeDateFilter;     // 입력 필터

  @Input('dashboard')
  public dashboard: Dashboard;            // 대시보드

  @Input('mode')
  public mode: 'CHANGE' | 'WIDGET' | 'PANEL' = 'CHANGE';          // 화면 모드

  public targetFilter: TimeDateFilter;
  public isVertical: boolean = false;

  public dateBoundary: DateBoundary;
  public isLatestTime: boolean = false;

  // UI 상 임시값 정의
  public lastIntervals = '';

  // 필터 변경 이벤트
  @Output()
  public changeEvent: EventEmitter<TimeRangeFilter> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected broadCaster: EventBroadcaster,
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
  public ngOnChanges(changes: SimpleChanges): void {
    const filterChanges: SimpleChange = changes.inputFilter;

    if (filterChanges){
      this.setData(filterChanges.currentValue);
    }
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.setData(this.inputFilter);
    this.subscriptions.push(
      this.broadCaster.on<any>('RESIZE_WIDGET').subscribe(() => {
        if ('WIDGET' === this.mode) {
          this._checkVerticalMode();
        }
      })
    );
  }

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
   */
  public setData(filter: TimeDateFilter) {
    if (!this._isRunningCandidate) {
      this._isRunningCandidate = true;
      this.loadingShow();
      const cloneFilter: TimeDateFilter = _.cloneDeep(filter);

      this.datasourceService.getCandidateForFilter(cloneFilter, this.dashboard).then((result) => {
        this.targetFilter = this._setDateFilter(result, cloneFilter);
        this.safelyDetectChanges();

        this._isRunningCandidate = false;
        this.loadingHide();
      }).catch(err => {
        this._isRunningCandidate = false;
        this.commonExceptionHandler(err);
      });
    }
  } // function - setData

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {InclusionFilter}
   */
  public getData(): TimeDateFilter {
    return this.targetFilter;
  } // function - getData

  public getTimeDateData(): TimeDateData {
    if( this.targetFilter ) {
      return new TimeDateData(
        this.targetFilter.valueDate, this.dateBoundary.minTime, this.dateBoundary.maxTime, this.targetFilter.timeUnit
      );
    }
  } // func - getTimeDateData

  public onDateChange(date: TimeDate){
    this.targetFilter.valueDate = date.valueDate;
    this.targetFilter.intervals = [this.targetFilter.valueDate + '/' + this.targetFilter.valueDate];
    if(this.mode && this.mode !== 'WIDGET'){
      this._broadcastChange();
    }
  }

  public broadcastChange() {
    this._broadcastChange();
  }

  /**
   * 시간필터 - 최후 시간 설정 On/Off
   * @param $event
   */
  public setLatestTime($event) {
    const checked = $event.target ? $event.target.checked : $event.currentTarget.checked;

    this.isLatestTime = checked;

    const interval: string = this.targetFilter.intervals[0];

    if (checked) {
      // 체크시 LATEST_DATETIME 으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        this.targetFilter.valueDate = TimeDateFilter.LATEST_DATETIME;
        this.targetFilter.intervals = [TimeDateFilter.LATEST_DATETIME + '/' + TimeDateFilter.LATEST_DATETIME];
      }
    } else {
      // 체크 해제시 maxTime으로 값 설정
      if (interval.indexOf('/') > -1) {
        // 레퍼런스 변경으로 뷰 갱신
        const valueDate = FilterUtil.getDateTimeFormat(this.dateBoundary.maxTime, this.targetFilter.timeUnit);
        this.targetFilter.valueDate = valueDate;
        this.targetFilter.intervals = [valueDate + '/' + valueDate];
      }
    }

    // 변경사항 전파
    this._broadcastChange();

  } // function - setLatestTime

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 가로모드 여부 확인
   * @private
   */
  private _checkVerticalMode(): void {
    this.isVertical = (390 > this.$element.find('.ddp-dateinfo-view').width());
    this.safelyDetectChanges();
  } // func - _checkVerticalMode

  /**
   * 변경사항 전파
   * @private
   */
  private _broadcastChange(){
    const filterData: TimeDateFilter = this.getData();
    // 결과 값이 다를 경우만 이벤트 전달하여 차트 갱신
    if (this.lastIntervals !== filterData.intervals.join('')) {
      this.lastIntervals = filterData.intervals.join('');
      this.changeEvent.emit(filterData);
    }
  }

  private _setDateFilter(result: DateBoundary, targetFilter: TimeDateFilter): TimeDateFilter{

    // 초기화
    this.isLatestTime = false;

    this.dateBoundary = result;
    if(!targetFilter.intervals) {
      targetFilter.valueDate = FilterUtil.getDateTimeFormat(result.maxTime, targetFilter.timeUnit);
      targetFilter.intervals = [targetFilter.valueDate + '/' + targetFilter.valueDate];
    } else {
      const arrInterval: any[] = targetFilter.intervals[0].split('/');
      targetFilter.valueDate = arrInterval[0];
      if( TimeDateFilter.LATEST_DATETIME === targetFilter.valueDate ) {
        this.isLatestTime = true;
      }
    }
    return targetFilter;
  }

}

class DateBoundary {
  minTime: Date;
  maxTime: Date;
}
