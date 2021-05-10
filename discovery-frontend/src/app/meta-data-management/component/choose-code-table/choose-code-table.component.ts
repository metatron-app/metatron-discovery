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
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CodeTable} from '@domain/meta-data-management/code-table';
import {CreateCodeTableComponent} from '../../code-table/create-code-table/create-code-table.component';
import {CodeTableService} from '../../code-table/service/code-table.service';
import {isUndefined} from 'util';
import {ColumnDictionaryService} from '../../column-dictionary/service/column-dictionary.service';
import * as _ from 'lodash';
import {Alert} from '@common/util/alert.util';
import {CodeValuePair} from '@domain/meta-data-management/code-value-pair';

@Component({
  selector: 'app-choose-code-table',
  templateUrl: './choose-code-table.component.html',
})
export class ChooseCodeTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 컬럼 사전 아이디
  private _dictionaryId: string;

  // mode
  private _mode: string;

  // origin selected code table
  private _originSelectedCodeTable: CodeTable;

  // 코드 테이블의 조직 상세정보
  private _codeTableDetailList: CodeTable[];

  // index of the preview popup now showing
  private _previewPopupNowShowing: number = -1;

  // 코드 테이블 생성 컴포넌트
  @ViewChild(CreateCodeTableComponent)
  private _createCodeTableComp: CreateCodeTableComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShowPopCodeTable: boolean = false;

  // 코드 테이블 목록
  public codeTableList: CodeTable[];
  // 검색어
  public searchText: string;
  // 정렬
  public selectedContentSort: Order;
  // show flag
  public showFl: boolean;
  // 선택한 코드 테이블
  public selectedCodeTable: CodeTable;

  @Output()
  public chooseComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
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
   */
  public init(mode: string, selectedTable: CodeTable, dictionaryId?: string): void {
    // ui init
    this._initView();
    // show flag
    this.showFl = true;
    // mode
    this._mode = mode;

    // exist selected table
    if (selectedTable) {
      // 선택한 codeTable
      this.selectedCodeTable = _.cloneDeep(selectedTable);
      // 수정모드일 경우 origin 선택한 codeTable
      this._mode === 'UPDATE' && (this._originSelectedCodeTable = _.cloneDeep(selectedTable));
    }
    // dictionaryId
    dictionaryId && (this._dictionaryId = dictionaryId);
    // 목록 조회
    this._getCodeTableList();
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * 페이지 초기화 후 코드 테이블 리스트 재조회
   */
  public getCodeTableListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getCodeTableList();
  }

  /**
   * 코드 미리보기 데이터
   * @param {string} codeTableId
   * @returns {CodeValuePair[]}
   */
  public getTableCodePair(codeTableId: string): CodeValuePair[] {
    const index = _.findIndex(this._codeTableDetailList, (item) => {
      return codeTableId === item.id;
    });
    return index === -1 ? [] : this._codeTableDetailList[index].codes;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * done
   */
  public onClickDone(): void {
    // 생성모드일 경우 선택한 테이블 전달
    // 수정모드일 경우 현재 컬럼 사전에 선택한 코드 테이블 연결 또는 연결해제
    this._mode === 'CREATE' ? this._emitCodeTable() : this._updateCodeTable();
  }

  /**
   * cancel
   */
  public onClickCancel(): void {
    this.showFl = false;
  }

  /**
   * 코드 테이블 생성 클릭 이벤트
   */
  public onClickCreateCodeTable(): void {
    this._createCodeTableComp.init();
  }

  /**
   * 코드 테이블 이름 클릭 이벤트
   * @param {string} codeTableId
   */
  public onClickTableName(codeTableId: string): void {
    // event stop
    event.stopImmediatePropagation();
    // 코드 테이블 상세화면으로 이동
    this.router.navigate(['management/metadata/code-table', codeTableId]).then();
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreList(): void {
    // page 증가
    this.pageResult.number++;
    // 리스트 조회
    this._getCodeTableList();
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
    this.getCodeTableListPageInit();
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
   * 코드테이블 선택
   * @param {CodeTable} codeTable
   */
  public onSelectCodeTable(codeTable: CodeTable): void {
    this.selectedCodeTable = (this.selectedCodeTable && this.selectedCodeTable.id === codeTable.id) ? null : codeTable;
  }

  /**
   * preview button click event
   * @param {number} idx
   */
  public onClickCodeTablePreview(idx: number): void {
    this.selectedCodeTable = this.codeTableList[idx];
    // if any popup is shown now
    if (this._previewPopupNowShowing !== -1) {
      // hide popup
      this.codeTableList[this._previewPopupNowShowing]['previewShowFl'] = false;
    }
    // save the index of popup which will appear
    this._previewPopupNowShowing = idx;

    // stop event bubbling
    event.stopImmediatePropagation();

    const index = _.findIndex(this._codeTableDetailList, (item) => {
      return this.codeTableList[idx].id === item.id;
    });

    // 해당 코드 정보가 존재하지 않는다면 조회
    index === -1 && this._getDetailCodeTable(this.codeTableList[idx].id);

    // show flag
    this.codeTableList[idx]['previewShowFl'] = true;
  }

  /**
   * 코드 Preview Popup close 버튼 클릭 이벤트
   * @param {CodeTable} codeTable
   */
  public onClickPreviewPopupClose(codeTable: CodeTable) {
    event.stopImmediatePropagation();
    codeTable['previewShowFl'] = false;
    this._previewPopupNowShowing = -1;
    this.selectedCodeTable = null;
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
    this.codeTableList = [];
    // 검색어 초기화
    this.searchText = '';
    // 정렬 초기화
    this.selectedContentSort = new Order();
    // page 초기화
    this.pageResult.size = 15;
    this.pageResult.number = 0;
    // 선택한 코드 테이블 초기화
    this.selectedCodeTable = null;
    this._originSelectedCodeTable = null;
    //
    this._codeTableDetailList = [];
  }

  /**
   * 검색어로 코드 테이블 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;
    // 페이지 초기화 후 재조회
    this.getCodeTableListPageInit();
  }

  /**
   * 현재 컬럼사전에 선택한 코드 테이블 연결
   * @private
   */
  private _linkCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 현재 컬럼사전에 선택한 코드 테이블 연결
    this._columnDictionaryService.linkCodeTableWithColumnDictionary(this._dictionaryId, this.selectedCodeTable.id).then(() => {
      // 로딩 hide
      this.loadingHide();
      // alert
      Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
      // close
      this._emitCodeTable();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 현재 컬럼사전에 연결된 코드 테이블 연결해제
   * @private
   */
  private _unLinkCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 현재 컬럼사전에 선택한 코드 테이블 연결
    this._columnDictionaryService.unlinkCodeTableWithColumnDictionary(this._dictionaryId,
      this._originSelectedCodeTable.id).then(() => {
      // 로딩 hide
      this.loadingHide();
      // alert
      Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
      // close
      this._emitCodeTable();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * code table 변경 이벤트
   * @private
   */
  private _updateCodeTable(): void {
    // 기존의 선택한 코드 테이블이 있다면
    (this._originSelectedCodeTable && !this.selectedCodeTable) ? this._unLinkCodeTable() : this._linkCodeTable();
  }

  /**
   * code table 전달
   * @private
   */
  private _emitCodeTable(): void {
    // codeTable 전달
    this.chooseComplete.emit(this.selectedCodeTable);
    this.onClickCancel();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 코드 테이블 리스트 조회
   * @private
   */
  private _getCodeTableList(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 리스트 조회
    this._codeTableService.getCodeTableList(this._getCodeTableListParams()).then((result) => {
      // 전달 받은 page number가 0 이면 코드 테이블 리스트 초기화
      this.pageResult.number === 0 && (this.codeTableList = []);
      // page 객체
      this.pageResult = result.page;
      // 코드 테이블 리스트
      this.codeTableList = result['_embedded'] ? this.codeTableList.concat(result['_embedded'].codetables) : [];
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 코드 테이블 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getCodeTableListParams(): object {
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

  /**
   * 코드 테이블 상세정보 조회
   * @param {string} codeTableId
   * @private
   */
  private _getDetailCodeTable(codeTableId: string): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 상세조회
    this._codeTableService.getCodeTableDetail(codeTableId).then((result) => {
      // 코드 테이블 상세조회 데이터
      this._codeTableDetailList.push(result);
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }
}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
