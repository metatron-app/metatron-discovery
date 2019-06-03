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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../../../../../common/component/abstract.component';
import * as _ from 'lodash';
import {EventsService} from './service/events.service';
import {CommonUtil} from '../../../../../common/util/common.util';
import {WorkspaceAdmin} from '../../../../../domain/workspace/workspace';
import Member = Entity.Member;

namespace Entity {
  export enum Role {
    WATCHER = <any>'Watcher',
    OWNER = <any>'Owner',
    MANAGER = <any>'Manager',
    EDITOR = <any>'Editor'
  }

  export class Member {
    id: string;
    email: string;
    fullName: string;
    username: string;
    role: Role;

    constructor(id: string, email: string, fullName: string, username: string, role: Role) {
      this.id = id;
      this.email = email;
      this.fullName = fullName;
      this.username = username;
      this.role = role;
    }

    public equals(member: Member) {
      return this.username === member.username;
    }

  }

  export class SelectValue<T> {
    label: string;
    value: T;
    checked: boolean;
    disabled: boolean;

    constructor(label: string, value: T, checked: boolean, disabled: boolean) {
      this.label = label;
      this.value = value;
      this.checked = checked;
      this.disabled = disabled;
    }

    public static ofOther(member: Member) {
      return this.createMemberSelectValue(member, false, false);
    }

    public static ofOwner(member: Member) {
      return this.createMemberSelectValue(member, true, true);
    }

    private static createMemberSelectValue(member: Entity.Member, checked: boolean, disabled: boolean) {
      return new SelectValue<Member>(member.fullName, member, checked, disabled);
    }
  }
}

@Component({
  selector: '[workspace-members-select-box]',
  templateUrl: './workspace-members-select-box.component.html',
  host: {'[class.ddp-ui-edit-option]': 'true'},
})
export class WorkspaceMembersSelectBoxComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private readonly _SELECT_BOX_DATAS_LAYER_TOP = 32;
  private readonly _DEFAULT_OFFSET_X = '0px';
  private readonly _DEFAULT_OFFSET_Y = '0px';
  private readonly _OFFSET_SUBFIX = 'px';

  private readonly _DEFAULT_SEARCH_KEY = '';

  private readonly _NO_MEMBER = 'No member';

  private _originOwnerMember: Entity.Member;

  private _isWorkspaceOwnerChanged: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public readonly UUID: string = CommonUtil.getUUID();

  @Input()
  public readonly workspace: WorkspaceAdmin;
  @Input()
  public readonly member = [];

  public readonly selectValues: Entity.SelectValue<Entity.Member>[] = [];
  public offsetX: string = this._DEFAULT_OFFSET_X;
  public offsetY: string = this._DEFAULT_OFFSET_Y;

  public searchKey: string = this._DEFAULT_SEARCH_KEY;

  public isSelected: boolean;
  public isSearchInputElementFocused: boolean;
  public isSelectBoxDatasLayerElement: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private eventsService: EventsService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Getter & Setter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  get isWorkspaceOwnerChanged(): boolean {
    return this._isWorkspaceOwnerChanged;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    this.setOriginMember();

    this.generateSelectValuesWithMembers();

    this.subscriptions.push(
      this.eventsService.scroll$.subscribe(() => {
        if (this.isSelected) {
          this.searchKey = '';
          this.isSelected = false;
        }
      }),
    );

    this.subscriptions.push(
      this.eventsService.hideWorkspaceMemeberSelectBoxs$.subscribe((uuid) => {
        if (this.UUID !== uuid) {
          this.isSelected = false;
        }
      }),
    );
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

  public getCheckedSelectValueLabel(): string {
    const checkedMember = this.getCheckedMember();
    if (_.isNil(checkedMember)) {
      this.translateService.instant('msg.comm.menu.admin.user.modal.change.owner.please.select');
      return;
    }
    if (checkedMember.label == this._NO_MEMBER) {
      return this._NO_MEMBER;
    } else {
      return `${checkedMember.value.fullName} (${checkedMember.value.role})`;
    }
  }

  public clickSelectValue(member: Entity.SelectValue<Member>): void {
    if (member.checked) {
      this.isSelected = false;
      return;
    }

    if (member.disabled) {
      this.isSelected = false;
      return;
    }

    _.forEach(this.selectValues, (selectValue, index) => {
      selectValue.checked = false;
      if (this.selectValues.length - 1 === index) {
        member.checked = true;
      }
      return selectValue;
    });

    this.isSelected = false;

    this.workspaceOwnerChecksForChange(member.value);
  }

  public toggleSelectBoxSelectedState(element: HTMLDivElement): void {
    if (element && !this.isSelected) {
      this._closeExcludSelf();
      const selectBoxDivElementOffset: ClientRect = this._getSelectBoxDivElementOffset(element);
      this._setSelectBoxDatasLayerDivElementOffsetX(selectBoxDivElementOffset);
      this._setSelectBoxDatasLayerDivElementOffsetY(selectBoxDivElementOffset);
    } else {
      this.offsetX = this._DEFAULT_OFFSET_X;
      this.offsetY = this._DEFAULT_OFFSET_Y;
      this.searchKey = this._DEFAULT_SEARCH_KEY;
    }

    this.isSelected = !this.isSelected;
  }

  public searchInputFocus(htmlInputElement: HTMLInputElement): void {
    this._changeSearchInputElementFocusState();
    this._delaySearchInputElementFocus(htmlInputElement);
  }

  public clickOutside(): void {
    if (this.isSelectBoxDatasLayerElement || this.isSearchInputElementFocused) {
      return;
    }

    if (this.isSelected) {
      this.searchKey = '';
      this.isSelected = false;
    }
  }

  public mouseOverSelectBoxDatasLayerElement(): void {
    this.isSelectBoxDatasLayerElement = true;
  }

  public mouseLeaveSelectBoxDatasLayerElement(): void {
    this.isSelectBoxDatasLayerElement = false;
  }

  public selectSelectBox(componentWarpDivElement: HTMLDivElement, searchInputElement: HTMLInputElement): void {
    this.toggleSelectBoxSelectedState(componentWarpDivElement);
    this.searchInputFocus(searchInputElement);
  }

  public focusOutSearchInputElement() {
    this.isSearchInputElementFocused = false;
  }

  public workspaceOwnerChecksForChange(member?: Entity.Member) {
    this._isWorkspaceOwnerChanged = this._checkWorspaceOwnerChanged(
      _.isNil(member) ? this.getCheckedMember().value : member);
  }

  public getCheckedMember(): Entity.SelectValue<Entity.Member> {
    return this._getCheckedMembers()[0];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _closeExcludSelf(): void {
    this.eventsService.hideWorkspaceMemeberSelectBoxs.next(this.UUID);
  }

  private _changeSearchInputElementFocusState(): void {
    this.isSearchInputElementFocused = true;
  }

  private _delaySearchInputElementFocus(htmlInputElement: HTMLInputElement, delayTime: number = 50): void {
    setTimeout(() => htmlInputElement.focus(), delayTime);
  }

  // noinspection JSMethodCanBeStatic
  private _getSelectBoxDivElementOffset(element: HTMLDivElement): ClientRect {
    return element.getBoundingClientRect();
  }

  private _calculatorSelectBoxDatasLayerDivElementOffsetY(offset: ClientRect): string {
    return String(offset.top + this._SELECT_BOX_DATAS_LAYER_TOP) + this._OFFSET_SUBFIX;
  }

  private _calculatorSelectBoxDatasLayerDivElementOffsetX(offset: ClientRect): string {
    return String(offset.left) + this._OFFSET_SUBFIX;
  }

  private _setSelectBoxDatasLayerDivElementOffsetY(selectBoxDivElementOffset: ClientRect): void {
    this.offsetY = this._calculatorSelectBoxDatasLayerDivElementOffsetY(selectBoxDivElementOffset);
  }

  private _setSelectBoxDatasLayerDivElementOffsetX(selectBoxDivElementOffset: ClientRect): void {
    this.offsetX = this._calculatorSelectBoxDatasLayerDivElementOffsetX(selectBoxDivElementOffset);
  }

  private _getCheckedMembers(): Entity.SelectValue<Entity.Member>[] {
    return _.filter(this.selectValues, selectValue => {
      return selectValue.checked;
    });
  }

  private _checkWorspaceOwnerChanged(member: Entity.Member): boolean {
    return this._originOwnerMember.equals(member);
  }

  private setOriginMember() {
    this._originOwnerMember = new Entity.Member(
      this.workspace.id,
      this.workspace.owner.email,
      this.workspace.owner.fullName,
      this.workspace.owner.username,
      Entity.Role.OWNER,
    );
  }

  private generateSelectValuesWithMembers() {
    if (this.member.length > 0) {
      this.selectValues.push(Entity.SelectValue.ofOwner(this._originOwnerMember));

      _.forEach(this.member, value => {

        let role: Entity.Role = Entity.Role.OWNER;
        if (value.role === Entity.Role.WATCHER.toString()) {
          role = Entity.Role.WATCHER;
        }
        if (value.role === Entity.Role.EDITOR.toString()) {
          role = Entity.Role.EDITOR;
        }
        if (value.role === Entity.Role.MANAGER.toString()) {
          role = Entity.Role.MANAGER;
        }

        const member = Entity.SelectValue.ofOther(
          new Entity.Member(
            value.id,
            value.member.email,
            value.member.fullName,
            value.member.username,
            role),
        );

        // Although designated as the workspace owner, it can still be registered as a workspace member
        // If the current owner is included in the list of members, it is excluded from the list of members
        if (!this._originOwnerMember.equals(member.value)) {
          this.selectValues.push(member);
        }
      });
    } else {
      this.selectValues.push(Entity.SelectValue.ofOwner(new Entity.Member(
        null, null, this._NO_MEMBER, null, null)));
    }


  }
}
