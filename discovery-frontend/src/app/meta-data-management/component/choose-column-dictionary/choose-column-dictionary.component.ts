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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {ColumnDictionary} from '@domain/meta-data-management/column-dictionary';
import {ColumnDictionaryService} from '../../column-dictionary/service/column-dictionary.service';
import {isUndefined} from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-choose-column-dictionary',
  templateUrl: './choose-column-dictionary.component.html',
})
export class ChooseColumnDictionaryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // mode
  private _mode: string;

  // 선택한 컬럼 사전 원본
  private _originSelectedColumnDictionary: ColumnDictionary;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컬럼 사전 목록
  public columnDictionaryList: ColumnDictionary[];
  // 검색어
  public searchText: string;
  // 정렬
  public selectedContentSort: Order;
  // show flag
  public showFl: boolean;
  // 선택한 컬럼 사전
  public selectedColumnDictionary: ColumnDictionary;

  @Output()
  public chooseComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _dictionaryService: ColumnDictionaryService,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   * @param {string} mode
   * @param {ColumnDictionary} selectedColumnDictionary
   * @param {string} _columnId
   */
  public init(mode: string, selectedColumnDictionary: ColumnDictionary, _columnId?: string): void {
    // ui init
    this._initView();
    // show flag
    this.showFl = true;
    // mode
    this._mode = mode;
    // exist selected table
    if (selectedColumnDictionary) {
      // 선택한 codeTable
      this.selectedColumnDictionary = _.cloneDeep(selectedColumnDictionary);
      // 수정모드일 경우 origin 선택한 column dictionary
      this._mode === 'UPDATE' && (this._originSelectedColumnDictionary = _.cloneDeep(selectedColumnDictionary));
    }
    // 목록 조회
    this._getColumnDictionaryList();
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * 페이지 초기화 후 컬럼 사전 리스트 재조회
   */
  public getColumnDictionaryListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getColumnDictionaryList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * done
   */
  public onClickDone(): void {
    // 생성모드일 경우 선택한 컬럼 사전 전달
    // 수정모드일 경우 TODO
    this._mode === 'CREATE' ? this._emitColumnDictionary() : this._updateColumnDictionary();
  }

  /**
   * cancel
   */
  public onClickCancel(): void {
    this.showFl = false;
  }

  /**
   * 정렬 버튼 클릭
   * @param {string} key
   */
  public onClickSort(key: string): void {
    // 정렬 정보 저장
    this.selectedContentSort.key = key;
    // 정렬 key와 일치하면
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
    this.getColumnDictionaryListPageInit();
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
   * 컬럼 사전 선택
   * @param {ColumnDictionary} columnDictionary
   */
  public onSelectColumnDictionary(columnDictionary: ColumnDictionary): void {
    this.selectedColumnDictionary = (this.selectedColumnDictionary && this.selectedColumnDictionary.id ===
      columnDictionary.id) ? null : columnDictionary;
  }

  /**
   * 컬럼 사전 이름 클릭 이벤트
   * @param {string} columnDictionaryId
   */
  public onClickDictionaryName(columnDictionaryId: string): void {
    // event stop
    event.stopImmediatePropagation();
    // 컬럼 사전 상세화면으로 이동
    this.router.navigate(['management/metadata/column-dictionary', columnDictionaryId]);
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreList(): void {
    // page 증가
    this.pageResult.number++;
    // 리스트 조회
    this._getColumnDictionaryList();
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
    // page 초기화
    this.pageResult.size = 15;
    this.pageResult.number = 0;
    // 선택한 컬럼 사전 초기화
    this.selectedColumnDictionary = null;
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
    this.getColumnDictionaryListPageInit();
  }

  /**
   * 컬럼 사전 변경 이벤트
   * @private
   */
  private _updateColumnDictionary(): void {
    // 기존의 선택한 컬럼 사전이 있다면
    (this._originSelectedColumnDictionary && !this.selectedColumnDictionary) ?
      this._unLinkColumnDictionary() :
      this._linkColumnDictionary();
  }

  /**
   * Column Dictionary 전달
   * @private
   */
  private _emitColumnDictionary(): void {
    // codeTable 전달
    this.chooseComplete.emit(this.selectedColumnDictionary);
    this.onClickCancel();
  }

  private _unLinkColumnDictionary(): void {

  }

  private _linkColumnDictionary(): void {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 사전 목록 조회
   * @private
   */
  private _getColumnDictionaryList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 목록 조회
    this._dictionaryService.getColumnDictionaryList(this._getColumnDictionaryListParams()).then((result) => {
      // 전달 받은 page number가 0 이면 컬럼 사전 리스트 초기화
      this.pageResult.number === 0 && (this.columnDictionaryList = []);
      // page 객체
      this.pageResult = result.page;
      // 컬럼 사전 리스트
      this.columnDictionaryList = result['_embedded'] ?
        this.columnDictionaryList.concat(result['_embedded'].dictionaries) :
        [];
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getColumnDictionaryListParams(): object {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };
    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }
    return params;
  }
}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}
