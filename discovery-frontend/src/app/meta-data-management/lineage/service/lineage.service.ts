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
import {CommonUtil} from '@common/util/common.util';

@Injectable()
export class LineageService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // code table URL
  private URL_LINEAGE = this.API_URL + 'metadatas/lineages';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * lineage 생성
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public createLineage(params: object): Promise<any> {
    return this.post(this.URL_LINEAGE, params);
  }

  public createLineages(params: object): Promise<any> {
    return this.post(this.URL_LINEAGE + `/edge_list`, params);
  }

  public getLineageFile(params: object): Promise<any> {
    return this.post(this.URL_LINEAGE + `/lineage_file`, params);
  }

  /**
   * 코드테이블 목록 조회
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getLineageList(params: object, projection: string = 'forListView'): Promise<any> {
    let url = this.URL_LINEAGE + `/list?projection=${projection}`;
    url += '&' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }

  public getLineageDetail(lineageEdgeId: string, projection: string = 'default'): Promise<any> {
    return this.get(this.URL_LINEAGE + `/edges/${lineageEdgeId}?projection=${projection}`);
  }

  /**
   * Lineage 업데이트
   * @param {string} tableId
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public updateLineage(tableId: string, params: object): Promise<any> {
    return this.patch(this.URL_LINEAGE + `/${tableId}`, params);
  }

  /**
   * Lineage 삭제
   * @param {string} edgeId
   * @returns {Promise<any>}
   */
  public deleteLineage(edgeId: string): Promise<any> {
    return this.delete(this.URL_LINEAGE + `/edges/${edgeId}`);
  }
}
