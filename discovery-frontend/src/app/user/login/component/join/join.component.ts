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
import {FileUploader} from 'ng2-file-upload';
import {isUndefined} from 'util';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {CommonConstant} from '@common/constant/common.constant';
import {AbstractComponent} from '@common/component/abstract.component';
import {User} from '@domain/user/user';
import {UserService} from '../../../service/user.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
})
export class JoinComponent extends AbstractComponent implements OnInit, OnDestroy {


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // User Domain
  public user: User;

  // 벨리데이션 관련 자료
  public joinValidation;

  // 프로필 기본 이미지 경로
  public defaultProfileImageSrc = '/assets/images/img_photo.png';

  // 파일 업로드
  public uploader: FileUploader;

  // 파일 업로드 결과
  public uploadResult;

  // 팝업 Show 플래그
  public isShow = false;

  // 프로필 이미지 파일(input)
  @ViewChild('profileImageFile') profileImageFile: any;
  // 프로필 이미지 (img)
  @ViewChild('profileImage') profileImage: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Output Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 상위 컴포넌트로 완료 이벤트 전파
  @Output()
  public joinComplete: EventEmitter<{ code: string, msg?: string }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private userService: UserService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected renderer: Renderer2) {
    super(elementRef, injector);
    // 이미지 업로드 URL 설정
    this.uploader
      = new FileUploader({url: CommonConstant.API_CONSTANT.API_URL + 'images/upload'});
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Methods
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // onInit
  ngOnInit() {
    super.ngOnInit();

  }

  // Ondestory
  ngOnDestroy() {
    this.isShow = false;
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Methods
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /** Init */
  public init() {

    // 팝업 show
    this.isShow = true;

    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // 값 초기화
    this.initViewPage();
  }

  /** 가입 신청 - when 'send email' button is clicked */
  public join() {
    this.checkRequiredFields(); // check if all the required fields are empty or not

    if (this.isValid()) { // check if validation has passed

      this.loadingShow();
      this.userService.join(this.user).then(() => {
        this.loadingHide();
        this.isShow = false;
        this.joinComplete.emit({code: 'SUCCESS'});
      }).catch(err => {
        this.loadingHide();
        this.joinComplete.emit({code: 'FAIL', msg: err.details ? err.details : ''});
      });

      // 프로필 사진이 있으면 업로드부터
      // if (this.profileImageFile.nativeElement.value
      //   != null && this.profileImageFile.nativeElement.value !== '') {
      //
      //   // 메서드 설정
      //   this.uploader.onBeforeUploadItem = (item) => {
      //     item.method = 'POST';
      //   };
      //
      //   // 헤더설정
      //   this.uploader.setOptions({
      //     url: CommonConstant.API_CONSTANT.API_URL
      //     + 'images/upload'
      //     + '?domain=user&itemId=' + this.user.username,
      //     headers: [{
      //       name : 'Accept',
      //       value : 'application/json, text/plain, */*',
      //     }],
      //   });
      //
      //   // 이미지 업로드 콜백 설정
      //   // 업로드 완료
      //   this.uploader.onCompleteAll = () => {
      //
      //     if (this.uploadResult && this.uploadResult.success) {
      //       // 업로드 완료 후
      //       this.removeProfileImage();
      //       // 회원가입 API호출
      //       this.join();
      //     }
      //   };
      //
      //   // 이미지 업로드 성공
      //   this.uploader.onSuccessItem = (item, response, status, headers) => {
      //     const success = true;
      //     this.uploadResult = { success, item, response, status, headers };
      //   };
      //
      //   // 에러 처리
      //   this.uploader.onErrorItem = (item, response, status, headers) => {
      //     // TODO 이미지 업로드 에러 처리
      //     console.log('error');
      //     this.loadingHide();
      //   };
      //
      //   // 업로드
      //   this.uploader.uploadAll();
      //   this.loadingHide();
      // } else {
      //
      //   if (this.uploadResult) {
      //     // 사진 url 추가
      //     let val = JSON.parse(this.uploadResult.response);
      //     this.user.imageUrl = val.imageUrl;
      //   }
      //
      //   this.userService.join(this.user)
      //     .then((result) => {
      //       this.loadingHide();
      //       this.isShow = false;
      //       this.joinComplete.emit();
      //     });
      // }
    }
  }

  /** upload profile image */
  public profilePreview($event) {

    if ($event.target.files && $event.target.files[0]) {

      // only jpg, png is allowed
      if ($event.target.files[0].type === 'image/jpeg' || $event.target.files[0].type === 'image/png') {

        const reader = new FileReader();

        reader.onload = (event: any) => {
          this.profileImage.nativeElement.src = event.target.result;
        };

        reader.readAsDataURL($event.target.files[0]);
      } else {
        Alert.warning(this.translateService.instant('login.join.file.format'));
        return;
      }
    }
  }

  /** Check if all of the required fields have value */
  public checkRequiredFields() {

    // required fields
    const list = ['username', 'email', 'password', 'confirmPassword'];

    list.forEach((item) => {
      // check if required fields are empty
      if (isUndefined(this.user[item]) || this.user[item].trim() === '' || this.user[item].length < 1) {
        this.joinValidation[item] = false;
        this.joinValidation[item + 'Message']
          = this.translateService.instant('LOGIN_JOIN_EMPTY_INPUT');
      }
    });
  }

  /** Hide error when key down */
  public hideError(name) {
    this.joinValidation[name + 'Message'] = '';
    this.joinValidation[name] = null
  }


  /** Delete profile picture */
  public removeProfileImage() {
    if (this.uploader.queue != null && this.uploader.queue.length > 0) {
      this.profileImage.nativeElement.src = this.defaultProfileImageSrc;
      this.uploader.clearQueue();
      this.profileImageFile.nativeElement.value = '';
    }
  }

  /** Close */
  public close() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.isShow = false;
  }

  /** Validation */
  public validation(type: string) {

    let text = this.user[type]; // TODO : 중간에 있는 space 없에야함
    isUndefined(text) ? text = '' : null;

    const idReg = /(^[0-9].*(?=[0-9a-zA-Z\.]{2,19}$)(?=.*\d?)(?=.*[a-zA-Z])(?=.*[\.]?).*$)|(^[a-zA-Z].*(?=[0-9a-zA-Z\.]{2,19}$)(?=.*\d?)(?=.*[a-zA-Z]?)(?=.*[\.]?).*$)/;
    // const passwordReg = /^.*(?=^.{10,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?`~]).*$/g;

    // 아이디 validation
    if ('username' === type) {
      if (text.length === 0) {
        return;
      }
      // 1. 아이디는 영문, 숫자 조합으로 3자에서 20자 이내로 한글은 사용할 수 없습니다
      if (!idReg.test(text) || text.length < 3 || text.length > 20) {
        this.joinValidation.username = false;
        this.joinValidation.usernameMessage
          = this.translateService.instant('LOGIN_JOIN_VALID_ID');
        return;
      }

      // 2. 아이디 중복체크 API
      this.userService.duplicateId(text).then((result) => {
        if (result.duplicated === true) {
          this.joinValidation.username = false;
          this.joinValidation.usernameMessage
            = this.translateService.instant('LOGIN_JOIN_USE_ID');
        } else {
          this.joinValidation.username = true;
        }
      }).catch(() => {
        this.joinValidation.username = false;
        this.joinValidation.usernameMessage
          = this.translateService.instant('LOGIN_JOIN_VALID_ID');
        return;
      });
      this.joinValidation.username = true;
    }
    // Email validation
    else if ('email' === type) {
      if (text.length === 0) {
        return;
      }
      if (!StringUtil.isEmail(text)) { // 이메일 형식에 맞는지 확인
        this.joinValidation.email = false;
        this.joinValidation.emailMessage
          = this.translateService.instant('LOGIN_JOIN_VALID_EMAIL');
        return;
      }

      // 이메일 중복체크 API
      this.userService.duplicateEmail(text)
        .then((result) => {
          if (result.duplicated === true) {
            this.joinValidation.email = false;
            this.joinValidation.emailMessage
              = this.translateService.instant('LOGIN_JOIN_USE_EMAIL');
          } else {
            this.joinValidation.email = true;
          }
        }).catch(() => {
        this.loadingHide();
        this.joinValidation.email = false;
        this.joinValidation.emailMessage
          = this.translateService.instant('LOGIN_JOIN_VALID_ID');
        return;
      });
      this.joinValidation.email = true;
    }
    // password confirm validation
    else if ('password' === type) {
      if (text.length === 0) {
        return;
      }
      this.userService.validatePassword(this.user)
        .then(() => {
          this.joinValidation.password = true;
        }).catch((error) => {
        this.loadingHide();
        this.joinValidation.password = false;
        if (StringUtil.isNotEmpty(error.code)) {
          this.joinValidation.passwordMessage
            = this.translateService.instant('login.ui.fail.' + error.code);
        } else {
          this.joinValidation.passwordMessage
            = this.translateService.instant('LOGIN_JOIN_VALID_PASSWORD2');
        }
        return;
      });
      this.joinValidation.password = true;
      if (StringUtil.isNotEmpty(this.user.confirmPassword)) {
        this.validation('confirmPassword');
      }
    } else if ('confirmPassword' === type) {
      if (text.length === 0) {
        return;
      }
      // check if password and confirmpassword is same
      if (this.user.password && this.user.confirmPassword && 0 !== this.user.password.length && 0 !== this.user.confirmPassword.length) {
        if (this.user.password !== this.user.confirmPassword) {
          this.joinValidation.confirmPassword = false;
          this.joinValidation.confirmPasswordMessage = this.translateService.instant('LOGIN_JOIN_NOMATCH_PASSWORD');
          return;
        } else {
          this.joinValidation.confirmPassword = true;
        }
      }
    }

    // 검증 통과시 validation true로 변경
    this.joinValidation[type] = true;

  } // function - validation

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Private Methods
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  // 입력값 검증 결과
  private isValid() {

    const validationList = Object.keys(this.joinValidation).filter((f) => {
      return f.indexOf('Message') === -1 && this.joinValidation[f] !== true;
    });
    return validationList.length === 0;
    // return true;
  }


  /** 초기화 */
  private resetValues() {

    this.user = new User();

    this.joinValidation = {
      username: null,
      usernameMessage: '',
      email: null,
      emailMessage: '',
      fullName: true,
      fullNameMessage: '',
      password: null,
      passwordMessage: '',
      confirmPassword: null,
      confirmPasswordMessage: '',
      tel: true,
      telMessage: '',
    };

  }

  /** View 초기화 */
  private initViewPage() {
    this.resetValues();
  }
}
