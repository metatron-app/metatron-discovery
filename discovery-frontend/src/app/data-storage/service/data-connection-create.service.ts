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
import {AuthenticationType, ConnectionType} from "../../domain/dataconnection/dataconnection";

@Injectable()
export class DataConnectionCreateService {

  constructor(injector: Injector) {
  }

  /**
   * Is required database
   * @param {ConnectionType} implementor
   * @return {boolean}
   */
  public isRequiredDatabase(implementor: ConnectionType): boolean {
    return implementor === ConnectionType.POSTGRESQL;
  }

  /**
   * Is required SID
   * @param {ConnectionType} implementor
   * @return {boolean}
   */
  public isRequiredSid(implementor: ConnectionType): boolean {
    return implementor === ConnectionType.TIBERO || implementor === ConnectionType.ORACLE;
  }

  /**
   * Is required catalog
   * @param {ConnectionType} implementor
   * @return {boolean}
   */
  public isRequiredCatalog(implementor: ConnectionType): boolean {
    return implementor === ConnectionType.PRESTO;
  }
}

export interface ConnectionParam {
  implementor: ConnectionType;
  authenticationType: AuthenticationType;
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
