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
  Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { Modal } from '../../../../common/domain/modal';
import { DeleteModalComponent } from '../../../../common/component/modal/delete/delete.component';
import { SetWorkspacePublishedComponent } from '../../../component/set-workspace-published/set-workspace-published.component';
import { CommonUtil } from '../../../../common/util/common.util';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../../../common/util/string.util';
import * as _ from 'lodash';
import { Dataconnection } from '../../../../domain/dataconnection/dataconnection';

@Component({
  selector: 'app-update-connection',
  templateUrl: './update-connection.component.html',
  providers: [MomentDatePipe]
})
export class UpdateConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // confirm popup modal
  @ViewChild(DeleteModalComponent)
  private modalComponent: DeleteModalComponent;

  // workspace setting popup modal
  @ViewChild(SetWorkspacePublishedComponent)
  private _setWorkspaceComponent: SetWorkspacePublishedComponent;

  // connection ID
  private _connectionId: string;

  // origin connection data
  private _originConnectionData: Dataconnection;

  // linked workspace number in connection
  public linkedWorkspaces: number;

  @Input('connection')
  public set connectionData(data) {
    // init ui
    this._initView();
    // set connection id
    this._connectionId = data.id;
    // get connection data
    this._getConnectionDetail(this._connectionId);
  }

  // time
  public createdTime: any;
  public modifiedTime: any;

  // database type list
  public dbTypeList: any[];
  // selected database type
  public selectedDbType: any;
  // security type list
  public securityTypeList: any[];
  // selected security type
  public selectedSecurityType: any;
  // enable URL flag
  public isEnableUrl: boolean = false;

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
  // connection name
  public connectionName: string = '';

  // published
  public published: boolean;

  public enableSaveAsHiveTable: boolean = false;
  public hiveAdminName: string = '';
  public hiveAdminPassword: string = '';
  public hivePersonalDatabasePrefix: string = '';
  public hdfsConfigPath: string = '';

  // connection result flag
  public connectionResultFl: boolean = null;
  // clicked done button flag
  public isClickedDone: boolean;
  // connection input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowSidRequired: boolean;
  public isShowDatabaseRequired: boolean;
  public isShowCatalogRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;
  // connection name input validation
  public isShowConnectionNameRequired: boolean;
  public isShowHiveAdminNameRequired: boolean;
  public isShowHiveAdminPasswordRequired: boolean;
  public isShowHivePersonalDatabasePrefixRequired: boolean;
  public isShowHdfsConfigPathRequired: boolean;
  // connection valid message
  public nameErrorMsg: string;

  // constructor
  constructor(private popupService: PopupService,
              private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Cancel button click event
   */
  public cancel(): void {
    this.close();
  }

  /**
   * Done button click event
   */
  public done(): void {
    this.isClickedDone = true;
    // if done valid, done modal open
    this.doneValidation() && this._doneModalOpen();
  }

  /**
   * Confirm modal event
   * @param data
   */
  public confirmModal(data): void {
    // delete
    if (data.data === 'delete') {
      this._deleteConnection();
    } else if (data.data === 'published') {
      this._updatePublished();
    } else {
      this._updateConnection();
    }
  }

  /**
   * Update connected workspace number
   * @param data
   */
  public updateWorkspaces(data): void {
    this.linkedWorkspaces = data;
  }

  /**
   * Change database type
   * @param type
   */
  public onChangeDbType(type: any): void {
    // only works if the selected database type is different
    if (type !== this.selectedDbType) {
      // change database type
      this.selectedDbType = type;
      // init connection flag
      this.initConnectionFlag();
      // init connection result flag
      this.initConnectionResultFlag();
    }
  }

  /**
   * Change security type
   * @param type
   */
  public onChangeSecurityType(type: any): void {
    // only works if the selected security type is different
    if (type !== this.selectedSecurityType) {
      // change security type
      this.selectedSecurityType = type;
      // init connection flag
      this.initConnectionFlag();
      // init connection result flag
      this.initConnectionResultFlag();
    }
  }

  /**
   * Change enable URL flag
   */
  public onChangeEnableURL(): void {
    // change enable URL flag
    this.isEnableUrl = !this.isEnableUrl;
    // init connection flag
    this.initConnectionFlag();
    // init connection result flag
    this.initConnectionResultFlag();
  }

  /**
   * Click connection validation
   */
  public onClickConnectionValidation(): void {
    // if enable connection button, check connection
    this.isEnabledConnectionValidation() && this._checkConnection();
  }

  /**
   * Click workspace setting open
   */
  public onClickSetWorkspace(): void {
    this._setWorkspaceComponent.init('connection', 'update', this._connectionId);
  }

  /**
   * Publish connection for workspace click event
   */
  public onClickPublishConnection(): void {
    event.preventDefault();
    const modal = new Modal();
    modal.data = 'published';
    // if connection is published
    if (this.published) {
      modal.name = `'${this._originConnectionData.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-selected');
      modal.description = this.translateService.instant('msg.storage.alert.dconn-publish.description');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.private');
    } else {
      modal.name = `'${this._originConnectionData.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-public');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.public');
    }
    this.modalComponent.init(modal);
  }

  /**
   * Delete connection click event
   */
  public onClickDeleteConnection(): void {
    const modal = new Modal();
    modal.data = 'delete';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.del');
    this.modalComponent.init(modal);
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
  public isRequiredSid() : boolean {
    return this.selectedDbType.value === 'TIBERO' || this.selectedDbType.value === 'ORACLE';
  }

  /**
   * Is required catalog
   * @returns {boolean}
   */
  public isRequiredCatalog() : boolean {
    return this.selectedDbType.value === 'PRESTO';
  }

  /**
   * Is used user account for connect
   * @returns {boolean}
   */
  public isConnectUserAccount(): boolean {
    return this.selectedSecurityType.value === 'USERINFO';
  }

  /**
   * Is used ID and password for connect
   * @returns {boolean}
   */
  public isConnectWithIdAndPassword(): boolean {
    return this.selectedSecurityType.value === 'DIALOG';
  }

  /**
   * Is enable connection check
   * @returns {boolean}
   */
  public isEnabledConnectionValidation() : boolean {
    let result: boolean = true;
    // if disable URL
    if (!this.isEnableUrl) {
      // if empty host
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
      // if enable URL and empty URL
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

    if(this.enableSaveAsHiveTable === true) {
      if(StringUtil.isEmpty(this.hiveAdminName)) {
        this.isShowHiveAdminNameRequired = true;
        result = false;
      }
      if(StringUtil.isEmpty(this.hiveAdminPassword)) {
        this.isShowHiveAdminPasswordRequired = true;
        result = false;
      }
      if(StringUtil.isEmpty(this.hiveAdminName)) {
        this.isShowHiveAdminNameRequired = true;
        result = false;
      }
      if(StringUtil.isEmpty(this.hivePersonalDatabasePrefix)) {
        this.isShowHivePersonalDatabasePrefixRequired = true;
        result = false;
      }
      if(StringUtil.isEmpty(this.hdfsConfigPath)) {
        this.isShowHdfsConfigPathRequired = true;
        result = false;
      }
    }
    return result;
  }

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    return this.connectionResultFl && this._connectionNameValidation();
  }

  /**
   * connection result flag init
   */
  public initConnectionResultFlag(): void {
    // init connection result flag
    this.connectionResultFl = null;
    // init clicked done flag
    this.isClickedDone = false;
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
    this.isShowHiveAdminNameRequired = null;
    this.isShowHiveAdminPasswordRequired = null;
    this.isShowHivePersonalDatabasePrefixRequired = null;
    this.isShowHdfsConfigPathRequired = null;
  }

  public onChangeEnableSaveAsHiveTable(): void {
    this.enableSaveAsHiveTable = !this.enableSaveAsHiveTable;
  }

  /**
   * Click done modal open
   * @private
   */
  private _doneModalOpen(): void {
    const modal = new Modal();
    modal.data = 'update';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.edit.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.edit.description');
    modal.btnName = this.translateService.instant('msg.comm.btn.save');
    this.modalComponent.init(modal);
  }

  /**
   * Check connection
   * @private
   */
  private _checkConnection(): void {
    // loading show
    this.loadingShow();
    // check connection
    this.connectionService.checkConnection(this._getCheckConnectionParams())
      .then((result) => {
        // set connection validation result
        this.connectionResultFl = result['connected'];
        // if empty connection name, set connection name
        if (this.connectionName === '') {
          this.connectionName = this._getDefaultConnectionName();
          this.isShowConnectionNameRequired = false;
        }
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
   * Update connection
   * @private
   */
  private _updateConnection(): void {
    // loading show
    this.loadingShow();
    // update connection
    this.connectionService.updateConnection(this._connectionId, this._getUpdateParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.modify.success'));
        // loading hide
        this.loadingHide();
        // close
        this.popupService.notiPopup({
          name: 'reload-connection',
          data: null
        });
        this.close();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Delete connection
   * @private
   */
  private _deleteConnection(): void {
    // loading show
    this.loadingShow();
    // delete connection
    this.connectionService.deleteConnection(this._connectionId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.dconn.del.success'));
        // loading hide
        this.loadingHide();
        // hide
        this.popupService.notiPopup({
          name: 'reload-connection',
          data: null
        });
        this.close();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Update connection published
   */
  private _updatePublished(): void {
    // loading show
    this.loadingShow();
    // update connection
    this.connectionService.updateConnection(this._connectionId, {published: !this.published})
      .then((result) => {
        this._originConnectionData.published = this.published = result['published'];
        // alert
        result['published']
          ? Alert.success(this.translateService.instant('msg.storage.alert.dconn-public.success'))
          : Alert.success(this.translateService.instant('msg.storage.alert.dconn-selected.success'));
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Connection name validation
   * @returns {boolean}
   */
  private _connectionNameValidation(): boolean {
    // if connection name empty
    if (StringUtil.isEmpty(this.connectionName)) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.storage.dconn.name.error');
      return false;
    }
    // if connection name over 150 byte
    if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }
    return true;
  }

  /**
   * Get connection data
   * @param {string} connId
   * @private
   */
  private _getConnectionDetail(connId: string): void {
    // loading show
    this.loadingShow();
    // get connection data
    this.connectionService.getDataconnectionDetail(connId)
      .then((result) => {
        // set origin connection data
        this._originConnectionData = result;
        // set connection data
        this._initData(result);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 커넥션 연결 파라메터
   * @returns {Object}
   * @private
   */
  private _getCheckConnectionParams(): object {
    const params = {
      implementor: this.selectedDbType.value,
      authenticationType: this.selectedSecurityType.value
    };
    // if security type is not USERINFO, add password and username
    if (!this.isConnectUserAccount()) {
      params['password'] = this.password.trim();
      params['username'] = this.username.trim();
    }
    // if disable URL
    if (!this.isEnableUrl) {
      params['hostname'] = this.hostname.trim();
      params['port'] = this.port;
      // if enable catalog
      this.isRequiredCatalog() && (params['catalog'] = this.catalog.trim());
      // if enable SID
      this.isRequiredSid() && (params['sid'] = this.sid.trim());
      // if enable database
      this.isRequiredDatabase() && (params['database'] = this.database.trim());
      // if enable URL
    } else {
      params['url'] = this.url.trim();
    }
    return {connection: params};
  }

  /**
   * 업데이트시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getUpdateParams(): object {
    // only the changed, update
    const params = {};
    // if different connection name
    this.connectionName.trim() !== this._originConnectionData.name && (params['name'] = this.connectionName.trim());
    // if disable URL
    if (!this.isEnableUrl) {
      // 입력한 host가 다른경우
      this.hostname.trim() !== this._originConnectionData.hostname && (params['hostname'] = this.hostname.trim());
      // 입력한 port가 다른경우
      (this.port+'') !== this._originConnectionData.port && (params['port'] = this.port);
      // 기존에 url이 있었다면
      this._originConnectionData.url && (params['url'] = '');
      // if enable database and different database
      if (this.isRequiredDatabase() && this.database.trim() !== this._originConnectionData.database) {
        params['database'] = this.database.trim();
      }
      // if enable SID and different SID
      if (this.isRequiredSid() && this.sid.trim() !== this._originConnectionData.sid) {
        params['sid'] = this.sid.trim();
      }
      // if enable catalog and different catalog
      if (this.isRequiredCatalog() && this.catalog.trim() !== this._originConnectionData.catalog) {
        params['catalog'] = this.catalog.trim();
      }
      // if enable URL and diffrent URL
    } else if (this.url.trim() !== this._originConnectionData.url) {
      params['url'] = this.url.trim();
      // if exist hostname or port in origin connection data
      if (this._originConnectionData.hostname || this._originConnectionData.port) {
        params['hostname'] = '';
        params['port'] = '';
      }
    }
    // if changed security type
    if (this._originConnectionData.authenticationType !== this.selectedSecurityType.value) {
      params['authenticationType'] = this.selectedSecurityType.value;
      // if origin security type is MANUAL, delete username and password
      if (this._originConnectionData.authenticationType === 'MANUAL') {
        params['username'] = '';
        params['password'] = '';
      }
    }
    // if security type is MANUAL
    if (this.selectedSecurityType.value === 'MANUAL') {
      // if password different
      if (this.password.trim() !== this._originConnectionData.password) {
        params['password'] = this.password.trim();
      }
      // if username different
      if (this.username.trim() !== this._originConnectionData.username) {
        params['username'] = this.username.trim();
      }
    }

    if(this.selectedDbType.value === 'HIVE') {
      if(this.enableSaveAsHiveTable) {
        params['secondaryUsername'] = this.hiveAdminName.trim();
        params['secondaryPassword'] = this.hiveAdminPassword.trim();
        params['hdfsConfigurationPath'] = this.hdfsConfigPath.trim();
        params['personalDatabasePrefix'] = this.hivePersonalDatabasePrefix.trim();
      } else {
        params['secondaryUsername'] = '';
        params['secondaryPassword'] = '';
        params['hdfsConfigurationPath'] = '';
        params['personalDatabasePrefix'] = '';
      }
    }

    return params;
  }

  /**
   * Get default connection name
   * @returns {string}
   * @private
   */
  private _getDefaultConnectionName(): string {
    return this.isEnableUrl ? (this.selectedDbType.label + '-' + this.url) : (this.selectedDbType.label + '-' + this.hostname + '-' + this.port);
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // init database type list
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    // init selected database type
    this.selectedDbType = this.dbTypeList[0];
    // init security type
    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    // init selected security type
    this.selectedSecurityType = this.securityTypeList[0];
  }

  /**
   * init data
   * @param data
   * @private
   */
  private _initData(data): void {
    // time
    this.createdTime = data.createdTime;
    this.modifiedTime = data.modifiedTime;
    // connection
    // if exist hostname
    data.hostname && (this.hostname = data.hostname);
    // if exist port
    data.port && (this.port = data.port);
    // if exist URL
    if (StringUtil.isNotEmpty(data.url)) {
      this.isEnableUrl = true;
      this.url = data.url;
    }
    // connection name
    this.connectionName = data.name;
    // if enable SID
    data.sid && (this.sid = data.sid);
    // if enable database
    data.database && (this.database = data.database);
    // if enable catalog
    data.catalog && (this.catalog = data.catalog);
    // init selected database type
    this.selectedDbType = this.dbTypeList.find(type => type.value === data.implementor.toString());
    // init selected security type
    this.selectedSecurityType = this.securityTypeList.find(type => type.value === data.authenticationType) || this.securityTypeList[0];
    // if not exist authenticationType or authenticationType is MANUAL
    if (!data.authenticationType || data.authenticationType === 'MANUAL') {
      this.password = data.password;
      this.username = data.username;
    }
    // published
    this.published = data.published;
    // linked workspace number
    if (data.hasOwnProperty('linkedWorkspaces')) {
      this.linkedWorkspaces = data.linkedWorkspaces;
    }

    data.secondaryUsername && (this.hiveAdminName = data.secondaryUsername);
    data.secondaryPassword && (this.hiveAdminPassword = data.secondaryPassword);
    data.personalDatabasePrefix && (this.hivePersonalDatabasePrefix = data.personalDatabasePrefix);
    data.hdfsConfigurationPath && (this.hdfsConfigPath = data.hdfsConfigurationPath);

    if(StringUtil.isNotEmpty(data.secondaryUsername)
      && StringUtil.isNotEmpty(data.secondaryPassword)
      && StringUtil.isNotEmpty(data.personalDatabasePrefix)
      && StringUtil.isNotEmpty(data.hdfsConfigurationPath)) {
      this.enableSaveAsHiveTable = true;
    } else {
      this.enableSaveAsHiveTable = false;
    }
  }
}

