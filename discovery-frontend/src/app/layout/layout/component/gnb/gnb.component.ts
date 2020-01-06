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
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {CookieConstant} from '../../../../common/constant/cookie.constant';
import {UserService} from '../../../../user/service/user.service';
import {User} from '../../../../domain/user/user';
import {ProfileComponent} from '../../../../user/profile/profile.component';
import {CommonUtil} from '../../../../common/util/common.util';
import {LocalStorageConstant} from "../../../../common/constant/local-storage.constant";
import {Language, Theme, UserSetting} from "../../../../common/value/user.setting.value";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";

@Component({
  selector: 'app-gnb',
  templateUrl: './gnb.component.html',
})
export class GnbComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // my info show/hide
  public isMyInfoShow = false;
  public isLanguageShow = false;

  // UI에서 사용할 유저객체
  public user: User;

  public constTheme = Theme;

  @ViewChild(ProfileComponent)
  public profileComponent: ProfileComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private userService: UserService,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
    this.user = new User();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    // 개인정보 가져오기
    const userId:string = CommonUtil.getLoginUserId();
    this.userService.getUser(userId).then((user) => {
      this.user = user;
    }).catch((err) => this.commonExceptionHandler(err));
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 사용자 프로필 show
   */
  public userProfile(): void {
    this.profileComponent.init(this.user);
  }

  public getCurrentLang(): string {
    return this.getLanguage();
  }

  public changeLanguage(lang: string): void {
    if (this.getCurrentLang() != lang) {
      this.setLanguage(lang);
      this._saveUserSetting(null, UserSetting.getLanguage(lang));
    }
    this.isLanguageShow = false;
  }

  /**
   * 사용자 정보 수정 완료
   * @param userData
   */
  public updatedUser(userData): void {
    delete this.user.imageUrl;
    this.safelyDetectChanges();
    setTimeout(() => {
      this.user = userData;
      this.safelyDetectChanges();
    }, 250 );
  }

  /**
   * 사용자 프로필 이미지
   * @returns {string}
   */
  public getUserImage(): string {
    if( this.user && this.user.hasOwnProperty('imageUrl') ) {
      return '/api/images/load/url?url=' + this.user.imageUrl + '/thumbnail';
    } else {
      return this.defaultPhotoSrc;
    }
  } // function - getUserImage

  public isThemeDark(): boolean {
    return $('body').hasClass(Theme.DARK);
  }

  public themeCheckboxClick(theme: Theme) {
    CommonUtil.setThemeCss(theme);
    this.broadCaster.broadcast('CHANGE_THEME', theme);
    this._saveUserSetting(theme, null);
  }

  public logout() {
    if( CommonUtil.isSamlSSO() ) {
      location.href = '/saml/logout';
    } else {
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN_TYPE, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_USER_ID, '/');
      this.cookieService.delete(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.MY_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.PERMISSION, '/');
      this.router.navigate(['/user/login']).then();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _saveUserSetting(theme:Theme, language:Language): void {
    let userData: UserSetting = CommonUtil.getUserSetting();
    if (!userData) {
      userData = new UserSetting();
    }

    if (theme != null) {
      userData.theme = theme;
    }
    if (language != null) {
      userData.language = language;
    }

    CommonUtil.setLocalStorage(LocalStorageConstant.KEY.USER_SETTING, JSON.stringify(userData));
  }

}
