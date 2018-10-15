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

import { AbstractComponent } from '../common/component/abstract.component';
import { Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../common/component/grid/grid.header';
import { GridOption } from '../common/component/grid/grid.option';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from './service/workbench.service';
import { QueryEditor, Workbench } from '../domain/workbench/workbench';
import { Alert } from '../common/util/alert.util';
import { DetailWorkbenchTable } from './component/detail-workbench/detail-workbench-table/detail-workbench-table';
import { CommonConstant } from '../common/constant/common.constant';
import { DeleteModalComponent } from '../common/component/modal/delete/delete.component';
import { Modal } from '../common/domain/modal';
import { UserDetail } from '../domain/common/abstract-history-entity';
import { StringUtil } from '../common/util/string.util';
import { CookieConstant } from '../common/constant/cookie.constant';
import { isNullOrUndefined, isUndefined } from 'util';
import { LoadingComponent } from '../common/component/loading/loading.component';
import { DatasourceService } from '../datasource/service/datasource.service';
import { PageWidget } from '../domain/dashboard/widget/page-widget';
import { Dashboard, BoardDataSource, BoardConfiguration } from '../domain/dashboard/dashboard';
import { BIType, ConnectionType, Datasource, Field, LogicalType } from '../domain/datasource/datasource';
import { Workbook } from '../domain/workbook/workbook';
import { DataconnectionService } from '../dataconnection/service/dataconnection.service';
import { CommonUtil } from '../common/util/common.util';
import * as _ from 'lodash';
import { DetailWorkbenchSchemaBrowserComponent } from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';
import { SYSTEM_PERMISSION } from '../common/permission/permission';
import { PermissionChecker, Workspace } from '../domain/workspace/workspace';
import { WorkspaceService } from '../workspace/service/workspace.service';
import { CodemirrorComponent } from './component/editor-workbench/codemirror.component';
import { Dataconnection } from '../domain/dataconnection/dataconnection';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  // host: {
  //   '(document:keyup)': 'onKeyUpEventHandler($event)',
  // }
})
export class WorkbenchComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 에디터 행수
  private MAX_LINES: number = 20;

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

  // 탭 번호
  private tabNum: number = 0;

  // Grid 탭 번호
  private tabGridNum: number = 0;

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

  // request reconnect count
  private _executeSqlReconnectCnt: number = 0;
  private _checkQueryStatusReconnectCnt: number = 0;

  private _subscription: any;
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

  // result row
  public resultRow: string = '';

  // result time
  public resultTime: string = '';

  // 선택된 텍스트
  public text: string = '';

  // tab list 이름만 모아뒀다
  public textList: any[] = []; // { name: '쿼리' + this.tabNum, query: '', selected: true }

  // text list => 보이기 여부.
  public textListShow: boolean = false;

  // 데이터 그리드 리스트
  public datagridCurList: any[] = [];  // 데이터 그리드 리스트를 object 로 관리
  public datagridList: any[] = [];

  // 데이터 그리드 리스트 왼쪽 보이기 여부
  public datagridListShow: boolean = false;

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

  // 선택된 에디터 아이디
  public selectedEditorId: string;

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

  // result 모드
  public resultMode: string = 'grid'; // true => grid, false => text

  // output
  public resultTextOutput: string = '';

  // 인증 방식
  public authenticationType: string = '';

  // 인터벌 객체
  public intervalDownload: any;

  // container for workbench name&desc -> edit
  public workbenchName: string;
  public workbenchDesc: string;

  public mainViewShow: boolean = true;

  public csvDownloadLayer: boolean = false;

  // 데이터 메니저 여부
  public isDataManager: boolean = false;

  // 쿼리조회후 가져올 갯 수
  public queryResultNumber: number = 1000;

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

  // Hive Tab logs
  public hiveTabLogs: any[] = [];

  // Hive Log 표시 여부
  public hiveLogs: { [key: number]: { isShow: boolean, log: string[] } } = [];

  // 선택된 Grid 탭 번호
  public selectedGridTabNum: number = 0;

  // 화면 로딩 완료
  public isHiveLog: boolean = false;

  // hive 로그 버튼
  public isHiveLogCancel: boolean = false;

  // 로그 취소 탭 넘버
  public isLogCancelTabQuery: string[] = [];

  // grid 값이 NO DATA  일 경우 icon show flag
  public isGridResultNoData: boolean = false;
  public isHiveGridResultNoData: boolean = false;

  // 현재 실행 쿼리
  public runningQueryArr: string [] = [];

  // 현재 실행 query Editor
  public runningQueryEditor: any = {};

  // 현재 실행 query done Index
  public runningQueryDoneIndex: number = -1;

  // editor selected tab number
  public tempEditorSelectedTabNum: number = 0;

  // hive log 취소중
  public hiveLogCanceling: boolean = false;

  // hive query 실행 중
  public isHiveQueryExecute: boolean = false;

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

  public ngOnInit(): void {
    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) === '') {
      this.router.navigate(['/user/login']);
    }
    this.workbench.modifiedBy = new UserDetail();
    this.workbench.createdBy = new UserDetail();

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      this.workbenchId = params['id'];
    });

    // Send statistics data
    this.sendViewActivityStream(this.workbenchId, 'WORKBENCH');

    // 초기 데이터 조회
    this._loadInitData(() => {
      this.webSocketCheck(() => {
        // this.timer = setInterval( () => {
        //   this.workbenchService.checkConnectionStatus(this.selectedEditorId, this.websocketId)
        //     .catch(() => {
        //       this.webSocketCheck( this.checkQueryStatus );
        //     });
        // }, 3000 );
      })
    });
    setTimeout(() => this.onEndedResizing(), 500);
  }

  /**
   * 웹소켓 체크
   * @param {Function} callback
   */
  public webSocketCheck(callback?: Function) {
    this.checkAndConnectWebSocket(true).then(() => {
      try {
        this.createWebSocket(callback);
      } catch (e) {
        console.log(e);
      }
      this.websocketId = CommonConstant.websocketId;
      WorkbenchService.websocketId = CommonConstant.websocketId;
    });
  } // function - webSocketCheck

  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
    // this.webSocketCheck(() => {});
    (this._subscription) && (CommonConstant.stomp.unsubscribe(this._subscription));     // Socket 응답 해제

    // (this.timer) && (clearInterval(this.timer));

    // save info
    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) !== '') {
      const headers: any = {
        'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      };
      CommonConstant.stomp.send('/message/workbench/' + this.workbenchId + '/dataconnections/' + this.workbench.dataConnection.id + '/disconnect', '', headers);

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
          .then((data) => {
            this.loadingHide();
            // 로컬 스토리지에 저장된 쿼리 제거
            this.removeLocalStorage(this.selectedEditorId);
          })
          .catch((error) => {
            this.loadingHide();
          });
        // 저장 종료
      }
    }
  }

  /**
   * 윈도우 리사이즈 이벤트 처리
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize() {
    this.onEndedResizing();
  } // function - onResize

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * local storage 에 쿼리 저장
   * @param {string} value
   * @param {string} editorId
   */
  public saveLocalStorage(value: string, editorId: string): void {
    this.useUnloadConfirm = true;
    localStorage.setItem('workbench' + this.workbenchId + editorId, value);
  }

  /**
   * local storage 에 저장된 쿼리 제거
   * @param {string} editorId
   */
  public removeLocalStorage(editorId: string): void {
    this.useUnloadConfirm = false;
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
   * @param {string} value
   * @param {string} editorId
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

  /**
   * local storage 에 저장된 기본정보 제거
   * @param {string} editorId
   */
  public removeLocalGeneral(): void {
    localStorage.removeItem('workbench-general-' + this.workbenchId);
  }

  /**
   * local storage 에 저장된 기본정보 불러오기
   * @param {string} editorId
   * @returns {string}
   */
  public getLocalStorageGeneral() {
    return JSON.parse(localStorage.getItem('workbench-general-' + this.workbenchId));
  }

  // 로그인 완료
  public loginComplete(param) {
    // this.workbench = this.workbenchTemp;
    this.websocketId = CommonConstant.websocketId;
    this.webSocketLoginId = param.id;
    this.webSocketLoginPw = param.pw;
    //
    WorkbenchService.websocketId = CommonConstant.websocketId;
    WorkbenchService.webSocketLoginId = param.id;
    WorkbenchService.webSocketLoginPw = param.pw;
    this.readQuery(this.workbenchTemp, this.workbenchTemp.queryEditors);

    //TODO The connection has not been established error
    try {
      this.webSocketCheck(() => {
      });
    } catch (e) {
      console.log(e);
    }

  }


  // 새로운 탭 만들기
  public tabCreateHandler(text: string = '', selectedParam: boolean = true, increase: boolean = false) {
    // 탭번호 증가
    if (increase === true) {
      this.tabNum = Number(this.textList.length);
    }

    const queryEditor: QueryEditor = new QueryEditor();
    queryEditor.name = this.translateService.instant('msg.statistics.th.query') + ' ' + (this.tabNum + 1);
    queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
    queryEditor.order = this.tabNum;
    queryEditor.query = '';

    this.loadingShow();
    this.workbenchService.createQueryEditor(queryEditor)
      .then((data) => {
        this.loadingHide();
        // 탭 추가
        this.textList.push({
          selected: selectedParam,
          name: this.translateService.instant('msg.statistics.th.query') + ' ' + (this.tabNum + 1),
          query: text === '' ? '' : text,
          editorId: data.id,
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

  }

  // 탭 닫기
  public tabCloseHandler(tabNum) {
    // 탭이 하나라면
    if (this.textList.length === 1) {
      Alert.warning(this.translateService.instant('msg.bench.alert.close.editortab.fail'));
      return;
    }

    // 해당 tab 삭제.
    this.workbenchService.deleteQueryEditor(this.textList[tabNum]['editorId'])
      .then((result) => {
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
      this.datagridCurList = this.datagridList.filter(obj => obj.editorId === this.selectedEditorId);

      if (this.datagridCurList.length !== 0) {
        const gridIndex = _.findIndex(this.datagridCurList, { selected: true });
        this.drawGridData(gridIndex !== -1 ? gridIndex : 0);
      }
    }
    this.saveLocalStorageGeneral();
  }

  // 편집 모드 종료
  public tabLayerBlur(item, $event) {
    if (item['editorMode']) {
      this.tabLayerEnter($event);
    }
  }

  // 편집 모드 종료
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
        .then((data) => {
          // 로컬 스토리지에서 쿼리 삭제
          this.removeLocalStorage(queryEditor.editorId);
          // 그리드 이름 변경
          this.datagridList.filter(obj => obj.editorId === this.selectedEditorId).forEach((item, index) => {
            item.name = this.textList[this.selectedTabNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (index + 1);
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
  }

  // grid 탭 닫기
  public tabGridCloseHandler(tabNum) {

    // hive 일 경우 해당 탭 로그 삭제
    if (this.mimeType == 'HIVE') {
      let arr: any = [];
      arr = this.hiveLogs;
      arr.splice(tabNum, 1);
      this.hiveLogs = arr;
    }

    if (this.datagridCurList.length === 1) {
      // Alert.warning('결과 탭을 닫을수 없습니다.');
      this.datagridCurList = [];
      this.tabGridNum = 0;
      this.selectedGridTabNum = 0;
      this.resultMode = '';
      this.gridSearchClear();
      return;
    }

    // 결과창 검색어 초기화
    this.gridSearchClear();

    // 탭 삭제
    const item: any = this.datagridCurList.splice(tabNum, 1);
    this.datagridList = this.datagridList.filter(obj => obj !== item[0]);

    // show index 가 0이라면 icon flag 재계산
    if (this.editorResultListObj.index === 0) {
      // 변경이 다 일어났을 때
      this.changeDetect.detectChanges();
      this.editorResultListObj.showBtnFl = this._isEditorResultMaxWidth();
    }


    // 탭 번호 낮추기
    this.tabGridNum = this.tabGridNum - 1;

    if (this.datagridCurList.length > 0) {
      // 첫번재 탭을 선택상태로 변경
      if (tabNum === this.datagridCurList.length) {
        this.tabGridChangeHandler(tabNum - 1);
      } else {
        this.tabGridChangeHandler(tabNum);
      }
    }
  }

  // 에디터 탭 변경
  public tabChangeHandler(selectedTabNum: number, deleteFlag: boolean = false, selectedItem?: any): void {

    // hive 일경우
    if (this.isHiveQueryExecute) {
      this.alertHiveQueryExecuting();
    }
    if (this.mimeType == 'HIVE') {

      this.hiveLogs = [];
      for (let index: number = 0; index < this.hiveTabLogs.length; index = index + 1) {
        if (this.hiveTabLogs[index]['selectedTabNum'] == selectedTabNum) {
          this.hiveLogs = this.hiveTabLogs[index]['data'];
          break;
        }
      }

      let hiveCurrLogs: any = [];
      hiveCurrLogs = this.hiveLogs;
      if (hiveCurrLogs.length > 0) {
        for (let index: number = 0; index < hiveCurrLogs.length; index = index + 1) {
          hiveCurrLogs[index]['isShow'] = false;
        }
      }
      this.safelyDetectChanges();
    }

    // 이전에 선택된 Query tab 저장
    if (!isUndefined(this.selectedEditorId) && deleteFlag === false) {
      // 로컬 스토리지에 선택된 tab 순번과 schema 저장
      const queryEditor: QueryEditor = new QueryEditor();
      const selectedTabIndex = _.findIndex(this.textList, { selected: true });
      queryEditor.editorId = this.selectedEditorId;
      // queryEditor.name = this.textList[this.selectedTabNum]['name'];
      queryEditor.name = this.textList[selectedTabIndex]['name'];
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      // queryEditor.order = this.textList[selectedTabIndex]['queryTabNum'];//this.tabNum;
      queryEditor.order = selectedTabIndex;
      // queryEditor.query = this.getSelectedTabText();
      queryEditor.query = this.textList[selectedTabIndex]['query'];

      this.workbenchService.updateQueryEditor(queryEditor)
        .then((data) => {
          this.loadingHide();
          // 로컬 스토리지에서 쿼리 삭제
          this.removeLocalStorage(queryEditor.editorId);
        })
        .catch((error) => {
          this.loadingHide();
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

    // this.datagridCurList = this.datagridList.filter(obj => obj.queryTabNum === this.selectedTabNum);
    this.datagridCurList = this.datagridList.filter(obj => obj.editorId === this.selectedEditorId);
    // 에디터 결과 슬라이드 버튼 계산
    this._calculateEditorResultSlideBtn(true);

    // 그리드 있을때만
    if (this.datagridCurList.length > 0) {
      // 현재 선택된 그리드 index
      const gridIndex = _.findIndex(this.datagridCurList, { selected: true });

      if (this.datagridCurList[0].output === 'text') {
        this.resultMode = 'text';
      } else {
        this.resultMode = 'grid';
        // 그리드 차트 뿌리기
        this.drawGridData(gridIndex !== -1 ? gridIndex : 0);
      }
      // 그리드 탭 변경
      this.tabGridChangeHandler(gridIndex !== -1 ? gridIndex : 0);
    }
    if (selectedItem) {
      this.saveLocalStorageGeneral();
    }
  }

  /**
   * Change result tab
   * @param {number} selectedTabNum
   */
  public tabGridChangeHandler(selectedTabNum: number) {

    // hive 일경우
    if (this.mimeType == 'HIVE') {
      let arr: any = [];
      arr = this.hiveLogs;
      if (arr.length > 0 && arr[selectedTabNum]) {
        this.hiveLogs[selectedTabNum].isShow = false;
      }

      // 현재 실행 생성중인 탭의 경우 log 정보 호출
      if (this.runningQueryDoneIndex == selectedTabNum) {

        this.isHiveLogCancel = true;

        for (let index: number = 0; index < this.datagridCurList.length; index = index + 1) {
          const gridList = this.datagridCurList[index];
          gridList.selected = false;
        }

        this.datagridCurList[this.runningQueryDoneIndex]['selected'] = true;
        this.selectedGridTabNum = this.runningQueryDoneIndex;
        this.hiveLogs[this.selectedGridTabNum].isShow = true;
        this.safelyDetectChanges();
        return false;

      }
    }

    for (let index: number = 0; index < this.datagridCurList.length; index = index + 1) {
      // 선택된 탭이면
      if (index === selectedTabNum) {
        if (this.datagridCurList[index]['output'] === 'text') {
          this.resultMode = 'text';
          this.resultTextOutput = this.datagridCurList[index]['message'];
          this.isGridResultNoData = true;
        } else if (this.datagridCurList[index]['output'] === 'grid') {
          this.resultMode = 'grid';
          this.isGridResultNoData = false;
        }
        this.datagridCurList[index]['selected'] = true;
        this.selectedGridTabNum = index;

        // 중지된 탭의 경우 체크
        if (isNullOrUndefined(this.datagridCurList[index].data) || isNullOrUndefined(this.datagridCurList[index].data.data)) {
          $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
          this.resultRow = '0';
          this.isGridResultNoData = true;
          this.isHiveGridResultNoData = true;
        } else {
          this.resultRow = this.datagridCurList[index].data.numRows;

        }

      } else {
        // 선택되지 않은 탭이면
        this.datagridCurList[index]['selected'] = false;
      }
    }
    // 데이터 그리드 뿌리기
    if (this.mimeType == 'HIVE') {

      const currHiveLog = this.hiveLogs[selectedTabNum];
      if (currHiveLog.log.length > 0) {
        this.isGridResultNoData = false;
      }

      this.safelyDetectChanges();
    }
    if (this.resultMode === 'grid') {
      this.drawGridData(this.selectedGridTabNum);
    } else if (this.resultMode === 'text') {

    }
  } // function - tabGridChangeHandler

  public editorKeyEvent(event) {
    // 쿼리 실행.
    if (event.ctrlKey && event.keyCode === 13) {
      if( this.isHiveQueryExecute ){
        this.alertHiveQueryExecuting();
        return false;
      }
      this.setExecuteSql('SELECTED');
    }

    if (event.ctrlKey && event.keyCode === 81) {
      this.clearSql();
    }

    if (event.ctrlKey && event.keyCode === 190) {
      this.setSqlFormatter();
    }

    if (event.altKey && event.keyCode === 13) {
      if( this.isHiveQueryExecute ){
        this.alertHiveQueryExecuting();
        return false;
      }
      this.setExecuteSql('ALL');
    }

    // 현재 저장된 쿼리랑 다를때
    if (this.textList.length !== 0 && this.getLocalStorageQuery(this.selectedEditorId) !== this.getSelectedTabText()) {
      // 쿼리 저장
      this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
      // 로컬 스토리지에 쿼리에 저장
      this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
    }
  }

  // 키보드 이벤트
  public editorTextChange(param: string) {
    this.textList[this.selectedTabNum]['query'] = param;
  }

  // 좌측 메뉴 오픈 / 클로즈
  public leftMenuOpen() {
    this.isLeftMenuOpen = !this.isLeftMenuOpen;
    // 아이콘 슬라이드 버튼 계산
    this._calculateEditorSlideBtn();
    this._calculateEditorResultSlideBtn();
  }

  // 데이터 커넥션 info
  public dataConnectionInfoShow() {
    this.isDataConnectionInfoShow = !this.isDataConnectionInfoShow;
  }

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
    // 보고있는 schemalayer hide
    this.closeEvent = { name: 'closeSchema' };
  }

  // database 변경시 데이터 셋 변경
  public setChangeDatabase($event) {
    this.workbench.dataConnection.database = $event;
    this.tableParam = {
      dataconnection: this.workbench.dataConnection,
      webSocketId: this.websocketId
    };
    this.saveLocalStorageGeneralSchema();
    // 보고있는 schemalayer hide
    this.closeEvent = { name: 'closeSchema' };
  }

  /**
   // 우측 패널 구성
   **/

  // 첫번쨰 : 글로벌 변수 선언
  public openGlobalVariableMenu() {
    this.isGlobalVariableMenuShow = !this.isGlobalVariableMenuShow;
    this.isQueryHistoryMenuShow = false;
    this.isNavigationMenuShow = false;
    // this.isWorkbenchOptionShow = false;
  }

  // 두번째 : 쿼리 히스토리 리스트
  public openQueryHistoryMenu() {
    this.isQueryHistoryMenuShow = !this.isQueryHistoryMenuShow;
    this.isGlobalVariableMenuShow = false;
    this.isNavigationMenuShow = false;
    // this.isWorkbenchOptionShow = false;
  }

  // 세번째 : 네비게이션
  public openNavigationMenu() {
    this.isNavigationMenuShow = !this.isNavigationMenuShow;
    this.isGlobalVariableMenuShow = false;
    this.isQueryHistoryMenuShow = false;
  }

  // 워크밴치 옵션 레이어 toggle
  public showOption() {
    this.isWorkbenchOptionShow = !this.isWorkbenchOptionShow;
  }

  // 쿼리 실행
  public setExecuteSql(param: string) {
    this.loadingBar.show();
    if (this.mimeType == 'HIVE') {
      this.isHiveQueryExecute = true;
    }
    // 호출횟수 증가
    this._executeSqlReconnectCnt++;
    // 보고있는 탭이 에러인경우 초기화
    if (this.resultMode === 'text') this.resultMode = '';

    if (this.getSelectedTabText() === '') {
      Alert.warning(this.translateService.instant('msg.bench.alert.execute.query'));
      this.loadingBar.hide();
      return;
    }

    // hive log 초기화
    this.hiveLogs = [];

    // grid 초기화
    this.isLogCancelTabQuery = [];
    this.datagridCurList = [];
    this.tabGridNum = 0;
    this.selectedGridTabNum = 0;
    this.editorResultListObj = new EditorList();

    this.workbenchService.checkConnectionStatus(this.textList[this.selectedTabNum]['editorId'], this.websocketId)
      .then((result) => {
        // 호출횟수 초기화
        this._executeSqlReconnectCnt = 0;

        // if (result === 'RUNNING' || result === 'CANCELLED') {
        if (result === 'RUNNING') {
          Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
          this.loadingBar.hide();
          return;
        } else {

          const queryEditor: QueryEditor = new QueryEditor();
          queryEditor.name = this.textList[this.selectedTabNum]['name'];
          queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
          queryEditor.order = this.selectedTabNum;
          this.allQuery = param;
          // 전체 쿼리 저장
          queryEditor.query = this.getSelectedTabText();
          this.loadingBar.show();
          console.info('this.websocketId', this.websocketId);
          queryEditor.webSocketId = this.websocketId;
          queryEditor.editorId = this.textList[this.selectedTabNum]['editorId'];

          if (this.queryResultNumber && this.queryResultNumber !== 0) {
            queryEditor['numRows'] = this.queryResultNumber;
          } else {
            this.queryResultNumber = 1000;
            queryEditor['numRows'] = this.queryResultNumber;
          }
          const tempSelectedTabNum = this.selectedTabNum;
          this.workbenchService.updateQueryEditor(queryEditor)
            .then((result) => {
              // this.loadingBar.hide();
              // 로컬 스토리지에 저장된 쿼리 제거
              this.removeLocalStorage(this.selectedEditorId);
              // 실행 쿼리 찾기
              if (param === 'ALL') {
                queryEditor.query = this.getSelectedTabText();
              } else if (param === 'SELECTED') {
                if (this.getSelectedSqlTabText() === '') {
                  this.editor.getFocusSelection();
                  if (this.getSelectedSqlTabText() === '') {
                    Alert.info(this.translateService.instant('msg.bench.alert.no.selected.query'));
                    return;
                  }
                  queryEditor.query = this.getSelectedSqlTabText();
                } else {
                  queryEditor.query = this.getSelectedSqlTabText();
                }
              }

              // hive log view show
              if (this.mimeType == 'HIVE') {

                //쿼리 실행
                this.loadingBar.hide();

                // log 초기화
                (this.hiveLogs[0]) || (this.hiveLogs[0] = { isShow: true, log: [] });
                this.datagridCurList.push({ name: 'Loading..' });

                // 첫번째 로그 탭에서 선택 표시
                this.datagridCurList[0]['selected'] = true;

                // hive log cancel 여부
                this.isHiveLog = true;
                this.isHiveLogCancel = true;

                // console.error("selected push  ================================");

                this.safelyDetectChanges();


                // 쿼리 초기화
                this.runningQueryArr = [];
                this.runningQueryDoneIndex = 0;

                this.runningQueryEditor = queryEditor;

                let queryStrArr = queryEditor.query.split(';');

                // 전체 query data 생성
                for (let index: number = 0; index < queryStrArr.length; index++) {
                  if (queryStrArr[index].trim() != '') {
                    this.runningQueryArr.push(queryStrArr[index]);
                  }
                }

                queryEditor.query = this.runningQueryArr[0];

              }

              this.runSingleQueryWithInvalidQuery(queryEditor, tempSelectedTabNum, 0);

            })
            .catch((error) => {
              this.loadingBar.hide();
            });
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && this._executeSqlReconnectCnt <= 5) {
          // Alert.error(error.details);
          this.webSocketCheck(() => {
            this.setExecuteSql(param)
          });
        } else {
          Alert.error(error);
        }
      });
  }

  // run single query
  public runSingleQueryWithInvalidQuery(queryEditor, tempSelectedTabNum, selectedResultTabNum) {

    this.workbenchService.runSingleQueryWithInvalidQuery(queryEditor)
      .then((result) => {
        this.loadingBar.hide();

        try {

          if (this.mimeType == 'HIVE') {

            // 중지된 쿼리가 있을경우
            // if( this.isLogCancelTabQuery.length > 0 ){
            //   this.hiveLogFinish();
            //   return false;
            // }

            let tempArr: any[] = [];

            // log 시점때문에 더미로 추가된 데이터 제거
            for (let index: number = 0; index < this.datagridCurList.length; index++) {
              if (this.datagridCurList[index].name.startsWith('Loading')) {
                // console.error("Loading pop() ====================================");
                this.datagridCurList.pop();
              }
            }

            // 호출된 현재 그리드 목록 생성
            for (let index: number = 0; index < this.datagridCurList.length; index++) {
              tempArr.push(this.datagridCurList[index]);
            }
            tempArr.push(result[0]);
            result = tempArr;

            if (result.length > 0) {

              // Editor Selected Tab
              this.tempEditorSelectedTabNum = tempSelectedTabNum;

              // hive일 경우 단건 호출
              this.setHiveDatagridData(result, tempSelectedTabNum, selectedResultTabNum, this.runningQueryArr.length);


              // 데이터가 주석일 경우에만
              // if( this.runningQueryArr[this.runningQueryDoneIndex].trim().startsWith("--") ) {
              //
              //   if( isNullOrUndefined(this.runningQueryArr[this.runningQueryDoneIndex+1]) ){
              //     // finish
              //     // this.drawGridData(this.runningQueryDoneIndex);
              //     this.hiveLogFinish();
              //     return false;
              //   }
              //
              // }


            }

          } else {

            this.setDatagridData(result, tempSelectedTabNum);

          }  // end if - hive, else
        } catch (e) {
        }
      })
      .catch((error) => {
        this.loadingBar.hide();

        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }

        if( 'HIVE' === this.mimeType ) {
          this.logCancel(this.selectedGridTabNum);
        }
      });
  }


  // 에디터 풀 사이즈처리
  public resizeQueryEditor() {

    this.isQueryEditorFull = !this.isQueryEditorFull;

    this.onEndedResizing();

    // 에디터 슬라이드 계산
    this._calculateEditorSlideBtn();
  }

  // 선택한 탭에 대한 SQL Clear
  public clearSql() {
    this.setSelectedTabText('');
    // 쿼리 저장
    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    // 로컬 스토리지에 쿼리에 저장
    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
  }

  public confirmDelete() {

    console.log('confirm delete', event);
    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.ui.wb.del');
    modal.description = this.translateService.instant('msg.bench.ui.wb.del.description');

    this.deleteModalComponent.init(modal);

  }

  // 삭제
  public deleteWorkBench(isLoad?) {
    console.log('delete');
    if (isLoad) this.loadingShow();
    this.workbenchService.deleteWorkbench(this.workbenchId).then((result) => {
      Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
      this.loadingHide();
      this.router.navigate(['/workspace']);
    }).catch((error) => {
      this.loadingHide();
      if (!isUndefined(error.details)) {
        Alert.error(error.details);
      } else {
        Alert.error(error);
      }
    });
  }

  // 변수 추가
  public addEditorVariable(event) {
    // 선택되어 있는 탭에 텍스트가 없다면
    if (StringUtil.isEmpty(this.getSelectedTabText())) {
      // 선택된 탭 에디터에 TABLE SQL 주입
      this.setSelectedTabText(event);
    } else {
      // 에디터 포커싱 위치에 SQL 주입
      this.editor.insert(event);
    }

  }


  // 워크벤치 이름, 설명 수정하기
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
  }

  // 결과창 검색어 초기화
  public gridSearchClear(): void {
    this.searchText = '';

    if (this.mimeType != 'HIVE') {
      this.gridComponent.search(this.searchText);
    }
  }

  // 그리드 검색 실행
  public gridSearch(event: Event): void {

    // 키 코드가 escape 이라면
    if (this.isKeyCodeEscape(event)) {
      // 결과창 검색어 초기화
      this.gridSearchClear();
    }

    // 그리드가 생성되어 있지 않은 경우 return;
    if (typeof this.gridComponent === 'undefined') {
      return;
    }

    // 그리드 검색 함수 호출
    this.gridComponent.search(this.searchText);
  }

  // 에디터 컴포넌트에 TABLE SQL 주입
  public sqlIntoEditorEvent(tableSql: string): void {

    // 선택되어 있는 탭에 텍스트가 없다면
    // if (StringUtil.isEmpty(this.getSelectedTabText())) {
    //   // 선택된 탭 에디터에 TABLE SQL 주입
    //   this.setSelectedTabText(tableSql);
    // } else {
    // 에디터 포커싱 위치에 SQL 주입
    this.editor.insert(tableSql);
    // 쿼리 저장
    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    // 로컬 스토리지에 쿼리에 저장
    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
    // }
  }

  // 패널 사이즈 변경 - 드래그 한 후 사용자가 구분 기호를 놓을 때 발생
  public onEndedResizing(): void {
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
    // setTimeout(() => {
    // }, 50);
  }

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

  // form 으로 다운로드
  public downloadExcel(): void {
    this.csvDownloadLayer = true;
  }

  public downloadExcelClose(): void {
    this.csvDownloadLayer = false;
  }

  public setDownloadLocal() {
    this.csvDownloadLayer = false;
    if (typeof this.gridComponent !== 'undefined'
      && typeof this.gridComponent.dataView !== 'undefined'
      && this.gridComponent.getRows().length > 0) {
      this.loadingBar.show();
      this.gridComponent.csvDownload('result_' + Date.now().toString());
      this.loadingBar.hide();
    } else {
      this.loadingBar.hide();
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }
  }

  public downloadServerExcel() {
    // selected dataGrid
    const dataGrid = this.datagridCurList[this.selectedGridTabNum];
    // data grid 결과가 없을때 return
    if (isUndefined(dataGrid) || dataGrid.output === 'text') {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }
    try {
      let tempTableInfo = '';
      const that = this;

      if (!isUndefined(dataGrid.data.tempTable)) {
        tempTableInfo = dataGrid.data.tempTable;
      }
      const form = document.getElementsByTagName('form');
      const inputs = form[0].getElementsByTagName('input');
      inputs[0].value = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
      inputs[1].value = this.websocketId;
      inputs[2].value = 'result_' + Date.now().toString() + '.csv';
      inputs[3].value = dataGrid.data.runQuery;
      inputs[4].value = this.workbench.dataConnection.id;
      inputs[5].value = this.workbenchId;
      inputs[6].value = tempTableInfo;
      // this.loadingShow();
      this.loadingBar.show();
      const downloadCsvForm = $('#downloadCsvForm');
      downloadCsvForm.attr('action', CommonConstant.API_CONSTANT.API_URL + `queryeditors/${this.selectedEditorId}/query/download`);
      downloadCsvForm.submit();
      this.intervalDownload = setInterval(() => that.checkQueryStatus(), 1000);
    } catch (e) {
      // 재현이 되지 않음.
      console.info('다운로드 에러' + e);
    }
  }

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
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - 슬라이드 아이콘 관련
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터링된 탭 리스트
   * @param list
   * @param {EditorList} listObj
   */
  public getFilteringList(list: any, listObj: EditorList) {
    return list.slice(listObj.index, list.length);
  }

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
   * 쿼리 결과 리스트 보기
   */
  public onClickQueryResultList(): void {
    // 쿼리 결과가 있을 때만 창이 뜨도록
    if (!isUndefined(this.datagridCurList) && this.datagridCurList.length !== 0) {
      this.datagridListShow = true;
    }
  }

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

  /**
   * 워크벤치 에디터 단축키 보기 클릭 이벤트
   */
  public onClickShowShortcutsBtn(): void {
    this.shortcutsFl = true;
    this._questionLayout.nativeElement.style.top = this._questionWrap.nativeElement.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop + 34 + 'px';
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
            this.readQuery(this.workbenchTemp, this.workbenchTemp.queryEditors);
            this.webSocketLoginId = '';
            this.webSocketLoginPw = '';

            // connectWebSocket.call(this);
          }
          connectWebSocket.call(this);

          this.isDataManager = CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_DATASOURCE);

          this.setWorkbenchName();
          this.setWorkbenchDesc();

        } else {
          // 경고창 표시
          this.openAccessDeniedConfirm();
        }

      });

    }).catch((error) => {
      if (!isUndefined(error.details)) {
        Alert.error(error.details);
      } else {
        Alert.error(error);
      }
    });
  } // function - _loadInitData


  /**
   * 커넥션이 URL 타입인지
   * @returns {boolean}
   * @private
   */
  private _isUrlType(): boolean {
    return !StringUtil.isEmpty(this.workbench.dataConnection.url);
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
  }

  /**
   * 에디터 결과 슬라이드 버튼 계산
   * @param {boolean} indexInit
   * @private
   */
  private _calculateEditorResultSlideBtn(indexInit: boolean = false): void {
    // 에디터 리스트 객체에 list 전달
    this.editorResultListObj.list = this.datagridCurList;
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
  }

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
        .then((data) => {
          // 로컬 스토리지에서 쿼리 삭제
          this.removeLocalStorage(queryEditor.editorId);
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
   * 결과 수 가 지정되어있는지 판단
   * @returns {boolean}
   */
  private get isEnabledQueryResultNumber(): boolean {
    return !(isUndefined(this.queryResultNumber) || this.queryResultNumber <= 0);
  }


  /**
   * hive grid data 단건
   * @param data : response data
   * @param selectedNum : editor tab number
   * @param selectedResultTabNum : result tab number
   * @param totalResultNum : total result number
   */
  private setHiveDatagridData(data: any, selectedNum: number, selectedResultTabNum: number, totalResultNum: number) {

    this.datagridList = this.datagridList.filter(obj => obj.queryTabNum !== selectedNum);
    this.tabGridNum = 0;
    const that = this;
    for (let index: number = 0; index < data.length; index = index + 1) {

      // 선택된 데이터가 아닐경우 임시 데이터로 대체
      if (selectedResultTabNum != index) {
        this.datagridList.push(data[index]);
        continue;
      }

      // 최초 row 정보
      if (selectedResultTabNum == 0) {
        this.resultRow = data[selectedResultTabNum].numRows;
      }

      // 선택된 부분만 변경
      let selectedYn = false;
      if (totalResultNum === 0) {
        selectedYn = true;
        // this.resultTime = data.startDateTime - data.finishDateTime
      } else {
        selectedYn = false;
      }
      if (data[selectedResultTabNum].queryResultStatus === 'FAIL') {
        if (index === 0) { // 0 번쨰가 Fail 일 경우
          this.resultMode = 'text';
          this.resultTextOutput = data[selectedResultTabNum].message;
          this.isGridResultNoData = true;
        }
        const temp = {
          name: this.textList[selectedNum].name + '- ' + this.translateService.instant('msg.comm.ui.error') + ' ' + (selectedResultTabNum + 1),
          data: data[selectedResultTabNum],
          selected: selectedYn,
          output: 'text',
          message: data[selectedResultTabNum].message,
          queryTabNum: selectedNum,
          editorId: this.textList[selectedNum].editorId
        };
        this.tabGridNum = this.tabGridNum + 1;
        this.datagridList.push(temp);
      } else {
        if (index === 0) { // 0 번쨰가 SUCCESS 일 경우
          this.resultMode = 'grid';
          this.isGridResultNoData = false;
        }
        const temp = {
          name: this.textList[selectedNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (selectedResultTabNum + 1),
          data: data[selectedResultTabNum],
          selected: selectedYn,
          output: 'grid',
          message: '',
          queryTabNum: selectedNum,
          editorId: this.textList[selectedNum].editorId
        };
        this.tabGridNum = this.tabGridNum + 1;
        this.datagridList.push(temp);
      }
    }
    this.datagridCurList = this.datagridList.filter(obj => obj.editorId === this.selectedEditorId);

    // 에디터 결과 슬라이드 버튼 계산
    this._calculateEditorResultSlideBtn();

    if (this.selectedTabNum != selectedNum) {
      this.tabChangeHandler(selectedNum);
    } else {
      // this.drawGridData(selectedResultTabNum);
    }
  }


  private setDatagridData(data: any, selectedNum: number) {
    // this.datagridList = [];
    // this.datagridCurList = [];
    // this.datagridList = this.datagridList.filter(obj => obj.queryTabNum !== this.selectedTabNum);
    // 수정 -> 20180321 다른 탭 선택되어 있을 때.. 2번 실행하면 탭 두개 추가 되어 수정됨.
    // this.datagridList = this.datagridList.filter(obj => obj.editorId !== this.selectedEditorId);
    this.datagridList = this.datagridList.filter(obj => obj.queryTabNum !== selectedNum);

    this.tabGridNum = 0;
    const that = this;
    for (let index: number = 0; index < data.length; index = index + 1) {

      // if (data[index].hasOwnProperty('message')) {
      //   //Alert.error(data[index].message);
      //   this.datagridList.push(temp);
      // } else {
      let selectedYn = false;
      if (index === 0) {
        selectedYn = true;
        that.resultRow = data[index].numRows;
        // this.resultTime = data.startDateTime - data.finishDateTime
      } else {
        selectedYn = false;
      }
      if (data[index].queryResultStatus === 'FAIL') {
        if (index === 0) { // 0 번쨰가 Fail 일 경우
          this.resultMode = 'text';
          this.resultTextOutput = data[index].message;
        }
        const temp = {
          name: this.textList[selectedNum].name + '- ' + this.translateService.instant('msg.comm.ui.error') + ' ' + (index + 1),
          data: data[index],
          selected: selectedYn,
          output: 'text',
          message: data[index].message,
          queryTabNum: selectedNum,
          editorId: this.textList[selectedNum].editorId
        };
        this.tabGridNum = this.tabGridNum + 1;
        this.isGridResultNoData = true;
        this.datagridList.push(temp);
      } else {
        if (index === 0) { // 0 번쨰가 SUCCESS 일 경우
          this.resultMode = 'grid';
        }
        const temp = {
          name: this.textList[selectedNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (index + 1),
          data: data[index],
          selected: selectedYn,
          output: 'grid',
          message: '',
          queryTabNum: selectedNum,
          editorId: this.textList[selectedNum].editorId
        };
        this.tabGridNum = this.tabGridNum + 1;
        this.isGridResultNoData = false;
        this.datagridList.push(temp);
      }
    }
    // this.datagridCurList = this.datagridList.filter(obj => obj.queryTabNum === this.selectedTabNum);
    this.datagridCurList = this.datagridList.filter(obj => obj.editorId === this.selectedEditorId);
    // 에디터 결과 슬라이드 버튼 계산
    this._calculateEditorResultSlideBtn();

    if (this.selectedTabNum != selectedNum) {
      this.tabChangeHandler(selectedNum);
    } else {
      this.drawGridData(0);
    }
  }

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

  // 편집 모드
  private tabEditorMode() {
    console.log(this.textList[this.selectedTabNum]);
    this.textList[this.selectedTabNum]['editorMode'] = true;
    this.textList[this.selectedTabNum]['name'] = this.textList[this.selectedTabNum].name;
  }

  // 쿼리 에디터 Tab 값을 세팅한다.
  private readQuery(workBench: Workbench, queryEditors: any[]) {
    if (queryEditors.length === 0) {
      this.tabCreateHandler('', true, false);
    } else {
      const editors = queryEditors.sort((a, b) => {
        return a.order - b.order;
      });
      // 값 읽고 세팅 하기.
      for (let idx1: number = 0; idx1 < editors.length; idx1 = idx1 + 1) {
        // 로컬 스토리지에 저장된 쿼리가 있다면
        const localQuery = this.getLocalStorageQuery(editors[idx1].id);
        this.textList.push({
          name: editors[idx1].name,
          query: localQuery ? localQuery : editors[idx1].query,
          selected: false,
          editorId: editors[idx1].id,
          editorMode: false
        });

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
  }

  /**
   * Hive result toggle button event
   * @param selectedGridTabNum
   */
  public hiveLogToggleClick(selectedGridTabNum: number, type: string) {

    this.isHiveLogCancel = false;

    // data, log 타입 구분
    if (type == 'log') {
      this.hiveLogs[selectedGridTabNum].isShow = false;
      this.safelyDetectChanges();

      // 그리드 생성
      this.drawGridData(selectedGridTabNum);
    } else {

      // hive log cancel
      this.hiveLogs[selectedGridTabNum].isShow = true;
      this.safelyDetectChanges();
    }

  }

  /**
   * 워크벤치 웹 소켓 생성
   * @param {Function} callback
   */
  private createWebSocket(callback?: Function): void {
    this.workbench = this.workbenchTemp;
    this.websocketId = CommonConstant.websocketId;
    try {
      console.info('this.websocketId', this.websocketId);
      const headers: any = {
        'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      };
      // 메세지 수신
      (this._subscription) && (CommonConstant.stomp.unsubscribe(this._subscription));     // Socket 응답 해제
      this._subscription
        = CommonConstant.stomp.subscribe('/user/queue/workbench/' + this.workbenchId, (data) => {

          ( this.hiveLogCanceling ) || ( this.loadingBar.hide() );

          if (this.runningQueryDoneIndex == 0) {
            this.datagridCurList[0]['selected'] = true;
          }

          if ('HIVE' === this.mimeType && !isNullOrUndefined(data.queryIndex)) {

            // log 데이터 그리는 부분, done 인 부분으로 분리
            if ('LOG' === data.command && data.log.length != 0) {

              const currHiveLog = this.hiveLogs[this.runningQueryDoneIndex];

              // 시점상으로 취소 쿼리를 호출하였으나 넘어온 경우 예외처리
              // if( isUndefined(currHiveLog) ){
              //   this.hiveLogFinish();
              //   return false;
              // }

              currHiveLog.isShow = true;
              currHiveLog.log = currHiveLog.log.concat(data.log);

              const gridList = this.datagridCurList[this.runningQueryDoneIndex];
              gridList.name = 'Loading..';

              this.safelyDetectChanges();
              // log data 가 있을경우 scroll 이동
              const $logContainer = $('#workbenchHiveLogText');
              if ($logContainer.text() != '') {

                let textAreaHeight = $logContainer.height();
                let lineBreakLength = $logContainer.find('br').length;
                let offsetTop = textAreaHeight * (Math.ceil(lineBreakLength / 8));

                $logContainer.scrollTop(offsetTop);
              }

            } else if ('DONE' === data.command) {

              // 로그 결과가 미리 떨어지는 경우 대비
              setTimeout(() => this._hiveQueryDone(), 500);

            } // end if - command log, done

          }

          if (data['connected'] === true) {
            console.info('connected');
            this.databaseParam = {
              dataconnection: this.workbenchTemp.dataConnection,
              workbenchId: this.workbenchId,
              webSocketId: CommonConstant.websocketId
            };
          }

          (callback) && (callback.call(this));
      }, headers);
      // 메세지 발신
      const params = {
        username: this.webSocketLoginId,
        password: this.webSocketLoginPw
      };
      CommonConstant.stomp.send('/message/workbench/' + this.workbenchId + '/dataconnections/' + this.workbenchTemp.dataConnection.id + '/connect', params, headers);
    } catch (e) {
      console.info(e);
    }

  } // function - createWebSocket

  /**
   * hive query execute done
   * @return {boolean}
   * @private
   */
  private _hiveQueryDone() {

    if (this.isLogCancelTabQuery.length > 0) {
      this.hiveLogFinish();
      return false;
    }

    // 선택된 탭이 로그가 그려지고 있을경우 그리드 전환
    if (this.selectedGridTabNum == this.runningQueryDoneIndex) {

      this.datagridCurList[this.runningQueryDoneIndex]['selected'] = true;
      this.selectedGridTabNum = this.runningQueryDoneIndex;
      this.hiveLogs[this.runningQueryDoneIndex].isShow = false;
      this.safelyDetectChanges();

      this.drawGridData(this.runningQueryDoneIndex);
    }

    // 마지막 쿼리가 아닐경우 다음 쿼리 호출
    if (!isNullOrUndefined(this.runningQueryArr[this.runningQueryDoneIndex + 1])) {

      this.runningQueryDoneIndex++;
      this.hiveNextQueryExequte();

    } else {

      // finish
      this.hiveLogFinish();

    }

  } // function - _hiveQueryDone

  // hive connection 다음 쿼리 호출
  public hiveNextQueryExequte() {

    let nextIndex = this.runningQueryDoneIndex;

    // 로그와 데이터 response 통신 부분이 끝나는 시점이 정해져 있지 않기 때문에 강제로 탭을 추가
    // 이전 타이틀 변경 tab title 기존 으로 변경
    const gridList = this.datagridCurList[nextIndex - 1];
    gridList.name = this.textList[this.tempEditorSelectedTabNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (nextIndex);

    // 임시 tab 데이터 생성
    (this.hiveLogs[nextIndex]) || (this.hiveLogs[nextIndex] = { isShow: true, log: [] });
    this.datagridCurList.push({ name: 'Loading..' });

    // 다음 탭 log 화면 전환
    // this.selectedGridTabNum = nextIndex;
    // this.changeDetect.detectChanges();

    // 다음 탭 쿼리 호출
    this.runningQueryEditor.query = this.runningQueryArr[nextIndex];
    this.runSingleQueryWithInvalidQuery(this.runningQueryEditor, this.tempEditorSelectedTabNum, nextIndex);

  }

  // hive log DONE 종료
  public hiveLogFinish() {
    // 로그 취소된 경우 취소된 결과 탭을 선택 표시
    if( this.isLogCancelTabQuery.length > 0 ) {
      for (let index: number = 0; index < this.datagridCurList.length; index = index + 1) {
        this.datagridCurList[index]['selected'] = false;
      }
      this.datagridCurList[this.selectedGridTabNum]['selected'] = true;
    }

    this.isHiveQueryExecute = false;
    // 처음 쿼리를 취소한 경우
    if (this.datagridCurList.length == 0) {
      return false;
    }

    // finish
    // 시점때문에 변경 안된 tab title 기존 으로 변경
    for (let index: number = 0; index < this.datagridCurList.length; index = index + 1) {
      const gridList = this.datagridCurList[index];
      gridList.name = this.textList[this.tempEditorSelectedTabNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (index + 1);
    }

    this.runningQueryDoneIndex = -1;

    // 탭 닫힘 표시
    this.isHiveLog = false;
    this.isHiveLogCancel = false;
    this.safelyDetectChanges();
    this.setHiveTabLogs();

  }

  // set hive tab log
  public setHiveTabLogs() {

    for (let index: number = 0; index < this.hiveTabLogs.length; index = index + 1) {
      if (this.hiveTabLogs[index]['selectedTabNum'] == this.selectedTabNum) {
        this.hiveTabLogs.splice(index, 1);
        break;
      }
    }

    this.hiveTabLogs.push({
      selectedTabNum: this.selectedTabNum,
      data: this.hiveLogs
    });

  }

  // 에디터 컴포넌트 래핑 엘리먼트 높이 값 반환
  private getEditorComponentElementHeight() {

    // // 에디터 컴포넌트를 감싼 엘리먼트
    const editorWrapElement: Element = this.element.nativeElement
      .querySelector('.ddp-wrap-editor');
    //   .querySelector('.ace_editor');
    //
    // // 에디터 높이
    const editorHeight: number = editorWrapElement.clientHeight;

    // 전체 화면일 경우 계산
    if( this.isQueryEditorFull ) {
      const editorFullElement: Element = this.element.nativeElement
        .querySelector('.ddp-ui-query');
      const editorTabElement: Element = this.element.nativeElement
        .querySelector('.ddp-wrap-tabs-edit');

      return editorFullElement.clientHeight - editorTabElement.clientHeight;

    }


    // // 반환
    // return editorHeight;
    return editorHeight;
  }

  // 키 코드가 escape 이라면
  private isKeyCodeEscape(event: Event): boolean {
    return event['keyCode'] === 27;
  }

  // 에디터 컴포넌트 객체 가져오기
  // private getEditor(): CodemirrorComponent {
  //
  //   // 에디터 컴포넌트 객체 반환
  //   return this.editor;
  // }

  private drawGridData(idx: number) {

    // const data: any = this.datagridList[idx].data;
    const data: any = this.datagridCurList[idx].data;
    const headers: header[] = [];
    // data fields가 없다면 return
    if (!data || !data.fields) {
      // hive 일 경우 log 데이터 확인 필요
      if (this.mimeType == 'HIVE') {
        this.hiveLogs[idx].isShow = false;
        // hive 일 경우  field 한 번더 체크
        if (!data || !data.fields) {
          this.isHiveGridResultNoData = true;
          $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
        } else {
          this.isHiveGridResultNoData = false;
        }
        this.safelyDetectChanges();
        return false;
      }
      this.gridComponent.noShowData();
      $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
      this.isHiveGridResultNoData = true;
      this.isGridResultNoData = true;
      return false;
    } else {
      this.isHiveGridResultNoData = false;
      this.isGridResultNoData = false;
    }

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
      rows.push(row);
    }

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .CellExternalCopyManagerActivate(true)
      .DualSelectionActivate(true)
      .EnableSeqSort(true)
      .build()
    );

    if (this.searchText !== '') {
      this.gridSearchClear();
    }
  }

  // 탭이름 변경하기
  public tabLayerModify() {
    this.tabEditorMode();
    this.tabLayer = false;
  }

  // 탭 닫기
  public tabLayerDelete() {
    this.tabCloseHandler(this.selectedTabNum);
    this.tabLayer = false;
  }

  // 쿼리 cancel
  public setQueryCancel() {
    this.loadingBar.hide();
    clearInterval(this.intervalDownload);
    const params = {
      query: '',
      webSocketId: this.websocketId
    };
    this.workbenchService.setQueryRunCancel(this.selectedEditorId, params)
      .then(() => {

      })
      .catch((error) => {
        // this.commonExceptionHandler(error);
      });
  }

  // log cancel
  public logCancel(selectedGridTabNum) {

    this.hiveLogCanceling = true;
    this.safelyDetectChanges();

    this.loadingBar.show();

    // query cancel 호출
    const params = {
      // query: this.runningQueryArr[selectedGridTabNum],
      query: '',
      webSocketId: this.websocketId
    };
    this.workbenchService.setQueryRunCancel(this.selectedEditorId, params)
      .then(() => {

        Alert.success(this.translateService.instant('msg.bench.alert.log.cancel.success'));
        this.loadingBar.hide();

        console.info('logCancel setQueryRunCancel success');

        this.setQueryRunCancel(true, selectedGridTabNum);

      })
      .catch((error) => {

        Alert.error(this.translateService.instant('msg.bench.alert.log.cancel.error'));
        this.loadingBar.hide();

        console.info('logCancel setQueryRunCancel error');

        this.setQueryRunCancel(false, selectedGridTabNum);

      });

  }

  // query cancel
  public setQueryRunCancel(isSuccess: boolean, selectedGridTabNum: number) {

    this.hiveLogCanceling = false;
    this.isHiveQueryExecute = false;

    this.isLogCancelTabQuery.push(this.runningQueryArr[selectedGridTabNum]);

    const currHiveLog = this.hiveLogs[selectedGridTabNum];
    currHiveLog.isShow = true;
    if (isSuccess) {
      currHiveLog.log = currHiveLog.log.concat(this.translateService.instant('msg.bench.alert.log.cancel.success'));
    } else {
      currHiveLog.log = currHiveLog.log.concat(this.translateService.instant('msg.bench.alert.log.cancel.error'));
    }

    this.setHiveTabLogs();

    // console.error("cancel selectedGridTabNum ================================ : " + selectedGridTabNum);
    // console.error("this.datagridCurList.length ================================ : " + this.datagridCurList.length);

    // 시점상 탭 그려지기 이전에 취소한 경우 결과 탭을 생성
    if( isUndefined( this.datagridCurList[selectedGridTabNum] ) ){
      this.datagridCurList.push({name : this.textList[this.tempEditorSelectedTabNum].name + ' - ' + this.translateService.instant('msg.bench.ui.rslt') + (selectedGridTabNum + 1)});
      this.datagridCurList[selectedGridTabNum]['output'] = 'grid';
      this.datagridCurList[selectedGridTabNum]['selected'] = true;
      this.selectedGridTabNum = selectedGridTabNum;
    }

    this.isHiveLogCancel = false;
    this.isHiveLog = false;
    this.safelyDetectChanges();


  }

  // 뒤로 돌아가기
  public goBack() {
    // unload false
    this.useUnloadConfirm = false;
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    let cookieWorkspace = null;
    if (cookieWs) {
      cookieWorkspace = JSON.parse(cookieWs);
    }
    if (null !== cookieWorkspace) {
      this.router.navigate(['/workspace', cookieWorkspace['workspaceId']]);
    }
  }

  // sql 포맷터
  public setSqlFormatter() {

    let textAll: string = this.editor.value;
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
  }

  public replaceAll(str, find, replace) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  public escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }


  public createDatasource() {
    if (this.datagridCurList.length === 0) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    if (this.datagridCurList.length > 0) {
      if (this.datagridCurList[this.selectedGridTabNum].output === 'text') {
        Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
        return;
      }
    }

    this.connectionService.getDataconnectionDetail(this.workbench.dataConnection.id)
      .then((connection) => {
        const selectedSecurityType = [
          { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
          { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
          { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
        ].find(type => type.value === this.workbench.dataConnection.authenticationType) || {
          label: this.translateService.instant('msg.storage.li.connect.always'),
          value: 'MANUAL'
        };
        this.mainViewShow = false;
        this.mode = 'db-configure-schema';
        this.setDatasource = {
          connectionData: {
            connectionId: this.workbench.dataConnection.id,
            hostname: this.workbench.dataConnection.hostname,
            port: this.workbench.dataConnection.port,
            url: this.workbench.dataConnection.url,
            username: selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginId : connection.username,
            password: selectedSecurityType.value === 'DIALOG' ? this.webSocketLoginPw : connection.password,
            selectedDbType: this.getEnabledConnectionTypes(true)
              .find(type => type.value === this.workbench.dataConnection.implementor.toString()),
            selectedSecurityType: selectedSecurityType,
            selectedIngestionType: {
              label: this.translateService.instant('msg.storage.ui.list.ingested.data'),
              value: ConnectionType.ENGINE
            },
            isUsedConnectionPreset: true
          },
          databaseData: {
            selectedType: 'QUERY',
            selectedDatabaseQuery: this.workbench.dataConnection.database,
            queryText: this.datagridCurList[this.selectedGridTabNum]['data']['runQuery'],
            queryDetailData: {
              fields: this.datagridCurList[this.selectedGridTabNum]['data']['fields'],
              data: this.datagridCurList[this.selectedGridTabNum]['data']['data']
            }
          },
          workbenchFl: true
        };

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


  }

  // 데이터 생성 이후 complete로 들어오는 곳
  public createDatasourceComplete() {
    this.mainViewShow = true;
    this.mode = '';
  }

  public createDatasourceTemporary() {
    if (this.datagridCurList.length === 0) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    if (this.datagridCurList.length > 0) {
      if (this.datagridCurList[this.selectedGridTabNum].output === 'text') {
        Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
        return;
      }
    }

    this.loadingShow();
    this.connectionService.getDataconnectionDetail(this.workbench.dataConnection.id)
      .then((connection) => {
        // 로딩 hide
        this.loadingHide();
        this.createDatasourceTemporaryDetail(connection.username, connection.password, connection);
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
        Alert.error(error);
      });
  }

  public createDatasourceTemporaryDetail(id: string, pw: string, connection: any) {
    if (this.datagridCurList.length === 0) {
      Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
      return;
    }

    if (this.datagridCurList.length > 0) {
      if (this.datagridCurList[this.selectedGridTabNum].output === 'text') {
        Alert.info(this.translateService.instant('msg.bench.alert.no.result'));
        return;
      }
    }

    // 로딩 show
    this.loadingShow();

    // TODO JDBC
    // params
    // TODO published true 나중에 삭제할것
    this.pageEngineName = 'bulk_ingestion_' + Date.now();
    const param = {
      dsType: 'MASTER',
      connType: 'LINK',
      srcType: 'JDBC',
      granularity: 'DAY',
      segGranularity: 'MONTH',
      engineName: this.pageEngineName,
      name: this.pageEngineName,
      description: ''
    };


    // fields param
    let column = [];
    // 타임스탬프로 지정된 컬럼이 없을 경우
    const field = {
      name: 'current_datetime',
      type: 'TIMESTAMP',
      role: 'TIMESTAMP',
      format: 'yyyy-MM-dd HH:mm:ss',
      aggrType: 'NONE',
      biType: 'TIMESTAMP',
      logicalType: 'STRING'
    };
    column.push(field);

    column = column.concat(this.datagridCurList[this.selectedGridTabNum]['data']['fields']);
    let seq = 0;
    column.forEach((item) => {
      item['seq'] = seq;
      seq += 1;

      // ingestion rule 이 존재시
      if (item['ingestionRule']) {
        const type = item.ingestionRule.type;

        switch (type) {
          case 'default':
            delete item['ingestionRule'];
            break;
          case 'discard':
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

    const selectedSecurityType = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ].find(type => type.value === connection.authenticationType) || {
      label: this.translateService.instant('msg.storage.li.connect.always'),
      value: 'MANUAL'
    };

    // ingestion param
    const connInfo: Dataconnection = this.workbench.dataConnection;
    param['ingestion'] = {
      type: 'link',
      connection: {
        implementor: connInfo.implementor,
        type: connInfo.type,
        hostname: connInfo.hostname,
        port: connInfo.port,
        url: connInfo.url,
        database: connInfo.database,
        authenticationType: this.authenticationType,
        catalog: connInfo.catalog,
        sid: connInfo.sid,
        connectUrl: this._isUrlType() ? connInfo.url : ('jdbc:' + connInfo.implementor.toString().toLowerCase() + '://' + connInfo.hostname + ':' + connInfo.port + '/' + connInfo.database),
      },
      database: connInfo.database,
      dataType: 'QUERY',
      query: this.datagridCurList[this.selectedGridTabNum]['data']['runQuery']
    };

    if (selectedSecurityType.value === 'DIALOG') {
      param['ingestion'].connectionUsername = this.webSocketLoginId;
      param['ingestion'].connectionPassword = this.webSocketLoginPw;
    } else if (selectedSecurityType.value === 'MANUAL') {
      param['ingestion'].connection.username = id;
      param['ingestion'].connection.password = pw;
    }


    this.loadingShow();
    this.datasourceService.createDatasourceTemporary(param).then((tempDsInfo) => {
      this.setPageWidget(tempDsInfo);
      setTimeout(() => this.loadingHide(), 500);
    }).catch((error) => {
      this.loadingHide();
      // 로딩 hide
      if (!isUndefined(error.message)) {
        Alert.error(error.message);
      }
    });
  }

  /**
   * 차트 미리보기를 위한 페이지 위젯 정보 구성
   * @param {Object} temporary
   */
  public setPageWidget(temporary: Object) {
    const tempWidget = new PageWidget();

    // 데이터소스 구성
    const boardDataSource: BoardDataSource = new BoardDataSource();
    {
      boardDataSource.id = temporary['dataSourceId'];
      boardDataSource.type = 'default';
      boardDataSource.name = temporary['name']; // this.pageEngineName;
      boardDataSource.engineName = temporary['name']; // this.pageEngineName;
      boardDataSource.connType = 'LINK';
      boardDataSource.temporary = true;
      // boardDataSource.fields = this.datagridList[this.selectedGridTabNum]['data']['fields'];
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
      let fields = this.datagridCurList[this.selectedGridTabNum]['data']['fields'];

      const currentDateTimeField: Field = new Field();
      currentDateTimeField.name = 'current_datetime';
      currentDateTimeField.biType = BIType.TIMESTAMP;
      currentDateTimeField.logicalType = LogicalType.TIMESTAMP;
      currentDateTimeField.dataSource = boardDataSource.engineName;
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
        datasource.name = temporary['name'];
        datasource.engineName = temporary['name'];
        dashboard.dataSources = [datasource];
      }

      tempWidget.dashBoard = dashboard;
    }

    this.selectedPageWidget = tempWidget;
    this.mainViewShow = false;
    this.isShowPage = true;
  } // function - setPageWidget

  // text editor 선택하기.
  public setTextListTab(id: number) {
    console.info('setTextListTab - id', id);
    this.textListShow = false;
    if (id === 0) {
      this.tabChangeHandler(0, false);
      return;
    }
    const temp = this.textList[id];
    this.textList.splice(id, 1);
    this.textList.splice(0, 0, temp);

    for (let i: number = 0; i < this.datagridList.length; i = i + 1) {
      const item = this.datagridList[i];
      if (item.queryTabNum === id) {
        item.queryTabNum = 0;
      } else if (item.queryTabNum < id) {
        item.queryTabNum = item.queryTabNum + 1;
      } else if (item.queryTabNum > id) {
        // skip
      }
    }
    this.datagridCurList = this.datagridList.filter(obj => obj.queryTabNum === 0);

    if (this.datagridCurList.length !== 0) {
      const gridIndex = _.findIndex(this.datagridCurList, { selected: true });
      this.drawGridData(gridIndex !== -1 ? gridIndex : 0);
    }

    // this.tabChangeHandler(0, false);
    // 모든 에디터 내용 저장
    this._saveAllQueryEditor();

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
    this.saveLocalStorageGeneral();
  }

  public setdataGridListTab(id: number) {
    this.datagridListShow = false;
    if (id === 0) {
      this.tabGridChangeHandler(0);
      return;
    }
    const temp = this.datagridCurList[id];
    this.datagridCurList.splice(id, 1);
    this.datagridCurList.splice(0, 0, temp);
    this.tabGridChangeHandler(0);
  }

  // 결과창 reset
  public resultRest() {
    this.datagridList = [];
    this.tabGridNum = 0;
    this.selectedGridTabNum = 0;
    this.resultMode = '';
  }


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
    const param = {
      workbench: this.workbench,
      workbenchId: this.workbenchId,
      websocketId: this.websocketId,
      textList: this.textList
    };
    this.schemaBrowserComponent.init(param);
  }

  /**
   * 그리드 로우 전체 선택
   */
  public gridAllSelection(): void {
    this.gridComponent.allSelection();
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

  /**
   * hive query 실행시 warning
   */
  public alertHiveQueryExecuting() {
    Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
    return false;
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
