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
import { Alert } from '../../../common/util/alert.util';

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

  // 현재 설정되어 있는 추천필터 갯수
  @Input('recommendation')
  public recommendationLength: number;

  // 데이터소스 타입
  @Input('connType')
  public connType: string;

  // 타입 변경 이벤트 시 호출
  @Output('changeEvent')
  public changeEvent = new EventEmitter();

  // 추천 필터 설정 및 해제시 호출
  @Output('filtering')
  public changeFiltering = new EventEmitter();

  // 추천 필터 순서 변경모달 오픈 호출
  @Output('editOrder')
  public editOrder = new EventEmitter();

  // 현재 타임스탬프로 지정된 컬럼
  public selectedTimestamp: any;

  // column data
  public column: any;

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

  /**
   * 추천 필터 설정
   * @param {string} type
   */
  public setRecommendFilter(type: string) {
    // 이벤트 중복 제거
    event.preventDefault();

    switch (type) {
      // 최근 기간만 허용
      case 'timestamp':
        // option 이 있을때
        if (this.column.hasOwnProperty('filteringOptions')) {
          delete this.column.filteringOptions;
        } else {
          this.column.filteringOptions = {
            type: 'INTERVAL',
            defaultSelector: 'RELATIVE',
            allowSelectors: ['RELATIVE']
          };
        }
        break;
      // 추천 필터 설정 flag
      case 'filterFl':
        // filtering flag
        this.column.filtering = !this.column.filtering;
        // 추천 필터 해제 상태라면
        // 선택 해제시 다음 차순이였던 필터 순서 앞당기기 emit
        if (!this.column.filtering) {
          const seqNumber = this.column.filteringSeq;
          delete this.column.filtering;
          delete this.column.filteringSeq;
          delete this.column.filteringOptions;
          this.changeFiltering.emit({ column: this.column, seq: seqNumber });
        } else {
          this.changeFiltering.emit({ column: this.column });
        }
        break;
      // 단일 선택값만 허용
      case 'single':
        // option 이 있을때
        if (this.column.hasOwnProperty('filteringOptions')) {
          delete this.column.filteringOptions;
        } else {
          this.column.filteringOptions = {
            type: 'INCLUSION',
            defaultSelector: 'SINGLE_LIST',
            allowSelectors: ['SINGLE_LIST']
          };
        }
        break;
    }
  }

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
   * Time Format 에러 메세지
   * @returns {string}
   */
  public getTimeFormatErrorMsg(): string {
    // 컬럼에 데이터가 없다면
    if (this.columnData.length === 0) {
      return this.translateService.instant('msg.storage.ui.schema.column.no.data');
    }

    // 타임포맷이 필요한 경우
    if (!this.column.format || this.column.format.trim() === '') {
      return this.translateService.instant('msg.storage.ui.schema.column.format.required');
    }

    return this.translateService.instant('msg.storage.ui.schema.column.format.null');
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
          result = this.columnData ? this.columnData[0] : '';
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
        case 'TIMESTAMP':
          result = this.isUndefinedColumnFormat()
            ? this.translateService.instant('msg.storage.ui.schema.valid.timestamp.null')
            : this.translateService.instant('msg.storage.ui.schema.valid.timestamp');
          break;
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
          result = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          break;
        case 'LNG':
          result = this.translateService.instant('msg.storage.ui.schema.valid.decimal');
          break;
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
  public timeFormatKeyup() {
    this.column.errorFl = true;
    this.column.replaceFl = true;
  }

  /**
   * Time Format 체크버튼 클릭
   */
  public timeFormatClick() {
    // check Time Format
    this.checkTimeFormat(this.columnData, this.column.format);
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

    // timestamp 타입에서 일반 타입으로 변경
    if (this.column.logicalType === 'TIMESTAMP' || type === 'TIMESTAMP') {
      delete this.column.filteringOptions;
    }

    // 타입 변경
    this.column.logicalType = type.value;

    // null 타입 변경
    this.column.ingestionRule.type = 'default';
    // 플래그 제거
    delete this.column.replaceFl;

    // timestamp 인 경우
    if (this.column.logicalType === 'TIMESTAMP') {
      // format 지정
      this.checkTimeFormat(this.columnData);
    } else {
      // timestamp 가 아닌 경우 format 삭제
      delete this.column.format;
      delete this.column.errorFl;
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
    delete this.column.format;
    delete this.column.errorFl;
    delete this.column.replaceFl;

    // 변경된 role이 measure 인경우 추천필터 삭제
    if (this.column.role === 'MEASURE' && this.column.filtering) {
      const seqNumber = this.column.filteringSeq;
      delete this.column.filtering;
      delete this.column.filteringSeq;
      delete this.column.filteringOptions;
      this.changeFiltering.emit({ column: this.column, seq: seqNumber });
    }

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
      this.ingestionRuleValidation(this.column.logicalType);
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
   * 추천필터가 있는지 여부
   * @returns {boolean}
   */
  public isFirstRecommendation(): boolean {
    return (this.recommendationLength === 0 || this.column.hasOwnProperty('filteringSeq') && this.column.filteringSeq === 0);
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
        case 'TIMESTAMP':
          // time stamp 검사
          this.replaceTimeValidation();
          break;
        case 'BOOLEAN':
          this.column.replaceFl = text.toLowerCase() === 'false' || text.toLowerCase() === 'true' || text.trim() === '';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
          this.column.replaceFl = true;
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          reg = /^[0-9]*$/g;
          this.column.replaceFl = reg.test(text) || text.trim() === '';
          break;
        case 'DOUBLE':
        case 'FLOAT':
          reg = /^[0-9]+([.][0-9]+)?$/g;
          this.column.replaceFl = reg.test(text) || text.trim() === '';
          break;
        case 'LNT':
        case 'LATITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.replaceFl = reg.test(text) || text.trim() === '';
          break;
        case 'LNG':
        case 'LONGITUDE':
          reg = /^[0-9]+([.][0-9]+)$/g;
          this.column.replaceFl = reg.test(text) || text.trim() === '';
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

      this.column.errorFl = true;
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

    this.timeValidation(param)
      .then((result) => {
        // pattern 이 있을경우
        if (result.hasOwnProperty('pattern')) {
          this.column.format = result.pattern;
        }

        // valid가 있는경우
        if (result.hasOwnProperty('valid')) {
          // valid fail
          if (!result.valid) {
            this.column.errorFl = true;
          } else {
            // valid success
            delete this.column.errorFl;
            // replace 로 선택된 경우
            if (this.column.ingestionRule.type === 'replace' && data.length === 0) {
              delete this.column.replaceFl;
            }
          }
        }
      })
      .catch((error) => {
        this.column.errorFl = true;
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
      return this.column.role === 'MEASURE' ? this.measureType : this.dimensionType;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * column의 timeformat이 없는경우
   * @returns {boolean}
   */
  private isUndefinedColumnFormat(): boolean {
    if (this.column.hasOwnProperty('format') && this.column.format.trim() !== '') {
      return false;
    }
    return true;
  }

  /**
   * replace값이 timeformat에 적합한지 확인
   */
  private replaceTimeValidation() {

    // format이 비어있을경우
    if (!this.column.hasOwnProperty('format') || this.column.format.trim() === '') {
      this.column.replaceFl =  false;
      return;
    }

    // value가 비었을경우
    if (!this.column.ingestionRule.hasOwnProperty('value') || this.column.ingestionRule.value.trim() === '') {
      this.column.replaceFl =  true;
      return;
    }

    const param = {
      samples: [this.column.ingestionRule.value],
      format: this.column.format
    };

    this.timeValidation(param)
      .then((result) => {
        this.column.replaceFl =  result.valid;
      })
      .catch((error) => {
        this.column.replaceFl =  false;
      });
  }

  /**
   * time validation
   * @param param
   * @returns {Promise<any>}
   */
  private timeValidation(param): Promise<any> {
    return new Promise((resolve, reject) => {
      // 로딩 show
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
