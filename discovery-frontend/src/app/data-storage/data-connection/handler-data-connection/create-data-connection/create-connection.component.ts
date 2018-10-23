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
  Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { SetWorkspacePublishedComponent } from '../../../component/set-workspace-published/set-workspace-published.component';
import { CommonUtil } from '../../../../common/util/common.util';
import { CookieConstant } from '../../../../common/constant/cookie.constant';
import { StringUtil } from '../../../../common/util/string.util';

/**
 * Data connection create component
 */
@Component({
  selector: 'app-create-connection',
  templateUrl: './create-connection.component.html'
})
export class CreateConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // workspace set component
  @ViewChild(SetWorkspacePublishedComponent)
  private _setWorkspaceComponent: SetWorkspacePublishedComponent;

  // add worksapce list
  public addWorkspaces: any[] = [];
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

  public enableSaveAsHiveTable: boolean = false;
  public hiveAdminName: string = '';
  public hiveAdminPassword: string = '';
  public hivePersonalDatabasePrefix: string = '';
  public hdfsConfigPath: string = '';

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
  // name input validation
  public isShowConnectionNameRequired: boolean;
  public isShowHiveAdminNameRequired: boolean;
  public isShowHiveAdminPasswordRequired: boolean;
  public isShowHivePersonalDatabasePrefixRequired: boolean;
  public isShowHdfsConfigPathRequired: boolean;
  // name validation message
  public nameErrorMsg: string;

  // workspace published
  public published: boolean = false;

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
    // ui init
    this._initView();
    // set private workspace in add workspace list
    this.addWorkspaces.push(this._getPrivateWorkspace());
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /**
   * Done click event
   */
  public done(): void {
    // TODO hive admin account validation(접속 및 입력 여부..)
    // clicked done button flag
    this.isClickedDone = true;
    // if enable done button, create connection
    this.doneValidation() && this._createConnection();
  }

  /**
   * Cancel click event
   */
  public cancel(): void {
    this.close();
  }

  /**
   * if closed workspace setting modal
   * @param event
   */
  public closeSetWorkspace(event): void {
    // add workspace in add workspace list
    this.addWorkspaces = event;
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
    const workspaces = {
      addWorkspaces: this.addWorkspaces,
    };
    this._setWorkspaceComponent.init('connection', 'create', workspaces);
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
        if (StringUtil.isEmpty(this.connectionName)) {
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
   * Create connection
   * @private
   */
  private _createConnection(): void {
    // loading show
    this.loadingShow();
    // create connection
    this.connectionService.createConnection(this._getCreateConnectionParams())
      .then((result) => {
        // alert
        Alert.success(`'${this.connectionName.trim()}' ` + this.translateService.instant('msg.storage.alert.dconn.create.success'));
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
   * Delete username and password in parameter
   * @param params
   * @private
   */
  private _deleteUsernameAndPassword(params: any): void {
    delete params.password;
    delete params.username;
  }

  /**
   * Connection name validation
   * @returns {boolean}
   */
  private _connectionNameValidation(): boolean {
    // if empty connection name
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
   * Get parameter for create connection
   * @returns {Object}
   * @private
   */
  private _getCreateConnectionParams(): object {
    // params
    const params = this._getConnectionParams();
    // type
    params['type'] = 'JDBC';
    // name
    params['name'] = this.connectionName.trim();
    // published
    params['published'] = this.published;
    // if not published, add workspaces in params
    !this.published && (params['workspaces'] = this._getWorkspacesParams());
    // if security type is not MANUAL, delete username and password in params
    this.selectedSecurityType.value !== 'MANUAL' && this._deleteUsernameAndPassword(params);
    return params;
  }

  /**
   * Get parameter for check connection
   * @returns {Object}
   * @private
   */
  private _getCheckConnectionParams(): object {
    return {connection: this._getConnectionParams()};
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

    if(this.selectedDbType.value === 'HIVE' && this.enableSaveAsHiveTable) {
      params['secondaryUsername'] = this.hiveAdminName.trim();
      params['secondaryPassword'] = this.hiveAdminPassword.trim();
      params['hdfsConfigurationPath'] = this.hdfsConfigPath.trim();
      params['personalDatabasePrefix'] = this.hivePersonalDatabasePrefix.trim();
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
    return params;
  }

  /**
   * Get parameter for workspace
   * @returns {any}
   * @private
   */
  private _getWorkspacesParams(): any {
    const workspaces = [];
    this.addWorkspaces.forEach((workspace) => {
      workspaces.push('/api/workspaces/' + workspace.id);
    });
    return workspaces;
  }

  /**
   * Get private workspace of login user
   * @returns {any}
   * @private
   */
  private _getPrivateWorkspace(): any {
    const workspace = this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE);
    return JSON.parse(workspace);
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
   * init UI
   * @private
   */
  private _initView(): void {
    // init database type list
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    // init selected database type
    this.selectedDbType = this.dbTypeList[0];
    // init security type list
    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    // init selected security type
    this.selectedSecurityType = this.securityTypeList[0];
  }
}

