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
import { PrDataflow, Dataflows } from '../../../domain/data-preparation/pr-dataflow';
import { PrDataset, Datasets } from '../../../domain/data-preparation/pr-dataset';
import { PrDataSnapshot } from '../../../domain/data-preparation/pr-snapshot';
import { Page } from '../../../domain/common/page';
import { CommonUtil } from '../../../common/util/common.util';
import { StringUtil } from '../../../common/util/string.util';
import { Loading } from '../../../common/util/loading.util';
import { isNullOrUndefined, isUndefined } from 'util';
import { PreparationAlert } from '../../util/preparation-alert.util';
import { PopupService } from '../../../common/service/popup.service';
import { TranslateService } from '@ngx-translate/core';
import {SnapShotCreateDomain} from "../../component/create-snapshot-popup.component";

@Injectable()
export class DataflowService extends AbstractService {

  constructor(protected injector: Injector,
              private popupService: PopupService,
              public translateService: TranslateService
  ) {
    super(injector);
  }

  // 데이터 플로우 목록 조회
  public getDataflows(searchText: string, page: Page, projection: string): Promise<Dataflows> {
    let url = this.API_URL + `preparationdataflows/search/findByDfNameContaining?dfName=${encodeURIComponent(searchText)}&project=${projection}`;

    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  public getDataflowList(param) {
    let url = this.API_URL + `preparationdataflows/search/findByDfNameContaining?`;
    url += CommonUtil.objectToUrlString(param);
    return this.get(url);

  }

  // 데이터 플로우 상세조회
  public getDataflow(dfId: string): Promise<PrDataflow> {
    const url = this.API_URL + 'preparationdataflows/' + dfId + '?projection=detail';
    return this.get(url);
  }

  // 업스트림 조회
  public getUpstreams(dfId: string, isUpdate?: boolean): Promise<any> {
    let url = this.API_URL + 'preparationdataflows/' + dfId + '/upstreammap';
    if (isUpdate) {
      url += '?forUpdate=' + isUpdate;
    }
    return this.get(url);
  }

  // 데이터셋 목록 조회
  public getDatasets(searchText: string, page: Page, projection?: string, dsType: string = '', importType: string = ''): Promise<Datasets> {

    let url = this.API_URL + `preparationdatasets/search/`;

    if (StringUtil.isNotEmpty(dsType)) {
      url += `findByDsNameContainingAndDsType?dsType=${dsType}`;

    } else {
      url += 'findByDsNameContaining?';
    }

    url += `&dsName=${encodeURIComponent(searchText)}`;
    //url += `&projection=${projection}`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 데이터셋 상세 조회
  //public getDataset(dsId: string): Promise<Dataset> {
  public getDataset(dsId: string): Promise<PrDataset> {
    //const url = this.API_URL + 'preparationdatasets/' + dsId + '?projection=detail';
    const url = this.API_URL + 'preparationdatasets/' + dsId + '?preview=true';
    return this.get(url);
  }

  // 데이터 플로우 생성
  //public createDataflow(dataflow: Dataflow) {
  public createDataflow(dataflow: PrDataflow) {
    let popupService = this.popupService;
    return this.post(this.API_URL + 'preparationdataflows', dataflow)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 삭제
  public deleteDataflow(dfId: string) {
    let popupService = this.popupService;
    return this.delete(this.API_URL + 'preparationdataflows/' + dfId)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 수정
  //public updateDataflow(dataflow: any): Promise<Dataflow> {
  public updateDataflow(dataflow: any): Promise<PrDataflow> {
    let popupService = this.popupService;
    return this.patch(this.API_URL + 'preparationdataflows/' + dataflow.dfId, dataflow)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 플로우 룰생성
  public createWrangledDataset(datasetId: string, dataflowId: string): Promise<any> {
    let popupService = this.popupService;
    const params = { dfId: dataflowId };
    return this.post(this.API_URL + `preparationdatasets/${datasetId}/transform`, params)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // transform action GET or PUT
  public transformAction(id: string, method: string, params : any ): Promise<any> {
    if (method === 'put') {
      return this.put(this.API_URL + `preparationdatasets/${id}/transform`, params)

    } else {
      let url = this.API_URL + `preparationdatasets/${id}/transform`;
      const param: string[] = [];
      if (isNullOrUndefined(params.ruleIdx)) {
        (param.push(`ruleIdx=`));
      } else {
        (param.push(`ruleIdx=${params.ruleIdx}`));
      }
      (isNullOrUndefined(params.offset)) || (param.push(`offset=${params.offset}`));
      (isNullOrUndefined(params.count)) || (param.push(`count=${params.count}`));
      (0 < param.length) && (url = url + '?' + param.join('&'));

      return this.get(url);
    }

  } // function - transformAction


  // Wrangled 데이터셋 조회 (조인과 유니온에서 사용)
  public getDatasetWrangledData(datasetId: string, count?: number, pageNum?: number, ruleIdx?: number): Promise<any> {

    // TODO : temp value
    count = 1000;
    pageNum = 0;

    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;

    const params: string[] = [];
    (params.push(`ruleIdx=`));
    (isNullOrUndefined(pageNum)) || (params.push(`offset=${pageNum}`));
    (isNullOrUndefined(count)) || (params.push(`count=${count}`));
    (0 < params.length) && (url = url + '?' + params.join('&'));

    return this.get(url);
  }

  // 데이터셋 추가
  public updateDataSets(dataflowId: string, dsIds: any): Promise<any> {
    return this.put(this.API_URL + `preparationdataflows/${dataflowId}/update_datasets`, dsIds);
  }


  // fileUri등 설정 정보
  public getConfiguration(datasetId: string): Promise<any> {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform/configuration`)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 데이터 스냅샷 생성
  public createDataSnapshot(datasetId: string, datasnapshot: SnapShotCreateDomain): Promise<any> {
    let popupService = this.popupService;
    return this.post(this.API_URL + `preparationdatasets/${datasetId}/transform/snapshot`, datasnapshot)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // 룰 적용
  public applyRules(datasetId: string, param: any): Promise<any> {
    let popupService = this.popupService;
    param['count'] = 100;
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform`, param)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  /* searchText 제거
  public getSearchCountDataSets(datasetId: string, searchWord: string, count: number) {
    let popupService = this.popupService;
    return this.get(this.API_URL + `preparationdatasets/${datasetId}/transform?searchWord=` + encodeURIComponent(searchWord) + '&targetLines=' + count)
  */
  public getSearchCountDataSets(datasetId: string, ruleIdx?: number, pageNum?: number, count?: number) {
    let popupService = this.popupService;
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;

    const params: string[] = [];

    if (isNullOrUndefined(ruleIdx)) {
      (params.push(`ruleIdx=`));
    } else {
      (params.push(`ruleIdx=${ruleIdx}`));
    }
    (isNullOrUndefined(pageNum)) || (params.push(`offset=${pageNum}`));
    (isNullOrUndefined(count)) || (params.push(`count=${count}`));
    (0 < params.length) && (url = url + '?' + params.join('&'));

    return this.get(url)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  // when editing, getting previous data
  public fetchPreviousData(datasetId: string, op: any): Promise<any> {
    let popupService = this.popupService;
    return this.put(this.API_URL + `preparationdatasets/${datasetId}/transform`, op)
      .catch((error) => {
        if (true !== isUndefined(error.code) && error.code === 'PR5102') {
          Loading.hide();
          PreparationAlert.success(this.translateService.instant(error.details));
          popupService.notiPopup({ name: 'update-dataflow', data: null });
          return Promise.reject(null);
        }
        throw error;
      });
  }

  public deleteChainDataflow(dfId: string, dsId: string) {
    return this.delete(this.API_URL + 'preparationdataflows/delete_chain/' + dfId + '/' + dsId);
  }

  /**
   * Clone dataSet
   * @param {string} dsId
   * @return {Promise<any>}
   */
  public cloneWrangledDataset(dsId: string): Promise<any> {
    let params = {};
    return this.post(this.API_URL + `preparationdatasets/${dsId}/clone`, params);
  }



  public autoComplete(ruleString: string, ruleCommand: string, rulePart: string): Promise<any> {
    let params = {
      'ruleString': ruleString,
      'ruleCommand': ruleCommand,
      'rulePart': rulePart
    };
    return this.post(this.API_URL + `preparationdatasets/autocomplete`, params);
  }


  /**
   * Validate expression from advanced input popup
   * @param exprString
   */
  public validateExpr(exprString: string): Promise<any> {
    return this.post(this.API_URL + `preparationdatasets/validate_expr`, exprString);
  }


  /**
   * 각 컬럼별 히스토그램 정보 조회
   * @param {string} dsId
   * @param {any} params
   * {
   *    ruleIdx      : 몇 번째 ruleIdx에 해당하는 histogram을 얻을 것인지
   *    colnos[]     : histogram을 얻으려는 column number array
   *    colWidths[]  : 위의 각 column의 확정된 column 폭
   * }
   * @returns {Promise<any>}
   */
  public getHistogramInfo(dsId: string, params: any): Promise<any> {
    return this.post(this.API_URL + `preparationdatasets/${dsId}/transform/histogram`, params)
  }


  /**
   * 타임스탬프 format 중 가장 유사한 format을 추천해주는 리스트
   * @param {string} datasetId
   * @param colNames
   * @return {Promise<any>}
   */
  public getTimestampFormatSuggestions(datasetId : string, colNames : any ) : Promise<any> {
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform/timestampFormat`;
    return this.post(url,colNames);
  }


  /**
   * 룰 편집 화면에서 스냅샷 탭 목록 불러오기
   * @return {Promise<any>}
   */
  public getWorkList(params): Promise<any> {
    let url = this.API_URL + 'preparationsnapshots/' + params.dsId + '/work_list';
    return this.get(url);
  }


  /**
   * Fetch function list used in Advanced Function popup
   * @returns {Promise<any>}
   */
  public getFunctionList(): Promise<any> {
    let url = this.API_URL + `preparationdatasets/function_list`;
    return this.get(url);
  }


  public swapDataset(param : any): Promise<any> {
    let url = this.API_URL + `preparationdataflows/${param.dfId}/swap_upstream`;
    delete param.dfId;
    return this.post(url, param);
  }

}
