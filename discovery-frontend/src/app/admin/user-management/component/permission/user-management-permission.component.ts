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
import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {PermissionService} from '../../../../user/service/permission.service';
import {Role} from 'app/domain/user/role/role';
import {CommonUtil} from 'app/common/util/common.util';

@Component({
  selector: 'app-user-management-permission',
  templateUrl: './user-management-permission.component.html'
})
export class UserManagementPermissionComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public roleList: Role[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private permissionService: PermissionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.loadingShow();
    this.permissionService.getRoles({scope: 'GLOBAL'}).then((roles) => {
      if (roles['_embedded'] && roles['_embedded']['roles']) {
        this.roleList = roles['_embedded']['roles'].filter(item => {
          return item.name !== '__ADMIN' && item.name !== '__GUEST';
        });
      }
      this.loadingHide();
    }).catch(err => this.commonExceptionHandler(err));
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * Navigate to role detail page
   * @param {Role} role
   */
  public moveToRoleDetail(role: Role) {
    this.router.navigate(['/admin/user/permission/', role.id]).then();
  } // function - moveToRoleDetail

  /**
   * 시스템의 RoleName 을 이용하여, Resource에 정의된 Role 명칭을 얻음
   * @param {string} role
   * @return {string}
   */
  public getRoleName(role: string): string {
    const strMsgCode: string = CommonUtil.getMsgCodeBySystemRole(role);
    return ('' === strMsgCode) ? '' : this.translateService.instant(strMsgCode);
  } // function - getRoleName

  /**
   * 시스템의 RoleName 을 이용하여, Resource에 정의된 Role 설명을 얻음
   * @param {string} role
   * @return {string}
   */
  public getRoleDesc(role: string): string {
    const strMsgCode: string = CommonUtil.getMsgCodeBySystemRole(role);
    return ('' === strMsgCode) ? '' : this.translateService.instant(strMsgCode + '.desc');
  } // function - getRoleDesc

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
