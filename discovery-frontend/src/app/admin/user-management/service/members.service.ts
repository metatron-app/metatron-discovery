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
 * Created by juheeko on 21/09/2017.
 */
import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '@common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import { CommonUtil } from '@common/util/common.util';

@Injectable()
export class MembersService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // users api 경로
  private path = 'users';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 가입신청한 사용자 목록 조회
   * @param param
   * {
   *    level 사용자 레벨, 시스템 관리자(SYSTEM_ADMIN), 데이터 관리자(SYSTEM_SUPERVISOR), 일반사용자(SYSTEM_USER)
   *    active true 인 경우 활성화 상태, false 인경우 비활성화 상태인 사용자 표시, 파라미터가 없는 경우 모두 표시
   *    nameContains username/fullname/email 에 포함된 문자열
   *    searchDateBy 생성일(CREATED)/수정일(MODIFIED) 기준 여부
   *    from 검색 시작일자, ISO DATE_TIME(yyyy-MM-ddTHH:mm:dd.SSSZ) 형식
   *    to 검색 종료일자, ISO DATE_TIME(yyyy-MM-ddTHH:mm:dd.SSSZ) 형식
   * }
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getRequestedUser(param: any, projection: string = 'forListView'): Promise<any> {

    // URL
    let url: string = this.API_URL + this.path;

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 유저 아이디 중복되는지 확인
   * @param {string} username
   * @returns {Promise<any>}
   */
  public getResultDuplicatedUserName(username: string): Promise<any> {
    // URL
    return this.get( this.API_URL + this.path + `/username/${username}/duplicated`);
  }

  /**
   * 유저 이메일 중복되는지 확인
   * @param {string} email
   * @returns {Promise<any>}
   */
  public getResultDuplicatedEmail(email: string): Promise<any> {
    // URL
    return this.get( this.API_URL + this.path + `/email/${email}/duplicated`);
  }

  /**
   * 어드민 > 유저 상세정보 조회
   * @param {string} userId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getUserDetail(userId: string, projection: string = 'forDetailView'): Promise<any> {
    // URL
    const url: string = this.API_URL + this.path + `/${userId}`;
    return this.get(url + `?projection=${projection}`);
  }

  /**
   * 어드민 > 사용자 삭제
   * @param {string} userId
   * @returns {Promise<any>}
   */
  public deleteUser(userId: string): Promise<any> {
    return this.delete(this.API_URL + this.path + `/${userId}`);
  }

  /**
   * 어드민 > 사용자 정보 수정
   * @param {string} userId
   * @param param
   * @returns {Promise<any>}
   */
  public updateUser(userId: string, param: any): Promise<any> {
    return this.put(this.API_URL + this.path + `/${userId}/manual`, param);
  }

  /**
   * 어드민 > 사용자 비밀번호 초기화
   * @param {string} email
   * @returns {Promise<any>}
   */
  public userPasswordReset(email: string): Promise<any> {
    return this.post(this.API_URL + this.path + '/password/reset', { email });
  }

  /**
   * 어드민 > 사용자 status 변경
   * @param {string} username
   * @param {string} status
   * @returns {Promise<any>}
   */
  public updateUserStatus(username: string, status: string): Promise<any> {
    return this.post(this.API_URL + this.path + `/${username}/status/${status}`, null);
  }

  /**
   * 어드민 > 사용자 생성
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public createUser(params: object): Promise<any> {
    return this.post(this.API_URL + this.path + '/manual', params);
  }

  public getMemberApprovalList(param: any, projection: string = 'forListView'): Promise<any> {

    // URL
    let url: string = this.API_URL + this.path;

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + `&projection=${projection}`);
  }


  public rejectUser(username: string, params : any): Promise<any> {
    const url: string = this.API_URL + this.path + `/${username}/rejected`;
    return this.post(url,params);
  }

  public approveUser(username): Promise<any> {
    const url: string = this.API_URL + this.path + `/${username}/approved`;
    return this.post(url,{});
  }

  public getAccessHistory(param : any): Promise<any> {
    // URL
    let url: string = this.API_URL + 'activities';

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + '&projection=list');
  }

  public validatePassword(params: any): Promise<any> {
    return this.postWithoutToken(this.API_URL + this.path + '/password/validate', params);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
