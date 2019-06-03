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

import {
  Component,
  ElementRef, EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {
  ConnectionType,
  Field,
  FieldFormat,
  FieldFormatType,
  FieldFormatUnit,
  IngestionRule,
  IngestionRuleType,
  LogicalType
} from "../../../domain/datasource/datasource";
import * as _ from 'lodash';
import {StorageFilterSelectBoxComponent} from "../../data-source-list/component/storage-filter-select-box.component";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {Filter} from "../../../shared/datasource-metadata/domain/filter";
import {FieldConfigService} from "../../service/field-config.service";
import {StringUtil} from "../../../common/util/string.util";
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {TimeZoneObject, TimezoneService} from "../../service/timezone.service";

declare const moment;

@Component({
  selector: 'schema-configure-field-detail',
  templateUrl: 'schema-configure-field-detail.component.html'
})
export class SchemaConfigureFieldDetailComponent extends AbstractComponent implements OnChanges {

  @ViewChild('geoCoordinateSelectBox')
  private readonly _geoCoordinateSelectBox: StorageFilterSelectBoxComponent;

  @ViewChild('typeSelectBox')
  private readonly _typeSelectBox: StorageFilterSelectBoxComponent;

  // current milli seconds
  private _currentMilliseconds: number = moment().valueOf();

  @Input()
  public readonly selectedField;
  @Input()
  public readonly dataList: string[];
  @Input('selectedTimestampType')
  private readonly _selectedTimestampType: DataStorageConstant.Datasource.TimestampType;
  @Input('selectedTimestampField')
  private readonly _selectedTimestampField: Field;
  @Input('connType')
  private readonly _connType: ConnectionType;

  public readonly roleList = this.constant.getRoleTypeFiltersExceptAll();

  // GEO coordinate list
  public readonly geoCoordinateList: string[] = this.constant.getGeoCoordinateList();

  // unit list
  public readonly formatUnitList = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // ingestion rule type list
  public readonly ingestionRuleTypeList = [
    {label: this.translateService.instant('msg.storage.ui.replace.with'), value: IngestionRuleType.REPLACE},
    {label: this.translateService.instant('msg.storage.btn.discard'), value: IngestionRuleType.DISCARD},
    {label: this.translateService.instant('msg.storage.btn.no.apply'), value: IngestionRuleType.DEFAULT},
  ];

  // filtered timezone list
  public filteredTimezoneList: TimeZoneObject[];






  public typeList;
  public previewMessage: string;

  // search keyword
  public searchTimezoneKeyword: string;

  // enum
  public readonly INGESTION_RULE_TYPE = IngestionRuleType;

  // flag
  public isShowDataPreview: boolean;
  // timezone list show flag
  public isShowTimezoneList: boolean;

  @ViewChild('timezoneElement')
  private readonly TIMEZONE_ELEMENT: ElementRef;
  @ViewChild('timezonePopupElement')
  private readonly TIMEZONE_POPUP_ELEMENT: ElementRef;
  @ViewChild('timestampGuideElement')
  private readonly TIMESTAMP_GUIDE_ELEMENT: ElementRef;

  @Output() removedCreatedField = new EventEmitter();

  // constructor
  constructor(private constant: ConstantService,
              private broadCaster: EventBroadcaster,
              private fieldConfigService: FieldConfigService,
              private datasourceService: DatasourceService,
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedField) {
      // change type list
      this._changeTypeList();
      // if empty ingestionRule in field
      if (_.isNil(this.selectedField.ingestionRule)) {
        this.selectedField.ingestionRule = new IngestionRule();
      }
      // search keyword initial
      this.searchTimezoneKeyword = undefined;
      // set searched timezone list
      this._setSearchedTimezoneList(this.searchTimezoneKeyword);
      // set preview show flag
      this._setDataPreviewShowFlag();
    }
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // #1925
    this.closeSelectBoxes();
  }

  public isGeoField(): boolean {
    return Field.isGeoType(this.selectedField);
  }

  public isRemovedField(): boolean {
    return Field.isRemovedField(this.selectedField);
  }

  public isCreatedField(): boolean {
    return Field.isCreatedField(this.selectedField);
  }

  public isTimestampField(): boolean {
    return this._selectedTimestampType === DataStorageConstant.Datasource.TimestampType.FIELD && Field.isDimensionField(this.selectedField) && this.isTimestampTypeField() && !this.isEmptySelectedTimestampField() && this.selectedField.originalName === this._selectedTimestampField.originalName;
  }

  public isGeoFormatError(): boolean {
    return this.isGeoField() && !this.isEmptyFormat() && this.isFormatError();
  }

  public isEmptySelectedTimestampField() {
    return _.isNil(this._selectedTimestampField);
  }

  public isEmptyFormat(): boolean {
    return Field.isEmptyFormat(this.selectedField);
  }

  public isFormatError(): boolean {
    return this.selectedField.format.isValidFormat === false;
  }

  public isIngestionRuleError(): boolean {
    return !Field.isEmptyIngestionRule(this.selectedField) && this.selectedField.ingestionRule.isReplaceType() && this.selectedField.ingestionRule.isValidReplaceValue === false;
  }

  public isEnableTimezone(): boolean {
    return this.isTimestampTypeField() && !Field.isEmptyFormat(this.selectedField) && this.selectedField.format.isDateTime() && !this.selectedField.format.isEmptyFormat() && this.selectedField.format.isEnableTimezone();
  }

  public isTimestampTypeField(): boolean {
    return Field.isTimestampTypeField(this.selectedField);
  }

  /**
   * Is disabled type change
   * @returns {boolean}
   */
  public isDisabledTypeChange(): boolean {
    return this.isCreatedField() || this.isTimestampField();
  }

  public isEmptyValue(value): boolean {
    return _.isNil(value);
  }

  /**
   * Get sliced column name
   * @return {string}
   */
  public getSlicedColumnName(): string {
    return Field.getSlicedColumnName(this.selectedField);
  }

  /**
   * Get sliced data content
   * @param data
   */
  public getSlicedDataContent(data: string) {
    let content = data;
    // trans to string
    if (typeof data === "number") {
      content = data + '';
    }
    if (!_.isNil(content)  && content.length > 50) {
      return content.slice(0,50);
    } else {
      return content;
    }
  }

  /**
   * Get selected timezone label
   * @param {FieldFormat} format
   * @return {string}
   */
  public getSelectedTimezoneLabel(format: FieldFormat): string {
    return this.timezoneService.getTimezoneObject(format).label;
  }

  /**
   * 타입에 대한 기본값 placeholder 표시
   * @returns {string}
   */
  public getDefaultIngestionRuleValue(): string | number {
    switch (this.selectedField.logicalType) {
      case LogicalType.TIMESTAMP:
        return (this.selectedField.format && this.selectedField.format.type === FieldFormatType.DATE_TIME) ? this.dataList[0] : this._currentMilliseconds;
      case LogicalType.BOOLEAN:
        return 'false';
      case LogicalType.TEXT:
      case LogicalType.STRING:
      case LogicalType.GEO_POINT:
      case LogicalType.GEO_LINE:
      case LogicalType.GEO_POLYGON:
        return '';
      case LogicalType.INTEGER:
        return '0';
      case LogicalType.DOUBLE:
      case LogicalType.FLOAT:
        return  '0.0';
      case LogicalType.LNT:
      case LogicalType.LNG:
        return '0.0';
      default:
        console.error(this.translateService.instant('msg.common.ui.no.icon.type'), this.selectedField.logicalType);
        return '';
    }
  }

  public isUnixTypeField(): boolean {
    return this.selectedField.format && this.selectedField.format.type === FieldFormatType.UNIX_TIME;
  }

  public isTimeTypeField(): boolean {
    return this.selectedField.format && this.selectedField.format.type === FieldFormatType.DATE_TIME;
  }

  /**
   * Init time format valid in field
   */
  public initTimeFormatValid(): void {
    delete this.selectedField.format.isValidFormat;
  }

  /**
   * Field Format unit change event
   * @param {Field} field
   * @param unit
   */
  public onChangeFormatUnitInField(unit: any): void {
    if (unit.value !== this.selectedField.format.unit) {
      // change unit
      this.selectedField.format.unit = unit.value;
      // change time placeholder
      this._currentMilliseconds = unit.value === FieldFormatUnit.MILLISECOND ? moment().valueOf() : Math.floor(moment().valueOf()/1000);
      // init replace valid
      this.initIngestionRuleReplaceValid();
    }
  }

  /**
   * Click time format validation
   */
  public onClickTimeFormatValidation() {
    this.loadingShow();
    this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(this.selectedField.format, this.dataList)
      .then((format: FieldFormat) => {
        this.loadingHide();
      })
      .catch((error) => {
        this.loadingHide();
      });
  }

  /**
   * Unix code in field enable chagne event
   */
  public onChangeEnableUnixCodeInField(): void {
    // init replace valid
    this.initIngestionRuleReplaceValid();
    // if format type is DATE_TIME
    if (this.selectedField.format.type === FieldFormatType.DATE_TIME) {
      this.selectedField.format.type = FieldFormatType.UNIX_TIME;
      // set time format valid TRUE
      this.selectedField.format.isValidFormat = true;
    } else if (this.selectedField.format.type === FieldFormatType.UNIX_TIME) { // if format type is UNIX_TIME
      this.selectedField.format.type = FieldFormatType.DATE_TIME;
      // init time format valid
      this.initTimeFormatValid();
    }
  }

  /**
   * Change timezone in field
   * @param {Field} field
   * @param {TimeZoneObject} timezoneObj
   */
  public onChangeTimezoneInField(field: Field, timezoneObj: TimeZoneObject): void {
    // change timezone in field
    field.format.timeZone = timezoneObj.momentName;
    // close select box
    this.isShowTimezoneList = false;
  }

  /**
   * Change search timezone keyword
   * @param {string} searchKeyword
   */
  public onChangeSearchTimezoneKeyword(searchKeyword: string): void {
    // set search timezone keyword
    this.searchTimezoneKeyword = searchKeyword;
    // set searched timezone list
    this._setSearchedTimezoneList(this.searchTimezoneKeyword);
  }

  /**
   * Change ingestion rule type in field
   * @param type
   */
  public onChangeIngestionRuleType(type): void {
    // if different ingestion rule type
    if (this.selectedField.ingestionRule.type !== type.value) {
      // set ingestion rule type
      this.selectedField.ingestionRule.type = type.value;
      // broadcast changed field
      this._broadCastChangedField();
    }
  }

  /**
   * Change geo coordinate in field
   * @param value
   */
  public onChangeGeoCoordinate(value: string): void {
    if (this.selectedField.format.originalSrsName !== value) {
      this.selectedField.format.originalSrsName = value;
      // broadcast changed field
      this._broadCastChangedField();
    }
  }

  /**
   * Change timezone selectbox show flag
   * @param {MouseEvent} event
   */
  public onChangeTimezoneSelectBoxShowFlag(event: MouseEvent): void {
    if ($(event.target).hasClass('ddp-type-selectbox ddp-type-search-select') || $(event.target).hasClass('ddp-txt-selectbox')) {
      this.isShowTimezoneList = !this.isShowTimezoneList;
      // if open show flag
      if (this.isShowTimezoneList) {
        $(this.TIMEZONE_POPUP_ELEMENT.nativeElement).css({
          'position' : 'fixed',
          'top': $(event.currentTarget).offset().top + 35,
          'left' : $(event.currentTarget).offset().left,
          'width' : $(event.currentTarget).outerWidth()
        });
      }
    }
  }

  /**
   * Hover timestamp icon guide
   */
  public onHoverTimestampGuideIcon(): void {
    const $infoLeft = $(this.TIMESTAMP_GUIDE_ELEMENT.nativeElement).offset().left;
    const $infoTop = $(this.TIMESTAMP_GUIDE_ELEMENT.nativeElement).offset().top;
    $(this.TIMESTAMP_GUIDE_ELEMENT.nativeElement).find('.ddp-box-layout4').css({
      'position' : 'fixed',
      'left': $infoLeft - 30,
      'top' :  $infoTop + 19
    });
  }

  /**
   * Get selected type
   */
  public getSelectedType() {
    if (Field.isDimensionField(this.selectedField) && Field.isExpressionField(this.selectedField)) {
      return new Filter.Logical(this.translateService.instant('msg.storage.ui.list.expression'), Type.Logical.USER_DEFINED, 'ddp-icon-type-expression');
    } else {
      return this.constant.getTypeFiltersInCreateStep().find(type => type.value === this.selectedField.logicalType);
    }
  }

  /**
   * Change role in field
   * @param type
   */
  public onChangeRole(type): void {
    if (!this.isDisabledTypeChange() && this.selectedField.role !== type.value) {
      // change role
      this.selectedField.role = type.value;
      // change type list
      this._changeTypeList();
      // change type first
      this.onChangeLogicalType(this.typeList[0]);
    }
  }

  /**
   * Change logical type in field
   * @param type
   */
  public onChangeLogicalType(type): void {
    if (!this.isDisabledTypeChange() && this.selectedField.logicalType !== type.value) {
      // init ingestionRule
      this.selectedField.ingestionRule.removeUIProperties();
      this.selectedField.ingestionRule.initType();
      // change logical type
      this.selectedField.logicalType = type.value;
      // if field logical type change to GEO
      if (type.value === Type.Logical.GEO_POINT || type.value === Type.Logical.GEO_LINE || type.value === Type.Logical.GEO_POLYGON) {
        if (Field.isEmptyFormat(this.selectedField)) {
          this.selectedField.format = new FieldFormat();
        }
        // loading show
        this.loadingShow();
        // valid WKT
        this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(this.selectedField.format, this.dataList, type.value)
          .then((result) => {
            this.loadingHide();
          })
          .catch((error) => {
            this.loadingHide();
          });
      } else if (type.value === Type.Logical.TIMESTAMP) { // if field logical type change to TIMESTAMP
        if (Field.isEmptyFormat(this.selectedField)) {
          this.selectedField.format = new FieldFormat();
        }
        this.loadingShow();
        this.fieldConfigService.checkEnableDateTimeFormatAndSetValidationResultInField(this.selectedField.format, this.dataList, true)
          .then((format: FieldFormat) => {
            this.loadingHide();
          })
          .catch((error) => {
            this.loadingHide();
          });
      } else {
        delete this.selectedField.format;
      }
      // broadcast changed field
      this._broadCastChangedField();
    }
  }

  /**
   * Init ingestion rule replace valid in field
   */
  public initIngestionRuleReplaceValid(): void {
    delete this.selectedField.ingestionRule.isValidReplaceValue;
  }

  /**
   * Remove field
   */
  public removeField(): void {
    if (this.isCreatedField()) {
      this.removedCreatedField.emit(this.selectedField);
    } else if (!Field.isRemovedField(this.selectedField)) { // if not removed field
      Field.setRemoveField(this.selectedField);
      // if checked field
      if (Field.isCheckedField(this.selectedField)) {
        Field.setUndoCheckField(this.selectedField);
      }
      // broadcast changed field
      this._broadCastChangedField();
    }
  }

  /**
   * Undo remove field
   */
  public undoRemoveField(): void {
    Field.setUndoRemoveField(this.selectedField);
    // broadcast changed field
    this._broadCastChangedField();
  }

  /**
   * Close select boxes
   */
  public closeSelectBoxes(): void {
    if (this._geoCoordinateSelectBox && this._geoCoordinateSelectBox.isListShow === true) {
      this._geoCoordinateSelectBox.isListShow = false;
    } else if (this._typeSelectBox && this._typeSelectBox.isListShow === true) {
      this._typeSelectBox.isListShow = false;
    } else if (this.isShowTimezoneList === true) {
      this.isShowTimezoneList = false;
    }
  }

  /**
   * ingestion rule validation
   * @param {Field} field
   */
  public ingestionRuleValidation(): void {
    // if empty replace value
    if (StringUtil.isEmpty(this.selectedField.ingestionRule.value)) {
      this.selectedField.ingestionRule.isValidReplaceValue = true;
      return;
    }
    // 타입으로 검사
    switch (this.selectedField.logicalType) {
      case LogicalType.BOOLEAN:
        this.selectedField.ingestionRule.isValidReplaceValue = this.selectedField.ingestionRule.value.toLowerCase() === 'false' || this.selectedField.ingestionRule.value.toLowerCase() === 'true';
        // validation fail
        if (!this.selectedField.ingestionRule.isValidReplaceValue) {
          this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.boolean');
        }
        break;
      case LogicalType.TEXT:
      case LogicalType.STRING:
      case LogicalType.GEO_POINT:
      case LogicalType.GEO_LINE:
      case LogicalType.GEO_POLYGON:
        this.selectedField.ingestionRule.isValidReplaceValue = true;
        break;
      case LogicalType.TIMESTAMP:
        // if not pass format validation
        if (!this.selectedField.format.isValidFormat) {
          this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp.pre.valid');
          this.selectedField.ingestionRule.isValidReplaceValue = false;
          return;
        }
        // params
        const params = {
          format: this.selectedField.format.type === FieldFormatType.UNIX_TIME ? 'time_unix' : this.selectedField.format.format,
          samples: [this.selectedField.ingestionRule.value]
        };
        // if format type is UNIX, add format unit
        if (this.selectedField.format.type === FieldFormatType.UNIX_TIME) {
          params['unit'] = this.selectedField.format.unit;
        }
        this.loadingShow();
        // check validation
        this.datasourceService.checkValidationDateTime(params)
          .then((result: {valid: boolean}) => {
            // 로딩 hide
            this.loadingHide();
            if (result.valid) {
              this.selectedField.ingestionRule.isValidReplaceValue = true;
            } else {
              this.selectedField.ingestionRule.isValidReplaceValue = false;
              this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
            }
          })
          .catch((error) => {
            // 로딩 hide
            this.loadingHide();
            this.selectedField.ingestionRule.isValidReplaceValue = false;
            this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
          });
        break;
      case LogicalType.INTEGER:
        this.selectedField.ingestionRule.isValidReplaceValue = (/^[0-9]*$/g).test(this.selectedField.ingestionRule.value);
        // validation fail
        if (!this.selectedField.ingestionRule.isValidReplaceValue) {
          this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.integer');
        }
        break;
      case LogicalType.DOUBLE:
      case LogicalType.FLOAT:
      case LogicalType.LNT:
      case LogicalType.LNG:
        this.selectedField.ingestionRule.isValidReplaceValue = (/^[0-9]+([.][0-9]+)$/g).test(this.selectedField.ingestionRule.value);
        // validation fail
        if (!this.selectedField.ingestionRule.isValidReplaceValue) {
          this.selectedField.ingestionRule.replaceValidationMessage = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
        }
        break;
      default:
        console.error(this.translateService.instant('msg.common.ui.no.icon.type'), this.selectedField.logicalType);
        break;
    }
  }

  /**
   * Set data preview show flag
   * @private
   */
  private _setDataPreviewShowFlag(): void {
    // set data list show flag
    if (Field.isExpressionField(this.selectedField)) {
      this.previewMessage = this.translateService.instant('msg.storage.ui.config.extension.no.data');
      this.isShowDataPreview = false;
    } else if (this.isCreatedField() && this.isGeoField() && this._connType === ConnectionType.LINK) {
      this.previewMessage = this.translateService.instant('msg.storage.ui.config.linked-geo.no.data');
      this.isShowDataPreview = false;
    } else if (this.isEmptyValue(this.dataList) || this.dataList.length === 0) {
      this.previewMessage = this.translateService.instant('msg.storage.ui.config.no.data');
      this.isShowDataPreview = false;
    } else {
      this.isShowDataPreview = true;
    }
  }

  /**
   * Set searched timezone list
   * @param {string} searchKeyword
   * @private
   */
  private _setSearchedTimezoneList(searchKeyword: string): void {
    this.filteredTimezoneList = this.timezoneService.getSearchedTimezoneList(searchKeyword);
  }

  /**
   * Change type list
   * @private
   */
  private _changeTypeList(): void {
    if (Field.isMeasureField(this.selectedField)) {
      this.typeList = this.constant.getTypeFiltersInMeasure();
    } else if (Field.isDimensionField(this.selectedField) && Field.isStringBaseType(this.selectedField)){
      this.typeList = this.constant.getTypeFiltersInDimensionIncludeGeoTypes();
    } else {
      this.typeList = this.constant.getTypeFiltersInDimension();
    }
  }

  /**
   * Broadcast changed field
   * @private
   */
  private _broadCastChangedField(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_SELECTED_FIELD, this.selectedField);
  }
}
