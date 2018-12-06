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
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { WorkspaceService } from '../../../../workspace/service/workspace.service';
import { Alert } from '../../../../common/util/alert.util';
import { PublicType, WorkspaceAdmin } from '../../../../domain/workspace/workspace';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { Modal } from '../../../../common/domain/modal';
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { PeriodData } from '../../../../common/value/period.data.value';

declare let moment: any;

@Component({
  selector: 'app-shared-workspaces',
  templateUrl: './shared-workspaces.component.html'
})
export class SharedWorkspacesComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 목록
  private _workspaceList: WorkspaceAdmin[];

  // date 필터링
  private _filterDate: PeriodData;
  // status 필터링
  private _filterStatus: string;
  // 워크스페이스 필터링
  private _filterWorkspaceType: string;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 정렬
  public selectedContentSort: Order = new Order();

  // 검색어
  public searchText: string;

  // status
  public statusList: any[];
  public filterStatusList: any[];

  // 모든 사용자에게 공개중인 워크스페이스만 필터링
  public filterAllowance: boolean;

  // 사용자 정의 커스텀 Date 필터링
  public customDateTypeList = [
    { label: this.translateService.instant('msg.spaces.spaces.th.last.access'), value: 'LASTACCESSED'},
    { label: this.translateService.instant('msg.spaces.spaces.th.created'), value: 'CREATED'},
  ];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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
    // ui 초기화
    this._initView();
    // 워크스페이스 리스트 조회
    this._getWorkspaceListInServer();
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
   * 모달 확인
   * @param modal
   */
  public confirmEvent(modal): void {
    modal.data === 'DELETE' ? this._deleteWorkspace(modal.workspaceId) : this._changeWorkspaceStatus(modal.workspaceId, modal.status);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 선택된 status
   * @returns {string}
   */
  public get getSelectedStatus(): string {
    return this._filterStatus;
  }

  /**
   * 현재 선택된 워크스페이스 타입
   * @returns {string}
   */
  public get getSelectedWorkspaceType(): string {
    return this._filterWorkspaceType;
  }

  /**
   * 공유 워크스페이스 목록
   * @returns {WorkspaceAdmin[]}
   */
  public get getWorkspaceList(): WorkspaceAdmin[] {
    return this._workspaceList;
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
  }

  /**
   * 현재 워크스페이스의 상태
   * @param {WorkspaceAdmin} workspace
   * @returns {string}
   */
  public getWorkspaceStatus(workspace: WorkspaceAdmin): string {
    return this.statusList.filter((status) => {
      return status.active === workspace.active;
    })[0].label;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 선택된 status인지 여부
   * @param status
   * @returns {boolean}
   */
  public isSelectedStatus(status): boolean {
    return this.getSelectedStatus === status.value;
  }

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

  /**
   * 해당 워크스페이스가 공유 워크스페이스인지 확인
   * @param {WorkspaceAdmin} worspace
   * @returns {boolean}
   */
  public isPublicWorkspace(workspace: WorkspaceAdmin): boolean {
    return workspace.publicType === PublicType.SHARED;
  }

  /**
   * 현재 선택된 워크스페이스 타입인지 여부
   * @param type
   * @returns {boolean}
   */
  public isSelectedWorkspaceType(type): boolean {
    return this.getSelectedWorkspaceType === type;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    ( 13 === event.keyCode ) && (this._searchText(event.target['value']));
  }

  /**
   * 워크스페이스 검색 초기화
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 워크스페이스 상세보기로 이동
   * @param {string} workspaceId
   */
  public onOpenWorkspaceDetail(workspaceId: string): void {
    // 기존에 저장된 라우트 삭제
    this.cookieService.delete('PREV_ROUTER_URL');
    this.router.navigate(['/admin/workspaces/shared', workspaceId]);
  }

  /**
   * 워크스페이스 status 변경 모달오픈
   * @param {WorkspaceAdmin} workspace
   * @param {string} status
   */
  public onOpenChangeStatus(workspace: WorkspaceAdmin, status: string): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    if( ( workspace.active ? 'active' : 'inactive' ) === status ) {
      return;
    }

    const modal = new Modal();
    modal.data = 'STATUS';
    // 이미 활성화 상태라면
    if (status === 'inactive') {
      modal.name = this.translateService.instant('msg.spaces.spaces.ui.inactive.title', {value: workspace.name});
      modal.description = this.translateService.instant('msg.spaces.spaces.ui.inactive.description');
      modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.inactive');
    } else {
      modal.name = this.translateService.instant('msg.spaces.spaces.ui.active.title', {value: workspace.name});
      modal.description = this.translateService.instant('msg.spaces.spaces.ui.active.description');
      modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.active');
    }
    // 변경할 워크스페이스 아이디 저장
    modal['workspaceId'] = workspace.id;
    // 변경할 status
    modal['status'] = status;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 워크스페이스 삭제 모달오픈
   * @param {string} workspaceId
   */
  public onOpenDeleteWorkspace(workspaceId: string): void {
    // event stop
    event.stopPropagation();

    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.spaces.spaces.ui.delete.title');
    modal.description = this.translateService.instant('msg.spaces.spaces.ui.delete.description');
    modal.btnName = this.translateService.instant('msg.spaces.spaces.ui.delete.btn');
    // 삭제할 워크스페이스 아이디 저장
    modal['workspaceId'] = workspaceId;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 필터링 초기화
   */
  public onFilterReset(): void {
    // status 필터링
    this._filterStatus = 'all';
    // allowance 필터링
    this.filterAllowance = false;
    // 워크스페이스 타입 필터링
    this._filterWorkspaceType = 'all';
    // 정렬
    this.selectedContentSort = new Order();
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // date 필터 created update 설정 default lastaccessed로 설정
    this.periodComponent.selectedDate = 'LASTACCESSED';
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * 필터링 status 변경
   * @param state
   */
  public onFilterStatus(state): void {
    // event prevent
    event.preventDefault();
    // status 변경
    this._filterStatus = state.value;
    // 워크스페이스 재조회
    this._getWorkspaceInit();
  }

  /**
   * 필터링 켈린더 선택
   * @param event
   */
  public onFilterDate(event): void {
    // 선택한 날짜
    this._filterDate = event;
    // 워크스페이스 재조회
    this._getWorkspaceInit();
  }

  /**
   * 모든 사용자에게 공개중인 워크스페이스만 필터링
   * @param {boolean} allowanceFl
   */
  public onFilterAllowance(allowanceFl: boolean): void {
    // event prevent
    event.preventDefault();
    // filtering
    this.filterAllowance = !allowanceFl;
    // 워크스페이스 재조회
    this._getWorkspaceInit();
  }

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
    // 워크스페이스 조회
    this._getWorkspaceInit();
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreContents(): void {
    // 더 보여줄 데이터가 있다면
    if (this.isMoreContents()) {
      this.pageResult.number += 1;
      // 워크스페이스 조회
      this._getWorkspaceListInServer();
    }
  }

  /**
   * 워크스페이스의 status list show
   * @param {WorkspaceAdmin} workspace
   * @param {boolean} showFl
   */
  public onClickShowStatus(workspace: WorkspaceAdmin, showFl: boolean): void {
    // event stop
    event.stopPropagation();
    // flag
    workspace.statusShowFl = !showFl;
  }

  /**
   * 워크스페이스 필터링 이벤트
   * @param {string} type
   */
  public onFilterWorkspaceType(type: string): void {
    // event prevent
    event.preventDefault();
    // WorkspaceType 변경
    this._filterWorkspaceType = type;
    // 워크스페이스 재조회
    this._getWorkspaceInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 검색어로 공유워크스페이스 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;
    // 재조회
    this._getWorkspaceInit();
  }

  /**
   * 워크스페이스 삭제
   * @param {string} workspaceId
   * @private
   */
  private _deleteWorkspace(workspaceId: string): void {
    // 로딩 show
    this.loadingShow();
    // 워크스페이스 삭제
    this.workspaceService.deleteWorkspace(workspaceId)
      .then(() => {
        // alert
        Alert.success(this.translateService.instant('msg.spaces.shared.alert.delete'));
        // 재조회
        this._getWorkspaceInit();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 워크스페이스 status 변경
   * @param {string} workspaceId
   * @param {string} status
   * @private
   */
  private _changeWorkspaceStatus(workspaceId: string, status: string): void {
    // 로딩 show
    this.loadingShow();
    // 워크스페이스 활성화 | 비활성화
    this.workspaceService.changeWorkspaceStatus(workspaceId, status)
      .then(() => {
        // alert
        Alert.success(status === 'active' ? this.translateService.instant('msg.spaces.shared.alert.status.active') : this.translateService.instant('msg.spaces.shared.alert.status.inactive'));
        // 재조회
        this._getWorkspaceInit();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스 조회
   * @private
   */
  private _getWorkspaceListInServer(): void {
    // 로딩 show
    this.loadingShow();
    // 전체 워크스페이스 조회
    this.workspaceService.getWorkspaceByAdmin(this._getWorkspaceParams())
      .then((result) => {
        // 페이지 객체
        this.pageResult = result['page'];
        // 페이지가 첫번째면 초기화
        if (this.pageResult.number === 0) {
          this._workspaceList = [];
        }
        // 데이터 있다면
        this._workspaceList = result['_embedded'] ? this._workspaceList.concat(result['_embedded'].workspaces) : [];
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
   * 워크스페이스 초기화 재조회
   */
  private _getWorkspaceInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this._getWorkspaceListInServer();
  }

  /**
   * 워크스페이스 조회에 사용하는 파라메터
   * @returns {any}
   * @private
   */
  private _getWorkspaceParams(): any {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
    };
    // 타입
    this._filterWorkspaceType !== 'all' && (params['publicType'] = this._filterWorkspaceType);
    // 정렬
    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);
    // 검색어
    this.searchText.trim() !== '' && (params['nameContains'] = this.searchText.trim());
    // allowance
    this.filterAllowance && (params['published'] = this.filterAllowance);
    // status
    this._filterStatus !== 'all' && (params['active'] = this._filterStatus === 'active' ? true : false);
    // date
    if (this._filterDate && this._filterDate.type !== 'ALL') {
      params['searchDateBy'] = this._filterDate.dateType;
      if (this._filterDate.startDateStr) {
        params['from'] = moment(this._filterDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this._filterDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView():void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // status
    this.filterStatusList = [
      { label: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { label: this.translateService.instant('msg.spaces.spaces.ui.active'), value: 'active' },
      { label: this.translateService.instant('msg.spaces.spaces.ui.inactive'), value: 'inactive' },
    ];
    this._filterStatus = this.filterStatusList[0].value;
    this.statusList = [
      { label: this.translateService.instant('msg.spaces.spaces.ui.active'), value: 'active', active: true },
      { label: this.translateService.instant('msg.spaces.spaces.ui.inactive'), value: 'inactive', active: false },
    ];
    // search text
    this.searchText = '';
    // filtering
    this.filterAllowance = false;
    // 워크스페이스 목록 초기화
    this._workspaceList = [];
    // 워크스페이스 타입
    this._filterWorkspaceType = 'all';
  }
}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
