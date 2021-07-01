import * as _ from 'lodash';
import {AbstractFilterPopupComponent} from "../abstract-filter-popup.component";
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
} from "@angular/core";
import {EventBroadcaster} from "@common/event/event.broadcaster";
import {TimeRangeFilter} from "@domain/workbook/configurations/filter/time-range-filter";
import {TimeDateFilter} from "@domain/workbook/configurations/filter/time-date-filter";
import {Dashboard} from "@domain/dashboard/dashboard";
import {TimeDate} from "../component/time-date.component";
import moment from "moment";


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

  // UI 상 임시값 정의
  public lastIntervals = '';


  // 필터 변경 이벤트
  @Output()
  public changeEvent: EventEmitter<TimeRangeFilter> = new EventEmitter();

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
  public ngOnChanges(changes: SimpleChanges): void {
    const filterChanges: SimpleChange = changes.inputFilter;

    if (filterChanges){
      this.setData(filterChanges.currentValue);
    }
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.setData(this.inputFilter);
    setTimeout(() => {
    }, 150 );
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
   * @param {boolean} isBroadcast
   */
  public setData(filter: TimeDateFilter) {
    if (!this._isRunningCandidate) {
      this._isRunningCandidate = true;
      this.loadingShow();
      const cloneFilter: TimeDateFilter = _.cloneDeep(filter);
      this.targetFilter = this._setDateFilter(cloneFilter);
      this._isRunningCandidate = false;
      this.loadingHide();
    }
  } // function - setData

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {InclusionFilter}
   */
  public getData(): TimeDateFilter {
    return this.targetFilter;
  } // function - getData

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

  private _setDateFilter(targetFilter: TimeDateFilter): TimeDateFilter{

    if(!targetFilter.intervals){
      targetFilter.valueDate = moment().toISOString();
      targetFilter.intervals = [targetFilter.valueDate + '/' + targetFilter.valueDate];
    } else {
      const arrInterval: any[] = targetFilter.intervals[0].split('/');
      targetFilter.valueDate = arrInterval[0];
    }
    return targetFilter;
  }

}

