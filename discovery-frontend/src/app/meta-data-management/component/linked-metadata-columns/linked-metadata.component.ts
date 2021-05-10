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
import {ColumnDictionaryService} from '../../column-dictionary/service/column-dictionary.service';
import {LinkedMetaDataColumn} from '@domain/meta-data-management/metadata-column';

@Component({
  selector: 'app-linked-metadata',
  templateUrl: './linked-metadata.component.html',
})
export class LinkedMetadataComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컬럼 사전 아이디
  private _dictionaryId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 메타데이터 목록
  public metaDataList: LinkedMetaDataColumn[] = [];

  // 정렬
  public selectedContentSort: Order = new Order();

  // show flag
  public isShowFl: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
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
   * @param {string} dictionaryId
   */
  public init(dictionaryId: string): void {
    // ui init
    this._initView();
    // 컬럼 사전 아이디
    this._dictionaryId = dictionaryId;
    // show flag
    this.isShowFl = true;
    // 연결된 물리 컬럼 목록 조회
    this._getMetadataList();
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 닫기 클릭 이벤트
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
    this._getMetadataList();
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
    this._getMetadataListPageInit();
  }

  /**
   * 메타데이터 이름 클릭 이벤트
   * @param {LinkedMetaDataColumn} metadata
   */
  public onClickMetadataName(metadata: LinkedMetaDataColumn): void {
    this.router.navigate(['management/metadata/metadata', metadata.metadataId]);
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
    // 메타데이터 목록 초기화
    this.metaDataList = [];
    // sort 초기화
    this.selectedContentSort = new Order();
  }

  /**
   * 연결된 메타데이터 목록 조회
   * @private
   */
  private _getMetadataList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 목록 조회
    this._columnDictionaryService.getMetadataInColumnDictionary(this._dictionaryId, this._getMetadataListParams()).then((result) => {
      // 전달 받은 page number가 0 이면 연결된 메타데이터 컬럼 목록 초기화
      this.pageResult.number === 0 && (this.metaDataList = []);
      // page
      this.pageResult = result['page'];
      // 연결된 메타데이터 컬럼 목록
      this.metaDataList = result['_embedded'] ? this.metaDataList.concat(result['_embedded'].metacolumns) : [];
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 페이지 초기화 후 연결된 메타데이터 목록 조회
   * @private
   */
  private _getMetadataListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getMetadataList();
  }

  /**
   * 연결된 물리 컬럼 목록 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getMetadataListParams(): object {
    return {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };
  }

}

class Order {
  key: string = 'metadataName';
  sort: string = 'asc';
}
