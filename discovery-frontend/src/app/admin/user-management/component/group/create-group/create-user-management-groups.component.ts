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

import { Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import { AbstractUserManagementComponent } from '../../../abstract.user-management.component';
import { Alert } from '@common/util/alert.util';
import { StringUtil } from '@common/util/string.util';
import { CommonUtil } from '@common/util/common.util';

@Component({
  selector: 'app-create-user-management-groups',
  templateUrl: './create-user-management-groups.component.html'
})
export class CreateUserManagementGroupsComponent extends AbstractUserManagementComponent {

  // 그룹 이름
  public groupName: string;
  // 그룹 설명
  public groupDesc: string;

  // name valid message
  public nameValidMessage: string;
  // desc valid message
  public descValidMessage: string;
  // name valid result
  public isValidName: boolean;
  // desc valid result
  public isValidDesc: boolean;

  // show flag
  public isShowPopup: boolean;

  @Output()
  public readonly createComplete: EventEmitter<any> = new EventEmitter();

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * init
   */
  public init(): void {
    this.groupName = undefined;
    this.groupDesc = undefined;
    this.isValidName = undefined;
    this.isValidDesc = undefined;
    this.nameValidMessage = undefined;
    this.descValidMessage = undefined;
    // 모달 show
    this.isShowPopup = true;
  }

  /**
   * close
   */
  public createCancel(): void {
    // 모달 hide
    this.isShowPopup = undefined;
  }

  /**
   * done
   */
  public createDone(): void {
    if (this.isValidName && (StringUtil.isEmpty(this.groupDesc) ? true : this.isValidDesc)) {
      // 로딩 show
      this.loadingShow();
      // 사용자에게 확인 이메일 전달
      this.groupsService.createGroup(this._getCreateGroupParams())
        .then(() => {
          // alert
          Alert.success(this.translateService.instant('msg.groups.alert.name.create', {value: this.groupName.trim()}));
          // 로딩 hide
          this.loadingHide();
          // 모달 hide
          this.isShowPopup = false;
          this.createComplete.emit();
        })
        .catch(error => this.commonExceptionHandler(error));
    }
  }

  /**
   * name validation
   */
  public nameValidation(): void {
    // 그룹 이름이 비어 있다면
    if (StringUtil.isEmpty(this.groupName)) {
      this.isValidName = false;
      this.nameValidMessage = this.translateService.instant('msg.groups.alert.name.empty');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.groupName.trim()) > 150) {
      this.isValidName = false;
      this.nameValidMessage = this.translateService.instant('msg.groups.alert.name.len');
      return;
    }
    // 중복 체크
    this._checkDuplicateGroupName(StringUtil.replaceURIEncodingInQueryString(this.groupName.trim()));
  }

  /**
   * description validation
   */
  public descValidation(): void {
    // 설명 길이 체크
    if (StringUtil.isNotEmpty(this.groupDesc) && CommonUtil.getByte(this.groupDesc.trim()) > 450) {
      this.isValidDesc = undefined;
      this.descValidMessage = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }
    this.isValidDesc = true;
  }

  /**
   * 그룹 생성시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateGroupParams(): object {
    const result = {
      name: this.groupName.trim(),
      predefined: false
    };
    // 설명이 있는 경우
    if (StringUtil.isNotEmpty(this.groupDesc)) {
      result['description'] = this.groupDesc.trim();
    }
    return result;
  }

  /**
   * 그룹 이름 중복 체크
   * @param {string} groupName
   * @private
   */
  private _checkDuplicateGroupName(groupName: string): void {
    this.groupsService.getResultDuplicatedGroupName(groupName)
      .then((result: {duplicated: boolean}) => {
        // 아이디 사용 가능한 여부
        this.isValidName = !result.duplicated;
        // 아이디가 중복 이라면
        if (result.duplicated) {
          this.nameValidMessage = this.translateService.instant('msg.groups.alert.name.used');
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}
