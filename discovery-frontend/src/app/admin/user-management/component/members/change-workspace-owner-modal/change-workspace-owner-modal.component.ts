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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {WorkspaceService} from '../../../../../workspace/service/workspace.service';
import {PublicType, WorkspaceAdmin} from '../../../../../domain/workspace/workspace';
import * as _ from 'lodash';
import {Page} from '../../../../../domain/common/page';
import {forkJoin} from 'rxjs/observable/forkJoin';
import 'rxjs/add/observable/of';
import {of} from 'rxjs/observable/of';
import {from} from 'rxjs/observable/from';
import {EventsService} from './service/events.service';
import {WorkspaceDetailComponent} from './workspace-detail.component';
import {WorkspaceMembersSelectBoxComponent} from './workspace-members-select-box.component';
import {mergeMap} from 'rxjs/internal/operators/mergeMap';

@Component({
  selector: 'change-workspace-owner-modal',
  templateUrl: './change-workspace-owner-modal.component.html',
})
export class ChangeWorkspaceOwnerModalComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChildren(WorkspaceDetailComponent)
  private readonly _workspaceDetailComponents: QueryList<WorkspaceDetailComponent>;

  @ViewChildren(WorkspaceMembersSelectBoxComponent)
  private readonly _workspaceMembersSelectBoxComponents: QueryList<WorkspaceMembersSelectBoxComponent>;

  private _deleteTargetUserid: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Events that occur when a script error or a server error has occurred and the process is no longer possible
   */
  @Output()
  public readonly onError = new EventEmitter();

  @Output()
  public readonly onCancel = new EventEmitter();

  /**
   * If "bypass" is returned to true
   *  - In the "Shared Workspaces" list, none of the owner's "Shared workspaces" are available
   */
  @Output()
  public readonly onComplete = new EventEmitter<{ byPass: boolean }>();

  /**
   * This component show, side flag
   */
  public isShow: boolean = false;

  public workspaces: WorkspaceAdmin[] = [];

  public members = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private workspaceService: WorkspaceService,
    private eventsService: EventsService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Getter & Setter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    super.ngOnInit();
    this._initialize();
  }

  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Shared workspace owner changes show modal
   *  - User ID value is required
   *
   * @param deleteTargetUserid
   */
  public show(deleteTargetUserid: string) {
    if (_.isNil(deleteTargetUserid)) {
      this._thrownErrorEvent(new Error(`User ID value is required.`));
      return;
    }

    this._deleteTargetUserid = deleteTargetUserid;

    this._initialize();
    this._getWorkspaceListInServerByUserId(deleteTargetUserid);
  }

  public selfHide() {
    this.isShow = false;
  }

  public workspacesScrollEvent() {
    this.eventsService.scroll.next();
  }

  public complete() {
    if (this._hasWorkspaceOwnerNotChanged()) {
      return;
    }

    this._transferWorkspacesOwner();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _initialize(): void {
    this.workspaces = [];
    this.isShow = false;
  }

  /**
   * View the list of shared workspaces by user ID
   *
   * @private
   */
  private _getWorkspaceListInServerByUserId(userId: string): void {
    this.loadingShow();

    this.workspaceService.getWorkspaceByAdmin({
      size: 5000,
      page: 0,
      sort: 'name,asc',
      onlyOwner: true,
      active: true,
      username: userId,
      publicType: PublicType.SHARED,
    }).then((result) => {

      this.pageResult = result['page'];
      const embedded = result['_embedded'];

      if (this._isNoSharedWorkspaceWithUserAsOwner(embedded)) {
        this._initialize();
        this.loadingHide();
        this.onComplete.emit({byPass: false});
        return;
      }

      const workspaces = embedded.workspaces;

      if (this._isFirstPage()) {
        this.workspaces = [];
      }

      // If there is data
      if (this._hasWorkspacesInEmbedded(embedded, workspaces)) {
        this._appendWorkspaces(workspaces);
      } else {
        this.workspaces = [];
      }

      this._getMembersInWorkspaces(this.workspaces);
    }).catch((error) => {
      this._initialize();
      this.commonExceptionHandler(error);
    });
  }

  private _getMembersInWorkspaces(workspaces) {
    if (workspaces.length === 0) {
      return;
    }

    const getWorkspaceUsers = (workspaceId: string) => {
      const page = new Page();
      page.size = 5000;
      page.sort = 'memberName,asc';
      page.page = 0;
      return new Promise((resolve, reject) => {
        this.workspaceService.getWorkspaceUsers(workspaceId, page).
          then(result => resolve(result['_embedded'] ? result['_embedded']['members'] : [])).
          catch(error => reject(error));
      });
    };

    of(_.map(workspaces, workspace => workspace.id)).pipe(
      mergeMap(project => forkJoin(project.map(id => from(getWorkspaceUsers(id))))),
    ).subscribe(
      members => {
        this.members = members;
        this._selfShow();
        this.loadingHide();
      },
      error => {
        this._initialize();
        this.commonExceptionHandler(error);
      },
    );
  }

  // noinspection JSMethodCanBeStatic
  private _isNoSharedWorkspaceWithUserAsOwner(embedded) {
    return _.isNil(embedded);
  }

  private _thrownErrorEvent(error?: Error) {
    if (!_.isNil(error)) console.error(error);
    this._initialize();
    this.selfHide();
    this.onError.emit();
  }

  // noinspection JSMethodCanBeStatic
  private _hasWorkspacesInEmbedded(embedded, workspaces) {
    return !_.isNil(embedded) && !_.isNil(workspaces);
  }

  private _appendWorkspaces(workspaces) {
    this.workspaces = this.workspaces.concat(workspaces);
  }

  private _isFirstPage() {
    return this.pageResult.number === 0;
  }

  private _selfShow() {
    this.isShow = true;
  }

  private _hasWorkspaceOwnerNotChanged() {
    return this._workspaceMembersSelectBoxComponents.filter((component) => {
      component.workspaceOwnerChecksForChange();
      return component.isWorkspaceOwnerChanged;
    }).length > 0;
  }

  private transferWorkspaceOwner(workspaceId: string, username: string) {
    return new Promise((resolve, reject) => {
      this.workspaceService.transferWorkspaceOwner(workspaceId, username).
        then(result => resolve(result)).
        catch(error => reject(error));
    });
  }

  private deleteWorkspace(workspaceId: string) {
    return new Promise(((resolve, reject) => {
      this.workspaceService.deleteWorkspace(workspaceId).
        then(result => resolve(result)).
        catch(error => reject(error));
    }))
  }

  private _transferWorkspacesOwner() {
    forkJoin(
      this._workspaceDetailComponents.map((component, index) => {
          if (this._workspaceMembersSelectBoxComponents.toArray()[index].getCheckedMember().value.role != null) {
            return from(this.transferWorkspaceOwner(component.getWorkspaceId(),
              this._workspaceMembersSelectBoxComponents.toArray()[index].getCheckedMember().value.username));
          } else {
            return from(this.deleteWorkspace(component.getWorkspaceId()));
          }
        },
      ),
    ).subscribe(
      () => {
        this.selfHide();
        this.loadingHide();
        this.onComplete.emit({byPass: true});
      },
      (error) => {
        this.commonExceptionHandler(error);
        this.show(this._deleteTargetUserid);
      },
    );
  }
}
