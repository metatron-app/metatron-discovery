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
//import { DatasetJdbc, DsType, RsType, ImportType } from '../../../domain/data-preparation/dataset';
import { PrDatasetJdbc, DsType, RsType, ImportType } from '../../../domain/data-preparation/pr-dataset';
import { ConnectionType, Dataconnection } from '../../../domain/dataconnection/dataconnection';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../common/util/alert.util';
import { ConnectionRequest } from '../../../domain/dataconnection/connectionrequest';
import { isUndefined } from 'util';
import {DatasetService} from "../service/dataset.service";

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
    { label: 'Oracle', value: 'ORACLE' },
    { label: 'MySQL', value: 'MYSQL' },
    { label: 'Hive', value: 'HIVE' },
    { label: 'Presto', value: 'PRESTO' },
    { label: 'Tibero', value: 'TIBERO' }
  ];

  // 선택한 프리셋 정보
  private selectedConnectionPreset: any;

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
  public defaultSelectedIndex = -1;

  // connection request 객체
  public connectionRequest: ConnectionRequest = new ConnectionRequest();
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

    /*
    this.datasetJdbc.tableName = '';
    this.datasetJdbc.databaseName = '';
    this.datasetJdbc.queryStmt = '';
    this.datasetJdbc.dsType = DsType.IMPORTED;
    this.datasetJdbc.rsType = RsType.TABLE;
    this.datasetJdbc.importType = ImportType.DB;
    */
    this.datasetJdbc.tblName = '';
    this.datasetJdbc.dbName = '';
    this.datasetJdbc.queryStmt = '';
    this.datasetJdbc.dsType = DsType.IMPORTED;
    this.datasetJdbc.rsType = RsType.TABLE;
    this.datasetJdbc.importType = ImportType.DATABASE;

    this.selectedDatabase = this.databaseTypeList[0];

    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL' }
    ];
    this.selectedUrlType = this.urlTypes[0].value;
  }


  public next() {
    if (this.connectionResult !== 'valid') {
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

  public close() {
    super.close();

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  // select box  변경시
  public onChangeType($event: any) {
    this.initConnectionPresetData();
    for (let key in this.dataconnection) { if (this.dataconnection.hasOwnProperty(key)) delete this.dataconnection[key]; }
    const keyList = ['id','name','implementor','hostname','port','username','password','sid','database','catalog','url'];
    for(let key of keyList) {
      if($event.hasOwnProperty(key)) {

        this.dataconnection[key] = $event[key];
      }
    }

    if (this.dataconnection.url) {
      this.isUrl = true;
    }

    for(let datadaseType of this.databaseTypeList) {
      if(datadaseType.value === this.dataconnection.implementor) {
        this.selectedDatabase = datadaseType;
        break;
      }
    }
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
  public initConnectionPresetData() {
    // 프리셋 데이터 초기화
    this.selectedConnectionPreset = null;
    // connection init flag

    this.isUrl = false;

    this.initConnectionFlag();
  }

  /**
   * connection flag init
   */
  public initConnectionFlag() {
    // 최초 접근 flag
    this.firstFl = false;
    // 커넥션 통과
    this.connectionResultFl = null;
  }

  /**
   * connection validation message
   * @returns {string}
   */
  public get getValidationMessage(): string {
    if(!this.isUrl) {
      // hostname
      if (!this.dataconnection.hostname || this.dataconnection.hostname.trim() === '') {
        return this.translateService.instant('msg.storage.alert.host.required');
      }
      // port
      if (!this.dataconnection.port) {
        return this.translateService.instant('msg.storage.alert.port.required');
      }
      // sid
      if (this.isSIDRequired() && (!this.dataconnection.sid || this.dataconnection.sid.trim() === '')) {
        return this.translateService.instant('msg.storage.alert.sid.required');
      }
      // database
      if (this.isDbNameRequired() && (!this.dataconnection.database || this.dataconnection.database.trim() === '')) {
        return this.translateService.instant('msg.storage.alert.db.required');
      }
      // catalog
      if (this.isCatalogRequired() && (!this.dataconnection.catalog || this.dataconnection.catalog.trim() === '')) {
        return this.translateService.instant('msg.storage.alert.catalogue.required');
      }
    } else {
      // url
      if (!this.dataconnection.url || this.dataconnection.url.trim() === '') {
        return this.translateService.instant('msg.storage.alert.url.required');
      }
    }
    // username
    if (!this.dataconnection.username || this.dataconnection.username.trim() === '') {
      return this.translateService.instant('msg.storage.alert.user-name.required');
    }
    // password
    if (!this.dataconnection.password || this.dataconnection.password.trim() === '') {
      return this.translateService.instant('msg.storage.alert.pw.required');
    }
    return '';
  }

  /**
   * connection validation message 를 보여주는지 여부
   * @returns {boolean}
   */
  public get isShowValidationMessage() : boolean {
    // 최초 접근 또는 connection check 가 완료된 상태라면 return
    return !(this.firstFl || this.connectionResultFl !== null);

  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  /*
 public get isEnabledConnectionTest() : boolean {
   // hostname
   if (this.hostname.trim() === '') {
     return false;
   }
   // port
   if (!this.port) {
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
   // sid
   if (this.isSIDRequired && this.sid.trim() === '') {
     return false;
   }
   // database
   if (this.isDbNameRequired && this.database.trim() === '') {
     return false;
   }
   // catalog
   if (this.isCatalogRequired && this.catalog.trim() === '') {
     return false;
   }
   return true;
 }
 */

  // connection check
  public checkConnection() {

    if( ''!== this.getValidationMessage ) {
      this.connectionErrorDescription = this.getValidationMessage;
      this.connectionResult = 'Invalid';
      this.connectionResultFl = false;
      return;
    }

    this.dataconnection.implementor = this.getImplemntor(this.selectedDatabase.value);
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
  // protected -> public
  public setDatabase(db) {

    if (this.dataconnection.id || this.connectionList.length === 0) {
      return;
    }

    this.connectionResult = '';
    this.selectedDatabase = db;
    this.defaultSelectedIndex = -1;
    this.connectionInit(db);
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
          this.connectionList = data['_embedded']['connections'];

          let idx = this.connectionList.findIndex((item) =>{
            return item.name === 'Direct input';
          });

          if (idx !== -1) {
            this.connectionList.splice(idx,1);
          }

          if (this.connectionList.length !== 0) {
            this.onChangeType(this.connectionList[0]);
          }
        }
      })
      .catch((err) => {
        console.info('getConnections err)', err.toString());
      });
  }



  private connectionInit(db) {
    for (let key in this.dataconnection) { if (this.dataconnection.hasOwnProperty(key)) delete this.dataconnection[key]; }
    this.dataconnection.implementor = this.getImplemntor(db.value);
  }

  // protected -> private
  private getImplemntor(param: string): ConnectionType {
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
