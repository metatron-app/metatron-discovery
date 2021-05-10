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
import 'rxjs/add/operator/toPromise';
import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '@common/service/abstract.service';
import {CommonUtil} from '@common/util/common.util';

@Injectable()
export class GroupsService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // groups api 경로
  private path = 'groups';

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
   * 그룹 리스트
   * @param param
   * {
   *  nameContains username/fullname/email 에 포함된 문자열
   *  searchDateBy 생성일(CREATED)/수정일(MODIFIED) 기준 여부
   *  from 검색 시작일자, ISO DATE_TIME(yyyy-MM-ddTHH:mm:dd.SSSZ) 형식
   *  to 검색 종료일자, ISO DATE_TIME(yyyy-MM-ddTHH:mm:dd.SSSZ) 형식
   * }
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getGroupList(param: any, projection: string = 'forListView'): Promise<any> {

    // URL
    let url: string = this.API_URL + this.path;

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 그룹 생성
   * @param data 그룹데이터
   * @returns {Promise<any>}
   */
  public createGroup(data: any): Promise<any> {

    // URL
    const url: string = this.API_URL + this.path;

    return this.post(url, data);
  }

  /**
   * 그룹 수정
   * @param groupId 그룹 아이디
   * @param params 파라메터
   * @returns {Promise<any>}
   */
  public updateGroup(groupId: string, params: object): Promise<any> {

    // URL
    const url: string = this.API_URL + this.path + '/' + groupId;

    return this.patch(url, params);
  }

  /**
   * 그룹 삭제
   * @returns {Promise<any>}
   */
  public deleteGroup(groupId: string): Promise<any> {

    // URL
    const url: string = this.API_URL + this.path + '/' + groupId;

    return this.delete(url);
  }

  /**
   * 그룹내 구성원 조회
   * @returns {Promise<any>}
   */
  public getGroupUsers(groupId: string, pageParam: { size: number, page: number }, projection: string = 'forListView'): Promise<any> {

    // URL
    let url: string = this.API_URL + this.path + '/' + groupId + `/members?projection=${projection}`;

    if (pageParam) {
      url += '&' + CommonUtil.objectToUrlString(pageParam);
    }

    return this.get(url);
  }

  /**
   * 그룹내 구성원 수정
   * @returns {Promise<any>}
   */
  public updateGroupUsers(groupId: string, userList: any): Promise<any> {

    // URL
    const url: string = this.API_URL + this.path + '/' + groupId + '/members';

    return this.patch(url, userList);
  }

  /**
   * 어드민 > 그룹 상세정보 조회
   * @param {string} groupId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getGroupDetail(groupId: string, projection: string = 'forDetailView'): Promise<any> {
    // URL
    const url: string = this.API_URL + this.path + `/${groupId}`;
    return this.get(url + `?projection=${projection}`);
  }

  /**
   * 어드민 > 그룹 이름 중복 체크
   * @param {string} groupName
   * @returns {Promise<any>}
   */
  public getResultDuplicatedGroupName(groupName: string): Promise<any> {
    return this.get(this.API_URL + this.path + `/name/${groupName}/duplicated`);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
