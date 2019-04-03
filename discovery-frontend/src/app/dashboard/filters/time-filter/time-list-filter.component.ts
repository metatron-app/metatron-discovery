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
import {AbstractFilterPopupComponent} from '../abstract-filter-popup.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit, Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {Dashboard} from '../../../domain/dashboard/dashboard';
import {Field} from '../../../domain/datasource/datasource';
import {CustomField} from '../../../domain/workbook/configurations/field/custom-field';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {Candidate} from '../../../domain/workbook/configurations/filter/inclusion-filter';
import {TimeListFilter} from '../../../domain/workbook/configurations/filter/time-list-filter';

@Component({
  selector: 'app-time-list-filter',
  templateUrl: 'time-list-filter.component.html'
})
export class TimeListFilterComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _isApiSort: boolean = true;

  // 후보군 리스트
  private _candidateList: Candidate[] = [];

  // 선택 정보
  private _selectedValues: Candidate[] = [];   // 기본 선택 값 목록
  private _candidateValues: Candidate[] = [];  // 기본 선택 값 목록

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public useAll: boolean = false;

  public isOnlyShowCandidateValues: boolean = false;   // 표시할 후보값만 표시 여부

  // 페이징 관련
  public pageCandidateList: Candidate[] = [];
  public currentPage: number = 1;
  public lastPage: number = 1;
  public pageSize: number = 15;
  public totalCount: number = 0;
  public totalItemCnt: number = 0;

  public targetFilter: TimeListFilter;    // 필터

  // 초기 입력 정보 정의
  @Input('filter')
  public inputFilter: TimeListFilter;     // 입력 필터

  @Input('dashboard')
  public dashboard: Dashboard;

  @Input('field')
  public targetField: (Field | CustomField);

  @Input('mode')
  public mode: string = 'CHANGE';

  // 필터 변경 이벤트
  @Output('change')
  public changeEvent: EventEmitter<TimeListFilter> = new EventEmitter();

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
    const prevFilter: TimeListFilter = filterChanges.previousValue;
    const currFilter: TimeListFilter = filterChanges.currentValue;
    if (currFilter && (
      !prevFilter || prevFilter.field !== currFilter.field || prevFilter.timeUnit !== currFilter.timeUnit ||
      0 < _.difference(prevFilter.valueList, currFilter.valueList).length ||
      0 < _.difference(prevFilter.candidateValues, currFilter.candidateValues).length)) {
      this.setData(filterChanges.currentValue, !filterChanges.firstChange);
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 강제 데이터 설정
   * @param {TimeListFilter} filter
   * @param {boolean} isBroadcast
   */
  public setData(filter: TimeListFilter, isBroadcast: boolean = false) {

    // 값 정보 설정
    if (filter.valueList && 0 < filter.valueList.length) {
      this._selectedValues = filter.valueList.map(item => this._stringToCandidate(item));
    }
    if (filter.candidateValues && 0 < filter.candidateValues.length) {
      this._candidateValues = filter.candidateValues.map(item => this._stringToCandidate(item));
      if ('CHANGE' !== this.mode) {
        this.isOnlyShowCandidateValues = true;
      }
    }

    // 후보값 불러오기
    this._loadCandidateList(filter, 'VALUE', isBroadcast);

  } // function - setData

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {TimeListFilter}
   */
  public getData(): TimeListFilter {
    const filter: TimeListFilter = this.targetFilter;
    filter.valueList = this._selectedValues.map(item => item.name);
    filter.candidateValues = this._candidateValues.map(item => item.name);
    return filter;
  } // function - getData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - 목록 정렬 관련
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 후보값을 정렬한다.
   * @param {TimeListFilter} filter
   * @param {string} target
   * @param {string} type
   */
  public sortCandidateValues(filter: TimeListFilter, target: string, type: string) {
    if (this._isApiSort) {
      // 후보값 불러오기
      this._loadCandidateList(filter, ('FREQUENCY' === target) ? 'COUNT' : 'VALUE');
    } else {
      // 정렬 정보 저장
      filter['sortTarget'] = target;
      filter['sortType'] = type;

      // 데이터 정렬
      const allCandidates: Candidate[] = _.cloneDeep(this._candidateList);
      if ('FREQUENCY' === target) {
        // value 기준으로 정렬
        allCandidates.sort((val1: Candidate, val2: Candidate) => {
          return ('ASC' === type) ? val1.count - val2.count : val2.count - val1.count;
        });
      } else {
        // name 기준으로 정렬
        allCandidates.sort((val1: Candidate, val2: Candidate) => {
          const name1: string = (val1.name) ? val1.name.toUpperCase() : '';
          const name2: string = (val2.name) ? val2.name.toUpperCase() : '';
          if (name1 < name2) {
            return ('ASC' === type) ? -1 : 1;
          }
          if (name1 > name2) {
            return ('ASC' === type) ? 1 : -1;
          }
          return 0;
        });
      }
      this._candidateList = allCandidates;

      if ('WIDGET' === this.mode) {
        this.pageCandidateList = _.cloneDeep(this._candidateList);
      } else {
        this.setCandidatePage(1, true);
      }

    }
  } // function - sortCandidateValues

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - 목록 페이징 관련
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * candidate list 페이징
   * @param {number} page
   * @param {boolean} isInitial
   */
  public setCandidatePage(page: number, isInitial: boolean = false) {

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

      // 표시 여부 적용
      if (this.isOnlyShowCandidateValues) {
        pagedList = pagedList.filter(item => this.isShowItem(item));
      }

      // 총사이즈
      this.totalCount = pagedList.length;

      // 마지막 페이지 계산
      this.lastPage = (this.totalCount % this.pageSize === 0) ? (this.totalCount / this.pageSize) : Math.floor(this.totalCount / this.pageSize) + 1;

      start = (page * this.pageSize) - this.pageSize;
      end = (page * this.pageSize) - 1;
      if (end > this.totalCount) {
        end = this.totalCount;
      }
      // 현재 페이지에 맞게 데이터 자르기
      this.pageCandidateList = pagedList.slice(start, end);
    }
  } // function - setCandidatePage

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - 목록 아이템 관련
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 전체 선택
   * @param event
   */
  public candidateSelectAll(event: any) {
    const checked = event.target ? event.target.checked : event.currentTarget.checked;
    if (checked) {
      this._selectedValues = _.cloneDeep(this._candidateList);
    } else {
      this._selectedValues = [];
    }
    this.changeEvent.emit(this.getData());
  } // function - candidateSelectAll

  /**
   * 전체 선택 여부
   * @return {boolean}
   */
  public isCheckedAllItem(): boolean {
    return this._selectedValues.length === this._candidateList.length;
  } // function - isCheckedAllItem

  /**
   * 선택된 아이템 여부
   * @param {Candidate} listItem
   * @return {boolean}
   */
  public isCheckedItem(listItem: Candidate): boolean {
    return -1 < this._selectedValues.findIndex(item => item.name === listItem.name);
  } // function - isCheckedItem

  /**
   * 표시 아이템 여부
   * @param {Candidate} listItem
   * @return {boolean}
   */
  public isShowItem(listItem: Candidate): boolean {
    return -1 < this._candidateValues.findIndex(item => item.name === listItem.name);
  } // function - isShowItem

  /**
   * 후보군 값 선택
   * @param {Candidate} item
   * @param event
   */
  public candidateSelect(item: Candidate, event: any) {
    // 멀티 리스트
    const checked = event.target ? event.target.checked : event.currentTarget.checked;
    if (checked) {
      this._selectedValues.push(item);
    } else {
      _.remove(this._selectedValues, {name: item.name});
    }

    // 값 변경 전달
    this.changeEvent.emit(this.getData());
  } // function - candidateSelect

  /**
   * 선별값만 보임 여부 설정
   */
  public setOnlyShowCandidateValues() {
    this.isOnlyShowCandidateValues = !this.isOnlyShowCandidateValues;
    this.setCandidatePage(1, true);
  } // function - setOnlyShowCandidateValues

  /**
   * 눈표시
   * param { Candidate } item
   */
  public candidateShowToggle(item: Candidate) {
    if (this.isShowItem(item)) {
      _.remove(this._candidateValues, {name: item.name});
    } else {
      this._candidateValues.push(item);
    }

    if (this.isOnlyShowCandidateValues) {
      this.setCandidatePage(1, true);
    }
  } // function candidateShowToggle

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 후보값 불러오기
   * @param {TimeListFilter} filter
   * @param {string} sortBy
   * @param {boolean} isBroadcast
   * @private
   */
  private _loadCandidateList(filter: TimeListFilter, sortBy: string = 'VALUE', isBroadcast: boolean = false) {
    this.loadingShow();
    this.datasourceService.getCandidateForFilter(filter, this.dashboard, [], null, sortBy).then(result => {
      this._setCandidateResult(result, filter, sortBy);
      this.targetFilter = filter;
      this.safelyDetectChanges();

      // 전체 선택 기능 체크 및 전체 선택 기능이 비활성 일떄, 초기값 기본 선택 - for Essential Filter
      if (this.targetField) {
        this.useAll = !(-1 < this.targetField.filteringSeq);
      } else {
        this.useAll = true;
      }
      if (false === this.useAll && 0 === this._selectedValues.length) {
        this._selectedValues.push(this._candidateList[0]);
      }

      // 변경사항 전파
      (isBroadcast) && (this.changeEvent.emit(this.getData()));

      this.loadingHide();
    }).catch(err => this.commonExceptionHandler(err));
  } // function - _loadCandidateList

  /**
   * Candidate 결과 처리
   * @param result
   * @param {TimeListFilter} targetFilter
   * @param {string} sortBy
   * @private
   */
  private _setCandidateResult(result: any[], targetFilter: TimeListFilter, sortBy: string = 'VALUE') {
    this._candidateList = [];

    result.forEach((item) => {
      const candidate = new Candidate();
      candidate.name = item['field'];
      candidate.count = item['count'];
      this._candidateList.push(candidate);
    });
    (targetFilter.candidateValues) || (targetFilter.candidateValues = []);
    this.totalItemCnt = this._candidateList.length;

    // 정렬
    if (this._isApiSort) {
      targetFilter['sortTarget'] = ('VALUE' === sortBy) ? 'ALPHNUMERIC' : 'FREQUENCY';
      targetFilter['sortType'] = 'ASC';

      if ('WIDGET' === this.mode) {
        this.pageCandidateList = _.cloneDeep(this._candidateList);
      } else {
        this.setCandidatePage(1, true);
      }

    } else {
      this.sortCandidateValues(targetFilter, 'ALPHNUMERIC', 'ASC');
    }
  } // function - _setCandidateResult

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
