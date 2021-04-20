// /*
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
//
// import {Injectable, Injector} from '@angular/core';
// import {AbstractService} from '@common/service/abstract.service';
// import {Page} from '@domain/common/page';
// import {CommonUtil} from '@common/util/common.util';
//
// @Injectable()
// export class ModelApprovalService extends AbstractService {
//
//   constructor(protected injector: Injector) {
//     super(injector);
//   }
//
//
//   // Model List를 불러온다
//   public searchModels(params: any, page: Page): Promise<any> {
//     // public searchModels(name: string, user: string, begindate: any, enddate: any, status: string, subscribe: string, page: Page): Promise<any> {
//     let url = this.API_URL + `nbmodels/search?projection=forListView`;
//
//     url += '&' + CommonUtil.objectToUrlString(params);
//     url += '&' + CommonUtil.objectToUrlString(page);
//
//     return this.get(url);
//   }
//
//   // Approval Model List 에서 삭제
//   public deleteModels(modelIds: string) {
//     return this.delete(this.API_URL + 'nbmodels/batch/' + modelIds);
//   }
//
//   // Model 한개 detail
//   public getModelApprovalDetail(modelId: string, _projection: string = 'forDetailView') {
//     return this.get(this.API_URL + `nbmodels/${modelId}`);
//   }
//
//   /**
//    * 상세 조회
//    * @param {string} id
//    * @param {Page} _page
//    * @param {string} projection
//    * @param {Object} _options
//    * @returns {Promise<any>}
//    */
//   public getModelDetail(id: string, _page: Page, projection: string = 'forDetailView', _options?: object): Promise<any> {
//     const url = this.API_URL + `nbmodels/` + id + `&projection=${projection}`;
//     return this.get(url);
//   }
//
//   /**
//    * 결재 승인 / 반려 / 대기 => APPROVAL or REJECT or PENDING
//    * @param {string} id
//    * @param status
//    * @returns {Promise<any>}
//    */
//   public updateModel(id: string, status): Promise<any> {
//     const params = {
//       statusType: status
//     };
//     return this.patch(this.API_URL + `nbmodels/` + id, params);
//   }
//
//   // 테스트 코드 돌리기.
//   public runTest(id: string): Promise<any> {
//     return this.get(this.API_URL + `nbmodels/subscribe/` + id);
//   }
//
//   // 테스트 코드 이력 가져오기
//   public getRunTestHistory(id: string, projection: string = 'forHistoryListView') {
//     return this.get(this.API_URL + `nbmodels/${id}?projection=${projection}`);
//   }
// }
