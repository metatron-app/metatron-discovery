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
export class MetadataService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private readonly URL_METADATA = this.API_URL + 'metadatas';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  metadataDetailSelectedTab: string = 'information';

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

  /**
   * 메타데이터 생성하기
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public createMetaData(params: object): Promise<any> {
    return this.post(this.URL_METADATA + '/batch', params);
  }

  public getCreatorDetail(userName: string) {
    return this.get(this.URL_METADATA + `/datacreators/${userName}`);
  }

  public getDuplicatedMetadataNameList(params: string[]): Promise<string[]> {
    return this.post(this.URL_METADATA + '/name/duplicated', params);
  }

  /**
   * 메타데이터 상세조회
   * @param {string} metaDataId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getDetailMetaData(metaDataId: string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_METADATA + `/${metaDataId}?projection=${projection}`);
  }

  /**
   * 메타데이터 목록 조회
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getMetaDataList(params: object, projection: string = 'forListView'): Promise<any> {
    // URL
    let url: string = this.URL_METADATA;

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }

    return this.get(url + `&projection=${projection}`);
  }

  public getMetadataListByDataCreator(username: string,params: object, projection: string = 'forListView'): Promise<any> {
    // URL
    let url: string = this.URL_METADATA + `/datacreators/${username}/metadatas`;

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }

    return this.get(url + `&projection=${projection}`);
  }
  /**
   * 메타데이터  삭제
   * @param {string} id
   * @returns {Promise<any>}
   */
  public deleteMetaData(id: string): Promise<any> {

    return this.delete(this.URL_METADATA + `/${id}`);
  }

  /**
   * 메타데이터 수정
   * @param {string} id
   * @param {any} params
   * @returns {Promise<any>}
   */
  public updateMetadata(id: string, params: any): Promise<any> {
    return this.patch(this.URL_METADATA + `/${id}`, params);
  }

  /**
   * 메타데이터 이름 중복 체크
   * @param {string} name
   * @returns {Promise<any>}
   */
  public getDuplicateMetaDataName(name: string): Promise<any> {
    return this.get(this.URL_METADATA + `/name/${name}/duplicated`);
  }

  /**
   * 메타데이터 내 컬럼 스키마 조회
   * @param {string} metaDataId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getColumnSchemaListInMetaData(metaDataId: string, projection: string = 'forListView'): Promise<any> {
    return this.get(this.URL_METADATA + `/${metaDataId}/columns?projection=${projection}`);
  }

  /**
   * 메타데이터 내 컬럼 스키마 수정
   * @param {string} metaDataId
   * @param params
   * @returns {Promise<any>}
   */
  public updateColumnSchema(metaDataId: string, params: any): Promise<any> {
    return this.patch(this.URL_METADATA + `/${metaDataId}/columns`, params);
  }

  public linkMetadataWithCatalog(metadataId, catalogId): Promise<any> {
    let catId = this.API_URL + 'catalogs/' + catalogId;
    return this.patch(this.URL_METADATA + `/${metadataId}/catalogs`, catId, 'text/uri-list');
  }

  public deleteCatalogLinkFromMetadata(metadataId, catalogId): Promise<any> {
    return this.delete(this.URL_METADATA + `/${metadataId}/catalogs/${catalogId}`);
  }

  public addTagToMetadata(metadataId, params): Promise<any> {
    return this.post(this.URL_METADATA + `/${metadataId}/tags/attach`, params);
  }

  public deleteTagFromMetadata(metadataId, params): Promise<any> {
    return this.post(this.URL_METADATA + `/${metadataId}/tags/detach`, params);
  }

  public getMetadataTags(): Promise<any> {
    return this.get(this.URL_METADATA + `/tags`);
  }

  public getPopularityTags(params:{scope?:string, domainType?:string, nameContains?: string, size?:number }): Promise<any> {
    let url: string = this.API_URL + `/tags/popularity`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  public getMetadataSampleData(metadataId: string, limit: number = 50) {
    return this.get(this.URL_METADATA + '/' + metadataId + '/data?limit=' + limit);
  }

  public getDownloadMetadataSampleData(metadataId: string, fileName: string, limit: number = 50) {
    return this.get(this.URL_METADATA + '/' + metadataId + '/data/download?limit=' + limit + '&fileName=' + fileName);
  }

  /**
   * 데이터 소스에 대한 메타데이터 조회
   * @param {string} sourceId
   * @param projection
   * @returns {Promise<any>}
   */
  public getMetadataForDataSource(
    sourceId: string, projection: 'forItemView' | 'forDetailView' = 'forItemView'): Promise<any> {
    return this.post(
      this.URL_METADATA + `/metasources/${sourceId}?projection=${_.isNil(projection) ? 'forItemView' : projection}`,
      {});
  } // function - getMetadataForDataSource

  /**
   * 커넥션에 대한 메타데이터 조회
   * @param {string} connId
   * @param {string} schemaName
   * @param {string} tableName
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getMetadataByConnection(
    connId: string, schemaName: string, tableName: object, projection: string = 'forItemView'): Promise<any> {
    // param data 생성
    let param = {
      'schema': schemaName,
      'table': tableName,
    };
    return this.post(this.URL_METADATA + `/metasources/${connId}?projection=${projection}`, param);
  }

  public getMetadataSourceTypeCount() {
    return this.get(this.URL_METADATA + '/statistics/count/sourcetype');
  }

  public getMetadataListByPopularity(params) {
    // URL
    let url: string = this.URL_METADATA + '/popularity';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  public getMetadataListByMyFavorite(params, projection: string = 'forListView') {
    // URL
    let url: string = this.URL_METADATA + '/favorite/my';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url + `&projection=${projection}`);
  }

  public getCreatorList(params) {
    // URL
    let url: string = this.URL_METADATA + '/datacreators';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  public getMetadataListByFavoriteCreator(params) {
    // URL
    let url: string = this.URL_METADATA + '/datacreators';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  public getFavoriteCreatorList(params) {
    // URL
    let url: string = this.URL_METADATA + '/datacreators';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    // return this.get(url);
  }

  public getMetadataListByRecommended(params) {
    // URL
    let url: string = this.URL_METADATA + '/recommended';
    // if exist params
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * Get Top user in Metadata Detail
   * @param {string} metaDataId
   * @returns {Promise<any>}
   */
  public getTopUserInMetadataDetail(metaDataId: string): Promise<any> {
    return this.get(this.URL_METADATA + `/${metaDataId}/users/frequency`);
  }

  /**
   * Get Recently Updated in Metadata Detail Info
   * @param {string} metaDataId
   * @returns {Observable<any>}
   */
  public getRecentlyUpdatedInMetadataDetail(metaDataId: string): Promise<any> {
    return this.get(this.URL_METADATA + `/${metaDataId}/history`);
  }

  /**
   * Get Recently Updated in Metadata Detail Info
   * @param {string} metaDataId
   * @param params
   * @returns {Observable<any>}
   */
  public getRecentlyUsedInMetadataDetail(metaDataId: string, params?): Promise<any> {
    // URL
    let url: string = this.URL_METADATA + `/${metaDataId}/related?`;
    // if exist params
    if (params) {
      url += CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * Get Recently Queries In Metadata Detail for DataBase
   * @param {number} page
   * @param {number} size
   * @param {string} sort
   * @param {string} dataConnectionId
   * @returns {Promise<any>}
   */
  public getRecentlyQueriesInMetadataDetailForDatabase(dataConnectionId: string, page: number, size: number, sort: string): Promise<any> {
    return this.get(this.API_URL + `queryhistories?sort=${sort}&size=${size}&dataConnectionId=${dataConnectionId}`);
  }


  public getMetadataTagList(projection: string, params?): Promise<any> {
    // URL
    let url: string = this.URL_METADATA + `/tags?projection=${projection}`;
    // if exist params
    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  public toggleMetadataFavorite(id: string, isFavorite: boolean) {
    let url: string = this.URL_METADATA + `/${id}/favorite/`;

    if (isFavorite) {
      url += 'detach';
    } else {
      url += 'attach';
    }
    return this.post(url, null);
  }

  public toggleCreatorFavorite(id: string, isFavorite: boolean) {
    let url: string = this.URL_METADATA + `/datacreators/${id}/favorite/`;

    if (isFavorite) {
      url += 'detach';
    } else {
      url += 'attach';
    }
    return this.post(url, null);
  }

  public isShowLineage(): Promise<any> {
    return this.get(this.API_URL + `extensions/lineage`)
  }

  public onSelectMetadataDetailTab(selectedTab: string) {
    this.metadataDetailSelectedTab = selectedTab;
  }
}
