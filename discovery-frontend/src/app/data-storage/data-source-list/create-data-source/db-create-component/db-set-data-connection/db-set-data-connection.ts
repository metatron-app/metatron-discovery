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

  // 최초 접근시 flag
  private firstFl: boolean = true;
  private nameFirstFl: boolean = true;

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

  // DB 타입목록
  public dbTypeList: any[];
  // 선택한 DB
  public selectedDbType: any;
  // connection 타입목록
  public connectionTypeList: any[];
  // 선택한 connection 타입
  public selectedConnectionType: any;
  // URL 타입 목
  public urlTypes: any[];
  // 선택한 URL 타입
  public selectedUrlType: string;

  // 새로운 커넥션 생성 flag
  public createConnectionFl: boolean = false;
  // 커넥션 연결 success flag
  public connectionResultFl: boolean = null;

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
    // validation
    if (this.nextValidation() && this.getConnectionNameValidation()) {
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

  /**
   * connection validation message
   * @returns {string}
   */
  public getValidationMessage(): string {
    // URL 타입이 Default 라면
    if (this.isDefaultType()) {
      // hostname
      if (this.hostname.trim() === '') {
        return this.translateService.instant('msg.storage.alert.host.required');
      }
      // port
      if (!this.port) {
        return this.translateService.instant('msg.storage.alert.port.required');
      }
      // sid
      if (this.isRequiredSid() && this.sid.trim() === '') {
        return this.translateService.instant('msg.storage.alert.sid.required');
      }
      // database
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        return this.translateService.instant('msg.storage.alert.db.required');
      }
      // catalog
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        return this.translateService.instant('msg.storage.alert.catalogue.required');
      }
      // username
      if (this.username.trim() === '') {
        return this.translateService.instant('msg.storage.alert.user-name.required');
      }
      // password
      if (this.password.trim() === '') {
        return this.translateService.instant('msg.storage.alert.pw.required');
      }
    } else if (this.url.trim() === '') {
      return this.translateService.instant('msg.storage.alert.url.required');
    }
    return '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * url이 default 타입이라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return this.selectedUrlType === 'DEFAULT';
  }

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
   * connection validation message 를 보여주는지 여부
   * @returns {boolean}
   */
  public isShowValidationMessage(): boolean {
    return !(this.firstFl || this.connectionResultFl !== null);
  }

  /**
   * name validation message 를 보여주는지 여부
   * @returns {boolean}
   */
  public isShowNameValidationMessage(): boolean {
    // 최초 접근이거나 이름이 있을때 return
    return !(this.nameFirstFl || this.connectionName.trim() !== '');
  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  public isEnabledConnectionTest(): boolean {
    // URL 타입이 Default 라면
    if (this.isDefaultType()) {
      // hostname 없는경우
      if (this.hostname.trim() === '') {
        return false;
      }
      // port 없는경우
      if (!this.port) {
        return false;
      }
      // sid 없는경우
      if (this.isRequiredSid() && this.sid.trim() === '') {
        return false;
      }
      // database 없는경우
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        return false;
      }
      // catalog 없는경우
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        return false;
      }
      // username
      if (this.username.trim() === '') {
        return false;
      }
      // password
      if (this.password.trim() === '') {
        return false;
      }
    } else if (this.url.trim() === ''){
      return false;
    }
    return true;
  }

  /**
   * 다음페이지로 가기위한 validation
   * @returns {boolean}
   */
  public nextValidation(): boolean {
    // 새로운 커넥션을 생성한다면
    if (this.createConnectionFl) {
      return this.connectionName.trim() !== '' && this.connectionResultFl;
    } else {
      return this.connectionResultFl;
    }
  }

  /**
   * 커넥션 이름 validation
   * @returns {boolean}
   */
  public getConnectionNameValidation(): boolean {
    // 새로운 커넥션을 생성할때만 작동
    if (this.createConnectionFl) {
      // 이름이 없다면
      if (this.connectionName.trim() === '') {
        return false;
      }
      // 이름길이 체크
      if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
        Alert.warning(this.translateService.instant('msg.alert.edit.name.len'));
        return false;
      }
    }
    return true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * url 타입 변경 이벤트
   * @param {string} urlType
   */
  public onSelectedUrlType(urlType: string): void {
    // 같은 타입이면 return
    if (this.selectedUrlType === urlType) {
      return;
    }
    // url 타입
    this.selectedUrlType = urlType;
    // 커넥션 플래그 초기화
    this.initConnectionPresetData();
  }

  /**
   * 프리셋 선택 이벤트
   * @param preset
   */
  public onSelectedConnectionPreset(preset): void {
    // 프리셋 선택
    this.selectedConnectionPreset = preset;
    // 해당 프리셋 상세조회
    this._getConnectionPresetDetailData();
  }

  /**
   * 데이터베이스 선택 이벤트
   * @param type
   */
  public onSelectedDbType(type): void {
    // 같은 타입이면 return
    if (this.selectedDbType === type) {
      return;
    }
    // 타입선택
    this.selectedDbType = type;
    // 커넥션 초기화
    this.initConnectionPresetData();
  }

  /**
   * connection type 선택 이벤트
   * @param type
   */
  public onSelectedConnectionType(type): void {
    this.selectedConnectionType = type;
  }

  /**
   * 커넥션 테스트 클릭 이벤트
   */
  public onClickConnectionTest(): void {
    // connection test validation
    if (this.isEnabledConnectionTest()) {
      // 이름 초기화
      this._initConnectionName();
      // 커넥션 테스트
      this._getConnectionTestResult();
    }
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
   * connection flag init
   */
  public initConnectionFlag(): void {
    // 최초 접근 flag
    this.firstFl = false;
    // 커넥션 통과
    this.connectionResultFl = null;
  }

  /**
   * 프리셋 데이터 초기화
   */
  public initConnectionPresetData(): void {
    // 프리셋 데이터 초기화
    this.selectedConnectionPreset = null;
    // connection init flag
    this.initConnectionFlag();
  }

  /**
   * name flag init
   */
  public initNameFlag(): void {
    this.nameFirstFl = false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터커넥션 테스트 결과
   * @private
   */
  private _getConnectionTestResult(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터커넥션 테스트
    this.dataconnectionService.checkConnection(this._getConnectionTestParams())
      .then((result) => {
        // 커넥트 결과 flag
        this.connectionResultFl = result['connected'];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 커넥트 결과 fail
        this.connectionResultFl = false;
        // 로딩 hide
        this.loadingHide();
      });
  }

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
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
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
        // url이 존재한다면 url type 설정
        this.selectedUrlType = StringUtil.isEmpty(result.url) ? this.urlTypes[0].value : this.urlTypes[1].value;
        // 커넥션 정보 저장
        this._setDataconnection(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
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
      usageScope: 'DEFAULT',
      type: 'jdbc'
    };
  }

  /**
   * 커넥션 연결 테스트시 사용할 파라메터
   * @returns {Object}
   * @private
   */
  private _getConnectionTestParams(): object {
    const params = {
      implementor: this.selectedDbType.value
    };
    // username과 password를 사용한다면
    !StringUtil.isEmpty(this.password) && (params['password'] = this.password.trim());
    !StringUtil.isEmpty(this.username) && (params['username'] = this.username.trim());
    // default라면 hostname, port, database 추가
    if (this.isDefaultType()) {
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
      connType: this.selectedConnectionType.value,
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
      // 최초 접근시 flag
      firstFl: this.firstFl,
      nameFirstFl: this.nameFirstFl,
      // connection 프리셋 사용 여부
      connectionPresetFl: this._isUsedConnectionPreset(),
      // page result
      pageResult: this.pageResult,
      // 선택한 url 타입
      selectedUrlType : this.selectedUrlType
    };
    sourceData['connectionData'] = connectionData;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 이름 초기화
   * @private
   */
  private _initConnectionName() {
    // 선택 초기화
    this.createConnectionFl = false;
    // 이름 초기화
    this.connectionName = '';
  }

  /**
   * ui init
   * @private
   */
  private _initView() {
    // connection type list
    this.connectionTypeList = [
      { label : this.translateService.instant('msg.storage.ui.list.ingested.data'), value : ConnectionType.ENGINE },
      { label : this.translateService.instant('msg.storage.ui.list.linked.data'), value : ConnectionType.LINK }
    ];
    // 선택한 connection type
    this.selectedConnectionType = this.connectionTypeList[0];
    // db type list
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    this.selectedDbType = this.dbTypeList[0];
    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL' }
    ];
    this.selectedUrlType = this.urlTypes[0].value;

    // flag 초기화
    // 새로운 커넥션 생성 flag
    this.createConnectionFl = false;
    // 커넥션 연결 success flag
    this.connectionResultFl = null;
    // 최초 접근시 flag
    this.firstFl = true;
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
    this.selectedConnectionType = this._getTypeFindInList(connectionData.connType ,this.connectionTypeList);
    // 프리셋 목록
    this.connectionPresetList = connectionData.connectionPresetList;
    // 선택된 프리셋
    this.selectedConnectionPreset = connectionData.selectedConnectionPreset;
    // flag
    this.createConnectionFl = connectionData.createConnectionFl;
    // 커넥션 연결 success flag
    this.connectionResultFl = connectionData.connectionResultFl;
    // 최초 접근시 flag
    this.firstFl = connectionData.firstFl;
    this.nameFirstFl = connectionData.nameFirstFl;
    // page result
    this.pageResult = connectionData.pageResult;
    // 선택한 url 타입
    this.selectedUrlType = connectionData.selectedUrlType;
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
