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

import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AbstractUserManagementComponent } from '../../../abstract.user-management.component';
import { isUndefined } from 'util';
import { Alert } from '../../../../../common/util/alert.util';
import { StringUtil } from '../../../../../common/util/string.util';
import { CommonUtil } from '../../../../../common/util/common.util';

@Component({
  selector: 'app-create-user-management-groups',
  templateUrl: './create-user-management-groups.component.html'
})
export class CreateUserManagementGroupsComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 모달 show hide 설정
  private _createModalShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 이름
  public groupName: string;
  // 그룹 설명
  public groupDesc: string;

  // name error message
  public nameMessage: string;
  // desc error message
  public descMessage: string;
  // name result
  public resultName: boolean;
  // desc result
  public resultDesc: boolean;

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
   * @param {User} user
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
    if (this.doneValidation()) {
      // 로딩 show
      this.loadingShow();
      // 사용자에게 확인 이메일 전달
      this.groupsService.createGroup(this._getCreateGroupParams())
        .then((result) => {
          // alert
          Alert.success(this.translateService.instant('msg.groups.alert.name.create', {value: this.groupName.trim()}));
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
   * init name validation
   */
  public initNameValidation(): void {
    this.resultName = undefined;
  }

  /**
   * init desc validation
   */
  public initDescValidation(): void {
    this.resultDesc = undefined;
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
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    // 이름
    if (!this.resultName) {
      this.nameValidation();
      return false;
    }
    return this.resultName && (this.resultDesc !== false);
  }

  /**
   * name validation
   */
  public nameValidation(): void {
    // 그룹 이름이 비어 있다면
    if (isUndefined(this.groupName) || this.groupName.trim() === ''){
      this.resultName = false;
      this.nameMessage = this.translateService.instant('msg.groups.alert.name.empty');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.groupName.trim()) > 150) {
      this.resultName = false;
      this.nameMessage = this.translateService.instant('msg.groups.alert.name.len');
      return;
    }
    // 중복 체크
    this._checkDuplicateGroupName(this.groupName.trim());
  }

  /**
   * description validation
   */
  public descValidation(): void {
    if (!isUndefined(this.groupDesc) && this.groupDesc.trim() !== '') {
      // 설명 길이 체크
      if (this.groupDesc.trim() !== ''
        && CommonUtil.getByte(this.groupDesc.trim()) > 450) {
        this.resultDesc = false;
        this.descMessage = this.translateService.instant('msg.alert.edit.description.len');
        return;
      }
      this.resultDesc = true;
    }
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
    this.groupName = '';
    this.groupDesc = '';
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
    if (this.groupDesc.trim() !== '') {
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
      .then((result) => {
        // 아이디 사용 가능한 여부
        this.resultName = !result['duplicated'];
        // 아이디가 중복 이라면
        if (result['duplicated']) {
          this.nameMessage = this.translateService.instant('msg.groups.alert.name.used');
        }
      })
      .catch((error) => {

      });
  }
}
