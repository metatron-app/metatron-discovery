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
import {CommonUtil} from '../../../common/util/common.util';
import {AbstractService} from '../../../common/service/abstract.service';

@Injectable()
export class CatalogService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private URL_CATALOG = this.API_URL + 'catalogs';

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
   * 카타로그 생성
   * @param {string} name
   * @returns {Promise<any>}
   */
  public createCatalog(params: any): Promise<any> {
    return this.post(this.URL_CATALOG, params);
  }

  /**
   * 카타로그 삭제
   * @param {string} id
   * @returns {Promise<any>}
   */
  public deleteCatalog(id: string): Promise<any> {
    return this.delete(this.URL_CATALOG + `/${id}`);
  }

  /**
   * 카타로그 이름 수정
   * @param {string} name
   * @returns {Promise<any>}
   */
  public updateCatalog(id: string, name: string): Promise<any> {
    return this.patch(this.URL_CATALOG + `/${id}`, {name: name});
  }

  /**
   * 카탈로그내 포함되어 있는 메타데이터를 조회합니다.
   *
   * @param nameContains
   * @param pageable
   * @return
   */
  public getMetadataInCatalog(id: string, params?: any): Promise<any> {
    let url = this.URL_CATALOG + `/${id}/metadatas`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url + `&projection=default&allSubCatalogs=true`);
  }

  /**
   * 전체 카테고리를 트리로 조회합니다.
   * @param id
   * @return
   */
  public getTreeCatalogs(id: string): Promise<any> {
    return this.get(this.URL_CATALOG + `/${id}/tree`);
  }

  /**
   * 전체 카테고리를 조회합니다.
   * @param param
   * @return
   */
  public getCatalogs(params: any): Promise<any> {

    let url = this.URL_CATALOG;
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url + `&projection=forListView`);
  }

}
