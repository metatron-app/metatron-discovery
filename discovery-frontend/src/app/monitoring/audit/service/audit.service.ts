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
export class AuditService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  public previousRouter: string = '';

  /**
   * 일별 쿼리 수행 건수
   * @param {any} params
   * @returns {Promise<any>}
   */
  public getDailyJobSuccessRate(params: any): Promise<any> {
    let url = this.API_URL + 'audits/stats/query/count/date';
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getDailyJobSuccessRate

  /**
   * 해당 기간중 유저별 쿼리 수행 건수
   * @param {any} params
   */
  public getQueryDistributionByUser(params: any): Promise<any> {
    let url = this.API_URL + 'audits/stats/query/count/user';
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  } // function - getQueryDistributionByUser

  /**
   * audit list 조회
   * @param params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getAuditList(params: any, projection: string = 'list'): Promise<any> {

    let url = this.API_URL + `audits?projection=${projection}`;

    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }

    return this.get(url);
  }


  /**
   * audit 상세 요약정보
   * @param {string} auditId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getAuditDetail(auditId: string, projection: string = 'detail'): Promise<any> {
    return this.get(this.API_URL + `audits/${auditId}?projection=${projection}`);
  }


  /**
   * 쿼리 내역 목록 조회
   * @param params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getQueryHistories(params: any, projection: string = 'forListView'): Promise<any> {
    let url = this.API_URL + `queryhistories?projection=${projection}`;

    if (params) {
      url += '&' + CommonUtil.objectToUrlString(params);
    }

    return this.get(url);
  }


  /**
   * 쿼리빈도 조회 (status)
   * @param {any} params
   * @returns {Promise<any>}
   */
  public getQueryListByStatus(params: any): Promise<any> {

    let url = this.API_URL + `audits/stats/query/count/status`;

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * resource 조회 (Resource)
   * @param {any} params
   * @returns {Promise<any>}
   */
  public getQueryListByResource(params: any): Promise<any> {

    let url = this.API_URL + `audits/stats/queue/sum/resource`;

    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }


  /**
   * 정렬 순으로 쿼리리스트 조회
   * @param {string} params
   * @returns {Promise<any>}
   */
  public getQueryListBySort(params: any): Promise<any> {

    let url = this.API_URL + `audits`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }


}
