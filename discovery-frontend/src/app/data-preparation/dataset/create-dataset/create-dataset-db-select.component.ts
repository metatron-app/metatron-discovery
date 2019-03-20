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

import { Component, ElementRef, Injector, OnInit, Input } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { PrDatasetJdbc, DsType, ImportType, QueryInfo, TableInfo } from '../../../domain/data-preparation/pr-dataset';
import { ConnectionType, Dataconnection } from '../../../domain/dataconnection/dataconnection';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { ConnectionRequest } from '../../../domain/dataconnection/connectionrequest';
import { isNullOrUndefined, isUndefined } from 'util';
import { DatasetService } from "../service/dataset.service";

@Component({
  selector: 'app-create-dataset-db-select',
  templateUrl: './create-dataset-db-select.component.html',
  providers: [DataconnectionService]
})
export class CreateDatasetDbSelectComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private firstFl: boolean = true;

  // 커넥션 연결 success flag
  public connectionResultFl: boolean = null;

  public isUrl : boolean = false;

  @Input()
  //public datasetJdbc: DatasetJdbc;
  public datasetJdbc: PrDatasetJdbc;

  // 데이터 커넥션 리스트
  public databaseTypeList: any[] = [
    // { label: 'Oracle', value: 'ORACLE' },
    { label: 'MySQL', value: 'MYSQL' },
    { label: 'Hive', value: 'HIVE' },
    { label: 'Presto', value: 'PRESTO' },
    { label: 'Tibero', value: 'TIBERO' }
  ];

  // 선택한 URL 타입
  public selectedUrlType: string;
  public urlTypes: any[];

  // 선택한 dataconnection 객체
  public dataconnection: Dataconnection = new Dataconnection();

  // 선택한 database 객체
  public selectedDatabase: any;

  // preset list
  public connectionList: any[] = [];

  // connection result 결과
  public connectionResult: string = '';

  // connectio error 결과값 description
  public connectionErrorDescription: string = '';

  // select box 선택값
  public defaultSelectedIndex = 0;

  // connection request 객체
  public connectionRequest: ConnectionRequest = new ConnectionRequest();

  // security type list
  public securityTypeList: any[];

  public selectedSecurityType: any;

  // input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowSidRequired: boolean;
  public isShowDatabaseRequired: boolean;
  public isShowCatalogRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;


  public isNextBtnClicked: boolean;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService : DatasetService,
              protected connectionService: DataconnectionService,
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

    this.getConnections();

    this.initView();

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public initView() {

    this.datasetJdbc.dsType = DsType.IMPORTED;
    this.datasetJdbc.importType = ImportType.DATABASE;

    this.selectedDatabase = this.databaseTypeList[0];

    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL' }
    ];
    this.selectedUrlType = this.urlTypes[0].value;

    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    this.selectedSecurityType = this.securityTypeList[0];

  }


  public next() {

    this.isNextBtnClicked = true;

    if (this.isEnableNext()) {
      if (this.connectionResult !== 'valid') {
        this.connectionResultFl = false;
        this.connectionResult = 'Required';
        return;
      } else {
        this.datasetJdbc.dcId = this.dataconnection.id;
        this.datasetJdbc.dataconnection = this.dataconnection;
        this.popupService.notiPopup({
          name: 'create-db-query',
          data: null
        });
      }
    }
  }

  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  public selectConnection($event: any, isChanged : boolean = false) {


    if (isChanged) { // Refresh when user changes data connnection
      this.datasetJdbc.sqlInfo = new QueryInfo();
      this.datasetJdbc.tableInfo = new TableInfo();
      this.datasetJdbc.rsType = undefined;

    }

    for (let key in this.dataconnection) {
      if (this.dataconnection.hasOwnProperty(key)) {
        delete this.dataconnection[key];
      }
    }
    const keyList = ['id','name','implementor','hostname','port','username','password','sid','database','catalog','url', 'authenticationType'];
    for(let key of keyList) {
      if($event.hasOwnProperty(key)) {

        this.dataconnection[key] = $event[key];
      }
    }

    this.isUrl = !isNullOrUndefined(this.dataconnection.url) && this.dataconnection.url !== '';

    for(let datadaseType of this.databaseTypeList) {
      if(datadaseType.value === this.dataconnection.implementor) {
        this.selectedDatabase = datadaseType;
        break;
      }
    }

    this.selectedSecurityType = this.securityTypeList.find(type => type.value === this.dataconnection.authenticationType) || this.securityTypeList[0];


    this.initConnectionFlag();
    this.initConnectionResultFlag();

  }

  public isEqualTypeValue(targetType, selectedType): boolean {
    return targetType.value === selectedType.value;
  }


  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isDbNameRequired() : boolean {
    return this.isEqualTypeValue({ value: 'POSTGRESQL' }, this.selectedDatabase);
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isSIDRequired() : boolean {
    return this.isEqualTypeValue({ value: 'TIBERO' }, this.selectedDatabase)
      || this.isEqualTypeValue({ value: 'ORACLE' }, this.selectedDatabase);
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isCatalogRequired() : boolean {
    return this.isEqualTypeValue({ value: 'PRESTO' }, this.selectedDatabase);
  }

  /**
   * 프리셋 데이터 초기화
   */
  public initConnectionResultFlag() {

    this.isNextBtnClicked = false;
    this.connectionResultFl = null;

  }

  /**
   * connection validation message
   * @returns {string}
   */
  public getValidationMessage(): boolean {
    let result: boolean = true;
    if(!this.isUrl) {
      // hostname
      if (!this.dataconnection.hostname || this.dataconnection.hostname.trim() === '') {
        this.isShowHostRequired = true;
        result = false;
      }
      // port
      if (!this.dataconnection.port) {
        this.isShowPortRequired = true;
        result = false;
      }
      // sid
      if (this.isSIDRequired() && (!this.dataconnection.sid || this.dataconnection.sid.trim() === '')) {
        this.isShowSidRequired = true;
        result = false;
      }
      // database
      if (this.isDbNameRequired() && (!this.dataconnection.database || this.dataconnection.database.trim() === '')) {
        this.isShowDatabaseRequired = true;
        result = false;
      }
      // catalog
      if (this.isCatalogRequired() && (!this.dataconnection.catalog || this.dataconnection.catalog.trim() === '')) {
        this.isShowCatalogRequired = true;
        result = false;
      }
    } else {
      // url
      if (!this.dataconnection.url || this.dataconnection.url.trim() === '') {
        this.isShowUrlRequired = true;
        result = false;
      }
    }

    if (!this.isConnectUserAccount()) {

      // username
      if (!this.dataconnection.username || this.dataconnection.username.trim() === '') {
        this.isShowUsernameRequired = true;
        result = false;
      }

      // password
      if (!this.dataconnection.password || this.dataconnection.password.trim() === '') {
        this.isShowPasswordRequired = true;
        result = false;
      }

    }

    return result;
  }

  /**
   * Check connection - API
   */
  public checkConnection() {

    this.dataconnection.implementor = this.getImplementor(this.selectedDatabase.value);
    this.connectionRequest.connection = this.dataconnection;

    this.loadingShow();
    this.connectionService.checkConnection(this.connectionRequest)
      .then((data) => {
        this.loadingHide();
        if (!isUndefined(data.connected)) {
          if (data.connected === false) {
            this.connectionResult = 'Invalid';
            this.connectionResultFl = false;
            this.connectionErrorDescription = data.message;
          } else if (data.connected === true) {
            this.connectionResult = 'valid';
            this.connectionResultFl = true;
          }
        }
      })
      .catch((error) => {
        this.loadingHide();
        this.connectionErrorDescription = error.message;
        this.connectionResult = 'Invalid';
        this.connectionResultFl = false;
      });
  }

  // 선택한 db type
  public setDatabase(db) {

    if (this.dataconnection.id || this.connectionList.length === 0) {
      return;
    }

    this.connectionResult = '';
    this.selectedDatabase = db;
    this.defaultSelectedIndex = -1;
    this.connectionInit(db);
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
   * When TEST button is clicked
   */
  public clickValidationBtn() {
    this.getValidationMessage() && this.checkConnection();
  }


  /**
   * Security : is DIALOG
   * @returns {boolean}
   */
  public isConnectWithIdAndPassword(): boolean {
    return this.selectedSecurityType.value === 'DIALOG';
  }


  /**
   * Security : is USERINFO
   * @returns {boolean}
   */
  public isConnectUserAccount(): boolean {
    return this.selectedSecurityType.value === 'USERINFO';
  }


  /**
   * Check if user can proceed to next step
   * @returns {boolean}
   */
  public isEnableNext(): boolean {
    return this.connectionResultFl;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // data connection list 가져오기.
  private getConnections() {
    this.connectionService.getDataconnections({'projection':'default'})
      .then((data) => {
        if (data.hasOwnProperty('_embedded') && data['_embedded'].hasOwnProperty('connections')) {

          // FIXME : only MANUAL type can be used to make dataset (No server side API)
          this.connectionList = data['_embedded']['connections'].filter((item) => {
            return item.authenticationType === 'MANUAL'
          });

          if (this.connectionList.length !== 0 && isNullOrUndefined(this.datasetJdbc.dataconnection)) {

            this.selectConnection(this.connectionList[0]);

          } else if (!isNullOrUndefined(this.datasetJdbc.dataconnection.connection)) {

            const connArr = this.connectionList.map((item) => {return item.id});

            if (connArr.indexOf(this.datasetJdbc.dcId) !== -1) {
              this.defaultSelectedIndex = connArr.indexOf(this.datasetJdbc.dcId);

              if (this.datasetJdbc.dataconnection.connection.username && this.datasetJdbc.dataconnection.connection.password) {
                if (isNullOrUndefined(this.connectionList[this.defaultSelectedIndex].username)) {
                  this.connectionList[this.defaultSelectedIndex].username = this.datasetJdbc.dataconnection.connection.username;
                  this.connectionList[this.defaultSelectedIndex].password = this.datasetJdbc.dataconnection.connection.password;
                }
              }

              this.selectConnection(this.connectionList[this.defaultSelectedIndex]);
            }

            this.connectionResult = 'valid';
            this.connectionResultFl = true;

          }

        }
      })
      .catch((err) => {
        console.info('getConnections err)', err.toString());
      });
  }



  private connectionInit(db) {
    for (let key in this.dataconnection) { if (this.dataconnection.hasOwnProperty(key)) delete this.dataconnection[key]; }
    this.dataconnection.implementor = this.getImplementor(db.value);
  }

  // protected -> private
  private getImplementor(param: string): ConnectionType {
    if (param === 'H2') {
      return ConnectionType.H2;
    } else if (param === 'MYSQL') {
      return ConnectionType.MYSQL;
    } else if (param === 'ORACLE') {
      return ConnectionType.ORACLE;
    } else if (param === 'TIBERO') {
      return ConnectionType.TIBERO;
    } else if (param === 'HIVE') {
      return ConnectionType.HIVE;
    } else if (param === 'HAWQ') {
      return ConnectionType.HAWQ;
    } else if (param === 'POSTGRESQL') {
      return ConnectionType.POSTGRESQL;
    } else if (param === 'MSSQL') {
      return ConnectionType.MSSQL;
    } else if (param === 'PRESTO') {
      return ConnectionType.PRESTO;
    } else if (param === 'PHOENIX') {
      return ConnectionType.PHOENIX;
    } else if (param === 'NVACCEL') {
      return ConnectionType.NVACCEL;
    } else if (param === 'STAGE') {
      return ConnectionType.STAGE;
    } else if (param === 'FILE') {
      return ConnectionType.FILE;
    }
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
      this.initConnectionFlag();
    }
  }

  /**
   * url이 default 타입이라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return this.selectedUrlType === 'DEFAULT';
  }

  /**
   * Check checkbox
   */
  public check() {
    this.isUrl = !this.isUrl;
  }
}
