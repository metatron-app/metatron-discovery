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

import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
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
import Role = Type.Role;

@Component({
  selector: 'edit-config-schema',
  templateUrl: './edit-config-schema.component.html'
})
export class EditConfigSchemaComponent extends AbstractComponent {
  // 데이터소스 아이디
  private _sourceId: string;
  // origin field list
  private _originFieldList: Field[];
  // data list
  public fieldDataList: any[];

  // default format object
  public defaultFormatObj: any = {};
  // search keyword
  public searchTextKeyword: string;
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
    this._originFieldList.forEach((column) => {
      // 타임스탬프인데 format이 없는경우 init
      if (column.logicalType === LogicalType.TIMESTAMP && !column.format) {
        column.format = new FieldFormat();
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
   *
   * @private
   */
  private _setIsExistErrorInFieldListFlag(): void {
    this.isExistErrorInFieldList = this._originFieldList.some(field =>
      ((field.logicalType === LogicalType.GEO_POINT || field.logicalType === LogicalType.GEO_LINE || field.logicalType === LogicalType.GEO_POLYGON) && field.isValidType === false)
      || (field.logicalType === LogicalType.TIMESTAMP && field.isValidTimeFormat === false));
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
   * filed 의 변경이벤트 발생
   * @param {Field} field
   */
  public setReplaceFlag(field: Field): void {
    // 변경이벤트 체크
    field['replaceFl'] = true;
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
      field.isShowTypeValidPopup = true;
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
  public onChangeLogicalType(targetField: Field, typeToChange: any): void {
    // if different type
    if (targetField.logicalType !== typeToChange.value) {
      // prev logical type
      const prevLogicalType: LogicalType = targetField.logicalType;
      // change logical type
      targetField.logicalType = typeToChange.value;
      // 만약 기존 타입이 GEO 타입이라면
      if ((prevLogicalType ===  LogicalType.GEO_POINT || prevLogicalType === LogicalType.GEO_POLYGON || prevLogicalType === LogicalType.GEO_LINE) && targetField.hasOwnProperty('isValidType')) {
        this._setIsExistErrorInFieldListFlag();
        // remove valid flag
        delete targetField.isValidType;
      } else if (prevLogicalType === LogicalType.TIMESTAMP) {  // 만약 기존 타입이 타임타입이라면
        // remove format
        delete targetField.format;
        this._setIsExistErrorInFieldListFlag();
        // if exist timestamp valid result
        (targetField.hasOwnProperty('isValidTimeFormat')) && (delete targetField.isValidTimeFormat);
      }
      // 변경될 타입이 GEO 타입이라면
      if (typeToChange.value === LogicalType.GEO_POINT || typeToChange.value === LogicalType.GEO_POLYGON || typeToChange.value === LogicalType.GEO_LINE) {
        // loading show
        this.loadingShow();
        // valid WKT
        this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(targetField, this.fieldConfigService.getFieldDataList(targetField, this.fieldDataList))
          .then((result) => {
            this._setIsExistErrorInFieldListFlag();
            // loading hide
            this.loadingHide();
          })
          .catch((error) => {
            // loading hide
            this.loadingHide();
          });
      } else if (typeToChange.value === LogicalType.TIMESTAMP) {  // 변경될 타입이 TIMESTAMP 타입이라면
        // show layer
        targetField.isShowTypeValidPopup = true;
      }
    }
  }

  /**
   * Change type list show flag
   * @param {Field} field
   */
  public onChangeTypeListShowFlag(field: Field): void {
    // if not derived and TIMESTAMP
    if (!field.derived && field.role !== FieldRole.TIMESTAMP) {
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
    this.filteredFieldList = this._originFieldList.filter(field =>
      (this.selectedRoleTypeFilter.value === 'ALL' ? true : (Role.DIMENSION === this.selectedRoleTypeFilter.value && FieldRole.TIMESTAMP === field.role ? field : this.selectedRoleTypeFilter.value === field.role.toString()))
      && (this.selectedLogicalTypeFilter.value === 'ALL' ? true : this.selectedLogicalTypeFilter.value === field.logicalType.toString())
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
      .catch(error => this.commonExceptionHandler(error));
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
        // if is TIMESTAMP logical type
        if (field.logicalType === LogicalType.TIMESTAMP) {
          // DATE_TIME
          if (field.format.type === FieldFormatType.DATE_TIME) {
            // remove format unit
            delete field.format.unit;
          } else if (field.format.type === FieldFormatType.UNIX_TIME) { // UNIX_TIME
            // remove format
            delete field.format.format;
            // remove timezone
            delete field.format.timeZone;
            delete field.format.locale;
          }
        }
        acc.push(field);
      }
      return acc;
    }, []);
  }

  /**
   * Get connection params
   * @param {any} ingestion
   * @param {Dataconnection} connection
   * @returns {{connection: {hostname; port; username; password; implementor}; database: any; type: any; query: any}}
   * @private
   */
  private _getConnectionParams(ingestion: any, connection: Dataconnection) {
    const params = {
      connection: {
        hostname: connection.hostname,
        port: connection.port,
        implementor: connection.implementor,
        authenticationType: connection.authenticationType || AuthenticationType.MANUAL
      },
      database: ingestion.database,
      type: ingestion.dataType,
      query: ingestion.query
    };
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== AuthenticationType.USERINFO) {
      params['connection']['username'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionUsername : connection.username;
      params['connection']['password'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionPassword : connection.password;
    }

    // 데이터 베이스가 있는경우
    if (ingestion.connection && ingestion.connection.hasOwnProperty('database')) {
      params['connection']['database'] = ingestion.connection.database;
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
    } else if (field.role === FieldRole.DIMENSION && field.type === LogicalType.STRING.toString()) {
      this.convertibleTypeList = this.constant.getTypeFiltersInDimensionOnlyBaseTypeString();
    } else {
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
