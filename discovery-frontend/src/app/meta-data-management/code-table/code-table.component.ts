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
import {Subscription} from 'rxjs';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import {PeriodData} from '@common/value/period.data.value';
import {AbstractComponent} from '@common/component/abstract.component';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {PeriodComponent} from '@common/component/period/period.component';
import {CodeTable} from '@domain/meta-data-management/code-table';
import {Criteria} from '@domain/datasource/criteria';
import {CreateCodeTableComponent} from './create-code-table/create-code-table.component';
import {CodeTableService} from './service/code-table.service';
import DateTimeType = Criteria.DateTimeType;

declare let moment: any;

@Component({
  selector: 'app-code-table',
  templateUrl: './code-table.component.html',
})
export class CodeTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성 컴포넌트
  @ViewChild(CreateCodeTableComponent)
  private _createCodeTableComp: CreateCodeTableComponent;

  // 삭제 컴포넌트
  @ViewChild(DeleteModalComponent)
  private _deleteComp: DeleteModalComponent;

  // date
  private _selectedDate: PeriodData = new PeriodData();

  // 검색 파라메터
  private _searchParams: any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  public codeTableList: CodeTable[];

  public searchText: string;

  public selectedType: DateTimeType;

  public defaultDate: PeriodData;

  startTime: string = '';
  finishTime: string = '';
  betweenPastTime = 'msg.storage.ui.criterion.time.past';
  betweenCurrentTime = 'msg.storage.ui.criterion.time.current';

  // sort
  readonly sortList = [
    {name: this.translateService.instant('msg.comm.ui.sort.name.asc'), value: 'name,asc'},
    {name: this.translateService.instant('msg.comm.ui.sort.name.desc'), value: 'name,desc'},
    {name: this.translateService.instant('msg.comm.ui.sort.updated.asc'), value: 'modifiedTime,asc'},
    {name: this.translateService.instant('msg.comm.ui.sort.updated.desc'), value: 'modifiedTime,desc'},
  ];
  selectedSort;

  private _paginationSubscription$: Subscription;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private _codeTableService: CodeTableService,
    private _activatedRoute: ActivatedRoute,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    this._initView();
    // Get query param from url
    this._paginationSubscription$ = this._activatedRoute.queryParams.subscribe((params) => {

      if (!_.isEmpty(params)) {

        if (!this.isNullOrUndefined(params['size'])) {
          this.page.size = params['size'];
        }

        if (!this.isNullOrUndefined(params['page'])) {
          this.page.page = params['page'];
        }


        if (!this.isNullOrUndefined(params['nameContains'])) {
          this.searchText = params['nameContains'];
        }

        if (!_.isNil(params['sort'])) {
          this.selectedSort = this.sortList.find(sort => sort.value === params['sort']);
        }

        const from = params['from'];
        const to = params['to'];

        this._selectedDate = new PeriodData();
        this._selectedDate.startDate = from;
        this._selectedDate.endDate = to;

        this._selectedDate.startDateStr = decodeURIComponent(from);
        this._selectedDate.endDateStr = decodeURIComponent(to);
        this._selectedDate.type = params['type'];
        this.defaultDate = this._selectedDate;
        this.safelyDetectChanges();

      }

      this._getCodeTableList();
    });

  }

  public ngOnDestroy() {
    if (!_.isNil(this._paginationSubscription$)) {
      this._paginationSubscription$.unsubscribe();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 코드 테이블 제거
   * @param {Modal} modal
   */
  public deleteCodeTable(modal: Modal): void {

    this.loadingShow();

    this._codeTableService.deleteCodeTable(modal['codeTableId']).then(() => {

      this.loadingHide();

      Alert.success(this.translateService.instant('msg.metadata.ui.codetable.delete.success',
        {value: modal['codeTableName']}));
      if (this.page.page > 0 && this.codeTableList.length === 1) {
        this.page.page = this.page.page - 1;
      }
      this.reloadPage(false);

    }).catch((error) => {

      this.loadingHide();
      this.commonExceptionHandler(error);


    });
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 코드 테이블 생성 클릭 이벤트
   */
  public onClickCreateCodeTable(): void {
    this._createCodeTableComp.init();
  }

  /**
   * 코드 테이블 상세정보 클릭 이벤트
   * @param {string} codeTableId
   */
  public onClickDetailCodeTable(codeTableId: string): void {
    // 상세화면으로 이동
    this.router.navigate(['management/metadata/code-table', codeTableId]).then();
  }

  /**
   * 코드 테이블 삭제 클릭 이벤트
   * @param {CodeTable} codeTable
   */
  public onClickDeleteCodeTable(codeTable: CodeTable): void {
    // event stop
    event.stopImmediatePropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.codetable.delete.title');
    modal.description = codeTable.name;
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    modal['codeTableId'] = codeTable.id;
    modal['codeTableName'] = codeTable.name;
    this._deleteComp.init(modal);
  }

  /**
   * 필터링 초기화 버튼 클릭 이벤트
   */
  public onClickResetFilters(): void {
    // 정렬 초기화
    this.selectedSort = this.sortList[3];
    // create date 초기화
    this._selectedDate = null;
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // date 필터 init
    this.periodComponent.setAll();

    this.reloadPage();
  }

  /**
   * 코드 테이블 이름 검색
   */
  public onSearchText(): void {
    this._searchText(this.searchText);
  }

  /**
   * 코드 테이블 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 캘린더 선택 이벤트
   * @param selectedDate
   */
  public onChangeData(selectedDate): void {
    this.selectedType = selectedDate.type;

    const betweenFrom = selectedDate.startDate;
    const betweenTo = selectedDate.endDate;

    let startDate;
    let endDate;
    let type;
    let startDateStr;
    let endDateStr;
    const dateType = null;

    const returnFormat = 'YYYY-MM-DDTHH:mm';

    // if filter type is between
    if (this.selectedType === Criteria.DateTimeType.BETWEEN) {
      if (betweenFrom !== undefined) {
        this.betweenPastTime = betweenFrom;
      }
      if (betweenTo !== undefined) {
        this.betweenCurrentTime = betweenTo;
      }

      // Only set params need to request api according to condition otherwise just leave it null
      // if from and to is all exist
      if (betweenFrom !== undefined && betweenTo !== undefined) {
        startDate = betweenFrom;
        endDate = betweenTo;
        startDateStr = moment(betweenFrom).format(returnFormat);
        endDateStr = moment(betweenTo).format(returnFormat);
        // if only 'from' time is selected
      } else if (betweenFrom && betweenTo === undefined) {
        startDate = betweenFrom;
        startDateStr = moment(betweenFrom).format(returnFormat);
        // if only 'to' time is selected
      } else if (betweenFrom === undefined && betweenTo) {
        endDate = betweenTo;
        endDateStr = moment(betweenTo).format(returnFormat);
      }
      // if filter type is not between
    } else {
      this.startTime = betweenFrom;
      this.finishTime = betweenTo;

      startDate = betweenFrom;
      endDate = betweenTo;
      type = this.selectedType;
      startDateStr = moment(betweenFrom).format(returnFormat);
      endDateStr = moment(betweenTo).format(returnFormat);
    }

    this._selectedDate = {
      startDate: startDate,
      endDate: endDate,
      type: type,
      startDateStr: startDateStr,
      endDateStr: endDateStr,
      dateType: dateType
    };

    // 재조회
    this.reloadPage();
  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;

      this.reloadPage(false);
    }
  } // function - changePage

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getCodeTableListParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // 리스트 초기화
    this.codeTableList = [];
    // 검색어 초기화
    this.searchText = '';
    // 정렬 초기화
    this.selectedSort = this.sortList[3];
  }

  /**
   * 검색어로 코드 테이블 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {

    this.searchText = keyword;

    // 페이지 초기화 후 재조회
    this.reloadPage();
  }

  /**
   * After creating code table
   */
  public onCreateComplete(codeTableId: string) {
    this.onClickDetailCodeTable(codeTableId);
  }

  changeSort(sort) {
    this.selectedSort = sort;
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 코드 테이블 리스트 조회
   * @private
   */
  private _getCodeTableList(): void {

    this.loadingShow();

    const params = this._getCodeTableListParams();

    this.codeTableList = [];

    this._codeTableService.getCodeTableList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
      if (this.page.page > 0 &&
        this.isNullOrUndefined(result['_embedded']) ||
        (!this.isNullOrUndefined(result['_embedded']) && result['_embedded'].codetables.length === 0)) {
        this.page.page = result.page.number - 1;
        this._getCodeTableList();
      }

      this._searchParams = params;

      this.pageResult = result.page;

      this.codeTableList = result['_embedded'] ? this.codeTableList.concat(result['_embedded'].codetables) : [];

      this.loadingHide();

    }).catch((error) => {

      this.loadingHide();

      this.commonExceptionHandler(error);

    });
  }

  /**
   * 코드 테이블 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getCodeTableListParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      sort: this.selectedSort.value,
      pseudoParam: (new Date()).getTime()
    };
    // 검색어
    if (!this.isNullOrUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }
    // date
    // update time - not All type
    if (this._selectedDate && this._selectedDate.type !== 'ALL') {
      if (this._selectedDate.type !== 'NOT') {
        params['type'] = this._selectedDate.type;
      }
      params['searchDateBy'] = 'UPDATED';
      if (this._selectedDate.startDate) {
        params['from'] = moment(this._selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (this._selectedDate.endDate) {
        params['to'] = moment(this._selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    } else {
      params['type'] = 'ALL';
    }
    return params;
  }
}
