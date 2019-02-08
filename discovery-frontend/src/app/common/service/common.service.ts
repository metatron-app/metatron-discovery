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
import { HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import {saveAs} from 'file-saver';
import {Extension} from "../domain/extension";
import {CookieConstant} from "../constant/cookie.constant";
import {AbstractService} from "./abstract.service";

@Injectable()
export class CommonService extends AbstractService {

  public static extensions: Extension[] = [];

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * get extension Info
   * @param {string} type
   * @return {Promise<any>}
   */
  public getExtensions(type: string): Promise<any> {
    return this.get(this.API_URL + `extensions/${type}`).then(items => {
      (items && 0 < items.length) && (CommonService.extensions = items);
      return items;
    });
  } // function - getExtensions

  /**
   * 메뉴얼 다운로드
   * @param {string} lang
   */
  public downloadManual(lang: string) {

    const headers = new HttpHeaders({
      'Accept': 'application/pdf,*/*;',
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });
    this.http.get(this.API_URL + `common/manual/download?lang=${lang}`,
      {headers: headers, responseType: 'blob'})
      .toPromise()
      .then((result) => saveAs(result, 'metatronDiscovery.user.manual.pdf'));

  } // function - downloadManual
}
