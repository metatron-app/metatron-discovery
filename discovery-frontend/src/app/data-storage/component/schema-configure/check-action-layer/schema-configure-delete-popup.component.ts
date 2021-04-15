/*
 *
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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Field} from '@domain/datasource/datasource';

@Component({
  selector: 'schema-configure-delete-popup',
  templateUrl: 'schema-configure-delete-popup.component.html'
})
export class SchemaConfigureDeletePopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input('checkedFieldList')
  private readonly _checkedFieldList;

  @Output()
  public readonly removedFieldListEvent = new EventEmitter();

  public isShowPopup: boolean;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Open popup
   */
  public openPopup(): void {
    this.isShowPopup = true;
  }

  /**
   * Close popup
   */
  public closePopup(): void {
    this.isShowPopup = false;
  }

  /**
   * Delete checked field list
   */
  public deleteCheckedFieldList(): void {
    // set remove field
    this._checkedFieldList.forEach(field => {
      Field.setRemoveField(field);
      Field.setUndoCheckField(field);
    });
    // emit
    this.removedFieldListEvent.emit();
    // close popup
    this.closePopup();
  }
}
