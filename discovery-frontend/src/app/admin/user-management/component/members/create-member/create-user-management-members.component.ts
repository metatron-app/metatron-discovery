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

import {AbstractUserManagementComponent} from '../../../abstract.user-management.component';
import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {isUndefined} from 'util';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';

@Component({
  selector: 'app-create-user-management-members',
  templateUrl: './create-user-management-members.component.html'
})
export class CreateUserManagementMembersComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 멤버 모달 show hide 설정
  private _createModalShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // id
  public userId: string;
  // email
  public email: string;
  // 이름
  public userName: string;

  // id flag
  public resultId: boolean;
  // email flag
  public resultEmail: boolean;
  // name flag
  public resultName: boolean;

  // id error message
  public idMessage: string;
  // email error message
  public emailMessage: string;
  // name error message
  public nameMessage: string;

  @Output()
  public createComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   */
  public init(): void {
    // ui init
    this._initView();
    // 모달 show
    this._createModalShowFl = true;
  }

  /**
   * close
   */
  public createCancel(): void {
    // 모달 hide
    this._createModalShowFl = false;
  }

  /**
   * done
   */
  public createDone(): void {
    // validation
    if (this.doneValidation()) {
      // 로딩 show
      this.loadingShow();
      // 사용자에게 확인 이메일 전달
      this.membersService.createUser(this._getCreateUserParams())
        .then(() => {
          // alert
          Alert.success(this.translateService.instant('msg.mem.alert.name.create', {value: this.userName.trim()}));
          // 로딩 hide
          this.loadingHide();
          // 모달 hide
          this._createModalShowFl = false;
          this.createComplete.emit();
        })
        .catch((error) => {
          // alert
          Alert.error(error);
          // 로딩 hide
          this.loadingHide();
        })
    }
  }

  /**
   * init id validation
   */
  public initIdValidation(): void {
    this.resultId = undefined;
  }

  /**
   * init email validation
   */
  public initEmailValidation(): void {
    this.resultEmail = undefined;
  }

  /**
   * init name validation
   */
  public initNameValidation(): void {
    this.resultName = undefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * modal show flag
   * @returns {boolean}
   */
  public get getShowFlag(): boolean {
    return this._createModalShowFl;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * id validation
   */
  public idValidation(): void {
    // 아이디가 비어 있다면
    if (isUndefined(this.userId) || this.userId.trim() === '') {
      this.resultId = false;
      this.idMessage = this.translateService.instant('LOGIN_JOIN_INPUT_ID');
      return;
    }
    // id 형식 확인
    if (!StringUtil.isId(this.userId) || CommonUtil.getByte(this.userId.trim()) < 3 || CommonUtil.getByte(this.userId.trim()) > 20) {
      this.resultId = false;
      this.idMessage = this.translateService.instant('LOGIN_JOIN_VALID_ID');
      return;
    }
    // 중복 확인
    this._checkDuplicateId(this.userId.trim());
  }

  /**
   * email validation
   */
  public emailValidation(): void {
    // 아이디가 비어 있다면
    if (isUndefined(this.email) || this.email.trim() === '') {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_INPUT_EMAIL');
      return;
    }
    // 이메일 형식 확인
    if (!StringUtil.isEmail(this.email)) {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_VALID_EMAIL');
      return;
    }
    // 중복 확인
    this._checkDuplicateEmail(this.email.trim());
  }

  /**
   * name validation
   */
  public nameValidation(): void {
    // 이름이 비어 있다면
    if (isUndefined(this.userName) || this.userName.trim() === '') {
      this.resultName = false;
      this.nameMessage = this.translateService.instant('LOGIN_JOIN_INPUT_NAME');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.userName.trim()) > 150) {
      this.resultName = false;
      this.nameMessage = this.translateService.instant('msg.groups.alert.name.len');
      return;
    }
    this.resultName = true;
  }

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    // 이름
    if (!this.resultName) {
      this.nameValidation();
      return false;
    }
    // 아이디
    if (!this.resultId) {
      this.idValidation();
      return false;
    }
    // 이메일
    if (!this.resultEmail) {
      this.emailValidation();
      return false;
    }
    return this.resultEmail && this.resultId && this.resultName;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init view
   * @private
   */
  private _initView(): void {
    // 초기화
    this.userId = '';
    this.email = '';
    this.userName = '';
    this.resultName = undefined;
    this.resultId = undefined;
    this.resultEmail = undefined;
  }

  /**
   * 아이디 중복 체크
   * @param {string} id
   * @private
   */
  private _checkDuplicateId(id: string): void {
    this.membersService.getResultDuplicatedUserName(id)
      .then((result) => {
        // 아이디 사용 가능한 여부
        this.resultId = !result['duplicated'];
        // 아이디가 중복 이라면
        if (result['duplicated']) {
          this.idMessage = this.translateService.instant('LOGIN_JOIN_USE_ID');
        }
      });
  }

  /**
   * 이메일 중복체크
   * @param {string} email
   * @private
   */
  private _checkDuplicateEmail(email: string): void {
    this.membersService.getResultDuplicatedEmail(email)
      .then((result) => {
        // 이메일 사용 가능한 여부
        this.resultEmail = !result['duplicated'];
        // 이메일이 중복 이라면
        if (result['duplicated']) {
          this.emailMessage = this.translateService.instant('LOGIN_JOIN_USE_EMAIL');
        }
      });
  }

  /**
   * 사용자 생성시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateUserParams(): object {
    return {email: this.email.trim(), username: this.userId.trim(), fullName: this.userName.trim()};
  }
}
