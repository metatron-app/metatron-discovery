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

import { AbstractComponent } from '../../common/component/abstract.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { isUndefined } from 'util';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Modal } from '../../common/domain/modal';
import { ColumnDictionary } from '../../domain/meta-data-management/column-dictionary';
import { ColumnDictionaryService } from './service/column-dictionary.service';
import { PeriodComponent } from '../../common/component/period/period.component';
import * as _ from 'lodash';
import { Alert } from '../../common/util/alert.util';
import { CreateColumnDictionaryComponent } from './create-column-dictionary/create-column-dictionary.component';

declare let moment: any;

@Component({
  selector: 'app-column-dictionary',
  templateUrl: './column-dictionary.component.html'
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
  private _selectedDate: Date;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _columnDictionaryService: ColumnDictionaryService,
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
    // ui init
    this._initView();
    // 목록 조회
    this._getColumnDictionaryList();
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
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

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
        // alert
        Alert.success(this.translateService.instant('msg.metadata.ui.dictionary.delete.success', modal['dictionaryName']));
        // 재조회
        this.getColumnDictionaryListPageInit();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
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
   * 컬럼 사전 생성 클릭 이벤트
   */
  public onClickCreateColumnDictionary (): void {
    this._createColumnDictionaryComp.init();
  }

  /**
   * 컬럼 사전 상세정보 클릭 이벤트
   * @param {string} columnDictionaryId
   */
  public onClickDetailColumnDictionary(columnDictionaryId: string): void {
    // 상세화면으로 이동
    this.router.navigate(['management/metadata/column-dictionary', columnDictionaryId]);
  }

  /**
   * 컬럼 사전 삭제 클릭 이벤트
   * @param {string} columnDictionaryId
   */
  public onClickDeleteColumnDictionary(columnDictionary: ColumnDictionary): void {
    // event stop
    event.stopImmediatePropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.dictionary.delete.title');
    modal.description =  columnDictionary.logicalName;
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
    this.pageResult.number  = 0;
    // date 필터 init
    this.periodComponent.setAll();
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
    this.getColumnDictionaryListPageInit();
  }

  /**
   * 컬럼 사전 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
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
    this.getColumnDictionaryListPageInit();
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
    this.pageResult.size = 20;
    this.pageResult.number = 0;
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 사전 리스트 조회
   * @private
   */
  private _getColumnDictionaryList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 리스트 조회
    this._columnDictionaryService.getColumnDictionaryList(this._getColumnDictionaryListParams())
      .then((result) => {
        // 전달 받은 page number가 0 이면 컬럼 사전 리스트 초기화
        this.pageResult.number === 0 && (this.columnDictionaryList = []);
        // page 객체
        this.pageResult = result.page;
        // 컬럼 사전 리스트
        this.columnDictionaryList = result['_embedded'] ? this.columnDictionaryList.concat(result['_embedded'].dictionaries) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
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
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      // params['nameContains'] = this.searchText.trim();
      params['logicalNameContains'] = this.searchText.trim();
    }
    // date
    if (this._selectedDate && this._selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      if (this._selectedDate.startDateStr) {
        params['from'] = moment(this._selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (this._selectedDate.endDateStr) {
        params['to'] = moment(this._selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    }
    return params;
  }
}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}

class Date {
  dateType: string;
  endDateStr: string;
  startDateStr: string;
  type: string;
}
