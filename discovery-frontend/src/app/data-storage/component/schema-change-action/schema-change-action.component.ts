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

import { AbstractComponent } from '../../../common/component/abstract.component';
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'schema-change-action',
  templateUrl: './schema-change-action.component.html'
})
export class SchemaChangeActionComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 변경할 컬럼 데이터
  @Input()
  public items: any[];

  @Input()
  public listLength: number;

  @Output()
  public changeActionEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  public unselectActionEvent: EventEmitter<any> = new EventEmitter();

  // actions
  public actionTypes: any[];
  // roles
  public roleTypes: any[];
  // logicals
  public dimensionTypes: any[];
  public measureTypes: any[];

  // 현재 선택된 action
  public selectedActionType: any;
  // 현재 선택된 role
  public selectedRoleType: any;
  // 현재 선택된 logicalType
  public selectedLogicalType: any;

  // show flag
  public actionShowFl: boolean = false;
  public roleShowFl: boolean = false;
  public logicalShowFl: boolean = false;

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

  /**
   * ngOnChnages
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    // if change item list
    if (changes.listLength) {
      // if first init
      if (changes.listLength.firstChange) {
        // ui init
        this.initView();
      }
      if (this.items.some(item => item.derived)) {
        this.actionTypes = [
          { label: this.translateService.instant('msg.storage.ui.list.del'), value: 'DELETE' },
        ];
        this.selectedActionType = this.actionTypes[0];
      } else {
        this.actionTypes = [
          { label: this.translateService.instant('msg.storage.ui.list.type'), value: 'CHANGE' },
          { label: this.translateService.instant('msg.storage.ui.list.del'), value: 'DELETE' },
        ];
      }
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * logical types
   * @returns {any[]}
   * @constructor
   */
  public getLogicalTypes(): any[] {
    return this.selectedRoleType.value === 'MEASURE' ? this.measureTypes : this.dimensionTypes;
  }

  /**
   * 타입변경 인지 확인
   * @returns {boolean}
   */
  public isChangeActionType(): boolean {
    return this.selectedActionType.value === 'CHANGE';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 엑션
   */
  public onClickAction(): void {
    this.selectedActionType.value === 'DELETE' ? this.deleteAction() : this.changeAction();
  }

  /**
   * 체크 해제
   */
  public onClickUnSelected(): void {
    this.unselectActionEvent.emit();
  }

  /**
   * 엑션 선택 이벤트
   * @param actionType
   */
  public onSelectedAction(actionType: any): void {
    this.selectedActionType = actionType;
  }

  /**
   * 변경할 role 타입 선택 이벤트
   * @param roleType
   */
  public onSelectedRole(roleType: any): void {
    this.selectedRoleType = roleType;
    // logicalType 초기화
    this.selectedLogicalType = this.getLogicalTypes()[0];
  }

  /**
   * 변경할 logical 타입 선택 이벤트
   * @param logicalType
   */
  public onSelectedLogicalType(logicalType: any): void {
    this.selectedLogicalType = logicalType;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   */
  private initView(): void {
    this.actionTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.type'), value: 'CHANGE' },
      { label: this.translateService.instant('msg.storage.ui.list.del'), value: 'DELETE' },
    ];
    this.selectedActionType = this.actionTypes[0];

    this.roleTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.dimension'), value: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.measure'), value: 'MEASURE' }
    ];
    this.selectedRoleType = this.roleTypes[0];
    this.dimensionTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING', icon: 'ddp-icon-type-ab' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN', icon: 'ddp-icon-type-tf' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', icon: 'ddp-icon-type-int' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', icon: 'ddp-icon-type-float' },
      { label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP', icon: 'ddp-icon-type-calen' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT', icon: 'ddp-icon-type-latitude' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG', icon: 'ddp-icon-type-longitude' }
    ];
    this.measureTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', icon: 'ddp-icon-type-int' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', icon: 'ddp-icon-type-float' },
    ];
    this.selectedLogicalType = this.getLogicalTypes()[0];
  }

  /**
   * 삭제 엑션
   */
  private deleteAction() {
    const action = {
      delete: true
    };
    this.changeActionEvent.emit(action);
  }

  /**
   * 변경 엑션
   */
  private changeAction() {
    const action = {
      delete: false,
      role: this.selectedRoleType.value,
      logicalType: this.selectedLogicalType.value
    };
    this.changeActionEvent.emit(action);
  }

}
