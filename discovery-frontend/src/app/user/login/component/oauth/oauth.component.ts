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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {ConfirmSmallComponent} from '@common/component/modal/confirm-small/confirm-small.component';
import {User} from '@domain/user/user';
import {UserService} from '../../../service/user.service';
import {PermissionService} from '../../../service/permission.service';
import {ActivatedRoute} from '@angular/router';
import {CookieConstant} from '@common/constant/cookie.constant';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {InitialChangePasswordComponent} from '../initial-change-password/initial-change-password.component';

declare let moment: any;

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.css']
})
export class OauthComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 비밀번호 변경 팝업 컴포넌트
  @ViewChild(InitialChangePasswordComponent)
  private initialChangePasswordComponent: InitialChangePasswordComponent;

  // 확인 팝업 컴포넌트
  @ViewChild(ConfirmSmallComponent)
  private _confirmModal: ConfirmSmallComponent;

  @ViewChild('pwElm')
  private _pwElm: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 유저 엔티티
  public user: User = new User();

  public loginFailMsg: string = '';

  public queryString;
  string;
  public oauthClientInformation: OauthClientInformation;
  public clientId: string;

  public useCancelBtn: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private userService: UserService,
              private permissionService: PermissionService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activatedRoute.queryParams.subscribe((params) => {
      this.clientId = params['client_id'];
      if (params['error'] === 'IP') {
        Alert.error(this.translateService.instant('msg.sso.ui.not.matched.userip'), true);
      }
    });

    // this.user.username = 'admin';
    // this.user.password = 'admin';

    this.userService.getClientDetail(this.clientId).then(result => {
      this.oauthClientInformation = result;
      $('#favicon').attr('href', this.oauthClientInformation.faviconPath + '?v=3');
      if (!_.isNil(this.oauthClientInformation.clientName)) {
        document.title = this.oauthClientInformation.clientName;
      }
    }).catch((error) => {
      Alert.error(error.message, true);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public checkIp() {
    if (this._confirmModal.isShow) {
      return;
    }

    this.loadingShow();

    (this.user.username) && (this.user.username = this.user.username.trim());

    this.userService.checkUserIp(this.user, this.oauthClientInformation.basicHeader).then((host) => {
      if (host === true) {
        this.login();
      } else {
        this.loadingHide();
        const modal = new Modal();
        modal.name = this.translateService.instant('msg.login.access.title');
        modal.description = this.translateService.instant('msg.sso.ui.confirm.userip', {value: host});
        modal.data = this.user;
        // confirm modal
        this.useCancelBtn = true;
        this._confirmModal.init(modal);
      }
    }).catch(() => {
      this._logout();
      Alert.error(this.translateService.instant('login.ui.failed'), true);
      this.loadingHide();
    });
  }

  /**
   * 로그인
   */
  public login() {
    if (this._confirmModal.isShow) {
      return;
    }

    this.loadingShow();

    (this.user.username) && (this.user.username = this.user.username.trim());

    this.loginFailMsg = '';

    this.userService.login(this.user, this.oauthClientInformation.basicHeader).then((loginToken) => {
      if (loginToken.access_token) {

        // 쿠키 저장
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, loginToken.access_token, 0, '/');
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, loginToken.token_type, 0, '/');
        this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, loginToken.refresh_token, 0, '/');
        this.cookieService.set(CookieConstant.KEY.LOGIN_USER_ID, this.user.username, 0, '/');

        // 유저 권한 조회
        this.permissionService.getPermissions('SYSTEM').then((permission) => {
          if (permission && 0 < permission.length) {
            this.cookieService.set(CookieConstant.KEY.PERMISSION, permission.join('=='), 0, '/');
          }
          this._showAccessLog(loginToken.last_login_time, loginToken.last_login_ip,
            '/oauth/authorize?' + location.href.split('?')[1], this.oauthClientInformation.clientName);
        });

      } else {
        this._logout();
        Alert.error(this.translateService.instant('login.ui.failed'), true);
        this.loadingHide();
      }

    }).catch((err) => {
      // 로딩 hide
      this.loadingHide();
      if (err.details === 'INITIAL' || err.details === 'EXPIRED') {
        this.initialChangePasswordComponent.init(this.user.username, err.details);
      } else {
        this.loginFailMsg = err.details;
      }
      // this.commonExceptionHandler(err);
    });
  } // function - login

  public backgroundImageInit() {
    $('.ddp-wrap-login').css('background-image', 'url(/assets/images/login.jpg)');
    $('.ddp-wrap-login .ddp-blur2').css('background-image', 'url(/assets/images/login.jpg)');
  }

  public confirmComplete(data) {
    if (!this.isNullOrUndefined(data)) {
      if (data === this.user) {
        this.login();
      } else {
        location.href = data;
      }
    }
  }

  public initialComplete() {
    this.user.password = '';
    this._pwElm.nativeElement.focus();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 로그아웃
   * @private
   */
  private _logout() {
    this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN, '/');
    this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN_TYPE, '/');
    this.cookieService.delete(CookieConstant.KEY.LOGIN_USER_ID, '/');
    this.cookieService.delete(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, '/');
    this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');
    this.cookieService.delete(CookieConstant.KEY.MY_WORKSPACE, '/');
    this.cookieService.delete(CookieConstant.KEY.PERMISSION, '/');
  } // function - _logout

  private _showAccessLog(lastLoginTime: string, lastLoginIp: string, forwardUrl: string, clientName: string) {
    this.loadingHide();
    const modal = new Modal();
    if (_.isEmpty(clientName)) {
      modal.name = this.translateService.instant('msg.login.access.title');
    } else {
      modal.name = this.translateService.instant('msg.oauth.access.title', {client: clientName});
    }
    modal.description = this.translateService.instant('msg.login.access.description')
      + moment(lastLoginTime).format('YYYY-MM-DD HH:mm:ss');
    if (lastLoginIp !== undefined) {
      modal.description = modal.description + ' (' + lastLoginIp + ')';
    }
    modal.data = forwardUrl;
    // confirm modal
    this.useCancelBtn = false;
    this._confirmModal.init(modal);
  }

}

interface OauthClientInformation {
  clientName: string
  basicHeader: string
  faviconPath: string
  backgroundFilePath: string
  logoFilePath: string
  logoDesc: string
  smallLogoFilePath: string
  smallLogoDesc: string
  copyrightHtml: string
}
