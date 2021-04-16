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
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {UserService} from '../../../user/service/user.service';
import {User} from '@domain/user/user';
import {Role} from '@domain/user/role/role';
import {WorkspaceService} from '../../service/workspace.service';
import {Alert} from '@common/util/alert.util';
import * as _ from 'lodash';
import {Page} from '@domain/common/page';
import {GroupsService} from '../../../admin/user-management/service/groups.service';
import {Workspace} from '@domain/workspace/workspace';
import {RoleSet} from '@domain/user/role/roleSet';
import {PermissionService} from '../../../user/service/permission.service';

@Component({
  selector: 'app-shared-member-manage',
  templateUrl: './shared-member-manage.component.html',
})
export class SharedMemberManageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크스페이스
  private _workspace: Workspace;

  // 원본 워크스페이스 멤버
  private _orgWsUsers: any[] = [];
  private _orgWsGroups: any[] = [];

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public manageComplete = new EventEmitter();

  // 팝업 닫기
  public isShow: boolean = false;

  public users: User[] = [];      // 유저 리스트
  public groups: Role[] = [];     // 그룹 리스트
  public totalUsers: number = 0;   // 전체 유저수
  public totalGroups: number = 0;  // 전체 그룹수

  // 현재 (변경된) 워크스페이스 멤버
  public workspaceUsers: any[] = [];
  public workspaceGroups: any[] = [];

  public isShowUserTab: boolean = true;       // 사용자 탭 메뉴 표시여부
  public isCheckAllUser: boolean = false;     // 사용자 전체 체크 여부
  public isCheckAllGroup: boolean = false;    // 그룹 전체 체크 여부

  // 페이지 번호
  public allUserListPageNum: number = 0;
  public allGroupListPageNum: number = 0;
  public memberUserListPageNum: number = 0;
  public memberGroupListPageNum: number = 0;

  // 더보기 표시 여부
  public showMoreAllUser: boolean = false;
  public showMoreAllGroup: boolean = false;
  public showMoreWsUser: boolean = false;
  public showMoreWsGroup: boolean = false;

  // 검색어
  public searchText: string = '';

  // 퍼미션 스키마 팝업 표시 여부
  public isShowPermSchemaPopup: boolean = false;
  public roleSet: RoleSet;
  public defaultRole: Role;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              protected renderer: Renderer2,
              private permissionService: PermissionService,
              private userService: UserService,
              private groupService: GroupsService,
              private workspaceService: WorkspaceService) {
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
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /**
   * 화면 클릭 시
   */
  @HostListener('click', ['$event'])
  public clickListener(event: MouseEvent) {
    const $targetElm: any = $(event.target);
    if (!$targetElm.hasClass('ddp-ui-selected-option') && 0 === $targetElm.closest('.ddp-ui-selected-option').length) {
      this.$element.find('.ddp-ui-selected-option').removeClass('ddp-selected');
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기 실행
   * @param {Workspace} workspace
   */
  public init(workspace: Workspace) {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // 초기화
    this._reset();

    this.isShow = true;

    this.safelyDetectChanges();

    // 워크스페이스 정보 설정
    this._workspace = workspace;

    const promise = [];
    this.loadingShow();
    promise.push(this._getWorkspaceUsers(workspace.id));
    promise.push(this._getUsers());
    promise.push(this._getWorkspaceGroups(workspace.id));
    promise.push(this._getGroups());
    promise.push(new Promise((resolve, reject) => {
      this.permissionService.getRolesetDetail(workspace.roleSets[0].id).then((result: RoleSet) => {
        this.roleSet = result;
        this.defaultRole = result.roles.find(item => item.defaultRole);
        this.safelyDetectChanges();
        resolve(null);
      }).catch(err => reject(err));
    }));
    Promise.all(promise).then(() => {
      this.loadingHide();
      this.safelyDetectChanges();
    }).catch(() => {
      this.loadingHide();
      this.safelyDetectChanges();
    });
  } // function - init

  /**
   * 현재 추가할 유저 이미지 로드 api
   * @param item
   * @returns {any}
   */
  public getUserImage(item) {
    if (item.hasOwnProperty('imageUrl') && item.imageUrl) {
      return '/api/images/load/url?url=' + item.imageUrl + '/thumbnail';
    }
    return '/assets/images/img_photo.png';
  } // function - getUserImage

  /**
   * 공유 유저 | 그룹 수정 api
   */
  public updateUser() {
    this.loadingShow();
    const param = this._getAddMembers();    // 업데이트 할 멤버 데이터 조회
    this.workspaceService.updateWorkspaceUser(this._workspace.id, param).then(() => {
      this.loadingHide();
      Alert.success(this.translateService.instant('msg.space.alert.edit.member.success'));
      this.close(true);   // 닫기
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.space.alert.edit.member.fail'));
      this.loadingHide();
    });
  } // function - UpdateUser

  /**
   * 전체 체크 여부 확인
   */
  public isCheckAll() {
    // 전체 체크 여부 확인
    if (this.isShowUserTab) {
      this.isCheckAllUser = !this.users.some(item => !this.checkIsSharedTarget(item));
    } else {
      this.isCheckAllGroup = !this.groups.some(item => !this.checkIsSharedTarget(item));
    }
  } // function - isCheckAll

  /**
   * 전체 선택을 체크한다.
   */
  public clickCheckAll() {
    if (this.isShowUserTab) {
      this.isCheckAllUser = !this.isCheckAllUser;
      if (this.isCheckAllUser) {
        this.users.forEach(user => {
          if (-1 === this.workspaceUsers.findIndex(item => user.username === item.member.username)) {
            this.workspaceUsers.push({
              role: this.defaultRole.name,
              member: {
                type: 'user',
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                imageUrl: user.imageUrl
              }
            });
          }
        });
      } else {
        this.workspaceUsers = [];
      }
    } else {
      this.isCheckAllGroup = !this.isCheckAllGroup;
      if (this.isCheckAllGroup) {
        this.groups.forEach(group => {
          if (-1 === this.workspaceGroups.findIndex(item => group.id === item.member.id)) {
            this.workspaceGroups.push({
              role: this.defaultRole.name,
              member: {type: 'role', id: group.id, name: group.name}
            });
          }
        });
      } else {
        this.workspaceGroups = [];
      }
    }
  } // function - clickCheckAll

  /**
   * 공유 멤버(사용자/그룹) 추가/삭제
   * @param selectedItem
   */
  public setSharedTarget(selectedItem) {
    const list = this.isShowUserTab ? this.workspaceUsers : this.workspaceGroups;
    const memberIds = list.map((m) => m.member.username || m.member.id);
    const targetId = selectedItem.username || selectedItem.id;
    const selectedIdx = memberIds.indexOf(targetId);

    if (-1 === selectedIdx) {
      const target = this.isShowUserTab ? {
        role: this.defaultRole.name,
        member: {
          type: 'user',
          id: selectedItem.id,
          username: selectedItem.username,
          fullName: selectedItem.fullName,
          email: selectedItem.email,
          imageUrl: selectedItem.imageUrl
        }
      } : {
        role: this.defaultRole.name,
        member: {
          type: 'role',
          id: selectedItem.id,
          name: selectedItem.name
        }
      };
      list.push(target);
    } else {
      list.splice(selectedIdx, 1);
    }

    // 전체 체크 확인
    this.isCheckAll();
  } // function - setSharedTarget

  /**
   * 멤버 리스트 체크상태 확인
   * @param selectedItem
   * @returns {boolean}
   */
  public checkIsSharedTarget(selectedItem): boolean {
    if (selectedItem) {
      const list = this.isShowUserTab ? this.workspaceUsers : this.workspaceGroups;
      const memberIds = list.map((m) => m.member.username || m.member.id);
      const targetId = selectedItem.username || selectedItem.id;
      const selectedIdx = memberIds.indexOf(targetId);
      return (selectedIdx > -1);
    } else {
      return false;
    }
  } // function - checkIsSharedTarget

  /**
   * 검색 조회 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public searchDataPressKey(event: KeyboardEvent) {
    (13 === event.keyCode) && (this.searchData());
  } // function - searchDataPressKey

  /**
   * 검색
   */
  public searchData() {
    this.loadingShow();
    // 검색어 설정
    this.searchText = this._inputSearch.nativeElement.value;
    // 데이터 조회
    if (this.isShowUserTab) {
      this._getUsers().then(() => this.loadingHide())
    } else {
      this._getGroups().then(() => this.loadingHide());
    }
  } // function - searchData

  /**
   * 검색어 리셋
   */
  public resetSearchText(isClear: boolean) {
    if (isClear) {
      this._inputSearch.nativeElement.value = '';
    } else {
      // 검색어 설정
      this._inputSearch.nativeElement.value = this.searchText;
    }
  } // function - resetSearchText

  /**
   * 전체 사용자 혹은 그룹의 다음 목록을 조회한다.
   */
  public getMore() {
    this.loadingShow();
    if (this.isShowUserTab) {
      this.allUserListPageNum++;
      this._getUsers(this.allUserListPageNum).then(() => {
        this.isCheckAll();    // 전체 체크 확인
        this.loadingHide();
      });
    } else {
      this.allGroupListPageNum++;
      this._getGroups(this.allGroupListPageNum).then(() => {
        this.isCheckAll();    // 전체 체크 확인
        this.loadingHide();
      });
    }
  } // function - getMore

  /**
   * 워크스페이스 사용자 혹은 그룹의 다음 목록을 조회한다.
   */
  public getWsMemberMore() {
    this.loadingShow();
    if (this.isShowUserTab) {
      this.memberUserListPageNum++;
      this._getWorkspaceUsers(this._workspace.id, this.memberUserListPageNum).then(() => {
        this.isCheckAll();    // 전체 체크 확인
        this.loadingHide();
      });
    } else {
      this.memberGroupListPageNum++;
      this._getWorkspaceGroups(this._workspace.id, this.memberGroupListPageNum).then(() => {
        this.isCheckAll();    // 전체 체크 확인
        this.loadingHide();
      });
    }
  } // function - getWsMemberMore

  /**
   * 닫기
   * @param {boolean} completeFl
   */
  public close(completeFl?: boolean) {
    // 팝업 닫기
    this.isShow = false;
    this.manageComplete.emit(completeFl);
    this.renderer.removeStyle(document.body, 'overflow');
  } // function - close

  /**
   * 권한 이름 조회
   * @param name
   * @return {string}
   */
  public getPredefinedName(name): string {

    if (['SYSTEM_ADMIN', 'SYSTEM_SUPERVISOR', 'SYSTEM_USER'].indexOf(name) > -1) {
      const roleName = name.replace(/^.*_/, '').toLowerCase();
      return this.translateService.instant('msg.usr.role.system.' + roleName);
    }

    return name;
  }

  /**
   * 유저 탭 클릭
   */
  public clickUserTab() {
    this.isShowUserTab = true;
    this.isShowPermSchemaPopup = false;
    this.resetSearchText(true);
    this.searchData();
  } // function - clickUserTab

  /**
   * 그룹 탭 클릭
   */
  public clickGroupTab() {
    this.isShowUserTab = false;
    this.isShowPermSchemaPopup = false;
    this.resetSearchText(true);
    this.searchData();
  } // function - clickGroupTab

  /**
   * 롤 콤보 박스 클릭 이벤트
   */
  public clickRoleCombobox(userInfo) {
    userInfo['selected'] = !userInfo['selected'];
    this.workspaceUsers.forEach(item => {
      if (item.member.username !== userInfo.member.username) {
        item['selected'] = false;
      }
    });
  } // function - clickRoleCombobox
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 추가 할 멤버 데이터 가공
   * @returns {Array}
   * @private
   */
  private _getAddMembers() {
    const params = [];

    const orgMembers: any[] = this._orgWsUsers.concat(this._orgWsGroups);
    const updateMembers: any[] = this.workspaceUsers.concat(this.workspaceGroups);

    // 현재 워크스페이스 멤버
    const originMemberIds = orgMembers.map((item) => item.member.username || item.member.id);

    // 추가 및 업데이트 처리
    updateMembers.forEach((updateMember) => {
      const memberInfo = {
        memberId: updateMember.member.username || updateMember.member.id,
        role: updateMember.role
      };

      // 기존 목록에 있는 사용자라면 업데이트
      const targetIdx: number = originMemberIds.indexOf(memberInfo.memberId);
      if (-1 < targetIdx) {
        const targetItem = orgMembers[targetIdx];
        if (targetItem.role !== memberInfo.role) {
          memberInfo['op'] = 'replace';
          params.push(memberInfo);
        }
      } else {
        // 기존 목록에 사용자 추가
        memberInfo['op'] = 'add';
        memberInfo['memberType'] = updateMember.member.type === 'user' ? 'USER' : 'GROUP';
        params.push(memberInfo);
      }
    });

    // 기존 목록에서 아이디 추출
    const memberIds = updateMembers.map((m) => m.member.username || m.member.id);

    // 삭제 처리
    orgMembers.forEach((obj) => {
      const delTargetId = obj.member.username || obj.member.id;
      if (memberIds.indexOf(delTargetId) === -1) {
        params.push({
          op: 'remove',
          memberId: delTargetId
        });
      }
    });

    return params;
  } // function - _getAddMembers

  /**
   * 워크스페이스 사용자 목록 조회
   * @param {string} workspaceId
   * @param {number} pageNum
   * @private
   */
  private _getWorkspaceUsers(workspaceId: string, pageNum: number = 0) {
    return new Promise((resolve, reject) => {
      (0 === pageNum) && (this.workspaceUsers = []);
      const param: Page = new Page();
      param.sort = 'memberName,asc';
      param.page = pageNum;
      (0 === pageNum) && (this.allGroupListPageNum = 0);
      this.workspaceService.getWorkspaceUsers(workspaceId, param).then((data) => {
        // 데이터 있다면
        if (data['_embedded']) {
          this.workspaceUsers = this.workspaceUsers.concat(data['_embedded']['members']);
        }
        this.showMoreWsUser = this._checkShowMore(data.page);
        this._orgWsUsers = _.cloneDeep(this.workspaceUsers);
        this.safelyDetectChanges();
        resolve(null);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        reject();
      });
    });

  }  // function - _getWorkspaceUsers

  /**
   * 워크스페이스 그룹 목록 조회
   * @param {string} workspaceId
   * @param {number} pageNum
   * @private
   */
  private _getWorkspaceGroups(workspaceId: string, pageNum: number = 0) {
    return new Promise((resolve, reject) => {
      (0 === pageNum) && (this.workspaceGroups = []);
      const param: Page = new Page();
      param.sort = 'memberName,asc';
      param.page = pageNum;
      (0 === pageNum) && (this.memberGroupListPageNum = 0);

      this.workspaceService.getWorkspaceGroups(workspaceId, param).then((data) => {
        // 데이터 있다면
        if (data['_embedded']) {
          this.workspaceGroups = this.workspaceGroups.concat(data['_embedded']['members']);
        }
        this.showMoreWsGroup = this._checkShowMore(data.page);
        this._orgWsGroups = _.cloneDeep(this.workspaceGroups);
        this.safelyDetectChanges();
        resolve(null);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        reject();
      });
    });
  }  // function - _getWorkspaceGroups

  /**
   * 전체 유저 조회 Api
   * @param {number} pageNum
   * @private
   */
  private _getUsers(pageNum: number = 0) {
    return new Promise((resolve, reject) => {

      const param: SearchParam = new SearchParam();
      param.page = pageNum;
      param.sort = 'username,asc';
      (0 === pageNum) && (this.allUserListPageNum = 0);

      // 검색어
      this.searchText = this.searchText.trim();
      if (this.searchText !== '') {
        param.nameContains = this.searchText;
      }

      // 유저 리스트 조회
      (0 === pageNum) && (this.users = []);
      this.userService.getUserList(param, 'default').then((users) => {
        // 데이터 있을 시
        if (users['_embedded']) {
          this.users = this.users.concat(users['_embedded']['users']);
          this.totalUsers = users.page.totalElements;
        }
        this.showMoreAllUser = this._checkShowMore(users.page);
        this.safelyDetectChanges();
        resolve(null);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.member.retrieve.fail'));
        reject();
      });
    });
  } // function - _getUsers

  /**
   * 전체 그룹 조회 Api
   * @param {number} pageNum
   * @private
   */
  private _getGroups(pageNum: number = 0) {
    return new Promise((resolve, reject) => {
      const param: SearchParam = new SearchParam();
      param.page = pageNum;
      param.sort = 'name,asc';
      (0 === pageNum) && (this.allGroupListPageNum = 0);

      // 검색어
      this.searchText = this.searchText.trim();
      if (this.searchText !== '') {
        param.nameContains = this.searchText;
      }

      // 그룹 리스트 조회
      (0 === pageNum) && (this.groups = []);
      this.groupService.getGroupList(param, 'default').then((groups) => {
        // 데이터 있을 시
        if (groups['_embedded']) {
          this.groups = this.groups.concat(groups['_embedded']['groups']);
          this.totalGroups = groups.page.totalElements;
        }
        this.showMoreAllGroup = this._checkShowMore(groups.page);
        this.safelyDetectChanges();
        resolve(null);
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.space.alert.group.retrieve.fail'));
        reject();
      });
    });
  } // function - _getGroups

  /**
   * 전체 초기화
   */
  private _reset() {
    this.isShow = false;        // 팝업 닫기
    this.isShowUserTab = true;  // 사용자 탭 메뉴 표시
    this._workspace = null;     // 워크스페이스 정보
    this.users = [];            // 유저 리스트
    this.groups = [];           // 그룹 리스트
    this.searchText = '';       // 검색어
    this.allUserListPageNum = 0;
    this.allGroupListPageNum = 0;
    this.memberUserListPageNum = 0;
    this.memberGroupListPageNum = 0;
  } // function - _reset

  /**
   * 더보기 버튼 표시 여부 확인
   * @param pageResult
   * @private
   */
  private _checkShowMore(pageResult): boolean {
    if (0 === pageResult.totalPages) {
      return false;
    } else {
      return pageResult.number < pageResult.totalPages - 1;
    }
  } // function - _checkShowMore

}

class SearchParam {
  public page: number = 0;
  public size: number = 30;
  public sort: string;
  public nameContains: string;
}
