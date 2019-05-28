import {AbstractComponent} from "../../../common/component/abstract.component";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {Component, ElementRef, EventEmitter, HostListener, Injector, Output} from "@angular/core";
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

  // event emitter
  @Output() readonly changedTimestampField: EventEmitter<Field> = new EventEmitter();
  @Output() readonly changedTimestampType: EventEmitter<DataStorageConstant.Datasource.TimestampType> = new EventEmitter();

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
          // changed selected timestamp field
          this._changedTimestampField();
        }  else if (this._isNotExistSelectedTimestampFieldInTimestampFieldList()) {
          // set FIELD timestamp type
          this.onChangeSelectedTimestampType(this.timestampTypeList[0]);
          this.selectedTimestampField = undefined;
          // changed selected timestamp field
          this._changedTimestampField();
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

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // #1925
    if (this.isShowTimestampFieldList) {
      this.isShowTimestampFieldList = false;
    }
  }

  /**
   * Init
   * @param {Field} selectedTimestampField
   * @param {DataStorageConstant.Datasource.TimestampType} selectedTimestampType
   */
  public init(selectedTimestampField: Field, selectedTimestampType: DataStorageConstant.Datasource.TimestampType): void {
    this.selectedTimestampField = selectedTimestampField;
    this.selectedTimestampType = selectedTimestampType;
  }

  /**
   * Get sliced column name
   * @param {Field} field
   */
  public getSlicedColumnName(field: Field): string {
    return Field.getSlicedColumnName(field);
  }

  /**
   * Change selected timestamp type
   * @param type
   */
  public onChangeSelectedTimestampType(type): void {
    if (this.selectedTimestampType !== type.value) {
      this.selectedTimestampType = type.value;
      this._changedTimestampType();
    }
  }

  /**
   * Change selected timestamp field
   * @param {Field} field
   */
  public onChangeSelectedTimestampField(field: Field): void {
    if (this.isEmptySelectedTimestampField() || this.selectedTimestampField.originalName !== field.originalName) {
      this.selectedTimestampField = field;
      this._changedTimestampField();
    }
  }

  /**
   * Change timestamp field list show flag
   */
  public onChangeTimestampFieldListShowFlag(): void {
    if (!this.isEmptyTimestampFieldList()) {
      this.isShowTimestampFieldList = !this.isShowTimestampFieldList;
    }
  }

  /**
   * Is empty selected timestamp field
   * @return {boolean}
   */
  public isEmptySelectedTimestampField(): boolean {
    return _.isNil(this.selectedTimestampField);
  }

  /**
   * Is empty selected timestamp field list
   * @return {boolean}
   */
  public isEmptyTimestampFieldList(): boolean {
    return _.isNil(this.timestampFieldList) || this.timestampFieldList.length === 0;
  }

  /**
   * Is field timestamp type
   * @return {boolean}
   */
  public isFieldTimestampType(type): boolean {
    return type.value === DataStorageConstant.Datasource.TimestampType.FIELD;
  }

  /**
   * Is Not exist selected timestamp field in field list
   * @return {boolean}
   * @private
   */
  private _isNotExistSelectedTimestampFieldInTimestampFieldList(): boolean {
    return !this.timestampFieldList.some(field => field.originalName === this.selectedTimestampField.originalName);
  }

  /**
   * Set first timestamp field
   * @private
   */
  private _setFirstTimestampField(): void {
    this.selectedTimestampField = this.timestampFieldList[0];
  }

  /**
   * Changed timestamp field
   * @private
   */
  private _changedTimestampField(): void {
    this.changedTimestampField.emit(this.selectedTimestampField);
  }

  /**
   * Changed timestamp type
   * @private
   */
  private _changedTimestampType(): void {
    this.changedTimestampType.emit(this.selectedTimestampType);
  }
}
