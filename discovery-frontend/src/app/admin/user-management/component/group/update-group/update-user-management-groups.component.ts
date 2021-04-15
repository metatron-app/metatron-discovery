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

import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {AbstractUserManagementComponent} from '../../../abstract.user-management.component';
import {Action, User} from '@domain/user/user';
import {Alert} from '@common/util/alert.util';
import * as _ from 'lodash';
import {isUndefined} from 'util';
import {Group} from '@domain/user/group';
import {GroupMember} from '@domain/user/group-member';

@Component({
  selector: 'app-update-user-management-groups',
  templateUrl: './update-user-management-groups.component.html'
})
export class UpdateUserManagementGroupsComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 데이터
  private _groupData = new Group();

  // 선택된 멤버 페이지 넘버
  private _selectedMemberPage: number;
  private _selectedMemberPageSize: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 그룹 수정 모달 show hide 설정
  public modalShowFl: boolean = false;

  // 멤버 리스트
  public memberList: User[] = [];
  // 선택된 멤버 리스트
  public selectedMember: User[] = [];
  // 서버에 저장된 멤버 리스트
  public groupOriginMemberList: User[] = [];

  // 사용자 검색 키워드
  public searchKeyword: string;

  @Output()
  public memberComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   * @param {Group} groupData
   * @param {GroupMember[]} members
   */
  public init(groupData: Group, members: GroupMember[]) {
    // 데이터 초기화
    this._initView();
    // 그룹 정보 저장
    this._groupData = _.cloneDeep(groupData);
    // 현재 그룹에 속한 멤버 저장
    members.forEach((item) => {
      const member = new User();
      member.fullName = item['memberName'] ? item['memberName'] : item.profile.fullName;
      member.username = item['memberId'] ? item['memberId'] : item.profile.username;
      // imageUrl이 존재하는 경우에만 넣어줌
      if (item.profile['imageUrl']) {
        member.imageUrl = item.profile.imageUrl;
      }
      // push
      this.selectedMember.push(member);
    });
    // this.groupOriginMemberList = _.cloneDeep(members);
    this.groupOriginMemberList = _.cloneDeep(this.selectedMember);
    // 멤버 리스트 조회
    this._getMemberList();
    // 모달 show
    this.modalShowFl = true;
  }

  /**
   * done
   */
  public done(): void {
    // loading show
    this.loadingShow();
    // 멤버 수정
    // 기존 리스트에서 없는 데이터는 remove로 설정 생성된 데이터는 add로 설정
    this.groupsService.updateGroupUsers(this._groupData.id, this._getUpdateParam())
      .then(() => {
        // success alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // 현재 팝업 닫기
        this.modalShowFl = false;
        // loading hide
        this.loadingHide();
        // 상위 컴포넌트로 noti
        this.memberComplete.emit();
      })
      .catch(() => {
        // error alert
        Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
        // loading hide
        this.loadingHide();
      });
  }

  /**
   * close
   */
  public close(): void {
    // hide
    this.modalShowFl = false;
  }

  /**
   * 선택한 멤버를 선택된 멤버리스트에서 제거
   * @param {User} member
   */
  public deleteSelectedMember(member: User) {
    // const index = _.findIndex(this.selectedMember, {id: member.id});
    const index = _.findIndex(this.selectedMember, {username: member.username});
    if (index !== -1) {
      this._deleteSelectedMember(index);
    }
  }

  /**
   * 선택한 멤버를 선택된 멤버리스트에 추가
   * @param {User} member
   */
  public addSelectedMember(member: User) {
    // const index = _.findIndex(this.selectedMember, {id: member.id});
    const index = _.findIndex(this.selectedMember, {username: member.username});
    if (index === -1) {
      this._addSelectedMember(member);
    }
  }

  /**
   * 현재 선택된 멤버 리스트
   * @returns {User[]}
   */
  public getSelectedMemberList(): User[] {
    return this.selectedMember.slice(0, (this._selectedMemberPage + 1) * this._selectedMemberPageSize);
  }

  /**
   * 현재 그룹 이름
   * @returns {string}
   */
  public getGroupName(): string {
    return this._groupData.name;
  }

  /**
   * 사용자 프로필 이미지
   * @returns {string}
   */
  public getUserImage(user: User): string {
    return user.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + user.imageUrl + '/thumbnail'
      : '/assets/images/img_photo.png';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 멤버가 선택된 상태인지 확인
   * @param {User} member
   * @returns {boolean}
   */
  public isSelectedMember(member: User): boolean {
    // return _.findIndex(this.selectedMember, {id: member.id}) !== -1;
    return _.findIndex(this.selectedMember, {username: member.username}) !== -1;
  }

  /**
   * 멤버 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isMoreMemberList(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
  }

  /**
   * 현재 선택된 멤버 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isMoreSelectedMemberList(): boolean {
    return (this._selectedMemberPage + 1) * this._selectedMemberPageSize < this.selectedMember.length;
  }

  /**
   * 모든 멤버가 선택된 상태인지 확인
   * @returns {boolean}
   */
  public isAllSelectedMember(): boolean {
    if (this.memberList.length !== 0) {
      for (let index = 0, nMax = this.memberList.length; index < nMax; index++) {
        // 조회된 멤버 목록 중 선택목록에 하나라도 없다면 false
        // if (_.findIndex(this.selectedMember, {id: this.memberList[index].id}) === -1) {
        if (_.findIndex(this.selectedMember, {username: this.memberList[index].username}) === -1) {
          return false;
        }
      }
      return true;
    } else {
      // 조회된 멤버 목록이 없다면 false
      return false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 체크박스 선택 이벤트
   * @param {User} member
   */
  public onSelectedMember(member: User): void {
    // 중복선택 제거
    event.preventDefault();
    // 선택된 멤버에 있는경우 체크 해제
    // const index = _.findIndex(this.selectedMember, {id: member.id});
    const index = _.findIndex(this.selectedMember, {username: member.username});
    index === -1 ? this._addSelectedMember(member) : this._deleteSelectedMember(index);
  }

  /**
   * 멤버 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 멤버 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 멤버 리스트 더 가져오기
   */
  public onClickMoreMemberList(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;
    // 멤버 리스트 조회
    this._getMemberList();
  }

  /**
   * 현재 선택된 멤버 리스트 더 가져오기
   */
  public onClickMoreSelectedMemberList(): void {
    // 페이지 넘버 증가
    this._selectedMemberPage += 1;
  }

  /**
   * 모든 멤버 선택 이벤트
   */
  public onClickAllMember(): void {
    // 중복선택 제거
    event.preventDefault();
    // 현재 선택된 상태라면 선택된 멤버들 제거
    this.isAllSelectedMember() ? this._deleteAllMember() : this._addAllMember();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 30;
    this._selectedMemberPage = 0;
    this._selectedMemberPageSize = 30;
    // 멤버 리스트 초기화
    this.selectedMember = [];
    this.memberList = [];
    // 검색어 초기화
    this.searchKeyword = '';
  }

  /**
   * 현재 보이고 있는 멤버들 선택한 멤버리스트에서 제거
   * @private
   */
  private _deleteAllMember(): void {
    // 선택된 멤버에 현재 멤버 리스트 제거
    this.memberList.forEach((member) => {
      this.deleteSelectedMember(member);
    });
  }

  /**
   * 현재 보이고 있는 멤버들 선택한 멤버리스트에 추가
   * @private
   */
  private _addAllMember(): void {
    // 선택된 멤버에 현재 멤버 리스트 추가
    this.memberList.forEach((member) => {
      this.addSelectedMember(member);
    });
  }

  /**
   * 선택된 멤버에 추가
   * @param {User} member
   * @private
   */
  private _addSelectedMember(member: User): void {
    this.selectedMember.push(member);
  }

  /**
   * 선택된 멤버에서 제거
   * @param {number} index
   * @private
   */
  private _deleteSelectedMember(index: number): void {
    this.selectedMember.splice(index, 1);
  }

  /**
   * 검색어로 멤버 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchKeyword = keyword;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 멤버 리스트 초기화
    this.memberList = [];
    // 재조회
    this._getMemberList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 멤버 리스트 조회
   * @private
   */
  private _getMemberList(): void {
    // 로딩 show
    this.loadingShow();
    // member 리스트 조회
    this.membersService.getRequestedUser(this._getMemberParam())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        // 사용자 리스트 가져오기
        if (result._embedded) {
          this.memberList = this.memberList.length === 0 ? result._embedded.users : this.memberList.concat(result._embedded.users);
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
   * 멤버 params
   * @returns {Object}
   * @private
   */
  private _getMemberParam(): object {
    const param = {
      size: this.pageResult.size,
      page: this.pageResult.number
    };
    // search
    if (!isUndefined(this.searchKeyword) && this.searchKeyword.trim() !== '') {
      param['nameContains'] = this.searchKeyword.trim();
    }
    return param;
  }

  /**
   * 사용자가 속한 멤버 변경에 이용하는 파라메터
   * @private
   */
  private _getUpdateParam(): any {
    const result = [];
    // 제거될 멤버 설정
    this.groupOriginMemberList.forEach((member) => {
      // if (_.findIndex(this.selectedMember, {id: member.id}) === -1) {
      if (_.findIndex(this.selectedMember, {username: member.username}) === -1) {
        result.push({memberId: member.username, op: Action.remove});
      }
    });
    // 현재 리스트가 원본 리스트에 존재하는지 확인
    this.selectedMember.forEach((member) => {
      // 없다면 추가
      // if (_.findIndex(this.groupOriginMemberList, {id: member.id}) === -1) {
      if (_.findIndex(this.groupOriginMemberList, {username: member.username}) === -1) {
        result.push({memberId: member.username, op: Action.add});
      } else { // 있다면 권한 변경인지 그대로인지 확인

      }
    });
    console.log(result);
    return result;
  }
}
