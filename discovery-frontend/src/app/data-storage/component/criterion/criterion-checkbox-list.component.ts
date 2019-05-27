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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { StringUtil } from '../../../common/util/string.util';
import * as _ from 'lodash';
import { ConnectionType, DataSourceType, SourceType, Status } from '../../../domain/datasource/datasource';
import {Criteria} from "../../../domain/datasource/criteria";

@Component({
  selector: 'criterion-checkbox-component',
  templateUrl: 'criterion-checkbox-list.component.html'
})
export class CriterionCheckboxListComponent extends AbstractComponent {

  // selected item list
  private _selectedItemList: any = {};

  // default selected item list (Only used first init)
  @Input()
  public readonly defaultSelectedItemList: any;

  @Output('changedSelectItem')
  private _changeSelectItemEvent: EventEmitter<any> = new EventEmitter();

  // criterion list (UI)
  public criterionList: Criteria.ListCriterion[] = [];

  // search keyword
  public searchKeyword: string;

  // origin criterion
  @Input('criterion')
  public criterion: Criteria.ListCriterion;

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
    // if exist default selected item list
    if (this.defaultSelectedItemList) {
      // set selected item list
      this._selectedItemList = this.defaultSelectedItemList;
    }
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
    // if start with msg.*, translate label
    return -1 !== label.indexOf('msg.');
  }

  /**
   * Get translated filter name
   * @param {ListFilter} filter
   * @returns {string}
   */
  public getTranslateFilterName(filter: Criteria.ListFilter): string {
    switch (filter.criterionKey) {
      case Criteria.ListCriterionKey.STATUS:
        return this._getDatasourceStatusTranslate(filter.filterName);
      case Criteria.ListCriterionKey.DATASOURCE_TYPE:
        return this._getDataSourceTypeTranslate(filter.filterName);
      case Criteria.ListCriterionKey.SOURCE_TYPE:
        return this._getSourceTypeTranslate(filter.filterName);
      case Criteria.ListCriterionKey.CONNECTION_TYPE:
        return this._getConnectionTypeTranslate(filter.filterName);
      default:
        return this.isRequireTranslate(filter.filterName) ? this.translateService.instant(filter.filterName): filter.filterName;
    }
  }

  /**
   * Item check event
   * @param item
   */
  public onCheckItem(filter: Criteria.ListFilter): void {
    // if checked item
    if (this.isCheckedItem(filter)) {
      // remove item in selected item list
      this._selectedItemList[filter.filterKey].splice(this._selectedItemList[filter.filterKey].findIndex(list => list.filterValue === filter.filterValue), 1);
    } else {
      if (!this._selectedItemList[filter.filterKey]) {
        // add item key property in selected item list
        this._selectedItemList[filter.filterKey] = [];
      }
      // add item in selected item list
      this._selectedItemList[filter.filterKey].push(filter);
    }
    // change event emit
    this._changeSelectItemEvent.emit(this._selectedItemList);
  }

  /**
   * Search item
   * @param {string} keyword
   */
  public searchItem(keyword: string): void {
    // set keyword
    this.searchKeyword = keyword;
    // init criterion list
    this.criterionList = _.cloneDeep(this.criterion.subCriteria);
    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      // filtered criterion list
      this._setFilteredList();
    }
    // change detect
    this.safelyDetectChanges();
  }

  /**
   * Set filtered list
   * @private
   */
  private _setFilteredList(): void {
    // filtered criterion list
    this.criterionList.forEach((list, index, array) => {
      // set list filters
      list.filters = list.filters.filter(item => -1 !== (this.isRequireTranslate(item.filterName) ? this.translateService.instant(item.filterName) : item.filterName).toUpperCase().indexOf(this.searchKeyword.trim().toUpperCase()));
    });
  }

  /**
   * Get datasource type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getDataSourceTypeTranslate(filterName: string): string {
    switch (filterName) {
      case DataSourceType.JOIN.toString():
        return this.translateService.instant('msg.storage.ui.source.type.join');
      case DataSourceType.MASTER.toString():
        return this.translateService.instant('msg.storage.ui.source.type.master');
      case DataSourceType.VOLATILITY.toString():
        return this.translateService.instant('msg.storage.ui.source.type.volatility');
      default:
        return this.isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }

  /**
   * Get connection type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getConnectionTypeTranslate(filterName: string): string {
    switch (filterName) {
      case ConnectionType.ENGINE.toString():
        return this.translateService.instant('msg.storage.ui.list.ingested.data');
      case ConnectionType.LINK.toString():
        return this.translateService.instant('msg.storage.ui.list.linked.data');
      default:
        return this.isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }

  /**
   * Get datasource status translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getDatasourceStatusTranslate(filterName: string): string {
    switch (filterName) {
      case Status.ENABLED.toString():
        return 'Enabled';
      case Status.PREPARING.toString():
        return 'Preparing';
      case Status.DISABLED.toString():
        return 'Disabled';
      case Status.FAILED.toString():
        return 'Failed';
      case Status.BAD.toString():
        return 'Bad';
      default:
        return 'Disabled';
    }
  }

  /**
   * Get source type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getSourceTypeTranslate(filterName: string): string {
    switch (filterName) {
      case SourceType.IMPORT.toString():
        return this.translateService.instant('msg.storage.li.druid');
      case SourceType.FILE.toString():
        return this.translateService.instant('msg.storage.li.file');
      case SourceType.JDBC.toString():
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.HIVE.toString():
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.REALTIME.toString():
        return this.translateService.instant('msg.storage.li.stream');
      case SourceType.SNAPSHOT.toString():
        return this.translateService.instant('msg.storage.li.ss');
      case SourceType.HDFS.toString():
        return filterName;
      default:
        return this.isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }
}
