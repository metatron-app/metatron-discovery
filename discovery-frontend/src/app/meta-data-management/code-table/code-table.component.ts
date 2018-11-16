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
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { CodeTableService } from './service/code-table.service';
import { CodeTable } from '../../domain/meta-data-management/code-table';
import { PeriodComponent } from '../../common/component/period/period.component';
import { Alert } from '../../common/util/alert.util';
import * as _ from 'lodash';
import { CreateCodeTableComponent } from './create-code-table/create-code-table.component';

declare let moment: any;

@Component({
  selector: 'app-code-table',
  templateUrl: './code-table.component.html'
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

  // 코드 테이블 목록
  public codeTableList: CodeTable[] = [];
  // 검색어
  public searchText: string = '';
  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _codeTableService: CodeTableService,
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
    this._getCodeTableList();
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
   * 코드 테이블 제거
   * @param {Modal} modal
   */
  public deleteCodeTable(modal: Modal): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 제거
    this._codeTableService.deleteCodeTable(modal['codeTableId'])
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.metadata.ui.codetable.delete.success', {value: modal['codeTableName']}));
        // 재조회
        this.getCodeTableListPageInit();
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
   * 페이지 초기화 후 코드 테이블 리스트 재조회
   */
  public getCodeTableListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getCodeTableList();
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
    this.router.navigate(['management/metadata/code-table', codeTableId]);
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
    modal.description =  codeTable.name;
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    modal['codeTableId'] = codeTable.id;
    modal['codeTableName'] = codeTable.name;
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
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 코드 테이블 이름 초기화 후 검색
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
    this.getCodeTableListPageInit();
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
    this.pageResult.size = 20;
    this.pageResult.number = 0;
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
    this._codeTableService.getCodeTableList(this._getCodeTableListParams())
      .then((result) => {
        // 전달 받은 page number가 0 이면 코드 테이블 리스트 초기화
        this.pageResult.number === 0 && (this.codeTableList = []);
        // page 객체
        this.pageResult = result.page;
        // 코드 테이블 리스트
        this.codeTableList = result['_embedded'] ? this.codeTableList.concat(result['_embedded'].codetables) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {

        // 로딩 hide
        this.loadingHide();
      });
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
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }
    // date
    if (this._selectedDate && this._selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      if (this._selectedDate.startDateStr) {
        params['from'] = this._selectedDate.timezone < 0
          ? (moment(this._selectedDate.startDateStr).subtract(-this._selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z')
          : (moment(this._selectedDate.startDateStr).add(this._selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z');
      }
      if (this._selectedDate.endDateStr) {
        params['to'] = this._selectedDate.timezone < 0
          ? (moment(this._selectedDate.endDateStr).subtract(-this._selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z')
          : (moment(this._selectedDate.endDateStr).add(this._selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z');
      }
    }
    return params;
  }
}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}

class Date {
  dateType: string;
  endDateStr: string;
  startDateStr: string;
  type: string;
  timezone: number;
}
