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

import Split from 'split.js'
import {AbstractComponent} from '@common/component/abstract.component';
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
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {GridOption} from '@common/component/grid/grid.option';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchService} from './service/workbench.service';
import {QueryEditor, Workbench} from '@domain/workbench/workbench';
import {Alert} from '@common/util/alert.util';
import {CommonConstant} from '@common/constant/common.constant';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {Modal} from '@common/domain/modal';
import {UserDetail} from '@domain/common/abstract-history-entity';
import {StringUtil} from '@common/util/string.util';
import {CookieConstant} from '@common/constant/cookie.constant';
import {isNullOrUndefined, isUndefined} from 'util';
import {LoadingComponent} from '@common/component/loading/loading.component';
import {DatasourceService} from '../datasource/service/datasource.service';
import {PageWidget} from '@domain/dashboard/widget/page-widget';
import {BoardConfiguration, BoardDataSource, Dashboard} from '@domain/dashboard/dashboard';
import {ConnectionType, Datasource, Field, IngestionRuleType} from '@domain/datasource/datasource';
import {Workbook} from '@domain/workbook/workbook';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {CommonUtil} from '@common/util/common.util';
import * as _ from 'lodash';
import {DetailWorkbenchSchemaBrowserComponent} from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';
import {SYSTEM_PERMISSION} from '@common/permission/permission';
import {PermissionChecker, Workspace} from '@domain/workspace/workspace';
import {WorkspaceService} from '../workspace/service/workspace.service';
import {CodemirrorComponent} from './component/editor-workbench/codemirror.component';
import {SaveAsHiveTableComponent} from './component/save-as-hive-table/save-as-hive-table.component';
import {Message} from '@stomp/stompjs';
import {AuthenticationType, Dataconnection, InputMandatory, InputSpec} from '@domain/dataconnection/dataconnection';

declare let moment: any;

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styles: ['.split, .gutter.gutter-horizontal { float: left; } .gutter.gutter-horizontal { cursor: ew-resize; }']
})
export class WorkbenchComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  private MAX_LINES: number = 20;

  private _gridScrollEvtSub: any;

  @ViewChild('main')
  private gridComponent: GridComponent;

  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  @ViewChild(CodemirrorComponent)
  private editor: CodemirrorComponent;

  @ViewChild(LoadingComponent)
  private loadingBar: LoadingComponent;

  private selectedTabNum: number = 0;

  private websocketId: string;

  private webSocketLoginId: string = '';

  private webSocketLoginPw: string = '';

  @ViewChild(DetailWorkbenchSchemaBrowserComponent)
  private schemaBrowserComponent: DetailWorkbenchSchemaBrowserComponent;

  @ViewChild('editorListTabs')
  private _editorListTabs: ElementRef;

  @ViewChild('editorListMax')
  private _editorListMax: ElementRef;

  @ViewChild('editorListSizeBtn')
  private _editorListSizeBtn: ElementRef;

  @ViewChild('editorResultListTabs')
  private _editorResultListTabs: ElementRef;

  @ViewChild('editorResultListMax')
  private _editorResultListMax: ElementRef;

  @ViewChild(SaveAsHiveTableComponent)
  private saveAsHiveTableComponent: SaveAsHiveTableComponent;

  private _executeSqlReconnectCnt: number = 0;
  private _checkQueryStatusReconnectCnt: number = 0;

  private _subscription: any;

  private _resizeTimer: any;
  private _tooltipTimer: any;

  private _splitVertical: any;
  private _splitHorizontal: any;

  private _initialTimer: any;

  public editorListObj = new EditorList();

  public editorResultListObj = new EditorList();

  public workbenchId: string;

  public workbench: Workbench = new Workbench();

  public workbenchTemp: Workbench = new Workbench();

  public isWorkbenchOptionShow: boolean = false;

  public options: any = {
    maxLines: this.MAX_LINES,
    printMargin: false,
    setAutoScrollEditorIntoView: true,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  };

  public text: string = '';

  public textList: any[] = [];

  public totalResultTabList: ResultTab[] = [];

  public selectedEditorId: string;
  public executeEditorId: string;
  public runningResultTabId: string;

  public isLeftMenuOpen: boolean = true;

  public isDataConnectionInfoShow: boolean = false;

  public isGlobalVariableMenuShow: boolean = false;

  public isQueryHistoryMenuShow: boolean = false;

  public isNavigationMenuShow: boolean = false;

  public isQueryEditorFull: boolean = false;

  public searchText: string = '';

  public loginLayerShow: boolean = false;

  public isWorkbenchNameEditMode: boolean = false;

  public isWorkbenchDescEditMode: boolean = false;

  public databaseParam: any;

  public tableParam: any;

  public tabLayer: boolean = false;

  public tabLayerX: string = '';

  public tabLayerY: string = '';

  public allQuery: string = 'ALL';

  public mode: string = '';

  public setDatasource: any = {};

  public isShowPage: boolean = false;

  public selectedPageWidget: PageWidget;

  public pageEngineName: string = '';

  public authenticationType: string = '';

  public intervalDownload: any;

  public workbenchName: string;
  public workbenchDesc: string;

  public mainViewShow: boolean = true;

  public isSearchLink: boolean = false;

  public isDataManager: boolean = false;

  @ViewChild('wbName')
  private wbName: ElementRef;
  @ViewChild('wbDesc')
  private wbDesc: ElementRef;

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
      Tab: 'indentMore',
      'Shift-Ctrl-Space': 'autocomplete',
      'Cmd-Alt-Space': 'autocomplete'
    },
    hintOptions: {
      tables: {}
    }
  };
  // H2, HIVE, ORACLE, TIBERO, MYSQL, MSSQL, PRESTO, FILE, POSTGRESQL, GENERAL;
  public mimeType: string = 'HIVE';

  public isChangeAuthUser: boolean = false;

  public shortcutsFl: boolean = false;

  public executeTabIds: string[] = [];

  public currentRunningIndex: number = -1;

  public isExecutingQuery: boolean = false;

  public isCanceling: boolean = false;
  public isCanceled: boolean = false;

  public isFocusResultTooltip: boolean = false;

  public isAgentUserMacOs: boolean = false;

  public tableSchemaParams: any;
  public isOpenTableSchema: boolean = false;

  public isQueryHistoryLogPopup: boolean = false;

  public queryHistoryItem: any;

  public isQueryHistoryDeletePopup: boolean = false;

  public isQueryHistoryDelete: boolean = false;

  public isFootAreaPopupCheck: boolean = false;

  public saveAsLayer: boolean = false;
  public supportSaveAsHiveTable: boolean = false;

  public connTargetImgUrl: string = '';

  public hideResultButtons: boolean = false;

  private _cancelTimer;
  public isCancelAvailable: boolean = false;

  constructor(private workspaceService: WorkspaceService,
              protected activatedRoute: ActivatedRoute,
              protected workbenchService: WorkbenchService,
              protected connectionService: DataconnectionService,
              protected datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  public ngOnInit() {
    super.ngOnInit();

    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) === '') {
      this.router.navigate(['/user/login']).then();
    }
    this.workbench.modifiedBy = new UserDetail();
    this.workbench.createdBy = new UserDetail();

    this.activatedRoute.params.subscribe((params) => {
      this.workbenchId = params['id'];
    });

    (navigator.userAgent.replace(/ /g, '').toUpperCase().indexOf('MAC') === -1 ? this.isAgentUserMacOs = false : this.isAgentUserMacOs = true);
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();

    this.sendViewActivityStream(this.workbenchId, 'WORKBENCH');

    const $connLabel = this.$element.find('.ddp-ui-benchlnb');
    $connLabel.css('min-width', '280px');

    this._initialTimer
      = setTimeout(() => {
      this.loadingBar.hide();
      this.loadingShow();
      this._loadInitData(() => {
        if (this.loginLayerShow) {
          this.loadingHide();
        } else {
          this.webSocketCheck(() => this.loadingHide());
        }

        if (0 < $('.sys-workbench-top-panel').length && 0 < $('.sys-workbench-bottom-panel').length) {
          this._splitVertical = Split(['.sys-workbench-top-panel', '.sys-workbench-bottom-panel'], {
            direction: 'vertical',
            onDragEnd: () => {
              this.isFootAreaPopupCheck = true;
              this.onEndedResizing();
            }
          });
          this.onEndedResizing();
          $connLabel.css('min-width', '');
          this._activeHorizontalSlider();
        }
      });
    }, 500);
  }

  public webSocketCheck(callback?: () => void) {
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
  }

  public ngOnDestroy() {
    super.ngOnDestroy();

    if (this._initialTimer) {
      clearTimeout(this._initialTimer);
      this._initialTimer = undefined;
    }

    if (this._splitVertical) {
      this._splitVertical.destroy();
      this._splitVertical = undefined;
    }
    this._deactiveHorizontalSlider();

    if (this._gridScrollEvtSub) {
      this._gridScrollEvtSub.unsubscribe();
      this._gridScrollEvtSub = undefined;
    }

    (this._subscription) && (this._subscription.unsubscribe());

    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) !== '' && CommonConstant.stomp) {
      CommonConstant.stomp.publish(
        {
          destination: '/message/workbench/' + this.workbenchId + '/dataconnections/' + this.workbench.dataConnection.id + '/disconnect',
          headers: {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)}
        }
      );

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
            this.removeLocalStorage(this.selectedEditorId);
          })
          .catch(() => {
            this.loadingHide();
          });
      }
    }
  }

  @HostListener('window:resize')
  public onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this.onEndedResizing();
    }, 500);
  }

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
  }

  public closeTableSchema() {
    document.getElementById(`workbenchQuery`).className = 'ddp-ui-query';
    this.isOpenTableSchema = false;
    const leftWidthRatio: number = ($('.ddp-view-benchlnb').width() / $(document).width()) * 100;
    this._splitHorizontal.setSizes([leftWidthRatio, 100 - leftWidthRatio]);
  }

  public saveLocalStorage(value: string, editorId: string): void {
    localStorage.setItem('workbench' + this.workbenchId + editorId, value);
  }

  public removeLocalStorage(editorId: string): void {
    localStorage.removeItem('workbench' + this.workbenchId + editorId);
  }

  public getLocalStorageQuery(editorId: string) {
    return localStorage.getItem('workbench' + this.workbenchId + editorId);
  }

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

  public removeLocalGeneral(): void {
    localStorage.removeItem('workbench-general-' + this.workbenchId);
  }

  public getLocalStorageGeneral() {
    return JSON.parse(localStorage.getItem('workbench-general-' + this.workbenchId));
  }

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

    // TODO The connection has not been established error
    try {
      this.webSocketCheck(() => {
      });
    } catch (e) {
      console.log(e);
    }
  }

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
        this.textList.push({
          selected: selectedParam,
          name: queryEditor.name,
          query: text === '' ? '' : text,
          editorId: data.id,
          index: data.index,
          editorMode: false
        });
        this._calculateEditorSlideBtn();
        this.selectedTabNum = this.textList.length - 1;
        this.saveLocalStorageGeneral();
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

  public closeEditorTab(tabNum) {
    if (this.textList.length === 1) {
      Alert.warning(this.translateService.instant('msg.bench.alert.close.editortab.fail'));
      return;
    }

    this.workbenchService.deleteQueryEditor(this.textList[tabNum]['editorId'])
      .then(() => {
      })
      .catch((error) => {
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });

    this.textList.splice(tabNum, 1);

    this._calculateEditorSlideBtn(true);

    if (this.textList.length === 1) {
      this.selectedTabNum = 0;
    } else {
      if (this.textList.length <= tabNum) {
        this.selectedTabNum = this.textList.length - 1;
      } else {
        this.selectedTabNum = tabNum;
      }
    }

    if (this.textList.length > 0) {
      this._saveAllQueryEditor();
      for (let index: number = 0; index < this.textList.length; index = index + 1) {
        if (index === 0) {
          this.textList[index]['selected'] = true;
          this.selectedTabNum = index;
          this.selectedEditorId = this.textList[index]['editorId'];
          this.setSelectedTabText(this.textList[index]['query']);
          this.selectedTabNum = index;
        } else {
          this.textList[index]['selected'] = false;
        }
      }

      const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
      if (0 < currentEditorResultTabs.length) {
        this.drawGridData();
      }
    }
    this.saveLocalStorageGeneral();
  }

  public tabLayerBlur(item, $event) {
    if (item['editorMode']) {
      this.tabLayerEnter($event);
    }
  }

  public tabLayerEnter($event) {
    if ($event.target.value === '') {
      Alert.warning(this.translateService.instant('msg.bench.ui.query.tab.title'));
    } else {
      this.textList[this.selectedTabNum]['editorMode'] = false;
      this.textList[this.selectedTabNum]['name'] = $event.target.value;

      const queryEditor: QueryEditor = new QueryEditor();
      queryEditor.editorId = this.textList[this.selectedTabNum].editorId;
      queryEditor.name = this.textList[this.selectedTabNum].name;
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = this.textList[this.selectedTabNum].order;
      queryEditor.query = this.textList[this.selectedTabNum].query;
      this.workbenchService.updateQueryEditor(queryEditor)
        .then(() => {
          this.removeLocalStorage(queryEditor.editorId);
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
  }

  public closeResultTab(tabId: string) {

    let currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();

    if (currentEditorResultTabs.length === 1) {
      this._removeResultTab(tabId);
      this.gridSearchClear();
      return;
    }

    this.gridSearchClear();

    const removeIdx: number = currentEditorResultTabs.findIndex(item => item.id === tabId);

    this._removeResultTab(tabId);

    if (this.editorResultListObj.index === 0) {
      this.safelyDetectChanges();
      this.editorResultListObj.showBtnFl = this._isEditorResultMaxWidth();
    }

    currentEditorResultTabs = this._getCurrentEditorResultTabs();
    if (currentEditorResultTabs.length > 0) {
      let targetIdx: number = removeIdx - 1;
      (0 > targetIdx) && (targetIdx = 0);
      const showTabInfo: ResultTab = currentEditorResultTabs[targetIdx];
      this.changeResultTabHandler(showTabInfo.id);
    }
  }

  public tabChangeHandler(selectedTabNum: number, deleteFlag: boolean = false, selectedItem?: any): void {

    if (!isUndefined(this.selectedEditorId) && deleteFlag === false) {
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
        })
        .catch((error) => {
          // this.loadingHide();
          if (!isUndefined(error.details)) {
            Alert.error(error.details);
          } else {
            Alert.error(error);
          }
        });
    }

    if (selectedItem && selectedItem['selected'] && selectedItem['editorMode']) {
      return;
    }

    for (let index: number = 0; index < this.textList.length; index = index + 1) {
      if (index === selectedTabNum) {
        this.textList[index]['selected'] = true;
        this.selectedTabNum = index;
        this.selectedEditorId = this.textList[this.selectedTabNum]['editorId'];
        this.setSelectedTabText(this.textList[this.selectedTabNum]['query']);
        this.selectedTabNum = index;
      } else {
        this.textList[index]['selected'] = false;
      }
    }

    this.safelyDetectChanges();

    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();

    this._calculateEditorResultSlideBtn(true);

    if (currentEditorResultTabs.length > 0) {

      currentEditorResultTabs.forEach(item => item.showLog = false);

      let resultTab = currentEditorResultTabs.find(tabItem => tabItem.selected);
      if (!resultTab) {
        resultTab = currentEditorResultTabs[0];
        resultTab.selected = true;
      }

      this.changeResultTabHandler(resultTab.id);

    }
    if (selectedItem) {
      this.saveLocalStorageGeneral();
    }
  }

  public showResultTabTooltip(event: MouseEvent, _idx: number) {
    event.stopPropagation();

    const resultTab = 'LI' === event.target['tagName'] ? $(event.target) : $(event.target).closest('li');
    (this._tooltipTimer) && (clearTimeout(this._tooltipTimer));
    if (resultTab.offset().left > $(window).outerWidth() / 2) {
      this._tooltipTimer = setTimeout(() => {
        resultTab.find('.ddp-box-tabs-popup').show().css({
          right: '-10px',
          left: 'inherit'
        });
      }, 1500);
    } else {
      this._tooltipTimer = setTimeout(() => {
        resultTab.find('.ddp-box-tabs-popup').show();
      }, 1500);
    }

  }

  public hideResultTabTooltip(event: MouseEvent) {
    event.stopPropagation();
    if (this._tooltipTimer) {
      clearTimeout(this._tooltipTimer);
      this._tooltipTimer = null;
    }
    setTimeout(() => {
      (this.isFocusResultTooltip) || ($('.ddp-box-tabs-popup:visible').hide());
    }, 500);
  }

  public changeResultTabHandler(selectedTabId: string) {

    this.hideResultButtons = false;

    let selectedTab: ResultTab = null;
    const currentEditorResultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    currentEditorResultTabs.forEach((tabItem: ResultTab) => {
      if (tabItem.id === selectedTabId) {

        tabItem.selected = true;

        if (isNullOrUndefined(tabItem.result)) {
          tabItem.showLog = true;
        } else {
          tabItem.showLog = false;
          if (isNullOrUndefined(tabItem.result.data)) {
            $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
          }
        }
        selectedTab = tabItem;

      } else {
        tabItem.selected = false;
      }
    });

    (selectedTab.showLog) || (this.drawGridData());

    this.safelyDetectChanges();
  }

  public editorKeyEvent(event) {
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

    const saveQuery: string = this.getLocalStorageQuery(this.selectedEditorId);
    const currQuery: string = this.getSelectedTabText();
    if (this.textList.length !== 0 && saveQuery !== currQuery) {
      if (saveQuery && currQuery
        && saveQuery.replace(/\s/gi, '') !== currQuery.replace(/\s/gi, '')) {
        this.useUnloadConfirm = true;
      }
      this.textList[this.selectedTabNum]['query'] = currQuery;
      this.saveLocalStorage(currQuery, this.textList[this.selectedTabNum]['editorId']);
    }
  }

  public editorTextChange(param: string) {
    this.textList[this.selectedTabNum]['query'] = param;
  }

  public leftMenuOpen() {
    this.isLeftMenuOpen = !this.isLeftMenuOpen;

    this._toggleHorizontalSlider();

    this._calculateEditorSlideBtn();
    this._calculateEditorResultSlideBtn();
  }

  public dataConnectionInfoShow(event: MouseEvent) {

    this.isDataConnectionInfoShow = !this.isDataConnectionInfoShow;
    this.safelyDetectChanges();

    const target = $(event.target);
    const infoLeft: number = target.offset().left;
    const infoTop: number = target.offset().top;
    const element = document.getElementById(`dataConnectionInfo`);
    $(element).css({left: infoLeft - 30, top: infoTop + 17});

  }

  public setInitDatabase($event) {
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

    this.setUserInfoTableParam();

    this.closeEvent = {name: 'closeSchema'};
  }

  public setChangeDatabase($event) {
    this.workbench.dataConnection.database = $event;
    this.tableParam = {
      dataconnection: this.workbench.dataConnection,
      webSocketId: this.websocketId
    };

    this.setUserInfoTableParam();

    this.saveLocalStorageGeneralSchema();

    this.closeEvent = {name: 'closeSchema'};
  }

  public openGlobalVariableMenu() {
    this.isGlobalVariableMenuShow = !this.isGlobalVariableMenuShow;
    this.isNavigationMenuShow = false;
  }

  public openNavigationMenu() {
    this.isNavigationMenuShow = !this.isNavigationMenuShow;
    this.isGlobalVariableMenuShow = false;
  }

  public showOption() {
    this.isWorkbenchOptionShow = !this.isWorkbenchOptionShow;
  }

  public openQueryHistoryMenu() {
    this.isQueryHistoryMenuShow = !this.isQueryHistoryMenuShow;
    this.shortcutsFl = false;
    this.isQueryHistoryDelete = false;
  }

  public openShowShortcutsMenu() {
    this.shortcutsFl = !this.shortcutsFl;
    this.isQueryHistoryMenuShow = false;
  }

  public checkFooterPopup() {
    if (this.isFootAreaPopupCheck || this.isQueryHistoryLogPopup || this.isQueryHistoryDeletePopup) {
      this.isFootAreaPopupCheck = false;
      return false;
    }
    this.shortcutsFl = false;
    this.isQueryHistoryMenuShow = false;
  }

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
    this._executeSqlReconnectCnt++;

    this.isExecutingQuery = true;
    this.executeTabIds = [];
    this.isCanceling = false;
    this.isCanceled = false;
    this.executeEditorId = this.selectedEditorId;
    this.editorResultListObj = new EditorList();
    this._clearCurrentEditorResultTabs();

    this.allQuery = param;

    const queryEditor: QueryEditor = new QueryEditor();
    let runningQuery: string = '';
    {
      queryEditor.name = this.textList[this.selectedTabNum]['name'];
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = this.selectedTabNum;
      queryEditor.query = this.getSelectedTabText();
      queryEditor.webSocketId = this.websocketId;
      queryEditor.editorId = this.textList[this.selectedTabNum]['editorId'];

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
        this._executeSqlReconnectCnt = 0;

        if (result === 'RUNNING' || result === 'CANCELLED') {
          Alert.warning(this.translateService.instant('msg.bench.ui.query.run'));
          this.isExecutingQuery = false;
          this.loadingBar.hide();
          return;
        } else {
          this.workbenchService.updateQueryEditor(queryEditor)
            .then(() => {

              const queryStrArr: string[]
                = runningQuery.replace(/--.*/gmi, '').replace(/#.*/gmi, '').split(';').filter(item => !/^\s*$/.test(item));

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

        if (error.code && error.code === 'WB0002') {
          this.stomp.initAndConnect();
        }

        if (!isUndefined(error.details) && this._executeSqlReconnectCnt <= 5) {
          this.webSocketCheck(() => {
            this.setExecuteSql(param);
          });
        } else {
          this._executeSqlReconnectCnt = 0;
          Alert.error(error.message);
        }
      });

  }

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

    // disable cancel in 5 sec
    this.setCancelButtonTimer(5);

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
        }

      });
  }

  public retryQuery(item: ResultTab) {

    this.isExecutingQuery = true;
    this.isCanceling = false;
    this.isCanceled = false;
    this.executeTabIds = [];
    this.executeEditorId = item.editorId;

    this.workbenchService.checkConnectionStatus(item.editorId, this.websocketId)
      .then((result) => {
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

        if (error.code && error.code === 'WB0002') {
          this.stomp.initAndConnect();
        }

        if (!isUndefined(error.details) && this._executeSqlReconnectCnt <= 5) {
          this.webSocketCheck(() => {
            this.retryQuery(item);
          });
        } else {
          this._executeSqlReconnectCnt = 0;
          Alert.error(error);
        }
      });
  }

  public changeResultPage(targetTab: ResultTab, direction: 'PREV' | 'NEXT') {

    this.loadingBar.show();
    this.safelyDetectChanges();

    const editorId = targetTab.editorId;
    const csvFilePath = targetTab.result.csvFilePath;
    const fieldList = targetTab.result.fields;

    if (direction === 'PREV') {
      targetTab.pageNum--;
    } else {
      targetTab.pageNum++;
    }

    this.workbenchService.runQueryResult(editorId, csvFilePath, targetTab.result.defaultNumRows, targetTab.pageNum, fieldList)
      .then((result) => {
        try {
          targetTab.result.data = result;
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
  }

  public resizeQueryEditor() {
    this.isQueryEditorFull = !this.isQueryEditorFull;

    const element = $('html');
    (this.isQueryEditorFull ? element.addClass('ddp-width-auto') : element.removeClass('ddp-width-auto'));

    this._toggleHorizontalSlider();
    this.onEndedResizing();
  }

  public clearSql() {
    this.checkFooterPopup();
    this.setSelectedTabText('');
    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();
    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
  }

  public confirmDelete() {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.ui.wb.del');
    modal.description = this.translateService.instant('msg.bench.ui.wb.del.description');

    this.deleteModalComponent.init(modal);

  }

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
  }

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

  public gridSearchClear(): void {
    this.searchText = '';
    (this.gridComponent) && (this.gridComponent.search(this.searchText));
  }

  public gridSearch(event: KeyboardEvent): void {

    if (27 === event.keyCode) {
      this.gridSearchClear();
    }

    if (typeof this.gridComponent === 'undefined') {
      return;
    }

    this.gridComponent.search(this.searchText);
  }

  public sqlIntoEditorEvent(tableSql: string): void {
    this.editor.insert(tableSql);
    this.checkSaveQuery();
  }

  public columnIntoEditorEvent(tableSql: string): void {
    this.editor.insertColumn(tableSql);
    this.checkSaveQuery();
  }

  public sqlQueryPopupEvent(item: any) {
    this.isQueryHistoryLogPopup = true;
    this.queryHistoryItem = item;
  }

  public deleteQueryHistory() {
    this.isQueryHistoryDelete = true;
    this.isQueryHistoryDeletePopup = false;
  }

  public onEndedResizing(): void {

    this.safelyDetectChanges();

    const editorHeight = this.getEditorComponentElementHeight();

    this.editor.resize(editorHeight);

    if (typeof this.gridComponent !== 'undefined'
      && typeof this.gridComponent.dataView !== 'undefined'
      && this.gridComponent.dataView.getItems().length > 0) {
      this.gridComponent.resize();
    }

    this._calculateEditorSlideBtn();
    this._calculateEditorResultSlideBtn();

  }

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

  public downloadExcel(): void {

    const dataGrid: ResultTab = this._getCurrentResultTab();

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

      $('#' + $('#downloadCsvForm').attr('target')).off('load').on('load', function () {
        Alert.error(JSON.parse($(this).contents().find('body').text()).details);
      });
    } catch (e) {
      console.log('다운로드 에러' + e);
    }
  }

  public checkQueryStatus() {
    this._checkQueryStatusReconnectCnt++;

    this.workbenchService.checkConnectionStatus(this.selectedEditorId, this.websocketId)
      .then((result) => {
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

  public setNumberFormat(num: number, float: number = 0): string {
    let value: string = String(Math.round(num * (Math.pow(10, float))) / Math.pow(10, float));
    const arrSplitFloatPoint = value.split('.');
    let floatValue = '';
    if (1 < arrSplitFloatPoint.length) {
      floatValue = arrSplitFloatPoint[1];
    }
    value = arrSplitFloatPoint[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if ('' !== floatValue) {
      value += '.' + floatValue;
    }

    return value;
  }

  public get visibleResultTabs(): ResultTab[] {
    const resultTabs: ResultTab[] = this._getCurrentEditorResultTabs();
    return resultTabs ? resultTabs : [];
  }

  public get visibleResultTab(): ResultTab {
    return this._getCurrentResultTab();
  }

  public get currentRunningTab(): ResultTab {
    return this._getResultTab(this.runningResultTabId);
  }

  public getFilteringList(list: any, listObj: EditorList) {
    return list.slice(listObj.index, list.length);
  }

  public findIndexInList(list: any, item: any): number {
    return _.findIndex(list, item);
  }

  public onClickPrevSlideBtn(listObj: EditorList): void {
    if (listObj.index > 0) {
      listObj.index--;
      listObj === this.editorListObj ? this._calculateEditorSlideBtn() : this._calculateEditorResultSlideBtn();
    }
  }

  public onClickNextSlideBtn(listObj: EditorList): void {
    if ((listObj === this.editorListObj ? this._isEditorMaxWidth() : this._isEditorResultMaxWidth())
      && listObj.index < listObj.list.length - 1) {
      listObj.index++;
    }
  }

  private _loadInitData(connectWebSocket: () => void) {
    this.workbenchService.getWorkbench(this.workbenchId).then((data) => {
      if (data.valid) {
        WorkbenchService.workbench = data;
        WorkbenchService.workbenchId = this.workbenchId;

        this.workspaceService.getWorkSpace(data.workspace.id, 'forDetailView').then((workspace: Workspace) => {

          const permissionChecker: PermissionChecker = new PermissionChecker(workspace);

          if (workspace.active && permissionChecker.isViewWorkbench()) {
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
            }
            connectWebSocket.call(this);

            this.isDataManager = CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_DATASOURCE);

            if (data.dataConnection.supportSaveAsHiveTable) {
              this.supportSaveAsHiveTable = data.dataConnection.supportSaveAsHiveTable;
            }

            this.setWorkbenchName();
            this.setWorkbenchDesc();

          } else {
            this.openAccessDeniedConfirm();
          }
          this.safelyDetectChanges();
          this.restoreQueryResultPreviousState(data.queryEditors);
        });
      } else {
        this.loadingHide();
        this.openAccessDeniedConfirm();
      }

    }).catch((error) => {
      if (!isUndefined(error.details)) {
        Alert.error(error.details);
      } else {
        Alert.error(error);
      }
    });
  }

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
            tab.result = new QueryResult();
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

  private _calculateEditorSlideBtn(indexInit: boolean = false): void {
    this.editorListObj.list = this.textList;
    if (indexInit) {
      this.editorListObj.index = 0;
    }

    if (this.editorListObj.index === 0) {
      this.safelyDetectChanges();
      this.editorListObj.showBtnFl = this._isEditorMaxWidth();
    }
  }

  private _calculateEditorResultSlideBtn(indexInit: boolean = false): void {
    this.editorResultListObj.list = this._getCurrentEditorResultTabs();
    if (indexInit) {
      this.editorResultListObj.index = 0;
    }

    if (this.editorResultListObj.index === 0) {
      this.safelyDetectChanges();
      this.editorResultListObj.showBtnFl = this._isEditorResultMaxWidth();
    }
  }

  private _isEditorMaxWidth(): boolean {
    return this._editorListTabs.nativeElement.offsetWidth >= (this._editorListMax.nativeElement.offsetWidth - this._editorListSizeBtn.nativeElement.offsetWidth);
  }

  private _isEditorResultMaxWidth(): boolean {
    return this._editorResultListTabs.nativeElement.offsetWidth >= this._editorResultListMax.nativeElement.offsetWidth;
  }

  private _saveAllQueryEditor() {
    const queryPromise = [];
    this.textList.forEach((item, index) => {
      const queryEditor: QueryEditor = new QueryEditor();
      queryEditor.editorId = item.editorId;
      queryEditor.name = item.name;
      queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
      queryEditor.order = index;
      queryEditor.query = item.query;
      queryPromise.push(this.workbenchService.updateQueryEditor(queryEditor)
        .then(() => {
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

  private setResultContents(data: any, resultTab: ResultTab) {

    resultTab.result = data;
    resultTab.setResultStatus(data.queryResultStatus);

    if (data.queryResultStatus === 'FAIL') {
      resultTab.name = this._genResultTabName(resultTab.queryEditor.name, 'ERROR', resultTab.order);
      resultTab.message = data.message;
    } else {
      resultTab.name = this._genResultTabName(resultTab.queryEditor.name, 'RESULT', resultTab.order);
    }

    this._calculateEditorResultSlideBtn();

    if (this.isCanceling) {
      Alert.success(this.translateService.instant('msg.bench.alert.log.cancel.success'));
      this.loadingBar.hide();
      this.afterCancelQuery(true);
      return;
    }

    if (this._isEqualRunningVisibleTab()) {
      this.drawGridData();
    }

  }

  private setSelectedTabText(text: string): void {

    this.editor.setText(text);

    this.text = this.getSelectedTabText();

    this.editor.editorFocus();
  }

  private getSelectedTabText(): string {
    return this.editor.value;
  }

  private getSelectedSqlTabText(): string {
    return this.editor.getSelection();
  }

  private readQuery(queryEditors: any[]) {
    if (queryEditors.length === 0) {
      this.createNewEditor('', true);
    } else {
      const editors = queryEditors.sort((a, b) => {
        return a.order - b.order;
      });

      for (let idx1: number = 0, nMax1 = editors.length; idx1 < nMax1; idx1 = idx1 + 1) {
        this.textList.push({
          name: editors[idx1].name,
          query: editors[idx1].query,
          selected: false,
          editorId: editors[idx1].id,
          index: editors[idx1].index,
          editorMode: false
        });
        this.saveLocalStorage(editors[idx1].query, editors[idx1].id);

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

      this._calculateEditorSlideBtn();
    }
  }

  public toggleLogPanel(showLog: boolean) {

    const currentTab: ResultTab = this._getCurrentResultTab();

    currentTab.showLog = showLog;
    this.safelyDetectChanges();

    (currentTab.showLog) || (this.drawGridData());
  }

  private createWebSocket(callback?: () => void): void {
    const dataConn: Dataconnection = this.workbenchTemp.dataConnection;
    this.workbench = this.workbenchTemp;
    this.workbench.dataConnection.connectionDatabase = dataConn.database;
    this.websocketId = CommonConstant.websocketId;
    this.connTargetImgUrl
      = this.getConnImplementorWhiteImgUrl(dataConn.connectionInformation.implementor, dataConn.connectionInformation.iconResource2);
    try {
      console.log('this.websocketId', this.websocketId);
      const headers: any = {
        'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      };
      (this._subscription) && (this._subscription.unsubscribe());
      this._subscription
        = CommonConstant.stomp.watch('/user/queue/workbench/' + this.workbenchId).subscribe((msg: Message) => {

        const data = JSON.parse(msg.body);

        (this.isCanceling) || (this.loadingBar.hide());

        const resultTabInfo: ResultTab = this._getResultTab(this.runningResultTabId);
        if (1 === this._getResultTabsByEditorId(this.executeEditorId).length) {
          resultTabInfo.selected = true;
        }

        if (!isNullOrUndefined(data.queryIndex)) {

          if ('LOG' === data.command && 0 < data.log.length && resultTabInfo) {

            resultTabInfo.showLog = true;
            data.log.forEach(item => resultTabInfo.appendLog(item));

          } else if ('DONE' === data.command) {

            const timer = setInterval(() => {
              const runningTab: ResultTab = this._getResultTab(this.runningResultTabId);
              if (runningTab && runningTab.resultStatus) {
                clearInterval(timer);
                this._doneOrNextExecute();
              }
            }, 500);

          } else if ('LOG' !== data.command && 'GET_CONNECTION' !== data.command) {
            resultTabInfo.setExecuteStatus(data.command);
          }

          this.safelyDetectChanges();

          const $logContainer = $('#workbenchLogText');
          if (this._isEqualRunningVisibleTab() && '' !== $logContainer.text()) {
            const textAreaHeight = $logContainer.height();
            const lineBreakLength = $logContainer.find('br').length;
            const offsetTop = textAreaHeight * (Math.ceil(lineBreakLength / 8));
            $logContainer.scrollTop(offsetTop);
          }
        }

        if (data['connected'] === true) {
          this.databaseParam = {
            dataconnection: dataConn,
            workbenchId: this.workbenchId,
            webSocketId: CommonConstant.websocketId
          };
        } else if (data['connected'] === false) {
          Alert.error(data['message']);
        }

        if ('CONNECT' === data.command) {
          (callback) && (callback.call(this));
        }

      }, headers);

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
      console.log(e);
    }

  }

  private _doneOrNextExecute() {

    const resultTab: ResultTab = this._getResultTab(this.runningResultTabId);

    if (this.isCanceled) {
      this._doneExecuteQueries();
      return false;
    }

    resultTab.doneTimer();

    if (this._isEqualRunningVisibleTab()) {
      resultTab.selected = true;
      resultTab.showLog = false;
      this.drawGridData();
    }

    this.currentRunningIndex++;

    if (this.executeTabIds.length > this.currentRunningIndex) {
      resultTab.setExecuteStatus('DONE');
      this.runQueries(this.executeTabIds[this.currentRunningIndex]);
    } else {
      resultTab.setExecuteStatus('DONE');
      this._doneExecuteQueries();
    }

  }

  public _doneExecuteQueries() {

    const currentTabs: ResultTab[] = this._getResultTabsByEditorId(this.executeEditorId);

    this.isExecutingQuery = false;

    if (currentTabs.length === 0) {
      return false;
    }

    this.currentRunningIndex = -1;

    this.safelyDetectChanges();
  }

  private getEditorComponentElementHeight() {

    const editorWrapElement: Element = this.element.nativeElement
      .querySelector('.ddp-wrap-editor');

    const editorHeight: number = editorWrapElement.clientHeight;

    if (this.isQueryEditorFull) {
      const editorFullElement: Element = this.element.nativeElement
        .querySelector('.ddp-ui-query');
      const editorTabElement: Element = this.element.nativeElement
        .querySelector('.ddp-wrap-tabs-edit');

      return editorFullElement.clientHeight - editorTabElement.clientHeight;

    }

    return editorHeight;
  }

  private drawGridData() {
    this.safelyDetectChanges();

    const currentTab: ResultTab = this._getCurrentResultTab();

    if (isNullOrUndefined(currentTab)) {
      return;
    }
    const data: any = currentTab.result;
    const headers: Header[] = [];
    if (!data || !data.fields) {
      $('.myGrid').html('<div class="ddp-text-result ddp-nodata">' + this.translateService.instant('msg.storage.ui.no.data') + '</div>');
      currentTab.showLog = false;
      this.safelyDetectChanges();
      return false;
    }

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

    for (let index: number = 0, nMax = data.fields.length; index < nMax; index = index + 1) {
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
    for (let idx1: number = 0, nMax1 = data.data.length; idx1 < nMax1; idx1 = idx1 + 1) {
      const row = {};
      for (let idx2: number = 0, nMax2 = data.fields.length; idx2 < nMax2; idx2 = idx2 + 1) {
        const temp = data.fields[idx2].name;
        if (data.fields[idx2].logicalType === 'INTEGER' && data.data[idx1][temp]) {
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
        = this.gridComponent.grid.onScroll.subscribe((_data1, data2) => {
        if (0 < data2.scrollTop) {
          this.hideResultButtons = (data2.scrollTop > ($gridCanvas.height() - $gridViewport.height() - 10));
          this.safelyDetectChanges();
        } else if (0 === data2.scrollTop) {
          this.hideResultButtons = false;
        }
      });
    }

    if (this.searchText !== '') {
      this.gridSearchClear();
    }

    this.safelyDetectChanges();
  }

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
  }

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

  }

  public cancelRunningQuery(useLog: boolean = false) {
    // cannot cancel until cancel timer tick.
    if (!this.isCancelAvailable) {
      return;
    }

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

  }

  public afterCancelQuery(isSuccess: boolean) {

    if (!this.isCanceled) {
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

  }

  public goBack() {
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    let cookieWorkspace = null;
    if (cookieWs) {
      cookieWorkspace = JSON.parse(cookieWs);
    }
    if (null !== cookieWorkspace) {
      this.router.navigate(['/workspace', cookieWorkspace['workspaceId']]).then();
    }
  }

  public setSqlFormatter() {

    this.checkFooterPopup();

    const textSelected: string = this.editor.getSelection();

    if (textSelected === '') {
      Alert.info(this.translateService.instant('msg.bench.alert.no.selected.query'));
      return;
    }

    const text: string = this.editor.formatter(textSelected, ' ');
    this.editor.replace(text);

    this.textList[this.selectedTabNum]['query'] = this.getSelectedTabText();

    this.saveLocalStorage(this.getSelectedTabText(), this.textList[this.selectedTabNum]['editorId']);
  }

  public replaceAll(str, find, replace) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  public escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }

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

        if (StringUtil.isNotEmpty(this.workbench.dataConnection.hostname)) {
          this.setDatasource.connectionData.connection.hostname = this.workbench.dataConnection.hostname;
        }
        if (0 < this.workbench.dataConnection.port) {
          this.setDatasource.connectionData.connection.port = this.workbench.dataConnection.port;
        }
        if (StringUtil.isNotEmpty(this.workbench.dataConnection.url)) {
          this.setDatasource.connectionData.connection.url = this.workbench.dataConnection.url;
        }

        const inputSpec: InputSpec = this.workbench.dataConnection.connectionInformation.inputSpec;
        if (InputMandatory.NONE !== inputSpec.catalog && StringUtil.isNotEmpty(this.workbench.dataConnection.catalog)) {
          this.setDatasource.connectionData.connection.catalog = this.workbench.dataConnection.catalog;
        }
        if (InputMandatory.NONE !== inputSpec.sid && StringUtil.isNotEmpty(this.workbench.dataConnection.sid)) {
          this.setDatasource.connectionData.connection.sid = this.workbench.dataConnection.sid;
        }
        if (InputMandatory.NONE !== inputSpec.database && StringUtil.isNotEmpty(this.workbench.dataConnection.database)) {
          this.setDatasource.connectionData.connection.database = this.workbench.dataConnection.database;
        }
        if (InputMandatory.NONE !== inputSpec.username) {
          this.setDatasource.connectionData.connection.username
            = selectedSecurityType.value === AuthenticationType.DIALOG ? this.webSocketLoginId : connection.username;
        }
        if (InputMandatory.NONE !== inputSpec.password) {
          this.setDatasource.connectionData.connection.password
            = selectedSecurityType.value === AuthenticationType.DIALOG ? this.webSocketLoginPw : connection.password;
        }

        this.loadingHide();
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

  public createDatasourceComplete() {
    this.useUnloadConfirm = false;
  }

  public closeCreateDatasource() {
    this.mainViewShow = true;
    this.mode = '';
  }

  public toggleResultSearchLayer(event: MouseEvent) {
    event.stopPropagation();
    const $evtTarget = $(event.target);
    if ($evtTarget.hasClass('ddp-box-searching') || 0 < $evtTarget.closest('.ddp-box-searching').length) {
      return;
    }
    this.isSearchLink = !this.isSearchLink;
    this.safelyDetectChanges();
  }

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

    const column = currentResultTab.result.fields;
    let seq = 0;
    column.forEach((item) => {
      item['seq'] = seq;
      seq += 1;

      if (item['ingestionRule']) {
        switch (item.ingestionRule.type) {
          case IngestionRuleType.DEFAULT:
            delete item['ingestionRule'];
            break;
          case IngestionRuleType.DISCARD:
            delete item.ingestionRule.value;
        }
      }

      delete item['checked'];
      delete item['timestampFl'];
      delete item['deleteFl'];
    });
    param['fields'] = column;

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
      if (!isUndefined(error.message)) {
        Alert.error(error.message);
      }
    });
  }

  public setPageWidget(tempDsInfo: Datasource) {
    const tempWidget = new PageWidget();

    const boardDataSource: BoardDataSource = new BoardDataSource();
    {
      boardDataSource.id = tempDsInfo.temporary.dataSourceId;
      boardDataSource.type = 'default';
      boardDataSource.name = tempDsInfo.temporary.name;
      boardDataSource.engineName = tempDsInfo.temporary.name;
      boardDataSource.connType = 'LINK';
      boardDataSource.temporary = true;
      tempWidget.configuration.dataSource = boardDataSource;
    }

    {
      const dashboard: Dashboard = new Dashboard();
      dashboard.name = 'temporary';
      dashboard.configuration = new BoardConfiguration();
      dashboard.configuration.dataSource = boardDataSource;

      const workbook: Workbook = new Workbook();
      workbook.name = '';
      dashboard.workBook = workbook;

      const fields = tempDsInfo.fields.filter(item => '__ctime' !== item.name);

      fields.forEach(item => item.dataSource = boardDataSource.engineName);
      dashboard.configuration.fields = fields;

      dashboard.configuration.filters = [];

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
  }

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

      this.safelyDetectChanges();
      this.wbName.nativeElement.focus();
    }
  }

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

      this.safelyDetectChanges();
      this.wbDesc.nativeElement.focus();
    }
  }

  public setWorkbenchName() {
    this.isWorkbenchNameEditMode = false;
    if (this.workbenchTemp.name !== this.workbenchName) {
      this.workbenchName = this.workbenchTemp.name;
    }
  }

  public setWorkbenchDesc() {
    this.isWorkbenchDescEditMode = false;
    if (this.workbenchTemp.description !== this.workbenchDesc) {
      this.workbenchDesc = this.workbenchTemp.description;
    }
  }

  public setSchemaBrowser(): void {

    const connInfo: any = this.workbench;

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
    const tableTemp: any = {};
    $event.forEach(item => {
      tableTemp[item.name] = []
    });

    this.editor.setOptions(tableTemp);

    // H2, HIVE, ORACLE, TIBERO, MYSQL, MSSQL, PRESTO, FILE, POSTGRESQL, GENERAL;
    if (this.mimeType === 'HIVE' || this.mimeType === 'PRESTO' || this.mimeType === 'GENERAL') {
      this.editor.setModeOptions('text/x-hive');
    } else if (this.mimeType === 'POSTGRESQL') {
      this.editor.setModeOptions('text/x-pgsql');
    } else {
      this.editor.setModeOptions('text/x-mysql');
    }
  }

  public saveAsHiveTable() {
    const currentTab: ResultTab = this._getCurrentResultTab();
    this.saveAsHiveTableComponent.init(this.workbenchId, currentTab.result.csvFilePath, this.websocketId);
  }

  private _toggleHorizontalSlider() {
    if (this.isLeftMenuOpen && !this.isQueryEditorFull) {
      this._activeHorizontalSlider();
    } else {
      this._deactiveHorizontalSlider();
    }
  }

  private _activeHorizontalSlider() {
    const $connLabel = this.$element.find('.ddp-txt-in');
    const $lnbPanel = this.$element.find('.sys-workbench-lnb-panel');
    let resizeTimer;
    this._splitHorizontal = Split(['.sys-workbench-lnb-panel', '.sys-workbench-content-panel'], {
      direction: 'horizontal',
      sizes: [20, 80],
      minSize: 230,
      elementStyle: (_dimension, size, _gutterSize) => {
        // console.log( dimension, size, gutterSize );
        return {width: `${size}%`};
      },
      onDrag: () => {
        resizeTimer = setTimeout(() => {
          $connLabel.width($lnbPanel.width() - 150);
        }, 100);
        // console.log( $lnbPanel.width() );
      },
      onDragEnd: () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
          resizeTimer = undefined;
        }
        $connLabel.width($lnbPanel.width() - 110);
        this.onEndedResizing();
      }
    });
    $connLabel.width($lnbPanel.width() - 110);
  }

  private _deactiveHorizontalSlider() {
    if (this._splitHorizontal) {
      this._splitHorizontal.destroy();
      this._splitHorizontal = undefined;
    }
  }

  private _genResultTabName(prefix: string, type: 'RESULT' | 'ERROR', idx: number) {
    return prefix + ' - ' + this.translateService.instant('RESULT' === type ? 'msg.bench.ui.rslt' : 'msg.comm.ui.error') + idx;
  }

  private _getCurrentEditorResultTabs(): ResultTab[] {
    return this.totalResultTabList.filter(item => item.editorId === this.selectedEditorId);
  }

  private _getCurrentResultTab(): ResultTab {
    return this.totalResultTabList.find(item => item.editorId === this.selectedEditorId && item.selected);
  }

  private _getResultTabsByEditorId(editorId: string): ResultTab[] {
    return this.totalResultTabList.filter(item => item.editorId === editorId);
  }

  private _getResultTab(tabId: string): ResultTab {
    return this.totalResultTabList.find(item => item.id === tabId);
  }

  private _removeResultTab(resultTabId: string): ResultTab[] {
    const rmIdx: number = this.totalResultTabList.findIndex(item => item.id === resultTabId);
    if (-1 < rmIdx) {
      this.totalResultTabList.splice(rmIdx, 1);
    }
    return this.totalResultTabList;
  }

  private _clearCurrentEditorResultTabs(): ResultTab[] {
    this.totalResultTabList = this.totalResultTabList.filter(item => item.editorId !== this.executeEditorId);
    return this.totalResultTabList;
  }

  private _appendResultTab(resultTab: ResultTab) {
    this.totalResultTabList.push(resultTab);
  }

  private _isEqualRunningVisibleTab(): boolean {
    const runningTab: ResultTab = this._getResultTab(this.runningResultTabId);
    const visibleTab: ResultTab = this._getCurrentResultTab();
    return visibleTab && runningTab && runningTab.id === visibleTab.id;
  }

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
      this.textList[this.selectedTabNum]['query'] = currQuery;
      this.saveLocalStorage(currQuery, this.textList[this.selectedTabNum]['editorId']);
    }
  }

  public setCancelButtonTimer(sec: number) {
    // disable button
    this.isCancelAvailable = false;

    // if timer exist..
    if (this._cancelTimer !== undefined) {
      // clear existed timer
      clearTimeout(this._cancelTimer);
    }

    // start new timer
    this._cancelTimer = setTimeout(() => {
      // restore button
      this.isCancelAvailable = true;
    }, sec * 1000);

  }

}

class EditorList {
  public index: number = 0;
  public showBtnFl: boolean = false;
  public list: any = [];
}

class ResultTab {
  public editorId: string;
  public id: string;
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
  public result?: QueryResult;
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
  }

  public executeTimer() {
    this.startDate = moment().format('YYYY-MM-DD HH:mm:ss');
    this._timer = setInterval(() => this.executeTime = (moment().diff(this.startDate) / 1000), 1000);
  }

  public doneTimer() {
    clearInterval(this._timer);
    this.finishDate = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  public setResultStatus(status: ('NONE' | 'SUCCESS' | 'FAIL' | 'CANCEL')) {
    this.resultStatus = status;
    if ('FAIL' === status) {
      this.errorStatus = this.executeStatus;
    }
  }

  public setExecuteStatus(status: ('GET_CONNECTION' | 'CREATE_STATEMENT' | 'EXECUTE_QUERY' | 'LOG' | 'GET_RESULTSET' | 'DONE')) {
    this.executeStatus = status;
    this.appendLog(this.getExecuteStatusMsg());
  }

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
  }

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
  }

  public isShowPrevBtn(): boolean {
    return 0 !== this.pageNum;
  }

  public isShowNextBtn(pageSize: number): boolean {
    const currDataRows = this.result.data.length + (this.pageNum * pageSize);
    return currDataRows < this.result.numRows;
  }
}

class QueryResult {
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
  public defaultNumRows: number = 0;
  public maxNumRows: number = 0;
}
