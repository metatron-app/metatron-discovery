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

import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {UserService} from '../../../service/user.service';
import {isUndefined} from 'util';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';

@Component({
  selector: 'app-initial-change-password',
  templateUrl: './initial-change-password.component.html'
})
export class InitialChangePasswordComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 아이디
  private _userId: string;

  @ViewChild('pwElm')
  private _pwElm: ElementRef;

  @Output('closeInitPw')
  public closeInitPw: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // show flag
  public isShowFl: boolean = false;

  // 기존 패스워드
  public password: string;
  // 새로 변경할 패스워드
  public newPassword: string;
  // 새로 변경할 패스워드 확인
  public rePassword: string;

  // 기존 패스워드 결과
  public resultPassword: boolean;
  // 새로 변경할 패스워드 결과
  public resultNewPassword: boolean;
  // 새로 변경할 패스워드 결과 확인
  public resultRePassword: boolean;

  // 기존 패스워드 메세지
  public passwordMessage: string;
  // 새로 변경할 패스워드 메세지
  public newPasswordMessage: string;
  // 새로 변경할 패스워드 메세지 확인
  public rePasswordMessage: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private userService: UserService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   * @param {string} userId
   */
  public init(userId: string, _status: string): void {
    // ui init
    this._initView();
    // 유저 아이디
    this._userId = userId;

    // Display User Status

  }

  /**
   * close
   */
  public closeChangePassword(): void {
    this.isShowFl = false;
    this.closeInitPw.emit();
  }

  /**
   * done
   */
  public doneChangePassword(): void {
    this.rePasswordValidation();
    if (this._doneValidation()) {
      this._updatePassword();
    }
  }

  /**
   * 현재 패스워드 validation
   */
  public passwordValidation(): void {
    // 비밀번호가 비어 있다면
    if (isUndefined(this.password) || this.password === '') {
      this.resultPassword = false;
      this.passwordMessage = this.translateService.instant('msg.comm.alert.profile.password.empty');
      return;
    }
    const param = {
      username: this._userId,
      initialPassword: this.password
    }
    this.userService.validatePassword(param)
      .then(() => {
        this.resultPassword = true;
      }).catch((error) => {
      this.loadingHide();
      this.resultPassword = false;
      if (error.code === 'UR0008') {
        this.passwordMessage = this.translateService.instant('msg.comm.alert.profile.password.match.not');
      } else if (StringUtil.isNotEmpty(error.code)) {
        this.passwordMessage = this.translateService.instant('login.ui.fail.' + error.code);
      }
      return;
    });
    this.resultPassword = true;

    return;
  }


  /**
   * 새로운 패스워드 validation
   */
  public newPasswordValidation(): void {
    // 비밀번호가 비어 있다면
    if (isUndefined(this.newPassword) || this.newPassword === '') {
      this.resultNewPassword = false;
      this.newPasswordMessage = this.translateService.instant('msg.comm.alert.profile.password.new.empty');
      return;
    }
    const param = {
      username: this._userId,
      password: this.newPassword
    }
    this.userService.validatePassword(param)
      .then(() => {
        this.resultNewPassword = true;
      }).catch((error) => {
      this.loadingHide();
      this.resultNewPassword = false;
      if (StringUtil.isNotEmpty(error.code)) {
        this.newPasswordMessage = this.translateService.instant('login.ui.fail.' + error.code);
      }
      return;
    });
    this.resultNewPassword = true;

    if (StringUtil.isNotEmpty(this.rePassword)) {
      this.initRePasswordValidation();
      this.rePasswordValidation();
    }
    return;
  }

  /**
   * 새로운 패스워드 확인 validation
   */
  public rePasswordValidation(): void {
    // 비밀번호가 비어 있다면
    if (isUndefined(this.rePassword) || this.rePassword === '') {
      this.resultRePassword = false;
      this.rePasswordMessage = this.translateService.instant('msg.comm.alert.profile.password.re.empty');
      return;
    }
    // 비밀번호가 일치하지 않을 때
    if (this.newPassword !== this.rePassword) {
      this.resultRePassword = false;
      this.rePasswordMessage = this.translateService.instant('msg.comm.alert.profile.password.re.match.not');
      return;
    }
    this.resultRePassword = true;
    return;
  }

  /**
   * init password validation
   */
  public initPasswordValidation(): void {
    this.resultPassword = undefined;
  }

  /**
   * init new password validation
   */
  public initNewPasswordValidation(): void {
    this.resultNewPassword = undefined;
  }

  /**
   * init re password validation
   */
  public initRePasswordValidation(): void {
    this.resultRePassword = undefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // show
    this.isShowFl = true;
    // 기존 패스워드
    this.password = undefined;
    // 새로 변경할 패스워드
    this.newPassword = undefined;
    // 새로 변경할 패스워드 확인
    this.rePassword = undefined;

    // 기존 패스워드 결과
    this.resultPassword = undefined;
    // 새로 변경할 패스워드 결과
    this.resultNewPassword = undefined;
    // 새로 변경할 패스워드 결과 확인
    this.resultRePassword = undefined;

    setTimeout(() => {
      this._pwElm.nativeElement.focus();
    }, 0);
  }

  /**
   * done validation
   * @returns {boolean}
   * @private
   */
  private _doneValidation(): boolean {
    // 현재 비밀번호가 맞는지
    if (!this.resultPassword) {
      this.passwordValidation();
      return false;
    }
    // 새로운 비밀번호
    if (!this.resultNewPassword) {
      this.newPasswordValidation();
      return false;
    }
    // 새로운 비밀번호 확인
    if (!this.resultRePassword) {
      this.rePasswordValidation();
      return false;
    }
    return this.resultPassword && this.resultNewPassword && this.resultRePassword;
  }

  /**
   * 비밀번호 변경
   * @private
   */
  private _updatePassword(): void {
    // 로딩 show
    this.loadingShow();
    const param = {
      username: this._userId,
      initialPassword: this.password,
      password: this.newPassword,
      confirmPassword: this.rePassword
    };
    this.userService.updateInitialUser(this._userId, param)
      .then(() => {
        // 로딩 hide
        this.loadingHide();
        // success alert
        Alert.success(this.translateService.instant('msg.comm.alert.profile.password.success'));
        // close
        this.closeChangePassword();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
        // error alert
        Alert.error(this.translateService.instant('msg.comm.alert.profile.password.fail'));
      })
  }
}
