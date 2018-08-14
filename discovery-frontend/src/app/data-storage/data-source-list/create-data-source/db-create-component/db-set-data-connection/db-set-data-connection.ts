/*
 *
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

import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  ConnectionType, DatasourceInfo
} from '../../../../../domain/datasource/datasource';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../../common/util/alert.util';
import { CommonUtil } from '../../../../../common/util/common.util';
import * as _ from 'lodash';
import { PageResult } from '../../../../../domain/common/page';
import { StringUtil } from '../../../../../common/util/string.util';

@Component({
  selector: 'db-data-connection',
  templateUrl: './db-set-data-connection.html'
})
export class DbSetDataConnection extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 새로 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  // 커넥션 프리셋 리스트
  private connectionPresetList: any[] = [];

  // 선택한 프리셋 정보
  private selectedConnectionPreset: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // connection information
  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // 데이터베이스
  public database: string = '';
  // sid
  public sid: string = '';
  // 카탈로그
  public catalog: string = '';
  // url
  public url: string = '';
  // 새로 생성될 커넥션 name
  public connectionName: string = '';

  // ingestion 타입 목록
  public ingestionTypeList: any[];
  // 선택한 ingestion 타입 목록
  public selectedIngestionType: any;
  // DB 타입목록
  public dbTypeList: any[];
  // 선택한 DB
  public selectedDbType: any;
  // security 타입 목록
  public securityTypeList: any[];
  // 선택한 security 타입
  public selectedSecurityType: any;
  // URL 사용
  public isEnableUrl: boolean;

  // 새로운 커넥션 생성 flag
  public createConnectionFl: boolean = false;
  // 커넥션 연결 success flag
  public connectionResultFl: boolean = null;
  // 다음 버튼 클릭 flag
  public isClickedNext: boolean;
  // 서버 input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowSidRequired: boolean;
  public isShowDatabaseRequired: boolean;
  public isShowCatalogRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;
  // 이름 input validation
  public isShowConnectionNameRequired: boolean;
  // 커넥션 이름 메세지
  public nameErrorMsg: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataconnectionService: DataconnectionService,
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
    // ui 초기화
    this._initView();

    // 현재 페이지 커넥션 정보가 있다면
    if (this.sourceData.hasOwnProperty('connectionData')) {
      // load data
      this._loadData(_.cloneDeep(this.sourceData.connectionData));
    } else {
      // 프리셋 조회
      this._getDataConnectionPresetList();
    }
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
   * 다음화면으로 이동
   */
  public next(): void {
    // 버튼 클릭 flag
    this.isClickedNext = true;
    // validation
    if (this.nextValidation()) {
      // 커넥션정보가 존재하다면
      if (this.sourceData.hasOwnProperty('connectionData')) {
        // 데이터소스 타입이 바뀌었다면 schema ingestion 삭제
        if (this._isChangeConnection()) {
          delete this.sourceData.databaseData;
          delete this.sourceData.schemaData;
          delete this.sourceData.ingestionData;
        }
        // 기존 커넥션 정보 삭제
        delete this.sourceData.connectionData;
      }

      // 현재 페이지의 커넥션정보 저장
      this._saveConnectionData(this.sourceData);

      // 다음 단계로
      this.step = 'db-select-data';
      this.stepChange.emit(this.step);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 프리셋 목록
   * @returns {any[]}
   */
  public get getPresetList(): any[] {
    return this.connectionPresetList;
  }

  /**
   * 커넥션 default index
   * @returns {number}
   */
  public getConnectionDefaultIndex(): number {
    // 커넥션 있을때만 작동
    return this.selectedConnectionPreset
      ? this.connectionPresetList.findIndex((item) => {
          return item.name === this.selectedConnectionPreset.name;
        })
      : -1;
  }

  /**
   * 프리셋의 아이디
   * @returns {any}
   */
  public getSelectedConnectionPresetId(): any {
    return this.selectedConnectionPreset.id;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    // postgre 만 사용
    return this.selectedDbType.value === 'POSTGRESQL';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredSid(): boolean {
    // oracle | tibero 만 사용
    return this.selectedDbType.value === 'TIBERO' || this.selectedDbType.value === 'ORACLE';
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredCatalog(): boolean {
    // presto 만 사용
    return this.selectedDbType.value === 'PRESTO';
  }

  /**
   * 사용자 계정으로 연결하는지
   * @returns {boolean}
   */
  public isConnectUserAccount(): boolean {
    return this.selectedSecurityType.value === 'USERINFO';
  }

  /**
   * 아이디와 비번으로 연결하는지
   * @returns {boolean}
   */
  public isConnectWithIdAndPassword(): boolean {
    return this.selectedSecurityType.value === 'DIALOG';
  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  public isEnabledConnectionValidation(): boolean {
    let result: boolean = true;
    // URL 허용하지 않는다면
    if (!this.isEnableUrl) {
      // hostname 없는경우
      if (this.hostname.trim() === '') {
        this.isShowHostRequired = true;
        result = false;
      }
      // port 없는경우
      if (!this.port) {
        this.isShowPortRequired = true;
        result = false;
      }
      // sid 없는경우
      if (this.isRequiredSid() && this.sid.trim() === '') {
        this.isShowSidRequired = true;
        result = false;
      }
      // database 없는경우
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        this.isShowDatabaseRequired = true;
        result = false;
      }
      // catalog 없는경우
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        this.isShowCatalogRequired = true;
        result = false;
      }
      // username
      if (!this.isConnectUserAccount() && this.username.trim() === '') {
        this.isShowUsernameRequired = true;
        result = false;
      }
      // password
      if (!this.isConnectUserAccount() && this.password.trim() === '') {
        this.isShowPasswordRequired = true;
        result = false;
      }
    } else if (this.url.trim() === '') {
      this.isShowUrlRequired = true;
      result = false;
    }
    return result;
  }

  /**
   * 다음페이지로 가기위한 validation
   * @returns {boolean}
   */
  public nextValidation(): boolean {
    let result: boolean = this.connectionResultFl;
    // 새로운 커넥션을 생성한다면
    if (this.createConnectionFl) {
      result = this._connectionNameValidation();
    }
    return result;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 선택 이벤트
   * @param type
   */
  public onChangeDbType(type): void {
    // 선택된 데이터베이스가 다를 경우에만 작동
    if (type !== this.selectedDbType) {
      // 데이터베이스 타입 변경
      this.selectedDbType = type;
      // 프리셋 초기화
      this.initConnectionPresetData();
      // 커넥션 input flag 초기화
      this.initConnectionFlag();
      // 커넥션 flag 초기화
      this.initConnectionResultFlag();
    }
  }

  /**
   * security 타입 변경 이벤트
   * @param type
   */
  public onChangeSecurityType(type: any): void {
    // 선택된 보안 타입이 다를 경우에만 작동
    if (type !== this.selectedSecurityType) {
      // 보안 타입 변경
      this.selectedSecurityType = type;
      // 커넥션 input flag 초기화
      this.initConnectionFlag();
      // 커넥션 flag 초기화
      this.initConnectionResultFlag();
    }
  }

  /**
   * URL 허용 변경 이벤트
   */
  public onChangeEnableURL(): void {
    this.isEnableUrl = !this.isEnableUrl;
    // 커넥션 플래그 초기화
    this.initConnectionPresetData();
    // 커넥션 input flag 초기화
    this.initConnectionFlag();
    // 커넥션 flag 초기화
    this.initConnectionResultFlag();
  }

  /**
   * 커넥션 체크 클릭 이벤트
   */
  public onClickConnectionValidation(): void {
    // check
    this.isEnabledConnectionValidation() && this._checkConnection();
  }

  /**
   * ingestion 타입 변경 이벤트
   * @param type
   */
  public onChangeIngestionType(type: any): void {
    this.selectedIngestionType = type;
  }

  /**
   * 프리셋 선택 이벤트
   * @param preset
   */
  public onSelectedConnectionPreset(preset): void {
    // 프리셋 선택
    this.selectedConnectionPreset = preset;
    // 커넥션 input flag 초기화
    this.initConnectionFlag();
    // 커넥션 flag 초기화
    this.initConnectionResultFlag();
    // 해당 프리셋 상세조회
    this._getConnectionPresetDetailData();
  }

  /**
   * 커넥션 생성 클릭 이벤트
   */
  public onClickCreateConnection(): void {
    // 이벤트 중복 제거
    event.preventDefault();
    // 커넥션이 통과했을경우에만 클릭가능
    if (this.connectionResultFl) {
      this.createConnectionFl = !this.createConnectionFl;
    }
  }

  /**
   * 페이지 증가
   * @param number
   */
  public onScrollPage(number): void {
    // 더 조회할 페이지가 있는지 확인
    if (this._isMorePage()) {
      // page result 저장
      this.pageResult.number = number;
      // 프리셋 조회
      this._getDataConnectionPresetList();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * connection result flag init
   */
  public initConnectionResultFlag(): void {
    // 커넥션 통과
    this.connectionResultFl = null;
    // 생성 초기화
    this.createConnectionFl = false;
    // 다음 클릭버튼 초기화
    this.isClickedNext = false;
  }

  /**
   * connection flag init
   */
  public initConnectionFlag(): void {
    this.isShowHostRequired = null;
    this.isShowPortRequired = null;
    this.isShowSidRequired = null;
    this.isShowDatabaseRequired = null;
    this.isShowCatalogRequired = null;
    this.isShowUrlRequired = null;
    this.isShowUsernameRequired = null;
    this.isShowPasswordRequired = null;
  }

  /**
   * 프리셋 데이터 초기화
   */
  public initConnectionPresetData(): void {
    // 프리셋 데이터 초기화
    this.selectedConnectionPreset = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 이름 validation
   * @returns {boolean}
   */
  private _connectionNameValidation(): boolean {
    // 이름이 없다면
    if (this.connectionName.trim() === '') {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.storage.dconn.name.error');
      return false;
    }
    // 이름길이 체크
    if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }
    return true;
  }

  /**
   * 커넥션 연결 체크
   * @private
   */
  private _checkConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터커넥션 테스트
    this.dataconnectionService.checkConnection(this._getConnectionParams())
      .then((result) => {
        // 커넥트 결과 flag
        this.connectionResultFl = result['connected'];
        // 커넥션 이름 기본값 설정
        if (this.connectionName === '') {
          this.connectionName = this._getDefaultConnectionName();
          this.isShowConnectionNameRequired = false;
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 커넥트 결과 fail
        this.connectionResultFl = false;
        // 로딩 hide
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 파라메터에서 username 과 password 제거
   * @param params
   */
  private _deleteUsernameAndPassword(params: any): void {
    delete params.password;
    delete params.username;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 보여줄 페이지 있는지 여부
   * @returns {boolean}
   * @private
   */
  private _isMorePage(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * 기존 커넥션에서 변경이 일어났는지 여부
   * @returns {boolean}
   * @private
   */
  private _isChangeConnection(): boolean {
    const prevConnection = this.sourceData.connectionData;
    // database type
    if (prevConnection.implementor !== this.selectedDbType.value) {
      return true;
    }
    // hostname
    if (prevConnection.hostname !== this.hostname.trim()) {
      return true;
    }
    // port
    if (prevConnection.port !== this.port) {
      return true;
    }
    // url
    if (prevConnection.url !== this.url.trim()) {
      return true;
    }
    // username
    if (prevConnection.username !== this.username.trim()) {
      return true;
    }
    // password
    if (prevConnection.password !== this.password.trim()) {
      return true;
    }
    // sid
    if (prevConnection.sid !== this.sid.trim()) {
      return true;
    }
    // database
    if (prevConnection.database !== this.database.trim()) {
      return true;
    }
    // catalog
    if (prevConnection.catalog !== this.catalog.trim()) {
      return true;
    }
    return false;
  }

  /**
   * 커넥션 프리셋을 사용하는지 확인
   * @returns {boolean}
   * @private
   */
  private _isUsedConnectionPreset(): boolean {
    // 프리셋이 있을때만 작동
    return this.selectedConnectionPreset ? true : false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터커넥션 프리셋 조회
   * @private
   */
  private _getDataConnectionPresetList(): void {
    // 로딩 show
    this.loadingShow();

    // 데이터커넥션 프리셋 목록 조회
    this.dataconnectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // 데이터가 있다면
        if (result['_embedded']) {
          this.connectionPresetList = this.connectionPresetList.concat(result['_embedded'].connections);
        }
        // page
        this.pageResult = result['page'];
        // 로딩 hide
        this.loadingHide();
      })
     .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 데이터커넥션 프리셋의 상세정보 조회
   * @private
   */
  private _getConnectionPresetDetailData(): void {
    // 로딩 show
    this.loadingShow();

    // 데이터커넥션 프리셋 상세정보 조회
    this.dataconnectionService.getDataconnectionDetail(this.getSelectedConnectionPresetId())
      .then((result) => {
        // 기존 데이터 초기화
        this._initConnectionData();
        // validation 초기화
        this.initConnectionFlag();
        // url이 있다면 타입 설정
        this.isEnableUrl = !StringUtil.isEmpty(result.url);
        // 커넥션 정보 저장
        this._setDataconnection(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 데이터커넥션 프리셋 목록을 가져올때 사용될 파라메터
   * @param {PageResult} pageResult
   * @returns {Object}
   * @private
   */
  private _getConnectionPresetListParams(pageResult: PageResult): object {
    return {
      size: pageResult.size,
      page: pageResult.number,
      type: 'jdbc'
    };
  }

  /**
   * 커넥션 연결 테스트시 사용할 파라메터
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    const params = {
      implementor: this.selectedDbType.value,
      authenticationType: this.selectedSecurityType.value
    };
    // username과 password를 사용한다면
    !StringUtil.isEmpty(this.password) && (params['password'] = this.password.trim());
    !StringUtil.isEmpty(this.username) && (params['username'] = this.username.trim());
    // default라면 hostname, port, database 추가
    if (!this.isEnableUrl) {
      params['hostname'] = this.hostname.trim();
      params['port'] = this.port;
      // catalog 가 있다면
      this.isRequiredCatalog() && (params['catalog'] = this.catalog);
      // sid 가 있다면
      this.isRequiredSid() && (params['sid'] = this.sid);
      // database 가 있다면
      this.isRequiredDatabase() && (params['database'] = this.database);
      // only url이면 url만 추가
    } else {
      params['url'] = this.url.trim();
    }
    // 사용자 계정으로 연결이라면
    this.isConnectUserAccount() && this._deleteUsernameAndPassword(params);
    return {connection: params};
  }

  /**
   * 리스트에서 선택된 타입과 같은 값 추출
   * @param {string} selectedType
   * @param {any[]} list
   * @returns {any}
   * @private
   */
  private _getTypeFindInList(selectedType: string, list: any[]) {
    return list.find((type) => {
      return type.value === selectedType;
    });
  }

  /**
   * 커넥션 default 이름
   * @returns {string}
   * @private
   */
  private _getDefaultConnectionName(): string {
    return this.isEnableUrl ? (this.selectedDbType.label + '-' + this.url) : (this.selectedDbType.label + '-' + this.hostname + '-' + this.port);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 정보 저장
   * @param connection
   * @private
   */
  private _setDataconnection(connection) {
    this.selectedDbType = this.dbTypeList.filter((type) => {
      return type.value === connection.implementor;
    })[0];
    this.username = connection.username;
    this.password = connection.password;
    // default
    connection.hostname && (this.hostname = connection.hostname);
    connection.port && (this.port = connection.port);
    // url
    connection.url && (this.url = connection.url);
    // database
    connection.hasOwnProperty('database') && (this.database = connection.database);
    // sid
    connection.hasOwnProperty('sid') && (this.sid = connection.sid);
    // catalog
    connection.hasOwnProperty('catalog') && (this.catalog = connection.catalog);
  }

  /**
   * 현재 페이지의 커넥션 데이터 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveConnectionData(sourceData: DatasourceInfo) {
    const connectionData = {
      // connection data
      hostname: this.hostname.trim(),
      port: this.port,
      username: this.username.trim(),
      password: this.password.trim(),
      database: this.database.trim(),
      sid: this.sid.trim(),
      catalog: this.catalog.trim(),
      url: this.url.trim(),
      // 선택된 데이터베이스 타입
      implementor: this.selectedDbType.value,
      // 선택된 커넥션 타입
      connType: this.selectedIngestionType.value,
      // 프리셋 목록
      connectionPresetList: this.connectionPresetList,
      // 선택된 프리셋
      selectedConnectionPreset: this.selectedConnectionPreset,
      // connection name
      connectionName: this.connectionName.trim(),
      // flag
      createConnectionFl: this.createConnectionFl,
      // 커넥션 연결 success flag
      connectionResultFl: this.connectionResultFl,
      // connection 프리셋 사용 여부
      connectionPresetFl: this._isUsedConnectionPreset(),
      // page result
      pageResult: this.pageResult,
      // 선택한 url 타입
      selectedUrlType : this.isEnableUrl
    };
    sourceData['connectionData'] = connectionData;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView() {
    // ingestion 타입 목록
    this.ingestionTypeList = [
      { label : this.translateService.instant('msg.storage.ui.list.ingested.data'), value : ConnectionType.ENGINE },
      { label : this.translateService.instant('msg.storage.ui.list.linked.data'), value : ConnectionType.LINK }
    ];
    // 선택한 ingestion 타입 목록
    this.selectedIngestionType = this.ingestionTypeList[0];
    // security 타입 목록
    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    // 선택한 security 타입
    this.selectedSecurityType = this.securityTypeList[0];
    // db type list
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    this.selectedDbType = this.dbTypeList[0];
    // URL 타입
    this.isEnableUrl = false;
    // flag 초기화
    this.initConnectionFlag();
    this.initConnectionPresetData();
    this.initConnectionResultFlag();
    // 이름 flag
    this.isShowConnectionNameRequired = false;
    // page result
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

  /**
   * load connection data
   * @param connectionData
   * @private
   */
  private _loadData(connectionData: any) {
    // connection data
    this.hostname = connectionData.hostname;
    this.port = connectionData.port;
    this.username = connectionData.username;
    this.password = connectionData.password;
    this.database = connectionData.database;
    this.sid = connectionData.sid;
    this.catalog = connectionData.catalog;
    this.url = connectionData.url;
    // connection name
    this.connectionName = connectionData.connectionName;
    // implementor
    this.selectedDbType = this._getTypeFindInList(connectionData.implementor, this.dbTypeList);
    // connection Type
    this.selectedIngestionType = this._getTypeFindInList(connectionData.connType ,this.ingestionTypeList);
    // 프리셋 목록
    this.connectionPresetList = connectionData.connectionPresetList;
    // 선택된 프리셋
    this.selectedConnectionPreset = connectionData.selectedConnectionPreset;
    // flag
    this.createConnectionFl = connectionData.createConnectionFl;
    // 커넥션 연결 success flag
    this.connectionResultFl = connectionData.connectionResultFl;
    // page result
    this.pageResult = connectionData.pageResult;
    // 선택한 url 타입
    this.isEnableUrl = connectionData.selectedUrlType;
  }

  /**
   * init connection data
   * @private
   */
  private _initConnectionData(): void {
    this.hostname = '';
    this.port = null;
    this.username = '';
    this.password = '';
    this.database = '';
    this.sid = '';
    this.catalog = '';
    this.url = '';
  }
}
