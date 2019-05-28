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

import {Component, ElementRef, HostListener, Injector, ViewChild} from "@angular/core";
import {Filter} from "../../../shared/datasource-metadata/domain/filter";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import * as _ from 'lodash';
import {StorageFilterSelectBoxComponent} from "../../data-source-list/component/storage-filter-select-box.component";

@Component({
  selector: 'schema-configure-filter',
  templateUrl: 'schema-configure-filter.component.html'
})
export class SchemaConfigureFilterComponent extends AbstractComponent {

  @ViewChild('roleFilterSelectBox')
  private readonly _roleFilterSelectBox: StorageFilterSelectBoxComponent;

  @ViewChild('typeFilterSelectBox')
  private readonly _typeFilterSelectBox: StorageFilterSelectBoxComponent;

  // filter list
  public readonly roleFilterList: Filter.Role[] = this.constant.getRoleTypeFilters();
  public readonly typeFilterList: Filter.Logical[] = this.constant.getTypeFiltersInCreateStep();

  // selected filter
  public searchKeyword: string;
  public selectedRoleFilter: Filter.Role = this.constant.getRoleTypeFilterFirst();
  public selectedTypeFilter: Filter.Logical = this.constant.getTypeFiltersFirst();

  constructor(private constant: ConstantService,
              private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // #1925
    if (this._roleFilterSelectBox && this._roleFilterSelectBox.isListShow) {
      this._roleFilterSelectBox.isListShow = false;
    } else if (this._typeFilterSelectBox && this._typeFilterSelectBox.isListShow) {
      this._typeFilterSelectBox.isListShow = false;
    }
  }

  /**
   * Init selected filter
   * @param {string} searchKeyword
   * @param {Filter.Role} selectedRoleFilter
   * @param {Filter.Logical} selectedTypeFilter
   */
  public initFilters(searchKeyword: string, selectedRoleFilter: Filter.Role, selectedTypeFilter: Filter.Logical): void {
    if (this._isNotEmptyValue(searchKeyword)) {
      this.searchKeyword = _.cloneDeep(searchKeyword);
    }
    if (this._isNotEmptyValue(selectedRoleFilter)) {
      this.selectedRoleFilter = _.cloneDeep(selectedRoleFilter);
    }
    if (this._isNotEmptyValue(selectedTypeFilter)) {
      this.selectedTypeFilter = _.cloneDeep(selectedTypeFilter);
    }
  }

  /**
   * Change search keyword
   * @param {string} keyword
   */
  public changeSearchKeyword(keyword: string): void {
    // set keyword
    this.searchKeyword = keyword;
    // changed filter broadcast to DATASOURCE_CHANGED_FIELD_LIST_FILTER
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST_FILTER, {key: DataStorageConstant.Datasource.FilterKey.SEARCH, value: this.searchKeyword});
  }

  /**
   * Change role filter
   * @param {Filter.Role} filter
   */
  public changeRoleFilter(filter: Filter.Role): void {
    // set changed filter
    this.selectedRoleFilter = filter;
    // changed filter broadcast to DATASOURCE_CHANGED_FIELD_LIST_FILTER
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST_FILTER, {key: DataStorageConstant.Datasource.FilterKey.ROLE, value: this.selectedRoleFilter});
  }

  /**
   * Change type filter
   * @param {Filter.Logical} filter
   */
  public changeTypeFilter(filter: Filter.Logical): void {
    // set change filter
    this.selectedTypeFilter = filter;
    // changed filter broadcast to DATASOURCE_CHANGED_FIELD_LIST_FILTER
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST_FILTER, {key: DataStorageConstant.Datasource.FilterKey.TYPE, value: this.selectedTypeFilter});
  }

  /**
   * Is not empty value
   * @param value
   * @returns {boolean}
   * @private
   */
  private _isNotEmptyValue(value): boolean {
    return !_.isNil(value);
  }
}
