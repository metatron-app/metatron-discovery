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
import { Datasets } from '../../../domain/data-preparation/pr-dataset';
import { CommonUtil } from '../../../common/util/common.util';
import {Observable} from "rxjs/Rx";
import {CookieConstant} from "../../../common/constant/cookie.constant";
import {HttpHeaders} from "@angular/common/http";
import * as _ from 'lodash';

@Injectable()
export class DatasetService extends AbstractService {

  // 데이터플로우에서 데이터셋 생성으로 넘어왔을 경우, 생성 완료 후 다시 데이터플로우도 이동을 위해 필요
  public dataflowId : string;

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * Get dataset list
   * @param {any} param {searchText, dsType, sort, refDfCountSort}
   * @returns {Promise<any>}
   */
  public getDatasets(param): Promise<Datasets> {

    const clonedParam = _.cloneDeep(param);

    let sort = [];
    let sortStr = '';
    if (clonedParam.sort) {
      sort = clonedParam.sort.split(',');
      if (sort[0] === 'refDfCount') {
        if (sort[1] === 'asc') {
          sortStr = 'Asc';
        } else {
          sortStr = 'Desc';
        }
      }
    }

    let url = this.API_URL + `preparationdatasets/search/`;

    let dsType = '';
    if (clonedParam.dsType.indexOf(',') === -1) {
      dsType = clonedParam.dsType;
    }

    if (dsType !== '') {

      if (sort[0] === 'refDfCount') {
        url += `findByDsNameContainingAndDsTypeOrderByRefDfCount${sortStr}?dsType=${clonedParam.dsType}&`;
      } else {
        url += `findByDsNameContainingAndDsType?dsType=${clonedParam.dsType}&`;
      }

    } else {
      if (sort[0] === 'refDfCount') {
        url += `findByDsNameContainingOrderByRefDfCount${sortStr}?`;
      } else {
        url += `findByDsNameContaining?`;
      }
    }

    delete clonedParam.dsType;

    url += `${CommonUtil.objectToUrlString(clonedParam)}`;

    return this.get(url);

  }

  /**
   * Fetch grid data according to file type (csv, excel)
   * @param param {storedUri :string, fileType : string, delimiter? : string}
   * @returns {Promise<any>}
   */
  public getFileGridInfo(param : {storedUri :string, delimiter? : string, manualColumnCount? : number}) {

    let url = this.API_URL + 'preparationdatasets/file_grid?storedUri=' + encodeURI(param.storedUri);

    if (param.delimiter) {
      url += `&delimiterCol=${encodeURI(param.delimiter)}`;
    }
    if (param.manualColumnCount){
      url += `&manualColumnCount=${param.manualColumnCount}`;
    }

    return this.get(url);

  }


  /**
   * Fetch dataset information (preview=true gets grid)
   * @param {string} dsId
   * @returns {Promise<any>}
   */
  public getDatasetDetail(dsId: string) {
    return this.get(`${this.API_URL}preparationdatasets/${dsId}?preview=true`);
  }


  /**
   * Update dataset information
   * @param dataset
   * @returns {Promise<any>}
   */
  public updateDataset(dataset: {dsId: string, dsName: string, dsDesc : string}) {
    return this.patch(this.API_URL + 'preparationdatasets/' + dataset.dsId, dataset);
  }


  /**
   * Delete dataset (chain)
   * @param {string} dsId
   * @returns {Promise<any>}
   */
  public deleteChainDataset(dsId: string) {
    return this.delete(this.API_URL + 'preparationdatasets/delete_chain/' + dsId);
  }


  /**
   * Delete dataset
   * @param {string} dsId
   * @returns {Promise<any>}
   */
  public deleteDataset(dsId: string) {
    return this.delete(this.API_URL + 'preparationdatasets/' + dsId);
  }


  public getStagingTableData(schema:string, table:string) {

    const query = 'select * from '+ table;

    const path = '/preparationdatasets/staging?sql=' + encodeURIComponent(query) + '&dbname='+schema+'&tblname =' + table + '&size=50';

    return this.get(this.API_URL + path);
  } // function - getStagingTableData


  public getResultWithStagingDBQuery(query: string, dbName: string) {

    const path = '/preparationdatasets/staging?sql=' + encodeURIComponent(query) + '&size=50&dbname=' + dbName;

    return this.get(this.API_URL + path);
  } // function - getResultWithStagingDBQuery


  /**
   * Create dataset
   * @param param
   * @returns {Promise<any>}
   */
  public createDataSet(param : any) : Promise<any>  {
    return this.post(this.API_URL + 'preparationdatasets', param);
  }

  /**
   * 1st step of 3-way negotiation for file uploading
   */
  public getFileUploadNegotiation() {
    let url = this.API_URL + 'preparationdatasets/file_upload';
    return this.get(url);
  }

  /**
   * Download Imported Dataset (only Upload Uri type)
   */
  public downloadDataset(dsId: string, fileFormat: string): Observable<any> {
    let mineType: string;
    if (fileFormat === 'csv') {
      mineType = 'application/csv';
    } else if (fileFormat === 'json') {
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

    return this.http.get(this.API_URL + `preparationdatasets/${dsId}/download?fileType=`+fileFormat, option)
      .map((res) => {
        return new Blob([res], {type: mineType})
      });
  }

  public makeLineage(params: any) {
    return this.post(this.API_URL + `metadatas/lineages/map`, params);
  }
}
