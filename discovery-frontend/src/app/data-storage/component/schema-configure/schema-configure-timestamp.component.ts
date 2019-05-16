import {AbstractComponent} from "../../../common/component/abstract.component";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {Component, ElementRef, Injector} from "@angular/core";
import {Field} from "../../../domain/datasource/datasource";
import * as _ from 'lodash';

@Component({
  selector: 'schema-configure-timestamp',
  templateUrl: 'schema-configure-timestamp.component.html'
})
export class SchemaConfigureTimestampComponent extends AbstractComponent {

  public readonly timestampTypeList = [
    {label: this.translateService.instant('msg.storage.th.current-time'), value: DataStorageConstant.Datasource.TimestampType.CURRENT},
    {label: this.translateService.instant('msg.storage.th.time-column'), value: DataStorageConstant.Datasource.TimestampType.FIELD},
  ];
  public selectedTimestampType: DataStorageConstant.Datasource.TimestampType  = DataStorageConstant.Datasource.TimestampType.CURRENT;

  public timestampFieldList: Field[];
  public selectedTimestampField: Field;

  // flag
  public isShowTimestampFieldList: boolean;

  constructor(private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // set subscription event
    this.subscriptions.push(
      // changed field list
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST).subscribe((fieldList: Field[]) => {
        // set timestamp field list
        this.timestampFieldList = fieldList.filter(field => !Field.isRemovedField(field) && Field.isTimestampTypeField(field));
        // if empty timestamp field list
        if (!this.isEmptyTimestampFieldList() && this.isEmptySelectedTimestampField()) {
          // set FIELD timestamp type
          this.onChangeSelectedTimestampType(this.timestampTypeList[1]);
          // init first timestamp field
          this._setFirstTimestampField();
          // broadcast selected timestamp field
          this._broadCastTimestampField();
        }  else if (this._isNotExistSelectedTimestampFieldInTimestampFieldList()) {
          // set FIELD timestamp type
          this.onChangeSelectedTimestampType(this.timestampTypeList[0]);
          this.selectedTimestampField = undefined;
          // broadcast selected timestamp field
          this._broadCastTimestampField();
        }
        // changes detect
        this.safelyDetectChanges();
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

  public init(selectedTimestampField: Field, selectedTimestampType: DataStorageConstant.Datasource.TimestampType): void {
    this.selectedTimestampField = selectedTimestampField;
    this.selectedTimestampType = selectedTimestampType;
  }

  /**
   * Get sliced column name
   * @param field
   */
  public getSlicedColumnName(field: Field): string {
    return Field.getSlicedColumnName(field);
  }

  public onChangeSelectedTimestampType(type): void {
    if (this.selectedTimestampType !== type.value) {
      this.selectedTimestampType = type.value;
      this._broadCastTimestampType();
    }
  }

  public onChangeSelectedTimestampField(field): void {
    if (this.isEmptySelectedTimestampField() || this.selectedTimestampField.name !== field.name) {
      this.selectedTimestampField = field;
      this._broadCastTimestampField();
    }
  }

  public onChangeTimestampFieldListShowFlag(): void {
    if (!this.isEmptyTimestampFieldList()) {
      this.isShowTimestampFieldList = !this.isShowTimestampFieldList;
    }
  }

  public isEmptySelectedTimestampField(): boolean {
    return _.isNil(this.selectedTimestampField);
  }


  public isEmptyTimestampFieldList(): boolean {
    return _.isNil(this.timestampFieldList) || this.timestampFieldList.length === 0;
  }

  public isFieldTimestampType(type): boolean {
    return type.value === DataStorageConstant.Datasource.TimestampType.FIELD;
  }

  private _broadCastTimestampField(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_FIELD, this.selectedTimestampField);
  }

  private _broadCastTimestampType(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_TYPE, this.selectedTimestampType);
  }

  private _isNotExistSelectedTimestampFieldInTimestampFieldList(): boolean {
    return !this.timestampFieldList.some(field => field.name === this.selectedTimestampField.name);
  }

  private _setFirstTimestampField(): void {
    this.selectedTimestampField = this.timestampFieldList[0];
  }

}
