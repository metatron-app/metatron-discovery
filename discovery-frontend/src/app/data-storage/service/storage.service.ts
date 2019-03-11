/*
 *
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
import * as _ from 'lodash';

@Injectable()
export class StorageService extends AbstractService {

  private isEnableStageDatabase: boolean;

  constructor(protected injector: Injector) {
    super(injector);
  }

  public isEnableStageDB() {
    return this.isEnableStageDatabase;
  }

  /**
   * Check enable stageDB
   * @return {Promise<any>}
   */
  public checkEnableStageDB() {
    return new Promise((resolve, reject) => {
      this.get( `${this.API_URL}storage/stagedb`).then(result => {
        this.isEnableStageDatabase = _.negate(_.isNil)(result);
        resolve(result);
      }).catch(error => {
        this.isEnableStageDatabase = false;
        reject(error);
      });
    });
  }
}
