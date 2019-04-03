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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from '@angular/core';
import {
  ConnectionType,
  DatasourceInfo,
  Field,
  FieldFormat,
  FieldFormatType,
  IngestionRuleType,
  LogicalType
} from '../../../domain/datasource/datasource';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {StringUtil} from '../../../common/util/string.util';
import {AddColumnComponent} from '../../data-source-list/component/add-column.component';
import * as _ from 'lodash';
import {Alert} from '../../../common/util/alert.util';
import {SchemaConfigActionBarComponent} from './schema-config-action-bar.component';
import {SchemaConfigDetailComponent} from './schema-config-detail.component';
import {TimezoneService} from "../../service/timezone.service";
import {DataSourceCreateService} from "../../service/data-source-create.service";
import {FieldConfigService} from "../../service/field-config.service";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'schema-config-component',
  templateUrl: 'schema-config.component.html'
})
export class SchemaConfigComponent extends AbstractComponent {

  @Input('sourceData')
  private _sourceData: DatasourceInfo;
  // origin field list
  private _originFieldList: Field[];
  // origin field data list
  private _originFieldData: any;
  // add column component
  @ViewChild(AddColumnComponent)
  private _addColumnComponent: AddColumnComponent;
  // action bar component
  @ViewChild(SchemaConfigActionBarComponent)
  private _actionBarComponent: SchemaConfigActionBarComponent;
  // field detail component
  @ViewChild(SchemaConfigDetailComponent)
  private _configDetailComponent: SchemaConfigDetailComponent;

  // filtered field list
  public filteredFieldList: Field[];
  // timestamp field list
  public timestampFieldList: Field[] = [];
  // timestamp field list show / hide flag
  public timestampFieldListShowFlag: boolean;

  // selected field
  public selectedField: Field;
  // selected field data list
  public selectedFieldDataList: any = [];
  // selected timestamp field
  public selectedTimestampField: Field;
  // selected timestamp type (FIELD, CURRENT)
  public selectedTimestampType: string;

  // search text
  public searchText: string;

  // logical type filter list
  public logicalTypeFilterList: any[] = this.datasourceCreateService.getLogicalTypeFilterList();
  // selected logical type filter
  public selectedLogicalTypeFilter: any;
  // logical type filter list show / hide flag
  public logicalTypeFilterListShowFlag: boolean;
  // role type filter list
  public roleTypeFilterList: any[] = this.datasourceCreateService.getRoleTypeFilterList();
  // selected role type filter
  public selectedRoleTypeFilter: any;

  // add field modal show / hide flag
  public addFieldShowFlag: boolean;

  // selected action object
  public selectedAction: any;

  // step changed
  @Output()
  public changedStep: EventEmitter<string> = new EventEmitter();

  // 생성자
  constructor(private datasourceCreateService: DataSourceCreateService,
              private datasourceService: DatasourceService,
              private timezoneService: TimezoneService,
              private fieldConfigService: FieldConfigService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // if exist prev schema data, load schema data
    // if not exist prev schema data, init view
    this._sourceData.schemaData ? this._loadSchemaData(_.cloneDeep(this._sourceData.schemaData)) : this._initView();
    // if action bar open
    if (this.getCheckedFieldList().length !== 0) {
      this._actionBarComponent.init(this.getCheckedFieldList(), this.selectedTimestampField, this.selectedTimestampType, this.selectedAction);
    }
  }

  public getConnectionType(): ConnectionType {
    return this._sourceData.connType;
  }

  /**
   * Get logical type icon class
   * @param {Field} field
   * @returns {string}
   */
  public getLogicalTypeIconClass(field: Field): string {
    switch (field.logicalType) {
      case LogicalType.TIMESTAMP:
        return 'ddp-icon-type-calen';
      case LogicalType.BOOLEAN:
        return 'ddp-icon-type-tf';
      case LogicalType.STRING:
        return field.derived ? 'ddp-icon-type-expression' : 'ddp-icon-type-ab';
      case LogicalType.INTEGER:
        return 'ddp-icon-type-int';
      case LogicalType.FLOAT:
      case LogicalType.DOUBLE:
        return 'ddp-icon-type-float';
      case LogicalType.LNG:
        return 'ddp-icon-type-longitude';
      case LogicalType.LNT:
        return 'ddp-icon-type-latitude';
      case LogicalType.GEO_POINT:
        return 'ddp-icon-type-point';
      case LogicalType.GEO_LINE:
        return 'ddp-icon-type-line';
      case LogicalType.GEO_POLYGON:
        return 'ddp-icon-type-polygon';
      default:
        return '';
    }
  }

  /**
   * Get checked field list
   * @returns {Field[]}
   */
  public getCheckedFieldList(): Field[] {
    return this._originFieldList.filter(field => field.checked);
  }

  /**
   * Set selected action
   * @param {object} param
   */
  public setSelectedAction(param: object): void {
    this.selectedAction = param;
  }

  /**
   * Change logical type list in selected field
   * @param field
   */
  public changeLogicalTypeListInSelectedField(field: Field): void {
    if (field === this.selectedField) {
      this._configDetailComponent.setLogicalTypeList(field);
    }
  }

  /**
   * Add field in origin field list
   * @param field
   */
  public addFieldInFieldList(field: any): void {
    if (field) {
      // data push in fields
      this._originFieldList.unshift(field);
      // if field is GEO types
      if (field.logicalType.indexOf('GEO_') !== -1) {
        // temp
        let temp: string;
        // set field data list
        this._originFieldData.forEach((item) => {
          // if exist property not empty
          if (item[field.derivationRule.latField] || item[field.derivationRule.lonField]) {
            temp = item[field.derivationRule.latField] || '';
            temp += ',';
            temp += item[field.derivationRule.lonField] || '';
            item[field.name] = temp;
          }
        });
      }
    }
    // close add field modal
    this.addFieldShowFlag = false;
  }

  /**
   * Check and init timestamp field
   */
  public checkAndInitTimestampField(): void {
    // set timestamp list
    this._setTimestampFieldList();
    // if exist timestamp list, not selected timestamp field
    if (this.timestampFieldList.length > 0 && !this.selectedTimestampField) {
      // set selected timestamp field
      this.selectedTimestampField = this.timestampFieldList[0];
      // set FIELD timestamp type
      this.selectedTimestampType = 'FIELD';
    } else if (this.timestampFieldList.every(field => field !== this.selectedTimestampField)) { // if selected field is timestamp field
      // set NULL selected timestamp field
      this.selectedTimestampField = null;
      // set CURRENT timestamp type
      this.selectedTimestampType = 'CURRENT';
    }
  }

  /**
   * Prev click event
   */
  public onClickPrev(): void {
    // if exist schemaData, remove schemaData
    this._sourceData.schemaData && (delete this._sourceData.schemaData);
    // save schemaData
    this._saveSchemaData(this._sourceData);
    // move to prev step
    this.changedStep.emit('prev');
  }

  /**
   * Next click event
   */
  public onClickNext(): void {
    // if enable next
    if (this._isEnableNext()) {
      // is changed timestamp field
      const isChangedTimestampField: boolean = this._isChangedTimestampField();
      // if exist schemaData, remove schemaData
      this._sourceData.schemaData && (delete this._sourceData.schemaData);
      // save schemaData
      this._saveSchemaData(this._sourceData);
      // if changed timestamp field
      this._sourceData.schemaData['isChangedTimestampField'] = isChangedTimestampField;
      // move to next step
      this.changedStep.emit('next');
    }
  }

  /**
   * Add field button click event
   */
  public onClickAddField(): void {
    // change add field show flag
    this.addFieldShowFlag = !this.addFieldShowFlag;
    // if add field show flag TRUE
    if (this.addFieldShowFlag) {
      this._addColumnComponent.init(this._originFieldList);
    }
  }

  /**
   * Role type filter change event
   * @param type
   */
  public onChangeRoleTypeFilter(type: any): void {
    if (type.value !== this.selectedRoleTypeFilter.value) {
      // set selected role type filter
      this.selectedRoleTypeFilter = type;
      // filtered field list
      this._setFilteredFieldList();
    }
  }

  /**
   * Logical type filter change event
   * @param type
   */
  public onChangeLogicalTypeFilter(type: any): void {
    if (type.value !== this.selectedLogicalTypeFilter.value) {
      // set selected logical type filter
      this.selectedLogicalTypeFilter = type;
      // filtered field list
      this._setFilteredFieldList();
    }
  }

  /**
   * Selected timestamp type change event
   * @param {string} type
   */
  public onChangeSelectedTimestampType(type: string): void {
    // if different selected timestamp type
    if (this.selectedTimestampType !== type) {
      // set selected timestamp type
      this.selectedTimestampType = type;
      // if action bar open
      if (this.getCheckedFieldList().length !== 0) {
        this._actionBarComponent.init(this.getCheckedFieldList(), this.selectedTimestampField, this.selectedTimestampType);
      }
    }
  }

  /**
   * Selected timestamp field change event
   * @param {Field} field
   */
  public onChangeSelectedTimestampField(field: Field): void {
    // if not exist selected timestamp field OR different selected timestamp field
    if (!this.selectedTimestampField || this.selectedTimestampField !== field) {
      // set selected timestamp field
      this.selectedTimestampField = field;
      // if action bar open
      if (this.getCheckedFieldList().length !== 0) {
        this._actionBarComponent.init(this.getCheckedFieldList(), this.selectedTimestampField, this.selectedTimestampType);
      }
    }
  }

  /**
   * Selected field change event
   * @param {Field} field
   */
  public onChangeSelectedField(field: Field): void {
    if (this.selectedField !== field && !this.isRemovedField(field)) {
      // set selected field
      this.selectedField = field;
      // set selected field data list
      this.selectedFieldDataList = this._getFieldDataList(field);
    }
  }

  /**
   * timestamp field list show flag change event
   */
  public onChangeTimestampFieldListShowFlag(): void {
    // if exist timestamp field list
    if (this.timestampFieldList.length > 0) {
      this.timestampFieldListShowFlag = !this.timestampFieldListShowFlag;
    }
  }

  /**
   * Field search event
   * @param {string} keyword
   */
  public onChangedSearchText(keyword: string): void {
    // set keyword
    this.searchText = keyword;
    // filtered field list
    this._setFilteredFieldList();
  }

  /**
   * Selected field list Changed logical type timestamp
   * @param fieldList
   */
  public onChangedLogicalTypeToTimestamp(fieldList: Field[]): void {
    // if exist field list, init timestamp field format
    fieldList.length !== 0 && this._initTimeFormatInTimestampFieldList(fieldList);
  }

  public onChangedLogicalTypeToGeo(fieldList: Field[]): void {
    console.log(fieldList);
    if (fieldList.length !== 0) {
      this.loadingShow();
      const q = [];
      fieldList.forEach((field) => {
        // if not exist format in field
        if (isNullOrUndefined(field.format)) {
          field.format = new FieldFormat();
        }
        const fieldDataList: string[] = this._getFieldDataList(field);
        q.push(
          this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(field.format, fieldDataList, this.fieldConfigService.convertType(field.logicalType))
            .then(() => {})
            .catch(() => {}));
      });
      Promise.all(q).then(() => this.loadingHide()).catch(() => this.loadingHide());
    }
  }

  /**
   * Revival field click event
   * @param {Field} field
   */
  public onClickRevivalField(field: Field): void {
    delete field.unloaded;
    // if is TIMESTAMP logical type field
    if (LogicalType.TIMESTAMP === field.logicalType) {
      // set timestamp field list
      this._setTimestampFieldList();
    }
  }

  /**
   * Field change check event
   * @param {Field} field
   */
  public onClickCheckInField(field: Field): void {
    field.checked = !field.checked;
    // action bar init
    this._actionBarComponent.init(this.getCheckedFieldList(), this.selectedTimestampField, this.selectedTimestampType);
  }

  /**
   * Filtered field list all check event
   */
  public onClickAllCheckFilteredFieldList(): void {
    // if all checked filtered field list
    this.isAllCheckedFilteredFieldList()
      ? this.filteredFieldList.forEach(field => !field.derived && (field.checked = false))
      : this.filteredFieldList.forEach(field => !field.derived && (field.checked = true));
    // init action bar
    this._actionBarComponent.init(this.getCheckedFieldList(), this.selectedTimestampField, this.selectedTimestampType);
  }

  /**
   * Is Filtered field list all checked
   * @returns {boolean}
   */
  public isAllCheckedFilteredFieldList(): boolean {
    return this.filteredFieldList.filter(field => !field.derived).length !== 0 && this.filteredFieldList.filter(field => !field.derived).every(field => field.checked);
  }

  /**
   * Is selected field
   * @param {Field} field
   * @returns {boolean}
   */
  public isSelectedField(field: Field): boolean {
    return field === this.selectedField;
  }

  /**
   * Is timestamp field
   * @param {Field} field
   * @returns {boolean}
   */
  public isTimestampField(field: Field): boolean {
    return this.selectedTimestampType === 'FIELD' && this.selectedTimestampField === field;
  }

  /**
   * Is removed field
   * @param {Field} field
   * @returns {boolean}
   */
  public isRemovedField(field: Field): boolean {
    return field.unloaded;
  }

  /**
   * Is error field
   * @param field
   */
  public isErrorField(field: Field): boolean {
    // is not removed field, is time format error or ingestion value error
    return !field.unloaded &&
      ((field.logicalType === LogicalType.TIMESTAMP && (field.format && field.format.type === FieldFormatType.DATE_TIME) && field.isValidTimeFormat === false)
        || (field.ingestionRule && field.ingestionRule.type === IngestionRuleType.REPLACE && field.isValidReplaceValue === false) || this.isGeoFormatError(field));
  }

  public isGeoFormatError(field: Field): boolean {
    return (field.logicalType === LogicalType.GEO_LINE || field.logicalType === LogicalType.GEO_POINT || field.logicalType === LogicalType.GEO_POLYGON)&& field.format && !field.format.isValidFormat;
  }

  /**
   * Init UI view
   * @private
   */
  private _initView(): void {
    // set field list
    this._originFieldList = _.cloneDeep(this._sourceData.fieldList);
    this._originFieldData = _.cloneDeep(this._sourceData.fieldData);
    // init selected role type filter
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // init selected logical type filter
    this.selectedLogicalTypeFilter = this.logicalTypeFilterList[0];
    // init filtered field list
    this.filteredFieldList = this._originFieldList;
    // set selected field
    this.onChangeSelectedField(this.filteredFieldList[0]);
    // set timestamp field list
    this._setTimestampFieldList();
    // init time format in timestamp field list
    this._initTimeFormatInTimestampFieldList(this.timestampFieldList);
  }

  /**
   * Init time format in timestamp field list
   * @param {Field[]} timestampFieldList
   * @private
   */
  private _initTimeFormatInTimestampFieldList(timestampFieldList: Field[]): void {
    // loading show
    this.loadingShow();
    // q
    const q = [];
    // timestamp field loop
    timestampFieldList.forEach((field: Field) => {
      // init format
      field.format = new FieldFormat();
      // field data
      const fieldDataList: any[] = this._getFieldDataList(field);
      // if not exist field data
      if (fieldDataList.length === 0) {
        // set timestamp error
        field.isValidTimeFormat = false;
        // set time format valid message
        field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
      } else { // if exist field data
        q.push(this._setTimestampFormatInField(field, fieldDataList.slice(0, 19)));
      }
    });
    // run q
    Promise.all(q).then(() => {
      // if exist timestamp field list
      if (this.timestampFieldList.length !== 0) {
        // set FIELD timestamp type
        this.selectedTimestampType = 'FIELD';
        // set selected timestamp field
        this.onChangeSelectedTimestampField(this.timestampFieldList[0]);
      } else {
        // set CURRENT timestamp type
        this.selectedTimestampType = 'CURRENT';
      }
      // loading hide
      this.loadingHide();
    }).catch(error => this.loadingHide());
  }

  /**
   * Is enable next
   * @returns {boolean}
   * @private
   */
  private _isEnableNext(): boolean {
    // if select timestamp type is FIELD, not selected timestamp field
    if (this.selectedTimestampType === 'FIELD' && !this.selectedTimestampField) {
      Alert.warning(this.translateService.instant('msg.storage.ui.configure.schema.require.timestamp.column'));
      return false;
    }
    // enable field list
    const enableFieldList = this._originFieldList.filter(field => !field.unloaded);
    // if all field unloaded
    if (enableFieldList.length === 0) {
      Alert.warning(this.translateService.instant('msg.storage.ui.configure.schema.require.column'));
      return false;
    }
    // if exist error in field
    if (this._isExistErrorFieldInFieldList(enableFieldList)) {
      Alert.warning(this.translateService.instant('msg.storage.ui.schema.error.desc'));
      return false;
    }
    return true;
  }

  /**
   * Is exist error field in field list
   * @param fieldList
   * @private
   */
  private _isExistErrorFieldInFieldList(fieldList: any[]): boolean {
    // loop
    return fieldList.reduce((acc, field) => {
      // if field is TIMESTAMP, format type is DATE_TIME, not check time format
      if (field.logicalType === LogicalType.TIMESTAMP && field.format.type === FieldFormatType.DATE_TIME && !field.isValidTimeFormat) {
        field.isValidTimeFormat = false;
        field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.desc');
        acc = true;
      }
      // if exist ingestion rule, ingestion rule type is REPLACE, not check replace value
      if (field.ingestionRule && field.ingestionRule.type === IngestionRuleType.REPLACE && !field.isValidReplaceValue) {
        field.isValidReplaceValue = false;
        field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.desc');
        acc = true;
      }
      if (this.isGeoFormatError(field)) {
        acc = true;
      }
      return acc;
    }, false);
  }


  /**
   * Is changed TIMESTAMP field
   * @returns {boolean}
   * @private
   */
  private _isChangedTimestampField(): boolean {
    // if exist schema data in source data
    if (this._sourceData.schemaData) {
      // if changed timestamp field
      return (this.selectedTimestampType !== this._sourceData.schemaData.selectedTimestampType) ||
        this.selectedTimestampField &&
        (this.selectedTimestampField.name !== this._sourceData.schemaData.selectedTimestampField.name
          || this.selectedTimestampField.format.type !== this._sourceData.schemaData.selectedTimestampField.format.type
          || this.selectedTimestampField.format.type === FieldFormatType.UNIX_TIME && this._sourceData.schemaData.selectedTimestampField.format.type === FieldFormatType.UNIX_TIME && this.selectedTimestampField.format.unit !== this._sourceData.schemaData.selectedTimestampField.format.unit);
    } else { // if not exist schema data
      return false;
    }
  }

  /**
   * Load schema data
   * @param schemaData
   * @private
   */
  private _loadSchemaData(schemaData: any): void {
    // origin field list
    this._originFieldList = schemaData._originFieldList;
    // origin field data list
    this._originFieldData = schemaData._originFieldData;

    // filtered field list
    this.filteredFieldList = schemaData.filteredFieldList;
    // timestamp field list
    this.timestampFieldList = schemaData.timestampFieldList;
    // selected field
    this.selectedField = schemaData.selectedField;
    // selected field data list
    this.selectedFieldDataList = schemaData.selectedFieldDataList;
    // selected timestamp field
    this.selectedTimestampField = schemaData.selectedTimestampField;
    // selected timestamp type
    this.selectedTimestampType = schemaData.selectedTimestampType;
    // search text
    this.searchText = schemaData.searchText;
    // selected logical type filter
    this.selectedLogicalTypeFilter = schemaData.selectedLogicalTypeFilter;
    // selected role type filter
    this.selectedRoleTypeFilter = schemaData.selectedRoleTypeFilter;
    // selected action
    this.selectedAction = schemaData.selectedAction;
  }

  /**
   * Save schema data
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveSchemaData(sourceData: DatasourceInfo): void {
    const schemaData = {
      // origin field list
      _originFieldList : this._originFieldList,
      // origin field data list
      _originFieldData : this._originFieldData,
      // filtered field list
      filteredFieldList : this.filteredFieldList,
      // timestamp field list
      timestampFieldList : this.timestampFieldList,
      // selected field
      selectedField : this.selectedField,
      // selected field data list
      selectedFieldDataList : this.selectedFieldDataList,
      // selected timestamp field
      selectedTimestampField : this.selectedTimestampField,
      // selected timestamp type
      selectedTimestampType : this.selectedTimestampType,
      // search text
      searchText : this.searchText,
      // selected logical type filter
      selectedLogicalTypeFilter : this.selectedLogicalTypeFilter,
      // selected role type filter
      selectedRoleTypeFilter : this.selectedRoleTypeFilter,
      // selected action
      selectedAction: this.selectedAction,
      // timestampFieldData
      timestampFieldData: this.selectedTimestampType === 'FIELD' ? this._getFieldDataList(this.selectedTimestampField) : []
    };
    sourceData.schemaData = schemaData;
  }

  /**
   * Get field data list
   * @param {Field} field
   * @returns {any}
   * @private
   */
  private _getFieldDataList(field: Field): any {
    return this._originFieldData.reduce((acc, value) => {
      // if exist data (NOT NULL)
      value[field.name] && acc.push(value[field.name]);
      return acc;
    }, []).slice(0, 50);
  }

  /**
   * Set timestamp format in field
   * @param {Field} field
   * @param fieldDataList
   * @returns {Promise<any>}
   * @private
   */
  private _setTimestampFormatInField(field: Field, fieldDataList: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasourceService.checkValidationDateTime({samples: fieldDataList})
        .then((result: {pattern: string}) => {
          // if exist pattern
          if (result.pattern) {
            // set time format in field
            field.format.format = result.pattern;
            // set time format valid TRUE
            field.isValidTimeFormat = true;
            // if enable timezone, set browser timezone at field
            if (this.timezoneService.isEnableTimezoneInDateFormat(field.format)) {
              !field.format.timeZone && (field.format.timeZone = this.timezoneService.getBrowserTimezone().momentName);
              field.format.locale = this.timezoneService.browserLocale;
            } else { // if not enable timezone
              field.format.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
            }
          }
          resolve(result);
        })
        .catch((error) => {
          // set default time format in field
          field.format.format = 'yyyy-MM-dd';
          reject(error);
        });
    });
  }

  /**
   * Set filtered field list
   * @private
   */
  private _setFilteredFieldList(): void {
    // init filtered field list
    this.filteredFieldList = this._originFieldList;
    // filtered role type
    if ('ALL' !== this.selectedRoleTypeFilter.value) {
      this.filteredFieldList = this.filteredFieldList.filter(field => field.role === this.selectedRoleTypeFilter.value);
    }
    // filtered logical type
    if ('ALL' !== this.selectedLogicalTypeFilter.value) {
      switch (this.selectedLogicalTypeFilter.value) {
        case LogicalType.STRING:
          this.filteredFieldList = this.filteredFieldList.filter(field => !field.derived && field.logicalType === this.selectedLogicalTypeFilter.value);
          break;
        case LogicalType.USER_DEFINED:
          this.filteredFieldList = this.filteredFieldList.filter(field => field.derived && LogicalType.STRING === field.logicalType);
          break;
        default:
          this.filteredFieldList = this.filteredFieldList.filter(field => field.logicalType === this.selectedLogicalTypeFilter.value);
          break;
      }
    }
    // search text
    if (StringUtil.isNotEmpty(this.searchText)) {
      this.filteredFieldList = this.filteredFieldList.filter(field => field.name.toUpperCase().includes(this.searchText.toUpperCase()));
    }
  }

  /**
   * Set timestamp field list
   * @private
   */
  private _setTimestampFieldList(): void {
    this.timestampFieldList = this._originFieldList.filter(field => !field.unloaded && LogicalType.TIMESTAMP === field.logicalType);
  }
}
