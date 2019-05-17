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

import {Component, ElementRef, EventEmitter, HostListener, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import {Field, FieldFormat} from "../../../../domain/datasource/datasource";
import {DataStorageConstant} from "../../../constant/data-storage-constant";
import {ConstantService} from "../../../../shared/datasource-metadata/service/constant.service";
import {Type} from "../../../../shared/datasource-metadata/domain/type";
import {StorageFilterSelectBoxComponent} from "../../../data-source-list/component/storage-filter-select-box.component";
import {DatasourceService} from "../../../../datasource/service/datasource.service";
import {FieldConfigService} from "../../../service/field-config.service";

@Component({
  selector: 'schema-configure-change-type-popup',
  templateUrl: 'schema-configure-change-type-popup.component.html'
})
export class SchemaConfigureChangeTypePopupComponent extends AbstractComponent {

  @ViewChild('roleSelectBox')
  private readonly _roleSelectBox: StorageFilterSelectBoxComponent;

  @ViewChild('typeSelectBox')
  private readonly _typeSelectBox: StorageFilterSelectBoxComponent;

  @Input('checkedFieldList')
  private readonly _checkedFieldList;
  @Input('dataList')
  private readonly _dataList;
  @Input('selectedTimestampType')
  private readonly _selectedTimestampType: DataStorageConstant.Datasource.TimestampType;
  @Input('selectedTimestampField')
  private readonly _selectedTimestampField: Field;

  public readonly roleList = this.constant.getRoleTypeFiltersExceptAll();
  public selectedRole = this.constant.getRoleTypeFiltersFirstExceptAll();
  public typeList = this.constant.getTypeFiltersExceptAll();
  public selectedType = this.constant.getTypeFiltersFirstExceptAll();

  // flag
  public isShowPopup: boolean;
  public isExistCreatedFieldInCheckedFieldList: boolean;
  public isExistTimestampFieldInCheckedFieldList: boolean;

  @Output()
  public readonly changedFieldListEvent = new EventEmitter();

  constructor(private broadCaster: EventBroadcaster,
              private constant: ConstantService,
              private datasourceService: DatasourceService,
              private fieldConfigService: FieldConfigService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscriptions.push(
      // changed field list
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_CHECKED_FIELD_LIST).subscribe((fieldList: Field[]) => {
        // set exist created field in checked field list
        this.isExistCreatedFieldInCheckedFieldList = fieldList.some(field => Field.isCreatedField(field));
        // set exist timestamp field in checked field list
        this.isExistTimestampFieldInCheckedFieldList = fieldList.some(field => this._selectedTimestampType === DataStorageConstant.Datasource.TimestampType.FIELD && Field.isTimestampTypeField(field) && field.name === this._selectedTimestampField.name);
        //
        this._setDefaultSelectedRole();
        this._changeTypeList();
        this._setSelectedType();
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
    } else if (this._roleSelectBox && this._roleSelectBox.isListShow) {
      this._roleSelectBox.isListShow = false;
    }
  }

  public onChangeSelectedRole(type) {
    if (this.selectedRole.value !== type.value) {
      this.selectedRole = type;
      // change type list
      this._changeTypeList();
      this._setSelectedType();
    }
  }

  public onChangeSelectedType(type) {
    if (this.selectedType.value !== type.value) {
      this.selectedType = type;
    }
  }

  public isDisableChangeType(): boolean {
    return this.isExistTimestampFieldInCheckedFieldList;
  }

  public openPopup(): void {
    // set exist created field in checked field list
    this.isExistCreatedFieldInCheckedFieldList = this._checkedFieldList.some(field => Field.isCreatedField(field));
    // set exist timestamp field in checked field list
    this.isExistTimestampFieldInCheckedFieldList = this._checkedFieldList.some(field => this._selectedTimestampType === DataStorageConstant.Datasource.TimestampType.FIELD && Field.isTimestampTypeField(field) && field.name === this._selectedTimestampField.name);
    this._setDefaultSelectedRole();
    this._changeTypeList();
    this._setSelectedType();
    // open
    this.isShowPopup = true;
  }

  public closePopup(): void {
    this.isShowPopup = false;
  }

  public changeFieldList(): void {
    const callStack = [];
    // set change field
    this._checkedFieldList.forEach(field => {
      // set undo check field
      Field.setUndoCheckField(field);
      // if different role
      if (field.role !== this.selectedRole.value) {
        // change role type
        this._changeRoleField(field);
      }
      // if different type
      if (field.logicalType !== this.selectedType.value) {
        if (this._isGeoSelectedType()) {
          // init format
          field.format = new FieldFormat();
          callStack.push(this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(field.format, this._getFieldDataList(field), this.selectedType.value).then(() => {}));
        } else if (this._isTimestampSelectedType()) {
          // init format
          field.format = new FieldFormat();
          callStack.push(this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(field.format, this._getFieldDataList(field), true).then((format: FieldFormat) => {}));
        } else {
          delete field.format;
        }
        // change type
        this._changeTypeField(field);
      }
    });
    // if not empty callStack
    if (callStack.length > 0) {
      this.loadingShow();
      Promise.all(callStack).then(() => this.loadingHide()).catch(() => this.loadingHide());
    }
    // emit
    this.changedFieldListEvent.emit();
    // init
    this._initView();
    // close popup
    this.closePopup();
  }

  private _isGeoSelectedType(): boolean {
    return this.selectedType.value === Type.Logical.GEO_LINE || this.selectedType.value === Type.Logical.GEO_POINT || this.selectedType.value === Type.Logical.GEO_POLYGON;
  }

  private _isTimestampSelectedType(): boolean {
    return this.selectedType.value === Type.Logical.TIMESTAMP;
  }

  private _getFieldDataList(field: Field): string[] {
    return this._dataList.map(data => data[field.name]);
  }

  private _changeRoleField(field) {
    field.role = this.selectedRole.value;
  }

  private _changeTypeField(field) {
    field.logicalType = this.selectedType.value;
  }

  private _isStringTypeInAllCheckedField(): boolean {
    return this._checkedFieldList.every(field => field.type === Type.Logical.STRING);
  }

  private _setDefaultSelectedRole(): void {
    if (this.isExistTimestampFieldInCheckedFieldList) {
      this.selectedRole = this.constant.getRoleTypeFiltersFirstExceptAll();
    }
  }

  private _setSelectedType(): void {
    if (this.isExistTimestampFieldInCheckedFieldList) {
      this.selectedType = this.typeList.find(type => type.value === Type.Logical.TIMESTAMP);
    } else if (!this.typeList.some(type => type.value === this.selectedType.value)) {
      this.selectedType = this.typeList[0];
    }
  }

  private _changeTypeList(): void {
    if (this.selectedRole.value === Type.Role.MEASURE) {
      this.typeList = this.constant.getTypeFiltersInMeasure();
    } else if (this.selectedRole.value === Type.Role.DIMENSION && this._isStringTypeInAllCheckedField()){
      this.typeList = this.constant.getTypeFiltersInDimensionIncludeGeoTypes();
    } else {
      this.typeList = this.constant.getTypeFiltersInDimension();
    }
  }

  private _initView(): void {
    this.selectedRole = this.constant.getRoleTypeFiltersFirstExceptAll();
    this.selectedType = this.constant.getTypeFiltersFirstExceptAll();
  }
}
