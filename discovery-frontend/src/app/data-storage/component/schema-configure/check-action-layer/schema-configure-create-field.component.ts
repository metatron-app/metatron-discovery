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

import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Component, ElementRef, HostListener, Injector, ViewChild} from "@angular/core";
import {StringUtil} from "../../../../common/util/string.util";
import {Type} from "../../../../shared/datasource-metadata/domain/type";
import {
  DerivationRule,
  Field, FieldFormat,
  FieldRole,
  IngestionRule,
  LogicalType
} from "../../../../domain/datasource/datasource";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import * as _ from 'lodash';
import {DataStorageConstant} from "../../../constant/data-storage-constant";
import {StorageFilterSelectBoxComponent} from "../../../data-source-list/component/storage-filter-select-box.component";
import {ColumnSelectBoxComponent} from "../../../data-source-list/component/column-select-box.component";
import {CommonUtil} from "../../../../common/util/common.util";

@Component({
  selector: 'schema-configure-create-field',
  templateUrl: 'schema-configure-create-field.component.html'
})
export class SchemaConfigureCreateFieldComponent extends AbstractComponent {

  @ViewChild('typeSelectBox')
  private readonly _typeSelectBox: StorageFilterSelectBoxComponent;

  @ViewChild('latitudeSelectBox')
  private readonly _latitudeSelectBox: ColumnSelectBoxComponent;

  @ViewChild('longitudeSelectBox')
  private readonly _longitudeSelectBox: ColumnSelectBoxComponent;

  private _originFieldList: Field[];

  public readonly typeList = [
    {label: this.translateService.instant('msg.storage.ui.list.geo.point'), icon: 'ddp-icon-type-point', value: Type.Logical.GEO_POINT},
    // {label: this.translateService.instant('msg.storage.ui.list.geo.line'), icon: 'ddp-icon-type-line', value: Type.Logical.GEO_LINE},
    // {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), icon: 'ddp-icon-type-polygon', value: Type.Logical.GEO_POLYGON},
    {label: this.translateService.instant('msg.storage.ui.list.expression'), icon: 'ddp-icon-type-expression', value: Type.Logical.USER_DEFINED}
  ];
  public selectedType = {label: this.translateService.instant('msg.storage.ui.list.geo.point'), icon: 'ddp-icon-type-point', value: Type.Logical.GEO_POINT};

  // field list
  public latitudeFieldList: Field[];
  public longitudeFieldList: Field[];

  // selected field
  public selectedLatitudeField: Field;
  public selectedLongitudeField: Field;

  // name
  public fieldName: string;
  // expression
  public expression: string;

  // valid
  public isInvalidLatitudeField: boolean;
  public isInvalidLongitudeField: boolean;
  public isInvalidFieldName: boolean;
  public isInvalidExpression: boolean;

  // valid message
  public invalidFieldNameMessage: string;
  public invalidExpressionMessage: string;

  // flag
  public isShowCreateField: boolean;

  // constructor
  constructor(private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // add subscription
    this.subscriptions.push(
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST).subscribe((fieldList) => {
        // change field list
        this.changeFieldList(fieldList);
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

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // #1925
    if (this._typeSelectBox && this._typeSelectBox.isListShow) {
      this._typeSelectBox.isListShow = false;
    } else if (this._latitudeSelectBox && this._latitudeSelectBox.isListShow) {
      this._latitudeSelectBox.isListShow = false;
    } else if (this._longitudeSelectBox && this._longitudeSelectBox.isListShow) {
      this._longitudeSelectBox.isListShow = false;
    }
  }

  /**
   * Change field list
   * @param fieldList
   */
  public changeFieldList(fieldList): void {
    // set origin field list (except created field)
    this._originFieldList = this._cloneValue(fieldList).filter(field => !Field.isCreatedField(field));
    // if empty selected latitude field
    if (this._isEmptyValue(this.selectedLatitudeField)) {
      // set longitude field list
      this.longitudeFieldList = this._cloneValue(this._originFieldList.filter(field => !Field.isRemovedField(field) && !Field.isCreatedField(field)));
    } else { // if not empty selected latitude field
      this.selectedLatitudeField = this._originFieldList.find(field => field.originalName === this.selectedLatitudeField.originalName);
      // set longitude field list
      this._changeLongitudeFieldListExceptField(this.selectedLatitudeField);
      // if removed field
      if (Field.isRemovedField(this.selectedLatitudeField)) {
        this.selectedLatitudeField = undefined;
      }
    }
    // if empty selected longitude field
    if (this._isEmptyValue(this.selectedLongitudeField)) {
      // set latitude field list
      this.latitudeFieldList = this._cloneValue(this._originFieldList.filter(field => !Field.isRemovedField(field) && !Field.isCreatedField(field)));
    } else {  // if not empty selected longitude field
      this.selectedLongitudeField = this._originFieldList.find(field => field.originalName === this.selectedLongitudeField.originalName);
      // set latitude field list
      this._changeLatitudeFieldListExceptField(this.selectedLongitudeField);
      // if removed field
      if (Field.isRemovedField(this.selectedLongitudeField)) {
        this.selectedLongitudeField = undefined;
      }
    }
  }

  /**
   * Open create field popup
   */
  public openCreateFieldPopup(): void {
    this.isShowCreateField = true;
  }

  /**
   * Close create field popup
   */
  public closeCreateFieldPopup(): void {
    this.isShowCreateField = false;
  }

  /**
   * Check valid field name
   */
  public checkValidFieldName(): void {
    // is empty
    if (StringUtil.isEmpty(this.fieldName)) {
      // set invalid message
      this.invalidFieldNameMessage = this.translateService.instant('msg.storage.ui.required');
      // set valid error
      this.isInvalidFieldName = true;
      // return
      return;
    }
    // duplicated name
    if (this._isDuplicatedName()) {
      // set invalid message
      this.invalidFieldNameMessage = this.translateService.instant('msg.storage.ui.duplicated');
      // set valid error
      this.isInvalidFieldName = true;
      // return
      return;
    }
    // set valid error
    this.isInvalidFieldName = false;
  }

  /**
   * Check valid expression
   */
  public checkValidExpression(): void {
    // is empty string
    if (StringUtil.isEmpty(this.expression)) {
      // set invalid message
      this.invalidExpressionMessage = this.translateService.instant('msg.storage.ui.required');
      // set valid error
      this.isInvalidExpression = true;
      // return
      return;
    }
    // set valid
    this.isInvalidExpression = false;
  }

  /**
   * Check valid GEO field
   */
  public checkValidGeoField(): void {
    // if empty latitude column
    if (this._isEmptyValue(this.selectedLatitudeField)) {
      // set valid error
      this.isInvalidLatitudeField = true;
    }
    // if empty longitude column
    if (this._isEmptyValue(this.selectedLongitudeField)) {
      // set valid error
      this.isInvalidLongitudeField = false;
    }
  }

  /**
   * Change selected type
   * @param type
   */
  public changeSelectedType(type): void {
    this.selectedType = type;
  }

  /**
   * Change selected latitude field
   * @param field
   */
  public changeSelectedLatitudeField(field): void {
    // if empty field OR different field
    if (this._isEmptyValue(this.selectedLatitudeField) || this.selectedLatitudeField.originalName !== field.originalName) {
      this.selectedLatitudeField = field;
      // change longitude field list
      this._changeLongitudeFieldListExceptField(field);
      // set valid latitude field
      this.isInvalidLatitudeField = undefined;
    }
  }

  /**
   * Change selected longitude field
   * @param field
   */
  public changeSelectedLongitudeField(field): void {
    // if empty field OR different field
    if (this._isEmptyValue(this.selectedLongitudeField) || this.selectedLongitudeField.originalName !== field.originalName) {
      this.selectedLongitudeField = field;
      // change latitude field list
      this._changeLatitudeFieldListExceptField(field);
      // set valid longitude field
      this.isInvalidLatitudeField = undefined;
    }
  }

  /**
   * Click create field button
   */
  public onClickCreateField(): void {
    // if enable create field
    if (this._isEnableCreateField()) {
      // create field
      this._createField();
      // init view
      this._initView();
      // close
      this.closeCreateFieldPopup();
    }
  }

  /**
   * Is expression field
   * @returns {boolean}
   */
  public isExpressionField(): boolean {
    return this.selectedType.value === Type.Logical.USER_DEFINED;
  }

  /**
   * Is enable crate field
   * @returns {boolean}
   * @private
   */
  private _isEnableCreateField(): boolean {
    // check field name
    this.checkValidFieldName();
    // if expression type
    if (this.isExpressionField()) {
      this.checkValidExpression();
      return this._isValidFieldName() && this._isValidExpression();
    } else {  // if GEO types
      this.checkValidGeoField();
      return this._isValidFieldName() && this._isValidLatitudeField() && this._isValidLongitudeField();
    }
  }

  /**
   * Is valid field name
   * @returns {boolean}
   * @private
   */
  private _isValidFieldName(): boolean {
    return this.isInvalidFieldName !== true;
  }

  /**
   * Is valid expression
   * @returns {boolean}
   * @private
   */
  private _isValidExpression(): boolean {
    return this.isInvalidExpression !== true;
  }

  /**
   * Is valid latitude field
   * @returns {boolean}
   * @private
   */
  private _isValidLatitudeField(): boolean {
    return this.isInvalidLatitudeField !== true;
  }

  /**
   * Is valid longitude field
   * @private
   */
  private _isValidLongitudeField(): boolean {
    return this.isInvalidLongitudeField !== true;
  }

  /**
   * Is duplicated name
   * @private
   */
  private _isDuplicatedName(): boolean  {
    return this._originFieldList.some(field => field.name === this.fieldName.trim());
  }

  /**
   * Is empty value
   * @param value
   * @returns {boolean}
   * @private
   */
  private _isEmptyValue(value): boolean {
    return _.isNil(value);
  }

  /**
   * Clone value
   * @param value
   * @private
   */
  private _cloneValue(value) {
    return _.cloneDeep(value);
  }

  /**
   * Change latitude field list except field
   * @param field
   * @private
   */
  private _changeLatitudeFieldListExceptField(field): void {
    this.latitudeFieldList = this._originFieldList.filter(originField => originField.originalName !== field.originalName);
  }

  /**
   * Change longitude field list except field
   * @param field
   * @private
   */
  private _changeLongitudeFieldListExceptField(field): void {
    this.longitudeFieldList = this._originFieldList.filter(originField => originField.originalName !== field.originalName);
  }

  /**
   * Create field
   * @private
   */
  private _createField(): void {
    const field = new Field();
    field.removeUIproperties();
    field.originalName = CommonUtil.getUUID();
    field.name = this.fieldName.trim();
    field.derived = true;
    // TODO 추후 Type.Role.DIMENSION
    field.role = FieldRole.DIMENSION;
    field.ingestionRule = new IngestionRule();
    field.derivationRule = new DerivationRule();
    field.derivationRule.type = this.selectedType.value.toString().toLowerCase();
    // if selected type Expression
    if (this.isExpressionField()) {
      field.type = Type.Logical.STRING;
      // TODO 추후 Type.Logical.STRING
      field.logicalType = LogicalType.STRING;
      field.derivationRule.expr = this.expression.trim();
    } else {
      field.type = Type.Logical.STRUCT;
      // TODO 추후 Type.Logical으로 변경시 제거 필요
      field.setLogicalType(this.selectedType.value);
      field.derivationRule.latField = this.selectedLatitudeField.originalName;
      field.derivationRule.lonField = this.selectedLongitudeField.originalName;
      field.format = new FieldFormat();
      field.format.removeUnixTypeProperties();
      field.format.geoCoordinateInitialize();
      field.format.type = this.selectedType.value.toString().toLowerCase()
    }
    // broadcast to DATASOURCE_CREATED_FIELD
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CREATED_FIELD, field);
  }

  /**
   * Init view
   * @private
   */
  private _initView(): void {
    // input
    this.fieldName = undefined;
    this.expression = undefined;
    // valid
    this.isInvalidLatitudeField = undefined;
    this.isInvalidLongitudeField = undefined;
    this.isInvalidFieldName = undefined;
    this.isInvalidExpression = undefined;
    // selected field
    this.selectedLatitudeField = undefined;
    this.selectedLongitudeField = undefined;
    // init selected type
    this.selectedType = this.typeList[0];
  }
}
