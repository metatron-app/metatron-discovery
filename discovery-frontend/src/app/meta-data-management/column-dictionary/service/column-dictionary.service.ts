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
export class ColumnDictionaryService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Dictionary url
  private URL_DICTIONARY = this.API_URL + 'dictionaries';

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
   * 컬럼 사전 생성
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public createColumnDictionary(params: object): Promise<any> {
    return this.post(this.URL_DICTIONARY, params);
  }

  /**
   * 컬럼 사전 목록 조회
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getColumnDictionaryList(params: object, projection: string = 'forListView'): Promise<any> {
    let url = this.URL_DICTIONARY + `?projection=${projection}`;
    (params) && (url += '&' + CommonUtil.objectToUrlString(params));
    return this.get(url);
  }

  /**
   * 컬럼 사전 상세정보 조회
   * @param {string} dictionaryId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getColumnDictionaryDetail(dictionaryId: string, projection: string = 'forDetailView'): Promise<any> {
    const url = this.URL_DICTIONARY + `/${dictionaryId}?projection=${projection}`;
    return this.get(url);
  }

  /**
   * 컬럼 사전에 중복된 논리명이 있는지 조회
   * @param {string} logicalName
   * @returns {Promise<any>}
   */
  public getDuplicateLogicalNameInColumnDictionary(logicalName: string): Promise<any> {
    return this.get(this.URL_DICTIONARY + `/name/${logicalName}/duplicated`);
  }

  /**
   * 컬럼 사전 수정
   * @param {string} dictionaryId
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public updateColumnDictionary(dictionaryId: string, params: object): Promise<any> {
    return this.patch(this.URL_DICTIONARY + '/' + dictionaryId, params);
  }

  /**
   * 컬럼 사전 제거
   * @param {string} dictionaryId
   * @returns {Promise<any>}
   */
  public deleteColumnDictionary(dictionaryId: string): Promise<any> {
    return this.delete(this.URL_DICTIONARY + '/' + dictionaryId);
  }

  /**
   * 컬럼 사전과 코드테이블 연결
   * @param {string} dictionaryId
   * @param {string} codeTableId
   * @returns {Promise<any>}
   */
  public linkCodeTableWithColumnDictionary(dictionaryId: string, codeTableId: string): Promise<any> {
    return this.put(this.URL_DICTIONARY + `/${dictionaryId}/codetable`, `/api/codetables/${codeTableId}`,
      'text/uri-list');
  }

  /**
   * 컬럼 사전과 연결된 코드테이블 제거
   * @param {string} dictionaryId
   * @param {string} codeTableId
   * @returns {Promise<any>}
   */
  public unlinkCodeTableWithColumnDictionary(dictionaryId: string, codeTableId: string): Promise<any> {
    return this.delete(this.URL_DICTIONARY + `/${dictionaryId}/codetable/${codeTableId}`);
  }

  /**
   * 컬럼 사전에 연결된 코드테이블 조회
   * @param {string} dictionaryId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getCodeTableInColumnDictionary(dictionaryId: string, projection: string = 'forCodeView'): Promise<any> {
    return this.get(this.URL_DICTIONARY + `/${dictionaryId}/codetable?projection=${projection}`);
  }

  /**
   * 컬럼 사전에 연결된 메타데이터 조회
   * @param {string} dictionaryId
   * @param {Object} params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getMetadataInColumnDictionary(
    dictionaryId: string, params: object, projection: string = 'forDictionaryListView'): Promise<any> {
    let url = this.URL_DICTIONARY + `/${dictionaryId}/columns?projection=${projection}`;
    (params) && (url += '&' + CommonUtil.objectToUrlString(params));
    return this.get(url);
  }
}
