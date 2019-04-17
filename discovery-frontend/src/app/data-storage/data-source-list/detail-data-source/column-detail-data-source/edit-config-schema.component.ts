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

import {Component, ElementRef, EventEmitter, Injector, Output, QueryList, ViewChildren} from '@angular/core';
import {
  ConnectionType,
  Datasource,
  Field,
  FieldFormat,
  FieldFormatType,
  FieldRole,
  LogicalType
} from '../../../../domain/datasource/datasource';

import * as _ from 'lodash';
import {DatasourceService} from '../../../../datasource/service/datasource.service';
import {Alert} from '../../../../common/util/alert.util';
import {StringUtil} from "../../../../common/util/string.util";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {DataSourceCreateService, TypeFilterObject} from "../../../service/data-source-create.service";
import {AuthenticationType, Dataconnection, ImplementorType} from "../../../../domain/dataconnection/dataconnection";
import {QueryParam} from "../../../../domain/dashboard/dashboard";
import {DataconnectionService} from "../../../../dataconnection/service/dataconnection.service";
import {FieldConfigService} from "../../../service/field-config.service";
import {ConstantService} from "../../../../shared/datasource-metadata/service/constant.service";
import {Filter} from "../../../../shared/datasource-metadata/domain/filter";
import {Type} from "../../../../shared/datasource-metadata/domain/type";
import {isNullOrUndefined} from "util";
import {StorageService} from "../../../service/storage.service";
import {DatetimeValidPopupComponent} from "../../../../shared/datasource-metadata/component/datetime-valid-popup.component";
import Role = Type.Role;
import {CommonUtil} from "../../../../common/util/common.util";

@Component({
  selector: 'edit-config-schema',
  templateUrl: './edit-config-schema.component.html'
})
export class EditConfigSchemaComponent extends AbstractComponent {

  @ViewChildren(DatetimeValidPopupComponent)
  private readonly _datetimePopupComponentList: QueryList<DatetimeValidPopupComponent>;

  // 데이터소스 아이디
  private _sourceId: string;
  // origin field list
  private _originFieldList: Field[];
  // data list
  public fieldDataList: any[];

  // search keyword
  public searchTextKeyword: string;
  // field list
  public fieldList: Field[];
  // filtered field list
  public filteredFieldList: Field[];

  // filter list
  public roleTypeFilterList: Filter.Role[];
  public selectedRoleTypeFilter: Filter.Role;
  public logicalTypeFilterList: Filter.Logical[];
  public selectedLogicalTypeFilter: Filter.Logical;
  // convertible type list
  public convertibleTypeList: Filter.Logical[];

  // show flag
  public isShowPopup: boolean;

  // enum variable
  public readonly FIELD_ROLE: any = FieldRole;
  public readonly LOGICAL_TYPE: any = LogicalType;
  public readonly FIELD_FORMAT_TYPE: any = FieldFormatType;

  // error flag
  public isExistErrorInFieldList: boolean;

  // constant
  public readonly UUID = CommonUtil.getUUID();
  public readonly TYPE_SELECT_LIST_WRAP_ELEMENT = this.UUID + '-type-select-list-wrap-elm';
  public readonly TYPE_SELECT_LIST_ICON_ELEMENT = this.UUID + '-type-select-list-icon-elm';
  public readonly TYPE_SELECTED_LABEL_ELEMENT = this.UUID + '-type-selected-label-elm';
  public readonly TYPE_SELECTED_ICON_ELEMENT = this.UUID + '-type-selected-icon-elm';


  @Output()
  public readonly updatedSchema: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private datasourceCreateService: DataSourceCreateService,
              private fieldConfigService: FieldConfigService,
              private connectionService: DataconnectionService,
              private storageService: StorageService,
              public constant: ConstantService,
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
  public init(datasourceId: string, fields: Field[], datasource: Datasource): void {
    // 데이터소스 아이디
    this._sourceId = datasourceId;
    // set filter list
    this.logicalTypeFilterList = this.constant.getTypeFilters();
    this.selectedLogicalTypeFilter = this.constant.getTypeFiltersFirst();
    this.roleTypeFilterList = this.constant.getRoleTypeFilters();
    this.selectedRoleTypeFilter = this.constant.getRoleTypeFilterFirst();
    // set origin field list
    this._originFieldList = _.cloneDeep(fields);
    this.fieldList = _.cloneDeep(fields);
    this.fieldList.forEach((column) => {
      // 타임스탬프인데 format이 없는경우 init
      if (column.logicalType === LogicalType.TIMESTAMP && !column.format) {
        column.format = new FieldFormat();
      }
      if (column.logicalType === LogicalType.TIMESTAMP) {
        column.format.isValidFormat = true;
      }
    });
    // init filtered field list
    this._updateFilteredFieldList();
    // set field data list
    this._setFieldDataList(datasource);
    // flag
    this.isShowPopup = true;
  }

  /**
   * Set exist error in field list flag
   */
  public setIsExistErrorInFieldListFlag(): void {
    this.isExistErrorInFieldList = this.fieldList.some(field =>  field.role !== FieldRole.TIMESTAMP && (field.logicalType === LogicalType.TIMESTAMP && !field.format.isValidFormat));
  }

  /**
   * save
   */
  public save(): void {
    // if not exist error
    if (!this.isExistErrorInFieldList) {
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
        .catch(error => this.commonExceptionHandler(error));
    }
  }

  /**
   * cancel
   */
  public cancel(): void {
    this.isShowPopup = undefined;
    this.selectedLogicalTypeFilter = undefined;
    this.selectedRoleTypeFilter = undefined;
    this._sourceId = undefined;
    this.searchTextKeyword = undefined;

    this._originFieldList = undefined;
    this.logicalTypeFilterList = undefined;
    this.roleTypeFilterList = undefined;
    this.filteredFieldList = undefined;
    this.convertibleTypeList = undefined;
    this.isExistErrorInFieldList = undefined;
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
   * Is show information icon
   * @param {Field} field
   * @return {boolean}
   */
  public isShowInformationIcon(field: Field): boolean {
    // TODO if not TIMESTAMP field
    // is field logicalType TIMESTAMP OR invalid GEO types
    // return field.role !== FieldRole.TIMESTAMP && (field.format && !field.format.isValidFormat && (field.logicalType === LogicalType.GEO_POINT || field.logicalType === LogicalType.GEO_LINE || field.logicalType === LogicalType.GEO_POLYGON));
    return field.role !== FieldRole.TIMESTAMP && field.logicalType === LogicalType.TIMESTAMP;
  }

  /**
   * Is invalid information icon
   * @param {Field} field
   * @return {boolean}
   */
  public isInvalidInformationIcon(field: Field): boolean {
    return field.format && field.format.isValidFormat === false;
  }

  /**
   * Is valid information icon
   * @param {Field} field
   * @return {boolean}
   */
  public isValidInformationIcon(field: Field): boolean {
    return field.format && field.format.isValidFormat !== false;
  }

  /**
   * Is disable chagne type
   * @param {Field} field
   * @return {boolean}
   */
  public isDisableChangeType(field: Field): boolean {
    return field.derived || field.role === FieldRole.TIMESTAMP || (field.logicalType === LogicalType.GEO_LINE || field.logicalType === LogicalType.GEO_POINT || field.logicalType === LogicalType.GEO_POLYGON);
  }

  /**
   * Get selected logical type label
   * @param {Field} field
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(field: Field): string {
    return (this.logicalTypeFilterList.find(type => type.value === field.logicalType.toString()) || this.logicalTypeFilterList[1]).label;
  }

  /**
   * Click info icon
   * @param {Field} field
   */
  public onClickInfoIcon(field: Field): void {
    if (field.logicalType === LogicalType.TIMESTAMP) {
      // if open type list
      if (field.isShowTypeList) {
        field.isShowTypeList = false;
      }
      field.format.isShowTimestampValidPopup = true;
      const index = this.filteredFieldList.filter(item => item.role !== FieldRole.TIMESTAMP && item.logicalType === LogicalType.TIMESTAMP).findIndex(item => item.name === field.name);
      // popup show
      this._datetimePopupComponentList.toArray()[index].init();
    }
  }

  /**
   * Changed role type filter
   * @param {TypeFilterObject} filter
   */
  public onChangedRoleTypeFilter(filter: Filter.Role): void {
    if (this.selectedRoleTypeFilter.value !== filter.value) {
      // set selected role type filter
      this.selectedRoleTypeFilter = filter;
      // update filtered field list
      this._updateFilteredFieldList();
    }
  }

  /**
   * Change logical type filter
   * @param {TypeFilterObject} filter
   */
  public onChangedLogicalTypeFilter(filter: Filter.Logical): void {
    if (this.selectedLogicalTypeFilter.value !== filter.value) {
      // set selected type filter
      this.selectedLogicalTypeFilter = filter;
      // update filtered field list
      this._updateFilteredFieldList();
    }
  }


  /**
   * logical type 변경 이벤트
   * @param {Field} field
   * @param logicalType
   */
  public onChangeLogicalType(targetField: Field, typeToChange): void {
    // if different type
    if (targetField.logicalType !== typeToChange.value) {
      // prev logical type
      const prevLogicalType: LogicalType = targetField.logicalType;
      // change logical type
      targetField.logicalType = typeToChange.value;
      // 만약 기존 타입이 GEO 또는 TIMESTAMP 타입이라면
      if (prevLogicalType ===  LogicalType.GEO_POINT || prevLogicalType === LogicalType.GEO_POLYGON || prevLogicalType === LogicalType.GEO_LINE || prevLogicalType === LogicalType.TIMESTAMP) {
        // remove format
        delete targetField.format;
        this.setIsExistErrorInFieldListFlag();
      }
      // 변경될 타입이 GEO 타입이라면
      if (typeToChange.value === LogicalType.GEO_POINT || typeToChange.value === LogicalType.GEO_POLYGON || typeToChange.value === LogicalType.GEO_LINE) {
        // if not exist format in field
        if (isNullOrUndefined(targetField.format)) {
          targetField.format = new FieldFormat();
        }
        // loading show
        this.loadingShow();
        // valid WKT
        this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(targetField.format, this.fieldConfigService.getFieldDataList(targetField, this.fieldDataList), typeToChange.value)
          .then((result) => {
            this.setIsExistErrorInFieldListFlag();
            // loading hide
            this.loadingHide();
          })
          .catch((error) => {
            this.setIsExistErrorInFieldListFlag();
            // loading hide
            this.loadingHide();
          });
      } else if (typeToChange.value === LogicalType.TIMESTAMP && isNullOrUndefined(targetField.format)) {  // 변경될 타입이 TIMESTAMP 타입이라면
        targetField.format = new FieldFormat();
        //
        this.safelyDetectChanges();
        // open timestamp popup
        this.onClickInfoIcon(targetField);
      }
      // close list
      targetField.isShowTypeList = false;
    }
  }

  /**
   * Change type list show flag
   * @param {Field} field
   */
  public onChangeTypeListShowFlag(field: Field, event: MouseEvent): void {
    const targetElement = event.target['classList'];
    // if not derived and TIMESTAMP
    if ((targetElement.contains(this.TYPE_SELECT_LIST_ICON_ELEMENT) || targetElement.contains(this.TYPE_SELECT_LIST_WRAP_ELEMENT) || targetElement.contains(this.TYPE_SELECTED_ICON_ELEMENT)) || targetElement.contains(this.TYPE_SELECTED_LABEL_ELEMENT)
      && !this.isDisableChangeType(field)) {
      if (!field.isShowTypeList) {
        this._setConvertedTypeList(field);
      }
      field.isShowTypeList = !field.isShowTypeList;
    }
  }

  /**
   * Update filtered field list
   * @private
   */
  private _updateFilteredFieldList(): void {
    // set filtered field list
    this.filteredFieldList = this.fieldList.filter(field =>
      (this.selectedRoleTypeFilter.value === 'ALL' ? true : (Role.DIMENSION === this.selectedRoleTypeFilter.value && FieldRole.TIMESTAMP === field.role ? field : this.selectedRoleTypeFilter.value === field.role.toString()))
      && (this.selectedLogicalTypeFilter.value === 'ALL' ? true : this.selectedLogicalTypeFilter.value === field.logicalType.toString())
      && (StringUtil.isEmpty(this.searchTextKeyword) ? true : field.name.toUpperCase().includes(this.searchTextKeyword.toUpperCase().trim())));
  }

  /**
   * Get update field params
   * @return {Field[]}
   * @private
   */
  private _getUpdateFieldParams(): Field[] {
    const result = [];
    // original fields list loop
    this._originFieldList.forEach((originField) => {
      // if not derived and TIMESTAMP column
      if (!originField.derived && originField.role !== FieldRole.TIMESTAMP) {
        // find field in fieldList
        const targetField = this.fieldList.find(field => field.name === originField.name);
        // if not exist target field (removed field)
        if (isNullOrUndefined(targetField)) {
          // TODO removed field 설정후 result.push
        } else { // if exist target field
          const tempField = _.cloneDeep(targetField);
          delete tempField.isShowTypeList;
          // if changed logical name
          if (originField.logicalName !== tempField.logicalName) {
            tempField.op = 'replace';
          }
          // if changed description
          else if (originField.description !== tempField.description) {
            tempField.op = 'replace';
          }
          // if changed logical type
          if (originField.logicalType !== tempField.logicalType) {
            tempField.op  = 'replace';
            // if exist format and is not TIMESTAMP or GEO
            if (tempField.hasOwnProperty('format') && tempField.logicalType !== LogicalType.TIMESTAMP && tempField.logicalType !== LogicalType.GEO_POINT && tempField.logicalType !== LogicalType.GEO_LINE && tempField.logicalType !== LogicalType.GEO_POLYGON) {
              // remove format property
              tempField.format = null;
            } else if (tempField.logicalType === LogicalType.TIMESTAMP) { // if change type is TIMESTAMP
              tempField.format.removeUIProperties();
            }
            // if is TIMESTAMP, different format type, unit, format
          } else if (originField.logicalType === tempField.logicalType && tempField.logicalType === LogicalType.TIMESTAMP && (originField.format.type !== tempField.format.type || originField.format.format !== tempField.format.format || originField.format.unit !== tempField.format.unit)) {
            tempField.op  = 'replace';
            tempField.format.removeUIProperties();
          }
          // push result
          tempField.op && result.push(tempField);
        }
      }
    });
    // TODO check created field
    // this.fieldList.forEach((field) => {
    //   if (isNullOrUndefined(this._originFieldList.find(originField => originField.name === field.name))) {
    //     // TODO created field 설정후 result.push
    //   }
    // });
    return result;
  }

  /**
   * Get connection params
   * @param {any} ingestion
   * @param {Dataconnection} connection
   * @returns {{connection: {hostname; port; username; password; implementor}; database: any; type: any; query: any}}
   * @private
   */
  private _getConnectionParams(ingestion: any, connection: Dataconnection) {
    const connectionType = this.storageService.findConnectionType(connection.implementor);
    const params = {
      connection: {
        implementor: connection.implementor,
        authenticationType: connection.authenticationType || AuthenticationType.MANUAL
      },
      database: ingestion.database,
      type: ingestion.dataType,
      query: ingestion.query
    };
    // if not used URL
    if (StringUtil.isEmpty(connection.url)) {
      params.connection['hostname'] = connection.hostname;
      params.connection['port'] = connection.port;
      if (this.storageService.isRequireCatalog(connectionType)) {
        params.connection['catalog'] = connection.catalog;
      } else if (this.storageService.isRequireDatabase(connectionType)) {
        params.connection['database'] = connection.database;
      } else if (this.storageService.isRequireSid(connectionType)) {
        params.connection['sid'] = connection.sid;
      }
    } else {  // if used URL
      params.connection['url'] = connection.url;
    }
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== AuthenticationType.USERINFO) {
      params.connection['username'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionUsername : connection.username;
      params.connection['password'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionPassword : connection.password;
    }
    return params;
  }

  /**
   * Set converted type list
   * @param {Field} field
   * @private
   */
  private _setConvertedTypeList(field: Field): void {
    if (field.role === FieldRole.MEASURE) {
      this.convertibleTypeList = this.constant.getTypeFiltersInMeasure();
    }
    // else if (field.role === FieldRole.DIMENSION && field.type === LogicalType.STRING.toString()) {
    //   this.convertibleTypeList = this.constant.getTypeFiltersInDimensionOnlyBaseTypeString(); }
    else {
      this.convertibleTypeList = this.constant.getTypeFiltersInDimension();
    }
  }


  /**
   * Set field data list
   * @param {Datasource} datasource
   * @private
   */
  public _setFieldDataList(datasource: Datasource): void {
    // 로딩 show
    this.loadingShow();
    // Linked datasource
    if (datasource.connType === ConnectionType.LINK) {
      // used preset : source.connection
      // not used preset : source.ingestion.connection
      const connection: Dataconnection = datasource.connection || datasource.ingestion.connection;
      this.connectionService.getTableDetailWitoutId(this._getConnectionParams(datasource.ingestion, connection), connection.implementor === ImplementorType.HIVE)
        .then((result: {data: any, fields: Field[], totalRows: number}) => {
          // grid data
          this.fieldDataList = result.data;
          // 로딩 hide
          this.loadingHide();
        })
        .catch(error => this.commonExceptionHandler(error));
    } else if (datasource.connType === ConnectionType.ENGINE) { // Engine datasource
      // params
      const params = new QueryParam();
      params.limits.limit = 20;
      params.dataSource.name = datasource.engineName;
      params.dataSource.engineName = datasource.engineName;
      params.dataSource.connType = 'ENGINE';
      params.dataSource.type = 'default';
      this.datasourceService.getDatasourceQuery(params)
        .then((result) => {
          // grid data
          this.fieldDataList = result;
          // 로딩 hide
          this.loadingHide();
        })
        .catch(error => this.commonExceptionHandler(error));
    }
  }
}
