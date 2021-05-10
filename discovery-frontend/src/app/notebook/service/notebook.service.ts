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
import {CommonUtil} from '@common/util/common.util';
import {AbstractService} from '@common/service/abstract.service';
import {NoteBook} from '@domain/notebook/notebook';
import {NotebookModel} from '@domain/model-management/notebookModel';

@Injectable()
export class NotebookService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }


  // 노트북 생성
  public createNotebook(notebook: NoteBook) {
    return this.post(this.API_URL + 'notebooks', notebook);
  }

  // 노트북 삭제
  public deleteNotebook(notebookId: string) {
    return this.delete(this.API_URL + 'notebooks/' + notebookId);
  }

  // 노트북 상세 조회
  public getNotebook(notebookId: string, projection: string = 'forDetailView') {
    const url = this.API_URL + 'notebooks/' + notebookId;
    return this.get(url + '?projection=' + projection);
  }

  // 노트북 수정
  public updateNotebook(notebookId: string, notebook: NoteBook) {
    return this.patch(this.API_URL + 'notebooks/' + notebookId, notebook);
  }

  // 노트북에 등록한 데이터 소스 조회
  public getNotebookDatasource(workspaceId: string, param: any, projection: string = 'forListInWorkspaceView'): Promise<any[]> {
    let url = this.API_URL + `workspaces/` + workspaceId + `/datasources`;

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + '&projection=' + projection);
  }

  // 대시보드 리스트
  public getNotebookDashboard(workspaceId: string, bookId: string, projection: string = 'forTreeView') {
    const url = this.API_URL + `workspaces/${workspaceId}/books/${bookId}?bookType=workbook`;
    return this.get(url + '&projection=' + projection);
  }

  // 대시보드 클릭시 나오는 -> 차트 (page)
  public getNotebookChart(dashboardId: string, projection: string = 'forTreeView') {
    const url = this.API_URL + `dashboards/` + dashboardId + `/widgets?widgetType=page`;
    return this.get(url + '&projection=' + projection);
  }

  // 차트 디테일 뷰
  public getChartDetail(widgetId: string, projection: string = 'forDetailView') {
    const url = this.API_URL + `widgets/` + widgetId;
    return this.get(url + '?projection=' + projection);
  }

  // 노트북 모델 요청
  public setNotebookModelRequest(notebookModel: NotebookModel, workspaceId: string, notebookId: string) {
    const params = {
      name: notebookModel.name,
      description: notebookModel.description,
      subscribeType: notebookModel.subscribeType,
      workspace: '/api/workspaces/' + workspaceId,
      notebook: '/api/notebooks/' + notebookId
    };

    return this.post(this.API_URL + `nbmodels`, params);
  }

  // 노트북에 등록된 connector 리스트
  public getNotebookConnectionList() {
    return this.get(this.API_URL + `connectors?projection=default`);
  }

  // 워크스페이스에 등록된 서버 목록 조회
  public getNotebookServers(workspaceId: string) {
    return this.get(this.API_URL + `workspaces/${workspaceId}/connectors`);
  }

  // 노트북 API 생성
  public createNotebookApi(notebookId: string, params) {
    return this.post(this.API_URL + `notebooks/rest/${notebookId}`, params);
  }

  // 노트북 API 상세 정보 조회
  public getNotebookApi(notebookId: string) {
    return this.get(this.API_URL + `notebooks/${notebookId}?projection=forAPIView`);
  }

  // 노트북 API 수정
  public modifyNotebookApi(notebookId: string, params) {
    return this.patch(this.API_URL + `notebooks/rest/${notebookId}`, params);
  }

  // 노트북 API 삭제
  public deleteNotebookApi(notebookId: string) {
    return this.delete(this.API_URL + `notebooks/rest/${notebookId}`);
  }

  // 노트북 실행
  public runNotebookApi(param: any) {
    console.log('param', param);
    if (param.returnType.toString() === 'HTML') {
      return this.getHTML(param.url);
    } else if (param.returnType.toString() === 'JSON') {
      return this.get(param.url);
    } else if (param.returnType.toString() === 'Void') {
      return this.get(param.url);
    }
  }
}
