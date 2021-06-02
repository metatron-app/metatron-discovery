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

import * as _ from 'lodash';
import {CommonConstant} from '../constant/common.constant';
import {CookieConstant} from '../constant/cookie.constant';
import {SYSTEM_PERMISSION} from 'app/common/permission/permission';
import {Modal} from '../domain/modal';
import {environment} from '@environments/environment';
import {Router} from '@angular/router';
import {Theme, UserSetting} from '../value/user.setting.value';
import {LocalStorageConstant} from '../constant/local-storage.constant';

declare let $;

export class CommonUtil {

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // 인증 관련
  //
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * SAML SSO 사용여부
   * @returns {boolean}
   */
  public static isSamlSSO(): boolean {
    return 'YES' === localStorage.getItem('USE_SAML_SSO');
  } // function - isSamlSSO
  /**
   * 시작 페이지로 이동
   * @param {Router} router
   */
  public static moveToStartPage(router?: Router) {
    if (CommonUtil.isSamlSSO()) {
      location.href = '/saml/login?idp=' + environment['samlUrl'];
    } else {
      (router) && (router.navigate(['/user/login']).then());
    }
  } // function - moveToStartPage

  /**
   * 로그인한 사용자 아이디 조회 ( by Cookie )
   * @returns {string}
   */
  public static getLoginUserId(): string {
    /*
    // SAML 처리를 위해 ( e-mail 형식으로 로그인 된 아이디에서 메일 양식을 제거하기 위함 )
    let strUserId:string = CommonConstant.cookieService.get(CookieConstant.KEY.LOGIN_USER_ID);
    return strUserId.split( '@' )[0];
    */
    return CommonConstant.cookieService.get(CookieConstant.KEY.LOGIN_USER_ID);
  } // function - getLoginUserId

  /**
   * 저장된 퍼미션 문구 조회
   * @return {string}
   */
  public static getCurrentPermissionString(): string {
    return CommonConstant.cookieService.get(CookieConstant.KEY.PERMISSION);
  } // function - getCurrentPermissionString

  /**
   * 저장된 퍼미션 목록 조회 ( 퍼미션 문구의 배열 목록 반환 )
   * @return {string[]}
   */
  public static getCurrentPermissionList(): string[] {
    const cookiePermission: string = this.getCurrentPermissionString();
    if (cookiePermission && '' !== cookiePermission) {
      return cookiePermission.split('==');
    } else {
      return [];
    }
  } // function - getCurrentPermissionList

  /**
   * 유효한 퍼미션들인지 체크한다.
   * @param {SYSTEM_PERMISSION[]} permission
   * @return {boolean}
   */
  public static isValidPermissions(permission: SYSTEM_PERMISSION[]): boolean {
    if (permission && 0 < permission.length) {
      const perms: string = this.getCurrentPermissionString();
      return !permission.some(item => -1 === perms.indexOf(item.toString()));
    } else {
      return false;
    }
  } // function - isValidPermissions

  /**
   * 유효한 퍼미션들인지 체크한다.
   * @param {SYSTEM_PERMISSION } permission
   * @return {boolean}
   */
  public static isValidPermission(permission: SYSTEM_PERMISSION): boolean {
    if (permission) {
      const perms: string = this.getCurrentPermissionString();
      return -1 < perms.indexOf(permission.toString());
    } else {
      return false;
    }
  } // function - isValidPermission

  /**
   * Discovery Permission 화면 Resource bundling
   * @param {string} name
   * @return {string}
   */
  public static getMsgCodeBySystemRole(name: string): string {
    switch (name) {
      case '__ADMIN' :
        return 'msg.permission.ui.sys-perm.system-setting';
      case '__DATA_MANAGER' :
        return 'msg.permission.ui.sys-perm.data-mngt';
      case '__PERMISSION_MANAGER':
        return 'msg.permission.ui.sys-perm.ws-manager';
      case '__PRIVATE_USER' :
        return 'msg.permission.ui.sys-perm.personal-ws';
      case '__SHARED_USER':
        return 'msg.permission.ui.sys-perm.shared-ws';
      case '__GUEST':
        return 'msg.permission.ui.sys-perm.guest';
      default :
        return name;
    }
  } // function - getMsgCodeBySystemRole

  //////////////////////////////////////////////////
  //
  // Promise Util
  //
  //////////////////////////////////////////////////
  /**
   * Waterfall 형태로 호출되도록 함
   * @param {Function[]} funcList
   * @returns {Promise}
   */
  public static waterfallPromise(funcList: (() => Promise<any[]>)[]): Promise<any[]> {
    if (funcList && 0 < funcList.length) {
      return funcList.reduce((acc, currVal) => {
        return acc.then(res => {
          return currVal().then(result => {
            res.push(result);
            return res;
          });
        });
      }, Promise.resolve([]));
    } else {
      throw new Error('SubClass should implements changeLock method');
    }
  } // function - waterfallPromise

  //////////////////////////////////////////////////
  //
  // Confirm Util
  //
  //////////////////////////////////////////////////
  /**
   * 공통 확인창 오픈 함수
   * @param {Modal} confirmData
   */
  public static confirm(confirmData: Modal) {
    const $popupContainer = $('.sys-global-confirm-popup');

    // 스크롤 여부에 따른 상태 설정
    const $popupBox = $popupContainer.children();
    $popupBox.removeClass('ddp-box-popup-type1 ddp-box-popup-type3');
    const $scrollContentsBox = $popupContainer.find('.ddp-box-detail');
    const $nonScrollContentsBox = $popupContainer.find('.ddp-pop-detail');
    if (confirmData.isScroll) {
      $popupBox.addClass('ddp-box-popup-type3');
      $nonScrollContentsBox.hide();
      $scrollContentsBox.show();
    } else {
      $popupBox.addClass('ddp-box-popup-type1');
      $scrollContentsBox.hide();
      $nonScrollContentsBox.show();
    }

    // 닫기 이벤트 설정
    $popupContainer.find('.ddp-btn-close').one('click', () => {
      $popupContainer.hide();
    });

    // 타이틀 설정
    if (confirmData.name) {
      $popupContainer.find('.ddp-pop-title').html(confirmData.name);
    } else {
      $popupContainer.find('.ddp-pop-title').html('');
    }

    // 설명 설정
    let description: string = '';
    (confirmData.description) && (description = description + confirmData.description);
    (confirmData.subDescription) && (description = description + '<br/>' + confirmData.subDescription);
    if (confirmData.isScroll) {
      $scrollContentsBox.find('.ddp-txt-detail').html(description);
    } else {
      $nonScrollContentsBox.html(description);
    }

    // 버튼 설정
    const $btnCancel = $popupContainer.find('.ddp-btn-type-popup:first');
    const $btnDone = $btnCancel.next();
    if (confirmData.isShowCancel) {
      $btnCancel.show();
      $btnCancel.text(confirmData.btnCancel ? confirmData.btnCancel : $btnCancel.attr('data-defaultMsg'));
      $btnCancel.off('click').one('click', () => {
        $popupContainer.hide();
      });
    } else {
      $btnCancel.hide();
    }
    $btnDone.text(confirmData.btnName ? confirmData.btnName : $btnDone.attr('data-defaultMsg'));

    $btnDone.off('click').one('click', () => {
      (confirmData.afterConfirm) && (confirmData.afterConfirm(confirmData));
      $popupContainer.hide();
    });

    $popupContainer.show();
  } // function - confirm

  //////////////////////////////////////////////////
  //
  // String / Number Util
  //
  //////////////////////////////////////////////////

  /** 자리수 체크 */
  public static getByte(str: string) {
    return str.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g, '$&$1$2').length;
  }

  /**
   * 숫자를 용량 표시로 변경
   * @param {number} size : 크기
   * @param {number} floatPos : 소수점 자릿수
   * @returns {string}
   */
  public static formatBytes(size: number, floatPos: number): string {
    if (0 === size) return '0 Bytes';
    const c = 1024;
    const d = floatPos || 2;
    const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const f = Math.floor(Math.log(size) / Math.log(c));
    return parseFloat((size / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
  } // function - formatBytes

  /**
   *  3자리수 마다 콤마
   * @param {number} num
   * @returns {string} 3자리수 마다 콤마
   */
  public static numberWithCommas(num: number): string {
    return (num) ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  }

  /**
   *  URL 파라미터 생성
   * @param obj
   * @returns URL 파라미터값
   */
  public static objectToUrlString(obj: any) {
    if (obj) {
      let params = '';
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          params += `&${key}=${encodeURIComponent(obj[key])}`;
        }
      }

      if (_.startsWith(params, '&')) {
        params = params.substring(1);
      }

      return params;
    }
    return '';
  }

  /**
   * objectToArray
   * @param obj
   */
  public static objectToArray(obj: any) {
    if (obj === undefined || obj === null) {
      return [];
    } else if (obj.forEach) {
      return obj;
    } else {
      return Object.keys(obj).reduce((acc, currVal) => {
        acc.push(obj[currVal]);
        return acc;
      }, []);
    }
  } // function - objectToArray

  public static getUUID() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }

  private static s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  /**
   * ms를 min과 sec로 변환
   * @param {number} ms
   * @returns {string}
   */
  public static convertMilliseconds(ms: number) {
    if (ms === undefined) {
      return 0 + 'ms';
    }

    if (ms < 1000) {
      return ms + 'ms'
    }

    const min = Math.floor((ms / 1000 / 60) << 0);
    const sec = Math.floor((ms / 1000) % 60);
    return min !== 0 ? (min + ' min ' + sec + ' sec') : (sec + ' sec');
  } // function - convertMilliseconds

  public static getUserSetting(): UserSetting {
    if (localStorage) {
      const value = this.getLocalStorage(LocalStorageConstant.KEY.USER_SETTING);
      if (value) {
        return JSON.parse(value);
      }
    }
    return new UserSetting();
  }

  public static getLocalStorage(key: string): any {
    if (localStorage) {
      return localStorage.getItem(key);
    } else {
      return null;
    }
  }

  public static setLocalStorage(key: string, value: any): void {
    if (localStorage) {
      localStorage.setItem(key, value);
    }
  }

  public static setThemeCss(theme: Theme): void {
    const $body = $('body');
    if (theme === Theme.DARK) {
      $body.addClass(Theme.DARK);
    } else {
      if ($body.hasClass(Theme.DARK)) {
        $body.removeClass(Theme.DARK);
      }
    }
  }

  public static isNullOrUndefined(val): boolean {
    return val === undefined || val === null;
  }

  public static arrayEquals(a, b): boolean {
    return a.length === b.length && a.every((v, i) => JSON.stringify(v) === JSON.stringify(b[i]));
  }

}
