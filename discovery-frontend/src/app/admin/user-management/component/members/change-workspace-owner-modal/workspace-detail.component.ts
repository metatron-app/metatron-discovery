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

import {Component, ElementRef, HostBinding, Injector, Input} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import * as _ from 'lodash';
import {PublicType, WorkspaceAdmin} from '@domain/workspace/workspace';

@Component({
  selector: '[workspace-detail]',
  templateUrl: './workspace-detail.component.html'
})
export class WorkspaceDetailComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @HostBinding('class')
  public hostClass: string = 'ddp-ui-top ddp-clear';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public readonly workspace: WorkspaceAdmin;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector) {
    super(elementRef, injector);
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

  // noinspection JSMethodCanBeStatic
  public getWorkspaceId(): string {
    return this.workspace.id;
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
