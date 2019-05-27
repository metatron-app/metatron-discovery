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

import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { PeriodData } from '../../../../common/value/period.data.value';
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../common/domain/modal';
import { PermissionService } from '../../../../user/service/permission.service';
import { RoleSet, RoleSetScope } from '../../../../domain/user/role/roleSet';
import { Alert } from '../../../../common/util/alert.util';
import { CreatePermissionSchemaComponent } from './create-permission-schema.component';
import { Page } from '../../../../domain/common/page';
import { ActivatedRoute } from "@angular/router";
import { isNullOrUndefined } from "util";

declare let moment: any;

@Component({
  selector: 'app-permission-schemas',
  templateUrl: './permission-schemas.component.html'
})
export class PermissionSchemasComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공통 확인 팝업
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  @ViewChild(CreatePermissionSchemaComponent)
  private _createPermissionSchemaComp:CreatePermissionSchemaComponent;

  // date
  private _filterDate: PeriodData;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // RoleSet 목록
  public roleSetList: RoleSet[] = [];

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  public initialPeriodData:PeriodData;

  // 검색 키워드
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private permissionService: PermissionService,
              protected element: ElementRef,
              private activatedRoute: ActivatedRoute,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
    // ui 초기화
    this._initView();

    // 파라메터 조회
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params => {

        const page = params['page'];
        (isNullOrUndefined(page)) || (this.page.page = page);

        const sort = params['sort'];
        if (!isNullOrUndefined(sort)) {
          const sortInfo = decodeURIComponent(sort).split(',');
          this.selectedContentSort.key = sortInfo[0];
          this.selectedContentSort.sort = sortInfo[1];
        }

        const size = params['size'];
        (isNullOrUndefined(size)) || (this.page.size = size);

        // 검색어
        const searchText = params['nameContains'];
        (isNullOrUndefined(searchText)) || (this.searchText = searchText);

        const from = params['from'];
        const to = params['to'];

        this._filterDate = new PeriodData();

        this._filterDate.type = 'ALL';
        if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
          this._filterDate.startDate = from;
          this._filterDate.endDate = to;

          this._filterDate.dateType = 'CREATED';
          this._filterDate.startDateStr = decodeURIComponent(from);
          this._filterDate.endDateStr = decodeURIComponent(to);
          this._filterDate.type = params['type'];
          this.initialPeriodData = this._filterDate;
          this.safelyDetectChanges();
        }
        // 퍼미션 스키마 조회
        this._getRoleSetList();
      })
    );
  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.removeBodyScrollHidden();
  }

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
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
    this._filterDate = null;
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * modal 이벤트 후 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    modal.data === 'CLONE' ? this._clonePermissionSchema(modal['schemaId']) : this._deletePermissionSchema(modal['schemaId']);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스키마 리스트 초기화 후 재조회
   */
  public reloadPage(isFirstPage: boolean = true) {

    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getPermissionSchemaParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 퍼미션 스키마 상세 페이지 오픈
   * @param {RoleSet} roleSet
   */
  public onClickDetailPermissionSchema(roleSet: RoleSet): void {
    this.router.navigate(['/admin/workspaces/permission', roleSet.id]).then();
  }

  /**
   * 퍼미션 스키마 생성 클릭
   */
  public onClickCreatePermissionSchema(): void {
    this._createPermissionSchemaComp.init();
  } // function - onClickCreatePermissionSchema

  /**
   * 퍼미션 스키마 삭제 클릭
   * @param {RoleSet} roleSet
   */
  public onClickDeletePermissionSchema(roleSet: RoleSet): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // 연관 워크스페이스 목록 조회

    this.loadingShow();
    const param = new Page();
    param.page = 0;
    param.size = 1000;
    param.sort = 'name,asc';
    this.permissionService.getWorkspacesByRoleSet(roleSet.id, param).then(result => {
      const modal = new Modal();
      if (result && result['_embedded'] && result['_embedded']['workspaces']) {
        modal.subDescription = result['_embedded']['workspaces'].map( item => item.name ).join( ',' );
      }

      modal.data = 'DELETE';
      modal.name = this.translateService.instant('msg.permission.ui.delete-schema.ph');
      modal.description = this.translateService.instant('msg.permission.ui.delete-schema.ph.sub', { value : `${roleSet.linkedWorkspaces ? roleSet.linkedWorkspaces : 0}`});
      modal.btnName = this.translateService.instant('msg.permission.ui.delete-schema');
      // schema id
      modal['schemaId'] = roleSet.id;
      // 팝업 창 오픈
      this._confirmModalComponent.init(modal);

      this.loadingHide();
    }).catch((error) => this.commonExceptionHandler(error));
  } // function - onClickDeletePermissionSchema

  /**
   * 퍼미션 스키마 복제 클릭
   * @param {RoleSet} roleSet
   */
  public onClickClonePermissionSchema(roleSet: RoleSet): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.data = 'CLONE';
    modal.name = this.translateService.instant('msg.permission.ui.copy-schema.ph', { value : `\'${roleSet.name}\'`});
    modal.btnName = this.translateService.instant('msg.permission.ui.copy-schema');
    // schema id
    modal['schemaId'] = roleSet.id;

    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 필터링 켈린더 선택
   * @param event
   */
  public onFilterDate(event): void {
    // 선택한 날짜
    this._filterDate = event;
    // permission 리스트 재조회
    this.reloadPage();
  }

  /**
   * 스키마 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 스키마 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 목록 정렬 필터링
   * @param {string} key
   */
  public onFilterSort(key: string): void {

    // 페이지 초기화
    this.page.page = 0;

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
    // 퍼미션 스키마 재조회
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // search text
    this.searchText = '';
  }

  /**
   * 검색어로 멤버 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;
    // 퍼미션 스키마 재조회
    this.reloadPage();
  }

  /**
   * 퍼미션 스키마 복사
   * @param {string} schemaId
   * @private
   */
  private _clonePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 복사
    this.permissionService.copyRoleset(schemaId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.permission.alert.create.ok', {value: result.name}));

        // 재조회
        this.reloadPage();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 퍼미션 스키마 삭제
   * @param {string} schemaId
   * @private
   */
  private _deletePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 삭제
    this.permissionService.deleteRoleset(schemaId)
      .then(() => {
        // alert
        Alert.success(this.translateService.instant('msg.permission.alert.delete.ok'));

        if (this.page.page > 0 && this.roleSetList.length === 1) {
          this.page.page -= 1;
        }

        // 재조회
        this.reloadPage(false);

      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 퍼미션 스키마 목록 조회
   * @private
   */
  private _getRoleSetList(): void {
    this.loadingShow();

    this.roleSetList = [];

    const params = this._getPermissionSchemaParams();
    this.permissionService.getRolesets(params)
      .then((result) => {

        if (this.page.page > 0 &&
          isNullOrUndefined(result['_embedded']) ||
          (!isNullOrUndefined(result['_embedded']) && result['_embedded'].roleSets.length === 0))
        {
          this.page.page = result.page.number - 1;
          this._getRoleSetList();
        }

        // 검색 파라메터 정보 저장
        this._searchParams = params;

        // 페이지
        this.pageResult = result.page;

        // 데이터 있다면
        if (result._embedded) {
          this.roleSetList = result._embedded.roleSets;
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {

          this.loadingHide();
          this.commonExceptionHandler(error)
        }
      );
  } // function - _getRoleSetList

  /**
   * 퍼미션 목록 조회시 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getPermissionSchemaParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      scope : RoleSetScope.PUBLIC,
      pseudoParam : (new Date()).getTime(),
    };
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // 검색어
    if (this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }

    // date
    params['type'] = 'ALL';
    if ((!isNullOrUndefined(this._filterDate)) && this._filterDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      params['type'] = this._filterDate.type;
      if (this._filterDate.startDateStr) {
        params['from'] = moment(this._filterDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this._filterDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    return params;
  } // function - _getPermissionSchemaParams

}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
