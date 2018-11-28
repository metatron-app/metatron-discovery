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

import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { DatasourceCriterion } from '../../../../domain/datasource/datasourceCriterion';
import { StringUtil } from '../../../../common/util/string.util';
import * as _ from 'lodash';

@Component({
  selector: 'criterion-checkbox-component',
  templateUrl: 'criterion-checkbox.component.html'
})
export class CriterionCheckboxComponent extends AbstractComponent {

  /**
   * selected item list
   * {
   *  filterKey1: []
   *  filterKey2: []
   * }
   * @type {{}}
   * @private
   */
  private _selectedItemList: any = {};

  @Output('changedSelectItem')
  private _changeSelectItemEvent: EventEmitter<any> = new EventEmitter();

  // criterion list (UI)
  public criterionList: DatasourceCriterion[] = [];

  // search keyword
  public searchKeyword: string;

  // origin criterion
  @Input('criterion')
  public criterion: DatasourceCriterion;

  // search place holder
  @Input('searchPlaceHolder')
  public searchPlaceHolder: string;

  // is enable ALL option
  @Input('enableAllOption')
  public isEnableAllOption: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngAfterViewInit
   */
  public ngAfterViewInit() {
    // set criterion list
    this.criterionList = _.cloneDeep(this.criterion.subCriteria);
    // change detect
    this.safelyDetectChanges();
  }

  /**
   * Is checked all item
   * @returns {boolean}
   */
  public isCheckedAllItem(): boolean {
    return this.criterionList.every(list => list.filters.every(item => this.isCheckedItem(item)));
  }

  /**
   * Is checked item
   * @param item
   * @returns {boolean}
   */
  public isCheckedItem(item: any): boolean {
    return this._selectedItemList[item.filterKey] && this._selectedItemList[item.filterKey].some(list => list.filterValue === item.filterValue);
  }

  /**
   * Is require translate
   * @param {string} label
   * @returns {boolean}
   */
  public isRequireTranslate(label: string): boolean {
    return -1 !== label.indexOf('msg.');
  }

  /**
   * Item check event
   * @param item
   */
  public onCheckItem(item: any): void {
    // if checked item
    if (this.isCheckedItem(item)) {
      this._selectedItemList[item.filterKey].splice(this._selectedItemList[item.filterKey].findIndex(list => list.filterValue === item.filterValue),1);
    } else if (this._selectedItemList[item.filterKey]) {
      this._selectedItemList[item.filterKey].push(item);
    } else {
      this._selectedItemList[item.filterKey] = [];
      this._selectedItemList[item.filterKey].push(item);
    }
    // change event emit
    this._changeSelectItemEvent.emit(this._selectedItemList);
  }

  /**
   * Search item event
   * @param {KeyboardEvent} event
   */
  public onSearchItem(event: KeyboardEvent): void {
    // enter event
    if (13 === event.keyCode) {
      // search item
      this.searchItem();
    } else if (27 === event.keyCode) { // esc event
      // init search keyword
      this.searchKeyword = '';
      // search item
      this.searchItem();
    }
  }

  /**
   * Search item
   */
  public searchItem(): void {
    // init criterion list
    this.criterionList = _.cloneDeep(this.criterion.subCriteria);
    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      // filtered criterion list
      this.criterionList.forEach((list, index, array) => {
        // set list filters
        list.filters = list.filters.filter(item => -1 !== item.filterName.toUpperCase().indexOf(this.searchKeyword.trim().toUpperCase()));
      });
    }
    // change detect
    this.safelyDetectChanges();
  }
}
