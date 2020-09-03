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

import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserService} from '../../../../user/service/user.service';
import {CommonUtil} from '../../../../common/util/common.util';
import {DataEncryptionDecryptionService} from '../service/data-encryption-decrytion.service';
import {Alert} from '../../../../common/util/alert.util';
import {StringUtil} from '../../../../common/util/string.util';
import {DataEncryptionDecryptionContext} from '../data-encryption-decryption.component';

@Component({
             selector: 'app-identity-verification',
             templateUrl: './identity-verification.component.html'
           })
export class IdentityVerificationComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public userTelNo : string = "";
  public receivedAuthNumber : string = "";
  public identityVerificationId: string;
  public verified : boolean = false;
  public ableSendAuthNumber = false;

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Input()
  public context: DataEncryptionDecryptionContext;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private userService: UserService,
              private dataEncryptionDecryptionService: DataEncryptionDecryptionService,
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
    // ui 초기화
    this.initView();

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public next() {
    if (!this.verified) return;
    // 다음 페이지로 이동
    this.context.identityVerificationId = this.identityVerificationId;
    this.step = 'data-selection';
    this.stepChange.emit(this.step);
  }

  public sendAuthNumber() {
    if (!this.ableSendAuthNumber) return;
    this.loadingShow();
    this.dataEncryptionDecryptionService.doIdentityVerification().then((result) => {
      this.loadingHide();
      this.identityVerificationId = result.identityVerificationId;
      Alert.success("인증번호를 전송 하였습니다.");
    }).catch(() => {
      this.loadingHide();
      Alert.error("인증번호 전송에 실패 했습니다.");
    });
  }

  public verifyAuthNumber() {
    if(StringUtil.isEmpty(this.identityVerificationId)) {
      Alert.warning("인증번호를 전송 해주세요.");
      return;
    }

    this.dataEncryptionDecryptionService.checkIdentityVerificationByAuthenticationNumber(this.identityVerificationId, this.receivedAuthNumber.trim()).then((result) => {
      this.loadingHide();
      this.verified = result.verified;
      if(result.verified) {
        Alert.success("본인인증에 성공했습니다.");
      } else {
        Alert.error("인증번호가 틀렸습니다.");
      }
    }).catch((error) => {
      this.loadingHide();
      if (error.code && error.code === 'IC0001') {
        Alert.error("인증번호 입력 시간을 초과 했습니다. 다시 인증번호를 전송해 주세요.");
      } else {
        Alert.error("인증번호 확인에 실패 했습니다.");
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init view
   */
  private initView() {
    this.context.identityVerificationId = "";
    this.context.transformDataSet = null;

    this.loadingShow();
    const userId: string = CommonUtil.getLoginUserId();
    this.userService.getUserDetail(userId).then((result) => {
      this.loadingHide();
      if(result.tel) {
        this.userTelNo = result.tel;
        this.ableSendAuthNumber = true;
      } else {
        Alert.warning("연락처가 없습니다. 관리자에게 문의하세요.");
      }
    }).catch(() => {
      this.loadingHide();
    });
  }
}
