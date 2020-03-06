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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from '../../domain/user/user';
import { UserService } from '../service/user.service';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { AbstractComponent } from '../../common/component/abstract.component';
import { JoinComponent } from './component/join/join.component';
import { JoinCompleteComponent } from './component/join-complete/join-complete.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { Alert } from '../../common/util/alert.util';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../workspace/service/workspace.service';
import { PermissionService } from '../service/permission.service';
import { ConfirmSmallComponent } from '../../common/component/modal/confirm-small/confirm-small.component';
import { Modal } from '../../common/domain/modal';
import { CommonUtil } from '../../common/util/common.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private forwardURL: string;

  // 사용자 신청 팝업 컴포넌트
  @ViewChild(JoinComponent)
  private joinComponent: JoinComponent;

  // 가입 완료 팝업 컴포넌트
  @ViewChild(JoinCompleteComponent)
  private joinCompleteComponent: JoinCompleteComponent;

  // 비밀번호 변경 팝업 컴포넌트
  @ViewChild(ResetPasswordComponent)
  private resetPasswordComponent: ResetPasswordComponent;

  // 확인 팝업 컴포넌트
  @ViewChild(ConfirmSmallComponent)
  private _confirmModal: ConfirmSmallComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 유저 엔티티
  public user: User = new User();

  // 아이디 기억 여부
  public isRemember: boolean = false;

  // 이용약관 표시 여부
  public isShowTerms: boolean = false;

  public loginFailMsg:string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private userService: UserService,
              private workspaceService: WorkspaceService,
              private permissionService: PermissionService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected  injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();

    localStorage.removeItem( 'USE_SAML_SSO' );

    this.activatedRoute.queryParams.subscribe((params) => {
      this.forwardURL = params['forwardURL'] || 'NONE';
    });

    // this.user.username = 'admin';
    // this.user.password = 'admin';

    const id = this.cookieService.get(CookieConstant.KEY.SAVE_USER_ID);

    if (id) {
      this.isRemember = true;
      this.user.username = id;
    }

    if (this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) !== '') {
      if (this.forwardURL !== 'NONE') {
        this.router.navigate([this.forwardURL]).then();
      } else {
        this.router.navigate(['/workspace']).then();
      }
    } else {
      if(this.userService.isLoginRedirect() == true) {
        this.userService.getLoginDelegationURL().then(res => {
          if(res['url']) {
            this.userService.moveToRedirectPage(res['url']);
          }
        }).catch(error => {});
      }
    }
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

  // 사용자 신청하기
  public join() {
    this.joinComponent.init();
  }

  // 사용자 신청 완료
  public joinComplete(data:{code:string,msg?:string}) {
    // modal
    const modal = new Modal();
    if( 'SUCCESS' === data.code ) {
      // message
      modal.name = this.translateService.instant( 'msg.login.join.title' );
      modal.description = this.translateService.instant( 'msg.login.join.cmplt.description' );
      modal.subDescription = this.translateService.instant( 'msg.login.join.cmplt.description2' );
    } else {
      modal.name = this.translateService.instant('login.join.fail');
      ( '' !== data.msg ) && ( modal.description = data.msg );
    }
    // confirm modal
    this._confirmModal.init(modal);

    this.joinCompleteComponent.init();
  }

  // 비밀번호 찾기
  public resetPassword() {
    this.resetPasswordComponent.init();
  }

  /**
   * 로그인
   */
  public login() {

    this.loadingShow();

    ( this.user.username ) && ( this.user.username = this.user.username.trim() );

    this.loginFailMsg = '';

    this.userService.login(this.user).then((loginToken) => {
      if (loginToken.access_token) {

        // 쿠키 저장
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, loginToken.access_token, 0, '/');
        this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, loginToken.token_type, 0, '/');
        this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, loginToken.refresh_token, 0, '/');
        this.cookieService.set(CookieConstant.KEY.LOGIN_USER_ID, this.user.username, 0, '/');

        if (this.isRemember) {
          this.cookieService.set(CookieConstant.KEY.SAVE_USER_ID, this.user.username, 0, '/');
        } else {
          this.cookieService.delete(CookieConstant.KEY.SAVE_USER_ID, '/');
        }

        // 유저 권한 조회
        this.permissionService.getPermissions('SYSTEM').then((permission) => {
          if (permission && 0 < permission.length) {
            this.cookieService.set(CookieConstant.KEY.PERMISSION, permission.join('=='), 0, '/');

            // 내 워크스페이스 정보 조회
            this.workspaceService.getMyWorkspace().then(wsInfo => {
              // 내 워크스페이스 정보 저장
              this.cookieService.set(CookieConstant.KEY.MY_WORKSPACE, JSON.stringify(wsInfo), 0, '/');

              // 페이지 이동
              if (this.forwardURL !== 'NONE') {
                this.router.navigate([this.forwardURL]).then();
              } else {
                this.router.navigate(['/workspace']).then();
              }
            }).catch(() => {
              this._logout();
              Alert.error(this.translateService.instant('login.ui.failed'));
              this.loadingHide();
            });
          } else {
            this.router.navigate(['/workspace']).then();
          }
        });

      } else {
        this._logout();
        Alert.error(this.translateService.instant('login.ui.failed'));
        this.loadingHide();
      }

    }).catch((err) => {
      // 로딩 hide
      this.loadingHide();
      this.loginFailMsg = err.details;
      // this.commonExceptionHandler(err);
    });
  } // function - login

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
    this.userService.logout();
  } // function - _logout

}
