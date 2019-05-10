import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector, ViewChild} from "@angular/core";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import * as _ from "lodash";
import {Filter} from "../../../shared/datasource-metadata/domain/filter";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {Field} from "../../../domain/datasource/datasource";
import {StringUtil} from "../../../common/util/string.util";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {SchemaConfigureDeletePopupComponent} from "./schema-configure-delete-popup.component";
import {SchemaConfigureChangeTypePopupComponent} from "./schema-configure-change-type-popup.component";

@Component({
  selector: 'schema-configure-field-list',
  templateUrl: 'schema-configure-field-list.component.html'
})
export class SchemaConfigureFieldListComponent extends AbstractComponent {

  @ViewChild(SchemaConfigureChangeTypePopupComponent)
  private readonly _changeTypePopupComponent: SchemaConfigureChangeTypePopupComponent;

  @ViewChild(SchemaConfigureDeletePopupComponent)
  private readonly _deletePopupComponent: SchemaConfigureDeletePopupComponent;

  public fieldList;
  public dataList;
  public filteredFieldList;
  public selectedField;

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
        // if GEO type crated field
        if (Field.isGeoField(field)) {
         this._setCratedFieldData(field);
         // changed data list
         this._changedDataList();
        }
        // change filtered field list
        this._changeFilteredFieldList();
        // changed field list
        this._changedFieldList();
      }),
      // changed field
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CREATED_FIELD).subscribe((field) => {

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

  private _changedFieldList(): void {
    // broadcast to CHANGED_FIELD_LIST
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST, this.fieldList);
  }

  private _changedDataList(): void {
    // broadcast to CHANGED_DATA_LIST
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_DATA_LIST, this.dataList);
  }

  private _changedSelectedField(): void {
    // broadcast to CHANGED_SELECTED_FIELD_LIST
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_FIELD, this.selectedField);
  }

  public init(fieldList) {
    // init field list
    this.fieldList = _.cloneDeep(fieldList);
    // set first field
    this.selectedField = this.fieldList[0];
  }

  public getFieldTypeIcon(field) {
    return Field.getFieldTypeIconClass(field);
  }

  /**
   * Get sliced column name
   * @param field
   */
  public getSlicedColumnName(field: Field): string {
    return Field.getSlicedColumnName(field);
  }

  public onSelectField(field): void {
    if (!this.isRemovedField(field) && this.selectedField.name !== field.name) {
      this.selectedField = field;
      // changed selected field
      this._changedSelectedField();
    }
  }

  private _isEmptyFilteredFieldList(): boolean {
    return _.isNil(this.filteredFieldList) || this.filteredFieldList.length === 0
  }

  public isAllCheckedFilteredFieldList(): boolean {
    return !this._isEmptyFilteredFieldList() && this.filteredFieldList.every(field => this.isCheckedField(field));
  }

  public onAllCheckFilteredFieldList(): void {
    if (this.isAllCheckedFilteredFieldList()) {
      this.filteredFieldList.forEach(field => Field.setUndoCheckField(field));
    } else {
      this.filteredFieldList.forEach(field => Field.setCheckField(field));
    }

  }

  public onCheckField(field): void {
    // stop event bubble
    event.stopImmediatePropagation();
    if (Field.isCheckedField(field)) {
      Field.setUndoCheckField(field);
    } else {
      Field.setCheckField(field);
    }
    // broadcast to change checked field list
  }

  public onClickUndoField(field): void {
    Field.setUndoRemoveField(field);
    // field가 TIMESTAMP type이라면
    if (Field.isTimestampTypeField(field)) {
      // broadcast change timestamp field list
    }
  }

  public onOpenChangeTypePopup(): void {
    // if opened delete popup
    if (this.isOpenedDeletePopup()) {
      // close delete popup
      this._deletePopupComponent.closePopup();
    }
    this.isOpenedChangeTypePopup() ? this._changeTypePopupComponent.closePopup() : this._changeTypePopupComponent.openPopup();
  }

  public onOpenDeletePopup(): void {
    // if opened change type popup
    if (this.isOpenedChangeTypePopup()) {
      // close change type popup
      this._changeTypePopupComponent.closePopup();
    }
    this.isOpenedDeletePopup() ? this._deletePopupComponent.closePopup() : this._deletePopupComponent.openPopup();
  }

  public isMeasureField(field): boolean {
    return Field.isMeasureField(field);
  }

  public isDimensionField(field): boolean {
    return Field.isDimensionField(field);
  }

  public isTimestampField(field): boolean {
    return this.isDimensionField(field) && Field.isTimestampTypeField(field);
  }

  public isErrorField(field) {
    return false;
  }

  public isSelectedField(field) {
    return this.selectedField.name === field.name;
  }

  public isCheckedField(field) {
    return Field.isCheckedField(field);
  }

  public isRemovedField(field) {
    return Field.isRemovedField(field);
  }

  public isCreatedField(field) {
    return Field.isCreatedField(field);
  }

  public isExistCheckedFieldInFieldList(): boolean {
    return this.fieldList.some(field => this.isCheckedField(field));
  }

  public isOpenedChangeTypePopup(): boolean {
    return this._changeTypePopupComponent.isShowPopup === true;
  }

  public isOpenedDeletePopup(): boolean {
    return this._deletePopupComponent.isShowPopup === true;
  }

  private _changeFilteredFieldList(): void {
    // init filtered field list
    let filteredFieldList = this.fieldList;
    // filtered role
    if (this.selectedRoleFilter.value !== Type.Role.ALL) {
      filteredFieldList = filteredFieldList.filter(field => field.role === this.selectedRoleFilter.value);
    }
    // filtered type
    if (this.selectedTypeFilter.value !== Type.Logical.ALL) {
      if (Type.Logical.STRING === this.selectedTypeFilter.value) {
        filteredFieldList = filteredFieldList.filter(field => !Field.isCreatedField(field) && Type.Logical.STRING === field.logicalType);
      } else if (Type.Logical.USER_DEFINED === this.selectedTypeFilter.value) {
        filteredFieldList = filteredFieldList.filter(field => Field.isCreatedField(field) && Type.Logical.STRING === field.logicalType);
      } else {
        filteredFieldList = filteredFieldList.filter(field => this.selectedTypeFilter.value === field.logicalType);
      }
    }
    // filtered search keyword
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      filteredFieldList = filteredFieldList.filter(field => field.name.toUpperCase().includes(this.searchKeyword.toUpperCase()));
    }
    this.filteredFieldList = filteredFieldList;
  }

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
}
