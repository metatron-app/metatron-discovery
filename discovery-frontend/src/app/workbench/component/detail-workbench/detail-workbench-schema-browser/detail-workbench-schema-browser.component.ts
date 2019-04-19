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
import {Page} from '../../../../domain/common/page';
import {DataconnectionService} from '../../../../dataconnection/service/dataconnection.service';
import {Alert} from '../../../../common/util/alert.util';
import {QueryEditor, Workbench} from '../../../../domain/workbench/workbench';
import {GridComponent} from '../../../../common/component/grid/grid.component';
import {header, SlickGridHeader} from '../../../../common/component/grid/grid.header';
import {GridOption} from '../../../../common/component/grid/grid.option';
import {CommonConstant} from '../../../../common/constant/common.constant';
import {WorkbenchService} from '../../../service/workbench.service';
import {ActivatedRoute} from '@angular/router';
import {Dataconnection} from '../../../../domain/dataconnection/dataconnection';
import {MetadataService} from '../../../../meta-data-management/metadata/service/metadata.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {AbstractWorkbenchComponent} from '../../abstract-workbench.component';
import {StringUtil} from '../../../../common/util/string.util';
import {CommonUtil} from "../../../../common/util/common.util";
import * as _ from 'lodash';

@Component({
  selector: 'detail-workbench-schema-browser',
  templateUrl: './detail-workbench-schema-browser.component.html',
})
export class DetailWorkbenchSchemaBrowserComponent extends AbstractWorkbenchComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  // 테이블 그리드
  @ViewChild('schemaMain')
  private gridSchemaComponent: GridComponent;

  // 컬럼 그리드
  @ViewChild('schemaColumn')
  private gridSchemaColumnComponent: GridComponent;

  // 데이터 그리드
  @ViewChild('schemaData')
  private gridSchemaDataComponent: GridComponent;

  // 선택된 탭 번호
  private selectedTabNum: number = 0;

  // 워크벤치 데이터
  private workbench: Workbench;

  // 워크벤치 아이디
  private workbenchId: string;

  // 웹소켓 아이디
  private _websocketId: string;

  // tab list 이름만 모아뒀다
  private textList: any[]; // { name: '쿼리' + this.tabNum, query: '', selected: true }

  // request reconnect count
  private _getColumnListReconnectCount: number = 0;
  private _getMetaDataReconnectCount: number = 0;
  private _getSingleQueryReconnectCount: number = 0;
  private _getTableDetailDataReconnectCount: number = 0;
  private _getDatabaseListReconnectCount: number = 0;
  private _getTableListReconnectCount: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터 커넥션 정보
  public dataConnection: Dataconnection = new Dataconnection();

  // 데이터 베이스 리스트
  public databaseList: any[] = [];

  // 스키마 브라우저 테이블 리스트
  public schemaTableList: any[] = [];
  // 스키마 브라우저 컬럼 리스트
  public schemaTableColumnList: any[] = [];

  // 스키마 브라우져 메타 데이터 리스트
  public schemaTableMetadataList: any[] = [];

  // 스키마 브라우져 데이터 리스트
  public schemaTableDataList: any[] = [];
  public schemaTableDataDataList: any[] = [];


  // 선택한 탭.
  public schemaSelectedTab: string = '';

  // 선택한 테이블
  public selectedSchemaTable: string = '';

  // 테이블 검색어
  public searchTableText: string = '';
  // 컬럼 검색어
  public searchColumnText: string = '';
  // 데이터 검색어
  public searchDataText: string = '';
  // 데이터베이스 검색어
  public searchDatabaseText: string = '';

  // 현재 선택된 데이터베이스 이름
  public selectedDatabaseName: string;

  // 전체화면 여부
  public isFull: boolean;

  // show flag
  public isShow: boolean;
  // 커넥션 정보 show flag
  public connectionInfoShowFl: boolean = false;
  // 데이터베이스 리스트 show flag
  public databaseListShowFl: boolean = false;

  // tab list, no data
  public isColumListNoData: boolean = false;
  public isMetadataListNoData: boolean = false;
  public isDataListNoData: boolean = false;

  public connTargetImgUrl: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activatedRoute: ActivatedRoute,
              private _metaDataService: MetadataService,
              private connectionService: DataconnectionService,
              protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(workbenchService, element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // browser data
    this._getBrowserData();
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
   * init
   */
  public init(param: object): void {
    // ui 초기화
    this._initView();
    // 팝업 모드
    this.isFull = false;
    // show
    this.isShow = true;
    // item
    this.workbench = param['workbench'];
    this.workbenchId = param['workbenchId'];
    this._websocketId = param['websocketId'];
    this.textList = param['textList'];
    // 데이터 커넥션 정보
    this.dataConnection = this.workbench.dataConnection;
    // 현재 선택된 데이터베이스 이름
    this.selectedDatabaseName = this.workbench.dataConnection.database;
    // 선택된 테이블 초기화
    this.selectedSchemaTable = '';
    // 초기 선택 탭 초기화
    this.schemaSelectedTab = '';
    // 데이터 초기화
    this.databaseList = [];
    this.schemaTableList = [];
    this.schemaTableColumnList = [];
    this.schemaTableMetadataList = [];
    this.schemaTableDataList = [];
    this.schemaTableDataDataList = [];
    // 권한 정보가 없을 경우
    if (isNullOrUndefined(this.dataConnection.authenticationType)) {
      this.dataConnection.authenticationType = 'MANUAL';
    }

    // 데이터베이스 리스트 조회
    this._getDatabaseList();
  }

  /**
   * 현재 보고있는 창 닫기
   */
  public close() {
    this.isShow = false;
  }

  /**
   * 스키마 브라우저를 윈도우 모드로 전환
   */
  public changeWindowMode(): void {
    // close
    this.close();
    // 윈도우로 전달할 파라메터
    const param = {
      workbench: this.workbench,
      workbenchId: this.workbenchId,
      websocketId: WorkbenchService.websocketId,
      textList: this.textList
    };
    // 세션에 저장
    sessionStorage.setItem('METATRON_SCHEMA_BROWSER_DATA' + this.workbenchId, JSON.stringify(param));
    const popupX = (window.screen.width / 2) - (1200 / 2);
    const popupY = (window.screen.height / 2) - (900 / 2);
    const popUrl = `workbench/${this.workbenchId}/schemabrowser`;
    // 윈도우 오픈
    window.open(popUrl, '', 'status=no, height=700, width=1200, left=' + popupX + ', top=' + popupY + ', screenX=' + popupX + ', screenY= ' + popupY);
    // 세선에서 제거
    sessionStorage.removeItem('METATRON_SCHEMA_BROWSER_DATA' + this.workbenchId);
  }

  /**
   * 데이터베이스 더 조회할 데이터 있는지 여부
   * @returns {boolean}
   */
  public isMoreDatabaseList(): boolean {
    return this.page.page < this.pageResult.totalPages - 1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 리스트 조회
   */
  public getTableList() {
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 5000;
    // 로딩 show
    this.loadingShow();
    // 테이블 목록 조회 요청
    this._getSearchTablesForServer(this.dataConnection, this.selectedDatabaseName, page);
  }

  /**
   * 테이블의 컬럼리스트 조회
   */
  public getColumnList() {
    // 선택한 테이블이 없는경우
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    // 컬럼 텍스트 초기화
    this.searchColumnText = '';
    // 현재 선택한 컬럼
    this.schemaSelectedTab = 'column';
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 99999;
    // 컬럼 리스트 조회 요청
    this._getColumnListForServer(this.dataConnection.id, this.selectedDatabaseName, this.selectedSchemaTable, this._websocketId, page);
  }

  /**
   * 테이블의 메타데이터 조회
   */
  public getMetaData() {
    // 선택한 테이블이 없는경우
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    // 현재 선택한 컬럼
    this.schemaSelectedTab = 'metadata';
    // page
    const page: Page = new Page();
    page.page = 0;
    page.size = 99999;
    // 메타데이터 조회 요청
    this._getMetaDataForServer(this.dataConnection.id, this.selectedDatabaseName, this.selectedSchemaTable, this._websocketId, page);
  }

  /**
   * 테이블의 상세정보 조회
   */
  public getTableDetailData() {
    // 선택한 테이블이 없는경우
    if (this.selectedSchemaTable === '') {
      Alert.warning(this.translateService.instant('msg.comm.alert.table'));
      return;
    }
    // 데이터 텍스트 초기화
    this.searchDataText = '';
    // 테이블의 상세정보 조회
    this._getTableDetailDataForServer(this.textList[this.selectedTabNum]['editorId'], this._websocketId);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 변경 이벤트
   * @param {string} database
   */
  public onChangeDatabase(database: string): void {
    // close show list
    this.databaseListShowFl = false;
    // 선택한 데이터베이스
    this.selectedDatabaseName = database;
    // 기존 데이터 초기화
    this.schemaTableList = [];
    // 선택된 테이블 초기화
    this.selectedSchemaTable = '';
    // 재조회
    this.getTableList();
  }

  /**
   * 데이터베이스 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public onSearchDatabase(event: KeyboardEvent): void {
    (13 === event.keyCode) && this._searchDatabase();
  }

  /**
   * 데이터베이스 검색 초기화 이벤트
   */
  public onSearchDatabaseInit(): void {
    // 검색어 초기화
    this._inputSearch.nativeElement.value = '';
    // 검색
    this._searchDatabase();
  }

  /**
   * 테이블 검색
   * @param {KeyboardEvent} event
   */
  public onSearchTable(event: KeyboardEvent): void {
    // 검색어 저장
    this.searchTableText = event.target['value'];
    // 테이블 검색
    this._searchTableEvent();
  }

  /**
   * 테이블 검색 초기화
   */
  public onSearchTableInit(): void {
    // 검색어 초기화
    this.searchTableText = '';
    // 테이블 검색
    this._searchTableEvent();
  }

  /**
   * 컬럼 검색
   * @param {KeyboardEvent} event
   */
  public onSearchColumn(event: KeyboardEvent): void {
    // 검색어 저장
    this.searchColumnText = event.target['value'];
    // 테이블 검색
    this._searchColumnEvent();
  }

  /**
   * 컬럼 검색 초기화
   */
  public onSearchColumnInit(): void {
    // 검색어 초기화
    this.searchColumnText = '';
    // 테이블 검색
    this._searchColumnEvent();
  }

  /**
   * 데이터 검색
   * @param {KeyboardEvent} event
   */
  public onSearchData(event: KeyboardEvent): void {
    // 검색어 저장
    this.searchDataText = event.target['value'];
    // 테이블 검색
    this._searchDataEvent();
  }

  /**
   * 데이터 검색 초기화
   */
  public onSearchDataInit(): void {
    // 검색어 초기화
    this.searchDataText = '';
    // 테이블 검색
    this._searchDataEvent();
  }

  /**
   * 테이블 선택
   * @param event
   */
  public onSelectedTable(event) {
    // 선택한 테이블
    this.selectedSchemaTable = event.row.name;
    // 선택한 탭에 따라 show
    switch (this.schemaSelectedTab) {
      case 'column':
        this.getColumnList();
        break;
      case 'metadata':
        this.getMetaData();
        break;
      case 'data':
        this.getTableDetailData();
        break;
      default:
        this.getColumnList();
        break;
    }
  }

  /**
   * open or cloe data connection info layer
   */
  public connectionInfoShow(event: MouseEvent) {

    this.connectionInfoShowFl = !this.connectionInfoShowFl;
    this.safelyDetectChanges();

    const target = $(event.target);
    let infoLeft: number = target.offset().left;
    let infoTop: number = target.offset().top;
    const element = document.getElementById(`connectionInfo`);
    $(element).css({'left': infoLeft - 30, 'top': infoTop + 17});

  } // function - dataConnectionInfoShow

  /**
   * 커넥션이 Default 타입이라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return StringUtil.isEmpty(this.dataConnection.url);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기화
   * @private
   */
  private _initView(): void {
    // 데이터베이스 리스트 초기화
    this.databaseList = [];
    // 선택된 데이터베이스 이름 초기화
    this.selectedDatabaseName = '';
    // 데이터베이스 검색어 초기화
    this.searchDatabaseText = '';
    // connection info flag
    this.connectionInfoShowFl = false;
    // database list flag
    this.databaseListShowFl = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 검색 이벤트
   * @private
   */
  private _searchTableEvent(): void {
    // 그리드가 생성되어 있는 경우만
    if (typeof this.gridSchemaComponent !== 'undefined') {
      // 그리드 검색 함수 호출
      this._searchGridComponent(this.gridSchemaComponent, this.searchTableText);
    }
  }

  /**
   * 컬럼 검색 이벤트
   * @private
   */
  private _searchColumnEvent(): void {
    // 그리드가 생성되어 있는 경우만
    if (typeof this.gridSchemaColumnComponent !== 'undefined') {
      // 그리드 검색 함수 호출
      this._searchGridComponent(this.gridSchemaColumnComponent, this.searchColumnText);
    }
  }

  /**
   * 데이터 검색 이벤트
   * @private
   */
  private _searchDataEvent(): void {
    // 그리드가 생성되어 있는 경우만
    if (typeof this.gridSchemaDataComponent !== 'undefined') {
      // 그리드 검색 함수 호출
      this._searchGridComponent(this.gridSchemaDataComponent, this.searchDataText);
    }
  }

  /**
   * 데이터베이스 검색
   * @private
   */
  private _searchDatabase(): void {
    // 검색어
    this.searchDatabaseText = this._inputSearch.nativeElement.value;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터베이스 리스트 초기화
    this.databaseList = [];
    // 데이터베이스 재조회
    this._getDatabaseList(true);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 리스트 조회
   * @param {boolean} searchFl
   * @private
   */
  private _getDatabaseList(searchFl: boolean = false): void {
    // 커넥션 대상 타입 조회
    this.connTargetImgUrl = this.getConnImplementorImgUrl(
      this.dataConnection.connectionInformation.implementor,
      this.dataConnection.connectionInformation.iconResource1
    );
    // 호출 횟수 증가
    this._getDatabaseListReconnectCount++;
    // 로딩 show
    this.loadingShow();
    // 데이터베이스 조회
    this.connectionService.getDatabaseListInConnection(this.dataConnection.id, this._getParameterForDatabase(this._websocketId, this.page, this.searchDatabaseText))
      .then((data) => {
        if (data) {
          // 호출 횟수 초기화
          this._getDatabaseListReconnectCount = 0;
          // 데이터베이스 리스트
          this.databaseList = this.databaseList.concat(data.databases);
          // 페이지 객체
          this.pageResult = data.page;
        }

        // 검색이벤트가 아니라면 테이블 리스트 조회
        searchFl ? this.loadingHide() : this.getTableList();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getDatabaseListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getDatabaseList(searchFl);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 태이블 목록 조회 요청
   * @param {string} connectionId
   * @param {string} databaseName
   * @param {Page} page
   * @param {string} tableName
   * @private
   */
  private _getSearchTablesForServer(dataConnection, databaseName: string, page: Page, tableName: string = ''): void {
    // 호출 횟수 증가
    this._getTableListReconnectCount++;

    dataConnection.database = databaseName;
    // 로딩 show
    this.loadingShow();
    this.connectionService.getTableListInConnectionQuery(dataConnection, this._getParameterForTable(this._websocketId, page, tableName))
      .then((result) => {
        // 호출 횟수 초기화
        this._getTableListReconnectCount = 0;
        // 로딩 hide
        this.loadingHide();
        // table이 있는 경우
        if (result['tables']) {
          // 스키마 테이블 리스트 저장
          this.schemaTableList = result['tables'];
          // 테이블에 연결된 메타데이터 목록 조회
          this._getTableMetaDataList(result['tables']);
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getSearchTablesForServer(dataConnection, databaseName, page, tableName);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 컬럼 리스트 조회 요청
   * @param {string} connectionId
   * @param {string} databaseName
   * @param {string} tableName
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} columnNamePattern
   * @private
   */
  private _getColumnListForServer(connectionId: string, databaseName: string, tableName: string, webSocketId: string, page: Page, columnNamePattern: string = ''): void {
    // 호출 횟수 증가
    this._getColumnListReconnectCount++;
    // no data 초기화
    this.isColumListNoData = false;
    // 로딩 show
    this.loadingShow();
    this.connectionService.getColumnList(connectionId, databaseName, tableName, columnNamePattern, webSocketId, page)
      .then((result) => {
        // 호출 횟수 초기화
        this._getColumnListReconnectCount = 0;
        // column list 가 있는경우
        if (result['columns']) {
          // 컬럼 리스트 저장
          this.schemaTableColumnList = result['columns'];
          // 해당 테이블에 연결된 메타데이터 정보 조회
          this._getTableMetaDataDetail(tableName);
        } else {
          // 컬럼 리스트 저장
          this.schemaTableColumnList = [];
          this.isColumListNoData = true;
          Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
          // 로딩 hide
          this.loadingHide();
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getColumnListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getColumnListForServer(connectionId, databaseName, tableName, this._websocketId, page, columnNamePattern);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 테이블의 메타데이터 조회 요청
   * @param {string} connectionId
   * @param {string} databaseName
   * @param {string} tableName
   * @param {string} webSocketId
   * @param {Page} page
   * @private
   */
  private _getMetaDataForServer(connectionId: string, databaseName: string, tableName: string, webSocketId: string, page: Page): void {
    // 호출 횟수 증가
    this._getMetaDataReconnectCount++;
    // no data 초기화
    this.isMetadataListNoData = false;
    // 로딩 show
    this.loadingShow();
    this.connectionService.getTableInfomation(connectionId, databaseName, tableName, webSocketId, page)
      .then((result) => {
        // 호출 횟수 초기화
        this._getMetaDataReconnectCount = 0;
        // 로딩 hide
        this.loadingHide();

        // 메타데이터 초기화
        this.schemaTableMetadataList = [];

        let resultData = [];
        for (const key in result) {
          const param = {
            itemKey: key,
            item: result[key]
          };
          resultData.push(param);
        }

        // 타이틀 부분 추가하여 데이터 가공
        let tempLabel = '';
        let tempArr: any[] = [];

        // result Data 생성
        for (const key in resultData) {

          let tempData = {
            'label': '',
            'data': tempArr
          };

          if (resultData[key]['itemKey'].startsWith('#')) {

            if (key != '0') {
              tempData.label = tempLabel.split('#')[1];
              tempData.data = tempArr;
              this.schemaTableMetadataList.push(tempData);

              tempLabel = '';
              tempArr = [];
            }

            // label
            tempLabel = resultData[key]['itemKey'];
          } else {
            // data
            tempArr.push(resultData[key]);
          }

          // 마지막 데이터일 경우
          if (resultData.length - 1 == Number(key)) {
            tempData.label = tempLabel.split('#')[1];
            tempData.data = tempArr;
            this.schemaTableMetadataList.push(tempData);
          }

        }

        // 데이터가 없을 경우
        if (this.schemaTableMetadataList.length == 0) {
          this.isMetadataListNoData = true;
        }

      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getMetaDataReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getMetaDataForServer(connectionId, databaseName, tableName, this._websocketId, page);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 테이블의 데이터 상세조회 요청
   * @param {string} editorId
   * @param {string} webSocketId
   * @private
   */
  private _getTableDetailDataForServer(editorId: string, webSocketId: string): void {
    // 호출 횟수 증가
    this._getTableDetailDataReconnectCount++;
    // 로딩 show
    this.loadingShow();
    this.workbenchService.checkConnectionStatus(editorId, webSocketId)
      .then((result) => {
        // 호출 횟수 초기화
        this._getTableDetailDataReconnectCount = 0;
        if (result === 'IDLE') {
          // 현재 선택한 컬럼
          this.schemaSelectedTab = 'data';
          // 쿼리조회 요청
          this._getSingleQueryForServer();
        } else {
          // 로딩 hide
          this.loadingHide();
          Alert.error(this.translateService.instant('msg.bench.ui.query.run'));
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableDetailDataReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getTableDetailDataForServer(editorId, this._websocketId);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 샘플 쿼리 조회 요청
   * @private
   */
  private _getSingleQueryForServer(): void {

    // 스키마 브라우저에서 사용하는 데이터베이스 변경 - init 시점에서 넣어준 부분을 재반환
    this.workbench.dataConnection.database = this.selectedDatabaseName;
    // no data 초기화
    this.isDataListNoData = false;
    // 호출 횟수 증가
    this._getSingleQueryReconnectCount++;
    this.workbenchService.getSchemaInfoTableData(this.selectedSchemaTable, this.workbench.dataConnection)
      .then((result) => {
        // 호출 횟수 초기화
        this._getSingleQueryReconnectCount = 0;

        if (result.data.length > 0) {
          this.schemaTableDataList = result;
          this.schemaTableDataDataList = result.data;
          // 테이블 상세데이터 그리드 그리기
          this._drawGridTableDetailData();
        } else {
          this.schemaTableDataList = [];
          this.schemaTableDataDataList = [];
          this.isDataListNoData = true;
          // Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
        }
        // 로딩 hide
        this.loadingHide();

      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getSingleQueryReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._websocketId = WorkbenchService.websocketId;
            this._getSingleQueryForServer();
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 쿼리 에디터 정보
   * @returns {QueryEditor}
   * @private
   */
  private _getQueryEditor(): QueryEditor {
    const queryEditor: QueryEditor = new QueryEditor();
    queryEditor.name = this.textList[this.selectedTabNum]['name'];
    queryEditor.workbench = CommonConstant.API_CONSTANT.API_URL + 'workbenchs/' + this.workbenchId;
    queryEditor.order = this.selectedTabNum;
    // query
    queryEditor.query = 'select * from ' + this.selectedDatabaseName + '.' + this.selectedSchemaTable + ';';
    // webSocket id
    queryEditor.webSocketId = this._websocketId;
    // editor id
    queryEditor.editorId = this.textList[this.selectedTabNum]['editorId'];
    return queryEditor;
  }

  /**
   * session storage에서 데이터 가져오기
   * @private
   */
  private _getBrowserData(): void {
    let workbenchId: string;
    // url 에서 id parse
    this.activatedRoute.params.subscribe((params) => {
      workbenchId = params['id'];
    });
    const param = JSON.parse(sessionStorage.getItem('METATRON_SCHEMA_BROWSER_DATA' + workbenchId));
    // 세선에서 제거
    sessionStorage.removeItem('METATRON_SCHEMA_BROWSER_DATA' + workbenchId);
    // 데이터 있을때만 동작
    if (param) {
      // ui 초기화
      this._initView();
      // show flag
      this.isShow = true;
      this.isFull = true;
      // workbench 정보
      this.workbench = param.workbench;
      this.workbenchId = param.workbenchId;
      this._websocketId = param.websocketId;
      this.textList = param.textList;
      // 데이터 커넥션 정보
      this.dataConnection = this.workbench.dataConnection;
      // 현재 선택된 데이터베이스 이름
      this.selectedDatabaseName = this.dataConnection.database;
      // 데이터베이스 리스트 조회
      this._getDatabaseList();
    }
  }

  /**
   * 테이블에 연결된 메타데이터 조회
   * @param {any[]} tableList
   * @private
   */
  private _getTableMetaDataList(tableList: any[]): void {
    this._metaDataService.getMetadataByConnection(this.dataConnection.id, this.selectedDatabaseName, tableList.map(item => item), 'forItemListView')
      .then((result) => {
        // result가 존재한다면 테이블리스트 merge
        if (result.length > 0) {
          this.schemaTableList = this.schemaTableList.map((item) => {
            return _.merge(item, _.find(result.map((column) => {
              return {table: column.table, metadataName: column.name}
            }), {'table': item}));
          });
        }
        // 테이블 리스트 그리드 그리기
        this._drawGridTableList();
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 메타데이터 상세정보 조회
   * @param {string} tableName
   * @private
   */
  private _getTableMetaDataDetail(tableName: string): void {

    // table array 생성
    let tableNameArr: string[] = [];
    if (tableName != '') {
      tableNameArr.push(tableName);
    }

    this._metaDataService.getMetadataByConnection(this.dataConnection.id, this.selectedDatabaseName, tableNameArr)
      .then((result) => {
        // result가 존재한다면 컬럼리스트 merge
        if (result.length > 0) {
          this.schemaTableColumnList = this.schemaTableColumnList.map((item) => {
            return _.merge(item, _.find(result[0].columns, {'physicalName': item.columnName}));
          });
        }
        // 컬럼 그리드 그리기
        this._drawGridColumnList();
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - grid
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 리스트 그리드 그리기
   * @private
   */
  private _drawGridColumnList(): void {
    // data
    const data: any = this.schemaTableColumnList;
    const enableMetaData: boolean = _.some(this.schemaTableColumnList, column => column.name);
    // headers
    const headers: header[] = [];
    // Physical name
    headers.push(this._createSlickGridHeader('physicalName', 'Column Name', 300));
    // Logical name
    enableMetaData && headers.push(this._createSlickGridHeader('LogicalName', 'Logical Column Name', 300));
    // Type
    headers.push(this._createSlickGridHeader('type', 'Type', 200));
    // Desc
    headers.push(this._createSlickGridHeader('description', 'Description', 300));
    // rows
    const rows: any[] = [];
    for (let idx: number = 0; idx < data.length; idx = idx + 1) {
      const row = {};
      // Physical name
      row['physicalName'] = data[idx]['columnName'];
      // Logical name
      enableMetaData && (row['LogicalName'] = data[idx]['name']);
      // Type
      // column size가 없을 경우 확인
      if (isUndefined(data[idx]['columnSize'])) {
        row['type'] = data[idx]['columnType'];
      } else {
        row['type'] = data[idx]['columnType'] + '(' + data[idx]['columnSize'] + ')';
      }
      // Desc
      row['description'] = data[idx]['description'];
      rows.push(row);
    }
    // 그리드 생성
    this._createGridComponent(this.gridSchemaColumnComponent, headers, rows, 32);
  }

  /**
   * 테이블 리스트 그리드 그리기
   * @private
   */
  private _drawGridTableList(): void {
    // data
    const data: any = this.schemaTableList;
    const enableMetaData: boolean = _.some(this.schemaTableList, table => table.metadataName);
    // headers
    const headers: header[] = [];
    // headers.push(this._createSlickGridHeader('name', 200));
    // headers.push(this._createSlickGridHeader('type', 120));
    // headers.push(this._createSlickGridHeader('comment', 260));

    headers.push(this._createSlickGridHeader('name', 'Table Name', enableMetaData ? 230 : 460));
    // MetaData name
    enableMetaData && headers.push(this._createSlickGridHeader('metadataName', 'Metadata Name', 230));

    // rows
    const rows: any[] = [];
    for (let idx: number = 0; idx < data.length; idx = idx + 1) {
      const row = {};
      row['name'] = data[idx];
      enableMetaData && (row['metadataName'] = data[idx]['metadataName'] || '');
      rows.push(row);
    }
    // 그리드 생성
    this._createTableGridComponent(this.gridSchemaComponent, headers, rows, 32);
    // 테이블 검색어가 있는경우
    if (this.searchTableText !== '') {
      // 테이블 검색어 초기화
      this.onSearchTableInit();
    }

    // 테이블 테이터가 있을경우 첫번째 column 탭 호출
    if (this.schemaTableList.length > 0) {
      // 컬럼 선택 및 리스트 조회
      this.selectedSchemaTable = this.schemaTableList[0];
      this.schemaSelectedTab = 'column';
      this.getColumnList();

      // 그리드 셀렉트 효과
      this.gridSchemaComponent.selectRowActivate(0);
      // 현재 상태를 sort asc 변경
      this.gridSchemaComponent.setCurrentSortColumns(true);

      for (let index: number = 0; index < headers.length; index++) {
        // icon default 변경
        const gridSchemaHeader = $('.ddp-pop-wrapList .slick-header-columns');
        gridSchemaHeader.find('.slick-sort-indicator').eq(index).removeClass('slick-sort-indicator-asc');
      }

    }
  }

  /**
   * 테이블 상세데이터 그리드 그리기
   * @private
   */
  private _drawGridTableDetailData(): void {
    // data
    const data: any = this.schemaTableDataList;
    // headers
    const headers: header[] = [];
    for (let index: number = 0; index < data.fields.length; index = index + 1) {
      const temp = data.fields[index].name;
      const columnCnt = temp.length;
      // 컬럼 길이
      const columnWidth = (7 > columnCnt) ? 80 : (columnCnt * 13.5);
      headers.push(this._createSlickGridHeader(temp, temp, columnWidth, data.fields[index].logicalType.toString()));
    }
    // rows
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
    // 그리드 생성
    this._createGridComponent(this.gridSchemaDataComponent, headers, rows, 32);
  }

  /**
   * slick grid header 생성
   * @param {string} field
   * @param {string} name
   * @param {number} width
   * @param {string} iconType
   * @returns {header}
   * @private
   */
  private _createSlickGridHeader(field: string, name: string, width: number, iconType?: string): header {
    return iconType
      ? new SlickGridHeader()
        .Id(field)
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(iconType) + '"></em>' + name + '</span>')
        .Field(field)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(width)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .build()
      : new SlickGridHeader()
        .Id(field)
        .Name(name)
        .Field(field)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(width)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(true)
        .build();
  }

  /**
   * grid component 생성
   * @param {GridComponent} gridComponent
   * @param {header[]} headers
   * @param {any[]} rows
   * @param {number} rowHeight
   * @private
   */
  private _createGridComponent(gridComponent: GridComponent, headers: header[], rows: any[], rowHeight: number): void {
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(rowHeight)
      .DualSelectionActivate(true)
      .CellExternalCopyManagerActivate(true)
      .EnableSeqSort(true)
      .build()
    );
  }

  /**
   * Table grid create
   * @param {GridComponent} gridComponent
   * @param {header[]} headers
   * @param {any[]} rows
   * @param {number} rowHeight
   * @private
   */
  private _createTableGridComponent(gridComponent: GridComponent, headers: header[], rows: any[], rowHeight: number): void {
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(rowHeight)
      .DualSelectionActivate(false)
      .MultiSelect(false)
      .build()
    );
  }

  /**
   * grid component 검색
   * @param {GridComponent} gridComponent
   * @param {string} searchText
   * @private
   */
  private _searchGridComponent(gridComponent: GridComponent, searchText: string): void {
    gridComponent.search(searchText);
  }

  /**
   * Get parameters for database list
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} databaseName
   * @returns {any}
   * @private
   */
  private _getParameterForDatabase(webSocketId: string, page?: Page, databaseName?: string): any {
    const params = {
      webSocketId: webSocketId,
      loginUserId: CommonUtil.getLoginUserId()
    };
    if (page) {
      params['sort'] = page.sort;
      params['page'] = page.page;
      params['size'] = page.size;
    }
    if (StringUtil.isNotEmpty(databaseName)) {
      params['databaseName'] = databaseName.trim();
    }
    return params;
  }

  /**
   * Get parameter for table
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} tableName
   * @returns {any}
   * @private
   */
  private _getParameterForTable(webSocketId: string, page?: Page, tableName?: string): any {
    const params = {
      webSocketId: webSocketId
    };
    if (page) {
      params['sort'] = page.sort;
      params['page'] = page.page;
      params['size'] = page.size;
    }
    if (StringUtil.isNotEmpty(tableName)) {
      params['tableName'] = tableName.trim();
    }
    return params;
  }

}
