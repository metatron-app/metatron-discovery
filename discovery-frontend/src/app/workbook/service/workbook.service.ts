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

/**
 * Created by LDL on 2017. 6. 16..
 */

import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '../../common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import { Book } from '../../domain/workspace/book';
import { Workbook, WorkbookDetailProjections } from '../../domain/workbook/workbook';
import { CommonUtil } from '../../common/util/common.util';
import { Page } from '../../domain/common/page';
import { Comment } from '../../domain/comment/comment';

@Injectable()
export class WorkbookService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  // 워크북 생성
  public createWorkbook(book: Book): Promise<any> {
    return this.post(this.API_URL + 'books', book);
  }

  public createWorkbook2(params: {workspace: string, name: string, type: 'workbook' | 'folder', description?: string, folderId?: string}) {
    return this.post(this.API_URL + 'books', params);
  }

  // 워크북 수정
  public updateBook(book: Book): Promise<Workbook> {

    const param = new Book();
    param.name = book.name;
    param.description = book.description;
    return this.patch(this.API_URL + 'books/' + book.id, param);
  }

  // 워크북 삭제
  public deleteWorkbook(id: string): Promise<Workbook> {

    return this.delete(this.API_URL + 'books/' + id);
  }

  // 워크북 조회
  public getWorkbook(id: string, projection: string = 'forDetailView'): Promise<WorkbookDetailProjections> {
    return this.get(this.API_URL + `workbooks/${id}?projection=${projection}`);
  }

  // 해당 워크북의 대시보드 리스트
  public getDashboards(id: string, order: any, page: Page, projection: string = 'default', options?: any): Promise<any> {
    let url = this.API_URL + `workbooks/${id}/dashboards?projection=${projection}`;

    // 사용자 타입제외하고 페이지 추가

    page.sort = order.key + ',' + order.type;
    url += '&' + CommonUtil.objectToUrlString(page);

    if (options) {
      url += '&' + CommonUtil.objectToUrlString(options);
    }

    return this.get(url);
  }

  // 워크북 복사
  public copyWorkbook(copyId: string, folderId?:string, options?: any): Promise<any>  {
    let url = this.API_URL + 'books/' + copyId + '/copy';
    ( folderId ) && ( url += '/' + folderId );
    (options) && ( url += '?' + CommonUtil.objectToUrlString(options) );
    return this.post(url, null);
  } // function - copyWorkbook

  // 워크북 이동
  public moveWorkbook(copyId: string, folderId?:string, options?: any): Promise<any>  {
    let url = this.API_URL + 'books/' + copyId + '/move';
    ( folderId ) && ( url += '/' + folderId );
    (options) && ( url += '?' + CommonUtil.objectToUrlString(options) );
    return this.post(url, null);
  } // function - moveWorkbook

  // 대시보드 목록 이동
  public setDashboardSort(workbookId: string, param: any) {
    return this.patch(this.API_URL + 'workbooks/' + workbookId + '/dashboards', param);
  }

  // 댓글 조회
  public getComments(id: string, page: Page): Promise<any> {

    let url = this.API_URL + `workbooks/${id}/comments?projection=default`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 댓글 추가
  public createComment(comment: Comment, id: string): Promise<any> {
    return this.post(this.API_URL + 'workbooks/' + id + '/comments', comment);
  }

  // 댓글 수정
  public updateComment(comment: Comment, workbookId: string): Promise<any> {

    const param = new Comment();
    param.contents = comment.modifyContents;

    return this.patch(this.API_URL + 'workbooks/' + workbookId + '/comments/' + comment.id, param);
  }

  // 댓글 삭제
  public deleteComment(workbookId: string, commentId: string): Promise<any> {
    return this.delete(this.API_URL + 'workbooks/' + workbookId + '/comments/' + commentId);
  }
}
