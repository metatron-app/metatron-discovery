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
import {User} from '@domain/user/user';
import * as _ from 'lodash';
import {isUndefined} from 'util';
import {Alert} from '@common/util/alert.util';
import {Group} from '@domain/user/group';

@Component({
  selector: 'app-update-user-management-members',
  templateUrl: './update-user-management-members.component.html'
})
export class UpdateUserManagementMembersComponent extends AbstractUserManagementComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 사용자 데이터
  private _userData = new User();

  // 선택된 그룹 페이지 넘버
  private _selectedGroupPage: number;
  private _selectedGroupPageSize: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 멤버 수정 모달 show hide 설정
  public modalShowFl: boolean = false;

  // 그룹 리스트
  public groupList: Group[] = [];
  // 선택된 그룹 리스트
  public selectedGroup: Group[] = [];

  // 그룹 검색 키워드
  public searchKeyword: string;

  @Output()
  public groupComplete: EventEmitter<any> = new EventEmitter();

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
   * @param {User} userData
   */
  public init(userData: User) {
    // 데이터 초기화
    this._initView();
    // 사용자 정보 저장
    this._userData = _.cloneDeep(userData);
    // 사용자 속한 그룹 데이터 저장
    this.selectedGroup = this._userData.groups;
    // this.selectedGroup = this._userData.groups.filter((item) => {
    //   return item.predefined !== true;
    // });
    // 그룹 리스트 조회
    this._getGroupList();
    // 모달 show
    this.modalShowFl = true;
  }

  /**
   * 변경 저장시
   */
  public done() {
    // loading show
    this.loadingShow();
    // 사용자의 그룹 변경
    this.membersService.updateUser(this._userData.id, this._getUpdateParam())
      .then(() => {
        // success alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // hide
        this.modalShowFl = false;
        // 로딩 hide
        this.loadingHide();
        // event emit
        this.groupComplete.emit();
      })
      .catch(() => {
        // error alert
        Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 팝업 닫기
   */
  public close() {
    // hide
    this.modalShowFl = false;
  }

  /**
   * 선택한 그룹을 선택된 그룹리스트에서 제거
   * @param {Group} group
   */
  public deleteSelectedGroup(group: Group) {
    const index = _.findIndex(this.selectedGroup, {id: group.id});
    if (index !== -1) {
      this._deleteSelectedGroup(index);
    }
  }

  /**
   * 선택한 그룹을 선택된 그룹리스트에서 추가
   * @param {Group} group
   */
  public addSelectedGroup(group: Group) {
    const index = _.findIndex(this.selectedGroup, {id: group.id});
    if (index === -1) {
      this._addSelectedGroup(group);
    }
  }

  /**
   * 현재 선택된 그룹 리스트
   * @returns {Group[]}
   */
  public getSelectedGroupList(): Group[] {
    return this.selectedGroup.slice(0, (this._selectedGroupPage + 1) * this._selectedGroupPageSize);
  }

  /**
   * 현재 사용자 이름
   * @returns {string}
   */
  public getUserName(): string {
    return this._userData.username;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 그룹이 선택된 상태인지 확인
   * @param {Group} group
   * @returns {boolean}
   */
  public isSelectedGroup(group: Group): boolean {
    return _.findIndex(this.selectedGroup, {id: group.id}) !== -1;
  }

  /**
   * 그룹 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isMoreGroupList(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
  }

  /**
   * 현재 선택된 그룹 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isMoreSelectedGroupList(): boolean {
    return (this._selectedGroupPage + 1) * this._selectedGroupPageSize < this.selectedGroup.length;
  }

  /**
   * 모든 그룹이 선택된 상태인지 확인
   * @returns {boolean}
   */
  public isAllSelectedGroup(): boolean {
    if (this.groupList.length !== 0) {
      for (let index = 0, nMax = this.groupList.length; index < nMax; index++) {
        // 조회된 그룹 목록 중 선택목록에 하나라도 없다면 false
        if (_.findIndex(this.selectedGroup, {id: this.groupList[index].id}) === -1) {
          return false;
        }
      }
      return true;
    } else {
      // 조회된 그룹 목록이 없다면 false
      return false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 체크박스 선택 이벤트
   * @param {Group} group
   */
  public onSelectedGroup(group: Group): void {
    // 중복선택 제거
    event.preventDefault();
    // 선택된 그룹에 있는경우 체크 해제
    const index = _.findIndex(this.selectedGroup, {id: group.id});
    index === -1 ? this._addSelectedGroup(group) : this._deleteSelectedGroup(index);
  }

  /**
   * 그룹 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 그룹 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 그룹 리스트 더 가져오기
   */
  public onClickMoreGroupList(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;
    // 그룹 리스트 조회
    this._getGroupList();
  }

  /**
   * 현재 선택된 그룹 리스트 더 가져오기
   */
  public onClickMoreSelectedGroupList(): void {
    // 페이지 넘버 증가
    this._selectedGroupPage += 1;
  }

  /**
   * 모든 그룹 선택 이벤트
   */
  public onClickAllGroup(): void {
    // 중복선택 제거
    event.preventDefault();
    // 현재 선택된 상태라면 선택된 그룹들 제거
    this.isAllSelectedGroup() ? this._deleteAllGroup() : this._addAllGroup();
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
    this._selectedGroupPage = 0;
    this._selectedGroupPageSize = 30;
    // 그룹 리스트 초기화
    this.selectedGroup = [];
    this.groupList = [];
    // 검색어 초기화
    this.searchKeyword = '';
  }

  /**
   * 현재 보이고 있는 그룹을 선택한 그룹리스트에서 제거
   * @private
   */
  private _deleteAllGroup(): void {
    // 선택된 그룹에 현재 그룹 리스트 제거
    this.groupList.forEach((group) => {
      this.deleteSelectedGroup(group);
    });
  }

  /**
   * 현재 보이고 있는 그룹들 선택한 그룹리스트에 추가
   * @private
   */
  private _addAllGroup(): void {
    // 선택된 그룹에 현재 그룹 리스트 추가
    this.groupList.forEach((group) => {
      this.addSelectedGroup(group);
    });
  }

  /**
   * 선택된 그룹에 추가
   * @param {Group} group
   * @private
   */
  private _addSelectedGroup(group: Group): void {
    this.selectedGroup.push(group);
  }

  /**
   * 선택된 그룹에서 제거
   * @param {number} index
   * @private
   */
  private _deleteSelectedGroup(index: number): void {
    this.selectedGroup.splice(index, 1);
  }

  /**
   * 검색어로 그룹 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchKeyword = keyword;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 그룹 리스트 초기화
    this.groupList = [];
    // 재조회
    this._getGroupList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그룹 리스트 조회
   * @private
   */
  private _getGroupList(): void {
    // 로딩 show
    this.loadingShow();
    // group 리스트 조회
    this.groupsService.getGroupList(this._getGroupParam())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        // 데이터 있다면
        if (result._embedded) {
          // 그룹 리스트 가져오기
          this.groupList = this.groupList.length === 0 ? result._embedded.groups : this.groupList.concat(result._embedded.groups);
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
   * group params
   * @returns {Object}
   * @private
   */
  private _getGroupParam(): object {
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
   * 사용자가 속한 그룹 변경에 이용하는 파라메터
   * @private
   */
  private _getUpdateParam(): any {
    const groups = [];
    this.selectedGroup.forEach((group) => {
      groups.push(group.name);
    });
    return {
      email: this._userData.email,
      username: this._userData.username,
      fullName: this._userData.fullName,
      tel: this._userData.tel,
      imageUrl: this._userData.imageUrl,
      groupNames: groups
    };
  }
}
