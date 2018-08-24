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
import { AbstractService } from '../../../common/service/abstract.service';
import { DataSnapshot, DataSnapshots } from '../../../domain/data-preparation/data-snapshot';
import { Page } from '../../../domain/common/page';
import { CommonUtil } from '../../../common/util/common.util';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { Headers, ResponseContentType } from '@angular/http';
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
  public getDataSnapshotsByStatus(searchText: string, status: string, page:Page, projection?: string): Promise<DataSnapshots> {
    let statuses = '';
    // except CANCELED starus
    if( 'all'==status) {
      statuses = 'SUCCEEDED,FAILED,NOT_AVAILABLE,INITIALIZING,RUNNING,WRITING,TABLE_CREATING,CANCELING';
    } else if( 'success'==status ) {
      statuses = 'SUCCEEDED';
    } else if( 'fail'==status ) {
      statuses = 'FAILED,CANCELED,NOT_AVAILABLE';
    } else if( 'preparing'==status ) {
      statuses = 'INITIALIZING,RUNNING,WRITING,TABLE_CREATING,CANCELING';
    }

    let url = this.API_URL + `preparationsnapshots/search/findBySsNameContainingAndStatusIn?ssName=${encodeURIComponent(searchText)}&statuses=${statuses}`;
    if (projection) {
      url = url + '&projection=' + projection;
    }

    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 데이터스냅샷 상세 조회
  public getDataSnapshot(ssId: string): Promise<DataSnapshot> {
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

  public downloadSnapshot(ssId: string): Observable<any> {
    let headers = new Headers({
      'Accept': 'application/csv',
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });

    let option: Object = {
      headers: headers,
      responseType: ResponseContentType.Blob
    };

    return this.http.get(this.API_URL + `preparationsnapshots/${ssId}/download`, option)
      .map((res) => {
        return new Blob([res.blob()], { type: 'application/csv' })
      });
  }
  /** 처리 중 스냅샷 취소*/
  public cancelSnapshot(ssId) {
    let url = `/api/preparationsnapshots/${ssId}/cancel`;
    return this.post(url,{});
  }
}
