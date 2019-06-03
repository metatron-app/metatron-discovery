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

import {Component, ElementRef, Injector, Input, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../../../../../common/component/abstract.component';
import {MemberGroupViewComponent} from '../viewer/member-group-view.component';
import {UserProfile} from '../../../../../../../domain/user/user-profile';
import {PublicType} from '../../../../../../../domain/workspace/workspace';

@Component({
  selector: 'detail-workspaces-information',
  templateUrl: './detail-workspace-information.component.html'
})
export class DetailWorkspaceInformationComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 데이터
  public workspace: any;

  // 퍼미션 정보
  public roleset: any = {};

  public owner: UserProfile;

  // 멤버 그룹 뷰
  @ViewChild(MemberGroupViewComponent)
  private _memberGroupViewComp: MemberGroupViewComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('workspace')
  public set setWorkspace(workspace) {
    // 워크스페이스 상세정보
    this.workspace = workspace;
    // role set 정보
    this.roleset = this.workspace.roleSets ? this.workspace.roleSets[0] : {};
    // owner 정보
    this.owner = this.workspace.owner;
  }

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
   * 퍼미션 스키마 상세페이지로 이동
   */
  public onOpenDetailPermissionSchema() {
    // 쿠키서비스에 현재 url 저장
    this._savePrevRouterUrl();
    // 퍼미션 스키마 페이지로 이동
    this.router.navigate(['/admin/workspaces/permission', this.roleset.id]);
  }

  /**
   * 멤버 및 그룹 뷰 팝업창 오픈
   */
  public onOpenMemberGroupView(): void {
    this._memberGroupViewComp.init(this.workspace.id);
    // 마크업 위치 변경
    $('#member-group-view').appendTo($('#admin-detail-workspace'));
  }

  /**
   * 모든 유저에게 이메일 보내기
   */
  public onClickEmailToUsers(): void {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스가 공유 워크스페이스인지 확인
   * @returns {boolean}
   */
  public isPublicWorkspace(): boolean {
    return this.workspace.publicType === PublicType.SHARED;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
