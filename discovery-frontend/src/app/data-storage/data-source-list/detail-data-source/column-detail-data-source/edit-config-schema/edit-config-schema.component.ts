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

import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {Field, FieldFormat, FieldFormatType, FieldRole, LogicalType} from '../../../../../domain/datasource/datasource';

import * as _ from 'lodash';
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {Alert} from '../../../../../common/util/alert.util';
import {StringUtil} from "../../../../../common/util/string.util";

@Component({
  selector: 'edit-config-schema',
  templateUrl: './edit-config-schema.component.html'
})
export class EditConfigSchemaComponent extends AbstractPopupComponent {

  // 데이터소스 아이디
  private _sourceId: string;
  // origin field list
  private _originFieldList: Field[];

  // search keyword
  public searchTextKeyword: string;
  // filtered field list
  public filteredFieldList: Field[];
  // role type filter list
  public roleTypeFilterList: any[];
  // selected role type filter
  public selectedRoleTypeFilter: any;
  // type filter list
  public typeFilterList: any[];
  // selected type filter
  public selectedTypeFilter: any;
  // convertible type list
  public convertibleTypeList: any;

  // show flag
  public isShowFl: boolean = false;

  // Field role
  public fieldRole: any = FieldRole;

  // logical type list
  public logicalTypes: any[] = [
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

  @Output()
  public updatedSchema: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * init
   * @param {string} datasourceId
   * @param {Field[]} fields
   * @param {any[]} roleTypeFilterList
   * @param {any[]} typeFilterList
   */
  public init(datasourceId: string, fields: Field[], roleTypeFilterList: any[], typeFilterList: any[]): void {
    // 데이터소스 아이디
    this._sourceId = datasourceId;
    // set filter list
    this.typeFilterList = typeFilterList;
    this.selectedTypeFilter = this.typeFilterList[0];
    this.roleTypeFilterList = roleTypeFilterList;
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // set origin field list
    this._originFieldList = _.cloneDeep(fields);
    this._originFieldList.forEach((column) => {
      // 타임스탬프인데 format이 없는경우 init
      if (column.logicalType === LogicalType.TIMESTAMP && !column.format) {
        column.format = new FieldFormat();
      }
    });
    // init filtered field list
    this._updateFilteredFieldList();
    // flag
    this.isShowFl = true;
  }


  /**
   * save
   */
  public save(): void {
    this._updateSchema();
  }

  /**
   * cancel
   */
  public cancel(): void {
    this.isShowFl = false;
    this.selectedTypeFilter = undefined;
    this.selectedRoleTypeFilter = undefined;
    this._sourceId = undefined;
    this.searchTextKeyword = undefined;

    this._originFieldList = undefined;
    this.roleTypeFilterList = undefined;
    this.typeFilterList = undefined;
    this.filteredFieldList = undefined;
    this.convertibleTypeList = undefined;
  }

  /**
   * Search text
   * @param {string} keyword
   */
  public searchText(keyword: string): void {
    // set search text keyword
    this.searchTextKeyword = keyword;
    // update filtered field list
    this._updateFilteredFieldList();
  }

  /**
   * Get selected logical type label
   * @param {Field} field
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(field: Field): string {
    return (this.typeFilterList.find(type => type.value === field.logicalType) || this.typeFilterList[1]).label;
  }

  /**
   * Changed role type filter
   * @param type
   */
  public onChangedRoleTypeFilter(type: any): void {
    // set selected role type filter
    this.selectedRoleTypeFilter = type;
    // update filtered field list
    this._updateFilteredFieldList();
  }

  /**
   * Changed type filter
   * @param type
   */
  public onChangedTypeFilter(type: any): void {
    // set selected type filter
    this.selectedTypeFilter = type;
    // update filtered field list
    this._updateFilteredFieldList();
  }

  /**
   * logical type 변경 이벤트
   * @param {Field} field
   * @param logicalType
   */
  public onChangeLogicalType(field: Field, logicalType: any): void {
    // 변경이벤트 체크
    this.onChangeValue(field);
    // 만약 변경될 타입이 logicalType이라면 format init
    if (logicalType.value === 'TIMESTAMP' && !field.format) {
      field.format = new FieldFormat();
      field.format.type = FieldFormatType.DATE_TIME;
    }
    // logical type 변경
    field.logicalType = logicalType.value;
    // Role 이 측정값인데 logicalType이 float과 integer가 아니라면 role을 차원값으로 변경
    // if (field.role === FieldRole.MEASURE && (field.logicalType !== LogicalType.FLOAT && field.logicalType !== LogicalType.INTEGER)) {
    //   field.role = FieldRole.DIMENSION;
    // }
  }

  /**
   * filed 의 변경이벤트 발생
   * @param {Field} field
   */
  public onChangeValue(field: Field): void {
    // 변경이벤트 체크
    field['replaceFl'] = true;
  }

  /**
   * Change type list show flag
   * @param {Field} field
   */
  public onChangeTypeListShowFlag(field: Field): void {
    // if not derived and TIMESTAMP
    if (!field.derived && field.role !== FieldRole.TIMESTAMP) {
      !field['isShowTypeList'] && this._setConvertedTypeList(field);
      field['isShowTypeList'] = !field['isShowTypeList'];
    }
  }

  /**
   * Update filtered field list
   * @private
   */
  private _updateFilteredFieldList(): void {
    // set filtered field list
    this.filteredFieldList = this._originFieldList.filter(field =>
      (this.selectedRoleTypeFilter.value === 'ALL' ? true : (FieldRole.DIMENSION === this.selectedRoleTypeFilter.value && FieldRole.TIMESTAMP === field.role ? field : this.selectedRoleTypeFilter.value === field.role))
      && (this.selectedTypeFilter.value === 'ALL' ? true : this.selectedTypeFilter.value === field.logicalType)
      && (StringUtil.isEmpty(this.searchTextKeyword) ? true : field.name.toUpperCase().includes(this.searchTextKeyword.toUpperCase().trim())));
  }

  /**
   * Update schema
   * @private
   */
  private _updateSchema(): void {
    // 로딩 show
    this.loadingShow();
    // 필드 업데이트
    this.datasourceService.updateDatasourceFields(this._sourceId, this._getUpdateFieldParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.schema.config.success'));
        // 로딩 hide
        this.loadingHide();
        // 변경 emit
        this.updatedSchema.emit();
        // close
        this.cancel();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * Get update field params
   * @return {Field[]}
   * @private
   */
  private _getUpdateFieldParams(): Field[] {
    return this._originFieldList.reduce((acc, field) => {
      if (field['replaceFl']) {
        field['op'] = 'replace';
        delete field['replaceFl'];
        delete field['isShowTypeList'];
        acc.push(field);
      }
      return acc;
    }, []);
  }

  /**
   * Set converted type list
   * @param {Field} field
   * @private
   */
  private _setConvertedTypeList(field: Field): void {
    this.convertibleTypeList = field.role === FieldRole.MEASURE
      ? this.logicalTypes.filter(type => !type.derived && type.measure)
      : this.logicalTypes.filter(type => !type.derived);
  }
}
