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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';
import {AbstractComponent} from "../../../common/component/abstract.component";
import {isNullOrUndefined} from "util";
import {
  AuthenticationType,
  Dataconnection,
  InputMandatory,
  JdbcDialect,
  Scope
} from "../../../domain/dataconnection/dataconnection";
import {ConnectionParam, DataConnectionCreateService} from "../../service/data-connection-create.service";
import {StringUtil} from "../../../common/util/string.util";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import {StorageService} from "../../service/storage.service";

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
})
export class ConnectionComponent extends AbstractComponent {

  // TODO
  private _validConnectionList;

  @Input()
  public readonly isDisableChangeConnectionType: boolean;
  @Input()
  public readonly isDisableChangeConnectionInfo: boolean;
  @Input()
  public readonly isDisableProperties: boolean;

  @Input()
  public readonly isHideConnectionLabel: boolean;

  @Input()
  public readonly isShowDialogGuide: boolean;

  public readonly connectionTypeList: JdbcDialect[] = StorageService.connectionTypeList;
  public selectedConnectionType: JdbcDialect;

  @Input()
  public readonly isUsedNameInitial: boolean;
  @Input()
  public readonly connectionName: string;
  @Output()
  public readonly createdName: EventEmitter<string> = new EventEmitter();

  public readonly authenticationTypeList = this.connectionCreateService.authenticationTypeList;
  public selectedAuthenticationType;

  // enum
  public readonly AUTHENTICATION_TYPE = AuthenticationType;

  public hostname: string;
  public port: number;
  public url: string;
  public database: string;
  public sid: string;
  public catalog: string;
  public username: string;
  public password: string;
  public properties: {key: string, value: string, keyError?: boolean, valueError?: boolean, keyValidMessage?: string, valueValidMessage?: string}[];

  // flag
  public isShow: boolean;
  public isUsedUrl: boolean;
  public isShowAdvancedSettings: boolean;
  public isValidConnection: boolean;
  public isConnectionCheckRequire: boolean;
  // input error
  public isUrlError: boolean;
  public isHostnameError: boolean;
  public isPortError: boolean;
  public isDatabaseError: boolean;
  public isSidError: boolean;
  public isCatalogError: boolean;
  public isUsernameError: boolean;
  public isPasswordError: boolean;

  constructor( private connectionCreateService: DataConnectionCreateService,
               private connectionService: DataconnectionService,
               protected element: ElementRef,
               protected injector: Injector) {
    super(element, injector);
  }

  /**
   * Init
   * @param {Dataconnection} connection
   */
  public init(connection?: Dataconnection): void {
    this._connectionInputInitialize();
    this.inputErrorInitialize();
    this.connectionValidInitialize();
    if (isNullOrUndefined(connection)) {
      this.properties = [];
      this.selectedAuthenticationType = this.authenticationTypeList[0];
      this.selectedConnectionType = this.connectionTypeList[0];
    } else {
      this.setConnectionInput(connection);
    }
    this.isShow = true;
  }

  /**
   * Initial input error
   */
  public inputErrorInitialize(): void {
    this.isUrlError = undefined;
    this.isHostnameError = undefined;
    this.isPortError = undefined;
    this.isDatabaseError = undefined;
    this.isSidError = undefined;
    this.isCatalogError = undefined;
    this.isUsernameError = undefined;
    this.isPasswordError = undefined;
  }

  /**
   * Set connection input
   * @param {Dataconnection} connection
   */
  public setConnectionInput(connection: Dataconnection | ConnectionParam): void {
    this.hostname = StringUtil.isNotEmpty(connection.hostname) ?connection.hostname : undefined;
    this.port = connection.port || undefined;
    this.catalog = StringUtil.isNotEmpty(connection.catalog) ?connection.hostname : undefined;
    this.database = StringUtil.isNotEmpty(connection.database) ?connection.database : undefined;
    this.sid = StringUtil.isNotEmpty(connection.sid) ?connection.sid : undefined;
    this.url = StringUtil.isNotEmpty(connection.url) ?connection.url : undefined;
    this.username = StringUtil.isNotEmpty(connection.username) ? connection.username : undefined;
    this.password = StringUtil.isNotEmpty(connection.password) ? connection.password : undefined;
    this.selectedAuthenticationType = this.authenticationTypeList.find(authenticationType => authenticationType.value === connection.authenticationType) || this.authenticationTypeList[0];
    this.selectedConnectionType = connection.implementor ? this.connectionTypeList.find(type => type.implementor.toString() === connection.implementor.toString()) : this.connectionTypeList[0];
    this.properties = connection.properties ? this.getConvertedProperties(connection.properties) : [];
    this.isUsedUrl = StringUtil.isNotEmpty(connection.url);
  }

  /**
   * Initial connection valid
   */
  public connectionValidInitialize(): void {
    this.isValidConnection = undefined;
    this.isConnectionCheckRequire = undefined;
  }

  /**
   * Check valid connection
   */
  public checkConnection(): void {
    if (this.isValidConnectionInput()) {

      // loading show
      this.loadingShow();
      // check connection
      this.connectionService.checkConnection({connection: this.getConnectionParams()})
        .then((result: {connected: boolean}) => {
          // set connection validation result
          this.isValidConnection = result.connected;
          // loading hide
          this.loadingHide();
          // if used name initial
          if (this.isUsedNameInitial && !this.connectionName) {
            this.createdName.emit(this.isUsedUrl ? `${this.selectedConnectionType.name}-${this.url}` : `${this.selectedConnectionType.name}-${this.hostname}-${this.port}`);
          }
        })
        .catch((error) => {
          // set connection result fail
          this.isValidConnection = false;
          // loading hide
          this.commonExceptionHandler(error);
        });
    }
  }

  /**
   * Property key validation
   * @param {{key: string; keyValidMessage: string; keyError: boolean}} property
   */
  public propertyKeyValidation(property: {key: string, keyValidMessage: string, keyError: boolean}): void {
    // check empty
    if (StringUtil.isEmpty(property.key)) {
      // set empty message
      property.keyValidMessage = this.translateService.instant('msg.storage.ui.required');
      // set error flag
      property.keyError = true;
    }
    // check special characters, and korean (enable .dot)
    else if (property.key.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
      // set duplicate message
      property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.special.char.disable');
      // set error flag
      property.keyError = true;
    }
    // check duplicate
    else if (this.properties.filter(item => item.key.trim() === property.key.trim()).length > 1) {
      // set duplicate message
      property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.duplicated');
      // set error flag
      property.keyError = true;
    }
  }


  /**
   * Is disable SID
   * @return {boolean}
   */
  public isDisableSid() {
    return this.selectedConnectionType.inputSpec.sid === InputMandatory.NONE;
  }

  /**
   * Is disable database
   * @return {boolean}
   */
  public isDisableDatabase() {
    return this.selectedConnectionType.inputSpec.database === InputMandatory.NONE;
  }

  /**
   * Is disable catalog
   * @return {boolean}
   */
  public isDisableCatalog() {
    return this.selectedConnectionType.inputSpec.catalog === InputMandatory.NONE;
  }

  /**
   * Is disable authentication type
   * @return {boolean}
   */
  public isDisableAuthenticationType() {
    return this.selectedConnectionType.inputSpec.authenticationType === InputMandatory.NONE;
  }

  /**
   * Is disable username
   * @return {boolean}
   */
  public isDisableUsername() {
    return this.selectedConnectionType.inputSpec.username === InputMandatory.NONE;
  }

  /**
   * Is disable password
   * @return {boolean}
   */
  public isDisablePassword() {
    return this.selectedConnectionType.inputSpec.password === InputMandatory.NONE;
  }

  /**
   * Is valid connection input
   * @return {boolean}
   */
  public isValidConnectionInput(): boolean {
    let result: boolean = true;
    // not use URL
    if (!this.isUsedUrl) {
      // check HOST
      if (StringUtil.isEmpty(this.hostname)) {
        this.isHostnameError = true;
        result = false;
      }
      // check PORT
      if (!this.port) {
        this.isPortError = true;
        result = false;
      }
      // check SID
      if (!this.isDisableSid() && StringUtil.isEmpty(this.sid)) {
        this.isSidError = true;
        result = false;
      } else if (!this.isDisableDatabase() && StringUtil.isEmpty(this.database)) {
        this.isDatabaseError = true;
        result = false;
      } else if (!this.isDisableCatalog() && StringUtil.isEmpty(this.catalog)) {
        this.isCatalogError = true;
        result = false;
      }
    } else if (StringUtil.isEmpty(this.url)) {  // check URL
      this.isUrlError = true;
      result = false;
    }
    // check enable authentication
    if (!this.isDisableAuthenticationType()) {
      // check username
      if (!this.isDisableUsername() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(this.username)) {
        this.isUsernameError = true;
        result = false;
      }
      // check password
      if (!this.isDisablePassword() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(this.password)) {
        this.isPasswordError = true;
        result = false;
      }
    }
    return result;
  }

  /**
   * Is exist properties
   * @return {boolean}
   */
  public isExistProperties(): boolean {
    return this.properties && this.properties.length > 0;
  }

  /**
   * Is valid properties
   * @return {boolean}
   */
  public isValidProperties(): boolean {
    return this.properties.reduce((acc, property) => {
      // check key empty
      if (StringUtil.isEmpty(property.key)) {
        // set empty message
        property.keyValidMessage = this.translateService.instant('msg.storage.ui.required');
        // set error flag
        property.keyError = true;
        // set valid false
        acc = false;
        return acc;
      }
      // check key special characters, and korean (enable .dot)
      else if (property.key.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
        // set duplicate message
        property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.special.char.disable');
        // set error flag
        property.keyError = true;
        // set valid false
        acc = false;
        return acc;
      }
      // check key duplicate
      else if (this.properties.filter(item => item.key.trim() === property.key.trim()).length > 1) {
        // set duplicate message
        property.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.duplicated');
        // set error flag
        property.keyError = true;
        // set valid false
        acc = false;
        return acc;
      } else {
        return acc;
      }
    }, true);
  }

  /**
   * Get properties (key-value object)
   * @return {{}}
   */
  public getProperties() {
    return this.properties.reduce((acc, property) => {
      acc[property.key.trim()] = property.value.trim();
      return acc;
    }, {});
  }

  /**
   * Get converted properties
   * @param properties
   * @return {any[]}
   */
  public getConvertedProperties(properties) {
    return Object.keys(properties).reduce((acc, key) => {
      acc.push({key: key, value: properties[key], keyError: false, valueError: false});
      return acc;
    }, []);
  }

  /**
   * Get connection params
   * @return {ConnectionParam}
   */
  public getConnectionParams(isIncludeProperties?: boolean) {
    let connectionParam: ConnectionParam = {
      implementor: this.selectedConnectionType.implementor
    };
    // not use URL
    if (!this.isUsedUrl) {
      // HOST
      connectionParam.hostname = this.hostname;
      connectionParam.port = this.port;
      if (!this.isDisableSid()) {
        connectionParam.sid = this.sid;
      } else if (!this.isDisableDatabase()) {
        connectionParam.database = this.database;
      } else if (!this.isDisableCatalog()) {
        connectionParam.catalog = this.catalog
      }
    } else {  // use URL
      connectionParam.url = this.url;
    }
    // check enable authentication
    if (!this.isDisableAuthenticationType()) {
      connectionParam.authenticationType = this.selectedAuthenticationType.value;
      // check username
      if (!this.isDisableUsername() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
        connectionParam.username = this.username;
      }
      // check password
      if (!this.isDisablePassword() && this.selectedAuthenticationType.value !== AuthenticationType.USERINFO) {
        connectionParam.password = this.password;
      }
    } else { // if disable authentication, set default type
      connectionParam.authenticationType = this.authenticationTypeList[0].value;
    }
    // if is exist properties and include properties
    if (isIncludeProperties && this.isExistProperties()) {
      connectionParam.properties = this.getProperties();
    }
    return connectionParam;
  }

  /**
   * Get implemntor image icon
   * @param {JdbcDialect} connection
   * @return {string}
   */
  public getImplementorImageIcon(connection: JdbcDialect): string {
    return this.getConnImplementorImgUrl(
      connection.implementor,
      connection.scope === Scope.EMBEDDED ? '../../../../assets/images/img_db/ic_DB.png' : connection.iconResource1
    );
  }

  /**
   * Click add new property
   */
  public onClickAddProperty(): void {
    this.properties.push({key: undefined, value: undefined, keyError: undefined, valueError: undefined});
  }

  /**
   * Click remove property
   * @param {number} index
   */
  public onClickRemoveProperty(index: number): void {
    this.properties.splice(index, 1);
  }

  /**
   * Change selected connection type
   * @param {JdbcDialect} connectionType
   */
  public onChangeConnectionType(connectionType: JdbcDialect): void {
    if (!this.isDisableChangeConnectionType && connectionType.implementor !== this.selectedConnectionType.implementor) {
      this.selectedConnectionType = connectionType;
      // init input form
      this._connectionInputInitialize();
      // input error initial
      this.inputErrorInitialize();
      this.connectionValidInitialize();
    }
  }

  /**
   * Change use URL
   */
  public onChangeUseUrl(): void {
    if (!this.isDisableChangeConnectionInfo) {
      this.isUsedUrl = !this.isUsedUrl;
      // input error initial
      this.inputErrorInitialize();
      this.connectionValidInitialize();
    }
  }

  /**
   * Change selected authentication type
   * @param authenticationType
   */
  public onChangeAuthenticationType(authenticationType): void {
    if (!this.isDisableChangeConnectionInfo && this.selectedAuthenticationType.value !== authenticationType.value) {
      this.selectedAuthenticationType = authenticationType;
      // input error initial
      this.inputErrorInitialize();
      this.connectionValidInitialize();
    }
  }

  /**
   * Initail connection input
   * @private
   */
  private _connectionInputInitialize(): void {
    this.selectedAuthenticationType = this.authenticationTypeList[0];
    this.hostname = undefined;
    this.port = undefined;
    this.url = undefined;
    this.database = undefined;
    this.sid = undefined;
    this.catalog = undefined;
    this.username = undefined;
    this.password = undefined;
    this.isUsedUrl = undefined;
  }
}
