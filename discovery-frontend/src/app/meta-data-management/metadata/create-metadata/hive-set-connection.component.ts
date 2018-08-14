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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { PageResult } from '../../../domain/common/page';
import { StringUtil } from '../../../common/util/string.util';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { MetadataModelService } from '../service/metadata.model.service';
import { CommonUtil } from '../../../common/util/common.util';
import { Alert } from '../../../common/util/alert.util';

@Component({
  selector: 'app-hive-set-connection',
  templateUrl: './hive-set-connection.component.html'
})
export class HiveSetConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // URL 타입
  public urlTypes: any[];
  // 선택한 URL 타입
  public selectedUrlType: string;

  // 커넥션 프리셋 목록
  public connectionPresetList: any[] = [];
  // 선택한 프리셋
  public selectedConnectionPreset: any;

  // connection type
  public implementor: string = 'HIVE';
  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // url
  public url: string = '';
  // connection name
  public connectionName: string = '';
  // timeout
  public socketTimeout: number = 60;

  // 새로운 커넥션 생성 flag
  public createConnectionFl: boolean = false;
  // 커넥션 연결 result flag
  public connectionResultFl: boolean = null;
  // advanced opt show flag
  public advancedOptShowFl: boolean = false;
  // 최초 접근 flag
  public firstFl: boolean = true;
  public nameFirstFl: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public metaDataModelService: MetadataModelService,
              private _dataconnectionService: DataconnectionService,
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
    // ui init
    this._initView();
    // connectionStep이 있는 경우에만 load data
    this.metaDataModelService.getCreateData()['connectionStep'] && this._loadData(this.metaDataModelService.getCreateData()['connectionStep']);
    // 프리셋 목록이 없다면 프리셋 목록 조회
    this.connectionPresetList.length === 0 && this._getConnectionPresetList();
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
   * connection flag init
   */
  public initConnectionFlag(): void {
    // 최초 접근 flag
    this.firstFl = false;
    // 커넥션 통과
    this.connectionResultFl = null;
    // 스키마 정보 제거
    this._deleteSchemaStep();
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
   * connection validation message
   * @returns {string}
   */
  public getValidationMessage(): string {
    // URL 타입이 Default 라면
    if (!this.isUrlType()) {
      // hostname
      if (StringUtil.isEmpty(this.hostname)) {
        return this.translateService.instant('msg.storage.alert.host.required');
      }
      // port
      if (!this.port) {
        return this.translateService.instant('msg.storage.alert.port.required');
      }
      // username
      if (StringUtil.isEmpty(this.username)) {
        return this.translateService.instant('msg.storage.alert.user-name.required');
      }
      // password
      if (StringUtil.isEmpty(this.password)) {
        return this.translateService.instant('msg.storage.alert.pw.required');
      }
    } else if (StringUtil.isEmpty(this.url)){
      return this.translateService.instant('msg.storage.alert.url.required');
    }
    return '';
  }

  /**
   * connection name validation message
   * @returns {string}
   */
  public getConnectionNameValidationMessage(): string {
    // 커넥션 이름이 없다면
    if (StringUtil.isEmpty(this.connectionName)) {
      return this.translateService.instant('msg.storage.dconn.name.error');
    }
    // 커넥션 이름이 150자가 넘어가면
    if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      return this.translateService.instant('msg.alert.edit.name.len');
    }
    return '';
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * next validation
   * @returns {boolean}
   */
  public isNextValidation(): boolean {
    return this.createConnectionFl ? (!StringUtil.isEmpty(this.connectionName) && CommonUtil.getByte(this.connectionName.trim()) <= 150 && this.connectionResultFl) : this.connectionResultFl;
  }

  /**
   * URL 타입인지 확인
   * @returns {boolean}
   */
  public isUrlType(): boolean {
    return this.selectedUrlType === 'URL';
  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  public isEnabledConnectionTest() : boolean {
    // URL 타입이 URL타입 이라면
    if (!this.isUrlType()) {
      // hostname 없는경우
      if (StringUtil.isEmpty(this.hostname)) {
        return false;
      }
      // port 없는경우
      if (!this.port) {
        return false;
      }
      // username
      if (StringUtil.isEmpty(this.username)) {
        return false;
      }
      // password
      if (StringUtil.isEmpty(this.password)) {
        return false;
      }
    } else if (StringUtil.isEmpty(this.url)){
      return false;
    }
    return true;
  }

  /**
   * 커넥션 validation 메세지 보여주는지 확인
   * @returns {boolean}
   */
  public isShowValidationMessage(): boolean {
    // 최초 접근 또는 connection check 가 완료된 상태라면 return
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 다음 클릭 이벤트
   */
  public onClickNext(): void {
    // validation 후 화면전환
    if (this.isNextValidation()) {
      // save data
      this._saveData();
      // 화면전환
      this.metaDataModelService.setCreateStep('hive-schema');
    }
  }

  /**
   * 커넥션 테스트 클릭 이벤트
   */
  public onClickConnectionTest(): void {
    // validation 통과 시 커넥션 체크
    this.isEnabledConnectionTest() && this._getConnectionTestResult();
  }

  /**
   * 메타데이터 생성 후 커넥션 생성 클릭 이벤트
   */
  public onClickCreateConnection(): void {
    // 이벤트 중복 제거
    event.preventDefault();
    // 커넥션이 통과한 경우에만 클릭 가능
    this.connectionResultFl && (this.createConnectionFl = !this.createConnectionFl);
  }

  /**
   * 셀렉트박스 페이지 증가
   * @param number
   */
  public onScrollSelectBoxPage(number): void {
    // 더 조회할 페이지가 있는지 확인
    if (this.pageResult.number < this.pageResult.totalPages - 1) {
      // page result 저장
      this.pageResult.number = number;
      // 프리셋 조회
      this._getConnectionPresetList();
    }
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
   * url 타입 변경 이벤트
   * @param {string} urlType
   */
  public onSelectedUrlType(urlType: string): void {
    // 타입이 같지 않을때만 동작
    if (this.selectedUrlType !== urlType) {
      // url 타입
      this.selectedUrlType = urlType;
      // 커넥션 플래그 초기화
      this.initConnectionPresetData();
    }
  }

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
    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT', disabled: true },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL', disabled: true }
    ];
    this.selectedUrlType = this.urlTypes[0].value;
    // page result
    this.pageResult.number = 0;
    this.pageResult.size = 20;
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
    this.url = '';
  }

  /**
   * 현재 커넥션 step 저장
   * @private
   */
  private _saveData(): void {
    const connectionStep = {
      // 선택한 URL 타입
      selectedUrlType: this.selectedUrlType,
      // 커넥션 프리셋 목록
      connectionPresetList: this.connectionPresetList,
      // 선택한 프리셋
      selectedConnectionPreset: this.selectedConnectionPreset,
      // host
      hostname: this.hostname,
      // port
      port: this.port,
      // username
      username: this.username,
      // password
      password: this.password,
      // url
      url: this.url,
      // connectionName
      connectionName: this.connectionName,
      // socketTimeout
      socketTimeout: this.socketTimeout,
      // 새로운 커넥션 생성 flag
      createConnectionFl: this.createConnectionFl,
      // 커넥션 연결 result flag
      connectionResultFl: this.connectionResultFl,
      // advanced opt show flag
      advancedOptShowFl: this.advancedOptShowFl,
      // 프리셋 page result
      pageResult: this.pageResult,
      // implementor
      implementor: this.implementor,
      // urlTypes
      urlTypes: this.urlTypes
    };
    this.metaDataModelService.patchCreateData('connectionStep', connectionStep);
  }

  /**
   * 커넥션 step 불러오기
   * @param {Object} connectionStep
   * @private
   */
  private _loadData(connectionStep: object): void {
    // 선택한 URL 타입
    connectionStep['selectedUrlType'] && (this.selectedUrlType = connectionStep['selectedUrlType']);
    // 커넥션 프리셋 목록
    connectionStep['connectionPresetList'] && (this.connectionPresetList = connectionStep['connectionPresetList']);
    // 선택한 프리셋
    connectionStep['selectedConnectionPreset'] && (this.selectedConnectionPreset = connectionStep['selectedConnectionPreset']);
    // host
    connectionStep['hostname'] && (this.hostname = connectionStep['hostname']);
    // port
    connectionStep['port'] && (this.port = connectionStep['port']);
    // user
    connectionStep['username'] && (this.username = connectionStep['username']);
    // password
    connectionStep['password'] && (this.password = connectionStep['password']);
    // url
    connectionStep['url'] && (this.url = connectionStep['url']);
    // connection name
    connectionStep['connectionName'] && (this.connectionName = connectionStep['connectionName']);
    // timeout
    connectionStep['socketTimeout'] && (this.socketTimeout = connectionStep['socketTimeout']);
    // 새로운 커넥션 생성 flag
    connectionStep['createConnectionFl'] && (this.createConnectionFl = connectionStep['createConnectionFl']);
    // 커넥션 연결 result flag
    connectionStep['connectionResultFl'] && (this.connectionResultFl = connectionStep['connectionResultFl']);
    // advanced opt show flag
    connectionStep['advancedOptShowFl'] && (this.advancedOptShowFl = connectionStep['advancedOptShowFl']);
    // 프리셋 page result
    connectionStep['pageResult'] && (this.pageResult = connectionStep['pageResult']);
    // implementor
    connectionStep['implementor'] && (this.implementor = connectionStep['implementor']);
    // urlTypes
    this.urlTypes = connectionStep['urlTypes'];
  }

  /**
   * 커넥션 정보 세팅
   * @param connection
   * @private
   */
  private _setConnection(connection): void {
    // URL 타입
    !StringUtil.isEmpty(connection.url) && (this.url = connection.url);
    // hostname
    !StringUtil.isEmpty(connection.hostname) && (this.hostname = connection.hostname);
    // port
    !StringUtil.isEmpty(connection.port) && (this.port = connection.port);
    // password
    this.password = connection.password;
    // username
    this.username = connection.username;
  }

  /**
   * 커넥션 정보가 변경되면 스키마 데이터 제거
   * @private
   */
  private _deleteSchemaStep(): void {
    this.metaDataModelService.getCreateData().hasOwnProperty('schemaStep') && (this.metaDataModelService.patchCreateData('schemaStep' , null));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 커넥션 테스트 결과 조회
   * @private
   */
  private _getConnectionTestResult(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터커넥션 테스트
    this._dataconnectionService.checkConnection(this._getConnectionTestParams())
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
   * 데이터 커넥션 프리셋 목록 조회
   * @private
   */
  private _getConnectionPresetList(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터 커넥션 프리셋 목록 조회
    this._dataconnectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // 데이터가 있다면
        result['_embedded'] && (this.connectionPresetList = this.connectionPresetList.concat(result['_embedded'].connections));
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
   * 데이터 커넥션 프리셋의 상세정보 조회
   * @private
   */
  private _getConnectionPresetDetailData(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터커넥션 프리셋 상세정보 조회
    this._dataconnectionService.getDataconnectionDetail(this.selectedConnectionPreset.id)
      .then((result) => {
        // 기존 데이터 초기화
        this._initConnectionData();
        // validation 초기화
        this.initConnectionFlag();
        // url이 존재한다면 url type 설정
        this.selectedUrlType = StringUtil.isEmpty(result.url) ? this.urlTypes[0].value : this.urlTypes[1].value;
        // 토글 disabled 설정
        this.urlTypes[0].disabled = StringUtil.isEmpty(result.url) ? false : true;
        this.urlTypes[1].disabled = StringUtil.isEmpty(result.url) ? true : false;
        // 커넥션 정보 저장
        this._setConnection(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 데이터 커넥션 프리셋 목록을 가져올때 사용할 파라메터
   * @param {PageResult} pageResult
   * @returns {Object}
   * @private
   */
  private _getConnectionPresetListParams(pageResult: PageResult): object {
    return {
      size: pageResult.size,
      page: pageResult.number,
      implementor: this.implementor,
      type: 'jdbc'
    };
  }

  /**
   * 데이터 커넥션 연결 테스트시 사용할 파라메터
   * @returns {Object}
   * @private
   */
  private _getConnectionTestParams(): object {
    const connection = {
      username: this.username,
      password: this.password,
      implementor: this.implementor,
    };
    // url
    if (this.isUrlType()) {
      connection['url'] = this.url;
    } else {
      connection['hostname'] = this.hostname;
      connection['port'] = this.port;
    }
    return {
      connection: connection
    };
  }
}

