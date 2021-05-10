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

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '@common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import {CommonUtil} from '@common/util/common.util';

@Injectable()
export class ActivityService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  public getActivities(username: string, params?: any): Promise<any> {
    let url = this.API_URL + `activities/user/${username}`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getActivities

}
