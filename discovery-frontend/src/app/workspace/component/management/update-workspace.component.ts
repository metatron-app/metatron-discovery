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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {WorkspaceService} from '../../service/workspace.service';
import {Workspace} from '@domain/workspace/workspace';
import * as _ from 'lodash';
import {CookieConstant} from '@common/constant/cookie.constant';
import {StringUtil} from '@common/util/string.util';

@Component({
  selector: 'app-update-workspace',
  templateUrl: './update-workspace.component.html',
})
export class UpdateWorkspaceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크스페이스 아이디
  private workspaceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public updateComplete = new EventEmitter();

  // 팝업 플래그
  public isShow = false;

  // 워크스페이스 data
  public data: any = {
    name: '',
    description: ''
  };

  // sharedWorkSpaceList
  public sharedWorkspaceList: Workspace[];

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 유효성 관련 - 설명
  public isInvalidDesc: boolean = false;
  public errMsgDesc: string = '';

  // params for query
  public params = {
    size: this.page.size,
    page: this.page.page,
    sort: {name: this.translateService.instant('msg.comm.ui.list.name.asc'), value: 'name,asc', selected: true}
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              private workspaceService: WorkspaceService,) {
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

  // 워크스페이스 수정
  public updateWorkspace() {

    if (this.validation()) {
      // 로딩 show
      this.loadingShow();
      // 수정
      this.workspaceService.updateWorkspace(this.workspaceId, this.data)
        .then((_result) => {
          const workspace = this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE);
          if (StringUtil.isNotEmpty(workspace)) {
            const wsInfo = JSON.parse(workspace);
            if (wsInfo['id'] === this.workspaceId) {
              wsInfo['name'] = this.data.name;
              wsInfo['description'] = this.data.description;
              this.cookieService.set(CookieConstant.KEY.MY_WORKSPACE, JSON.stringify(wsInfo), 0, '/');
            }
          }
          // 로딩 hide
          this.loadingHide();
          // 수정 알림
          Alert.success(this.translateService.instant('msg.space.alert.edit.workspace.success'));
          // 팝업 닫기
          this.close(true);
        })
        .catch((_error) => {
          // 로딩 hide
          this.loadingHide();
          // 수정 알림
          Alert.error(this.translateService.instant('msg.space.alert.edit.workspace.fail'));
        });
    } else {
      Alert.error(this.translateService.instant('msg.space.alert.edit.workspace.fail'));
    }
  }

  // init
  public init(workspaceId: string, workspaceName: string, workspaceDesc: string) {
    // 팝업 열기
    this.isShow = true;
    // 현재 워크스페이스 아이디 저장
    this.workspaceId = workspaceId;
    // 현재 워크스페이스 이름 설명 저장
    this.data.name = workspaceName;
    this.data.description = workspaceDesc;
  }

  // 닫기
  public close(completeFl?: boolean) {
    this.sharedWorkspaceList = undefined;
    this.isInvalidName = undefined;
    this.isShow = false;
    this.updateComplete.emit(completeFl);
  }

  /**
   * Check if name is in use
   * @param {string} newWorkspaceName
   */
  public async nameChange(newWorkspaceName) {
    this.data.name = newWorkspaceName;
    this.params.size = 100;

    this.loadingShow();

    if (_.isNil(this.sharedWorkspaceList)) {
      // get workspaces which contains keyword(newWorkspaceName)
      this.workspaceService.getSharedWorkspaces('forListView', this.params).then(workspaces => {
        if (workspaces['_embedded']) {
          this.sharedWorkspaceList = workspaces['_embedded']['workspaces'];
          this._checkDuplicateName(newWorkspaceName);
        } else {
          this.sharedWorkspaceList = [];
        }

      }).catch((_error) => {
        Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
        this.loadingHide();
      });
    } else if (this.sharedWorkspaceList.length > 0) {
      this._checkDuplicateName(newWorkspaceName);
    }

    this.loadingHide();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // validation
  private validation() {
    this.data.name = this.data.name ? this.data.name.trim() : '';
    if (this.isInvalidName) {
      this.errMsgName = this.translateService.instant('msg.comm.ui.workspace.name.duplicated');
      return false;
    }

    if (this.data.name == null || this.data.name.length === 0 || this.isInvalidName) {
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }

    // 이름 길이 체크
    if (CommonUtil.getByte(this.data.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }

    // 설명 길이 체크
    if (this.data.description != null
      && CommonUtil.getByte(this.data.description.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return false;
    }

    return true;
  }

  private _checkDuplicateName(newWorkspaceName: string) {
    // check if name is in use and set isInvalidName flag according to the condition
    this.isInvalidName = this.sharedWorkspaceList.some((workspace) => {
      if (workspace.name === newWorkspaceName) {
        this.errMsgName = this.translateService.instant('msg.comm.ui.workspace.name.duplicated');
        return true;
      }
    });
  }

}
