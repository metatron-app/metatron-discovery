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
import { Page } from '../../../domain/common/page';
import { CommonUtil } from '../../../common/util/common.util';
import { NoteBook } from '../../../domain/notebook/notebook';

@Injectable()
export class NotebookServerService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }


  /**
   * 이름 and type 검색.
   * @param {string} searchName
   * @param {string} type
   * @param {Page} page
   * @param {string} projection
   * @param {Object} options
   * @returns {Promise<any>}
   */
  public getNotebookServerTypeList(searchName: string, type: string, page: Page, projection: string = 'default', options?: Object): Promise<any> {
    let url = this.API_URL + `connectors/search/nametype?name=` + encodeURIComponent(searchName) + `&type=` + type + `&projection=${projection}`;

    url += '&' + CommonUtil.objectToUrlString(page);

    if (options) {
      url += '&' + CommonUtil.objectToUrlString(options);
    }

    return this.get(url);
  }


  /**
   * 노트북 리스트 API
   * @param isAll
   * @param params
   */
  public getNotebookList(isAll: boolean, params: any) {
    let url = this.API_URL + `connectors/search/` + (isAll? 'name' : 'nametype');
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }


  /**
   * note connection 생성
   * @param {NoteBook} notebook
   * @returns {Promise<any>}
   */
  public createNotebookServer(notebook: NoteBook) {
    const params = {
      name: notebook.name,
      type: notebook.type,
      description: notebook.description,
      hostname: notebook.hostname,
      port: notebook.port
    };
    return this.post(this.API_URL + 'connectors', params);
  }

  /**
   * 노트북 Connection 상세
   * @param {string} connectionId
   * @returns {string}
   */
  public getNotebookServerDetail(connectionId: string) {
    return this.API_URL + 'connectors/' + connectionId;
  }

  /**
   * notebook connection 수정.
   * @param {NoteBook} notebook
   * @returns {Promise<any>}
   */
  public updateNotebookServer(notebook: NoteBook) {
    const params = {
      name: notebook.name,
      type: notebook.type,
      description: notebook.description,
      hostname: notebook.hostname,
      port: notebook.port
    };
    return this.patch(this.API_URL + 'connectors/' + notebook.id, params);
  }

  /**
   * notebook connection 삭제
   * @param {string} connectionId
   */
  public deleteNotebookServer(connectionId: string) {
    return this.delete(this.API_URL + 'connectors/' + connectionId);
  }

  /**
   * notebook connection 삭제
   * @param {string} connectionId
   */
  public deleteAllNotebookServer(connectionId: string) {
    return this.delete(this.API_URL + 'connectors/' + connectionId);
  }
}
