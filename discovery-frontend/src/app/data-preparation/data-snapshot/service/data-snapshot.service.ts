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
import { PrDataSnapshot, SsType } from '../../../domain/data-preparation/pr-snapshot';
import { CommonUtil } from '../../../common/util/common.util';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { Observable } from 'rxjs';
import {LogicalType} from "../../../domain/datasource/datasource";

@Injectable()
export class DataSnapshotService extends AbstractService {

  constructor (protected injector: Injector) {
    super(injector);
  }

  private _baseUrl: string = this.API_URL + '/preparationsnapshots/';

  /**
   * Get snapshot list
   * @param param
   */
  public getDataSnapshotsByStatus(param): Promise<PrDataSnapshot[]> {
    let statuses = '';

    if( 'all'== param.status) {
      statuses = 'SUCCEEDED,FAILED,NOT_AVAILABLE,INITIALIZING,RUNNING,WRITING,TABLE_CREATING';
    } else if( 'success'== param.status ) {
      statuses = 'SUCCEEDED';
    } else if( 'fail'== param.status ) {
      statuses = 'FAILED';
    } else if( 'preparing'== param.status ) {
      statuses = 'INITIALIZING,RUNNING,WRITING,TABLE_CREATING,CANCELING';
    }

    let url = `${this._baseUrl}search/findBySsNameContainingAndStatusInAndSsTypeIn?ssName=${encodeURIComponent(param.searchText)}&statuses=${statuses}`;

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


  /**
   * Snapshot detail
   * @param ssId
   */
  public getDataSnapshot(ssId: string): Promise<PrDataSnapshot> {
    const url = this._baseUrl + ssId + '?projection=detail';
    return this.get(url);
  }


  /**
   * Delete snapshot
   * @param ssId
   */
  public deleteDataSnapshot(ssId: string) {
    return this.delete(this._baseUrl+ ssId);
  }


  /**
   * Get snapshot grid data
   * @param ssId
   * @param offset
   * @param target
   */
  public getDataSnapshotGridData(ssId: string, offset: number, target: number) {
    return this.get(`${this._baseUrl}${ssId}/contents?offset=${offset}&target=${target}`);
  }


  /**
   * Download snapshot
   * @param ssId
   * @param fileFormat
   */
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

    return this.http.get(`${this._baseUrl}${ssId}/download?fileType=`+fileFormat, option)
      .map((res) => {
        return new Blob([res], { type: 'application/csv' })
      });
  }


  /**
   * Snapshot creation cancel
   * @param ssId
   */
  public cancelSnapshot(ssId) {
    let url = `${this._baseUrl}${ssId}/cancel`;
    return this.post(url,{});
  }


  /**
   * Edit snapshot Name
   * @param {{ssId: string, ssName: string}} data
   * @returns {Promise<any>}
   */
  public editSnapshot(data : {ssId: string, ssName: string}) {
    let url = `${this._baseUrl}${data.ssId}`;
    return this.patch(url,{ssName : data.ssName});
  }

  /**
   * Get logical type (only create source)
   * @param {string} type
   * @return {LogicalType}
   * @private
   */
  public getConvertTypeToLogicalType(type: string): LogicalType {
    switch (type) {
      case 'STRING':
        return LogicalType.STRING;
      case 'INTEGER':
      case 'LONG':
        return LogicalType.INTEGER;
      case 'DOUBLE':
        return LogicalType.DOUBLE;
      case 'TIMESTAMP':
        return LogicalType.TIMESTAMP;
      case 'BOOLEAN':
        return LogicalType.BOOLEAN;
      case 'ARRAY':
        return LogicalType.ARRAY;
      case 'MAP':
        return LogicalType.MAP;
      default:
        return LogicalType.STRING;
    }
  }
}
