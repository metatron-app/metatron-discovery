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
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { Alert } from '../../../common/util/alert.util';
import { FilteringOptions, FilteringOptionType } from '../../../domain/workbook/configurations/filter/filter';

/**
 * Edit recommend and essential filter in datasource
 */
@Component({
  selector: 'edit-filter-data-source',
  templateUrl: './edit-filter-data-source.component.html'
})
export class EditFilterDataSourceComponent extends AbstractComponent implements OnInit, OnDestroy {

  // source id
  private _sourceId: string;
  // origin column list
  private _columnList: any[];
  // origin recommend filtered column list
  private _originFilteringColumnList: any[];

  // filtered column list
  public filteredColumnList: any[];
  // role type filter list
  public roleTypeFilterList: any[] = [
    { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
    { label: this.translateService.instant('msg.comm.name.dim'), value: 'DIMENSION' },
    { label: this.translateService.instant('msg.comm.name.mea'), value: 'MEASURE' },
  ];
  // selected role type filter
  public selectedRoleTypeFilter: any;
  // role type filter show flag
  public isShowRoleTypeFilterList: boolean;
  // type filter list
  public typeFilterList: any[] = [
    { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
    { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
    { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
    { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', measure: true },
    { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', measure: true  },
    { label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP' },
    { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
    { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' },
    { label: this.translateService.instant('msg.storage.ui.list.geo.point'), value: 'GEO_POINT', derived: true },
    { label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), value: 'GEO_POLYGON', derived: true },
    { label: this.translateService.instant('msg.storage.ui.list.geo.line'), value: 'GEO_LINE', derived: true },
  ];
  // selected type filter
  public selectedTypeFilter: any;
  // type filter show flag
  public isShowTypeFilterList: boolean;
  // filtered column list show flag
  public isShowOnlyFilterColumnList: boolean;
  // search text keyword
  public searchTextKeyword: string;
  // component show flag
  public isShowComponent: boolean;
  // LINKED datasource flag
  public isLinkedType: boolean;

  @Output()
  public updatedSchema: EventEmitter<any> = new EventEmitter();


  // constructor
  constructor(private _dataSourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * init
   * @param {string} sourceId
   * @param columnList
   * @param {boolean} isLinkedType
   */
  public init(sourceId: string, columnList: any, isLinkedType: boolean): void {
    // ui init
    this._initView();
    // source id
    this._sourceId = sourceId;
    // Copy only a list of columns, not a MEASURE
    // TODO 만약 TIMESTAMP로 지정된 컬럼도 filteringOptions 설정이 가능하도록 변경해달라고 하면 주석 해제할 것
    // this._columnList = _.cloneDeep(_.filter(columnList, column => column.role !== 'MEASURE'));
    this._columnList = _.cloneDeep(_.filter(columnList, column => column.role === 'DIMENSION'));
    // set origin recommend filtered column list
    this._originFilteringColumnList = _.cloneDeep(_.filter(this._columnList, column => column.filtering));
    // is LINKED type source
    this.isLinkedType = isLinkedType;
    // update filtered column list
    this._updateFilteredColumnList();
  }

  /**
   * Search keyword
   * @param {string} text
   */
  public searchText(text: string): void {
    this.searchTextKeyword = text;
    // update filtered column list
    this._updateFilteredColumnList();
  }

  /**
   * Is enabled filtering in column
   * @param column
   * @returns {boolean}
   */
  public isEnableColumnFiltering(column: any): boolean {
    return column.filtering;
  }

  /**
   * Is enabled filteringOption in column
   * @param column
   * @returns {boolean}
   */
  public isEnableColumnFilteringOptions(column: any): boolean {
    return column.filteringOptions;
  }

  /**
   * Get column type label
   * @param {string} type
   * @param typeList
   * @returns {string}
   */
  public getColumnTypeLabel(type:string, typeList: any): string {
    return typeList[_.findIndex(typeList, item => item['value'] === type)].label;
  }

  /**
   * Update column list
   */
  public updateColumnList(): void {
    // loading show
    this.loadingShow();
    // update column list
    this._dataSourceService.updateDatasourceFields(this._sourceId, this._getUpdateFieldParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // loading hide
        this.loadingHide();
        // change emit
        this.updatedSchema.emit();
        // close
        this.onClickCancel();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Click cancel button
   */
  public onClickCancel(): void {
    this.isShowComponent = false;
  }

  /**
   * Change role type filter
   * @param type
   */
  public onChangeRoleTypeFilter(type: any): void {
    if (this.selectedRoleTypeFilter !== type) {
      // change role type filter
      this.selectedRoleTypeFilter = type;
      // update filtered column list
      this._updateFilteredColumnList();
    }
  }

  /**
   * Change type filter
   * @param type
   */
  public onChangeTypeFilter(type: any): void {
    if (this.selectedTypeFilter !== type) {
      // 타입 필털이 변경
      this.selectedTypeFilter = type;
      // update filtered column list
      this._updateFilteredColumnList();
    }
  }

  /**
   * Change filtered list show flag
   */
  public onChangeShowFilter(): void {
    this.isShowOnlyFilterColumnList = !this.isShowOnlyFilterColumnList;
    // update filtered column list
    this._updateFilteredColumnList();
  }

  /**
   * Change filtering in column
   * @param column
   */
  public onClickSetColumnFiltering(column: any): void {
    // TODO 만약 TIMESTAMP로 지정된 컬럼도 filteringOptions 설정이 가능하도록 변경해달라고 하면 주석 해제할 것
    // if (column.role !== 'TIMESTAMP') {
      // if enabled filtering in column
      if (this.isEnableColumnFiltering(column)) {
        const seq = column.filteringSeq;
        // delete filtering
        delete column.filtering;
        delete column.filteringSeq;
        delete column.filteringOptions;
        // resort filtering in filtered column list
        this._resortFilteringColumnList(seq);
        // if enable filtered list show flag, update filtered column list
        this.isShowOnlyFilterColumnList && this._updateFilteredColumnList();
      } else {
        // set filtering
        column.filtering = true;
        // set seq
        column.filteringSeq = _.filter(this._columnList, item => item.filtering).length - 1;
      }
    // }
  }

  /**
   * Change filteringOption in column
   * @param column
   */
  public onClickSetColumnFilteringOptions(column: any): void {
    // Only works if filtering is enabled on the column
    if (this.isEnableColumnFiltering(column)) {
      // If filteringOptions is set on a column
      if (this.isEnableColumnFilteringOptions(column)) {
        delete column.filteringOptions;
      } else {
        // If not, set new options
        column.filteringOptions = new FilteringOptions();
        column.filteringOptions.type = column.logicalType === 'TIMESTAMP' ? FilteringOptionType.TIME : FilteringOptionType.INCLUSION;
        column.filteringOptions.defaultSelector = column.logicalType === 'TIMESTAMP' ? 'RANGE' : 'SINGLE_LIST';
        column.filteringOptions.allowSelectors = column.logicalType === 'TIMESTAMP' ? ['RANGE'] : ['SINGLE_LIST']
      }
    }
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // filter
    this.selectedTypeFilter = this.typeFilterList[0];
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // search
    this.searchTextKeyword = '';
    // only filtered list flag
    this.isShowOnlyFilterColumnList = false;
    // show flag
    this.isShowComponent = true;
  }

  /**
   * Update filtered column list
   * @private
   */
  private _updateFilteredColumnList(): void {
    let resultList: any = this._columnList;
    // role
    if (this.selectedRoleTypeFilter.value !== 'ALL') {
      resultList = _.filter(resultList, column => 'DIMENSION' === this.selectedRoleTypeFilter.value && 'TIMESTAMP' === column.role ? column : this.selectedRoleTypeFilter.value === column.role);
    }
    // type
    if (this.selectedTypeFilter.value !== 'ALL') {
      resultList = _.filter(resultList, column => this.selectedTypeFilter.value === column.logicalType);
    }
    // search
    if (this.searchTextKeyword !== '') {
      resultList = _.filter(resultList, column => column.name.toUpperCase().includes(this.searchTextKeyword.toUpperCase().trim()));
    }
    // only filtered list show
    if (this.isShowOnlyFilterColumnList) {
      resultList = _.filter(resultList, column => column.filtering);
    }
    this.filteredColumnList = resultList;
  }

  /**
   * Resort filtered column list
   * @param {number} seq
   * @private
   */
  private _resortFilteringColumnList(seq: number): void {
    _.forEach(_.filter(this._columnList, column => column.filtering && column.filteringSeq > seq), (column) => {
      column.filteringSeq--;
    });
  }

  /**
   * Get parameter for update column list
   * @returns {any}
   * @private
   */
  private _getUpdateFieldParams(): any {
    const result = [];
    const filteringList = _.filter(this._columnList, column => column.filtering);
    // add
    _.forEach(filteringList, (column) =>{
      // get column exist in origin filtered column list
      const temp = _.find(this._originFilteringColumnList, originColumn => originColumn.id === column['id']);
      // If is not exist in the origin filtered list
      // If different seq
      // If different filteringOptions
      if (!temp
        || temp.filteringSeq !== column['filteringSeq']
        || ((temp.filteringOptions && !column['filteringOptions']) || (!temp.filteringOptions && column['filteringOptions']))) {
        column['op'] = 'replace';
        result.push(column);
      }
    });
    // remove
    _.forEach(this._originFilteringColumnList, (originColumn) => {
      // If is not exist in the filtered list, add
      if (_.every(filteringList, column => column['id'] !== originColumn.id)) {
        originColumn['op'] = 'replace';
        originColumn['filtering'] = false;
        result.push(originColumn);
      }
    });
    return result;
  }
}
