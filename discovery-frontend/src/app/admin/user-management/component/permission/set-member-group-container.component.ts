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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { PermissionService } from '../../../../user/service/permission.service';
import { AbstractUserManagementComponent } from '../../abstract.user-management.component';
import { SetMemberGroupComponent } from './set-member-group.component';
import { Alert } from '@common/util/alert.util';
import * as _ from 'lodash';
import { Role, RoleType } from '@domain/user/role/role';
import { Action } from '@domain/user/user';

@Component({
  selector: 'app-set-member-group-container',
  templateUrl: './set-member-group-container.component.html'
})
export class SetMemberGroupContainerComponent extends AbstractUserManagementComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 탭 0 - Members or 1 - Groups
  @Input()
  public defaultTab: number;

  // 취소 or X 버튼 클릭 시
  @Output()
  public cancelEvent = new EventEmitter();

  @Output()
  public applyEvent = new EventEmitter();

  // 검색 placeholder - member, group 다르다
  public searchPlaceholder : string;

  //
  public allList: any = [];

  @Input()
  public members : any;
  public cloneMembers : any;

  @Input()
  public groups : any;
  public cloneGroups : any;

  @Input()
  public role: Role;

  public flag : boolean = false;

  @ViewChild(SetMemberGroupComponent)
  public _setMemberGroupComponent : SetMemberGroupComponent;
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
    this.cloneMembers = _.cloneDeep(this.members);
    this.cloneGroups = _.cloneDeep(this.groups);
    this.init(this.defaultTab);

  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Cancel 클릭시
   */
  public close() {
    this.cloneMembers = [];
    this.cloneGroups = [];

    this.cancelEvent.emit();
  }

  /**
   * DONE 버튼 클릭시
   */
  public done() {

    const result = [];
    if (this.flag === false) {

      this.members.forEach((item) => {
        if(_.findIndex(this.cloneMembers,{directoryName : item.directoryName}) === -1) {
          result.push({type : RoleType.USER, directoryId : item.directoryId, op : Action.remove});
        }
      });
      // 현재 리스트가 원본 리스트에 존재하는지 확인
      this.cloneMembers.forEach((member) => {
        // 없다면 추가
        if (_.findIndex(this.members, {directoryName: member.directoryName}) === -1) {
          result.push({type : RoleType.USER, directoryId : member.directoryId, op : Action.add});
        } else { // 있다면 권한 변경인지 그대로인지 확인

        }
      });

      this.groups.forEach((item) => {
        if(_.findIndex(this.cloneGroups,{directoryName : item.directoryName}) === -1) {
          result.push({type : RoleType.GROUP, directoryId : item.directoryId, op : Action.remove});
        }
      });
      // 현재 리스트가 원본 리스트에 존재하는지 확인
      this.cloneGroups.forEach((member) => {
        // 없다면 추가
        if (_.findIndex(this.groups, {directoryName: member.directoryName}) === -1) {
          result.push({type : RoleType.GROUP, directoryId : member.directoryId, op : Action.add});
        } else { // 있다면 권한 변경인지 그대로인지 확인

        }
      });

      this.flag = true;
      this.permissionService.addRemoveAssignedRoleMember(this.role.id,result).then(() => {
        this.allList = [];
        this.cloneGroups = [];
        this.cloneMembers = [];
        this.flag = false;
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.applyEvent.emit();

      }).catch((err) => {
        Alert.warning(err);
      })


    }
  }

  /**
   * 탭 클릭시
   * @param tabNo 탭 넘버
   */
  public onTabClick(tabNo: number) {
    this.defaultTab = tabNo;
    this._setMemberGroupComponent.allList = [];
    this.init(this.defaultTab);
  }


  /**
   * 화면 최초 진입시 실행. 어떤 Tab 인지에 따라 달라진다.
   * @param tabNo - (0 - member, 1 - group)
   */
  public init(tabNo) {
    this.allList = [];
    if (tabNo === 0) {
      this._getMemberList(false);
    } else {
      this._getGroupList(false);
    }
  }

  /**
   * 멤버 리스트 조회
   * @param data - set-member-group.component 에서 데이터를 보낸다면 ..
   */
  public _getMemberList(data): void {
    // 로딩 show
    this.loadingShow();

    if(data.isInitial === true) {
      this.allList = [];
    }
    // member 리스트 조회
    this.membersService.getRequestedUser(data.params ? data.params : this.getParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        this.searchPlaceholder = 'msg.groups.ui.update.search.ph';
        // 로딩 hide
        this.loadingHide();
        // 사용자 리스트 가져오기
        if (result._embedded) {
          this.allList = this.allList.length === 0 ? result._embedded.users : this.allList.concat(result._embedded.users);

          const simplifiedList = [];
          this.allList.map((item) => {
            simplifiedList.push({directoryId : item.username, directoryName : item.fullName, type : 'USER', imageUrl : item.imageUrl});

            // imageurl이 있으면 넣어준다.
            this.cloneMembers.forEach((memberData) => {
              if (memberData.directoryId === item.id && item.imageUrl) {
                memberData.imageUrl = item.imageUrl;
              }
            });
          });

          this._setMemberGroupComponent.init({allData : simplifiedList, defaultTab : this.defaultTab, selectedItems : this.cloneMembers, headers : this.getHeaders(), pageResult :this.pageResult});
        }

      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹 리스트 조회
   * @param data - set-member-group.component 에서 데이터를 보낸다면 ..
   */
  public _getGroupList(data): void {
    // 로딩 show
    this.loadingShow();

    if(data.isInitial === true) {
      this.allList = [];
    }

    // group 리스트 조회
    this.groupsService.getGroupList(data.params ? data.params : this.getParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        this.searchPlaceholder = 'msg.mem.ui.update.search.ph';
        // 데이터 있다면
        if (result._embedded) {
          // 그룹 리스트 가져오기
          this.allList = this.allList.length === 0 ? result._embedded.groups : this.allList.concat(result._embedded.groups);

          const simplifiedList = [];
          this.allList.map((item) => {
            simplifiedList.push({directoryId : item.id, directoryName : item.name, type : 'GROUP'});
          });

          this._setMemberGroupComponent.init({allData : simplifiedList, defaultTab : this.defaultTab, selectedItems : this.cloneGroups, headers : this.getHeaders(), pageResult :this.pageResult});
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }


  /**
   * Get default params
   * 처음 화면을 열었을때 기본값을 설정한다
   */
  public getParams() : any {
    return { size: 15, page: 0 }
  }

  /**
   * Get Column name for each array
   * 배열에 따라 컬럼 수와 이름이 다르다.
   */
  public getHeaders() : any {

    let returnValue;
    if (this.defaultTab === 0) {
      returnValue = [
        { name: this.translateService.instant('msg.groups.th.update.fullname'), key: 'directoryName', width: '*' },
        { name: this.translateService.instant('msg.groups.th.update.username'), key: 'directoryId', width: '40%' },
        { name: '', key: '', width: '50px' }
      ]
    } else {
      returnValue = [
        { name: this.translateService.instant('msg.approval.th.group'), key: 'directoryName', width: '*' },
        { name: '', key: '', width: '50px' },
      ];
    }
    return returnValue
  }

  public checkEvent(data) {

    if (this.defaultTab === 0 ) {
      if (data.hasOwnProperty('index')) {
        this.cloneMembers.splice(data.index,1);
      } else {
        this.cloneMembers.push(data.item);
      }
    } else {
      if (data.hasOwnProperty('index')) {
        this.cloneGroups.splice(data.index,1);
      } else {
        this.cloneGroups.push(data.item);
      }
    }
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
