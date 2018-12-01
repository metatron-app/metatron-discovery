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
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  ConnectionType, DatasourceInfo
} from '../../../../../domain/datasource/datasource';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import * as _ from 'lodash';
import { PageResult } from '../../../../../domain/common/page';
import { StringUtil } from '../../../../../common/util/string.util';

/**
 * Creating datasource with Database - connection step
 */
@Component({
  selector: 'db-data-connection',
  templateUrl: './db-set-data-connection.html'
})
export class DbSetDataConnection extends AbstractPopupComponent implements OnInit, OnDestroy {

  // create source data
  private _sourceData: DatasourceInfo;

  // connection properties
  private _properties: any;

  // connection preset list
  public connectionPresetList: any[] = [{name: this.translateService.instant('msg.storage.ui.user.input'), default: true}];

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this._sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // selected connection preset
  public selectedConnectionPreset: any;

  // connection information
  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // database
  public database: string = '';
  // sid
  public sid: string = '';
  // catalog
  public catalog: string = '';
  // url
  public url: string = '';

  // ingestion type list
  public ingestionTypeList: any[];
  // selected ingestion type
  public selectedIngestionType: any;
  // database type list
  public dbTypeList: any[];
  // selected database type
  public selectedDbType: any;
  // security type list
  public securityTypeList: any[];
  // selected security type
  public selectedSecurityType: any;
  // URL enabled flag
  public isEnableUrl: boolean;

  // connection result success flag
  public connectionResultFl: boolean = null;
  // next button flag
  public isClickedNext: boolean;
  // input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowSidRequired: boolean;
  public isShowDatabaseRequired: boolean;
  public isShowCatalogRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;


  // constructor
  constructor(private dataconnectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui 초기화
    this._initView();
    // if exist connectionData, load connectionData
    if (this._sourceData.hasOwnProperty('connectionData')) {
      this._loadData(_.cloneDeep(this._sourceData.connectionData));
    } else {
      // get connection preset list
      this._getDataConnectionPresetList();
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /**
   * Next click event
   */
  public next(): void {
    // clicked next button flag
    this.isClickedNext = true;
    // next enable validation
    if (this.isEnableNext()) {
      // if exist connectionData
      if (this._sourceData.hasOwnProperty('connectionData')) {
        // if changed connectionData, delete databaseData, schemaData, ingestionData
        if (this._isChangeConnection(this._sourceData.connectionData)) {
          delete this._sourceData.databaseData;
          delete this._sourceData.schemaData;
          delete this._sourceData.ingestionData;
        }
        // delete connectionData
        delete this._sourceData.connectionData;
      }
      // save connectionData
      this._saveConnectionData(this._sourceData);
      // move to next step
      this.step = 'db-select-data';
      this.stepChange.emit(this.step);
    }
  }


  /**
   * Get selectedConnectionPreset index in connectionPreset list
   * @returns {number}
   */
  public getConnectionDefaultIndex(): number {
    // 커넥션 있을때만 작동
    return this.selectedConnectionPreset && this.selectedConnectionPreset.id
      ? this.connectionPresetList.findIndex((item) => {
          return item.id === this.selectedConnectionPreset.id;
        })
      : 0;
  }

  /**
   * Is required database
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    return this.selectedDbType.value === 'POSTGRESQL';
  }

  /**
   * Is required SID
   * @returns {boolean}
   */
  public isRequiredSid(): boolean {
    return this.selectedDbType.value === 'TIBERO' || this.selectedDbType.value === 'ORACLE';
  }

  /**
   * Is required Catalog
   * @returns {boolean}
   */
  public isRequiredCatalog(): boolean {
    return this.selectedDbType.value === 'PRESTO';
  }

  /**
   * Is used UserAccount for connect
   * @returns {boolean}
   */
  public isConnectUserAccount(): boolean {
    return this.selectedSecurityType.value === 'USERINFO';
  }

  /**
   * Is used id and password for connect
   * @returns {boolean}
   */
  public isConnectWithIdAndPassword(): boolean {
    return this.selectedSecurityType.value === 'DIALOG';
  }

  /**
   * Is enable connection validation
   * @returns {boolean}
   */
  public isEnabledConnectionValidation(): boolean {
    let result: boolean = true;
    // if disable URL
    if (!this.isEnableUrl) {
      // if empty hostname
      if (StringUtil.isEmpty(this.hostname)) {
        this.isShowHostRequired = true;
        result = false;
      }
      // if empty port
      if (!this.port) {
        this.isShowPortRequired = true;
        result = false;
      }
      // if empty SID
      if (this.isRequiredSid() && StringUtil.isEmpty(this.sid)) {
        this.isShowSidRequired = true;
        result = false;
      }
      // if empty database
      if (this.isRequiredDatabase() && StringUtil.isEmpty(this.database)) {
        this.isShowDatabaseRequired = true;
        result = false;
      }
      // if empty catalog
      if (this.isRequiredCatalog() && StringUtil.isEmpty(this.catalog)) {
        this.isShowCatalogRequired = true;
        result = false;
      }
    // if enable URL and, empty URL
    } else if (StringUtil.isEmpty(this.url)) {
      this.isShowUrlRequired = true;
      result = false;
    }
    // if empty username
    if (!this.isConnectUserAccount() && StringUtil.isEmpty(this.username)) {
      this.isShowUsernameRequired = true;
      result = false;
    }
    // if empty password
    if (!this.isConnectUserAccount() && StringUtil.isEmpty(this.password)) {
      this.isShowPasswordRequired = true;
      result = false;
    }
    return result;
  }

  /**
   * Is enable next page
   * @returns {boolean}
   */
  public isEnableNext(): boolean {
    return this.connectionResultFl;
  }

  /**
   * Change database type click event
   * @param type
   */
  public onChangeDbType(type): void {
    // if user input type and not equal database type
    if (!this.selectedConnectionPreset.id && type !== this.selectedDbType) {
      // change selected database type
      this.selectedDbType = type;
      // init connection input flag
      this.initConnectionFlag();
      // init connection result flag
      this.initConnectionResultFlag();
    }
  }

  /**
   * Change security type click event
   * @param type
   */
  public onChangeSecurityType(type: any): void {
    // if user input type and not equal security type
    if (!this.selectedConnectionPreset.id && type !== this.selectedSecurityType) {
      // change security type
      this.selectedSecurityType = type;
      // init connection input flag
      this.initConnectionFlag();
      // init connection result flag
      this.initConnectionResultFlag();
    }
  }

  /**
   * Change enable URL flag click event
   */
  public onChangeEnableURL(): void {
    // checked disable
    event.preventDefault();
    // if user input type
    if (!this.selectedConnectionPreset.id) {
      // change enable URL flag
      this.isEnableUrl = !this.isEnableUrl;
      // init connection input flag
      this.initConnectionFlag();
      // init connection result flag
      this.initConnectionResultFlag();
    }
  }

  /**
   * Connection check click event
   */
  public onClickConnectionValidation(): void {
    // if enable connection validation, connection validation
    this.isEnabledConnectionValidation() && this._checkConnection();
  }

  /**
   * Change ingestion type click event
   * @param type
   */
  public onChangeIngestionType(type: any): void {
    this.selectedIngestionType = type;
  }

  /**
   * Change connection preset click event
   * @param preset
   */
  public onSelectedConnectionPreset(preset): void {
    // change selected connection preset
    this.selectedConnectionPreset = preset;
    // init connection input flag
    this.initConnectionFlag();
    // init connection result flag
    this.initConnectionResultFlag();
    // if exist preset id
    if (this.selectedConnectionPreset.id) {
      // get connection data in preset
      this._getConnectionPresetDetailData();
    }
  }

  /**
   * Preset list scroll event
   * @param number
   */
  public onScrollPage(number): void {
    // if remain next page
    if (this._isMorePage()) {
      // save pageResult
      this.pageResult.number = number;
      // get more preset list
      this._getDataConnectionPresetList();
    }
  }

  /**
   * init connection result flag
   */
  public initConnectionResultFlag(): void {
    // init connection result flag
    this.connectionResultFl = null;
    // init clicked next flag
    this.isClickedNext = false;
  }

  /**
   * init connection input flag
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
   * Connection validaiton
   * @private
   */
  private _checkConnection(): void {
    // loading show
    this.loadingShow();
    // check connection
    this.dataconnectionService.checkConnection(this._getConnectionParams())
      .then((result) => {
        // connection result
        this.connectionResultFl = result['connected'];
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        // set connection result fail
        this.connectionResultFl = false;
        // loading hide
        this.commonExceptionHandler(error);
      });
  }

  /**
   * Is more next page
   * @returns {boolean}
   * @private
   */
  private _isMorePage(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * Is change connection data
   * @param prevConnection
   * @returns {boolean}
   * @private
   */
  private _isChangeConnection(prevConnection: any): boolean {
    // if preset changed
    if (prevConnection.selectedConnectionPreset.id !== this.selectedConnectionPreset.id) {
      return true;
    }
    // database type
    if (prevConnection.selectedDbType.value !== this.selectedDbType.value) {
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
    // database
    if (prevConnection.database !== this.database.trim()) {
      return true;
    }
    // catalog
    if (prevConnection.catalog !== this.catalog.trim()) {
      return true;
    }
    // sid
    if (prevConnection.sid !== this.sid.trim()) {
      return true;
    }
    return false;
  }

  /**
   * Get connection preset list
   * @private
   */
  private _getDataConnectionPresetList(): void {
    // loading show
    this.loadingShow();
    // get connection preset list
    this.dataconnectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // if exist preset list
        if (result['_embedded']) {
          this.connectionPresetList = this.connectionPresetList.concat(result['_embedded'].connections);
        }
        // page
        this.pageResult = result['page'];
        // loading hide
        this.loadingHide();
      })
     .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get connection data in preset
   * @private
   */
  private _getConnectionPresetDetailData(): void {
    // loading show
    this.loadingShow();
    //  get connection data in preset
    this.dataconnectionService.getDataconnectionDetail(this.selectedConnectionPreset.id)
      .then((result) => {
        // init connection input data
        this._initConnectionData();
        // set connection input data
        this._setDataconnection(result);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get parameter for connection preset list
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
   * Get parameter for connection
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    const params = {
      implementor: this.selectedDbType.value,
      authenticationType: this.selectedSecurityType.value
    };
    // if security type is not USERINFO, add password and username
    if (!this.isConnectUserAccount()) {
      params['password'] = this.password.trim();
      params['username'] = this.username.trim();
    }
    // if disable URL, add hostname, port, database in parameter
    if (!this.isEnableUrl) {
      params['hostname'] = this.hostname.trim();
      params['port'] = this.port;
      // if enable catalog, add catalog
      this.isRequiredCatalog() && (params['catalog'] = this.catalog);
      // if enable SID, add SID
      this.isRequiredSid() && (params['sid'] = this.sid);
      // if enable database, add database
      this.isRequiredDatabase() && (params['database'] = this.database);
      // if enable URL, add URL in parameter
    } else {
      params['url'] = this.url.trim();
    }
    return {connection: params};
  }

  /**
   * Set connection input data
   * @param connection
   * @private
   */
  private _setDataconnection(connection): void {
    this.selectedDbType = this.dbTypeList.find(type => type.value === connection.implementor.toString());
    connection.username && (this.username = connection.username);
    connection.password && (this.password = connection.password);
    connection.hostname && (this.hostname = connection.hostname);
    connection.port && (this.port = connection.port);
    if (connection.url) {
      this.url = connection.url;
      this.isEnableUrl = true;
    }
    // database
    connection.hasOwnProperty('database') && (this.database = connection.database);
    // sid
    connection.hasOwnProperty('sid') && (this.sid = connection.sid);
    // catalog
    connection.hasOwnProperty('catalog') && (this.catalog = connection.catalog);
    // if security not exist, set security MANUAL
    this.selectedSecurityType = this.securityTypeList.find(type => type.value === connection.authenticationType) || this.securityTypeList[0];
    // if exist connection properties
    if (connection.properties && Object.keys(connection.properties).length !== 0) {
      this._properties = connection.properties;
    }
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
      selectedDbType: this.selectedDbType,
      selectedIngestionType: this.selectedIngestionType,
      connectionPresetList: this.connectionPresetList,
      selectedConnectionPreset: this.selectedConnectionPreset,
      connectionResultFl: this.connectionResultFl,
      isUsedConnectionPreset: this.selectedConnectionPreset.id ? true : false,
      pageResult: this.pageResult,
      isEnableUrl : this.isEnableUrl,
      selectedSecurityType: this.selectedSecurityType,
      properties: this._properties
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
    // 선택한 프리셋
    this.selectedConnectionPreset = this.connectionPresetList[0];
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
    this.initConnectionResultFlag();
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
    // implementor
    this.selectedDbType = connectionData.selectedDbType;
    // connection Type
    this.selectedIngestionType = connectionData.selectedIngestionType;
    // 프리셋 목록
    this.connectionPresetList = connectionData.connectionPresetList;
    // 선택된 프리셋
    this.selectedConnectionPreset = connectionData.selectedConnectionPreset;
    // 커넥션 연결 success flag
    this.connectionResultFl = connectionData.connectionResultFl;
    // page result
    this.pageResult = connectionData.pageResult;
    // 선택한 url 타입
    this.isEnableUrl = connectionData.isEnableUrl;
    // security
    this.selectedSecurityType = connectionData.selectedSecurityType;
    // properties
    this._properties = connectionData.properties;
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
    this.isEnableUrl = false;
    this._properties = null;
  }
}
