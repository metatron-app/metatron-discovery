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
import { Field, FieldFormat, FieldFormatType, FieldRole, LogicalType } from '../../../domain/datasource/datasource';

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

  private currentMilliseconds: number = moment().valueOf() / 1000;

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
   * column의 데이터 수
   * @returns {number}
   */
  public getColumnDataLength(): number {
    return this.columnData ? this.columnData.length : 0;
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
          result = this.currentMilliseconds;
          break;
        case 'BOOLEAN':
          result = 'false';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
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
          result = '0.0';
          break;
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


  /**
   * icon get
   * @param {string} itemType
   * @returns {string}
   */
  public getIconClass(itemType: string): string {
    let result = '';
    if (isUndefined(itemType)) {
      result = 'ddp-icon-type-ab';
    } else {
      switch (itemType.toUpperCase()) {
        case 'TIMESTAMP':
          result = 'ddp-icon-type-calen';
          break;
        case 'BOOLEAN':
          result = 'ddp-icon-type-tf';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
          result = 'ddp-icon-type-ab';
          break;
        case 'USER_DEFINED':
          result = 'ddp-icon-type-ab';
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          result = 'ddp-icon-type-int';
          break;
        case 'DOUBLE':
          result = 'ddp-icon-type-int';
          result = 'ddp-icon-type-float';
          break;
        case 'LNT':
        case 'LATITUDE':
          result = 'ddp-icon-type-latitude';
          break;
        case 'LNG':
        case 'LONGITUDE':
          result = 'ddp-icon-type-longitude';
          break;
        default:
          console.error(this.translateService.instant('msg.common.ui.no.icon.type'), itemType);
          break;
      }
    }
    return result;
  }

  /**
   * 타입별 validation 메세지
   * @param {string} itemType
   * @returns {string}
   */
  public getValidationMsg(itemType: string) {
    let result = '';
    if (isUndefined(itemType)) {
      result = this.translateService.instant('msg.storage.ui.schema.valid.string');
    } else {
      switch (itemType.toUpperCase()) {
        case 'BOOLEAN':
          result = this.translateService.instant('msg.storage.ui.schema.valid.boolean');
          break;
        case 'STRING':
          result = this.translateService.instant('msg.storage.ui.schema.valid.string');
          break;
        case 'INTEGER':
          result = this.translateService.instant('msg.storage.ui.schema.valid.integer');
          break;
        case 'DOUBLE':
        case 'TIMESTAMP':
        case 'LNG':
        case 'LNT':
          result = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          break;
      }
    }
    return result;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Time Format keyup 이벤트
   */
  public initTimeFormatValid(): void {
    delete this.column.isTimeError;
  }

  public onClickUnixCode(): void {
    if (!this.column.isDefaultFormat) {
      delete this.column.isTimeError;
      if (this.column.format.type === FieldFormatType.DATE_TIME) {
        this.column.format.type = FieldFormatType.UNIX_TIME;
        // UNIX인경우 기존 format 제거
        delete this.column.format.format;
      } else if (this.column.format.type === FieldFormatType.UNIX_TIME) {
        this.column.format.type = FieldFormatType.DATE_TIME;
      }
    }
  }

  /**
   * column data type 변경 이벤트
   * @param type
   */
  public onChangeType(type) {

    // 타입이 같다면 return
    if (this.column.logicalType === type.value) {
      return;
    }

    // 타입 변경
    this.column.logicalType = type.value;

    // null 타입 변경
    this.column.ingestionRule.type = 'default';
    // 플래그 제거
    delete this.column.isReplaceError;

    // timestamp 인 경우
    if (this.column.logicalType === LogicalType.TIMESTAMP) {
      // format 지정
      this.checkTimeFormat(this.columnData);
    } else {
      // timestamp 가 아닌 경우 format 삭제
      delete this.column.isTimeError;
      delete this.column.isDefaultFormat;
    }

    // time stamp flag
    this.changeEvent.emit();
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
    this.column.ingestionRule.type = 'default';
    // time stamp flag
    delete this.column.isTimeError;
    delete this.column.isReplaceError;

    this.changeEvent.emit();
  }

  /**
   * Null 값에 대한 처리 변경
   * @param type
   */
  public onChangeNullType(type) {
    // 이미 선택되어 있는 타입과 같다면
    if (this.column.ingestionRule.type === type) {
      return;
    }

    // ingestion type 변경
    this.column['ingestionRule'].type = type;

    // 변경된 처리가 replace인 경우 check
    if (type === 'replace') {
      this.ingestionRuleValidation(this.column.logicalType.toString());
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
  public ingestionRuleValidation(itemType: string) {
    // 입력된 텍스트
    const text = this.column.ingestionRule.value;

    // regex
    let reg;
    if (isUndefined(itemType)) {
      // result = '';
    } else {
      // 타입으로 검사
      switch (itemType.toUpperCase()) {
        case 'BOOLEAN':
          this.column.isReplaceError = !(text.toLowerCase() === 'false' || text.toLowerCase() === 'true' || text.trim() === '');
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
          this.column.isReplaceError = false;
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
        case 'TIMESTAMP':
          reg = /^[0-9]*$/g;
          this.column.isReplaceError = !(reg.test(text) || text.trim() === '');
          break;
        case 'DOUBLE':
        case 'FLOAT':
          reg = /^[0-9]+([.][0-9]+)?$/g;
          this.column.isReplaceError = !(reg.test(text) || text.trim() === '');
          break;
        case 'LNT':
        case 'LATITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.isReplaceError = !(reg.test(text) || text.trim() === '');
          break;
        case 'LNG':
        case 'LONGITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.isReplaceError = !(reg.test(text) || text.trim() === '');
          break;
        default:
          console.error(this.translateService.instant('msg.common.ui.no.icon.type'), itemType);
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
    this.dimensionType = [
      { label: this.translateService.instant('msg.storage.ui.list.string'), icon: 'ddp-icon-type-ab', value: 'STRING', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), icon: 'ddp-icon-type-tf', value: 'BOOLEAN', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), icon: 'ddp-icon-type-int', value: 'INTEGER', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), icon: 'ddp-icon-type-float', value: 'DOUBLE', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.timestamp'), icon: 'ddp-icon-type-calen', value: 'TIMESTAMP', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), icon: 'ddp-icon-type-latitude', value: 'LNG', role: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), icon: 'ddp-icon-type-longitude', value: 'LNT', role: 'DIMENSION' }
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
      const ingestionRule = {
        type: 'default',
        value: ''
      };

      this.column['ingestionRule'] = ingestionRule;
    }
  }

  /**
   * 해당 컮럼의 데이터가 어떤 타임포맷인지 확인
   * @param data
   * @param {string} format
   */
  private checkTimeFormat(data: any, format?: string) {

    // column data
    let columnData = data;

    // data 가 없다면 타임스탬프를 지정할수 없다.
    if (data.length === 0) {
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
    // init field format
    this.column.format = new FieldFormat();
    this.column.format.type = FieldFormatType.DATE_TIME;
    this.datasourceService.checkValidationDateTime(param)
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // pattern 이 있을경우
        if (result.hasOwnProperty('pattern')) {
          // set format
          this.column.format.format = result.pattern;
          // set default
          this.column.isDefaultFormat = true;
        }
      })
      .catch((error) => {
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
}
