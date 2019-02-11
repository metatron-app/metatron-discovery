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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../../../common/component/abstract.component';
import * as _ from 'lodash';
import {PublicType, WorkspaceAdmin} from '../../../../../domain/workspace/workspace';
import {WorkspaceMembersSelectBoxComponent} from './workspace-members-select-box.component';
import {WorkspaceService} from '../../../../../workspace/service/workspace.service';

@Component({
  selector: '[workspace-detail]',
  templateUrl: './workspace-detail.component.html',
  host: {
    '[class.ddp-ui-top]': 'true',
    '[class.ddp-clear]': 'true',
  },
})
export class WorkspaceDetailComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(WorkspaceMembersSelectBoxComponent)
  private _workspaceMembersSelectBoxComponent: WorkspaceMembersSelectBoxComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public workspace: WorkspaceAdmin;

  @Input()
  public member;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private workspaceService: WorkspaceService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public openNewWindowWorkspaceMainPageWithWorkspaceId(workspaceId: string): void {

    if (_.isNil(workspaceId)) {
      console.error(`Workspace ID is required.`);
      return;
    }

    window.open(`workspace/${workspaceId}`);
  }

  public isSharedWorkspace() {
    return this._isNotNil(this.workspace)
      && this._isNotNil(this.workspace.publicType)
      && _.eq(this.workspace.publicType, PublicType.SHARED);
  }

  public workspaceOwnerChecksForChange() {
    this._workspaceMembersSelectBoxComponent.workspaceOwnerChecksForChange();
  }

  public getIsWorkspaceOwnerChanged(): boolean {
    return this._workspaceMembersSelectBoxComponent.isWorkspaceOwnerChanged;
  }

  public transferWorkspaceOwner() {
    return new Promise((resolve, reject) => {
      this.workspaceService.transferWorkspaceOwner(this.workspace.id,
        this._workspaceMembersSelectBoxComponent.getCheckedMember().value.username).
        then(result => resolve(result)).
        catch(error => reject(error));
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  private _isNotNil(data) {
    return _.negate(_.isNil)(data);
  }

}
