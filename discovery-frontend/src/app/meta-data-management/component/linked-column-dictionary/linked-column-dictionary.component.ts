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

import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {CodeTableService} from '../../code-table/service/code-table.service';
import {ColumnDictionary} from '@domain/meta-data-management/column-dictionary';

@Component({
  selector: 'app-linked-column-dictionary',
  templateUrl: './linked-column-dictionary.component.html',
})
export class LinkedColumnDictionaryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 아이디
  private _codeTableId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 연결된 컬럼 사전 목록
  public columnDictionaryList: ColumnDictionary[];
  // 정렬
  public selectedContentSort: Order;
  // flag
  public isShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _codeTableService: CodeTableService,
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
   * @param {string} codeTableId
   */
  public init(codeTableId: string): void {
    // ui init
    this._initView();
    // 코드테이블 아이디
    this._codeTableId = codeTableId;
    // show flag
    this.isShowFl = true;
    // 연결된 컬럼 사전 목록 조회
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
   * close 클릭 이벤트
   */
  public onClickClose(): void {
    this.isShowFl = false;
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
    this._getColumnDictionaryListPageInit();
  }

  /**
   * 논리명 클릭 이벤트
   * @param {ColumnDictionary} columnDictionary
   */
  public onClickLogicalName(columnDictionary: ColumnDictionary): void {
    // 해당 컬럼사전으로 이동
    this.router.navigate(['management/metadata/column-dictionary', columnDictionary.id]);
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
    // page 초기화
    this.pageResult.size = 15;
    this.pageResult.number = 0;
    // 정렬 초기화
    this.selectedContentSort = new Order();
    // 목록 초기화
    this.columnDictionaryList = [];
  }

  /**
   * 연결된 컬럼 사전 목록 조회
   * @private
   */
  private _getColumnDictionaryList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 목록 조회
    this._codeTableService.getColumnDictionaryInCodeTable(this._codeTableId, this._getColumnDictionaryListParams(),
      'forListView').then((result) => {
      // 전달 받은 page number가 0 이면 연결된 컬럼 사전 목록 초기화
      this.pageResult.number === 0 && (this.columnDictionaryList = []);
      // page
      this.pageResult = result['page'];
      // 연결된 물리 컬럼 목록
      this.columnDictionaryList = result['_embedded'] ?
        this.columnDictionaryList.concat(result['_embedded'].dictionaries) :
        [];
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 페이지 초기화 후 연결된 컬럼 사전 목록 조회
   * @private
   */
  private _getColumnDictionaryListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getColumnDictionaryList();
  }

  /**
   * 연결된 컬럼 사전 목록 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getColumnDictionaryListParams(): object {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };

    return params;
  }
}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}
