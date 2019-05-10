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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import { ClipboardService } from 'ngx-clipboard';
import {AbstractComponent} from '../common/component/abstract.component';
import {ActivatedRoute} from '@angular/router';
import {Workbook, WorkbookDetailProjections} from '../domain/workbook/workbook';
import {WorkbookService} from './service/workbook.service';
import {PopupService} from '../common/service/popup.service';
import {DeleteModalComponent} from '../common/component/modal/delete/delete.component';
import {Modal} from '../common/domain/modal';
import {Alert} from '../common/util/alert.util';
import {UserProfile} from '../domain/user/user-profile';
import {Dashboard, BoardDataSource, PresentationDashboard} from '../domain/dashboard/dashboard';
import {DragDropConfig, DragDropService, DragDropSortableService, SortableContainer} from 'ng2-dnd';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {Comments, Comment} from '../domain/comment/comment';
import {CookieConstant} from '../common/constant/cookie.constant';
import {MomentPipe} from '../common/pipe/moment.pipe';
import {MomentDatePipe} from '../common/pipe/moment.date.pipe';
import {StringUtil} from '../common/util/string.util';
import {CommonUtil} from '../common/util/common.util';
import {WorkspaceService} from '../workspace/service/workspace.service';
import {PermissionChecker, PublicType, Workspace} from '../domain/workspace/workspace';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {Page, PageResult} from 'app/domain/common/page';
import {UpdateDashboardComponent} from '../dashboard/update-dashboard.component';
import {PopupInputNameDescComponent} from './component/popup-input-workbook/popup-input-namedesc.component';
import {EventBroadcaster} from '../common/event/event.broadcaster';
import {Datasource} from '../domain/datasource/datasource';
import {WidgetService} from "../dashboard/service/widget.service";

declare let $;

@Component({
  selector: 'app-workbook',
  templateUrl: './workbook.component.html',
  providers: [DragDropService, DragDropConfig, SortableContainer, DragDropSortableService, MomentPipe, MomentDatePipe]
})
export class WorkbookComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크북 아이디
  private workbookId: string;

  // 쿠키에 저장된 댓글 id
  private cookieCommentId: any;

  // 워크북 정보 입력 팝업 컴포넌트
  @ViewChild(PopupInputNameDescComponent)
  private _popupInputNameDescComp: PopupInputNameDescComponent;

  // 삭제 컴포넌트
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // 대시보드 컴포넌트
  @ViewChild(DashboardComponent)
  private _boardComp: DashboardComponent;

  // 대시보드 편집 컴포넌트
  @ViewChild(UpdateDashboardComponent)
  private _updateBoardComp: UpdateDashboardComponent;

  @ViewChild('srchDashboard')
  private inputSrchDashboard: ElementRef;

  // 워크스페이스 권한 확인기
  private _permissionChecker: PermissionChecker;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 모드 : VIEW, UPDATE
  public mode: string;

  // 대시보드 생성 팝업 표시 여부
  public isShowCreateDashboard: boolean;

  // LNB 로딩 표시 여부
  public isShowLnbLoading: boolean = false;

  // 대시보드 왼쪽 탭 : DASHBOARD, CHAT
  public leftTab: string;

  // 대시보드 리스트
  public dashboards: Dashboard[];

  public workspace: Workspace;            // 워크스페이스 정보
  public tempLoadBoard: Dashboard;         // 조회용 임시 보드 정보 ( reload를 위한 )
  public selectedDashboard: Dashboard;    // 선택된 대시보드

  // 대시보드 편집 시 시작 커맨드 정보
  public updateDashboardStartupCmd: { cmd: string, id?: string, type?: string };

  // 데이터 소스 목록 (전체)
  public datasources: any[];

  // 데이터 소스 목록 (선택 된 것)
  public selectedDatasources: string[];

  // 댓글 목록
  public comments: Comments;

  // new 표시 아이콘
  public isNewComment: boolean;

  // username
  public username: string;

  // text
  public commentText: string;

  // 워크북 정보
  public workbook: WorkbookDetailProjections;

  // 사용자에게 공유된 대시보드만 보여주기 플래그
  public onlyShowingFlag: boolean = false;

  // 대시보드 리스트 타입 : LIST, CARD
  public listType: string;

  // 대시보드 목록 페이지 번호 및 검색어
  public dashboardPage: PageResult = new PageResult();
  public dashboardSrchText: string = '';

  // 적재 대상 데이터소스
  public ingestionTargetDatasource: BoardDataSource;

  public isShowDetailMenu: boolean = false;           // 디테일 메뉴 표시 여부
  public isShowDatasourceMenu = false;                // 데이터소스 메뉴 표시 여부
  public isCloseDashboardList: boolean = false;       // 대시보드 목록 닫힘 여부
  public isShowMoreDashboardList: boolean = false;    // 대시보드 목록 더보기 버튼 표시 여부
  public isShowDataPreview = false;   // 데이터 미리보기 화면
  public isDashboardNameEditMode = false;   // 대시보드 이름,설명 수정 정보
  public isDashboardDescEditMode = false;   // 대시보드 이름,설명 수정 정보
  public isShowDashboardDetailMenu: boolean = false;    // 대시보드 상세 메뉴 펼침 여부
  public isShowDataIngestion: boolean = false;        // 필수 필터 설정 팝업 표시 여부
  public isChangeAuthUser: boolean = false;           // 워크북 변경 가능 권한 여부

  // 대시보드 필터링
  public get filteredDashboard(): Dashboard[] {
    // 대시보드 리스트 권한별 show
    if (this.onlyShowingFlag) {
      return this.dashboards.filter((ds) => {
        return (ds.hiding === false || ds.hiding === undefined);
      });
    }

    return this.dashboards;
  }

  public publicType = PublicType;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activatedRoute: ActivatedRoute,
              private workbookService: WorkbookService,
              private dashboardService: DashboardService,
              private workspaceService: WorkspaceService,
              private widgetService: WidgetService,
              private popupService: PopupService,
              private broadCaster: EventBroadcaster,
              private _clipboardService: ClipboardService,
              protected elementRef: ElementRef,
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

    // 로딩 표시
    this.loadingShow();

    // 초기 데이터 셋팅
    this._initViewPage();

    // MapView 프로퍼티 조회
    this.widgetService.loadPropMapView();

    // 위젯 편집 이벤트 ( 대시보드 편집 화면으로 이동 )
    this.subscriptions.push(
      this.broadCaster.on<any>('MOVE_EDIT_WIDGET').subscribe(data => {
        this.changeMode('UPDATE', data);
      })
    );

    // 필수 필터 재설정
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_ESSENTIAL_FILTER').subscribe(() => {
        try {
          this.changeMode('VIEW');
          // Linked Datasource 인지 그리고 데이터소스가 적재되었는지 여부를 판단함
          const mainDsName: string = this.selectedDashboard.configuration.dataSource.name;
          const mainDs: Datasource = this.selectedDashboard.dataSources.find(ds => ds.name === mainDsName);
          this.ingestionTargetDatasource = BoardDataSource.convertDsToMetaDs(mainDs);
          this.isShowDataIngestion = true;
          this.changeDetect.markForCheck();
        } catch (err) {
          console.error(err);
        }
      })
    );


    // 대시보드 생성 완료
    this.subscriptions.push(
      this.broadCaster.on<any>('WORKBOOK_RELOAD_BOARD_LIST').subscribe((data: { boardId: string }) => {
        this._getWorkbook().then(() => {
          // 생성 후 체크가 모두 선택
          this.selectedDatasources = this.datasources.map(ds => ds.id);
          this.loadDashboardList(0, data.boardId);
        });
      })
    );

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {

      // 워크북 아이디 저장
      this.workbookId = params['workbookId'];

      // Send statistics data
      this.sendViewActivityStream(this.workbookId, 'WORKBOOK');

      this._getWorkbook().then((workbook: Workbook) => {

        // 워크스페이스 조회
        this.workspaceService.getWorkSpace(this.workbook.workspaceId, 'forDetailView').then((workspace: Workspace) => {

          // 워크스페이스 저장
          this.workspace = workspace;

          // 퍼미션 체커 정의
          this._permissionChecker = new PermissionChecker(workspace);

          if (workspace.active && this._permissionChecker.isViewWorkbook()) {

            // 관리 유저 여부 설정
            this.isChangeAuthUser =
              (this._permissionChecker.isManageWorkbook()
                || this._permissionChecker.isEditWorkbook(workbook.createdBy.username));

            // 만약 새로 생성이라면
            const afterCreateWorkbookCmd: string = sessionStorage.getItem('AFTER_CREATE_WORKBOOK');

            this.loadingHide();

            if ('CREATE_DASHBOARD' === afterCreateWorkbookCmd) {
              sessionStorage.removeItem('AFTER_CREATE_WORKBOOK');
              this.createDashboard();
            } else {
              // 대시보드 조회
              this.loadDashboardList(0);
            }
          } else {
            // 경고창 표시
            this.openAccessDeniedConfirm();
          }

        });
      });

      // 댓글 조회
      this._getComments();
    });

    // z-index 이슈를 해결하기 위한 코드
    $('.ddp-layout-contents').addClass('ddp-layout-board');

  } // function - ngOnInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();

    // z-index 이슈를 해결하기 위한 코드
    $('.ddp-layout-contents').removeClass('ddp-layout-board');

    // 쿠키 저장
    if (this.comments.comments.length > 0) {
      const userId = this.cookieService.get('LOGIN_USER_ID');
      this.cookieService.set(userId + this.workbookId, this.comments.comments[0].id + '', 0, '/');
    }
  }

  /**
   * unload 전 실행
   */
  public execBeforeUnload() {
    if (this.mode === 'UPDATE' && this._updateBoardComp ) {
      this.useUnloadConfirm = this._updateBoardComp.execBeforeUnload();
    }
  } // function - execBeforeUnload

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Common
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * 날짜 형식 변경
   * @param {Date} date
   * @returns {string}
   */
  public dateFormatTodayTimeElseDate(date: Date) {
    return moment().calendar(date, {
      sameDay: 'HH:mm',
      sameElse: 'YYYY.MM.DD HH:mm'
    });
  } // function - dateFormatTodayTimeElseDate

  /**
   * 워크스페이스로 이동
   */
  public gotoWorkspace() {
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    let cookieWorkspace = (cookieWs) ? JSON.parse(cookieWs) : null;
    if (null !== cookieWorkspace && null !== cookieWorkspace['workspaceId']) {
      this.router.navigate(['/workspace', cookieWorkspace['workspaceId']]).then();
    } else {
      this.router.navigate(['/workspace']).then();
    }
  } // function - gotoWorkspace

  /**
   * 워크북 정보 갱신 및 대시보드 복제 이벤트 핸들러
   * @param {any} info
   */
  public afterInputInfo(info: { type: string, name: string, desc: string, id: string }) {
    if ('UPDATE_WORKBOOK' === info.type) {
      this.loadingShow();

      const workbookInfo: Workbook = Object.assign({}, this.workbook);
      workbookInfo.name = info.name;
      workbookInfo.description = info.desc;

      this.workbookService.updateBook(workbookInfo).then((workbook) => {
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.workbook.name = workbook.name;
        this.workbook.description = workbook.description;
        this.workbook.modifiedTime = workbook.modifiedTime;
        this._popupInputNameDescComp.close();
        this.loadingHide();
      }).catch(err => {
        Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
        this.commonExceptionHandler(err);
      });
    }
  } // function - afterInputInfo

  /**
   * 워크북, 대쉬보드 삭제
   * @param {Modal} $event
   */
  public deleteContent($event: Modal) {

    if ($event.data.type === 'workbook') {
      // 워크북 삭제
      this.loadingShow();
      this.workbookService.deleteWorkbook(this.workbook.id).then(() => {
        Alert.success(this.translateService.instant('msg.book.alert.workbook.del.success'));
        this.gotoWorkspace();
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
        this.loadingHide();
      });

      // 대시보드 삭제
    } else if ($event.data.type === 'dashboard') {
      const dashboard: Dashboard = $event.data.data;
      // 대쉬보드 삭제
      this.loadingShow();
      this.dashboardService.deleteDashboard(dashboard.id).then(() => {
        Alert.success(this.translateService.instant('msg.board.alert.dashboard.del.success'));

        // 현재 보고있는 페이지 인 경우
        if (this.selectedDashboard.id === dashboard.id) {
          this.selectedDashboard = null;
        }

        this._getWorkbook().then(() => {
          this.selectedDatasources = this.datasources.map(ds => ds.id);
          this.loadingHide();
          this.loadDashboardList(0);
        });

      }).catch(() => {
        Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));

        this.loadingHide();
      });
      // 댓글 삭제
    } else if ($event.data.type === 'comment') {

      this.isShowLnbLoading = true;

      this.workbookService.deleteComment(this.workbook.id, $event.data.data).then(() => {
        Alert.success(this.translateService.instant('msg.board.alert.comment.del.success'));

        this._getComments();
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));

        this.isShowLnbLoading = false;
      });
    }
  } // function - deleteContent

  /**
   * 탭 체인지
   * @param {string} value
   */
  public changeTab(value: string) {
    // 탭이 chat 일 때만
    if (this.leftTab === 'CHAT' && this.comments.comments.length > 0 && value === 'DASHBOARD') {
      this.isNewComment = false;

      // 쿠키 저장
      const userId = this.cookieService.get('LOGIN_USER_ID');
      this.cookieService.set(userId + this.workbookId, this.comments.comments[0].id + '', 0, '/');
    } else if (this.leftTab === 'DASHBOARD' && value === 'CHAT') {
      // 댓 조회
      this._getComments();
    }

    this.leftTab = value;
  } // function - changeTab

  /**
   * LNB 표시를 변환한다.
   * @param {boolean} isClose
   */
  public toggleFoldDashboardList(isClose?: boolean) {
    if ('undefined' === typeof isClose) {
      this.isCloseDashboardList = !this.isCloseDashboardList;
    } else {
      this.isCloseDashboardList = isClose;
    }
    (this._boardComp) && (this._boardComp.toggleFoldWorkbookDashboardList());

    // 쿠키 저장
    this.cookieService.set(CookieConstant.KEY.WORKBOOK_CLOSE_DASHBOARD_LIST, String(this.isCloseDashboardList), 0, '/');
  } // function - toggleFoldDashboardList

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Workbook
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 워크북 수정모달
   */
  public updateWorkbook() {
    this._popupInputNameDescComp.init({
      type: 'UPDATE_WORKBOOK',
      id: this.workbook.id,
      name: this.workbook.name,
      desc: this.workbook.description
    });
  } // function - updateWorkbook

  /**
   * 워크북 삭제 확인 팝업
   */
  public confirmDeleteWorkbook() {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.book.ui.del.workbook.del.title');
    modal.description = this.translateService.instant('msg.book.ui.del.workbook.del.description');
    modal.subDescription = this.translateService.instant('msg.comm.ui.del.description');
    modal.btnName = this.translateService.instant('msg.book.ui.del.workbook.btn');
    modal.data = {
      type: 'workbook'
    };

    this.deleteModalComponent.init(modal);
  } // function - confirmDeleteWorkbook

  /**
   * 워크북 상세 메뉴 표시 On/Off
   * @param {MouseEvent} event
   */
  public toggleWorkbookDetailMenu(event: MouseEvent) {
    this.isShowDetailMenu = !this.isShowDetailMenu;
    if (this.isShowDetailMenu) {
      this.safelyDetectChanges();
      let $target: JQuery = $(event.target);
      ($target.hasClass('ddp-icon-more')) || ($target = $target.find('.ddp-icon-more'));
      const lnbmoreLeft: number = $target.offset().left;
      const lnbmoreTop: number = $target.offset().top;
      this.$element.find('.ddp-popup-lnbmore').css({'left': lnbmoreLeft - 180, 'top': lnbmoreTop + 25});
    }
  } // function - toggleWorkbookDetailMenu

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Dashboard List
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * 이미지 경로 설정
   * @param {ElementRef} elmRef
   * @param {string} imageUrl
   */
  public getBoardImage(elmRef: ElementRef, imageUrl: string) {
    if (imageUrl) {
      const date = Date.now();
      elmRef.nativeElement.src = '/api/images/load/url?url=' + imageUrl + '/thumbnail?' + date;
    } else {
      elmRef.nativeElement.src = '/assets/images/img_board_default2.png';
    }
  } // function - getBoardImage

  /**
   * Toggle datasource layer
   */
  public toggleDatasourceLayer() {
    if( this.datasources && 0 < this.datasources.length ) {
      this.isShowDatasourceMenu = !this.isShowDatasourceMenu;
    }
  } // function - toggleDatasourceLayer

  /**
   * 데이터소스 선택
   * @param dsId
   */
  public selectDatasource(dsId) {
    const idx = this.selectedDatasources.indexOf(dsId);
    if (idx === -1) {
      this.selectedDatasources.push(dsId);
      this.loadDashboardList();
    } else {
      this.selectedDatasources.splice(idx, 1);
      // 데이터 체크된 상태가 없는 경우 값 0
      this.selectedDatasources.length === 0 ? this.dashboards = [] : this.loadDashboardList();
    }
    this.changeDetect.detectChanges();
  } // function - selectDatasource

  /**
   * 대쉬보드 show 토글
   * @param {Dashboard} dashboard
   * @param event
   */
  public changeFavorite(dashboard: Dashboard, event) {
    event.stopImmediatePropagation();

    const params = {
      hiding: !dashboard.hiding
    };

    this.dashboardService.updateDashboard(dashboard.id, params).then((ds) => {
      dashboard.hiding = ds.hiding;
    });
  } // function - changeFavorite

  /**
   * 모드 변경
   * @param {string} mode
   * @param {any} startupCmd
   */
  public changeMode(mode: string, startupCmd?: { cmd: string, id?: string, type?: string }) {
    this.updateDashboardStartupCmd = startupCmd ? startupCmd : {cmd: 'NONE'};
    this.mode = mode;
    this.safelyDetectChanges();
  } // function - changeMode

  /**
   * 대시보드 정렬
   */
  public changeOrder() {

    // 로딩 show
    this.loadingShow();

    // 요청할 대시보드 리스트
    const params = [];
    this.dashboards.forEach((item, idx) => {
      params.push({
        op: 'REPLACE',
        hiding: item.hiding,
        id: item.id,
        seq: idx
      });
    });

    // 순서 변경
    this.workbookService.setDashboardSort(this.workbookId, params)
      .then(() => {
        // 성공 알림
        Alert.success(this.translateService.instant('msg.board.alert.dashboard.sort.success'));
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 성공 알림
        Alert.error(this.translateService.instant('msg.board.alert.dashboard.sort.fail'));
        // 로딩 hide
        this.loadingHide();
      });

  } // function - changeOrder

  /**
   * 대시보드 목록 검색
   * @param {KeyboardEvent} event
   */
  public searchDashboardByName(event: KeyboardEvent) {
    if (13 === event.keyCode) {
      this.dashboardSrchText = event.target['value'].trim();
      this.loadDashboardList(0);
    }
  } // function - searchDashboardByName

  /**
   * 대시보드 검색어 삭제 버튼 표시 여부
   * @returns {boolean}
   */
  public isShowBtnClearSrchDashboard(): boolean {
    return ('undefined' !== typeof this.inputSrchDashboard && this.inputSrchDashboard.nativeElement.value !== '');
  } // function - isShowBtnClearSrchDashboard

  /**
   * 검색어를 제거하고 새로 조회한다.
   */
  public clearSearchText() {
    this.inputSrchDashboard.nativeElement.value = '';
    if ('' !== this.dashboardSrchText) {
      this.dashboardSrchText = '';
      this.loadDashboardList(0);
    }
  } // function - clearSearchText

  /**
   * 대쉬보드 목록 갱신
   * @param {number} page
   * @param {string} targetBoardId
   */
  public loadDashboardList(page: number = 0, targetBoardId?: string) {
    this.loadingShow();

    if (!this.workspace) return;

    const params = {
      includeHidden: this.isChangeAuthUser,
      datasources: this.selectedDatasources.join(',')
    };
    if ('' !== this.dashboardSrchText.trim()) {
      params['nameContains'] = this.dashboardSrchText.trim();
    }

    const pageInfo: Page = new Page();
    pageInfo.page = page;

    if (0 === page) {
      this.dashboardPage = new PageResult();
      this.dashboards = [];
      this.isShowMoreDashboardList = false;
    }

    this.workbookService.getDashboards(
      this.workbook.id, {key: 'seq', type: 'asc'}, pageInfo, 'forListView', params
    ).then((result) => {
      let tempList = [];
      if (result.hasOwnProperty('_embedded') && result['_embedded'].hasOwnProperty('dashboards')) {
        tempList = result['_embedded']['dashboards'];
        tempList.forEach((ds) => {
          if (ds.hiding === undefined) ds.hiding = false;
        });
        // API 상에서 권한자가 아닐 경우에 hiding 된 목록은 내려오지 않는 것이 맞으나,
        // API 에서 처리되지 않을 경우를 위해 필터링을 추가함
        if (!this.isChangeAuthUser) {
          tempList = tempList.filter(item => !item.hiding);
        }
      }

      if (result.page) {
        const objPage: PageResult = result.page;
        this.dashboardPage = objPage;
        if (0 === objPage.number) {
          this.dashboards = tempList;
        } else {
          this.dashboards = this.dashboards.concat(tempList);
        }
        this.isShowMoreDashboardList = (0 < objPage.totalPages && objPage.number !== objPage.totalPages - 1);
      }

      // 업데이트에서 대시보드 생성한 후 조회 일 경우 모드 갱신 안함
      if (this.mode !== 'UPDATE') {
        if (this.dashboards.length === 0) {
          this.changeMode('NO_DATA');
        } else {
          this.changeMode('VIEW');
        }
      }

      this.loadingHide();

      // Select Dashboard
      if (0 < this.dashboards.length) {
        if (targetBoardId) {
          const selectedBoard: Dashboard = this.dashboards.find(item => item.id === targetBoardId);
          if (selectedBoard) {
            this.loadAndSelectDashboard(selectedBoard);
          } else {
            if (this.dashboardPage.totalPages > this.dashboardPage.number + 1) {
              this.loadDashboardList(this.dashboardPage.number + 1, targetBoardId);
            }
          }
        } else {
          this.loadAndSelectDashboard(this.dashboards[0]);
        }
      } else {
        this.selectedDashboard = null;
      }

      // detect changes
      this.safelyDetectChanges();

    }).catch(() => {
      Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
      this.loadingHide();
    });
  } // function - loadDashboardList

  /**
   * Change list type
   * @param {string} type
   */
  public changeListType(type: string) {
    this.listType = type;
    this.safelyDetectChanges();
    if (this.selectedDashboard) {
      this.scrollToDashboard(this.selectedDashboard.id);
    }
  } // function - changeListType

  /**
   * Scroll to target dashboard
   * @param {string} dashboardId
   */
  public scrollToDashboard(dashboardId: string) {
    const selectedIdx: number = this.dashboards.findIndex(item => item.id === dashboardId);
    if ('LIST' === this.listType) {
      $('.ddp-ui-board-listview').animate({scrollTop: selectedIdx * 52}, 800, 'swing');
    } else {
      $('.ddp-ui-board-thumbview').animate({scrollTop: selectedIdx * 185}, 800, 'swing');
    }
  } // function - scrollToDashboard

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Comment
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 댓글 입력
   * @param $event
   * @param {Comment} updateComment
   */
  public createComments($event, updateComment?: Comment) {
    // 엔터입력
    if ($event.keyCode === 13) {

      // 개행이 아닐 경우
      if (!$event.shiftKey) {
        $event.preventDefault();

        // 수정
        if (updateComment) {
          if (updateComment.contents && updateComment.contents.length > 0) {

            this.isShowLnbLoading = true;
            this.workbookService.updateComment(updateComment, this.workbook.id).then(() => {
              this._getComments();
            }).catch(() => {
              // Alert.error('댓글 수정에 실패했습니다.');
              Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
              this.loadingHide();
            });
          }
          // 생성
        } else {
          const comment = new Comment();
          comment.contents = this.commentText;

          if (this.commentText && this.commentText.length > 0) {
            this.isShowLnbLoading = true;
            this.workbookService.createComment(comment, this.workbook.id).then(() => {
              this.commentText = '';
              this._getComments();
            }).catch(() => {
              Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
              this.loadingHide();
            });
          }
        }
      }
    }
  } // function - createComments

  /**
   * 댓글 삭제 확인 팝업
   * @param {string} commentId
   */
  public confirmDeleteComment(commentId: string) {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.ui.del.comment.del.title');
    modal.description = this.translateService.instant('msg.board.ui.del.comment.del.description');
    modal.btnName = this.translateService.instant('msg.board.ui.del.comment.btn');
    modal.data = {
      type: 'comment',
      data: commentId
    };

    this.deleteModalComponent.init(modal);
  } // function - confirmDeleteComment

  /**
   * 유저의 프로필 사진
   * @param user
   * @returns {string}
   */
  public getProfileImage(user): string {
    return user.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + user.imageUrl + '/thumbnail'
      : '/assets/images/img_photo.png';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Dashboard
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 대시보드 아이디 클립보드에 복사
   */
  public copyBoardIdToClipboard() {
    if (this.selectedDashboard) {
      this._clipboardService.copyFromContent( this.selectedDashboard.id );
    }
  } // function - copyBoardIdToClipboard

  /**
   * 대시보드 생성
   */
  public createDashboard() {
    this.isShowCreateDashboard = true;
    this.useUnloadConfirm = true;
    this.safelyDetectChanges();
  } // function - createDashboard

  /**
   * 대시보드 생성 종료
   */
  public closeCreateDashboard() {
    this.isShowCreateDashboard = false;
    this.useUnloadConfirm = false;
    this.safelyDetectChanges();
  } // function - closeCreateDashboard

  /**
   * 대쉬보드 복제
   * @param {Dashboard} dashboard
   */
  public copyDashboard(dashboard: Dashboard) {
    // 로딩 show
    this.loadingShow();
    this.dashboardService.copyDashboard(dashboard.id).then((copyBoard: Dashboard) => {
      Alert.success('\'' + dashboard.name + '\' ' + this.translateService.instant('msg.board.alert.dashboard.copy.success'));
      this._popupInputNameDescComp.close();
      this.loadingHide();
      this.loadDashboardList(0, copyBoard.id);
    }).catch(() => this.loadingHide());
  } // function - copyDashboard

  /**
   * 대시보드 업데이트( 이름, 설명)
   * @param {Dashboard} dashboard
   */
  public updateDashboard(dashboard: Dashboard) {

    this.dashboards.forEach((db) => {
      if (db.id === dashboard.id) {
        // 대시보드 목록과 이름 둘중에 하나라도 변했을 경우
        if (this._dashboardValidation(dashboard) && (db.name !== dashboard.name || db.description !== dashboard.description)) {

          const param = {
            name: dashboard.name,
            description: dashboard.description
          };

          this.loadingShow();
          this.dashboardService.updateDashboard(dashboard.id, param).then(() => {
            // 성공시 목록 데이터 갱신
            db.name = dashboard.name;
            db.description = dashboard.description;
            Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
            this.changeDetect.detectChanges();
            this.loadingHide();
          }).catch(() => {
            Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
            this.loadingHide();
          });

        }
        return true;
      }
      return false;
    });
  } // function - updateDashboard

  /**
   * 대시보드 업데이트 후 동작
   * @param dashboard
   */
  public updateCompleteDashboard(dashboard) {
    // 업데이트한 대시보드 선택처리
    this.selectedDashboard = dashboard;
    // 좌측 대시보드 리스트 썸네일 갱신
    this.dashboards.forEach((board) => {
      if (board.id === dashboard.id) {
        board.imageUrl = dashboard.imageUrl;
      }
    });

    // mode
    this.changeMode('VIEW');
  } // function - updateCompleteDashboard

  /**
   * 대시보드 삭제 확인 팝업
   * @param {Dashboard} dashboard
   */
  public confirmDeleteDashboard(dashboard: Dashboard) {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.ui.del.dashboard.del.title');
    // modal.description = `'${dashboard.name}' 대시보드를 삭제하시겠습니까?`;
    modal.description = this.translateService.instant('msg.board.ui.del.dashboard.del.description');
    modal.subDescription = this.translateService.instant('msg.comm.ui.del.description');
    modal.btnName = this.translateService.instant('msg.board.ui.del.dashboard.btn');
    modal.data = {
      type: 'dashboard',
      data: dashboard
    };

    this.deleteModalComponent.init(modal);
  } // function - confirmDeleteDashboard

  /**
   * 대시보드 정보 조회 및 선택
   * @param {Dashboard} dashboard
   */
  public loadAndSelectDashboard(dashboard: Dashboard) {

    this.tempLoadBoard = dashboard;
    if (!this.selectedDashboard || this.selectedDashboard.id !== dashboard.id) {
      if(this._boardComp) {
        this._boardComp.showBoardLoading();
        this._boardComp.hideError();
      }
      this.dashboardService.getDashboard(dashboard.id).then((board: Dashboard) => {
        // save data for selected dashboard
        board.workBook = this.workbook;
        this.selectedDashboard = board;
        this.tempLoadBoard = undefined;

        this.scrollToDashboard(board.id); // scroll to item

        (this._boardComp) && (this._boardComp.hideBoardLoading());
        this.safelyDetectChanges();
      }).catch(() => {
        if(this._boardComp) {
          this._boardComp.showError();
          this._boardComp.hideBoardLoading();
        }
        this.safelyDetectChanges();
      });
    } else {
      this._boardComp.hideBoardLoading();
      this.safelyDetectChanges();
    }
  } // function - loadAndSelectDashboard

  /**
   * 대시보드 이벤트 핸들러
   * @param {Event} event
   */
  public onDashboardEvent(event: { name: string, data?: any }) {
    if ('RELOAD_BOARD' === event.name) {
      this.loadAndSelectDashboard(this.tempLoadBoard);
    }
  } // function - onDashboardEvent

  /**
   * Data Ingestion 완료 이벤트 핸들러
   * @param {any} tempDatasource
   */
  public finishDataIngestion(tempDatasource: { id: string, info: Datasource, dataSourceId: string }) {

    const mainDsIdx: number = this.selectedDashboard.dataSources.findIndex(ds => ds.id === tempDatasource.dataSourceId);

    this.loadingShow();
    const dashboard: Dashboard = _.cloneDeep(this.selectedDashboard);
    dashboard.configuration.dataSource = BoardDataSource.convertDsToMetaDs(tempDatasource.info);
    dashboard.dataSources[mainDsIdx] = tempDatasource.info;
    this.isShowDataIngestion = false;

    // 대시보드 업데이트
    const param: any = {configuration: dashboard.configuration, temporaryId: tempDatasource.id};
    this.dashboardService.updateDashboard(dashboard.id, param).then(() => {
      this._boardComp.hideError();
      this.dashboardService.getDashboard(dashboard.id).then((board: Dashboard) => {
        board.workBook = this.workbook;
        this.selectedDashboard = board;
        this.loadingHide(); // 로딩 숨김
        this.changeDetect.detectChanges();    // 변경 갱신
      }).catch(() => {
        this._boardComp.showError();
        this.loadingHide(); // 로딩 숨김
      });
    });

  } // function - finishDataIngestion

  /**
   * 현재 대시보드에 대한 프레젠테이션 뷰로 이동한다.
   */
  public gotoPresentationView() {
    // 데이터 설정
    this.popupService.ptDashboards = _.cloneDeep(this.dashboards);
    let boardInfo: PresentationDashboard = <PresentationDashboard>_.cloneDeep(this.selectedDashboard);
    boardInfo.selectionFilters = this._boardComp ? this._boardComp.getSelectedFilters() : [];
    this.popupService.ptStartDashboard = boardInfo;
    // 페이지 호출
    this.router.navigate([`/dashboard/presentation/${this.workbook.id}/${this.selectedDashboard.id}`]).then();
  } // function - gotoPresentationView

  /**
   * 위젯을 추가함 ( 편집 화면으로 이동 후 추가 화면으로 이동 )
   */
  public addWidget(type: string) {
    switch (type) {
      case 'NEW_CHART' :
        this.changeMode('UPDATE', {cmd: 'NEW', type: 'CHART'});
        break;
      case 'NEW_TEXT' :
        this.changeMode('UPDATE', {cmd: 'NEW', type: 'TEXT'});
        break;
      case 'NEW_FILTER' :
        this.changeMode('UPDATE', {cmd: 'NEW', type: 'FILTER'});
        break;
    }
  } // function - addWidget

  /**
   * 이름 수정 모드로 변경
   * @param {MouseEvent} event
   */
  public onChangeModeName(event: MouseEvent) {
    if (this.isChangeAuthUser) {
      event.stopPropagation();
      this.isDashboardNameEditMode = true;
      this.isDashboardDescEditMode = false;
      this.changeDetect.detectChanges();
    }
  } // function - onChangeModeName

  /**
   * 이름 변경
   *
   * @param {string} inputName
   */
  public renameDashboard(inputName:string) {
    this.isDashboardNameEditMode = false;
    inputName = inputName ? inputName.trim() : '';
    if (inputName && 0 < inputName.length) {
      this.selectedDashboard.name = inputName;
      this.updateDashboard(this.selectedDashboard);
    } else {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.empty'));
    }
  } // function - renameDashboard

  /**
   * 설명 수정 모드로 변경
   * @param {MouseEvent} event
   */
  public onChangeModeDesc(event: MouseEvent) {
    if (this.isChangeAuthUser) {
      event.stopPropagation();
      this.isDashboardDescEditMode = true;
      this.isDashboardNameEditMode = false;
      this.changeDetect.detectChanges();
    }
  } // function - onChangeModeDesc

  /**
   * 설명 변경
   *
   * @param {string} inputDesc
   */
  public changeDesc(inputDesc:string) {
    this.isDashboardDescEditMode = false;
    this.selectedDashboard.description = inputDesc;
    this.updateDashboard(this.selectedDashboard);
  } // function - changeDesc

  /**
   * 수정자 이름 조회
   * @returns {string}
   */
  public getEditorName() {
    if (this.selectedDashboard.modifiedBy) {
      return this.selectedDashboard.modifiedBy.fullName;
    } else if (this.selectedDashboard.createdBy) {
      return this.selectedDashboard.createdBy.fullName;
    } else {
      return '';
    }
  } // function - getEditorName

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * workbook 조회
   * @returns {Promise<any>}
   * @private
   */
  private _getWorkbook(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.workbookService.getWorkbook(this.workbookId).then((result) => {
        // 워크북이 들고있는 전체 데이터 소스 목록
        this.datasources = result.dataSource.map((ds) => {
          return {id: ds.id, name: ds.name};
        });

        // 최초 아무것도 선택이 안 되어있는 경우는 전체 선택
        if (this.selectedDatasources === undefined) {
          this.selectedDatasources = this.datasources.map(ds => ds.id);
        }

        this.workbook = result;

        resolve(result);
      }).catch((err) => reject(err));
    });
  } // function - _getWorkbook

  /**
   * 댓글 조회
   * @private
   */
  private _getComments() {
    // 로딩 시작
    this.isShowLnbLoading = true;

    this.workbookService.getComments(this.workbookId, this.page).then((result) => {
      // 댓글 존재시
      if (result['_embedded']) {

        // 쿠키에서 값 조회
        const userId = this.cookieService.get('LOGIN_USER_ID');
        this.cookieCommentId = this.cookieService.get(userId + this.workbookId);
        // 댓글 저장
        this.comments = result['_embedded'];

        // 내 댓글이거나 이미 본 댓글이면 false
        this.comments.comments.forEach((comment) => {
          comment.isNew = !(this.username === comment.createdBy.username || this.cookieCommentId >= comment.id);
          // 새로운 댓글표시
          if (comment.isNew) {
            this.isNewComment = true;
          }
        });
      } else {
        // 댓글 없다면 초기화
        this.comments = new Comments();
        this.comments.comments = [];
        // 최초 댓글
        this.isNewComment = false;
      }

      // 로딩 hide
      this.isShowLnbLoading = false;
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
      // 로딩 hide
      this.isShowLnbLoading = false;
    });
  } // function - _getComments

  /**
   * 업데이트 대시보드 벨리데이션
   * @param {Dashboard} dashboard
   * @returns {boolean}
   * @private
   */
  private _dashboardValidation(dashboard: Dashboard) {
    if (StringUtil.isEmpty(dashboard.name)) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.empty'));
      return false;
    }

    if (CommonUtil.getByte(dashboard.name) > 150) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.len'));
      return false;
    }

    if (dashboard.description != null
      && CommonUtil.getByte(dashboard.description) > 450) {

      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return false;
    }

    return true;
  } // function - _dashboardValidation

  /**
   * 뷰 설정을 위한 초기데이터 셋팅
   * @private
   */
  private _initViewPage() {

    // 페이지 초기화
    this.page.size = 100000;

    // workbook 초기값 설정
    this.workbook = new WorkbookDetailProjections();
    this.workbook.modifiedBy = new UserProfile();
    this.workbook.createdBy = new UserProfile();
    this.leftTab = 'DASHBOARD';
    this.listType = 'CARD';
    this.dashboards = [];
    // 사용자에게 공유된 대시보드만 보여주기 플래그
    this.onlyShowingFlag = false;

    // comment 초기화
    this.comments = new Comments();
    this.comments.comments = [];

    // 사용자 아이디
    this.username = CommonUtil.getLoginUserId();

    const cookieIsCloseDashboardList = this.cookieService.get(CookieConstant.KEY.WORKBOOK_CLOSE_DASHBOARD_LIST);
    this.toggleFoldDashboardList('true' === cookieIsCloseDashboardList);

    this.changeMode('NO_DATA');
  } // function - _initViewPage
}
