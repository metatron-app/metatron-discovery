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
import {AuthenticationType, ImplementorType} from "../../domain/dataconnection/dataconnection";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class DataConnectionCreateService {

  private _translateService: TranslateService;

  public authenticationTypeList: {label: string, value: AuthenticationType}[];

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
  properties?;
  id?: string;
}
