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

import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector, Input, Renderer, Renderer2, ViewChild} from "@angular/core";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {Filter} from "../../../shared/datasource-metadata/domain/filter";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {
  ConnectionType,
  Field,
  FieldFormat,
  FieldFormatType} from "../../../domain/datasource/datasource";
import {StringUtil} from "../../../common/util/string.util";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {SchemaConfigureDeletePopupComponent} from "./check-action-layer/schema-configure-delete-popup.component";
import {SchemaConfigureChangeTypePopupComponent} from "./check-action-layer/schema-configure-change-type-popup.component";
import {SchemaConfigureTimestampComponent} from "./schema-configure-timestamp.component";
import {FieldConfigService} from "../../service/field-config.service";
import * as _ from "lodash";

@Component({
  selector: 'schema-configure-field',
  templateUrl: 'schema-configure-field.component.html'
})
export class SchemaConfigureFieldComponent extends AbstractComponent {

  @ViewChild(SchemaConfigureChangeTypePopupComponent)
  private readonly _changeTypePopupComponent: SchemaConfigureChangeTypePopupComponent;

  @ViewChild(SchemaConfigureDeletePopupComponent)
  private readonly _deletePopupComponent: SchemaConfigureDeletePopupComponent;

  @ViewChild(SchemaConfigureTimestampComponent)
  private readonly _timestampComponent: SchemaConfigureTimestampComponent;

  @Input()
  public readonly connType: ConnectionType;

  // data
  public fieldList: Field[];
  public selectedField: Field;
  public dataList;
  public selectedDataList: string[];
  // timestamp data
  public selectedTimestampType: DataStorageConstant.Datasource.TimestampType = DataStorageConstant.Datasource.TimestampType.CURRENT;
  public selectedTimestampField: Field;

  // only used component
  public filteredFieldList;
  public checkedFieldList;

  // filter
  public searchKeyword: string;
  public selectedRoleFilter: Filter.Role = this.constant.getRoleTypeFilterFirst();
  public selectedTypeFilter: Filter.Logical = this.constant.getTypeFiltersFirst();

  // constructor
  constructor(private fieldConfigService: FieldConfigService,
              private constant: ConstantService,
              private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // set subscription event
    this.subscriptions.push(
      // changed filter
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST_FILTER).subscribe((data: {key: DataStorageConstant.Datasource.FilterKey, value}) => {
        // set selected filter
        if (data.key === DataStorageConstant.Datasource.FilterKey.ROLE) {
          this.selectedRoleFilter = _.cloneDeep(data.value);
        } else if (data.key === DataStorageConstant.Datasource.FilterKey.TYPE) {
          this.selectedTypeFilter = _.cloneDeep(data.value);
        } else if (data.key === DataStorageConstant.Datasource.FilterKey.SEARCH) {
          this.searchKeyword = _.cloneDeep(data.value);
        }
        // change filtered field list
        this._changeFilteredFieldList();
      }),
      // created field
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CREATED_FIELD).subscribe((field: Field) => {
        // push field
        this.fieldList.unshift(field);
        // change selected field
        this.onSelectField(field);
        // if GEO type crated field
        if (Field.isGeoType(field)) {
         this._setCratedFieldData(field);
        }
        // broadcast changed field list
        this._broadCastChangedFieldList();
        // change filtered field list
        this._changeFilteredFieldList();
      }),
      // changed field
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_FIELD).subscribe((field: Field) => {
        // broadcast changed field list
        this._broadCastChangedFieldList();
        // change filtered field list
        this._changeFilteredFieldList();
        // if checked field
        if (this.checkedFieldList.some(checkField => checkField.originalName === field.originalName)) {
          // change checked field list
          this._changeCheckedFieldList();
          // broadcast changed checked field list
          this._broadcastChangedCheckedFieldList();
        }
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // remove subscription
    for (let subscription$ of this.subscriptions) {
      subscription$.unsubscribe();
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // broadcast changed field list
    this._broadCastChangedFieldList();
  }

  /**
   * Ready
   */
  public ready(): void {
    // change checked field list
    this._changeCheckedFieldList();
    // change filtered field list
    this._changeFilteredFieldList();
    // change selected data list
    this._changeSelectedDataList();
  }

  /**
   * Init field list
   * @param {Field[]} fieldList
   * @param {boolean} isAddOriginalNameProperty
   */
  public initFieldList(fieldList: Field[], isAddOriginalNameProperty?: boolean): void {
    this.fieldList = isAddOriginalNameProperty ? _.cloneDeep(fieldList).map(field => ({...field, originalName: field.name})) :  _.cloneDeep(fieldList);
  }

  /**
   * Init selected field
   * @param {Field} selectedField
   */
  public initSelectedField(selectedField?: Field): void {
    this.selectedField = this._isNotEmptyValue(selectedField) ? this.fieldList.find(field => field.originalName === selectedField.originalName) : this.fieldList[0];
  }

  /**
   * Init data list
   * @param dataList
   */
  public initDataList(dataList) {
    this.dataList = _.cloneDeep(dataList);
  }

  /**
   * Init time format in timestamp field list
   * - Only Used create step
   */
  public initTimeFormatInTimestampFieldList(): void {
    const callStack = [];
    // timestamp field loop
    this.fieldList.forEach((field: Field) => {
      // if field is timestamp type field
      if (Field.isTimestampTypeField(field)) {
        // init format
        field.format = new FieldFormat();
        callStack.push(this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(field.format, this._getFieldDataList(field), true).then((format: FieldFormat) => {}));
      }
    });
    // if not empty callStack
    if (callStack.length > 0) {
      this.loadingShow();
      Promise.all(callStack).then(() => this.loadingHide()).catch(() => this.loadingHide());
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
   * Init selected timestamp
   * @param {Field} selectedTimestampField
   * @param {DataStorageConstant.Datasource.TimestampType} selectedTimestampType
   */
  public initSelectedTimestamp(selectedTimestampField: Field, selectedTimestampType: DataStorageConstant.Datasource.TimestampType): void {
    this.selectedTimestampField = _.cloneDeep(selectedTimestampField);
    this.selectedTimestampType = _.cloneDeep(selectedTimestampType);
    this._timestampComponent.init(this.selectedTimestampField, this.selectedTimestampType);
  }

  /**
   * Init checked field list
   */
  public initCheckedFieldList(): void {
    this._changeCheckedFieldList();
    this._broadCastChangedFieldList();
  }

  /**
   * Get field type icon
   * @param {string} field
   */
  public getFieldTypeIcon(field): string {
    return Field.getFieldTypeIconClass(field);
  }

  /**
   * Get sliced column name
   * @param {Field} field
   */
  public getSlicedColumnName(field: Field): string {
    return Field.getSlicedColumnName(field);
  }

  /**
   * Remove created field
   * @param {Field} field
   */
  public removedCreatedField(field: Field): void {
    // remove field in list
    this.fieldList.splice(this.fieldList.findIndex(targetField => targetField.originalName === field.originalName), 1);
    // broadcast changed field list
    this._broadCastChangedFieldList();
    // change filtered field list
    this._changeFilteredFieldList();
    // change select field first
    this.onSelectField(this.fieldList[0]);
  }

  /**
   * Change timestamp field
   * @param {Field} field
   */
  public changedTimestampField(field: Field): void {
    this.selectedTimestampField = field;
    this.safelyDetectChanges();
  }

  /**
   * Change timestamp type
   * @param {DataStorageConstant.Datasource.TimestampType} type
   */
  public changedTimestampType(type: DataStorageConstant.Datasource.TimestampType): void {
    this.selectedTimestampType = type;
    this.safelyDetectChanges();
  }

  /**
   * Edit field
   * @param {Field} field
   */
  public editField(field: Field): void {
    // check duplicated
    if (this._isValidEditFieldName(field)) {
      // change field name
      field.name = field.editName;
      // close edit mode
      this.closeEditField(field);
      // change filtered field list
      this._changeFilteredFieldList();
      // broadcast changed field list
      this._broadCastChangedFieldList();
    }
  }

  /**
   * Close edit field mode
   * @param {Field} field
   */
  public closeEditField(field: Field): void {
    field.isEdit = false;
    delete field.editName;
    // remove name valid property
    this.removeNameValidProperty(field);
  }

  /**
   * Remove name valid property
   * @param {Field} field
   */
  public removeNameValidProperty(field: Field): void {
    Field.removeNameValidProperty(field);
  }

  /**
   * Select field
   * @param {Field} field
   */
  public onSelectField(field: Field): void {
    // if not removed field and different selected field
    if (!this.isRemovedField(field) && this.selectedField.originalName !== field.originalName) {
      this.selectedField = field;
      // change selected data list
      this._changeSelectedDataList();
    }
  }

  /**
   * Check field
   * @param {Field} field
   */
  public onCheckField(field: Field): void {
    // stop event bubble
    // event.stopImmediatePropagation();
    // if enable check
    if (!this.isDisableCheck(field)) {
      if (Field.isCheckedField(field)) {
        Field.setUndoCheckField(field);
      } else {
        Field.setCheckField(field);
      }
      // change checked field list
      this._changeCheckedFieldList();
      // broadcast changed checked field list
      this._broadcastChangedCheckedFieldList();
    }
  }

  /**
   * All check field list
   */
  public onAllCheckFilteredFieldList(): void {
    if (this.isAllCheckedFilteredFieldList()) {
      this.filteredFieldList.forEach(field =>  {
        // if enable check
        if (!this.isDisableCheck(field)) {
          Field.setUndoCheckField(field);
        }
      });
    } else {
      this.filteredFieldList.forEach(field => {
        // if enable check
        if (!this.isDisableCheck(field)) {
          Field.setCheckField(field)
        }
      });
    }
    // change checked field list
    this._changeCheckedFieldList();
    // broadcast changed checked field list
    this._broadcastChangedCheckedFieldList();
  }

  /**
   * Open Edit field mode
   * @param {Field} field
   * @param {HTMLInputElement} fieldInput
   */
  public onEditField(field: Field, fieldInput: HTMLInputElement): void {
    field.isEdit = true;
    field.editName = field.name;
    this.safelyDetectChanges();
    fieldInput.focus();
  }


  /**
   * Undo removed field
   * @param {Field} field
   */
  public onClickUndoField(field: Field): void {
    // stop event bubble
    // event.stopImmediatePropagation();
    // 이미 컬럼이 존재하는 경우 강제로 변경
    if (this._isDuplicatedName(field, field.name)) {
      field.name = field.name + '_' + this._getFieldPostfix();
    }
    // field set undo remove field
    Field.setUndoRemoveField(field);
    // broadcast changed field list
    this._broadCastChangedFieldList();
  }

  /**
   * Open change type popup
   */
  public onOpenChangeTypePopup(): void {
    // if opened delete popup
    if (this.isOpenedDeletePopup()) {
      // close delete popup
      this._deletePopupComponent.closePopup();
    }
    // close or open
    this.isOpenedChangeTypePopup() ? this._changeTypePopupComponent.closePopup() : this._changeTypePopupComponent.openPopup();
  }

  /**
   * Open delete field popup
   */
  public onOpenDeletePopup(): void {
    // if opened change type popup
    if (this.isOpenedChangeTypePopup()) {
      // close change type popup
      this._changeTypePopupComponent.closePopup();
    }
    // close or open
    this.isOpenedDeletePopup() ? this._deletePopupComponent.closePopup() : this._deletePopupComponent.openPopup();
  }

  public isEmptyFilteredFieldList(): boolean {
    return _.isNil(this.filteredFieldList) || this.filteredFieldList.length === 0
  }

  public isAllCheckedFilteredFieldList(): boolean {
    return !this._isEmptyFilteredFieldListExceptDisableCheckField() && this.filteredFieldList.filter(field => !this.isDisableCheck(field)).every(field => this.isCheckedField(field));
  }

  public isMeasureField(field): boolean {
    return Field.isMeasureField(field);
  }

  public isDimensionField(field): boolean {
    return Field.isDimensionField(field);
  }

  public isTimestampField(field): boolean {
    return this.isDimensionField(field) && Field.isTimestampTypeField(field) && this.selectedTimestampType === DataStorageConstant.Datasource.TimestampType.FIELD && (!_.isNil(this.selectedTimestampField) && this.selectedTimestampField.originalName === field.originalName);
  }

  public isErrorField(field) {
    return !this.isRemovedField(field) && (
      this.isTimestampFormatError(field) || this.isIngestionRuleError(field) || this.isGeoFormatError(field)
    );
  }

  public isTimestampFormatError(field): boolean {
    return Field.isTimestampTypeField(field) && (!Field.isEmptyFormat(field) && field.format.type === FieldFormatType.DATE_TIME) && this._isFormatError(field);
  }

  public isGeoFormatError(field): boolean {
    return !this.isCreatedField(field) && Field.isGeoType(field) && !Field.isEmptyFormat(field) && this._isFormatError(field);
  }

  public isIngestionRuleError(field): boolean {
    return !Field.isEmptyIngestionRule(field) && field.ingestionRule.isReplaceType() && field.ingestionRule.isValidReplaceValue === false;
  }

  public isSelectedField(field: Field) {
    return this.selectedField.originalName === field.originalName;
  }

  public isCheckedField(field: Field) {
    return Field.isCheckedField(field);
  }

  public isRemovedField(field: Field) {
    return Field.isRemovedField(field);
  }

  public isDisableCheck(field: Field) {
    return this.isCreatedField(field);
  }

  public isCreatedField(field: Field) {
    return Field.isCreatedField(field);
  }

  public isExistCheckedFieldInFieldList(): boolean {
    return this.checkedFieldList.length > 0;
  }

  public isOpenedChangeTypePopup(): boolean {
    return this._changeTypePopupComponent.isShowPopup === true;
  }

  public isOpenedDeletePopup(): boolean {
    return this._deletePopupComponent.isShowPopup === true;
  }

  public isEmptySelectedTimestampField(): boolean {
    return _.isNil(this.selectedTimestampField);
  }

  public isExistErrorFieldInFieldList(fieldList: Field[]): boolean {
    // loop
    return fieldList.reduce((acc, field) => {
      // if field is TIMESTAMP, format type is DATE_TIME, not check time format
      if (Field.isTimestampTypeField(field) && field.format.isDateTime() && !field.format.isValidFormat) {
        field.format.isValidFormat = false;
        field.format.formatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.desc');
        acc = true;
      }
      // if exist ingestion rule, ingestion rule type is REPLACE, not check replace value
      if (!Field.isEmptyIngestionRule(field) && field.ingestionRule.isReplaceType() && !field.ingestionRule.isValidReplaceValue) {
        field.ingestionRule.isValidReplaceValue = false;
        field.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.desc');
        acc = true;
      }
      if (this.isGeoFormatError(field)) {
        acc = true;
      }
      return acc;
    }, false);
  }

  /**
   * Is empty filtered field list of disable check field
   * @returns {boolean}
   * @private
   */
  private _isEmptyFilteredFieldListExceptDisableCheckField(): boolean {
    return _.isNil(this.filteredFieldList) || this.filteredFieldList.filter(field => !this.isDisableCheck(field)).length === 0
  }

  /**
   * Is format error
   * @param {Field} field
   * @returns {boolean}
   * @private
   */
  private _isFormatError(field: Field): boolean {
    return field.format.isValidFormat === false;
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

  /**
   * Is valid edit field name
   * @param {Field} field
   * @returns {boolean}
   * @private
   */
  private _isValidEditFieldName(field: Field): boolean {
    // is empty name
    if (Field.isEmptyFieldEditName(field)) {
      field.invalidNameMessage = this.translateService.instant('msg.storage.ui.file.result.FV005');
      field.isInvalidName = true;
      return false;
    }
    // is same prev name
    else if (Field.isNameEqualEditName(field)) {
      return true;
    }
    // check column name length
    else if (!Field.isEnableFieldEditNameLength(field)) {
      field.invalidNameMessage = this.translateService.instant('msg.storage.ui.file.result.FV004');
      field.isInvalidName = true;
      return false;
    }
    // check column name character
    else if (Field.isDisableFieldEditNameCharacter(field)) {
      field.invalidNameMessage = this.translateService.instant('msg.storage.ui.file.result.FV001');
      field.isInvalidName = true;
      return false;
    }
    // is duplicated
    else if (this._isDuplicatedName(field, field.editName)) {
      field.invalidNameMessage = this.translateService.instant('msg.storage.ui.file.result.FV003');
      field.isInvalidName = true;
      return false;
    }
    field.isInvalidName = false;
    return true;
  }

  /**
   * Is duplicated name
   * @param {Field} field
   * @param {string} name
   * @returns {boolean}
   * @private
   */
  private _isDuplicatedName(field: Field, name: string): boolean {
    return this.fieldList.some(originField => !this.isRemovedField(originField) && originField !== field &&  originField.name.toUpperCase() === name.toUpperCase());
  }

  /**
   * Get field postfix
   * @returns {string}
   * @private
   */
  private _getFieldPostfix(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  /**
   * Get field data list
   * @param {Field} field
   * @returns {string[]}
   * @private
   */
  private _getFieldDataList(field: Field): string[] {
    return this.dataList.map(data => data[field.originalName]);
  }

  /**
   * Set created field data
   * @param {Field} field
   * @private
   */
  private _setCratedFieldData(field: Field): void {
    // make field data
    this.dataList.forEach((data) => {
      let createdData: string;
      if (data[field.derivationRule.latField] || data[field.derivationRule.lonField]) {
        createdData = data[field.derivationRule.latField] || '';
        createdData += ',';
        createdData += data[field.derivationRule.lonField] || '';
        data[field.originalName] = createdData;
      }
    });
  }

  /**
   * Broadcast changed field list
   * @private
   */
  private _broadCastChangedFieldList(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST, this.fieldList);
  }

  /**
   * Broadcast changed checked field list
   * @private
   */
  private _broadcastChangedCheckedFieldList(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_CHECKED_FIELD_LIST, this.checkedFieldList);
  }

  /**
   * Change checked field list
   * @private
   */
  private _changeCheckedFieldList(): void {
    this.checkedFieldList = this.fieldList.filter(field => this.isCheckedField(field));
  }

  /**
   * Change selected data list
   * @private
   */
  private _changeSelectedDataList(): void {
    this.selectedDataList = this._getFieldDataList(this.selectedField);
  }

  /**
   * Change filtered field list
   * @private
   */
  private _changeFilteredFieldList(): void {
    // init filtered field list
    let filteredFieldList = this.fieldList;
    // filtered role
    if (this.selectedRoleFilter.value !== Type.Role.ALL) {
      filteredFieldList = filteredFieldList.filter(field => field.role.toString() === this.selectedRoleFilter.value);
    }
    // filtered type
    if (this.selectedTypeFilter.value !== Type.Logical.ALL) {
      if (Type.Logical.STRING === this.selectedTypeFilter.value) {
        filteredFieldList = filteredFieldList.filter(field => !Field.isCreatedField(field) && Type.Logical.STRING === field.logicalType.toString());
      } else if (Type.Logical.USER_DEFINED === this.selectedTypeFilter.value) {
        filteredFieldList = filteredFieldList.filter(field => Field.isCreatedField(field) && Type.Logical.STRING === field.logicalType.toString());
      } else {
        filteredFieldList = filteredFieldList.filter(field => this.selectedTypeFilter.value === field.logicalType.toString());
      }
    }
    // filtered search keyword
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      filteredFieldList = filteredFieldList.filter(field => field.name.toUpperCase().includes(this.searchKeyword.toUpperCase()));
    }
    this.filteredFieldList = filteredFieldList;
  }
}
