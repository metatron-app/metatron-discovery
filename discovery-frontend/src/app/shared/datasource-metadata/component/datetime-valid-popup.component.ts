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
import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from '@angular/core';
import {TimezoneService} from '../../../data-storage/service/timezone.service';
import {FieldFormat, FieldFormatType, FieldFormatUnit} from '../../../domain/datasource/datasource';
import {StringUtil} from '../../../common/util/string.util';
import {FieldConfigService} from '../../../data-storage/service/field-config.service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'datetime-valid-popup',
  templateUrl: './datetime-valid-popup.component.html',
})
export class DatetimeValidPopupComponent extends AbstractComponent {

  private _valueList: string[];

  @Input('fieldDataList')
  private readonly _dateList;

  @Input()
  public fieldFormat: FieldFormat;

  @Input('fieldName')
  public readonly name: string;

  // TODO 추후 데이터소스 연결시 isDisableValidation 제거
  @Input() readonly isDisableValidation: boolean;

  // valid default format
  public defaultFormat: string;
  // format
  public prevFormat: string;

  @Output()
  public readonly closed = new EventEmitter();

  @Output()
  public readonly changedFieldFormat = new EventEmitter();

  @Output()
  public readonly changedFieldFormatValid = new EventEmitter();

  // TODO 추후 데이터소스 연결시 isDisableValidation 제거
  @Output() readonly changedFieldFormatString = new EventEmitter();

  public readonly formatUnitList: { label: string, value: FieldFormatUnit }[] = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // enum
  public readonly FIELD_FORMAT_TYPE = FieldFormatType;

  // constant
  public readonly TIMEZONE_DISABLE_KEY = TimezoneService.DISABLE_TIMEZONE_KEY;

  constructor(
    private fieldConfigService: FieldConfigService,
    private timezoneService: TimezoneService,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Init
   */
  public init(): void {
    // field format
    if (isNullOrUndefined(this.fieldFormat.formatInitialize)) {
      this.fieldFormat = FieldFormat.of(this.fieldFormat);
    }
    // set value list
    if (isNullOrUndefined(this._valueList)) {
      this._valueList = this._dateList ? this._dateList.reduce((acc, data) => {
        if (!isNullOrUndefined(data[this.name])) {
          acc.push(data[this.name]);
        }
        return acc;
      }, []) : [];
    }
    // if init format
    if (StringUtil.isEmpty(this.fieldFormat.format) && this.fieldFormat.type === FieldFormatType.DATE_TIME) {
      // if not exist default format
      if (isNullOrUndefined(this.defaultFormat)) {
        this._checkFormatValidation(true);
      } else { // if exist default format
        this.fieldFormat.format = this.defaultFormat;
        this.fieldFormat.isValidFormat = true;
      }
    } else if (this.fieldFormat.type === FieldFormatType.UNIX_TIME) {
      this.fieldFormat.isValidFormat = true;
    }
    // open
    this.fieldFormat.isShowTimestampValidPopup = true;
    this.changedFieldFormat.emit(this.fieldFormat);
  }

  /**
   * Cancel
   */
  public cancelPopup(): void {
    // if not exist isValidFormat property in field, set false
    if (isNullOrUndefined(this.fieldFormat.isValidFormat)) {
      this.fieldFormat.isValidFormat = false;
      this.fieldFormat.formatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.check');
    }
    // close
    this.fieldFormat.isShowTimestampValidPopup = false;
    this.changedFieldFormatValid.emit();
    this.closed.emit();
  }


  /**
   * Get timezone label
   * @return {string}
   */
  public getTimezoneLabel(): string {
    return this.timezoneService.getTimezoneObject(this.fieldFormat).label;
  }

  /**
   * Changed format text
   * @param value
   */
  public onChangedFormatText(value): void {
    this.prevFormat = value;
    this.fieldFormat.isValidFormat = undefined;

    // TODO 추후 데이터소스 연결시 isDisableValidation 제거
    if (this.isDisableValidation) {
      this.changedFieldFormat.emit(this.fieldFormat);
    }
  }

  /**
   * Change enable Unix type
   */
  public onChangeEnableUnixType(): void {
    // if format type is DATE_TIME
    if (this.fieldFormat.type === FieldFormatType.DATE_TIME) {
      // set prev format
      this.prevFormat = this.fieldFormat.format;
      // remove date type properties
      this.fieldFormat.removeDateTypeProperties();
      // set timezone disable
      this.fieldFormat.disableTimezone();
      // init format unit
      this.fieldFormat.unitInitialize();
      // remove format valid message property
      delete this.fieldFormat.formatValidMessage;
      // set time format valid TRUE
      this.fieldFormat.isValidFormat = true;
      // set type
      this.fieldFormat.type = FieldFormatType.UNIX_TIME;
    } else if (this.fieldFormat.type === FieldFormatType.UNIX_TIME) { // if format type is UNIX_TIME
      // remove unix type properties
      this.fieldFormat.removeUnixTypeProperties();
      // remove format valid property
      delete this.fieldFormat.isValidFormat;
      // set format
      this.fieldFormat.format = this.prevFormat;
      // set validation message
      this.fieldFormat.formatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.check');
      // set type
      this.fieldFormat.type = FieldFormatType.DATE_TIME;
    }

    // TODO 추후 데이터소스 연결시 isDisableValidation 제거
    if (this.isDisableValidation) {
      this.changedFieldFormat.emit(this.fieldFormat);
    }
  }

  /**
   * Change Unix type
   * @param {{label: string; value: FieldFormatUnit}} type
   */
  public onChangeUnixType(type: { label: string, value: FieldFormatUnit }) {
    if (this.fieldFormat.unit !== type.value) {
      // change unit
      this.fieldFormat.unit = type.value;
      // set time format valid TRUE
      if (!this.fieldFormat.isValidFormat) {
        this.fieldFormat.isValidFormat = true;
      }
    }
  }

  /**
   * Check format validation
   */
  public onClickFormatValidation(): void {
    // if empty format in field
    if (StringUtil.isEmpty(this.fieldFormat.format)) {
      this.fieldFormat.isValidFormat = false;
      this.fieldFormat.formatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.required');
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
    this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(this.fieldFormat, this._valueList, isInitValid).then((format: FieldFormat) => {
      this.loadingHide();
      // set default format
      this.defaultFormat = this.fieldFormat.format;
      this.changedFieldFormatValid.emit();
    }).catch(() => {
      this.loadingHide();
      this.changedFieldFormatValid.emit();
    });
  }
}
