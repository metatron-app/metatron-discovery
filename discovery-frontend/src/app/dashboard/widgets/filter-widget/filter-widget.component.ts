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
  Injector,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractWidgetComponent} from '../abstract-widget.component';
import {FilterWidget, FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {
  Candidate,
  InclusionFilter,
  InclusionItemSort,
  InclusionSelectorType,
  InclusionSortBy
} from '@domain/workbook/configurations/filter/inclusion-filter';
import {Alert} from '@common/util/alert.util';
import {BoardConfiguration, Dashboard, DashboardWidgetRelation} from '@domain/dashboard/dashboard';
import {Field} from '@domain/datasource/datasource';

import * as _ from 'lodash';
import {SubscribeArg} from '@common/domain/subscribe-arg';
import {PopupService} from '@common/service/popup.service';
import * as $ from 'jquery';
import {FilterSelectComponent} from '../../filters/component/filter-select/filter-select.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {BoundFilterComponent} from '../../filters/bound-filter/bound-filter.component';
import {BoundFilter} from '@domain/workbook/configurations/filter/bound-filter';
import {StringUtil} from '@common/util/string.util';
import {DashboardUtil} from '../../util/dashboard.util';
import {FilterUtil} from '../../util/filter.util';
import {TimeFilter} from '@domain/workbook/configurations/filter/time-filter';
import {TimeRangeFilter} from '@domain/workbook/configurations/filter/time-range-filter';
import {
  TimeRelativeFilter,
  TimeRelativeTense
} from '@domain/workbook/configurations/filter/time-relative-filter';
import {TimeUnit} from '@domain/workbook/configurations/field/timestamp-field';
import {DIRECTION} from '@domain/workbook/configurations/sort';

@Component({
  selector: 'filter-widget',
  templateUrl: './filter-widget.component.html',
  styleUrls: ['./filter-widget.component.css']
})
export class FilterWidgetComponent extends AbstractWidgetComponent<FilterWidget> implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(FilterSelectComponent)
  private filterSelectComponent: FilterSelectComponent;

  @ViewChild(BoundFilterComponent)
  private _boundFilterComp: BoundFilterComponent;

  @ViewChild('filterWidget')
  private filterWidget: ElementRef;

  private RISING_LAYER_Z_INDEX = 300;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public parentWidget: FilterWidget;

  public list: string[];

  public searchText: string;

  public widget: FilterWidget;

  // 페이지 번호
  public pageNum: number = 0;

  // 필터타입
  public inclusionSelectorType = InclusionSelectorType;

  // 후보리스트
  public candidateList: Candidate[] = [];
  public isSearchingCandidateAvailability: boolean = false;

  // 선택 아이템
  public selectedItems: Candidate[];

  public filter: Filter;
  public field: Field;
  public dashboard: Dashboard;

  // T/F
  public isTimeFilter: boolean = false;              // TimeFilter 여부
  public isContinuousByAll: boolean = false;        // Granularity 가 지정되지 않은 연속성 여부 판단
  public isDiscontinuousFilter: boolean = false;    // 불연속 필터 여부
  public isAllTypeTimeFilter: boolean = false;      // All Time Filter
  public isRelativeTypeTimeFilter: boolean = false; // Relative Time Filter
  public isRangeTypeTimeFilter: boolean = false;    // Range Time Filter
  public isListTypeTimeFilter: boolean = false;     // List Time Filter
  public isSingleTypeTimeFilter: boolean = false;   // Single Time Filter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables - Input & Output
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('widget')
  public inputWidget: FilterWidget;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasourceService: DatasourceService,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute) {
    super(broadCaster, elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();

    // 패널에 필터를 업데이트 popup은 아니지만 동일한 기능이 필요해서 popupService를 사용
    const popupSubscribe = this.popupService.filterView$.subscribe((data: SubscribeArg) => {
      if ('reset-general-filter' === data.name) {
        if (this.filter.ui.importanceType === 'general') {
          const inclusionFilter: InclusionFilter = (this.filter as InclusionFilter);
          inclusionFilter.valueList = [];
          switch (inclusionFilter.selector) {
            case InclusionSelectorType.SINGLE_COMBO:
              this.filterSelectComponent.reset(inclusionFilter.valueList);
              break;
            case InclusionSelectorType.MULTI_COMBO:
              this.filterSelectComponent.updateView(this.selectedItems);
              break;
            default :
              this._candidate(inclusionFilter);
          }
        }
      }
      this.safelyDetectChanges();
    });
    this.subscriptions.push(popupSubscribe);

    // 필터 선택 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_FILTER_SELECTOR').subscribe(data => {
        if (this.widget.id === data.widget.id) {
          this.setConfiguration(data.widget.configuration);
          this.safelyDetectChanges();
        }
      })
    );

    // 위젯 설정 변경 및 새로고침
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_WIDGET_CONFIG').subscribe(data => {
        if (data.widgetId === this.widget.id) {
          this.setConfiguration(data.config);
          this.safelyDetectChanges();
        }
      })
    );

    // 외부 필터 설정
    this.subscriptions.push(
      this.broadCaster.on<any>('SET_GLOBAL_FILTER').subscribe((data) => {
        this.dashboard.configuration.filters = data.filters;
        if (this.filter) {
          if (data.exclude) {
            if (this.filter.dataSource !== data.exclude.dataSource || this.filter.field !== data.exclude.field) {
              let isClearValueList: boolean = false;
              if (this.parentWidget && 'include' === this.filter.type) {
                isClearValueList = DashboardUtil.isSameFilterAndWidget(this.dashboard, data.exclude, this.parentWidget);
              }
              this._candidate(this.filter, isClearValueList);
            }
          } else {
            this._candidate(this.filter);
          }
        }
      })
    );

    // 필터 콤보박스 옵션 표시 여부
    this.subscriptions.push(
      this.broadCaster.on<any>('TIME_DATE_SHOW_SELECT_OPTS').subscribe((data) => {
        this.toggleOptionsSelectComp(data.isShow);
        this.changeWidgetOverflow(data.isShow);
      })
    );

  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const widgetChanges: SimpleChange = changes.inputWidget;
    if (this.isLoaded && widgetChanges && widgetChanges.currentValue) {
      this._initializeFilterWidget(widgetChanges.currentValue);
    }
  } // function - ngOnChanges

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this._initializeFilterWidget(this.inputWidget);
    this.safelyDetectChanges();
  } // function - ngAfterViewInit

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 마우스가 벗어남
   */
  public mouseoutWidget() {
    if (this.filterSelectComponent && this.filterSelectComponent.isShowSelectList) {
      this.filterSelectComponent.toggleSelectList();
    }
  } // function - mouseoutWidget

  /**
   * 위젯 설정 변경
   * @param {FilterWidgetConfiguration} objConfig
   */
  public setConfiguration(objConfig: FilterWidgetConfiguration) {
    if (!this.isError) {
      this.widget.configuration = objConfig;
      this._candidate(this.getFilter());
    }
  } // function - setConfiguration

  /**
   * 위젯 설정 내 필터 정보 조회
   * @return {Filter}
   */
  public getFilter(): Filter {
    const conf: FilterWidgetConfiguration = this.widget.configuration as FilterWidgetConfiguration;
    const filter: Filter = _.cloneDeep(conf.filter);
    if (FilterUtil.isTimeFilter(filter)) {
      this._setTimeFilterStatus(filter as TimeFilter);
    }
    return filter;
  } // function - getFilter

  // noinspection JSMethodCanBeStatic
  /**
   * InclusionFilter 로 형변환
   * @param {Filter} filter
   * @return {InclusionFilter}
   */
  public convertToIncludeFilter(filter: Filter): InclusionFilter {
    return filter as InclusionFilter;
  } // function - convertToIncludeFilter

  /**
   * 위젯 이름 조회
   * @returns {string}
   */
  public getWidgetName(): string {
    if (this.widget && this.widget.name) {
      return this.widget.name;
    } else if (this.getConfiguration()) {
      return this.getConfiguration().filter.field;
    } else {
      return '';
    }
  } // function - getWidgetName

  /**
   * getConfiguration
   * @returns {FilterWidgetConfiguration}
   */
  public getConfiguration(): FilterWidgetConfiguration {
    return this.widget ? this.widget.configuration as FilterWidgetConfiguration : null;
  } // function - getConfiguration

  // public getDashboard(): Dashboard {
  //   return this.widget.dashBoard;
  // }

  /**
   * 목록에 사용자 정의값 추가
   * @param {InclusionFilter} filter
   */
  public addDefineValues(filter: InclusionFilter) {
    if (filter.definedValues && filter.definedValues.length > 0) {
      this.candidateList = filter.definedValues.map(item => this._stringToCandidate(item)).concat(this.candidateList);
    }
  } // function addDefineValues

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Include Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 전체선택
   * @param {any} $event
   */
  public checkAllInclude($event?: any) {

    // 레이아웃 모드가 수정일 경우에는 동작하지 않도록 함
    if (this.isEditMode) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    const filter = this.filter as InclusionFilter;

    if (filter.selector === InclusionSelectorType.MULTI_LIST) {
      const checked = $event.target ? $event.target.checked : $event.currentTarget.checked;
      if (checked) {
        filter.valueList = [];
        this.candidateList.forEach(candidate => filter.valueList.push(candidate.name));
      } else {
        filter.valueList = [];
      }
    } else {
      filter.valueList = [];
    }
    this._broadcastChangeFilter(this.filter);
  } // function - checkAllInclude

  /**
   * 셀렉트 컴포넌트의 옵션 표시 전환
   * @param {boolean} isShowOptions
   */
  public toggleOptionsSelectComp(isShowOptions: boolean) {
    if (isShowOptions) {
      this._setContainerZIndex(this.RISING_LAYER_Z_INDEX);
      // this.candidate();
    } else {
      this._setContainerZIndex('');
    }
  } // function - toggleOptionsSelectComp

  /**
   * time filter select box z-index 효과를 위한 overflow 조정
   * @param {boolean} isShowOptions
   */
  public changeWidgetOverflow(isShowOptions: boolean) {
    const $filterWidgetEl = $(this.filterWidget.nativeElement);
    if(isShowOptions && 'WEEK' === this.filter['timeUnit']){
      $filterWidgetEl.find('.wrap-time-filter').css({overflow:'visible'});
      $filterWidgetEl.closest('.ddp-wrap-widget').css({overflow: 'visible'});
      $filterWidgetEl.find('.ddp-dateinfo-view').css({overflow: 'visible'});
    } else {
      $filterWidgetEl.find('.wrap-time-filter').css({overflow:''});
      $filterWidgetEl.closest('.ddp-wrap-widget').css({overflow: ''});
      $filterWidgetEl.find('.ddp-dateinfo-view').css({overflow: ''});
    }
  } // function - changeWidgetOverflow

  /**
   * Include Filter 값 선택
   * @param item
   */
  public onSelectInclude(item: any) {

    const filter = this.filter as InclusionFilter;

    // 수정 모드일 경우 선택이 동작하지 않도록 한다
    if (this.isEditMode && filter.selector !== InclusionSelectorType.MULTI_COMBO) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    this._setContainerZIndex('');

    if (filter.selector === InclusionSelectorType.SINGLE_LIST) {
      // 싱글 리스트
      filter.valueList = [];
      filter.valueList.push(item.name);
    } else if (filter.selector === InclusionSelectorType.MULTI_LIST) {
      // 멀티 리스트
      if (-1 === filter.valueList.indexOf(item.name)) {
        filter.valueList.push(item.name);
      } else {
        const idx = filter.valueList.indexOf(item.name);
        filter.valueList.splice(idx, 1);
      }
    } else {
      // 콤보박스
      if (Array.isArray(item)) {
        filter.valueList = item.map(data => data.name);
      } else {
        filter.valueList = [];
        if (item !== 'ALL') {
          filter.valueList.push(item.name);
        }

      }
    }

    this.filter = filter;
    this._broadcastChangeFilter(this.filter);

  } // function - onSelectInclude

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Time Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 변경 이벤트 핸들러
   * @param {TimeFilter} filter
   */
  public changeFilterEvent(filter: TimeFilter) {
    if (FilterUtil.isTimeFilter(filter)) {
      this.filter = _.cloneDeep(filter);
      this._broadcastChangeFilter(this.filter);
    }
  } // function - changeFilterEvent

  /**
   * TimeRangeFilter 설정
   */
  public setTimeRangeFilter() {
    const conf: FilterWidgetConfiguration = this.widget.configuration as FilterWidgetConfiguration;
    if (FilterUtil.isTimeFilter(conf.filter)) {
      const filter: TimeFilter = FilterUtil.convertRelativeToInterval(conf.filter as TimeFilter, this.dashboard);
      this.filter = filter;
      this.widget.configuration.filter = filter;
      this._setTimeFilterStatus(filter as TimeFilter);
      this._broadcastChangeFilter(filter);
    }
  } // function - setTimeRangeFilter

  /**
   * TimeRelativeFilter 설정
   */
  public setTimeRelativeFilter() {
    const conf: FilterWidgetConfiguration = this.widget.configuration as FilterWidgetConfiguration;
    let filter: TimeRelativeFilter = _.cloneDeep(conf.filter) as TimeRelativeFilter;
    if (FilterUtil.isTimeFilter(filter)) {
      filter.clzField = DashboardUtil.getFieldByName(this.dashboard, filter.dataSource, filter.field);
      filter = FilterUtil.getTimeRelativeFilter(filter.clzField, filter.timeUnit, 'general');
      filter.discontinuous = false;
      filter.timeUnit = TimeUnit.NONE;
      filter.tense = TimeRelativeTense.PREVIOUS;
      filter.relTimeUnit = TimeUnit.WEEK;
      filter.value = 1;
      this.filter = filter;
      this.widget.configuration.filter = filter;
      this._setTimeFilterStatus(filter as TimeFilter);
      this._broadcastChangeFilter(filter);
    }
  } // function - setTimeRelativeFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Measure Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 값 적용
   */
  public applyValue() {
    const filter = this._boundFilterComp.getData();
    // validation
    if (filter.min > filter.max) filter.max = filter.min;
    if (filter.min < filter.minValue) filter.min = filter.minValue;
    if (filter.max < filter.minValue) filter.max = filter.minValue;
    if (filter.min > filter.maxValue) filter.min = filter.maxValue;
    if (filter.max > filter.maxValue) filter.max = filter.maxValue;
    this._broadcastChangeFilter(filter);
  } // function - applyValue

  public candidateFromSearchText() {
    if (StringUtil.isEmpty(this.searchText)) {
      return;
    }

    this.loadingShow();
    this.datasourceService.getCandidateForFilter(
      this.filter, this.dashboard, [], null, null, this.searchText).then((resultCandidates) => {
      if (resultCandidates && resultCandidates.length > 0) {
        resultCandidates.forEach((resultCandidate) => {
          if (this.existCandidate(resultCandidate.field) === false) {
            const candidate = new Candidate();
            candidate.count = resultCandidate.count;
            candidate.name = resultCandidate.field;
            candidate.isTemporary = true;
            this.candidateList.unshift(candidate);
          }
        });

        this.safelyDetectChanges();
      }

      this.loadingHide();
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  public isNoFiltering(): boolean {
    const filter = this.filter as InclusionFilter;

    return (filter.selector === InclusionSelectorType.SINGLE_COMBO || filter.selector === InclusionSelectorType.MULTI_COMBO)
      && (filter.valueList && filter.valueList.length === 0);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 필터 변경 이벤트
   * @param {Filter} filter
   * @private
   */
  private _broadcastChangeFilter(filter: Filter) {
    this.broadCaster.broadcast('CHANGE_FILTER_WIDGET', {filter: filter});
  } // function - _broadcastChangeFilter

  /**
   * 컨테이너 초기화
   * @private
   */
  private _initialContainer() {
    this.isError = false;
    // 콤보박스 관련된 필터 뷰 설정
    this.safelyDetectChanges();
    if (!this.isEditMode) {
      const filter: Filter = this.filter;
      const isInterval: boolean = ('interval' === filter.type);
      const isIncludeCombo: boolean = ('include' === filter.type
        && ((filter as InclusionFilter).selector === InclusionSelectorType.SINGLE_COMBO
          || (filter as InclusionFilter).selector === InclusionSelectorType.MULTI_COMBO));
      if (isInterval || isIncludeCombo) {
        // 필터 z-index 최상으로 처리
        const $filterWidgetEl = $(this.filterWidget.nativeElement);
        // $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': 100, position: 'relative'});
        $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': '', position: ''});
        $filterWidgetEl.closest('.lm_content').css('overflow', 'inherit');
      }
    }
    (this.isShowTitle) || (this._setIsVisibleScrollbar());  // 스크롤바 표시 여부 설정
  } // function - _initialContainer

  /**
   * 위젯 컴포넌트 z-index 설정
   * @param {number | string} index
   * @private
   */
  private _setContainerZIndex(index: number | string) {
    const $filterWidgetEl = $(this.filterWidget.nativeElement);
    if ('' === index) {
      $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': '', position: ''});
    } else {
      $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': index, position: 'relative'});
    }
  } // function - _setContainerZIndex

  /**
   * Inclusion 및 Bound 필터에 대한 후보값 조회
   * @param {Filter} filter
   * @param {boolean} isClearValueList
   */
  private _candidate(filter: Filter, isClearValueList: boolean = false) {

    if (!filter) {
      return;
    }

    // 프로세스 실행 등록
    this.processStart();
    this._hideError();

    if ('include' === filter.type || 'bound' === filter.type) {

      // 필터 데이터 후보 조회
      let prevFilter: Filter[] = [];
      if (this.parentWidget && 'include' === filter.type) {
        prevFilter = prevFilter.concat(this.getParentFilter(filter, this.dashboard));
        // const isSelectedParentFilter: boolean
        //   = prevFilter.some(item => {
        //   return DashboardUtil.isSameFilterAndWidget(this.dashboard, item, this.parentWidget)
        //     && (<InclusionFilter>item).valueList
        //     && 0 < (<InclusionFilter>item).valueList.length;
        // });
        // if (!isSelectedParentFilter) {
        //   const inclusionFilter: InclusionFilter = <InclusionFilter>filter;
        //   this.candidateList = [];
        //   this.filter = inclusionFilter;
        //   this.processEnd();
        //   return;
        // }
      }

      // 필터 데이터 후보 조회
      this.datasourceService.getCandidateForFilter(filter, this.dashboard, prevFilter, this.field).then((result) => {
        if ('include' === filter.type) {

          // 기본값 설정
          const inclusionFilter: InclusionFilter = filter as InclusionFilter;
          if (isClearValueList) {
            this.selectedItems = [];
            inclusionFilter.valueList = [];
          } else {
            if (inclusionFilter.hasOwnProperty('valueList') && inclusionFilter.valueList.length > 0) {
              this.selectedItems = inclusionFilter.valueList.map(item => this._stringToCandidate(item));
            }
          }

          this.candidateList = [];

          // 사용자 정의 값 추가
          this.addDefineValues(inclusionFilter);

          this.isSearchingCandidateAvailability = ( result && Array.isArray(result) && result.length > 100 );

          if (this.parentWidget) {
            // 계층 구조의 하위 필터 목록 처리
            this.candidateList
              = result.map(item => this._objToCandidate(item, this.field));
          } else {
            // 선택된 후보값 목록
            const selectedCandidateValues: string[] = inclusionFilter.candidateValues;

            // 후보값 추가
            if (selectedCandidateValues && 0 < selectedCandidateValues.length) {
              result.forEach((item) => {
                if (selectedCandidateValues.some(selectedItem => item.field === selectedItem)) {
                  this.candidateList.push(this._objToCandidate(item, this.field));
                }
              });

              this.candidateList =
                this.candidateList.concat(
                  selectedCandidateValues
                    .map(item => this._stringToCandidate(item))
                    .filter(item => -1 === this.candidateList.findIndex(can => can.name === item.name))
                );
            } else {
              result.forEach(item => {
                this.candidateList.push(this._objToCandidate(item, this.field));
              });
            }
          }

          // Sort List
          if (this.isNullOrUndefined(inclusionFilter.sort)) {
            inclusionFilter.sort = new InclusionItemSort(InclusionSortBy.TEXT, DIRECTION.ASC);
          }
          if (InclusionSortBy.COUNT === inclusionFilter.sort.by) {
            // sort by count
            this.candidateList.sort((val1: Candidate, val2: Candidate) => {
              return (DIRECTION.ASC === inclusionFilter.sort.direction) ? val1.count - val2.count : val2.count - val1.count;
            });
          } else {
            // sort by text
            this.candidateList.sort((val1: Candidate, val2: Candidate) => {
              const name1: string = (val1.name) ? val1.name.toUpperCase() : '';
              const name2: string = (val2.name) ? val2.name.toUpperCase() : '';
              if (name1 < name2) {
                return (DIRECTION.ASC === inclusionFilter.sort.direction) ? -1 : 1;
              }
              if (name1 > name2) {
                return (DIRECTION.ASC === inclusionFilter.sort.direction) ? 1 : -1;
              }
              return 0;
            });
          }

          this.filter = inclusionFilter;
        } else if ('bound' === filter.type) {
          const boundFilter: BoundFilter = filter as BoundFilter;
          if (result && result.hasOwnProperty('maxValue')) {
            if (boundFilter.min === 0 && boundFilter.max === 0) {
              boundFilter.min = result.minValue;
              boundFilter.max = result.maxValue;
            }
            boundFilter.maxValue = result.maxValue;
            boundFilter.minValue = result.minValue;
          } else {
            boundFilter.min = null;
            boundFilter.max = null;
            boundFilter.maxValue = null;
            boundFilter.minValue = null;
          }

          this.filter = boundFilter;
        }

        this._setQueryParameterAsDefaultValue();
        this._initialContainer();         // 컨테이너 초기화

        this.processEnd();
      }).catch((error) => {
        this._showError(error);
        this.candidateList = [];    // 목록 비움
        this.processEnd();          // 프로세스 종료 등록
      });

    } else {
      this.filter = filter;

      this._setQueryParameterAsDefaultValue();
      this._initialContainer();   // 컨테이너 초기화
      this.processEnd();
    }
  } // function - _candidate

  /**
   * Request Query Parameter 값을 이용하여 필터의 초기 값을 설정한다.
   */
  private _setQueryParameterAsDefaultValue() {
    if (this.filter) {
      this.activatedRoute.queryParams.subscribe(params => {
        Object.keys(params).forEach(key => {
          if (key !== this.filter.field) {
            return;
          }
          const value: any = params[key];
          if (this.filter.type === 'include') {
            const paramValues = Array.isArray(value) ? value : [value];
            this.selectedItems = this.candidateList.filter((item: Candidate) => {
              const matchedItems = paramValues.filter(param => {
                return item.name === param;
              });
              return matchedItems.length > 0;
            });
          } else if (this.filter.type === 'bound') {
            const boundFilter: BoundFilter = this.filter as BoundFilter;
            const paramValues: string[] = value.split(',');
            if (paramValues.length === 2) {
              const min = Number(paramValues[0]);
              const max = Number(paramValues[1]);
              if (!isNaN(min) && !isNaN(max)) {
                boundFilter.min = min;
                boundFilter.max = max;
                boundFilter.minValue = min;
                boundFilter.maxValue = max;
              }
            }
          } else if (this.filter.type === 'time_range') {
            const timeRangeFilter: TimeRangeFilter = this.filter as TimeRangeFilter;
            if (Array.isArray(value)) {
              timeRangeFilter.intervals = value;
            } else {
              timeRangeFilter.intervals = [value];
            }
          } else if (this.filter.type === 'time_relative') {
            const timeRelativeFilter: TimeRelativeFilter = this.filter as TimeRelativeFilter;
            const valueAttributes = value.split(',');
            valueAttributes.forEach(attr => {
              const keyValue: string[] = attr.split(':');
              if (keyValue[0] === 'tense') {
                timeRelativeFilter.tense = TimeRelativeTense[keyValue[1]];
              } else if (keyValue[0] === 'relTimeUnit') {
                timeRelativeFilter.relTimeUnit = TimeUnit[keyValue[1]];
              } else if (keyValue[0] === 'value') {
                timeRelativeFilter.value = +keyValue[1];
              }
            });
          } else if (this.filter.type === 'time_list') {
            const paramValues = Array.isArray(value) ? value : [value];
            this.selectedItems = this.candidateList.filter((item: Candidate) => {
              const matchedItems = paramValues.filter(param => {
                return item.name === param;
              });
              return matchedItems.length > 0;
            });
          }
        })
      });
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 객체를 후보값 객체로 변환
   * @param item
   * @param {Field} field
   * @return {Candidate}
   * @private
   */
  private _objToCandidate(item: any, field: Field): Candidate {
    const candidate = new Candidate();
    if (item.hasOwnProperty('field') && StringUtil.isNotEmpty(item['field'] + '')) {
      candidate.name = item['field'];
      candidate.count = item['count'];
    } else {
      candidate.name = item[field.name];
      candidate.count = item['count'];
    }
    return candidate;
  } // function - _objToCandidate

  // noinspection JSMethodCanBeStatic
  /**
   * 텍스트를 후보값 객체로 변환
   * @param {string} item
   * @param {boolean} isDefine
   * @return {Candidate}
   */
  private _stringToCandidate(item: string, isDefine: boolean = false): Candidate {
    const candidate = new Candidate();
    candidate.name = item;
    candidate.count = 0;
    candidate.isDefinedValue = isDefine;
    return candidate;
  } // function - _stringToCandidate

  /**
   * 스크롤바 표시 여부를 설정한다.
   */
  private _setIsVisibleScrollbar() {
    if (this.filterWidget) {
      const $container: JQuery = $(this.filterWidget.nativeElement).find('.ddp-ui-widget-contents');
      const $contents: JQuery = $container.find('ul');
      this.isVisibleScrollbar = ($container.height() < $contents.height());
      this.safelyDetectChanges();
    }
  } // function - _setIsVisibleScrollbar

  private existCandidate(name: string): boolean {
    const filteredCandidates = this.candidateList.filter(candidate => candidate.name === name);
    return filteredCandidates != null && filteredCandidates.length > 0;
  }

  /**
   * 필터 위젯 초기화
   * @param widgetInfo
   * @private
   */
  private _initializeFilterWidget(widgetInfo: FilterWidget): void {
    this.widget = widgetInfo;
    this.dashboard = this.widget.dashBoard;
    const filter: Filter = this.getFilter();

    if (filter) {
      this.field = DashboardUtil.getFieldByName(this.widget.dashBoard, filter.dataSource, filter.field, filter.ref);

      // Hierarchy 설정
      const boardConf: BoardConfiguration = this.widget.dashBoard.configuration;
      if (boardConf.filterRelations) {
        const relations: DashboardWidgetRelation[] = boardConf.filterRelations;
        const parentWidgetId: string = this._findParentWidgetId(this.widget.id, relations);
        if (parentWidgetId) {
          this.parentWidget = this.widget.dashBoard.widgets.find(item => item.id === parentWidgetId) as FilterWidget;
          // this.isShowHierarchyView = true;
        }
        // this._childWidgetIds = this._findChildWidgetIds(widget.id, relations);
      }

      if (this.field) {
        // 필터 후보값 조회
        this._candidate(filter);
      } else {
        this.processStart();
        this._showError(
          {
            code: 'GB0000',
            details: this.translateService.instant('msg.board.error.missing-field')
          }
        );
        this.processEnd();
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Time Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Time Filter 상태값 설정
   * @param {TimeFilter} timeFilter
   * @private
   */
  private _setTimeFilterStatus(timeFilter: TimeFilter) {
    this.isTimeFilter = true;
    this.isContinuousByAll = FilterUtil.isContinuousByAll(timeFilter);
    this.isDiscontinuousFilter = FilterUtil.isDiscontinuousTimeFilter(timeFilter);
    this.isAllTypeTimeFilter = FilterUtil.isTimeAllFilter(timeFilter);
    this.isRelativeTypeTimeFilter = FilterUtil.isTimeRelativeFilter(timeFilter);
    this.isRangeTypeTimeFilter = FilterUtil.isTimeRangeFilter(timeFilter);
    this.isListTypeTimeFilter = FilterUtil.isTimeListFilter(timeFilter);
    this.isSingleTypeTimeFilter = FilterUtil.isTimeSingleFilter(timeFilter);
    if (!this.isEditMode && this.isRelativeTypeTimeFilter) {
      this.setTimeRangeFilter();
      this.safelyDetectChanges();
    }
  } // function - _setTimeFilterStatus

}
