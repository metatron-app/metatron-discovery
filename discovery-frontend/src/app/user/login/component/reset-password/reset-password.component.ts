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

import {Component, ElementRef, Injector, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {UserService} from '../../../service/user.service';
import {AbstractComponent} from '@common/component/abstract.component';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';
import {isUndefined} from 'util';
import {ConfirmSmallComponent} from '@common/component/modal/confirm-small/confirm-small.component';
import {Modal} from '@common/domain/modal';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(ConfirmSmallComponent)
  private _confirmModal: ConfirmSmallComponent;

  // 팝업 show/hide
  public isShow = false;

  // email
  public email: string;

  // 이메일 메세지
  public emailMessage: string;

  // 이메일 결과
  public resultEmail: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private userService: UserService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected renderer: Renderer2) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.isShow = false;
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public init() {
    this.isShow = true;

    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    // init view
    this._initView();
  }

  /**
   * close
   */
  public close() {
    this.isShow = false;

    this.renderer.removeStyle(document.body, 'overflow');
  }

  /**
   * done
   */
  public done(): void {
    // done validation
    if (this.doneValidation()) {
      // 이메일 전송
      this._sendMail();
    }
  }

  /**
   * init email validation
   */
  public initEmailValidation(): void {
    this.resultEmail = undefined;
  }

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    if (!this.resultEmail) {
      this.emailValidation();
      return false;
    }
    return this.resultEmail;
  }

  /**
   * email validation
   */
  public emailValidation(): void {
    // 이메일이 비어 있다면
    if (isUndefined(this.email) || this.email.trim() === '') {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_INPUT_EMAIL');
      return;
    }
    // 이메일 형식 확인
    if (!StringUtil.isEmail(this.email.trim())) {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_VALID_EMAIL');
      return;
    }
    // 등록된 이메일인지 확인
    this._checkDuplicateEmail(this.email.trim());
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이메일 있는지 확인
   * @param {string} email
   * @private
   */
  private _checkDuplicateEmail(email: string): void {
    this.userService.duplicateEmail(email)
      .then((result) => {
        // 이메일 있다면
        this.resultEmail = result['duplicated'];
        // 이메일이 없다면
        if (!result['duplicated']) {
          this.emailMessage = this.translateService.instant('msg.login.alert.reset.passwd.email.not.found');
        }
      })
      .catch(() => {
        this.resultEmail = false;
      });
  }

  /**
   * 메일 보내기
   * @private
   */
  private _sendMail(): void {
    // 로딩 show
    this.loadingShow();
    // 패스워드 재설정 요청 작업중
    this.userService.resetPassword(this.email.trim())
      .then(() => {
        // 로딩 hide
        this.loadingHide();
        // close
        this.close();
        // modal
        const modal = new Modal();
        modal.name = this.translateService.instant('msg.login.alert.reset.passwd.email.success');
        // confirm modal
        this._confirmModal.init(modal);
      }).catch((error) => {
      // 실패 문구
      if (error.code === 'GB0003') {
        this.resultEmail = false;
      }
      // alert
      Alert.error(this.translateService.instant('msg.login.alert.reset.passwd.email.fail'));
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * init view
   * @private
   */
  private _initView() {
    this.resultEmail = undefined;
    this.email = undefined;
  }
}
