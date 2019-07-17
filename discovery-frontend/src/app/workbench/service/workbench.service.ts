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
import {AbstractService} from '../../common/service/abstract.service';
import {QueryEditor, Workbench} from '../../domain/workbench/workbench';
import {CommonUtil} from '../../common/util/common.util';
import {Page} from '../../domain/common/page';
import {isNullOrUndefined} from "util";

@Injectable()
export class WorkbenchService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크벤치
  public static workbench: Workbench;

  // 워크벤치 아이디
  public static workbenchId: string;

  // 웹소켓 아이디
  public static websocketId: string;
  // 웹소켓 로그인 아이디
  public static webSocketLoginId: string;
  // 웹소켓 로그인 패스워드
  public static webSocketLoginPw: string;

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

  /*****************************************
   *  워크 벤치 관련
   *****************************************/

  // 워크벤치 생성
  public createWorkbench(params: {name: string, dataConnection: string, workspace: string, type: 'workbench', folderId?: string, description?: string}): Promise<any> {
    return this.post(this.API_URL + 'workbenchs', params);
  }

  /**
   * 워크벤치 수정
   * @param params
   * id / name / description
   * @returns {Promise<any>}
   */
  public updateWorkbench(params: any): Promise<any> {
    return this.patch(this.API_URL + 'workbenchs/' + params.id, params);
  }

  // 워크벤치 삭제
  public deleteWorkbench(workbenchId: string): Promise<any> {
    return this.delete(this.API_URL + 'workbenchs/' + workbenchId);
  }

  // 워크벤치 조회
  public getWorkbench(id: string, projection: string = 'workbenchDetail'): Promise<Workbench> {

    const url = this.API_URL + `workbenchs/${id}?projection=${projection}`;
    return this.get(url);
  }

  // 생성자 기준으로 workbench 조회
  public getCreateByWorkbench(createdBy: string) {
    return this.get(this.API_URL + `workbenchs/search/findByCreatedBy?createdBy=${createdBy}`);
  }

  /*****************************************
   *  쿼리 관련 - 생성 / 수정 / 삭제
   *****************************************/

  // 쿼리 생성.
  public createQueryEditor(params: QueryEditor) {
    return this.post(this.API_URL + 'queryeditors', params);
  }

  // 쿼리 수정
  public updateQueryEditor(params: QueryEditor) {
    return this.patch(this.API_URL + `queryeditors/${params.editorId}`, params);
  }

  // 쿼리 삭제
  public deleteQueryEditor(deleteId: string) {
    return this.delete(this.API_URL + `queryeditors/${deleteId}`);
  }

  // 쿼리 가져오기
  public getQueryEditor(editorId: string) {
    return this.get(this.API_URL + `queryeditors/${editorId}?projection=default`);
  }

  // 쿼리 히스토리 가져오기
  public getQueryHistories(queryEditorId: string, queryPattern: string, projection: string = 'forListView', page: Page) {
    // &sort=queryHistoryId,desc
    let url = this.API_URL + `queryhistories/list?queryEditorId=${queryEditorId}&queryPattern=${queryPattern}&projection=${projection}`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 쿼리 삭제.
  public deleteQueryHistory(queryId: string) {
    // &sort=queryHistoryId,desc
    return this.delete(this.API_URL + `queryhistories/${queryId}`);
  }

  // 에디터 쿼리 히스토리 삭제.
  public deleteQueryHistoryAll(editorId: string) {
    return this.delete(this.API_URL + `queryhistories/deleteAll?queryEditorId=${editorId}`);
  }

  // 쿼리 navigateion
  public getQueryNavigation(workbenchId: string, page: Page) {
    let url = this.API_URL + `workbenchs/${workbenchId}/navigation?projection=workbenchNavigation`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  /*****************************************
   *  쿼리 관련 - 실행
   *****************************************/

  // 쿼리 실행
  public runSingleQueryWithInvalidQuery(params: QueryEditor, additional: any) {
    const id = params.editorId;
    const param = {
      query: params.query,
      webSocketId: params.webSocketId,
      runIndex: additional.runIndex
    };

    if(additional.retryQueryResultOrder) {
      param['retryQueryResultOrder'] = additional.retryQueryResultOrder;
    }

    return this.post(this.API_URL + `queryeditors/${id}/query/run`, param); // params => query  값만 사용.
  }

  // 쿼리 실행 => websocket
  public runSingleQueryWithInvalidQueryEditorId(params: QueryEditor) {
    const id = params.editorId;
    return this.post(this.API_URL + `queryeditors/${id}/query/run`, params); // params => query / webSocketId
  }

  public getCSVDownLoad(queryEditorId: string, params: any) {
    return this.postBinary(this.API_URL + `queryeditors/${queryEditorId}/query/download`, params);
  }

  // 쿼리 취소
  public setQueryRunCancel(queryEditorId: string, params: any) {
    return this.post(this.API_URL + `queryeditors/${queryEditorId}/query/cancel`, params); // params => query / webSocketId
  }

  public checkConnectionStatus(queryEditorId: string, socketId: string)  {
    const param = {
      webSocketId : socketId
    };
    return this.post(this.API_URL + `queryeditors/${queryEditorId}/status`, param);
  }

  // 쿼리 결과 조회 (페이징 사용)
  public runQueryResult(editorId: String, csvFilePath : string, pageSize : number, pageNumber : number, fieldList : any) {
    const id = editorId;
    const param = {
      csvFilePath : csvFilePath,
      pageSize    : pageSize,
      pageNumber  : pageNumber,
      fieldList   : fieldList
    };
    return this.post(this.API_URL + `queryeditors/${id}/query/result`, param);
  }

  // 스키마 정보 데이터 조회
  public getSchemaInfoTableData(table:string, connection:any) {
    const params:any = {};

    let connInfo: any = {};
    connInfo.implementor = connection.implementor;
    connInfo.hostname = connection.hostname;
    connInfo.port = connection.port;
    // connection 정보가 USERINFO 일 경우 제외
    if( connInfo.authenticationType != 'USERINFO' ) {
      connInfo.username = connection.username;
      connInfo.password = connection.password;
    }
    // TODO #1573 추후 extensions 스펙에 맞게 변경 필요
    connInfo.authenticationType = connection.authenticationType;
    connInfo.database = connection.connectionDatabase;
    connInfo.implementor = connection.implementor;
    connInfo.name = connection.name;
    connInfo.type = connection.type;
    connInfo.catalog = connection.catalog;
    connInfo.sid = connection.sid;
    connInfo.table = table;
    connInfo.url = connection.url;

    // properties 속성이 존재 할경우
    if( !isNullOrUndefined(connection.properties) ){
      connInfo.properties = connection.properties;
    }

    params.connection = connInfo;
    params.database = connection.database;
    params.type = 'TABLE';
    params.query = table;

    return this.post(this.API_URL + 'connections/query/data', params);
  }

  public importFile(workbenchId: string, params: any) {
    return this.post(this.API_URL + `workbenchs/${workbenchId}/import`, params);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
