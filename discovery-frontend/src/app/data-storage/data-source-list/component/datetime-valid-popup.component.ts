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


import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, EventEmitter, Injector, Input, OnChanges, Output} from "@angular/core";
import {TimezoneService} from "../../service/timezone.service";
import {Field, FieldFormat, FieldFormatType, FieldFormatUnit, LogicalType} from "../../../domain/datasource/datasource";
import {StringUtil} from "../../../common/util/string.util";
import {FieldConfigService} from "../../service/field-config.service";
import {isNullOrUndefined} from 'util';
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";

@Component({
  selector: 'datetime-valid-popup',
  templateUrl: 'datetime-valid-popup.component.html',
})
export class DatetimeValidPopupComponent extends AbstractComponent {

  private _fieldData: string[];

  @Input('fieldDataList')
  private readonly _dateList: any;

  @Input()
  public readonly field: Field | MetadataColumn;

  @Input()
  public readonly defaultFormatObj: any;

  @Output()
  public readonly closed: EventEmitter<any> = new EventEmitter();

  public readonly formatUnitList: {label: string, value: FieldFormatUnit}[] = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // enum
  public readonly FIELD_FORMAT_TYPE: any = FieldFormatType;

  constructor(private fieldConfigService: FieldConfigService,
              private timezoneService: TimezoneService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this._fieldData = this.fieldConfigService.getFieldDataList(this.field, this._dateList);
    // if not exist format
    if (!this.field.format) {
      this.field.format = new FieldFormat();
      // if init format
      if (!this.defaultFormatObj[this.field.name]) {
        this._checkFormatValidation(true);
      } else {
        this.field.format.format = this.defaultFormatObj[this.field.name];
        this.field.isValidTimeFormat = true;
      }
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // if not exist isValidTimeFormat property in field, set false
    if (isNullOrUndefined(this.field.isValidTimeFormat)) {
      this.field.isValidTimeFormat = false;
      this.closed.emit();
    }
  }

  public cancel(): void {
    this.field.isShowTypeValidPopup = undefined;
  }

  /**
   * Get timezone label
   * @param {Field} field
   * @return {string}
   */
  public getTimezoneLabel(field: Field | MetadataColumn): string {
    return this.timezoneService.getTimezoneObject(field.format).label;
  }

  /**
   * Change enable Unix type
   */
  public onChangeEnableUnixType(): void {
    // if format type is DATE_TIME
    if (this.field.format.type === FieldFormatType.DATE_TIME) {
      // init format unit
      this.field.format.unit = this.formatUnitList[0].value;
      // set type
      this.field.format.type = FieldFormatType.UNIX_TIME;
      // set time format valid TRUE
      this.field.isValidTimeFormat = true;
    } else if (this.field.format.type === FieldFormatType.UNIX_TIME) { // if format type is UNIX_TIME
      // remove format unit
      delete this.field.format.unit;
      // set type
      this.field.format.type = FieldFormatType.DATE_TIME;
      // set time format valid FALSE
      this.field.isValidTimeFormat = false;
      // set validation message
      this.field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.check');
    }
  }

  public onChangeUnixType(type: {label: string, value: FieldFormatUnit}) {
    if (this.field.format.unit !== type.value) {
      // change unit
      this.field.format.unit = type.value;
      // set time format valid TRUE
      this.field.isValidTimeFormat = true;
    }
  }

  public onClickFormatValidation(): void {
    // if empty format in field
    if (StringUtil.isEmpty(this.field.format.format)) {
     this.field.isValidTimeFormat = false;
     this.field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.required');
    } else {
      this._checkFormatValidation(false);
    }
  }



  /**
   * Check format validation
   * @param {boolean} isInitValid
   * @private
   */
  private _checkFormatValidation(isInitValid?: boolean): void {
    this.loadingShow();
    this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(this.field, this._fieldData, isInitValid)
      .then((field: Field) => {
        this.loadingHide();
        // set format in defaultFormatObj
        if (isInitValid) {
          this.defaultFormatObj[field.name] = field.format.format;
        }
      })
      .catch((error) => {
        this.loadingHide();
      });
  }
}
