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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PermissionService} from '../../../../user/service/permission.service';
import {ActivatedRoute} from '@angular/router';
import {Role, RoleType} from '@domain/user/role/role';
import {UpdateUserManagementMembersComponent} from '../members/update-member/update-user-management-members.component';
import {RoleDirectory} from '@domain/user/role/roleDirectory';
import {AbstractUserManagementComponent} from '../../abstract.user-management.component';
import {SetMemberGroupContainerComponent} from './set-member-group-container.component';
import {CommonUtil} from '@common/util/common.util';

@Component({
  selector: 'app-detail-user-management-permission',
  templateUrl: './detail-user-management-permission.component.html'
})
export class DetailUserManagementPermissionComponent extends AbstractUserManagementComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public role: Role = new Role();
  public members: RoleDirectory[] = [];
  public groups: RoleDirectory[] = [];

  public simplifiedMemberList = [];
  public simplifiedGroupList = [];

  public defaultTab: number;
  public isSetMemberGroupOpen: boolean = false;

  public isMembersDropdownOpen: boolean = false;
  public isGroupsDropdownOpen: boolean = false;

  // 그룹 편집 화면
  @ViewChild(UpdateUserManagementMembersComponent)
  public _setGroupComponent: UpdateUserManagementMembersComponent;

  @ViewChild(SetMemberGroupContainerComponent)
  public _setMemberGroupContainerComponent: SetMemberGroupContainerComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public permissionService: PermissionService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected activatedRoute: ActivatedRoute) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.loadingShow();

    this.members = [];
    this.groups = [];

    this.activatedRoute.params.subscribe((params) => {
      // role Id 를 바탕으로 상세 정보 조회
      this.permissionService.getRoleDetail(params['roleId']).then(result => {
        this.role = result;
        this.getAssignedRoleMember();
        this.loadingHide();
      }).catch(err => this.commonExceptionHandler(err));
    });
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * navigate back  to permission list
   */
  public onClickPermissionList() {
    this.router.navigate(['/admin/user/permission'])
  }

  /**
   * Open / close member drop down
   */
  public openMembersDropdown() {
    this.isMembersDropdownOpen ? this.isMembersDropdownOpen = false : this.isMembersDropdownOpen = true;
  }

  /**
   * Open / close group drop down
   */
  public openGroupsDropdown() {
    this.isGroupsDropdownOpen ? this.isGroupsDropdownOpen = false : this.isGroupsDropdownOpen = true;
  }

  /**
   * Open edit popup
   * @param type {string} members or groups
   */
  public openEditPopup(type: string) {

    if (type === 'members') {
      this.defaultTab = 0;
      this.isSetMemberGroupOpen = true;

    } else if (type === 'groups') {
      this.defaultTab = 1;

      this.isSetMemberGroupOpen = true;
    }
  }

  /**
   * Close set member and group popup
   */
  public closeSetMemberGroupPopup() {
    this.isSetMemberGroupOpen = false;
  }

  /**
   * Get assigned members
   */
  public getAssignedRoleMember() {

    this.loadingShow();
    const promise = [];

    promise.push(this.getGroups(RoleType.GROUP));
    promise.push(this.getMembers(RoleType.USER));

    Promise.all(promise).then(() => {
      this.loadingHide();
    }).catch(() => {
      this.loadingHide();
    });

  }

  /**
   * Get assigned groups
   */
  public getGroups(type: RoleType) {
    return new Promise<any>((resolve) => {
      this.permissionService.getAssignedRoleMember(this.role.id, {type: type}).then(result => {
        if (result._embedded) {
          this.groups = result._embedded['roleDirectories'];
          this.simplifiedGroupList = [];
          this.groups.map((item) => {
            this.simplifiedGroupList.push({
              directoryId: item.directoryId,
              directoryName: item.directoryName,
              type: item.type
            });
          });
        } else {
          this.groups = [];
          this.simplifiedGroupList = [];
        }
        resolve(null);
      }).catch(err => this.commonExceptionHandler(err));
    });
  }

  /**
   * Get assigned members
   */
  public getMembers(type: RoleType) {
    return new Promise<any>((resolve) => {
      this.permissionService.getAssignedRoleMember(this.role.id, {type: type}).then(result => {
        if (result._embedded) {
          this.members = result._embedded['roleDirectories'];
          this.simplifiedMemberList = [];

          this.members.map((item) => {
            this.simplifiedMemberList.push({
              directoryId: item.directoryId,
              directoryName: item.directoryName,
              type: item.type
            });
          });
        } else {
          this.members = [];
          this.simplifiedMemberList = [];
        }
        resolve(null);
      }).catch(err => this.commonExceptionHandler(err));
    });
  }


  /**
   * Get members without first index
   */
  public filteredMembers() {
    return this.members.filter((item, index) => {
      if (index !== 0) {
        return item;
      }
    })
  }

  /**
   * Get groups without first index
   */
  public filteredGroups() {
    return this.groups.filter((item, index) => {
      if (index !== 0) {
        return item;
      }
    })
  }

  /**
   * 그룹 상세화면으로 들어가기
   * @param {string} groupId
   */
  public onClickLinkGroup(groupId: string): void {
    // 쿠키에 현재 url 저장
    this._savePrevRouterUrl();
    // 그룹 상세화면으로 이동
    this.router.navigate(['/admin/user/groups', groupId]);
  }

  public updateDetail() {
    this.isSetMemberGroupOpen = false;
    this.getAssignedRoleMember();
  }

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

  /**
   * 현재 url을 쿠키서비스에 저장
   * @private
   */
  private _savePrevRouterUrl(): void {
    this.cookieService.set('PREV_ROUTER_URL', this.router.url);
  }
}
