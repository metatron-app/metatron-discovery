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
import 'rxjs/add/operator/toPromise';
import {Workspace, Workspaces} from '../../domain/workspace/workspace';
import {BookTree} from '../../domain/workspace/book';
import {CommonUtil} from '../../common/util/common.util';
import {Page} from '../../domain/common/page';
import {SYSTEM_PERMISSION} from '../../common/permission/permission';
import {PermissionService} from '../../user/service/permission.service';
import {RoleSet} from '../../domain/user/role/roleSet';
import {saveAs} from 'file-saver';
import {CookieConstant} from '../../common/constant/cookie.constant';
import {Headers, ResponseContentType} from '@angular/http';
import {Extension} from "../domain/extension";

@Injectable()
export class CommonService extends AbstractService {

  public static extensions: Extension[] = [];

  public static isEnableStageDB: boolean;

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * get extension Info
   * @param {string} type
   * @param {boolean} isOverwriteGlobal
   * @return {Promise<any>}
   */
  public getExtensions(type: string, isOverwriteGlobal: boolean = false): Promise<any> {
    return this.get(this.API_URL + `extensions/${type}`).then(items => {
      (items && 0 < items.length && isOverwriteGlobal) && (CommonService.extensions = items);
      // if type stagedb, set enableStageDbFlag
      type === 'stagedb' && (CommonService.isEnableStageDB = items ? true : false);
      return items;
    });
  } // function - getExtensions

  /**
   * 메뉴얼 다운로드
   * @param {string} lang
   */
  public downloadManual(lang: string) {

    const headers = new Headers({
      'Accept': 'application/pdf,*/*;',
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });
    this.http.get(this.API_URL + `common/manual/download?lang=${lang}`,
      {headers: headers, responseType: ResponseContentType.Blob})
      .toPromise()
      .then((result) => saveAs(result.blob(), 'metatronDiscovery.user.manual.pdf'));

  } // function - downloadManual
}
