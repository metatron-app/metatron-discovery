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

import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { StringUtil } from '../../../common/util/string.util';
import { ConnectionType } from '../../../domain/datasource/datasource';
import { MetadataModelService } from '../service/metadata.model.service';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';

@Component({
  selector: 'app-ds-select-datasource',
  templateUrl: './ds-select-datasource.component.html'
})
export class DsSelectDatasourceComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 검색어
  public searchText: string = '';
  // 공개여부
  public searchPublished: boolean = false;
  // 정렬
  public selectedContentSort: Order = new Order();

  // 데이터소스 목록
  public datasourceList: any[] = [];
  // 선택한 데이터소스
  public selectedDatasource: any = null;

  // 필터링 타입 목록
  public typeList: any[] = [];
  // 선택한 필터링 타입
  public selectedType: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public metaDataModelService: MetadataModelService,
              private _datasourceService: DatasourceService,
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
    // sourceStep 이 있는경우에만 load data
    this.metaDataModelService.getCreateData().hasOwnProperty('sourceStep') && this._loadData(this.metaDataModelService.getCreateData()['sourceStep']);
    // 목록이 존재하지 않을 경우 재조회
    this.datasourceList.length === 0 && this.getDatasourceListPageInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지 초기화 후 데이터소스 리스트 재조회
   */
  public getDatasourceListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 선택한 데이터소스 초기화
    this.selectedDatasource = null;
    // 재조회
    this._getDatasourceList();
  }

  /**
   * 데이터소스 index
   * @param {number} index
   * @returns {number}
   */
  public getDatasourceIndex(index: number): number {
    return this.pageResult.totalElements - index;
  }

  /**
   * 선택한 타입 인덱스
   * @returns {number}
   */
  public getSelectedTypeIndex(): number {
    return this.selectedType !== null ? this.typeList.findIndex((item) => {
      return item.value === this.selectedType.value;
    }) : -1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * next validation
   * @returns {boolean}
   */
  public isNextValidation(): boolean {
    return this.selectedDatasource !== null;
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 다음 클릭 이벤트
   */
  public onClickNext(): void {
    // validation 후 화면전환
    if (this.isNextValidation()) {
      // save data
      this._saveData();
      // 화면전환
      this.metaDataModelService.setCreateStep('complete');
    }
  }

  /**
   * 스키마 창 닫기 이벤트
   */
  public onClickCloseSchema(): void {
    this.selectedDatasource = null;
  }

  /**
   * 더보기 클릭 이벤트
   */
  public onClickMoreList(): void {
    // validation
    if (this.isMoreContents()) {
      // page 증가
      this.pageResult.number++;
      // 리스트 조회
      this._getDatasourceList();
    }
  }

  /**
   * 정렬 클릭 이벤트
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
    this.getDatasourceListPageInit();
  }

  /**
   * 데이터소스 이름 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 데이터소스 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 데이터소스 선택 이벤트
   * @param source
   */
  public onSelectedDatasource(source: any): void {
    this.selectedDatasource = this.selectedDatasource ? null : source;
  }

  /**
   * 필터링 변경 이벤트
   * @param type
   */
  public onChangeType(type: any): void {
    // 타입 필터링
    this.selectedType = type;
    // 재조회
    this.getDatasourceListPageInit();
  }

  /**
   * 필터링 공개연부 변경
   */
  public onSelectedOnlyPublished(): void {
    // event stop
    event.preventDefault();
    // 공개여부 변경
    this.searchPublished = !this.searchPublished;
    // 재조회
    this.getDatasourceListPageInit();
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
    // 필터링 목록
    this.typeList = [
      {
        label: this.translateService.instant('msg.comm.ui.list.all'),
        value: 'all'
      },
      {
        label: this.translateService.instant('msg.comm.ui.list.ds.type.engine'),
        value: ConnectionType.ENGINE.toString()
      },
      {
        label: this.translateService.instant('msg.comm.ui.list.ds.type.link'),
        value: ConnectionType.LINK.toString()
      }
    ];
    this.selectedType = this.typeList[0];
    // page
    this.pageResult.number = 0;
  }

  /**
   * 데이터 불러오기
   * @param {Object} sourceStep
   * @private
   */
  private _loadData(sourceStep: object): void {
    // 데이터소스 목록
    sourceStep['datasourceList'] && (this.datasourceList = sourceStep['datasourceList']);
    // 선택한 데이터소스
    sourceStep['selectedDatasource'] && (this.selectedDatasource = sourceStep['selectedDatasource']);
    // 검색어
    sourceStep['searchText'] && (this.searchText = sourceStep['searchText']);
    // 공개여부
    sourceStep['searchPublished'] && (this.searchPublished = sourceStep['searchPublished']);
    // 타입
    sourceStep['selectedType'] && (this.selectedType = sourceStep['selectedType']);
    // 정렬
    sourceStep['selectedContentSort'] && (this.selectedContentSort = sourceStep['selectedContentSort']);
    // 데이터소스 목록 페이지
    sourceStep['pageResult'] && (this.pageResult = sourceStep['pageResult']);
  }

  /**
   * 검색어로 데이터소스 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;
    // 페이지 초기화 후 재조회
    this.getDatasourceListPageInit();
  }

  /**
   * 현재 데이터 저장
   * @private
   */
  private _saveData(): void {
    const sourceStep = {
      // 데이터소스 목록
      datasourceList: this.datasourceList,
      // 선택한 데이터소스
      selectedDatasource: this.selectedDatasource,
      // 검색어
      searchText: this.searchText,
      // 공개여부
      searchPublished: this.searchPublished,
      // 타입
      selectedType: this.selectedType,
      // 정렬
      selectedContentSort: this.selectedContentSort,
      // 데이터소스 목록 페이지
      pageResult: this.pageResult
    };

    this.metaDataModelService.patchCreateData('sourceStep', sourceStep);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터소스 목록 조회
   * @private
   */
  private _getDatasourceList(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터 소스 조회 요청
    this._datasourceService.getAllDatasource(this._getDatasourceParams())
      .then((datasources) => {
        // 페이지 객체
        this.pageResult = datasources['page'];
        // 페이지가 첫번째면
        this.pageResult.number === 0 && (this.datasourceList = []);
        // 데이터 있다면
        this.datasourceList = datasources['_embedded'] ? this.datasourceList.concat(datasources['_embedded'].datasources) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 데이터소스 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getDatasourceParams(): object {
    // params
    const params = {
      size: 15,
      page: this.pageResult.number,
      linkedMetadata: false
    };
    // 검색어
    (!StringUtil.isEmpty(this.searchText)) && (params['nameContains'] = this.searchText.trim());
    // 공개여부
    this.searchPublished && (params['published'] = this.searchPublished);
    // 정렬
    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);
    // 타입
    this.selectedType.value !== 'all' && (params['connType'] = this.selectedType.value);
    return params;
  }
}

class Order {
  key: string = 'name';
  sort: string = 'desc';
}
