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
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonConstant} from '../constant/common.constant';
import 'rxjs/add/operator/toPromise';
import {User} from '../../domain/user/user';
import {CookieService} from 'ng2-cookies';
import {CookieConstant} from '../constant/cookie.constant';
import {NavigationExtras, Router} from '@angular/router';
import 'rxjs/add/operator/timeout';
import {CommonUtil} from '../util/common.util';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";
import {catchError} from "rxjs/internal/operators";


/*
* AbstractService
*/
@Injectable()
export class AbstractService {

  // HTTP Module
  protected http: HttpClient;

  // API URL Prefix
  protected API_URL: string = CommonConstant.API_CONSTANT.API_URL;

  // API URL Prefix
  protected INTEGRATOR_URL: string = CommonConstant.API_CONSTANT.API_INTEGRATOR_URL;

  // OAUTH URL URL Prefix
  protected OAUTH_URL: string = CommonConstant.API_CONSTANT.OAUTH_URL;

  // API TIMEOUT 시간
  private TIMEOUT: number = CommonConstant.API_CONSTANT.TIMEOUT;

  // Cookie 서비스
  protected cookieService: CookieService;

  protected router: Router;




  // 생성자
  constructor(protected injector: Injector) {
    this.http = injector.get(HttpClient);
    this.cookieService = injector.get(CookieService);
    this.router = injector.get(Router);
  }


  /*
  * Token 생성
  */
  protected getToken(user: User): Promise<any> {

    // this
    const scope: any = this;

    // URL
    const url = this.OAUTH_URL + 'token';

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic cG9sYXJpc19jbGllbnQ6cG9sYXJpcw==',
    });

    // 호출
    return this.http.post(
      url, 'grant_type=password&scope=write&username=' + user.username + '&password=' + user.password,
      { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error));
  }


  /*
   * Token 갱신
   * accessUrl API요청 URL
   */
  protected refreshToken(): Promise<any> {

    // this
    const scope: any = this;

    // URL
    const url = this.OAUTH_URL + 'token?grant_type=refresh_token&refresh_token='
      + this.cookieService.get(CookieConstant.KEY.REFRESH_LOGIN_TOKEN);

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic cG9sYXJpc19jbGllbnQ6cG9sYXJpcw==',
    });

    // 호출
    return this.http.post(url, null, { headers })
      .toPromise()
      .catch(error => scope.tokenRefreshFail(scope, error));
  }


  // Get 방식
  protected get(url: string, timeout?): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    if (timeout) { // with timeout
      return this.http.get(url, { headers }).timeout(20000)
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.GET));

    } else {
      // 호출
      return this.http.get(url, { headers })
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.GET));
    }

  }

  /**
   * get multipart/form-data
   * @param {string} url
   * @param timeout
   * @returns {Promise<any>}
   */
  protected getFormData(url: string, timeout?): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    if (timeout) { // with timeout
      return this.http.get(url, { headers }).timeout(20000)
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.GET));

    } else {
      // 호출
      return this.http.get(url, { headers })
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.GET));
    }

  }

  // Get 방식
  protected getHTML(url: string): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'text/html',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    // 호출
    return this.http.get(url, { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error, httpMethod.GET));

  }

  // OAuth Token 미포 Get 방식
  protected getWithoutToken(url: string): Promise<any> {

    // this
    const scope: any = this;

    // 호출
    return this.http.get(url)
      .toPromise()
      .catch(error => scope.errorHandler(scope, error));
  }

  // Post 방식
  protected post(url: string, data: any): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    try {
      // 호출
      return this.http.post(url, JSON.stringify(data), { headers })
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.POST, data));
    } catch (err) {
      console.error( err );
      return Promise.reject(err);
    }

  }

  // Post Form 방식
  protected postWithForm(url: string, data: any): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    try {
      // 호출
      return this.http.post(url, data, { headers })
        .toPromise()
        .catch(error => scope.errorHandler(scope, error, httpMethod.POST, data));
    } catch (err) {
      console.error( err );
      return Promise.reject(err);
    }

  }

  // Post 바이너리
  protected postBinary2(url: string, data: any): void {
    const scope: any = this;
    // 헤더
    const headers = new HttpHeaders({
      Accept: 'application/octet-stream',
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),
    });
    this.http.post(url, JSON.stringify(data), { headers }).subscribe(
      (response) => {
        // console.info('response', response);
        // saveAs(new Blob([response['_body']], { type: 'application/csv' }), data.fileName + '.csv');

      }
    );
  }

  // Post 방식
  protected postBinary(url: string, data: any): Promise<any> {
    // this
    const scope: any = this;
    // 헤더
    const headers = new HttpHeaders({
      Accept: 'application/octet-stream',
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),
    });

    // 호출
    return this.http.post(url, data, { headers })
      .toPromise()
      .then(response => scope.resultDownHandler(scope, response))
      .catch(error => scope.errorHandler(scope, error, httpMethod.POST, data));
  }

  // subscribe post
  protected postObservable(url: string, data: any): Observable<Object> {
    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
      + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    // 호출
    return this.http.post(url, data, { headers }).pipe(
      map(
        (response) => {
            return response;
        }
      ),catchError(error => scope.errorHandler(scope, error, httpMethod.POST, data))
    );
  }

  // Un

  // Patch 방식
  protected patch(url: string, data: any, contentType: string = 'application/json'): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': contentType,
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    // body
    const body = contentType === 'text/uri-list' ? data : JSON.stringify(data);

    // 호출
    return this.http.patch(url, body, { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error, httpMethod.POST, data));
  }


  // OAuth Token 미포 Post 방식
  protected postWithoutToken(url: string, data: any): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // 호출
    return this.http.post(url, JSON.stringify(data), { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error));
  }

  // Put 방식
  protected put(url: string, data: any, contentType?: string): Promise<any> {

    // this
    const scope: any = this;

    let type = 'application/json';
    if (contentType) {
      type = contentType;
    }
    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': type,
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    const params = type === 'application/json' ? JSON.stringify(data) : data;

    // 호출
    return this.http.put(url, params, { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error, httpMethod.PUT, data));

  }

  // OAuth Token 미포 Put 방식
  protected putWithoutToken(url: string, data: any): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // 호출
    return this.http.put(url, JSON.stringify(data), { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error));
  }

  // delete
  protected delete(url: string): Promise<any> {

    // this
    const scope: any = this;

    // 헤더
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

    });

    // 호출
    return this.http.delete(url, { headers })
      .toPromise()
      .catch(error => scope.errorHandler(scope, error, httpMethod.DELETE));

  }

  // OAuth Token 미포 Get 방식
  protected deleteWithoutToken(url: string): Promise<any> {

    // this
    const scope: any = this;

    // 호출
    return this.http.delete(url)
      .toPromise()
      .catch(error => scope.errorHandler(scope, error));


  }

  protected resultDownHandler(scope: any, response: Response): Promise<any> {
    // TODO 결과에 따라서 오류 검증
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response['_body']);
    }
    // 에러 발생
    // throw new Error(response.json().message);
    throw new Error(response.statusText);
  }

  // error 핸들러
  protected errorHandler(scope: any, error: any, method: httpMethod, data: any): Promise<any> {

    let errorMessage: any;
    if (error.status && error.status !== 404) {
      try {
        errorMessage = ( error && error['error'] ) ? error['error'] : 'Server error';
      } catch (e) {
        errorMessage = 'Server error';
      }
    } else {
      error.name === 'TimeoutError' ? errorMessage = 'Timeout' : errorMessage = 'Server error';
    }

    const service = this;
    // Token 만료시 로직
    if (error.status === 401) {

      // 토큰이 만료된 경우 Refresh Token이 있으면 다시 인증
      const refreshToken = this.cookieService.get(CookieConstant.KEY.REFRESH_LOGIN_TOKEN);
      const userId: string = CommonUtil.getLoginUserId();
      if (refreshToken != null && userId != null && method != null) {
        return this.refreshToken().then((token) => {

          // 쿠키 저장
          service.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, token.access_token, 0, '/');
          service.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, token.token_type, 0, '/');
          service.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, token.refresh_token, 0, '/');

          // 헤더
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
              + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),
          });

          // 기존 API를 다시 호출
          // const resolve = Promise.resolve;
          if (method === httpMethod.GET) {
            this.http.get(error.url, { headers }).toPromise()
              .then(response => scope.reRequestResultHandle(scope, response))
              .catch(error => scope.reRequestErrorHandle(scope, error));
          } else if (method === httpMethod.POST) {
            this.http.post(error.url, data, { headers }).toPromise()
              .then(response => scope.reRequestResultHandle(scope, response))
              .catch(error => scope.reRequestErrorHandle(scope, error));
          } else if (method === httpMethod.PUT) {
            this.http.put(error.url, data, { headers }).toPromise()
              .then(response => scope.reRequestResultHandle(scope, response))
              .catch(error => scope.reRequestErrorHandle(scope, error));
          } else if (method === httpMethod.DELETE) {
            this.http.delete(error.url, { headers }).toPromise()
              .then(response => scope.reRequestResultHandle(scope, response))
              .catch(error => scope.reRequestErrorHandle(scope, error));
          }

        }).catch(() => {
          // 토큰 갱신시 에러가 발생하면
          this._logout(scope);
        });

        // return Promise.resolve()
      } else {
        // Refresh Token이 없으면 로그인 화면으로
        this._logout(scope);
      }
    } else {
      return Promise.reject(errorMessage);
    }
  }

  // 재요청 에러 헨들러
  protected reRequestErrorHandle(scope: any, error: any) {

    // 재요청을 했는데도 권한 오류가 발생하면 로그인 화면으로
    if (error.status === 401) {
      // 로그인 화면으로
      console.info('reRequestErrorHandle', scope, error);
      this._logout(scope);
      return false;
    }

    const errorMessage = error ? error.json() : 'Server error';
    return Promise.reject(errorMessage);
  }

  // 재요청 결과 헨들러
  protected reRequestResultHandle(scope: any, response: Response) {
    return response;
  }

  // Token 갱신 실패
  protected tokenRefreshFail(scope: any, error: any): void {
    // 로그인 화면으로
    this.router.navigate(['/user/login']);
  }

  /**
   * 로그아웃 처리
   * @private
   */
  private _logout(scope: any) {
    if (CommonUtil.isSamlSSO()) {
      location.href = '/saml/logout';
    } else {
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN_TYPE, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_USER_ID, '/');
      this.cookieService.delete(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.MY_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.PERMISSION, '/');

      if (scope && scope.router) {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            forwardURL: scope.router.url
          }
        };
        this.router.navigate(['/user/login'], navigationExtras);
      } else {
        this.router.navigate(['/user/login']);
      }
    }
  } // function - _logout

}

export enum httpMethod {
  GET, POST, PUT, DELETE
}
