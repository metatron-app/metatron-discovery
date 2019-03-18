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
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {TimezoneService} from "../../service/timezone.service";
import {Field, FieldFormat, FieldFormatType, FieldFormatUnit, LogicalType} from "../../../domain/datasource/datasource";
import {StringUtil} from "../../../common/util/string.util";
import {FieldConfigService} from "../../service/field-config.service";

@Component({
  selector: 'datetime-valid-popup',
  templateUrl: 'datetime-valid-popup.component.html',
})
export class DatetimeValidPopupComponent extends AbstractComponent {

  @Input()
  public readonly field: Field;

  @Input()
  public readonly dateList: any;

  public readonly formatUnitList: {label: string, value: FieldFormatUnit}[] = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // format text
  public formatText: string;


  constructor(private fieldConfigService: FieldConfigService,
              private timezoneService: TimezoneService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // if not exist format
    (!this.field.format) && (this.field.format = new FieldFormat());
    // set format
    this.formatText = this.field.format.format;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // if not exist isValidTimeFormat property in field, set false
    (!this.field.hasOwnProperty('isValidType')) && (this.field.isValidType = false);
  }

  public cancel(): void {
    // close
    this.field.isShowTypeValidPopup = undefined;
  }

  public getUnixtType(): {label: string, value: FieldFormatUnit} {
    return this.formatUnitList.find(type => this.field.format.unit === type.value);
  }

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
    if (StringUtil.isEmpty(this.formatText)) {
     this.field.isValidTimeFormat = false;
     this.field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.required');
    } else {
      // set format
      this.field.format.format = this.formatText;
      this._checkFormatValidation(false);
    }
  }

  private _checkFormatValidation(isInitValid?: boolean): void {
    this.loadingShow();
    this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(this.field, this.fieldConfigService.getFieldDataList(this.field, this.dateList), isInitValid)
      .then((field: Field) => {
        this.loadingHide();
        // set format
        this.formatText = field.format.format;
      })
      .catch((error) => {
        this.loadingHide();
      });
  }
}
