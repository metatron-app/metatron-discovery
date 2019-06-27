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
  OnChanges,
  OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {
  Candidate,
  InclusionFilter,
  InclusionSelectorType, InclusionSortBy
} from '../../../domain/workbook/configurations/filter/inclusion-filter';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {SubscribeArg} from '../../../common/domain/subscribe-arg';
import {Filter} from '../../../domain/workbook/configurations/filter/filter';
import {PopupService} from '../../../common/service/popup.service';
import {AbstractFilterPanelComponent} from '../abstract-filter-panel.component';
import {Field} from '../../../domain/datasource/datasource';
import {StringUtil} from '../../../common/util/string.util';
import {DIRECTION} from '../../../domain/workbook/configurations/sort';
import {EventBroadcaster} from '../../../common/event/event.broadcaster';
import {FilterWidget} from '../../../domain/dashboard/widget/filter-widget';
import {FilterUtil} from "../../util/filter.util";
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'inclusion-filter-panel',
  templateUrl: './inclusion-filter-panel.component.html'
})
export class InclusionFilterPanelComponent extends AbstractFilterPanelComponent implements OnInit, OnChanges, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 후보군 리스트
  private _candidateList: Candidate[] = [];

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필터
  public filter: InclusionFilter;

  // 페이징 관련
  public pageCandidateList: Candidate[] = [];
  public currentPage = 1;
  public lastPage = 1;
  public pageSize = 10;
  public totalCount = 0;

  // 검색 관련
  public searchText = '';

  public isMultiSelector: boolean = false;        // 복수 선택 여부
  public isSearchFocus: boolean = false;          // 검색바 포커스 여부
  public isOverCandidateWarning: boolean = false;  // Candidate Limit 을 넘겼는지 여부

  public searchAllMessage = '';

  @Input('filter')
  public originalFilter: InclusionFilter;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              private popupService: PopupService,
              protected datasourceService: DatasourceService,
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

    this._initComponent(this.originalFilter);

    // 필터 선택 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_FILTER_SELECTOR').subscribe(data => {
        this.filter.selector = (<FilterWidget>data.widget).configuration.filter['selector'];
      })
    );

    // 위젯에서 필터를 업데이트 popup은 아니지만 동일한 기능이 필요해서 popupService를 사용
    const popupSubscribe = this.popupService.filterView$.subscribe((data: SubscribeArg) => {

      // 페이지에서 호출했는데 대시보드인경우 처리 하지 않음
      if (data.type === 'page' && this.isDashboardMode) return;

      // 필터 위젯에서 값이 변경될 경우
      if ('change-filter' === data.name && this.filter.field === data.data.field && this.filter.dataSource === data.data.dataSource) {
        this._initComponent(data.data);
      } else if ('remove-filter' === data.name && this.filter.ui.importanceType === 'general') {
        this._resetList(data.data);
      } else if ('reset-general-filter' === data.name && this.filter.ui.importanceType === 'general') {
        this.filter.valueList = [];
        this._candidate();
      } else if ('change-recommended-filter-value' === data.name && this.filter.ui.importanceType === 'recommended') {
        const filter: Filter = data.data;
        // 변경한 필터보다 하위 필터일 경우만 candidate 다시
        if (filter.ui.filteringSeq < this.filter.ui.filteringSeq) {
          this._resetList(filter);
        }
      }
    });
    this.subscriptions.push(popupSubscribe);
    this.changeDetect.detectChanges();
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

  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;

  /**
   * 검색 입력을 비활성 처리 합니다.
   */
  public inactiveSearchInput() {
    let inputElm = this._inputSearch.nativeElement;
    ('' === inputElm.value.trim()) && (this.isSearchFocus = false);
    inputElm.blur();
  } // function - inactiveSearchInput

  /**
   * Candidate 목록의 전체 갯수 조회
   */
  public get candidateListSize(): number {
    return this._candidateList.length;
  } // get - candidateListSize

  /**
   * 전체선택
   * @param {MouseEvent} event
   */
  public checkAll(event: MouseEvent) {
    if (this.isMultiSelector) {
      const checked = event.target ? event.target['checked'] : event.currentTarget['checked'];
      if (checked) {
        this.filter.valueList = [];
        this._candidateList.forEach(item => this.filter.valueList.push(item.name));
      } else {
        this.filter.valueList = [];
      }
    } else {
      this.filter.valueList = [];
    }

    // 선택값을 후보값에 넣는다.
    this.filter.valueList.forEach(item => {
      if (-1 === this.filter.candidateValues.indexOf(item)) {
        this.filter.candidateValues.push(item);
      }
    });

    this.updateFilterEvent.emit(this.filter);
  } // function - checkAll

  /**
   * 전체 체크 여부
   * @returns {boolean}
   */
  public isCheckAll(): boolean {
    return this.filter.valueList.length > 0 && this.filter.valueList.length === this._candidateList.length;
  } // function - isCheckAll

  /**
   * 값 선택
   * @param {string} item
   * @param {MouseEvent} event
   */
  public onSelected(item: string, event?: MouseEvent) {
    if (this.isMultiSelector) {
      // 멀티 리스트
      const checked = event.target ? event.target['checked'] : event.currentTarget['checked'];
      if (checked) {
        this.filter.valueList.push(item);
      } else {
        const idx = this.filter.valueList.indexOf(item);
        this.filter.valueList.splice(idx, 1);
      }
    } else {
      // 싱글 리스트
      this.filter.valueList = [];
      this.filter.valueList.push(item);
    }

    // 선택값을 후보값에 넣는다.
    this.filter.valueList.forEach(item => {
      if (-1 === this.filter.candidateValues.indexOf(item)) {
        this.filter.candidateValues.push(item);
      }
    });

    this.updateFilterEvent.emit(this.filter);
  } // function - onSelected

  /**
   * 목록에 사용자 정의값 추가
   */
  public addDefineValues() {
    if (this.filter.definedValues && this.filter.definedValues.length > 0) {
      this._candidateList = this.filter.definedValues.map(item => this._stringToCandidate(item)).concat(this._candidateList);
    }
  } // function - addDefineValues

  /**
   * 값 초기화 (서버에 마지막으로 저장된 값)
   * @param {InclusionFilter} filter
   */
  public resetFilter(filter: InclusionFilter) {
    this.filter = _.cloneDeep(this.originalFilter);
    this.safelyDetectChanges();
    this.updateFilterEvent.emit(this.filter);
  } // function - resetFilter

  /**
   * 상세메뉴 온오프
   */
  public toggleDetailMenu() {
    this.isShowDetailMenu = !this.isShowDetailMenu;
  } // function resetFilter

  public sortBy = InclusionSortBy;
  public sortDirection = DIRECTION;

  /**
   * 후보값을 정렬한다.
   * @param {InclusionFilter} filter
   * @param {InclusionSortBy} sortBy
   * @param {DIRECTION} direction
   */
  public sortCandidateValues(filter: InclusionFilter, sortBy?: InclusionSortBy, direction?: DIRECTION) {
    // 정렬 정보 저장
    (sortBy) && (filter.sort.by = sortBy);
    (direction) && (filter.sort.direction = direction);

    // 데이터 정렬
    const allCandidates: Candidate[] = _.cloneDeep(this._candidateList);
    if (InclusionSortBy.COUNT === filter.sort.by) {
      // value 기준으로 정렬
      allCandidates.sort((val1: Candidate, val2: Candidate) => {
        return (DIRECTION.ASC === filter.sort.direction) ? val1.count - val2.count : val2.count - val1.count;
      });
    } else {
      // name 기준으로 정렬
      allCandidates.sort((val1: Candidate, val2: Candidate) => {
        const name1: string = (val1.name) ? val1.name.toUpperCase() : '';
        const name2: string = (val2.name) ? val2.name.toUpperCase() : '';
        if (name1 < name2) {
          return (DIRECTION.ASC === filter.sort.direction) ? -1 : 1;
        }
        if (name1 > name2) {
          return (DIRECTION.ASC === filter.sort.direction) ? 1 : -1;
        }
        return 0;
      });
    }
    this._candidateList = allCandidates;

    // 페이징 설정
    this.setCandidatePage(1, true);

    this.safelyDetectChanges();
  } // function - sortCandidateValues

  /**
   * candidate list 페이징
   * @param {number} page
   * @param {boolean} isInitial
   */
  public setCandidatePage(page: number, isInitial: boolean = false) {
    if(this.searchText === '') {
      this.searchAllMessage = '';
    } else {
      this.searchAllMessage = this.translateService.instant('msg.board.filter.ui.search-all');
    }

    if (isInitial) {
      this.pageCandidateList = [];
      this.currentPage = 1;
      this.lastPage = 1;
      this.totalCount = 0;
    }

    // 더이상 페이지가 없을 경우 리턴
    if (page <= 0) return;
    if (this.lastPage < page) return;

    this.currentPage = page;
    let start = 0;
    let end = 0;

    // 필드 페이징
    if (this._candidateList && 0 < this._candidateList.length) {

      let pagedList: Candidate[] = _.cloneDeep(this._candidateList);

      if (this.filter.showSelectedItem) {
        pagedList = pagedList.filter(item => {
          return -1 < this.filter.valueList.findIndex(val => val === item.name);
        });
      }

      // 검색 적용
      if ('' !== this.searchText) {
        pagedList = pagedList.filter(item => {
          return ( item.name ) ? -1 < item.name.toLowerCase().indexOf(this.searchText.toLowerCase()) : false;
        });
      }

      // 총사이즈
      this.totalCount = pagedList.length;

      // 마지막 페이지 계산
      this.lastPage = (this.totalCount % this.pageSize === 0) ? (this.totalCount / this.pageSize) : Math.floor(this.totalCount / this.pageSize) + 1;
      (1 > this.lastPage) && (this.lastPage = 1);

      start = (page * this.pageSize) - this.pageSize;
      end = page * this.pageSize;
      if (end > this.totalCount) {
        end = this.totalCount;
      }
      // 현재 페이지에 맞게 데이터 자르기
      this.pageCandidateList = pagedList.slice(start, end);
    }
  } // function - setCandidatePage

  /**
   * 필터 삭제
   * @param {Filter} filter
   */
  public deleteFilter(filter: Filter) {
    this.deleteFilterEvent.emit(filter);
  } // function - deleteFilter

  /**
   * 팝업을 통한 필터 수정
   * @param {Filter} filter
   */
  public editFilterByPopup(filter: Filter) {
    this.openUpdateFilterPopup(filter);
  } // function - editFilterByPopup

  /**
   * API 검색을 위한 펄터 팝업 오픈
   */
  public candidateFromSearchText() {
    this.isSearchFocus = false;
    this._candidate(false);
  } // function - candidateFromSearchText

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 설정
   * @param {InclusionFilter} filter
   * @private
   */
  private _initComponent(filter: InclusionFilter) {
    const currFilter: InclusionFilter = _.cloneDeep(filter);

    // Selector 설정
    if (currFilter.valueList && 1 < currFilter.valueList.length) {
      this.isMultiSelector = true;
    } else {
      this.isMultiSelector = (currFilter.selector === InclusionSelectorType.MULTI_COMBO || currFilter.selector === InclusionSelectorType.MULTI_LIST);
    }

    this.filter = currFilter;

    this.setPanelData(currFilter);  // 패널에서 사용하는 데이터 설정

    (this.dataSource) && (this._candidate()); // 데이터 목록 조회

  } // function - _initComponent

  /**
   * 목록 초기화
   * @param {Filter} filter
   * @private
   */
  private _resetList(filter: Filter) {
    if (filter.field !== this.filter.field) {
      // 변경한 필터가 차트 필터면 차트 필터만 변경
      if (filter.ui.widgetId && filter.ui.widgetId === this.filter.ui.widgetId) {
        this._candidate();
      } else if (!filter.ui.widgetId) {
        // 글로벌 필터일경우 갱신
        this._candidate();
      }
    }
  } // function - _resetList

  /**
   * 필터 목록 조회
   * @param {boolean} isInit
   * @private
   */
  private _candidate(isInit: boolean = true) {
    if (this.filter && this.dashboard && this.field) {
      // 필터 데이터 후보 조회
      this.loadingShow();
      // this.datasourceService.getCandidateForFilter(
      //   this.filter, this.dashboard, this.getFiltersParam(this.filter), this.field).then((result) => {
      this.datasourceService.getCandidateForFilter(
        this.filter, this.dashboard, [], this.field, 'COUNT', this.searchText).then((result) => {

        this._candidateList = [];

        // 사용자 정의 값 추가
        this.addDefineValues();

        // 선택된 후보값 목록
        const selectedCandidateValues: string[] = this.filter.candidateValues;

        if (selectedCandidateValues && 0 < selectedCandidateValues.length) {
          // 후보값 추가
          selectedCandidateValues.forEach((selectedItem) => {
            const item = result.find(item => item.field === selectedItem);
            if (item) {
              this._candidateList.push(this._objToCandidate(item, this.field));
            } else {
              this._candidateList.push(this._stringToCandidate(selectedItem));
            }
          });
          // 후보값에 포함되지 않은 검색값 추가
          if (this.searchText) {
            result.forEach(searchItem => {
              const item = this._candidateList.find(item => item.name === searchItem.field);
              if (isNullOrUndefined(item)) {
                this._candidateList.push(this._objToCandidate(searchItem, this.field));
              }
            });
          }
        } else {
          // 전체 목록 추가
          this.filter.candidateValues = [];
          result.forEach(item => {
            this.filter.candidateValues.push( item.field );
            this._candidateList.push(this._objToCandidate(item, this.field));
          });
        }

        // 추가 데이터가 있는지 여부
        if (isInit) {
          this.isOverCandidateWarning = (FilterUtil.CANDIDATE_LIMIT <= result.length || result.length > this.candidateListSize);
        }

        // 정렬
        this.sortCandidateValues(this.filter);

        // 위젯 화면 표시
        this.isShowFilter = true;

        if(result == null || result.length == 0) {
          this.searchAllMessage = this.translateService.instant('msg.board.filter.ui.search-all.nodata');
        } else {
          this.searchAllMessage = '';
        }

        this.loadingHide();
      }).catch((error) => {
        this.commonExceptionHandler(error);
        // 목록 비움
        this._candidateList = [];
        // 위젯 화면 표시
        this.isShowFilter = true;
      });
    }

  } // function - _candidate

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
}
