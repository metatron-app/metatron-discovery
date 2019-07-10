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
import {AbstractService} from '../../../common/service/abstract.service';
import {CommonUtil} from '../../../common/util/common.util';
import * as _ from 'lodash';

@Injectable()
export class LineageViewService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private readonly URL_LINEAGENODE = this.API_URL + 'metadatas/lineages';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // temporary service
  public createDatasource(param: any): Promise<any> {
    return this.post(this.API_URL + 'datasources', param);
  }
  public createConnection(param: any) : Promise<any> {
    return this.post(this.API_URL + 'connections', param);
  }

  /**
  * 리니지 엣지 목록 생성
  * @param {any} params
  * @returns {Promise<any>}
  */
  public postLineageEdge(params: any): Promise<any> {
    return this.post(this.URL_LINEAGENODE + `/edge`, params);
  }

  /**
  * 리니지 엣지 목록 조회
  * @param {string} projection
  * @returns {Promise<any>}
  */
  public getLineageEdges(projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `/edge`);
  }

  /**
  * 메타데이터를 기준으로 리니지 맵 조회
  * @param {string} metadataId
  * @param {string} projection
  * @returns {Promise<any>}
  */
  public getLineageMapForMetadata(metadataId: string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `/map/${metadataId}`);
  }

  /**
  * 엣지 조회
  * @param {string} edgeId
  * @param {string} projection
  * @returns {Promise<any>}
  */
  public getLineageEdge(edgeId: string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `/edge/${edgeId}`);
  }

}
