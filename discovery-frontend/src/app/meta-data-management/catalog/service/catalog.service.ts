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
import {CommonUtil} from '@common/util/common.util';
import {AbstractService} from '@common/service/abstract.service';
import {Catalog} from '@domain/catalog/catalog';

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

  public selectedCatalog: Catalog.Tree;

  public createCatalog(params: any): Promise<any> {
    return this.post(this.URL_CATALOG, params);
  }

  public deleteCatalog(id: string): Promise<any> {
    return this.delete(this.URL_CATALOG + `/${id}`);
  }

  public updateCatalog(id: string, name: string): Promise<any> {
    return this.patch(this.URL_CATALOG + `/${id}`, {name: name});
  }

  /**
   * Toggle catalog favorite flag
   *
   * @param id
   * @param isFavorite
   * @return
   */
  public toggleCatalogFavorite(id: string, isFavorite): Promise<any> {
    let url: string = this.URL_CATALOG + `/${id}/favorite/`;

    if (isFavorite) {
      url += 'detach';
    } else {
      url += 'attach';
    }
    return this.post(url, null);
  }

  public getMetadataInCatalog(id: string, params?: any, allSubCatalogs: boolean = true, projection: string = 'default'): Promise<any> {
    let url = this.URL_CATALOG + `/${id}/metadatas`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url + `&projection=${projection}&allSubCatalogs=${allSubCatalogs}`);
  }

  public getTreeCatalogs(id: string, includeAllHierarchies?: boolean): Promise<any> {
    if (includeAllHierarchies) {
      return this.get(this.URL_CATALOG + `/${id}/tree/?includeAllHierarchies=${includeAllHierarchies}`);
    } else {
      return this.get(this.URL_CATALOG + `/${id}/tree`);
    }
  }

  public getCatalogs(params: any, projection: string = 'forListView'): Promise<any> {

    let url = this.URL_CATALOG;
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url + `&projection=${projection}`);
  }


  /**
   * Get catalog detail including favorite
   * @param id
   * @return
   */

  public getCatalogDetail(id: string): Promise<any> {
    let url = this.URL_CATALOG;
    url += `/${id}?projection=forHierarchyView`;

    return this.get(url);
  }

  /**
   * Get my favorite catalog list
   * @return
   */

  public getMyFavoriteCatalogList(): Promise<any> {
    let url = this.URL_CATALOG;
    url += '/favorite/my?projection=forListView';

    return this.get(url);
  }

  public getPopularityCatalogs(params: { nameContains?: string, size?: number }): Promise<any> {
    let url = this.URL_CATALOG + '/popularity';
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }
}
