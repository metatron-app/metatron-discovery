import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector, ViewChild} from "@angular/core";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {Filter} from "../../../shared/datasource-metadata/domain/filter";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {Field, FieldFormatType, IngestionRuleType, LogicalType} from "../../../domain/datasource/datasource";
import {StringUtil} from "../../../common/util/string.util";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {SchemaConfigureDeletePopupComponent} from "./check-action-layer/schema-configure-delete-popup.component";
import {SchemaConfigureChangeTypePopupComponent} from "./check-action-layer/schema-configure-change-type-popup.component";

import * as _ from "lodash";
import {SchemaConfigureTimestampComponent} from "./schema-configure-timestamp.component";

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

  // data
  public fieldList: Field[];
  public selectedField: Field;
  public dataList;
  public selectedDataList: string[];
  // timestamp data
  public selectedTimestampType: DataStorageConstant.Datasource.TimestampType;
  public selectedTimestampField: Field;

  // only used component
  public filteredFieldList;
  public checkedFieldList;

  // filter
  public searchKeyword: string;
  public selectedRoleFilter: Filter.Role = this.constant.getRoleTypeFilterFirst();
  public selectedTypeFilter: Filter.Logical = this.constant.getTypeFiltersFirst();

  // constructor
  constructor(private constant: ConstantService,
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
        // if GEO type crated field
        if (Field.isGeoType(field)) {
         this._setCratedFieldData(field);
         // broadcast changed data list
         this._broadcastChangedDataList();
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
        if (this.checkedFieldList.some(checkField => checkField.name === field.name)) {
          // change checked field list
          this._changeCheckedFieldList();
          // broadcast changed checked field list
          this._broadcastChangedCheckedFieldList();
        }
      }),
      // changed timestamp type
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_TYPE).subscribe((type: DataStorageConstant.Datasource.TimestampType) => {
        this.selectedTimestampType = type;
      }),
      // changed timestamp field
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_FIELD).subscribe((field: Field) => {
        this.selectedTimestampField = field;
      })
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
    // broadcast changed data list
    this._broadcastChangedDataList();
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
   * Init field
   * @param {Field[]} fieldList
   * @param {Field} selectedField
   */
  public initField(fieldList: Field[], selectedField?: Field) {
    // init field list
    this.fieldList = _.cloneDeep(fieldList);
    // init selected field
    this.selectedField = selectedField ? this.fieldList.find(field => field.name === selectedField.name) : this.fieldList[0];
  }

  /**
   * Init data list
   * @param dataList
   */
  public initDataList(dataList) {
    this.dataList = _.cloneDeep(dataList);
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
   * Select field
   * @param {Field} field
   */
  public onSelectField(field: Field): void {
    if (!this.isRemovedField(field) && this.selectedField.name !== field.name) {
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
   * Undo removed field
   * @param {Field} field
   */
  public onClickUndoField(field: Field): void {
    // stop event bubble
    // event.stopImmediatePropagation();
    // field set undo remove field
    Field.setUndoRemoveField(field);
    // broadcast changed field list
    this._broadCastChangedFieldList();
  }

  public onOpenChangeTypePopup(): void {
    // if opened delete popup
    if (this.isOpenedDeletePopup()) {
      // close delete popup
      this._deletePopupComponent.closePopup();
    }
    // close or open
    this.isOpenedChangeTypePopup() ? this._changeTypePopupComponent.closePopup() : this._changeTypePopupComponent.openPopup();
  }

  public onOpenDeletePopup(): void {
    // if opened change type popup
    if (this.isOpenedChangeTypePopup()) {
      // close change type popup
      this._changeTypePopupComponent.closePopup();
    }
    // close or open
    this.isOpenedDeletePopup() ? this._deletePopupComponent.closePopup() : this._deletePopupComponent.openPopup();
  }

  public isAllCheckedFilteredFieldList(): boolean {
    return !this._isEmptyFilteredFieldList() && this.filteredFieldList.filter(field => !this.isDisableCheck(field)).every(field => this.isCheckedField(field));
  }

  public isMeasureField(field): boolean {
    return Field.isMeasureField(field);
  }

  public isDimensionField(field): boolean {
    return Field.isDimensionField(field);
  }

  public isTimestampField(field): boolean {
    return this.isDimensionField(field) && Field.isTimestampTypeField(field) && this.selectedTimestampType === DataStorageConstant.Datasource.TimestampType.FIELD && this.selectedTimestampField.name === field.name;
  }

  public isErrorField(field) {
    return !this.isRemovedField(field) && (
      this.isTimestampFormatError(field)
      || this.isIngestionRuleError(field)
      || this.isGeoFormatError(field)
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
    return this.selectedField.name === field.name;
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

  private _isEmptyFilteredFieldList(): boolean {
    return _.isNil(this.filteredFieldList) || this.filteredFieldList.filter(field => !this.isDisableCheck(field)).length === 0
  }

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
        data[field.name] = createdData;
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
   * Broadcast changed data list
   * @private
   */
  private _broadcastChangedDataList(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_DATA_LIST, this.dataList);
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

  private _changeSelectedDataList(): void {
    this.selectedDataList = this.dataList.map(data => data[this.selectedField.name]);
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
