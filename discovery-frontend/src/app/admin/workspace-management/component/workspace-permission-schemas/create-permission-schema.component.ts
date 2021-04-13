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

import { AbstractPopupComponent } from '@common/component/abstract-popup.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { RoleSet, RoleSetScope } from '@domain/user/role/roleSet';
import { PermissionSchemaComponent } from '../../../../workspace/component/permission/permission-schema.component';
import { CommonUtil } from '@common/util/common.util';
import { StringUtil } from '@common/util/string.util';

@Component({
  selector: 'app-create-permission-schema',
  templateUrl: './create-permission-schema.component.html',
})
export class CreatePermissionSchemaComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PermissionSchemaComponent)
  private _permSchemaComp: PermissionSchemaComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public afterCreate: EventEmitter<RoleSet> = new EventEmitter();

  // 컴포넌트 표시 여부
  public isShow: boolean = false;

  // 생성할 RoleSet 정보
  public roleSet: RoleSet;

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 유효성 관련 - 설명
  public isInvalidDesc: boolean = false;
  public errMsgDesc: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
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
  /**
   * 컴포넌트 실행
   */
  public init() {
    this.addBodyScrollHidden();
    const roleSet: RoleSet = new RoleSet();
    roleSet.scope = RoleSetScope.PUBLIC;
    this.roleSet = roleSet;
    this.isShow = true;
  } // function - init

  /**
   * 화면 종료
   */
  public close() {
    this.removeBodyScrollHidden();
    this.isShow = false;
  } // function - close

  /**
   * RoleSet 생성 후 화면 종료
   */
  public done() {

    // 이름 입력 체크
    if (StringUtil.isEmpty(this.roleSet.name)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }

    // 이름 길이 체크
    if (CommonUtil.getByte(this.roleSet.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }

    // 설명 길이 체크
    if (this.roleSet.description != null
      && CommonUtil.getByte(this.roleSet.description.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }

    this.loadingShow();
    this._permSchemaComp.setRoleSets(this.roleSet.name, this.roleSet.description).then(result => {
      this.loadingHide();
      this.afterCreate.emit(result);
      this.close();
    });
  } // function - done

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
