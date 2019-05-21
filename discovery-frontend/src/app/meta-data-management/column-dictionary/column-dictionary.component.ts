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

import {AbstractComponent} from '../../common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {isNullOrUndefined, isUndefined} from 'util';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Modal} from '../../common/domain/modal';
import {ColumnDictionary} from '../../domain/meta-data-management/column-dictionary';
import {ColumnDictionaryService} from './service/column-dictionary.service';
import {PeriodComponent} from '../../common/component/period/period.component';
import {Alert} from '../../common/util/alert.util';
import {CreateColumnDictionaryComponent} from './create-column-dictionary/create-column-dictionary.component';
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';
import {PeriodData} from "../../common/value/period.data.value";

declare let moment: any;

@Component({
  selector: 'app-column-dictionary',
  templateUrl: './column-dictionary.component.html',
})
export class ColumnDictionaryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성 컴포넌트
  @ViewChild(CreateColumnDictionaryComponent)
  private _createColumnDictionaryComp: CreateColumnDictionaryComponent;

  // 삭제 컴포넌트
  @ViewChild(DeleteModalComponent)
  private _deleteComp: DeleteModalComponent;

  // date
  private _selectedDate: PeriodData;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 컬럼 사전 목록
  public columnDictionaryList: ColumnDictionary[] = [];
  // 검색어
  public searchText: string = '';
  // 정렬
  public selectedContentSort: Order = new Order();

  public defaultDate: PeriodData;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
    private _activatedRoute: ActivatedRoute,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {

    super.ngOnInit();

    this._initView();

    this.subscriptions.push(
      // Get query param from url
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['logicalNameContains'])) {
            this.searchText = params['logicalNameContains'];
          }

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }

          const from = params['from'];
          const to = params['to'];

          this._selectedDate = new PeriodData;
          this._selectedDate.startDate = from;
          this._selectedDate.endDate = to;

          this._selectedDate.startDateStr = decodeURIComponent(from);
          this._selectedDate.endDateStr = decodeURIComponent(to);
          this._selectedDate.type = params['type'];
          this.defaultDate = this._selectedDate;
          this.safelyDetectChanges();

        }

        this._getColumnDictionaryList();

      })
    )
  }

  public ngOnDestroy() {

    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컬럼 사전 제거
   * @param {Modal} modal
   */
  public deleteColumnDictionary(modal: Modal): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 제거
    this._columnDictionaryService.deleteColumnDictionary(modal['dictionaryId'])
      .then((result) => {

        this.loadingHide();

        // alert
        Alert.success(this.translateService.instant(
          'msg.metadata.ui.dictionary.delete.success',
          modal['dictionaryName']));

        if (this.page.page !== 0 && this.columnDictionaryList.length === 1) {
          this.page.page = this.page.page - 1;
        }
        // 재조회
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
   * 컬럼 사전 생성 클릭 이벤트
   */
  public onClickCreateColumnDictionary(): void {
    this._createColumnDictionaryComp.init();
  }

  /**
   * 컬럼 사전 상세정보 클릭 이벤트
   * @param {string} columnDictionaryId
   */
  public onClickDetailColumnDictionary(columnDictionaryId: string): void {
    // 상세화면으로 이동
    this.router.navigate(
      ['management/metadata/column-dictionary', columnDictionaryId]).then();
  }

  /**
   * 컬럼 사전 삭제 클릭 이벤트
   * @param {ColumnDictionary} columnDictionary
   */
  public onClickDeleteColumnDictionary(columnDictionary: ColumnDictionary): void {
    // event stop
    event.stopImmediatePropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.dictionary.delete.title');
    modal.description = columnDictionary.logicalName;
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    modal['dictionaryId'] = columnDictionary.id;
    modal['dictionaryName'] = columnDictionary.logicalName;
    this._deleteComp.init(modal);
  }

  /**
   * 필터링 초기화 버튼 클릭 이벤트
   */
  public onClickResetFilters(): void {
    // 정렬
    this.selectedContentSort = new Order();
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
   * 정렬 버튼 클릭
   * @param {string} key
   */
  public onClickSort(key: string): void {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
    // 페이지 초기화 후 재조회
    this.reloadPage();
  }

  /**
   * 컬럼 사전 이름 검색
   */
  public onSearchText(): void {
    this._searchText(this.searchText);
  }

  /**
   * 컬럼 사전 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 캘린더 선택 이벤트
   * @param event
   */
  public onChangeData(event): void {
    // 선택한 날짜
    this._selectedDate = event;

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
      // 워크스페이스 조회
      this.reloadPage(false);
    }
  } // function - changePage

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getColumnDictionaryListParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage



  /**
   * After creating column dictionary
   */
  public onCreateComplete() {

    this.reloadPage();

  }
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
    this.columnDictionaryList = [];
    // 검색어 초기화
    this.searchText = '';
    // 정렬 초기화
    this.selectedContentSort = new Order();

  }

  /**
   * 검색어로 컬럼 사전 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;

    // 페이지 초기화 후 재조회
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 사전 리스트 조회
   * @private
   */
  private _getColumnDictionaryList(): void {

    this.loadingShow();

    const params = this._getColumnDictionaryListParams();

    this.columnDictionaryList = [];

    this._columnDictionaryService.getColumnDictionaryList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
      if (this.page.page > 0 &&
        isNullOrUndefined(result['_embedded']) ||
        (!isNullOrUndefined(result['_embedded']) && result['_embedded'].dictionaries.length === 0))
      {
        this.page.page = result.page.number - 1;
        this._getColumnDictionaryList();
      }

      this._searchParams = params;

      this.pageResult = result.page;

      this.columnDictionaryList = result['_embedded'] ?
        this.columnDictionaryList.concat(result['_embedded'].dictionaries) :
        [];

      this.loadingHide();

    }).catch((error) => {

      this.commonExceptionHandler(error);

      this.loadingHide();

    });
  }

  /**
   * 컬럼 사전 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getColumnDictionaryListParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      pseudoParam : (new Date()).getTime()
    };
    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      // params['nameContains'] = this.searchText.trim();
      params['logicalNameContains'] = this.searchText.trim();
    }
    // date
    if (this._selectedDate && this._selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      params['type'] = this._selectedDate.type;
      if (this._selectedDate.startDateStr) {
        params['from'] = moment(this._selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (this._selectedDate.endDateStr) {
        params['to'] = moment(this._selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    } else {
      params['type'] = 'ALL';
    }

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
  }
}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}
