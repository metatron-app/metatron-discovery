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

import {AbstractService} from '../../common/service/abstract.service';
import {Injectable, Injector} from '@angular/core';
import {JdbcDialect} from "../../domain/dataconnection/dataconnection";

@Injectable()
export class StorageService extends AbstractService {

  public static isEnableStageDB: boolean;

  public static connectionTypeList: JdbcDialect[];

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * Check enable stageDB
   * @return {Promise<any>}
   */
  public checkEnableStageDB() {
    return new Promise((resolve, reject) => {
      this.get(this.API_URL + `storage/stagedb`).then(result => {
        StorageService.isEnableStageDB = result ? true : false;
        resolve(result);
      }).catch(error => {
        StorageService.isEnableStageDB = false;
        reject(error);
      });
    });
  }

  public setConnectionTypeList() {
    return new Promise((resolve, reject) => {
      this.get(this.API_URL + 'extensions/connection').then(result => {
        StorageService.connectionTypeList = result;
        resolve(result);
      }).catch(error => {
        StorageService.connectionTypeList = [];
        reject(error);
      })
    })
  }
}
