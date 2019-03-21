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

import {Injectable, Injector} from "@angular/core";
import {AuthenticationType, ConnectionSample, ImplementorType} from "../../domain/dataconnection/dataconnection";
import {TranslateService} from "@ngx-translate/core";
import {ConnectionType} from "../../domain/datasource/datasource";
import {StringUtil} from "../../common/util/string.util";

@Injectable()
export class DataConnectionCreateService {

  private _translateService: TranslateService;

  public authenticationTypeList: {label: string, value: AuthenticationType}[];

  public implementorList: {label: string, value: ImplementorType}[];

  constructor(injector: Injector) {
    this._translateService = injector.get(TranslateService);
    // set authentication type list
    this.authenticationTypeList = [
      { label: this._translateService.instant('msg.storage.li.connect.always'), value: AuthenticationType.MANUAL },
      { label: this._translateService.instant('msg.storage.li.connect.account'), value: AuthenticationType.USERINFO },
      { label: this._translateService.instant('msg.storage.li.connect.id'), value: AuthenticationType.DIALOG }
    ];
  }

  /**
   * Is required database
   * @param {ImplementorType} implementor
   * @return {boolean}
   */
  public isRequiredDatabase(implementor: ImplementorType): boolean {
    return implementor === ImplementorType.POSTGRESQL;
  }

  /**
   * Is required SID
   * @param {ImplementorType} implementor
   * @return {boolean}
   */
  public isRequiredSid(implementor: ImplementorType): boolean {
    return implementor === ImplementorType.TIBERO || implementor === ImplementorType.ORACLE;
  }

  /**
   * Is required catalog
   * @param {ImplementorType} implementor
   * @return {boolean}
   */
  public isRequiredCatalog(implementor: ImplementorType): boolean {
    return implementor === ImplementorType.PRESTO;
  }

  /**
   * Is enable connection
   * @param {ConnectionForm} form
   * @return {boolean}
   */
  public isEnableConnection(form: ConnectionForm): boolean {
    let result: boolean = true;
    // if disable URL
    if (!form.isEnableUrl) {
      // if empty HOST
      if (StringUtil.isEmpty(form.hostname)) {
        form.isShowHostRequired = true;
        result = false;
      }
      // if empty PORT
      if (!form.port) {
        form.isShowPortRequired = true;
        result = false;
      }
      // if empty SID
      if (this.isRequiredSid(form.selectedImplementor.value) && StringUtil.isEmpty(form.sid)) {
        form.isShowSidRequired = true;
        result = false;
      }
      // if empty DATABASE
      if (this.isRequiredDatabase(form.selectedImplementor.value) && StringUtil.isEmpty(form.database)) {
        form.isShowDatabaseRequired = true;
        result = false;
      }
      // if empty CATALOG
      if (this.isRequiredCatalog(form.selectedImplementor.value) && StringUtil.isEmpty(form.catalog)) {
        form.isShowCatalogRequired = true;
        result = false;
      }
    } else if (StringUtil.isEmpty(form.url)) {  // if enable URL
      form.isShowUrlRequired = true;
      result = false;
    }
    // if authenticationType is not USERINFO and empty USERNAME
    if (form.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(form.username)) {
      form.isShowUsernameRequired = true;
      result = false;
    }
    // if authenticationType is not USERINFO and empty PASSWORD
    if (form.selectedAuthenticationType.value !== AuthenticationType.USERINFO && StringUtil.isEmpty(form.password)) {
      form.isShowPasswordRequired = true;
      result = false;
    }
    return result;
  }

  /**
   * Is disable properties
   * @param {{key: string; value: string; keyError: boolean; valueError: boolean; keyValidMessage?: string}[]} properties
   * @return {boolean}
   */
  public isEnableProperties(properties: {key: string, value: string, keyError: boolean, valueError: boolean, keyValidMessage?: string}[]): boolean {
    return properties.reduce((acc, property) => {
      // check key empty
      if (StringUtil.isEmpty(property.key)) {
        // set empty message
        property.keyValidMessage = this._translateService.instant('msg.storage.ui.required');
        // set error flag
        property.keyError = true;
        // set valid false
        acc.valid = false;
        return acc;
      }
      // check key special characters, and korean (enable .dot)
      else if (property.key.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
        // set duplicate message
        property.keyValidMessage = this._translateService.instant('msg.storage.ui.custom.property.special.char.disable');
        // set error flag
        property.keyError = true;
        // set valid false
        acc.valid = false;
        return acc;
      }
      // check key duplicate
      else if (properties.filter(item => item.key.trim() === property.key.trim()).length > 1) {
        // set duplicate message
        property.keyValidMessage = this._translateService.instant('msg.storage.ui.custom.property.duplicated');
        // set error flag
        property.keyError = true;
        // set valid false
        acc.valid = false;
        return acc;
      } else {
        return acc;
      }
    }, {valid: true}).valid;
  }
}

export interface ConnectionForm {
  // data
  hostname?: string;
  port?: number;
  url?: string;
  username?: string;
  password?: string;
  database?: string;
  catalog?: string;
  sid?: string;
  properties?: any;
  // ui
  implementorList: ConnectionSample[];
  selectedSourceConnType?: {label: string, value: ConnectionType};
  selectedImplementor: {label: string, value: ImplementorType};
  selectedAuthenticationType: {label: string, value: AuthenticationType};
  // flag
  isClickedDone?: boolean;
  isEnableUrl?: boolean;
  isEnableConnection?: boolean;
  // require flag
  isShowHostRequired?: boolean;
  isShowPortRequired?: boolean;
  isShowUrlRequired?: boolean;
  isShowUsernameRequired?: boolean;
  isShowPasswordRequired?: boolean;
  isShowSidRequired?: boolean;
  isShowDatabaseRequired?: boolean;
  isShowCatalogRequired?: boolean;
}

export interface CreateConnectionParams extends ConnectionParam {
  type?: string;
  name?: string;
  published?: boolean;
  workspaces?: string[];
}

export interface ConnectionParam {
  implementor?: ImplementorType;
  authenticationType?: AuthenticationType;
  username?: string;
  password?: string;
  url?: string;
  hostname?: string;
  port?: number;
  database?: string;
  catalog?: string;
  sid?: string;
  properties?: any;
}
