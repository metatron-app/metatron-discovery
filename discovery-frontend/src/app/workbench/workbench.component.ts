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

import {AbstractComponent} from '../common/component/abstract.component';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {GridComponent} from '../common/component/grid/grid.component';
import {header, SlickGridHeader} from '../common/component/grid/grid.header';
import {GridOption} from '../common/component/grid/grid.option';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchService} from './service/workbench.service';
import {QueryEditor, Workbench} from '../domain/workbench/workbench';
import {Alert} from '../common/util/alert.util';
import {DetailWorkbenchTable} from './component/detail-workbench/detail-workbench-table/detail-workbench-table';
import {CommonConstant} from '../common/constant/common.constant';
import {DeleteModalComponent} from '../common/component/modal/delete/delete.component';
import {Modal} from '../common/domain/modal';
import {UserDetail} from '../domain/common/abstract-history-entity';
import {StringUtil} from '../common/util/string.util';
import {CookieConstant} from '../common/constant/cookie.constant';
import {isNullOrUndefined, isUndefined} from 'util';
import {LoadingComponent} from '../common/component/loading/loading.component';
import {DatasourceService} from '../datasource/service/datasource.service';
import {PageWidget} from '../domain/dashboard/widget/page-widget';
import {Dashboard, BoardDataSource, BoardConfiguration} from '../domain/dashboard/dashboard';
import {
  ConnectionType, Datasource, Field, IngestionRuleType
} from '../domain/datasource/datasource';
import {Workbook} from '../domain/workbook/workbook';
import {DataconnectionService} from '../dataconnection/service/dataconnection.service';
import {CommonUtil} from '../common/util/common.util';
import * as _ from 'lodash';
import {DetailWorkbenchSchemaBrowserComponent} from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';
import {SYSTEM_PERMISSION} from '../common/permission/permission';
import {PermissionChecker, Workspace} from '../domain/workspace/workspace';
import {WorkspaceService} from '../workspace/service/workspace.service';
import {CodemirrorComponent} from './component/editor-workbench/codemirror.component';
import {SaveAsHiveTableComponent} from "./component/save-as-hive-table/save-as-hive-table.component";
import {DetailWorkbenchDatabase} from "./component/detail-workbench/detail-workbench-database/detail-workbench-database";
import {Message} from '@stomp/stompjs';
import {AuthenticationType, Dataconnection, InputMandatory, InputSpec} from "../domain/dataconnection/dataconnection";

declare let moment: any;
declare let Split;

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styles: ['.split, .gutter.gutter-horizontal { float: left; } .gutter.gutter-horizontal { cursor: ew-resize; }']
})
export class WorkbenchComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 에디터 행수
  private MAX_LINES: number = 20;

  private _gridScrollEvtSub: any;

  // 그리드
  @ViewChild('main')
  private gridComponent: GridComponent;

  @ViewChild('gridWrapElement')
  private gridWrapElement: ElementRef;

  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // 에디터 관련 변수
  @ViewChild(CodemirrorComponent)
  private editor: CodemirrorComponent;

  // table 목록 관련 변수
  @ViewChild(DetailWorkbenchTable)
  private detailWorkbenchTable: DetailWorkbenchTable;

  @ViewChild(LoadingComponent)
  private loadingBar: LoadingComponent;

  // 선택된 탭 번호
  private selectedTabNum: number = 0;

  // websocket sbuscription
  private websocketId: string;

  // websocket id
  private webSocketLoginId: string = '';

  // websocket pw
  private webSocketLoginPw: string = '';

  // 스키마 브라우저
  @ViewChild(DetailWorkbenchSchemaBrowserComponent)
  private schemaBrowserComponent: DetailWorkbenchSchemaBrowserComponent;

  // 에디터 리스트 tabs
  @ViewChild('editorListTabs')
  private _editorListTabs: ElementRef;
  // 에디터 리스트 최대 값
  @ViewChild('editorListMax')
  private _editorListMax: ElementRef;
  // 에디터 리스트 사이즈 버튼
  @ViewChild('editorListSizeBtn')
  private _editorListSizeBtn: ElementRef;

  // 에디터 결과 리스트 tabs
  @ViewChild('editorResultListTabs')
  private _editorResultListTabs: ElementRef;
  // 에디터 결과 리스트 최대 값
  @ViewChild('editorResultListMax')
  private _editorResultListMax: ElementRef;

  @ViewChild('questionLayout')
  private _questionLayout: ElementRef;

  @ViewChild('questionWrap')
  private _questionWrap: ElementRef;

  @ViewChild(SaveAsHiveTableComponent)
  private saveAsHiveTableComponent: SaveAsHiveTableComponent;

  @ViewChild(DetailWorkbenchDatabase)
  private detailWorkbenchDatabase: DetailWorkbenchDatabase;

  // request reconnect count
  private _executeSqlReconnectCnt: number = 0;
  private _checkQueryStatusReconnectCnt: number = 0;

  private _subscription: any;

  private _resizeTimer: any;
  private _tooltipTimer: any; // Result Tab SQL Tooltip timer

  private _splitVertical: any;
  private _splitHorizontal: any;

  private _workspaceId: string;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // editor 리스트 관리객체
  public editorListObj = new EditorList();

  // editor 결과 리스트 관리객체
  public editorResultListObj = new EditorList();

  // 워크 벤치 아이디
  public workbenchId: string;

  // 워크벤치 데이터
  public workbench: Workbench = new Workbench();

  // 워크벤치 데이터
  public workbenchTemp: Workbench = new Workbench();

  // 오른쪽 상단 워크벤치 메타정보 show/hide
  public isWorkbenchOptionShow: boolean = false;

  public options: any = {
    maxLines: this.MAX_LINES,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };

  // 선택된 텍스트
  public text: string = '';

  // tab list 이름만 모아뒀다
  public textList: any[] = []; // { name: '쿼리' + this.tabNum, query: '', selected: true }

  // 전체 데이터 탭 목록
  public totalResultTabList: ResultTab[] = [];

  public selectedEditorId: string;    // 선택된 에디터 아이디
  public executeEditorId: string;     // 현재 쿼리가 실행중인 에디터 아이디
  public runningResultTabId: string;  // 현재 실행 대상 탭 아이디

  // 왼쪽 메뉴 show/hide
  public isLeftMenuOpen: boolean = true;

  // dataconnection 정보 패널 Show 여부
  public isDataConnectionInfoShow: boolean = false;

  // 첫번쨰 : 글로벌 변수 선언 show/hide
  public isGlobalVariableMenuShow: boolean = false;

  // 두번째 : 쿼리히스토리 show/hide
  public isQueryHistoryMenuShow: boolean = false;

  // 세번쨰 : 네비게이션 show/hide
  public isNavigationMenuShow: boolean = false;

  public isQueryEditorFull: boolean = false;

  // 결과창 검색어
  public searchText: string = '';

  // 로그인 창 활성화 여부
  public loginLayerShow: boolean = false;

  // 워크벤치 이름 수정 모드
  public isWorkbenchNameEditMode: boolean = false;

  // 워크벤치 설명 수정 모드
  public isWorkbenchDescEditMode: boolean = false;

  // database component에 넘기기 위함 param
  public databaseParam: any;

  // table component에 넘기기 위한 paramm
  public tableParam: any;

  // 탭클릭시 보여지는 탭
  public tabLayer: boolean = false;

  public tabLayerX: string = '';

  public tabLayerY: string = '';

  public allQuery: String = 'ALL';

  // 워크벤치 datasource 저장하기
  public mode: string = '';

  // 데이터 소스 저장에 넘길 데이터.
  public setDatasource: any = {};

  // 페이지 컴포넌트 보이기 여부
  public isShowPage: boolean = false;

  // 페이지 객체에 넘기줄 겍채
  public selectedPageWidget: PageWidget;

  // 페이지 엔진 이름
  public pageEngineName: string = '';

  // 인증 방식
  public authenticationType: string = '';

  // 인터벌 객체
  public intervalDownload: any;

  // container for workbench name&desc -> edit
  public workbenchName: string;
  public workbenchDesc: string;

  public mainViewShow: boolean = true;

  // 검색바 표시 여부
  public isSearchLink: boolean = false;

  // 데이터 메니저 여부
  public isDataManager: boolean = false;

  @ViewChild('wbName')
  private wbName: ElementRef;
  @ViewChild('wbDesc')
  private wbDesc: ElementRef;

  // event close
  public closeEvent: any;

  public config = {
    mode: 'text/x-hive',
    indentWithTabs: true,
    lineNumbers: true,
    matchBrackets: true,
    autofocus: true,
    indentUnit: 4,
    smartIndent: false,
    showSearchButton: true,
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Ctrl-/': 'toggleComment',
      'Shift-Tab': 'indentLess',
      'Tab': 'indentMore',
      'Shift-Ctrl-Space': 'autocomplete',
      'Cmd-Alt-Space': 'autocomplete'
    },
    hintOptions: {
      tables: {}
    }
  };
  //H2, HIVE, ORACLE, TIBERO, MYSQL, MSSQL, PRESTO, FILE, POSTGRESQL, GENERAL;
  public mimeType: string = 'HIVE';

  // 수정 권한을 가진 사용자 여부
  public isChangeAuthUser: boolean = false;

  // 단축키 show flag
  public shortcutsFl: boolean = false;

  // 실행 탭 아이디 목록
  public executeTabIds: string[] = [];

  // 현재 실행 Index
  public currentRunningIndex: number = -1;

  public isExecutingQuery: boolean = false;   // query 실행 중

  public isCanceling: boolean = false; // 취소중인지 여부
  public isCanceled: boolean = false;  // 취소되었는지 여부

  public isFocusResultTooltip: boolean = false;

  // 접속한 사용자 OS 여부 (MAC, WINDOW)
  public isAgentUserMacOs: boolean = false;

  public tableSchemaParams: any;   // table schema search parameter
  public isOpenTableSchema: boolean = false;

  // 쿼리 히스토리 팝업
  public isQueryHistoryLogPopup: boolean = false;
  // 쿼리 히스토리 item
  public queryHistoryItem: any;
  // 쿼리 히스토리 삭제 팝업
  public isQueryHistoryDeletePopup: boolean = false;
  // 쿼리 삭제 여부
  public isQueryHistoryDelete: boolean = false;
  // 하단 팝업 닫힘 체크
  public isFootAreaPopupCheck: boolean = false;

  public saveAsLayer: boolean = false;
  public supportSaveAsHiveTable: boolean = false;

  public connTargetImgUrl: string = '';

  public hideResultButtons: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
              protected activatedRoute: ActivatedRoute,
              protected workbenchService: WorkbenchService,
              protected connectionService: DataconnectionService,
              protected datasourceService: DatasourceService,
              protected element: ElementRef,
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

    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) === '') {
      this.router.navigate(['/user/login']).then();
    }
    this.workbench.modifiedBy = new UserDetail();
    this.workbench.createdBy = new UserDetail();

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      this.workbenchId = params['id'];
    });

    // 사용자 운영체제 확인
    (navigator.userAgent.replace(/ /g, '').toUpperCase().indexOf("MAC") == -1 ? this.isAgentUserMacOs = false : this.isAgentUserMacOs = true);
  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();

    // Send statistics data
    this.sendViewActivityStream(this.workbenchId, 'WORKBENCH');

    // 초기 데이터 조회 - 화면이 표시되기 전에 로딩을 호출하여 표시되지 않는 문제로 지연 코드 추가
    setTimeout(() => {
      this.loadingBar.hide(); // 초기에 표시되는 문제로 숨김
      this.loadingShow();
      this._loadInitData(() => {
        this.webSocketCheck(() => this.loadingHide());

        this._splitVertical = Split(['.sys-workbench-top-panel', '.sys-workbench-bottom-panel'], {
          direction: 'vertical',
          onDragEnd: () => {
            this.isFootAreaPopupCheck = true;
            this.onEndedResizing();
          }
        });
        this.onEndedResizing();
        this._activeHorizontalSlider();
      });
    }, 500);
  } // function - ngAfterViewInit

  /**
   * 웹소켓 체크
   * @param {Function} callback
   */
  public webSocketCheck(callback?: Function) {
    this.checkAndConnectWebSocket(true).then(() => {
      try {
        this.createWebSocket(() => {
          this.websocketId = CommonConstant.websocketId;
          WorkbenchService.websocketId = CommonConstant.websocketId;
          (callback) && (callback.call(this));
        });
      } catch (e) {
        console.log(e);
      }
    });
  } // function - webSocketCheck

  public ngOnDestroy() {
    super.ngOnDestroy();

    if( this._splitVertical ) {
      this._splitVertical.destroy();
      this._splitVertical = undefined;
    }
    this._deactiveHorizontalSlider();

    if (this._gridScrollEvtSub) {
      this._gridScrollEvtSub.unsubscribe();
      this._gridScrollEvtSub = undefined;
    }

    // this.webSocketCheck(() => {});
    (this._subscription) && (this._subscription.unsubscribe());     // Socket 응답 해제

    // (this.timer) && (clearInterval(this.timer));

    // save info
    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) !== '') {
      CommonConstant.stomp.publish(
        {
          destination: '/message/workbench/' + this.workbenchId + '/dataconnections/' + this.workbench.dataConnection.id + '/disconnect',
          headers: {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)}
        }
      );

      // 이전에 선택된 Query tab 저장
      if (!isUndefined(this.selectedEditorId) && !StringUtil.isEmpty(this.getLocalStorageQuery(this.selectedEditorId))) {
        const queryEditor: QueryEditor = new QueryEditor();
        queryEditor.editorId = this.selectedEditorId;
        queryEditor.name = this.textList[this.selectedTabNum]['name'];
        queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
        // queryEditor.order = this.tabNum;
        queryEditor.order = this.textList[this.selectedTabNum].order;
        // queryEditor.query = this.getSelectedTabText();
        queryEditor.query = this.getLocalStorageQuery(this.selectedEditorId);

        this.workbenchService.updateQueryEditor(queryEditor)
          .then(() => {
            this.loadingHide();
            this.removeLocalStorage(this.selectedEditorId);   // 로컬 스토리지에 저장된 쿼리 제거
          })
          .catch(() => {
            this.loadingHide();
          });
        // 저장 종료
      }
    }
  }

  /**
   * 윈도우 리사이즈 이벤트 처리
   */
  @HostListener('window:resize', ['$event'])
  protected onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this.onEndedResizing();
    }, 500);
  } // function - onResize

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Open Table Schema
   * @param data
   */
  public openTableSchema(data: { dataconnection: any, selectedTable: string, top: number, websocketId: string }) {
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query ddp-tablepop';
    this.tableSchemaParams = data;
    this.isOpenTableSchema = true;
    if (this._splitHorizontal) {
      const leftWidthRatio: number = (500 / $(document).width()) * 100;
      const currSizes = this._splitHorizontal.getSizes();
      if (leftWidthRatio > currSizes[0]) {
        this._splitHorizontal.setSizes([leftWidthRatio, 100 - leftWidthRatio]);
      }
    }
  } // function - openTableSchema

  /**
   * Close Table Schema
   */
  public closeTableSchema() {
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query';
    this.isOpenTableSchema = false;
    const leftWidthRatio: number = ($('.ddp-view-benchlnb').width() / $(document).width()) * 100;
    this._splitHorizontal.setSizes([leftWidthRatio, 100 - leftWidthRatio]);
  } // function - closeTableSchema

  /**
   * local storage 에 쿼리 저장
   * @param {string} value
   * @param {string} editorId
   */
  public saveLocalStorage(value: string, editorId: string): void {
    localStorage.setItem('workbench' + this.workbenchId + editorId, value);
  }

  /**
   * local storage 에 저장된 쿼리 제거
   * @param {string} editorId
   */
  public removeLocalStorage(editorId: string): void {
    localStorage.removeItem('workbench' + this.workbenchId + editorId);
  }

  /**
   * local storage 에 저장된 쿼리 불러오기
   * @param {string} editorId
   * @returns {string}
   */
  public getLocalStorageQuery(editorId: string) {
    return localStorage.getItem('workbench' + this.workbenchId + editorId);
  }

  /**
   * local storage 에 기본정보 저장
   */
  public saveLocalStorageGeneral(): void {
    const saveObj: any = {};
    saveObj.tabId = this.selectedTabNum;
    saveObj.schema = this.workbench.dataConnection.database;
    localStorage.setItem('workbench-general-' + this.workbenchId, JSON.stringify(saveObj));
  }

  public saveLocalStorageGeneralSchema(): void {
    const saveObj: any = {};
    const generalConnection: any = this.getLocalStorageGeneral();
    if (generalConnection !== null) {
      if (!isUndefined(generalConnection.tabId)) {
        this.selectedTabNum = generalConnection.tabId;
        saveObj.tabId = this.selectedTabNum;
      }
      if (!isUndefined(generalConnection.schema)) {
        this.workbench.dataConnection.database = generalConnection.schema;
        saveObj.schema = this.workbench.dataConnection.database;
      }
      localStorage.setItem('workbench-general-' + this.workbenchId, JSON.stringify(saveObj));
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * local storage 에 저장된 기본정보 제거
   */
  public removeLocalGeneral(): void {
    localStorage.removeItem('workbench-general-' + this.workbenchId);
  }

  /**
   * local storage 에 저장된 기본정보 불러오기
   * @returns {string}
   */
  public getLocalStorageGeneral() {
    return JSON.parse(localStorage.getItem('workbench-general-' + this.workbenchId));
  }

  /**
   * 로그인 완료
   * @param param
   */
  public loginComplete(param) {
    // this.workbench = this.workbenchTemp;
    this.websocketId = CommonConstant.websocketId;
    this.webSocketLoginId = param.id;
    this.webSocketLoginPw = param.pw;
    //
    WorkbenchService.websocketId = CommonConstant.websocketId;
    WorkbenchService.webSocketLoginId = param.id;
    WorkbenchService.webSocketLoginPw = param.pw;
    this.readQuery(this.workbenchTemp.queryEditors);

    //TODO The connection has not been established error
    try {
      this.webSocketCheck(() => {
      });
    } catch (e) {
      console.log(e);
    }
  } // function - loginComplete

  /**
   * 새로운 에디터 만들기
   * @param {string} text
   * @param {boolean} selectedParam
   */
  public createNewEditor(text: string = '', selectedParam: boolean = true) {

    const cntEditorTabs: number = this.textList.length;
    const currMaxIndex =
      this.textList.reduce((acc: number, curr: any) => {
        return _.max([acc, isNullOrUndefined(curr.index) ? 0 : curr.index]);
      }, cntEditorTabs);

    const queryEditor: QueryEditor = new QueryEditor();
    queryEditor.name = this.translateService.instant('msg.bench.ui.tab-prefix') + ' ' + (currMaxIndex + 1);
    queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
    queryEditor.order = currMaxIndex;
    queryEditor.query = '';

    this.loadingShow();
    this.workbenchService.createQueryEditor(queryEditor)
      .then((data) => {
        this.loadingHide();
        // 탭 추가
        this.textList.push({
          selected: selectedParam,
          name: queryEditor.name,
          query: text === '' ? '' : text,
          editorId: data.id,
          index: data.index,
          editorMode: false
        });
        // 슬라이드 아이콘 show hide
        this._calculateEditorSlideBtn();
        // 로컬 스토리지에 저장하기 위해
        this.selectedTabNum = this.textList.length - 1;
        this.saveLocalStorageGeneral();
        // 끝
        // 탭 변경
        this.tabChangeHandler(this.textList.length - 1, false);
      })
      .catch((error) => {
        this.loadingHide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });

  } // function - createNewEditor

  /**
   * 탭 닫기
   * @param tabNum
   */
  public closeEditorTab(tabNum) {
    // 탭이 하나라면
    if (this.textList.length === 1) {
      Alert.warning(this.translateService.instant('msg.bench.alert.close.editortab.fail'));
      return;
    }

    // 해당 tab 삭제.
    this.workbenchService.deleteQueryEditor(this.textList[tabNum]['editorId'])
      .then(() => {
        // 삭제 성공.
      })
      .catch((error) => {
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });

    // 탭 삭제
    this.textList.splice(tabNum, 1);
    // 슬라이드 아이콘 show hide
    this._calculateEditorSlideBtn(true);

    // 탭 번호 낮추기
    if (this.textList.length === 1) {
      this.selectedTabNum = 0;
    } else {
      if (this.textList.length <= tabNum) {
        this.selectedTabNum = this.textList.length - 1;
      } else {
        this.selectedTabNum = tabNum;
      }
    }

    // 탭이 하나라도 존재한다면
    if (this.textList.length > 0) {
      // 첫번재 탭을 선택상태로 변경
      // this.tabChangeHandler(this.selectedTabNum, true);
      this._saveAllQueryEditor();
      // 탭 첫번째로 초기화
      for (let index: number = 0; index < this.textList.length; index = index + 1) {
        // 선택된 탭이면
        if (index === 0) {
          this.textList[index]['selected'] = true;
          this.selectedTabNum = index;
          this.selectedEditorId = this.textList[index]['editorId'];
          this.setSelectedTabText(this.textList[index]['query']);
          this.selectedTabNum = index;
        } else {
          // 선택되지 않은 탭이면
          this.textList[index]['selected'] = false;
        }
      }

      // 그리드 재정렬
      const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
      if (0 < currentEditorResultTabs.length) {
        this.drawGridData();
      }
    }
    this.saveLocalStorageGeneral();
  } // function - closeEditorTab

  // 편집 모드 종료
  public tabLayerBlur(item, $event) {
    if (item['editorMode']) {
      this.tabLayerEnter($event);
    }
  }

  /**
   * end editing for editor tab name
   * @param $event
   */
  public tabLayerEnter($event) {
    if ($event.target.value == '') {
      Alert.warning(this.translateService.instant('msg.bench.ui.query.tab.title'));
    } else {
      this.textList[this.selectedTabNum]['editorMode'] = false;
      this.textList[this.selectedTabNum]['name'] = $event.target.value;

      // 변경된 쿼리 이름 저장
      // 저장할 객체
      const queryEditor: QueryEditor = new QueryEditor();
      queryEditor.editorId = this.textList[this.selectedTabNum].editorId;
      queryEditor.name = this.textList[this.selectedTabNum].name;
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = this.textList[this.selectedTabNum].order;
      queryEditor.query = this.textList[this.selectedTabNum].query;
      this.workbenchService.updateQueryEditor(queryEditor)
        .then(() => {
          // 로컬 스토리지에서 쿼리 삭제
          this.removeLocalStorage(queryEditor.editorId);
          // 그리드 이름 변경
          this.totalResultTabList.forEach((item, index) => {
            if (item.editorId === this.selectedEditorId) {
              item.name = this._genResultTabName(this.textList[this.selectedTabNum].name, 'RESULT', (index + 1));
            }
          });
        })
        .catch((error) => {
          this.loadingHide();
          if (!isUndefined(error.details)) {
            Alert.error(error.details);
          } else {
            Alert.error(error);
          }
        });
    }
  } // function - tabLayerEnter

  /**
   * close data tap event handler
   * @param tabId
   */
  public closeResultTab(tabId: string) {

    let currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();

    if (currentEditorResultTabs.length === 1) {
      // Alert.warning('결과 탭을 닫을수 없습니다.');
      this._removeResultTab(tabId);
      this.gridSearchClear();
      return;
    }

    // 결과창 검색어 초기화
    this.gridSearchClear();

    let removeIdx: number = currentEditorResultTabs.findIndex(item => item.id === tabId);

    // 탭 삭제
    this._removeResultTab(tabId);

    // show index 가 0이라면 icon flag 재계산
    if (this.editorResultListObj.index === 0) {
      // 변경이 다 일어났을 때
      this.safelyDetectChanges();
      this.editorResultListObj.showBtnFl = this._isEditorResultMaxWidth();
    }

    currentEditorResultTabs = this._getCurrentEditorResultTabs();
    if (currentEditorResultTabs.length > 0) {
      let targetIdx: number = removeIdx - 1;
      (0 > targetIdx) && (targetIdx = 0);
      let showTabInfo: ResultTab = currentEditorResultTabs[targetIdx];
      this.changeResultTabHandler(showTabInfo.id);
    }
  } // function - closeResultTab

  /**
   * change editor tab
   * @param {number} selectedTabNum
   * @param {boolean} deleteFlag
   * @param selectedItem
   */
  public tabChangeHandler(selectedTabNum: number, deleteFlag: boolean = false, selectedItem?: any): void {

    // 이전에 선택된 Query tab 저장
    if (!isUndefined(this.selectedEditorId) && deleteFlag === false) {
      // 로컬 스토리지에 선택된 tab 순번과 schema 저장
      const queryEditor: QueryEditor = new QueryEditor();
      const selectedTabIndex = _.findIndex(this.textList, (obj) => {
        return obj.selected
      });
      queryEditor.editorId = this.selectedEditorId;
      // queryEditor.name = this.textList[this.selectedTabNum]['name'];
      queryEditor.name = this.textList[selectedTabIndex]['name'];
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      // queryEditor.order = this.textList[selectedTabIndex]['queryTabNum'];//this.tabNum;
      queryEditor.order = selectedTabIndex;
      // queryEditor.query = this.getSelectedTabText();
      queryEditor.query = this.textList[selectedTabIndex]['query'];

      this.workbenchService.updateQueryEditor(queryEditor)
        .then(() => {
          // this.loadingHide();
          // 로컬 스토리지에서 쿼리 삭제
          // this.removeLocalStorage(queryEditor.editorId);
        })
        .catch((error) => {
          // this.loadingHide();
          if (!isUndefined(error.details)) {
            Alert.error(error.details);
          } else {
            Alert.error(error);
          }
        });
      // 저장 종료
    }

    if (selectedItem && selectedItem['selected'] && selectedItem['editorMode']) {
      return;
    }

    for (let index: number = 0; index < this.textList.length; index = index + 1) {
      // 선택된 탭이면
      if (index === selectedTabNum) {
        this.textList[index]['selected'] = true;
        this.selectedTabNum = index;
        this.selectedEditorId = this.textList[this.selectedTabNum]['editorId'];
        this.setSelectedTabText(this.textList[this.selectedTabNum]['query']);
        this.selectedTabNum = index;
      } else {
        // 선택되지 않은 탭이면
        this.textList[index]['selected'] = false;
      }
    }

    this.safelyDetectChanges(); // 변경값 반영

    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();

    // 에디터 결과 슬라이드 버튼 계산
    this._calculateEditorResultSlideBtn(true);


    // 그리드 있을때만
    if (currentEditorResultTabs.length > 0) {

      // 로그 숨김 처리
      currentEditorResultTabs.forEach(item => item.showLog = false);

      // 선택된 결과 탭 정보 조회
      let resultTab = currentEditorResultTabs.find(tabItem => tabItem.selected);
      if (!resultTab) {
        resultTab = currentEditorResultTabs[0];
        resultTab.selected = true;
      }

      // 결과 탭 변경
      this.changeResultTabHandler(resultTab.id);

    }
    if (selectedItem) {
      this.saveLocalStorageGeneral();
    }
  } // function - tabChangeHandler

  /**
   * show result tab tooltip
   * @param {MouseEvent} event
   * @param {number} idx
   */
  public showResultTabTooltip(event: MouseEvent, idx: number) {
    event.stopPropagation();

    const resultTab = 'LI' === event.target['tagName'] ? $(event.target) : $(event.target).closest('li');
    (this._tooltipTimer) && (clearTimeout(this._tooltipTimer));
    if (resultTab.offset().left > $(window).outerWidth() / 2) {
      this._tooltipTimer = setTimeout(() => {
        resultTab.find('.ddp-box-tabs-popup').show().css({
          'right': '-10px',
          'left': 'inherit'
        });
      }, 1500);
    } else {
      this._tooltipTimer = setTimeout(() => {
        resultTab.find('.ddp-box-tabs-popup').show();
      }, 1500);
    }

  } // function - showResultTooltip

  /**
   * hideResultTabTooltip
   */
  public hideResultTabTooltip(event: MouseEvent) {
    event.stopPropagation();
    if (this._tooltipTimer) {
      clearTimeout(this._tooltipTimer);
      this._tooltipTimer = null;
    }
    setTimeout(() => {
      (this.isFocusResultTooltip) || ($('.ddp-box-tabs-popup:visible').hide());
    }, 500);
  } // function - hideResultTabTooltip

  /**
   * Change result tab
   * @param {string} selectedTabId
   */
  public changeResultTabHandler(selectedTabId: string) {

    this.hideResultButtons = false;

    let selectedTab: ResultTab = null;
    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    currentEditorResultTabs.forEach((tabItem: ResultTab) => {
      // 선택된 탭이면
      if (tabItem.id === selectedTabId) {

        tabItem.selected = true;

        if (isNullOrUndefined(tabItem.result)) {
          tabItem.showLog = true;
        } else {
          tabItem.showLog = false;
          // 중지된 탭의 경우 체크
          if (isNullOrUndefined(tabItem.result.data)) {
            $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
          }
        }
        selectedTab = tabItem;

      } else {
        // 선택되지 않은 탭이면
        tabItem.selected = false;
      }
    });

    (selectedTab.showLog) || (this.drawGridData());

    this.safelyDetectChanges();

  } // function - changeResultTabHandler

  /**
   * editor key input event handler
   * @param event
   * @return {boolean}
   */
  public editorKeyEvent(event) {
    // 쿼리 실행.
    if (event.ctrlKey && event.keyCode === 13) {
      this.checkFooterPopup();
      this.setExecuteSql('SELECTED');
      return;
    }

    if (event.ctrlKey && event.keyCode === 81) {
      this.clearSql();
      return;
    }

    if (event.ctrlKey && event.keyCode === 190) {
      this.setSqlFormatter();
      return;
    }

    if (event.altKey && event.keyCode === 13) {
      this.checkFooterPopup();
      this.setExecuteSql('ALL');
      return;
    }

    // 현재 저장된 쿼리랑 다를때
    const saveQuery: string = this.getLocalStorageQuery(this.selectedEditorId);
    const currQuery: string = this.getSelectedTabText();
    if (this.textList.length !== 0 && saveQuery !== currQuery) {
      if (saveQuery && currQuery
        && saveQuery.replace(/\s/gi, '') !== currQuery.replace(/\s/gi, '')) {
        this.useUnloadConfirm = true;
      }
      // 쿼리 저장
      this.textList[this.selectedTabNum]['query'] = currQuery;
      // 로컬 스토리지에 쿼리에 저장
      this.saveLocalStorage(currQuery, this.textList[this.selectedTabNum]['editorId']);
    }
  } // function - editorKeyEvent

  /**
   * editor contents change event handler
   * @param {string} param
   */
  public editorTextChange(param: string) {
    this.textList[this.selectedTabNum]['query'] = param;
  } // function - editorTextChange

  /**
   * open or close left Menu
   */
  public leftMenuOpen() {
    this.isLeftMenuOpen = !this.isLeftMenuOpen;

    this._toggleHorizontalSlider();

    // 아이콘 슬라이드 버튼 계산
    this._calculateEditorSlideBtn();
    this._calculateEditorResultSlideBtn();
  } // function - leftMenuOpen

  /**
   * open or cloe data connection info layer
   */
  public dataConnectionInfoShow(event: MouseEvent) {

    this.isDataConnectionInfoShow = !this.isDataConnectionInfoShow;
    this.safelyDetectChanges();

    const target = $(event.target);
    let infoLeft: number = target.offset().left;
    let infoTop: number = target.offset().top;
    const element = document.getElementById(`dataConnectionInfo`);
    $(element).css({'left': infoLeft - 30, 'top': infoTop + 17});

  } // function - dataConnectionInfoShow

  /**
   * set init database
   * @param $event
   */
  public setInitDatabase($event) {
    // database 변경
    const generalConnection: any = this.getLocalStorageGeneral();
    if (generalConnection !== null) {
      if (!isUndefined(generalConnection.tabId)) {
        this.selectedTabNum = generalConnection.tabId;
      }
      if (!isUndefined(generalConnection.schema)) {
        this.workbench.dataConnection.database = generalConnection.schema;
      } else {
        this.workbench.dataConnection.database = $event;
      }
    } else {
      this.workbench.dataConnection.database = $event;
    }

    this.tableParam = {
      dataconnection: this.workbench.dataConnection,
      webSocketId: this.websocketId
    };

    // user 정보 체크
    this.setUserInfoTableParam();

    // 보고있는 schemalayer hide
    this.closeEvent = {name: 'closeSchema'};
  } // function - setInitDatabase

  /**
   * change database and dataset
   * @param $event
   */
  public setChangeDatabase($event) {
    this.workbench.dataConnection.database = $event;
    this.tableParam = {
      dataconnection: this.workbench.dataConnection,
      webSocketId: this.websocketId
    };

    // user 정보 체크
    this.setUserInfoTableParam();

    this.saveLocalStorageGeneralSchema();
    // 보고있는 schemalayer hide
    this.closeEvent = {name: 'closeSchema'};
  } // function - setChangeDatabase

  /**
   * 우측 패널 구성 - 첫번쨰 : 글로벌 변수 선언
   */
  public openGlobalVariableMenu() {
    this.isGlobalVariableMenuShow = !this.isGlobalVariableMenuShow;
    this.isNavigationMenuShow = false;
    // this.isWorkbenchOptionShow = false;
  }

  /**
   * 우측 패널 구성 - 세번째 : 네비게이션
   */
  public openNavigationMenu() {
    this.isNavigationMenuShow = !this.isNavigationMenuShow;
    this.isGlobalVariableMenuShow = false;
  }

  /**
   * 우측 패널 구성 - 워크밴치 옵션 레이어 toggle
   */
  public showOption() {
    this.isWorkbenchOptionShow = !this.isWorkbenchOptionShow;
  }

  /**
   * 팝업 구성 - 쿼리 히스토리 리스트
   */
  public openQueryHistoryMenu() {
    this.isQueryHistoryMenuShow = !this.isQueryHistoryMenuShow;
    this.shortcutsFl = false;
    this.isQueryHistoryDelete = false;
  }

  /**
   * 팝업 구성 -  워크벤치 에디터 단축키 보기 팝업
   */
  public openShowShortcutsMenu() {

    this.shortcutsFl = !this.shortcutsFl;
    this.isQueryHistoryMenuShow = false;
  }

  /**
   * 하단 팝업 닫힘 체크
   */
  public checkFooterPopup() {

    if (this.isFootAreaPopupCheck || this.isQueryHistoryLogPopup || this.isQueryHistoryDeletePopup) {
      this.isFootAreaPopupCheck = false;
      return false;
    }
    this.shortcutsFl = false;
    this.isQueryHistoryMenuShow = false;

  }

  /**
   * Execute Query
   * @param {string} param
   */
  public setExecuteSql(param: string) {

    if (this.isExecutingQuery) {
      Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
      return;
    }

    if (this.getSelectedTabText().trim() === '') {
      Alert.warning(this.translateService.instant('msg.bench.alert.execute.query'));
      this.isExecutingQuery = false;
      return;
    }

    this.loadingBar.show();
    this._executeSqlReconnectCnt++; // 호출횟수 증가

    // 호출 정보 초기화
    this.isExecutingQuery = true;
    this.executeTabIds = [];
    this.isCanceling = false;
    this.isCanceled = false;
    this.executeEditorId = this.selectedEditorId;
    this.editorResultListObj = new EditorList();
    this._clearCurrentEditorResultTabs();

    // console.info('%c >>>>>> this.executeEditorId', 'color:#FF0000', this.executeEditorId);

    this.allQuery = param;

    const queryEditor: QueryEditor = new QueryEditor();
    let runningQuery: string = '';
    {
      // 실행 후 바로 탭 이동이 되는 경우가 있으므로, 서비스 호출 전에 에디터 정보를 설정한다.
      queryEditor.name = this.textList[this.selectedTabNum]['name'];
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = this.selectedTabNum;
      queryEditor.query = this.getSelectedTabText();      // 전체 쿼리 저장
      queryEditor.webSocketId = this.websocketId;
      queryEditor.editorId = this.textList[this.selectedTabNum]['editorId'];

      // 실행 쿼리 찾기
      if (param === 'ALL') {
        runningQuery = this.getSelectedTabText();
      } else if (param === 'SELECTED') {
        if (this.getSelectedSqlTabText().trim() === '') {
          this.editor.getFocusSelection();
          if (this.getSelectedSqlTabText().trim() === '') {
            Alert.info(this.translateService.instant('msg.bench.alert.no.selected.query'));
            this.isExecutingQuery = false;
            this.loadingBar.hide();
            return;
          }
          runningQuery = this.getSelectedSqlTabText();
        } else {
          runningQuery = this.getSelectedSqlTabText();
        }
      }
    }

    this.workbenchService.checkConnectionStatus(this.textList[this.selectedTabNum]['editorId'], this.websocketId)
      .then((result) => {
        // 호출횟수 초기화
        this._executeSqlReconnectCnt = 0;

        if (result === 'RUNNING' || result === 'CANCELLED') {
          Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
          this.isExecutingQuery = false;
          this.loadingBar.hide();
          return;
        } else {

          // this.loadingBar.show();
          this.workbenchService.updateQueryEditor(queryEditor)
            .then(() => {
              // this.loadingBar.hide();
              // 로컬 스토리지에 저장된 쿼리 제거
              // this.removeLocalStorage(this.selectedEditorId);

              // 전체 query data 생성
              let queryStrArr: string[]
                = runningQuery.replace(/--.*/gmi, '').split(';').filter(item => !/^\s*$/.test(item));

              if (0 === queryStrArr.length) {
                Alert.warning(this.translateService.instant('msg.bench.alert.execute.query'));
                this.isExecutingQuery = false;
                this.loadingBar.hide();
                return;
              }

              this.currentRunningIndex = 0;
              queryStrArr.forEach((sqlStr: string, idx: number) => {
                queryEditor.query = sqlStr;
                const executeTab = new ResultTab(this.executeEditorId, _.cloneDeep(queryEditor), sqlStr, idx + 1);
                executeTab.selected = (0 === idx);
                this._appendResultTab(executeTab);
                this.executeTabIds.push(executeTab.id);
              });

              this.safelyDetectChanges();
              this.runQueries(this.executeTabIds[0]);

            })
            .catch(() => {
              this.loadingBar.hide();
            });
        }
      })
      .catch((error) => {
        this.isExecutingQuery = false;
        this.loadingBar.hide();
        if (!isUndefined(error.details) && this._executeSqlReconnectCnt <= 5) {
          this.webSocketCheck(() => {
            this.setExecuteSql(param);
          });
        } else {
          // count 초기화
          this._executeSqlReconnectCnt = 0;
          Alert.error(error.message);
        }
      });

  } // function - setExecuteSql

  /**
   * run query
   * @param {string} resultTabId
   * @param {boolean} retry
   */
  public runQueries(resultTabId: string, retry: boolean = false) {
    const resultTab: ResultTab = this._getResultTab(resultTabId);
    const additionalParams = {
      runIndex: this.currentRunningIndex,
      retryQueryResultOrder: retry ? resultTab.order : null
    };

    resultTab.queryEditor.webSocketId = this.websocketId;
    resultTab.initialize();
    resultTab.executeTimer();
    this.runningResultTabId = resultTab.id;
    this.hideResultButtons = false;

    this.workbenchService.runSingleQueryWithInvalidQuery(resultTab.queryEditor, additionalParams)
      .then((result) => {
        this.loadingBar.hide();

        try {
          (0 < result.length) && (this.setResultContents(result[0], resultTab));
        } catch (err) {
          console.error(err);
        }
      })
      .catch(error => {

        if (this.isCanceling) {
          Alert.error(this.translateService.instant('msg.bench.alert.log.cancel.error'));
          this.loadingBar.hide();
          this.afterCancelQuery(false);
        } else {
          resultTab.setResultStatus('FAIL');
          resultTab.name = this._genResultTabName(resultTab.queryEditor.name, 'ERROR', resultTab.order);
          if (error.message && error.details) {
            resultTab.message = error.message + ' - ' + error.details;
          } else {
            resultTab.message = 'Workbench Error - Query is Fail';
          }
          this._calculateEditorResultSlideBtn();
          this._doneOrNextExecute();
        }

      });
  } // function - runQueries

  /**
   * query 재실행
   * @param {ResultTab} item
   */
  public retryQuery(item: ResultTab) {

    this.isExecutingQuery = true;
    this.isCanceling = false;
    this.isCanceled = false;
    this.executeTabIds = [];
    this.executeEditorId = item.editorId;

    this.workbenchService.checkConnectionStatus(item.editorId, this.websocketId)
      .then((result) => {
        // 호출횟수 초기화
        this._executeSqlReconnectCnt = 0;

        if (result === 'RUNNING' || result === 'CANCELLED') {
          Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
          this.isExecutingQuery = false;
          this.loadingBar.hide();
          return;
        } else {
          this.currentRunningIndex = 0;
          this.safelyDetectChanges();

          this.executeTabIds = [item.id];
          this.runQueries(item.id, true);
        }
      })
      .catch((error) => {
        this.isExecutingQuery = false;
        this.loadingBar.hide();
        if (!isUndefined(error.details) && this._executeSqlReconnectCnt <= 5) {
          this.webSocketCheck(() => {
            this.retryQuery(item);
          });
        } else {
          this._executeSqlReconnectCnt = 0;
          Alert.error(error);
        }
      });
  } // function - retryQuery

  /**
   * query 결과 페이징 API 호출
   * @param {ResultTab} targetTab
   * @param {"PREV" | "NEXT"} direction
   */
  public changeResultPage(targetTab: ResultTab, direction: 'PREV' | 'NEXT') {

    this.loadingBar.show();
    this.safelyDetectChanges();

    let editorId = targetTab.editorId;
    let csvFilePath = targetTab.result.csvFilePath;
    let fieldList = targetTab.result.fields;

    if (direction == 'PREV') {
      targetTab.pageNum--;
    } else {
      targetTab.pageNum++;
    }

    this.workbenchService.runQueryResult(editorId, csvFilePath, targetTab.result.defaultNumRows, targetTab.pageNum, fieldList)
      .then((result) => {
        try {
          // 쿼리 결과 값으로 교체
          targetTab.result.data = result;
          // 그리드 표시
          this.drawGridData();
        } catch (err) {
          console.error(err);
        }
        setTimeout(() => this.loadingBar.hide(), 500);
      })
      .catch(error => {
        this.loadingBar.hide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });
  } // function - changeResultPage

  /**
   * 에디터 풀 사이즈처리
   */
  public resizeQueryEditor() {
    this.isQueryEditorFull = !this.isQueryEditorFull;

    const element = $('html');
    (this.isQueryEditorFull ? element.addClass('ddp-width-auto') : element.removeClass('ddp-width-auto'));

    this._toggleHorizontalSlider();
    this.onEndedResizing();
  } // function - resizeQueryEditor

  /**
   * 선택한 탭에 대한 SQL Clear
   */
  public clearSql() {
    this.checkFooterPopup();
    this.setSelectedTabText('');
    // 쿼리 저장
    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    // 로컬 스토리지에 쿼리에 저장
    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
  } // function - clearSql

  /**
   * confirmDelete
   */
  public confirmDelete() {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.ui.wb.del');
    modal.description = this.translateService.instant('msg.bench.ui.wb.del.description');

    this.deleteModalComponent.init(modal);

  } // function - confirmDelete

  /**
   * Delete Workbench
   * @param isLoad
   */
  public deleteWorkBench(isLoad?) {
    if (isLoad) this.loadingShow();
    this.workbenchService.deleteWorkbench(this.workbenchId).then(() => {
      Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
      this.loadingHide();
      this.router.navigate(['/workspace']).then();
    }).catch((error) => {
      this.loadingHide();
      if (!isUndefined(error.details)) {
        Alert.error(error.details);
      } else {
        Alert.error(error);
      }
    });
  } // function - deleteWorkBench

  /**
   * update workbench name or description
   */
  public updateWorkbench() {
    if (this.workbenchName.trim() === '' || this.workbenchName === '') {
      Alert.warning(this.translateService.instant('msg.comm.ui.create.name'));
      return;
    }

    if (CommonUtil.getByte(this.workbenchName) > 150) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.len'));
      return;
    }

    if (!StringUtil.isEmpty(this.workbenchDesc) && CommonUtil.getByte(this.workbenchDesc) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }

    this.workbenchDesc ? this.workbenchDesc = this.workbenchDesc.trim() : null;
    this.workbenchName = this.workbenchName.trim();

    const params = {
      id: this.workbench.id,
      name: this.workbenchName,
      description: this.workbenchDesc
    };

    this.loadingShow();
    this.workbenchService.updateWorkbench(params)
      .then((workbench: Workbench) => {
        this.loadingHide();
        this.workbenchTemp = workbench;
        this.isWorkbenchNameEditMode = false;
        this.isWorkbenchDescEditMode = false;
        this.wbName.nativeElement.blur();
        this.wbDesc.nativeElement.blur();
      })
      .catch((error) => {
        this.loadingHide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });
  } // function - updateWorkbench

  /**
   * 결과창 검색어 초기화
   */
  public gridSearchClear(): void {
    this.searchText = '';
    (this.gridComponent) && (this.gridComponent.search(this.searchText));
  } // function - gridSearchClear

  /**
   * 그리드 검색 실행
   * @param {KeyboardEvent} event
   */
  public gridSearch(event: KeyboardEvent): void {

    // 키 코드가 escape 이라면
    if (27 === event.keyCode) {
      // 결과창 검색어 초기화
      this.gridSearchClear();
    }

    // 그리드가 생성되어 있지 않은 경우 return;
    if (typeof this.gridComponent === 'undefined') {
      return;
    }

    // 그리드 검색 함수 호출
    this.gridComponent.search(this.searchText);
  } // function - gridSearch

  // 에디터 컴포넌트에 TABLE SQL 주입
  public sqlIntoEditorEvent(tableSql: string): void {

    // 선택되어 있는 탭에 텍스트가 없다면
    // if (StringUtil.isEmpty(this.getSelectedTabText())) {
    //   // 선택된 탭 에디터에 TABLE SQL 주입
    //   this.setSelectedTabText(tableSql);
    // } else {
    // 에디터 포커싱 위치에 SQL 주입
    this.editor.insert(tableSql);

    // 사용중인 쿼리 저장 여부 체크
    this.checkSaveQuery();
    // 쿼리 저장
    // this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    // // 로컬 스토리지에 쿼리에 저장
    // this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
    // }
  }

  // 에디터 컴포넌트에 COLUMN NAME 주입
  public columnIntoEditorEvent(tableSql: string): void {

    // 에디터 포커싱 위치에 SQL 주입
    this.editor.insertColumn(tableSql);

    // 사용중인 쿼리 저장 여부 체크
    this.checkSaveQuery();
  }

  /**
   * 쿼리 히스토리 로그 팝업 - fail 일 경우에만
   */
  public sqlQueryPopupEvent(item: any) {

    this.isQueryHistoryLogPopup = true;
    this.queryHistoryItem = item;

  }

  /**
   * 쿼리 히스토리 삭제 팝업
   */
  public deleteQueryHistory() {

    this.isQueryHistoryDelete = true;
    this.isQueryHistoryDeletePopup = false;

  }

  /**
   * 패널 사이즈 변경 - 드래그 한 후 사용자가 구분 기호를 놓을 때 발생
   */
  public onEndedResizing(): void {

    this.safelyDetectChanges();

    // 에디터의 높이 값 구하기
    const editorHeight = this.getEditorComponentElementHeight();

    // 에디터 리사이징 호출
    this.editor.resize(editorHeight);

    if (typeof this.gridComponent !== 'undefined'
      && typeof this.gridComponent.dataView !== 'undefined'
      && this.gridComponent.dataView.getItems().length > 0) {

      // 그리드 높이 값 변경 함수 호출
      this.gridComponent.resize();
    }

    // 에디터 슬라이드 계산
    this._calculateEditorSlideBtn();
    this._calculateEditorResultSlideBtn();

  } // function - onEndedResizing

  // 탭 레이어 보이기
  public setTabLayer($event: Event, index: number): void {

    $event.stopImmediatePropagation();

    const offset: any = document.getElementById(`tabLayer${index}`).getBoundingClientRect();
    this.tabLayer = true;
    this.tabLayerX = `${offset.left}px`;
    this.tabLayerY = `${offset.top + 15}px`;
  }

  public setTabLayerClose() {
    this.tabLayer = false;
  }

  /**
   * 엑셀 다운로드 form 방식
   */
  public downloadExcel(): void {

    const dataGrid: ResultTab = this._getCurrentResultTab();

    // data grid 결과가 없을때 return
    if (isUndefined(dataGrid) || 'SUCCESS' !== dataGrid.resultStatus) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }
    try {
      const that = this;

      const form = document.getElementsByTagName('form');
      const inputs = form[0].getElementsByTagName('input');
      inputs[0].value = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
      inputs[1].value = dataGrid.result.csvFilePath;
      inputs[2].value = 'result_' + Date.now().toString() + '.csv';
      // this.loadingShow();
      this.loadingBar.show();
      const downloadCsvForm = $('#downloadCsvForm');
      downloadCsvForm.attr('action', CommonConstant.API_CONSTANT.API_URL + `queryeditors/${this.selectedEditorId}/query/download/csv`);
      downloadCsvForm.submit();
      this.intervalDownload = setInterval(() => that.checkQueryStatus(), 1000);
    } catch (e) {
      // 재현이 되지 않음.
      console.info('다운로드 에러' + e);
    }
  } // function - downloadExcel


  /**
   * checkQueryStatus
   */
  public checkQueryStatus() {
    // 호출 횟수 증가
    this._checkQueryStatusReconnectCnt++;

    this.workbenchService.checkConnectionStatus(this.selectedEditorId, this.websocketId)
      .then((result) => {
        // 호출 횟수 초기화
        this._checkQueryStatusReconnectCnt = 0;

        if (result === 'IDLE' || result === 'CANCELLED') {
          // this.loadingHide();
          this.loadingBar.hide();
          clearInterval(this.intervalDownload);
        }
      })
      .catch((error) => {
        if (error.detail && this._checkQueryStatusReconnectCnt <= 5) {
          this.webSocketCheck(this.checkQueryStatus);
        } else {
          this.loadingBar.hide();
          clearInterval(this.intervalDownload);
        }
      });
  } // function - checkQueryStatus

  // noinspection JSMethodCanBeStatic
  /**
   * set number format
   * @param {number} num
   * @param {number} float
   * @return {string}
   */
  public setNumberFormat(num: number, float: number = 0): string {

    // 소수점 자리수
    let value: string = String(Math.round(num * (Math.pow(10, float))) / Math.pow(10, float));

    // 천단위 표시여부
    let arrSplitFloatPoint = value.split('.');

    // Decimal Separation
    let floatValue = '';
    if (1 < arrSplitFloatPoint.length) {
      floatValue = arrSplitFloatPoint[1];
    }

    // Thousand units
    value = arrSplitFloatPoint[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Append Decimal
    if ('' !== floatValue) {
      value += '.' + floatValue;
    }

    return value;
  } // function - setNumberFormat

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - 슬라이드 아이콘 관련
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public get visibleResultTabs(): ResultTab[] {
    const resultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    return resultTabs ? resultTabs : [];
  } // function - visibleResultTabs

  public get visibleResultTab(): ResultTab {
    return this._getCurrentResultTab();
  } // function - visibleResultTab

  public get currentRunningTab(): ResultTab {
    return this._getResultTab(this.runningResultTabId);
  } // function - currentRunningTab

  // noinspection JSMethodCanBeStatic
  /**
   * 필터링된 탭 리스트
   * @param list
   * @param {EditorList} listObj
   */
  public getFilteringList(list: any, listObj: EditorList) {
    return list.slice(listObj.index, list.length);
  }

  // noinspection JSMethodCanBeStatic
  /**
   * list에서 index값 계산
   * @param list
   * @param item
   * @returns {number}
   */
  public findIndexInList(list: any, item: any): number {
    return _.findIndex(list, item);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 슬라이드 prev 버튼 클릭 이벤트
   */
  public onClickPrevSlideBtn(listObj: EditorList): void {
    // index 가 0보다 크면 하나 감소
    if (listObj.index > 0) {
      listObj.index--;
      // 아이콘 슬라이드 계산
      listObj === this.editorListObj ? this._calculateEditorSlideBtn() : this._calculateEditorResultSlideBtn();
    }
  }

  /**
   * 슬라이드 next 버튼 클릭 이벤트
   */
  public onClickNextSlideBtn(listObj: EditorList): void {
    // list 가 화면에 꽉 차있고
    // index 가 list 길이보다 작다면 하나 증가
    if ((listObj === this.editorListObj ? this._isEditorMaxWidth() : this._isEditorResultMaxWidth())
      && listObj.index < listObj.list.length - 1) {
      listObj.index++;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기 데이터 조회
   * @param {Function} connectWebSocket
   * @private
   */
  private _loadInitData(connectWebSocket: Function) {

    // 워크벤치 아이디 저장
    // read Workbench With View Projection
    this.workbenchService.getWorkbench(this.workbenchId).then((data) => {
      // 워크벤치 데이터
      WorkbenchService.workbench = data;
      WorkbenchService.workbenchId = this.workbenchId;

      // 퍼미션 조회를 위한 워크스페이스 정보 조회 및 퍼미션 체커 설정
      this._workspaceId = data.workspace.id;
      this.workspaceService.getWorkSpace(data.workspace.id, 'forDetailView').then((workspace: Workspace) => {

        // 퍼미션 체커 정의
        const permissionChecker: PermissionChecker = new PermissionChecker(workspace);

        if (workspace.active && permissionChecker.isViewWorkbench()) {

          // 관리 유저 여부 설정
          this.isChangeAuthUser =
            (permissionChecker.isManageWorkbench() || permissionChecker.isEditWorkbench(data.createdBy.username));

          this.mimeType = data.dataConnection.implementor.toString();
          this.authenticationType = data.dataConnection['authenticationType'] || 'MANUAL';
          if (data.dataConnection['authenticationType'] === 'DIALOG') {
            this.loginLayerShow = true;
            this.workbenchTemp = data;
          } else {
            this.workbenchTemp = data;
            this.readQuery(this.workbenchTemp.queryEditors);
            this.webSocketLoginId = '';
            this.webSocketLoginPw = '';

            // connectWebSocket.call(this);
          }
          connectWebSocket.call(this);

          this.isDataManager = CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_DATASOURCE);

          if (data.dataConnection.supportSaveAsHiveTable) {
            this.supportSaveAsHiveTable = data.dataConnection.supportSaveAsHiveTable;
          }

          this.setWorkbenchName();
          this.setWorkbenchDesc();

        } else {
          // 경고창 표시
          this.openAccessDeniedConfirm();
        }

        // this.restoreQueryResultPreviousState(data.queryEditors);
      });

    }).catch((error) => {
      if (!isUndefined(error.details)) {
        Alert.error(error.details);
      } else {
        Alert.error(error);
      }
    });
  } // function - _loadInitData

  private restoreQueryResultPreviousState(queryEditors: any[]): void {
    if (queryEditors && Array.isArray(queryEditors) && queryEditors.length > 0) {
      const queryResultRequests: Promise<any>[] = this.createQueryResultRequests(queryEditors);
      this.restoreQueryResults(queryResultRequests);
    }
  }

  private createQueryResultRequests(queryEditors: any[]): Promise<any>[] {
    const queryResultPromises: Promise<any>[] = [];
    queryEditors.forEach((editor) => {
      if (editor.queryResults && Array.isArray(editor.queryResults)) {
        editor.queryResults.forEach((queryResult, queryResultIndex) => {
          const promise: Promise<any> = this.workbenchService.runQueryResult(editor.id,
            queryResult.filePath, queryResult.defaultNumRows, 0,
            queryResult.fields);

          const queryEditor: QueryEditor = new QueryEditor();
          queryEditor.editorId = editor.id;
          queryEditor.name = editor.name;
          queryEditor.order = editor.order;
          queryEditor.query = queryResult.query;

          promise['_metadata'] = {
            queryEditor: queryEditor,
            queryResult: {
              order: queryResultIndex + 1,
              fields: queryResult.fields,
              filePath: queryResult.filePath,
              defaultNumRows: queryResult.defaultNumRows,
              numRows: queryResult.numRows
            }
          };
          queryResultPromises.push(promise);
        });
      }
    });

    return queryResultPromises;
  }

  private restoreQueryResults(queryResultRequests: Promise<any>[]): void {
    Promise.all(queryResultRequests.map(p => p.catch(() => undefined)))
      .then((results) => {
        results.forEach((result, index) => {
          const metadata = queryResultRequests[index]['_metadata'];
          const queryEditor: QueryEditor = metadata.queryEditor;
          const tab = new ResultTab(queryEditor.editorId, queryEditor, queryEditor.query, metadata.queryResult.order);
          tab.resultStatus = 'SUCCESS';
          tab.executeStatus = 'DONE';
          tab.errorStatus = 'DONE';
          tab.name = this._genResultTabName(queryEditor.name, 'RESULT', tab.order);
          tab.showLog = false;
          tab.log = [];

          if (result === undefined) {
            const queryResult: QueryResult = new QueryResult();
            tab.result = queryResult;
          } else {
            const queryResult: QueryResult = new QueryResult();
            queryResult.fields = metadata.queryResult.fields;
            queryResult.data = result;
            queryResult.csvFilePath = metadata.queryResult.filePath;
            queryResult.defaultNumRows = metadata.queryResult.defaultNumRows;
            queryResult.numRows = metadata.queryResult.numRows;
            tab.result = queryResult;
          }

          this._appendResultTab(tab);
          this.executeTabIds.push(tab.id);
        });

        this.tabChangeHandler(this.selectedTabNum, false);
      });
  }

  /**
   * 에디터 슬라이드 버튼 계산
   * @param {boolean} indexInit
   * @private
   */
  private _calculateEditorSlideBtn(indexInit: boolean = false): void {
    // 에디터 리스트 객체에 list 전달
    this.editorListObj.list = this.textList;
    // 만약 delete가 일어났을 경우 index가 0으로 초기화
    if (indexInit) {
      // index가 0으로 초기화
      this.editorListObj.index = 0;
    }

    // 길이 계산은 index가 0일 경우에만 계산한다
    if (this.editorListObj.index === 0) {
      // 변경이 다 일어났을 때
      this.changeDetect.detectChanges();
      // 아이콘 버튼 show flag
      this.editorListObj.showBtnFl = this._isEditorMaxWidth();
    }
  } // function - _calculateEditorSlideBtn

  /**
   * 에디터 결과 슬라이드 버튼 계산
   * @param {boolean} indexInit
   * @private
   */
  private _calculateEditorResultSlideBtn(indexInit: boolean = false): void {
    // 에디터 리스트 객체에 list 전달
    this.editorResultListObj.list = this._getCurrentEditorResultTabs();
    // indexInit
    if (indexInit) {
      // index가 0으로 초기화
      this.editorResultListObj.index = 0;
    }

    // 길이 계산은 index가 0일 경우에만 계산한다
    if (this.editorResultListObj.index === 0) {
      // 변경이 다 일어났을 때
      this.changeDetect.detectChanges();
      // 아이콘 버튼 show flag
      this.editorResultListObj.showBtnFl = this._isEditorResultMaxWidth();
    }
  } // function - _calculateEditorResultSlideBtn

  /**
   * 에디터 width가 max인가
   * @returns {boolean}
   * @private
   */
  private _isEditorMaxWidth(): boolean {
    // 현재 생성된 list 의 길이가 최종길이-사이즈버튼 길이보다 크거나 같을때
    return this._editorListTabs.nativeElement.offsetWidth >= (this._editorListMax.nativeElement.offsetWidth - this._editorListSizeBtn.nativeElement.offsetWidth);
  }

  /**
   * 에디터 결과 width가 max인가
   * @returns {boolean}
   * @private
   */
  private _isEditorResultMaxWidth(): boolean {
    // 현재 생성된 list 의 길이가 최종길이 길이보다 크거나 같을때
    return this._editorResultListTabs.nativeElement.offsetWidth >= this._editorResultListMax.nativeElement.offsetWidth;
  }

  /**
   * 모든 쿼리 저장
   * @private
   */
  private _saveAllQueryEditor() {
    const queryPromise = [];
    this.textList.forEach((item, index) => {
      // 저장할 객체
      const queryEditor: QueryEditor = new QueryEditor();
      queryEditor.editorId = item.editorId;
      queryEditor.name = item.name;
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = index;
      queryEditor.query = item.query;
      queryPromise.push(this.workbenchService.updateQueryEditor(queryEditor)
        .then(() => {
          // 로컬 스토리지에서 쿼리 삭제
          // this.removeLocalStorage(queryEditor.editorId);
        })
        .catch((error) => {
          this.loadingHide();
          if (!isUndefined(error.details)) {
            Alert.error(error.details);
          } else {
            Alert.error(error);
          }
        }));
    });
    Promise.all(queryPromise)
      .then(() => {
      })
      .catch((error) => {
        Alert.error(error);
      });
  }

  /**
   * set query result contents ( single query result )
   * @param data
   * @param {ResultTab} resultTab
   */
  private setResultContents(data: any, resultTab: ResultTab) {

    resultTab.result = data;
    resultTab.setResultStatus(data.queryResultStatus);

    if (data.queryResultStatus === 'FAIL') {
      resultTab.name = this._genResultTabName(resultTab.queryEditor.name, 'ERROR', resultTab.order);
      resultTab.message = data.message;
    } else {
      resultTab.name = this._genResultTabName(resultTab.queryEditor.name, 'RESULT', resultTab.order);
    }

    // 에디터 결과 슬라이드 버튼 계산
    this._calculateEditorResultSlideBtn();

    if (this.isCanceling) {
      Alert.success(this.translateService.instant('msg.bench.alert.log.cancel.success'));
      this.loadingBar.hide();
      this.afterCancelQuery(true);
      return;
    }

    // 그리드 표시
    if (this._isEqualRunningVisibleTab()) {
      this.drawGridData();
    }

  } // function - setResultContents

  // 선택된 탭의 텍스트 변경
  private setSelectedTabText(text: string): void {

    // 에디터 텍스트 넣기
    this.editor.setText(text);

    // 에디터 텍스트를 가져와서 로컬 변수에 저장
    this.text = this.getSelectedTabText();

    this.editor.editorFocus();
  }

  // 선택되어 있는 탭안에 전체 텍스트 가져오기
  private getSelectedTabText(): string {

    // 에디터 포커싱
    // this.getEditor().focus();
    // 에디터 텍스트 반환
    return this.editor.value;
  }

  // 선택되어 있는 탭안에 선택한 텍스트 가져오기
  private getSelectedSqlTabText(): string {
    // 에디터 포커싱
    // this.getEditor().focus();
    // 에디터 텍스트 반환
    return this.editor.getSelection();
  }

  /**
   * 쿼리 에디터 Tab 값을 세팅한다.
   * @param {any[]} queryEditors
   */
  private readQuery(queryEditors: any[]) {
    if (queryEditors.length === 0) {
      this.createNewEditor('', true);
    } else {
      const editors = queryEditors.sort((a, b) => {
        return a.order - b.order;
      });
      // 값 읽고 세팅 하기.
      for (let idx1: number = 0; idx1 < editors.length; idx1 = idx1 + 1) {
        this.textList.push({
          name: editors[idx1].name,
          query: editors[idx1].query,
          selected: false,
          editorId: editors[idx1].id,
          index: editors[idx1].index,
          editorMode: false
        });
        this.saveLocalStorage(editors[idx1].query, editors[idx1].id); // 로컬 스토리지에 저장

        const generalConnection: any = this.getLocalStorageGeneral();
        if (generalConnection !== null) {
          if (!isUndefined(generalConnection.tabId)) {
            this.selectedTabNum = generalConnection.tabId;
          }
          if (!isUndefined(generalConnection.schema)) {
            this.workbench.dataConnection.database = generalConnection.schema;
          }
        }
        this.tabChangeHandler(this.selectedTabNum, false)
      }

      // 슬라이드 아이콘 show hide
      this._calculateEditorSlideBtn();
    }
  } // function - readQuery

  /**
   * result toggle button event
   * @param {boolean} showLog
   */
  public toggleLogPanel(showLog: boolean) {

    const currentTab: ResultTab = this._getCurrentResultTab();

    // 로그 표시 설정
    currentTab.showLog = showLog;
    this.safelyDetectChanges();

    // 그리드 표시
    (currentTab.showLog) || (this.drawGridData());
  } // function - toggleLogPanel

  /**
   * 워크벤치 웹 소켓 생성
   * @param {Function} callback
   */
  private createWebSocket(callback?: Function): void {
    const dataConn: Dataconnection = this.workbenchTemp.dataConnection;
    this.workbench = this.workbenchTemp;
    // connection database 정보
    this.workbench.dataConnection.connectionDatabase = dataConn.database;
    this.websocketId = CommonConstant.websocketId;
    this.connTargetImgUrl
      = this.getConnImplementorWhiteImgUrl(dataConn.connectionInformation.implementor, dataConn.connectionInformation.iconResource2);
    try {
      console.info('this.websocketId', this.websocketId);
      const headers: any = {
        'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      };
      // 메세지 수신
      (this._subscription) && (this._subscription.unsubscribe());     // Socket 응답 해제
      this._subscription
        = CommonConstant.stomp.watch('/user/queue/workbench/' + this.workbenchId).subscribe((msg: Message) => {

        const data = JSON.parse(msg.body);

        (this.isCanceling) || (this.loadingBar.hide());

        const resultTabInfo: ResultTab = this._getResultTab(this.runningResultTabId);
        if (1 === this._getResultTabsByEditorId(this.executeEditorId).length) {
          resultTabInfo.selected = true;
        }

        // console.info('>>>>>> socket data', data);
        // console.info('>>>>>> %s - command : %s', this.runningResultTabId, data.command);

        if (!isNullOrUndefined(data.queryIndex)) {

          // log 데이터 그리는 부분, done 인 부분으로 분리
          if ('LOG' === data.command && 0 < data.log.length && resultTabInfo) {

            resultTabInfo.showLog = true;
            data.log.forEach(item => resultTabInfo.appendLog(item));

          } else if ('DONE' === data.command) {

            // 로그 결과가 미리 떨어지는 경우 대비
            const timer = setInterval(() => {
              const runningTab: ResultTab = this._getResultTab(this.runningResultTabId);
              if (runningTab && runningTab.resultStatus) {
                // console.info('>>>>>> %s - clear timer', this.runningResultTabId);
                clearInterval(timer);
                this._doneOrNextExecute();
              }
            }, 500);

          } else if ('LOG' !== data.command && 'GET_CONNECTION' !== data.command) {
            resultTabInfo.setExecuteStatus(data.command);
          } // end if - command log, done

          this.safelyDetectChanges();

          // log data 가 있을경우 scroll 이동
          const $logContainer = $('#workbenchLogText');
          if (this._isEqualRunningVisibleTab() && '' !== $logContainer.text()) {
            let textAreaHeight = $logContainer.height();
            let lineBreakLength = $logContainer.find('br').length;
            let offsetTop = textAreaHeight * (Math.ceil(lineBreakLength / 8));
            $logContainer.scrollTop(offsetTop);
          }
        }

        if (data['connected'] === true) {
          this.databaseParam = {
            dataconnection: dataConn,
            workbenchId: this.workbenchId,
            webSocketId: CommonConstant.websocketId
          };
        }

        if ('CONNECT' == data.command) {
          (callback) && (callback.call(this));
        }

      }, headers);

      // 메세지 발신
      const params = {
        username: this.webSocketLoginId,
        password: this.webSocketLoginPw
      };
      CommonConstant.stomp.publish(
        {
          destination: '/message/workbench/' + this.workbenchId + '/dataconnections/' + dataConn.id + '/connect',
          headers: headers,
          body: JSON.stringify(params)
        }
      );
    } catch (e) {
      console.info(e);
    }

  } // function - createWebSocket

  /**
   * done or next query execute
   * @return {boolean}
   * @private
   */
  private _doneOrNextExecute() {

    const resultTab: ResultTab = this._getResultTab(this.runningResultTabId);

    if (this.isCanceled) {
      this._doneExecuteQueries();
      return false;
    }

    resultTab.doneTimer();

    // 선택된 탭이 로그가 그려지고 있을경우 그리드 전환
    if (this._isEqualRunningVisibleTab()) {
      resultTab.selected = true;
      resultTab.showLog = false;
      this.drawGridData();
    }

    this.currentRunningIndex++;

    // 마지막 쿼리가 아닐경우 다음 쿼리 호출
    if (this.executeTabIds.length > this.currentRunningIndex) {
      resultTab.setExecuteStatus('DONE');
      this.runQueries(this.executeTabIds[this.currentRunningIndex]);
    } else {
      resultTab.setExecuteStatus('DONE');
      this._doneExecuteQueries();
    }

  } // function - _doneOrNextExecute

  /**
   * done execute query
   * @return {boolean}
   */
  public _doneExecuteQueries() {

    const currentTabs: ResultTab[] = this._getResultTabsByEditorId(this.executeEditorId);

    this.isExecutingQuery = false;

    // 처음 쿼리를 취소한 경우
    if (currentTabs.length == 0) {
      return false;
    }

    // finish
    // 시점때문에 변경 안된 tab title 기존 으로 변경
    // currentTabs.forEach((item: ResultTab, idx: number) => {
    //   item.name = this._genResultTabName(this.runningQueryEditor.name, 'RESULT', (idx + 1));
    //   // item.order = idx + 1;
    // });

    this.currentRunningIndex = -1;

    this.safelyDetectChanges();
  } // function - _doneExecuteQueries

  /**
   * 에디터 컴포넌트 래핑 엘리먼트 높이 값 반환
   * @return {number}
   */
  private getEditorComponentElementHeight() {

    // // 에디터 컴포넌트를 감싼 엘리먼트
    const editorWrapElement: Element = this.element.nativeElement
      .querySelector('.ddp-wrap-editor');
    //   .querySelector('.ace_editor');
    //
    // // 에디터 높이
    const editorHeight: number = editorWrapElement.clientHeight;

    // 전체 화면일 경우 계산
    if (this.isQueryEditorFull) {
      const editorFullElement: Element = this.element.nativeElement
        .querySelector('.ddp-ui-query');
      const editorTabElement: Element = this.element.nativeElement
        .querySelector('.ddp-wrap-tabs-edit');

      return editorFullElement.clientHeight - editorTabElement.clientHeight;

    }

    // // 반환
    // return editorHeight;
    return editorHeight;
  } // function - getEditorComponentElementHeight

  /**
   * 그리드 표시
   * @return {boolean}
   */
  private drawGridData() {

    // console.info('>>>>>> %s - drawGridData', this.runningResultTabId);

    this.safelyDetectChanges();

    const currentTab: ResultTab = this._getCurrentResultTab();

    if (isNullOrUndefined(currentTab)) {
      return;
    }
    const data: any = currentTab.result;
    const headers: header[] = [];
    // data fields가 없다면 return
    if (!data || !data.fields) {
      $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
      currentTab.showLog = false;   // 로그 숨김
      this.safelyDetectChanges();
      return false;
    }

    // 순번 필드 설정
    headers.push(
      new SlickGridHeader()
        .Id('WORKBENCH_GRID_SEQ')
        .Name('No.')
        .Field('WORKBENCH_GRID_SEQ')
        .Behavior('select')
        .CssClass('txt-center')
        .Width(60)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .build()
    );

    // 데이터 필드 설정
    for (let index: number = 0; index < data.fields.length; index = index + 1) {
      const temp = data.fields[index].name;
      const columnCnt = temp.length;
      const columnWidth = (7 > columnCnt) ? 80 : (columnCnt * 13.5);
      headers.push(new SlickGridHeader()
        .Id(temp)
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(data.fields[index].type) + '"></em>' + temp + '</span>')
        .Field(temp)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(columnWidth)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .ColumnType(data.fields[index].logicalType)
        .build()
      );
    }

    const rows: any[] = [];
    const startRowIdx = (currentTab.pageNum * currentTab.result.defaultNumRows);
    for (let idx1: number = 0; idx1 < data.data.length; idx1 = idx1 + 1) {
      const row = {};
      for (let idx2: number = 0; idx2 < data.fields.length; idx2 = idx2 + 1) {
        const temp = data.fields[idx2].name;
        if (data.fields[idx2].logicalType === 'INTEGER') {
          try {
            row[temp] = Number(data.data[idx1][temp]);
          } catch (e) {
            row[temp] = 0;
          }
        } else {
          row[temp] = data.data[idx1][temp];
        }
      }
      row['WORKBENCH_GRID_SEQ'] = startRowIdx + idx1 + 1;
      rows.push(row);
    }

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    if (this.gridComponent) {
      this.gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .CellExternalCopyManagerActivate(true)
        .EnableSeqSort(true)
        .RowSelectionActivate(true)
        .build()
      );
      if (this._gridScrollEvtSub) {
        this._gridScrollEvtSub.unsubscribe();
        this._gridScrollEvtSub = undefined;
      }
      const $gridViewport = $('.slick-viewport');
      const $gridCanvas = $('.grid-canvas');
      this._gridScrollEvtSub
        = this.gridComponent.grid.onScroll.subscribe((data1, data2) => {
        if ( 0 < data2.scrollTop ) {
          this.hideResultButtons = (data2.scrollTop > ($gridCanvas.height() - $gridViewport.height() - 10 ));
          this.safelyDetectChanges();
        } else if( 0 === data2.scrollTop ) {
          this.hideResultButtons = false;
        }
      });
    }

    if (this.searchText !== '') {
      this.gridSearchClear();
    }

    this.safelyDetectChanges();
  } // function - drawGridData

  /**
   * activate editing editor tab name
   */
  public tabLayerModify() {

    if (this.isExecutingQuery) {
      Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
      return;
    }

    this.textList[this.selectedTabNum]['editorMode'] = true;
    this.textList[this.selectedTabNum]['name'] = this.textList[this.selectedTabNum].name;
    this.tabLayer = false;
    this.safelyDetectChanges();

    $(this._editorListTabs.nativeElement).find('input:visible').trigger('focus');
  } // function - tabLayerModify

  /**
   * delete editing editor tab
   */
  public tabLayerDelete() {

    if (this.isExecutingQuery) {
      Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
      return;
    }

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.confirm.delete-editor');
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    modal.afterConfirm = () => {
      this.closeEditorTab(this.selectedTabNum);
      this.tabLayer = false;
    };
    CommonUtil.confirm(modal);

  } // function - tabLayerDelete

  /**
   * 쿼리 cancel
   */
  public cancelRunningQuery(useLog: boolean = false) {
    this.isCanceling = true;
    if (useLog) {
      this.safelyDetectChanges();
      this.loadingBar.show();
    } else {
      if (this.intervalDownload) {
        this.loadingBar.hide();
        clearInterval(this.intervalDownload);
      }
    }
    const params = {query: '', webSocketId: this.websocketId};
    this.workbenchService.setQueryRunCancel(this.selectedEditorId, params)
      .then()
      .catch(() => {
        Alert.error(this.translateService.instant('msg.bench.alert.log.cancel.error'));
        this.loadingBar.hide();
        this.afterCancelQuery(false);
      });

  } // function - cancelRunningQuery

  /**
   * after cancel query
   * @param {boolean} isSuccess
   */
  public afterCancelQuery(isSuccess: boolean) {

    if (!this.isCanceled) {
      // console.info('>>>>>> %s - afterCancel', this.runningResultTabId);

      for (let idx = this.currentRunningIndex + 1; idx < this.executeTabIds.length; idx++) {
        this._removeResultTab(this.executeTabIds[idx]);
      }

      this.isCanceled = true;
      this.isExecutingQuery = false;
      this.isCanceling = false;

      const runningResultTab: ResultTab = this._getResultTab(this.runningResultTabId);
      runningResultTab.showLog = true;
      runningResultTab.setResultStatus('CANCEL');
      runningResultTab.doneTimer();
      if (isSuccess) {
        runningResultTab.name = this._genResultTabName(runningResultTab.queryEditor.name, 'RESULT', runningResultTab.order);
        if (isNullOrUndefined(runningResultTab.message)) {
          runningResultTab.message = this.translateService.instant('msg.bench.alert.log.cancel.success');
        }
        runningResultTab.appendLog(this.translateService.instant('msg.bench.alert.log.cancel.success'));
        (isNullOrUndefined(runningResultTab.result)) && (runningResultTab.result = new QueryResult());
      } else {
        runningResultTab.name = this._genResultTabName(runningResultTab.queryEditor.name, 'ERROR', runningResultTab.order);
        if (isNullOrUndefined(runningResultTab.message)) {
          runningResultTab.message = this.translateService.instant('msg.bench.alert.log.cancel.error');
        }
        runningResultTab.appendLog(this.translateService.instant('msg.bench.alert.log.cancel.error'));
      }

      if (this.selectedEditorId === runningResultTab.editorId
        && false === this._getCurrentEditorResultTabs().some(item => item.selected)) {
        runningResultTab.selected = true;
      }

      this.safelyDetectChanges();
    }

  } // function - afterCancelQuery

  /**
   * 워크스페이스로 돌아가기
   */
  public goBack() {
    this.router.navigate(['/workspace', this._workspaceId]).then();
  } // function - goBack

  // sql 포맷터
  public setSqlFormatter() {

    this.checkFooterPopup();

    // let textAll: string = this.editor.value;
    const textSelected: string = this.editor.getSelection();

    if (textSelected === '') {
      Alert.info(this.translateService.instant('msg.bench.alert.no.selected.query'));
      return;
    }

    let text: string = this.editor.formatter(textSelected, ' ');
    this.editor.replace(text);
    console.info('formatter', text);
    //text = this.replaceAll(text, ';', ';\n\n');

    // textAll = this.replaceAll(textAll, textSelected, text);
    // this.editor.setText(textAll);

    // 쿼리 저장
    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    // 로컬 스토리지에 쿼리에 저장
    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
  }

  public replaceAll(str, find, replace) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  // noinspection JSMethodCanBeStatic
  public escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }

  /**
   * 데이터소스 생성
   */
  public createDatasource() {
    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    const currentResultTab: ResultTab = currentEditorResultTabs.find(item => item.selected);

    if (0 === currentEditorResultTabs.length) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    if ('SUCCESS' !== currentResultTab.resultStatus) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    this.connectionService.getDataconnectionDetail(this.workbench.dataConnection.id)
      .then((connection) => {
        const selectedSecurityType = [
          {label: this.translateService.instant('msg.storage.li.connect.always'), value: AuthenticationType.MANUAL},
          {label: this.translateService.instant('msg.storage.li.connect.account'), value: AuthenticationType.USERINFO},
          {label: this.translateService.instant('msg.storage.li.connect.id'), value: AuthenticationType.DIALOG}
        ].find(type => type.value === this.workbench.dataConnection.authenticationType) || {
          label: this.translateService.instant('msg.storage.li.connect.always'),
          value: 'MANUAL'
        };
        this.mainViewShow = false;
        this.mode = 'db-configure-schema';
        // TODO
        this.setDatasource = {
          connectionData: {
            selectedConnectionPreset: {id: this.workbench.dataConnection.id},
            selectedIngestionType: {
              label: this.translateService.instant('msg.storage.ui.list.ingested.data'),
              value: ConnectionType.ENGINE
            },
            connection: {
              authenticationType: selectedSecurityType.value,
              implementor: this.workbench.dataConnection.implementor
            }
          },
          databaseData: {
            selectedTab: 'QUERY',
            selectedDatabaseInQuery: this.workbench.dataConnection.database,
            queryText: currentResultTab.result.runQuery,
            queryResultData: {
              fields: currentResultTab.result.fields,
              data: currentResultTab.result.data
            }
          },
          workbenchFl: true,
          fieldList: currentResultTab.result.fields,
          fieldData: currentResultTab.result.data
        };

        if( StringUtil.isNotEmpty(this.workbench.dataConnection.hostname) ) {
          this.setDatasource.connectionData.connection.hostname = this.workbench.dataConnection.hostname;
        }
        if( 0 < this.workbench.dataConnection.port ) {
          this.setDatasource.connectionData.connection.port = this.workbench.dataConnection.port;
        }
        if( StringUtil.isNotEmpty(this.workbench.dataConnection.url) ) {
          this.setDatasource.connectionData.connection.url = this.workbench.dataConnection.url;
        }

        const inputSpec:InputSpec = this.workbench.dataConnection.connectionInformation.inputSpec;
        if( InputMandatory.NONE !== inputSpec.catalog && StringUtil.isNotEmpty(this.workbench.dataConnection.catalog) ) {
          this.setDatasource.connectionData.connection.catalog = this.workbench.dataConnection.catalog;
        }
        if( InputMandatory.NONE !== inputSpec.sid && StringUtil.isNotEmpty(this.workbench.dataConnection.sid) ) {
          this.setDatasource.connectionData.connection.sid = this.workbench.dataConnection.sid;
        }
        if( InputMandatory.NONE !== inputSpec.database && StringUtil.isNotEmpty(this.workbench.dataConnection.database) ) {
          this.setDatasource.connectionData.connection.database = this.workbench.dataConnection.database;
        }
        if( InputMandatory.NONE !== inputSpec.username ) {
          this.setDatasource.connectionData.connection.username
            = selectedSecurityType.value === AuthenticationType.DIALOG ? this.webSocketLoginId : connection.username;
        }
        if( InputMandatory.NONE !== inputSpec.password ) {
          this.setDatasource.connectionData.connection.password
            = selectedSecurityType.value === AuthenticationType.DIALOG ? this.webSocketLoginPw : connection.password;
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });

  } // function - createDatasource

  /**
   * 데이터소스 생성 완료
   */
  public createDatasourceComplete() {
    this.useUnloadConfirm = false;
  } // function - createDatasourceComplete

  /**
   * 데이터소스 생성 팝업 닫기
   */
  public closeCreateDatasource() {
    this.mainViewShow = true;
    this.mode = '';
  } // function - closeCreateDatasource

  /**
   * 결과 검색 레이어를 On/Off 한다.
   * @param {MouseEvent} event
   */
  public toggleResultSearchLayer(event: MouseEvent) {
    event.stopPropagation();
    const $evtTarget = $(event.target);
    if ($evtTarget.hasClass('ddp-box-searching') || 0 < $evtTarget.closest('.ddp-box-searching').length) {
      return;
    }
    this.isSearchLink = !this.isSearchLink;
    this.safelyDetectChanges();
  } // function - toggleSearchLayer

  /**
   * 결과 미리보기
   */
  public resultPreview() {

    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    const currentResultTab: ResultTab = currentEditorResultTabs.find(item => item.selected);

    if (0 === currentEditorResultTabs.length) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    if ('SUCCESS' !== currentResultTab.resultStatus) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    // 로딩 show
    this.loadingShow();

    this.pageEngineName = 'temporary_ingestion_' + Date.now();
    const param = {
      dsType: 'VOLATILITY',
      connType: 'ENGINE',
      srcType: 'FILE',
      granularity: 'DAY',
      segGranularity: 'MONTH',
      engineName: this.pageEngineName,
      name: this.pageEngineName,
      description: ''
    };

    // fields param
    let column = currentResultTab.result.fields;
    let seq = 0;
    column.forEach((item) => {
      item['seq'] = seq;
      seq += 1;

      // ingestion rule 이 존재시
      if (item['ingestionRule']) {
        switch (item.ingestionRule.type) {
          case IngestionRuleType.DEFAULT:
            delete item['ingestionRule'];
            break;
          case IngestionRuleType.DISCARD:
            delete item.ingestionRule.value;
        }
      }

      // time stamp field
      // if (item['timestampFl'] === true) {
      //   item['role'] = 'TIMESTAMP';
      // }

      // 필요없는 변수 삭제
      delete item['checked'];
      delete item['timestampFl'];
      delete item['deleteFl'];
    });
    param['fields'] = column;

    // ingestion param
    param['ingestion'] = {
      type: 'local',
      format: {
        type: 'csv',
        delimiter: ',',
        lineSeparator: '\n',
      },
      removeFirstRow: true,
      path: currentResultTab.result.csvFilePath,
      rollup: false
    };

    this.loadingShow();
    this.datasourceService.createDatasourceTemporary(param).then((createInfo) => {
      this.datasourceService.getDatasourceDetail(createInfo.id).then((tempDsInfo) => {
        this.setPageWidget(tempDsInfo);
        setTimeout(() => this.loadingHide(), 500);
      });
    }).catch((error) => {
      this.loadingHide();
      // 로딩 hide
      if (!isUndefined(error.message)) {
        Alert.error(error.message);
      }
    });
  } // function - createDatasourceTemporaryDetail

  /**
   * 차트 미리보기를 위한 페이지 위젯 정보 구성
   * @param {Datasource} tempDsInfo
   */
  public setPageWidget(tempDsInfo: Datasource) {
    const tempWidget = new PageWidget();

    // 데이터소스 구성
    const boardDataSource: BoardDataSource = new BoardDataSource();
    {
      boardDataSource.id = tempDsInfo.temporary.dataSourceId;
      boardDataSource.type = 'default';
      boardDataSource.name = tempDsInfo.temporary.name; // this.pageEngineName;
      boardDataSource.engineName = tempDsInfo.temporary.name; // this.pageEngineName;
      boardDataSource.connType = 'LINK';
      boardDataSource.temporary = true;
      // boardDataSource.fields = this._totalResultTabList[this.selectedGridTabNum]['data']['fields'];
      tempWidget.configuration.dataSource = boardDataSource;
    }

    // 가상 대시보드 정보 구성
    {
      const dashboard: Dashboard = new Dashboard();
      dashboard.name = 'temporary';
      dashboard.configuration = new BoardConfiguration();
      dashboard.configuration.dataSource = boardDataSource;   // 대시보드 데이터소스 설정

      // 워크북 설정
      const workbook: Workbook = new Workbook();
      workbook.name = '';
      dashboard.workBook = workbook;

      // 대시보드 필드 정보 설정
      let fields = tempDsInfo.fields.filter(item => '__ctime' !== item.name);

      // const currentDateTimeField: Field = new Field();
      // currentDateTimeField.name = CommonConstant.COL_NAME_CURRENT_DATETIME;
      // currentDateTimeField.role = FieldRole.TIMESTAMP;
      // currentDateTimeField.type = 'TIMESTAMP';
      // currentDateTimeField.logicalType = LogicalType.TIMESTAMP;
      // currentDateTimeField.dataSource = boardDataSource.engineName;
      // fields = [currentDateTimeField].concat( fields );
      fields.forEach(item => item.dataSource = boardDataSource.engineName);
      dashboard.configuration.fields = fields;

      // 대시보드 필터 구성
      // const filter: TimeAllFilter = FilterUtil.getTimeAllFilter(currentDateTimeField, 'general');
      // dashboard.configuration.filters = [filter];
      dashboard.configuration.filters = [];

      // 가상 대시보드 데이터소스 설정
      {
        const datasource: Datasource = new Datasource();
        datasource.id = boardDataSource.id;
        datasource.fields = fields;
        datasource.name = tempDsInfo.temporary.name;
        datasource.engineName = tempDsInfo.temporary.name;
        dashboard.dataSources = [datasource];
      }

      tempWidget.dashBoard = dashboard;
    }

    this.selectedPageWidget = tempWidget;
    this.mainViewShow = false;
    this.isShowPage = true;
  } // function - setPageWidget

  /**
   * Workbench 이름 수정
   */
  public onWorkbenchNameEdit($event) {
    if (this.isChangeAuthUser) {
      $event.stopPropagation();
      this.isWorkbenchNameEditMode = !this.isWorkbenchNameEditMode;

      if (this.isWorkbenchDescEditMode) {
        this.isWorkbenchDescEditMode = false;
      }

      if (this.workbenchDesc !== this.workbenchTemp.description) {
        this.workbenchDesc = this.workbenchTemp.description;
      }

      this.changeDetect.detectChanges();
      this.wbName.nativeElement.focus();
    }
  }

  /**
   * Workbench 설명 수정
   */
  public onWorkbenchDescEdit($event) {
    if (this.isChangeAuthUser) {
      $event.stopPropagation();
      this.isWorkbenchDescEditMode = !this.isWorkbenchDescEditMode;

      if (this.isWorkbenchNameEditMode) {
        this.isWorkbenchNameEditMode = false;
      }

      if (this.workbenchName !== this.workbenchTemp.name) {
        this.workbenchName = this.workbenchTemp.name;
      }

      this.changeDetect.detectChanges();
      this.wbDesc.nativeElement.focus();
    }
  }

  /**
   * Set workbench name (실제 워크벤치 이름을 this.workbenchName에 넣는다)
   */
  public setWorkbenchName() {
    this.isWorkbenchNameEditMode = false;
    if (this.workbenchTemp.name !== this.workbenchName) {
      this.workbenchName = this.workbenchTemp.name;
    }
  }

  /**
   * Set workbench desc (실제 워크벤치 설명을 this.workbenchDesc 넣는다)
   */
  public setWorkbenchDesc() {
    this.isWorkbenchDescEditMode = false;
    if (this.workbenchTemp.description !== this.workbenchDesc) {
      this.workbenchDesc = this.workbenchTemp.description;
    }
  }

  // *****************************************************************
  // 스키마 브루어져 관련
  // *****************************************************************

  /**
   * 스키마 브라우져 창 열기
   */
  public setSchemaBrowser(): void {

    let connInfo: any = this.workbench;

    const selectedSecurityType = [
      {label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL'},
      {label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO'},
      {label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG'}
    ].find(type => type.value === this.workbench.dataConnection.authenticationType) || {
      label: this.translateService.instant('msg.storage.li.connect.always'),
      value: 'MANUAL'
    };
    connInfo.dataConnection.username = selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginId : connInfo.dataConnection.username;
    connInfo.dataConnection.password = selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginPw : connInfo.dataConnection.password;

    const param = {
      workbench: connInfo,
      workbenchId: this.workbenchId,
      websocketId: this.websocketId,
      textList: this.textList
    };
    this.schemaBrowserComponent.init(param);
  }

  public setTableDataEvent($event) {
    let tableTemp: any = {};
    $event.forEach(item => {
      tableTemp[item.name] = []
    });

    this.editor.setOptions(tableTemp);

    //H2, HIVE, ORACLE, TIBERO, MYSQL, MSSQL, PRESTO, FILE, POSTGRESQL, GENERAL;
    if (this.mimeType == 'HIVE' || this.mimeType == 'PRESTO' || this.mimeType == 'GENERAL') {
      this.editor.setModeOptions('text/x-hive');
    } else {
      this.editor.setModeOptions('text/x-mysql');
    }
  }

  public saveAsHiveTable() {
    const currentTab: ResultTab = this._getCurrentResultTab();
    this.saveAsHiveTableComponent.init(this.workbenchId, currentTab.result.csvFilePath, this.websocketId);
  }

  public saveAsHiveTableSucceed() {
    this.detailWorkbenchDatabase.getDatabase();
  }


  // *****************************************************************
  // Split Slider 관련
  // *****************************************************************
  /**
   * toggle Horizontal Slider
   * @private
   */
  private _toggleHorizontalSlider() {
    if (this.isLeftMenuOpen && !this.isQueryEditorFull) {
      this._activeHorizontalSlider();
    } else {
      this._deactiveHorizontalSlider();
    }
  } // function - _toggleHorizontalSlider

  /**
   * active Horizontal Slider
   * @private
   */
  private _activeHorizontalSlider() {
    this._splitHorizontal = Split(['.sys-workbench-lnb-panel', '.sys-workbench-content-panel'], {
      direction: 'horizontal',
      sizes: [20, 80],
      minSize: [260, 300],
      elementStyle: (dimension, size, gutterSize) => {
        return {'width': `${size}%`};
      },
      onDragEnd: () => {
        this.onEndedResizing();
      }
    });
  } // function - _activeHorizontalSlider

  /**
   * deactive horizontal slider
   * @private
   */
  private _deactiveHorizontalSlider() {
    if (this._splitHorizontal) {
      this._splitHorizontal.destroy();
      this._splitHorizontal = undefined;
    }
  } // function - _deactiveHorizontalSlider


  // *****************************************************************
  // Result Tab 관련
  // *****************************************************************

  /**
   * generate result tab name
   * @param {string} prefix
   * @param {"result" | "error"} type
   * @param {number} idx
   * @private
   */
  private _genResultTabName(prefix: string, type: 'RESULT' | 'ERROR', idx: number) {
    return prefix + ' - ' + this.translateService.instant('RESULT' === type ? 'msg.bench.ui.rslt' : 'msg.comm.ui.error') + idx;
  } // function - _genResultTabName

  /**
   * return result tab list in current selected editor
   * @return {ResultTab[]}
   * @private
   */
  private _getCurrentEditorResultTabs(): ResultTab[] {
    return this.totalResultTabList.filter(item => item.editorId === this.selectedEditorId);
  } // function - _getCurrentEditorResultTabs

  /**
   * return current visible result tab
   * @return {ResultTab}
   * @private
   */
  private _getCurrentResultTab(): ResultTab {
    return this.totalResultTabList.find(item => item.editorId === this.selectedEditorId && item.selected);
  } // function - _getCurrentResultTab

  /**
   * return result tab list in editor id
   * @param {string} editorId
   * @return {ResultTab[]}
   * @private
   */
  private _getResultTabsByEditorId(editorId: string): ResultTab[] {
    return this.totalResultTabList.filter(item => item.editorId === editorId);
  } // function - _getResultTabsByEditorId

  /**
   * return result tab by tabId
   * @param {string} tabId
   * @return {ResultTab}
   * @private
   */
  private _getResultTab(tabId: string): ResultTab {
    return this.totalResultTabList.find(item => item.id === tabId);
  } // function - _getResultTab

  /**
   * remove result tab
   * @return {ResultTab[]}
   * @private
   */
  private _removeResultTab(resultTabId: string): ResultTab[] {
    const rmIdx: number = this.totalResultTabList.findIndex(item => item.id === resultTabId);
    if (-1 < rmIdx) {
      this.totalResultTabList.splice(rmIdx, 1);
    }
    return this.totalResultTabList;
  } // function - _removeResultTab

  /**
   * clear result tab list in current selected editor
   * @return {ResultTab[]}
   * @private
   */
  private _clearCurrentEditorResultTabs(): ResultTab[] {
    this.totalResultTabList = this.totalResultTabList.filter(item => item.editorId !== this.executeEditorId);
    return this.totalResultTabList;
  } // function - _clearCurrentEditorResultTabs

  /**
   * append result tab
   * @param {ResultTab} resultTab
   * @private
   */
  private _appendResultTab(resultTab: ResultTab) {
    this.totalResultTabList.push(resultTab);
    // this.totalResultTabList
    //   .filter( item => item.editorId === resultTab.editorId )
    //   .forEach( ( item:ResultTab, idx:number ) => {
    //     item.order = idx + 1;
    //   });
  } // function - _appendResultTab

  /**
   * check running tab equal visible tab
   * @return {boolean}
   * @private
   */
  private _isEqualRunningVisibleTab(): boolean {
    const runningTab: ResultTab = this._getResultTab(this.runningResultTabId);
    const visibleTab: ResultTab = this._getCurrentResultTab();
    return visibleTab && runningTab && runningTab.id === visibleTab.id;
  } // function - _isEqualRunningVisibleTab

  /**
   * tableParam 사용자 정보 체크
   */
  private setUserInfoTableParam() {
    const selectedSecurityType = [
      {label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL'},
      {label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO'},
      {label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG'}
    ].find(type => type.value === this.workbench.dataConnection.authenticationType) || {
      label: this.translateService.instant('msg.storage.li.connect.always'),
      value: 'MANUAL'
    };
    this.tableParam.dataconnection.username = selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginId : this.workbench.dataConnection.username;
    this.tableParam.dataconnection.password = selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginPw : this.workbench.dataConnection.password;
  }

  /**
   * 화면 쿼리 저장 여부
   */
  private checkSaveQuery() {
    const saveQuery: string = this.getLocalStorageQuery(this.selectedEditorId);
    const currQuery: string = this.getSelectedTabText();
    if (this.textList.length !== 0 && saveQuery !== currQuery) {
      if (saveQuery == null && currQuery != null) {
        this.useUnloadConfirm = true;
      }
      if (saveQuery && currQuery
        && saveQuery.replace(/\s/gi, '') !== currQuery.replace(/\s/gi, '')) {
        this.useUnloadConfirm = true;
      }
      // 쿼리 저장
      this.textList[this.selectedTabNum]['query'] = currQuery;
      // 로컬 스토리지에 쿼리에 저장
      this.saveLocalStorage(currQuery, this.textList[this.selectedTabNum]['editorId']);
    }
  }

}

// 리스트 슬라이드아이콘 관리용 객체
class EditorList {
  // list index
  public index: number = 0;
  // btn show flag
  public showBtnFl: boolean = false;
  // list
  public list: any = [];
}

/**
 * Result Tab Object
 */
class ResultTab {
  public editorId: string;      // target editor id
  public id: string;            // tag id
  public order: number;
  public name: string;
  public message: string;
  public selected: boolean;
  public showLog: boolean;
  public log: string[];
  public sql: string;
  public startDate: string;
  public finishDate: string;
  public executeTime: number;
  public executeStatus: ('GET_CONNECTION' | 'CREATE_STATEMENT' | 'EXECUTE_QUERY' | 'LOG' | 'GET_RESULTSET' | 'DONE');
  public resultStatus: ('NONE' | 'SUCCESS' | 'FAIL' | 'CANCEL');
  public errorStatus: ('GET_CONNECTION' | 'CREATE_STATEMENT' | 'EXECUTE_QUERY' | 'LOG' | 'GET_RESULTSET' | 'DONE');
  public result?: QueryResult;           // Result
  public pageNum: number = 0;

  public queryEditor: QueryEditor;

  private _timer;

  constructor(editorId: string, queryEditor: QueryEditor, sql: string, order: number) {
    this.id = CommonUtil.getUUID();
    this.editorId = editorId;
    this.queryEditor = queryEditor;
    this.sql = sql;
    this.order = order;
    this.selected = false;
    this.initialize();
  }

  public initialize() {
    this.showLog = true;
    this.log = [];
    this.pageNum = 0;
    this.executeTime = 0.0;
    this.resultStatus = 'NONE';
    this.result = undefined;
    this.name = 'Loading..';
    this.startDate = undefined;
    this.finishDate = undefined;
    this.message = undefined;
    this.appendLog(this.sql);
    this.setExecuteStatus('GET_CONNECTION');
  } // function - initialize

  public executeTimer() {
    this.startDate = moment().format('YYYY-MM-DD HH:mm:ss');
    this._timer = setInterval(() => this.executeTime = (moment().diff(this.startDate) / 1000), 1000);
  } // function - executeTimer

  public doneTimer() {
    // if (this.data) {
    //   this.startDate = moment(this.data.startDateTime).format('YYYY-MM-DD HH:mm:ss');
    //   this.finishDate = moment(this.data.finishDateTime).format('YYYY-MM-DD HH:mm:ss');
    //   this.runningTime = moment(this.data.finishDateTime).diff(this.data.startDateTime, 'seconds');
    // }
    clearInterval(this._timer);
    this.finishDate = moment().format('YYYY-MM-DD HH:mm:ss');
  } // function - doneTimer

  public setResultStatus(status: ('NONE' | 'SUCCESS' | 'FAIL' | 'CANCEL')) {
    this.resultStatus = status;
    if ('FAIL' === status) {
      this.errorStatus = this.executeStatus;
      // console.info( '%c >>>>>> error status', 'color:#ff0000', this.errorStatus);
    }
  } // function - setResultStatus

  public setExecuteStatus(status: ('GET_CONNECTION' | 'CREATE_STATEMENT' | 'EXECUTE_QUERY' | 'LOG' | 'GET_RESULTSET' | 'DONE')) {
    this.executeStatus = status;
    this.appendLog(this.getExecuteStatusMsg());
  } // function - setExecuteStatus

  public getExecuteStatusMsg(status?: ('GET_CONNECTION' | 'CREATE_STATEMENT' | 'EXECUTE_QUERY' | 'LOG' | 'GET_RESULTSET' | 'DONE')): string {
    let msg: string = '';
    switch (status ? status : this.executeStatus) {
      case 'GET_CONNECTION' :
        msg = 'Getting connection';
        break;
      case 'CREATE_STATEMENT' :
        msg = 'Creating statement';
        break;
      case 'EXECUTE_QUERY' :
        msg = 'Executing query';
        break;
      case 'GET_RESULTSET' :
        msg = 'Getting resultset';
        break;
      case 'DONE' :
        msg = 'Done!';
        break;
    }
    return msg;
  } // function - getExecuteStatusMsg

  public appendLog(strLog: string) {
    if (-1 < strLog.indexOf('INFO')) {
      this.log.push(strLog.replace(/(INFO)/g, '<span class="ddp-txt-info">$1</span>'));
    } else if (-1 < strLog.indexOf('ERROR')) {
      this.log.push(strLog.replace(/(ERROR)/g, '<span class="ddp-txt-error">$1</span>'));
    } else if (-1 < strLog.indexOf('WARN')) {
      this.log.push(strLog.replace(/(WARN)/g, '<span class="ddp-txt-warn">$1</span>'));
    } else {
      this.log.push('<span>' + strLog + '</span>');
    }
  } // function - pushLog

  public isShowPrevBtn(): boolean {
    return 0 !== this.pageNum;
  } // function - isShowPrevBtn

  public isShowNextBtn(pageSize: number): boolean {
    const currDataRows = this.result.data.length + (this.pageNum * pageSize);
    return currDataRows < this.result.numRows;
  } // function - isShowNextBtn
}

class QueryResult {
  // public auditId: string;
  public csvFilePath: string;
  public data: any[];
  public fields: Field[];
  public numRows: number;
  public queryEditorId: string;
  // public queryHistoryId: number;
  public queryResultStatus: 'SUCCESS' | 'FAIL';
  public runQuery: string;
  public startDateTime: string;
  public finishDateTime: string;
  public tempTable: string;
  public defaultNumRows: number = 0;  // pageSize, 페이지당 호출 건 수
  public maxNumRows: number = 0;      // 최대 호출 가능 건 수
}
