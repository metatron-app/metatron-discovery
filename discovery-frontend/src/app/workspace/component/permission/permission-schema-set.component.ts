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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {RoleSet} from 'app/domain/user/role/roleSet';
import {PermissionService} from '../../../user/service/permission.service';
import {PermissionSchemaComponent} from './permission-schema.component';

@Component({
  selector: 'app-permission-schema-set',
  templateUrl: './permission-schema-set.component.html',
})
export class PermissionSchemaSetComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PermissionSchemaComponent)
  private _permSchemaComp: PermissionSchemaComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public afterUpdate: EventEmitter<RoleSet> = new EventEmitter();

  // 컴포넌트 화면 표시 여부
  public isShow: boolean = false;

  // 현재 워크스페이스의 메인 RoleSet??
  public roleSet: RoleSet;

  // API를 이용하여 직접 RoleSet 관리 여부
  public useAPI: boolean = true;

  // 수정 모드
  public editMode: boolean = true;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected permissionService: PermissionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
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
   * 컴포넌트 시작
   * @param {RoleSet} initialData
   * @param {boolean} editMode
   * @param {boolean} useAPI
   */
  public init(initialData: RoleSet, editMode: boolean = true, useAPI: boolean = true) {
    $('body').removeClass('body-hidden').addClass('body-hidden');
    this.roleSet = initialData;
    this.editMode = editMode;
    this.useAPI = useAPI;
    this.isShow = true;
  } // function - init

  /**
   * 컴포넌트 닫기
   */
  public close() {
    $('body').removeClass('body-hidden');
    this.isShow = false;
  } // function - close

  /**
   * 퍼미션 설정 완료 및 컴포넌트 닫기
   */
  public done() {
    this.loadingShow();
    this._permSchemaComp.setRoleSets().then((result) => {
      this.loadingHide();
      this.afterUpdate.emit(result);
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
