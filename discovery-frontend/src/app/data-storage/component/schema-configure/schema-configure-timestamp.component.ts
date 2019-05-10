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
  public selectedTimestampType = {label: this.translateService.instant('msg.storage.th.current-time'), value: DataStorageConstant.Datasource.TimestampType.CURRENT};
  public selectedTimestampField;

  public timestampFieldList;

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
        this.timestampFieldList = fieldList.filter(field => Field.isTimestampTypeField(field));
        // if empty timestamp field list
        if (this.isEmptyTimestampFieldList()) {
          // set current timestamp type
          this.onChangeSelectedTimestampType(this.timestampTypeList[0]);
          // if not empty selected timestamp field
          if (!this.isEmptySelectedTimestampField()) {
            // remove selected timestamp field
            this.selectedTimestampField = undefined;
            // changed selected timestamp field
            this._changedTimestampField();
          }
        } else { // if not empty timestamp field list
          // set current timestamp type
          this.onChangeSelectedTimestampType(this.timestampTypeList[1]);
          // if empty selected timestamp field
          if (this.isEmptySelectedTimestampField()) {
            // init first timestamp field
            this._setFirstTimestampField();
            // changed selected timestamp field
            this._changedTimestampField();
          } else if (this._isNotExistSelectedTimestampFieldInTimestampFieldList()) {
            // init first timestamp field
            this._setFirstTimestampField();
            // changed selected timestamp field
            this._changedTimestampField();
          }
        }
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

  public init(): void {

  }

  /**
   * Get sliced column name
   * @param field
   */
  public getSlicedColumnName(field: Field): string {
    return Field.getSlicedColumnName(field);
  }

  public onChangeSelectedTimestampType(type): void {
    if (this.selectedTimestampType.value !== type.value) {
      this.selectedTimestampType = type;
      this._changedTimestampType();
    }
  }

  public onChangeSelectedTimestampField(field): void {
    if (this.isEmptySelectedTimestampField() || this.selectedTimestampField.name !== field.name) {
      this.selectedTimestampField = field;
      this._changedTimestampField();
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
    return _.isNil(this.timestampFieldList) || this.timestampTypeList.length === 0;
  }

  public isFieldTimestampType(type): boolean {
    return type.value === DataStorageConstant.Datasource.TimestampType.FIELD;
  }

  private _changedTimestampField(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_FIELD, this.selectedTimestampField);
  }

  private _changedTimestampType(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_TIMESTAMP_TYPE, this.selectedTimestampType);
  }

  private _isNotExistSelectedTimestampFieldInTimestampFieldList(): boolean {
    return !this.timestampFieldList.some(field => field.name === this.selectedTimestampField.name);
  }

  private _setCurrentTimestampType(): void {
    this.selectedTimestampType = this.timestampTypeList[0];
  }

  private _setFieldTimestampType(): void {
    this.selectedTimestampType = this.timestampTypeList[1];
  }

  private _setFirstTimestampField(): void {
    this.selectedTimestampField = this.timestampFieldList[0];
  }

}
