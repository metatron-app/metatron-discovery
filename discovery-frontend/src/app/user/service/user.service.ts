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
import { HttpHeaders } from '@angular/common/http';
import { AbstractService } from '../../common/service/abstract.service';
import { User } from '../../domain/user/user';
import 'rxjs/add/operator/toPromise';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { CommonUtil } from '../../common/util/common.util';

@Injectable()
export class UserService extends AbstractService {

  constructor (protected injector: Injector) {
    super(injector);
  }

  private URL_USER = this.API_URL + 'users';

  public isLoggedIn(): Promise<boolean> {

    const token = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
    const userId:string = CommonUtil.getLoginUserId();

    // 토큰이 존재하면
    if (token !== '') {

      // this
      const scope: any = this;

      // URL
      const url = this.URL_USER + '/' + userId;

      // 헤더
      const headers = new HttpHeaders({
        'Content-Type'	: 'application/json',
        Authorization	: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN),

      });

      // 사용자 정보가 있는지 체크
      return this.http.get(url, { headers })
        .toPromise()
        .then(response => Promise.resolve(true))
        .catch(error => scope.isLoggedInErrorHandler(scope, error));
    } else {
      CommonUtil.moveToStartPage( this.router );
      return Promise.resolve(false);
    }
  }

  // 사용자 정보가 없을 경우 리플레시 토큰이 있으면 토큰을 갱신
  // 정상적으로 토큰이 갱신되면 페이지로 진입 토큰이 갱신되지 않으면 로그인 페이지로
  public isLoggedInErrorHandler() : Promise<any> {
    const refreshToken = this.cookieService.get(CookieConstant.KEY.REFRESH_LOGIN_TOKEN);
    const userId:string = CommonUtil.getLoginUserId();
    if (refreshToken != null && userId != null) {
      return this.refreshToken().then((token) => {
        // 쿠키 저장
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, token.access_token, 0, "/");
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, token.token_type, 0, "/");
        this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, token.refresh_token, 0, "/");
        return true;
      }).catch(() => {
        this.router.navigate(['/user/login']);
        return false;
      });
    }  else {
      this.router.navigate(['/user/login']);
      return Promise.resolve(false);
    }
  }

  // 로그인
  public login(user: User): Promise<any> {
    return this.getToken(user);
  }

  // 유저정보
  public getUser(username: string): Promise<User> {
    return this.get(this.URL_USER + '/' + username);
  }

  // 사용자 신청
  public join(user: User): Promise<any> {
    return this.postWithoutToken(this.API_URL + 'users/signup', user);
  }

  // 아이디 중복 체크
  public duplicateId(username: string): Promise<any> {
    return this.getWithoutToken(this.URL_USER + `/username/${username}/duplicated`);
  }

  // 이메일 중복 체크
  public duplicateEmail(email: string): Promise<any> {
    return this.getWithoutToken(this.URL_USER + `/email/${email}/duplicated`);
  }

  // 비밀번호 reset API
  public resetPassword(email: string): Promise<any> {
    return this.postWithoutToken(this.URL_USER + '/password/reset', { email });
  }

  // 모든 유저리스트 조회
  public getUserList(param: any, projection: string = 'forListView'): Promise<any> {
    let url = this.URL_USER;
    url += '?' + CommonUtil.objectToUrlString(param);
    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 사용자 상세정보 조회
   * @param {string} username
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getUserDetail(username:string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_USER + `/${username}?projection=${projection}`);
  }

  /**
   * 사용자 정보 수정
   * @param {string} username
   * @param params
   * @returns {Promise<any>}
   */
  public updateUser(username: string, params: any): Promise<any> {
    return this.patch(this.URL_USER + `/${username}`, params);
  }

  /**
   * 사용자 비밀번호 체크
   * @param {string} username
   * @param {string} password
   * @returns {Promise<any>}
   */
  public checkUserPassword(username: string, password: string) {
    return this.post(this.URL_USER + `/${username}/check/password`, {password: password});
  }

}
