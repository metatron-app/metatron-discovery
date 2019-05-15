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

import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { PeriodData } from '../../../../common/value/period.data.value';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { AbstractUserManagementComponent } from '../../abstract.user-management.component';
import { CreateUserManagementGroupsComponent } from './create-group/create-user-management-groups.component';
import { Modal } from '../../../../common/domain/modal';
import { Alert } from '../../../../common/util/alert.util';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import { Group } from '../../../../domain/user/group';
import { ActivatedRoute } from "@angular/router";
import { isNullOrUndefined } from "util";

declare let moment: any;

@Component({
  selector: 'app-user-management-groups',
  templateUrl: './user-management-groups.component.html',
  providers: [MomentDatePipe]
})
export class UserManagementGroupsComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 삭제확인 팝업
  @ViewChild(ConfirmModalComponent)
  private deleteConfirmPopup: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 리스트
  public groupList: Group[] = [];

  // 검색 키워드
  public searchKeyword: string = '';

  // date
  public selectedDate : PeriodData;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  // 노트 필터링
  public noteFilterFl: boolean = false;

  public initialPeriodData:PeriodData;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 정렬
  public selectedContentSort: Order = new Order();

  ////////////////////////////////////////////////////
  //////// 팝업관련
  ////////////////////////////////////////////////////

  // 그룹 생성 팝업
  @ViewChild(CreateUserManagementGroupsComponent)
  public createGroupPopup: CreateUserManagementGroupsComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              private activatedRoute: ActivatedRoute,
              protected injector: Injector) {

    super(elementRef, injector);
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

    // 파라메터 조회
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params => {


        const size = params['size'];
        (isNullOrUndefined(size)) || (this.page.size = size);

        const page = params['page'];
        (isNullOrUndefined(page)) || (this.page.page = page);

        const sort = params['sort'];
        if (!isNullOrUndefined(sort)) {
          const sortInfo = decodeURIComponent(sort).split(',');
          this.selectedContentSort.key = sortInfo[0];
          this.selectedContentSort.sort = sortInfo[1];
        }

        // 검색어
        const searchText = params['nameContains'];
        (isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

        this.selectedDate = new PeriodData();
        this.selectedDate.type = 'ALL';
        const from = params['from'];
        const to = params['to'];
        if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
          this.selectedDate.startDate = from;
          this.selectedDate.endDate = to;

          this.selectedDate.startDateStr = decodeURIComponent(from);
          this.selectedDate.endDateStr = decodeURIComponent(to);
          this.selectedDate.type = params['type'];
          this.initialPeriodData = this.selectedDate;
          this.safelyDetectChanges();
        }

        // group 리스트 조회
        this._getGroupList();
      })
    );

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
   * 필터 모두 초기화
   */
  public initFilters() {
    // create date 초기화
    this.selectedDate = null;
    // 검색조건 초기화
    this.searchKeyword = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // sort 초기화
    this.selectedContentSort = new Order();
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * 그룹 삭제
   * @param event
   */
  public confirmDeleteGroup(event) {
    // loading show
    this.loadingShow();
    // group 삭제
    this.groupsService.deleteGroup(event['groupId']).then(() => {
      // alert
      Alert.success(this.translateService.instant('msg.groups.alert.grp.del.success'));

      if (this.page.page > 0 && this.groupList.length === 1) {
        this.page.page = this.page.page - 1;
      }
      // 그룹 조회
      this.reloadPage(false);
    })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹 상세 페이지 오픈
   * @param {Group} group
   */
  public showDetailGroup(group: Group) {
    // 기존에 저장된 라우트 삭제
    this.cookieService.delete('PREV_ROUTER_URL');
    this.router.navigate(['/admin/user/groups', group.id], {queryParams: this._searchParams});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

  /**
   * 삭제가 가능한지 여부
   * @param {Group} group
   * @returns {boolean}
   */
  public isEnableDelete(group: Group): boolean {
    return !group.predefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 가입 요청일자 변경시
   */
  public onChangeDate(data: PeriodData) {
    // 선택한 날짜
    this.selectedDate = data;
    // group 리스트 조회
    this.reloadPage();
  }

  /**
   * 그룹 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    ( 13 === event.keyCode ) && (this._searchText(event.target['value']));
  }

  /**
   * 그룹 검색 초기화
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 재조회
      this.reloadPage(false);
    }
  } // function - changePag


  /**
   * 목록 정렬 필터링
   * @param {string} key
   */
  public onFilterSort(key: string): void {
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
    // group 조회
    this.reloadPage();
  }

  /**
   * 그룹 생성 팝업 show
   */
  public onClickCreateModal() {

    // 모달 show
    this.createGroupPopup.init();
  }

  /**
   * 삭제버튼 클릭시
   * @param {Group} group
   */
  public onClickGroupDelete(group: Group) {
    // 이벤트 전파 stop
    event.stopPropagation();

    const modal = new Modal();
    modal.name           = this.translateService.instant('msg.groups.ui.del-grp.title');
    modal.description    = this.translateService.instant('msg.groups.ui.del-grp.sub.title');
    modal.btnName        = this.translateService.instant('msg.groups.btn.del-grp');
    modal['groupId'] = group.id;

    this.deleteConfirmPopup.init(modal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getGroupParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  /**
   * ui 초기화
   * @private
   */
  private _initView():void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // search text
    this.searchKeyword = '';
  }

  /**
   * 검색어로 그룹 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchKeyword = keyword;
    // 재조회
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그룹 리스트 조회
   * @private
   */
  private _getGroupList(): void {
    // 로딩 show
    this.loadingShow();

    this.groupList = [];

    // group 리스트 조회
    const params = this._getGroupParams();
    this.groupsService.getGroupList(params)
      .then((result) => {

        // 검색 파라메터 정보 저장
        this._searchParams = params;

        // 페이지
        this.pageResult = result.page;

        this.groupList = result._embedded ? this.groupList.concat(result._embedded.groups) : [];

        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹 리스트 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getGroupParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      pseudoParam : (new Date()).getTime()
    };
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // 검색어
    if (this.searchKeyword.trim() !== '') {
      params['nameContains'] = this.searchKeyword.trim();
    }
    // date
    params['type'] = 'ALL';
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = "CREATED";
      params['type'] = this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    return params;
  }
}


class Order {
  key: string = 'name';
  sort: string = 'asc';
}
