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

import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { Page, PageResult } from '@domain/common/page';
import { WorkspaceService } from '../../../../../../../workspace/service/workspace.service';

@Component({
  selector: 'app-member-group-view',
  templateUrl: './member-group-view.component.html'
})
export class MemberGroupViewComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 아이디
  private _workspaceId: string;
  // 멤버 페이지
  private _memberPageResult: PageResult;
  // 그룹 페이지
  private _groupPageResult: PageResult;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // show flag
  public showFl: boolean = false;
  // member list
  public memberList: any = [];
  // group list
  public groupList: any = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
              protected element: ElementRef,
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
   * @param {string} workspaceId
   */
  public init(workspaceId: string): void {
    // init view
    this._initView();
    // workspace id
    this._workspaceId = workspaceId;
    // data list
    const q = [];
    // 로딩 show
    this.loadingShow();
    // member list
    q.push(this._getMemberList().then((result) => {
      this._memberPageResult = result.page;
      this.memberList = result['_embedded'] ? result['_embedded'].members : [];
    }));
    // group list
    q.push(this._getGroupList().then((result) => {
      this._groupPageResult = result.page;
      this.groupList = result['_embedded'] ? result['_embedded'].members : [];
    }));
    // 멤버 그룹 리스트 조회
    Promise.all(q)
      .then(() => {
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
    // flag
    this.showFl = true;
  }

  /**
   * 멤버리스트 더보기
   */
  public getMoreMemberList(): void {
    this._memberPageResult.number += 1;
    // 로딩 show
    this.loadingShow();
    // 멤버 리스트 조회
    this._getMemberList()
      .then((result) => {
        // page result
        this._memberPageResult = result.page;
        // list
        if (result['_embedded']) {
          this.memberList = this.memberList.concat(result['_embedded'].members);
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹리스트 더보기
   */
  public getMoreGroupList(): void {
    this._groupPageResult.number += 1;
    // 로딩 show
    this.loadingShow();
    // 그룹 리스트 조회
    this._getGroupList()
      .then((result) => {
        // page result
        this._groupPageResult = result.page;
        // list
        if (result['_embedded']) {
          this.groupList = this.groupList.concat(result['_embedded'].members);
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 유저의 프로필 사진
   * @param user
   * @returns {string}
   */
  public getProfileImage(user): string {
    return user.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + user.imageUrl + '/thumbnail'
      : '/assets/images/img_photo.png';
  }

  /**
   * 더 조회할 멤버 리스트 있는지
   * @returns {boolean}
   */
  public isMoreMemberList(): boolean {
    return this._memberPageResult.number < this._memberPageResult.totalPages -1;
  }

  /**
   * 멤버 총 수
   * @returns {number}
   */
  public get getMemberTotalCount(): number {
    return this._memberPageResult.totalElements;
  }

  /**
   * 그룹 총 수
   * @returns {number}
   */
  public get getGroupTotalCount(): number {
    return this._groupPageResult.totalElements;
  }

  /**
   * 더 조회할 그룹 리스트 있는지
   * @returns {boolean}
   */
  public isMoreGroupList(): boolean {
    return this._groupPageResult.number < this._groupPageResult.totalPages -1;
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
    // member page init
    this._memberPageResult = new PageResult();
    this._memberPageResult.number = 0;
    this._memberPageResult.size = 15;
    // group page init
    this._groupPageResult = new PageResult();
    this._groupPageResult.number = 0;
    this._groupPageResult.size = 15;
    // list init
    this.memberList = [];
    this.groupList = [];
  }

  /**
   * 멤버 리스트 조회시 페이지 파라메터
   * @returns {Page}
   * @private
   */
  private _getMemberPage(): Page {
    const page = new Page();
    page.size = this._memberPageResult.size;
    page.sort = 'memberName,asc';
    page.page = this._memberPageResult.number;
    return page;
  }

  /**
   * 그룹 리스트 조회시 페이지 파라메터
   * @returns {Page}
   * @private
   */
  private _getGroupPage(): Page {
    const page = new Page();
    page.size = this._groupPageResult.size;
    page.sort = 'memberName,asc';
    page.page = this._groupPageResult.number;
    return page;
  }

  /**
   * 멤버 리스트 조회
   * @returns {Promise<any>}
   * @private
   */
  private _getMemberList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.workspaceService.getWorkspaceUsers(this._workspaceId, this._getMemberPage())
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    })
  }

  /**
   * 그룹 리스트 조회
   * @returns {Promise<any>}
   * @private
   */
  private _getGroupList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.workspaceService.getWorkspaceGroups(this._workspaceId, this._getGroupPage())
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    })
  }
}
