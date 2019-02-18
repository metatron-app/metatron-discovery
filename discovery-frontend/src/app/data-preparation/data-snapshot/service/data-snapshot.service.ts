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

import { Injectable, Injector } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AbstractService } from '../../../common/service/abstract.service';
//import { DataSnapshot, DataSnapshots } from '../../../domain/data-preparation/data-snapshot';
import { PrDataSnapshot, DataSnapshots, SsType } from '../../../domain/data-preparation/pr-snapshot';
import { Page } from '../../../domain/common/page';
import { CommonUtil } from '../../../common/util/common.util';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { Observable } from 'rxjs';

@Injectable()
export class DataSnapshotService extends AbstractService {

  constructor (protected injector: Injector) {
    super(injector);
  }

  // 데이터 스냅샷 목록 조회
  public getDataSnapshots(searchText: string, page:Page, projection?: string): Promise<DataSnapshots> {
    let url = this.API_URL + `preparationsnapshots/search/findBySsNameContaining?ssName=${encodeURIComponent(searchText)}`;
    if (projection) {
      url = url + '&projection=' + projection;
    }

    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 데이터 스냅샷 상태별 목록 조회
  public getDataSnapshotsByStatus(param): Promise<DataSnapshots> {
    let statuses = '';
    // except CANCELED starus
    if( 'all'== param.status) {
      statuses = 'SUCCEEDED,FAILED,NOT_AVAILABLE,INITIALIZING,RUNNING,WRITING,TABLE_CREATING';
    } else if( 'success'== param.status ) {
      statuses = 'SUCCEEDED';
    } else if( 'fail'== param.status ) {
      statuses = 'FAILED';
    } else if( 'preparing'== param.status ) {
      statuses = 'INITIALIZING,RUNNING,WRITING,TABLE_CREATING,CANCELING';
    }

    let url = this.API_URL + `preparationsnapshots/search/findBySsNameContainingAndStatusInAndSsTypeIn?ssName=${encodeURIComponent(param.searchText)}&statuses=${statuses}`;

    if (!param.ssType) {
      url +=  `&ssTypes=${SsType.URI},${SsType.DATABASE},${SsType.STAGING_DB},${SsType.DRUID}`;
    } else {
      url +=  `&ssTypes=${param.ssType}`;
    }
    if (param.projection) {
      url = url + '&projection=' +param.projection;
    }

    delete param.page.column;

    url += '&' + CommonUtil.objectToUrlString(param.page);
    return this.get(url);
  }

  // 데이터스냅샷 상세 조회
  //public getDataSnapshot(ssId: string): Promise<DataSnapshot> {
  public getDataSnapshot(ssId: string): Promise<PrDataSnapshot> {
    const url = this.API_URL + 'preparationsnapshots/' + ssId + '?projection=detail';
    return this.get(url);
  }

  // 데이터스냅샷 삭제
  public deleteDataSnapshot(ssId: string) {
    return this.delete(this.API_URL + 'preparationsnapshots/' + ssId);
  }


  // 데이터스냅샷 그리드 데이터
  public getDataSnapshotGridData(ssId: string, offset: number, target: number) {
    //console.info(ssId, offset, target);
    return this.get(this.API_URL + `preparationsnapshots/${ssId}/contents?offset=${offset}&target=${target}`);
  }

  public downloadSnapshot(ssId: string, fileFormat: string): Observable<any> {
    let mineType: string;
    if (fileFormat === 'csv') {
      mineType = 'application/csv';
    } else if (fileFormat === 'json'){
      mineType = 'application/json';
    }

    let headers = new HttpHeaders({
      'Accept': mineType,
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });

    let option: Object = {
      headers: headers,
      responseType: 'blob'
    };

    return this.http.get(this.API_URL + `preparationsnapshots/${ssId}/download?fileType=`+fileFormat, option)
      .map((res) => {
        return new Blob([res], { type: 'application/csv' })
      });
  }
  /** 처리 중 스냅샷 취소*/
  public cancelSnapshot(ssId) {
    let url = `/api/preparationsnapshots/${ssId}/cancel`;
    return this.post(url,{});
  }


  /**
   * Edit snapshotname
   * @param {{ssId: string, ssName: string}} data
   * @returns {Promise<any>}
   */
  public editSnapshot(data : {ssId: string, ssName: string}) {
    let url = `/api/preparationsnapshots/${data.ssId}`;
    return this.patch(url,{ssName : data.ssName});
  }
}
