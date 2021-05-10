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

@Injectable()
export class SchedulingService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  public getScheduling(group: string, name: string) {
    return this.get(this.API_URL + `jobs/search/key?group=${group}&name=${name}`);
  }

  public pauseScheduling(group: string, name: string) {
    return this.post(this.API_URL + `jobs/${group}/${name}/pause`, null);
  }

  public resumeScheduling(group: string, name: string) {
    return this.post(this.API_URL + `jobs/${group}/${name}/resume`, null);
  }

}
