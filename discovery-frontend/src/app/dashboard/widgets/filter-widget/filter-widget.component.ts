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
  Component, ElementRef, Injector, Input, OnDestroy, OnInit, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractWidgetComponent} from '../abstract-widget.component';
import {FilterWidget, FilterWidgetConfiguration} from '../../../domain/dashboard/widget/filter-widget';
import {Filter} from '../../../domain/workbook/configurations/filter/filter';
import {
  Candidate,
  InclusionFilter, InclusionItemSort,
  InclusionSelectorType, InclusionSortBy
} from '../../../domain/workbook/configurations/filter/inclusion-filter';
import {Alert} from '../../../common/util/alert.util';
import {Dashboard} from '../../../domain/dashboard/dashboard';
import {Field} from '../../../domain/datasource/datasource';

import * as _ from 'lodash';
import {SubscribeArg} from '../../../common/domain/subscribe-arg';
import {PopupService} from '../../../common/service/popup.service';
import {FilterMultiSelectComponent} from '../../filters/component/filter-multi-select/filter-multi-select.component';
import * as $ from 'jquery';
import {FilterSelectComponent} from '../../filters/component/filter-select/filter-select.component';
import {EventBroadcaster} from '../../../common/event/event.broadcaster';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {BoundFilterComponent} from '../../filters/bound-filter/bound-filter.component';
import {BoundFilter} from '../../../domain/workbook/configurations/filter/bound-filter';
import {StringUtil} from '../../../common/util/string.util';
import {DashboardUtil} from '../../util/dashboard.util';
import {FilterUtil} from '../../util/filter.util';
import {TimeFilter} from '../../../domain/workbook/configurations/filter/time-filter';
import {TimeRangeFilter} from "../../../domain/workbook/configurations/filter/time-range-filter";
import {
  TimeRelativeFilter,
  TimeRelativeTense
} from "../../../domain/workbook/configurations/filter/time-relative-filter";
import {TimeUnit} from "../../../domain/workbook/configurations/field/timestamp-field";
import {DIRECTION} from '../../../domain/workbook/configurations/sort';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'filter-widget',
  templateUrl: './filter-widget.component.html'
})
export class FilterWidgetComponent extends AbstractWidgetComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(FilterSelectComponent)
  private filterSelectComponent: FilterSelectComponent;

  @ViewChild(FilterMultiSelectComponent)
  private filterMultiSelectComponent: FilterMultiSelectComponent;

  @ViewChild(BoundFilterComponent)
  private _boundFilterComp: BoundFilterComponent;

  @ViewChild('filterWidget')
  private filterWidget: ElementRef;

  private RISING_LAYER_Z_INDEX = 300;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
          const inclusionFilter: InclusionFilter = (<InclusionFilter>this.filter);
          inclusionFilter.valueList = [];
          switch (inclusionFilter.selector) {
            case InclusionSelectorType.SINGLE_COMBO:
              this.filterSelectComponent.reset(inclusionFilter.valueList);
              break;
            case InclusionSelectorType.MULTI_COMBO:
              this.filterMultiSelectComponent.updateView(this.selectedItems);
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

  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const widgetChanges: SimpleChange = changes.inputWidget;
    if (widgetChanges && widgetChanges.currentValue) {
      this.widget = widgetChanges.currentValue;
      const filter: Filter = this.getFilter();

      this.dashboard = this.widget.dashBoard;
      this.field = DashboardUtil.getFieldByName(this.widget.dashBoard, filter.dataSource, filter.field, filter.ref);

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

  } // function - ngOnChanges

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.safelyDetectChanges();
  } // function - ngAfterViewInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 마우스가 벗어남
   */
  public mouseoutWidget() {

    if (this.filterSelectComponent && this.filterSelectComponent.isShowSelectList ) {
      this.filterSelectComponent.isShowSelectList = false;
      this.safelyDetectChanges();
      this.toggleOptionsSelectComp(false);
    }

    if (this.filterMultiSelectComponent && this.filterMultiSelectComponent.isShowSelectList) {
      this.filterMultiSelectComponent.isShowSelectList = false;
      this.safelyDetectChanges();
      this.toggleOptionsSelectComp(false);
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
    const conf: FilterWidgetConfiguration = <FilterWidgetConfiguration>this.widget.configuration;
    const filter: Filter = _.cloneDeep(conf.filter);
    if (FilterUtil.isTimeFilter(filter)) {
      this._setTimeFilterStatus(<TimeFilter>filter);
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
    return <InclusionFilter>filter;
  } // function - convertToIncludeFilter

  /**
   * 위젯 이름 조회
   * @returns {string}
   */
  public getWidgetName(): string {
    return (this.widget && this.widget.name) ? this.widget.name : this.getConfiguration().filter.field;
  } // function - getWidgetName

  /**
   * getConfiguration
   * @returns {FilterWidgetConfiguration}
   */
  public getConfiguration(): FilterWidgetConfiguration {
    return <FilterWidgetConfiguration>this.widget.configuration;
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

    const filter = <InclusionFilter>this.filter;

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
   * Include Filter 값 선택
   * @param item
   */
  public onSelectInclude(item: any) {

    const filter = <InclusionFilter>this.filter;

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
    if(StringUtil.isEmpty(this.searchText)) {
      return;
    }

    this.loadingShow();
    this.datasourceService.getCandidateForFilter(
      this.filter, this.dashboard, [], null, null, this.searchText).then((resultCandidates) => {
      if(resultCandidates && resultCandidates.length > 0) {
        resultCandidates.forEach((resultCandidate) => {
          if(this.existCandidate(resultCandidate.field) === false) {
            let candidate = new Candidate();
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
        && ((<InclusionFilter>filter).selector === InclusionSelectorType.SINGLE_COMBO
          || (<InclusionFilter>filter).selector === InclusionSelectorType.MULTI_COMBO));
      if (isInterval || isIncludeCombo) {
        // 필터 z-index 최상으로 처리
        const $filterWidgetEl = $(this.filterWidget.nativeElement);
        $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': 100, 'position': 'relative'});
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
      $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': '', 'position': ''});
    } else {
      $filterWidgetEl.closest('.lm_item .lm_stack').css({'z-index': index, 'position': 'relative'});
    }
  } // function - _setContainerZIndex

  /**
   * Inclusion 및 Bound 필터에 대한 후보값 조회
   * @param {Filter} filter
   */
  private _candidate(filter: Filter) {

    // 프로세스 실행 등록
    this.processStart();
    this._hideError();

    if ('include' === filter.type || 'bound' === filter.type) {

      // 필터 데이터 후보 조회
      // this.datasourceService.getCandidateForFilter(
      //   this.filter, this.dashboard, this.getFiltersParam(this.filter), this.field).then((result) => {
      this.datasourceService.getCandidateForFilter(filter, this.dashboard, [], this.field).then((result) => {
        if ('include' === filter.type) {

          // 기본값 설정
          const inclusionFilter: InclusionFilter = <InclusionFilter>filter;
          if (inclusionFilter.hasOwnProperty('valueList') && inclusionFilter.valueList.length > 0) {
            this.selectedItems = inclusionFilter.valueList.map(item => this._stringToCandidate(item));
          }

          this.candidateList = [];

          // 사용자 정의 값 추가
          this.addDefineValues(inclusionFilter);

          if(result && Array.isArray(result) && result.length > 100) {
            this.isSearchingCandidateAvailability = true;
          } else {
            this.isSearchingCandidateAvailability = false;
          }

          // 선택된 후보값 목록
          const selectedCandidateValues: string[] = inclusionFilter.candidateValues;

          // 후보값 추가
          if (selectedCandidateValues && 0 < selectedCandidateValues.length) {
            result.forEach((item) => {
              if (selectedCandidateValues.some(selectedItem => item.field === selectedItem)) {
                this.candidateList.push(this._objToCandidate(item, this.field));
              }
            });
          } else {
            result.forEach(item => {
              this.candidateList.push(this._objToCandidate(item, this.field));
            });
          }

          // Sort List
          if (isNullOrUndefined(inclusionFilter.sort)) {
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
          const boundFilter: BoundFilter = <BoundFilter>filter;
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
          } else if (this.filter.type === "bound") {
            const boundFilter: BoundFilter = <BoundFilter>this.filter;
            const paramValues: string[] = value.split(",");
            if (paramValues.length == 2) {
              const min = Number(paramValues[0]);
              const max = Number(paramValues[1]);
              if (!isNaN(min) && !isNaN(max)) {
                boundFilter.min = min;
                boundFilter.max = max;
                boundFilter.minValue = min;
                boundFilter.maxValue = max;
              }
            }
          } else if (this.filter.type === "time_range") {
            const timeRangeFilter: TimeRangeFilter = <TimeRangeFilter>this.filter;
            if (Array.isArray(value)) {
              timeRangeFilter.intervals = value;
            } else {
              timeRangeFilter.intervals = [value];
            }
          } else if (this.filter.type === "time_relative") {
            const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>this.filter;
            const valueAttributes = value.split(",");
            valueAttributes.forEach(attr => {
              const keyValue: string[] = attr.split(":");
              if (keyValue[0] === "tense") {
                timeRelativeFilter.tense = TimeRelativeTense[keyValue[1]];
              } else if (keyValue[0] === "relTimeUnit") {
                timeRelativeFilter.relTimeUnit = TimeUnit[keyValue[1]];
              } else if (keyValue[0] === 'value') {
                timeRelativeFilter.value = +keyValue[1];
              }
            });
          } else if (this.filter.type === "time_list") {
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Time Filter
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
  } // function - _setTimeFilterStatus

  private existCandidate(name : string) : boolean {
    const filteredCandidates = this.candidateList.filter(candidate => candidate.name === name);
    if(filteredCandidates != null && filteredCandidates.length > 0) {
      return true;
    } else {
      return false;
    }
  }

}
