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
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SubscribeArg} from '@common/domain/subscribe-arg';
import {Modal} from '@common/domain/modal';
import {PopupService} from '@common/service/popup.service';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {LineageService} from './service/lineage.service';
import {LineageEdge} from '@domain/meta-data-management/lineage';
import {EditLineagePopupComponent} from './component/edit-lineage-popup.component';
import {PeriodComponent, PeriodType} from '@common/component/period/period.component';
import {Alert} from '@common/util/alert.util';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import {PeriodData} from '@common/value/period.data.value';

@Component({
  selector: 'app-lineage',
  templateUrl: './lineage.component.html',
})
export class LineageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(EditLineagePopupComponent)
  private editLineagePopup: EditLineagePopupComponent;

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

  // popup status
  public step: string;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  public lineageList: LineageEdge[];

  public searchText: string;

  public selectedContentSort: Order = new Order();

  public selectedType: PeriodType;

  public defaultDate: PeriodData;

  // popup status
  public isCreatingLineage: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private _lineageService: LineageService,
    private _activatedRoute: ActivatedRoute,
    private popupService: PopupService,
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

    // After creating dataset
    this.subscriptions.push(
      this.popupService.view$.subscribe((data: SubscribeArg) => {
        this.step = data.name;
        if (this.step === 'complete-lineage-create') {
          this.reloadPage(true);
        }
      })
    );

    // Get query param from url
    this.subscriptions.push(
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!this.isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!this.isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }


          if (!this.isNullOrUndefined(params['descContains'])) {
            this.searchText = params['descContains'];
          }

          const sort = params['sort'];
          if (!this.isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
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

        this._getLineageList();
      })
    );

  }

  public ngOnDestroy() {

    super.ngOnDestroy();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 리니지 제거
   * @param {Modal} modal
   */
  public deleteLineageEdge(modal: Modal): void {

    this.loadingShow();

    this._lineageService.deleteLineage(modal['edgeId']).then(() => {
      this.loadingHide();

      Alert.success(this.translateService.instant('msg.metadata.ui.lineage.delete.edge.success', {value: modal['description']}));
      if (this.page.page > 0 && this.lineageList.length === 1) {
        this.page.page = this.page.page - 1;
      }
      this.reloadPage();
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

  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchText = keyword;
    // reload page
    this.reloadPage(true);
  }

  public onClickEditLineage(): void {
    this.editLineagePopup.init({
      name: 'edit'
    });
  }

  public onClickCreateLineage(): void {
    this.step = 'upload-file';
  }

  /**
   * 리니지 상세정보 클릭 이벤트
   * @param {string} lineageId
   */
  public onClickDetailLineage(lineageId: string): void {
    // 상세화면으로 이동
    this.router.navigate(['management/metadata/lineage', lineageId]).then();
  }

  /**
   * 리니지 삭제 클릭 이벤트
   * @param event
   * @param {LineageEdge} lineageEdge
   */
  public onClickDeleteLineage(event, lineageEdge: LineageEdge): void {
    event.stopPropagation();

    const modal = new Modal();
    modal.description = lineageEdge.desc;
    modal.name = this.translateService.instant('msg.metadata.ui.lineage.delete.edge');
    modal.btnName = this.translateService.instant('msg.comm.btn.modal.done');

    modal['edgeId'] = lineageEdge.edgeId;
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

      this.reloadPage(false);
    }
  } // function - changePage

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getLineageListParams();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  public isEmptyList(): boolean {
    return this.lineageList.length === 0;
  }

  public getLineageType(lineage: LineageEdge) {
    if (lineage.frColName && lineage.toColName) {
      return 'column';
    }
    return 'metadata';
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
    this.lineageList = [];
    // 검색어 초기화
    this.searchText = '';
    // 정렬 초기화
    this.selectedContentSort = new Order();
    // 페이지당 갯수 10
    this.page.size = 10;
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
  public onCreateComplete() {
    this.loadingHide();
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 코드 테이블 리스트 조회
   * @private
   */
  private _getLineageList(): void {

    this.loadingShow();

    const params = this._getLineageListParams();

    this.lineageList = [];

    this._lineageService.getLineageList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
      if (this.page.page > 0 &&
        this.isNullOrUndefined(result['_embedded']) ||
        (!this.isNullOrUndefined(result['_embedded']) && result['_embedded'].lineageedges.length === 0)) {
        this.page.page = result.page.number - 1;
        this._getLineageList();
      }

      this._searchParams = params;

      this.pageResult = result.page;

      this.lineageList = result['_embedded'] ? this.lineageList.concat(result['_embedded'].lineageedges) : [];

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
  private _getLineageListParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page
    };

    if (!this.isNullOrUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['descContains'] = this.searchText.trim();
    }

    return params;
  }
}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
