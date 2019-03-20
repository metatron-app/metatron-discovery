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

import {AbstractComponent} from '../../../common/component/abstract.component';
import {Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';
import {TimezoneService} from '../../../data-storage/service/timezone.service';
import {Field, FieldFormat, FieldFormatType, FieldFormatUnit} from '../../../domain/datasource/datasource';
import {StringUtil} from '../../../common/util/string.util';
import {FieldConfigService} from '../../../data-storage/service/field-config.service';
import {isNullOrUndefined} from 'util';
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";

@Component({
  selector: 'datetime-valid-popup',
  templateUrl: './datetime-valid-popup.component.html',
})
export class DatetimeValidPopupComponent extends AbstractComponent {

  private _valueList: string[];

  @Input('fieldDataList')
  private readonly _dateList;

  @Input()
  public format: FieldFormat;

  @Input()
  public name: string;

  @Input()
  public readonly defaultFormat;

  @Output()
  public readonly closed = new EventEmitter();

  @Output()
  public readonly changedDefaultFormat = new EventEmitter();

  @Output()
  public readonly changedFieldFormat = new EventEmitter();

  public readonly formatUnitList: { label: string, value: FieldFormatUnit }[] = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // enum
  public readonly FIELD_FORMAT_TYPE = FieldFormatType;

  constructor(
    private fieldConfigService: FieldConfigService,
    private timezoneService: TimezoneService,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // init field format
    if (isNullOrUndefined(this.format)) {
      this.format = new FieldFormat();
    }
    // set value list
    this._valueList = this._dateList.reduce((acc, data) => {
      if (!isNullOrUndefined(data[this.name])) {
        acc.push(data[this.name]);
      }
      return acc;
    }, []);
    // if init format
    if (StringUtil.isEmpty(this.format.format)) {
      if (isNullOrUndefined(this.defaultFormat)) {
        this._checkFormatValidation(true);
      } else {
        this.format.format = this.defaultFormat;
        this.format.isValidTimeFormat = true;
      }
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  public cancel(): void {
    // if not exist isValidTimeFormat property in field, set false
    if (isNullOrUndefined(this.format.isValidTimeFormat)) {
      this.format.isValidTimeFormat = false;
      this.format.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.check');
    }
    this.changedFieldFormat.emit(this.format);
    this.closed.emit();
  }


  /**
   * Get timezone label
   * @return {string}
   */
  public getTimezoneLabel(): string {
    return this.timezoneService.getTimezoneObject(this.format).label;
  }

  /**
   * Change enable Unix type
   */
  public onChangeEnableUnixType(): void {
    // if format type is DATE_TIME
    if (this.format.type === FieldFormatType.DATE_TIME) {
      // init format unit
      this.format.unit = this.formatUnitList[0].value;
      // set type
      this.format.type = FieldFormatType.UNIX_TIME;
      // set time format valid TRUE
      this.format.isValidTimeFormat = true;
    } else if (this.format.type === FieldFormatType.UNIX_TIME) { // if format type is UNIX_TIME
      // remove format unit
      delete this.format.unit;
      // set type
      this.format.type = FieldFormatType.DATE_TIME;
      // set time format valid FALSE
      this.format.isValidTimeFormat = false;
      // set validation message
      this.format.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.check');
    }
  }

  public onChangeUnixType(type: { label: string, value: FieldFormatUnit }) {
    if (this.format.unit !== type.value) {
      // change unit
      this.format.unit = type.value;
      // set time format valid TRUE
      this.format.isValidTimeFormat = true;
    }
  }

  public onClickFormatValidation(): void {
    // if empty format in field
    if (StringUtil.isEmpty(this.format.format)) {
      this.format.isValidTimeFormat = false;
      this.format.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.required');
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
    this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField1(this.format, this._valueList, isInitValid).then((format: FieldFormat) => {
      this.loadingHide();
      // set format in defaultFormatObj
      if (isInitValid) {
        this.changedDefaultFormat.emit(this.format.format);
      }
    }).catch(() => {
      this.loadingHide();
    });
  }
}
