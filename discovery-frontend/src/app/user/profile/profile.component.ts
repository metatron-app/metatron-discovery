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

import {
  Component, ElementRef, EventEmitter, HostListener, Injector, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {FileUploader} from 'ng2-file-upload';
import {CommonConstant} from '../../common/constant/common.constant';
import {Alert} from '../../common/util/alert.util';
import {User} from '../../domain/user/user';
import {UserService} from '../service/user.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {CommonUtil} from '../../common/util/common.util';
import {StringUtil} from '../../common/util/string.util';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {Group} from '../../domain/user/group';
import {WorkspaceService} from '../../workspace/service/workspace.service';
import {Workspace} from '../../domain/workspace/workspace';
import {CookieConstant} from '../../common/constant/cookie.constant';
import {Modal} from '../../common/domain/modal';
import {ConfirmModalComponent} from '../../common/component/modal/confirm/confirm.component';
import {EventBroadcaster} from '../../common/event/event.broadcaster';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 파일 업로드 결과
  private _uploadResult;

  // userID
  private _userId: string;
  // 기존 이메일
  private _userEmail: string;
  // 기존 이름
  private _userName: string;
  // 기존 phone
  private _userTel: string;
  // 기존 image
  private _imageUrl: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 패스워드 변경 컴포넌트
  @ViewChild(ChangePasswordComponent)
  public changePasswordComponent: ChangePasswordComponent;

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComp: ConfirmModalComponent;

  // User Domain
  public user: User;

  // 팝업 Show 플래그
  public isShow = false;

  // email flag
  public resultEmail: boolean;
  // name flag
  public resultName: boolean;

  // email error message
  public emailMessage: string;
  // name error message
  public nameMessage: string;

  // 사용자 권한
  public permissions: string;

  // 워크스페이스 정보
  public privateWorkspace: Workspace;
  public sharedWorkspaces: Workspace[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables - 파일 업로드 관련
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 파일 업로드
  public uploader: FileUploader;

  // 프로필 기본 이미지 경로
  public defaultProfileImageSrc: string = '/assets/images/img_photo3.png';

  // 프로필 이미지 (img)
  @ViewChild('profileImage') profileImage: any;

  // 프로필 이미지 파일(input)
  @ViewChild('profileImageFile') profileImageFile: any;

  @Output()
  public completeUpdate: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              private userService: UserService,
              private workspaceService: WorkspaceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
    // 이미지 업로드 URL 설정
    this.uploader
      = new FileUploader({url: CommonConstant.API_CONSTANT.API_URL + 'images/upload'});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public get isImageChanged(): boolean {
    const userImage = isNullOrUndefined(this.user.imageUrl) ? '' : this.user.imageUrl.trim();
    return this._imageUrl !== userImage;
  } // function - isImageChanged

  /**
   * Phone 변경 여부
   */
  public get isPhoneChanged(): boolean {
    const userTel = isNullOrUndefined(this.user.tel) ? '' : this.user.tel.trim();
    return this._userTel !== userTel;
  } // function - isPhoneChanged

  /**
   * E-Mail 변경 여부
   */
  public get isEmailChanged(): boolean {
    const userEmail = isNullOrUndefined(this.user.email) ? '' : this.user.email.trim();
    return this._userEmail !== userEmail;
  } // function - isEmailChanged

  /**
   * Full Name 변경 여부
   */
  public get isFullNameChanged(): boolean {
    const userName = isNullOrUndefined(this.user.fullName) ? '' : this.user.fullName.trim();
    return this._userName !== userName;
  } // function - isFullNameChanged

  /** Init */
  public init(user: User) {
    // 초기화
    this.user = user ? user : new User();
    // 팝업 show
    this.isShow = true;
    // 팝업시 하단 스크롤 hide
    $("body").css("overflow", "hidden");
    // 유저 profile 정보 조회
    this._getProfile(user.id);
  }

  /**
   * done
   */
  public done(): void {
    // 프로필 수정이 가능하다면
    if ((this.isPhoneChanged || this.isEmailChanged || this.isFullNameChanged || this.isImageChanged) && this.doneValidation()) {
      // 로딩 show
      this.loadingShow();
      // 프로필 사진이 있으면 프로필사진 업로드부터 시행
      if (this.profileImageFile.nativeElement.value
        != null && this.profileImageFile.nativeElement.value !== '') {
        // 프로필 사진 업로드
        this._updateProfileImage();
      } else {
        // 사용자 수정 호출
        this._updateProfile();
      }
    }
  }

  /**
   * close
   */
  public close(): void {
    // 업로드 완료 후
    this.onClickDeleteProfileImage();
    // flag
    this.isShow = false;
    // 팝업종료시 하단 스크롤 show
    $("body").css("overflow", "");
  }


  /** upload profile image */
  public profilePreview($event) {

    if ($event.target.files && $event.target.files[0]) {
      // only jpg, png is allowed
      if ($event.target.files[0].type === 'image/jpeg' || $event.target.files[0].type === 'image/png') {
        const reader = new FileReader();

        reader.onload = (event: any) => {
          this.profileImage.nativeElement.src = event.target.result;
          this._imageUrl = event.target.result;   // 이미지 변경을 인식하기 위한 임시 적용
        };
        reader.readAsDataURL($event.target.files[0]);
      } else {
        Alert.warning(this.translateService.instant('login.join.file.format'));
        return;
      }
    }
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
   * 사용자가 속한 그룹의 수
   * @returns {number}
   */
  public getGroupLength(): number {
    return this._getGroupList().length;
  }

  /**
   * 사용자가 속한 그룹
   * @returns {string}
   */
  public getGroup(): string {
    return this._getGroupList().map((group) => {
      return group.name;
    }).join(', ');
  }

  /**
   * 프로필 이미지
   * @returns {string}
   */
  public getProfileImage(): string {
    return this.user.hasOwnProperty('imageUrl') && this.user.imageUrl !== ''
      ? '/api/images/load/url?url=' + this.user.imageUrl + '/thumbnail'
      : this.defaultProfileImageSrc;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * email validation
   */
  public emailValidation(): void {
    // 이메일이 비어 있다면
    if (isUndefined(this.user.email) || this.user.email.trim() === '') {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_INPUT_EMAIL');
      return;
    }
    // 이메일 형식 확인
    if (!StringUtil.isEmail(this.user.email.trim())) {
      this.resultEmail = false;
      this.emailMessage = this.translateService.instant('LOGIN_JOIN_VALID_EMAIL');
      return;
    }
    // 이메일이 기존과 같다면
    if (this._userEmail === this.user.email.trim()) {
      this.resultEmail = true;
      return;
    }
    // 중복 확인
    this._checkDuplicateEmail(this.user.email.trim());
  }

  /**
   * name validation
   */
  public nameValidation(): void {
    // 이름이 비어 있다면
    if (isUndefined(this.user.fullName) || this.user.fullName.trim() === '') {
      this.resultName = false;
      this.nameMessage = this.translateService.instant('LOGIN_JOIN_INPUT_NAME');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.user.fullName.trim()) > 150) {
      this.resultName = false;
      this.nameMessage = this.translateService.instant('msg.alert.edit.name.len');
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
    // 이메일
    if (!this.resultEmail) {
      this.emailValidation();
      return false;
    }
    return this.resultEmail && this.resultName;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 프로필 이미지 제거 버튼 클릭
   */
  public onClickDeleteProfileImage(): void {
    if (this.uploader.queue != null && this.uploader.queue.length > 0) {
      this.profileImage.nativeElement.src = this.defaultProfileImageSrc;
      this.uploader.clearQueue();
      this.profileImageFile.nativeElement.value = '';
    }
    // image url init
    if (this.user.imageUrl) {
      this.user.imageUrl = '';
    }
  }

  /**
   * 패스워드 변경 모달 오픈
   */
  public onClickChangePassword(): void {
    this.changePasswordComponent.init(this._userId);
  }

  @HostListener('mousemove')
  public onMouseHoverFileButton() {

  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이메일 중복체크
   * @param {string} email
   * @private
   */
  private _checkDuplicateEmail(email: string): void {
    this.userService.duplicateEmail(email)
      .then((result) => {
        // 이메일 사용 가능한 여부
        this.resultEmail = !result['duplicated'];
        // 이메일이 중복 이라면
        if (result['duplicated']) {
          this.emailMessage = this.translateService.instant('LOGIN_JOIN_USE_EMAIL');
        }
      })
      .catch(() => {
        this.resultEmail = false;
      });
  }

  /**
   * 프로필 정보 업데이트
   * @private
   */
  private _updateProfile(): void {
    // 로딩 show
    this.loadingShow();
    this.userService.updateUser(this._userId, this._getUpdateProfileParams())
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // success alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // close
        this.close();
        // event emit
        this.completeUpdate.emit(result);
      })
      .catch(() => {
        // error alert
        Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 프로필 이미지 업로드
   * @private
   */
  private _updateProfileImage(): void {
    // 메서드 설정
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };

    // 헤더설정
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL
        + 'images/upload'
        + '?domain=user&itemId=' + this._userId,
      headers: [{
        name: 'Accept',
        value: 'application/json, text/plain, */*',
      }],
    });

    // 이미지 업로드 콜백 설정
    // 업로드 완료
    this.uploader.onCompleteAll = () => {
      if (this._uploadResult && this._uploadResult.success) {
        // 사용자 수정 호출
        this._updateProfile();
      }
    };

    // 이미지 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this._uploadResult = {success, item, response, status, headers};
      // 이미지 주소 parse
      const result = JSON.parse(response);
      // user에 imageUrl 저장
      this.user.imageUrl = result['imageUrl'];
    };

    // 에러 처리
    this.uploader.onErrorItem = () => {
      // TODO 이미지 업로드 에러 처리
      console.log('error');
      this.loadingHide();
    };

    // 업로드
    this.uploader.uploadAll();
    this.loadingHide();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 사용자 정보 조회
   * @param {string} userId
   * @private
   */
  private _getProfile(userId:string): void {
    // 로딩 show
    this.loadingShow();
    this.userService.getUserDetail(userId)
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // 사용자 정보 저장
        this.user = result;

        // 사용자 권한 목록
        if (result.roleNames) {
          this.permissions = result.roleNames.map(role => {
            const strMsgCode: string = CommonUtil.getMsgCodeBySystemRole(role);
            return ('' === strMsgCode) ? '' : this.translateService.instant(strMsgCode);
          }).join(',');
        }

        // email flag
        this.resultEmail = true;
        // name flag
        this.resultName = true;

        // user ID
        this._userId = isNullOrUndefined(result.username) ? '' : result.username.trim();
        // user email
        this._userEmail = isNullOrUndefined(result.email) ? '' : result.email.trim();
        // user name
        this._userName = isNullOrUndefined(result.fullName) ? '' : result.fullName.trim();
        // user tel
        this._userTel = isNullOrUndefined(result.tel) ? '' : result.tel.trim();
        // user image
        this._imageUrl = isNullOrUndefined(result.imageUrl) ? '' : result.imageUrl.trim();

        this.safelyDetectChanges();

        // 워크스페이스 정보 조회
        this._getWorkspace();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 사용자 정보 수정시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getUpdateProfileParams(): object {
    const result = {};
    // 이메일 변경이 일어난 경우
    if (this._userEmail !== this.user.email.trim()) {
      result['email'] = this.user.email.trim();
    }
    // 이름 변경이 일어난 경우
    if (this._userName !== this.user.fullName.trim()) {
      result['fullName'] = this.user.fullName.trim();
    }

    // phone 변경이 일어난 경우
    if (this._userTel !== this.user.tel) {
      result['tel'] = this.user.tel;
    }
    // 이미지 변경
    if (this._imageUrl !== this.user.imageUrl) {
      result['imageUrl'] = this.user.imageUrl;
    }
    return result;
  }

  /**
   * 그룹 리스트
   * @returns {Group[]}
   * @private
   */
  private _getGroupList() {
    return isUndefined(this.user.groups) ? [] : this.user.groups;
    // : this.user.groups.filter((group) => {
    //   return group.predefined === false;
    // });
  }

  /**
   * 개인 워크스페이스 조회
   */
  private _getWorkspace() {
    // 로딩 show
    this.loadingShow();

    // 워크스페이스 정보 초기화
    this.privateWorkspace = null;
    this.sharedWorkspaces = [];

    // 개인 워크스페이스 조회
    this.workspaceService.getMyWorkspace('forDetailView').then((workspace) => {

      // 개인 워크스페이스 정보 저장
      (workspace) && (this.privateWorkspace = workspace);

      // 공유 워크스페이스 조회
      this.workspaceService.getSharedFavoriteWorkspaces('default').then((workspaces) => {

        // 데이터 존재 시 데이터 저장
        (workspaces['_embedded']) && (this.sharedWorkspaces = workspaces['_embedded']['workspaces']);

        this.safelyDetectChanges();

        // 로딩 hide
        this.loadingHide();

      });

    });
  } // function - _getWorkspace

  /**
   * 워크스페이스로 이동
   */
  public moveToWorkspace(workspace?: Workspace) {
    if (workspace && !workspace.active) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.space.alert.workspace.disabled');
      modal.description = this.translateService.instant('msg.space.alert.workspace.disabled.desc');
      modal.subDescription = this.translateService.instant('msg.space.alert.workspace.disabled.desc.sub');
      modal.isShowCancel = false;
      modal.btnName = this.translateService.instant('msg.comm.ui.ok');
      modal.data = {
        type: 'INACTIVE',
        afterConfirm: function () {
        }
      };
      this._confirmModalComp.init(modal);
    } else {
      const workspaceId: string = (workspace) ? workspace.id : 'my';
      let navigateInfo: string[] = [];
      if (workspaceId) {
        navigateInfo = ['/workspace', workspaceId];
      } else {
        navigateInfo = ['/workspace'];
      }

      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제
      if (navigateInfo.includes('/workspace') && this.router.url === navigateInfo.join('/')) {
        this.broadCaster.broadcast('moveFromLnb', workspaceId);
      } else {
        this.router.navigate(navigateInfo).then(); // 이동
      }

      // 프로필 닫음
      this.close();
    }
  } // function - moveToWorkspace

}
