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
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {
  ConnectionType,
  Field,
  FieldFormat,
  FieldFormatType,
  FieldFormatUnit,
  FieldRole,
  IngestionRule,
  IngestionRuleType,
  LogicalType
} from '../../../domain/datasource/datasource';
import {StringUtil} from '../../../common/util/string.util';
import {TimeZoneObject, TimezoneService} from "../../service/timezone.service";
import {SchemaConfigDataPreviewComponent} from "./schema-config-data-preview.component";
import {isNullOrUndefined} from "util";
import {FieldConfigService} from "../../service/field-config.service";

declare let moment: any;

@Component({
  selector: 'schema-config-detail-component',
  templateUrl: 'schema-config-detail.component.html'
})
export class SchemaConfigDetailComponent extends AbstractComponent implements OnChanges {

  // origin logical type list
  private _originLogicalTypeList: any[] = [
    {
      label: this.translateService.instant('msg.storage.ui.list.string'),
      icon: 'ddp-icon-type-ab',
      value: LogicalType.STRING,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.boolean'),
      icon: 'ddp-icon-type-tf',
      value: LogicalType.BOOLEAN,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.integer'),
      icon: 'ddp-icon-type-int',
      value: LogicalType.INTEGER,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.double'),
      icon: 'ddp-icon-type-float',
      value: LogicalType.DOUBLE,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.date'),
      icon: 'ddp-icon-type-calen',
      value: LogicalType.TIMESTAMP,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.lnt'),
      icon: 'ddp-icon-type-latitude',
      value: LogicalType.LNT,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.lng'),
      icon: 'ddp-icon-type-longitude',
      value: LogicalType.LNG,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.integer'),
      icon: 'ddp-icon-type-int',
      value: LogicalType.INTEGER,
      role: FieldRole.MEASURE
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.double'),
      icon: 'ddp-icon-type-float',
      value: LogicalType.DOUBLE,
      role: FieldRole.MEASURE
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.point'),
      icon: 'ddp-icon-type-point',
      value: LogicalType.GEO_POINT,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.line'),
      icon: 'ddp-icon-type-line',
      value: LogicalType.GEO_LINE,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.polygon'),
      icon: 'ddp-icon-type-polygon',
      value: LogicalType.GEO_POLYGON,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.expression'),
      icon: 'ddp-icon-type-expression',
      value: LogicalType.USER_DEFINED,
      role: FieldRole.DIMENSION,
      derived: true
    }
  ];
  // current milli seconds
  private _currentMilliseconds: number = moment().valueOf();

  // selected field
  @Input()
  public selectedField: Field;
  // selected timestamp field
  @Input()
  public selectedTimestampField: Field;
  // selected timestamp type
  @Input()
  public selectedTimestampType: string;
  // selected field data list
  @Input()
  public selectedFieldDataList: any[] = [];

  // logical type list
  public logicalTypeList: any[] = [];
  // logical type list show / hide flag
  public logicalTypeListShowFlag: boolean;

  // role type list
  public roleTypeList: any[] = [
    {label: this.translateService.instant('msg.storage.ui.list.dimension'), value: FieldRole.DIMENSION},
    {label: this.translateService.instant('msg.storage.ui.list.measure'), value: FieldRole.MEASURE}
  ];

  // GEO coordinate list
  public geoCoordinateList: any[] = [
    'EPSG:4326', 'EPSG:4301'
  ];

  // unit list
  public formatUnitList: any[] = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // ingestion rule type list
  public ingestionRuleTypeList: any[] = [
    {label: this.translateService.instant('msg.storage.ui.replace.with'), value: IngestionRuleType.REPLACE},
    {label: this.translateService.instant('msg.storage.btn.discard'), value: IngestionRuleType.DISCARD},
    {label: this.translateService.instant('msg.storage.btn.no.apply'), value: IngestionRuleType.DEFAULT},
  ];

  @Output()
  public changedFieldLogicalType: EventEmitter<any> = new EventEmitter();

  // filtered timezone list
  public filteredTimezoneList: TimeZoneObject[];
  // search keyword
  public searchTimezoneKeyword: string;
  // timezone list show flag
  public isShowTimezoneList: boolean;

  @Input()
  public readonly connType: ConnectionType;

  @ViewChild(SchemaConfigDataPreviewComponent)
  private _previewComponent: SchemaConfigDataPreviewComponent;

  // 생성자
  constructor(private _datasourceService: DatasourceService,
              private _timezoneService: TimezoneService,
              private fieldConfigService: FieldConfigService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
  }

  /**
   * ngOnChanges
   * @param {SimpleChanges} changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedField) {
      // set logical type list
      this.setLogicalTypeList(this.selectedField);
      // if not exist ingestion rule in field
      if (!this.selectedField.ingestionRule) {
        this.selectedField.ingestionRule = new IngestionRule();
      }
      // TODO ingestion setting 하면서 개편
      this.safelyDetectChanges();
      this._previewComponent.init(this.selectedField, this.selectedFieldDataList);
      // search keyword initial
      this.searchTimezoneKeyword = undefined;
      // set searched timezone list
      this._setSearchedTimezoneList(this.searchTimezoneKeyword);
    }
  }

  /**
   * Init time format valid in field
   * @param {Field} field
   */
  public initTimeFormatValid(field: Field): void {
    delete field.isValidTimeFormat;
  }

  /**
   * Init ingestion rule replace valid in field
   * @param {Field} field
   */
  public initIngestionRuleReplaceValid(field: Field): void {
    delete field.isValidReplaceValue;
  }

  /**
   * ingestion rule validation
   * @param {Field} field
   */
  public ingestionRuleValidation(field: Field): void {
    // if empty replace value
    if (StringUtil.isEmpty(field.ingestionRule.value)) {
      field.isValidReplaceValue = true;
      return;
    }
    // 타입으로 검사
    switch (field.logicalType) {
      case LogicalType.BOOLEAN:
        field.isValidReplaceValue = field.ingestionRule.value.toLowerCase() === 'false' || field.ingestionRule.value.toLowerCase() === 'true';
        // validation fail
        if (!field.isValidReplaceValue) {
          field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.boolean');
        }
        break;
      case LogicalType.TEXT:
      case LogicalType.STRING:
      case LogicalType.GEO_POINT:
      case LogicalType.GEO_LINE:
      case LogicalType.GEO_POLYGON:
        field.isValidReplaceValue = true;
        break;
      case LogicalType.TIMESTAMP:
        // if not pass format validation
        if (!field.isValidTimeFormat) {
          field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp.pre.valid');
          field.isValidReplaceValue = false;
          return;
        }
        // params
        const params = {
          format: field.format.type === FieldFormatType.UNIX_TIME ? 'time_unix' : field.format.format,
          samples: [field.ingestionRule.value]
        };
        // if format type is UNIX, add format unit
        if (field.format.type === FieldFormatType.UNIX_TIME) {
          params['unit'] = field.format.unit;
        }
        // check validation
        this._formatValidation(params)
          .then((result: {valid: boolean}) => {
            if (result.valid) {
              field.isValidReplaceValue = true;
            } else {
              field.isValidReplaceValue = false;
              field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
            }
          })
          .catch((error) => {
            field.isValidReplaceValue = false;
            field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
          });
        break;
      case LogicalType.INTEGER:
        field.isValidReplaceValue = (/^[0-9]*$/g).test(field.ingestionRule.value);
        // validation fail
        if (!field.isValidReplaceValue) {
          field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.integer');
        }
        break;
      case LogicalType.DOUBLE:
      case LogicalType.FLOAT:
      case LogicalType.LNT:
      case LogicalType.LNG:
        field.isValidReplaceValue = (/^[0-9]+([.][0-9]+)$/g).test(field.ingestionRule.value);
        // validation fail
        if (!field.isValidReplaceValue) {
          field.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
        }
        break;
      default:
        console.error(this.translateService.instant('msg.common.ui.no.icon.type'), field.logicalType);
        break;
    }
  }

  /**
   * Get selected timezone label
   * @param {FieldFormat} format
   * @return {string}
   */
  public getSelectedTimezoneLabel(format: FieldFormat): string {
    return this._timezoneService.getTimezoneObject(format).label;
  }

  /**
   * Get logical type icon class
   * @param {Field} field
   */
  public getLogicalTypeIconClass(field: Field): string {
    switch (field.logicalType) {
      case LogicalType.TIMESTAMP:
        return 'ddp-icon-type-calen';
      case LogicalType.BOOLEAN:
        return 'ddp-icon-type-tf';
      case LogicalType.STRING:
        return field.derived ? 'ddp-icon-type-expression' : 'ddp-icon-type-ab';
      case LogicalType.INTEGER:
        return 'ddp-icon-type-int';
      case LogicalType.FLOAT:
      case LogicalType.DOUBLE:
        return 'ddp-icon-type-float';
      case LogicalType.LNG:
        return 'ddp-icon-type-longitude';
      case LogicalType.LNT:
        return 'ddp-icon-type-latitude';
      case LogicalType.GEO_POINT:
        return 'ddp-icon-type-point';
      case LogicalType.GEO_LINE:
        return 'ddp-icon-type-line';
      case LogicalType.GEO_POLYGON:
        return 'ddp-icon-type-polygon';
      default:
        return '';
    }
  }

  /**
   * 타입에 대한 기본값 placeholder 표시
   * @param {Field} field
   * @returns {string}
   */
  public getDefaultValue(field: Field): string {
    switch (field.logicalType) {
      case LogicalType.TIMESTAMP:
        return (field.format && field.format.type === FieldFormatType.DATE_TIME) ? this.selectedFieldDataList[0] : this._currentMilliseconds;
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
        console.error(this.translateService.instant('msg.common.ui.no.icon.type'), field.logicalType);
        return '';
    }
  }

  /**
   * Get selected field's logical type label
   * @param {Field} field
   * @returns {string}
   */
  public getSelectedFieldLogicalTypeLabel(field: Field): string {
    // if column is USER_DEFINED
    return (this.isDerivedField(field) && LogicalType.STRING === field.logicalType
      // return USER_DEFINED
      ? this.logicalTypeList[this.logicalTypeList.findIndex(type => LogicalType.USER_DEFINED === type.value)]
      // return type
      : this.logicalTypeList[this.logicalTypeList.findIndex(type => type.value === field.logicalType)]).label;
  }

  /**
   * Set logical type list
   * @param {Field} field
   */
  public setLogicalTypeList(field: Field): void {
    // if field is derived
    if (this.isDerivedField(field)) {
      this.logicalTypeList = this._originLogicalTypeList.filter(type => type.derived);
    } else if (FieldRole.DIMENSION === field.role) { // if selected field is not derived, is DIMENSION role
      this.logicalTypeList = field.type === 'STRING'
        ? this._originLogicalTypeList.filter(type => FieldRole.DIMENSION === type.role && LogicalType.USER_DEFINED !== type.value)
        : this._originLogicalTypeList.filter(type => FieldRole.DIMENSION === type.role && !type.derived);
    } else if (FieldRole.MEASURE === field.role) { // if selected field is not derived, is MEASURE role
      this.logicalTypeList = this._originLogicalTypeList.filter(type => type.role === FieldRole.MEASURE);
    }
  }

  /**
   * Is removed field
   * @param {Field} field
   * @returns {boolean}
   */
  public isRemovedField(field: Field): boolean {
    return field.unloaded;
  }

  /**
   * Is disabled type change
   * @param {Field} field
   * @returns {boolean}
   */
  public isDisabledTypeChangeInField(field: Field): boolean {
    return this.isDerivedField(field) || this.isTimestampField(field);
  }

  /**
   * Is timestamp field
   * @param {Field} field
   * @returns {boolean}
   */
  public isTimestampField(field: Field): boolean {
    return this.selectedTimestampType === 'FIELD' && this.selectedTimestampField === field;
  }

  /**
   * Is derived field
   * @param {Field} field
   * @returns {boolean}
   */
  public isDerivedField(field: Field): boolean {
    return field.derived;
  }

  /**
   * Is GEO type field
   * @param {Field} field
   * @return {boolean}
   */
  public isGeoTypeField(field: Field): boolean {
    return field.logicalType === LogicalType.GEO_POINT || field.logicalType === LogicalType.GEO_LINE || field.logicalType === LogicalType.GEO_POLYGON;
  }

  /**
   * Is GEO format error
   * @param {Field} field
   * @return {boolean}
   */
  public isGeoFormatError(field: Field): boolean {
    return field.format && !field.format.isValidFormat;
  }

  /**
   * Is unix type field
   * @param {Field} field
   * @return {boolean}
   */
  public isUnixTypeField(field: Field): boolean {
    return field.format && field.format.type === FieldFormatType.UNIX_TIME;
  }

  /**
   * Is time type field
   * @param {Field} field
   * @return {boolean}
   */
  public isTimeTypeField(field: Field): boolean {
    return field.format && field.format.type === FieldFormatType.DATE_TIME;
  }

  /**
   * Is enable timezone
   * @param {Field} field
   * @return {boolean}
   */
  public isEnableTimezone(field: Field): boolean {
    return field.logicalType === LogicalType.TIMESTAMP && this.isTimeTypeField(field) && field.isValidTimeFormat && this._timezoneService.isEnableTimezoneInDateFormat(field.format);
  }

  /**
   * Logical type list show flag change event
   */
  public onChangeLogicalTypeListShowFlag(): void {
    // if enable type change
    if (!this.isDisabledTypeChangeInField(this.selectedField)) {
      // change logical type list show / hide flag
      this.logicalTypeListShowFlag = !this.logicalTypeListShowFlag;
    }
  }

  /**
   * Field role type change event
   * @param {Field} field
   * @param type
   */
  public onChangeRoleTypeInField(field: Field, type: any): void {
    // if different role type
    if (field.role !== type.value) {
      // init ingestion rule type and remove error
      this._initIngestionRuleTypeAndRemoveError(field);
      // change role type
      field.role = type.value;
      // set logical type list
      this.setLogicalTypeList(field);
      // field logical type
      const fieldLogicalType: LogicalType = field.logicalType;
      // init field logical type
      field.logicalType = this.logicalTypeList[0].value;
      // if type is MEASURE, logical type is TIMESTAMP
      if (FieldRole.MEASURE === type.value && LogicalType.TIMESTAMP === fieldLogicalType) {
        // changed logical type
        this.changedFieldLogicalType.emit();
      }
    }
  }

  /**
   * Field logical type change event
   * @param {Field} field
   * @param type
   */
  public onChangeLogicalTypeInField(field: Field, type: any): void {
    // if different logical type
    if (field.logicalType !== type.value) {
      // init ingestion rule type and remove error
      this._initIngestionRuleTypeAndRemoveError(field);
      // field logical type
      const fieldLogicalType: LogicalType = field.logicalType;
      // change logical type
      field.logicalType = type.value;
      // if field logical type change to GEO
      if (type.value === LogicalType.GEO_POINT || type.value === LogicalType.GEO_POLYGON || type.value === LogicalType.GEO_LINE) {
        // if not exist format in field
        if (isNullOrUndefined(field.format)) {
          field.format = new FieldFormat();
        }
        // loading show
        this.loadingShow();
        // valid WKT
        this.fieldConfigService.checkEnableGeoTypeAndSetValidationResult(field.format, this.selectedFieldDataList, type.value)
          .then((result) => {
            // loading hide
            this.loadingHide();
          })
          .catch((error) => {
            // loading hide
            this.loadingHide();
          });
      } else if (fieldLogicalType.toString().indexOf('GEO_') !== -1 && type.value.indexOf('GEO_') === -1) { // if field logical type is GEO
        // remove format
        delete field.format;
      }
      // if field logical type is TIMESTAMP
      if (LogicalType.TIMESTAMP === type.value || LogicalType.TIMESTAMP === fieldLogicalType) {
        // changed logical type
        this.changedFieldLogicalType.emit();
        // if changed logical type is TIMESTAMP
        if (LogicalType.TIMESTAMP === type.value) {
          // init format in field
          field.format = new FieldFormat();
          // if not exist field data
          if (this.selectedFieldDataList.length === 0) {
            // set timestamp error
            field.isValidTimeFormat = false;
            // set time format valid message
            field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
          } else { // if exist field data
            // set default time format in field
            this._formatValidation({samples: this.selectedFieldDataList.slice(0, 20)})
              .then((result: {pattern: string}) => {
                // if exist pattern
                if (result.pattern) {
                  // set time format in field
                  field.format.format = result.pattern;
                  // set time format valid message
                  field.isValidTimeFormat = true;
                  // if enable timezone, set browser timezone at field
                  if (this._timezoneService.isEnableTimezoneInDateFormat(field.format)) {
                    !field.format.timeZone && (field.format.timeZone = this._timezoneService.getBrowserTimezone().momentName);
                    field.format.locale = this._timezoneService.browserLocale;
                  } else { // if not enable timezone
                    field.format.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
                  }
                }
              })
              .catch((error) => {
                // set default time format in field
                field.format.format = 'yyyy-MM-dd';
              });
          }
        }
      }
      // close logical type list
      this.logicalTypeListShowFlag = false;
    }
  }

  /**
   * Field GEO coordinate change event
   * @param {Field} field
   * @param {string} coordinate
   */
  public onChangeGeoCoordinateInField(field: Field, coordinate: string): void {
    field.format.originalSrsName = coordinate;
  }

  /**
   * Timestamp guide icon hover event
   * @param {string} type
   */
  public onHoverTimestampGuideIcon(type: string): void {
    if (type === 'time') {
      $('.ddp-wrap-hover-info').on('mouseover mouseout', function (e) {
        if (e.type === 'mouseover') {
          const $infoLeft = $(this).offset().left;
          const $infoTop = $(this).offset().top;
          $(this).find('.ddp-box-layout4.ddp-box-time').css({
            position: 'fixed',
            left: $infoLeft + 30,
            top: $infoTop - 90
          });
          $(this).find('.ddp-box-layout4').show();

        } else {
          $(this).find('.ddp-box-layout4').hide();
        }
      });
    } else {
      $('.ddp-wrap-hover-info').on('mouseover mouseout', function (e) {
        if (e.type === 'mouseover') {
          const $infoLeft = $(this).offset().left;
          const $infoTop = $(this).offset().top;
          $(this).find('.ddp-box-layout4').css({
            position: 'fixed',
            left: $infoLeft - 30,
            top: $infoTop + 19
          });
          $(this).find('.ddp-box-layout4').show();

        } else {
          $(this).find('.ddp-box-layout4').hide();
        }
      });
    }
  }

  /**
   * Unix code in field enable chagne event
   * @param {Field} field
   */
  public onChangeEnableUnixCodeInField(field: Field): void {
    // init replace valid
    this.initIngestionRuleReplaceValid(field);
    // if format type is DATE_TIME
    if (field.format.type === FieldFormatType.DATE_TIME) {
      field.format.type = FieldFormatType.UNIX_TIME;
      // set time format valid TRUE
      field.isValidTimeFormat = true;
    } else if (field.format.type === FieldFormatType.UNIX_TIME) { // if format type is UNIX_TIME
      field.format.type = FieldFormatType.DATE_TIME;
      // init time format valid
      this.initTimeFormatValid(field);
    }
  }

  /**
   * Field Format unit change event
   * @param {Field} field
   * @param unit
   */
  public onChangeFormatUnitInField(field: Field, unit: any): void {
    if (unit.value !== field.format.unit) {
      // change unit
      field.format.unit = unit.value;
      // change time placeholder
      this._currentMilliseconds = unit.value === FieldFormatUnit.MILLISECOND ? moment().valueOf() : Math.floor(moment().valueOf()/1000);
      // init replace valid
      this.initIngestionRuleReplaceValid(field);
    }
  }

  /**
   * Ingestion rule type in field change event
   * @param {Field} field
   * @param {IngestionRuleType} type
   */
  public onChangeIngestionTypeInField(field: Field, type: IngestionRuleType): void {
    // if different ingestion rule type
    if (field.ingestionRule.type !== type) {
      // set ingestion rule type
      field.ingestionRule.type = type;
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
   * Change timezone selectbox show flag
   * @param {MouseEvent} event
   */
  public onChangeTimezoneSelectBoxShowFlag(event: MouseEvent): void {
    if ($(event.target).hasClass('ddp-type-selectbox ddp-type-search-select') || $(event.target).hasClass('ddp-txt-selectbox')) {
      this.isShowTimezoneList = !this.isShowTimezoneList
    }
  }

  /**
   * Time format validation click event
   * @param {Field} field
   */
  public onClickTimeFormatValidation(field: Field): void {
    // if not exist field data list
    if (this.selectedFieldDataList.length === 0) {
      // set time format valid FALSE
      field.isValidTimeFormat = false;
      // set time format valid message
      field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
      return;
    }
    // if not exist format
    if (StringUtil.isEmpty(field.format.format)) {
      // set time format valid FALSE
      field.isValidTimeFormat = false;
      // set time format valid message
      field.timeFormatValidMessage = this.translateService.instant('msg.common.ui.required');
      return;
    }
    // validation
    this._formatValidation({format: field.format.format, samples: this.selectedFieldDataList.slice(0, 20)})
      .then((result: {valid: boolean}) => {
        // if valid is TRUE
        if (result.valid) {
          // set time format valid TRUE
          field.isValidTimeFormat = true;
          // if enable timezone, set browser timezone at field
          if (this._timezoneService.isEnableTimezoneInDateFormat(field.format)) {
            !field.format.timeZone && (field.format.timeZone = this._timezoneService.getBrowserTimezone().momentName);
            field.format.locale = this._timezoneService.browserLocale;
          } else { // if not enable timezone
            field.format.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
          }
        } else {
          // set time format valid FALSE
          field.isValidTimeFormat = false;
          // set time format valid message
          field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.match.data');
        }})
      .catch((error) => {
        // set time format valid FALSE
        field.isValidTimeFormat = false;
        // set time format valid message
        field.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.required.match.data');
      });
  }

  /**
   * Format validation
   * @param param
   * @returns {Promise<any>}
   * @private
   */
  private _formatValidation(param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadingShow();
      this._datasourceService.checkValidationDateTime(param)
        .then((result) => {
          // 로딩 hide
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          // 로딩 hide
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * Set searched timezone list
   * @param {string} searchKeyword
   * @private
   */
  private _setSearchedTimezoneList(searchKeyword: string): void {
    this.filteredTimezoneList = this._timezoneService.getSearchedTimezoneList(searchKeyword);
  }

  /**
   * Init ingestion rule type and remove error
   * @param {Field} field
   * @private
   */
  private _initIngestionRuleTypeAndRemoveError(field: Field): void {
    // init ingestion rule type
    field.ingestionRule.type = IngestionRuleType.DEFAULT;
    // init time format valid
    this.initTimeFormatValid(field);
    // init replace valid
    this.initIngestionRuleReplaceValid(field);
  }
}
