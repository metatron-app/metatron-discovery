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

import {AbstractHistoryEntity} from '../common/abstract-history-entity';
import {PrDataset} from './pr-dataset';

/**
 * Created by paige on 18/7/17.
 */
export class PrDataflow extends AbstractHistoryEntity {

  public dfId: string;
  public dfName: string;
  public dfDesc: string;
  public importedDsCount: number;
  public wrangledDsCount: number;
  public datasets: PrDataset[];

}

export class Dataflows {
  private dataflows: PrDataflow[];

  public getList() {
    return this.dataflows;
  }
}

export class Upstream {
  public dfId: string;
  public dsId: string;
  public upstreamDsId: string;
}

export class Upstreams {
  private upstreams: Upstream[];

  public getList() {
    return this.upstreams;
  }
}
