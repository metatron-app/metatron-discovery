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

import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { isUndefined } from 'util';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import {
  Field, FieldFormat, FieldFormatType, FieldFormatUnit, FieldRole, IngestionRuleType,
  LogicalType
} from '../../../domain/datasource/datasource';
import { StringUtil } from '../../../common/util/string.util';

declare let moment: any;

@Component({
  selector: 'app-schema-detail',
  templateUrl: './schema-detail.component.html'
})
export class SchemaDetailComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 선택된 타임스탬프 타입
  private timestampType: string;

  private currentMilliseconds: number = moment().valueOf();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼이 가지고 있는 data
   */
  @Input('columnData')
  public columnData: any;

  /**
   * 컬럼의 field
   * @param column
   */
  @Input('column')
  public set setColumn(column: any) {
    // 컬럼정보
    this.column = column;

    // ui init
    this.initView();
  }

  /**
   * 현재 설정된 Time stamp
   * @param column
   */
  @Input('selectedTime')
  public set setTimestamp(column: any) {
    this.selectedTimestamp = column;
  }

  /**
   * 현재 설정된 Time stamp 타입
   * @param {string} type
   */
  @Input('selectedTimestampType')
  public set setTimestampType(type: string) {
    this.timestampType = type;
  }

  // 데이터소스 타입
  @Input('connType')
  public connType: string;

  // 타입 변경 이벤트 시 호출
  @Output('changeEvent')
  public changeEvent = new EventEmitter();

  // 현재 타임스탬프로 지정된 컬럼
  public selectedTimestamp: any;

  // column data
  public column: Field;

  // role Type
  public roleType: any[];

  // type
  public type: any[];
  public dimensionType: any[];
  public measureType: any[];

  // select flag
  public selectFl: boolean = false;

  // replace flag
  public replaceFl: boolean = true;

  // unit list
  public formatUnitList = [
    {label: this.translateService.instant('msg.storage.ui.format.unit.milli-second'), value: FieldFormatUnit.MILLISECOND},
    {label: this.translateService.instant('msg.storage.ui.format.unit.second'), value: FieldFormatUnit.SECOND},
  ];

  // 좌표계 목록
  public geoCoordinateList = [
    'EPSG:4326', 'EPSG:4301'
  ];
  // 좌표계 목록 show flag
  public isGeoCoordinateListShow: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {

    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {

    // Init
    super.ngOnInit();

    this.initView();
  }

  // Destory
  ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * get column data list
   * @returns {any}
   */
  public getColumnDataList(): any {
    return this.columnData.slice(0,50);
  }

  /**
   * 해당 컬럼의 role에 따라 보여줄 type 필터링
   * @returns {any[]}
   */
  public getRoleFilter() {
    const types = this.getType().filter((item) => {
      if (item.role === this.column.role) {
        return item;
      }
    });
    return types;
  }

  /**
   * 타입에 대한 기본값 placeholder 표시
   * @param {string} itemType
   * @returns {any}
   */
  public getDefaultValue(itemType: string) {
    let result;
    if (isUndefined(itemType)) {
      result = '';
    } else {
      switch (itemType.toUpperCase()) {
        case 'TIMESTAMP':
          result = (this.column.format && this.column.format.type === FieldFormatType.DATE_TIME) ? this.columnData[0] : this.currentMilliseconds;
          break;
        case 'BOOLEAN':
          result = 'false';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
        case 'GEO_POINT':
        case 'GEO_LINE':
        case 'GEO_POLYGON':
          result = '';
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          result = '0';
          break;
        case 'DOUBLE':
        case 'FLOAT':
          result = '0.0';
          break;
        case 'LNT':
        case 'LATITUDE':
        case 'LNG':
        case 'LONGITUDE':
          result = '0.0';
          break;
        default:
          console.error(this.translateService.instant('msg.common.ui.no.icon.type'), itemType);
          break;
      }
    }

    return result;
  }

  /**
   * logical type 객체
   * @param {string} logicalType
   * @returns {any}
   */
  public getLogicalType(logicalType: string) {
    if (isUndefined(logicalType)) {
      return this.getType()[0];
    }
    return this.getType()[this.getType().findIndex((item) => {
      return item.value === logicalType.toUpperCase();
    })];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Time Format value change event
   * @param {Field} column
   */
  public initTimeFormatValid(column: Field): void {
    delete column.isValidReplaceValue;
    delete column.isValidTimeFormat;
  }

  /**
   * Replace value change event
   * @param {Field} column
   */
  public initReplaceValid(column: Field): void {
    delete column.isValidReplaceValue;
  }

  /**
   * Click unix time checkbox
   * @param {MouseEvent} event
   */
  public onClickUnixCode(event: MouseEvent): void {
    // stop double event
    event.preventDefault();
    delete this.column.isValidReplaceValue;
    if (this.column.format.type === FieldFormatType.DATE_TIME) {
      this.column.format.type = FieldFormatType.UNIX_TIME;
      this.column.isValidTimeFormat = true;
    } else if (this.column.format.type === FieldFormatType.UNIX_TIME) {
      this.column.format.type = FieldFormatType.DATE_TIME;
      delete this.column.isValidTimeFormat;
    }
  }

  /**
   * column data type 변경 이벤트
   * @param type
   */
  public onChangeType(type) {
    // 타입이 다를때만 작동
    if (this.column.logicalType !== type.value) {
      // null 타입 변경
      this.column.ingestionRule.type = IngestionRuleType.DEFAULT;
      // 플래그 제거
      delete this.column.isValidReplaceValue;
      delete this.column.isValidTimeFormat;
      // timestamp 인 경우
      if (type.value === LogicalType.TIMESTAMP) {
        // format 지정
        this.checkTimeFormat(this.columnData);
      }
      // 타입 변경
      this.column.logicalType = type.value;
      // time stamp flag
      this.changeEvent.emit();
    }

  }

  /**
   * Role 타입 변경 이벤트
   * @param type
   */
  public onChangeRole(type) {
    // 이미 같은 타입이라면
    if (this.column.role === type.value) {
      return;
    }

    // role 타입 변경
    this.column.role = type.value;

    // 타입변경
    const types = this.getRoleFilter();
    this.column.logicalType = types[0].value;
    // null 타입 변경
    this.column.ingestionRule.type = IngestionRuleType.DEFAULT;
    // 플래그 제거
    delete this.column.isValidReplaceValue;
    delete this.column.isValidTimeFormat;

    this.changeEvent.emit();
  }

  /**
   * Null 값에 대한 처리 변경
   * @param {IngestionRuleType} type
   */
  public onChangeNullType(type: IngestionRuleType) {
    // 이미 선택되어 있는 타입과 다르다면
    if (this.column.ingestionRule.type !== type) {
      // ingestion type 변경
      this.column['ingestionRule'].type = type;
    }
  }

  /**
   * 마우스 hover event
   * @param {string} type
   */
  public hoverEvent(type: string) {

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
   * format unit change event
   * @param unit
   */
  public onChangeFormatUnit(unit: any): void {
    if (unit.value !== this.column.format.unit) {
      // change unit
      this.column.format.unit = unit.value;
      // change time placeholder
      this.currentMilliseconds = unit.value === FieldFormatUnit.MILLISECOND ? moment().valueOf() : Math.floor(moment().valueOf()/1000);
      // init replace value
      delete this.column.isValidReplaceValue;
    }
  }

  /**
   * Time format validation click event
   * @param {Field} column
   */
  public onClickTimeFormatValidation(column: Field): void {
    // 컬럼의 데이터가 0이라면
    if (this.columnData.length === 0) {
      column.isValidTimeFormat = false;
      column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
      return;
    }
    // format이 빈값이라면
    if (StringUtil.isEmpty(column.format.format)) {
      column.isValidTimeFormat = false;
      column.timeFormatValidMessage = this.translateService.instant('msg.common.ui.required');
      return;
    }
    // validation
    this._formatValidation({
      format: column.format.format,
      samples: this.columnData.slice(0, 19)
    }).then((result) => {
      if (result.valid) {
        column.isValidTimeFormat = true;
      } else {
        column.isValidTimeFormat = false;
        column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.null');
      }
    }).catch((error) => {
      column.isValidTimeFormat = false;
      column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.null');
    });
  }

  /**
   * Geo coordinates name change event
   * @param {string} name
   */
  public onChangeGeoCoordinates(name: string): void {
    this.column.format.originalSrsName = name;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 컬럼이 타임스탬프 컬럼인가
   * @returns {boolean}
   */
  public isTimestampColumn(): boolean {
    return (this.timestampType === 'COLUMN' && this.selectedTimestamp && this.selectedTimestamp.name === this.column.name);
  }

  /**
   * ingestion rule validation
   * @param {string} itemType
   */
  public ingestionRuleValidation(column: Field) {
    // 입력된 텍스트
    const text = column.ingestionRule.value;
    // if empty replace value
    if (StringUtil.isEmpty(text)) {
      column.isValidReplaceValue = true;
      return;
    }
    // regex
    let reg;
    if (isUndefined(column.logicalType)) {
      // result = '';
    } else {
      // 타입으로 검사
      switch (column.logicalType.toString().toUpperCase()) {
        case 'BOOLEAN':
          column.isValidReplaceValue = text.toLowerCase() === 'false' || text.toLowerCase() === 'true';
          // validation fail
          if (!column.isValidReplaceValue) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.boolean');
          }
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
        case 'GEO_POINT':
        case 'GEO_LINE':
        case 'GEO_POLYGON':
          this.column.isValidReplaceValue = true;
          break;
        case 'TIMESTAMP':
          // if not pass format validation
          if (!column.isValidTimeFormat) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp.pre.valid');
            column.isValidReplaceValue = false;
            return;
          }
          // params
          const params = {
            format: column.format.type === FieldFormatType.UNIX_TIME ? 'time_unix' : column.format.format,
            samples: column.ingestionRule.value
          };
          // if format type is UNIX, add format unit
          if (column.format.type === FieldFormatType.UNIX_TIME) {
            params['unit'] = column.format.unit;
          }
          // check validation
          this._formatValidation(params)
            .then((result) => {
              if (result.valid) {
                column.isValidReplaceValue = true;
              } else {
                column.isValidReplaceValue = false;
                column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
              }
            })
            .catch((error) => {
              column.isValidReplaceValue = false;
              column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
          });
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          reg = /^[0-9]*$/g;
          this.column.isValidReplaceValue = reg.test(text);
          // validation fail
          if (!column.isValidReplaceValue) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.integer');
          }
          break;
        case 'DOUBLE':
        case 'FLOAT':
          reg = /^[0-9]+([.][0-9]+)?$/g;
          this.column.isValidReplaceValue = reg.test(text);
          // validation fail
          if (!column.isValidReplaceValue) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          }
          break;
        case 'LNT':
        case 'LATITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.isValidReplaceValue = reg.test(text);
          // validation fail
          if (!column.isValidReplaceValue) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          }
          break;
        case 'LNG':
        case 'LONGITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.isValidReplaceValue = reg.test(text);
          // validation fail
          if (!column.isValidReplaceValue) {
            column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          }
          break;
        default:
          console.error(this.translateService.instant('msg.common.ui.no.icon.type'), column.logicalType.toString());
          break;
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // init view
  private initView() {

    this.roleType = [
      { label: this.translateService.instant('msg.storage.ui.list.dimension'), value: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.measure'), value: 'MEASURE' }
    ];

    // dimension types
    this.dimensionType = this.column.derived ? [
        { label: this.translateService.instant('msg.storage.ui.list.string'), icon: 'ddp-icon-type-ab', value: 'STRING', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.boolean'), icon: 'ddp-icon-type-tf', value: 'BOOLEAN', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.integer'), icon: 'ddp-icon-type-int', value: 'INTEGER', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.double'), icon: 'ddp-icon-type-float', value: 'DOUBLE', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.date'), icon: 'ddp-icon-type-calen', value: 'TIMESTAMP', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.lnt'), icon: 'ddp-icon-type-latitude', value: 'LNT', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.lng'), icon: 'ddp-icon-type-longitude', value: 'LNG', role: 'DIMENSION' },
        { label: this.translateService.instant('msg.storage.ui.list.geo.point'), icon: 'ddp-icon-type-point', value: LogicalType.GEO_POINT},
        // {label: this.translateService.instant('msg.storage.ui.list.geo.line'), icon: 'ddp-icon-type-line', value: LogicalType.GEO_LINE},
        // {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), icon: 'ddp-icon-type-polygon', value: LogicalType.GEO_POLYGON},
        { label: this.translateService.instant('msg.storage.ui.list.expression'), icon: null, disableIcon: true, value: LogicalType.USER_DEFINED}
      ]
      :  [
      { label: this.translateService.instant('msg.storage.ui.list.string'), icon: 'ddp-icon-type-ab', value: 'STRING', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), icon: 'ddp-icon-type-tf', value: 'BOOLEAN', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), icon: 'ddp-icon-type-int', value: 'INTEGER', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), icon: 'ddp-icon-type-float', value: 'DOUBLE', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.date'), icon: 'ddp-icon-type-calen', value: 'TIMESTAMP', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), icon: 'ddp-icon-type-latitude', value: 'LNT', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), icon: 'ddp-icon-type-longitude', value: 'LNG', role: 'DIMENSION' }
    ];
    // measure types
    this.measureType = [
      { label: this.translateService.instant('msg.storage.ui.list.integer'), icon: 'ddp-icon-type-int', value: 'INTEGER', role: 'MEASURE' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), icon: 'ddp-icon-type-float', value: 'DOUBLE', role: 'MEASURE' }
    ];
    // types
    this.type = this.getType();

    // ingestionRule
    if (!this.column['ingestionRule']) {
      this.column['ingestionRule'] = {
        type: IngestionRuleType.DEFAULT,
        value: ''
      };
    }
  }

  /**
   * 해당 컮럼의 데이터가 어떤 타임포맷인지 확인
   * @param data
   * @param {string} format
   */
  private checkTimeFormat(data: any, format?: string) {
    // init field format
    this.column.format = new FieldFormat();
    // column data
    let columnData = data;
    // data 가 없다면 타임스탬프를 지정할수 없다.
    if (data.length === 0) {
      this.column.isValidTimeFormat = false;
      this.column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
      return;
    } else if (data.length > 20) {
      columnData = columnData.slice(0, 19);
    }

    const param = {
      samples: columnData
    };

    // 포맷이 있다면
    if (format) {
      param['format'] = format;
    }

    // 로딩 show
    this.loadingShow();

    this.datasourceService.checkValidationDateTime(param)
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // pattern 이 있을경우
        if (result.hasOwnProperty('pattern')) {
          // set format
          this.column.format.format = result.pattern;
          this.column.isValidTimeFormat = true;
        }
      })
      .catch((error) => {
        this.column.format.format = 'yyyy-MM-dd';
        this.column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.format.null');
        // 로딩 hide
        this.loadingHide();
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * logical type 목록
   * @returns {any[]}
   */
  private getType(): any[] {
    if (this.column.hasOwnProperty('role')) {
      return this.column.role === FieldRole.MEASURE ? this.measureType : this.dimensionType;
    }
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
      this.datasourceService.checkValidationDateTime(param)
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
}
